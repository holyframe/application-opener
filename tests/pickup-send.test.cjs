const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const panel = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");
const html = fs.readFileSync(path.join(root, "sidepanel/sidepanel.html"), "utf8");

function load(source, names, context) {
  for (const name of names) {
    const match = source.match(
      new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m")
    );
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
}

function fixture({
  providerId = "chatgpt",
  tabUrl = "https://chatgpt.com/c/12345678-1234-1234-1234-123456789abc",
  pendingUrl = ""
} = {}) {
  const calls = {
    connection: [],
    mode: [],
    sent: [],
    tabUpdates: [],
    windowUpdates: [],
    logs: []
  };
  const providers = {
    chatgpt: { id: "chatgpt", label: "ChatGPT" },
    deepseek: {
      id: "deepseek",
      label: "DeepSeek",
      requiredMode: "Expert",
      maxConnectionAttempts: 60
    }
  };
  const context = vm.createContext({
    console,
    getAiProviderConfig: () => providers[providerId],
    isAiConversationUrl: (url, id) =>
      id === "chatgpt"
        ? /^https:\/\/chatgpt\.com\/c\/[0-9a-f-]+\/?$/i.test(url)
        : /^https:\/\/chat\.deepseek\.com\/a\/chat\/s\/[a-z0-9_-]+\/?$/i.test(url),
    getUrlComparisonKey: (url) => String(url || "").replace(/\/$/, ""),
    waitForAiProviderConnection: async (tabId, runId, options) => {
      calls.connection.push({ tabId, runId, options });
    },
    ensureRequiredModeInTab: async (tabId, runId, options) => {
      calls.mode.push({ tabId, runId, options });
    },
    sendFillAndSendToTab: async (tabId, text, runId, options) => {
      calls.sent.push({ tabId, text, runId, options });
    },
    sendLog: (runId, level, message) => {
      calls.logs.push({ runId, level, message });
    },
    chrome: {
      tabs: {
        get: async (tabId) => ({ id: tabId, windowId: 88, url: tabUrl, pendingUrl }),
        update: async (tabId, options) => {
          calls.tabUpdates.push({ tabId, options });
          return { id: tabId, ...options };
        }
      },
      windows: {
        update: async (windowId, options) => {
          calls.windowUpdates.push({ windowId, options });
          return { id: windowId, ...options };
        }
      }
    }
  });

  load(worker, ["sendTextToPickedUpAiTab"], context);
  return { calls, context };
}

test("the Send action targets the exact picked-up tab ID", async () => {
  const url = "https://chatgpt.com/c/12345678-1234-1234-1234-123456789abc";
  const { calls, context } = fixture({ tabUrl: url });

  const result = await context.sendTextToPickedUpAiTab("send-run", {
    tabId: 42,
    url,
    text: "  tailor this resume  ",
    aiProviderId: "chatgpt"
  });

  assert.equal(result.tabId, 42);
  assert.equal(result.windowId, 88);
  assert.equal(calls.windowUpdates.length, 1);
  assert.equal(calls.windowUpdates[0].windowId, 88);
  assert.equal(calls.tabUpdates.length, 1);
  assert.equal(calls.tabUpdates[0].tabId, 42);
  assert.equal(calls.tabUpdates[0].options.active, true);
  assert.equal(calls.sent.length, 1);
  assert.equal(calls.sent[0].tabId, 42);
  assert.equal(calls.sent[0].text, "tailor this resume");
  assert.equal(calls.sent[0].options.aiProviderId, "chatgpt");
});

test("a newly opened picked-up tab may match through its pending URL", async () => {
  const url = "https://chatgpt.com/c/12345678-1234-1234-1234-123456789abc";
  const { calls, context } = fixture({
    tabUrl: "chrome://newtab/",
    pendingUrl: url
  });

  await context.sendTextToPickedUpAiTab("pending-run", {
    tabId: 43,
    url,
    text: "hello",
    aiProviderId: "chatgpt"
  });

  assert.equal(calls.sent.length, 1);
  assert.equal(calls.sent[0].tabId, 43);
});

test("the Send action refuses a different conversation in the same tab", async () => {
  const { calls, context } = fixture({
    tabUrl: "https://chatgpt.com/c/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  });

  await assert.rejects(
    context.sendTextToPickedUpAiTab("mismatch-run", {
      tabId: 44,
      url: "https://chatgpt.com/c/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      text: "do not misroute this",
      aiProviderId: "chatgpt"
    }),
    /no longer matches the saved ChatGPT conversation/
  );
  assert.equal(calls.sent.length, 0);
  assert.equal(calls.tabUpdates.length, 0);
});

test("DeepSeek sends to the picked-up tab without selecting a mode", async () => {
  const url = "https://chat.deepseek.com/a/chat/s/target_chat_123";
  const { calls, context } = fixture({ providerId: "deepseek", tabUrl: url });

  await context.sendTextToPickedUpAiTab("deepseek-run", {
    tabId: 45,
    url,
    text: "continue",
    aiProviderId: "deepseek"
  });

  assert.equal(calls.connection.length, 0);
  assert.equal(calls.mode.length, 0);
  assert.equal(calls.sent.length, 1);
  assert.equal(calls.sent[0].tabId, 45);
  assert.equal(calls.sent[0].options.maxAttempts, undefined);
});

test("the Application workspace exposes a separate text box and Send button", () => {
  assert.match(html, /id="applicationWorkspaceAiSendInput"/);
  assert.match(html, /id="applicationWorkspaceAiSendButton"/);
  assert.match(panel, /request\("SEND_TEXT_TO_AI_TAB"/);
  assert.match(panel, /tabId: pickedUpTab\.tabId/);
  assert.match(panel, /sendTextDraft/);
});
