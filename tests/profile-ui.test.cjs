const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");
const html = fs.readFileSync(path.join(root, "sidepanel/sidepanel.html"), "utf8");
const workerSource = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const profileSelectionVersion = Number(source.match(/const PROFILE_SELECTION_VERSION = (\d+);/)[1]);

function loadFunctions(code, names, context) {
  for (const name of names) {
    const match = code.match(new RegExp("^(?:async )?function " + name + "\\b[\\s\\S]*?^}", "m"));
    assert.ok(match, "Missing function " + name);
    vm.runInContext(match[0], context);
  }
}

function workerFixture(initialState) {
  let sequence = 0;
  const storage = initialState ? { profileSelection: structuredClone(initialState) } : {};
  const messages = [];
  const context = vm.createContext({
    console, Date, Set, Map, Array, String, Boolean,
    createProfileId: () => "worker-profile-" + ++sequence,
    createPromptResumeId: () => "worker-resume-" + ++sequence,
    parseGoogleDocId: (value) => String(value || ""),
    saveJobDescriptionSelectionState: async (content) => { storage.jobDescription = content; },
    sendLog: () => {},
    getRunOwnerTabId: () => null,
    chrome: {
      storage: { local: {
        get: async (keys) => Object.fromEntries(
          (Array.isArray(keys) ? keys : [keys])
            .filter((key) => key in storage)
            .map((key) => [key, structuredClone(storage[key])])
        ),
        set: async (values) => { Object.assign(storage, structuredClone(values)); },
        remove: async (keys) => { keys.forEach((key) => delete storage[key]); }
      } },
      runtime: { sendMessage: async (message) => { messages.push(message); } }
    }
  });
  for (const name of ["PROFILE_SELECTION_VERSION", "DEFAULT_PROFILE_NAME",
    "DEFAULT_RESUME_TEMPLATE_ID", "PROFILE_SELECTION_STORAGE_KEY",
    "PROMPT_RESUME_SELECTION_STORAGE_KEY", "LEGACY_PROMPT_RESUME_SELECTION_STORAGE_KEY",
    "SHEET_CONFIG_STORAGE_KEY"]) {
    vm.runInContext(workerSource.match(new RegExp("^const " + name + " = .*;", "m"))[0], context);
  }
  loadFunctions(workerSource, [
    "normalizeUpdatedAt", "normalizeLabeledTextEntry", "normalizePromptResume",
    "enforceSingleAutoSelectPromptResume", "getAutoSelectedPromptResumeId",
    "normalizePromptResumeSelection", "createDefaultProfile", "normalizeProfile",
    "normalizeProfileSelectionState", "loadLegacyPromptResumeSelectionRecord",
    "getLegacyResumeTemplateId", "getProfileSelectionState", "saveProfileSelectionState",
    "getSelectedProfileFromState", "getSelectedProfilesFromState",
    "getPromptResumeSelectionState", "savePromptResumeSelectionState",
    "resetApplicationInputsAfterSave", "stripPromptResumesFromProfileSelection",
    "mergeProfilesPreservingPromptResumes"
  ], context);
  return { ctx: context, storage, messages };
}

