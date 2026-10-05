const saveButton = document.querySelector("#saveButton");
const saveResultToast = document.querySelector("#saveResultToast");
const saveOptionsButton = document.querySelector("#saveOptionsButton");
const openSplitWindowsButton = document.querySelector("#openSplitWindowsButton");
const makeResumeOptionsButton = document.querySelector("#makeResumeOptionsButton");
const openGoogleSheetButton = document.querySelector("#openGoogleSheetButton");
const checkPostingButton = document.querySelector("#checkPostingButton");
const playButton = document.querySelector("#playButton");
const playPostingTabCountInput = document.querySelector("#playPostingTabCountInput");
const playPostingHotkeyValue = document.querySelector("#playPostingHotkeyValue");
const playPostingAssignHotkeyButton = document.querySelector("#playPostingAssignHotkeyButton");
const PLAY_POSTING_BATCH_STORAGE_KEY = "playPostingBatch";
let playPostingBatchState = null;
const makeOrOpenAiTabButton = document.querySelector("#makeOrOpenAiTabButton");
const checkPostingOptionsButton = document.querySelector("#checkPostingOptionsButton");
const checkPostingAutoNextTabInput = document.querySelector("#checkPostingAutoNextTabInput");
const CHECK_POSTING_AI_PROVIDER_IDS = ["copilot", "perplexity", "deepseek"];
const jobrightOpenCountInput = document.querySelector("#jobrightOpenCountInput");
const openJobrightJobsButton = document.querySelector("#openJobrightJobsButton");
const openJobrightOptionsButton = document.querySelector("#openJobrightOptionsButton");
const saveWorkspaceDownloadOptionsButton = document.querySelector(
  "#saveWorkspaceDownloadOptionsButton"
);
const saveAssignHotkeyButton = document.querySelector("#saveAssignHotkeyButton");
const saveHotkeyValue = document.querySelector("#saveHotkeyValue");
const aiProviderInput = document.querySelector("#aiProviderInput");
const makeResumeCurrentSettingsButton = document.querySelector(
  "#makeResumeCurrentSettingsButton"
);
const actionSettingsDialogs = {
  makeResume: {
    command: "make-resume",
    trigger: makeResumeOptionsButton,
    modal: document.querySelector("#makeResumeActionSettingsModal"),
    backdrop: document.querySelector("#makeResumeActionSettingsModalBackdrop"),
    closeButton: document.querySelector("#makeResumeActionSettingsModalCloseButton"),
    doneButton: document.querySelector("#makeResumeActionSettingsDoneButton"),
    assignButton: document.querySelector("#makeResumeAssignHotkeyButton"),
    hotkeyValue: document.querySelector("#makeResumeHotkeyValue")
  },
  open: {
    command: "open-jobright",
    trigger: openJobrightOptionsButton,
    modal: document.querySelector("#openActionSettingsModal"),
    backdrop: document.querySelector("#openActionSettingsModalBackdrop"),
    closeButton: document.querySelector("#openActionSettingsModalCloseButton"),
    doneButton: document.querySelector("#openActionSettingsDoneButton"),
    assignButton: document.querySelector("#openAssignHotkeyButton"),
    hotkeyValue: document.querySelector("#openHotkeyValue")
  },
  checkPosting: {
    command: "check-posting",
    trigger: checkPostingOptionsButton,
    modal: document.querySelector("#checkPostingActionSettingsModal"),
    backdrop: document.querySelector("#checkPostingActionSettingsModalBackdrop"),
    closeButton: document.querySelector("#checkPostingActionSettingsModalCloseButton"),
    doneButton: document.querySelector("#checkPostingActionSettingsDoneButton"),
    assignButton: document.querySelector("#checkPostingAssignHotkeyButton"),
    hotkeyValue: document.querySelector("#checkPostingHotkeyValue")
  },
  downloadResume: {
    command: "download-resume",
    trigger: saveWorkspaceDownloadOptionsButton,
    modal: document.querySelector("#downloadResumeActionSettingsModal"),
    backdrop: document.querySelector("#downloadResumeActionSettingsModalBackdrop"),
    closeButton: document.querySelector(
      "#downloadResumeActionSettingsModalCloseButton"
    ),
    doneButton: document.querySelector("#downloadResumeActionSettingsDoneButton"),
    assignButton: document.querySelector("#downloadResumeAssignHotkeyButton"),
    hotkeyValue: document.querySelector("#downloadResumeHotkeyValue")
  }
};
const splitWindowsModal = document.querySelector("#splitWindowsModal");
const splitWindowsModalBackdrop = document.querySelector("#splitWindowsModalBackdrop");
const splitWindowsModalCloseButton = document.querySelector("#splitWindowsModalCloseButton");
const homeWorkspaceSwitcher = document.querySelector("#homeWorkspaceSwitcher");
const homeWorkspaceExchangeButton = document.querySelector(
  "#homeWorkspaceExchangeButton"
);
const homeCancelProcessButton = document.querySelector("#homeCancelProcessButton");
const applicationCancelProcessButton = document.querySelector(
  "#applicationCancelProcessButton"
);
const splitWindowsModalCancelButton = document.querySelector("#splitWindowsModalCancelButton");
const splitWindowsModalOpenButton = document.querySelector("#splitWindowsModalOpenButton");
const splitWindowUrlsInput = document.querySelector("#splitWindowUrlsInput");
const splitWindowsModalTitle = document.querySelector("#splitWindowsModalTitle");
const splitWindowsInputView = document.querySelector("#splitWindowsInputView");
const splitWindowsPreviewView = document.querySelector("#splitWindowsPreviewView");
const splitWindowsPreviewTabs = document.querySelector("#splitWindowsPreviewTabs");
const splitWindowsJobTabButton = document.querySelector("#splitWindowsJobTabButton");
const splitWindowsResumeTabButton = document.querySelector(
  "#splitWindowsResumeTabButton"
);
const splitWindowsPreviewUrl = document.querySelector("#splitWindowsPreviewUrl");
const applicationWorkspaceUrlInput = document.querySelector(
  "#applicationWorkspaceUrlInput"
);
const applicationWorkspaceJobGptLocation = document.querySelector(
  "#applicationWorkspaceJobGptLocation"
);
const applicationWorkspaceJobGptUrl = document.querySelector(
  "#applicationWorkspaceJobGptUrl"
);
const applicationWorkspaceRecordJobLocation = document.querySelector(
  "#applicationWorkspaceRecordJobLocation"
);
const applicationWorkspaceRecordJobUrl = document.querySelector(
  "#applicationWorkspaceRecordJobUrl"
);
const applicationWorkspaceRecordJobClosePickupButton = document.querySelector(
  "#applicationWorkspaceRecordJobClosePickupButton"
);
const applicationWorkspaceRecordJobPickupButton = document.querySelector(
  "#applicationWorkspaceRecordJobPickupButton"
);
const applicationWorkspaceRecordJobCopyButton = document.querySelector(
  "#applicationWorkspaceRecordJobCopyButton"
);
const applicationWorkspaceJobGptClosePickupButton = document.querySelector(
  "#applicationWorkspaceJobGptClosePickupButton"
);
const applicationWorkspaceJobGptPickupButton = document.querySelector(
  "#applicationWorkspaceJobGptPickupButton"
);
const applicationWorkspaceJobGptCopyButton = document.querySelector(
  "#applicationWorkspaceJobGptCopyButton"
);
const applicationWorkspaceJobGptCopyContentButton = document.querySelector(
  "#applicationWorkspaceJobGptCopyContentButton"
);
const applicationWorkspaceAiSend = document.querySelector(
  "#applicationWorkspaceAiSend"
);
const applicationWorkspaceAiSendInput = document.querySelector(
  "#applicationWorkspaceAiSendInput"
);
const applicationWorkspaceAiSendButton = document.querySelector(
  "#applicationWorkspaceAiSendButton"
);
const applicationWorkspaceDeleteButton = document.querySelector(
  "#applicationWorkspaceDeleteButton"
);
const deleteApplicationModal = document.querySelector("#deleteApplicationModal");
const deleteApplicationModalBackdrop = document.querySelector(
  "#deleteApplicationModalBackdrop"
);
const deleteApplicationModalCloseButton = document.querySelector(
  "#deleteApplicationModalCloseButton"
);
const deleteApplicationModalCancelButton = document.querySelector(
  "#deleteApplicationModalCancelButton"
);
const deleteApplicationModalConfirmButton = document.querySelector(
  "#deleteApplicationModalConfirmButton"
);
const deleteApplicationModalHelp = document.querySelector(
  "#deleteApplicationModalHelp"
);
const applicationWorkspaceRefreshButton = document.querySelector(
  "#applicationWorkspaceRefreshButton"
);
const applicationWorkspaceClosePickupButton = document.querySelector(
  "#applicationWorkspaceClosePickupButton"
);
const applicationWorkspacePickupButton = document.querySelector(
  "#applicationWorkspacePickupButton"
);
const applicationWorkspaceNotesButton = document.querySelector(
  "#applicationWorkspaceNotesButton"
);
const applicationWorkspaceCopyUrlButton = document.querySelector(
  "#applicationWorkspaceCopyUrlButton"
);
const splitWindowsPreviewFrame = document.querySelector("#splitWindowsPreviewFrame");
const splitWindowsPreviewEmptyState = document.querySelector(
  "#splitWindowsPreviewEmptyState"
);
const splitWindowsPreviewEmptyTitle = document.querySelector(
  "#splitWindowsPreviewEmptyTitle"
);
const splitWindowsPreviewEmptyHelp = document.querySelector(
  "#splitWindowsPreviewEmptyHelp"
);
const applicationWorkspaceProfileNote = document.querySelector(
  "#applicationWorkspaceProfileNote"
);
const applicationWorkspaceProfileNoteTitle = document.querySelector(
  "#applicationWorkspaceProfileNoteTitle"
);
const applicationWorkspaceProfileNoteText = document.querySelector(
  "#applicationWorkspaceProfileNoteText"
);
const splitWindowsPreviewHelp = document.querySelector(
  ".split-windows-preview-help"
);
const splitWindowsPreviewBackButton = document.querySelector("#splitWindowsPreviewBackButton");
const splitWindowsPreviewDownloadButton = document.querySelector(
  "#splitWindowsPreviewDownloadButton"
);
const splitWindowsBatchActions = document.querySelector(
  "#splitWindowsBatchActions"
);
const saveWorkspaceActions = document.querySelector("#saveWorkspaceActions");
const saveWorkspaceBuildButton = document.querySelector(
  "#saveWorkspaceBuildButton"
);
const saveWorkspaceDownloadButton = document.querySelector(
  "#saveWorkspaceDownloadButton"
);
const buildResumeContextModal = document.querySelector(
  "#buildResumeContextModal"
);
const buildResumeContextModalBackdrop = document.querySelector(
  "#buildResumeContextModalBackdrop"
);
const buildResumeContextModalCloseButton = document.querySelector(
  "#buildResumeContextModalCloseButton"
);
const buildResumeContextCancelButton = document.querySelector(
  "#buildResumeContextCancelButton"
);
const buildResumeContextSubmitButton = document.querySelector(
  "#buildResumeContextSubmitButton"
);
const buildResumeContextStatus = document.querySelector(
  "#buildResumeContextStatus"
);
const buildResumeContextInput = document.querySelector(
  "#buildResumeContextInput"
);
const deletedRowsCard = document.querySelector("#deletedRowsCard");
const deletedRowsList = document.querySelector("#deletedRowsList");
const emptyDeletedRows = document.querySelector("#emptyDeletedRows");
const logsList = document.querySelector("#logsList");
const emptyLogs = document.querySelector("#emptyLogs");
const clearLogsButton = document.querySelector("#clearLogsButton");

const exportAppDataIconButton = document.querySelector("#exportAppDataIconButton");
const applicationWorkspaceExportButton = document.querySelector(
  "#applicationWorkspaceExportButton"
);
const configModal = document.querySelector("#configModal");
const configModalBackdrop = document.querySelector("#configModalBackdrop");
const configModalCloseButton = document.querySelector("#configModalCloseButton");
const configModalCancelButton = document.querySelector("#configModalCancelButton");
const spreadsheetIdInput = document.querySelector("#spreadsheetIdInput");
const sheetNameInput = document.querySelector("#sheetNameInput");
const resumeTemplateInput = document.querySelector("#resumeTemplateInput");
const saveConfigButton = document.querySelector("#saveConfigButton");
const exportAppDataModal = document.querySelector("#exportAppDataModal");
const exportAppDataModalBackdrop = document.querySelector(
  "#exportAppDataModalBackdrop"
);
const exportAppDataModalCloseButton = document.querySelector(
  "#exportAppDataModalCloseButton"
);
const exportAppDataModalCancelButton = document.querySelector(
  "#exportAppDataModalCancelButton"
);
const exportAppDataModalConfirmButton = document.querySelector(
  "#exportAppDataModalConfirmButton"
);
const exportIncludePromptResumeInfoCheckbox = document.querySelector(
  "#exportIncludePromptResumeInfoCheckbox"
);
const importAppDataModal = document.querySelector("#importAppDataModal");
const importAppDataModalBackdrop = document.querySelector(
  "#importAppDataModalBackdrop"
);
const importAppDataModalCloseButton = document.querySelector(
  "#importAppDataModalCloseButton"
);
const importAppDataModalCancelButton = document.querySelector(
  "#importAppDataModalCancelButton"
);
const importAppDataModalConfirmButton = document.querySelector(
  "#importAppDataModalConfirmButton"
);
const importIncludePromptResumeInfoCheckbox = document.querySelector(
  "#importIncludePromptResumeInfoCheckbox"
);
const importAppDataFileInput = document.querySelector("#importAppDataFileInput");
const homeWorkspaceImportButton = document.querySelector(
  "#homeWorkspaceImportButton"
);
const applicationWorkspaceImportButton = document.querySelector(
  "#applicationWorkspaceImportButton"
);
const appDataTransferStatus = document.querySelector("#appDataTransferStatus");
const APP_DATA_EXPORT_DIRECTORY_IDB = {
  name: "application-helper-export",
  store: "handles",
  key: "dataDirectory"
};
const promptResumeList = document.querySelector("#promptResumeList");
const promptResumeFormModal = document.querySelector("#promptResumeFormModal");
const promptResumeFormModalTitle = document.querySelector("#promptResumeFormModalTitle");
const promptResumeFormModalHelp = document.querySelector("#promptResumeFormModalHelp");
const promptResumeFormModalBackdrop = document.querySelector("#promptResumeFormModalBackdrop");
const promptResumeFormModalCloseButton = document.querySelector("#promptResumeFormModalCloseButton");
const promptResumeFormModalCancelButton = document.querySelector("#promptResumeFormModalCancelButton");
const promptResumeFormModalSubmitButton = document.querySelector("#promptResumeFormModalSubmitButton");
const promptResumeFormModalStatus = document.querySelector("#promptResumeFormModalStatus");
const promptResumeLabelInput = document.querySelector("#promptResumeLabelInput");
const promptResumeContentInput = document.querySelector("#promptResumeContentInput");
const promptList = document.querySelector("#promptList");
const promptFormModal = document.querySelector("#promptFormModal");
const promptFormModalBackdrop = document.querySelector("#promptFormModalBackdrop");
const promptFormModalCloseButton = document.querySelector("#promptFormModalCloseButton");
const promptFormModalCancelButton = document.querySelector("#promptFormModalCancelButton");
const promptFormModalSubmitButton = document.querySelector("#promptFormModalSubmitButton");
const promptFormModalTitle = document.querySelector("#promptFormModalTitle");
const promptContentInput = document.querySelector("#promptContentInput");
const applicationWorkspacePromptInfoButton = document.querySelector(
  "#applicationWorkspacePromptInfoButton"
);
const homeWorkspacePromptInfoButton = document.querySelector(
  "#homeWorkspacePromptInfoButton"
);
const jobDescriptionList = document.querySelector("#jobDescriptionList");
const jobDescriptionFormModal = document.querySelector("#jobDescriptionFormModal");
const jobDescriptionFormModalBackdrop = document.querySelector("#jobDescriptionFormModalBackdrop");
const jobDescriptionFormModalCloseButton = document.querySelector("#jobDescriptionFormModalCloseButton");
const jobDescriptionFormModalCancelButton = document.querySelector("#jobDescriptionFormModalCancelButton");
const jobDescriptionFormModalSubmitButton = document.querySelector("#jobDescriptionFormModalSubmitButton");
const jobDescriptionContentInput = document.querySelector("#jobDescriptionContentInput");
const profileList = document.querySelector("#profileList");
const profileResumeSettingsModal = document.querySelector("#profileResumeSettingsModal");
const profileResumeSettingsModalTitle = document.querySelector("#profileResumeSettingsModalTitle");
const profileResumeSettingsModalBackdrop = document.querySelector("#profileResumeSettingsModalBackdrop");
const profileResumeSettingsModalCloseButton = document.querySelector("#profileResumeSettingsModalCloseButton");
const profileResumeSettingsAddButton = document.querySelector("#profileResumeSettingsAddButton");
const profileResumeSettingsDoneButton = document.querySelector("#profileResumeSettingsDoneButton");
const addProfileButton = document.querySelector("#addProfileButton");
const profileFormModal = document.querySelector("#profileFormModal");
const profileFormModalTitle = document.querySelector("#profileFormModalTitle");
const profileFormModalHelp = document.querySelector("#profileFormModalHelp");
const profileFormModalBackdrop = document.querySelector("#profileFormModalBackdrop");
const profileFormModalCloseButton = document.querySelector("#profileFormModalCloseButton");
const profileFormModalCancelButton = document.querySelector("#profileFormModalCancelButton");
const profileFormModalSubmitButton = document.querySelector("#profileFormModalSubmitButton");
const profileFormModalStatus = document.querySelector("#profileFormModalStatus");
const profileNameInput = document.querySelector("#profileNameInput");
const profileNotesModal = document.querySelector("#profileNotesModal");
const profileNotesModalTitle = document.querySelector("#profileNotesModalTitle");
const profileNotesModalHelp = document.querySelector("#profileNotesModalHelp");
const profileNotesModalBackdrop = document.querySelector("#profileNotesModalBackdrop");
const profileNotesModalCloseButton = document.querySelector("#profileNotesModalCloseButton");
const profileNotesModalCancelButton = document.querySelector("#profileNotesModalCancelButton");
const profileNotesModalSubmitButton = document.querySelector("#profileNotesModalSubmitButton");
const profileNotesInput = document.querySelector("#profileNotesInput");
const appRoot = document.querySelector(".app");
const PROMPT_RESUME_SELECTION_STORAGE_KEY = "promptResumeSelection";
const JOB_DESCRIPTION_SELECTION_STORAGE_KEY = "jobDescriptionSelection";
const SAVE_POST_PROCESS_STORAGE_KEY = "savePostProcess";
const SAVE_PROCESS_BUSY_CODE = "SAVE_PROCESS_BUSY";
const DEFAULT_AI_PROVIDER_ID = "chatgpt";
const NO_MODEL_PROGRESS_STORAGE_KEY = "noModelSaveProgressByTabId";
let configuredAiProviderId = DEFAULT_AI_PROVIDER_ID;
let noModelProgressByTabId = {};
let pendingNoModelDeleteTarget = null;
const CONTEXT_DOC_AI_PROVIDER_ID = "none";
const AI_PROVIDER_LABELS = Object.freeze({
  chatgpt: "ChatGPT",
  deepseek: "DeepSeek",
  none: "No Model"
});
// Keep Context Doc labels for older imported No Model records.
const AI_PROVIDER_URL_LABELS = Object.freeze({
  chatgpt: "ChatGPT",
  deepseek: "DeepSeek",
  none: "Context Doc"
});
const PROFILE_SELECTION_STORAGE_KEY = "profileSelection";
const PROFILE_SELECTION_VERSION = 4;
const DEFAULT_PROFILE_NAME = "Default";
// Survives side-panel reloads for as long as the Chrome tab stays open.
const TAB_SESSION_STORAGE_KEY = "tabSessionById";

let activeRunId = null;
let savePostProcessState = null;
let isSavePostProcessRequestPending = false;
let currentSplitWindowDownloadUrl = "";
let currentSplitWindowPairs = [];
let currentSplitWindowReturnTabId = null;
let currentSplitWindowSessionType = "make-resume";
let currentSaveWorkspace = null;
const saveWorkspacesByTabId = new Map();
let currentSaveWorkspaceSidePanelView = "workspace";
let currentDefaultSidePanelView = "home";
let currentEmptyWorkspaceTab = "job";
let currentEmptyWorkspaceUrls = {
  job: "",
  resume: ""
};
let isSplitWindowsDialogOpen = false;
let areActionButtonsDisabled = false;
let isCurrentTabGoogleSheet = false;
let isCurrentTabJobright = false;
let isCurrentTabPlayAiChat = false;
let makeResumeAvailabilityRequestId = 0;
let isMakeResumeOpening = false;
let isJobrightOpening = false;
let isCheckPostingRunning = false;
let isMakeOrOpenAiTabRunning = false;
let isSaveActionRunning = false;
let isBuildResumeContextModalOpen = false;
let logEntries = [];
let deletedRowEntries = [];
let headerStatusState = null;
let splitWindowsDraft = "";
let buildResumeContextDraft = "";
let openManagedModalId = "";
let managedModalDrafts = {};

// The side panel is a single document shared by every tab in its window, so each
// tab's status lives in tabStateById and the module-level variables above act as
// the register file for whichever tab is currently active.
const MAX_TAB_LOG_ENTRIES = 400;
const tabStateById = new Map();
const runTabIdsByRunId = new Map();
let activeTabId = null;
let activeTabUrl = "";
let panelWindowId = null;
let tabSessionPersistTimer = null;
let saveResultToastTimer = null;

function createTabState() {
  return {
    runId: null,
    logs: [],
    deletedRows: [],
    headerStatus: null,
    savePostProcessState: null,
    isSavePostProcessRequestPending: false,
    areActionButtonsDisabled: false,
    splitWindowDownloadUrl: "",
    splitWindowPairs: [],
    splitWindowReturnTabId: null,
    splitWindowSessionType: "make-resume",
    saveWorkspaceSidePanelView: "workspace",
    defaultSidePanelView: "home",
    emptyWorkspaceTab: "job",
    emptyWorkspaceUrls: { job: "", resume: "" },
    isSplitWindowsDialogOpen: false,
    isBuildResumeContextModalOpen: false,
    isMakeResumeOpening: false,
    splitWindowsDraft: "",
    buildResumeContextDraft: "",
    openManagedModalId: "",
    managedModalDrafts: {},
    profileFormMode: "add",
    editingProfileId: null,
    notesProfileId: null,
    profileResumeSettingsProfileId: null,
    promptResumeFormMode: "add",
    editingPromptResumeId: null,
    manualSelectedProfileIds: [],
    pickupWindowIds: []
  };
}

function cloneTabStateForPersistence(state) {
  if (!state || typeof state !== "object") {
    return createTabState();
  }

  return {
    ...createTabState(),
    ...state,
    logs: Array.isArray(state.logs) ? state.logs.map((entry) => ({ ...entry })) : [],
    deletedRows: Array.isArray(state.deletedRows)
      ? state.deletedRows.map((entry) => ({ ...entry }))
      : [],
    headerStatus:
      state.headerStatus && typeof state.headerStatus === "object"
        ? { ...state.headerStatus }
        : null,
    savePostProcessState:
      state.savePostProcessState && typeof state.savePostProcessState === "object"
        ? { ...state.savePostProcessState }
        : null,
    splitWindowPairs: Array.isArray(state.splitWindowPairs)
      ? state.splitWindowPairs.map((entry) =>
          entry && typeof entry === "object" ? { ...entry } : entry
        )
      : [],
    emptyWorkspaceUrls:
      state.emptyWorkspaceUrls && typeof state.emptyWorkspaceUrls === "object"
        ? { ...state.emptyWorkspaceUrls }
        : { job: "", resume: "" },
    managedModalDrafts:
      state.managedModalDrafts && typeof state.managedModalDrafts === "object"
        ? { ...state.managedModalDrafts }
        : {},
    manualSelectedProfileIds: Array.isArray(state.manualSelectedProfileIds)
      ? [...new Set(state.manualSelectedProfileIds.map(String).filter(Boolean))]
      : [],
    pickupWindowIds: Array.isArray(state.pickupWindowIds)
      ? [...new Set(state.pickupWindowIds.map(Number).filter(Number.isInteger))]
      : []
  };
}

function serializeTabSession() {
  captureActiveTabState();

  const workspaces = {};
  saveWorkspacesByTabId.forEach((workspace, tabId) => {
    if (!Number.isInteger(tabId) || !workspace || typeof workspace !== "object") {
      return;
    }
    workspaces[String(tabId)] = { ...workspace };
  });

  const tabStates = {};
  tabStateById.forEach((state, tabId) => {
    if (!Number.isInteger(tabId)) {
      return;
    }
    tabStates[String(tabId)] = cloneTabStateForPersistence(state);
  });

  return { workspaces, tabStates };
}

function schedulePersistTabSession() {
  if (tabSessionPersistTimer !== null) {
    return;
  }

  tabSessionPersistTimer = setTimeout(() => {
    tabSessionPersistTimer = null;
    persistTabSession().catch((error) => {
      console.error("Could not persist per-tab session state:", error);
    });
  }, 100);
}

async function persistTabSession() {
  if (tabSessionPersistTimer !== null) {
    clearTimeout(tabSessionPersistTimer);
    tabSessionPersistTimer = null;
  }

  const session = serializeTabSession();
  const hasWorkspaces = Object.keys(session.workspaces).length > 0;
  const hasTabStates = Object.keys(session.tabStates).length > 0;

  if (!hasWorkspaces && !hasTabStates) {
    await chrome.storage.session.remove(TAB_SESSION_STORAGE_KEY);
    return;
  }

  await chrome.storage.session.set({
    [TAB_SESSION_STORAGE_KEY]: session
  });
}

async function restoreTabSession() {
  const stored = await chrome.storage.session.get(TAB_SESSION_STORAGE_KEY);
  const session = stored[TAB_SESSION_STORAGE_KEY];
  if (!session || typeof session !== "object") {
    return;
  }

  const openTabIds = new Set();
  try {
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      if (Number.isInteger(tab?.id)) {
        openTabIds.add(tab.id);
      }
    });
  } catch (error) {
    console.error("Could not list open tabs while restoring session state:", error);
    // Do not mark protected closing ready when tab selections could not be restored.
    throw error;
  }

  saveWorkspacesByTabId.clear();
  tabStateById.clear();
  runTabIdsByRunId.clear();

  const workspaces =
    session.workspaces && typeof session.workspaces === "object"
      ? session.workspaces
      : {};
  Object.entries(workspaces).forEach(([tabKey, workspace]) => {
    const tabId = Number(tabKey);
    if (!Number.isInteger(tabId) || !openTabIds.has(tabId)) {
      return;
    }
    if (!workspace || typeof workspace !== "object") {
      return;
    }
    saveWorkspacesByTabId.set(tabId, { ...workspace, chatGptTabId: tabId });
  });

  const tabStates =
    session.tabStates && typeof session.tabStates === "object"
      ? session.tabStates
      : {};
  Object.entries(tabStates).forEach(([tabKey, state]) => {
    const tabId = Number(tabKey);
    if (!Number.isInteger(tabId) || !openTabIds.has(tabId)) {
      return;
    }
    const restored = cloneTabStateForPersistence(state);
    tabStateById.set(tabId, restored);
    if (restored.runId) {
      registerRunTab(restored.runId, tabId);
    }
  });

  // Drop closed-tab leftovers left behind if the service worker missed a remove.
  schedulePersistTabSession();
}

function getTabState(tabId) {
  if (!Number.isInteger(tabId)) {
    return null;
  }

  let state = tabStateById.get(tabId);
  if (!state) {
    state = createTabState();
    tabStateById.set(tabId, state);
  }

  return state;
}

function captureActiveTabState() {
  const state = getTabState(activeTabId);
  if (!state) return;

  state.runId = activeRunId;
  state.logs = logEntries;
  state.deletedRows = deletedRowEntries;
  state.headerStatus = headerStatusState;
  state.savePostProcessState = savePostProcessState;
  state.isSavePostProcessRequestPending = isSavePostProcessRequestPending;
  state.areActionButtonsDisabled = areActionButtonsDisabled;
  state.splitWindowDownloadUrl = currentSplitWindowDownloadUrl;
  state.splitWindowPairs = currentSplitWindowPairs;
  state.splitWindowReturnTabId = currentSplitWindowReturnTabId;
  state.splitWindowSessionType = currentSplitWindowSessionType;
  state.saveWorkspaceSidePanelView = currentSaveWorkspaceSidePanelView;
  state.defaultSidePanelView = currentDefaultSidePanelView;
  state.emptyWorkspaceTab = currentEmptyWorkspaceTab;
  state.emptyWorkspaceUrls = currentEmptyWorkspaceUrls;
  state.isSplitWindowsDialogOpen = isSplitWindowsDialogOpen;
  state.isBuildResumeContextModalOpen = isBuildResumeContextModalOpen;
  state.isMakeResumeOpening = isMakeResumeOpening;
  state.splitWindowsDraft = splitWindowUrlsInput?.value ?? splitWindowsDraft;
  state.buildResumeContextDraft =
    buildResumeContextInput?.value ?? buildResumeContextDraft;
  state.openManagedModalId = readOpenManagedModalId();
  state.managedModalDrafts = readManagedModalDrafts(state.openManagedModalId);
  state.profileFormMode = profileFormMode;
  state.editingProfileId = editingProfileId;
  state.notesProfileId = notesProfileId;
  state.profileResumeSettingsProfileId = profileResumeSettingsProfileId;
  state.promptResumeFormMode = promptResumeFormMode;
  state.editingPromptResumeId = editingPromptResumeId;
  state.manualSelectedProfileIds = [...manualSelectedProfileIds];
}

function loadTabStateIntoRegisters(tabId) {
  const state = getTabState(tabId) || createTabState();

  activeRunId = state.runId;
  logEntries = state.logs;
  deletedRowEntries = state.deletedRows;
  headerStatusState = state.headerStatus;
  savePostProcessState = state.savePostProcessState;
  isSavePostProcessRequestPending = state.isSavePostProcessRequestPending;
  areActionButtonsDisabled = state.areActionButtonsDisabled;
  currentSplitWindowDownloadUrl = state.splitWindowDownloadUrl;
  currentSplitWindowPairs = state.splitWindowPairs;
  currentSplitWindowReturnTabId = state.splitWindowReturnTabId;
  currentSplitWindowSessionType = state.splitWindowSessionType;
  currentSaveWorkspaceSidePanelView = state.saveWorkspaceSidePanelView;
  currentDefaultSidePanelView = state.defaultSidePanelView;
  currentEmptyWorkspaceTab = state.emptyWorkspaceTab;
  currentEmptyWorkspaceUrls = state.emptyWorkspaceUrls;
  isSplitWindowsDialogOpen = state.isSplitWindowsDialogOpen;
  isBuildResumeContextModalOpen = state.isBuildResumeContextModalOpen;
  isMakeResumeOpening = state.isMakeResumeOpening;
  splitWindowsDraft = state.splitWindowsDraft;
  buildResumeContextDraft = state.buildResumeContextDraft;
  openManagedModalId = state.openManagedModalId;
  managedModalDrafts = state.managedModalDrafts;
  profileFormMode = state.profileFormMode;
  editingProfileId = state.editingProfileId;
  notesProfileId = state.notesProfileId;
  profileResumeSettingsProfileId = state.profileResumeSettingsProfileId;
  promptResumeFormMode = state.promptResumeFormMode;
  editingPromptResumeId = state.editingPromptResumeId;
  manualSelectedProfileIds = [...state.manualSelectedProfileIds];
}

function switchActiveTab(tabId) {
  if (!Number.isInteger(tabId) || tabId === activeTabId) {
    return false;
  }

  captureActiveTabState();
  activeTabId = tabId;
  loadTabStateIntoRegisters(activeTabId);
  renderActiveTabState();
  schedulePersistTabSession();
  return true;
}

function forgetTabState(tabId) {
  tabStateById.delete(tabId);
  runTabIdsByRunId.forEach((tabIds, runId) => {
    tabIds.delete(tabId);
    if (tabIds.size === 0) {
      runTabIdsByRunId.delete(runId);
    }
  });
  schedulePersistTabSession();
}

// A run starts on one tab but can adopt the tabs it opens (for example the
// ChatGPT tab created for a profile), and every adopted tab mirrors its status.
function registerRunTab(runId, tabId = activeTabId) {
  if (!runId || !Number.isInteger(tabId)) {
    return runId;
  }

  let tabIds = runTabIdsByRunId.get(runId);
  if (!tabIds) {
    tabIds = new Set();
    runTabIdsByRunId.set(runId, tabIds);
  }
  tabIds.add(tabId);

  return runId;
}

// Resolves which tabs a service worker message applies to. Messages carry the
// owning tab id when the service worker knows it; otherwise fall back to the
// run registry the side panel built when it started the run.
function resolveRunTabIds(message) {
  const tabIds = new Set();

  if (Number.isInteger(message?.ownerTabId)) {
    tabIds.add(message.ownerTabId);
  }

  runTabIdsByRunId.get(message?.runId)?.forEach((tabId) => tabIds.add(tabId));

  if (
    tabIds.size === 0 &&
    message?.runId &&
    message.runId === activeRunId &&
    Number.isInteger(activeTabId)
  ) {
    tabIds.add(activeTabId);
  }

  return [...tabIds];
}

function setRunIdForTab(tabId, runId) {
  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.runId = runId;
    }
    return runId;
  }

  activeRunId = runId;
  return runId;
}

// Starts a run owned by a specific tab and returns that tab id so async handlers
// keep reporting to it even if the user switches tabs.
function beginRunForTab(ownerTabId) {
  const runId = createRunId();

  registerRunTab(runId, ownerTabId);
  setRunIdForTab(ownerTabId, runId);

  return { ownerTabId, runId };
}

function beginRunForActiveTab() {
  return beginRunForTab(activeTabId);
}

function renderActiveTabState() {
  syncCurrentSaveWorkspace();
  syncProfileSelectionForActiveTab();
  renderProfileList();
  renderLogEntries();
  renderDeletedRowEntries();
  restoreManagedModalState();
  if (isSplitWindowsDialogOpen) {
    // Another tab may have left the shared region showing a workspace preview.
    setSplitWindowsPreview("");
    splitWindowsPreviewTabs?.classList.add("is-hidden");
  }
  if (splitWindowUrlsInput) splitWindowUrlsInput.value = splitWindowsDraft;
  if (buildResumeContextInput) {
    buildResumeContextInput.value = buildResumeContextDraft;
  }
  setSaveButtonsDisabled(areActionButtonsDisabled);
  renderSavePostProcessControls();
  renderSaveWorkspaceSidePanelView();
}

async function initActiveTabTracking() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (Number.isInteger(tab?.id)) {
      activeTabId = tab.id;
      activeTabUrl = tab.url || "";
      // Take the window from a real tab rather than windows.getCurrent(), which
      // is not dependable from a side panel document. Getting it wrong would
      // silently filter out every tab switch.
      panelWindowId = Number.isInteger(tab.windowId) ? tab.windowId : null;
      // Prefer restored per-tab state over empty module registers.
      loadTabStateIntoRegisters(activeTabId);
      renderActiveTabState();
      schedulePersistTabSession();
    }
  } catch (error) {
    console.error("Could not determine the active tab for the side panel:", error);
  }
}

async function syncActiveTabFromBrowser() {
  try {
    const [tab] = await chrome.tabs.query(
      panelWindowId === null
        ? { active: true, lastFocusedWindow: true }
        : { active: true, windowId: panelWindowId }
    );
    activeTabUrl = tab?.url || "";
    if (Number.isInteger(tab?.id) && tab.id !== activeTabId) {
      switchActiveTab(tab.id);
    }
  } catch (error) {
    console.error("Could not resolve the active tab:", error);
  }
}

