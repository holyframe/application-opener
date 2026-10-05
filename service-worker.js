// Background operations used by the Make a resume workspace.
const RESUME_SESSION_STORAGE_KEY = "resumeWorkspaceSession";
const DEFAULT_AI_PROVIDER_ID = "chatgpt";
const GOOGLE_BROWSER_SIGNIN_REQUIRED_CODE = "GOOGLE_BROWSER_SIGNIN_REQUIRED";
const CHROME_SIGNIN_SETTINGS_URL = "chrome://settings/people";
const sidePanelDisabledTabIds = new Set();
const runOwnerTabIds = new Map();
const AI_PROVIDERS = Object.freeze({
  chatgpt: { id: "chatgpt", label: "ChatGPT", contentScript: "content/chatgpt.js" },
  deepseek: { id: "deepseek", label: "DeepSeek", contentScript: "content/ai-provider.js" },
  none: { id: "none", label: "Google Doc", contextDocOnly: true }
});

const GOOGLE_DOC_WRITABLE_TEXT_STYLE_FIELDS = Object.freeze([
  "backgroundColor",
  "baselineOffset",
  "bold",
  "fontSize",
  "foregroundColor",
  "italic",
  "link",
  "smallCaps",
  "strikethrough",
  "underline",
  "weightedFontFamily"
]);

function parseGoogleDocId(input) {
  const raw = String(input ?? "").trim();
  if (!raw) {
    return "";
  }

  const urlMatch = raw.match(/\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }

  return raw;
}

function isGoogleDocsDocumentUrl(url = "") {
  try {
    const parsed = new URL(String(url || ""));
    if (parsed.hostname !== "docs.google.com") {
      return false;
    }

    return /\/document\/(?:u\/\d+\/)?d\/[a-zA-Z0-9-_]+/.test(parsed.pathname);
  } catch (_error) {
    return false;
  }
}

function isGoogleSheetsDocumentUrl(url = "") {
  try {
    const parsed = new URL(String(url || ""));
    if (parsed.hostname !== "docs.google.com") {
      return false;
    }

    return /\/spreadsheets\/(?:u\/\d+\/)?d\/[a-zA-Z0-9-_]+/.test(
      parsed.pathname
    );
  } catch (_error) {
    return false;
  }
}

async function checkOpenGoogleSheet() {
  const [sheetTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });
  const isCurrentTabGoogleSheet =
    Number.isInteger(sheetTab?.id) &&
    isGoogleSheetsDocumentUrl(sheetTab.url || "");

  return {
    open: isCurrentTabGoogleSheet,
    tabId: isCurrentTabGoogleSheet ? sheetTab.id : null,
    url: isCurrentTabGoogleSheet ? sheetTab.url || "" : ""
  };
}

function sanitizeDownloadFilename(name) {
  const cleaned = String(name || "")
    .replace(/\s*-\s*Google Docs\s*$/i, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "document";
}

function buildResumeDownloadTitle(profileName = "") {
  const raw = String(profileName || "").trim();
  if (!raw) {
    return "Resume";
  }

  const parts = sanitizeDownloadFilename(raw)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "Resume";
  }

  return `${parts.join("_")}_Resume`;
}

function normalizeHttpUrl(value, label = "Web") {
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

function isReceivingEndMissingError(error) {
  const message = String(error?.message ?? error ?? "");
  return (
    message.includes("Receiving end does not exist") ||
    message.includes("Could not establish connection")
  );
}

async function ensureAiProviderContentScript(tabId, runId, aiProviderInput) {
  const aiProvider = getAiProviderConfig(aiProviderInput);
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [aiProvider.contentScript]
    });
    sendLog(runId, "info", `Injected ${aiProvider.label} content script.`);
    return true;
  } catch (error) {
    sendLog(
      runId,
      "error",
      `Could not inject ${aiProvider.label} content script: ${error.message || error}`
    );
    return false;
  }
}

function getAiProviderConfig(value) {
  const providerId = String(value || "").trim().toLowerCase();
  return AI_PROVIDERS[providerId] || AI_PROVIDERS[DEFAULT_AI_PROVIDER_ID];
}