// A small DOM double keeps these tests dependency-free and never accesses Chrome.
class Element {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.className = "";
    this.value = "";
    this.disabled = false;
    this.checked = false;
    this.hidden = false;
    this.classList = {
      contains: (name) => this.className.split(/\s+/).includes(name),
      add: (name) => this.classList.toggle(name, true),
      remove: (name) => this.classList.toggle(name, false),
      toggle: (name, force) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        const add = force ?? !classes.has(name);
        if (add) classes.add(name);
        else classes.delete(name);
        this.className = [...classes].join(" ");
        return add;
      }
    };
  }
  set innerHTML(value) { this.children = []; this._text = value; }
  get innerHTML() { return this._text || ""; }
  set textContent(value) { this.children = []; this._text = String(value); }
  get textContent() {
    return this.children.length
      ? this.children.map((child) => child.textContent).join("")
      : this._text || "";
  }
  append(...children) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
  }
  prepend(...children) {
    for (const child of [...children].reverse()) {
      child.parentElement = this;
      this.children.unshift(child);
    }
  }
  appendChild(child) { this.append(child); return child; }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  focus() { this.focused = true; }
  matches(selector) {
    if (selector.startsWith(".")) {
      return selector.slice(1).split(".").every((name) => this.classList.contains(name));
    }
    if (selector.startsWith('input[type="radio"]')) {
      return this.type === "radio" && (!selector.endsWith(":checked") || this.checked);
    }
    return false;
  }
  querySelectorAll(selector) {
    const all = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (selector.split(",").some((part) => child.matches(part.trim()))) all.push(child);
        walk(child);
      }
    };
    walk(this);
    return all;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function fixture() {
  let sequence = 0;
  const elements = new Map();
  for (const match of html.matchAll(/id="([^"]+)"/g)) {
    const element = new Element();
    element.id = match[1];
    if (element.id.endsWith("Modal")) element.className = "modal is-hidden";
    elements.set(element.id, element);
  }
  const data = {
    selectionVersion: profileSelectionVersion,
    selectedProfileId: "alice",
    selectedProfileIds: [],
    profiles: [
      { id: "alice", name: "Alice", resumeTemplateId: "doc-alice", notes: "Alice notes",
        selectedPromptResumeId: "", promptResumes: [
          { id: "a1", label: "Frontend", content: "Alice frontend text", autoSelect: false },
          { id: "a2", label: "Backend", content: "Alice backend text", autoSelect: false }
        ] },
      { id: "bob", name: "Bob", resumeTemplateId: "doc-bob", notes: "Bob notes",
        selectedPromptResumeId: "", promptResumes: [
          { id: "b1", label: "Data", content: "Bob data text", autoSelect: false }
        ] },
      { id: "empty", name: "Empty", resumeTemplateId: "doc-empty", notes: "",
        selectedPromptResumeId: "", promptResumes: [] }
    ]
  };
  const context = vm.createContext({
    ...Object.fromEntries(elements),
    document: { createElement: (tag) => new Element(tag) },
    console, Set, Map, Array, String, Boolean, Date, URL,
    configuredAiProviderId: "chatgpt", activeTabId: 7, noModelProgressByTabId: {},
    pendingNoModelDeleteTarget: null,
    normalizeAiProviderId: (value) =>
      ["chatgpt", "deepseek", "none"].includes(value) ? value : "chatgpt",
    DEFAULT_PROFILE_NAME: "Default",
    PROFILE_SELECTION_VERSION: profileSelectionVersion,
    profileSelectionState: structuredClone(data),
    manualSelectedProfileIds: [],
    savePostProcessState: null,
    isSavePostProcessRequestPending: false,
    promptResumeSelectionState: { promptResumes: [], selectedPromptResumeId: "" },
    profileResumeSettingsProfileId: null,
    areActionButtonsDisabled: false,
    profileFormMode: "add", editingProfileId: null, notesProfileId: null,
    promptResumeFormMode: "add", editingPromptResumeId: null,
    openManagedModalId: "", managedModalDrafts: {},
    draggedProfileId: "", draggedPromptResumeId: "",
    createProfileId: () => "new-" + ++sequence,
    addLog: () => {},
    truncatePreviewText: (value) => value.slice(0, 80),
    formatPromptResumeUpdatedAt: () => "",
    clearProfileDragState: () => {},
    clearPromptResumeDragState: () => {},
    reorderProfile: () => {},
    reorderPromptResume: () => {},
    openProfileNotesModal: () => {},
    openEditProfileModal: () => {},
    removeProfile: () => {},
    setConfigModalOpen: () => {},
    setProfileFormModalOpen: () => {},
    setProfileNotesModalOpen: () => {},
    setPromptFormModalOpen: () => {},
    setJobDescriptionFormModalOpen: () => {},
    setDeleteApplicationModalOpen: () => {},
    setExportAppDataModalOpen: () => {},
    setImportAppDataModalOpen: () => {}
  });
  context.isSavePostProcessActive = (state = context.savePostProcessState) =>
    Boolean(state?.runId);
  context.cancelSavePostProcess = async () => {};
  let backend;
  const openedWindows = [];
  context.chrome = {
    windows: {
      create: async (options) => {
        openedWindows.push(options);
        return { id: openedWindows.length };
      }
    },
    runtime: { sendMessage: async (message) => {
    if (message.type === "SAVE_PROFILE_SELECTION") {
      return { ok: true, ...await backend.ctx.saveProfileSelectionState(message) };
    }
    if (message.type === "GET_PROFILE_SELECTION") {
      return { ok: true, ...await backend.ctx.getProfileSelectionState() };
    }
    if (message.type === "GET_PROMPT_RESUME_SELECTION") {
      return { ok: true, ...await backend.ctx.getPromptResumeSelectionState(message.profileId) };
    }
    if (message.type === "SAVE_PROMPT_RESUME_SELECTION") {
      return { ok: true, ...await backend.ctx.savePromptResumeSelectionState(
        message.promptResumes, message.selectedPromptResumeId, message.profileId
      ) };
    }
    if (message.type === "GET_SHEET_CONFIG") {
      return {
        ok: true,
        spreadsheetId: "global-sheet",
        sheetName: "Sheet1",
        aiProviderId: "none"
      };
    }
    throw new Error("Unexpected test message: " + message.type);
    } }
  };
  const names = [
    "getSelectedAiProviderId", "isNoModelSaveMode",
    "isGoogleSheetsDocumentUrl", "requestDeleteNoModelProfileApplication",
    "openNoModelProfileGoogleSheet", "buildConfiguredGoogleSheetUrl",
    "openConfiguredGoogleSheet", "createNoModelProfileProgress",
    "renderNoModelSaveProgress",
    "normalizePromptResumeEntry", "enforceSingleAutoSelectPromptResume",
    "getAutoSelectedPromptResumeId", "normalizePromptResumeSelection",
    "getAutoSelectedProfileIds", "syncProfileSelectionForActiveTab",
    "rememberCurrentManualProfileSelection",
    "createDefaultProfile", "normalizeProfile", "normalizeProfileSelectionState",
    "getSelectedProfile", "syncPromptResumeStateFromSelectedProfile",
    "applyPromptResumeStateToSelectedProfile", "renderProfileResumeSettings",
    "setProfileResumeSettingsModalOpen", "openProfileResumeSettingsModal",
    "toggleProfileAutoSelect", "renderProfileList", "persistProfileSelection",
    "toggleProfileSelection", "loadProfileSelection", "selectProfile",
    "renderPromptResumeList", "selectPromptResume", "setPromptResumeAutoSelect",
    "loadPromptResumeSelection", "persistPromptResumeSelection", "removePromptResume",
    "clearPromptResumeFormModalStatus", "showPromptResumeFormModalStatus",
    "resetPromptResumeFormModal", "updatePromptResumeFormModalCopy",
    "setPromptResumeFormModalOpen", "openAddPromptResumeModal",
    "openEditPromptResumeModal", "submitPromptResumeForm",
    "getManagedModals", "restoreManagedModalState"
  ];
  loadFunctions(source, names, context);
  context.profileSelectionState = context.normalizeProfileSelectionState(data);
  backend = workerFixture(context.profileSelectionState);
  context.syncPromptResumeStateFromSelectedProfile();
  context.renderProfileList();
  return {
    ctx: context,
    node: (id) => elements.get(id),
    profile: (id) => context.profileSelectionState.profiles.find((p) => p.id === id),
    stored: () => backend.storage.profileSelection,
    openedWindows
  };
}