// Force the side panel onto a profile's Application workspace. Multi-profile
// Save App must not wait for tabs.onActivated — SHOW arrives before the
// service worker activates the tab, and missed events leave the panel on the
// previous tab's home/workspace with empty details.
function activateSaveWorkspaceTab(chatGptTabId) {
  if (!Number.isInteger(chatGptTabId)) {
    return false;
  }

  if (!saveWorkspacesByTabId.has(chatGptTabId)) {
    return false;
  }

  const workspaceTabState = getTabState(chatGptTabId);
  if (workspaceTabState) {
    workspaceTabState.isSplitWindowsDialogOpen = false;
    workspaceTabState.saveWorkspaceSidePanelView = "workspace";
    if (workspaceTabState.splitWindowSessionType !== "make-resume") {
      workspaceTabState.splitWindowSessionType = "save-workspace";
    }
  }

  switchActiveTab(chatGptTabId);

  if (activeTabId !== chatGptTabId) {
    activeTabId = chatGptTabId;
    loadTabStateIntoRegisters(chatGptTabId);
  }

  isSplitWindowsDialogOpen = false;
  currentSaveWorkspaceSidePanelView = "workspace";
  syncCurrentSaveWorkspace();

  if (!currentSaveWorkspace) {
    return false;
  }

  currentSplitWindowSessionType =
    currentSaveWorkspace.sessionType || "save-workspace";
  splitWindowsPreviewTabs?.classList.remove("is-hidden");
  const resumeTabLabel = splitWindowsResumeTabButton?.querySelector("span");
  if (resumeTabLabel) {
    resumeTabLabel.textContent = `${currentSaveWorkspace.profileName} resume`;
  }

  setSaveWorkspaceTab(currentSaveWorkspace.activeTab || "resume", {
    forceReload: true
  });
  renderSaveWorkspaceSidePanelView();
  return true;
}

// Modals share one DOM node across every tab, so opening one is recorded against
// the active tab and replayed when that tab comes back into focus.
function getManagedModals() {
  return [
    {
      // Sheet configuration is global app data rather than per-tab work, so only
      // the open state is tracked; the inputs keep whatever is loaded.
      id: "config",
      element: configModal,
      setOpen: (isOpen) => setConfigModalOpen(isOpen, { returnFocus: false }),
      fields: []
    },
    {
      id: "profileForm",
      element: profileFormModal,
      setOpen: setProfileFormModalOpen,
      fields: [profileNameInput, resumeTemplateInput]
    },
    {
      id: "profileNotes",
      element: profileNotesModal,
      setOpen: setProfileNotesModalOpen,
      fields: [profileNotesInput]
    },
    {
      id: "profileResumeSettings",
      element: profileResumeSettingsModal,
      setOpen: (isOpen) => setProfileResumeSettingsModalOpen(isOpen, {
        returnFocus: false,
        preserveProfile: true
      }),
      fields: []
    },
    {
      id: "promptResumeForm",
      element: promptResumeFormModal,
      setOpen: (isOpen) => setPromptResumeFormModalOpen(isOpen, {
        returnToSettings: false
      }),
      fields: [promptResumeLabelInput, promptResumeContentInput]
    },
    {
      id: "promptForm",
      element: promptFormModal,
      setOpen: setPromptFormModalOpen,
      fields: [promptContentInput]
    },
    {
      id: "jobDescriptionForm",
      element: jobDescriptionFormModal,
      setOpen: setJobDescriptionFormModalOpen,
      fields: [jobDescriptionContentInput]
    },
    {
      id: "deleteApplication",
      element: deleteApplicationModal,
      setOpen: (isOpen) => setDeleteApplicationModalOpen(isOpen, { returnFocus: false }),
      fields: []
    },
    {
      id: "exportAppData",
      element: exportAppDataModal,
      setOpen: (isOpen) => setExportAppDataModalOpen(isOpen, { returnFocus: false }),
      fields: []
    },
    {
      id: "importAppData",
      element: importAppDataModal,
      setOpen: (isOpen) => setImportAppDataModalOpen(isOpen, { returnFocus: false }),
      fields: []
    }
  ];
}

function readOpenManagedModalId() {
  const openModal = getManagedModals().find(
    (modal) => modal.element && !modal.element.classList.contains("is-hidden")
  );

  return openModal ? openModal.id : "";
}

function readManagedModalDrafts(modalId) {
  const modal = getManagedModals().find((entry) => entry.id === modalId);
  if (!modal) {
    return {};
  }

  const drafts = {};
  modal.fields.forEach((field) => {
    if (field?.id) {
      drafts[field.id] = field.value;
    }
  });

  return drafts;
}

function restoreManagedModalState() {
  const targetModalId = openManagedModalId;
  const drafts = managedModalDrafts || {};
  const preservedProfileFormMode = profileFormMode;
  const preservedEditingProfileId = editingProfileId;
  const preservedNotesProfileId = notesProfileId;
  const preservedResumeSettingsProfileId = profileResumeSettingsProfileId;
  const preservedPromptResumeFormMode = promptResumeFormMode;
  const preservedEditingPromptResumeId = editingPromptResumeId;

  getManagedModals().forEach((modal) => {
    if (!modal.element) return;

    const isOpen = !modal.element.classList.contains("is-hidden");
    const shouldOpen = modal.id === targetModalId;
    if (isOpen !== shouldOpen) {
      modal.setOpen(shouldOpen);
    }
  });

  // Closing a modal resets its companion form mode, so put the active tab's
  // values back after the DOM has settled.
  profileFormMode = preservedProfileFormMode;
  editingProfileId = preservedEditingProfileId;
  notesProfileId = preservedNotesProfileId;
  profileResumeSettingsProfileId = preservedResumeSettingsProfileId;
  promptResumeFormMode = preservedPromptResumeFormMode;
  editingPromptResumeId = preservedEditingPromptResumeId;

  renderProfileResumeSettings();
  getManagedModals()
    .find((modal) => modal.id === targetModalId)
    ?.fields.forEach((field) => {
      if (field?.id && Object.prototype.hasOwnProperty.call(drafts, field.id)) {
        field.value = drafts[field.id];
      }
    });
}

function syncCurrentSaveWorkspace() {
  currentSaveWorkspace = Number.isInteger(activeTabId)
    ? saveWorkspacesByTabId.get(activeTabId) || null
    : null;

  if (currentSaveWorkspace?.sessionType) {
    currentSplitWindowSessionType = currentSaveWorkspace.sessionType;
  }

  return currentSaveWorkspace;
}

function createRunId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createProfileId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

let profileSelectionState = {
  profiles: [],
  selectedProfileId: "",
  selectedProfileIds: [],
  selectionVersion: PROFILE_SELECTION_VERSION
};
let manualSelectedProfileIds = [];
let isProfileSelectionLoaded = false;
let isProtectedCloseReady = false;

let profileResumeSettingsProfileId = null;
let draggedProfileId = "";
let profileFormMode = "add";
let editingProfileId = null;
let notesProfileId = null;

function moveProfileBeforeTarget(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) {
    return false;
  }

  const items = [...profileSelectionState.profiles];
  const fromIndex = items.findIndex((entry) => entry.id === draggedId);
  const toIndex = items.findIndex((entry) => entry.id === targetId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return false;
  }

  const [movedItem] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, movedItem);
  profileSelectionState.profiles = items;
  return true;
}

function clearProfileDragState() {
  draggedProfileId = "";

  profileList
    ?.querySelectorAll(".profile-item.is-dragging, .profile-item.is-drag-over")
    .forEach((item) => {
      item.classList.remove("is-dragging", "is-drag-over");
    });
}

async function reorderProfile(draggedId, targetId) {

  const didMove = moveProfileBeforeTarget(draggedId, targetId);
  if (!didMove) {
    return;
  }

  renderProfileList();

  try {
    await persistProfileSelection();
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not save profile order.");
    await loadProfileSelection();
  }
}

function normalizePromptResumeEntry(entry) {
  const label = String(entry?.label ?? entry?.name ?? "").trim();
  const content = String(entry?.content ?? entry?.docInput ?? "").trim();

  if (!label || !content) {
    return null;
  }

  return {
    id: String(entry?.id || createProfileId()),
    label,
    content,
    updatedAt: String(entry?.updatedAt || ""),
    autoSelect: Boolean(entry?.autoSelect)
  };
}

function enforceSingleAutoSelectPromptResume(promptResumes) {
  let foundAuto = false;

  return promptResumes.map((entry) => {
    if (!entry.autoSelect) {
      return entry;
    }

    if (foundAuto) {
      return { ...entry, autoSelect: false };
    }

    foundAuto = true;
    return entry;
  });
}

function getAutoSelectedPromptResumeId(promptResumes) {
  return promptResumes.find((entry) => entry.autoSelect)?.id || "";
}

function getAutoSelectedProfileIds(selection = profileSelectionState) {
  return (Array.isArray(selection?.profiles) ? selection.profiles : [])
    .filter((profile) => getAutoSelectedPromptResumeId(profile.promptResumes || []))
    .map((profile) => profile.id);
}

function syncProfileSelectionForActiveTab() {
  const validProfileIds = new Set(
    profileSelectionState.profiles.map((profile) => profile.id)
  );
  const autoSelectedIds = new Set(getAutoSelectedProfileIds());

  manualSelectedProfileIds = manualSelectedProfileIds.filter(
    (profileId) => validProfileIds.has(profileId) && !autoSelectedIds.has(profileId)
  );
  const manualSelectedIds = new Set(manualSelectedProfileIds);
  profileSelectionState.selectedProfileIds = profileSelectionState.profiles
    .filter(
      (profile) =>
        autoSelectedIds.has(profile.id) || manualSelectedIds.has(profile.id)
    )
    .map((profile) => profile.id);
}

function rememberCurrentManualProfileSelection() {
  const autoSelectedIds = new Set(getAutoSelectedProfileIds());
  manualSelectedProfileIds = profileSelectionState.selectedProfileIds.filter(
    (profileId) => !autoSelectedIds.has(profileId)
  );

  if (typeof getTabState === "function" && Number.isInteger(activeTabId)) {
    const state = getTabState(activeTabId);
    if (state) state.manualSelectedProfileIds = [...manualSelectedProfileIds];
  }
  if (typeof schedulePersistTabSession === "function") {
    schedulePersistTabSession();
  }
}

function normalizePromptResumeSelection(selection) {
  let promptResumes = (
    Array.isArray(selection?.promptResumes) ? selection.promptResumes : []
  )
    .map(normalizePromptResumeEntry)
    .filter(Boolean);

  promptResumes = enforceSingleAutoSelectPromptResume(promptResumes);

  const selectedPromptResumeId =
    promptResumes.some(
      (entry) => entry.id === selection?.selectedPromptResumeId
    )
      ? selection.selectedPromptResumeId
      : promptResumes[0]?.id || "";

  // Auto belongs to the profile and follows its assigned resume.
  if (promptResumes.some((entry) => entry.autoSelect)) {
    promptResumes = promptResumes.map((entry) => ({
      ...entry,
      autoSelect: entry.id === selectedPromptResumeId
    }));
  }

  return { promptResumes, selectedPromptResumeId };
}

function createDefaultProfile(promptResumeSelection = null, resumeTemplateId = "") {
  const resumes = normalizePromptResumeSelection(promptResumeSelection);

  return {
    id: createProfileId(),
    name: DEFAULT_PROFILE_NAME,
    resumeTemplateId: String(resumeTemplateId || "").trim(),
    notes: "",
    promptResumes: resumes.promptResumes,
    selectedPromptResumeId: resumes.selectedPromptResumeId
  };
}

function normalizeProfile(entry) {
  const name = String(entry?.name ?? "").trim();
  if (!name) {
    return null;
  }

  const resumes = normalizePromptResumeSelection(entry);

  return {
    id: String(entry?.id || createProfileId()),
    name,
    resumeTemplateId: String(entry?.resumeTemplateId || "").trim(),
    notes: String(entry?.notes ?? "").trim(),
    promptResumes: resumes.promptResumes,
    selectedPromptResumeId: resumes.selectedPromptResumeId
  };
}

function normalizeProfileSelectionState(selection) {
  const sourceProfiles = Array.isArray(selection?.profiles) ? selection.profiles : [];
  const profiles = sourceProfiles
    .map(normalizeProfile)
    .filter(Boolean);

  if (profiles.length === 0) {
    const defaultProfile = createDefaultProfile();
    return {
      profiles: [defaultProfile],
      selectedProfileId: defaultProfile.id,
      selectedProfileIds: [],
      selectionVersion: PROFILE_SELECTION_VERSION
    };
  }

  const selectedProfileId =
    profiles.some((entry) => entry.id === selection?.selectedProfileId)
      ? selection.selectedProfileId
      : profiles[0].id;

  // V3 coupled application inclusion to the resume selection. Preserve those
  // checked profiles before defaulting previously unassigned resumes.
  const selectedIds = new Set(
    selection?.selectionVersion === PROFILE_SELECTION_VERSION
      ? (Array.isArray(selection.selectedProfileIds) ? selection.selectedProfileIds : [])
      : selection?.selectionVersion === 3
        ? sourceProfiles.filter((source) => source?.selectedPromptResumeId &&
            profiles.some((profile) => profile.id === String(source.id) &&
              profile.selectedPromptResumeId === source.selectedPromptResumeId)
          ).map((profile) => String(profile.id))
        : []
  );
  const selectedProfileIds = profiles
    .filter((profile) => selectedIds.has(profile.id))
    .map((profile) => profile.id);

  return {
    profiles,
    selectedProfileId,
    selectedProfileIds,
    selectionVersion: PROFILE_SELECTION_VERSION
  };
}

function getProfileSelectionStateSignature(selection) {
  return JSON.stringify(normalizeProfileSelectionState(selection));
}

function isCurrentProfileSelectionState(selection) {
  return (
    getProfileSelectionStateSignature(selection) ===
    getProfileSelectionStateSignature(profileSelectionState)
  );
}

function getSelectedProfile() {
  return (
    profileSelectionState.profiles.find(
      (entry) => entry.id === profileSelectionState.selectedProfileId
    ) ||
    profileSelectionState.profiles[0] ||
    null
  );
}

function getProfileByName(profileName) {
  const normalizedName = String(profileName || "").trim().toLocaleLowerCase();
  if (!normalizedName) {
    return null;
  }

  return (
    profileSelectionState.profiles.find(
      (profile) =>
        String(profile?.name || "").trim().toLocaleLowerCase() === normalizedName
    ) || null
  );
}

function getSelectedProfiles() {
  const selectedIds = new Set(profileSelectionState.selectedProfileIds);
  return profileSelectionState.profiles.filter((entry) => selectedIds.has(entry.id));
}

function syncPromptResumeStateFromSelectedProfile() {
  const selectedProfile = getSelectedProfile();
  const resumes = normalizePromptResumeSelection(selectedProfile);

  promptResumeSelectionState = {
    promptResumes: resumes.promptResumes,
    selectedPromptResumeId: resumes.selectedPromptResumeId
  };
  renderPromptResumeList();
}

function applyPromptResumeStateToSelectedProfile(
  promptResumes,
  selectedPromptResumeId,
  profileId = getSelectedProfile()?.id
) {
  const selectedProfile = profileSelectionState.profiles.find(
    (profile) => profile.id === profileId
  );
  if (!selectedProfile) {
    return;
  }

  const resumes = normalizePromptResumeSelection({
    promptResumes,
    selectedPromptResumeId
  });

  const profiles = profileSelectionState.profiles.map((entry) =>
    entry.id === selectedProfile.id
      ? {
          ...entry,
          promptResumes: resumes.promptResumes,
          selectedPromptResumeId: resumes.selectedPromptResumeId
        }
      : entry
  );

  profileSelectionState = {
    ...profileSelectionState,
    profiles,
    selectedProfileIds: profiles
      .filter((profile) => profile.selectedPromptResumeId &&
        profileSelectionState.selectedProfileIds.includes(profile.id))
      .map((profile) => profile.id)
  };
  syncProfileSelectionForActiveTab();
}

function showProfileFormModalStatus(type, message) {
  if (!profileFormModalStatus) return;

  profileFormModalStatus.classList.remove("is-hidden", "is-error", "is-success");
  profileFormModalStatus.textContent = message;
  profileFormModalStatus.classList.add(type === "error" ? "is-error" : "is-success");
}

function clearProfileFormModalStatus() {
  profileFormModalStatus?.classList.add("is-hidden");
  profileFormModalStatus?.classList.remove("is-error", "is-success");
  if (profileFormModalStatus) profileFormModalStatus.textContent = "";
}

function resetProfileFormModal() {
  if (profileNameInput) profileNameInput.value = "";
  if (resumeTemplateInput) resumeTemplateInput.value = "";
  clearProfileFormModalStatus();
}

function updateProfileFormModalCopy() {
  const isEdit = profileFormMode === "edit";

  if (profileFormModalTitle) {
    profileFormModalTitle.textContent = isEdit ? "Edit profile" : "Add profile";
  }

  if (profileFormModalHelp) {
    profileFormModalHelp.textContent = isEdit
      ? "Update this profile name and resume template."
      : "Set the profile name and resume template.";
  }

  if (profileFormModalSubmitButton) {
    profileFormModalSubmitButton.textContent = isEdit ? "Save Changes" : "Add profile";
  }

  if (profileFormModalBackdrop) {
    profileFormModalBackdrop.setAttribute(
      "aria-label",
      isEdit ? "Close edit profile dialog" : "Close add profile dialog"
    );
  }
}

function setProfileFormModalOpen(isOpen) {
  if (!profileFormModal) return;

  profileFormModal.classList.toggle("is-hidden", !isOpen);
  profileFormModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    updateProfileFormModalCopy();
    clearProfileFormModalStatus();
    profileNameInput?.focus();
    return;
  }

  profileFormMode = "add";
  editingProfileId = null;
  resetProfileFormModal();
  updateProfileFormModalCopy();
  addProfileButton?.focus();
}

function setProfileNotesModalOpen(isOpen) {
  if (!profileNotesModal) return;

  profileNotesModal.classList.toggle("is-hidden", !isOpen);
  profileNotesModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    profileNotesInput?.focus();
    return;
  }

  notesProfileId = null;
  if (profileNotesInput) {
    profileNotesInput.value = "";
    profileNotesInput.readOnly = false;
  }
  if (profileNotesModalSubmitButton) {
    profileNotesModalSubmitButton.hidden = false;
    profileNotesModalSubmitButton.disabled = false;
  }
  profileList
    ?.querySelector(".profile-notes")
    ?.focus();
}

function openProfileNotesModal(profileId) {

  const profile = profileSelectionState.profiles.find((entry) => entry.id === profileId);
  if (!profile) {
    addLog("error", "Selected profile could not be found.");
    return;
  }

  notesProfileId = profile.id;

  if (profileNotesModalTitle) {
    profileNotesModalTitle.textContent = `Notes · ${profile.name}`;
  }

  if (profileNotesModalHelp) {
    profileNotesModalHelp.textContent = `Keep notes for ${profile.name}.`;
  }

  if (profileNotesInput) {
    profileNotesInput.value = profile.notes || "";
    profileNotesInput.readOnly = false;
  }
  if (profileNotesModalSubmitButton) {
    profileNotesModalSubmitButton.hidden = false;
    profileNotesModalSubmitButton.disabled = false;
  }

  setProfileNotesModalOpen(true);
}

function openApplicationWorkspaceNotesModal() {
  if (!hasActiveSaveWorkspaceForCurrentTab()) {
    showStatus("error", "No active Application workspace profile.");
    return;
  }

  const workspace = currentSaveWorkspace;
  const profileName = String(
    workspace.profileName || DEFAULT_PROFILE_NAME
  ).trim();
  const savedProfile = getProfileByName(profileName);

  if (savedProfile) {
    openProfileNotesModal(savedProfile.id);
    return;
  }

  notesProfileId = null;
  if (profileNotesModalTitle) {
    profileNotesModalTitle.textContent = `Notes - ${profileName}`;
  }
  if (profileNotesModalHelp) {
    profileNotesModalHelp.textContent =
      "This workspace profile is not saved, so its notes are read-only.";
  }
  if (profileNotesInput) {
    profileNotesInput.value =
      String(workspace.profileNotes || "").trim() ||
      "No notes are available for this profile.";
    profileNotesInput.readOnly = true;
  }
  if (profileNotesModalSubmitButton) {
    profileNotesModalSubmitButton.hidden = true;
  }
  setProfileNotesModalOpen(true);
}

async function submitProfileNotesForm() {
  if (!notesProfileId) {
    addLog("error", "No profile selected for notes.");
    return;
  }

  const notes = profileNotesInput?.value.trim() || "";
  const profile = profileSelectionState.profiles.find(
    (entry) => entry.id === notesProfileId
  );

  if (!profile) {
    addLog("error", "Selected profile could not be found.");
    return;
  }

  if (profileNotesModalSubmitButton) {
    profileNotesModalSubmitButton.disabled = true;
  }

  try {
    profileSelectionState.profiles = profileSelectionState.profiles.map((entry) =>
      entry.id === notesProfileId ? { ...entry, notes } : entry
    );

    await persistProfileSelection(`Notes saved for "${profile.name}".`);
    setProfileNotesModalOpen(false);
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not save profile notes.");
  } finally {
    if (profileNotesModalSubmitButton) {
      profileNotesModalSubmitButton.disabled = false;
    }
  }
}

function openAddProfileModal() {

  profileFormMode = "add";
  editingProfileId = null;
  resetProfileFormModal();
  setProfileFormModalOpen(true);
}

function openEditProfileModal(profileId) {

  const profile = profileSelectionState.profiles.find((entry) => entry.id === profileId);
  if (!profile) {
    addLog("error", "Selected profile could not be found.");
    return;
  }

  profileFormMode = "edit";
  editingProfileId = profile.id;

  if (profileNameInput) profileNameInput.value = profile.name;
  if (resumeTemplateInput) {
    resumeTemplateInput.value = profile.resumeTemplateId || "";
  }
  setProfileFormModalOpen(true);
}

function renderProfileResumeSettings() {
  if (!profileResumeSettingsProfileId) return;

  const profile = profileSelectionState.profiles.find(
    (entry) => entry.id === profileResumeSettingsProfileId
  );
  if (!profile) {
    setProfileResumeSettingsModalOpen(false);
    return;
  }

  // Resume edits stay attached to the profile whose settings are open.
  profileSelectionState.selectedProfileId = profile.id;
  syncPromptResumeStateFromSelectedProfile();
  if (profileResumeSettingsModalTitle) {
    profileResumeSettingsModalTitle.textContent = `Prompt resumes · ${profile.name}`;
  }
  if (profileResumeSettingsAddButton) {
    profileResumeSettingsAddButton.disabled = areActionButtonsDisabled;
  }
}

function setProfileResumeSettingsModalOpen(
  isOpen,
  { returnFocus = true, preserveProfile = false } = {}
) {
  if (!profileResumeSettingsModal) return;

  const profileId = profileResumeSettingsProfileId;
  profileResumeSettingsModal.classList.toggle("is-hidden", !isOpen);
  profileResumeSettingsModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    if (!profileSelectionState.profiles.some((profile) => profile.id === profileId)) {
      setProfileResumeSettingsModalOpen(false, { returnFocus: false });
      return;
    }
    renderProfileResumeSettings();
    const selectedControl = promptResumeList?.querySelector(
      'input[type="radio"]:checked'
    ) || promptResumeList?.querySelector('input[type="radio"]');
    (selectedControl || profileResumeSettingsAddButton)?.focus();
    return;
  }

  if (!preserveProfile) {
    profileResumeSettingsProfileId = null;
  }
  if (returnFocus) {
    Array.from(profileList?.querySelectorAll(".profile-item") || [])
      .find((item) => item.dataset.profileId === profileId)
      ?.querySelector(".profile-resume-settings")?.focus();
  }
}

async function openProfileResumeSettingsModal(profileId) {
  if (areActionButtonsDisabled) return;
  await selectProfile(profileId);
  profileResumeSettingsProfileId = profileId;
  setProfileResumeSettingsModalOpen(true);
}

async function toggleProfileAutoSelect(profileId) {
  if (areActionButtonsDisabled) return;
  const profile = profileSelectionState.profiles.find(
    (entry) => entry.id === profileId
  );
  if (!profile) return;

  const autoResume = profile.promptResumes.find((resume) => resume.autoSelect);
  const promptResumeId = autoResume?.id || profile.selectedPromptResumeId;
  if (!promptResumeId) return;

  await setPromptResumeAutoSelect(profileId, promptResumeId, !autoResume);
}

