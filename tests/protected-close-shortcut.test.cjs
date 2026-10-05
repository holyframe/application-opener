const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const root = path.resolve(__dirname, "..");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const panel = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

function load(source, names, context) {
  for (const name of names) {
    const match = source.match(new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m"));
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function fixture(options = {}) {
  const tab = { id: 12, windowId: 7, active: true, title: "Job", ...options.tab };
  const state = {
    tabId: tab.id, open: true, ready: true, selectedProfileIds: [], saveActionPending: false,
    ...options.state
  };
  const calls = { removed: [], messages: [], queries: 0, notifications: [] };
  const context = vm.createContext({
    console: { info() {}, error() {} },
    protectedCloseShortcutPending: false,
    saveTitleStatusByTabId: options.statuses || new Map(),
    APP_ACTION_COMMANDS: {},
    notifyExtensionPages: async (message) => calls.notifications.push(message),
    chrome: {
      runtime: {
        getURL: (file) => "chrome-extension://helper/" + file,
        sendMessage: async (message) => {
          calls.messages.push(message);
          if (options.messageError) throw new Error("No visible panel");
          await options.onMessage?.(state);
          return options.response === undefined ? state : options.response;
        }
      },
      tabs: {
        query: async () => {
          calls.queries++;
          if (options.queryError) throw new Error("Cannot inspect tabs");
          return options.query ? options.query(calls.queries, tab) : [tab];
        },
        remove: async (id) => calls.removed.push(id)
      },
      commands: { onCommand: { addListener: (callback) => { calls.command = callback; } } }
    }
  });
  load(worker, ["getSaveTabCloseProtectionReason", "closeCurrentTabFromShortcut"], context);
  return { context, calls, tab, state };
}

test("Ctrl+D is registered as a protected close command; Ctrl+W is not overridden", () => {
  assert.equal(manifest.commands["close-tab-safely"].suggested_key.default, "Ctrl+D");
  assert.ok(!Object.values(manifest.commands).some((command) => command.suggested_key?.default === "Ctrl+W"));
});

test("the protected shortcut closes the current tab when no profiles are checked", async () => {
  const { context, calls, tab } = fixture();
  const result = await context.closeCurrentTabFromShortcut(tab);
  assert.equal(result.closed, true);
  assert.deepEqual(calls.removed, [12]);
  assert.equal(calls.messages[0].type, "GET_PROTECTED_CLOSE_STATE");
  assert.equal(calls.messages[0].tabId, 12);
});

test("any checked profile keeps the tab open, including live Auto selections", async () => {
  for (const ids of [["manual"], ["auto"], ["one", "two"]]) {
    const { context, calls, tab } = fixture({ state: { selectedProfileIds: ids } });
    const result = await context.closeCurrentTabFromShortcut(tab);
    assert.equal(result.closed, false);
    assert.match(result.message, /profiles are selected/);
    assert.deepEqual(calls.removed, []);
  }
});

test("unknown, hidden, closed, loading, or wrong-tab panel state never authorizes a close", async () => {
  for (const state of [
    { open: false }, { ready: false }, { tabId: 999 },
    { selectedProfileIds: null }, { selectedProfileIds: undefined },
    { saveActionPending: undefined }
  ]) {
    const { context, calls, tab } = fixture({ state });
    assert.equal((await context.closeCurrentTabFromShortcut(tab)).closed, false);
    assert.deepEqual(calls.removed, []);
  }
  for (const options of [{ messageError: true }, { response: null }]) {
    const { context, calls, tab } = fixture(options);
    assert.equal((await context.closeCurrentTabFromShortcut(tab)).closed, false);
    assert.deepEqual(calls.removed, []);
  }
});

test("saving and failed tabs stay protected even after deselecting profiles", async () => {
  const cases = [
    { state: { saveActionPending: true } },
    { statuses: new Map([[12, { state: "saving" }]]) },
    { statuses: new Map([[12, { state: "failed" }]]) },
    { tab: { title: "Job — failed" } },
    { tab: { favIconUrl: "chrome-extension://helper/assets/save-status-saving.svg" } }
  ];
  for (const options of cases) {
    const { context, calls, tab } = fixture(options);
    const result = await context.closeCurrentTabFromShortcut(tab);
    assert.equal(result.closed, false);
    assert.match(result.message, /saving or has a failed save/);
    assert.deepEqual(calls.removed, []);
  }
});

test("a saved tab with no selected profiles may close", async () => {
  const { context, calls, tab } = fixture({ statuses: new Map([[12, { state: "success" }]]) });
  assert.equal((await context.closeCurrentTabFromShortcut(tab)).closed, true);
  assert.deepEqual(calls.removed, [12]);
});

test("switching tabs or windows during the shortcut cancels closing", async () => {
  for (const nextTab of [{ id: 13, windowId: 7 }, { id: 12, windowId: 8 }, null]) {
    const { context, calls, tab } = fixture({ query: (count, original) => count === 1 ? [original] : nextTab ? [nextTab] : [] });
    assert.equal((await context.closeCurrentTabFromShortcut(tab)).closed, false);
    assert.deepEqual(calls.removed, []);
  }
});

test("a shortcut from a stale source tab cannot close the new active tab", async () => {
  const { context, calls } = fixture();
  assert.equal((await context.closeCurrentTabFromShortcut({ id: 99 })).closed, false);
  assert.deepEqual(calls.removed, []);
  assert.equal(calls.messages.length, 0);
});

test("a fresh profile change or save start during the check prevents closing", async () => {
  const statuses = new Map();
  for (const options of [
    { onMessage: (state) => { state.selectedProfileIds.push("just-selected"); } },
    { statuses, onMessage: () => statuses.set(12, { state: "saving" }) }
  ]) {
    const { context, calls, tab } = fixture(options);
    assert.equal((await context.closeCurrentTabFromShortcut(tab)).closed, false);
    assert.deepEqual(calls.removed, []);
  }
});

test("tab inspection failures never cause a fallback close", async () => {
  const { context, calls, tab } = fixture({ queryError: true });
  await assert.rejects(context.closeCurrentTabFromShortcut(tab), /Cannot inspect/);
  assert.deepEqual(calls.removed, []);
});

test("the command listener routes Ctrl+D separately and ignores overlapping requests", async () => {
  const { context, calls, tab } = fixture({ state: { selectedProfileIds: ["selected"] } });
  const listener = worker.match(/^chrome.commands.onCommand.addListener\([\s\S]*?^\}\);/m);
  assert.ok(listener);
  vm.runInContext(listener[0], context);
  calls.command("close-tab-safely", tab);
  calls.command("close-tab-safely", tab);
  await new Promise(setImmediate);
  assert.equal(calls.messages.length, 1);
  assert.equal(calls.notifications.length, 1);
  assert.equal(calls.notifications[0].type, "HOTKEY_CLOSE_BLOCKED");
  assert.equal(calls.notifications[0].tabId, 12);
  assert.deepEqual(calls.removed, []);
  assert.equal(context.protectedCloseShortcutPending, false);
});

function panelFixture(overrides = {}) {
  const context = vm.createContext({
    activeTabId: 12,
    document: { visibilityState: "visible" },
    isProfileSelectionLoaded: true,
    isProtectedCloseReady: true,
    isSaveActionRunning: false,
    areActionButtonsDisabled: false,
    isSavePostProcessRequestPending: false,
    isSavePostProcessActive: () => false,
    profileSelectionState: { selectedProfileIds: ["manual", "auto"] },
    ...overrides
  });
  load(panel, ["getProtectedCloseStateForTab"], context);
  return context;
}

test("the panel answers only for its active tab and includes all live selected profiles", () => {
  const context = panelFixture();
  assert.equal(context.getProtectedCloseStateForTab(99), null);
  assert.equal(context.getProtectedCloseStateForTab(null), null);
  const state = context.getProtectedCloseStateForTab(12);
  assert.equal(state.ready, true);
  assert.equal(state.open, true);
  assert.deepEqual(Array.from(state.selectedProfileIds), ["manual", "auto"]);
  state.selectedProfileIds.length = 0;
  assert.equal(context.profileSelectionState.selectedProfileIds.length, 2);
});

test("the panel refuses authorization until startup and profile loading finish", () => {
  for (const overrides of [{ isProtectedCloseReady: false }, { isProfileSelectionLoaded: false }]) {
    assert.equal(panelFixture(overrides).getProtectedCloseStateForTab(12).ready, false);
  }
  assert.equal(panelFixture({ document: { visibilityState: "hidden" } }).getProtectedCloseStateForTab(12).open, false);
});

test("all pending save phases keep the shortcut protected", () => {
  for (const overrides of [
    { isSaveActionRunning: true }, { areActionButtonsDisabled: true },
    { isSavePostProcessRequestPending: true }, { isSavePostProcessActive: () => true }
  ]) {
    assert.equal(panelFixture(overrides).getProtectedCloseStateForTab(12).saveActionPending, true);
  }
});
