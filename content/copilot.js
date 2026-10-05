function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SEARCH_MODE = "Search";
const OTHER_MODES = [
  "Smart",
  "Quick response",
  "Quick",
  "Think Deeper",
  "Think",
  "Study and learn",
  "Study"
];
function isVisibleElement(element) {
  if (!element?.isConnected) {
    return false;
  }
  const style = window.getComputedStyle(element);
  return Boolean(
    style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.getClientRects().length > 0
  );
}

function walkDeep(root, visit) {
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node?.querySelectorAll) {
      continue;
    }
    visit(node);
    node.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) {
        queue.push(element.shadowRoot);
      }
    });
  }
}

function queryDeepAll(selectors, root = document) {
  const matches = [];
  const seen = new Set();
  walkDeep(root, (node) => {
    for (const selector of selectors) {
      try {
        for (const element of node.querySelectorAll(selector)) {
          if (seen.has(element) || !isVisibleElement(element)) {
            continue;
          }
          seen.add(element);
          matches.push(element);
        }
      } catch (_error) {
        // Ignore invalid selectors in a given root.
      }
    }
  });
  return matches;
}

function queryDeep(selectors, root = document) {
  return queryDeepAll(selectors, root)[0] || null;
}

function controlIndicatesAiChatRunning(element) {
  const labels = [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.getAttribute("data-test-id"),
    element.getAttribute("name"),
    element.textContent
  ]
    .filter(Boolean)
    .map((label) =>
      String(label)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
    );

  return labels.some((label) => {
    if (label === "stop") {
      return true;
    }
    const describesActivity =
      /\b(generating|generation|responding|response|answering|streaming|output|button)\b/.test(
        label
      );
    return (
      (describesActivity && /\bstop\b/.test(label)) ||
      (/\bcancel\b/.test(label) &&
        /\b(generating|generation|responding|response|answering|streaming|output)\b/.test(
          label
        ))
    );
  });
}

function isAiChatRunning() {
  if (
    queryDeep([
      '[data-state="streaming"]',
      '[data-status="streaming"]',
      '[data-state="generating"]',
      '[data-status="generating"]',
      '[data-is-generating="true"]'
    ])
  ) {
    return true;
  }

  return queryDeepAll(["button", '[role="button"]']).some(
    controlIndicatesAiChatRunning
  );
}

function findCopilotInput() {
  return queryDeep([
    "textarea#userInput",
    "#userInput",
    'textarea[data-testid="composer-input"]',
    'textarea[data-testid="copilot-chat-textarea"]',
    "textarea#searchbox",
    'textarea[placeholder*="Message" i]',
    'textarea[placeholder*="Ask" i]',
    'textarea[aria-label*="message" i]',
    '[contenteditable="true"][role="textbox"]',
    '[contenteditable="true"]',
    "textarea"
  ]);
}

function isModeControl(element) {
  const testId = String(element.getAttribute("data-testid") || "").toLowerCase();
  if (testId.includes("composer-chat-mode")) {
    return true;
  }
  if (
    element.getAttribute("type") === "submit" ||
    /\b(send|submit)\b/i.test(testId)
  ) {
    return false;
  }
  return (
    matchesModeLabel(element, SEARCH_MODE) ||
    OTHER_MODES.some((mode) => matchesModeLabel(element, mode))
  );
}

function isNamedSendButton(element) {
  const accessibleName = [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.textContent
  ]
    .filter(Boolean)
    .join(" ");
  return /\b(send|submit)\b/i.test(accessibleName);
}

function getAncestorChain(element) {
  const chain = [];
  let current = element;
  for (let depth = 0; current && depth < 12; depth += 1) {
    const parent = current.parentElement;
    if (parent) {
      current = parent;
      chain.push(current);
      continue;
    }
    const root = current.getRootNode?.();
    if (root instanceof ShadowRoot && root.host) {
      current = root.host;
      chain.push(current);
      continue;
    }
    break;
  }
  return chain;
}

function findNearbySendButton(input) {
  for (const container of getAncestorChain(input)) {
    const candidates = queryDeepAll(
      ['button, [role="button"], input[type="submit"]'],
      container
    ).filter(
      (element) =>
        element !== input && !isModeControl(element) && isVisibleElement(element)
    );
    if (!candidates.length) {
      continue;
    }

    const namedSendButton = candidates.find(isNamedSendButton);
    if (namedSendButton) {
      return namedSendButton;
    }

    return candidates.reduce((rightmost, candidate) => {
      const rightmostRect = rightmost.getBoundingClientRect();
      const candidateRect = candidate.getBoundingClientRect();
      return candidateRect.right >= rightmostRect.right ? candidate : rightmost;
    });
  }

  return null;
}

function findSendButton(input) {
  const named = queryDeep([
    'button[data-testid="copilot-send-button"]',
    'button[data-testid="composer-send-button"]',
    'button[data-testid="composer-submit-button"]',
    'button[aria-label*="Submit" i]',
    'button[aria-label*="Send" i]',
    'button[title*="Send" i]',
    'button[type="submit"]'
  ]);
  if (named && !isModeControl(named)) {
    return named;
  }

  return (
    findNearbySendButton(input) ||
    input?.closest("form")?.querySelector(
      'button[type="submit"], button[aria-label*="send" i]'
    ) ||
    null
  );
}