async function sendTextToPickedUpAiTab(runId, options = {}) {
  const tabId = options.tabId;
  const text = String(options.text ?? "").trim();
  const expectedUrl = String(options.url || "").trim();
  const aiProvider = getAiProviderConfig(options.aiProviderId);

  if (!Number.isInteger(tabId)) {
    throw new Error("The picked-up AI tab could not be identified.");
  }
  if (!text) {
    throw new Error(`Enter text to send to ${aiProvider.label}.`);
  }
  if (aiProvider.contextDocOnly) {
    throw new Error("Text can only be sent to a ChatGPT or DeepSeek tab.");
  }

  const tab = await chrome.tabs.get(tabId);
  const tabUrlCandidates = [tab?.url, tab?.pendingUrl]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const tabUrl =
    tabUrlCandidates.find((value) =>
      isAiConversationUrl(value, aiProvider.id)
    ) || tabUrlCandidates[0] || "";
  if (!isAiConversationUrl(tabUrl, aiProvider.id)) {
    throw new Error(
      `The picked-up tab is not the saved ${aiProvider.label} conversation.`
    );
  }
  if (
    expectedUrl &&
    getUrlComparisonKey(tabUrl) !== getUrlComparisonKey(expectedUrl)
  ) {
    throw new Error(
      `The picked-up tab no longer matches the saved ${aiProvider.label} conversation.`
    );
  }

  if (Number.isInteger(tab.windowId)) {
    await chrome.windows.update(tab.windowId, { focused: true });
  }
  await chrome.tabs.update(tabId, { active: true });

  sendLog(runId, "info", `Sending text to the picked-up ${aiProvider.label} tab...`);
  await sendFillAndSendToTab(tabId, text, runId, {
    aiProviderId: aiProvider.id,
    maxAttempts: aiProvider.maxFillAttempts
  });
  sendLog(runId, "success", `Text sent to the picked-up ${aiProvider.label} tab.`);

  return {
    url: tabUrl,
    tabId,
    windowId: Number.isInteger(tab.windowId) ? tab.windowId : null,
    aiProviderId: aiProvider.id
  };
}

async function downloadGoogleDocUrlAsPdf(
  runId,
  { documentUrl = "", documentTitle = "", profileName = "" } = {}
) {
  const normalizedDocumentUrl = String(documentUrl || "").trim();
  if (!isGoogleDocsDocumentUrl(normalizedDocumentUrl)) {
    throw new Error("The resume URL is not a Google Docs document.");
  }

  const documentId = parseGoogleDocId(normalizedDocumentUrl);
  if (!documentId || documentId === normalizedDocumentUrl) {
    throw new Error("Could not find a Google Docs document ID in the resume URL.");
  }

  const resolvedTitle =
    String(documentTitle || "").trim() || buildResumeDownloadTitle(profileName);
  const filename = `${sanitizeDownloadFilename(resolvedTitle)}.pdf`;
  const exportUrl = `https://docs.google.com/document/d/${documentId}/export?format=pdf`;

  sendLog(runId, "info", `Downloading Google Doc as PDF: ${filename}`);

  const downloadId = await chrome.downloads.download({
    url: exportUrl,
    filename,
    saveAs: false,
    conflictAction: "uniquify"
  });

  if (typeof downloadId !== "number") {
    throw new Error("Could not start the PDF download.");
  }

  sendLog(runId, "success", `PDF download started: ${filename}`);

  return {
    documentId,
    filename,
    downloadId,
    url: normalizedDocumentUrl
  };
}

async function downloadActiveGoogleDocAsPdf(runId) {
  sendLog(runId, "info", "Checking active tab for Google Docs...");

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  if (!tab?.url) {
    throw new Error("No active tab with a URL found.");
  }

  if (!isGoogleDocsDocumentUrl(tab.url)) {
    throw new Error("Current tab is not a Google Docs document.");
  }

  return downloadGoogleDocUrlAsPdf(runId, {
    documentUrl: tab.url,
    documentTitle: tab.title
  });
}

async function downloadResumeAsPdf(runId, options = {}) {
  sendLog(runId, "info", "Starting resume PDF download...");
  if (String(options.documentUrl || "").trim()) {
    return downloadGoogleDocUrlAsPdf(runId, {
      documentUrl: options.documentUrl,
      documentTitle: options.documentTitle,
      profileName: options.profileName
    });
  }

  return downloadActiveGoogleDocAsPdf(runId);
}