test("No Model allows selecting a profile without prompt resumes and persists it", async () => {
  const { ctx, node, stored } = fixture();
  ctx.configuredAiProviderId = "none";
  ctx.renderProfileList();
  const empty = node("profileList").children.find((item) => item.dataset.profileId === "empty");
  const idleProgress = empty.querySelector(".no-model-profile-progress");
  assert.equal(idleProgress.dataset.status, "idle");
  assert.equal(idleProgress.getAttribute("aria-disabled"), "true");
  assert.deepEqual(
    idleProgress.querySelector(".no-model-profile-steps").children.map(
      (step) => step.dataset.state
    ),
    ["pending", "pending", "pending"]
  );
  assert.equal(empty.querySelector(".profile-selection-checkbox").disabled, false);
  await ctx.toggleProfileSelection("empty");
  assert.ok(stored().selectedProfileIds.includes("empty"));
  assert.equal(stored().profiles.find((profile) => profile.id === "empty").selectedPromptResumeId, "");
});

test("global Open Google Sheet sits outside Profiles and opens the configured workbook in a new window", async () => {
  const buttonIndex = html.indexOf('id="openGoogleSheetButton"');
  const checkPostingIndex = html.indexOf('id="checkPostingButton"');
  const profilesIndex = html.indexOf('<section class="card profile-picker-card">');
  assert.ok(buttonIndex > 0 && buttonIndex < profilesIndex);
  assert.ok(checkPostingIndex > 0 && checkPostingIndex < profilesIndex);
  assert.ok(checkPostingIndex < buttonIndex);

  const { ctx, openedWindows } = fixture();
  await ctx.openConfiguredGoogleSheet();
  assert.deepEqual(JSON.parse(JSON.stringify(openedWindows)), [
    {
      url: "https://docs.google.com/spreadsheets/d/global-sheet/edit",
      type: "normal",
      focused: true
    }
  ]);
});

test("clicking the profile label area selects and deselects the profile", async () => {
  const { ctx, node, stored } = fixture();
  const getAlice = () =>
    node("profileList").children.find((item) => item.dataset.profileId === "alice");

  let labelArea = getAlice().querySelector(".profile-selection-label");
  assert.equal(labelArea.getAttribute("aria-pressed"), "false");
  await labelArea.listeners.click[0]();
  assert.ok(stored().selectedProfileIds.includes("alice"));

  labelArea = getAlice().querySelector(".profile-selection-label");
  assert.equal(labelArea.getAttribute("aria-pressed"), "true");
  assert.equal(
    getAlice().querySelector(".profile-selection-checkbox").checked,
    true
  );
  await labelArea.listeners.click[0]();
  assert.ok(!stored().selectedProfileIds.includes("alice"));
});

test("clicking a process panel toggles its profile without hijacking action buttons", async () => {
  const { ctx, node, stored } = fixture();
  ctx.configuredAiProviderId = "none";
  ctx.renderProfileList();
  const getAliceProgress = () => node("profileList").children
    .find((item) => item.dataset.profileId === "alice")
    .querySelector(".no-model-profile-progress");

  let progress = getAliceProgress();
  assert.equal(progress.dataset.selectionEnabled, "true");
  await progress.listeners.click[0]({
    defaultPrevented: false,
    target: { closest: () => null }
  });
  assert.ok(stored().selectedProfileIds.includes("alice"));

  progress = getAliceProgress();
  await progress.listeners.click[0]({
    defaultPrevented: false,
    target: { closest: () => ({ className: "no-model-profile-action" }) }
  });
  assert.ok(stored().selectedProfileIds.includes("alice"));

  await progress.listeners.click[0]({
    defaultPrevented: false,
    target: { closest: () => null }
  });
  assert.ok(!stored().selectedProfileIds.includes("alice"));
});