function isSendButtonReady(button) {
  return Boolean(
    button &&
      !button.disabled &&
      button.getAttribute("aria-disabled") !== "true"
  );
}

async function waitForCopilotInput(timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const input = findCopilotInput();
    if (input) {
      return input;
    }
    await sleep(200);
  }
  return findCopilotInput();
}

async function waitForReadySendButton(input, timeoutMs = 8000) {
  const startedAt = Date.now();
  let sendButton = null;
  while (Date.now() - startedAt < timeoutMs) {
    sendButton = findSendButton(input);
    if (isSendButtonReady(sendButton)) {
      return sendButton;
    }
    await sleep(200);
  }
  return isSendButtonReady(sendButton) ? sendButton : null;
}

function slugMode(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getControlLabels(element) {
  return [
    element.getAttribute("aria-label"),
    element.getAttribute("title"),
    element.getAttribute("data-testid"),
    element.getAttribute("data-value"),
    element.textContent
  ]
    .filter(Boolean)
    .map((label) => String(label).replace(/\s+/g, " ").trim().toLowerCase());
}

function matchesModeTestId(element, modeLabel) {
  const testId = String(element.getAttribute("data-testid") || "").toLowerCase();
  if (!testId.includes("composer-chat-mode")) {
    return false;
  }

  const slug = slugMode(modeLabel);
  const firstWord = slug.split("-")[0];
  return (
    testId.includes(`composer-chat-mode-${slug}`) ||
    (firstWord && testId.includes(`composer-chat-mode-${firstWord}`))
  );
}

function matchesModeLabel(element, modeLabel) {
  const target = String(modeLabel || "").trim().toLowerCase();
  if (!target) {
    return false;
  }
  if (matchesModeTestId(element, modeLabel)) {
    return true;
  }

  return getControlLabels(element).some(
    (label) =>
      label === target ||
      label === `${target} mode` ||
      label.startsWith(`${target} mode `) ||
      label.startsWith(`switch to ${target}`)
  );
}

function clickInteractiveElement(button) {
  button.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  button.focus?.();

  const rect = button.getBoundingClientRect();
  const eventOptions = {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    button: 0,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2
  };

  if (typeof PointerEvent === "function") {
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        ...eventOptions,
        buttons: 1,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      })
    );
  }
  button.dispatchEvent(
    new MouseEvent("mousedown", { ...eventOptions, buttons: 1 })
  );
  if (typeof PointerEvent === "function") {
    button.dispatchEvent(
      new PointerEvent("pointerup", {
        ...eventOptions,
        buttons: 0,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      })
    );
  }
  button.dispatchEvent(
    new MouseEvent("mouseup", { ...eventOptions, buttons: 0 })
  );
  button.click();
}

function setNativeValue(element, value) {
  const proto =
    element.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(element, value);
  } else {
    element.value = value;
  }
}

function getInputValue(element) {
  if (element.isContentEditable) {
    return String(element.textContent || "").trim();
  }
  return String(element.value || "").trim();
}

function fillCopilotInput(element, text) {
  element.focus();

  if (element.isContentEditable) {
    element.textContent = "";
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("insertText", false, text);
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: text
      })
    );
    return;
  }

  setNativeValue(element, text);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text
    })
  );
}

function pressEnter(element) {
  const eventInit = {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true,
    composed: true
  };
  element.dispatchEvent(new KeyboardEvent("keydown", eventInit));
  element.dispatchEvent(new KeyboardEvent("keypress", eventInit));
  element.dispatchEvent(new KeyboardEvent("keyup", eventInit));
}

async function fillAndSend(text, options = {}) {
  const input = await waitForCopilotInput();
  if (!input) {
    throw new Error("Copilot input not found. Sign in and open the chat, then try again.");
  }

  const submitOnlyWhenIdle = options.submitOnlyWhenIdle === true;
  const chatWasRunning = submitOnlyWhenIdle && isAiChatRunning();
  input.click?.();
  fillCopilotInput(input, text);
  await sleep(400);

  const prompt = findCopilotInput() || input;
  if (getInputValue(prompt) !== String(text || "").trim()) {
    fillCopilotInput(prompt, text);
    await sleep(200);
  }

  if (chatWasRunning || (submitOnlyWhenIdle && isAiChatRunning())) {
    return { submitted: false, reason: "chat-running" };
  }

  const sendButton = await waitForReadySendButton(prompt);
  if (sendButton) {
    clickInteractiveElement(sendButton);
    return { submitted: true };
  }

  prompt.focus();
  pressEnter(prompt);
  return { submitted: true };
}

if (!globalThis.__applicationHelperCopilotListenerRegistered) {
  globalThis.__applicationHelperCopilotListenerRegistered = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "PING_AI_PROVIDER") {
      sendResponse({ ok: true });
      return false;
    }

    if (message.type !== "FILL_AND_SEND") {
      return;
    }

    fillAndSend(message.text, {
      submitOnlyWhenIdle: message.submitOnlyWhenIdle === true
    })
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || "Could not fill the Copilot prompt."
        });
      });

    return true;
  });
}
