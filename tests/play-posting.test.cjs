const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const panel = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");
const chatgpt = fs.readFileSync(path.join(root, "content/chatgpt.js"), "utf8");

function load(source, names, context) {
  for (const name of names) {
    const match = source.match(
      new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m")
    );
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function fixture({ aiUrl = "https://chatgpt.com/c/current", afterQuery } = {}) {
  const tabs = [
    { id: 1, windowId: 9, index: 3, groupId: 44, url: aiUrl },
    { id: 2, windowId: 9, index: 1, groupId: -1, url: "https://jobs.example/first" },
    { id: 3, windowId: 9, index: 6, groupId: -1, url: "https://jobs.example/last" },
    { id: 4, windowId: 9, index: 8, groupId: 55, url: "https://jobs.example/grouped" },
    { id: 5, windowId: 9, index: 9, groupId: -1, pinned: true, url: "https://jobs.example/pinned" },
    { id: 6, windowId: 10, index: 12, groupId: -1, url: "https://jobs.example/other-window" }
  ];
  const calls = { grouped: [], sent: [], focused: [], remembered: [], queries: [], numbered: [] };
  const context = vm.createContext({
    URL,
    console,
    getRunOwnerTabId: () => 1,
    isPinnedTabSupportedUrl: () => false,
    isGoogleSheetsDocumentUrl: () => false,
    isJobrightRecommendationsUrl: () => false,
    getAiProviderConfig: (id) => ({ id, label: id, promptSettleDelayMs: { min: 0, max: 0 } }),
    getCheckPostingConfig: () => assert.fail("Play must target the clicked chat, regardless of settings."),
    rememberCheckPostingJob: async (tabId, job) => calls.remembered.push({ tabId, ...job }),
    markPostingSubmission: async (tabId, jobUrl) => {
      calls.numbered.push({ tabId, jobUrl });
      return calls.numbered.length;
    },
    arrangeAndGroupJobWithAiTab: async (jobTabId, aiTabId) => {
      calls.grouped.push({ jobTabId, aiTabId });
      tabs.find((tab) => tab.id === jobTabId).groupId = 44;
    },
    waitForTabToMatchUrl: async (tabId, matches) => {
      assert.equal(matches(tabs.find((tab) => tab.id === tabId).url), true);
    },
    randomDelayMs: () => 0,
    sendLog() {},
    focusBrowserTab: async (tabId) => calls.focused.push(tabId),
    sendFillAndSendToTab: async (tabId, text, runId, options) => {
      calls.sent.push({ tabId, text, runId, options });
      return { submitted: true };
    },
    chrome: { tabs: {
      get: async (id) => {
        const tab = tabs.find((entry) => entry.id === id);
        if (!tab) throw new Error("Tab closed.");
        return { ...tab };
      },
      query: async (query) => {
        calls.queries.push(query);
        const result = tabs.filter((tab) => tab.windowId === query.windowId).map((tab) => ({ ...tab }));
        afterQuery?.(tabs);
        return result;
      },
      create: () => assert.fail("Play must reuse the clicked AI chat.")
    } }
  });
  load(worker, [
    "isTabInGroup", "isCopilotChatUrl", "isCheckPostingAiUrl", "getPostingAiProviderId",
    "assertActiveJobTabUsable", "selectRightmostUngroupedPostingTab",
    "playRightmostPostingToAi", "sendPlayPostingTabToAi", "sendCheckPostingToCopilot"
  ], context);
  return { context, tabs, calls };
}

test("Play takes the highest-index eligible tab in the clicked chat's window", async () => {
  const { context, calls } = fixture();
  const result = await context.playRightmostPostingToAi("play-run", { ownerTabId: 1 });
  assert.equal(result.jobUrl, "https://jobs.example/last");
  assert.equal(result.tabId, 1);
  assert.equal(result.submissionNumber, null);
  assert.deepEqual(calls.numbered, []);
  assert.deepEqual(calls.grouped, [{ jobTabId: 3, aiTabId: 1 }]);
  assert.equal(calls.sent[0].text, "https://jobs.example/last");
  assert.equal(calls.sent[0].tabId, 1);
  assert.equal(calls.sent[0].options.aiProviderId, "chatgpt");
  assert.equal(calls.sent[0].options.submitOnlyWhenIdle, true);
  assert.deepEqual(calls.focused, [1, 1]);
  assert.equal(calls.remembered[0].tabId, 3);
  assert.equal(calls.queries[0].windowId, 9);
});

test("each Play picks the next rightmost ungrouped tab and stops when none remain", async () => {
  const { context, calls } = fixture();
  await context.playRightmostPostingToAi("one", { ownerTabId: 1 });
  await context.playRightmostPostingToAi("two", { ownerTabId: 1 });
  await assert.rejects(context.playRightmostPostingToAi("three", { ownerTabId: 1 }), /No other ungrouped, unpinned tab/);
  assert.deepEqual(calls.sent.map((call) => call.text), [
    "https://jobs.example/last", "https://jobs.example/first"
  ]);
  assert.deepEqual(calls.numbered, []);
});

test("Play excludes the initiating chat even when it is ungrouped and rightmost", async () => {
  const { context, tabs, calls } = fixture();
  tabs[0].groupId = -1;
  tabs[0].index = 20;
  await context.playRightmostPostingToAi("play", { ownerTabId: 1 });
  assert.equal(calls.sent[0].text, "https://jobs.example/last");
});

test("Play uses the current supported provider without opening another chat", async () => {
  for (const [provider, aiUrl] of [
    ["chatgpt", "https://chat.openai.com/c/current"],
    ["copilot", "https://copilot.microsoft.com/chats/current"],
    ["perplexity", "https://www.perplexity.ai/search/current"],
    ["deepseek", "https://chat.deepseek.com/a/chat/s/current"]
  ]) {
    const { context, calls } = fixture({ aiUrl });
    await context.playRightmostPostingToAi("play", { ownerTabId: 1 });
    assert.equal(calls.sent[0].options.aiProviderId, provider);
    assert.equal(calls.sent[0].tabId, 1);
  }
});

test("Play rejects a job page, a pinned chat, and a closed initiating tab", async () => {
  for (const state of ["job", "pinned", "closed"]) {
    const { context, tabs, calls } = fixture();
    if (state === "job") tabs[0].url = "https://jobs.example/42";
    if (state === "pinned") tabs[0].pinned = true;
    if (state === "closed") tabs.shift();
    await assert.rejects(context.playRightmostPostingToAi("play", { ownerTabId: 1 }), /unpinned AI chat|no longer open/);
    assert.equal(calls.grouped.length, 0);
    assert.equal(calls.sent.length, 0);
  }
});

test("Play rechecks a source that becomes grouped, pinned, or closed after selection", async () => {
  for (const state of ["grouped", "pinned", "closed"]) {
    const { context, calls } = fixture({ afterQuery: (tabs) => {
      const job = tabs.find((tab) => tab.id === 3);
      if (state === "grouped") job.groupId = 55;
      if (state === "pinned") job.pinned = true;
      if (state === "closed") tabs.splice(tabs.indexOf(job), 1);
    } });
    await assert.rejects(context.playRightmostPostingToAi("play", { ownerTabId: 1 }));
    assert.equal(calls.grouped.length, 0);
    assert.equal(calls.sent.length, 0);
  }
});

test("Play reports a busy chat's fill-only result", async () => {
  const { context, calls } = fixture();
  context.sendFillAndSendToTab = async () => ({ submitted: false, reason: "chat-running" });
  const result = await context.playRightmostPostingToAi("play", { ownerTabId: 1 });
  assert.equal(result.submitted, false);
  assert.equal(result.submissionNumber, null);
  assert.equal(calls.numbered.length, 0);
});

test("a failed submission does not number the job tab", async () => {
  const { context, calls } = fixture();
  context.sendFillAndSendToTab = async () => { throw new Error("Send failed"); };
  await assert.rejects(context.playRightmostPostingToAi("play", { ownerTabId: 1 }), /Send failed/);
  assert.equal(calls.numbered.length, 0);
});

test("the panel sends without permission prompts, enables Play for supported chats, and blocks repeated clicks", async () => {
  const button = { disabled: false, setAttribute() {}, querySelector: () => null };
  let finish;
  const calls = [];
  const context = vm.createContext({
    URL, console, playButton: button, activeTabId: 1,
    areActionButtonsDisabled: false, isCheckPostingRunning: false,
    isCurrentTabPlayAiChat: true,
    playPostingBatchState: null,
    beginRunForTab: (ownerTabId) => ({ ownerTabId, runId: "play" }),
    updateCheckPostingButtonDisabledState: () => context.updatePlayButtonDisabledState(),
    addLog() {}, showStatus() {},
    chrome: { permissions: {
      request: () => assert.fail("Play must not request site access.")
    }, runtime: { sendMessage: (message) => {
      calls.push(message);
      return new Promise((resolve) => { finish = resolve; });
    } } }
  });
  load(panel, ["isPlayAiChatUrl", "updatePlayButtonDisabledState", "playRightmostPosting"], context);
  const { context: workerContext } = fixture();
  for (const url of [
    "https://chatgpt.com/", "https://chat.openai.com/c/current",
    "https://chat.deepseek.com/", "https://www.perplexity.ai/search/current",
    "https://copilot.microsoft.com/chats/current", "https://jobs.example/42",
    "https://copilot.microsoft.com/", "http://chatgpt.com/", "invalid"
  ]) {
    assert.equal(context.isPlayAiChatUrl(url), Boolean(workerContext.getPostingAiProviderId(url)), url);
  }
  const running = context.playRightmostPosting();
  context.activeTabId = 99;
  await context.playRightmostPosting();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, "PLAY_RIGHTMOST_POSTING_TO_AI");
  assert.equal(calls[0].ownerTabId, 1);
  assert.equal(button.disabled, true);
  finish({ ok: true });
  await running;
  assert.equal(button.disabled, false);
  context.isCurrentTabPlayAiChat = false;
  context.updatePlayButtonDisabledState();
  assert.equal(button.disabled, true);
  context.isCurrentTabPlayAiChat = true;
  context.areActionButtonsDisabled = true;
  context.updatePlayButtonDisabledState();
  assert.equal(button.disabled, true);
});

test("ChatGPT submits an idle prompt and leaves a responding chat's URL unsent", async () => {
  for (const state of ["idle", "running", "starts-running"]) {
    let running = state === "running";
    let clicked = 0;
    let filled = "";
    const context = vm.createContext({
      findChatGptInput: () => ({}),
      fillChatGptInput: (_input, text) => { filled = text; },
      findSendButton: () => ({ disabled: false, click: () => { clicked += 1; } }),
      randomDelayMs: () => 0, CHATGPT_BEFORE_SEND_MS: { min: 0, max: 0 },
      sleep: async () => { running = state === "starts-running"; },
      document: { querySelector: () => running ? {} : null }
    });
    load(chatgpt, ["isAiChatRunning", "fillAndSend"], context);
    const result = await context.fillAndSend("https://jobs.example/42", { submitOnlyWhenIdle: true });
    assert.equal(filled, "https://jobs.example/42");
    assert.equal(result.submitted, state === "idle");
    assert.equal(clicked, state === "idle" ? 1 : 0);
  }
});

function batchFixture(tabCount = 1) {
  const base = fixture();
  const { context, calls } = base;
  let now = 1000000;
  let session = {};
  let local = { checkPostingConfig: { playTabCount: tabCount } };
  const alarms = new Map();
  calls.logs = [];
  calls.alarms = [];
  Object.assign(context, {
    PLAY_POSTING_BATCH_STORAGE_KEY: "playPostingBatch",
    PLAY_POSTING_ALARM_NAME: "play-posting-batch",
    CHECK_POSTING_CONFIG_STORAGE_KEY: "checkPostingConfig",
    CHECK_POSTING_COPILOT_URL: "https://copilot.microsoft.com/chats/default",
    playPostingBatchUpdateQueue: Promise.resolve(),
    playPostingBatchStarting: false,
    playPostingBatchStepRunning: false,
    Date: { now: () => now },
    Math: Object.assign(Object.create(Math), { random: () => 0 }),
    registerRunOwnerTab() {}, releaseRunOwnerTab() {},
    sendLog: async (_run, level, message) => calls.logs.push({ level, message })
  });
  context.chrome.storage = {
    session: {
      get: async () => structuredClone(session),
      set: async (values) => { Object.assign(session, structuredClone(values)); }
    },
    local: {
      get: async () => structuredClone(local),
      set: async (values) => { Object.assign(local, structuredClone(values)); }
    }
  };
  context.chrome.alarms = {
    clear: async (name) => alarms.delete(name),
    create: async (name, options) => {
      alarms.set(name, options);
      calls.alarms.push(options);
    }
  };
  load(worker, [
    "checkPostingAiDefaults", "checkPostingAiLabel", "normalizeCheckPostingProviderId", "normalizeCheckPostingAiUrl",
    "getCheckPostingConfig", "saveCheckPostingConfig", "randomDelayMs",
    "getPlayPostingBatchState", "updatePlayPostingBatchState", "finishPlayPostingBatch",
    "cancelPlayPostingBatch", "startPlayPostingBatch", "runPlayPostingBatchStep",
    "restorePlayPostingBatch"
  ], context);
  return { ...base, alarms,
    state: () => session.playPostingBatch,
    advance: () => { now = session.playPostingBatch.nextRunAt; },
    setSession: (state) => { session.playPostingBatch = structuredClone(state); },
    setConfig: (config) => { local.checkPostingConfig = config; }
  };
}

test("Play count defaults to 1, persists a whole-number selection, and rejects invalid counts", async () => {
  const { context, setConfig } = batchFixture();
  for (const count of [undefined, 0, -1, 1.5, "3", Number.MAX_SAFE_INTEGER + 1]) {
    setConfig({ playTabCount: count });
    assert.equal((await context.getCheckPostingConfig()).playTabCount, 1);
  }
  await context.saveCheckPostingConfig("copilot", {}, false, 3);
  assert.equal((await context.getCheckPostingConfig()).playTabCount, 3);
  for (const count of [0, -1, 1.5, "3", NaN]) {
    await assert.rejects(context.saveCheckPostingConfig("copilot", {}, false, count), /whole number/);
  }
  assert.equal((await context.getCheckPostingConfig()).playTabCount, 3);
});

test("a default single-tab Play sends immediately without numbering or an alarm", async () => {
  const { context, calls, state, alarms } = batchFixture();
  const result = await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  assert.equal(result.submitted, true);
  assert.equal(result.completedCount, 1);
  assert.equal(result.active, false);
  assert.equal(calls.sent.length, 1);
  assert.equal(result.submissionNumber, null);
  assert.deepEqual(calls.numbered, []);
  assert.equal(state(), null);
  assert.equal(alarms.size, 0);
});

test("a batch sends rightmost jobs one by one, with random 60–90 second alarms", async () => {
  const { context, calls, state, advance, alarms } = batchFixture(2);
  await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  assert.equal(calls.sent.length, 1);
  assert.deepEqual(calls.numbered, [{ tabId: 3, jobUrl: "https://jobs.example/last" }]);
  assert.equal(state().completedCount, 1);
  assert.equal(state().nextRunAt, 1060000);
  await context.runPlayPostingBatchStep(); // An early alarm cannot submit the next URL.
  assert.equal(calls.sent.length, 1);
  await assert.rejects(context.startPlayPostingBatch("another", { ownerTabId: 1 }), /already running/);
  advance();
  await context.runPlayPostingBatchStep();
  assert.deepEqual(calls.sent.map((call) => call.text), [
    "https://jobs.example/last", "https://jobs.example/first"
  ]);
  assert.deepEqual(calls.numbered.map((call) => call.tabId), [3, 2]);
  assert.equal(state(), null);
  assert.equal(alarms.size, 0);

  const maximum = batchFixture(2);
  maximum.context.Math.random = () => 0.999999;
  await maximum.context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  assert.equal(maximum.state().nextRunAt, 1090000);
});

test("a busy chat retries the same grouped job and counts only successful submissions", async () => {
  const { context, calls, state, advance } = batchFixture(2);
  let busy = true;
  context.sendFillAndSendToTab = async (tabId, text) => {
    calls.sent.push({ tabId, text });
    return { submitted: !busy };
  };
  await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  assert.equal(state().completedCount, 0);
  assert.equal(state().pendingJob.id, 3);
  assert.equal(calls.numbered.length, 0);
  advance();
  busy = false;
  await context.runPlayPostingBatchStep();
  assert.equal(calls.sent[1].text, calls.sent[0].text);
  assert.equal(state().completedCount, 1);
  assert.equal(state().pendingJob, null);
  advance();
  await context.runPlayPostingBatchStep();
  assert.equal(calls.sent[2].text, "https://jobs.example/first");
  assert.equal(calls.numbered.length, 2);
  assert.equal(state(), null);
});

test("Stop cancels pending alarms and only the owning AI tab may stop a batch", async () => {
  const { context, state, alarms, calls } = batchFixture(2);
  await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  await assert.rejects(context.cancelPlayPostingBatch("stop", { ownerTabId: 9 }), /tab that started it/);
  assert.equal(state().completedCount, 1);
  await context.cancelPlayPostingBatch("stop", { ownerTabId: 1 });
  assert.equal(state(), null);
  assert.equal(alarms.size, 0);
  await context.runPlayPostingBatchStep();
  assert.equal(calls.sent.length, 1);
});

test("stopping an in-flight submission cannot restart the remaining batch", async () => {
  const { context, state, alarms, calls } = batchFixture(2);
  let complete;
  context.sendFillAndSendToTab = () => new Promise((resolve) => { complete = resolve; });
  const running = context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  while (!complete) await new Promise((resolve) => setImmediate(resolve));
  await context.cancelPlayPostingBatch("stop", { ownerTabId: 1 });
  complete({ submitted: true });
  await running;
  assert.equal(state(), null);
  assert.equal(alarms.size, 0);
  assert.equal(calls.numbered.length, 1);
});

test("a restored worker recreates a waiting alarm and stops an uncertain interrupted send", async () => {
  const { context, state, alarms, calls, setSession } = batchFixture(2);
  await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  alarms.clear();
  await context.restorePlayPostingBatch();
  assert.equal(alarms.get("play-posting-batch").when, state().nextRunAt);
  assert.equal(calls.sent.length, 1);
  setSession({ ...state(), phase: "sending" });
  await context.restorePlayPostingBatch();
  assert.equal(state(), null);
  assert.equal(alarms.size, 0);
  assert.equal(calls.sent.length, 1);
  assert.match(calls.logs.at(-1).message, /interrupted a submission/);
});

test("Play stops safely when the chat changes, a pending job changes, or sending fails", async () => {
  for (const scenario of ["chat", "job", "send"]) {
    const { context, state, alarms, tabs, advance, calls } = batchFixture(2);
    if (scenario === "job") context.sendFillAndSendToTab = async () => ({ submitted: false });
    await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
    advance();
    if (scenario === "chat") tabs[0].url = "https://chatgpt.com/c/different";
    if (scenario === "job") tabs[2].url = "https://jobs.example/changed";
    if (scenario === "send") context.sendFillAndSendToTab = async () => { throw new Error("Send failed"); };
    await assert.rejects(context.runPlayPostingBatchStep());
    assert.equal(state(), null, scenario);
    assert.equal(alarms.size, 0, scenario);
    assert.match(calls.logs.at(-1).message, /Play stopped:/);
  }
});

test("Play adopts a new conversation created by its first submission and finishes when jobs run out", async () => {
  const { context, state, tabs, advance, calls } = batchFixture(3);
  tabs[0].url = "https://chatgpt.com/";
  await context.startPlayPostingBatch("batch", { ownerTabId: 1 });
  tabs[0].url = "https://chatgpt.com/c/created";
  advance();
  await context.runPlayPostingBatchStep();
  assert.equal(state().aiUrl, tabs[0].url);
  advance();
  const result = await context.runPlayPostingBatchStep();
  assert.equal(result.completedCount, 2);
  assert.equal(calls.sent.length, 2);
  assert.equal(state(), null);
  assert.match(calls.logs.at(-1).message, /no other ungrouped, unpinned tabs remain/);
});

test("the Play button becomes Stop on its owning chat and is disabled in another chat", async () => {
  const attributes = {};
  const button = { setAttribute: (key, value) => { attributes[key] = value; },
    querySelector: () => ({ setAttribute: (key, value) => { attributes[key] = value; } }) };
  const messages = [];
  const context = vm.createContext({
    console, playButton: button, activeTabId: 1, areActionButtonsDisabled: true,
    isCheckPostingRunning: false, isCurrentTabPlayAiChat: true,
    playPostingBatchState: { ownerTabId: 1, completedCount: 2, tabCount: 5 },
    updateCheckPostingButtonDisabledState: () => context.updatePlayButtonDisabledState(),
    beginRunForTab: (ownerTabId) => ({ ownerTabId, runId: "stop" }),
    addLog() {}, showStatus() {},
    chrome: { runtime: { sendMessage: async (message) => { messages.push(message); return { ok: true }; } } }
  });
  load(panel, ["updatePlayButtonDisabledState", "playRightmostPosting"], context);
  context.updatePlayButtonDisabledState();
  assert.equal(button.disabled, false);
  assert.equal(attributes["aria-label"], "Stop Play");
  assert.match(button.title, /2\/5/);
  await context.playRightmostPosting();
  assert.equal(messages[0].type, "CANCEL_PLAY_POSTING_BATCH");
  context.activeTabId = 99;
  context.updatePlayButtonDisabledState();
  assert.equal(button.disabled, true);
});

test("the Play hotkey targets the shortcut's tab and ignores other panels", async () => {
  const messages = [];
  let command;
  const context = vm.createContext({
    console, Date,
    APP_ACTION_COMMANDS: { "play-posting": "play-posting" },
    getSidePanelStatus: async () => ({ open: true }),
    notifyExtensionPages: async (message) => messages.push(message),
    chrome: { commands: { onCommand: { addListener: (callback) => { command = callback; } } },
      tabs: { query: async () => [{ id: 11 }] } }
  });
  const listener = worker.match(/^chrome.commands.onCommand.addListener\([\s\S]*?^\}\);/m);
  vm.runInContext(listener[0], context);
  command("play-posting", { id: 7 });
  await new Promise(setImmediate);
  assert.equal(messages[0].ownerTabId, 7);
  command("play-posting");
  await new Promise(setImmediate);
  assert.equal(messages[1].ownerTabId, 11);

  const block = panel.match(/  if \(message.type === "HOTKEY_ACTION"\) \{[\s\S]*?\n    return;\r?\n  \}/);
  let starts = 0;
  context.activeTabId = 7;
  context.playRightmostPosting = () => { starts++; };
  vm.runInContext(`function handle(message) { ${block[0]} }`, context);
  context.handle({ type: "HOTKEY_ACTION", action: "play-posting", ownerTabId: 11 });
  assert.equal(starts, 0);
  context.handle({ type: "HOTKEY_ACTION", action: "play-posting", ownerTabId: 7 });
  assert.equal(starts, 1);
});