test("manual profile checks are tab-local while Auto profiles stay checked", async () => {
  const { ctx, node, profile } = fixture();

  ctx.manualSelectedProfileIds = ["alice"];
  ctx.syncProfileSelectionForActiveTab();
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], ["alice"]);

  const firstTabSelection = [...ctx.manualSelectedProfileIds];
  ctx.manualSelectedProfileIds = [];
  ctx.syncProfileSelectionForActiveTab();
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], []);

  profile("bob").selectedPromptResumeId = "b1";
  profile("bob").promptResumes[0].autoSelect = true;
  ctx.syncProfileSelectionForActiveTab();
  ctx.renderProfileList();
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], ["bob"]);
  const bobCheckbox = node("profileList").children
    .find((item) => item.dataset.profileId === "bob")
    .querySelector(".profile-selection-checkbox");
  assert.equal(bobCheckbox.checked, true);
  assert.equal(bobCheckbox.disabled, true);
  await ctx.toggleProfileSelection("bob");
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], ["bob"]);

  ctx.manualSelectedProfileIds = firstTabSelection;
  ctx.syncProfileSelectionForActiveTab();
  assert.deepEqual(
    [...ctx.profileSelectionState.selectedProfileIds],
    ["alice", "bob"]
  );
});

test("profile tab state stores manual checks and active-tab rendering reapplies them", () => {
  assert.match(source, /manualSelectedProfileIds:\s*\[\]/);
  assert.match(
    source,
    /state\.manualSelectedProfileIds = \[\.\.\.manualSelectedProfileIds\]/
  );
  assert.match(
    source,
    /manualSelectedProfileIds = \[\.\.\.state\.manualSelectedProfileIds\]/
  );
  assert.match(
    source,
    /function renderActiveTabState\(\) \{[\s\S]*?syncProfileSelectionForActiveTab\(\);[\s\S]*?renderProfileList\(\);/
  );
});

test("process logs render newest first and new entries are prepended", () => {
  const rendered = [];
  const logsList = {
    children: [],
    scrollTop: -1,
    scrollHeight: 99,
    set innerHTML(_value) {
      this.children = [];
      rendered.length = 0;
    },
    appendChild(item) {
      this.children.push(item);
      rendered.push(item);
    },
    prepend(item) {
      this.children.unshift(item);
      rendered.unshift(item);
    }
  };
  const ctx = vm.createContext({
    console,
    Date,
    logsList,
    logEntries: [
      { level: "info", message: "old", timestamp: "1" },
      { level: "success", message: "new", timestamp: "2" }
    ],
    createLogListItem: (entry) => entry.message,
    updateLogsState: () => {},
    isActiveTab: (tabId) => tabId === 7,
    getTabState: () => null,
    schedulePersistTabSession: () => {},
    MAX_TAB_LOG_ENTRIES: 400
  });
  loadFunctions(source, ["renderLogEntries", "addLogForTab"], ctx);

  ctx.renderLogEntries();
  assert.deepEqual(rendered, ["new", "old"]);
  assert.equal(logsList.scrollTop, 0);

  ctx.addLogForTab(7, "info", "newest", "3");
  assert.deepEqual(rendered, ["newest", "new", "old"]);
  assert.equal(logsList.scrollTop, 0);
});

test("per-profile progress renders states, Sheet actions, and follows the owner tab", async () => {
  const { ctx, node, openedWindows } = fixture();
  ctx.configuredAiProviderId = "none";
  let cancellationRequests = 0;
  ctx.savePostProcessState = { runId: "run-7" };
  ctx.cancelSavePostProcess = async () => { cancellationRequests++; };
  ctx.noModelProgressByTabId[7] = {
    runId: "run-7", jobTitle: "<img src=x>", jobUrl: "https://jobs.example/1", status: "running",
    profiles: [
      { id: "alice", name: "Alice", status: "saved", stage: "done",
        resumeUrl: "https://docs.google.com/document/d/one/edit",
        sheetUrl: "https://docs.google.com/spreadsheets/d/sheet/edit#gid=1" },
      { id: "bob", name: "Bob", status: "running", stage: "sheet", resumeUrl: "https://docs.google.com/document/d/two/edit" }
    ]
  };
  ctx.renderNoModelSaveProgress();
  const getProfile = (id) =>
    node("profileList").children.find((item) => item.dataset.profileId === id);
  assert.equal(node("profileList").querySelectorAll(".no-model-profile-progress").length, 3);
  assert.equal(
    getProfile("empty").querySelector(".no-model-profile-progress").dataset.status,
    "idle"
  );
  assert.equal(node("profileList").querySelectorAll(".no-model-profile-open-sheet").length, 1);
  const cancelButtons = node("profileList").querySelectorAll(
    ".no-model-profile-cancel"
  );
  assert.equal(cancelButtons.length, 2);
  assert.ok(cancelButtons.every((button) => button.textContent === "Cancel Process"));
  await cancelButtons[1].listeners.click[0]({ stopPropagation: () => {} });
  assert.equal(cancellationRequests, 1);
  const aliceProgress = getProfile("alice").querySelector(".no-model-profile-progress");
  const openSheet = aliceProgress.querySelector(".no-model-profile-open-sheet");
  const deleteButton = aliceProgress.querySelector(".no-model-profile-delete");
  assert.equal(openSheet.textContent, "Open Google Sheet");
  assert.equal(openSheet.href, "https://docs.google.com/spreadsheets/d/sheet/edit#gid=1");
  assert.equal(deleteButton.textContent, "Delete");
  assert.ok(openSheet.classList.contains("no-model-profile-action"));
  assert.ok(deleteButton.classList.contains("no-model-profile-action"));
  let defaultNavigationPrevented = false;
  await openSheet.listeners.click[0]({
    preventDefault: () => { defaultNavigationPrevented = true; },
    stopPropagation: () => {}
  });
  assert.equal(defaultNavigationPrevented, true);
  assert.deepEqual(JSON.parse(JSON.stringify(openedWindows)), [
    {
      url: "https://docs.google.com/spreadsheets/d/sheet/edit#gid=1",
      type: "normal",
      focused: true
    }
  ]);
  deleteButton.listeners.click[0]();
  assert.equal(ctx.pendingNoModelDeleteTarget.profileId, "alice");
  assert.match(getProfile("bob").textContent, /<img src=x>/);
  const current = getProfile("bob").querySelector(".no-model-profile-progress");
  assert.equal(current.querySelector(".no-model-profile-steps").children[2].dataset.state, "active");
  assert.deepEqual(
    current.querySelector(".no-model-profile-steps").children.slice(0, 2).map(
      (step) => step.dataset.connectorState
    ),
    ["done", "active"]
  );
  ctx.noModelProgressByTabId[7].status = "failed";
  ctx.noModelProgressByTabId[7].error = "Sheet failed; check before retrying.";
  ctx.noModelProgressByTabId[7].profiles[1].status = "failed";
  ctx.renderNoModelSaveProgress();
  assert.match(getProfile("bob").querySelector(".no-model-profile-error").textContent, /Sheet failed/);
  assert.equal(getProfile("alice").querySelector(".no-model-profile-error"), null);
  ctx.activeTabId = 8;
  ctx.renderNoModelSaveProgress();
  const nextTabProgress = node("profileList").querySelectorAll(
    ".no-model-profile-progress"
  );
  assert.equal(nextTabProgress.length, 3);
  assert.ok(nextTabProgress.every((progress) => progress.dataset.status === "idle"));
  assert.equal(node("profileList").querySelectorAll(".no-model-profile-cancel").length, 0);
  assert.ok(!html.includes('id="noModelProgressPanel"'));
});

test("No Model uses profile Cancel buttons instead of the header control", () => {
  assert.match(
    source,
    /const usesProfileCancelButtons = hasState && isNoModelSaveMode\(\)/
  );
  assert.match(
    source,
    /!hasState \|\| usesProfileCancelButtons/
  );
});

test("confirming a profile Delete removes only its Sheet row and keeps the resume", async () => {
  const profile = {
    id: "alice",
    name: "Alice",
    status: "saved",
    resumeUrl: "https://docs.google.com/document/d/resume/edit"
  };
  const report = {
    ownerTabId: 7,
    jobUrl: "https://jobs.example/1",
    profiles: [profile]
  };
  let sentMessage = null;
  let persisted = 0;
  const ctx = vm.createContext({
    console,
    Date,
    pendingNoModelDeleteTarget: {
      ownerTabId: 7,
      profileId: "alice",
      profileName: "Alice",
      jobUrl: report.jobUrl,
      resumeUrl: profile.resumeUrl
    },
    noModelProgressByTabId: { 7: report },
    setDeleteApplicationModalOpen: () => {},
    persistNoModelProgressReport: async () => { persisted += 1; },
    createRunId: () => "delete-run",
    showStatusForTab: () => {},
    addLogForTab: () => {},
    chrome: { runtime: { sendMessage: async (message) => {
      sentMessage = message;
      return { ok: true, removed: 1 };
    } } }
  });
  loadFunctions(source, ["confirmDeleteNoModelProfileApplication"], ctx);
  await ctx.confirmDeleteNoModelProfileApplication();
  assert.equal(sentMessage.type, "DELETE_APPLICATION_RECORD");
  assert.equal(sentMessage.profileName, "Alice");
  assert.equal(sentMessage.trashResume, false);
  assert.equal(profile.deleted, true);
  assert.equal(profile.deleting, false);
  assert.equal(persisted, 2);
});

test("profile cards are compact; prompt lists live only in Settings", () => {
  const start = html.indexOf('<section class="card profile-picker-card">');
  const home = html.slice(start, html.indexOf("</section>", start));
  assert.ok(!home.includes('id="promptResumeList"'));
  const modal = html.indexOf('id="profileResumeSettingsModal"');
  assert.ok(html.indexOf('id="promptResumeList"', modal) > modal);
  const { node } = fixture();
  assert.equal(node("profileList").querySelectorAll(".profile-item").length, 3);
  assert.equal(node("profileList").querySelectorAll(".profile-resume-settings").length, 3);
  assert.equal(node("profileList").querySelectorAll(".profile-auto-select").length, 3);
  assert.equal(node("profileList").querySelectorAll(".prompt-resume-item").length, 0);
  assert.equal(node("profileList").querySelectorAll(".profile-item-body").length, 0);
  assert.ok(!html.includes("workspace-save-progress-bar"));
  assert.ok(!html.includes("workspace-header-status"));
});

test("Settings shows only its profile, saves one selection, and preserves other profiles", async () => {
  const { ctx, node, profile } = fixture();
  await ctx.openProfileResumeSettingsModal("alice");
  assert.equal(node("promptResumeList").children.length, 2);
  assert.ok(node("profileResumeSettingsModalTitle").textContent.includes("Alice"));
  assert.equal(node("promptResumeList").querySelectorAll(".prompt-resume-auto-select").length, 0);
  await ctx.selectPromptResume("a1");
  await ctx.selectPromptResume("a2");
  assert.equal(profile("alice").selectedPromptResumeId, "a2");
  assert.equal(node("promptResumeList").querySelectorAll('input[type="radio"]:checked').length, 1);
  ctx.setProfileResumeSettingsModalOpen(false);
  await ctx.openProfileResumeSettingsModal("bob");
  assert.equal(node("promptResumeList").children.length, 1);
  await ctx.selectPromptResume("b1");
  assert.equal(profile("alice").selectedPromptResumeId, "a2");
  assert.equal(profile("bob").selectedPromptResumeId, "b1");
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], ["alice", "bob"]);
});