function renderProfileList() {
  if (!profileList) return;

  profileList.innerHTML = "";
  const showNoModelProgress = isNoModelSaveMode();
  const noModelReport = showNoModelProgress
    ? noModelProgressByTabId[activeTabId]
    : null;

  if (profileSelectionState.profiles.length === 0) {
    const empty = document.createElement("p");
    empty.className = "profile-list-empty";
    empty.textContent = "No profiles yet. Add one below.";
    profileList.appendChild(empty);
    return;
  }

  profileSelectionState.profiles.forEach((profile) => {
    const isSelected = profileSelectionState.selectedProfileIds.includes(profile.id);
    const autoResume = profile.promptResumes.find((resume) => resume.autoSelect);
    const isAutoSelected = Boolean(autoResume);
    const savedProgress = noModelReport?.profiles?.find(
      (entry) => entry.id === profile.id
    );
    const displayedProgress = savedProgress || (showNoModelProgress
      ? {
          id: profile.id,
          name: profile.name,
          stage: "idle",
          status: "idle"
        }
      : null);
    const displayedReport = noModelReport || {
      jobTitle: "Save process",
      jobUrl: "",
      status: "idle"
    };

    const item = document.createElement("li");
    item.className = "profile-item";
    item.dataset.profileId = profile.id;
    item.classList.toggle("is-selected", isSelected);
    item.classList.toggle("has-no-model-progress", Boolean(displayedProgress));
    if (displayedProgress) {
      item.dataset.saveStatus = displayedProgress.deleted
        ? "deleted"
        : displayedProgress.deleting
          ? "deleting"
          : displayedProgress.status;
    }

    const header = document.createElement("div");
    header.className = "profile-item-header";

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "profile-drag-handle";
    dragHandle.draggable = true;
    dragHandle.setAttribute("aria-label", `Reorder ${profile.name}`);
    dragHandle.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
      </svg>
    `;
    dragHandle.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    dragHandle.addEventListener("dragstart", (event) => {

      draggedProfileId = profile.id;
      item.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", profile.id);
    });
    dragHandle.addEventListener("dragend", () => {
      clearProfileDragState();
    });

    const selectionCheckbox = document.createElement("input");
    const hasSelectedPromptResume = Boolean(profile.selectedPromptResumeId);
    selectionCheckbox.type = "checkbox";
    selectionCheckbox.className = "profile-selection-checkbox";
    selectionCheckbox.checked = isSelected;
    selectionCheckbox.dataset.hasSelectedPromptResume = String(
      hasSelectedPromptResume
    );
    selectionCheckbox.disabled =
      areActionButtonsDisabled ||
      isAutoSelected ||
      (!hasSelectedPromptResume && !isNoModelSaveMode() && !isSelected);
    selectionCheckbox.title = isAutoSelected
      ? "Auto-enabled profiles stay selected"
      : "";
    selectionCheckbox.setAttribute(
      "aria-label",
      `${isSelected ? "Remove" : "Add"} ${profile.name} ${
        isSelected ? "from" : "to"
      } this application`
    );
    selectionCheckbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    selectionCheckbox.addEventListener("change", async () => {

      await toggleProfileSelection(profile.id);
    });

    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (draggedProfileId && draggedProfileId !== profile.id) {
        item.classList.add("is-drag-over");
      }
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("is-drag-over");
    });
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      item.classList.remove("is-drag-over");

      const draggedId = event.dataTransfer.getData("text/plain") || draggedProfileId;
      reorderProfile(draggedId, profile.id);
      clearProfileDragState();
    });

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "profile-copy profile-name profile-selection-label";
    copy.disabled = selectionCheckbox.disabled;
    copy.title = isAutoSelected ? "Auto-enabled profiles stay selected" : "";
    copy.dataset.hasSelectedPromptResume = String(hasSelectedPromptResume);
    copy.setAttribute("aria-pressed", String(isSelected));
    copy.setAttribute(
      "aria-label",
      `${isSelected ? "Remove" : "Add"} ${profile.name} ${
        isSelected ? "from" : "to"
      } this application`
    );
    copy.addEventListener("click", async () => {
      await toggleProfileSelection(profile.id);
    });

    const label = document.createElement("span");
    label.className = "profile-label";
    label.textContent = profile.name;
    label.title = profile.name;
    copy.append(label);

    const actions = document.createElement("div");
    actions.className = "profile-actions";

    const autoButton = document.createElement("button");
    autoButton.type = "button";
    autoButton.className = "profile-auto-select";
    autoButton.textContent = "Auto";
    autoButton.classList.toggle("is-active", Boolean(autoResume));
    autoButton.setAttribute("aria-pressed", String(Boolean(autoResume)));
    autoButton.setAttribute("aria-label", `Auto-select prompt resume for ${profile.name}`);
    autoButton.dataset.hasResume = String(
      Boolean(autoResume || profile.selectedPromptResumeId)
    );
    autoButton.disabled =
      areActionButtonsDisabled || autoButton.dataset.hasResume !== "true";
    autoButton.title = autoResume
      ? `Auto-select on: ${autoResume.label}`
      : profile.selectedPromptResumeId
        ? "Automatically select this profile's chosen resume after each save"
        : "Choose a prompt resume in Settings first";
    autoButton.addEventListener("click", () => toggleProfileAutoSelect(profile.id));

    const settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className = "profile-resume-settings";
    settingsButton.disabled = areActionButtonsDisabled;
    settingsButton.title = "Prompt resume settings";
    settingsButton.setAttribute("aria-label", `Prompt resume settings for ${profile.name}`);
    settingsButton.setAttribute("aria-haspopup", "dialog");
    settingsButton.setAttribute("aria-controls", "profileResumeSettingsModal");
    settingsButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h9" />
        <circle cx="16" cy="7" r="2" />
        <path d="M18 7h2" />
        <path d="M4 17h2" />
        <circle cx="9" cy="17" r="2" />
        <path d="M11 17h9" />
      </svg>
    `;
    settingsButton.addEventListener("click", () =>
      openProfileResumeSettingsModal(profile.id)
    );

    const notesButton = document.createElement("button");
    notesButton.type = "button";
    notesButton.className = "profile-notes";
    notesButton.setAttribute("aria-label", `Notes for ${profile.name}`);
    notesButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    `;
    notesButton.addEventListener("click", async (event) => {
      event.stopPropagation();


      if (profile.id !== profileSelectionState.selectedProfileId) {
        await selectProfile(profile.id);
      }

      openProfileNotesModal(profile.id);
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "profile-edit";
    editButton.setAttribute("aria-label", `Edit ${profile.name}`);
    editButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    `;
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openEditProfileModal(profile.id);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "profile-remove";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Remove ${profile.name}`);
    removeButton.disabled = profileSelectionState.profiles.length <= 1;
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeProfile(profile.id);
    });

    actions.append(autoButton, settingsButton, notesButton, editButton, removeButton);
    header.append(dragHandle, selectionCheckbox, copy, actions);

    item.append(header);
    if (displayedProgress) {
      const progressPanel = createNoModelProfileProgress(
        displayedReport,
        displayedProgress
      );
      const selectionEnabled = !selectionCheckbox.disabled;
      progressPanel.classList.add("is-profile-selection-target");
      progressPanel.dataset.selectionEnabled = String(selectionEnabled);
      progressPanel.title = isAutoSelected
        ? `${profile.name} stays selected while Auto is enabled`
        : selectionEnabled
          ? `${isSelected ? "Deselect" : "Select"} ${profile.name}`
          : `Profile selection is locked while saving ${profile.name}`;
      progressPanel.addEventListener("click", async (event) => {
        if (
          !selectionEnabled ||
          event.defaultPrevented ||
          event.target?.closest?.(".no-model-profile-action")
        ) {
          return;
        }
        await toggleProfileSelection(profile.id);
      });
      item.append(progressPanel);
    }
    profileList.appendChild(item);
  });
  renderProfileResumeSettings();
}

async function persistProfileSelection(successMessage) {
  const response = await chrome.runtime.sendMessage({
    type: "SAVE_PROFILE_SELECTION",
    profiles: profileSelectionState.profiles,
    selectedProfileId: profileSelectionState.selectedProfileId,
    selectedProfileIds: profileSelectionState.selectedProfileIds,
    selectionVersion: profileSelectionState.selectionVersion
  });

  if (!response?.ok) {
    throw new Error(response?.error || "Could not save profile selection.");
  }

  profileSelectionState = normalizeProfileSelectionState(response);
  syncProfileSelectionForActiveTab();

  syncPromptResumeStateFromSelectedProfile();
  renderProfileList();

  if (successMessage) {
    addLog("success", successMessage);
  }
}

async function toggleProfileSelection(profileId) {
  const profile = profileSelectionState.profiles.find(
    (entry) => entry.id === profileId
  );
  if (!profile) {
    return;
  }

  if (getAutoSelectedPromptResumeId(profile.promptResumes)) {
    syncProfileSelectionForActiveTab();
    renderProfileList();
    return;
  }

  const selectedIds = new Set(profileSelectionState.selectedProfileIds);
  const willSelect = !selectedIds.has(profileId);
  if (willSelect && !profile.selectedPromptResumeId && !isNoModelSaveMode()) {
    renderProfileList();
    return;
  }

  if (willSelect) {
    selectedIds.add(profileId);
    profileSelectionState.selectedProfileId = profileId;
  } else {
    selectedIds.delete(profileId);
  }

  profileSelectionState.selectedProfileIds = profileSelectionState.profiles
    .map((entry) => entry.id)
    .filter((id) => selectedIds.has(id));
  rememberCurrentManualProfileSelection();

  try {
    await persistProfileSelection(
      willSelect
        ? `Added "${profile.name}" to this application.`
        : `Removed "${profile.name}" from this application.`
    );
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not update profile selection.");
    await loadProfileSelection();
  }
}

async function loadProfileSelection() {
  isProfileSelectionLoaded = false;
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_PROFILE_SELECTION"
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not load profiles.");
    }

    profileSelectionState = normalizeProfileSelectionState(response);
    syncProfileSelectionForActiveTab();
    syncPromptResumeStateFromSelectedProfile();
    renderProfileList();
    isProfileSelectionLoaded = true;
  } catch (error) {
    console.error(error);
    profileSelectionState = normalizeProfileSelectionState(null);
    syncProfileSelectionForActiveTab();
    syncPromptResumeStateFromSelectedProfile();
    renderProfileList();
    addLog("error", error.message || "Could not load profiles.");
  }
}

async function selectProfile(profileId) {

  if (profileId === profileSelectionState.selectedProfileId) {
    syncPromptResumeStateFromSelectedProfile();
    renderProfileList();
    return;
  }

  const profile = profileSelectionState.profiles.find((entry) => entry.id === profileId);
  profileSelectionState.selectedProfileId = profileId;

  try {
    await persistProfileSelection(`Editing profile: ${profile?.name || profileId}`);
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not update profile selection.");
    await loadProfileSelection();
  }
}

async function removeProfile(profileId) {

  if (profileSelectionState.profiles.length <= 1) {
    addLog("error", "At least one profile is required.");
    return;
  }

  const removed = profileSelectionState.profiles.find((entry) => entry.id === profileId);
  profileSelectionState.profiles = profileSelectionState.profiles.filter(
    (entry) => entry.id !== profileId
  );
  profileSelectionState.selectedProfileIds =
    profileSelectionState.selectedProfileIds.filter((id) => id !== profileId);
  rememberCurrentManualProfileSelection();

  if (profileSelectionState.selectedProfileId === profileId) {
    profileSelectionState.selectedProfileId =
      profileSelectionState.profiles[0]?.id || "";
  }

  try {
    await persistProfileSelection(
      removed ? `"${removed.name}" removed.` : "Profile removed."
    );
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not remove profile.");
    await loadProfileSelection();
  }
}

async function submitProfileForm() {
  clearProfileFormModalStatus();

  const name = profileNameInput?.value.trim() || "";
  const resumeTemplateId = resumeTemplateInput?.value.trim() || "";

  if (!name) {
    const message = "Enter a profile name.";
    showProfileFormModalStatus("error", message);
    profileNameInput?.focus();
    return;
  }

  if (!resumeTemplateId) {
    const message = "Enter a Resume Google Doc URL or document ID.";
    showProfileFormModalStatus("error", message);
    resumeTemplateInput?.focus();
    return;
  }

  const isEdit = profileFormMode === "edit" && editingProfileId;

  if (profileFormModalSubmitButton) {
    profileFormModalSubmitButton.disabled = true;
  }

  try {
    if (isEdit) {
      profileSelectionState.profiles = profileSelectionState.profiles.map((entry) =>
        entry.id === editingProfileId
          ? { ...entry, name, resumeTemplateId }
          : entry
      );
    } else {
      const profile = {
        id: createProfileId(),
        name,
        resumeTemplateId,
        notes: "",
        promptResumes: [],
        selectedPromptResumeId: ""
      };
      profileSelectionState.profiles = [...profileSelectionState.profiles, profile];
      profileSelectionState.selectedProfileId = profile.id;
    }

    await persistProfileSelection(
      isEdit ? `"${name}" updated.` : `"${name}" added.`
    );
    setProfileFormModalOpen(false);
  } catch (error) {
    console.error(error);
    const message =
      error.message || (isEdit ? "Could not update profile." : "Could not add profile.");
    showProfileFormModalStatus("error", message);
    addLog("error", message);
  } finally {
    if (profileFormModalSubmitButton) {
      profileFormModalSubmitButton.disabled = false;
    }
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

function isJobrightUrl(url = "") {
  try {
    const parsed = new URL(String(url || ""));
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "jobright.ai" ||
        parsed.hostname.endsWith(".jobright.ai"))
    );
  } catch (_error) {
    return false;
  }
}

function isJobrightRecommendationsUrl(url = "") {
  try {
    const parsed = new URL(String(url || ""));
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "jobright.ai" ||
        parsed.hostname.endsWith(".jobright.ai")) &&
      parsed.pathname.replace(/\/+$/, "") === "/jobs/recommend"
    );
  } catch (_error) {
    return false;
  }
}

function isPinnedTabSupportedUrl(url = "") {
  return isGoogleSheetsDocumentUrl(url) || isJobrightUrl(url);
}

async function refreshActionHotkeys() {
  try {
    const commands = await chrome.commands.getAll();
    const shortcutsByCommand = new Map(
      commands.map((command) => [command.name, command.shortcut || ""])
    );

    if (saveHotkeyValue) {
      saveHotkeyValue.textContent =
        shortcutsByCommand.get("save-app") || "Not assigned";
    }
    if (playPostingHotkeyValue) {
      playPostingHotkeyValue.textContent =
        shortcutsByCommand.get("play-posting") || "Not assigned";
    }

    Object.values(actionSettingsDialogs).forEach((dialog) => {
      if (!dialog.hotkeyValue) {
        return;
      }

      dialog.hotkeyValue.textContent =
        shortcutsByCommand.get(dialog.command) || "Not assigned";
    });
  } catch (error) {
    console.error("Could not read action hotkeys:", error);
    if (playPostingHotkeyValue) {
      playPostingHotkeyValue.textContent = "Unavailable";
    }
    if (saveHotkeyValue) {
      saveHotkeyValue.textContent = "Unavailable";
    }
    Object.values(actionSettingsDialogs).forEach((dialog) => {
      if (dialog.hotkeyValue) {
        dialog.hotkeyValue.textContent = "Unavailable";
      }
    });
  }
}

function setActionSettingsModalOpen(action, isOpen, { returnFocus = true } = {}) {
  const dialog = actionSettingsDialogs[action];
  if (!dialog?.modal) {
    return;
  }

  if (isOpen) {
    Object.values(actionSettingsDialogs).forEach((entry) => {
      if (!entry.modal || entry === dialog) {
        return;
      }
      entry.modal.classList.add("is-hidden");
      entry.modal.setAttribute("aria-hidden", "true");
    });
  }

  const wasOpen = !dialog.modal.classList.contains("is-hidden");
  dialog.modal.classList.toggle("is-hidden", !isOpen);
  dialog.modal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    refreshActionHotkeys();
    if (action === "checkPosting") {
      loadCheckPostingSettings();
    }
    dialog.closeButton?.focus();
  } else if (wasOpen && returnFocus) {
    dialog.trigger?.focus();
  }
}

async function openChromeShortcutSettings() {
  try {
    await chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  } catch (error) {
    console.error("Could not open Chrome shortcut settings:", error);
    showStatus(
      "error",
      "Open chrome://extensions/shortcuts to assign the action hotkey."
    );
  }
}
function updateSaveButtonDisabledState() {
  if (!saveButton) {
    return;
  }

  const isDisabled =
    areActionButtonsDisabled || isCurrentTabGoogleSheet || isCurrentTabJobright;
  saveButton.disabled = isDisabled;
  saveButton.setAttribute("aria-disabled", String(isDisabled));

  if (isCurrentTabGoogleSheet) {
    saveButton.title = "Save App is unavailable while the current tab is a Google Sheet.";
  } else if (isCurrentTabJobright) {
    saveButton.title = "Save App is unavailable while the current tab is Jobright.";
  } else {
    saveButton.title = "Save App";
  }
}

function updateMakeResumeButtonDisabledState() {
  if (!openSplitWindowsButton) {
    return;
  }

  const isDisabled =
    areActionButtonsDisabled || isMakeResumeOpening || !isCurrentTabGoogleSheet;
  openSplitWindowsButton.disabled = isDisabled;
  openSplitWindowsButton.setAttribute("aria-disabled", String(isDisabled));
  if (makeResumeCurrentSettingsButton) {
    makeResumeCurrentSettingsButton.disabled = isDisabled;
  }

  openSplitWindowsButton.title = isCurrentTabGoogleSheet
    ? "Make a resume"
    : "Make a resume is available only when the current tab is a Google Sheet.";
}

function updateCheckPostingButtonDisabledState() {
  updatePlayButtonDisabledState();
  if (!checkPostingButton) {
    return;
  }

  const isDisabled =
    areActionButtonsDisabled ||
    isCheckPostingRunning ||
    Boolean(playPostingBatchState) ||
    isCurrentTabGoogleSheet ||
    isCurrentTabJobright;
  checkPostingButton.disabled = isDisabled;
  checkPostingButton.setAttribute("aria-disabled", String(isDisabled));

  if (isCurrentTabGoogleSheet) {
    checkPostingButton.title =
      "Check posting is available on a job posting page.";
  } else if (isCurrentTabJobright) {
    checkPostingButton.title =
      "Check posting is available on a job posting page.";
  } else {
    checkPostingButton.title = "Send this posting URL to the selected AI chat";
  }
}

function isPlayAiChatUrl(url = "") {
  try {
    const parsed = new URL(String(url || "").trim());
    if (parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === "chatgpt.com" ||
      hostname === "chat.openai.com" ||
      hostname === "chat.deepseek.com" ||
      hostname === "perplexity.ai" ||
      hostname.endsWith(".perplexity.ai") ||
      ((hostname === "copilot.microsoft.com" ||
        hostname.endsWith(".copilot.microsoft.com")) &&
        /^\/chats\/[A-Za-z0-9_-]+\/?$/.test(parsed.pathname))
    );
  } catch (_error) {
    return false;
  }
}

function updatePlayButtonDisabledState() {
  if (!playButton) {
    return;
  }
  const ownsBatch = playPostingBatchState?.ownerTabId === activeTabId;
  const isDisabled = isCheckPostingRunning || (!ownsBatch && (
    areActionButtonsDisabled || !isCurrentTabPlayAiChat || Boolean(playPostingBatchState)
  ));
  playButton.disabled = isDisabled;
  playButton.setAttribute("aria-disabled", String(isDisabled));
  playButton.setAttribute("aria-label", ownsBatch ? "Stop Play" : "Play");
  playButton.querySelector("path")?.setAttribute("d", ownsBatch ? "M7 7h10v10H7z" : "m8 5 11 7-11 7z");
  playButton.title = ownsBatch
    ? `Stop Play (${playPostingBatchState.completedCount}/${playPostingBatchState.tabCount} sent)`
    : playPostingBatchState ? "Play is running in another AI chat tab"
    : isCurrentTabPlayAiChat
    ? "Send the rightmost ungrouped, unpinned tab URL to this AI chat"
    : "Play is available on an unpinned AI chat tab";
}

async function loadPlayPostingBatchState() {
  const stored = await chrome.storage.session.get(PLAY_POSTING_BATCH_STORAGE_KEY);
  playPostingBatchState = stored[PLAY_POSTING_BATCH_STORAGE_KEY] || null;
  updateCheckPostingButtonDisabledState();
}

function updateMakeOrOpenAiTabButtonDisabledState() {
  if (!makeOrOpenAiTabButton) {
    return;
  }

  const isDisabled = areActionButtonsDisabled || isMakeOrOpenAiTabRunning;
  makeOrOpenAiTabButton.disabled = isDisabled;
  makeOrOpenAiTabButton.setAttribute("aria-disabled", String(isDisabled));
  makeOrOpenAiTabButton.title =
    "Open the selected AI chat, or create it if it is not open";
}

function updateJobrightOpenControlsDisabledState() {
  const isDisabled =
    areActionButtonsDisabled || isJobrightOpening || !isCurrentTabJobright;

  if (!openJobrightJobsButton) {
    return;
  }

  openJobrightJobsButton.disabled = isDisabled;
  openJobrightJobsButton.setAttribute("aria-disabled", String(isDisabled));

  openJobrightJobsButton.title = isCurrentTabJobright
    ? "Open Jobright applications"
    : "Open is available only on Jobright Recommendations.";
}

async function refreshMakeResumeButtonAvailability() {
  const requestId = ++makeResumeAvailabilityRequestId;

  try {
    const [tab] = Number.isInteger(activeTabId)
      ? [await chrome.tabs.get(activeTabId)]
      : await chrome.tabs.query({
          active: true,
          lastFocusedWindow: true
        });

    if (requestId !== makeResumeAvailabilityRequestId) {
      return;
    }

    isCurrentTabGoogleSheet = isGoogleSheetsDocumentUrl(tab?.url || "");
    isCurrentTabJobright = isJobrightRecommendationsUrl(tab?.url || "");
    isCurrentTabPlayAiChat = !tab?.pinned && isPlayAiChatUrl(tab?.url || "");
  } catch (error) {
    if (requestId !== makeResumeAvailabilityRequestId) {
      return;
    }

    console.error("Could not check the current tab for Google Sheets:", error);
    isCurrentTabGoogleSheet = false;
    isCurrentTabJobright = false;
    isCurrentTabPlayAiChat = false;
  }

  updateMakeResumeButtonDisabledState();
  updateJobrightOpenControlsDisabledState();
  updateCheckPostingButtonDisabledState();
  updateMakeOrOpenAiTabButtonDisabledState();
  updateSaveButtonDisabledState();
}

function setSaveButtonsDisabled(disabled) {
  areActionButtonsDisabled = Boolean(disabled);

  updateSaveButtonDisabledState();
  updateMakeResumeButtonDisabledState();
  updateJobrightOpenControlsDisabledState();
  updateCheckPostingButtonDisabledState();
  updateMakeOrOpenAiTabButtonDisabledState();
  updateSaveWorkspaceActions();
  renderSavePostProcessControls();
  if (splitWindowsModalOpenButton) splitWindowsModalOpenButton.disabled = disabled;
  if (splitWindowsPreviewBackButton) {
    splitWindowsPreviewBackButton.disabled =
      disabled && currentSplitWindowSessionType !== "save-workspace";
  }
  if (splitWindowsPreviewDownloadButton) {
    splitWindowsPreviewDownloadButton.disabled = disabled;
  }
  if (saveConfigButton) saveConfigButton.disabled = disabled;
  if (aiProviderInput) aiProviderInput.disabled = disabled;
  if (exportAppDataIconButton) exportAppDataIconButton.disabled = disabled;
  if (applicationWorkspaceExportButton) {
    applicationWorkspaceExportButton.disabled = disabled;
  }
  if (exportAppDataModalConfirmButton) {
    exportAppDataModalConfirmButton.disabled = disabled;
  }
  if (exportIncludePromptResumeInfoCheckbox) {
    exportIncludePromptResumeInfoCheckbox.disabled = disabled;
  }
  if (homeWorkspaceImportButton) homeWorkspaceImportButton.disabled = disabled;
  if (applicationWorkspaceImportButton) {
    applicationWorkspaceImportButton.disabled = disabled;
  }
  if (importAppDataModalConfirmButton) {
    importAppDataModalConfirmButton.disabled = disabled;
  }
  if (importIncludePromptResumeInfoCheckbox) {
    importIncludePromptResumeInfoCheckbox.disabled = disabled;
  }
  if (addProfileButton) addProfileButton.disabled = disabled;
  profileList
    ?.querySelectorAll(
      ".profile-resume-settings, .profile-auto-select, .profile-notes, " +
      ".profile-selection-checkbox, .profile-selection-label"
    )
    .forEach((control) => {
      const isProfileSelectionControl =
        control.classList.contains("profile-selection-checkbox") ||
        control.classList.contains("profile-selection-label");
      const isSelectedProfileControl =
        control.classList.contains("profile-selection-checkbox")
          ? control.checked
          : control.getAttribute("aria-pressed") === "true";
      const isUnavailableProfileSelection =
        isProfileSelectionControl &&
        !isNoModelSaveMode() && !isSelectedProfileControl &&
        control.dataset.hasSelectedPromptResume !== "true";
      const isUnavailableProfileAuto =
        control.classList.contains("profile-auto-select") &&
        control.dataset.hasResume !== "true";
      control.disabled =
        disabled || isUnavailableProfileSelection || isUnavailableProfileAuto;
    });
  if (profileFormModalSubmitButton) profileFormModalSubmitButton.disabled = disabled;
  if (profileNotesModalSubmitButton) profileNotesModalSubmitButton.disabled = disabled;
  if (profileResumeSettingsAddButton) profileResumeSettingsAddButton.disabled = disabled;
  if (promptResumeFormModalSubmitButton) promptResumeFormModalSubmitButton.disabled = disabled;
  if (promptFormModalSubmitButton) promptFormModalSubmitButton.disabled = disabled;
  if (jobDescriptionFormModalSubmitButton) jobDescriptionFormModalSubmitButton.disabled = disabled;
  if (deleteApplicationModalConfirmButton) {
    deleteApplicationModalConfirmButton.disabled = disabled;
  }
}

function setSaveButtonsDisabledForTab(tabId, disabled) {
  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.areActionButtonsDisabled = Boolean(disabled);
    }
    schedulePersistTabSession();
    return;
  }

  setSaveButtonsDisabled(disabled);
  schedulePersistTabSession();
}

function isSavePostProcessActive(state = savePostProcessState) {
  return Boolean(state && typeof state === "object" && state.runId);
}

function resolveSavePostProcessTargetTabIds(state, fallbackOwnerTabId = null) {
  const tabIds = new Set();

  if (Number.isInteger(fallbackOwnerTabId)) {
    tabIds.add(fallbackOwnerTabId);
  }
  if (Number.isInteger(state?.ownerTabId)) {
    tabIds.add(state.ownerTabId);
  }

  if (Array.isArray(state?.involvedTabIds)) {
    state.involvedTabIds.forEach((tabId) => {
      if (Number.isInteger(tabId)) {
        tabIds.add(tabId);
      }
    });
  }

  runTabIdsByRunId.get(state?.runId)?.forEach((tabId) => tabIds.add(tabId));

  saveWorkspacesByTabId.forEach((workspace, tabId) => {
    if (
      workspace?.runId &&
      state?.runId &&
      workspace.runId === state.runId &&
      Number.isInteger(tabId)
    ) {
      tabIds.add(tabId);
    }
  });

  return [...tabIds];
}

function getSelectedAiProviderId() {
  return normalizeAiProviderId(
    aiProviderInput?.value || configuredAiProviderId
  );
}

function isNoModelSaveMode() {
  return getSelectedAiProviderId() === "none";
}

function syncSaveModeUi() {
  document.querySelector(".job-description-card")?.classList.toggle("is-hidden", isNoModelSaveMode());
  if (isNoModelSaveMode() && jobDescriptionFormModal &&
      !jobDescriptionFormModal.classList.contains("is-hidden")) {
    setJobDescriptionFormModalOpen(false);
  }
  renderNoModelSaveProgress();
}

async function loadNoModelSaveProgress() {
  const stored = await chrome.storage.session.get(NO_MODEL_PROGRESS_STORAGE_KEY);
  noModelProgressByTabId = stored[NO_MODEL_PROGRESS_STORAGE_KEY] || {};
  renderNoModelSaveProgress();
}

async function persistNoModelProgressReport(report) {
  if (!Number.isInteger(report?.ownerTabId)) return;
  noModelProgressByTabId = {
    ...noModelProgressByTabId,
    [report.ownerTabId]: report
  };
  renderNoModelSaveProgress();
  await chrome.storage.session.set({
    [NO_MODEL_PROGRESS_STORAGE_KEY]: noModelProgressByTabId
  });
}

function renderNoModelSaveProgress() {
  renderProfileList();
}

async function openNoModelProfileGoogleSheet(sheetUrl) {
  const targetUrl = String(sheetUrl || "").trim();
  if (!isGoogleSheetsDocumentUrl(targetUrl)) {
    throw new Error("A valid Google Sheet URL is required.");
  }

  return chrome.windows.create({
    url: targetUrl,
    type: "normal",
    focused: true
  });
}

function buildConfiguredGoogleSheetUrl(spreadsheetIdInput) {
  const rawValue = String(spreadsheetIdInput || "").trim();
  const urlMatch = rawValue.match(
    /\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9-_]+)/
  );
  const spreadsheetId = urlMatch ? urlMatch[1] : rawValue;
  if (!/^[a-zA-Z0-9-_]+$/.test(spreadsheetId)) {
    throw new Error("A valid Google Sheet ID is required in Save settings.");
  }
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}

async function openConfiguredGoogleSheet() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_SHEET_CONFIG"
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not load Google Sheet settings.");
    }

    const sheetUrl = buildConfiguredGoogleSheetUrl(response.spreadsheetId);
    await openNoModelProfileGoogleSheet(sheetUrl);
    addLog("success", "Opened the configured Google Sheet in a new Chrome window.");
  } catch (error) {
    console.error("Could not open the configured Google Sheet:", error);
    addLog("error", error.message || "Could not open the configured Google Sheet.");
  }
}

function applyCheckPostingSettings(config = {}) {
  const providerId = CHECK_POSTING_AI_PROVIDER_IDS.includes(config.providerId)
    ? config.providerId
    : "copilot";
  const selectedProvider = document.querySelector(
    `input[name="checkPostingAiProvider"][value="${providerId}"]`
  );
  if (selectedProvider) {
    selectedProvider.checked = true;
  }

  for (const id of CHECK_POSTING_AI_PROVIDER_IDS) {
    const input = document.querySelector(`#checkPostingUrl-${id}`);
    if (input) {
      input.value = String(config.urls?.[id] || "");
    }
  }

  if (checkPostingAutoNextTabInput) {
    checkPostingAutoNextTabInput.checked = config.autoNextTab === true;
  }
  if (playPostingTabCountInput) {
    playPostingTabCountInput.value = String(config.playTabCount || 1);
  }
}

function readCheckPostingSettingsForm() {
  const selectedProvider = document.querySelector(
    'input[name="checkPostingAiProvider"]:checked'
  );
  const urls = {};
  for (const id of CHECK_POSTING_AI_PROVIDER_IDS) {
    urls[id] = String(
      document.querySelector(`#checkPostingUrl-${id}`)?.value || ""
    ).trim();
  }

  return {
    providerId: selectedProvider?.value || "copilot",
    urls,
    autoNextTab: checkPostingAutoNextTabInput?.checked === true,
    playTabCount: Number(playPostingTabCountInput?.value ?? 1)
  };
}

async function loadCheckPostingSettings() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_CHECK_POSTING_CONFIG"
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not load Check posting settings.");
    }
    applyCheckPostingSettings(response);
  } catch (error) {
    console.error("Could not load Check posting settings:", error);
    showStatus(
      "error",
      error.message || "Could not load Check posting settings."
    );
  }
}

async function saveCheckPostingSettings() {
  if (playPostingTabCountInput && !playPostingTabCountInput.reportValidity()) {
    return false;
  }
  const settings = readCheckPostingSettingsForm();
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_CHECK_POSTING_CONFIG",
      providerId: settings.providerId,
      urls: settings.urls,
      autoNextTab: settings.autoNextTab,
      playTabCount: settings.playTabCount
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not save Check posting settings.");
    }
    applyCheckPostingSettings(response);
    return true;
  } catch (error) {
    console.error("Could not save Check posting settings:", error);
    showStatus(
      "error",
      error.message || "Could not save Check posting settings."
    );
    addLog("error", error.message || "Could not save Check posting settings.");
    return false;
  }
}

async function makeOrOpenSelectedAiTab() {
  if (makeOrOpenAiTabButton?.disabled || isMakeOrOpenAiTabRunning) {
    return;
  }

  isMakeOrOpenAiTabRunning = true;
  updateMakeOrOpenAiTabButtonDisabledState();

  try {
    const { ownerTabId, runId } = beginRunForTab(activeTabId);
    const response = await chrome.runtime.sendMessage({
      type: "MAKE_OR_OPEN_CHECK_POSTING_AI_TAB",
      runId,
      ownerTabId
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not open the AI tab.");
    }
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not open the AI tab.");
    showStatus("error", error.message || "Could not open the AI tab.");
  } finally {
    isMakeOrOpenAiTabRunning = false;
    updateMakeOrOpenAiTabButtonDisabledState();
  }
}

async function checkCurrentPosting() {
  if (checkPostingButton?.disabled || isCheckPostingRunning) {
    return;
  }

  const requestedOwnerTabId = activeTabId;
  isCheckPostingRunning = true;
  updateCheckPostingButtonDisabledState();

  try {
    const tabValidation = await validateActiveBrowserTabForAppAction(
      requestedOwnerTabId
    );
    if (!tabValidation.ok) {
      throw new Error(tabValidation.error);
    }

    const { ownerTabId, runId } = beginRunForTab(tabValidation.tabId);
    const response = await chrome.runtime.sendMessage({
      type: "CHECK_POSTING_TO_COPILOT",
      runId,
      ownerTabId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not send this posting to Copilot.");
    }
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not send this posting to Copilot.");
    showStatus("error", error.message || "Could not send this posting to Copilot.");
  } finally {
    isCheckPostingRunning = false;
    updateCheckPostingButtonDisabledState();
  }
}

async function playRightmostPosting() {
  const ownsBatch = playPostingBatchState?.ownerTabId === activeTabId;
  if (playButton?.disabled || isCheckPostingRunning || (!ownsBatch && areActionButtonsDisabled)) {
    return;
  }

  const requestedOwnerTabId = activeTabId;
  isCheckPostingRunning = true;
  updateCheckPostingButtonDisabledState();

  try {
    const { ownerTabId, runId } = beginRunForTab(requestedOwnerTabId);
    const response = await chrome.runtime.sendMessage({
      type: ownsBatch ? "CANCEL_PLAY_POSTING_BATCH" : "PLAY_RIGHTMOST_POSTING_TO_AI",
      runId,
      ownerTabId
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not send the rightmost tab URL to this AI chat.");
    }
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not send the rightmost tab URL to this AI chat.");
    showStatus("error", error.message || "Could not send the rightmost tab URL to this AI chat.");
  } finally {
    isCheckPostingRunning = false;
    updateCheckPostingButtonDisabledState();
  }
}

function createNoModelProfileProgress(report, profile) {
  const isIdle = profile.status === "idle";
  const progress = document.createElement("section");
  progress.className = "no-model-profile-progress";
  progress.classList.toggle("is-disabled", isIdle);
  progress.dataset.status = profile.deleted
    ? "deleted"
    : profile.deleting
      ? "deleting"
      : profile.status;
  progress.setAttribute("role", "status");
  progress.setAttribute("aria-live", "polite");
  progress.setAttribute("aria-disabled", String(isIdle));
  progress.setAttribute(
    "aria-label",
    `Application save progress for ${profile.name}`
  );

  const heading = document.createElement("div");
  heading.className = "no-model-profile-progress-heading";
  const job = document.createElement("span");
  job.className = "no-model-profile-job";
  job.textContent = isIdle ? "Save process" : report.jobTitle || "Job page";
  job.title = report.jobUrl || "";
  const badge = document.createElement("span");
  badge.className = "no-model-profile-badge";
  const labels = {
    idle: "Not started",
    queued: "Waiting",
    saved: "Saved",
    failed: "Failed",
    cancelled: "Cancelled",
    skipped: "Not started"
  };
  badge.textContent = profile.deleted
    ? "Deleted"
    : profile.deleting
      ? "Deleting"
      : labels[profile.status] ||
        (profile.stage === "sheet" ? "Saving row" : "Copying resume");
  heading.append(job, badge);

  const steps = document.createElement("ol");
  steps.className = "no-model-profile-steps";
  const stepLabels = [
    "Page captured",
    "Resume copied",
    profile.deleted ? "Sheet removed" : "Sheet saved"
  ];
  const stepStates = stepLabels.map((_label, stepIndex) => {
    const done = !isIdle && (
      stepIndex === 0 ||
      (stepIndex === 1 && profile.resumeUrl) ||
      (stepIndex === 2 && profile.status === "saved")
    );
    const current = !isIdle &&
      stepIndex === (profile.stage === "sheet" ? 2 : 1);
    const stopped = current &&
      (profile.status === "failed" || profile.status === "cancelled");
    return done
      ? "done"
      : current && profile.status === "running"
        ? "active"
        : stopped
          ? profile.status
          : "pending";
  });
  stepLabels.forEach(
    (label, stepIndex) => {
      const state = stepStates[stepIndex];
      const done = state === "done";
      const step = document.createElement("li");
      step.dataset.state = state;
      if (stepIndex < stepStates.length - 1) {
        const nextState = stepStates[stepIndex + 1];
        step.dataset.connectorState = nextState === "done"
          ? "done"
          : state === "done" && nextState === "active"
            ? "active"
            : "pending";
      }
      step.setAttribute(
        "aria-label",
        `${label}: ${state === "done" ? "complete" : state}`
      );
      const marker = document.createElement("span");
      marker.className = "no-model-step-marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = done ? "\u2713" : String(stepIndex + 1);
      const caption = document.createElement("span");
      caption.textContent = label;
      step.append(marker, caption);
      steps.append(step);
    }
  );
  progress.append(heading, steps);

  const actions = document.createElement("div");
  actions.className = "no-model-profile-actions";
  const canCancelRun =
    !isIdle &&
    report.status === "running" &&
    isSavePostProcessActive() &&
    report.runId === savePostProcessState?.runId;
  if (canCancelRun) {
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className =
      "no-model-profile-action no-model-profile-cancel";
    cancelButton.disabled = isSavePostProcessRequestPending;
    cancelButton.setAttribute(
      "aria-label",
      `Cancel the save process from ${profile.name}`
    );
    cancelButton.title = "Cancel the current save process";
    cancelButton.textContent = isSavePostProcessRequestPending
      ? "Cancelling..."
      : "Cancel Process";
    cancelButton.addEventListener("click", async (event) => {
      event?.stopPropagation();
      await cancelSavePostProcess();
    });
    actions.append(cancelButton);
  }
  if (isGoogleSheetsDocumentUrl(profile.sheetUrl)) {
    const link = document.createElement("a");
    link.className =
      "no-model-profile-action no-model-profile-open-sheet";
    link.href = profile.sheetUrl;
    link.title = "Open Google Sheet in a new Chrome window";
    link.textContent = "Open Google Sheet";
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      try {
        await openNoModelProfileGoogleSheet(profile.sheetUrl);
      } catch (error) {
        console.error("Could not open Google Sheet in a new window:", error);
      }
    });
    actions.append(link);
  }
  if (profile.status === "saved" && !profile.deleted) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
      "no-model-profile-action no-model-profile-delete";
    deleteButton.disabled = profile.deleting || areActionButtonsDisabled;
    deleteButton.setAttribute(
      "aria-label",
      `Delete ${profile.name} application from Google Sheet`
    );
    deleteButton.title = "Delete saved Google Sheet row";
    deleteButton.textContent = profile.deleting ? "Deleting..." : "Delete";
    deleteButton.addEventListener("click", (event) => {
      event?.stopPropagation();
      requestDeleteNoModelProfileApplication(report, profile);
    });
    actions.append(deleteButton);
  }
  if (actions.children.length > 0) {
    progress.append(actions);
  }

  const errorMessage = profile.deleteError ||
    (
      report.error &&
      (profile.status === "failed" || profile.status === "cancelled")
        ? report.error
        : ""
    );
  if (errorMessage) {
    const error = document.createElement("p");
    error.className = "no-model-profile-error";
    error.setAttribute("role", "alert");
    error.textContent = errorMessage;
    progress.append(error);
  }

  return progress;
}

function requestDeleteNoModelProfileApplication(report, profile) {
  if (
    areActionButtonsDisabled ||
    profile?.status !== "saved" ||
    profile.deleted ||
    profile.deleting
  ) {
    return;
  }

  pendingNoModelDeleteTarget = {
    ownerTabId: report.ownerTabId,
    profileId: profile.id,
    profileName: profile.name,
    jobUrl: report.jobUrl,
    resumeUrl: profile.resumeUrl
  };
  setDeleteApplicationModalOpen(true);
}

async function confirmDeleteNoModelProfileApplication() {
  const target = pendingNoModelDeleteTarget;
  if (!target) return;

  const report = noModelProgressByTabId[target.ownerTabId];
  const profile = report?.profiles?.find(
    (entry) => entry.id === target.profileId
  );
  if (!profile || profile.status !== "saved" || profile.deleted) {
    setDeleteApplicationModalOpen(false);
    return;
  }

  setDeleteApplicationModalOpen(false, { returnFocus: false });
  profile.deleting = true;
  profile.deleteError = "";
  await persistNoModelProgressReport(report);
  const runId = createRunId();

  try {
    const response = await chrome.runtime.sendMessage({
      type: "DELETE_APPLICATION_RECORD",
      runId,
      ownerTabId: target.ownerTabId,
      profileName: target.profileName,
      jobUrl: target.jobUrl,
      resumeUrl: target.resumeUrl,
      chatGptUrl: "",
      trashResume: false
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not delete the application.");
    }
    if ((Number(response.removed) || 0) < 1) {
      throw new Error("The saved Google Sheet row could not be found.");
    }

    profile.deleting = false;
    profile.deleted = true;
    profile.deletedAt = new Date().toISOString();
    await persistNoModelProgressReport(report);
    showStatusForTab(
      target.ownerTabId,
      "success",
      target.profileName,
      "Deleted from Google Sheet:"
    );
    addLogForTab(
      target.ownerTabId,
      "success",
      `Deleted the saved Google Sheet row for "${target.profileName}".`
    );
  } catch (error) {
    console.error(error);
    profile.deleting = false;
    profile.deleteError =
      error.message || "Could not delete the application from Google Sheets.";
    await persistNoModelProgressReport(report);
    showStatusForTab(target.ownerTabId, "error", profile.deleteError);
    addLogForTab(target.ownerTabId, "error", profile.deleteError);
  }
}

async function confirmDeleteApplication() {
  if (pendingNoModelDeleteTarget) {
    await confirmDeleteNoModelProfileApplication();
    return;
  }
  await confirmDeleteApplicationWorkspace();
}

function renderSavePostProcessControls() {
  renderNoModelSaveProgress();
  const hasState = isSavePostProcessActive();
  const applicationControlsVisible = hasState && !isSplitWindowsDialogOpen;
  const usesProfileCancelButtons = hasState && isNoModelSaveMode();
  // Only tabs that own/participate in this save get a locked workspace switch.
  const exchangeDisabled = hasState;

  homeCancelProcessButton?.classList.toggle(
    "is-hidden",
    !hasState || usesProfileCancelButtons
  );
  applicationCancelProcessButton?.classList.toggle(
    "is-hidden",
    !applicationControlsVisible || usesProfileCancelButtons
  );

  if (homeCancelProcessButton) {
    homeCancelProcessButton.disabled = isSavePostProcessRequestPending;
  }
  if (applicationCancelProcessButton) {
    applicationCancelProcessButton.disabled = isSavePostProcessRequestPending;
  }
  if (homeWorkspaceExchangeButton) {
    homeWorkspaceExchangeButton.disabled = exchangeDisabled;
  }
  if (splitWindowsModalCloseButton) {
    splitWindowsModalCloseButton.disabled =
      !isSplitWindowsDialogOpen && exchangeDisabled;
  }
}

function setSavePostProcessStateForTab(tabId, state) {
  const normalized = state && typeof state === "object" ? state : null;

  if (!isActiveTab(tabId)) {
    const tabState = getTabState(tabId);
    if (tabState) {
      tabState.savePostProcessState = normalized;
    }
    schedulePersistTabSession();
    return;
  }

  savePostProcessState = normalized;
  renderSavePostProcessControls();
  schedulePersistTabSession();
}

// The service worker stores one save-progress record per owning tab. Spread that
// record across every Chrome tab involved in the run so only those tabs show
// progress / locked workspace switching.
function applySavePostProcessStates(statesByTabId) {
  const map =
    statesByTabId && typeof statesByTabId === "object" ? statesByTabId : {};
  const stateByTargetTabId = new Map();

  Object.entries(map).forEach(([key, value]) => {
    const ownerTabId = Number(key);
    if (!value || typeof value !== "object" || !value.runId) {
      return;
    }

    resolveSavePostProcessTargetTabIds(value, ownerTabId).forEach((tabId) => {
      stateByTargetTabId.set(tabId, value);
      if (value.runId) {
        registerRunTab(value.runId, tabId);
      }
    });
  });

  const presentTabIds = new Set(stateByTargetTabId.keys());

  stateByTargetTabId.forEach((value, tabId) => {
    setSavePostProcessStateForTab(tabId, value);
  });

  tabStateById.forEach((_state, tabId) => {
    if (!presentTabIds.has(tabId)) {
      setSavePostProcessStateForTab(tabId, null);
    }
  });

  if (Number.isInteger(activeTabId) && !presentTabIds.has(activeTabId)) {
    setSavePostProcessStateForTab(activeTabId, null);
  }
}

function adoptSavePostProcessForRunTab(runId, tabId) {
  if (!runId || !Number.isInteger(tabId)) {
    return;
  }

  let sourceState = null;
  if (isSavePostProcessActive() && activeRunId === runId) {
    sourceState = savePostProcessState;
  } else {
    for (const state of tabStateById.values()) {
      if (state?.savePostProcessState?.runId === runId) {
        sourceState = state.savePostProcessState;
        break;
      }
    }
  }

  if (!sourceState) {
    return;
  }

  const involvedTabIds = [
    ...new Set(
      [
        ...(Array.isArray(sourceState.involvedTabIds)
          ? sourceState.involvedTabIds
          : []),
        tabId,
        sourceState.ownerTabId
      ].filter((id) => Number.isInteger(id))
    )
  ];

  setSavePostProcessStateForTab(tabId, {
    ...sourceState,
    involvedTabIds
  });
}

function setSavePostProcessRequestPendingForTab(tabId, isPending) {
  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.isSavePostProcessRequestPending = Boolean(isPending);
    }
    return;
  }

  isSavePostProcessRequestPending = Boolean(isPending);
  renderSavePostProcessControls();
}

