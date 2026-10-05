const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const worker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const panel = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");
const html = fs.readFileSync(path.join(root, "sidepanel/sidepanel.html"), "utf8");
const copilot = fs.readFileSync(path.join(root, "content/copilot.js"), "utf8");
const perplexity = fs.readFileSync(path.join(root, "content/perplexity.js"), "utf8");
const aiProvider = fs.readFileSync(path.join(root, "content/ai-provider.js"), "utf8");
const manifest = fs.readFileSync(path.join(root, "manifest.json"), "utf8");

function extractFunction(name) {
  const match = worker.match(
    new RegExp(`^(?:async )?function ${name}\\b[\\s\\S]*?^}\\r?$`, "m")
  );
  assert.ok(match, name);
  return match[0];
}

function workerHelpers() {
  const context = vm.createContext({
    URL,
    URLSearchParams,
    Set,
    Map,
    Array,
    String,
    Boolean,
    CHECK_POSTING_COPILOT_URL:
      "https://copilot.microsoft.com/chats/697VK9N9TzfDdzE8zPNrx"
  });
  vm.runInContext(extractFunction("isCopilotChatUrl"), context);
  vm.runInContext(extractFunction("isCheckPostingAiUrl"), context);
  vm.runInContext(extractFunction("checkPostingAiDefaults"), context);
  vm.runInContext(extractFunction("normalizeCheckPostingProviderId"), context);
  vm.runInContext(extractFunction("checkPostingAiLabel"), context);
  vm.runInContext(extractFunction("normalizeCheckPostingAiUrl"), context);
  vm.runInContext(extractFunction("resolveJobPageFromTab"), context);
  vm.runInContext(extractFunction("getUrlComparisonKey"), context);
  vm.runInContext(extractFunction("selectCheckPostingAiTab"), context);
  vm.runInContext(extractFunction("indexImmediatelyRightOf"), context);
  vm.runInContext(extractFunction("indexImmediatelyLeftOf"), context);
  vm.runInContext(extractFunction("indexImmediatelyRightOfTabGroup"), context);
  return context;
}