test("profile Auto follows its selected resume without changing another profile", async () => {
  const { ctx, profile } = fixture();
  await ctx.openProfileResumeSettingsModal("alice");
  await ctx.selectPromptResume("a1");
  ctx.setProfileResumeSettingsModalOpen(false);
  await ctx.toggleProfileAutoSelect("alice");
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], ["alice"]);
  assert.equal(profile("alice").promptResumes.find((r) => r.autoSelect).id, "a1");
  await ctx.openProfileResumeSettingsModal("alice");
  await ctx.selectPromptResume("a2");
  assert.deepEqual(profile("alice").promptResumes.filter((r) => r.autoSelect).map((r) => r.id), ["a2"]);
  assert.ok(!profile("bob").promptResumes.some((r) => r.autoSelect));
  ctx.setProfileResumeSettingsModalOpen(false);
  await ctx.toggleProfileAutoSelect("alice");
  assert.ok(!profile("alice").promptResumes.some((r) => r.autoSelect));
  assert.equal(profile("alice").selectedPromptResumeId, "a2");
  assert.ok(!ctx.profileSelectionState.selectedProfileIds.includes("alice"));
});

test("Add and Edit return to the same profile Settings after saving or cancelling", async () => {
  const { ctx, node, profile } = fixture();
  await ctx.openProfileResumeSettingsModal("alice");
  ctx.openAddPromptResumeModal();
  assert.ok(node("profileResumeSettingsModal").classList.contains("is-hidden"));
  assert.ok(!node("promptResumeFormModal").classList.contains("is-hidden"));
  node("promptResumeLabelInput").value = "Platform";
  node("promptResumeContentInput").value = "Alice platform text";
  await ctx.submitPromptResumeForm();
  assert.equal(profile("alice").promptResumes.length, 3);
  assert.equal(profile("bob").promptResumes.length, 1);
  assert.ok(!node("profileResumeSettingsModal").classList.contains("is-hidden"));
  await ctx.selectPromptResume("a1");
  ctx.openEditPromptResumeModal("a1");
  node("promptResumeContentInput").value = "Updated frontend text";
  await ctx.submitPromptResumeForm();
  assert.equal(profile("alice").promptResumes.find((r) => r.id === "a1").content, "Updated frontend text");
  ctx.openAddPromptResumeModal();
  ctx.setPromptResumeFormModalOpen(false);
  assert.ok(!node("profileResumeSettingsModal").classList.contains("is-hidden"));
});