async function openUrlInNewTab(runId, options = {}) {
  const url = normalizeHttpUrl(options.url, "Page");
  const sourceWindow = await chrome.windows.getLastFocused({
    windowTypes: ["normal"]
  });
  const [returnTab] = await chrome.tabs.query(
    Number.isInteger(sourceWindow?.id)
      ? {
          active: true,
          windowId: sourceWindow.id
        }
      : {
          active: true,
          lastFocusedWindow: true
        }
  );

  if (!Number.isInteger(returnTab?.id)) {
    throw new Error("Could not identify the tab to return to.");
  }

  sendLog(runId, "info", "Opening URL in a new Chrome tab...");

  const createOptions = {
    url,
    active: true
  };
  if (Number.isInteger(sourceWindow?.id)) {
    createOptions.windowId = sourceWindow.id;
  }

  const tab = await chrome.tabs.create(createOptions);
  if (!Number.isInteger(tab?.id)) {
    throw new Error("Chrome did not return the newly opened tab.");
  }

  sendLog(runId, "success", "URL opened in a new Chrome tab.");

  return {
    url,
    tabId: tab.id,
    windowId: tab.windowId ?? sourceWindow?.id ?? null,
    returnTabId: returnTab.id,
    returnUrl: returnTab.url || ""
  };
}

function getUrlComparisonKey(value) {
  try {
    const parsedUrl = new URL(String(value || "").trim());
    parsedUrl.hash = "";
    return parsedUrl.href.replace(/\/$/, "");
  } catch {
    return String(value || "").trim().replace(/\/$/, "");
  }
}

async function findExistingRightWindowForUrl(url, sourceWindowId) {
  const targetKey = getUrlComparisonKey(url);
  if (!targetKey) {
    return null;
  }

  const windows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ["normal"]
  });

  for (const win of windows) {
    if (!Number.isInteger(win?.id) || win.id === sourceWindowId) {
      continue;
    }

    for (const tab of win.tabs || []) {
      if (!Number.isInteger(tab?.id)) {
        continue;
      }
      if (getUrlComparisonKey(tab.url || tab.pendingUrl || "") !== targetKey) {
        continue;
      }

      return {
        windowId: win.id,
        tabId: tab.id
      };
    }
  }

  return null;
}

async function openUrlInRightWindow(runId, options = {}) {
  const url = normalizeHttpUrl(options.url, "Page");
  let sourceWindow = null;

  if (Number.isInteger(options.sourceWindowId)) {
    try {
      sourceWindow = await chrome.windows.get(options.sourceWindowId);
    } catch {
      sourceWindow = null;
    }
  }
  if (!sourceWindow || sourceWindow.type !== "normal") {
    sourceWindow = await chrome.windows.getLastFocused({
      windowTypes: ["normal"]
    });
  }

  const existingWindow = await findExistingRightWindowForUrl(
    url,
    sourceWindow?.id
  );
  if (existingWindow) {
    sendLog(runId, "info", "Reopening the existing right-side window...");
    await chrome.windows.update(existingWindow.windowId, { focused: true });
    if (Number.isInteger(existingWindow.tabId)) {
      await chrome.tabs.update(existingWindow.tabId, { active: true });
    }
    sendLog(runId, "success", "Existing right-side window focused.");
    return {
      url,
      windowId: existingWindow.windowId,
      tabId: existingWindow.tabId,
      reused: true
    };
  }

  const sourceLeft = Number.isFinite(sourceWindow?.left)
    ? sourceWindow.left
    : 0;
  const sourceTop = Number.isFinite(sourceWindow?.top)
    ? sourceWindow.top
    : 0;
  const sourceWidth = Math.max(720, Number(sourceWindow?.width) || 1200);
  const sourceHeight = Math.max(500, Number(sourceWindow?.height) || 800);
  const rightWindowWidth = Math.max(480, Math.floor(sourceWidth / 2));

  sendLog(runId, "info", "Opening the remaining URL in a right-side window...");

  const createdWindow = await chrome.windows.create({
    url,
    type: "normal",
    focused: true,
    left: sourceLeft + sourceWidth - rightWindowWidth,
    top: sourceTop,
    width: rightWindowWidth,
    height: sourceHeight
  });
  const openedTab = createdWindow?.tabs?.[0];

  if (!Number.isInteger(createdWindow?.id)) {
    throw new Error("Chrome did not return the newly opened window.");
  }

  sendLog(runId, "success", "Remaining URL opened in a right-side window.");

  return {
    url,
    windowId: createdWindow.id,
    tabId: Number.isInteger(openedTab?.id) ? openedTab.id : null,
    reused: false
  };
}

function isGoogleBrowserSigninDisabledError(error) {
  return String(error?.message || error || "")
    .toLowerCase()
    .includes("turned off browser signin");
}

async function directUserToChromeSignin() {
  try {
    await chrome.tabs.create({
      url: CHROME_SIGNIN_SETTINGS_URL,
      active: true
    });
    return true;
  } catch (error) {
    console.error("Could not open Chrome sign-in settings:", error);
    return false;
  }
}