async function cancelSavePostProcess() {
  if (isSavePostProcessRequestPending || !savePostProcessState) {
    return;
  }

  const ownerTabId = activeTabId;
  const runId = savePostProcessState?.runId || activeRunId;
  setSavePostProcessRequestPendingForTab(ownerTabId, true);

  try {
    const response = await chrome.runtime.sendMessage({
      type: "CANCEL_SAVE_POST_PROCESS",
      runId,
      ownerTabId
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not cancel the save process.");
    }
    setSavePostProcessStateForTab(ownerTabId, null);
    addLogForTab(
      ownerTabId,
      "info",
      "Save process cancelled. Any completed tabs and saved application data were kept."
    );
  } catch (error) {
    console.error("Could not cancel the save process:", error);
    addLogForTab(
      ownerTabId,
      "error",
      error.message || "Could not cancel the save process."
    );
  } finally {
    setSavePostProcessRequestPendingForTab(ownerTabId, false);
  }
}

async function loadSavePostProcessState() {
  try {
    const stored = await chrome.storage.local.get(
      SAVE_POST_PROCESS_STORAGE_KEY
    );
    applySavePostProcessStates(stored[SAVE_POST_PROCESS_STORAGE_KEY]);
  } catch (error) {
    console.error("Could not load save progress:", error);
    applySavePostProcessStates(null);
  }
}

function showPromptResumeFormModalStatus(type, message) {
  if (!promptResumeFormModalStatus) return;

  promptResumeFormModalStatus.classList.remove("is-hidden", "is-error", "is-success");
  promptResumeFormModalStatus.textContent = message;
  promptResumeFormModalStatus.classList.add(type === "error" ? "is-error" : "is-success");
}

function clearPromptResumeFormModalStatus() {
  promptResumeFormModalStatus?.classList.add("is-hidden");
  promptResumeFormModalStatus?.classList.remove("is-error", "is-success");
  if (promptResumeFormModalStatus) promptResumeFormModalStatus.textContent = "";
}

function resetPromptResumeFormModal() {
  if (promptResumeLabelInput) promptResumeLabelInput.value = "";
  if (promptResumeContentInput) promptResumeContentInput.value = "";
  clearPromptResumeFormModalStatus();
}

let promptResumeFormMode = "add";
let editingPromptResumeId = null;

function truncatePreviewText(text = "", maxLength = 60) {
  const singleLine = String(text).replace(/\s+/g, " ").trim();

  if (singleLine.length <= maxLength) {
    return singleLine;
  }

  return `${singleLine.slice(0, maxLength - 3)}...`;
}

function normalizeJobDescriptionPreview(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function formatPromptResumeUpdatedAt(updatedAt = "") {
  const iso = normalizePromptResumeUpdatedAtForDisplay(updatedAt);
  if (!iso) {
    return "";
  }

  return `Updated ${new Date(iso).toLocaleString()}`;
}

function normalizePromptResumeUpdatedAtForDisplay(value) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function updatePromptResumeFormModalCopy() {
  const isEdit = promptResumeFormMode === "edit";

  if (promptResumeFormModalTitle) {
    promptResumeFormModalTitle.textContent = isEdit
      ? "Edit Prompt Resume"
      : "Add a Prompt Resume";
  }

  if (promptResumeFormModalHelp) {
    promptResumeFormModalHelp.textContent = isEdit
      ? "View or update the prompt resume text."
      : "Add a label and the prompt resume text.";
  }

  if (promptResumeFormModalSubmitButton) {
    promptResumeFormModalSubmitButton.textContent = isEdit
      ? "Save Changes"
      : "Add a Prompt Resume";
  }

  if (promptResumeFormModalBackdrop) {
    promptResumeFormModalBackdrop.setAttribute(
      "aria-label",
      isEdit ? "Close edit prompt resume dialog" : "Close add prompt resume dialog"
    );
  }
}

function setPromptResumeFormModalOpen(isOpen, { returnToSettings = true } = {}) {
  if (!promptResumeFormModal) return;

  promptResumeFormModal.classList.toggle("is-hidden", !isOpen);
  promptResumeFormModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    setProfileResumeSettingsModalOpen(false, {
      returnFocus: false,
      preserveProfile: true
    });
    updatePromptResumeFormModalCopy();
    clearPromptResumeFormModalStatus();
    promptResumeLabelInput?.focus();
    return;
  }

  promptResumeFormMode = "add";
  editingPromptResumeId = null;
  resetPromptResumeFormModal();
  updatePromptResumeFormModalCopy();
  if (returnToSettings && profileResumeSettingsProfileId) {
    setProfileResumeSettingsModalOpen(true);
  }
}

function openAddPromptResumeModal() {
  if (areActionButtonsDisabled) return;

  addLog("info", "Add a Prompt Resume clicked.");
  promptResumeFormMode = "add";
  editingPromptResumeId = null;
  resetPromptResumeFormModal();
  setPromptResumeFormModalOpen(true);
}

function openEditPromptResumeModal(promptResumeId) {
  const promptResume = promptResumeSelectionState.promptResumes.find(
    (entry) => entry.id === promptResumeId
  );

  if (!promptResume) {
    const message = "Selected prompt resume could not be found.";
    addLog("error", message);
    return;
  }

  addLog("info", `Editing prompt resume: ${promptResume.label}`);

  promptResumeFormMode = "edit";
  editingPromptResumeId = promptResume.id;

  if (promptResumeLabelInput) promptResumeLabelInput.value = promptResume.label;
  if (promptResumeContentInput) {
    promptResumeContentInput.value = promptResume.content || "";
  }

  setPromptResumeFormModalOpen(true);
}

let promptResumeSelectionState = {
  promptResumes: [],
  selectedPromptResumeId: ""
};

let draggedPromptResumeId = "";

function movePromptResumeBeforeTarget(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) {
    return false;
  }

  const items = [...promptResumeSelectionState.promptResumes];
  const fromIndex = items.findIndex((entry) => entry.id === draggedId);
  const toIndex = items.findIndex((entry) => entry.id === targetId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return false;
  }

  const [movedItem] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, movedItem);
  promptResumeSelectionState.promptResumes = items;
  return true;
}

function clearPromptResumeDragState() {
  draggedPromptResumeId = "";

  promptResumeList
    ?.querySelectorAll(".prompt-resume-item.is-dragging, .prompt-resume-item.is-drag-over")
    .forEach((item) => {
      item.classList.remove("is-dragging", "is-drag-over");
    });
}

async function reorderPromptResume(draggedId, targetId) {
  const didMove = movePromptResumeBeforeTarget(draggedId, targetId);
  if (!didMove) {
    return;
  }

  renderPromptResumeList();

  try {
    await persistPromptResumeSelection();
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not save prompt resume order.");
    await loadPromptResumeSelection();
  }
}

function renderPromptResumeList() {
  if (!promptResumeList) return;

  promptResumeList.innerHTML = "";

  if (promptResumeSelectionState.promptResumes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "prompt-resume-list-empty";
    empty.textContent = "No prompt resumes yet. Use Add prompt resume to create one.";
    promptResumeList.appendChild(empty);
    return;
  }

  promptResumeSelectionState.promptResumes.forEach((promptResume) => {
    const item = document.createElement("li");
    item.className = "prompt-resume-item";
    item.dataset.promptResumeId = promptResume.id;
    item.classList.toggle(
      "is-selected",
      promptResume.id === promptResumeSelectionState.selectedPromptResumeId
    );

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "prompt-resume-drag-handle";
    dragHandle.draggable = !areActionButtonsDisabled;
    dragHandle.setAttribute("aria-label", `Reorder ${promptResume.label}`);
    dragHandle.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
      </svg>
    `;
    dragHandle.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    dragHandle.addEventListener("dragstart", (event) => {
      draggedPromptResumeId = promptResume.id;
      item.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", promptResume.id);
    });
    dragHandle.addEventListener("dragend", () => {
      clearPromptResumeDragState();
    });

    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      if (draggedPromptResumeId && draggedPromptResumeId !== promptResume.id) {
        item.classList.add("is-drag-over");
      }
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("is-drag-over");
    });
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      item.classList.remove("is-drag-over");

      const draggedId =
        event.dataTransfer.getData("text/plain") || draggedPromptResumeId;
      reorderPromptResume(draggedId, promptResume.id);
      clearPromptResumeDragState();
    });

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.disabled = areActionButtonsDisabled;
    radio.name = "promptResume";
    radio.value = promptResume.id;
    radio.checked =
      promptResume.id === promptResumeSelectionState.selectedPromptResumeId;
    radio.setAttribute("aria-label", `Use ${promptResume.label}`);

    const copy = document.createElement("div");
    copy.className = "prompt-resume-copy";

    const label = document.createElement("span");
    label.className = "prompt-resume-label";
    label.textContent = promptResume.label;

    const preview = document.createElement("span");
    preview.className = "prompt-resume-preview";
    preview.textContent = truncatePreviewText(promptResume.content);

    copy.append(label, preview);

    const updatedAtText = formatPromptResumeUpdatedAt(promptResume.updatedAt);
    if (updatedAtText) {
      const updated = document.createElement("span");
      updated.className = "prompt-resume-updated";
      updated.textContent = updatedAtText;
      copy.append(updated);
    }

    const actions = document.createElement("div");
    actions.className = "prompt-resume-actions";

    const isSelected =
      promptResume.id === promptResumeSelectionState.selectedPromptResumeId;

    if (isSelected) {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.disabled = areActionButtonsDisabled;
      editButton.className = "prompt-resume-edit";
      editButton.setAttribute("aria-label", `View or edit ${promptResume.label}`);
      editButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      `;
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openEditPromptResumeModal(promptResume.id);
      });
      actions.append(editButton);
    }

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.disabled = areActionButtonsDisabled ||
      promptResumeSelectionState.promptResumes.length <= 1;
    removeButton.className = "prompt-resume-remove";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Remove ${promptResume.label}`);
    if (promptResumeSelectionState.promptResumes.length <= 1) {
      removeButton.title = "Each profile must keep at least one prompt resume";
    }
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removePromptResume(promptResume.id);
    });

    actions.append(removeButton);

    item.addEventListener("click", () => {
      selectPromptResume(promptResume.id);
    });

    radio.addEventListener("click", (event) => {
      event.stopPropagation();
      selectPromptResume(promptResume.id);
    });

    item.append(dragHandle, radio, copy, actions);
    promptResumeList.appendChild(item);
  });
}

async function loadPromptResumeSelection() {
  try {
    if (!profileSelectionState.profiles.length) {
      await loadProfileSelection();
      return;
    }

    const profileId = profileResumeSettingsProfileId || getSelectedProfile()?.id;
    const response = await chrome.runtime.sendMessage({
      type: "GET_PROMPT_RESUME_SELECTION",
      profileId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not load prompt resumes.");
    }

    applyPromptResumeStateToSelectedProfile(
      response.promptResumes || [],
      response.selectedPromptResumeId || "",
      profileId
    );
    syncPromptResumeStateFromSelectedProfile();
    renderPromptResumeList();
    renderProfileList();
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not load prompt resumes.";
    addLog("error", message);
  }
}

async function persistPromptResumeSelection(successMessage) {
  const profileId = profileResumeSettingsProfileId || getSelectedProfile()?.id;
  const response = await chrome.runtime.sendMessage({
    type: "SAVE_PROMPT_RESUME_SELECTION",
    profileId,
    promptResumes: promptResumeSelectionState.promptResumes,
    selectedPromptResumeId: promptResumeSelectionState.selectedPromptResumeId
  });

  if (!response?.ok) {
    throw new Error(response?.error || "Could not save prompt resume selection.");
  }

  applyPromptResumeStateToSelectedProfile(
    response.promptResumes || [],
    response.selectedPromptResumeId || "",
    profileId
  );
  syncPromptResumeStateFromSelectedProfile();
  renderPromptResumeList();
  renderProfileList();

  if (successMessage) {
    addLog("success", successMessage);
  }
}

async function selectPromptResume(promptResumeId) {
  if (areActionButtonsDisabled) return;
  const selectedProfile = getSelectedProfile();
  const isProfileChecked = Boolean(
    selectedProfile &&
      profileSelectionState.selectedProfileIds.includes(selectedProfile.id)
  );
  if (
    promptResumeId === promptResumeSelectionState.selectedPromptResumeId &&
    isProfileChecked
  ) {
    return;
  }

  const promptResume = promptResumeSelectionState.promptResumes.find(
    (entry) => entry.id === promptResumeId
  );
  if (!promptResume || !selectedProfile) {
    addLog("error", "Could not find the selected profile resume.");
    return;
  }

  if (selectedProfile.promptResumes.some((entry) => entry.autoSelect)) {
    promptResumeSelectionState.promptResumes =
      promptResumeSelectionState.promptResumes.map((entry) => ({
        ...entry,
        autoSelect: entry.id === promptResumeId
      }));
  }
  promptResumeSelectionState.selectedPromptResumeId = promptResumeId;
  applyPromptResumeStateToSelectedProfile(
    promptResumeSelectionState.promptResumes,
    promptResumeId
  );

  if (!isProfileChecked) {
    const selectedIds = new Set([
      ...profileSelectionState.selectedProfileIds,
      selectedProfile.id
    ]);
    profileSelectionState.selectedProfileIds = profileSelectionState.profiles
      .map((entry) => entry.id)
      .filter((id) => selectedIds.has(id));
  }
  rememberCurrentManualProfileSelection();

  addLog("info", `Selected prompt resume: ${promptResume?.label || promptResumeId}`);

  try {
    await persistProfileSelection(
      isProfileChecked
        ? "Prompt resume selection updated."
        : `Prompt resume selected and "${selectedProfile.name}" added to this application.`
    );
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not update selection.";
    addLog("error", message);
    await loadProfileSelection();
  }
}

async function setPromptResumeAutoSelect(profileId, promptResumeId, enabled) {
  const profile = profileSelectionState.profiles.find(
    (entry) => entry.id === profileId
  );
  if (!profile) {
    return;
  }

  const promptResume = profile.promptResumes.find(
    (entry) => entry.id === promptResumeId
  );
  if (!promptResume) {
    addLog("error", "Could not find that prompt resume.");
    return;
  }

  const promptResumes = enforceSingleAutoSelectPromptResume(
    profile.promptResumes.map((entry) => ({
      ...entry,
      autoSelect: enabled ? entry.id === promptResumeId : false
    }))
  );

  const selectedPromptResumeId = enabled
    ? promptResumeId
    : profile.selectedPromptResumeId || promptResumes[0]?.id || "";
  const selectedIds = new Set(profileSelectionState.selectedProfileIds);
  if (enabled) selectedIds.add(profileId);
  else selectedIds.delete(profileId);

  profileSelectionState.profiles = profileSelectionState.profiles.map(
    (entry) =>
      entry.id === profileId
        ? {
            ...entry,
            promptResumes,
            selectedPromptResumeId
          }
        : entry
  );
  profileSelectionState.selectedProfileIds = profileSelectionState.profiles
    .filter((entry) => selectedIds.has(entry.id) && entry.selectedPromptResumeId)
    .map((entry) => entry.id);
  rememberCurrentManualProfileSelection();

  if (profileSelectionState.selectedProfileId === profileId) {
    promptResumeSelectionState = {
      promptResumes,
      selectedPromptResumeId
    };
  }

  if (enabled && selectedPromptResumeId === promptResumeId) {
    profileSelectionState.selectedProfileId = profileId;
  }

  try {
    await persistProfileSelection(
      enabled
        ? `Auto-select enabled for "${promptResume.label}".`
        : `Auto-select disabled for "${promptResume.label}". Profile deselected; its prompt resume remains assigned.`
    );
    renderPromptResumeList();
    renderProfileList();
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not update auto-select.");
    await loadProfileSelection();
  }
}

async function removePromptResume(promptResumeId) {
  if (areActionButtonsDisabled) return;
  if (promptResumeSelectionState.promptResumes.length <= 1) {
    addLog("error", "Each profile must keep at least one prompt resume.");
    return;
  }

  const removed = promptResumeSelectionState.promptResumes.find(
    (entry) => entry.id === promptResumeId
  );
  addLog("info", `Removing prompt resume: ${removed?.label || promptResumeId}`);

  promptResumeSelectionState.promptResumes =
    promptResumeSelectionState.promptResumes.filter(
      (entry) => entry.id !== promptResumeId
    );

  if (promptResumeSelectionState.selectedPromptResumeId === promptResumeId) {
    promptResumeSelectionState.selectedPromptResumeId =
      promptResumeSelectionState.promptResumes[0]?.id || "";
    if (removed?.autoSelect) {
      promptResumeSelectionState.promptResumes =
        promptResumeSelectionState.promptResumes.map((entry) => ({
          ...entry,
          autoSelect: entry.id === promptResumeSelectionState.selectedPromptResumeId
        }));
    }
  }

  try {
    await persistPromptResumeSelection("Prompt resume removed.");
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not remove prompt resume.";
    addLog("error", message);
    await loadPromptResumeSelection();
  }
}

async function submitPromptResumeForm() {
  clearPromptResumeFormModalStatus();
  const profileId = profileResumeSettingsProfileId || getSelectedProfile()?.id;

  const label = promptResumeLabelInput?.value.trim() || "";
  const content = promptResumeContentInput?.value.trim() || "";

  if (!label) {
    const message = "Enter a label for the prompt resume.";
    showPromptResumeFormModalStatus("error", message);
    addLog("error", message);
    promptResumeLabelInput?.focus();
    return;
  }

  if (!content) {
    const message = "Enter the prompt resume text.";
    showPromptResumeFormModalStatus("error", message);
    addLog("error", message);
    promptResumeContentInput?.focus();
    return;
  }

  const isEdit = promptResumeFormMode === "edit" && editingPromptResumeId;
  addLog(
    "info",
    isEdit ? `Saving prompt resume changes: ${label}` : `Adding prompt resume: ${label}`
  );

  if (promptResumeFormModalSubmitButton) {
    promptResumeFormModalSubmitButton.disabled = true;
  }

  const updatedAt = new Date().toISOString();
  const promptResumes = isEdit
    ? promptResumeSelectionState.promptResumes.map((entry) =>
        entry.id === editingPromptResumeId
          ? {
              id: entry.id,
              label,
              content,
              updatedAt,
              autoSelect: Boolean(entry.autoSelect)
            }
          : entry
      )
    : [
        ...promptResumeSelectionState.promptResumes,
        { label, content, updatedAt, autoSelect: false }
      ];

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_PROMPT_RESUME_SELECTION",
      profileId,
      promptResumes,
      selectedPromptResumeId: promptResumeSelectionState.selectedPromptResumeId
    });

    if (!response?.ok) {
      throw new Error(
        response?.error ||
          (isEdit ? "Could not update prompt resume." : "Could not add prompt resume.")
      );
    }

    applyPromptResumeStateToSelectedProfile(
      response.promptResumes || [],
      response.selectedPromptResumeId || "",
      profileId
    );
    syncPromptResumeStateFromSelectedProfile();

    if (profileResumeSettingsProfileId === profileId) {
      setPromptResumeFormModalOpen(false);
    }
    renderPromptResumeList();
    renderProfileList();
    const successMessage = isEdit ? `"${label}" updated.` : `"${label}" added.`;
    addLog("success", successMessage);
  } catch (error) {
    console.error(error);
    const message =
      error.message ||
      (isEdit ? "Could not update prompt resume." : "Could not add prompt resume.");
    showPromptResumeFormModalStatus("error", message);
    addLog("error", message);
  } finally {
    if (promptResumeFormModalSubmitButton) {
      promptResumeFormModalSubmitButton.disabled = false;
    }
  }
}

let promptState = {
  prompts: [],
  selectedPromptId: "",
  content: "",
  updatedAt: ""
};
let promptFormMode = "edit";

function applyPromptSelectionState(state) {
  const prompts = Array.isArray(state?.prompts)
    ? state.prompts
        .map((entry) => ({
          id: String(entry?.id || ""),
          content: typeof entry?.content === "string" ? entry.content : "",
          updatedAt: entry?.updatedAt || "",
          label: String(entry?.label || "").trim() || "GPT Prompt"
        }))
        .filter((entry) => entry.id && entry.content)
    : [];
  let selectedPromptId = String(state?.selectedPromptId || "").trim();
  if (!prompts.some((entry) => entry.id === selectedPromptId)) {
    selectedPromptId = prompts[0]?.id || "";
  }
  const selected =
    prompts.find((entry) => entry.id === selectedPromptId) || null;

  promptState = {
    prompts,
    selectedPromptId,
    content:
      selected?.content ||
      (typeof state?.content === "string" ? state.content : ""),
    updatedAt: selected?.updatedAt || state?.updatedAt || ""
  };
}

function setPromptFormModalOpen(isOpen, { mode = promptFormMode } = {}) {
  if (!promptFormModal) return;

  promptFormMode = mode === "fork" ? "fork" : "edit";
  promptFormModal.classList.toggle("is-hidden", !isOpen);
  promptFormModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    if (promptFormModalTitle) {
      promptFormModalTitle.textContent =
        promptFormMode === "fork" ? "Update GPT Prompt" : "Edit Prompt";
    }
    const submitLabel = promptFormModalSubmitButton?.querySelector("span");
    if (submitLabel) {
      submitLabel.textContent =
        promptFormMode === "fork" ? "Save Updated Prompt" : "Save Changes";
    }
    if (promptContentInput) {
      promptContentInput.value = promptState.content || "";
    }
    promptContentInput?.focus();
    return;
  }

  if (promptContentInput) promptContentInput.value = "";
  if (promptFormModalTitle) {
    promptFormModalTitle.textContent = "Edit Prompt";
  }
  const submitLabel = promptFormModalSubmitButton?.querySelector("span");
  if (submitLabel) {
    submitLabel.textContent = "Save Changes";
  }
  promptFormMode = "edit";
  promptList
    ?.querySelector(".prompt-selection-edit, .prompt-selection-list-empty-action")
    ?.focus();
}

function openEditPromptModal() {
  setPromptFormModalOpen(true, { mode: "edit" });
}

function openWorkspacePromptInfoModal() {
  if (!promptState.content?.trim()) {
    showStatus("error", "No AI prompt is selected yet. Add one in App settings.");
    return;
  }
  setPromptFormModalOpen(true, { mode: "fork" });
}

function renderPromptCard() {
  if (!promptList) return;

  promptList.innerHTML = "";

  if (promptState.prompts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "prompt-selection-list-empty prompt-selection-list-empty-action";
    empty.textContent = "No AI prompt yet.";
    empty.addEventListener("click", openEditPromptModal);
    promptList.appendChild(empty);
    return;
  }

  promptState.prompts.forEach((prompt, index) => {
    const isSelected = prompt.id === promptState.selectedPromptId;
    const item = document.createElement("li");
    item.className = "prompt-selection-item";
    item.classList.toggle("is-selected", isSelected);

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "prompt";
    radio.value = prompt.id;
    radio.checked = isSelected;
    radio.setAttribute(
      "aria-label",
      `Use ${prompt.label || `GPT Prompt ${index + 1}`}`
    );
    radio.addEventListener("change", () => {
      if (radio.checked) {
        selectPrompt(prompt.id);
      }
    });

    const copy = document.createElement("div");
    copy.className = "prompt-selection-copy";

    const label = document.createElement("span");
    label.className = "prompt-selection-label";
    label.textContent = prompt.label || `GPT Prompt ${index + 1}`;
    copy.append(label);

    const updatedAtText = formatPromptResumeUpdatedAt(prompt.updatedAt);
    if (updatedAtText) {
      const updated = document.createElement("span");
      updated.className = "prompt-selection-updated";
      updated.textContent = updatedAtText;
      copy.append(updated);
    }

    const actions = document.createElement("div");
    actions.className = "prompt-selection-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "prompt-selection-edit";
    editButton.setAttribute("aria-label", `View or edit ${label.textContent}`);
    editButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    `;
    editButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!isSelected) {
        await selectPrompt(prompt.id);
      }
      openEditPromptModal();
    });
    actions.append(editButton);

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "prompt-selection-remove";
    clearButton.textContent = "×";
    clearButton.setAttribute("aria-label", `Remove ${label.textContent}`);
    clearButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removePrompt(prompt.id);
    });
    actions.append(clearButton);

    item.addEventListener("click", (event) => {
      if (
        event.target === radio ||
        event.target.closest(".prompt-selection-edit") ||
        event.target.closest(".prompt-selection-remove")
      ) {
        return;
      }
      selectPrompt(prompt.id);
    });

    item.append(radio, copy, actions);
    promptList.appendChild(item);
  });
}

async function selectPrompt(promptId) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SELECT_PROMPT_SELECTION",
      promptId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not select prompt.");
    }

    applyPromptSelectionState(response);
    renderPromptCard();
  } catch (error) {
    console.error(error);
  }
}

async function removePrompt(promptId) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "REMOVE_PROMPT_SELECTION",
      promptId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not remove prompt.");
    }

    applyPromptSelectionState(response);
    renderPromptCard();
  } catch (error) {
    console.error(error);
  }
}

async function clearPrompt() {
  if (!promptState.selectedPromptId) {
    return;
  }
  await removePrompt(promptState.selectedPromptId);
}

async function loadPromptSelection() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_PROMPT_SELECTION"
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not load prompt.");
    }

    applyPromptSelectionState(response);
    renderPromptCard();
    updateWorkspacePromptInfoButtons();
  } catch (error) {
    console.error(error);
  }
}

async function submitPromptForm() {
  const content = promptContentInput?.value.trim() || "";
  const isFork = promptFormMode === "fork";

  if (!content) {
    promptContentInput?.focus();
    return;
  }

  if (promptFormModalSubmitButton) {
    promptFormModalSubmitButton.disabled = true;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: isFork ? "FORK_PROMPT_SELECTION" : "SAVE_PROMPT_SELECTION",
      content
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not save prompt.");
    }

    applyPromptSelectionState(response);
    setPromptFormModalOpen(false);
    renderPromptCard();
    updateWorkspacePromptInfoButtons();
    addLog(
      "success",
      isFork
        ? "Updated AI prompt saved and selected. Previous prompt kept in settings."
        : "AI prompt saved."
    );
  } catch (error) {
    console.error(error);
    showStatus("error", error.message || "Could not save prompt.");
  } finally {
    if (promptFormModalSubmitButton) {
      promptFormModalSubmitButton.disabled = false;
    }
  }
}

function updateWorkspacePromptInfoButtons() {
  const showButton =
    !isSplitWindowsDialogOpen && Boolean(promptState.content?.trim());
  const disabled = !showButton || areActionButtonsDisabled;

  [applicationWorkspacePromptInfoButton, homeWorkspacePromptInfoButton].forEach(
    (button) => {
      if (!button) {
        return;
      }
      button.classList.toggle("is-hidden", !showButton);
      button.disabled = disabled;
    }
  );

  updateWorkspaceImportButtons();
}

function updateWorkspaceImportButtons() {
  const showButton = !isSplitWindowsDialogOpen;
  const disabled = !showButton || areActionButtonsDisabled;

  [homeWorkspaceImportButton, applicationWorkspaceImportButton].forEach(
    (button) => {
      if (!button) {
        return;
      }
      button.classList.toggle("is-hidden", !showButton);
      button.disabled = disabled;
    }
  );
}

let jobDescriptionState = {
  content: "",
  updatedAt: ""
};

function setJobDescriptionFormModalOpen(isOpen) {
  if (!jobDescriptionFormModal) return;

  const shouldOpen = Boolean(isOpen) && !isCurrentTabJobright && !isNoModelSaveMode();
  jobDescriptionFormModal.classList.toggle("is-hidden", !shouldOpen);
  jobDescriptionFormModal.setAttribute("aria-hidden", String(!shouldOpen));

  if (shouldOpen) {
    if (jobDescriptionContentInput) {
      jobDescriptionContentInput.value = jobDescriptionState.content || "";
    }
    jobDescriptionContentInput?.focus();
    return;
  }

  if (jobDescriptionContentInput) jobDescriptionContentInput.value = "";
  jobDescriptionList?.querySelector(".job-description-selection-edit")?.focus();
}

function openEditJobDescriptionModal() {
  setJobDescriptionFormModalOpen(true);
}

