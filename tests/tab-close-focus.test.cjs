const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const source = fs.readFileSync(path.join(__dirname, "../sidepanel/tab-close-focus.js"), "utf8");

function load(names, context) {
  for (const name of names) {
    const match = source.match(new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m"));
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function fixture(tabs = [
  { id: 1, windowId: 5, index: 0 },
  { id: 2, windowId: 5, index: 1, active: true },
  { id: 3, windowId: 5, index: 2 }
]) {
  const focused = [];
  const errors = [];
  let visible = true;
  const context = vm.createContext({});
  load(["createCloseLeftTabTracker"], context);
  const tracker = context.createCloseLeftTabTracker({
    windowId: 5,
    focusTab: (id) => focused.push(id),
    isVisible: () => visible,
    onError: (error) => errors.push(error)
  });
  if (tabs) tracker.initialize(tabs);
  return { tracker, focused, errors, setVisible: (value) => { visible = value; } };
}

test("closing the active tab focuses its immediate left neighbor", () => {
  const { tracker, focused } = fixture();
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, [1]);
});

test("closing the first tab does not wrap to the last tab", () => {
  const { tracker, focused } = fixture();
  tracker.handle("activated", { windowId: 5, tabId: 1 });
  tracker.handle("removed", 1, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, []);
});

test("background tab removal and closing a whole window do not redirect focus", () => {
  const { tracker, focused } = fixture();
  tracker.handle("removed", 1, { windowId: 5, isWindowClosing: false });
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: true });
  assert.deepEqual(focused, []);
});

test("close-left ignores other windows and hidden side panels", () => {
  const { tracker, focused, setVisible } = fixture();
  tracker.handle("activated", { windowId: 9, tabId: 77 });
  tracker.handle("removed", 77, { windowId: 9, isWindowClosing: false });
  setVisible(false);
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, []);
});

test("left-neighbor selection follows tab moves and new insertions", () => {
  const { tracker, focused } = fixture();
  tracker.handle("moved", 3, { windowId: 5, fromIndex: 2, toIndex: 1 });
  tracker.handle("created", { id: 4, windowId: 5, index: 2, active: false });
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, [4]);
});

test("moving tabs between windows updates neighbors without triggering close focus", () => {
  const { tracker, focused } = fixture();
  tracker.handle("attached", 4, { newWindowId: 5, newPosition: 1 });
  tracker.handle("detached", 1, { oldWindowId: 5, oldPosition: 0 });
  assert.deepEqual(focused, []);
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, [4]);
});

test("repeated close events use the updated active tab and remaining order", () => {
  const { tracker, focused } = fixture();
  tracker.handle("activated", { windowId: 5, tabId: 3 });
  tracker.handle("removed", 3, { windowId: 5, isWindowClosing: false });
  tracker.handle("activated", { windowId: 5, tabId: 2 });
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, [2, 1]);
});

test("startup events synchronize tab order without delayed focus changes", () => {
  const { tracker, focused } = fixture(null);
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  tracker.handle("activated", { windowId: 5, tabId: 3 });
  tracker.initialize([
    { id: 1, windowId: 5, index: 0 },
    { id: 2, windowId: 5, index: 1, active: true },
    { id: 3, windowId: 5, index: 2 }
  ]);
  assert.deepEqual(focused, []);
  tracker.handle("removed", 3, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, [1]);
});

test("closing the panel disposes the tracker", () => {
  const { tracker, focused } = fixture();
  tracker.dispose();
  tracker.handle("removed", 2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, []);
});

test("initialization binds to the panel window and removes listeners on pagehide", async () => {
  const events = new Map();
  for (const name of ["onCreated", "onActivated", "onMoved", "onAttached", "onDetached", "onRemoved"]) {
    const listeners = new Set();
    events.set(name, {
      listeners,
      addListener: (fn) => listeners.add(fn),
      removeListener: (fn) => listeners.delete(fn),
      emit: (...args) => { for (const fn of listeners) fn(...args); }
    });
  }
  const focused = [];
  const windowListeners = new Map();
  const context = vm.createContext({
    console,
    document: { visibilityState: "visible" },
    window: {
      addEventListener: (name, fn) => windowListeners.set(name, fn),
      removeEventListener: (name) => windowListeners.delete(name)
    },
    chrome: {
      windows: { getCurrent: async () => ({ id: 5 }) },
      tabs: {
        ...Object.fromEntries(events),
        query: async ({ windowId }) => {
          assert.equal(windowId, 5);
          return [
            { id: 1, windowId: 5, index: 0 },
            { id: 2, windowId: 5, index: 1, active: true }
          ];
        },
        update: async (id) => focused.push(id)
      }
    }
  });
  load(["createCloseLeftTabTracker", "initializeCloseLeftTabFocus"], context);
  await context.initializeCloseLeftTabFocus();
  events.get("onRemoved").emit(2, { windowId: 5, isWindowClosing: false });
  assert.deepEqual(focused, [1]);
  windowListeners.get("pagehide")();
  for (const event of events.values()) assert.equal(event.listeners.size, 0);
});