async function getGoogleAccessToken(options = {}) {
  let authResult;
  try {
    authResult = await chrome.identity.getAuthToken({
      interactive: options.interactive ?? true
    });
  } catch (error) {
    if (!isGoogleBrowserSigninDisabledError(error)) {
      throw error;
    }

    const openedSigninSettings = await directUserToChromeSignin();
    const signinError = new Error(
      openedSigninSettings
        ? "Chrome sign-in is turned off. Sign-in settings opened; turn on Chrome sign-in, sign in to Google, then retry."
        : `Chrome sign-in is turned off. Open ${CHROME_SIGNIN_SETTINGS_URL}, turn on Chrome sign-in, sign in to Google, then retry.`
    );
    signinError.code = GOOGLE_BROWSER_SIGNIN_REQUIRED_CODE;
    throw signinError;
  }

  if (!authResult || !authResult.token) {
    throw new Error("Could not get Google access token.");
  }

  return authResult.token;
}

async function clearCachedGoogleAccessToken(token) {
  if (!token) {
    return;
  }

  await new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, resolve);
  });
}

function formatGoogleApiError(errorText, fallbackMessage) {
  try {
    const parsed = JSON.parse(errorText);
    const message = parsed?.error?.message;
    if (message) {
      return message;
    }
  } catch (_error) {
    // Keep fallback message for non-JSON responses.
  }

  return fallbackMessage;
}

async function batchUpdateGoogleDoc(token, documentId, requests) {
  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ requests })
    }
  );

  return response;
}

async function batchUpdateGoogleDocWithAuthRetry(token, documentId, requests, runId, errorMessage) {
  let activeToken = token;
  let response = await batchUpdateGoogleDoc(activeToken, documentId, requests);

  if (response.status === 401 || response.status === 403) {
    sendLog(runId, "info", "Google Doc update auth error. Refreshing token and retrying...");
    await clearCachedGoogleAccessToken(activeToken);
    activeToken = await getGoogleAccessToken({ interactive: true });
    response = await batchUpdateGoogleDoc(activeToken, documentId, requests);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatGoogleApiError(errorText, errorMessage));
  }

  return {
    activeToken,
    data: await response.json()
  };
}