function renderJobDescriptionCard() {
  if (!jobDescriptionList) return;

  jobDescriptionList.innerHTML = "";

  const item = document.createElement("li");
  item.className = "job-description-selection-item is-selected is-single";

  const copy = document.createElement("div");
  copy.className = "job-description-selection-copy";

  const preview = document.createElement("span");
  preview.className = "job-description-selection-preview";
  preview.textContent = jobDescriptionState.content
    ? normalizeJobDescriptionPreview(jobDescriptionState.content)
    : "No job description yet.";

  copy.append(preview);

  const actions = document.createElement("div");
  actions.className = "job-description-selection-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "job-description-selection-edit";
  editButton.setAttribute("aria-label", "View or edit job description");
  editButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  `;
  editButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openEditJobDescriptionModal();
  });

  actions.append(editButton);

  if (jobDescriptionState.content) {
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "job-description-selection-remove";
    clearButton.textContent = "×";
    clearButton.setAttribute("aria-label", "Clear job description");
    clearButton.addEventListener("click", (event) => {
      event.stopPropagation();
      clearJobDescription();
    });
    actions.append(clearButton);
  }

  item.addEventListener("click", () => {
    openEditJobDescriptionModal();
  });

  item.append(copy, actions);
  jobDescriptionList.appendChild(item);
}

async function clearJobDescription() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_JOB_DESCRIPTION_SELECTION",
      content: ""
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not clear job description.");
    }

    jobDescriptionState = {
      content: "",
      updatedAt: ""
    };
    renderJobDescriptionCard();
  } catch (error) {
    console.error(error);
  }
}

async function loadJobDescriptionSelection() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_JOB_DESCRIPTION_SELECTION"
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not load job description.");
    }

    jobDescriptionState = {
      content: typeof response.content === "string" ? response.content : "",
      updatedAt: response.updatedAt || ""
    };
    renderJobDescriptionCard();
  } catch (error) {
    console.error(error);
  }
}

async function submitJobDescriptionForm() {
  const content = jobDescriptionContentInput?.value.trim() || "";

  if (!content) {
    jobDescriptionContentInput?.focus();
    return;
  }

  if (jobDescriptionFormModalSubmitButton) {
    jobDescriptionFormModalSubmitButton.disabled = true;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_JOB_DESCRIPTION_SELECTION",
      content
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not save job description.");
    }

    jobDescriptionState = {
      content: typeof response.content === "string" ? response.content : content,
      updatedAt: response.updatedAt || ""
    };

    setJobDescriptionFormModalOpen(false);
    renderJobDescriptionCard();
  } catch (error) {
    console.error(error);
  } finally {
    if (jobDescriptionFormModalSubmitButton) {
      jobDescriptionFormModalSubmitButton.disabled = false;
    }
  }
}

function setConfigModalOpen(isOpen, { returnFocus = true } = {}) {
  if (!configModal) return;

  configModal.classList.toggle("is-hidden", !isOpen);
  configModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    setAppDataTransferStatus("", "");
    refreshActionHotkeys();
    spreadsheetIdInput?.focus();
    return;
  }

  if (returnFocus) {
    saveOptionsButton?.focus();
  }
}

async function loadSheetConfig() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_SHEET_CONFIG"
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not load configuration.");
    }

    if (spreadsheetIdInput) {
      spreadsheetIdInput.value = response.spreadsheetId || "";
    }
    if (sheetNameInput) {
      sheetNameInput.value = response.sheetName || "";
    }
    if (aiProviderInput) {
      aiProviderInput.value = normalizeAiProviderId(response.aiProviderId);
    }
    configuredAiProviderId = normalizeAiProviderId(response.aiProviderId);
    syncSaveModeUi();
  } catch (error) {
    console.error(error);
    addLog("error", error.message || "Could not load configuration.");
  }
}

async function saveSheetConfig() {

  addLog("info", "Save configuration clicked.");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_SHEET_CONFIG",
      spreadsheetId: spreadsheetIdInput?.value.trim() || "",
      sheetName: sheetNameInput?.value.trim() || "",
      aiProviderId: normalizeAiProviderId(aiProviderInput?.value)
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not save configuration.");
    }

    if (spreadsheetIdInput) {
      spreadsheetIdInput.value = response.spreadsheetId || "";
    }
    if (sheetNameInput) {
      sheetNameInput.value = response.sheetName || "";
    }

    if (aiProviderInput) {
      aiProviderInput.value = normalizeAiProviderId(response.aiProviderId);
    }
    configuredAiProviderId = normalizeAiProviderId(response.aiProviderId);
    syncSaveModeUi();
    addLog(
      "success",
      `Saved. Sheet tab "${response.sheetName}". AI provider: ${getAiProviderLabel(response.aiProviderId)}.`
    );
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not save configuration.";
    addLog("error", message);
  }
}

function shouldIncludePromptResumeInfo() {
  return importIncludePromptResumeInfoCheckbox?.checked !== false;
}

function shouldExportIncludePromptResumeInfo() {
  return exportIncludePromptResumeInfoCheckbox?.checked !== false;
}

function setAppDataTransferStatus(type, message) {
  if (!appDataTransferStatus) return;

  const text = String(message || "").trim();
  appDataTransferStatus.textContent = text;
  appDataTransferStatus.classList.toggle("is-hidden", !text);
  appDataTransferStatus.classList.toggle("is-success", type === "success");
  appDataTransferStatus.classList.toggle("is-error", type === "error");
}

function setExportAppDataModalOpen(isOpen, { returnFocus = true } = {}) {
  if (!exportAppDataModal) return;

  exportAppDataModal.classList.toggle("is-hidden", !isOpen);
  exportAppDataModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    if (exportIncludePromptResumeInfoCheckbox) {
      exportIncludePromptResumeInfoCheckbox.checked = true;
    }
    exportAppDataModalConfirmButton?.focus();
    return;
  }

  if (returnFocus) {
    const focusTarget =
      (!splitWindowsModal?.classList.contains("is-hidden") &&
        !isSplitWindowsDialogOpen &&
        applicationWorkspaceExportButton) ||
      exportAppDataIconButton;
    focusTarget?.focus();
  }
}

function openExportAppDataModal() {
  if (
    exportAppDataIconButton?.disabled &&
    applicationWorkspaceExportButton?.disabled
  ) {
    return;
  }
  setExportAppDataModalOpen(true);
}

function setImportAppDataModalOpen(isOpen, { returnFocus = true } = {}) {
  if (!importAppDataModal) return;

  importAppDataModal.classList.toggle("is-hidden", !isOpen);
  importAppDataModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    if (importIncludePromptResumeInfoCheckbox) {
      importIncludePromptResumeInfoCheckbox.checked = true;
    }
    importAppDataModalConfirmButton?.focus();
    return;
  }

  if (returnFocus) {
    const focusTarget =
      (!homeWorkspaceSwitcher?.classList.contains("is-hidden") &&
        homeWorkspaceImportButton) ||
      applicationWorkspaceImportButton ||
      homeWorkspaceImportButton;
    focusTarget?.focus();
  }
}

function openImportAppDataModal() {
  if (
    homeWorkspaceImportButton?.disabled &&
    applicationWorkspaceImportButton?.disabled
  ) {
    return;
  }
  setImportAppDataModalOpen(true);
}

function confirmImportAppDataModal() {
  if (importAppDataModalConfirmButton?.disabled) {
    return;
  }
  importAppDataFileInput?.click();
}

function openExportDirectoryIdb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(APP_DATA_EXPORT_DIRECTORY_IDB.name, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(APP_DATA_EXPORT_DIRECTORY_IDB.store)) {
        db.createObjectStore(APP_DATA_EXPORT_DIRECTORY_IDB.store);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Could not open export storage."));
  });
}

async function loadExportDataDirectoryHandle() {
  const db = await openExportDirectoryIdb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(APP_DATA_EXPORT_DIRECTORY_IDB.store, "readonly");
      const store = tx.objectStore(APP_DATA_EXPORT_DIRECTORY_IDB.store);
      const request = store.get(APP_DATA_EXPORT_DIRECTORY_IDB.key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () =>
        reject(request.error || new Error("Could not read export folder."));
    });
  } finally {
    db.close();
  }
}

async function saveExportDataDirectoryHandle(handle) {
  const db = await openExportDirectoryIdb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(APP_DATA_EXPORT_DIRECTORY_IDB.store, "readwrite");
      const store = tx.objectStore(APP_DATA_EXPORT_DIRECTORY_IDB.store);
      const request = store.put(handle, APP_DATA_EXPORT_DIRECTORY_IDB.key);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error || new Error("Could not save export folder."));
    });
  } finally {
    db.close();
  }
}

async function ensureExportDataDirectoryHandle() {
  if (typeof window.showDirectoryPicker !== "function") {
    return null;
  }

  let handle = null;
  try {
    handle = await loadExportDataDirectoryHandle();
  } catch (error) {
    console.error(error);
  }

  if (handle) {
    const permission =
      (await handle.queryPermission?.({ mode: "readwrite" })) || "prompt";
    if (permission === "granted") {
      return handle;
    }
    const requested =
      (await handle.requestPermission?.({ mode: "readwrite" })) || "denied";
    if (requested === "granted") {
      return handle;
    }
  }

  handle = await window.showDirectoryPicker({
    id: "application-helper-data",
    mode: "readwrite",
    startIn: "documents"
  });
  await saveExportDataDirectoryHandle(handle);
  return handle;
}

async function writeAppDataBackupToDirectory(handle, filename, data) {
  const fileHandle = await handle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
  return `data/${filename}`;
}

async function downloadAppDataBackupFallback(data, filename) {
  const relativePath = `data/${filename}`;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  try {
    const downloadId = await chrome.downloads.download({
      url,
      filename: relativePath,
      saveAs: false,
      conflictAction: "uniquify"
    });

    if (typeof downloadId !== "number") {
      throw new Error("Could not start the export download.");
    }

    return relativePath;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

function buildAppDataBackupFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `application-opener-backup-${stamp}.json`;
}

async function downloadAppDataBackup(data) {
  const filename = buildAppDataBackupFilename();

  try {
    const handle = await ensureExportDataDirectoryHandle();
    if (handle) {
      return await writeAppDataBackupToDirectory(handle, filename, data);
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Export canceled.");
    }
    console.error(error);
  }

  return downloadAppDataBackupFallback(data, filename);
}

async function exportAppData() {
  const includePromptResumes = shouldExportIncludePromptResumeInfo();
  setAppDataTransferStatus("", "");
  addLog(
    "info",
    includePromptResumes
      ? "Exporting app data with prompt resume info..."
      : "Exporting app data without prompt resume info..."
  );

  if (exportAppDataModalConfirmButton) {
    exportAppDataModalConfirmButton.disabled = true;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: "EXPORT_APP_DATA",
      includePromptResumes
    });

    if (!response?.ok || !response.data) {
      throw new Error(response?.error || "Could not export app data.");
    }

    const filename = await downloadAppDataBackup(response.data);
    const message = `Exported ${filename}.`;
    setExportAppDataModalOpen(false);
    setAppDataTransferStatus("success", message);
    addLog("success", message);
    showStatus("success", message);
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not export app data.";
    setAppDataTransferStatus("error", message);
    addLog("error", message);
    showStatus("error", message);
  } finally {
    if (exportAppDataModalConfirmButton) {
      exportAppDataModalConfirmButton.disabled = false;
    }
  }
}

async function refreshUiAfterAppDataImport() {
  await Promise.all([
    loadSheetConfig(),
    loadPromptSelection(),
    loadJobDescriptionSelection(),
    loadProfileSelection()
  ]);
}

async function importAppDataFromFile(file) {
  if (!file) {
    return;
  }

  const includePromptResumes = shouldIncludePromptResumeInfo();
  setAppDataTransferStatus("", "");
  addLog(
    "info",
    includePromptResumes
      ? `Importing app data from ${file.name} with prompt resume info...`
      : `Importing app data from ${file.name} without prompt resume info...`
  );

  if (importAppDataModalConfirmButton) {
    importAppDataModalConfirmButton.disabled = true;
  }

  try {
    const text = await file.text();
    let payload;

    try {
      payload = JSON.parse(text);
    } catch (_error) {
      throw new Error("Backup file must be valid JSON.");
    }

    const response = await chrome.runtime.sendMessage({
      type: "IMPORT_APP_DATA",
      data: payload,
      includePromptResumes
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not import app data.");
    }

    await refreshUiAfterAppDataImport();
    setImportAppDataModalOpen(false);

    const message = response.includesPromptResumes
      ? "Imported app data, including prompt resume info."
      : "Imported app data. Existing prompt resume info was kept.";
    setAppDataTransferStatus("success", message);
    addLog("success", message);
    showStatus("success", message);
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not import app data.";
    setAppDataTransferStatus("error", message);
    addLog("error", message);
    showStatus("error", message);
  } finally {
    if (importAppDataFileInput) {
      importAppDataFileInput.value = "";
    }
    if (importAppDataModalConfirmButton) {
      importAppDataModalConfirmButton.disabled = false;
    }
  }
}

function isActiveTab(tabId) {
  return !Number.isInteger(tabId) || tabId === activeTabId;
}

function showStatusForTab(tabId, type, message, titleText) {
  const status = { type, message, titleText };

  if (isActiveTab(tabId)) {
    headerStatusState = status;
    schedulePersistTabSession();
    return;
  }

  const state = getTabState(tabId);
  if (state) {
    state.headerStatus = status;
  }
  schedulePersistTabSession();
}

function showStatus(type, message, titleText) {
  showStatusForTab(activeTabId, type, message, titleText);
}

function showSaveResultToast(type, message) {
  if (!saveResultToast) {
    return;
  }

  if (saveResultToastTimer !== null) {
    clearTimeout(saveResultToastTimer);
  }

  saveResultToast.classList.remove("is-success", "is-error");
  saveResultToast.classList.add(
    type === "success" ? "is-success" : "is-error",
    "is-visible"
  );
  if (type === "error") {
    saveResultToast.setAttribute("role", "alert");
    saveResultToast.removeAttribute("aria-live");
  } else {
    saveResultToast.setAttribute("role", "status");
    saveResultToast.setAttribute("aria-live", "polite");
  }
  saveResultToast.textContent = message;

  saveResultToastTimer = window.setTimeout(() => {
    saveResultToast.classList.remove("is-visible");
    saveResultToastTimer = null;
  }, 4500);
}

function showSaveCompletionToast(ok, errorMessage = "") {
  showSaveResultToast(
    ok ? "success" : "error",
    ok
      ? "Saved successfully."
      : "Save failed: " + (errorMessage || "Something went wrong.")
  );
}

function clearStatus() {}

function updateLogsState() {
  if (!logsList || !emptyLogs) return;

  const hasItems = logsList.children.length > 0;

  logsList.classList.toggle("has-items", hasItems);
  emptyLogs.classList.toggle("is-hidden", hasItems);
}

function createLogListItem({ level, message, timestamp }) {
  const item = document.createElement("li");
  item.className = `log-item log-${level}`;

  item.innerHTML = `
    <span class="log-time"></span>
    <span class="log-level"></span>
    <span class="log-message"></span>
  `;

  item.querySelector(".log-time").textContent = timestamp;
  item.querySelector(".log-level").textContent = String(level).toUpperCase();
  item.querySelector(".log-message").textContent = message;

  return item;
}

function renderLogEntries() {
  if (!logsList) return;

  logsList.innerHTML = "";
  [...logEntries].reverse().forEach((entry) => {
    logsList.appendChild(createLogListItem(entry));
  });

  updateLogsState();
  logsList.scrollTop = 0;
}

function addLogForTab(
  tabId,
  level,
  message,
  timestamp = new Date().toLocaleTimeString()
) {
  const entry = { level, message, timestamp };

  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.logs.push(entry);
      if (state.logs.length > MAX_TAB_LOG_ENTRIES) {
        state.logs.splice(0, state.logs.length - MAX_TAB_LOG_ENTRIES);
      }
    }
    schedulePersistTabSession();
    return;
  }

  logEntries.push(entry);
  if (logEntries.length > MAX_TAB_LOG_ENTRIES) {
    logEntries.splice(0, logEntries.length - MAX_TAB_LOG_ENTRIES);
    renderLogEntries();
    schedulePersistTabSession();
    return;
  }

  if (!logsList) {
    console.log(`[${level}] ${message}`);
    schedulePersistTabSession();
    return;
  }

  logsList.prepend(createLogListItem(entry));
  updateLogsState();
  logsList.scrollTop = 0;
  schedulePersistTabSession();
}

function addLog(level, message, timestamp = new Date().toLocaleTimeString()) {
  addLogForTab(activeTabId, level, message, timestamp);
}

function clearLogsForTab(tabId) {
  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.logs = [];
    }
    return;
  }

  logEntries = [];
  renderLogEntries();
}

function clearLogs() {
  clearLogsForTab(activeTabId);
}

function beginButtonProcessForTab(tabId, startingMessage) {
  clearLogsForTab(tabId);
  setSaveButtonsDisabledForTab(tabId, true);
  if (startingMessage) {
    addLogForTab(tabId, "info", startingMessage);
  }
}

function finishButtonProcessForTab(tabId) {
  setSaveButtonsDisabledForTab(tabId, false);
}

function updateDeletedRowsState() {
  if (!deletedRowsCard || !deletedRowsList || !emptyDeletedRows) return;

  const hasItems = deletedRowsList.children.length > 0;
  deletedRowsCard.classList.toggle("is-hidden", !hasItems);
  emptyDeletedRows.classList.toggle("is-hidden", hasItems);
}

function renderDeletedRowEntries() {
  if (!deletedRowsList) return;

  deletedRowsList.innerHTML = "";

  deletedRowEntries.forEach((row) => {
    const item = document.createElement("li");
    item.className = "deleted-row-item";

    const rowNumber = row.rowNumber ?? "?";
    const url = row.url || "(empty URL)";
    item.textContent = `Row ${rowNumber}: ${url}`;
    deletedRowsList.appendChild(item);
  });

  updateDeletedRowsState();
}

function clearDeletedRowsForTab(tabId) {
  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.deletedRows = [];
    }
    return;
  }

  deletedRowEntries = [];
  renderDeletedRowEntries();
}

function clearDeletedRows() {
  clearDeletedRowsForTab(activeTabId);
}

async function refreshApplicationInputsAfterSave() {
  await Promise.all([loadProfileSelection(), loadJobDescriptionSelection()]);
}

function validateSaveCurrentTabInputs() {
  const missing = [];
  const requiresAiMessage = !isNoModelSaveMode();

  if (requiresAiMessage && !promptState.content?.trim()) {
    missing.push("AI prompt");
  }

  if (requiresAiMessage && !jobDescriptionState.content?.trim()) {
    missing.push("job description");
  }

  const selectedProfiles = getSelectedProfiles();
  if (selectedProfiles.length === 0) {
    missing.push("profile selection");
  }

  const profilesMissingResume = selectedProfiles.filter(
    (profile) =>
      !profile.selectedPromptResumeId ||
      !profile.promptResumes.some(
        (entry) => entry.id === profile.selectedPromptResumeId
      )
  );

  if (requiresAiMessage && profilesMissingResume.length > 0) {
    const profileNames = profilesMissingResume.map(
      (profile) => `"${profile.name}"`
    );
    missing.push(
      profileNames.length === 1
        ? `prompt resume for ${profileNames[0]}`
        : `one prompt resume for each of ${profileNames.join(", ")}`
    );
  }

  if (missing.length === 0) {
    return { ok: true };
  }

  const message =
    missing.length === 1
      ? `${missing[0]} is required before saving.`
      : `These are required before saving: ${missing.join(", ")}.`;

  return { ok: false, error: message, missing };
}

async function validateActiveBrowserTabForAppAction(tabId = null) {
  let tab = null;

  try {
    if (Number.isInteger(tabId)) {
      tab = await chrome.tabs.get(tabId);
    } else {
      [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      });
    }
  } catch (_error) {
    return {
      ok: false,
      error: "The tab that started Save App is no longer open."
    };
  }

  if (!tab) {
    return { ok: false, error: "No active tab found." };
  }

  if (!tab.url) {
    return { ok: false, error: "Current tab does not have a URL." };
  }

  if (tab.pinned && !isPinnedTabSupportedUrl(tab.url)) {
    return {
      ok: false,
      error:
        "Pinned tabs are supported only for Google Sheets and Jobright. Unpin this tab and try again."
    };
  }

  return { ok: true, tabId: tab.id };
}

async function runCurrentAppAction() {
  if (isSaveActionRunning) {
    const message = "Save App is already starting or running.";
    showStatus("info", message, "Status:");
    addLog("info", message);
    return;
  }

  isSaveActionRunning = true;
  try {
    await runCurrentAppActionOnce();
  } finally {
    isSaveActionRunning = false;
  }
}

async function runCurrentAppActionOnce() {
  // Capture the source tab before any async validation so a tab switch cannot
  // redirect this save to a different page.
  const requestedOwnerTabId = activeTabId;
  const selectedProfileIds = [...profileSelectionState.selectedProfileIds];
  clearStatus();
  clearDeletedRows();

  const validation = validateSaveCurrentTabInputs();
  if (!validation.ok) {
    showStatus("error", validation.error);
    addLog("error", validation.error);
    return;
  }

  const tabValidation = await validateActiveBrowserTabForAppAction(
    requestedOwnerTabId
  );
  if (!tabValidation.ok) {
    showStatus("error", tabValidation.error);
    addLog("error", tabValidation.error);
    return;
  }

  const { ownerTabId, runId } = beginRunForTab(tabValidation.tabId);

  beginButtonProcessForTab(
    ownerTabId,
    "Save App clicked. Starting process..."
  );

  let preserveButtonLock = false;
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_CURRENT_TAB_URL_TO_SHEET",
      runId,
      ownerTabId,
      aiProviderId: getSelectedAiProviderId(),
      selectedProfileIds
    });

    if (!response?.ok) {
      const error = new Error(response?.error || "Could not save URL.");
      error.cancelled = response?.cancelled === true;
      error.code = response?.code || "";
      error.activeOwnerTabId = response?.activeOwnerTabId ?? null;
      preserveButtonLock =
        error.code === SAVE_PROCESS_BUSY_CODE && error.activeOwnerTabId === ownerTabId;
      throw error;
    }

    showStatusForTab(ownerTabId, "success", response.url);
    addLogForTab(
      ownerTabId,
      "success",
      "Process completed successfully."
    );
    showSaveCompletionToast(true);
  } catch (error) {
    if (error.cancelled) {
      showStatusForTab(ownerTabId, "info", "Save process cancelled.", "Status:");
      addLogForTab(ownerTabId, "info", "Save process ended by Cancel Process.");
    } else if (error.code === SAVE_PROCESS_BUSY_CODE) {
      if (!preserveButtonLock) {
        showStatusForTab(ownerTabId, "info", error.message, "Status:");
      }
      addLogForTab(ownerTabId, "info", error.message);
    } else {
      console.error(error);
      showStatusForTab(
        ownerTabId,
        "error",
        error.message || "Something went wrong."
      );
      addLogForTab(
        ownerTabId,
        "error",
        error.message || "Something went wrong."
      );
      showSaveCompletionToast(false, error.message);
    }
  } finally {
    if (!preserveButtonLock) {
      finishButtonProcessForTab(ownerTabId);
    }
  }
}

async function saveCurrentTabUrl() {
  await runCurrentAppAction();
}

function requestSaveTitleHostAccessFromClick() {
  let originPattern = "";
  try {
    const parsedUrl = new URL(activeTabUrl);
    if (parsedUrl.protocol === "https:") {
      originPattern = parsedUrl.origin + "/*";
    }
  } catch (_error) {
    return Promise.resolve(false);
  }

  if (!originPattern) {
    return Promise.resolve(false);
  }

  return chrome.permissions
    .request({ origins: [originPattern] })
    .catch((error) => {
      console.info("Tab-title access was not granted for this site:", error);
      return false;
    });
}

async function saveCurrentTabUrlFromClick() {
  const titleAccessRequest = requestSaveTitleHostAccessFromClick();
  await titleAccessRequest;
  await saveCurrentTabUrl();
}

function getProtectedCloseStateForTab(tabId) {
  // Only the panel tracking the requested tab may answer. Other windows must
  // not win the runtime message race with an unrelated empty selection.
  if (!Number.isInteger(tabId) || tabId !== activeTabId) return null;
  return {
    tabId,
    open: document.visibilityState === "visible",
    ready: isProtectedCloseReady && isProfileSelectionLoaded,
    selectedProfileIds: [...profileSelectionState.selectedProfileIds],
    saveActionPending: isSaveActionRunning || areActionButtonsDisabled ||
      isSavePostProcessRequestPending || isSavePostProcessActive()
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PROTECTED_CLOSE_STATE") {
    const state = getProtectedCloseStateForTab(message.tabId);
    if (state) sendResponse(state);
    return;
  }
  if (message.type === "HOTKEY_CLOSE_BLOCKED") {
    if (message.tabId === activeTabId) {
      showStatusForTab(activeTabId, "info", message.message, "Status:");
      addLogForTab(activeTabId, "info", message.message);
    }
    return;
  }
  if (message.type === "SIDE_PANEL_PING") {
    sendResponse({
      open: true,
      saveActionPending: isSaveActionRunning || areActionButtonsDisabled,
      activeTabId,
      selectedProfileIds: [...profileSelectionState.selectedProfileIds]
    });
    return;
  }

  if (message.type === "CLOSE_SIDE_PANEL") {
    // Flush before the document goes away so pinned-tab auto-close does not
    // drop the latest process/workspace details for still-open tabs.
    persistTabSession()
      .catch((error) => {
        console.error("Could not persist tab session before closing:", error);
      })
      .finally(() => {
        window.close();
      });
    sendResponse({ closed: true });
    return true;
  }

  if (message.type === "HOTKEY_ACTION") {
    if (message.action === "make-resume") {
      openSplitWindowsModal();
    } else if (message.action === "open-jobright") {
      openJobrightJobs();
    } else if (message.action === "check-posting") {
      checkCurrentPosting();
    } else if (message.action === "play-posting" && message.ownerTabId === activeTabId) {
      playRightmostPosting();
    } else if (message.action === "download-resume") {
      downloadSaveWorkspaceResume();
    }
    return;
  }
  if (message.type === "HOTKEY_SAVE_REJECTED") {
    const ownerTabId = Number.isInteger(message.ownerTabId)
      ? message.ownerTabId
      : activeTabId;
    const rejectionMessage = message.error || "Save App could not be started.";
    showStatusForTab(ownerTabId, "info", rejectionMessage, "Status:");
    addLogForTab(ownerTabId, "info", rejectionMessage);
    return;
  }

  if (message.type === "HOTKEY_SAVE_STARTED") {
    const ownerTabId = Number.isInteger(message.ownerTabId)
      ? message.ownerTabId
      : activeTabId;
    registerRunTab(message.runId, ownerTabId);
    setRunIdForTab(ownerTabId, message.runId);
    clearDeletedRowsForTab(ownerTabId);
    beginButtonProcessForTab(
      ownerTabId,
      "Hotkey detected. Starting save process..."
    );
    return;
  }

  if (message.type === "APPLICATION_INPUTS_RESET") {
    refreshApplicationInputsAfterSave().catch((error) => {
      console.error("Could not refresh application inputs:", error);
    });
    const inputsResetTabIds = resolveRunTabIds(message);
    const resetMessage = message.message || "Application inputs cleared.";
    if (inputsResetTabIds.length === 0) {
      addLog("info", resetMessage);
    } else {
      inputsResetTabIds.forEach((tabId) => {
        addLogForTab(tabId, "info", resetMessage);
      });
    }
    return;
  }

  if (message.type === "SHOW_SAVE_WORKSPACE") {
    const targetTabIds = resolveRunTabIds(message);
    if (targetTabIds.length === 0) {
      return;
    }

    registerRunTab(message.runId, message.chatGptTabId);
    showSaveWorkspacePreview({
      runId: message.runId,
      batchIndex: message.batchIndex,
      batchCount: message.batchCount,
      jobTitle: message.jobTitle,
      jobUrl: message.jobUrl,
      profileName: message.profileName,
      resumeUrl: message.resumeUrl,
      chatGptTabId: message.chatGptTabId,
      aiProviderId: message.aiProviderId,
      aiProviderLabel: message.aiProviderLabel
    });
    adoptSavePostProcessForRunTab(message.runId, message.chatGptTabId);
    // Always adopt this profile tab in the panel. Waiting for tab events fails
    // for profile 2+ because SHOW is sent before the tab is activated.
    activateSaveWorkspaceTab(message.chatGptTabId);
    addLogForTab(
      message.chatGptTabId,
      "success",
      "Job page and selected-profile resume opened in the sidebar workspace."
    );
    return;
  }

  if (message.type === "SAVE_WORKSPACE_AI_URL_AVAILABLE") {
    if (resolveRunTabIds(message).length === 0) {
      return;
    }

    updateSaveWorkspaceAiUrl({
      chatGptUrl: message.chatGptUrl,
      chatGptTabId: message.chatGptTabId,
      aiProviderId: message.aiProviderId,
      aiProviderLabel: message.aiProviderLabel,
      hasExactAiUrl: message.hasExactAiUrl
    });
    adoptSavePostProcessForRunTab(message.runId, message.chatGptTabId);
    addLogForTab(
      message.chatGptTabId,
      "success",
      isContextDocAiProviderId(message.aiProviderId)
        ? "Context Google Doc URL is available for Pickup."
        : `Permanent ${getAiProviderLabel(message.aiProviderId)} conversation URL is available for Pickup.`
    );
    return;
  }

  if (message.type === "SAVE_WORKSPACE_READY") {
    if (resolveRunTabIds(message).length === 0) {
      return;
    }

    markSaveWorkspaceReady({
      chatGptUrl: message.chatGptUrl,
      chatGptTabId: message.chatGptTabId,
      aiProviderId: message.aiProviderId,
      aiProviderLabel: message.aiProviderLabel,
      hasExactAiUrl: message.hasExactAiUrl
    });
    adoptSavePostProcessForRunTab(message.runId, message.chatGptTabId);
    activateSaveWorkspaceTab(message.chatGptTabId);
    addLogForTab(
      message.chatGptTabId,
      "success",
      "Application workspace actions are ready."
    );
    return;
  }

  if (message.type === "HOTKEY_SAVE_FINISHED") {
    const finishedTabIds = resolveRunTabIds(message);
    if (finishedTabIds.length === 0) {
      return;
    }

    finishedTabIds.forEach((tabId) => {
      if (message.ok) {
        showStatusForTab(tabId, "success", message.url || "", "Saved:");
        addLogForTab(tabId, "success", "Process completed successfully.");
      } else {
        showStatusForTab(
          tabId,
          "error",
          message.error || "Something went wrong."
        );
        addLogForTab(
          tabId,
          "error",
          message.error || "Something went wrong."
        );
      }

      finishButtonProcessForTab(tabId);
    });
    showSaveCompletionToast(message.ok, message.error);
    return;
  }

  if (message.type !== "SAVE_PROCESS_LOG") {
    return;
  }

  resolveRunTabIds(message).forEach((tabId) => {
    addLogForTab(tabId, message.level, message.message, message.timestamp);
  });
});

async function runResumeDownload(documentUrl = "", profileName = "") {

  const { ownerTabId, runId } = beginRunForActiveTab();

  clearStatus();
  clearDeletedRowsForTab(ownerTabId);
  beginButtonProcessForTab(
    ownerTabId,
    documentUrl
      ? "Download Resume clicked. Checking the right-side Google Docs URL..."
      : "Download Resume clicked. Checking Google Docs tab..."
  );

  try {
    const response = await chrome.runtime.sendMessage({
      type: "DOWNLOAD_RESUME_PDF",
      runId,
      ownerTabId,
      documentUrl,
      profileName
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not download the resume PDF.");
    }

    showStatusForTab(
      ownerTabId,
      "success",
      response.filename || "document.pdf",
      "Downloaded:"
    );
    addLogForTab(
      ownerTabId,
      "success",
      `Resume PDF download started: ${response.filename || "document.pdf"}`
    );
  } catch (error) {
    console.error(error);
    showStatusForTab(
      ownerTabId,
      "error",
      error.message || "Something went wrong."
    );
    addLogForTab(ownerTabId, "error", error.message || "Something went wrong.");
  } finally {
    finishButtonProcessForTab(ownerTabId);
  }
}

async function downloadSplitWindowResume() {
  if (!currentSplitWindowDownloadUrl || splitWindowsPreviewDownloadButton?.disabled) {
    return;
  }

  await runResumeDownload(
    currentSplitWindowDownloadUrl,
    currentSaveWorkspace?.profileName || ""
  );
}

function showBuildResumeContextStatus(type, message) {
  if (!buildResumeContextStatus) return;

  buildResumeContextStatus.classList.remove(
    "is-hidden",
    "is-error",
    "is-success"
  );
  buildResumeContextStatus.textContent = message;
  buildResumeContextStatus.classList.add(
    type === "error" ? "is-error" : "is-success"
  );
}

function clearBuildResumeContextStatus() {
  buildResumeContextStatus?.classList.add("is-hidden");
  buildResumeContextStatus?.classList.remove("is-error", "is-success");
  if (buildResumeContextStatus) buildResumeContextStatus.textContent = "";
}

function setBuildResumeContextModalBusy(isBusy) {
  if (buildResumeContextInput) buildResumeContextInput.disabled = isBusy;
  if (buildResumeContextModalBackdrop) {
    buildResumeContextModalBackdrop.disabled = isBusy;
  }
  if (buildResumeContextModalCloseButton) {
    buildResumeContextModalCloseButton.disabled = isBusy;
  }
  if (buildResumeContextCancelButton) {
    buildResumeContextCancelButton.disabled = isBusy;
  }
  if (buildResumeContextSubmitButton) {
    buildResumeContextSubmitButton.disabled = isBusy;
  }
}

function setBuildResumeContextModalOpen(isOpen, { returnFocus = true } = {}) {
  if (!buildResumeContextModal) return;

  isBuildResumeContextModalOpen = isOpen;
  const workspaceIsVisible =
    currentSplitWindowSessionType === "save-workspace" &&
    !splitWindowsModal?.classList.contains("is-hidden");
  const shouldShow = isOpen && workspaceIsVisible;

  buildResumeContextModal.classList.toggle("is-hidden", !shouldShow);
  buildResumeContextModal.setAttribute("aria-hidden", String(!shouldShow));

  if (isOpen) {
    clearBuildResumeContextStatus();
    setBuildResumeContextModalBusy(false);
    buildResumeContextInput?.focus();
    return;
  }

  clearBuildResumeContextStatus();
  setBuildResumeContextModalBusy(false);
  buildResumeContextDraft = "";
  if (buildResumeContextInput) buildResumeContextInput.value = "";
  if (
    returnFocus &&
    currentSplitWindowSessionType === "save-workspace" &&
    !splitWindowsModal?.classList.contains("is-hidden")
  ) {
    saveWorkspaceBuildButton?.focus();
  }
}

function setBuildResumeContextModalOpenForTab(tabId, isOpen, options = {}) {
  if (!isActiveTab(tabId)) {
    const state = getTabState(tabId);
    if (state) {
      state.isBuildResumeContextModalOpen = Boolean(isOpen);
      if (!isOpen) {
        state.buildResumeContextDraft = "";
      }
    }
    return;
  }

  setBuildResumeContextModalOpen(isOpen, options);
}

function openBuildResumeContextModal() {
  if (
    saveWorkspaceBuildButton?.disabled ||
    !hasActiveSaveWorkspaceForCurrentTab() ||
    !currentSaveWorkspace?.isReady
  ) {
    return;
  }

  setBuildResumeContextModalOpen(true);
}

// Returns the workspace the action is bound to so async handlers keep reporting
// to its tab even after the user switches away.
function beginSaveWorkspaceAction(
  message,
  { allowBeforeReady = false } = {}
) {
  const workspace = currentSaveWorkspace;

  if (
    (!workspace?.isReady && !allowBeforeReady) ||
    workspace?.isBusy
  ) {
    return null;
  }

  workspace.isBusy = true;
  updateSaveWorkspaceActions();
  clearStatus();
  clearDeletedRowsForTab(workspace.chatGptTabId);
  addLogForTab(workspace.chatGptTabId, "info", message);
  return workspace;
}

function finishSaveWorkspaceAction(workspace = currentSaveWorkspace) {
  if (!workspace) {
    return;
  }

  workspace.isBusy = false;
  if (currentSaveWorkspace === workspace) {
    updateSaveWorkspaceActions();
  }
  schedulePersistTabSession();
}

async function submitBuildResumeContext() {
  const resumeText = String(buildResumeContextInput?.value || "").trim();
  if (!resumeText) {
    showBuildResumeContextStatus(
      "error",
      "Paste the resume context before clicking OK."
    );
    buildResumeContextInput?.focus();
    return;
  }

  const workspace = beginSaveWorkspaceAction(
    "Build resume confirmed. Updating the copied Google Docs resume..."
  );
  if (!workspace) {
    return;
  }

  const ownerTabId = workspace.chatGptTabId;
  setBuildResumeContextModalBusy(true);
  let response;
  let didBuildResume = false;

  try {
    response = await chrome.runtime.sendMessage({
      type: "UPDATE_WORKSPACE_RESUME_CONTEXT",
      runId: registerRunTab(activeRunId || createRunId(), ownerTabId),
      ownerTabId,
      resumeUrl: workspace.resumeUrl,
      resumeText
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not build the resume.");
    }

    didBuildResume = true;
  } catch (error) {
    console.error(error);
    if (isActiveTab(ownerTabId)) {
      showBuildResumeContextStatus(
        "error",
        error.message || "Could not build the resume."
      );
    }
    addLogForTab(
      ownerTabId,
      "error",
      error.message || "Could not build the resume."
    );
  } finally {
    finishSaveWorkspaceAction(workspace);
    setBuildResumeContextModalBusy(false);
  }

  if (!didBuildResume) {
    return;
  }

  setBuildResumeContextModalOpenForTab(ownerTabId, false);
  if (currentSaveWorkspace === workspace) {
    setSaveWorkspaceTab("resume");
  } else {
    workspace.activeTab = "resume";
  }
  showStatusForTab(
    ownerTabId,
    "success",
    response.url || workspace.resumeUrl,
    "Built:"
  );
  addLogForTab(
    ownerTabId,
    "success",
    "Resume context inserted into the copied document without changing template styles."
  );
}

async function downloadSaveWorkspaceResume() {
  if (saveWorkspaceDownloadButton?.disabled) {
    return;
  }

  const workspace = beginSaveWorkspaceAction("Download resume clicked.");
  if (!workspace) {
    return;
  }

  const ownerTabId = workspace.chatGptTabId;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "DOWNLOAD_RESUME_PDF",
      runId: registerRunTab(activeRunId || createRunId(), ownerTabId),
      ownerTabId,
      documentUrl: workspace.resumeUrl,
      profileName: workspace.profileName
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not download the resume PDF.");
    }

    showStatusForTab(
      ownerTabId,
      "success",
      response.filename || "resume.pdf",
      "Downloaded:"
    );
    addLogForTab(
      ownerTabId,
      "success",
      `Resume PDF download started: ${response.filename || "resume.pdf"}`
    );
  } catch (error) {
    console.error(error);
    showStatusForTab(
      ownerTabId,
      "error",
      error.message || "Could not download the resume PDF."
    );
    addLogForTab(
      ownerTabId,
      "error",
      error.message || "Could not download the resume PDF."
    );
  } finally {
    finishSaveWorkspaceAction(workspace);
  }
}

async function exchangeSaveWorkspaceUrls() {
  if (areActionButtonsDisabled || !hasActiveSaveWorkspaceForCurrentTab()) {
    return;
  }

  const workspace = beginSaveWorkspaceAction(
    "Exchange clicked. Switching the main tab URL..."
  );
  if (!workspace) {
    return;
  }

  const ownerTabId = workspace.chatGptTabId;
  const isImportedWorkspace = workspace.sessionType === "make-resume";

  try {
    const mainTab = await chrome.tabs.get(workspace.chatGptTabId);
    const mainTabUrl = String(mainTab?.url || "").trim();
    const informationUrl = String(workspace.jobUrl || "").trim();
    const storedChatUrl = String(workspace.storedExchangeUrl || "").trim();
    const isRestoringChat = !isImportedWorkspace && Boolean(storedChatUrl);
    const nextMainTabUrl = isImportedWorkspace
      ? informationUrl
      : isRestoringChat
        ? storedChatUrl
        : informationUrl;

    if (!mainTabUrl || !nextMainTabUrl) {
      throw new Error("Could not identify the URL needed for Exchange.");
    }
    const isContextDocWorkspace = isContextDocAiProviderId(
      workspace.aiProviderId
    );
    const canStoreMainTabUrl = isContextDocWorkspace
      ? isGoogleDocsUrl(mainTabUrl)
      : isSupportedAiUrl(mainTabUrl);
    if (!isImportedWorkspace && !isRestoringChat && !canStoreMainTabUrl) {
      throw new Error(
        isContextDocWorkspace
          ? "The main tab is not the context Google Doc, so there is no URL to store."
          : "The main tab is not a supported AI provider page, so there is no chat URL to store."
      );
    }

    await chrome.tabs.update(workspace.chatGptTabId, {
      url: nextMainTabUrl,
      active: true
    });

    if (isImportedWorkspace) {
      workspace.jobUrl = mainTabUrl;
      if (isSupportedAiUrl(mainTabUrl)) {
        workspace.chatGptUrl = mainTabUrl;
      } else if (isSupportedAiUrl(nextMainTabUrl)) {
        workspace.chatGptUrl = nextMainTabUrl;
      }
      if (currentSaveWorkspace === workspace) {
        setSaveWorkspaceTab(workspace.activeTab, {
          forceReload: workspace.activeTab === "job"
        });
      }
    } else {
      workspace.storedExchangeUrl = isRestoringChat ? "" : mainTabUrl;
      if (!isRestoringChat) {
        workspace.chatGptUrl = mainTabUrl;
      }
      if (currentSaveWorkspace === workspace) {
        updateSaveWorkspaceActions();
      }
    }

    showStatusForTab(ownerTabId, "success", nextMainTabUrl, "Main tab:");
    addLogForTab(
      ownerTabId,
      "success",
      isImportedWorkspace
        ? "Main tab and Information page URLs exchanged."
        : isRestoringChat
          ? "Stored chat URL restored in the main tab."
          : "Chat URL stored for the next Exchange; the job URL is now in the main tab."
    );
  } catch (error) {
    console.error(error);
    showStatusForTab(
      ownerTabId,
      "error",
      error.message || "Could not exchange the URLs."
    );
    addLogForTab(
      ownerTabId,
      "error",
      error.message || "Could not exchange the URLs."
    );
  } finally {
    finishSaveWorkspaceAction(workspace);
  }
}

function rememberPickupWindowForOwnerTab(ownerTabId, windowId) {
  if (!Number.isInteger(ownerTabId) || !Number.isInteger(windowId)) {
    return;
  }

  const state = getTabState(ownerTabId);
  if (!Array.isArray(state.pickupWindowIds)) {
    state.pickupWindowIds = [];
  }
  if (state.pickupWindowIds.includes(windowId)) {
    return;
  }

  state.pickupWindowIds.push(windowId);
  schedulePersistTabSession();
}

function forgetPickupWindowIdEverywhere(windowId) {
  if (!Number.isInteger(windowId)) {
    return;
  }

  let changed = false;
  tabStateById.forEach((state) => {
    if (!Array.isArray(state?.pickupWindowIds) || state.pickupWindowIds.length === 0) {
      return;
    }
    const nextIds = state.pickupWindowIds.filter((id) => id !== windowId);
    if (nextIds.length !== state.pickupWindowIds.length) {
      state.pickupWindowIds = nextIds;
      changed = true;
    }
  });

  if (changed) {
    schedulePersistTabSession();
  }
}

async function requestClosePickupWindow(windowId) {
  const response = await chrome.runtime.sendMessage({
    type: "CLOSE_PICKUP_WINDOW",
    windowId
  });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not safely close the pickup window.");
  }
  return response;
}

async function closePickupWindowsForOwnerTab(ownerTabId) {
  if (!Number.isInteger(ownerTabId)) {
    return;
  }

  const state = tabStateById.get(ownerTabId);
  const windowIds = Array.isArray(state?.pickupWindowIds)
    ? [...new Set(state.pickupWindowIds.map(Number).filter(Number.isInteger))]
    : [];

  if (windowIds.length === 0) {
    return;
  }

  await Promise.all(
    windowIds.map(async (windowId) => {
      try {
        const result = await requestClosePickupWindow(windowId);
        if (result.closed) {
          forgetPickupWindowIdEverywhere(windowId);
        } else {
          addLogForTab(ownerTabId, "info", "Kept a pickup window open because it contains a saving or failed tab.");
        }
      } catch (error) {
        // Keep the window tracked when its state could not be checked.
        console.info("Pickup window was not confirmed closed:", error);
      }
    })
  );

  await updatePickupCloseButtons();
}

function getWorkspaceUrlComparisonKey(value) {
  try {
    const parsedUrl = new URL(String(value || "").trim());
    parsedUrl.hash = "";
    return parsedUrl.href.replace(/\/$/, "");
  } catch {
    return String(value || "").trim().replace(/\/$/, "");
  }
}

async function getPickupSourceWindowId() {
  if (Number.isInteger(activeTabId)) {
    try {
      const tab = await chrome.tabs.get(activeTabId);
      if (Number.isInteger(tab?.windowId)) {
        return tab.windowId;
      }
    } catch {
      // Fall through to the side panel window.
    }
  }
  return Number.isInteger(panelWindowId) ? panelWindowId : null;
}

async function findPickedUpWindowForUrl(url) {
  const targetUrl = String(url || "").trim();
  const targetKey = getWorkspaceUrlComparisonKey(targetUrl);
  if (!targetKey) {
    return null;
  }

  const sourceWindowId = await getPickupSourceWindowId();
  let windows = [];
  try {
    windows = await chrome.windows.getAll({
      populate: true,
      windowTypes: ["normal"]
    });
  } catch (error) {
    console.error("Could not look up picked-up windows:", error);
    return null;
  }

  for (const win of windows) {
    if (!Number.isInteger(win?.id) || win.id === sourceWindowId) {
      continue;
    }

    for (const tab of win.tabs || []) {
      if (!Number.isInteger(tab?.id)) {
        continue;
      }
      if (
        getWorkspaceUrlComparisonKey(tab.url || tab.pendingUrl || "") !==
        targetKey
      ) {
        continue;
      }

      return {
        windowId: win.id,
        tabId: tab.id,
        url: tab.url || targetUrl
      };
    }
  }

  return null;
}

function setPickupCloseButtonVisible(button, isVisible) {
  if (!button) {
    return;
  }
  button.classList.toggle("is-hidden", !isVisible);
  if (!isVisible) {
    button.disabled = true;
  }
}

async function updatePickupCloseButtons() {
  const gptUrl = String(
    applicationWorkspaceJobGptUrl?.textContent || ""
  ).trim();
  const jobUrl = String(
    applicationWorkspaceRecordJobUrl?.textContent || ""
  ).trim();
  const resumeUrl = getApplicationWorkspaceResumePickupUrl();
  const showWorkspacePickup = !isSplitWindowsDialogOpen;

  const [gptPickupWindow, jobPickupWindow, resumePickupWindow] =
    await Promise.all([
      showWorkspacePickup && gptUrl
        ? findPickedUpWindowForUrl(gptUrl)
        : Promise.resolve(null),
      showWorkspacePickup && jobUrl
        ? findPickedUpWindowForUrl(jobUrl)
        : Promise.resolve(null),
      showWorkspacePickup && resumeUrl
        ? findPickedUpWindowForUrl(resumeUrl)
        : Promise.resolve(null)
    ]);

  if (applicationWorkspaceJobGptClosePickupButton) {
    const showClose = showWorkspacePickup && Boolean(gptPickupWindow);
    setPickupCloseButtonVisible(
      applicationWorkspaceJobGptClosePickupButton,
      showClose
    );
    applicationWorkspaceJobGptClosePickupButton.disabled = !showClose;
  }

  if (applicationWorkspaceRecordJobClosePickupButton) {
    const showClose = showWorkspacePickup && Boolean(jobPickupWindow);
    setPickupCloseButtonVisible(
      applicationWorkspaceRecordJobClosePickupButton,
      showClose
    );
    applicationWorkspaceRecordJobClosePickupButton.disabled = !showClose;
  }

  if (applicationWorkspaceClosePickupButton) {
    const showClose = showWorkspacePickup && Boolean(resumePickupWindow);
    setPickupCloseButtonVisible(
      applicationWorkspaceClosePickupButton,
      showClose
    );
    applicationWorkspaceClosePickupButton.disabled = !showClose;
  }
}

async function closePickedUpWindowForUrl(url, {
  ownerTabId = null,
  successLog = "Closed the picked-up window.",
  emptyMessage = "No picked-up window is open for this URL."
} = {}) {
  const targetUrl = String(url || "").trim();
  if (!targetUrl) {
    showStatus("error", emptyMessage);
    return;
  }

  const pickedUpWindow = await findPickedUpWindowForUrl(targetUrl);
  if (!pickedUpWindow) {
    await updatePickupCloseButtons();
    showStatus("error", emptyMessage);
    return;
  }

  const resolvedOwnerTabId = Number.isInteger(ownerTabId)
    ? ownerTabId
    : activeTabId;

  try {
    const result = await requestClosePickupWindow(pickedUpWindow.windowId);
    if (!result.closed) {
      const message = "Window kept open because it contains a saving or failed tab.";
      if (Number.isInteger(resolvedOwnerTabId)) {
        showStatusForTab(resolvedOwnerTabId, "info", message);
        addLogForTab(resolvedOwnerTabId, "info", message);
      } else {
        showStatus("info", message);
        addLog("info", message);
      }
      return;
    }
    forgetPickupWindowIdEverywhere(pickedUpWindow.windowId);
    if (Number.isInteger(resolvedOwnerTabId)) {
      showStatusForTab(
        resolvedOwnerTabId,
        "success",
        targetUrl,
        "Closed:"
      );
      addLogForTab(resolvedOwnerTabId, "success", successLog);
    } else {
      showStatus("success", targetUrl, "Closed:");
      addLog("success", successLog);
    }
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not close the picked-up window.";
    if (Number.isInteger(resolvedOwnerTabId)) {
      showStatusForTab(resolvedOwnerTabId, "error", message);
      addLogForTab(resolvedOwnerTabId, "error", message);
    } else {
      showStatus("error", message);
      addLog("error", message);
    }
  } finally {
    await updatePickupCloseButtons();
  }
}

async function openWorkspaceUrlInRightWindow(url, {
  ownerTabId = null,
  successLog = "Opened the URL in a right-side Chrome window.",
  reopenSuccessLog = "Reopened the existing right-side Chrome window.",
  statusPrefix = "Picked up:"
} = {}) {
  const targetUrl = String(url || "").trim();
  if (!targetUrl) {
    throw new Error("No URL is available to open.");
  }

  const resolvedOwnerTabId = Number.isInteger(ownerTabId)
    ? ownerTabId
    : activeTabId;
  if (!Number.isInteger(resolvedOwnerTabId)) {
    throw new Error("Could not identify the current tab.");
  }

  const mainTab = await chrome.tabs.get(resolvedOwnerTabId);
  const response = await chrome.runtime.sendMessage({
    type: "OPEN_URL_IN_RIGHT_WINDOW",
    runId: registerRunTab(activeRunId || createRunId(), resolvedOwnerTabId),
    ownerTabId: resolvedOwnerTabId,
    url: targetUrl,
    sourceWindowId: mainTab.windowId
  });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not open the URL.");
  }

  const didReuse = Boolean(response.reused);
  if (Number.isInteger(response.windowId)) {
    rememberPickupWindowForOwnerTab(resolvedOwnerTabId, response.windowId);
    await persistTabSession().catch((error) => {
      console.error("Could not persist pickup window tracking:", error);
    });
  }
  showStatusForTab(
    resolvedOwnerTabId,
    "success",
    targetUrl,
    didReuse ? "Reopened:" : statusPrefix
  );
  addLogForTab(
    resolvedOwnerTabId,
    "success",
    didReuse ? reopenSuccessLog : successLog
  );
  await updatePickupCloseButtons();
  return {
    ...response,
    url: targetUrl,
    ownerTabId: resolvedOwnerTabId
  };
}

function getApplicationWorkspaceResumePickupUrl() {
  if (hasActiveSaveWorkspaceForCurrentTab()) {
    return String(currentSaveWorkspace.resumeUrl || "").trim();
  }
  return String(currentEmptyWorkspaceUrls.resume || "").trim();
}

async function pickupApplicationWorkspaceResumeUrl() {
  if (areActionButtonsDisabled || isSplitWindowsDialogOpen) {
    return;
  }

  const resumeUrl = getApplicationWorkspaceResumePickupUrl();
  if (!resumeUrl) {
    showStatus("error", "No resume URL is available to open.");
    return;
  }

  if (hasActiveSaveWorkspaceForCurrentTab()) {
    const workspace = beginSaveWorkspaceAction(
      "Pick up clicked. Opening or reopening the resume URL in a right-side window..."
    );
    if (!workspace) {
      return;
    }

    const ownerTabId = workspace.chatGptTabId;
    try {
      await openWorkspaceUrlInRightWindow(resumeUrl, {
        ownerTabId,
        successLog:
          "Opened the resume URL in a right-side Chrome window.",
        reopenSuccessLog:
          "Reopened the existing resume window.",
        statusPrefix: "Picked up:"
      });
    } catch (error) {
      console.error(error);
      showStatusForTab(
        ownerTabId,
        "error",
        error.message || "Could not open the resume URL."
      );
      addLogForTab(
        ownerTabId,
        "error",
        error.message || "Could not open the resume URL."
      );
    } finally {
      finishSaveWorkspaceAction(workspace);
    }
    return;
  }

  try {
    await openWorkspaceUrlInRightWindow(resumeUrl, {
      successLog: "Opened the resume URL in a right-side Chrome window.",
      reopenSuccessLog: "Reopened the existing resume window.",
      statusPrefix: "Picked up:"
    });
  } catch (error) {
    console.error(error);
    showStatus("error", error.message || "Could not open the resume URL.");
  }
}

async function closeApplicationWorkspaceResumePickupWindow() {
  if (isSplitWindowsDialogOpen) {
    return;
  }

  const resumeUrl = getApplicationWorkspaceResumePickupUrl();
  const ownerTabId = hasActiveSaveWorkspaceForCurrentTab()
    ? currentSaveWorkspace?.chatGptTabId
    : activeTabId;

  await closePickedUpWindowForUrl(resumeUrl, {
    ownerTabId,
    successLog: "Closed the picked-up resume window.",
    emptyMessage: "No picked-up resume window is open."
  });
}

async function pickupApplicationWorkspacePanelUrl(
  url,
  label,
  { allowWhileSaveRunning = false } = {}
) {
  if (
    (areActionButtonsDisabled && !allowWhileSaveRunning) ||
    isSplitWindowsDialogOpen
  ) {
    return;
  }

  const targetUrl = String(url || "").trim();
  if (!targetUrl) {
    showStatus("error", `No ${label} URL is available to open.`);
    return;
  }

  const openOptions = {
    successLog: `Opened the ${label} URL in a right-side Chrome window.`,
    reopenSuccessLog: `Reopened the existing ${label} window.`,
    statusPrefix: "Picked up:"
  };

  if (hasActiveSaveWorkspaceForCurrentTab()) {
    const workspace = beginSaveWorkspaceAction(
      `Pick up clicked. Opening or reopening the ${label} URL in a right-side window...`,
      {
        allowBeforeReady: allowWhileSaveRunning
      }
    );
    if (!workspace) {
      return;
    }

    const ownerTabId = workspace.chatGptTabId;
    try {
      await openWorkspaceUrlInRightWindow(targetUrl, {
        ...openOptions,
        ownerTabId
      });
    } catch (error) {
      console.error(error);
      const message = error.message || `Could not open the ${label} URL.`;
      showStatusForTab(ownerTabId, "error", message);
      addLogForTab(ownerTabId, "error", message);
    } finally {
      finishSaveWorkspaceAction(workspace);
    }
    return;
  }

  try {
    await openWorkspaceUrlInRightWindow(targetUrl, openOptions);
  } catch (error) {
    console.error(error);
    showStatus("error", error.message || `Could not open the ${label} URL.`);
  }
}

async function pickupApplicationWorkspaceJobGptUrl() {
  const aiUrl = String(
    applicationWorkspaceJobGptUrl?.textContent || ""
  ).trim();
  const aiProviderLabel =
    String(currentSaveWorkspace?.aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(inferAiProviderIdFromUrl(aiUrl));
  const exactAiUrlAvailable =
    currentSaveWorkspace?.hasExactAiUrl === true ||
    isAiConversationUrl(
      aiUrl,
      currentSaveWorkspace?.aiProviderId || inferAiProviderIdFromUrl(aiUrl)
    );
  await pickupApplicationWorkspacePanelUrl(
    aiUrl,
    aiProviderLabel,
    { allowWhileSaveRunning: exactAiUrlAvailable }
  );
}

function updateApplicationWorkspaceAiSendControls() {
  if (
    !applicationWorkspaceAiSend ||
    !applicationWorkspaceAiSendInput ||
    !applicationWorkspaceAiSendButton
  ) {
    return;
  }

  const workspace = hasActiveSaveWorkspaceForCurrentTab()
    ? currentSaveWorkspace
    : null;
  const aiUrl = String(
    applicationWorkspaceJobGptUrl?.textContent || workspace?.chatGptUrl || ""
  ).trim();
  const aiProviderId = workspace?.aiProviderId || inferAiProviderIdFromUrl(aiUrl);
  const aiProviderLabel =
    String(workspace?.aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(aiProviderId);
  const canSendToAiTab =
    !isSplitWindowsDialogOpen &&
    Boolean(workspace) &&
    !isContextDocAiProviderId(aiProviderId) &&
    isAiConversationUrl(aiUrl, aiProviderId);

  applicationWorkspaceAiSend.classList.toggle("is-hidden", !canSendToAiTab);
  if (!canSendToAiTab) {
    applicationWorkspaceAiSendInput.disabled = true;
    applicationWorkspaceAiSendButton.disabled = true;
    return;
  }

  const draft = String(workspace.sendTextDraft || "");
  if (applicationWorkspaceAiSendInput.value !== draft) {
    applicationWorkspaceAiSendInput.value = draft;
  }

  const actionDisabled = Boolean(workspace.isBusy) || areActionButtonsDisabled;
  applicationWorkspaceAiSendInput.disabled = actionDisabled;
  applicationWorkspaceAiSendInput.placeholder = `Enter text to send to ${aiProviderLabel}...`;
  applicationWorkspaceAiSendButton.disabled =
    actionDisabled || !applicationWorkspaceAiSendInput.value.trim();
  applicationWorkspaceAiSendButton.title =
    `Pick up the saved ${aiProviderLabel} tab and send this text`;
  applicationWorkspaceAiSendButton.setAttribute(
    "aria-label",
    `Send text to the picked-up ${aiProviderLabel} tab`
  );
  const buttonLabel = applicationWorkspaceAiSendButton.querySelector("span");
  if (buttonLabel) {
    buttonLabel.textContent = workspace.isSendingText ? "Sending..." : "Send";
  }
}

function updateApplicationWorkspaceAiSendDraft() {
  if (!currentSaveWorkspace || !applicationWorkspaceAiSendInput) {
    return;
  }

  currentSaveWorkspace.sendTextDraft = applicationWorkspaceAiSendInput.value;
  schedulePersistTabSession();
  updateApplicationWorkspaceAiSendControls();
}

async function sendApplicationWorkspaceTextToPickedUpAiTab() {
  if (
    applicationWorkspaceAiSendButton?.disabled ||
    !applicationWorkspaceAiSendInput ||
    !hasActiveSaveWorkspaceForCurrentTab()
  ) {
    return;
  }

  const workspace = beginSaveWorkspaceAction(
    "Send clicked. Picking up the saved AI tab and sending the entered text..."
  );
  if (!workspace) {
    return;
  }

  const ownerTabId = workspace.chatGptTabId;
  const aiUrl = String(
    applicationWorkspaceJobGptUrl?.textContent || workspace.chatGptUrl || ""
  ).trim();
  const aiProviderId = workspace.aiProviderId || inferAiProviderIdFromUrl(aiUrl);
  const aiProviderLabel =
    String(workspace.aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(aiProviderId);
  const text = applicationWorkspaceAiSendInput.value.trim();
  workspace.sendTextDraft = applicationWorkspaceAiSendInput.value;
  workspace.isSendingText = true;
  updateApplicationWorkspaceAiSendControls();

  try {
    const pickedUpTab = await openWorkspaceUrlInRightWindow(aiUrl, {
      ownerTabId,
      successLog: `Opened the ${aiProviderLabel} conversation for text delivery.`,
      reopenSuccessLog: `Reopened the picked-up ${aiProviderLabel} conversation.`,
      statusPrefix: "Picked up:"
    });
    if (!Number.isInteger(pickedUpTab?.tabId)) {
      throw new Error("The picked-up AI tab could not be identified.");
    }

    const response = await chrome.runtime.sendMessage({
      type: "SEND_TEXT_TO_AI_TAB",
      runId: registerRunTab(activeRunId || createRunId(), ownerTabId),
      ownerTabId,
      tabId: pickedUpTab.tabId,
      url: aiUrl,
      text,
      aiProviderId
    });
    if (!response?.ok) {
      throw new Error(response?.error || `Could not send text to ${aiProviderLabel}.`);
    }

    workspace.sendTextDraft = "";
    if (currentSaveWorkspace === workspace) {
      applicationWorkspaceAiSendInput.value = "";
    }
    showStatusForTab(
      ownerTabId,
      "success",
      aiUrl,
      "Text sent:"
    );
    addLogForTab(
      ownerTabId,
      "success",
      `Text sent to the picked-up ${aiProviderLabel} tab.`
    );
  } catch (error) {
    console.error(error);
    const message = error.message || `Could not send text to ${aiProviderLabel}.`;
    showStatusForTab(ownerTabId, "error", message);
    addLogForTab(ownerTabId, "error", message);
  } finally {
    workspace.isSendingText = false;
    finishSaveWorkspaceAction(workspace);
  }
}

async function pickupApplicationWorkspaceRecordJobUrl() {
  await pickupApplicationWorkspacePanelUrl(
    applicationWorkspaceRecordJobUrl?.textContent,
    "Job"
  );
}

async function closeApplicationWorkspaceJobGptPickupWindow() {
  if (isSplitWindowsDialogOpen) {
    return;
  }

  const aiUrl = String(
    applicationWorkspaceJobGptUrl?.textContent || ""
  ).trim();
  const ownerTabId = hasActiveSaveWorkspaceForCurrentTab()
    ? currentSaveWorkspace?.chatGptTabId
    : activeTabId;
  const aiProviderLabel =
    String(currentSaveWorkspace?.aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(inferAiProviderIdFromUrl(aiUrl));

  await closePickedUpWindowForUrl(aiUrl, {
    ownerTabId,
    successLog: `Closed the picked-up ${aiProviderLabel} window.`,
    emptyMessage: `No picked-up ${aiProviderLabel} window is open.`
  });
}

async function closeApplicationWorkspaceRecordJobPickupWindow() {
  if (isSplitWindowsDialogOpen) {
    return;
  }

  const jobUrl = String(
    applicationWorkspaceRecordJobUrl?.textContent || ""
  ).trim();
  const ownerTabId = hasActiveSaveWorkspaceForCurrentTab()
    ? currentSaveWorkspace?.chatGptTabId
    : activeTabId;

  await closePickedUpWindowForUrl(jobUrl, {
    ownerTabId,
    successLog: "Closed the picked-up Job URL window.",
    emptyMessage: "No picked-up Job URL window is open."
  });
}

function clearEmptyApplicationWorkspaceJobUrl() {
  if (areActionButtonsDisabled || isSplitWindowsDialogOpen) {
    return;
  }

  const displayedUrl = String(
    applicationWorkspaceRecordJobUrl?.textContent || ""
  ).trim();
  if (!displayedUrl) {
    return;
  }

  if (hasActiveSaveWorkspaceForCurrentTab()) {
    const workspace = currentSaveWorkspace;
    const displayedKey = getWorkspaceUrlComparisonKey(displayedUrl);
    if (
      getWorkspaceUrlComparisonKey(workspace.storedExchangeUrl) === displayedKey
    ) {
      workspace.storedExchangeUrl = "";
    }
    if (getWorkspaceUrlComparisonKey(workspace.jobUrl) === displayedKey) {
      workspace.jobUrl = "";
    }
    if (getWorkspaceUrlComparisonKey(workspace.chatGptUrl) === displayedKey) {
      workspace.chatGptUrl = "";
    }
  } else {
    currentEmptyWorkspaceUrls.job = "";
  }

  updateApplicationWorkspaceJobGptUrl();
  showStatus("success", displayedUrl, "Deleted:");
  schedulePersistTabSession();
}

function setDeleteApplicationModalOpen(isOpen, { returnFocus = true } = {}) {
  if (!deleteApplicationModal) {
    return;
  }

  deleteApplicationModal.classList.toggle("is-hidden", !isOpen);
  deleteApplicationModal.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    if (pendingNoModelDeleteTarget) {
      if (deleteApplicationModalHelp) {
        deleteApplicationModalHelp.textContent =
          `Delete the "${pendingNoModelDeleteTarget.profileName}" application from Google Sheets? The copied resume document will be kept.`;
      }
      deleteApplicationModalConfirmButton?.focus();
      return;
    }
    const workspace = currentSaveWorkspace;
    const profileName = String(workspace?.profileName || "").trim();
    const jobUrl = String(workspace?.jobUrl || "").trim();
    if (deleteApplicationModalHelp) {
      const trashResumeNote =
        workspace?.sessionType === "save-workspace"
          ? "trashes the copied resume Doc, "
          : "";
      deleteApplicationModalHelp.textContent = profileName
        ? `Delete the "${profileName}" application${
            jobUrl ? ` for ${jobUrl}` : ""
          }? This removes matching Google Sheet rows, ${trashResumeNote}closes pickup windows, returns Home, and opens the job URL in the main tab.`
        : "Delete this application? This removes matching Google Sheet rows, closes pickup windows, returns Home, and opens the job URL in the main tab.";
    }
    deleteApplicationModalConfirmButton?.focus();
    return;
  }

  const noModelTarget = pendingNoModelDeleteTarget;
  pendingNoModelDeleteTarget = null;
  if (returnFocus) {
    if (noModelTarget) {
      Array.from(profileList?.querySelectorAll(".profile-item") || [])
        .find((item) => item.dataset.profileId === noModelTarget.profileId)
        ?.querySelector(".no-model-profile-delete")
        ?.focus();
    } else {
      applicationWorkspaceDeleteButton?.focus();
    }
  }
}

function requestDeleteApplicationWorkspace() {
  if (areActionButtonsDisabled || isSplitWindowsDialogOpen) {
    return;
  }

  if (!hasActiveSaveWorkspaceForCurrentTab()) {
    clearEmptyApplicationWorkspaceJobUrl();
    return;
  }

  if (!currentSaveWorkspace?.isReady || currentSaveWorkspace.isBusy) {
    return;
  }

  pendingNoModelDeleteTarget = null;
  setDeleteApplicationModalOpen(true);
}

function tearDownDeletedSaveWorkspace(workspace) {
  if (!workspace) {
    return;
  }

  const ownerTabId = workspace.chatGptTabId;
  if (Number.isInteger(ownerTabId)) {
    saveWorkspacesByTabId.delete(ownerTabId);
    const tabState = tabStateById.get(ownerTabId);
    if (tabState) {
      tabState.saveWorkspaceSidePanelView = "home";
      tabState.splitWindowSessionType = "make-resume";
    }
  }

  if (currentSaveWorkspace === workspace) {
    currentSaveWorkspace = null;
  }

  currentSaveWorkspaceSidePanelView = "workspace";
  currentDefaultSidePanelView = "home";
  currentSplitWindowDownloadUrl = "";
  currentSplitWindowPairs = [];
  currentSplitWindowReturnTabId = null;
  currentSplitWindowSessionType = "make-resume";
  splitWindowsPreviewTabs?.classList.add("is-hidden");
  setBuildResumeContextModalOpen(false, { returnFocus: false });
  schedulePersistTabSession();
  renderSaveWorkspaceSidePanelView({ focus: true });
}

async function confirmDeleteApplicationWorkspace() {
  if (
    areActionButtonsDisabled ||
    isSplitWindowsDialogOpen ||
    !hasActiveSaveWorkspaceForCurrentTab()
  ) {
    setDeleteApplicationModalOpen(false);
    return;
  }

  const workspace = beginSaveWorkspaceAction(
    "Delete confirmed. Removing the application record..."
  );
  if (!workspace) {
    setDeleteApplicationModalOpen(false);
    return;
  }

  setDeleteApplicationModalOpen(false, { returnFocus: false });

  const ownerTabId = workspace.chatGptTabId;
  const snapshot = {
    profileName: String(workspace.profileName || "").trim(),
    jobUrl: String(
      workspace.recordJobUrl || workspace.jobUrl || ""
    ).trim(),
    resumeUrl: String(workspace.resumeUrl || "").trim(),
    chatGptUrl: String(workspace.chatGptUrl || "").trim(),
    sessionType: workspace.sessionType,
    chatGptTabId: ownerTabId
  };
  const runId = registerRunTab(
    activeRunId || createRunId(),
    ownerTabId
  );

  if (deleteApplicationModalConfirmButton) {
    deleteApplicationModalConfirmButton.disabled = true;
  }

  try {
    await closePickupWindowsForOwnerTab(ownerTabId);

    const response = await chrome.runtime.sendMessage({
      type: "DELETE_APPLICATION_RECORD",
      runId,
      ownerTabId,
      profileName: snapshot.profileName,
      jobUrl: snapshot.jobUrl,
      resumeUrl: snapshot.resumeUrl,
      chatGptUrl: snapshot.chatGptUrl,
      trashResume: snapshot.sessionType === "save-workspace"
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not delete the application.");
    }

    if (snapshot.jobUrl && Number.isInteger(ownerTabId)) {
      await chrome.tabs.update(ownerTabId, {
        url: snapshot.jobUrl,
        active: true
      });
    }

    const removedCount = Number(response.removed) || 0;
    const summaryParts = [];
    if (removedCount > 0) {
      summaryParts.push(
        `removed ${removedCount} sheet row${removedCount === 1 ? "" : "s"}`
      );
    } else {
      summaryParts.push("no matching sheet rows");
    }
    if (response.trashedDocumentId) {
      summaryParts.push("trashed resume copy");
    }

    showStatusForTab(
      ownerTabId,
      "success",
      snapshot.jobUrl || snapshot.profileName || "Application deleted.",
      "Deleted:"
    );
    addLogForTab(
      ownerTabId,
      "success",
      `Application deleted (${summaryParts.join(", ")}).`
    );

    finishSaveWorkspaceAction(workspace);
    tearDownDeletedSaveWorkspace(workspace);
  } catch (error) {
    console.error(error);
    showStatusForTab(
      ownerTabId,
      "error",
      error.message || "Could not delete the application."
    );
    addLogForTab(
      ownerTabId,
      "error",
      error.message || "Could not delete the application."
    );
    finishSaveWorkspaceAction(workspace);
  } finally {
    if (deleteApplicationModalConfirmButton) {
      deleteApplicationModalConfirmButton.disabled = false;
    }
  }
}

function hasSaveWorkspaceSession() {
  return saveWorkspacesByTabId.size > 0;
}

function hasActiveSaveWorkspaceForCurrentTab() {
  return Boolean(currentSaveWorkspace);
}

function getCurrentSidePanelView() {
  return hasActiveSaveWorkspaceForCurrentTab()
    ? currentSaveWorkspaceSidePanelView
    : currentDefaultSidePanelView;
}

function renderSaveWorkspaceSidePanelView({ focus = false } = {}) {
  const currentView = getCurrentSidePanelView();
  const showWorkspace =
    !isSplitWindowsDialogOpen && currentView === "workspace";
  const showHomeSwitcher =
    !isSplitWindowsDialogOpen && currentView === "home";

  splitWindowsModal?.classList.toggle(
    "is-workspace-page",
    !isSplitWindowsDialogOpen
  );
  appRoot?.classList.toggle("is-workspace-hidden", showWorkspace);
  homeWorkspaceSwitcher?.classList.toggle("is-hidden", !showHomeSwitcher);
  homeWorkspaceSwitcher?.setAttribute(
    "aria-hidden",
    String(!showHomeSwitcher)
  );

  if (splitWindowsModalCloseButton) {
    const label = !isSplitWindowsDialogOpen
      ? "Exchange with main Home view"
      : "Close";
    splitWindowsModalCloseButton.setAttribute("aria-label", label);
    splitWindowsModalCloseButton.title = label;
  }
  renderSavePostProcessControls();

  if (isSplitWindowsDialogOpen) {
    splitWindowsModal?.setAttribute("role", "dialog");
    splitWindowsModal?.setAttribute("aria-modal", "true");
    // Another tab's render may have hidden the shared node, so show it again.
    splitWindowsModal?.classList.remove("is-hidden");
    splitWindowsModal?.setAttribute("aria-hidden", "false");
    return;
  }

  splitWindowsModal?.setAttribute("role", "region");
  splitWindowsModal?.removeAttribute("aria-modal");
  splitWindowsModal?.classList.toggle("is-hidden", !showWorkspace);
  splitWindowsModal?.setAttribute("aria-hidden", String(!showWorkspace));

  if (showWorkspace) {
    const activeWorkspaceTab = hasActiveSaveWorkspaceForCurrentTab()
      ? currentSaveWorkspace.activeTab
      : currentEmptyWorkspaceTab;
    setSaveWorkspaceTab(activeWorkspaceTab);
  }

  const shouldShowBuildModal =
    showWorkspace &&
    hasActiveSaveWorkspaceForCurrentTab() &&
    isBuildResumeContextModalOpen;
  buildResumeContextModal?.classList.toggle(
    "is-hidden",
    !shouldShowBuildModal
  );
  buildResumeContextModal?.setAttribute(
    "aria-hidden",
    String(!shouldShowBuildModal)
  );

  if (focus) {
    if (showWorkspace) {
      splitWindowsModalCloseButton?.focus();
    } else if (showHomeSwitcher) {
      homeWorkspaceExchangeButton?.focus();
    }
  }

  updateWorkspacePromptInfoButtons();
}

function setSaveWorkspaceSidePanelView(view, { focus = true } = {}) {
  const nextView = view === "workspace" ? "workspace" : "home";
  if (hasActiveSaveWorkspaceForCurrentTab()) {
    currentSaveWorkspaceSidePanelView = nextView;
  } else {
    currentDefaultSidePanelView = nextView;
  }
  renderSaveWorkspaceSidePanelView({ focus });
  return true;
}

function exchangeSaveWorkspaceSidePanelView() {
  const currentView = getCurrentSidePanelView();
  const nextView =
    currentView === "workspace"
      ? "home"
      : "workspace";
  return setSaveWorkspaceSidePanelView(nextView);
}

function handleSplitWindowsHeaderAction() {
  if (!isSplitWindowsDialogOpen) {
    exchangeSaveWorkspaceSidePanelView();
    return;
  }

  setSplitWindowsModalOpen(false);
}

// Clears only the active tab's workspace; other tabs keep theirs.
function resetSplitWindowsSession() {
  setBuildResumeContextModalOpen(false, { returnFocus: false });
  currentSplitWindowDownloadUrl = "";
  currentSplitWindowPairs = [];
  currentSplitWindowReturnTabId = null;
  currentSplitWindowSessionType = "make-resume";
  if (Number.isInteger(activeTabId)) {
    saveWorkspacesByTabId.delete(activeTabId);
  }
  currentSaveWorkspace = null;
  currentSaveWorkspaceSidePanelView = "workspace";
  splitWindowsPreviewTabs?.classList.add("is-hidden");
  schedulePersistTabSession();

  if (splitWindowsJobTabButton) {
    splitWindowsJobTabButton.classList.add("is-active");
    splitWindowsJobTabButton.setAttribute("aria-selected", "true");
    splitWindowsJobTabButton.tabIndex = 0;
    const label = splitWindowsJobTabButton.querySelector("span");
    if (label) label.textContent = "Information page";
  }

  if (splitWindowsResumeTabButton) {
    splitWindowsResumeTabButton.classList.remove("is-active");
    splitWindowsResumeTabButton.setAttribute("aria-selected", "false");
    splitWindowsResumeTabButton.tabIndex = -1;
    const label = splitWindowsResumeTabButton.querySelector("span");
    if (label) label.textContent = "Profile resume";
  }

  const backLabel = splitWindowsPreviewBackButton?.querySelector("span");
  if (backLabel) backLabel.textContent = "Back";

  updateSaveWorkspaceActions();
  renderSaveWorkspaceSidePanelView();
}

function setSplitWindowsModalOpen(isOpen) {
  if (!splitWindowsModal) return;

  isSplitWindowsDialogOpen = Boolean(isOpen);

  if (!isOpen) {
    setBuildResumeContextModalOpen(false, { returnFocus: false });
  }

  splitWindowsModal.classList.toggle("is-hidden", !isOpen);
  splitWindowsModal.setAttribute("aria-hidden", String(!isOpen));
  updateWorkspacePromptInfoButtons();

  if (isOpen) {
    resetSplitWindowsSession();
    setSplitWindowsPreview("");
    splitWindowUrlsInput?.focus();
    return;
  }

  setSplitWindowsPreview("");
  resetSplitWindowsSession();
  splitWindowsDraft = "";
  if (splitWindowUrlsInput) splitWindowUrlsInput.value = "";
  openSplitWindowsButton?.focus();
}

async function requireOpenGoogleSheet() {
  const response = await chrome.runtime.sendMessage({
    type: "CHECK_GOOGLE_SHEET_OPEN"
  });

  if (!response?.ok) {
    throw new Error(response?.error || "Could not check for an open Google Sheet.");
  }

  if (!response.open) {
    throw new Error(
      "Make a resume is available only when the current tab is a Google Sheet."
    );
  }

  return response;
}

async function openSplitWindowsModal() {

  if (openSplitWindowsButton?.disabled) {
    return;
  }

  isMakeResumeOpening = true;
  updateMakeResumeButtonDisabledState();

  try {
    await requireOpenGoogleSheet();
    setSplitWindowsModalOpen(true);
  } catch (error) {
    console.error(error);
    const message =
      error.message || "Open a Google Sheets spreadsheet before continuing.";
    showStatus("error", message);
    addLog("error", message);
  } finally {
    isMakeResumeOpening = false;
    await refreshMakeResumeButtonAvailability();
  }
}

function normalizeJobrightOpenCount() {
  const parsedCount = Number.parseInt(jobrightOpenCountInput?.value || "", 10);
  const count = Number.isFinite(parsedCount)
    ? Math.min(150, Math.max(1, parsedCount))
    : 3;

  if (jobrightOpenCountInput) {
    jobrightOpenCountInput.value = String(count);
  }

  return count;
}

// Every Jobright page interaction lives in content/jobright.js, which runs in
// the page's own realm at document_start so it can read the job data the app
// loads. The functions below are the thin bodies injected to reach it.
function claimNextJobrightApplication(processedJobIds = []) {
  const store = window.__applicationHelperJobright;
  if (!store) {
    return {
      found: false,
      error:
        "The Jobright helper did not load on this tab. Reload the Jobright tab and click Open again."
    };
  }

  return store.claimNext(processedJobIds);
}

function clickJobrightApplyButton(jobId) {
  const store = window.__applicationHelperJobright;
  return store
    ? store.clickApply(jobId)
    : { ok: false, error: "The Jobright helper did not load on this tab." };
}

function markJobrightApplicationAlreadyApplied(jobId) {
  const store = window.__applicationHelperJobright;
  return store
    ? store.markAlreadyApplied(jobId)
    : { ok: false, error: "The Jobright helper did not load on this tab." };
}

function collectJobrightCapturedOpenUrls() {
  return window.__applicationHelperJobright?.drainCapturedOpenUrls() || { urls: [] };
}

function disarmJobrightOpenCapture() {
  return window.__applicationHelperJobright?.disarmOpenCapture() || { ok: false };
}

function describeJobrightHarvest() {
  return (
    window.__applicationHelperJobright?.describe() || {
      ok: false,
      harvestedJobs: 0,
      harvestedWithUrl: 0
    }
  );
}

async function waitForJobrightApplicationTab(
  sourceTabId,
  sourceWindowId,
  knownTabIds,
  timeoutMs = 12000
) {
  const knownIds = new Set(
    Array.isArray(knownTabIds)
      ? knownTabIds.filter((value) => Number.isInteger(value))
      : []
  );
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    // Query every window: window.open() with features lands in a separate popup
    // window, which a window-scoped query would never see.
    const tabs = await chrome.tabs.query({});
    const newTabs = tabs.filter(
      (tab) =>
        Number.isInteger(tab.id) &&
        tab.id !== sourceTabId &&
        !knownIds.has(tab.id)
    );
    const applicationTab =
      newTabs.find((tab) => tab.openerTabId === sourceTabId) ||
      newTabs.find((tab) => tab.windowId === sourceWindowId) ||
      newTabs[0];

    if (applicationTab) {
      if (applicationTab.windowId !== sourceWindowId) {
        try {
          const moved = await chrome.tabs.move(applicationTab.id, {
            windowId: sourceWindowId,
            index: -1
          });
          const movedTab = Array.isArray(moved) ? moved[0] : moved;
          if (movedTab) {
            await chrome.tabs.update(sourceTabId, { active: true });
            return movedTab;
          }
        } catch (_error) {
          // Leave the tab where the page put it.
        }
      }

      await chrome.tabs.update(sourceTabId, { active: true });
      return applicationTab;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

async function filterJobrightApplicationTabUrl(
  applicationTabId,
  sourceTabId,
  timeoutMs = 2000
) {
  const deadline = Date.now() + timeoutMs;
  let applicationUrl = "";

  while (Date.now() < deadline) {
    const applicationTab = await chrome.tabs.get(applicationTabId);
    const candidateUrl = String(
      applicationTab.pendingUrl || applicationTab.url || ""
    ).trim();

    if (/^https?:\/\//i.test(candidateUrl)) {
      applicationUrl = candidateUrl;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!applicationUrl) {
    return { url: "", filtered: false };
  }

  const response = await chrome.runtime.sendMessage({
    type: "NORMALIZE_URL",
    url: applicationUrl
  });
  if (!response?.ok) {
    throw new Error(response?.error || "Could not filter the application URL.");
  }

  const filteredUrl = String(response.url || applicationUrl);
  if (filteredUrl !== applicationUrl) {
    await chrome.tabs.update(applicationTabId, { url: filteredUrl });
    await chrome.tabs.update(sourceTabId, { active: true });
  }

  return {
    url: filteredUrl,
    filtered: filteredUrl !== applicationUrl
  };
}

async function openCapturedApplicationTab(sourceTab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: sourceTab.id },
      world: "MAIN",
      func: collectJobrightCapturedOpenUrls
    });
    const urls = results?.[0]?.result?.urls || [];
    const url = urls[urls.length - 1] || "";
    if (!url) {
      return null;
    }

    return await chrome.tabs.create({
      url,
      windowId: sourceTab.windowId,
      active: false,
      openerTabId: sourceTab.id
    });
  } catch (_error) {
    return null;
  }
}

async function ensureJobrightRecommendationsTab(tabId) {
  const current = await chrome.tabs.get(tabId);
  if (isJobrightRecommendationsUrl(current.url || "")) {
    return true;
  }

  addLogForTab(
    tabId,
    "info",
    "The application button navigated the Jobright tab away from Recommendations. Going back..."
  );

  try {
    await chrome.tabs.goBack(tabId);
  } catch (_error) {
    return false;
  }

  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const check = await chrome.tabs.get(tabId);
    if (
      isJobrightRecommendationsUrl(check.url || "") &&
      check.status === "complete"
    ) {
      return true;
    }
  }

  return false;
}

async function openJobrightJobs() {
  if (openJobrightJobsButton?.disabled) {
    return;
  }

  const count = normalizeJobrightOpenCount();
  const ownerTabId = activeTabId;
  const processedJobIds = [];
  const openedJobs = [];
  const failures = [];
  let captureArmedTabId = null;
  isJobrightOpening = true;
  updateJobrightOpenControlsDisabledState();
  clearStatus();
  addLogForTab(
    ownerTabId,
    "info",
    `Open clicked. Processing ${count} Jobright application${count === 1 ? "" : "s"}...`
  );

  try {
    const tab = Number.isInteger(ownerTabId)
      ? await chrome.tabs.get(ownerTabId)
      : (
          await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
          })
        )[0];

    if (
      !Number.isInteger(tab?.id) ||
      !isJobrightRecommendationsUrl(tab.url || "")
    ) {
      throw new Error("Open is available only on Jobright Recommendations.");
    }

    captureArmedTabId = tab.id;

    try {
      const harvestResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: "MAIN",
        func: describeJobrightHarvest
      });
      const harvest = harvestResults?.[0]?.result;
      if (!harvest?.ok) {
        addLogForTab(
          tab.id,
          "info",
          "The Jobright helper is not active on this tab yet. Reload the Jobright tab if applications do not open."
        );
      } else {
        addLogForTab(
          tab.id,
          "info",
          `Jobright data: ${harvest.harvestedWithUrl} of ${harvest.harvestedJobs} loaded jobs carry an application URL.`
        );
      }
    } catch (_error) {
      // Diagnostics only; the run continues either way.
    }

    const batchSize = 3;
    // Jobright drops clicks intermittently rather than permanently: runs
    // recover and keep opening jobs after a few misses, so a low ceiling here
    // was ending 50-job runs on a temporary stretch of bad luck.
    const maximumConsecutiveOpenFailures = 6;
    // A scan can come back empty while Jobright re-renders the list or loads
    // the next page, so an empty scan is retried instead of ending the run.
    const maximumConsecutiveEmptyScans = 4;
    const emptyScanRetryDelayMs = 2000;
    const openDelayMs = 400;
    const batchDelayMs = 1500;
    let openedInBatch = 0;
    let consecutiveOpenFailures = 0;
    let consecutiveEmptyScans = 0;
    const canContinueAfterOpenFailure = () => {
      consecutiveOpenFailures += 1;
      if (consecutiveOpenFailures >= maximumConsecutiveOpenFailures) {
        addLogForTab(
          tab.id,
          "error",
          `Stopped after ${maximumConsecutiveOpenFailures} consecutive application tabs failed to open.`
        );
        return false;
      }

      return true;
    };

    const maximumCandidates = count * 2 + 25;
    while (
      openedJobs.length < count &&
      processedJobIds.length < maximumCandidates
    ) {
      const existingTabs = await chrome.tabs.query({});
      const knownTabIds = existingTabs
        .map((existingTab) => existingTab.id)
        .filter((tabId) => Number.isInteger(tabId));

      let claimed = null;
      try {
        const claimResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: "MAIN",
          func: claimNextJobrightApplication,
          args: [processedJobIds]
        });
        claimed = claimResults?.[0]?.result || null;
      } catch (error) {
        // The Jobright tab was busy or navigating; retry rather than abort.
        addLogForTab(
          tab.id,
          "info",
          `Could not scan the recommendation list: ${
            error.message || "Unknown scripting error."
          }`
        );
      }

      if (!claimed?.found) {
        consecutiveEmptyScans += 1;
        const scanDetail = claimed
          ? ` (${claimed.cardsMounted ?? 0} cards in view)`
          : "";

        if (consecutiveEmptyScans >= maximumConsecutiveEmptyScans) {
          addLogForTab(
            tab.id,
            "info",
            `${
              claimed?.error ||
              "No more Apply with Autofill or APPLY NOW recommendations were found."
            }${scanDetail}`
          );
          break;
        }

        addLogForTab(
          tab.id,
          "info",
          `No new recommendation was ready${scanDetail}. Retrying (${consecutiveEmptyScans} of ${maximumConsecutiveEmptyScans})...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, emptyScanRetryDelayMs)
        );
        continue;
      }

      consecutiveEmptyScans = 0;
      const jobId = String(claimed.jobId || "");
      if (!jobId) {
        failures.push("Jobright returned a recommendation without an ID.");
        break;
      }
      processedJobIds.push(jobId);
      const jobLabel = claimed.jobTitle || jobId || "this recommendation";
      const buttonLabel = claimed.buttonLabel || "The application button";

      // The job data Jobright loads for its own list carries the employer's
      // application URL, so the normal path never depends on the page reacting
      // to a click the extension dispatched.
      let applyUrl = String(claimed.applyUrl || "");
      let openMethod = applyUrl ? "its Jobright application link" : buttonLabel;

      if (!applyUrl) {
        let click = null;
        try {
          const clickResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            world: "MAIN",
            func: clickJobrightApplyButton,
            args: [jobId]
          });
          click = clickResults?.[0]?.result || null;
        } catch (error) {
          click = { ok: false, error: error.message };
        }

        if (!click?.ok) {
          const message =
            click?.error || `Could not activate ${buttonLabel} for ${jobLabel}.`;
          failures.push(message);
          addLogForTab(tab.id, "error", message);
          if (!canContinueAfterOpenFailure()) {
            break;
          }
          continue;
        }

        applyUrl = String(click.applyUrl || "");
        if (applyUrl) {
          openMethod = `${buttonLabel} (intercepted popup)`;
        }
      }

      let applicationTab = null;
      if (applyUrl) {
        try {
          applicationTab = await chrome.tabs.create({
            url: applyUrl,
            windowId: tab.windowId,
            active: false,
            openerTabId: tab.id
          });
        } catch (error) {
          addLogForTab(
            tab.id,
            "info",
            `Could not open the application link for ${jobLabel}: ${
              error.message || "Unknown tab error."
            }`
          );
        }
      } else {
        // No URL anywhere, so the only remaining hope is that Chrome let the
        // click through and Jobright opened the tab itself.
        applicationTab =
          (await waitForJobrightApplicationTab(
            tab.id,
            tab.windowId,
            knownTabIds,
            6000
          )) || (await openCapturedApplicationTab(tab));
        if (applicationTab) {
          openMethod = `${buttonLabel} (opened by Jobright)`;
        }
      }

      if (!applicationTab) {
        const recovered = await ensureJobrightRecommendationsTab(tab.id);
        const message = recovered
          ? `No application URL could be found for ${jobLabel}, so it was skipped.`
          : `The Jobright tab left Recommendations while opening ${jobLabel} and could not be restored.`;
        failures.push(message);
        addLogForTab(tab.id, "error", message);
        if (!recovered) {
          break;
        }
        if (!canContinueAfterOpenFailure()) {
          break;
        }
        continue;
      }

      consecutiveOpenFailures = 0;
      let applicationUrl =
        applicationTab.pendingUrl || applicationTab.url || "";
      try {
        const filteredApplication = await filterJobrightApplicationTabUrl(
          applicationTab.id,
          tab.id
        );
        applicationUrl = filteredApplication.url || applicationUrl;
        if (filteredApplication.filtered) {
          addLogForTab(
            tab.id,
            "info",
            `Optimized the application URL for ${jobLabel}.`
          );
        }
      } catch (error) {
        addLogForTab(
          tab.id,
          "info",
          `Application tab opened, but its URL could not be filtered for ${jobLabel}: ${
            error.message || "Unknown URL filtering error."
          }`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      let markedAlreadyApplied = false;
      try {
        const markResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: "MAIN",
          func: markJobrightApplicationAlreadyApplied,
          args: [jobId]
        });
        const marked = markResults?.[0]?.result;
        markedAlreadyApplied = Boolean(marked?.ok);

        if (!markedAlreadyApplied) {
          const message =
            marked?.error || `Could not mark ${jobLabel} as Already Applied.`;
          failures.push(message);
          addLogForTab(tab.id, "error", message);
        }
      } catch (error) {
        const message =
          error.message || `Could not mark ${jobLabel} as Already Applied.`;
        failures.push(message);
        addLogForTab(tab.id, "error", message);
      }

      openedJobs.push({
        jobId,
        tabId: applicationTab.id,
        url: applicationUrl,
        markedAlreadyApplied
      });
      openedInBatch += 1;
      addLogForTab(
        tab.id,
        "success",
        `Opened ${jobLabel} (${openedJobs.length} of ${count}) via ${openMethod}${
          markedAlreadyApplied ? " and marked it Already Applied" : ""
        }.`
      );

      if (openedJobs.length >= count) {
        continue;
      }

      if (openedInBatch >= batchSize) {
        const completedBatch = Math.floor(openedJobs.length / batchSize);
        addLogForTab(
          tab.id,
          "info",
          `Batch ${completedBatch} complete (${openedJobs.length} of ${count}). Starting the next batch.`
        );
        await chrome.tabs.update(tab.id, { active: true });
        openedInBatch = 0;
        // Let the list settle and the freshly opened tabs start loading before
        // driving Jobright again; back-to-back clicks are what stalled runs.
        await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
      } else {
        await new Promise((resolve) => setTimeout(resolve, openDelayMs));
      }
    }

    if (openedJobs.length === 0) {
      throw new Error(
        failures[0] ||
          "No eligible Jobright application recommendations were opened."
      );
    }

    const markedCount = openedJobs.filter(
      (job) => job.markedAlreadyApplied
    ).length;
    const message = `${openedJobs.length} of ${count} application tab${
      openedJobs.length === 1 ? "" : "s"
    } opened in the background; ${markedCount} marked Already Applied.`;
    showStatusForTab(tab.id, "success", message, "Opened:");
    addLogForTab(tab.id, "success", message);

    if (failures.length > 0) {
      addLogForTab(
        tab.id,
        "error",
        `${failures.length} Jobright step${failures.length === 1 ? "" : "s"} could not be completed.`
      );
    }
  } catch (error) {
    console.error(error);
    const rawMessage =
      error.message || "Could not process Jobright recommendations.";
    const message =
      /Cannot access contents|must request permission/i.test(rawMessage)
        ? "Jobright access is not active. Reload Application Opener in chrome://extensions, return to Jobright Recommendations, and click the extension icon once before Open."
        : rawMessage;
    showStatusForTab(ownerTabId, "error", message);
    addLogForTab(ownerTabId, "error", message);
  } finally {
    // Leave the page's window.open untouched so the user's own apply clicks
    // still open real tabs once the run is over.
    if (Number.isInteger(captureArmedTabId)) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: captureArmedTabId },
          world: "MAIN",
          func: disarmJobrightOpenCapture
        });
      } catch (_error) {
        // The capture disarms itself on a timer if the tab is already gone.
      }
    }

    isJobrightOpening = false;
    await refreshMakeResumeButtonAvailability();
  }
}

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
    normalized[3].includes("chatgpt") &&
    normalized[4].includes("job url") &&
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
function normalizeAiProviderId(value) {
  const providerId = String(value || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(AI_PROVIDER_LABELS, providerId)
    ? providerId
    : DEFAULT_AI_PROVIDER_ID;
}

function getAiProviderLabel(value) {
  return AI_PROVIDER_LABELS[normalizeAiProviderId(value)];
}

function getAiProviderUrlLabel(value) {
  return AI_PROVIDER_URL_LABELS[normalizeAiProviderId(value)];
}

function isContextDocAiProviderId(value) {
  return normalizeAiProviderId(value) === CONTEXT_DOC_AI_PROVIDER_ID;
}

function inferAiProviderIdFromUrl(url = "") {
  try {
    const hostname = new URL(String(url || "").trim()).hostname.toLowerCase();
    if (hostname === "chat.deepseek.com") {
      return "deepseek";
    }
    if (isGoogleDocsUrl(url)) {
      return CONTEXT_DOC_AI_PROVIDER_ID;
    }
  } catch (_error) {
    return DEFAULT_AI_PROVIDER_ID;
  }

  return DEFAULT_AI_PROVIDER_ID;
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

function isChatGptConversationUrl(url = "") {
  try {
    const parsed = new URL(String(url || "").trim());
    const hostname = parsed.hostname.toLowerCase();
    const isChatGptHost =
      hostname === "chatgpt.com" ||
      hostname.endsWith(".chatgpt.com") ||
      hostname === "chat.openai.com" ||
      hostname.endsWith(".chat.openai.com");
    return (
      isChatGptHost &&
      /^\/c\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/?$/i.test(
        parsed.pathname
      )
    );
  } catch (_error) {
    return false;
  }
}

function isAiConversationUrl(url = "", providerId = DEFAULT_AI_PROVIDER_ID) {
  const normalizedProviderId = normalizeAiProviderId(providerId);
  if (normalizedProviderId === "chatgpt") {
    return isChatGptConversationUrl(url);
  }

  if (normalizedProviderId === CONTEXT_DOC_AI_PROVIDER_ID) {
    return isGoogleDocsUrl(url);
  }

  try {
    const parsed = new URL(String(url || "").trim());
    return (
      normalizedProviderId === "deepseek" &&
      parsed.hostname.toLowerCase() === "chat.deepseek.com" &&
      /^\/a\/chat\/s\/[a-z0-9_-]{8,}\/?$/i.test(parsed.pathname)
    );
  } catch (_error) {
    return false;
  }
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

function getDroppedUrlText(dataTransfer) {
  const uriList = String(dataTransfer?.getData("text/uri-list") || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .join("\n");

  return uriList || String(dataTransfer?.getData("text/plain") || "").trim();
}

function appendDroppedUrls(dataTransfer) {
  if (!splitWindowUrlsInput) {
    return;
  }

  const droppedText = getDroppedUrlText(dataTransfer);
  if (!droppedText) {
    return;
  }

  const existingText = splitWindowUrlsInput.value.trim();
  splitWindowUrlsInput.value = [existingText, droppedText]
    .filter(Boolean)
    .join("\n");
  splitWindowUrlsInput.focus();
}

function getApplicationWorkspaceGptUrl(workspace) {
  if (!workspace) {
    return "";
  }

  const storedChatUrl = String(workspace.storedExchangeUrl || "").trim();
  const chatGptUrl = String(workspace.chatGptUrl || "").trim();

  // After Exchange, the GPT URL can be parked while another page is in the
  // main tab. Never fall back to the job URL; it has its own panel.
  return storedChatUrl || chatGptUrl;
}

async function resolveApplicationWorkspaceGptUrl(workspace) {
  const fallbackUrl = getApplicationWorkspaceGptUrl(workspace);
  if (!workspace || !Number.isInteger(workspace.chatGptTabId)) {
    return fallbackUrl;
  }

  try {
    const mainTab = await chrome.tabs.get(workspace.chatGptTabId);
    const mainUrlKey = getWorkspaceUrlComparisonKey(mainTab?.url);
    const seenUrls = new Set();
    const remainingUrl = [
      workspace.storedExchangeUrl,
      workspace.chatGptUrl
    ]
      .map((value) => String(value || "").trim())
      .find((candidate) => {
        if (!candidate) {
          return false;
        }
        const candidateKey = getWorkspaceUrlComparisonKey(candidate);
        if (!candidateKey || seenUrls.has(candidateKey)) {
          return false;
        }
        seenUrls.add(candidateKey);
        return candidateKey !== mainUrlKey;
      });

    if (remainingUrl) {
      return remainingUrl;
    }
  } catch (_error) {
    // Fall back to workspace-stored URLs when the tab is unavailable.
  }

  return fallbackUrl;
}

async function updateApplicationWorkspaceJobGptUrl() {
  if (!applicationWorkspaceJobGptLocation || !applicationWorkspaceJobGptUrl) {
    return;
  }

  const isApplicationWorkspace = !isSplitWindowsDialogOpen;
  const hasActiveWorkspace = hasActiveSaveWorkspaceForCurrentTab();
  const workspace = hasActiveWorkspace ? currentSaveWorkspace : null;
  const recordJobUrl = isApplicationWorkspace
    ? String(
        workspace?.recordJobUrl || currentEmptyWorkspaceUrls.job || ""
      ).trim()
    : "";

  if (
    applicationWorkspaceRecordJobLocation &&
    applicationWorkspaceRecordJobUrl
  ) {
    applicationWorkspaceRecordJobLocation.classList.toggle(
      "is-hidden",
      !isApplicationWorkspace
    );
    applicationWorkspaceRecordJobUrl.textContent = recordJobUrl;
    if (recordJobUrl) {
      applicationWorkspaceRecordJobUrl.title = recordJobUrl;
    } else {
      applicationWorkspaceRecordJobUrl.removeAttribute("title");
    }
  }

  // Keep the same Application workspace chrome with or without an active process.
  if (!isApplicationWorkspace) {
    applicationWorkspaceJobGptLocation.classList.add("is-hidden");
    applicationWorkspaceJobGptUrl.textContent = "";
    applicationWorkspaceJobGptUrl.removeAttribute("title");
    setPickupCloseButtonVisible(
      applicationWorkspaceJobGptClosePickupButton,
      false
    );
    if (applicationWorkspaceJobGptPickupButton) {
      applicationWorkspaceJobGptPickupButton.disabled = true;
    }
    if (applicationWorkspaceJobGptCopyButton) {
      applicationWorkspaceJobGptCopyButton.disabled = true;
    }
    if (applicationWorkspaceJobGptCopyContentButton) {
      applicationWorkspaceJobGptCopyContentButton.classList.add("is-hidden");
      applicationWorkspaceJobGptCopyContentButton.disabled = true;
    }
    setPickupCloseButtonVisible(
      applicationWorkspaceRecordJobClosePickupButton,
      false
    );
    if (applicationWorkspaceRecordJobPickupButton) {
      applicationWorkspaceRecordJobPickupButton.disabled = true;
    }
    if (applicationWorkspaceRecordJobCopyButton) {
      applicationWorkspaceRecordJobCopyButton.disabled = true;
    }
    if (applicationWorkspaceDeleteButton) {
      applicationWorkspaceDeleteButton.disabled = true;
    }
    updateApplicationWorkspaceAiSendControls();
    return;
  }

  const url = workspace
    ? await resolveApplicationWorkspaceGptUrl(workspace)
    : "";
  const actionsDisabled =
    Boolean(workspace?.isBusy) || areActionButtonsDisabled;
  const mainTabId = Number.isInteger(workspace?.chatGptTabId)
    ? workspace.chatGptTabId
    : activeTabId;
  let mainTabUrl = "";
  if (Number.isInteger(mainTabId)) {
    try {
      const mainTab = await chrome.tabs.get(mainTabId);
      mainTabUrl = String(mainTab?.url || "").trim();
    } catch (_error) {
      // Keep Pickup available when the main tab cannot be inspected.
    }
  }
  const mainTabUrlKey = getWorkspaceUrlComparisonKey(mainTabUrl);
  const isGptUrlInMainTab =
    Boolean(mainTabUrlKey) &&
    mainTabUrlKey === getWorkspaceUrlComparisonKey(url);

  applicationWorkspaceJobGptLocation.classList.remove("is-hidden");
  applicationWorkspaceJobGptUrl.textContent = url;
  if (url) {
    applicationWorkspaceJobGptUrl.title = url;
  } else {
    applicationWorkspaceJobGptUrl.removeAttribute("title");
  }
  const aiProviderId = workspace?.aiProviderId || inferAiProviderIdFromUrl(url);
  const aiProviderLabel =
    String(workspace?.aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(aiProviderId);
  if (applicationWorkspaceJobGptPickupButton) {
    const exactAiUrlAvailable =
      workspace?.hasExactAiUrl === true ||
      isAiConversationUrl(url, aiProviderId);
    applicationWorkspaceJobGptPickupButton.disabled =
      !url ||
      Boolean(workspace?.isBusy) ||
      (!exactAiUrlAvailable &&
        (areActionButtonsDisabled || isGptUrlInMainTab));
    applicationWorkspaceJobGptPickupButton.title = exactAiUrlAvailable
      ? isContextDocAiProviderId(aiProviderId)
        ? `Open the saved ${aiProviderLabel} in right-side window`
        : `Open exact ${aiProviderLabel} conversation URL in right-side window`
      : isGptUrlInMainTab
        ? `${aiProviderLabel} URL is already open in the main tab`
        : `Open ${aiProviderLabel} URL in right-side window`;
    applicationWorkspaceJobGptPickupButton.setAttribute(
      "aria-label",
      `Open ${aiProviderLabel} URL in a right-side window`
    );
  }
  if (applicationWorkspaceJobGptCopyButton) {
    applicationWorkspaceJobGptCopyButton.disabled = !url;
    applicationWorkspaceJobGptCopyButton.setAttribute(
      "aria-label",
      `Copy ${aiProviderLabel} URL to clipboard`
    );
  }
  if (applicationWorkspaceJobGptCopyContentButton) {
    const canCopyGoogleDocContent = isGoogleDocsUrl(url);
    applicationWorkspaceJobGptCopyContentButton.classList.toggle(
      "is-hidden",
      !canCopyGoogleDocContent
    );
    applicationWorkspaceJobGptCopyContentButton.disabled =
      !canCopyGoogleDocContent || actionsDisabled;
  }
  if (applicationWorkspaceRecordJobPickupButton) {
    applicationWorkspaceRecordJobPickupButton.disabled =
      !recordJobUrl || actionsDisabled;
    applicationWorkspaceRecordJobPickupButton.title =
      "Open Job URL in right-side window";
  }
  if (applicationWorkspaceRecordJobCopyButton) {
    applicationWorkspaceRecordJobCopyButton.disabled = !recordJobUrl;
  }
  if (applicationWorkspaceDeleteButton) {
    const canDeleteApplication = hasActiveWorkspace
      ? Boolean(workspace?.isReady)
      : Boolean(recordJobUrl);
    applicationWorkspaceDeleteButton.disabled =
      !canDeleteApplication || actionsDisabled;
  }
  updateApplicationWorkspaceAiSendControls();
  await updatePickupCloseButtons();
}

async function copyApplicationWorkspaceJobGptUrl() {
  const url = String(applicationWorkspaceJobGptUrl?.textContent || "").trim();
  if (!url) {
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      throw new Error("Clipboard access is unavailable.");
    }
    showStatus("success", url, "Copied:");
  } catch (error) {
    console.error(error);
    showStatus("error", error.message || "Could not copy the URL.");
  }
}

async function copyApplicationWorkspaceGoogleDocContent() {
  const documentUrl = String(
    applicationWorkspaceJobGptUrl?.textContent || ""
  ).trim();
  if (!isGoogleDocsUrl(documentUrl)) {
    return;
  }

  const ownerTabId = activeTabId;
  const runId = activeRunId || createRunId();
  if (applicationWorkspaceJobGptCopyContentButton) {
    applicationWorkspaceJobGptCopyContentButton.disabled = true;
  }

  try {
    showStatus("info", documentUrl, "Reading document:");
    const response = await chrome.runtime.sendMessage({
      type: "READ_GOOGLE_DOC_TEXT",
      runId,
      ownerTabId,
      documentUrl
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Could not read the Google Doc.");
    }

    const text = String(response.text || "");
    if (!text.trim()) {
      throw new Error("The Google Doc does not contain copyable text.");
    }
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard access is unavailable.");
    }

    await navigator.clipboard.writeText(text);
    const title = String(response.title || "Google Doc").trim() || "Google Doc";
    showStatus("success", title, "Copied document text:");
    addLogForTab(ownerTabId, "success", "Copied text from " + title + ".");
  } catch (error) {
    console.error(error);
    const message = error.message || "Could not copy the Google Doc text.";
    showStatusForTab(ownerTabId, "error", message);
    addLogForTab(ownerTabId, "error", message);
  } finally {
    const currentUrl = String(
      applicationWorkspaceJobGptUrl?.textContent || ""
    ).trim();
    if (applicationWorkspaceJobGptCopyContentButton) {
      const canCopyCurrentGoogleDocContent = isGoogleDocsUrl(currentUrl);
      applicationWorkspaceJobGptCopyContentButton.classList.toggle(
        "is-hidden",
        !canCopyCurrentGoogleDocContent
      );
      applicationWorkspaceJobGptCopyContentButton.disabled =
        !canCopyCurrentGoogleDocContent ||
        Boolean(currentSaveWorkspace?.isBusy) ||
        areActionButtonsDisabled;
    }
  }
}

async function copyApplicationWorkspaceRecordJobUrl() {
  const url = String(
    applicationWorkspaceRecordJobUrl?.textContent || ""
  ).trim();
  if (!url) {
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      throw new Error("Clipboard access is unavailable.");
    }
    showStatus("success", url, "Copied:");
  } catch (error) {
    console.error(error);
    showStatus("error", error.message || "Could not copy the URL.");
  }
}

function updateApplicationWorkspaceUrlControls() {
  const hasUrl = Boolean(applicationWorkspaceUrlInput?.value.trim());
  const hasActiveWorkspace = hasActiveSaveWorkspaceForCurrentTab();
  const showPickup = !isSplitWindowsDialogOpen;
  const resumeUrl = getApplicationWorkspaceResumePickupUrl();
  const pickupDisabled =
    !showPickup ||
    !resumeUrl ||
    Boolean(currentSaveWorkspace?.isBusy) ||
    areActionButtonsDisabled;

  if (applicationWorkspacePickupButton) {
    applicationWorkspacePickupButton.classList.toggle(
      "is-hidden",
      !showPickup
    );
    applicationWorkspacePickupButton.disabled = pickupDisabled;
  }
  if (!showPickup) {
    setPickupCloseButtonVisible(applicationWorkspaceClosePickupButton, false);
  }
  if (applicationWorkspaceNotesButton) {
    const showNotes = showPickup;
    applicationWorkspaceNotesButton.classList.toggle("is-hidden", !showNotes);
    applicationWorkspaceNotesButton.disabled =
      !showNotes || !hasActiveWorkspace || areActionButtonsDisabled;
  }
  if (applicationWorkspaceExportButton) {
    const showExport = showPickup;
    applicationWorkspaceExportButton.classList.toggle("is-hidden", !showExport);
    applicationWorkspaceExportButton.disabled =
      !showExport || areActionButtonsDisabled;
  }
  if (applicationWorkspaceCopyUrlButton) {
    applicationWorkspaceCopyUrlButton.disabled = !hasUrl;
  }
  updateApplicationWorkspaceJobGptUrl();
}

function setApplicationWorkspaceUrlInputValue(value) {
  if (applicationWorkspaceUrlInput) {
    applicationWorkspaceUrlInput.value = String(value || "").trim();
    applicationWorkspaceUrlInput.removeAttribute("aria-invalid");
  }
  updateApplicationWorkspaceUrlControls();
}

function setSplitWindowsPreview(rightUrl, options = {}) {
  const url = String(rightUrl || "").trim();
  const isPreviewing = Boolean(url);
  const unavailableTitle = String(options.unavailableTitle || "").trim();
  const isUnavailable = isPreviewing && Boolean(unavailableTitle);

  currentSplitWindowDownloadUrl = String(
    options.downloadUrl === undefined ? url : options.downloadUrl
  ).trim();
  splitWindowsModal?.classList.toggle("is-previewing", isPreviewing);
  splitWindowsInputView?.classList.toggle("is-hidden", isPreviewing);
  splitWindowsPreviewView?.classList.toggle("is-hidden", !isPreviewing);
  splitWindowsPreviewEmptyState?.classList.toggle("is-hidden", !isUnavailable);
  splitWindowsPreviewHelp?.classList.toggle("is-hidden", !isPreviewing);

  if (splitWindowsPreviewHelp) {
    splitWindowsPreviewHelp.textContent = String(
      options.helpText ||
        "Preview content is embedded in the side panel. Some sites may block embedded previews."
    );
  }
  if (splitWindowsModalTitle) {
    splitWindowsModalTitle.textContent = isPreviewing
      ? String(options.title || "Right URL")
      : "Open Tab + Sidebar";
  }

  if (splitWindowsPreviewUrl) {
    splitWindowsPreviewUrl.textContent = url;
    splitWindowsPreviewUrl.title = url;
  }
  setApplicationWorkspaceUrlInputValue(url);

  if (splitWindowsPreviewFrame) {
    const nextFrameUrl = isPreviewing && !isUnavailable ? url : "about:blank";
    splitWindowsPreviewFrame.classList.toggle(
      "is-hidden",
      !isPreviewing || isUnavailable
    );
    if (
      options.forceReload ||
      splitWindowsPreviewFrame.getAttribute("src") !== nextFrameUrl
    ) {
      splitWindowsPreviewFrame.src = nextFrameUrl;
    }
    splitWindowsPreviewFrame.title = String(
      options.frameTitle || "Sidebar URL preview"
    );
  }

  if (isUnavailable) {
    if (splitWindowsPreviewEmptyTitle) {
      splitWindowsPreviewEmptyTitle.textContent = unavailableTitle;
    }
    if (splitWindowsPreviewEmptyHelp) {
      splitWindowsPreviewEmptyHelp.textContent = String(
        options.unavailableHelp || "This page cannot be shown in the side panel."
      );
    }
  }
}

function setEmptyApplicationWorkspacePreview(activeTab) {
  const isResume = activeTab === "resume";
  const emptyTitle = isResume
    ? "No profile resume yet"
    : "No Information page yet";
  const emptyHelp = isResume
    ? "Use Save App to create the selected profile's resume copy."
    : "Use Save App to add the current Information page.";

  currentSplitWindowDownloadUrl = "";
  splitWindowsModal?.classList.add("is-previewing");
  splitWindowsInputView?.classList.add("is-hidden");
  splitWindowsPreviewView?.classList.remove("is-hidden");
  splitWindowsPreviewHelp?.classList.add("is-hidden");

  if (splitWindowsModalTitle) {
    splitWindowsModalTitle.textContent = "Application workspace";
  }
  if (splitWindowsPreviewUrl) {
    splitWindowsPreviewUrl.textContent = emptyTitle;
    splitWindowsPreviewUrl.title = "";
  }
  setApplicationWorkspaceUrlInputValue("");
  if (splitWindowsPreviewFrame) {
    splitWindowsPreviewFrame.classList.add("is-hidden");
    if (splitWindowsPreviewFrame.getAttribute("src") !== "about:blank") {
      splitWindowsPreviewFrame.src = "about:blank";
    }
  }
  if (splitWindowsPreviewEmptyTitle) {
    splitWindowsPreviewEmptyTitle.textContent = emptyTitle;
  }
  if (splitWindowsPreviewEmptyHelp) {
    splitWindowsPreviewEmptyHelp.textContent = emptyHelp;
  }
  splitWindowsPreviewEmptyState?.classList.remove("is-hidden");
}


function renderApplicationWorkspaceProfileNote(workspace, activeTab) {
  const shouldShow =
    currentSplitWindowSessionType === "make-resume" &&
    Boolean(workspace) &&
    activeTab === "job";
  splitWindowsPreviewView?.classList.toggle(
    "has-profile-note",
    shouldShow
  );

  applicationWorkspaceProfileNote?.classList.toggle("is-hidden", !shouldShow);
  if (!shouldShow) {
    return;
  }

  const profileName = String(workspace.profileName || DEFAULT_PROFILE_NAME).trim();
  const savedProfile = getProfileByName(profileName);
  const profileNotes = String(
    savedProfile?.notes ?? workspace.profileNotes ?? ""
  ).trim();
  const profileWasFound = Boolean(savedProfile) || workspace.profileFound !== false;
  if (applicationWorkspaceProfileNoteTitle) {
    applicationWorkspaceProfileNoteTitle.textContent = `Profile note - ${profileName}`;
  }
  if (applicationWorkspaceProfileNoteText) {
    applicationWorkspaceProfileNoteText.textContent =
      profileNotes ||
      (!profileWasFound
        ? "No saved profile matched this name."
        : "No notes have been saved for this profile.");
  }
}
function getApplicationWorkspaceTitle(workspace = currentSaveWorkspace) {
  const profileName = String(workspace?.profileName || "").trim();
  return profileName || "Application workspace";
}

function setSaveWorkspaceTab(activeTab, { forceReload = false } = {}) {
  const isResume = activeTab === "resume";
  const normalizedTab = isResume ? "resume" : "job";
  const hasActiveWorkspace = hasActiveSaveWorkspaceForCurrentTab();

  if (hasActiveWorkspace) {
    currentSaveWorkspace.activeTab = normalizedTab;
  } else {
    currentEmptyWorkspaceTab = normalizedTab;
  }

  splitWindowsJobTabButton?.classList.toggle("is-active", !isResume);
  splitWindowsJobTabButton?.setAttribute(
    "aria-selected",
    String(!isResume)
  );
  if (splitWindowsJobTabButton) {
    splitWindowsJobTabButton.tabIndex = isResume ? -1 : 0;
    const label = splitWindowsJobTabButton.querySelector("span");
    if (label) {
      label.textContent = "Information page";
    }
  }

  splitWindowsResumeTabButton?.classList.toggle("is-active", isResume);
  splitWindowsResumeTabButton?.setAttribute(
    "aria-selected",
    String(isResume)
  );
  if (splitWindowsResumeTabButton) {
    splitWindowsResumeTabButton.tabIndex = isResume ? 0 : -1;
  }

  splitWindowsPreviewTabs?.classList.remove("is-hidden");
  const resumeTabLabel = splitWindowsResumeTabButton?.querySelector("span");
  if (resumeTabLabel) {
    resumeTabLabel.textContent = hasActiveWorkspace
      ? `${currentSaveWorkspace.profileName} resume`
      : "Profile resume";
  }

  if (hasActiveWorkspace) {
    const previewUrl = isResume
      ? currentSaveWorkspace.resumeUrl
      : currentSaveWorkspace.jobUrl;
    const isConversationPreview = !isResume && isSupportedAiUrl(previewUrl);

    setSplitWindowsPreview(previewUrl, {
      title: getApplicationWorkspaceTitle(currentSaveWorkspace),
      frameTitle: isResume
        ? `${currentSaveWorkspace.profileName} resume`
        : currentSaveWorkspace.jobTitle,
      downloadUrl: currentSaveWorkspace.resumeUrl,
      forceReload,
      unavailableTitle: isConversationPreview
        ? "Conversation preview unavailable"
        : "",
      unavailableHelp: isConversationPreview
        ? "AI conversations cannot be displayed inside the extension. Use Exchange to open this conversation in the main tab."
        : "",
      helpText: isResume
        ? "The profile resume is embedded in the side panel."
        : "If this page is blank, the website blocks embedded viewing. Use Exchange to open it in the main tab."
    });
  } else {
    const emptyWorkspaceUrl = currentEmptyWorkspaceUrls[normalizedTab];
    if (emptyWorkspaceUrl) {
      setSplitWindowsPreview(emptyWorkspaceUrl, {
        title: "Application workspace",
        frameTitle: isResume ? "Profile resume" : "Information page",
        downloadUrl: currentEmptyWorkspaceUrls.resume,
        forceReload
      });
    } else {
      setEmptyApplicationWorkspacePreview(normalizedTab);
    }
  }

  renderApplicationWorkspaceProfileNote(
    hasActiveWorkspace ? currentSaveWorkspace : null,
    normalizedTab
  );

  updateSaveWorkspaceActions();
  schedulePersistTabSession();
}


function showBlockedInformationPagePreview() {
  if (
    !hasActiveSaveWorkspaceForCurrentTab() ||
    currentSaveWorkspace.activeTab !== "job"
  ) {
    return;
  }

  const previewUrl = String(currentSaveWorkspace.jobUrl || "").trim();
  if (!previewUrl || isSupportedAiUrl(previewUrl)) {
    return;
  }

  setSplitWindowsPreview(previewUrl, {
    title: getApplicationWorkspaceTitle(currentSaveWorkspace),
    frameTitle: currentSaveWorkspace.jobTitle,
    downloadUrl: currentSaveWorkspace.resumeUrl,
    unavailableTitle: "Information page preview unavailable",
    unavailableHelp:
      "This website did not allow its page to load inside the extension. Use Exchange to open it in the main tab.",
    helpText:
      "The website blocked embedded viewing. Use Exchange to open it in the main tab."
  });
  renderApplicationWorkspaceProfileNote(currentSaveWorkspace, "job");
}
function getActiveApplicationWorkspaceTab() {
  return hasActiveSaveWorkspaceForCurrentTab()
    ? currentSaveWorkspace.activeTab
    : currentEmptyWorkspaceTab;
}

function setActiveApplicationWorkspaceUrl(activeTab, url) {
  const normalizedTab = activeTab === "resume" ? "resume" : "job";
  if (hasActiveSaveWorkspaceForCurrentTab()) {
    if (normalizedTab === "resume") {
      currentSaveWorkspace.resumeUrl = url;
    } else {
      currentSaveWorkspace.jobUrl = url;
    }
    return;
  }

  currentEmptyWorkspaceUrls[normalizedTab] = url;
}

function refreshApplicationWorkspacePreview() {
  if (isSplitWindowsDialogOpen || !applicationWorkspaceUrlInput) {
    return;
  }

  const activeTab = getActiveApplicationWorkspaceTab();
  const rawUrl = applicationWorkspaceUrlInput.value.trim();

  if (!rawUrl) {
    setActiveApplicationWorkspaceUrl(activeTab, "");
    setSaveWorkspaceTab(activeTab, { forceReload: true });
    showStatus(
      "success",
      activeTab === "resume"
        ? "Profile resume URL cleared."
        : "Information page URL cleared.",
      "Cleared:"
    );
    return;
  }

  try {
    const normalizedUrl = normalizeSplitWindowUrl(rawUrl, "Preview");
    setActiveApplicationWorkspaceUrl(activeTab, normalizedUrl);
    setSaveWorkspaceTab(activeTab, { forceReload: true });
    showStatus("success", normalizedUrl, "Previewing:");
  } catch (error) {
    applicationWorkspaceUrlInput.setAttribute("aria-invalid", "true");
    applicationWorkspaceUrlInput.focus();
    showStatus("error", error.message || "Enter a valid URL.");
  }
}

async function copyApplicationWorkspaceUrl() {
  const url = String(applicationWorkspaceUrlInput?.value || "").trim();
  if (!url) {
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      applicationWorkspaceUrlInput.focus();
      applicationWorkspaceUrlInput.select();
      if (!document.execCommand("copy")) {
        throw new Error("Clipboard access is unavailable.");
      }
      applicationWorkspaceUrlInput.setSelectionRange(url.length, url.length);
    }
    showStatus("success", url, "Copied:");
  } catch (error) {
    console.error(error);
    showStatus("error", error.message || "Could not copy the URL.");
  }
}

function updateSaveWorkspaceActions() {
  const isApplicationWorkspace = !isSplitWindowsDialogOpen;
  const hasActiveWorkspace = hasActiveSaveWorkspaceForCurrentTab();
  const showWorkspaceActions = isApplicationWorkspace;
  const actionsDisabled =
    !hasActiveWorkspace ||
    !currentSaveWorkspace?.isReady ||
    currentSaveWorkspace?.isBusy ||
    areActionButtonsDisabled;

  splitWindowsBatchActions?.classList.toggle(
    "is-hidden",
    isApplicationWorkspace
  );
  saveWorkspaceActions?.classList.toggle("is-hidden", !showWorkspaceActions);

  if (saveWorkspaceBuildButton) {
    // Temporarily disabled in Application workspace.
    saveWorkspaceBuildButton.disabled = true;
    saveWorkspaceBuildButton.title = "Build resume is temporarily unavailable.";
  }
  if (saveWorkspaceDownloadButton) {
    saveWorkspaceDownloadButton.disabled = actionsDisabled;
  }
  updateApplicationWorkspaceUrlControls();
  updateWorkspacePromptInfoButtons();
}

function showSaveWorkspacePreview({
  runId = null,
  batchIndex = 0,
  batchCount = 1,
  jobTitle = "Job page",
  jobUrl = "",
  recordJobUrl = "",
  profileName = DEFAULT_PROFILE_NAME,
  resumeUrl = "",
  profileNotes = "",
  profileFound = true,
  aiProviderId = "",
  aiProviderLabel = "",
  hasExactAiUrl = false,
  chatGptTabId = null,
  chatGptUrl = "",
  isReady = false,
  sessionType = "save-workspace"
} = {}) {
  if (!jobUrl || !resumeUrl || !Number.isInteger(chatGptTabId)) {
    return;
  }

  const normalizedSessionType =
    sessionType === "make-resume" ? "make-resume" : "save-workspace";
  const normalizedChatGptUrl = String(chatGptUrl || "").trim();
  const normalizedAiProviderId = normalizeAiProviderId(
    aiProviderId || inferAiProviderIdFromUrl(normalizedChatGptUrl)
  );
  const normalizedAiProviderLabel =
    String(aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(normalizedAiProviderId);
  const exactAiUrlAvailable =
    Boolean(hasExactAiUrl) ||
    isAiConversationUrl(normalizedChatGptUrl, normalizedAiProviderId);
  const workspace = {
    runId,
    sessionType: normalizedSessionType,
    jobTitle: String(jobTitle || "Job page").trim() || "Job page",
    jobUrl: String(jobUrl).trim(),
    recordJobUrl: String(recordJobUrl || jobUrl).trim(),
    profileName:
      String(profileName || DEFAULT_PROFILE_NAME).trim() || DEFAULT_PROFILE_NAME,
    resumeUrl: String(resumeUrl).trim(),
    profileNotes: String(profileNotes || "").trim(),
    profileFound: profileFound !== false,
    aiProviderId: normalizedAiProviderId,
    aiProviderLabel: normalizedAiProviderLabel,
    hasExactAiUrl: exactAiUrlAvailable,
    chatGptTabId,
    chatGptUrl: normalizedChatGptUrl,
    storedExchangeUrl:
      normalizedSessionType === "make-resume" ? normalizedChatGptUrl : "",
    activeTab: "resume",
    isReady: Boolean(isReady),
    isBusy: false,
    isSendingText: false,
    sendTextDraft: "",
    batchIndex: Number(batchIndex) || 0,
    batchCount: Math.max(1, Number(batchCount) || 1)
  };
  saveWorkspacesByTabId.set(chatGptTabId, workspace);

  // The workspace belongs to its own tab; only take over the panel when the
  // user is actually looking at that tab.
  const workspaceTabState = getTabState(chatGptTabId);
  if (workspaceTabState) {
    workspaceTabState.splitWindowSessionType = normalizedSessionType;
    workspaceTabState.isSplitWindowsDialogOpen = false;
    workspaceTabState.saveWorkspaceSidePanelView = "workspace";
  }

  schedulePersistTabSession();

  if (chatGptTabId !== activeTabId) {
    return;
  }

  isSplitWindowsDialogOpen = false;
  currentSplitWindowSessionType = normalizedSessionType;
  currentSaveWorkspaceSidePanelView = "workspace";
  syncCurrentSaveWorkspace();

  splitWindowsPreviewTabs?.classList.remove("is-hidden");
  const resumeTabLabel = splitWindowsResumeTabButton?.querySelector("span");
  if (resumeTabLabel) {
    resumeTabLabel.textContent = `${workspace.profileName} resume`;
  }

  setSaveWorkspaceTab("resume");
  renderSaveWorkspaceSidePanelView();
}

function updateSaveWorkspaceAiUrl({
  chatGptUrl = "",
  chatGptTabId = null,
  aiProviderId = "",
  aiProviderLabel = "",
  hasExactAiUrl = false
} = {}) {
  const workspace = saveWorkspacesByTabId.get(chatGptTabId);
  if (!workspace || workspace.sessionType !== "save-workspace") {
    return false;
  }

  workspace.chatGptUrl = String(chatGptUrl || "").trim();
  workspace.aiProviderId = normalizeAiProviderId(
    aiProviderId || workspace.aiProviderId
  );
  workspace.aiProviderLabel =
    String(aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(workspace.aiProviderId);
  workspace.hasExactAiUrl = Boolean(hasExactAiUrl);
  if (currentSaveWorkspace === workspace) {
    updateSaveWorkspaceActions();
  }
  schedulePersistTabSession();
  return true;
}

function markSaveWorkspaceReady({
  chatGptUrl = "",
  chatGptTabId = null,
  aiProviderId = "",
  aiProviderLabel = "",
  hasExactAiUrl = false
} = {}) {
  const workspace = saveWorkspacesByTabId.get(chatGptTabId);
  if (!workspace || workspace.sessionType !== "save-workspace") {
    return false;
  }

  workspace.chatGptUrl = String(chatGptUrl || "").trim();
  workspace.aiProviderId = normalizeAiProviderId(
    aiProviderId || workspace.aiProviderId
  );
  workspace.aiProviderLabel =
    String(aiProviderLabel || "").trim() ||
    getAiProviderUrlLabel(workspace.aiProviderId);
  workspace.hasExactAiUrl = Boolean(hasExactAiUrl);
  workspace.isReady = true;
  // activateSaveWorkspaceTab() bails out on several paths, so the ready state
  // has to reach the buttons here rather than relying on it.
  if (currentSaveWorkspace === workspace) {
    updateSaveWorkspaceActions();
  }
  schedulePersistTabSession();
  return true;
}


function setApplicationWorkspaceTab(activeTab) {
  return setSaveWorkspaceTab(activeTab);
}

async function requestOpenUrlInNewTab(
  url,
  runId = activeRunId,
  ownerTabId = activeTabId
) {
  const response = await chrome.runtime.sendMessage({
    type: "OPEN_URL_IN_NEW_TAB",
    runId,
    ownerTabId,
    url
  });

  if (!response?.ok) {
    throw new Error(response?.error || "Could not open the URL in a new tab.");
  }

  return response;
}

function showMakeResumeApplicationWorkspaces(openedPairs, returnTabId, runId) {
  if (!Array.isArray(openedPairs) || openedPairs.length === 0) {
    return false;
  }

  currentSplitWindowPairs = openedPairs;
  currentSplitWindowReturnTabId = returnTabId;

  openedPairs.forEach((pair, index) => {
    registerRunTab(runId, pair.tabId);
    showSaveWorkspacePreview({
      runId,
      batchIndex: index,
      batchCount: openedPairs.length,
      jobTitle:
        String(pair.jobTitle || "").trim() || `Information page ${index + 1}`,
      jobUrl: pair.chatUrl || pair.jobUrl,
      aiProviderId: pair.chatUrl ? inferAiProviderIdFromUrl(pair.chatUrl) : "none",
      aiProviderLabel: pair.chatUrl ? "" : "Job page",
      recordJobUrl: pair.jobUrl,
      profileName: pair.profileName,
      profileNotes: pair.profileNotes,
      profileFound: pair.profileFound,
      resumeUrl: pair.resumeUrl,
      chatGptTabId: pair.tabId,
      chatGptUrl: pair.chatUrl,
      isReady: true,
      sessionType: "make-resume"
    });

    // Every tab in the batch can close the whole batch, so each one needs the
    // full pair list.
    const tabState = getTabState(pair.tabId);
    if (tabState) {
      tabState.splitWindowPairs = openedPairs;
      tabState.splitWindowReturnTabId = returnTabId;
    }
  });

  // Opening job tabs with active:true flips the panel onto those tabs and clears
  // the paste-dialog flag before we get here, so never gate registration on it.
  // Close the input dialog on the sheet/return tab so coming back does not
  // reopen the paste form, then force the Application workspace onto the tab
  // Chrome left active (or the last opened tab).
  if (Number.isInteger(returnTabId)) {
    const returnState = getTabState(returnTabId);
    if (returnState) {
      returnState.isSplitWindowsDialogOpen = false;
      returnState.splitWindowsDraft = "";
    }
  }

  splitWindowsDraft = "";
  if (splitWindowUrlsInput) {
    splitWindowUrlsInput.value = "";
  }

  const focusTabId = openedPairs.some((pair) => pair.tabId === activeTabId)
    ? activeTabId
    : openedPairs[openedPairs.length - 1]?.tabId;

  if (Number.isInteger(focusTabId)) {
    activateSaveWorkspaceTab(focusTabId);
  }

  return true;
}

async function openSplitWindows() {

  if (splitWindowsModalOpenButton?.disabled) {
    return;
  }

  let batch;
  try {
    batch = parseSplitWindowUrls(splitWindowUrlsInput?.value);
  } catch (error) {
    const message =
      error.message || "Add valid Profile, Chat, Job, and Google Doc entries.";
    showStatus("error", message);
    addLog("error", message);
    splitWindowUrlsInput?.focus();
    return;
  }

  const { ownerTabId, runId } = beginRunForActiveTab();
  clearStatus();
  clearDeletedRowsForTab(ownerTabId);
  beginButtonProcessForTab(
    ownerTabId,
    "Make a resume clicked. Checking for an open Google Sheet..."
  );

  const openedPairs = [];
  let returnTabId = null;

  try {
    await requireOpenGoogleSheet();
    addLogForTab(
      ownerTabId,
      "info",
      `Google Sheet found. Opening ${batch.pairs.length} job/resume workspace${
        batch.pairs.length === 1 ? "" : "s"
      }...`
    );

    for (const [index, pair] of batch.pairs.entries()) {
      const savedProfile = getProfileByName(pair.profileName);
      const profileName = String(
        savedProfile?.name || pair.profileName || DEFAULT_PROFILE_NAME
      ).trim();
      const profileNotes = String(savedProfile?.notes || "").trim();
      const profileFound = Boolean(savedProfile);

      if (!profileFound) {
        addLogForTab(
          ownerTabId,
          "info",
          `No saved profile matched "${pair.profileName}"; no profile note will be shown.`
        );
      }
      addLogForTab(
        ownerTabId,
        "info",
        `Opening job ${index + 1} of ${batch.pairs.length}: ${pair.jobUrl}`
      );
      const response = await requestOpenUrlInNewTab(pair.jobUrl, runId, ownerTabId);

      if (returnTabId === null && Number.isInteger(response.returnTabId)) {
        returnTabId = response.returnTabId;
      }

      openedPairs.push({
        tabId: response.tabId,
        chatUrl: pair.chatUrl,
        jobUrl: pair.jobUrl,
        resumeUrl: pair.resumeUrl,
        jobTitle: pair.jobTitle,
        profileName,
        profileNotes,
        profileFound,
        activeTab: "resume"
      });
    }

    const didOpenApplicationWorkspace = showMakeResumeApplicationWorkspaces(
      openedPairs,
      returnTabId ?? ownerTabId,
      runId
    );

    showStatusForTab(
      ownerTabId,
      "success",
      didOpenApplicationWorkspace
        ? `Opened ${openedPairs.length} job tab${
            openedPairs.length === 1 ? "" : "s"
          }. Switch among them to load each Application workspace.`
        : `Opened ${openedPairs.length} job tab${
            openedPairs.length === 1 ? "" : "s"
          }.`,
      "Opened:"
    );
    addLogForTab(
      ownerTabId,
      "success",
      didOpenApplicationWorkspace
        ? `${openedPairs.length} job/resume workspace${
            openedPairs.length === 1 ? "" : "s"
          } opened successfully.`
        : "Job tabs opened, but no Application workspaces were registered."
    );

  } catch (error) {
    if (openedPairs.length > 0) {
      showMakeResumeApplicationWorkspaces(
        openedPairs,
        returnTabId ?? ownerTabId,
        runId
      );
    }

    console.error(error);
    showStatusForTab(
      ownerTabId,
      "error",
      error.message || "Something went wrong."
    );
    addLogForTab(ownerTabId, "error", error.message || "Something went wrong.");
  } finally {
    finishButtonProcessForTab(ownerTabId);
  }
}

async function closeSplitWindowsAndReturn() {
  if (hasSaveWorkspaceSession() && !isSplitWindowsDialogOpen) {
    setSaveWorkspaceSidePanelView("home");
    return;
  }


  if (splitWindowsPreviewBackButton?.disabled) {
    return;
  }

  if (
    currentSplitWindowPairs.length === 0 ||
    !Number.isInteger(currentSplitWindowReturnTabId)
  ) {
    const message = "Could not identify the tabs needed to return.";
    showStatus("error", message);
    addLog("error", message);
    return;
  }

  const { ownerTabId, runId } = beginRunForActiveTab();
  clearStatus();
  clearDeletedRowsForTab(ownerTabId);
  beginButtonProcessForTab(
    ownerTabId,
    "Back clicked. Closing the created tabs and returning..."
  );

  try {
    const response = await chrome.runtime.sendMessage({
      type: "CLOSE_TABS_AND_RETURN",
      runId,
      ownerTabId,
      openedTabIds: currentSplitWindowPairs.map((pair) => pair.tabId),
      returnTabId: currentSplitWindowReturnTabId
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Could not return to the previous tab.");
    }

    setSplitWindowsModalOpen(false);
    showStatusForTab(
      ownerTabId,
      "success",
      response.url || "Previous tab restored.",
      "Returned:"
    );
    addLogForTab(
      ownerTabId,
      "success",
      response.message || "Previous tab restored."
    );
  } catch (error) {
    console.error(error);
    showStatusForTab(
      ownerTabId,
      "error",
      error.message || "Something went wrong."
    );
    addLogForTab(ownerTabId, "error", error.message || "Something went wrong.");
  } finally {
    finishButtonProcessForTab(ownerTabId);
  }
}

saveButton?.addEventListener("click", saveCurrentTabUrlFromClick);
openSplitWindowsButton?.addEventListener("click", openSplitWindowsModal);
openJobrightJobsButton?.addEventListener("click", openJobrightJobs);

Object.entries(actionSettingsDialogs).forEach(([action, dialog]) => {
  dialog.trigger?.addEventListener("click", () =>
    setActionSettingsModalOpen(action, true)
  );
  dialog.backdrop?.addEventListener("click", () =>
    setActionSettingsModalOpen(action, false)
  );
  dialog.closeButton?.addEventListener("click", () =>
    setActionSettingsModalOpen(action, false)
  );
  dialog.doneButton?.addEventListener("click", async () => {
    if (action === "checkPosting") {
      const saved = await saveCheckPostingSettings();
      if (!saved) {
        return;
      }
    }
    setActionSettingsModalOpen(action, false);
  });
  dialog.assignButton?.addEventListener("click", openChromeShortcutSettings);
});

saveOptionsButton?.addEventListener("click", () => setConfigModalOpen(true));
saveAssignHotkeyButton?.addEventListener("click", openChromeShortcutSettings);

makeResumeCurrentSettingsButton?.addEventListener("click", () => {
  setActionSettingsModalOpen("makeResume", false, { returnFocus: false });
  openSplitWindowsModal();
});

window.addEventListener("focus", refreshActionHotkeys);
jobrightOpenCountInput?.addEventListener("change", normalizeJobrightOpenCount);

splitWindowsModalBackdrop?.addEventListener(
  "click",
  handleSplitWindowsHeaderAction
);
splitWindowsModalCloseButton?.addEventListener(
  "click",
  handleSplitWindowsHeaderAction
);
homeWorkspaceExchangeButton?.addEventListener("click", () =>
  exchangeSaveWorkspaceSidePanelView()
);
homeCancelProcessButton?.addEventListener("click", cancelSavePostProcess);
applicationCancelProcessButton?.addEventListener(
  "click",
  cancelSavePostProcess
);
splitWindowsModalCancelButton?.addEventListener("click", () => setSplitWindowsModalOpen(false));
splitWindowsModalOpenButton?.addEventListener("click", openSplitWindows);
splitWindowsPreviewBackButton?.addEventListener("click", closeSplitWindowsAndReturn);
splitWindowsPreviewDownloadButton?.addEventListener("click", downloadSplitWindowResume);
splitWindowsJobTabButton?.addEventListener("click", () =>
  setApplicationWorkspaceTab("profile")
);
splitWindowsResumeTabButton?.addEventListener("click", () =>
  setApplicationWorkspaceTab("resume")
);
splitWindowsPreviewFrame?.addEventListener(
  "error",
  showBlockedInformationPagePreview
);
applicationWorkspaceRefreshButton?.addEventListener(
  "click",
  refreshApplicationWorkspacePreview
);
applicationWorkspacePickupButton?.addEventListener(
  "click",
  pickupApplicationWorkspaceResumeUrl
);
applicationWorkspaceClosePickupButton?.addEventListener(
  "click",
  closeApplicationWorkspaceResumePickupWindow
);
applicationWorkspaceNotesButton?.addEventListener(
  "click",
  openApplicationWorkspaceNotesModal
);
applicationWorkspacePromptInfoButton?.addEventListener(
  "click",
  openWorkspacePromptInfoModal
);
homeWorkspacePromptInfoButton?.addEventListener(
  "click",
  openWorkspacePromptInfoModal
);
applicationWorkspaceCopyUrlButton?.addEventListener(
  "click",
  copyApplicationWorkspaceUrl
);
applicationWorkspaceJobGptPickupButton?.addEventListener(
  "click",
  pickupApplicationWorkspaceJobGptUrl
);
applicationWorkspaceAiSendInput?.addEventListener(
  "input",
  updateApplicationWorkspaceAiSendDraft
);
applicationWorkspaceAiSendButton?.addEventListener(
  "click",
  sendApplicationWorkspaceTextToPickedUpAiTab
);
applicationWorkspaceJobGptClosePickupButton?.addEventListener(
  "click",
  closeApplicationWorkspaceJobGptPickupWindow
);
applicationWorkspaceJobGptCopyButton?.addEventListener(
  "click",
  copyApplicationWorkspaceJobGptUrl
);
applicationWorkspaceJobGptCopyContentButton?.addEventListener(
  "click",
  copyApplicationWorkspaceGoogleDocContent
);
applicationWorkspaceRecordJobPickupButton?.addEventListener(
  "click",
  pickupApplicationWorkspaceRecordJobUrl
);
applicationWorkspaceRecordJobClosePickupButton?.addEventListener(
  "click",
  closeApplicationWorkspaceRecordJobPickupWindow
);
applicationWorkspaceRecordJobCopyButton?.addEventListener(
  "click",
  copyApplicationWorkspaceRecordJobUrl
);
applicationWorkspaceDeleteButton?.addEventListener(
  "click",
  requestDeleteApplicationWorkspace
);
deleteApplicationModalBackdrop?.addEventListener("click", () =>
  setDeleteApplicationModalOpen(false)
);
deleteApplicationModalCloseButton?.addEventListener("click", () =>
  setDeleteApplicationModalOpen(false)
);
deleteApplicationModalCancelButton?.addEventListener("click", () =>
  setDeleteApplicationModalOpen(false)
);
deleteApplicationModalConfirmButton?.addEventListener(
  "click",
  confirmDeleteApplication
);
applicationWorkspaceUrlInput?.addEventListener("input", () => {
  applicationWorkspaceUrlInput.removeAttribute("aria-invalid");
  updateApplicationWorkspaceUrlControls();
});
applicationWorkspaceUrlInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    refreshApplicationWorkspacePreview();
  }
});
saveWorkspaceBuildButton?.addEventListener(
  "click",
  openBuildResumeContextModal
);
saveWorkspaceDownloadButton?.addEventListener(
  "click",
  downloadSaveWorkspaceResume
);
buildResumeContextModalBackdrop?.addEventListener("click", () =>
  setBuildResumeContextModalOpen(false)
);
buildResumeContextModalCloseButton?.addEventListener("click", () =>
  setBuildResumeContextModalOpen(false)
);
buildResumeContextCancelButton?.addEventListener("click", () =>
  setBuildResumeContextModalOpen(false)
);
buildResumeContextSubmitButton?.addEventListener(
  "click",
  submitBuildResumeContext
);
buildResumeContextInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    submitBuildResumeContext();
  }
});
splitWindowUrlsInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    openSplitWindows();
  }
});
splitWindowUrlsInput?.addEventListener("dragenter", (event) => {
  event.preventDefault();
  splitWindowUrlsInput.classList.add("is-drag-over");
});
splitWindowUrlsInput?.addEventListener("dragover", (event) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
  splitWindowUrlsInput.classList.add("is-drag-over");
});
splitWindowUrlsInput?.addEventListener("dragleave", () => {
  splitWindowUrlsInput.classList.remove("is-drag-over");
});
splitWindowUrlsInput?.addEventListener("drop", (event) => {
  event.preventDefault();
  splitWindowUrlsInput.classList.remove("is-drag-over");
  appendDroppedUrls(event.dataTransfer);
});