test("Check posting opens Copilot and sends the current tab URL", () => {
  const checkIndex = html.indexOf('id="checkPostingButton"');
  const settingsIndex = html.indexOf('id="checkPostingOptionsButton"');
  const sheetIndex = html.indexOf('id="openGoogleSheetButton"');
  const profilesIndex = html.indexOf('<section class="card profile-picker-card">');
  assert.ok(checkIndex > 0 && checkIndex < settingsIndex);
  assert.ok(settingsIndex > 0 && settingsIndex < sheetIndex);
  assert.ok(sheetIndex < profilesIndex);
  assert.match(html, />Check posting</);
  assert.match(html, /id="makeOrOpenAiTabButton"/);
  assert.match(html, />Make or open AI tab</);
  const makeOrOpenAiIndex = html.indexOf('id="makeOrOpenAiTabButton"');
  assert.ok(settingsIndex < makeOrOpenAiIndex && makeOrOpenAiIndex < sheetIndex);
  assert.match(html, /aria-label="Check posting settings"/);
  assert.match(html, /id="checkPostingActionSettingsModal"/);
  assert.match(html, /id="checkPostingUrl-copilot"/);
  assert.match(html, /id="checkPostingUrl-perplexity"/);
  assert.match(html, /id="checkPostingUrl-deepseek"/);
  assert.match(html, /name="checkPostingAiProvider"/);
  assert.doesNotMatch(html, /id="checkPostingAutoNextTabInput"/);
  assert.match(
    panel,
    /checkPostingButton\?\.addEventListener\("click", checkCurrentPosting\)/
  );
  assert.match(panel, /actionSettingsDialogs[\s\S]*checkPosting:/);
  assert.match(panel, /type: "CHECK_POSTING_TO_COPILOT"/);
  assert.match(panel, /type: "MAKE_OR_OPEN_CHECK_POSTING_AI_TAB"/);
  assert.match(panel, /type: "SAVE_CHECK_POSTING_CONFIG"/);
  assert.match(panel, /providerId: settings\.providerId/);
  assert.match(panel, /urls: settings\.urls/);
  assert.match(worker, /CHECK_POSTING_TO_COPILOT: sendCheckPostingToCopilot/);
  assert.match(worker, /moveJobTabToSavingDocsGroup\(tab\)/);
  assert.match(
    worker,
    /moveSavedJobToSavingDocsGroup\(jobTab\.id, aiTab\.id\)/
  );
  assert.match(worker, /MAKE_OR_OPEN_CHECK_POSTING_AI_TAB: makeOrOpenCheckPostingAiTab/);
  assert.match(worker, /focusBrowserTab\(aiTab\.id\)/);
  assert.match(worker, /moveCheckWithAiGroupToRightEnd\(aiTab\.id\)/);
  assert.match(
    worker,
    /chrome\.tabs\.create\(createOptions\)/
  );
  assert.match(worker, /const checkPostingConfig = await getCheckPostingConfig\(\)/);
  assert.doesNotMatch(worker, /activateNextTabToRight\(currentTab\)/);
  assert.match(worker, /url: destinationUrl/);
  assert.match(worker, /selectCheckPostingAiTab\(openTabs, destinationUrl/);
  assert.match(worker, /tab\.pinned === true/);
  assert.match(worker, /chrome\.tabs\.create\(\{/);
  assert.match(worker, /index: windowTabs\.length/);
  assert.match(worker, /arrangeAndGroupJobWithAiTab\(ownerTabId, aiTab\.id\)/);
  assert.match(worker, /chrome\.tabs\.group\(\{/);
  assert.match(worker, /tabIds: \[aiTabId, jobTabId\]/);
  assert.match(worker, /GET_CHECK_POSTING_CONFIG/);
  assert.match(worker, /rememberCheckPostingJob\(ownerTabId/);
  assert.match(
    worker,
    /await sendFillAndSendToTab\(aiTabId, jobUrl, runId[\s\S]*await focusBrowserTab\(aiTabId\)/
  );
  assert.match(copilot, /FILL_AND_SEND/);
  assert.match(copilot, /async function fillAndSend[\s\S]*fillCopilotInput/);
  assert.doesNotMatch(copilot, /ensureSearchMode/);
  assert.doesNotMatch(worker, /ensureRequiredModeInTab/);
  assert.doesNotMatch(worker, /requiredMode/);
  assert.match(manifest, /https:\/\/copilot\.microsoft\.com\/\*/);
  assert.match(manifest, /https:\/\/www\.perplexity\.ai\/\*/);
  assert.match(manifest, /content\/copilot\.js/);
  assert.match(manifest, /content\/perplexity\.js/);
  assert.match(manifest, /"check-posting"/);
});

test("Check posting fills without submitting while the selected AI chat is running", () => {
  for (const source of [copilot, perplexity, aiProvider]) {
    assert.match(source, /function isAiChatRunning\([^)]*\)/);
    assert.match(source, /const submitOnlyWhenIdle = options\.submitOnlyWhenIdle === true/);
    assert.match(
      source,
      /const chatWasRunning =[\s\S]{0,120}submitOnlyWhenIdle &&[\s\S]{0,120}isAiChatRunning/
    );
    assert.match(
      source,
      /return \{ submitted: false, reason: "chat-running" \}/
    );
    assert.match(source, /return \{ submitted: true \}/);
    assert.match(source, /sendResponse\(\{ ok: true, \.\.\.result \}\)/);
  }
  assert.match(worker, /submitOnlyWhenIdle: options\.submitOnlyWhenIdle === true/);
  assert.match(
    worker,
    /sendFillAndSendToTab\(aiTabId, jobUrl, runId,[\s\S]*submitOnlyWhenIdle: true/
  );
  assert.match(worker, /const submitted = fillResult\?\.submitted !== false/);
  assert.match(worker, /prompt without submitting because the chat is responding/);
});

test("DeepSeek detects its unlabeled enabled primary circle as a running chat", () => {
  const extractAiProviderFunction = (name) => {
    const match = aiProvider.match(
      new RegExp(`^(?:async )?function ${name}\\b[\\s\\S]*?^}\\r?$`, "m")
    );
    assert.ok(match, name);
    return match[0];
  };
  let generationControl = null;
  const context = vm.createContext({
    Boolean,
    location: { hostname: "chat.deepseek.com" },
    findFirst: (selectors) => {
      assert.ok(
        selectors.includes(
          "div.ds-button--primary.ds-button--circle:not(.ds-button--disabled)"
        )
      );
      return generationControl;
    }
  });
  vm.runInContext(extractAiProviderFunction("isDeepSeekChatRunning"), context);

  generationControl = { className: "ds-button--primary ds-button--circle" };
  assert.equal(context.isDeepSeekChatRunning(), true);
  generationControl = null;
  assert.equal(context.isDeepSeekChatRunning(), false);

  assert.match(
    aiProvider,
    /!button\.classList\?\.contains\("ds-button--disabled"\)/
  );
  assert.match(
    aiProvider,
    /isAiChatRunning\(\{ includeDeepSeekPrimaryControl: true \}\)/
  );
  assert.match(
    aiProvider,
    /if \(submitOnlyWhenIdle && isAiChatRunning\(\)\)/
  );
});

test("Copilot chat URLs match the Check posting destination", () => {
  const ctx = workerHelpers();
  assert.equal(
    ctx.isCopilotChatUrl(
      "https://copilot.microsoft.com/chats/697VK9N9TzfDdzE8zPNrx"
    ),
    true
  );
  assert.equal(
    ctx.isCopilotChatUrl(
      "https://copilot.microsoft.com/chats/697VK9N9TzfDdzE8zPNrx?foo=1"
    ),
    true
  );
  assert.equal(ctx.isCopilotChatUrl("https://copilot.microsoft.com/"), false);
  assert.equal(
    ctx.isCopilotChatUrl("https://chatgpt.com/c/12345678-1234-1234-1234-123456789abc"),
    false
  );
});

test("Check posting settings keep one editable URL per AI chat", () => {
  const ctx = workerHelpers();
  assert.equal(
    ctx.normalizeCheckPostingAiUrl("copilot", ""),
    "https://copilot.microsoft.com/chats/697VK9N9TzfDdzE8zPNrx"
  );
  assert.equal(
    ctx.normalizeCheckPostingAiUrl(
      "copilot",
      "https://copilot.microsoft.com/chats/abc123/"
    ),
    "https://copilot.microsoft.com/chats/abc123"
  );
  assert.equal(
    ctx.normalizeCheckPostingAiUrl("perplexity", "https://www.perplexity.ai/search/jobs"),
    "https://www.perplexity.ai/search/jobs"
  );
  assert.equal(
    ctx.normalizeCheckPostingAiUrl("deepseek", "https://chat.deepseek.com/a/chat/s/abc12345/"),
    "https://chat.deepseek.com/a/chat/s/abc12345"
  );
  assert.throws(
    () => ctx.normalizeCheckPostingAiUrl("copilot", "https://www.perplexity.ai/"),
    /Copilot chat URL/
  );
  assert.throws(
    () => ctx.normalizeCheckPostingAiUrl("perplexity", "https://chatgpt.com/c/abc"),
    /Perplexity URL/
  );
});

test("Check posting reuses an unpinned tab with the selected AI URL", () => {
  const ctx = workerHelpers();
  const destination = "https://copilot.microsoft.com/chats/abc123";
  const tabs = [
    { id: 1, index: 0, windowId: 9, pinned: true, url: destination },
    { id: 2, index: 1, windowId: 9, pinned: false, url: "https://jobs.example/42" },
    {
      id: 3,
      index: 4,
      windowId: 9,
      pinned: false,
      url: `${destination}/`
    },
    {
      id: 4,
      index: 0,
      windowId: 8,
      pinned: false,
      url: destination
    }
  ];
  assert.equal(ctx.selectCheckPostingAiTab(tabs, destination, 9).id, 3);
  assert.equal(
    ctx.selectCheckPostingAiTab(
      [{ id: 1, index: 0, windowId: 9, pinned: true, url: destination }],
      destination,
      9
    ),
    null
  );
  assert.equal(ctx.selectCheckPostingAiTab(tabs, "https://www.perplexity.ai/", 9), null);
  assert.equal(ctx.indexImmediatelyRightOf(2, 0, true), 2);
  assert.equal(ctx.indexImmediatelyRightOf(0, 2, true), 1);
  assert.equal(ctx.indexImmediatelyRightOf(4, null, false), 5);
  assert.equal(ctx.indexImmediatelyLeftOf(3, 0, true), 2);
  assert.equal(ctx.indexImmediatelyLeftOf(1, 4, true), 1);
  assert.equal(ctx.indexImmediatelyLeftOf(4, null, false), 4);
  assert.equal(ctx.indexImmediatelyRightOfTabGroup(4, 0, 2), 3);
  assert.equal(ctx.indexImmediatelyRightOfTabGroup(2, 5, 2), 3);
});

test("Check posting groups the AI chat on the left and the job on the right", async () => {
  const calls = [];
  const context = vm.createContext({
    Number,
    Set,
    isTabInGroup: (tab) => Number.isInteger(tab?.groupId) && tab.groupId !== -1,
    nameCheckPostingTabGroup: async (groupId) => {
      calls.push(["name", groupId, "Check with AI"]);
    },
    moveTabImmediatelyLeftOf: async (movingTabId, anchorTabId) => {
      calls.push(["move", movingTabId, anchorTabId]);
    },
    chrome: {
      tabs: {
        get: async (tabId) => ({
          id: tabId,
          windowId: 9,
          pinned: false,
          groupId: -1
        }),
        query: async () => [],
        group: async (options) => {
          calls.push(["group", options]);
          return 27;
        }
      }
    }
  });
  vm.runInContext(extractFunction("arrangeAndGroupJobWithAiTab"), context);

  const groupId = await context.arrangeAndGroupJobWithAiTab(2, 3);

  assert.equal(groupId, 27);
  assert.deepEqual(calls[0], ["move", 3, 2]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[1][1])), {
    tabIds: [3, 2],
    createProperties: { windowId: 9 }
  });
  assert.deepEqual(calls[2], ["name", 27, "Check with AI"]);
});

test("Check posting joins the AI tab's existing group without creating another", async () => {
  const calls = [];
  const context = vm.createContext({
    Number,
    isTabInGroup: (tab) => Number.isInteger(tab?.groupId) && tab.groupId !== -1,
    nameCheckPostingTabGroup: async (groupId) => {
      calls.push(["name", groupId, "Check with AI"]);
    },
    moveTabImmediatelyRightOf: async (movingTabId, anchorTabId) => {
      calls.push(["move-right", movingTabId, anchorTabId]);
    },
    moveTabImmediatelyLeftOf: async () => {
      assert.fail("An existing AI group must not use the new-group path.");
    },
    chrome: {
      tabs: {
        get: async (tabId) => ({
          id: tabId,
          windowId: tabId === 2 ? 8 : 9,
          pinned: false,
          groupId: tabId === 3 ? 44 : -1
        }),
        group: async (options) => {
          calls.push(["join", options]);
          return 44;
        }
      }
    }
  });
  vm.runInContext(extractFunction("arrangeAndGroupJobWithAiTab"), context);

  const groupId = await context.arrangeAndGroupJobWithAiTab(2, 3);

  assert.equal(groupId, 44);
  assert.deepEqual(calls[0], ["move-right", 2, 3]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[1][1])), {
    tabIds: 2,
    groupId: 44
  });
  assert.deepEqual(calls[2], ["move-right", 2, 3]);
  assert.deepEqual(calls[3], ["name", 44, "Check with AI"]);
});

test("Check posting and Save App name their tab groups", async () => {
  const updates = [];
  const context = vm.createContext({
    Number,
    CHECK_POSTING_TAB_GROUP_TITLE: "Check with AI",
    SAVING_TO_DOCS_TAB_GROUP_TITLE: "Saving to Docs",
    chrome: {
      tabGroups: {
        update: async (groupId, options) => updates.push([groupId, options])
      }
    }
  });
  vm.runInContext(extractFunction("nameCheckPostingTabGroup"), context);
  vm.runInContext(extractFunction("nameSavingToDocsTabGroup"), context);

  await context.nameCheckPostingTabGroup(27);
  await context.nameSavingToDocsTabGroup(28);

  assert.deepEqual(JSON.parse(JSON.stringify(updates)), [
    [27, { title: "Check with AI" }],
    [28, { title: "Saving to Docs" }]
  ]);
  assert.match(manifest, /"tabGroups"/);
});

test("Make or open AI tab moves Check with AI to the right end", async () => {
  const calls = [];
  const context = vm.createContext({
    Number,
    isTabInGroup: () => false,
    nameCheckPostingTabGroup: async (groupId) => {
      calls.push(["name", groupId]);
    },
    chrome: {
      tabs: {
        get: async () => ({
          id: 3,
          windowId: 9,
          pinned: false,
          groupId: -1
        }),
        group: async (options) => {
          calls.push(["group", options]);
          return 44;
        }
      },
      tabGroups: {
        move: async (groupId, options) => {
          calls.push(["move-group", groupId, options]);
        }
      }
    }
  });
  vm.runInContext(extractFunction("moveCheckWithAiGroupToRightEnd"), context);

  const groupId = await context.moveCheckWithAiGroupToRightEnd(3);

  assert.equal(groupId, 44);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["group", { tabIds: 3, createProperties: { windowId: 9 } }],
    ["name", 44],
    ["move-group", 44, { windowId: 9, index: -1 }]
  ]);
});

test("Make or open AI tab moves an existing AI group without replacing it", async () => {
  const calls = [];
  const context = vm.createContext({
    Number,
    isTabInGroup: () => true,
    nameCheckPostingTabGroup: async (groupId) => calls.push(["name", groupId]),
    chrome: {
      tabs: {
        get: async () => ({
          id: 3,
          windowId: 9,
          pinned: false,
          groupId: 44
        }),
        group: async () => assert.fail("The existing AI group must be reused.")
      },
      tabGroups: {
        move: async (groupId, options) => {
          calls.push(["move-group", groupId, options]);
        }
      }
    }
  });
  vm.runInContext(extractFunction("moveCheckWithAiGroupToRightEnd"), context);

  await context.moveCheckWithAiGroupToRightEnd(3);

  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["name", 44],
    ["move-group", 44, { windowId: 9, index: -1 }]
  ]);
});

