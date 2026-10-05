const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const worker = fs.readFileSync(
  path.join(path.resolve(__dirname, ".."), "service-worker.js"),
  "utf8"
);

function load(source, names, context) {
  for (const name of names) {
    const match = source.match(
      new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m")
    );
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function createContext() {
  const calls = [];
  const context = vm.createContext({
    console,
    Set,
    sidePanelDisabledTabIds: new Set(),
    chrome: {
      sidePanel: {
        setOptions: async (options) => calls.push({ ...options })
      }
    }
  });
  load(
    worker,
    [
      "isChromeExtensionsPageUrl",
      "shouldEnableSidePanelForTab",
      "syncSidePanelForTab"
    ],
    context
  );
  return { context, calls };
}

test("only Chrome's extensions pages disable the side panel", () => {
  const { context } = createContext();

  for (const url of [
    "chrome://extensions",
    "chrome://extensions/",
    "chrome://extensions/shortcuts",
    "chrome://extensions/?id=application-helper"
  ]) {
    assert.equal(context.shouldEnableSidePanelForTab({ id: 7, url }), false);
  }

  for (const url of [
    "https://example.com/jobs/42",
    "chrome://settings/",
    "chrome://newtab/",
    "about:blank"
  ]) {
    assert.equal(context.shouldEnableSidePanelForTab({ id: 7, url }), true);
  }
});

test("navigation closes on extensions and re-enables on the next normal page", async () => {
  const { context, calls } = createContext();
  const tab = { id: 7, url: "https://example.com/jobs/42" };

  await context.syncSidePanelForTab(tab);
  assert.deepEqual(calls, []);

  tab.url = "chrome://extensions/";
  await context.syncSidePanelForTab(tab);
  assert.deepEqual(calls, [
    {
      tabId: 7,
      path: "sidepanel/sidepanel.html",
      enabled: false
    }
  ]);

  await context.syncSidePanelForTab(tab);
  assert.equal(calls.length, 1);

  tab.url = "https://example.com/another-job";
  await context.syncSidePanelForTab(tab);
  assert.deepEqual(calls[1], {
    tabId: 7,
    path: "sidepanel/sidepanel.html",
    enabled: true
  });
});

function createSaveTitleContext(initialTitle) {
  let observerCallback = null;
  const scriptCalls = [];
  const links = [];
  const document = {
    title: initialTitle,
    head: {
      appendChild(link) {
        if (!links.includes(link)) links.push(link);
        link.isConnected = true;
      }
    },
    documentElement: {},
    createElement(tag) {
      assert.equal(tag, "link");
      const attributes = new Map();
      return {
        isConnected: false,
        getAttribute: (name) => attributes.get(name) ?? null,
        setAttribute: (name, value) => attributes.set(name, value),
        removeAttribute: (name) => attributes.delete(name),
        remove() {
          this.isConnected = false;
        }
      };
    },
    querySelectorAll(selector) {
      assert.equal(selector, 'link[rel~="icon" i]');
      return links.filter(
        (link) => link.isConnected && /\bicon\b/i.test(link.getAttribute("rel")) &&
          !link.getAttribute("rel").includes("apple-touch-icon")
      );
    }
  };
  const context = vm.createContext({
    console,
    document,
    window: {},
    MutationObserver: class {
      constructor(callback) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    },
    chrome: {
      runtime: {
        getURL: (resource) => "chrome-extension://application-helper/" + resource
      },
      scripting: {
        executeScript: async (details) => {
          scriptCalls.push(details);
          return [{ result: details.func(...details.args) }];
        }
      }
    }
  });
  load(
    worker,
    [
      "stripSaveTabTitlePrefix",
      "setSaveTabTitleStatusInPage",
      "applySaveTabTitleStatus"
    ],
    context
  );
  return {
    context,
    document,
    scriptCalls,
    addLink(attributes) {
      const link = document.createElement("link");
      for (const [name, value] of Object.entries(attributes)) {
        link.setAttribute(name, value);
      }
      document.head.appendChild(link);
      return link;
    },
    triggerTitleMutation: () => observerCallback?.()
  };
}

test("Save App shows status in the favicon without duplicating a symbol in the title", async () => {
  const fixture = createSaveTitleContext("Software Engineer - Example");

  assert.equal(
    await fixture.context.applySaveTabTitleStatus(
      12,
      "saving",
      "Software Engineer - Example"
    ),
    true
  );
  assert.equal(fixture.document.title, "Software Engineer - Example");
  assert.equal(fixture.scriptCalls[0].target.tabId, 12);

  fixture.document.title = "Site tried to replace the title";
  fixture.triggerTitleMutation();
  assert.equal(fixture.document.title, "Software Engineer - Example");

  assert.equal(
    await fixture.context.applySaveTabTitleStatus(
      12,
      "success",
      "Software Engineer - Example"
    ),
    true
  );
  assert.equal(
    fixture.document.title,
    "Software Engineer - Example — successfully saved"
  );

  assert.equal(
    await fixture.context.applySaveTabTitleStatus(
      12,
      "failed",
      "Software Engineer - Example"
    ),
    true
  );
  assert.equal(
    fixture.document.title,
    "Software Engineer - Example — failed"
  );

  assert.equal(
    fixture.context.stripSaveTabTitlePrefix(
      "✅ Software Engineer - Example — successfully saved"
    ),
    "Software Engineer - Example"
  );
});

test("Save App keeps status favicons through page changes and restores site icons on clear", async () => {
  const fixture = createSaveTitleContext("Job title");
  const siteIcon = fixture.addLink({
    rel: "shortcut icon",
    href: "/favicon.ico",
    type: "image/x-icon",
    sizes: "16x16 32x32",
    media: "(prefers-color-scheme: dark)"
  });
  const touchIcon = fixture.addLink({ rel: "apple-touch-icon", href: "/touch.png" });
  const icons = () => fixture.document.querySelectorAll('link[rel~="icon" i]');
  assert.equal(siteIcon.getAttribute("href"), "/favicon.ico");

  for (const status of ["saving", "success", "failed", "saving"]) {
    assert.equal(
      await fixture.context.applySaveTabTitleStatus(12, status, "Job title"),
      true
    );
    assert.equal(icons().length, 2);
    for (const link of icons()) {
      assert.equal(
        link.getAttribute("href"),
        "chrome-extension://application-helper/assets/save-status-" + status + ".svg"
      );
      assert.equal(link.getAttribute("type"), "image/svg+xml");
      assert.equal(link.getAttribute("sizes"), "any");
      assert.equal(link.getAttribute("media"), "all");
    }
    assert.equal(touchIcon.getAttribute("href"), "/touch.png");
  }

  const expectedUrl = siteIcon.getAttribute("href");
  siteIcon.setAttribute("href", "/site-refreshed.ico");
  const lateIcon = fixture.addLink({ rel: "ICON", href: "/late.png" });
  icons().find((link) => link !== siteIcon && link !== lateIcon).remove();
  fixture.document.title = "Site refreshed its title";
  fixture.triggerTitleMutation();
  assert.equal(fixture.document.title, "Job title");
  assert.equal(icons().length, 3);
  for (const link of icons()) assert.equal(link.getAttribute("href"), expectedUrl);

  await fixture.context.applySaveTabTitleStatus(12, "", "Job title");
  assert.equal(fixture.document.title, "Job title");
  assert.equal(icons().length, 2);
  assert.equal(siteIcon.getAttribute("href"), "/favicon.ico");
  assert.equal(siteIcon.getAttribute("type"), "image/x-icon");
  assert.equal(siteIcon.getAttribute("sizes"), "16x16 32x32");
  assert.equal(siteIcon.getAttribute("media"), "(prefers-color-scheme: dark)");
  assert.equal(lateIcon.getAttribute("href"), "/late.png");
  assert.equal(lateIcon.getAttribute("type"), null);
  assert.equal(lateIcon.getAttribute("sizes"), null);
  assert.equal(lateIcon.getAttribute("media"), null);
});

test("Save App reuses existing status icons without losing the original site favicon", async () => {
  const fixture = createSaveTitleContext("✅ Job title — successfully saved");
  const oldStatusUrl = "chrome-extension://application-helper/old-status.svg";
  const siteIcon = fixture.addLink({
    rel: "icon",
    href: oldStatusUrl,
    type: "image/svg+xml",
    sizes: "any",
    media: "all"
  });
  const addedIcon = fixture.addLink({ rel: "icon", href: oldStatusUrl });
  let disconnected = false;
  fixture.context.window.__applicationHelperSaveTitleStatus = {
    status: "success",
    baseTitle: "Job title",
    observer: { disconnect() { disconnected = true; } },
    favicon: addedIcon,
    iconUrl: oldStatusUrl,
    originalFavicons: new Map([
      [siteIcon, { href: "/site.ico", type: null, sizes: "32x32", media: null }]
    ])
  };

  await fixture.context.applySaveTabTitleStatus(12, "saving", "Job title");
  assert.equal(disconnected, true);
  assert.equal(addedIcon.isConnected, true);
  assert.equal(
    siteIcon.getAttribute("href"),
    "chrome-extension://application-helper/assets/save-status-saving.svg"
  );
  assert.equal(addedIcon.getAttribute("href"), siteIcon.getAttribute("href"));
  assert.equal(fixture.document.querySelectorAll('link[rel~="icon" i]').length, 2);
  assert.equal(fixture.document.title, "Job title");

  siteIcon.setAttribute("href", "/updated-site.ico");
  await fixture.context.applySaveTabTitleStatus(12, "success", "Job title");
  assert.equal(
    siteIcon.getAttribute("href"),
    "chrome-extension://application-helper/assets/save-status-success.svg"
  );
  assert.equal(fixture.document.title, "Job title — successfully saved");

  await fixture.context.applySaveTabTitleStatus(12, "", "Job title");
  assert.equal(addedIcon.isConnected, false);
  assert.equal(siteIcon.getAttribute("href"), "/site.ico");
  assert.equal(siteIcon.getAttribute("type"), null);
  assert.equal(siteIcon.getAttribute("sizes"), "32x32");
  assert.equal(siteIcon.getAttribute("media"), null);
});

function createPreviousTabContext(tabs, statuses = new Map()) {
  const queries = [];
  const updates = [];
  const context = vm.createContext({
    console,
    saveTitleStatusByTabId: statuses,
    chrome: {
      runtime: {
        getURL: (resource) => "chrome-extension://application-helper/" + resource
      },
      tabs: {
        query: async (options) => {
          queries.push({ ...options });
          return tabs;
        },
        update: async (tabId, changes) => {
          updates.push({ tabId, changes: { ...changes } });
          return {
            ...tabs.find((tab) => tab.id === tabId),
            ...changes
          };
        }
      }
    }
  });
  load(worker, ["activatePreviousWaitingTab"], context);
  return { context, queries, updates };
}

test("Save App selects the nearest waiting tab on the left, regardless of query order", async () => {
  const tabs = [
    { id: 14, windowId: 5, index: 4 },
    { id: 11, windowId: 5, index: 1 },
    { id: 13, windowId: 5, index: 3, active: true },
    { id: 12, windowId: 5, index: 2 }
  ];
  const fixture = createPreviousTabContext(tabs);

  const result = await fixture.context.activatePreviousWaitingTab(tabs[2]);

  assert.equal(result.id, 12);
  assert.deepEqual(fixture.queries, [{ windowId: 5 }]);
  assert.deepEqual(fixture.updates, [
    { tabId: 12, changes: { active: true } }
  ]);
});

test("Save App stays on the first tab without wrapping to the right", async () => {
  const tabs = [
    { id: 21, windowId: 8, index: 0, active: true },
    { id: 22, windowId: 8, index: 1 }
  ];
  const fixture = createPreviousTabContext(tabs);

  const result = await fixture.context.activatePreviousWaitingTab(tabs[0]);

  assert.equal(result, null);
  assert.deepEqual(fixture.queries, [{ windowId: 8 }]);
  assert.deepEqual(fixture.updates, []);
});

test("Save App skips saving, saved, and failed tabs when moving left", async () => {
  const tabs = [
    { id: 30, windowId: 8, index: 0 },
    { id: 31, windowId: 8, index: 1 },
    { id: 32, windowId: 8, index: 2 },
    { id: 33, windowId: 8, index: 3 },
    { id: 34, windowId: 8, index: 4 },
    { id: 35, windowId: 8, index: 5, active: true }
  ];
  const statuses = new Map([
    [32, { state: "saving" }],
    [33, { state: "success" }],
    [34, { state: "failed" }]
  ]);
  const fixture = createPreviousTabContext(tabs, statuses);

  const result = await fixture.context.activatePreviousWaitingTab(tabs[5]);

  assert.equal(result.id, 31);
  assert.deepEqual(fixture.updates, [{ tabId: 31, changes: { active: true } }]);
});

test("Save App stays in place if all tabs to the left have save status", async () => {
  const tabs = [
    { id: 40, windowId: 8, index: 0 },
    { id: 41, windowId: 8, index: 1 },
    { id: 42, windowId: 8, index: 2 },
    { id: 43, windowId: 8, index: 3, active: true },
    { id: 44, windowId: 8, index: 4 }
  ];
  const statuses = new Map([
    [40, { state: "saving" }],
    [41, { state: "success" }],
    [42, { state: "failed" }]
  ]);
  const fixture = createPreviousTabContext(tabs, statuses);

  const result = await fixture.context.activatePreviousWaitingTab(tabs[3]);

  assert.equal(result, null);
  assert.deepEqual(fixture.updates, []);
});

test("Save App recognizes status icons and titles after the in-memory map is lost", async () => {
  const markers = [
    ...["saving", "success", "failed"].map((status) => ({
      favIconUrl: "chrome-extension://application-helper/assets/save-status-" + status + ".svg"
    })),
    { title: "Job title — successfully saved" },
    { title: "Job title — failed" },
    { title: "⏳ Job title" },
    { title: "✅ Job title" },
    { title: "❌ Job title" }
  ];
  for (const marker of markers) {
    const tabs = [
      { id: 50, windowId: 8, index: 0 },
      { id: 51, windowId: 8, index: 1, ...marker },
      { id: 52, windowId: 8, index: 2, active: true }
    ];
    const fixture = createPreviousTabContext(tabs);
    const result = await fixture.context.activatePreviousWaitingTab(tabs[2]);
    assert.equal(result.id, 50, JSON.stringify(marker));
  }
});

test("Save App preserves a manual focus change made before the tab query completes", async () => {
  const source = { id: 61, windowId: 8, index: 1, active: true };
  const fixture = createPreviousTabContext([
    { id: 60, windowId: 8, index: 0, active: true },
    { ...source, active: false }
  ]);

  assert.equal(await fixture.context.activatePreviousWaitingTab(source), null);
  assert.deepEqual(fixture.updates, []);
});

test("Save App uses the current tab order if its source tab was moved", async () => {
  const source = { id: 72, windowId: 8, index: 2, active: true };
  const fixture = createPreviousTabContext([
    { ...source, index: 0 },
    { id: 70, windowId: 8, index: 1 },
    { id: 71, windowId: 8, index: 2 }
  ]);

  assert.equal(await fixture.context.activatePreviousWaitingTab(source), null);
  assert.deepEqual(fixture.updates, []);
});
