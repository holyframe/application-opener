const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const panel = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");

function load(source, names, context) {
  for (const name of names) {
    const match = source.match(
      new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m")
    );
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function fixture({ tabs = [], statuses = new Map(), failGet = [], failQuery = false, onGet } = {}) {
  const allTabs = new Map([
    [99, { id: 99, windowId: 5, url: "https://example.com/return" }],
    ...tabs.map((tab) => [tab.id, tab])
  ]);
  const calls = { removedTabs: [], removedWindows: [], activated: [], logs: [] };
  const context = vm.createContext({
    console,
    saveTitleStatusByTabId: statuses,
    sendLog: (_runId, type, message) => calls.logs.push({ type, message }),
    TAB_SESSION_STORAGE_KEY: "tabSessionById",
    chrome: {
      runtime: { getURL: (file) => "chrome-extension://helper/" + file },
      tabs: {
        async get(id) {
          if (failGet.includes(id) || !allTabs.has(id)) throw new Error("Cannot inspect tab");
          await onGet?.(id, statuses);
          return allTabs.get(id);
        },
        async query({ windowId }) {
          if (failQuery) throw new Error("Cannot inspect window");
          return [...allTabs.values()].filter((tab) => tab.windowId === windowId);
        },
        async update(id, properties) {
          calls.activated.push(id);
          return { ...allTabs.get(id), ...properties };
        },
        async remove(id) {
          calls.removedTabs.push(id);
          allTabs.delete(id);
        }
      },
      windows: {
        update: async () => {},
        remove: async (id) => calls.removedWindows.push(id)
      },
      storage: {
        session: {
          get: async () => ({ tabSessionById: { tabStates: { 1: { pickupWindowIds: [8, 9] } } } })
        }
      }
    }
  });
  load(worker, [
    "getSaveTabCloseProtectionReason",
    "closePickupWindowIfSafe",
    "closeTabsAndReturn",
    "closePersistedPickupWindowsForTab"
  ], context);
  return { context, calls, statuses };
}

test("batch closing keeps saving and failed tabs, while closing eligible tabs", async () => {
  const { context, calls } = fixture({
    tabs: [1, 2, 3, 4].map((id) => ({ id, windowId: 5 })),
    statuses: new Map([
      [1, { state: "saving" }],
      [2, { state: "failed" }],
      [3, { state: "success" }]
    ])
  });
  const result = await context.closeTabsAndReturn("close", {
    openedTabIds: [1, 2, 3, 4, 4], returnTabId: 99
  });
  assert.deepEqual(calls.removedTabs, [3, 4]);
  assert.deepEqual(Array.from(result.protectedTabIds), [1, 2]);
  assert.deepEqual(Array.from(result.closedTabIds), [3, 4]);
  assert.deepEqual(calls.activated, [99]);
  assert.match(result.message, /Kept 2 saving or failed tab/);
});

test("close protection recognizes saving and failed markers after a worker restart", async () => {
  const markers = [
    { favIconUrl: "chrome-extension://helper/assets/save-status-saving.svg" },
    { favIconUrl: "chrome-extension://helper/assets/save-status-failed.svg" },
    { title: "Job title — failed" },
    { title: "⏳ Job title" },
    { title: "❌ Job title" }
  ];
  for (const marker of markers) {
    const { context, calls } = fixture({ tabs: [{ id: 1, windowId: 5, ...marker }] });
    const result = await context.closeTabsAndReturn("close", { openedTabIds: [1], returnTabId: 99 });
    assert.deepEqual(calls.removedTabs, [], JSON.stringify(marker));
    assert.deepEqual(Array.from(result.protectedTabIds), [1]);
  }
});

test("a completed retry may close even if Chrome still reports its old failed marker", async () => {
  const { context, calls } = fixture({
    tabs: [{ id: 1, windowId: 5, title: "Job title — failed" }],
    statuses: new Map([[1, { state: "success" }]])
  });
  await context.closeTabsAndReturn("close", { openedTabIds: [1], returnTabId: 99 });
  assert.deepEqual(calls.removedTabs, [1]);
});

test("a save starting during tab inspection is protected before closing", async () => {
  const { context, calls } = fixture({
    tabs: [{ id: 1, windowId: 5 }],
    onGet: (id, statuses) => { if (id === 1) statuses.set(id, { state: "saving" }); }
  });
  await context.closeTabsAndReturn("close", { openedTabIds: [1], returnTabId: 99 });
  assert.deepEqual(calls.removedTabs, []);
});

test("batch closing never removes a tab whose state cannot be inspected", async () => {
  const { context, calls } = fixture({
    tabs: [{ id: 1, windowId: 5 }, { id: 2, windowId: 5 }],
    failGet: [1]
  });
  const result = await context.closeTabsAndReturn("close", { openedTabIds: [1, 2], returnTabId: 99 });
  assert.deepEqual(calls.removedTabs, [2]);
  assert.deepEqual(Array.from(result.unclosedTabIds), [1]);
  assert.match(result.message, /could not be confirmed closed/);
});

test("pickup window closing keeps the whole window if any tab is saving or failed", async () => {
  for (const state of ["saving", "failed"]) {
    const { context, calls } = fixture({
      tabs: [{ id: 1, windowId: 8 }, { id: 2, windowId: 8 }],
      statuses: new Map([[2, { state }]])
    });
    const result = await context.closePickupWindowIfSafe(8);
    assert.equal(result.closed, false);
    assert.deepEqual(Array.from(result.protectedTabIds), [2]);
    assert.deepEqual(calls.removedWindows, []);
  }
});

test("pickup window cleanup still closes eligible windows and retains protected ones", async () => {
  const { context, calls } = fixture({
    tabs: [{ id: 2, windowId: 8 }, { id: 3, windowId: 9 }],
    statuses: new Map([[2, { state: "failed" }], [3, { state: "success" }]])
  });
  await context.closePersistedPickupWindowsForTab(1);
  assert.deepEqual(calls.removedWindows, [9]);
});

test("pickup window closing leaves the window open if inspection fails", async () => {
  const { context, calls } = fixture({ failQuery: true });
  await assert.rejects(context.closePickupWindowIfSafe(8), /Cannot inspect window/);
  assert.deepEqual(calls.removedWindows, []);
});

test("pickup cleanup retains tracking for protected and unverified windows", async () => {
  const tabState = { pickupWindowIds: [8, 9, 10] };
  const messages = [];
  const forgotten = [];
  const context = vm.createContext({
    console: { info() {} },
    tabStateById: new Map([[1, tabState]]),
    chrome: {
      runtime: {
        async sendMessage(message) {
          messages.push(message.type);
          if (message.windowId === 10) return { ok: false, error: "Cannot inspect" };
          return { ok: true, closed: message.windowId === 9 };
        }
      }
    },
    forgetPickupWindowIdEverywhere(id) {
      forgotten.push(id);
      tabState.pickupWindowIds = tabState.pickupWindowIds.filter((value) => value !== id);
    },
    addLogForTab() {},
    updatePickupCloseButtons: async () => {}
  });
  load(panel, ["requestClosePickupWindow", "closePickupWindowsForOwnerTab"], context);
  await context.closePickupWindowsForOwnerTab(1);
  assert.deepEqual(messages, ["CLOSE_PICKUP_WINDOW", "CLOSE_PICKUP_WINDOW", "CLOSE_PICKUP_WINDOW"]);
  assert.deepEqual(forgotten, [9]);
  assert.deepEqual(tabState.pickupWindowIds, [8, 10]);
});

test("the pickup close button reports protection and does not forget the open window", async () => {
  const statuses = [];
  let forgotten = false;
  let updated = false;
  const context = vm.createContext({
    console,
    activeTabId: 1,
    findPickedUpWindowForUrl: async () => ({ windowId: 8 }),
    requestClosePickupWindow: async () => ({ closed: false, protectedTabIds: [2] }),
    forgetPickupWindowIdEverywhere() { forgotten = true; },
    showStatusForTab: (...args) => statuses.push(args),
    addLogForTab() {},
    updatePickupCloseButtons: async () => { updated = true; }
  });
  load(panel, ["closePickedUpWindowForUrl"], context);
  await context.closePickedUpWindowForUrl("https://example.com/job");
  assert.equal(forgotten, false);
  assert.equal(updated, true);
  assert.equal(statuses[0][1], "info");
  assert.match(statuses[0][2], /kept open/);
});