test("per-tab modal restoration retains the profile and editor draft", async () => {
  const { ctx, node, profile, stored } = fixture();
  await ctx.openProfileResumeSettingsModal("alice");
  ctx.openAddPromptResumeModal();
  ctx.openManagedModalId = "profileResumeSettings";
  ctx.profileResumeSettingsProfileId = "bob";
  ctx.managedModalDrafts = {};
  ctx.restoreManagedModalState();
  assert.ok(node("profileResumeSettingsModalTitle").textContent.includes("Bob"));
  assert.ok(node("promptResumeFormModal").classList.contains("is-hidden"));
  stored().selectedProfileId = "bob";
  ctx.openManagedModalId = "promptResumeForm";
  ctx.profileResumeSettingsProfileId = "alice";
  ctx.promptResumeFormMode = "add";
  ctx.managedModalDrafts = {
    promptResumeLabelInput: "Restored draft",
    promptResumeContentInput: "Restored Alice text"
  };
  ctx.restoreManagedModalState();
  assert.ok(node("profileResumeSettingsModal").classList.contains("is-hidden"));
  assert.equal(node("promptResumeLabelInput").value, "Restored draft");
  await ctx.submitPromptResumeForm();
  assert.ok(profile("alice").promptResumes.some((r) => r.label === "Restored draft"));
  assert.ok(!profile("bob").promptResumes.some((r) => r.label === "Restored draft"));
  assert.ok(stored().profiles.find((p) => p.id === "alice").promptResumes.some((r) => r.label === "Restored draft"));
  assert.ok(!stored().profiles.find((p) => p.id === "bob").promptResumes.some((r) => r.label === "Restored draft"));
});

test("empty profiles can open Settings, while Auto requires a resume", async () => {
  const { ctx, node } = fixture();
  const row = node("profileList").children.find((item) => item.dataset.profileId === "empty");
  assert.equal(row.querySelector(".profile-auto-select").disabled, true);
  assert.equal(row.querySelector(".profile-resume-settings").disabled, false);
  await ctx.openProfileResumeSettingsModal("empty");
  assert.ok(node("promptResumeList").textContent.includes("No prompt resumes"));
});