addProfileButton?.addEventListener("click", openAddProfileModal);
profileFormModalBackdrop?.addEventListener("click", () => setProfileFormModalOpen(false));
profileFormModalCloseButton?.addEventListener("click", () => setProfileFormModalOpen(false));
profileFormModalCancelButton?.addEventListener("click", () => setProfileFormModalOpen(false));
profileFormModalSubmitButton?.addEventListener("click", submitProfileForm);

profileNotesModalBackdrop?.addEventListener("click", () => setProfileNotesModalOpen(false));
profileNotesModalCloseButton?.addEventListener("click", () => setProfileNotesModalOpen(false));
profileNotesModalCancelButton?.addEventListener("click", () => setProfileNotesModalOpen(false));
profileNotesModalSubmitButton?.addEventListener("click", submitProfileNotesForm);

profileResumeSettingsModalBackdrop?.addEventListener("click", () =>
  setProfileResumeSettingsModalOpen(false)
);
profileResumeSettingsModalCloseButton?.addEventListener("click", () =>
  setProfileResumeSettingsModalOpen(false)
);
profileResumeSettingsDoneButton?.addEventListener("click", () =>
  setProfileResumeSettingsModalOpen(false)
);
profileResumeSettingsAddButton?.addEventListener("click", openAddPromptResumeModal);