test("Save App moves the job into a separate Saving to Docs group", async () => {
  const calls = [];
  const context = vm.createContext({
    Number,
    SAVING_TO_DOCS_TAB_GROUP_TITLE: "Saving to Docs",
    isTabInGroup: (tab) => Number.isInteger(tab?.groupId) && tab.groupId !== -1,
    moveTabImmediatelyRightOf: async (movingTabId, anchorTabId) => {
      calls.push(["move-right", movingTabId, anchorTabId]);
    },
    nameCheckPostingTabGroup: async (groupId) => {
      calls.push(["name-check", groupId]);
    },
    nameSavingToDocsTabGroup: async (groupId) => {
      calls.push(["name-saving", groupId]);
    },
    moveTabGroupImmediatelyRightOfTab: async (groupId, anchorTabId) => {
      calls.push(["move-group-right", groupId, anchorTabId]);
    },
    chrome: {
      tabs: {
        get: async (tabId) => ({
          id: tabId,
          windowId: 9,
          pinned: false,
          groupId: 44
        }),
        group: async (options) => {
          calls.push(["group", options]);
          return 55;
        }
      },
      tabGroups: {
        query: async () => []
      }
    }
  });
  vm.runInContext(extractFunction("moveSavedJobToSavingDocsGroup"), context);

  const groupId = await context.moveSavedJobToSavingDocsGroup(2, 3);

  assert.equal(groupId, 55);
  assert.deepEqual(calls[0], ["name-check", 44]);
  assert.deepEqual(calls[1], ["move-right", 2, 3]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[2][1])), {
    tabIds: 2,
    createProperties: { windowId: 9 }
  });
  assert.deepEqual(calls[3], ["name-saving", 55]);
  assert.deepEqual(calls[4], ["move-group-right", 55, 3]);
});