test("busy state blocks settings, Auto, and prompt selection", async () => {
  const { ctx, node, profile } = fixture();
  ctx.areActionButtonsDisabled = true;
  ctx.renderProfileList();
  assert.ok(node("profileList").querySelectorAll(".profile-resume-settings").every((button) => button.disabled));
  await ctx.openProfileResumeSettingsModal("alice");
  await ctx.selectPromptResume("a1");
  await ctx.toggleProfileAutoSelect("alice");
  assert.equal(ctx.profileResumeSettingsProfileId, null);
  assert.equal(profile("alice").selectedPromptResumeId, "a1");
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], []);
});

test("a pending resume save cannot update or close a different profile's Settings", async () => {
  const { ctx, node, profile } = fixture();
  await ctx.openProfileResumeSettingsModal("alice");
  ctx.openAddPromptResumeModal();
  node("promptResumeLabelInput").value = "Pending Alice draft";
  node("promptResumeContentInput").value = "Alice content";
  const sendMessage = ctx.chrome.runtime.sendMessage;
  let release;
  ctx.chrome.runtime.sendMessage = async (message) => {
    const result = await sendMessage(message);
    if (message.type === "SAVE_PROMPT_RESUME_SELECTION") {
      await new Promise((resolve) => { release = resolve; });
    }
    return result;
  };
  const pending = ctx.submitPromptResumeForm();
  await new Promise(setImmediate);
  ctx.profileResumeSettingsProfileId = "bob";
  ctx.openManagedModalId = "profileResumeSettings";
  ctx.managedModalDrafts = {};
  ctx.restoreManagedModalState();
  release();
  await pending;
  assert.ok(profile("alice").promptResumes.some((r) => r.label === "Pending Alice draft"));
  assert.equal(profile("bob").promptResumes.length, 1);
  assert.ok(node("profileResumeSettingsModalTitle").textContent.includes("Bob"));
  assert.ok(!node("profileResumeSettingsModal").classList.contains("is-hidden"));
  assert.equal(node("promptResumeList").children.length, 1);
});

test("worker uses explicit profile IDs and keeps legacy requests compatible", async () => {
  const { stored } = fixture();
  const state = structuredClone(stored());
  state.selectedProfileId = "bob";
  const { ctx: worker, storage } = workerFixture(state);
  assert.equal((await worker.getPromptResumeSelectionState("alice")).promptResumes.length, 2);
  assert.equal((await worker.getPromptResumeSelectionState()).promptResumes[0].id, "b1");
  const updated = await worker.savePromptResumeSelectionState(
    [{ id: "new-a", label: "New Alice", content: "Alice content" }], "new-a", "alice"
  );
  assert.equal(updated.promptResumes[0].id, "new-a");
  assert.equal(storage.profileSelection.selectedProfileId, "bob");
  assert.equal(storage.profileSelection.profiles.find((p) => p.id === "bob").promptResumes[0].id, "b1");
  await assert.rejects(() => worker.getPromptResumeSelectionState("missing"));
  await assert.rejects(() => worker.savePromptResumeSelectionState([], "", "missing"));
});

test("UI and worker default missing or invalid assignments to the first valid resume", () => {
  const { ctx, stored } = fixture();
  const worker = workerFixture().ctx;
  for (const implementation of [ctx, worker]) {
    for (const selectedPromptResumeId of [undefined, "", "missing"]) {
      const state = structuredClone(stored());
      state.profiles[0].selectedPromptResumeId = selectedPromptResumeId;
      state.profiles[0].promptResumes.unshift({ id: "invalid", label: "", content: "" });
      const normalized = implementation.normalizeProfileSelectionState(state);
      assert.equal(normalized.profiles[0].selectedPromptResumeId, "a1");
      assert.equal(normalized.profiles[1].selectedPromptResumeId, "b1");
      assert.equal(normalized.profiles[2].selectedPromptResumeId, "");
      assert.deepEqual([...normalized.selectedProfileIds], []);
      assert.equal(normalized.selectionVersion, profileSelectionVersion);
    }
    const state = structuredClone(stored());
    state.profiles[0].selectedPromptResumeId = "a2";
    assert.equal(implementation.normalizeProfileSelectionState(state).profiles[0].selectedPromptResumeId, "a2");
  }
});

test("migrating saved V3 profiles keeps existing choices and does not check defaulted profiles", async () => {
  const { ctx, stored } = fixture();
  const state = structuredClone(stored());
  state.selectionVersion = 3;
  state.profiles[0].selectedPromptResumeId = "a2";
  state.profiles[1].selectedPromptResumeId = "";
  const { ctx: worker, storage } = workerFixture(state);
  for (const normalized of [ctx.normalizeProfileSelectionState(state), await worker.getProfileSelectionState()]) {
    assert.equal(normalized.profiles[0].selectedPromptResumeId, "a2");
    assert.equal(normalized.profiles[1].selectedPromptResumeId, "b1");
    assert.deepEqual([...normalized.selectedProfileIds], ["alice"]);
    assert.equal(normalized.selectionVersion, profileSelectionVersion);
  }
  assert.equal(storage.profileSelection.selectionVersion, profileSelectionVersion);
  assert.equal(storage.profileSelection.profiles[1].selectedPromptResumeId, "b1");
  assert.deepEqual([...((await worker.getProfileSelectionState()).selectedProfileIds)], ["alice"]);
});