exportAppDataIconButton?.addEventListener("click", openExportAppDataModal);
applicationWorkspaceExportButton?.addEventListener(
  "click",
  openExportAppDataModal
);
exportAppDataModalBackdrop?.addEventListener("click", () =>
  setExportAppDataModalOpen(false)
);
exportAppDataModalCloseButton?.addEventListener("click", () =>
  setExportAppDataModalOpen(false)
);
exportAppDataModalCancelButton?.addEventListener("click", () =>
  setExportAppDataModalOpen(false)
);
exportAppDataModalConfirmButton?.addEventListener("click", exportAppData);

homeWorkspaceImportButton?.addEventListener("click", openImportAppDataModal);
applicationWorkspaceImportButton?.addEventListener(
  "click",
  openImportAppDataModal
);
importAppDataModalBackdrop?.addEventListener("click", () =>
  setImportAppDataModalOpen(false)
);
importAppDataModalCloseButton?.addEventListener("click", () =>
  setImportAppDataModalOpen(false)
);
importAppDataModalCancelButton?.addEventListener("click", () =>
  setImportAppDataModalOpen(false)
);
importAppDataModalConfirmButton?.addEventListener(
  "click",
  confirmImportAppDataModal
);
importAppDataFileInput?.addEventListener("change", () => {
  const file = importAppDataFileInput.files?.[0];
  importAppDataFromFile(file);
});

