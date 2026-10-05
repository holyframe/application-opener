// Isolated browser verification: NODE_PATH must expose Playwright.
// Optional first argument is a screenshot directory. No real accounts are used.
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const outputDir = process.argv[2];

function installChrome(snapshot = {}) {
  function event() {
    const listeners = new Set();
    return { addListener(fn) { listeners.add(fn); }, removeListener(fn) { listeners.delete(fn); },
      async emit(...args) { await Promise.all([...listeners].map(fn => fn(...args))); } };
  }
  window.__qaTabs = snapshot.tabs || [
    { id: 1, windowId: 7, index: 0, active: true, url: "https://example.com/job" },
    { id: 2, windowId: 7, index: 1, active: false, url: "https://docs.google.com/spreadsheets/d/qa-sheet/edit" }
  ];
  window.__qaStorage = snapshot.storage || {};
  window.__qaMessages = [];
  window.__qaWindows = [];
  window.__qaClipboard = "";
  Object.defineProperty(navigator, "clipboard", { value: { async writeText(value) { window.__qaClipboard = value; } } });
  let nextTabId = 10;
  function storageArea() {
    return {
      async get(keys) { return Object.fromEntries((Array.isArray(keys) ? keys : [keys]).filter(key => key in window.__qaStorage).map(key => [key, structuredClone(window.__qaStorage[key])])); },
      async set(values) { Object.assign(window.__qaStorage, structuredClone(values)); }
    };
  }
  window.chrome = {
    runtime: { onMessage: event(),
      async sendMessage(message) {
        window.__qaMessages.push(message);
        if (message.type === "CHECK_GOOGLE_SHEET_OPEN") return { ok: true, open: /spreadsheets/.test(window.__qaTabs.find(tab => tab.active)?.url) };
        if (message.type === "OPEN_URL_IN_NEW_TAB") {
          window.__qaTabs.forEach(tab => { tab.active = false; });
          const tab = { id: nextTabId++, windowId: 7, index: window.__qaTabs.length, active: true, url: message.url };
          window.__qaTabs.push(tab);
          await chrome.tabs.onCreated.emit(tab);
          await chrome.tabs.onActivated.emit({ tabId: tab.id, windowId: 7 });
          return { ok: true, tabId: tab.id, windowId: 7, returnTabId: 2 };
        }
        if (message.type === "OPEN_URL_IN_RIGHT_WINDOW") {
          const existing = window.__qaWindows.find(win => win.tabs[0].url === message.url);
          if (existing) return { ok: true, windowId: existing.id, tabId: existing.tabs[0].id, reused: true };
          const win = { id: 80 + window.__qaWindows.length, tabs: [{ id: 100 + window.__qaWindows.length, url: message.url }] };
          window.__qaWindows.push(win);
          return { ok: true, windowId: win.id, tabId: win.tabs[0].id };
        }
        if (message.type === "DOWNLOAD_RESUME_PDF") return { ok: true, filename: message.profileName + "_Resume.pdf" };
        if (message.type === "SEND_TEXT_TO_AI_TAB") return { ok: true };
        if (message.type === "CLOSE_PICKUP_WINDOW") {
          window.__qaWindows = window.__qaWindows.filter(win => win.id !== message.windowId);
          await chrome.windows.onRemoved.emit(message.windowId);
          return { ok: true, closed: true };
        }
        if (message.type === "READ_GOOGLE_DOC_TEXT") return { ok: true, text: "Imported document text" };
        throw new Error("Unexpected runtime request: " + message.type);
      }
    },
    tabs: {
      async query(options = {}) {
        return window.__qaTabs.filter(tab => (!options.active || tab.active) && (options.windowId === undefined || tab.windowId === options.windowId)).map(tab => ({ ...tab }));
      },
      async get(id) { const tab = window.__qaTabs.find(tab => tab.id === id); if (!tab) throw new Error("Closed tab"); return { ...tab }; },
      async update(id, changes) {
        const tab = window.__qaTabs.find(tab => tab.id === id);
        if (changes.active) window.__qaTabs.forEach(item => { item.active = false; });
        Object.assign(tab, changes);
        if (changes.active) await chrome.tabs.onActivated.emit({ tabId: id, windowId: tab.windowId });
        return { ...tab };
      },
      async create(options) { return { id: 999, ...options }; },
      onActivated: event(), onRemoved: event(), onUpdated: event(), onCreated: event(), onMoved: event(), onAttached: event(), onDetached: event()
    },
    windows: { async getCurrent() { return { id: 7 }; }, async getAll() { return window.__qaWindows; }, onRemoved: event() },
    storage: { session: storageArea() },
    commands: { async getAll() { return [{ name: "download-resume", shortcut: "Ctrl+Shift+Y" }]; } }
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.argv[3] || "msedge" });
  try {
    async function openPanel(snapshot) {
      const context = await browser.newContext({ viewport: { width: 390, height: 680 }, reducedMotion: "reduce" });
      await context.route(/^https?:/, route => route.abort());
      await context.addInitScript(installChrome, snapshot || {});
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      await page.goto(pathToFileURL(path.join(root, "sidepanel/sidepanel.html")).href);
      await page.waitForFunction(() => typeof isReady !== "undefined" && isReady);
      return { context, page, errors };
    }
    const { page, errors } = await openPanel();
    assert.equal(await page.locator(".resume-actions-card button").count(), 1);
    assert.ok(await page.getByRole("button", { name: "Make a resume", exact: true }).isDisabled());
    assert.equal(await page.locator('.modal[aria-hidden="false"]').count(), 0);
    assert.equal(await page.locator('[id*="Profile"], [id*="profile"], [id*="jobDescription"], [id*="checkPosting"], [id*="playPosting"], [id*="AppData"]').count(), 0);
    if (outputDir) {
      fs.mkdirSync(outputDir, { recursive: true });
      await page.screenshot({ path: path.join(outputDir, "home.png") });
    }
    await page.evaluate(() => chrome.tabs.update(2, { active: true }));
    await page.getByRole("button", { name: "Make a resume", exact: true }).click();
    const chat = "https://chatgpt.com/c/12345678-1234-1234-1234-123456789abc";
    const aliceResume = "https://docs.google.com/document/d/alice-resume/edit";
    const bobResume = "https://docs.google.com/document/d/bob-resume/edit";
    await page.locator("#splitWindowUrlsInput").fill([
      `date\tEngineer\tAlice\t${chat}\thttps://example.com/job/alice\t${aliceResume}`,
      `date\tDesigner\tBob\tNo Model\thttps://example.com/job/bob\t${bobResume}`
    ].join("\n"));
    await page.locator("#splitWindowsModalOpenButton").click();
    await page.waitForFunction(() => workspacesByTabId.size === 2 && !getTabState().busy);
    await page.waitForFunction(() => document.querySelector("#splitWindowsModalTitle").textContent.includes("Bob"));
    assert.equal(await page.locator("#splitWindowsPreviewFrame").getAttribute("src"), bobResume);
    assert.ok(await page.locator("#applicationWorkspaceAiSend").isHidden());
    await page.getByRole("button", { name: "Download resume", exact: true }).click();
    await page.waitForFunction(() => window.__qaMessages.some(message => message.type === "DOWNLOAD_RESUME_PDF"));
    assert.equal(await page.evaluate(() => window.__qaMessages.find(message => message.type === "DOWNLOAD_RESUME_PDF").documentUrl), bobResume);
    await page.evaluate(() => chrome.tabs.update(10, { active: true }));
    assert.equal(await page.locator("#splitWindowsPreviewFrame").getAttribute("src"), aliceResume);
    assert.ok(await page.locator("#applicationWorkspaceAiSend").isVisible());
    await page.locator("#applicationWorkspaceAiSendInput").fill("Tailor this resume");
    await page.locator("#applicationWorkspaceAiSendButton").click();
    await page.waitForFunction(() => window.__qaMessages.some(message => message.type === "SEND_TEXT_TO_AI_TAB") && !getTabState().busy);
    const send = await page.evaluate(() => window.__qaMessages.find(message => message.type === "SEND_TEXT_TO_AI_TAB"));
    assert.equal(send.url, chat);
    assert.equal(send.text, "Tailor this resume");
    assert.equal(send.tabId, 100);
    assert.equal(await page.locator("#applicationWorkspaceAiSendInput").inputValue(), "");
    await page.locator("#applicationWorkspaceUrlInput").fill("https://docs.google.com/document/d/updated-resume/edit");
    await page.locator("#applicationWorkspaceUrlInput").press("Enter");
    await page.waitForFunction(() => workspacesByTabId.get(activeTabId).resumeUrl.includes("updated-resume"));
    await page.locator("#applicationWorkspaceCopyUrlButton").click();
    await page.waitForFunction(() => window.__qaClipboard.includes("updated-resume"));
    await page.locator("#resumeWorkspaceDownloadOptionsButton").click();
    await page.waitForFunction(() => document.querySelector("#downloadResumeHotkeyValue").textContent === "Ctrl+Shift+Y");
    await page.locator("#downloadResumeActionSettingsDoneButton").click();
    await page.setViewportSize({ width: 320, height: 640 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Workspace overflows at 320px");
    if (outputDir) await page.screenshot({ path: path.join(outputDir, "workspace.png") });
    await page.evaluate(() => persistSession());
    const snapshot = await page.evaluate(() => ({ tabs: window.__qaTabs, storage: window.__qaStorage }));
    const restored = await openPanel(snapshot);
    assert.equal(await restored.page.locator("#splitWindowsPreviewFrame").getAttribute("src"), "https://docs.google.com/document/d/updated-resume/edit");
    await restored.page.evaluate(async () => {
      window.__qaTabs = window.__qaTabs.filter(tab => tab.id !== 11);
      await chrome.tabs.onRemoved.emit(11, { windowId: 7, isWindowClosing: false });
    });
    assert.equal(await restored.page.evaluate(() => workspacesByTabId.has(11)), false);
    await restored.page.evaluate(async () => {
      window.__qaTabs = window.__qaTabs.filter(tab => tab.id !== 10);
      await chrome.tabs.onRemoved.emit(10, { windowId: 7, isWindowClosing: false });
    });
    await restored.page.waitForFunction(() => window.__qaMessages.some(message => message.type === "CLOSE_PICKUP_WINDOW" && message.windowId === 80));
    assert.equal(await restored.page.evaluate(() => workspacesByTabId.has(10)), false);
    assert.deepEqual(errors, []);
    assert.deepEqual(restored.errors, []);
    console.log("Browser checks passed: removed features are absent; batch import, tab restoration, PDF download, exact AI send, edited resume URL, clipboard, shortcuts, session restoration, and 320px layout work.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