test("unchecking and rechecking a profile retains its assigned resume", async () => {
  const { ctx, profile, stored } = fixture();
  await ctx.openProfileResumeSettingsModal("alice");
  await ctx.selectPromptResume("a2");
  ctx.setProfileResumeSettingsModalOpen(false);
  await ctx.toggleProfileSelection("alice");
  assert.equal(profile("alice").selectedPromptResumeId, "a2");
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], []);
  assert.equal(stored().profiles[0].selectedPromptResumeId, "a2");
  await ctx.toggleProfileSelection("alice");
  assert.equal(profile("alice").selectedPromptResumeId, "a2");
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], ["alice"]);
});

test("adding the first resume assigns it automatically without checking other profiles", async () => {
  const { ctx, node, profile, stored } = fixture();
  await ctx.openProfileResumeSettingsModal("empty");
  ctx.openAddPromptResumeModal();
  node("promptResumeLabelInput").value = "First resume";
  node("promptResumeContentInput").value = "My resume text";
  await ctx.submitPromptResumeForm();
  assert.equal(profile("empty").selectedPromptResumeId, profile("empty").promptResumes[0].id);
  assert.equal(node("promptResumeList").querySelectorAll('input[type="radio"]:checked').length, 1);
  assert.deepEqual([...ctx.profileSelectionState.selectedProfileIds], []);
  assert.equal(stored().profiles[2].selectedPromptResumeId, profile("empty").selectedPromptResumeId);
  assert.equal(node("profileList").children[2].querySelector(".profile-auto-select").disabled, false);
});

test("removing the assigned resume selects the first remaining one and keeps Auto", async () => {
  const { ctx, node, profile, stored } = fixture();
  await ctx.toggleProfileAutoSelect("alice");
  await ctx.openProfileResumeSettingsModal("alice");
  await ctx.selectPromptResume("a2");
  await ctx.removePromptResume("a2");
  assert.equal(profile("alice").selectedPromptResumeId, "a1");
  assert.equal(profile("alice").promptResumes[0].autoSelect, true);
  assert.equal(stored().profiles[0].selectedPromptResumeId, "a1");
  assert.equal(node("promptResumeList").querySelectorAll('input[type="radio"]:checked').length, 1);
  assert.equal(node("promptResumeList").querySelector(".prompt-resume-remove").disabled, true);
  await ctx.removePromptResume("a1");
  assert.equal(profile("alice").promptResumes.length, 1);
  assert.equal(stored().profiles[0].promptResumes.length, 1);
});

test("worker rejects removing the last resume and repairs an invalid assignment on save", async () => {
  const { stored } = fixture();
  const { ctx, storage } = workerFixture(stored());
  await assert.rejects(() => ctx.savePromptResumeSelectionState([], "", "bob"), /at least one/);
  assert.equal(storage.profileSelection.profiles[1].promptResumes.length, 1);
  const result = await ctx.savePromptResumeSelectionState(stored().profiles[0].promptResumes, "missing", "alice");
  assert.equal(result.selectedPromptResumeId, "a1");
  assert.deepEqual([...storage.profileSelection.selectedProfileIds], []);
});

test("after saving, manual and Auto profile selections remain checked", async () => {
  const { stored } = fixture();
  const state = structuredClone(stored());
  state.profiles[0].selectedPromptResumeId = "a2";
  state.profiles[1].promptResumes[0].autoSelect = true;
  state.selectedProfileIds = ["alice", "bob"];
  const { ctx, storage, messages } = workerFixture(state);
  storage.jobDescription = "Clear this job description";
  await ctx.resetApplicationInputsAfterSave();
  const saved = storage.profileSelection;
  assert.equal(saved.profiles[0].selectedPromptResumeId, "a2");
  assert.equal(saved.profiles[1].selectedPromptResumeId, "b1");
  assert.deepEqual([...saved.selectedProfileIds], ["alice", "bob"]);
  assert.equal(storage.jobDescription, "");
  assert.equal(messages[0].type, "APPLICATION_INPUTS_RESET");
});

test("legacy resumes and current records with missing assignments get persisted defaults", async () => {
  const legacy = workerFixture();
  legacy.storage.resumeSelection = {
    templates: [{ id: "legacy", label: "Legacy resume", content: "Legacy text" }]
  };
  const migrated = await legacy.ctx.getProfileSelectionState();
  assert.equal(migrated.profiles[0].selectedPromptResumeId, "legacy");
  assert.equal(legacy.storage.profileSelection.profiles[0].selectedPromptResumeId, "legacy");
  assert.deepEqual([...migrated.selectedProfileIds], []);
  assert.ok(!legacy.storage.resumeSelection);
  const { stored } = fixture();
  const state = structuredClone(stored());
  state.profiles[0].selectedPromptResumeId = "";
  const current = workerFixture(state);
  await current.ctx.getProfileSelectionState();
  assert.equal(current.storage.profileSelection.profiles[0].selectedPromptResumeId, "a1");
});
