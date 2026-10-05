// Ctrl+W is owned by Chrome. React to the native close event instead of
// registering a shortcut that Chrome will ignore. This script only runs in
// the side-panel document, and only changes focus while that panel is visible.
function createCloseLeftTabTracker({ windowId, focusTab, isVisible, onError }) {
  let tabIds = [];
  let activeTabId = null;
  let ready = false;
  let disposed = false;
  const pendingEvents = [];

  function apply(type, value, details = {}, allowFocus = true) {
    if (disposed) return;
    if (type === "activated") {
      if (value.windowId === windowId) activeTabId = value.tabId;
      return;
    }
    if (type === "created") {
      if (value.windowId !== windowId) return;
      if (!tabIds.includes(value.id)) tabIds.splice(value.index, 0, value.id);
      if (value.active) activeTabId = value.id;
      return;
    }
    if (type === "moved" || type === "attached") {
      if ((details.windowId ?? details.newWindowId) !== windowId) return;
      const oldIndex = tabIds.indexOf(value);
      if (oldIndex >= 0) tabIds.splice(oldIndex, 1);
      tabIds.splice(details.toIndex ?? details.newPosition, 0, value);
      return;
    }
    if (type !== "removed" && type !== "detached") return;
    if ((details.windowId ?? details.oldWindowId) !== windowId) return;

    const index = tabIds.indexOf(value);
    const leftTabId = index > 0 ? tabIds[index - 1] : null;
    const wasActive = activeTabId === value;
    if (index >= 0) tabIds.splice(index, 1);
    if (wasActive) activeTabId = null;
    if (
      type !== "removed" ||
      !allowFocus ||
      !wasActive ||
      details.isWindowClosing ||
      !Number.isInteger(leftTabId) ||
      !isVisible()
    ) {
      return;
    }

    // No await before issuing the focus change: use the order immediately
    // before the close, before Chrome's fallback activation event arrives.
    try {
      Promise.resolve(focusTab(leftTabId)).catch(onError);
    } catch (error) {
      onError(error);
    }
  }

  return {
    initialize(tabs) {
      if (disposed) return;
      const windowTabs = tabs.filter((tab) => tab.windowId === windowId);
      tabIds = windowTabs
        .slice()
        .sort((a, b) => a.index - b.index)
        .map((tab) => tab.id);
      activeTabId = windowTabs.find((tab) => tab.active)?.id ?? null;
      ready = true;
      // Events received during the initial query synchronize the snapshot,
      // but must not redirect focus for a close that already finished.
      for (const event of pendingEvents.splice(0)) apply(...event, false);
    },
    handle(type, value, details = {}) {
      if (disposed) return;
      if (!ready) {
        pendingEvents.push([type, value, details]);
        return;
      }
      apply(type, value, details);
    },
    dispose() {
      disposed = true;
      pendingEvents.length = 0;
      tabIds = [];
      activeTabId = null;
    }
  };
}

async function initializeCloseLeftTabFocus() {
  const currentWindow = await chrome.windows.getCurrent();
  if (!Number.isInteger(currentWindow?.id)) return;

  const tracker = createCloseLeftTabTracker({
    windowId: currentWindow.id,
    focusTab: (tabId) => chrome.tabs.update(tabId, { active: true }),
    isVisible: () => document.visibilityState === "visible",
    onError: (error) => console.info("Could not focus the tab to the left after closing:", error)
  });
  const bindings = [
    [chrome.tabs.onCreated, (tab) => tracker.handle("created", tab)],
    [chrome.tabs.onActivated, (info) => tracker.handle("activated", info)],
    [chrome.tabs.onMoved, (tabId, info) => tracker.handle("moved", tabId, info)],
    [chrome.tabs.onAttached, (tabId, info) => tracker.handle("attached", tabId, info)],
    [chrome.tabs.onDetached, (tabId, info) => tracker.handle("detached", tabId, info)],
    [chrome.tabs.onRemoved, (tabId, info) => tracker.handle("removed", tabId, info)]
  ];
  const dispose = () => {
    tracker.dispose();
    for (const [event, listener] of bindings) event.removeListener(listener);
    window.removeEventListener("pagehide", dispose);
  };
  for (const [event, listener] of bindings) event.addListener(listener);
  window.addEventListener("pagehide", dispose, { once: true });
  try {
    tracker.initialize(await chrome.tabs.query({ windowId: currentWindow.id }));
  } catch (error) {
    dispose();
    throw error;
  }
}

initializeCloseLeftTabFocus().catch((error) => {
  console.info("Could not initialize close-left tab focus:", error);
});
