const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const source = fs.readFileSync(path.join(__dirname, "../service-worker.js"), "utf8");
const storageKey = "postingSubmissionNumbers";

function fixture(storage = {}) {
  const links = [];
  const scripts = [];
  const logs = [];
  let onMutation;
  const document = {
    title: "Engineer - Example",
    head: { appendChild(link) {
      if (!links.includes(link)) links.push(link);
      link.isConnected = true;
    } },
    createElement() {
      const attributes = new Map();
      return {
        isConnected: false,
        getAttribute: (name) => attributes.get(name) ?? null,
        setAttribute: (name, value) => attributes.set(name, value),
        remove: function () { this.isConnected = false; }
      };
    },
    querySelectorAll() {
      return links.filter((link) => link.isConnected && /(?:^|\s)icon(?:\s|$)/i.test(link.getAttribute("rel")));
    }
  };
  const urls = new Map([[2, "https://jobs.example/first"], [3, "https://jobs.example/last"]]);
  const context = vm.createContext({
    console, document, window: {},
    MutationObserver: class {
      constructor(callback) { onMutation = callback; }
      observe() {}
      disconnect() { onMutation = null; }
    },
    POSTING_SUBMISSION_NUMBERS_STORAGE_KEY: storageKey,
    postingNumberUpdateQueue: Promise.resolve(),
    saveTitleStatusByTabId: new Map(),
    getUrlComparisonKey: (url) => String(url || "").replace(/\/$/, ""),
    sendLog: (_runId, level, message) => logs.push({ level, message }),
    chrome: {
      tabs: { get: async (id) => ({ id, url: urls.get(id) }) },
      storage: { session: {
        get: async () => structuredClone(storage),
        set: async (values) => Object.assign(storage, structuredClone(values))
      } },
      scripting: { executeScript: async (details) => {
        scripts.push(details);
        return [{ result: details.func(...details.args) }];
      } }
    }
  });
  for (const name of ["setPostingNumberIconInPage", "updatePostingNumberState", "applyPostingNumberIcon",
    "markPostingSubmission", "restorePostingNumberIcon", "forgetPostingNumberIcon"]) {
    const match = source.match(new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}\\r?$", "m"));
    assert.ok(match, name);
    vm.runInContext(match[0], context);
  }
  return { context, storage, scripts, document, urls, logs, links,
    mutate: () => onMutation?.(),
    addIcon(rel, href) {
      const link = document.createElement("link");
      link.setAttribute("rel", rel);
      link.setAttribute("href", href);
      document.head.appendChild(link);
      return link;
    }
  };
}

test("successful job submissions get unique increasing numbers even when concurrent", async () => {
  const { context, storage, scripts } = fixture();
  const numbers = await Promise.all([
    context.markPostingSubmission(3, "https://jobs.example/last", "one"),
    context.markPostingSubmission(2, "https://jobs.example/first", "two")
  ]);
  assert.deepEqual(numbers, [1, 2]);
  assert.equal(storage[storageKey].byTabId[3].number, 1);
  assert.equal(storage[storageKey].byTabId[2].number, 2);
  assert.deepEqual(scripts.map((call) => call.target.tabId), [3, 2]);
});

test("reloads and worker restarts restore the number without incrementing the counter", async () => {
  const first = fixture();
  await first.context.markPostingSubmission(3, "https://jobs.example/last", "one");
  const restarted = fixture(first.storage);
  await restarted.context.restorePostingNumberIcon(3);
  assert.equal(restarted.scripts[0].args[0], 1);
  assert.equal(first.storage[storageKey].lastNumber, 1);
  assert.equal(await restarted.context.markPostingSubmission(2, "https://jobs.example/first", "two"), 2);
  await restarted.context.forgetPostingNumberIcon(3);
  assert.equal(first.storage[storageKey].byTabId[3], undefined);
  assert.equal(first.storage[storageKey].lastNumber, 2);
});

test("numbered favicons survive site icon changes and leave the job title and touch icons intact", () => {
  const fixtureState = fixture();
  const { context, document, links } = fixtureState;
  const site = fixtureState.addIcon("shortcut icon", "/site.ico");
  const touch = fixtureState.addIcon("apple-touch-icon", "/touch.png");
  context.setPostingNumberIconInPage(12);
  const url = site.getAttribute("href");
  assert.match(decodeURIComponent(url), />12<\/text>/);
  assert.equal(document.title, "Engineer - Example");
  assert.equal(touch.getAttribute("href"), "/touch.png");
  site.setAttribute("href", "/new-site.ico");
  fixtureState.mutate();
  assert.equal(site.getAttribute("href"), url);
  context.setPostingNumberIconInPage(123);
  assert.match(decodeURIComponent(site.getAttribute("href")), />123<\/text>/);
  assert.equal(links.length, 3);
});

test("a changed page or Save App status is not overwritten by a submission number", async () => {
  const { context, urls, scripts } = fixture();
  urls.set(3, "https://jobs.example/another");
  assert.equal(await context.applyPostingNumberIcon(3, { number: 1, jobUrl: "https://jobs.example/last" }), false);
  context.saveTitleStatusByTabId.set(2, { state: "saving" });
  assert.equal(await context.applyPostingNumberIcon(2, { number: 2, jobUrl: "https://jobs.example/first" }), false);
  assert.equal(scripts.length, 0);
  context.window.__applicationHelperSaveTitleStatus = { status: "success" };
  assert.equal(context.setPostingNumberIconInPage(1), false);
});

test("denied icon access preserves the successful submission number and reports the icon failure", async () => {
  const { context, storage, logs } = fixture();
  context.chrome.scripting.executeScript = async () => { throw new Error("Site access denied"); };
  assert.equal(await context.markPostingSubmission(3, "https://jobs.example/last", "one"), 1);
  assert.equal(storage[storageKey].byTabId[3].number, 1);
  assert.match(logs[0].message, /URL submitted as number 1/);
  assert.equal(logs[0].level, "warning");
});
