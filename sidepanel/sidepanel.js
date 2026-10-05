// Make a resume: import application rows and manage their document workspaces.
const RESUME_SESSION_STORAGE_KEY = "resumeWorkspaceSession";
const $ = id => document.getElementById(id);
const workspacesByTabId = new Map();
const tabStates = new Map();
let activeTabId = null;
let activeTabUrl = "";
let panelWindowId = null;
let persistTimer = null;
let isReady = false;

function normalizeSplitWindowUrl(value, label) {
  const raw = String(value || "").trim();
  if (!raw) {
    throw new Error(`${label} URL is required.`);
  }

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  if (hasScheme && !/^https?:\/\//i.test(raw)) {
    throw new Error(`${label} URL must use http:// or https://.`);
  }

  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch (_error) {
    throw new Error(`${label} URL is not valid.`);
  }

  if (!parsed.hostname || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${label} URL must be a valid web address.`);
  }

  return parsed.href;
}

function unwrapMarkdownEmphasis(value) {
  const raw = String(value || "").trim();
  const wrappedMatch = raw.match(/^(\*\*|__)([\s\S]+)\1$/);
  return wrappedMatch ? wrappedMatch[2].trim() : raw;
}

function parseSplitWindowUrlField(value, label) {
  const raw = String(value || "").trim();
  const markdownLinkMatch = raw.match(
    /\]\(\s*(https?:\/\/[\s\S]+)\s*\)\s*$/i
  );
  const candidate = markdownLinkMatch
    ? markdownLinkMatch[1].trim()
    : unwrapMarkdownEmphasis(raw);

  return normalizeSplitWindowUrl(candidate.replace(/\\_/g, "_"), label);
}

function isSavedApplicationSheetHeader(fields) {
  if (!Array.isArray(fields) || fields.length < 6) return false;

  const normalized = fields.map((field) =>
    String(field || "").trim().toLowerCase()
  );
  return (
    normalized[0] === "iso timestamp" &&
    normalized[1] === "job-page title" &&
    normalized[2] === "profile name" &&
    /ai|chat/i.test(normalized[3]) &&
    /job.*url/i.test(normalized[4]) &&
    normalized[5].includes("resume")
  );
}

function parseSplitWindowUrls(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    throw new Error("Drop or paste application details before continuing.");
  }

  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line && !line.startsWith("#") && !/^[-=_]{3,}$/.test(line)
    );

  const pairs = rows
    .map((row, index) => {
      const entryNumber = index + 1;
      const fields = row.split("\t").map((field) => field.trim());
      if (isSavedApplicationSheetHeader(fields)) return null;

      const isSavedSheetRow = fields.length === 6 || fields.length === 7;
      if (!isSavedSheetRow && fields.length !== 4) {
        throw new Error(
          "Entry " +
            entryNumber +
            " must contain either the six or seven tab-separated Google Sheet columns (A-F or A-G), or the older four-field Profile, Chat, Job, Google Doc format."
        );
      }

      const profileIndex = isSavedSheetRow ? 2 : 0;
      const chatIndex = isSavedSheetRow ? 3 : 1;
      const jobIndex = isSavedSheetRow ? 4 : 2;
      const resumeIndex = isSavedSheetRow ? 5 : 3;
      const jobTitle = isSavedSheetRow
        ? unwrapMarkdownEmphasis(fields[1])
        : "";
      const profileName = unwrapMarkdownEmphasis(
        fields[profileIndex].replace(/^[-+]\s+/, "")
      );
      if (!profileName) {
        throw new Error(
          "Entry " +
            entryNumber +
            "'s " +
            (isSavedSheetRow ? "column C profile name" : "profile name") +
            " is required."
        );
      }

      const chatField = String(fields[chatIndex] || "").trim();
      const isNoModelRow =
        isSavedSheetRow && chatField.toLocaleLowerCase() === "no model";
      const chatUrl = isSavedSheetRow && (!chatField || isNoModelRow) ? "" : parseSplitWindowUrlField(
        chatField,
        "Entry " +
          entryNumber +
          " " +
          (isSavedSheetRow ? "column D Chat" : "Chat")
      );
      const jobUrl = parseSplitWindowUrlField(
        fields[jobIndex],
        "Entry " +
          entryNumber +
          " " +
          (isSavedSheetRow ? "column E Job" : "Job")
      );
      const resumeUrl = parseSplitWindowUrlField(
        fields[resumeIndex],
        "Entry " +
          entryNumber +
          " " +
          (isSavedSheetRow ? "column F Google Doc" : "Google Doc")
      );

      if (isSupportedAiUrl(jobUrl) || isGoogleDocsUrl(jobUrl)) {
        throw new Error(
          "Entry " +
            entryNumber +
            "'s " +
            (isSavedSheetRow ? "column E" : "third field") +
            " must be the job page URL."
        );
      }
      if (!isGoogleDocsUrl(resumeUrl)) {
        throw new Error(
          "Entry " +
            entryNumber +
            "'s " +
            (isSavedSheetRow ? "column F" : "fourth field") +
            " must be a Google Docs document URL."
        );
      }

      return { profileName, jobTitle, chatUrl, jobUrl, resumeUrl };
    })
    .filter(Boolean);

  if (!pairs.length) {
    throw new Error("No application rows were found in the pasted text.");
  }

  return { pairs };
}

function isGoogleDocsUrl(url = "") {
  try {
    const parsed = new URL(String(url || ""));
    return (
      parsed.hostname === "docs.google.com" &&
      /\/document\/(?:u\/\d+\/)?d\/[a-zA-Z0-9-_]+/.test(parsed.pathname)
    );
  } catch (_error) {
    return false;
  }
}

function isGoogleSheetsDocumentUrl(url = "") {
  try {
    const parsed = new URL(String(url || ""));
    return (
      parsed.hostname === "docs.google.com" &&
      /\/spreadsheets\/(?:u\/\d+\/)?d\/[a-zA-Z0-9-_]+/.test(parsed.pathname)
    );
  } catch (_error) {
    return false;
  }
}

function isSupportedAiUrl(url = "") {
  try {
    const hostname = new URL(String(url || "")).hostname.toLowerCase();
    return (
      hostname === "chatgpt.com" ||
      hostname.endsWith(".chatgpt.com") ||
      hostname === "chat.openai.com" ||
      hostname.endsWith(".chat.openai.com") ||
      hostname === "chat.deepseek.com"
    );
  } catch (_error) {
    return false;
  }
}

function getTabState(tabId = activeTabId) {
  if (!Number.isInteger(tabId)) return null;
  if (!tabStates.has(tabId)) tabStates.set(tabId, {
    logs: [], draft: "", dialogOpen: false, showWorkspace: false,
    sendTextDraft: "", resumeDraft: "", pickupWindowIds: [], busy: false
  });
  return tabStates.get(tabId);
}

function captureDrafts() {
  const state = getTabState();
  if (!state) return;
  state.draft = $("splitWindowUrlsInput").value;
  state.sendTextDraft = $("applicationWorkspaceAiSendInput").value;
  state.resumeDraft = $("buildResumeContextInput").value;
}

function persistSession() {
  const tabs = Object.fromEntries([...tabStates].map(([id, state]) => [id, { ...state, busy: false }]));
  return chrome.storage.session.set({ [RESUME_SESSION_STORAGE_KEY]: {
    workspaces: Object.fromEntries(workspacesByTabId), tabs
  } });
}

function schedulePersistSession() {
  if (persistTimer !== null) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistSession().catch(console.error);
  }, 100);
}

async function restoreSession() {
  const stored = await chrome.storage.session.get([RESUME_SESSION_STORAGE_KEY, "tabSessionById"]);
  const session = stored[RESUME_SESSION_STORAGE_KEY];
  const openIds = new Set((await chrome.tabs.query({})).map(tab => tab.id));
  if (session) {
    for (const [id, workspace] of Object.entries(session.workspaces || {})) {
      if (openIds.has(Number(id))) workspacesByTabId.set(Number(id), workspace);
    }
    for (const [id, state] of Object.entries(session.tabs || {})) {
      if (openIds.has(Number(id))) tabStates.set(Number(id), { ...getTabState(Number(id)), ...state, busy: false });
    }
  } else {
    // Import only workspaces created by Make a resume in older releases.
    for (const [id, workspace] of Object.entries(stored.tabSessionById?.workspaces || {})) {
      if (!openIds.has(Number(id)) || workspace.sessionType !== "make-resume") continue;
      workspacesByTabId.set(Number(id), {
        profileName: String(workspace.profileName || "Applicant"),
        jobTitle: String(workspace.jobTitle || ""),
        jobUrl: String(workspace.recordJobUrl || workspace.originalJobUrl || ""),
        chatUrl: String(workspace.chatGptUrl || ""),
        resumeUrl: String(workspace.resumeUrl || "")
      });
      getTabState(Number(id)).showWorkspace = true;
    }
  }
}

function addLogForTab(tabId, level, message, timestamp = new Date().toLocaleTimeString()) {
  const state = getTabState(tabId);
  if (!state) return;
  state.logs.unshift({ level, message, timestamp });
  state.logs = state.logs.slice(0, 200);
  if (tabId === activeTabId) renderLogs();
  schedulePersistSession();
}

function showStatus(message, isError = false, tabId = activeTabId) {
  addLogForTab(tabId, isError ? "error" : "success", message);
  if (tabId !== activeTabId) return;
  const toast = $("actionResultToast");
  toast.textContent = message;
  toast.className = `save-result-toast is-visible ${isError ? "is-error" : "is-success"}`;
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(() => toast.classList.remove("is-visible"), 4000);
}

function renderLogs() {
  const logs = getTabState()?.logs || [];
  $("emptyLogs").classList.toggle("is-hidden", logs.length > 0);
  $("logsList").replaceChildren(...logs.map(entry => {
    const item = document.createElement("li");
    item.className = `log-item is-${entry.level}`;
    const time = document.createElement("time");
    time.textContent = entry.timestamp;
    const message = document.createElement("span");
    message.textContent = entry.message;
    item.append(time, message);
    return item;
  }));
}

function setModalOpen(id, open) {
  $(id).classList.toggle("is-hidden", !open);
  $(id).setAttribute("aria-hidden", String(!open));
}

function providerIdForUrl(url) {
  try { return new URL(url).hostname === "chat.deepseek.com" ? "deepseek" : "chatgpt"; }
  catch { return "chatgpt"; }
}

function render() {
  const state = getTabState();
  if (!state) return;
  const workspace = workspacesByTabId.get(activeTabId);
  const showWorkspace = state.showWorkspace && !state.dialogOpen;
  const panel = $("splitWindowsModal");
  document.querySelector(".app").classList.toggle("is-workspace-hidden", showWorkspace);
  $("homeWorkspaceSwitcher").classList.toggle("is-hidden", state.dialogOpen);
  $("homeWorkspaceSwitcher").setAttribute("aria-hidden", String(state.dialogOpen));
  $("openSplitWindowsButton").disabled = state.busy || !isGoogleSheetsDocumentUrl(activeTabUrl);
  $("openSplitWindowsButton").title = isGoogleSheetsDocumentUrl(activeTabUrl)
    ? "Make a resume" : "Make a resume is available only when the current tab is a Google Sheet.";
  panel.classList.toggle("is-workspace-page", showWorkspace);
  panel.classList.toggle("is-hidden", !state.dialogOpen && !showWorkspace);
  panel.setAttribute("aria-hidden", String(!state.dialogOpen && !showWorkspace));
  panel.setAttribute("role", state.dialogOpen ? "dialog" : "region");
  if (state.dialogOpen) panel.setAttribute("aria-modal", "true"); else panel.removeAttribute("aria-modal");
  $("splitWindowsModalTitle").textContent = state.dialogOpen ? "Make a resume"
    : workspace ? `Application workspace ${workspace.profileName}` : "Application workspace";
  $("splitWindowsModalCloseButton").setAttribute("aria-label", state.dialogOpen ? "Close" : "Exchange with Home workspace");
  $("splitWindowsInputView").classList.toggle("is-hidden", !state.dialogOpen);
  $("splitWindowsPreviewView").classList.toggle("is-hidden", !showWorkspace);
  $("splitWindowsModalOpenButton").disabled = state.busy;
  $("splitWindowsModalCancelButton").disabled = state.busy;
  $("splitWindowUrlsInput").disabled = state.busy;
  $("splitWindowUrlsInput").value = state.draft;
  $("applicationWorkspaceAiSendInput").value = state.sendTextDraft;
  $("buildResumeContextInput").value = state.resumeDraft;
  const resumeUrl = workspace?.resumeUrl || "";
  $("applicationWorkspaceUrlInput").value = resumeUrl;
  $("splitWindowsPreviewUrl").textContent = resumeUrl;
  $("splitWindowsPreviewEmptyState").classList.toggle("is-hidden", Boolean(resumeUrl));
  const frame = $("splitWindowsPreviewFrame");
  frame.classList.toggle("is-hidden", !resumeUrl);
  const nextUrl = showWorkspace && resumeUrl ? resumeUrl : "about:blank";
  if (frame.getAttribute("src") !== nextUrl) frame.src = nextUrl;
  $("applicationWorkspaceRecordJobUrl").textContent = workspace?.jobUrl || "";
  $("applicationWorkspaceJobGptUrl").textContent = workspace?.chatUrl || "";
  $("applicationWorkspaceRecordJobLocation").classList.toggle("is-hidden", !workspace?.jobUrl);
  $("applicationWorkspaceJobGptLocation").classList.toggle("is-hidden", !workspace?.chatUrl);
  $("applicationWorkspaceAiSend").classList.toggle("is-hidden", !isSupportedAiUrl(workspace?.chatUrl));
  $("applicationWorkspaceJobGptCopyContentButton").classList.toggle("is-hidden", !isGoogleDocsUrl(workspace?.chatUrl));
  $("resumeWorkspaceActions").classList.toggle("is-hidden", !showWorkspace);
  // Keep the existing temporary restriction on Build resume.
  $("resumeWorkspaceBuildButton").disabled = true;
  $("resumeWorkspaceDownloadButton").disabled = state.busy || !resumeUrl;
  $("applicationWorkspaceAiSendButton").disabled = state.busy || !state.sendTextDraft.trim();
  $("applicationWorkspaceAiSendInput").disabled = state.busy;
  $("applicationWorkspaceRefreshButton").disabled = state.busy || !workspace;
  for (const [kind, prefix, url] of workspaceUrlControls(workspace)) {
    $(prefix + "PickupButton").classList.toggle("is-hidden", !url);
    $(prefix + "PickupButton").disabled = state.busy || !url;
    $(prefix + "Copy" + (kind === "resume" ? "Url" : "") + "Button").disabled = !url;
    $(prefix + "ClosePickupButton").classList.add("is-hidden");
  }
  if (workspace?.chatUrl) $("applicationWorkspaceJobGptCopyContentButton").disabled = state.busy;
  $("applicationWorkspaceUrlInput").disabled = state.busy || !workspace;
  renderLogs();
  updatePickupCloseButtons().catch(console.error);
}

function workspaceUrlControls(workspace) {
  return [
    ["job", "applicationWorkspaceRecordJob", workspace?.jobUrl || ""],
    ["chat", "applicationWorkspaceJobGpt", workspace?.chatUrl || ""],
    ["resume", "applicationWorkspace", workspace?.resumeUrl || ""]
  ];
}

async function request(type, options = {}, ownerTabId = activeTabId) {
  const response = await chrome.runtime.sendMessage({ type, ...options, ownerTabId, runId: crypto.randomUUID() });
  if (!response?.ok) throw new Error(response?.error || "The requested action failed.");
  return response;
}

async function openSplitWindowsModal() {
  const ownerTabId = activeTabId;
  const state = getTabState(ownerTabId);
  if (!state || state.busy || !isGoogleSheetsDocumentUrl(activeTabUrl)) return;
  await request("CHECK_GOOGLE_SHEET_OPEN", {}, ownerTabId).then(response => {
    if (!response.open) throw new Error("Open a Google Sheet before making a resume.");
    state.dialogOpen = true;
    if (activeTabId === ownerTabId) { render(); $("splitWindowUrlsInput").focus(); }
    schedulePersistSession();
  });
}

async function openSplitWindows() {
  captureDrafts();
  const ownerTabId = activeTabId;
  const state = getTabState(ownerTabId);
  if (!state || state.busy) return;
  const { pairs } = parseSplitWindowUrls(state.draft);
  state.busy = true;
  render();
  let opened = 0;
  try {
    const sheet = await request("CHECK_GOOGLE_SHEET_OPEN", {}, ownerTabId);
    if (!sheet.open) throw new Error("Open a Google Sheet before continuing.");
    for (const pair of pairs) {
      const response = await request("OPEN_URL_IN_NEW_TAB", { url: pair.jobUrl }, ownerTabId);
      workspacesByTabId.set(response.tabId, { ...pair });
      getTabState(response.tabId).showWorkspace = true;
      opened++;
      if (activeTabId === response.tabId) render();
      schedulePersistSession();
    }
    state.dialogOpen = false;
    state.draft = "";
    showStatus(`Opened ${opened} application workspace${opened === 1 ? "" : "s"}.`, false, ownerTabId);
  } catch (error) {
    showStatus(`${opened ? `Opened ${opened} workspace(s). ` : ""}${error.message}`, true, ownerTabId);
  } finally {
    state.busy = false;
    schedulePersistSession();
    await syncActiveTab();
  }
}

async function syncActiveTab() {
  const [tab] = await chrome.tabs.query(panelWindowId === null
    ? { active: true, lastFocusedWindow: true } : { active: true, windowId: panelWindowId });
  if (!Number.isInteger(tab?.id)) return;
  if (tab.id !== activeTabId) captureDrafts();
  activeTabId = tab.id;
  activeTabUrl = tab.url || "";
  panelWindowId = tab.windowId;
  $("actionResultToast").classList.remove("is-visible");
  setModalOpen("downloadResumeActionSettingsModal", false);
  setModalOpen("buildResumeContextModal", false);
  render();
}

async function runWorkspaceAction(action) {
  captureDrafts();
  const ownerTabId = activeTabId;
  const state = getTabState(ownerTabId);
  const workspace = workspacesByTabId.get(ownerTabId);
  if (!state || !workspace || state.busy) return;
  state.busy = true;
  render();
  try { await action(workspace, state, ownerTabId); }
  catch (error) { showStatus(error.message, true, ownerTabId); }
  finally {
    state.busy = false;
    schedulePersistSession();
    if (activeTabId === ownerTabId) render();
  }
}

async function findPickedUpWindowForUrl(url) {
  if (!url) return null;
  const key = url.replace(/\/$/, "");
  for (const window of await chrome.windows.getAll({ populate: true, windowTypes: ["normal"] })) {
    if (window.id === panelWindowId) continue;
    const tab = window.tabs?.find(tab => String(tab.url || tab.pendingUrl || "").replace(/\/$/, "") === key);
    if (tab) return { windowId: window.id, tabId: tab.id };
  }
  return null;
}

async function updatePickupCloseButtons() {
  const ownerTabId = activeTabId;
  for (const [, prefix, url] of workspaceUrlControls(workspacesByTabId.get(ownerTabId))) {
    const picked = await findPickedUpWindowForUrl(url);
    if (activeTabId !== ownerTabId) return;
    $(prefix + "ClosePickupButton").classList.toggle("is-hidden", !picked);
  }
}

async function pickupWorkspaceUrl(kind) {
  await runWorkspaceAction(async (workspace, state, ownerTabId) => {
    const url = workspace[kind + "Url"];
    if (!url) return;
    const response = await request("OPEN_URL_IN_RIGHT_WINDOW", { url, sourceWindowId: panelWindowId }, ownerTabId);
    if (!state.pickupWindowIds.includes(response.windowId)) state.pickupWindowIds.push(response.windowId);
  });
}

async function closeWorkspacePickup(kind) {
  const workspace = workspacesByTabId.get(activeTabId);
  const picked = await findPickedUpWindowForUrl(workspace?.[kind + "Url"]);
  if (!picked) return;
  await request("CLOSE_PICKUP_WINDOW", { windowId: picked.windowId });
  for (const state of tabStates.values()) state.pickupWindowIds = state.pickupWindowIds.filter(id => id !== picked.windowId);
  schedulePersistSession();
  await updatePickupCloseButtons();
}

async function sendApplicationWorkspaceTextToPickedUpAiTab() {
  await runWorkspaceAction(async (workspace, state, ownerTabId) => {
    const text = state.sendTextDraft.trim();
    if (!text || !isSupportedAiUrl(workspace.chatUrl)) return;
    const response = await request("OPEN_URL_IN_RIGHT_WINDOW", { url: workspace.chatUrl, sourceWindowId: panelWindowId }, ownerTabId);
    const pickedUpTab = { tabId: response.tabId };
    if (!state.pickupWindowIds.includes(response.windowId)) state.pickupWindowIds.push(response.windowId);
    await request("SEND_TEXT_TO_AI_TAB", {
      tabId: pickedUpTab.tabId, url: workspace.chatUrl, text,
      aiProviderId: providerIdForUrl(workspace.chatUrl)
    }, ownerTabId);
    state.sendTextDraft = "";
    showStatus("Text sent to the imported conversation.", false, ownerTabId);
  });
}

async function downloadWorkspaceResume() {
  await runWorkspaceAction(async (workspace, _state, ownerTabId) => {
    const response = await request("DOWNLOAD_RESUME_PDF", { documentUrl: workspace.resumeUrl, profileName: workspace.profileName }, ownerTabId);
    showStatus(`Download started: ${response.filename}`, false, ownerTabId);
  });
}

async function refreshResumeUrl() {
  const ownerTabId = activeTabId;
  const workspace = workspacesByTabId.get(ownerTabId);
  if (!workspace || getTabState()?.busy) return;
  const url = normalizeSplitWindowUrl($("applicationWorkspaceUrlInput").value, "Resume");
  if (!isGoogleDocsUrl(url)) throw new Error("The resume must be a Google Docs document URL.");
  workspace.resumeUrl = url;
  render();
  $("splitWindowsPreviewFrame").src = url;
  schedulePersistSession();
}

async function refreshDownloadHotkey() {
  try {
    const commands = await chrome.commands.getAll();
    $("downloadResumeHotkeyValue").textContent = commands.find(command => command.name === "download-resume")?.shortcut || "Not assigned";
  } catch { $("downloadResumeHotkeyValue").textContent = "Unavailable"; }
}

function on(id, event, handler) {
  $(id)?.addEventListener(event, (...args) => {
    Promise.resolve().then(() => handler(...args)).catch(error => showStatus(error.message, true));
  });
}
on("openSplitWindowsButton", "click", openSplitWindowsModal);
on("splitWindowsModalOpenButton", "click", openSplitWindows);
on("splitWindowUrlsInput", "input", () => { captureDrafts(); schedulePersistSession(); });
on("applicationWorkspaceAiSendInput", "input", () => {
  captureDrafts();
  $("applicationWorkspaceAiSendButton").disabled = getTabState().busy || !getTabState().sendTextDraft.trim();
  schedulePersistSession();
});
function closeImportDialog() {
  const state = getTabState();
  if (state.busy) return;
  captureDrafts(); state.dialogOpen = false; render(); schedulePersistSession();
  $("openSplitWindowsButton").focus();
}
on("splitWindowsModalCancelButton", "click", closeImportDialog);
on("splitWindowsModalBackdrop", "click", closeImportDialog);
on("splitWindowsModalCloseButton", "click", () => {
  if (getTabState().dialogOpen) closeImportDialog();
  else { captureDrafts(); getTabState().showWorkspace = false; render(); schedulePersistSession(); }
});
on("homeWorkspaceExchangeButton", "click", () => {
  captureDrafts(); getTabState().showWorkspace = true; render(); schedulePersistSession();
});
on("clearLogsButton", "click", () => { getTabState().logs = []; renderLogs(); schedulePersistSession(); });
for (const [kind, prefix] of workspaceUrlControls()) {
  on(prefix + "PickupButton", "click", () => pickupWorkspaceUrl(kind));
  on(prefix + "ClosePickupButton", "click", () => closeWorkspacePickup(kind));
  on(prefix + "Copy" + (kind === "resume" ? "Url" : "") + "Button", "click", async () => {
    const workspace = workspacesByTabId.get(activeTabId);
    const url = kind === "resume" ? $("applicationWorkspaceUrlInput").value : workspace?.[kind + "Url"];
    if (url) await navigator.clipboard.writeText(url);
  });
}
on("applicationWorkspaceJobGptCopyContentButton", "click", () => runWorkspaceAction(async (workspace, _state, ownerTabId) => {
  const response = await request("READ_GOOGLE_DOC_TEXT", { documentUrl: workspace.chatUrl }, ownerTabId);
  await navigator.clipboard.writeText(response.text);
  showStatus("Document text copied.", false, ownerTabId);
}));
on("applicationWorkspaceAiSendButton", "click", sendApplicationWorkspaceTextToPickedUpAiTab);
on("resumeWorkspaceDownloadButton", "click", downloadWorkspaceResume);
on("applicationWorkspaceRefreshButton", "click", refreshResumeUrl);
on("applicationWorkspaceUrlInput", "keydown", event => { if (event.key === "Enter") { event.preventDefault(); return refreshResumeUrl(); } });
on("resumeWorkspaceDownloadOptionsButton", "click", () => { setModalOpen("downloadResumeActionSettingsModal", true); refreshDownloadHotkey(); });
for (const id of ["downloadResumeActionSettingsModalBackdrop", "downloadResumeActionSettingsModalCloseButton", "downloadResumeActionSettingsDoneButton"]) {
  on(id, "click", () => { setModalOpen("downloadResumeActionSettingsModal", false); $("resumeWorkspaceDownloadOptionsButton").focus(); });
}
on("downloadResumeCurrentSettingsButton", "click", () => { setModalOpen("downloadResumeActionSettingsModal", false); return downloadWorkspaceResume(); });
on("downloadResumeAssignHotkeyButton", "click", () => chrome.tabs.create({ url: "chrome://extensions/shortcuts" }));
for (const id of ["buildResumeContextModalBackdrop", "buildResumeContextModalCloseButton", "buildResumeContextCancelButton"]) on(id, "click", () => setModalOpen("buildResumeContextModal", false));
on("buildResumeContextInput", "input", () => { captureDrafts(); schedulePersistSession(); });
on("buildResumeContextSubmitButton", "click", () => runWorkspaceAction(async (workspace, state, ownerTabId) => {
  const response = await request("UPDATE_WORKSPACE_RESUME_CONTEXT", { resumeUrl: workspace.resumeUrl, resumeText: state.resumeDraft }, ownerTabId);
  workspace.resumeUrl = response.url;
  state.resumeDraft = "";
  if (ownerTabId === activeTabId) setModalOpen("buildResumeContextModal", false);
}));

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    for (const id of ["downloadResumeActionSettingsModal", "buildResumeContextModal"]) setModalOpen(id, false);
    if (getTabState()?.dialogOpen) closeImportDialog();
  }
  const editable = event.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
  if (!event.defaultPrevented && !event.repeat && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "a" && !editable && getTabState()?.showWorkspace && workspacesByTabId.get(activeTabId)?.resumeUrl) {
    event.preventDefault(); pickupWorkspaceUrl("resume").catch(error => showStatus(error.message, true));
  }
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "RESUME_PROCESS_LOG") {
    if (Number.isInteger(message.ownerTabId)) addLogForTab(message.ownerTabId, message.level, message.message, message.timestamp);
  } else if (message?.type === "APP_ACTION_COMMAND" && message.ownerTabId === activeTabId) {
    const action = message.action === "make-resume" ? openSplitWindowsModal
      : message.action === "download-resume" ? downloadWorkspaceResume : null;
    action?.().catch(error => showStatus(error.message, true));
  } else if (message?.type === "SIDE_PANEL_PING") sendResponse({ open: isReady, activeTabId });
});
chrome.tabs.onActivated.addListener(info => {
  if (info.windowId === panelWindowId) syncActiveTab().catch(console.error);
});
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (tabId !== activeTabId || !(change.url || change.status === "complete")) return;
  activeTabUrl = change.url || tab.url || ""; captureDrafts(); render();
});
chrome.tabs.onRemoved.addListener(tabId => {
  const pickupWindowIds = tabStates.get(tabId)?.pickupWindowIds || [];
  Promise.allSettled(pickupWindowIds.map(windowId => request("CLOSE_PICKUP_WINDOW", { windowId }, tabId)));
  workspacesByTabId.delete(tabId);
  tabStates.delete(tabId);
  schedulePersistSession();
  if (tabId === activeTabId) { activeTabId = null; syncActiveTab().catch(console.error); }
});
chrome.windows.onRemoved.addListener(windowId => {
  for (const state of tabStates.values()) state.pickupWindowIds = state.pickupWindowIds.filter(id => id !== windowId);
  schedulePersistSession(); updatePickupCloseButtons().catch(console.error);
});
window.addEventListener("focus", () => { if (isReady) syncActiveTab().catch(console.error); });
window.addEventListener("pagehide", () => { captureDrafts(); persistSession().catch(console.error); });

async function initialize() {
  await restoreSession();
  await syncActiveTab();
  isReady = true;
  if (isGoogleSheetsDocumentUrl(activeTabUrl)) await openSplitWindowsModal();
}
initialize().catch(error => { console.error(error); showStatus(error.message, true); });