async function getGoogleDocWithAuthRetry(
  token,
  documentId,
  runId,
  { includeTabsContent = false } = {}
) {
  let activeToken = token;
  const documentUrl =
    "https://docs.googleapis.com/v1/documents/" +
    documentId +
    (includeTabsContent ? "?includeTabsContent=true" : "");
  let response = await fetch(documentUrl, {
    headers: {
      Authorization: "Bearer " + activeToken
    }
  });

  if (response.status === 401 || response.status === 403) {
    sendLog(
      runId,
      "info",
      "Google Doc read auth error. Refreshing token and retrying..."
    );
    await clearCachedGoogleAccessToken(activeToken);
    activeToken = await getGoogleAccessToken({ interactive: true });
    response = await fetch(documentUrl, {
      headers: {
        Authorization: "Bearer " + activeToken
      }
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      formatGoogleApiError(errorText, "Could not read the copied Google Doc.")
    );
  }

  return {
    activeToken,
    document: await response.json()
  };
}

function extractGoogleDocStructuralText(structuralElements) {
  const chunks = [];

  for (const structuralElement of structuralElements || []) {
    if (structuralElement?.paragraph) {
      chunks.push(
        (structuralElement.paragraph.elements || [])
          .map((element) =>
            String(
              element?.textRun?.content ||
                element?.autoText?.content ||
                element?.person?.personProperties?.name ||
                element?.richLink?.richLinkProperties?.title ||
                ""
            )
          )
          .join("")
      );
    }

    if (structuralElement?.table) {
      for (const tableRow of structuralElement.table.tableRows || []) {
        const cellTexts = (tableRow.tableCells || []).map((tableCell) =>
          extractGoogleDocStructuralText(tableCell.content).replace(/\n+$/g, "")
        );
        chunks.push(cellTexts.join("\t") + "\n");
      }
    }

    if (structuralElement?.tableOfContents) {
      chunks.push(
        extractGoogleDocStructuralText(
          structuralElement.tableOfContents.content
        )
      );
    }
  }

  return chunks.join("");
}

function collectGoogleDocTabText(tabs, tabTexts = []) {
  for (const tab of tabs || []) {
    const tabText = extractGoogleDocStructuralText(
      tab?.documentTab?.body?.content
    ).trim();
    if (tabText) {
      tabTexts.push(tabText);
    }
    collectGoogleDocTabText(tab?.childTabs, tabTexts);
  }

  return tabTexts;
}

function extractGoogleDocPlainText(googleDocument) {
  const tabTexts = collectGoogleDocTabText(googleDocument?.tabs);
  const text = tabTexts.length
    ? tabTexts.join("\n\n")
    : extractGoogleDocStructuralText(googleDocument?.body?.content);

  return text.replace(/\r\n?/g, "\n").trim();
}

async function readGoogleDocText(runId, options = {}) {
  const documentUrl = String(options.documentUrl || "").trim();
  if (!isGoogleDocsDocumentUrl(documentUrl)) {
    throw new Error("The selected URL is not a Google Docs document.");
  }

  const documentId = parseGoogleDocId(documentUrl);
  if (!documentId) {
    throw new Error("Could not find a Google Docs document ID.");
  }

  sendLog(runId, "info", "Reading Google Docs content for the clipboard...");
  const token = await getGoogleAccessToken();
  const { document } = await getGoogleDocWithAuthRetry(
    token,
    documentId,
    runId,
    { includeTabsContent: true }
  );
  const text = extractGoogleDocPlainText(document);
  if (!text) {
    throw new Error("The Google Doc does not contain copyable text.");
  }

  sendLog(runId, "success", "Google Docs text is ready to copy.");
  return {
    documentId,
    title: String(document?.title || "Google Doc").trim() || "Google Doc",
    text
  };
}

function getFirstGoogleDocTabId(tabs = []) {
  for (const tab of tabs) {
    const tabId = tab?.tabProperties?.tabId;
    if (tabId) {
      return tabId;
    }

    const childTabId = getFirstGoogleDocTabId(tab?.childTabs || []);
    if (childTabId) {
      return childTabId;
    }
  }

  return "";
}

function createGoogleDocParagraphRecord(structuralElement) {
  const paragraph = structuralElement?.paragraph;
  const elements = paragraph?.elements || [];
  if (!paragraph || elements.length === 0) {
    return null;
  }

  // Avoid touching images, equations, page breaks, and other non-text content.
  if (elements.some((element) => !element.textRun)) {
    return null;
  }

  const textElements = elements
    .map((element) => ({
      startIndex: element.startIndex,
      content: element.textRun?.content,
      textStyle: element.textRun?.textStyle || {}
    }))
    .filter(
      (element) =>
        Number.isInteger(element.startIndex) &&
        typeof element.content === "string"
    );
  if (textElements.length === 0) {
    return null;
  }

  const fullText = textElements.map((element) => element.content).join("");
  const trailingNewlineLength = fullText.endsWith("\n") ? 1 : 0;
  const currentText = trailingNewlineLength
    ? fullText.slice(0, -trailingNewlineLength)
    : fullText;
  const startIndex = textElements[0].startIndex;
  const endIndex = startIndex + currentText.length;
  const styleRuns = [];
  let remainingTextLength = currentText.length;
  let relativeOffset = 0;

  for (const textElement of textElements) {
    const runLength = Math.min(
      textElement.content.length,
      remainingTextLength
    );
    if (runLength > 0) {
      styleRuns.push({
        startOffset: relativeOffset,
        endOffset: relativeOffset + runLength,
        textStyle: textElement.textStyle
      });
      relativeOffset += runLength;
      remainingTextLength -= runLength;
    }
  }

  return {
    startIndex,
    endIndex,
    currentText,
    styleRuns,
    hasBullet: Boolean(paragraph.bullet)
  };
}

function collectGoogleDocTextParagraphs(structuralElements, paragraphs = []) {
  for (const structuralElement of structuralElements || []) {
    const paragraph = createGoogleDocParagraphRecord(structuralElement);
    if (paragraph && paragraph.currentText.trim()) {
      paragraphs.push(paragraph);
    }

    for (const tableRow of structuralElement.table?.tableRows || []) {
      for (const tableCell of tableRow.tableCells || []) {
        collectGoogleDocTextParagraphs(tableCell.content, paragraphs);
      }
    }
  }

  return paragraphs.sort(
    (left, right) => left.startIndex - right.startIndex
  );
}

function normalizeResumeContextLines(resumeText) {
  return String(resumeText ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^```(?:[a-z0-9_-]+)?$/i.test(line));
}

function normalizeResumeLineForParagraph(line, paragraph) {
  let normalizedLine = String(line || "")
    .trim()
    .replace(/^#{1,6}\s+/, "");

  if (paragraph.hasBullet) {
    normalizedLine = normalizedLine.replace(
      /^(?:(?:[-*+•◦▪‣])|(?:\d+[.)]))\s+/,
      ""
    );
  }

  const wrappedBoldMatch = normalizedLine.match(/^(\*\*|__)(.+)\1$/);
  if (wrappedBoldMatch) {
    normalizedLine = wrappedBoldMatch[2].trim();
  }

  return normalizedLine;
}

function getWritableGoogleDocTextStyle(textStyle = {}) {
  return GOOGLE_DOC_WRITABLE_TEXT_STYLE_FIELDS.reduce((style, field) => {
    if (
      Object.prototype.hasOwnProperty.call(textStyle, field) &&
      textStyle[field] !== undefined
    ) {
      style[field] = textStyle[field];
    }
    return style;
  }, {});
}

function buildMappedGoogleDocTextStyleRequests(
  paragraph,
  replacementText,
  tabId
) {
  const replacementLength = replacementText.length;
  const originalLength = paragraph.currentText.length;
  if (
    replacementLength === 0 ||
    originalLength === 0 ||
    paragraph.styleRuns.length === 0
  ) {
    return [];
  }

  return paragraph.styleRuns.flatMap((styleRun, index) => {
    const rangeStart =
      index === 0
        ? 0
        : Math.round(
            (styleRun.startOffset / originalLength) * replacementLength
          );
    const rangeEnd =
      index === paragraph.styleRuns.length - 1
        ? replacementLength
        : Math.round(
            (styleRun.endOffset / originalLength) * replacementLength
          );
    const textStyle = getWritableGoogleDocTextStyle(styleRun.textStyle);
    const fields = Object.keys(textStyle);

    if (rangeEnd <= rangeStart || fields.length === 0) {
      return [];
    }

    return [
      {
        updateTextStyle: {
          range: {
            startIndex: paragraph.startIndex + rangeStart,
            endIndex: paragraph.startIndex + rangeEnd,
            ...(tabId ? { tabId } : {})
          },
          textStyle,
          fields: fields.join(",")
        }
      }
    ];
  });
}

function buildResumeParagraphUpdateRequests(document, resumeText) {
  const paragraphs = collectGoogleDocTextParagraphs(
    document.body?.content
  );
  const resumeLines = normalizeResumeContextLines(resumeText);
  const tabId = getFirstGoogleDocTabId(document.tabs);

  if (paragraphs.length === 0) {
    throw new Error(
      "The current copied resume does not contain editable text paragraphs."
    );
  }
  if (resumeLines.length === 0) {
    throw new Error("Resume context is required.");
  }
  if (resumeLines.length > paragraphs.length) {
    throw new Error(
      `The submitted resume has ${resumeLines.length} non-empty lines, but the current copied resume has only ${paragraphs.length} styled text paragraphs. Keep the same line order and shorten or combine the extra lines so the existing styles can be retained.`
    );
  }

  const requests = [];
  let changedParagraphCount = 0;

  for (let index = paragraphs.length - 1; index >= 0; index -= 1) {
    const paragraph = paragraphs[index];
    const replacementText =
      index < resumeLines.length
        ? normalizeResumeLineForParagraph(resumeLines[index], paragraph)
        : "";

    if (replacementText === paragraph.currentText) {
      continue;
    }

    changedParagraphCount += 1;
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: paragraph.startIndex,
          endIndex: paragraph.endIndex,
          ...(tabId ? { tabId } : {})
        }
      }
    });

    if (!replacementText) {
      continue;
    }

    requests.push({
      insertText: {
        location: {
          index: paragraph.startIndex,
          ...(tabId ? { tabId } : {})
        },
        text: replacementText
      }
    });
    requests.push(
      ...buildMappedGoogleDocTextStyleRequests(
        paragraph,
        replacementText,
        tabId
      )
    );
  }

  return {
    requests,
    changedParagraphCount,
    inputParagraphCount: resumeLines.length,
    templateParagraphCount: paragraphs.length
  };
}

async function replaceResumeContextPreservingStyles(
  token,
  documentId,
  resumeText,
  runId
) {
  const trimmedText = String(resumeText ?? "").trim();
  if (!trimmedText) {
    throw new Error("Resume context is required.");
  }

  sendLog(
    runId,
    "info",
    "Reading the current copied resume structure and styles..."
  );
  const {
    activeToken: readToken,
    document
  } = await getGoogleDocWithAuthRetry(token, documentId, runId);
  const {
    requests,
    changedParagraphCount,
    inputParagraphCount,
    templateParagraphCount
  } = buildResumeParagraphUpdateRequests(document, trimmedText);

  if (requests.length === 0) {
    sendLog(runId, "success", "The copied resume already matches the submitted text.");
    return readToken;
  }

  const { activeToken } = await batchUpdateGoogleDocWithAuthRetry(
    readToken,
    documentId,
    requests,
    runId,
    "Could not update the current copied resume in Google Docs."
  );

  sendLog(
    runId,
    "success",
    `Updated ${changedParagraphCount} of ${templateParagraphCount} styled text paragraphs from ${inputParagraphCount} submitted lines.`
  );
  return activeToken;
}

async function updateWorkspaceResumeContext(runId, options = {}) {
  const resumeUrl = String(options.resumeUrl || "").trim();
  const resumeText = String(options.resumeText || "").trim();
  const documentId = parseGoogleDocId(resumeUrl);

  if (!isGoogleDocsDocumentUrl(resumeUrl) || !documentId || documentId === resumeUrl) {
    throw new Error("The workspace resume URL is not a Google Docs document.");
  }
  if (!resumeText) {
    throw new Error("Resume context is required.");
  }

  sendLog(runId, "info", "Building the copied resume document...");
  const token = await getGoogleAccessToken();
  await replaceResumeContextPreservingStyles(
    token,
    documentId,
    resumeText,
    runId
  );
  sendLog(runId, "success", "Copied resume document updated.");

  return {
    url: `https://docs.google.com/document/d/${documentId}/edit`
  };
}

function isChromeExtensionsPageUrl(url) {
  const normalizedUrl = String(url || "").trim().toLowerCase();
  return (
    normalizedUrl === "chrome://extensions" ||
    normalizedUrl.startsWith("chrome://extensions/")
  );
}

function shouldEnableSidePanelForTab(tab) {
  // Keep the extension UI available while the user moves between tabs. Chrome's
  // extensions manager is the sole exception: disabling this tab-scoped panel
  // makes Chrome close it automatically until the user returns to another tab.
  return Number.isInteger(tab?.id) && !isChromeExtensionsPageUrl(tab.url);
}

async function syncSidePanelForTab(tab) {
  if (!Number.isInteger(tab?.id)) {
    return;
  }

  const enabled = shouldEnableSidePanelForTab(tab);
  const wasDisabled = sidePanelDisabledTabIds.has(tab.id);
  // Desired state already matches what we last applied when enabled XOR
  // wasDisabled — i.e. enabled tabs are not in the disabled set.
  const alreadySynced = enabled !== wasDisabled;

  // Calling setOptions for a tab binds a tab-scoped side panel, and Chrome then
  // remounts the panel document whenever that tab is activated. That would wipe
  // in-memory UI, so only touch tabs whose enabled state actually needs to
  // change; everything else stays on the window-level panel. Per-tab process /
  // workspace details still survive panel close via chrome.storage.session.
  if (!alreadySynced) {
    try {
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: "sidepanel/sidepanel.html",
        enabled
      });

      if (enabled) {
        sidePanelDisabledTabIds.delete(tab.id);
      } else {
        sidePanelDisabledTabIds.add(tab.id);
      }
    } catch (error) {
      console.error("Could not sync side panel availability for tab:", error);
    }
  }

}