configModalBackdrop?.addEventListener("click", () => setConfigModalOpen(false));
configModalCloseButton?.addEventListener("click", () => setConfigModalOpen(false));
configModalCancelButton?.addEventListener("click", () => setConfigModalOpen(false));

saveConfigButton?.addEventListener("click", saveSheetConfig);
aiProviderInput?.addEventListener("change", syncSaveModeUi);
openGoogleSheetButton?.addEventListener("click", openConfiguredGoogleSheet);
checkPostingButton?.addEventListener("click", checkCurrentPosting);
playButton?.addEventListener("click", playRightmostPosting);
playPostingAssignHotkeyButton?.addEventListener("click", openChromeShortcutSettings);
makeOrOpenAiTabButton?.addEventListener("click", makeOrOpenSelectedAiTab);
document.querySelectorAll("[data-check-posting-url]").forEach((input) => {
  input.addEventListener("focus", () => {
    const provider = document.querySelector(
      `input[name="checkPostingAiProvider"][value="${input.dataset.checkPostingUrl}"]`
    );
    if (provider) {
      provider.checked = true;
    }
  });
});

promptResumeFormModalBackdrop?.addEventListener("click", () =>
  setPromptResumeFormModalOpen(false)
);
promptResumeFormModalCloseButton?.addEventListener("click", () =>
  setPromptResumeFormModalOpen(false)
);
promptResumeFormModalCancelButton?.addEventListener("click", () =>
  setPromptResumeFormModalOpen(false)
);
promptResumeFormModalSubmitButton?.addEventListener("click", submitPromptResumeForm);

promptFormModalBackdrop?.addEventListener("click", () => setPromptFormModalOpen(false));
promptFormModalCloseButton?.addEventListener("click", () => setPromptFormModalOpen(false));
promptFormModalCancelButton?.addEventListener("click", () => setPromptFormModalOpen(false));
promptFormModalSubmitButton?.addEventListener("click", submitPromptForm);

jobDescriptionFormModalBackdrop?.addEventListener("click", () =>
  setJobDescriptionFormModalOpen(false)
);
jobDescriptionFormModalCloseButton?.addEventListener("click", () =>
  setJobDescriptionFormModalOpen(false)
);
jobDescriptionFormModalCancelButton?.addEventListener("click", () =>
  setJobDescriptionFormModalOpen(false)
);
jobDescriptionFormModalSubmitButton?.addEventListener("click", submitJobDescriptionForm);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditableTarget =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT");

  if (
    event.defaultPrevented ||
    event.repeat ||
    event.altKey ||
    event.shiftKey ||
    !(event.ctrlKey || event.metaKey) ||
    event.key.toLowerCase() !== "a" ||
    isEditableTarget ||
    !applicationWorkspacePickupButton ||
    applicationWorkspacePickupButton.disabled ||
    applicationWorkspacePickupButton.classList.contains("is-hidden")
  ) {
    return;
  }

  event.preventDefault();
  applicationWorkspacePickupButton.click();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const openActionSettingsEntry = Object.entries(actionSettingsDialogs).find(
    ([, dialog]) => dialog.modal && !dialog.modal.classList.contains("is-hidden")
  );
  if (openActionSettingsEntry) {
    setActionSettingsModalOpen(openActionSettingsEntry[0], false);
    return;
  }

  if (profileFormModal && !profileFormModal.classList.contains("is-hidden")) {
    setProfileFormModalOpen(false);
    return;
  }

  if (profileNotesModal && !profileNotesModal.classList.contains("is-hidden")) {
    setProfileNotesModalOpen(false);
    return;
  }

  if (promptResumeFormModal && !promptResumeFormModal.classList.contains("is-hidden")) {
    setPromptResumeFormModalOpen(false);
    return;
  }

  if (profileResumeSettingsModal && !profileResumeSettingsModal.classList.contains("is-hidden")) {
    setProfileResumeSettingsModalOpen(false);
    return;
  }

  if (
    buildResumeContextModal &&
    !buildResumeContextModal.classList.contains("is-hidden")
  ) {
    setBuildResumeContextModalOpen(false);
    return;
  }

  if (splitWindowsModal && !splitWindowsModal.classList.contains("is-hidden")) {
    if (!isSplitWindowsDialogOpen) {
      setSaveWorkspaceSidePanelView("home");
    } else {
      setSplitWindowsModalOpen(false);
    }
    return;
  }

  if (promptFormModal && !promptFormModal.classList.contains("is-hidden")) {
    setPromptFormModalOpen(false);
    return;
  }

  if (jobDescriptionFormModal && !jobDescriptionFormModal.classList.contains("is-hidden")) {
    setJobDescriptionFormModalOpen(false);
    return;
  }

  if (deleteApplicationModal && !deleteApplicationModal.classList.contains("is-hidden")) {
    setDeleteApplicationModalOpen(false);
    return;
  }

  if (exportAppDataModal && !exportAppDataModal.classList.contains("is-hidden")) {
    setExportAppDataModalOpen(false);
    return;
  }

  if (importAppDataModal && !importAppDataModal.classList.contains("is-hidden")) {
    setImportAppDataModalOpen(false);
    return;
  }

  if (configModal && !configModal.classList.contains("is-hidden")) {
    setConfigModalOpen(false);
  }
});

clearLogsButton?.addEventListener("click", () => {

  clearLogs();
  addLog("info", "Process logs cleared.");
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // The side panel is scoped to one window, so ignore tab switches elsewhere.
  if (panelWindowId !== null && activeInfo.windowId !== panelWindowId) {
    return;
  }

  switchActiveTab(activeInfo.tabId);
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (activeTabId === activeInfo.tabId) {
      activeTabUrl = tab?.url || "";
    }
  } catch (_error) {
    activeTabUrl = "";
  }
  refreshMakeResumeButtonAvailability();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  closePickupWindowsForOwnerTab(tabId).catch((error) => {
    console.error("Could not close pickup windows for the closed tab:", error);
  });

  const hadWorkspace = saveWorkspacesByTabId.delete(tabId);
  forgetTabState(tabId);

  if (tabId === activeTabId) {
    // Dropping activeTabId here orphans the panel: every later lookup keys off
    // it, so the workspace and its job/resume details render empty. Re-point at
    // whichever tab the browser activated instead.
    activeTabId = null;
    currentSaveWorkspace = null;
    syncActiveTabFromBrowser();
    return;
  }

  if (hadWorkspace && !hasSaveWorkspaceSession() && !currentSaveWorkspace) {
    renderSaveWorkspaceSidePanelView();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && (changeInfo.url || tab?.url)) {
    activeTabUrl = changeInfo.url || tab.url || "";
  }
  // Deliberately no active-tab inference here. During a multi-profile save the
  // panel is moved to the next profile's tab before the browser activates it,
  // so the previous profile's tab is still reported active and its ChatGPT SPA
  // URL/title updates would drag the panel straight back.
  if (tab.active && (changeInfo.url || changeInfo.status === "complete")) {
    refreshMakeResumeButtonAvailability();
  }

  const applicationWorkspaceOwnerTabId = Number.isInteger(
    currentSaveWorkspace?.chatGptTabId
  )
    ? currentSaveWorkspace.chatGptTabId
    : activeTabId;
  if (
    (changeInfo.url || changeInfo.status === "complete") &&
    applicationWorkspaceOwnerTabId === tabId &&
    !isSplitWindowsDialogOpen
  ) {
    updateApplicationWorkspaceJobGptUrl();
  }

  if (changeInfo.url) {
    updatePickupCloseButtons();
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (
    windowId === chrome.windows.WINDOW_ID_NONE ||
    (panelWindowId !== null && windowId !== panelWindowId)
  ) {
    return;
  }

  refreshMakeResumeButtonAvailability();

  try {
    const [focusedTab] = await chrome.tabs.query({
      active: true,
      windowId
    });
    activeTabUrl = focusedTab?.url || "";
    switchActiveTab(focusedTab?.id);
  } catch (error) {
    console.error("Could not check the focused window tab:", error);
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  forgetPickupWindowIdEverywhere(windowId);
  updatePickupCloseButtons();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "session" && changes[PLAY_POSTING_BATCH_STORAGE_KEY]) {
    playPostingBatchState = changes[PLAY_POSTING_BATCH_STORAGE_KEY].newValue || null;
    updateCheckPostingButtonDisabledState();
  }
  if (areaName === "session" && changes[NO_MODEL_PROGRESS_STORAGE_KEY]) {
    noModelProgressByTabId = changes[NO_MODEL_PROGRESS_STORAGE_KEY].newValue || {};
    renderNoModelSaveProgress();
  }
  if (areaName !== "local") {
    return;
  }

  if (
    changes[PROFILE_SELECTION_STORAGE_KEY] ||
    changes[PROMPT_RESUME_SELECTION_STORAGE_KEY] ||
    changes[JOB_DESCRIPTION_SELECTION_STORAGE_KEY]
  ) {
    if (changes[PROFILE_SELECTION_STORAGE_KEY]) {
      const changedSelection = changes[PROFILE_SELECTION_STORAGE_KEY].newValue;

      if (!isCurrentProfileSelectionState(changedSelection)) {
        loadProfileSelection().catch((error) => {
          console.error("Could not refresh profiles:", error);
        });
      }
    } else {
      refreshApplicationInputsAfterSave().catch((error) => {
        console.error("Could not refresh application inputs:", error);
      });
    }
  }

  if (changes[SAVE_POST_PROCESS_STORAGE_KEY]) {
    applySavePostProcessStates(
      changes[SAVE_POST_PROCESS_STORAGE_KEY].newValue
    );
  }
  if (changes.sheetConfig) {
    configuredAiProviderId = normalizeAiProviderId(
      changes.sheetConfig.newValue?.aiProviderId
    );
    if (aiProviderInput) {
      aiProviderInput.value = configuredAiProviderId;
    }
    syncSaveModeUi();
  }
});

renderSaveWorkspaceSidePanelView();
updateLogsState();
updateDeletedRowsState();
loadProfileSelection();
loadPromptSelection();
let didRestorePanelStartupState = false;
Promise.all([loadSheetConfig(), loadNoModelSaveProgress(), loadJobDescriptionSelection(), restoreTabSession(), loadPlayPostingBatchState()])
  .then(() => { didRestorePanelStartupState = true; })
  .catch((error) => {
    console.error("Could not restore side panel startup state:", error);
  })
  .then(() => initActiveTabTracking())
  .then(() => loadSavePostProcessState())
  .then(() => { isProtectedCloseReady = didRestorePanelStartupState; })
  .finally(() => {
    refreshMakeResumeButtonAvailability().then(() => {
      if (
        getCurrentSidePanelView() !== "home" ||
        isNoModelSaveMode() ||
        isSplitWindowsDialogOpen ||
        readOpenManagedModalId()
      ) {
        return;
      }

      if (isCurrentTabGoogleSheet) {
        setSplitWindowsModalOpen(true);
        return;
      }

      openEditJobDescriptionModal();
    });
  });
