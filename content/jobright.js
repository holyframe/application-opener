// Runs in the Jobright page's own realm at document_start so it can observe the
// app's API traffic before the recommendation list loads, and so the side panel
// can drive the list through one stable interface instead of injecting DOM logic
// on every step.
(() => {
  const STORE_KEY = "__applicationHelperJobright";
  if (window[STORE_KEY]) {
    return;
  }

  const JOB_ID_PATTERN = /^[0-9a-f]{24}$/i;
  const APPLY_LABELS = new Set(["apply with autofill", "apply now"]);
  const IGNORED_URL_HOSTS =
    /(^|\.)(jobright\.ai|licdn\.com|google-analytics\.com|googletagmanager\.com|tiktok\.com|bing\.com|doubleclick\.net)$/i;
  const IMAGE_URL_PATTERN = /\.(?:png|jpe?g|gif|svg|webp|ico)(?:\?|#|$)/i;
  const CARD_SELECTOR = "div.job-card-flag-classname[id]";

  const store = {
    jobs: Object.create(null),
    endpoints: [],
    sampleJobKeys: [],
    capturedOpenUrls: [],
    openArmedUntil: 0
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalizeText = (value) =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim();

  const isVisible = (element) => {
    if (!(element instanceof Element) || element.getClientRects().length === 0) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  };

  // The apply button carries no href, so the destination has to come from the
  // data Jobright itself loads. Rank the URL-bearing fields of a job record so
  // an apply link wins over any other link the record happens to carry.
  const rankUrlKey = (key) => {
    const name = String(key).toLowerCase();
    if (name.includes("apply")) return 0;
    if (/original|external|source|posting|redirect/.test(name)) return 1;
    if (name.includes("url") || name.includes("link")) return 2;
    return 3;
  };

  const normalizeId = (value) => String(value || "").trim().toLowerCase();

  const readJobId = (record) => {
    // `jobId` is unambiguous; a bare `id` is only trusted when it looks like the
    // object id Jobright uses, so a company or user id cannot claim a card.
    if (typeof record.jobId === "string" && /^[\w-]{8,64}$/.test(record.jobId)) {
      return normalizeId(record.jobId);
    }

    const objectId = [record.id, record._id].find(
      (candidate) => typeof candidate === "string" && JOB_ID_PATTERN.test(candidate)
    );
    return objectId ? normalizeId(objectId) : "";
  };

  const collectUrlCandidates = (record, depth = 0, candidates = []) => {
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === "string") {
        if (!/^https?:\/\//i.test(value) || IMAGE_URL_PATTERN.test(value)) continue;

        let parsed = null;
        try {
          parsed = new URL(value);
        } catch (_error) {
          continue;
        }

        if (IGNORED_URL_HOSTS.test(parsed.hostname)) {
          // A Jobright apply redirect still lands on the employer's form, so
          // keep it as a last resort behind every off-site candidate.
          if (/apply|redirect/i.test(parsed.pathname)) {
            candidates.push({ key, value, fallback: true });
          }
          continue;
        }

        candidates.push({ key, value, fallback: false });
        continue;
      }

      // A nested group such as apply details can hold the URL, but a nested
      // record with its own job id belongs to a different job.
      if (
        depth < 2 &&
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !readJobId(value)
      ) {
        collectUrlCandidates(value, depth + 1, candidates);
      }
    }

    return candidates;
  };

  const pickApplyUrl = (record) => {
    const candidates = collectUrlCandidates(record).sort(
      (first, second) =>
        Number(first.fallback) - Number(second.fallback) ||
        rankUrlKey(first.key) - rankUrlKey(second.key)
    );
    return candidates.length > 0 ? candidates[0].value : "";
  };

  const harvest = (value, depth = 0) => {
    if (depth > 8 || !value || typeof value !== "object") {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        harvest(item, depth + 1);
      }
      return;
    }

    const jobId = readJobId(value);

    if (jobId) {
      const applyUrl = pickApplyUrl(value);
      const existing = store.jobs[jobId];
      if (applyUrl || !existing) {
        store.jobs[jobId] = {
          applyUrl: applyUrl || existing?.applyUrl || "",
          title: normalizeText(value.jobTitle || value.title || existing?.title || "")
        };
      }

      if (store.sampleJobKeys.length === 0) {
        store.sampleJobKeys = Object.keys(value).slice(0, 40);
      }
    }

    for (const nested of Object.values(value)) {
      harvest(nested, depth + 1);
    }
  };

  const isJobrightApi = (url) => {
    try {
      return /(^|\.)jobright\.ai$/i.test(new URL(String(url || ""), location.href).hostname);
    } catch (_error) {
      return false;
    }
  };

  const recordEndpoint = (url) => {
    try {
      const { pathname } = new URL(String(url), location.href);
      if (!store.endpoints.includes(pathname)) {
        store.endpoints.push(pathname);
        if (store.endpoints.length > 12) {
          store.endpoints.shift();
        }
      }
    } catch (_error) {
      // Nothing to record.
    }
  };

  const nativeFetch = window.fetch;
  if (typeof nativeFetch === "function") {
    window.fetch = function (...args) {
      const result = nativeFetch.apply(this, args);

      result
        .then((response) => {
          if (!response || typeof response.clone !== "function") return;
          if (!isJobrightApi(response.url)) return;
          if (!/json/i.test(response.headers?.get?.("content-type") || "")) return;

          response
            .clone()
            .json()
            .then((data) => {
              recordEndpoint(response.url);
              harvest(data);
            })
            .catch(() => {});
        })
        .catch(() => {});

      return result;
    };
  }

  const nativeXhrOpen = XMLHttpRequest.prototype.open;
  const nativeXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__applicationHelperUrl = String(url || "");
    return nativeXhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", () => {
      try {
        const url = this.__applicationHelperUrl || this.responseURL || "";
        if (!isJobrightApi(url)) return;

        const responseType = this.responseType;
        if (responseType && responseType !== "text" && responseType !== "json") return;

        const raw = responseType === "json" ? this.response : this.responseText;
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        recordEndpoint(url);
        harvest(data);
      } catch (_error) {
        // Not a JSON payload we can read.
      }
    });

    return nativeXhrSend.apply(this, args);
  };

  // A click dispatched by the extension carries no user activation, so Chrome's
  // popup blocker discards whatever window.open the apply handler performs.
  // While a run is armed, intercept that call and hand the URL back instead.
  const recordCapturedUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return false;

    try {
      const parsed = new URL(raw, location.href);
      if (!/^https?:$/.test(parsed.protocol)) return false;
      store.capturedOpenUrls.push(parsed.href);
      return true;
    } catch (_error) {
      return false;
    }
  };

  const createWindowStub = () => {
    const stubLocation = {
      get href() {
        return "";
      },
      set href(value) {
        recordCapturedUrl(value);
      },
      assign: recordCapturedUrl,
      replace: recordCapturedUrl,
      reload() {}
    };

    const stub = {
      closed: false,
      opener: null,
      name: "",
      focus() {},
      blur() {},
      close() {
        stub.closed = true;
      },
      postMessage() {},
      addEventListener() {},
      removeEventListener() {},
      document: {
        write() {},
        writeln() {},
        close() {},
        open() {
          return stub.document;
        }
      }
    };

    // Handlers commonly open a blank tab first and assign its location after.
    Object.defineProperty(stub, "location", {
      get() {
        return stubLocation;
      },
      set(value) {
        recordCapturedUrl(value);
      }
    });

    return stub;
  };

  const nativeWindowOpen = window.open;
  window.open = function (url, target, features) {
    if (Date.now() >= store.openArmedUntil) {
      return nativeWindowOpen.call(window, url, target, features);
    }

    recordCapturedUrl(url);
    return createWindowStub();
  };

  // Jobright can also ship the list with the document, which never reaches the
  // fetch and XHR hooks above.
  const harvestEmbeddedJson = () => {
    for (const script of document.querySelectorAll(
      'script[type="application/json"], script#__NEXT_DATA__'
    )) {
      try {
        harvest(JSON.parse(script.textContent || ""));
      } catch (_error) {
        // Not a payload we can read.
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", harvestEmbeddedJson, { once: true });
  } else {
    harvestEmbeddedJson();
  }

  const getCards = () =>
    Array.from(document.querySelectorAll(CARD_SELECTOR))
      // The list is virtualized: each card sits in a [data-index] wrapper whose
      // index reflects its position, so sorting by it keeps the scan on the
      // topmost pending job.
      .map((card) => {
        const index = Number(card.closest("[data-index]")?.getAttribute("data-index"));
        return { card, index: Number.isFinite(index) ? index : Number.MAX_SAFE_INTEGER };
      })
      .sort((first, second) => first.index - second.index)
      .map((entry) => entry.card);

  const findApplyButton = (card) =>
    Array.from(card.querySelectorAll('button[class*="apply-button"]')).find(isVisible) ||
    Array.from(card.querySelectorAll("button")).find(
      (button) =>
        isVisible(button) && APPLY_LABELS.has(normalizeText(button.textContent).toLowerCase())
    ) ||
    null;

  const readJobTitle = (card) =>
    normalizeText(
      card.querySelector('h2[class*="job-title"], h2, h3')?.textContent
    ).slice(0, 90);

  const getScrollContainer = () =>
    document.querySelector('[class*="jobs-list-scrollable"]');

  const getCardById = (jobId) => {
    const card = document.getElementById(String(jobId || ""));
    return card?.classList.contains("job-card-flag-classname") ? card : null;
  };

  const claimNext = async (processedJobIds = []) => {
    const processed = new Set(
      (Array.isArray(processedJobIds) ? processedJobIds : []).map((value) =>
        String(value || "")
      )
    );
    const findPending = () =>
      getCards().find(
        (card) => !processed.has(card.id) && Boolean(findApplyButton(card))
      ) || null;

    let card = findPending();

    // Marking a job Already Applied removes its card, which pulls the next one
    // into the mounted window, so the next job normally appears without any
    // scrolling. Scrolling is only needed to move past jobs the run skipped.
    for (let attempt = 0; !card && attempt < 6; attempt += 1) {
      const container = getScrollContainer();
      const mountedBefore = getCards().length;
      const step = Math.max(400, (container?.clientHeight || window.innerHeight) * 0.9);

      if (container) {
        const atEnd =
          container.scrollTop + container.clientHeight >= container.scrollHeight - 4;
        container.scrollTop = atEnd
          ? 0
          : Math.min(container.scrollTop + step, container.scrollHeight);
      } else {
        window.scrollBy(0, step);
      }

      await sleep(700);
      card = findPending();

      if (!card && getCards().length === mountedBefore && !container) {
        break;
      }
    }

    if (!card) {
      return {
        found: false,
        cardsMounted: getCards().length,
        error: "No more Apply with Autofill or APPLY NOW recommendations were found."
      };
    }

    const jobId = card.id;
    const harvested = store.jobs[normalizeId(jobId)];
    return {
      found: true,
      jobId,
      jobTitle: readJobTitle(card) || harvested?.title || jobId,
      buttonLabel: normalizeText(findApplyButton(card)?.textContent),
      applyUrl: harvested?.applyUrl || "",
      cardsMounted: getCards().length
    };
  };

  const clickApply = async (jobId) => {
    const card = getCardById(jobId);
    if (!card) {
      return { ok: false, error: "The recommendation card is no longer available." };
    }

    const applyButton = findApplyButton(card);
    if (!applyButton) {
      return { ok: false, error: "The application button is no longer available." };
    }

    store.capturedOpenUrls.length = 0;
    // Self-expiring so an abandoned run cannot keep swallowing manual clicks.
    store.openArmedUntil = Date.now() + 20000;

    applyButton.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);
    applyButton.dispatchEvent(
      new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        button: 0,
        detail: 1
      })
    );

    const deadline = Date.now() + 2500;
    while (store.capturedOpenUrls.length === 0 && Date.now() < deadline) {
      await sleep(100);
    }

    return { ok: true, applyUrl: store.capturedOpenUrls.shift() || "" };
  };

  const markAlreadyApplied = async (jobId) => {
    const card = getCardById(jobId);
    if (!card) {
      return { ok: false, error: "The recommendation card is no longer available." };
    }

    const dislikeButton =
      card.querySelector('use[href$="#dislike"]')?.closest("button") ||
      card.querySelector('img[alt="not-interest-job"]')?.closest("button") ||
      card.querySelector('button[id^="index_not-interest-button__"]');
    if (!dislikeButton) {
      return { ok: false, error: "The recommendation's dislike menu button was not found." };
    }

    dislikeButton.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);

    const overlaySelector =
      '.ant-dropdown, .ant-dropdown-menu, .ant-popover, [role="menu"]';
    const findAlreadyAppliedAction = () => {
      const labels = Array.from(document.querySelectorAll("span"))
        .filter(
          (label) =>
            isVisible(label) && normalizeText(label.textContent) === "Already Applied"
        )
        // The dropdown copy is the real action; other matches can be page badges.
        .sort(
          (first, second) =>
            Number(Boolean(second.closest(overlaySelector))) -
            Number(Boolean(first.closest(overlaySelector)))
        );

      for (const label of labels) {
        const action = label.closest(
          '[role="menuitem"], .ant-dropdown-menu-item, .ant-menu-item, button, a'
        );
        if (action && isVisible(action)) {
          return action;
        }
      }

      const overlayLabel = labels.find((label) => Boolean(label.closest(overlaySelector)));
      return overlayLabel?.parentElement || null;
    };

    let action = null;
    for (let attempt = 0; attempt < 3 && !action; attempt += 1) {
      // A second bare click would toggle an open dropdown shut, so reset the
      // menu state before re-opening it.
      if (attempt > 0) {
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
            which: 27,
            bubbles: true
          })
        );
        await sleep(300);
      }

      dislikeButton.dispatchEvent(
        new MouseEvent("mouseover", { view: window, bubbles: true, cancelable: true })
      );
      dislikeButton.click();

      const menuDeadline = Date.now() + 1800;
      while (!action && Date.now() < menuDeadline) {
        action = findAlreadyAppliedAction();
        if (!action) {
          await sleep(100);
        }
      }
    }

    if (!action) {
      return { ok: false, error: "The Already Applied menu item did not appear." };
    }

    action.click();

    // Jobright removes the card once the status is recorded.
    const confirmationDeadline = Date.now() + 3000;
    while (Date.now() < confirmationDeadline) {
      if (!document.contains(card)) {
        return { ok: true, removed: true };
      }
      if (!document.contains(action) || !isVisible(action)) {
        return { ok: true, removed: false };
      }

      await sleep(100);
    }

    return {
      ok: false,
      error: "Already Applied was clicked, but Jobright did not confirm the action."
    };
  };

  const drainCapturedOpenUrls = () => {
    const urls = store.capturedOpenUrls.slice();
    store.capturedOpenUrls.length = 0;
    return { urls };
  };

  const disarmOpenCapture = () => {
    store.openArmedUntil = 0;
    store.capturedOpenUrls.length = 0;
    return { ok: true };
  };

  const describe = () => {
    harvestEmbeddedJson();
    const jobs = Object.values(store.jobs);
    return {
      ok: true,
      harvestedJobs: jobs.length,
      harvestedWithUrl: jobs.filter((job) => job.applyUrl).length,
      cardsMounted: getCards().length,
      endpoints: store.endpoints.slice(-6),
      sampleJobKeys: store.sampleJobKeys.slice(0, 25)
    };
  };

  store.claimNext = claimNext;
  store.clickApply = clickApply;
  store.markAlreadyApplied = markAlreadyApplied;
  store.drainCapturedOpenUrls = drainCapturedOpenUrls;
  store.disarmOpenCapture = disarmOpenCapture;
  store.describe = describe;

  window[STORE_KEY] = store;
})();