async function syncSidePanelForAllTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map(async (tab) => {
      if (!Number.isInteger(tab?.id)) {
        return;
      }

      // Chrome keeps per-tab options across service worker restarts, so learn
      // the existing state before deciding whether anything needs changing.
      try {
        const options = await chrome.sidePanel.getOptions({ tabId: tab.id });
        if (options?.enabled === false) {
          sidePanelDisabledTabIds.add(tab.id);
        }
      } catch (_error) {
        // No per-tab override recorded for this tab.
      }

      await syncSidePanelForTab(tab);
    })
  );
}

async function configureSidePanelBehavior() {
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });
  await syncSidePanelForAllTabs();
}

function normalizeAiProviderId(value) {
  const id = String(value || "").trim().toLowerCase();
  return Object.hasOwn(AI_PROVIDERS, id) ? id : DEFAULT_AI_PROVIDER_ID;
}

function isAiConversationUrl(url = "", providerId = DEFAULT_AI_PROVIDER_ID) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (providerId === "none") return isGoogleDocsDocumentUrl(url);
    if (providerId === "deepseek") {
      return parsed.hostname === "chat.deepseek.com" && /^\/a\/chat\/s\/[a-z0-9_-]{8,}\/?$/i.test(parsed.pathname);
    }
    return ["chatgpt.com", "chat.openai.com"].includes(parsed.hostname) &&
      /^\/c\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/?$/i.test(parsed.pathname);
  } catch { return false; }
}

