// Optional integration check: NODE_PATH must expose Playwright. Uses a fresh
// temporary browser profile and synthetic data, never the user's Chrome tabs.
// Usage: node tests/protected-close-browser-check.cjs [msedge|chromium]
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const workerSource = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const selectionVersion = Number(workerSource.match(/const PROFILE_SELECTION_VERSION = (\d+);/)[1]);

async function until(read, matches, label) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const value = await read();
    if (matches(value)) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out: " + label);
}

(async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: true,
    channel: process.argv[2] || "msedge",
    args: [`--disable-extensions-except=${root}`, `--load-extension=${root}`]
  });
  try {
    await context.route(/^https?:/, (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Test job</title><p>Isolated test</p>" }));
    const worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
    const extensionId = new URL(worker.url()).host;
    const commands = await worker.evaluate(() => chrome.commands.getAll());
    assert.ok(commands.find((command) => command.name === "close-tab-safely"));
    if (commands.find((command) => command.name === "close-tab-safely")?.shortcut !== "Ctrl+D") {
      const shortcuts = await context.newPage();
      await shortcuts.goto("chrome://extensions/shortcuts");
      // Test-only: simulate the user's explicit assignment through the browser
      // settings API. This API is not available to the extension itself.
      await shortcuts.evaluate((extensionId) => new Promise((resolve, reject) => {
        chrome.developerPrivate.updateExtensionCommand({
          extensionId, commandName: "close-tab-safely", keybinding: "Ctrl+D"
        }, () => chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve());
      }), extensionId);
      await shortcuts.close();
    }
    const assigned = await worker.evaluate(() => chrome.commands.getAll());
    assert.equal(assigned.find((command) => command.name === "close-tab-safely")?.shortcut, "Ctrl+D");
    console.log("Chrome-compatible browser registered Ctrl+D for protected close.");

    const tabs = await worker.evaluate(async () => {
      const left = await chrome.tabs.create({ url: "https://shortcut-test.invalid/left", active: false });
      const current = await chrome.tabs.create({ url: "https://shortcut-test.invalid/current", active: true });
      const right = await chrome.tabs.create({ url: "https://shortcut-test.invalid/right", active: false });
      return { left, current, right };
    });
    const profile = { id: "test-profile", name: "Test Profile", promptResumes: [], selectedPromptResumeId: "" };
    const setProfiles = (profiles) => worker.evaluate(({ profiles, selectionVersion }) => chrome.storage.local.set({
      profileSelection: { profiles, selectedProfileId: profiles[0].id, selectedProfileIds: [], selectionVersion },
      sheetConfig: { aiProviderId: "none" }
    }), { profiles, selectionVersion });
    await setProfiles([profile]);
    const seedSelection = (ids) => worker.evaluate(({ tabId, ids }) => chrome.storage.session.set({
      tabSessionById: { tabStates: { [tabId]: { manualSelectedProfileIds: ids } } }
    }), { tabId: tabs.current.id, ids });
    await seedSelection([profile.id]);
    const contexts = () => worker.evaluate(() => chrome.runtime.getContexts({ contextTypes: ["SIDE_PANEL"] }));
    const readState = () => worker.evaluate((tabId) => chrome.runtime.sendMessage({
      type: "GET_PROTECTED_CLOSE_STATE", tabId
    }).catch(() => null), tabs.current.id);
    const openPanel = async () => {
      const helper = await context.newPage();
      await helper.goto(`chrome-extension://${extensionId}/sidepanel/sidepanel.html`);
      await helper.evaluate(() => {
        const button = document.createElement("button");
        button.id = "test-open-sidepanel";
        button.textContent = "Open test panel";
        button.style.cssText = "position:fixed;top:0;left:0;z-index:2147483647";
        button.addEventListener("click", async () => {
          const currentWindow = await chrome.windows.getCurrent();
          await chrome.sidePanel.open({ windowId: currentWindow.id });
        });
        document.body.appendChild(button);
      });
      await helper.locator("#test-open-sidepanel").click();
      await until(contexts, (items) => items.length > 0, "open real side panel");
      await helper.close();
      await worker.evaluate((tabId) => chrome.tabs.update(tabId, { active: true }), tabs.current.id);
      await until(readState, (state) => state?.ready && state.open, "panel ready for target tab");
    };
    const closePanel = async () => {
      await worker.evaluate((windowId) => chrome.sidePanel.close({ windowId }), tabs.current.windowId);
      await until(contexts, (items) => items.length === 0, "close real side panel");
    };
    const runClose = () => worker.evaluate((tab) => closeCurrentTabFromShortcut(tab), tabs.current);
    await openPanel();
    assert.deepEqual((await readState()).selectedProfileIds, [profile.id]);
    assert.equal((await runClose()).closed, false);
    await worker.evaluate((id) => chrome.tabs.get(id), tabs.current.id);
    console.log("A checked profile keeps the current tab open.");

    await closePanel();
    assert.equal((await runClose()).closed, false);
    console.log("A closed side panel never authorizes closing.");
    await seedSelection([]);
    await openPanel();
    await until(readState, (state) => state?.selectedProfileIds.length === 0, "empty manual selection");
    await setProfiles([{ ...profile, promptResumes: [{ id: "auto-resume", label: "Auto", content: "Test resume", autoSelect: true }], selectedPromptResumeId: "auto-resume" }]);
    await until(readState, (state) => state?.selectedProfileIds.includes(profile.id), "Auto selection");
    assert.equal((await runClose()).closed, false);
    console.log("An Auto-selected profile also keeps the tab open.");
    await setProfiles([profile]);
    await until(readState, (state) => state?.ready && state.selectedProfileIds.length === 0, "Auto disabled");

    for (const status of ["saving", "failed"]) {
      await worker.evaluate(({ tabId, status }) => saveTitleStatusByTabId.set(tabId, { state: status }), { tabId: tabs.current.id, status });
      assert.equal((await runClose()).closed, false);
    }
    console.log("Saving and failed tabs stay protected with no selected profiles.");
    await worker.evaluate((tabId) => saveTitleStatusByTabId.delete(tabId), tabs.current.id);
    assert.equal((await runClose()).closed, true);
    await until(
      () => worker.evaluate((windowId) => chrome.tabs.query({ windowId, active: true }), tabs.current.windowId),
      (active) => active[0]?.id === tabs.left.id,
      "left tab activated after successful close"
    );
    console.log("No profiles selected: tab closes and focus moves immediately left.");
  } finally {
    await context.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
