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
function parser() {
  const context = vm.createContext({ URL, console });
  load(panel, ["normalizeSplitWindowUrl", "unwrapMarkdownEmphasis", "parseSplitWindowUrlField",
    "isSavedApplicationSheetHeader", "isGoogleDocsUrl", "isSupportedAiUrl", "parseSplitWindowUrls"], context);
  return text => JSON.parse(JSON.stringify(context.parseSplitWindowUrls(text).pairs));
}
const chat = "https://chatgpt.com/c/12345678-1234-1234-1234-123456789abc";
const job = "https://example.com/jobs/123";
const resume = "https://docs.google.com/document/d/resume_123/edit";

test("import accepts current Sheet headers, Markdown URLs, and seven columns", () => {
  const rows = parser()([
    "ISO timestamp\tJob-page title\tProfile name\tAI conversation URL\tNormalized job URL\tCopied resume Google Doc URL\tApply Now",
    `2026-10-04\tEngineer\t**Alice**\t[Chat](${chat})\t[Job](${job})\t[Resume](${resume})\t`
  ].join("\n"));
  assert.deepEqual(rows, [{ profileName: "Alice", jobTitle: "Engineer", chatUrl: chat, jobUrl: job, resumeUrl: resume }]);
});
test("import supports six columns without an AI conversation and four legacy fields", () => {
  const parse = parser();
  for (const ai of ["", "No Model"]) assert.equal(parse(`date\tEngineer\tAlice\t${ai}\t${job}\t${resume}`)[0].chatUrl, "");
  assert.deepEqual(parse(`Alice\t${chat}\t${job}\t${resume}`)[0], {
    profileName: "Alice", jobTitle: "", chatUrl: chat, jobUrl: job, resumeUrl: resume
  });
});
test("import rejects malformed rows, executable URL schemes, and misplaced document URLs", () => {
  const parse = parser();
  assert.throws(() => parse("Alice\tbroken"), /tab-separated/);
  assert.throws(() => parse(`Alice\t${chat}\tjavascript:alert(1)\t${resume}`), /http/);
  assert.throws(() => parse(`Alice\t${chat}\t${resume}\t${resume}`), /job page URL/);
  assert.throws(() => parse(`Alice\t${chat}\t${job}\t${job}`), /Google Docs/);
});

function background() {
  const listeners = {};
  const events = new Proxy({}, { get: (_target, name) => ({ addListener(fn) { listeners[name] = fn; } }) });
  const calls = [];
  const context = vm.createContext({ console, URL, Set, Map, crypto: require("node:crypto").webcrypto,
    setTimeout, clearTimeout,
    chrome: {
      runtime: { id: "test-extension", onInstalled: events.onInstalled, onStartup: events.onStartup,
        onMessage: events.onMessage, sendMessage: async message => calls.push(message) },
      commands: { onCommand: events.onCommand },
      tabs: { onCreated: events.onCreated, onActivated: events.onActivated, onUpdated: events.onUpdated,
        onRemoved: events.onRemoved, query: async () => [], get: async () => ({ id: 1 }) },
      sidePanel: { setPanelBehavior: async () => {}, setOptions: async () => {}, getOptions: async () => ({ enabled: true }) },
      storage: { session: { get: async () => ({}), set: async () => {} } }
    }
  });
  vm.runInContext(worker, context);
  return { listeners, calls, context };
}
test("removed workflows cannot be invoked by stale messages or shortcuts", async () => {
  const { listeners, calls } = background();
  const removed = ["SAVE_CURRENT_TAB_URL_TO_SHEET", "GET_PROFILE_SELECTION", "SAVE_PROFILE_SELECTION",
    "GET_PROMPT_SELECTION", "SAVE_PROMPT_SELECTION", "SAVE_JOB_DESCRIPTION_SELECTION", "GET_JOB_DESCRIPTION_SELECTION",
    "GET_SHEET_CONFIG", "SAVE_SHEET_CONFIG", "REMOVE_DUPLICATE_URLS_FROM_SHEET", "DELETE_APPLICATION_RECORD",
    "CHECK_POSTING_TO_COPILOT", "PLAY_RIGHTMOST_POSTING_TO_AI", "CANCEL_PLAY_POSTING_BATCH",
    "MAKE_OR_OPEN_CHECK_POSTING_AI_TAB", "IMPORT_APP_DATA", "EXPORT_APP_DATA", "CREATE_GOOGLE_DOC"];
  for (const type of removed) {
    let replied = false;
    assert.notEqual(listeners.onMessage({ type }, { id: "test-extension" }, () => { replied = true; }), true);
    assert.equal(replied, false, type);
  }
  for (const command of ["save-app", "close-tab-safely", "open-jobright", "check-posting", "play-posting"])
    await listeners.onCommand(command, { id: 1 });
  assert.deepEqual(calls, []);
});
test("remaining commands reach the panel with their originating tab", async () => {
  const { listeners, calls } = background();
  await listeners.onCommand("make-resume", { id: 21 });
  await listeners.onCommand("download-resume", { id: 22 });
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    { type: "APP_ACTION_COMMAND", action: "make-resume", ownerTabId: 21 },
    { type: "APP_ACTION_COMMAND", action: "download-resume", ownerTabId: 22 }
  ]);
});
test("manifest excludes capabilities and resources used by removed features", () => {
  assert.deepEqual(Object.keys(manifest.commands).sort(), ["download-resume", "make-resume"]);
  assert.deepEqual(manifest.oauth2.scopes, ["https://www.googleapis.com/auth/documents"]);
  assert.ok(!manifest.permissions.includes("tabGroups") && !manifest.permissions.includes("alarms"));
  assert.equal(manifest.optional_host_permissions, undefined);
  assert.equal(manifest.web_accessible_resources, undefined);
  assert.ok(manifest.host_permissions.every(host => !/jobright|copilot|perplexity|sheets\.googleapis/.test(host)));
  for (const script of manifest.content_scripts) for (const file of script.js) assert.ok(fs.existsSync(path.join(root, file)));
});
test("PDF downloads target the paired document and use the imported name", async () => {
  const downloads = [];
  const context = vm.createContext({ URL, sendLog() {}, chrome: { downloads: { download: async options => { downloads.push(options); return 3; } } } });
  load(worker, ["parseGoogleDocId", "isGoogleDocsDocumentUrl", "sanitizeDownloadFilename", "buildResumeDownloadTitle", "downloadGoogleDocUrlAsPdf"], context);
  const result = await context.downloadGoogleDocUrlAsPdf("run", { documentUrl: resume, profileName: "Alice Example" });
  assert.equal(result.filename, "Alice_Example_Resume.pdf");
  assert.equal(downloads[0].url, "https://docs.google.com/document/d/resume_123/export?format=pdf");
  await assert.rejects(context.downloadGoogleDocUrlAsPdf("run", { documentUrl: job }), /not a Google Docs/);
});
test("document updates reject an unrelated web URL before authorization", async () => {
  let authorized = false;
  const context = vm.createContext({ URL, sendLog() {}, getGoogleAccessToken: async () => { authorized = true; } });
  load(worker, ["parseGoogleDocId", "isGoogleDocsDocumentUrl", "updateWorkspaceResumeContext"], context);
  await assert.rejects(context.updateWorkspaceResumeContext("run", { resumeUrl: job, resumeText: "Resume text" }), /not a Google Docs/);
  assert.equal(authorized, false);
});