async function sendFillAndSendToTab(tabId, text, runId, options = {}) {
  const provider = getAiProviderConfig(options.aiProviderId);
  const maxAttempts = Math.max(1, Number(options.maxAttempts) || 24);
  let lastError;
  let didInject = false;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: "FILL_AND_SEND", text });
      if (response?.ok) return response;
      lastError = new Error(response?.error || `Could not send text to ${provider.label}.`);
    } catch (error) {
      lastError = error;
      if (!didInject && isReceivingEndMissingError(error)) {
        didInject = true;
        await ensureAiProviderContentScript(tabId, runId, provider.id);
      }
    }
    if (attempt + 1 < maxAttempts) await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw lastError;
}

async function closePickupWindow(windowId) {
  if (!Number.isInteger(windowId)) throw new Error("A pickup window ID is required.");
  await chrome.windows.get(windowId);
  await chrome.windows.remove(windowId);
  return { closed: true, windowId };
}

async function sendLog(runId, level, message) {
  try {
    await chrome.runtime.sendMessage({
      type: "RESUME_PROCESS_LOG", runId, ownerTabId: runOwnerTabIds.get(runId),
      level, message, timestamp: new Date().toLocaleTimeString()
    });
  } catch { console.log(`[${level}] ${message}`); }
}

async function forgetClosedTab(tabId) {
  sidePanelDisabledTabIds.delete(tabId);
  const stored = await chrome.storage.session.get(RESUME_SESSION_STORAGE_KEY);
  const session = stored[RESUME_SESSION_STORAGE_KEY];
  if (!session) return;
  const pickupIds = session.tabs?.[tabId]?.pickupWindowIds || [];
  await Promise.allSettled(pickupIds.map(id => chrome.windows.remove(id)));
  delete session.workspaces?.[tabId];
  delete session.tabs?.[tabId];
  await chrome.storage.session.set({ [RESUME_SESSION_STORAGE_KEY]: session });
}