test("Save App reuses the window's existing Saving to Docs group", async () => {
  const grouped = [];
  const context = vm.createContext({
    Number,
    SAVING_TO_DOCS_TAB_GROUP_TITLE: "Saving to Docs",
    isTabInGroup: () => true,
    moveTabImmediatelyRightOf: async () => {},
    nameCheckPostingTabGroup: async () => {},
    nameSavingToDocsTabGroup: async () => {},
    moveTabGroupImmediatelyRightOfTab: async () => {},
    chrome: {
      tabs: {
        get: async (tabId) => ({
          id: tabId,
          windowId: 9,
          pinned: false,
          groupId: 44
        }),
        group: async (options) => {
          grouped.push(options);
          return options.groupId;
        }
      },
      tabGroups: {
        query: async () => [
          { id: 55, windowId: 9, title: "Saving to Docs" }
        ]
      }
    }
  });
  vm.runInContext(extractFunction("moveSavedJobToSavingDocsGroup"), context);

  const groupId = await context.moveSavedJobToSavingDocsGroup(2, 3);

  assert.equal(groupId, 55);
  assert.deepEqual(JSON.parse(JSON.stringify(grouped)), [
    { tabIds: 2, groupId: 55 }
  ]);
});

test("Save App reuses a Saving to Docs group from another window", async () => {
  const calls = [];
  const context = vm.createContext({
    Number,
    SAVING_TO_DOCS_TAB_GROUP_TITLE: "Saving to Docs",
    isTabInGroup: () => true,
    moveTabImmediatelyRightOf: async () => {},
    nameCheckPostingTabGroup: async () => {},
    nameSavingToDocsTabGroup: async () => {},
    moveTabGroupImmediatelyRightOfTab: async () => {},
    chrome: {
      tabs: {
        get: async (tabId) => ({
          id: tabId,
          windowId: 9,
          pinned: false,
          groupId: 44
        }),
        group: async (options) => {
          calls.push(["join", options]);
          return options.groupId;
        }
      },
      tabGroups: {
        query: async (options) => {
          calls.push(["query", options]);
          return [{ id: 55, windowId: 8, title: "Saving to Docs" }];
        },
        move: async (groupId, options) => {
          calls.push(["move-group", groupId, options]);
          return { id: groupId, windowId: options.windowId };
        }
      }
    }
  });
  vm.runInContext(extractFunction("moveSavedJobToSavingDocsGroup"), context);

  const groupId = await context.moveSavedJobToSavingDocsGroup(2, 3);

  assert.equal(groupId, 55);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["query", { title: "Saving to Docs" }],
    ["move-group", 55, { windowId: 9, index: -1 }],
    ["join", { tabIds: 2, groupId: 55 }]
  ]);
});

test("Save App keeps the job URL while the tab is on Copilot", () => {
  const ctx = workerHelpers();
  const copilotTab = {
    url: "https://copilot.microsoft.com/chats/697VK9N9TzfDdzE8zPNrx",
    title: "Microsoft Copilot"
  };
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        ctx.resolveJobPageFromTab(copilotTab, {
          jobUrl: "https://jobs.example/42",
          jobTitle: "Engineer"
        })
      )
    ),
    { jobUrl: "https://jobs.example/42", jobTitle: "Engineer" }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(ctx.resolveJobPageFromTab(copilotTab))),
    { jobUrl: copilotTab.url, jobTitle: "Microsoft Copilot" }
  );
});