chrome.runtime.onInstalled.addListener(async () => {
  // Cancel schedules left by older releases; the current app creates none.
  if (chrome.alarms) {
    await Promise.allSettled([
      "play-posting-batch", "save-current-tab-post-process",
      "group-job-gpt-tabs-after-save", "save-current-tab-check-reminder"
    ].map(name => chrome.alarms.clear(name)));
  }
  await configureSidePanelBehavior();
});
chrome.runtime.onStartup.addListener(() => configureSidePanelBehavior().catch(console.error));
chrome.tabs.onCreated.addListener(tab => syncSidePanelForTab(tab));
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try { await syncSidePanelForTab(await chrome.tabs.get(tabId)); } catch (error) { console.error(error); }
});
chrome.tabs.onUpdated.addListener((_tabId, change, tab) => {
  if (change.url || change.status === "complete") syncSidePanelForTab(tab);
});
chrome.tabs.onRemoved.addListener(tabId => forgetClosedTab(tabId).catch(console.error));
configureSidePanelBehavior().catch(console.error);

const APP_ACTION_COMMANDS = { "make-resume": "make-resume", "download-resume": "download-resume" };
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!Object.hasOwn(APP_ACTION_COMMANDS, command)) return;
  try {
    const current = tab || (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
    await chrome.runtime.sendMessage({ type: "APP_ACTION_COMMAND", action: command, ownerTabId: current?.id });
  } catch (error) { if (!isReceivingEndMissingError(error)) console.error(error); }
});

const RESUME_ACTION_HANDLERS = Object.freeze({
  DOWNLOAD_RESUME_PDF: downloadResumeAsPdf,
  READ_GOOGLE_DOC_TEXT: readGoogleDocText,
  CHECK_GOOGLE_SHEET_OPEN: checkOpenGoogleSheet,
  OPEN_URL_IN_NEW_TAB: openUrlInNewTab,
  OPEN_URL_IN_RIGHT_WINDOW: openUrlInRightWindow,
  SEND_TEXT_TO_AI_TAB: sendTextToPickedUpAiTab,
  UPDATE_WORKSPACE_RESUME_CONTEXT: updateWorkspaceResumeContext
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id && sender.id !== chrome.runtime.id) return;
  if (message?.type === "CLOSE_PICKUP_WINDOW") {
    closePickupWindow(message.windowId).then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (!Object.hasOwn(RESUME_ACTION_HANDLERS, message?.type)) return;
  const runId = message.runId || crypto.randomUUID();
  runOwnerTabIds.set(runId, message.ownerTabId ?? sender.tab?.id);
  Promise.resolve().then(() => RESUME_ACTION_HANDLERS[message.type](runId, message))
    .then(result => sendResponse({ ok: true, ...result }))
    .catch(error => {
      sendLog(runId, "error", error.message);
      sendResponse({ ok: false, error: error.message, code: error.code || "" });
    }).finally(() => runOwnerTabIds.delete(runId));
  return true;
});
