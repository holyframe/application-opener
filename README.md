# Application Opener

A dependency-free Chrome Manifest V3 extension for opening application rows from
Google Sheets in per-tab resume workspaces.

## Make a resume

1. Open a Google Sheets spreadsheet and click the extension icon.
2. Select **Make a resume** and paste tab-separated application rows.
3. Click **Open**. Each job opens in a main tab with its paired Google Docs resume
   embedded in the Application workspace. Switching tabs restores that workspace.

The importer accepts six or seven columns in this order: Timestamp, Job title,
Applicant name, AI conversation URL, Job URL, Resume Google Doc URL, and optional
Apply Now. The older four-field Name, Chat, Job, Google Doc format also works.
URLs can be plain text or Markdown links. The AI field can be empty or `No Model`
in six- or seven-column rows. An imported name labels the workspace; the app does
not manage applicant profiles.

The workspace offers:

- **Download resume**: export the paired Google Doc as PDF.
- **Pickup**: open a job, resume, or imported AI URL in a window on the right.
- **Send**: send entered text to the exact imported ChatGPT or DeepSeek conversation.
- **Copy**: copy a URL, or the text of an imported Google Doc.
- **Refresh**: validate, store, and reload an edited resume document URL.
- **Exchange** in the header: switch between Home and the Application workspace.

The existing Build resume button remains temporarily disabled. Workspace details,
drafts, pickup windows, and process logs are stored per tab in
`chrome.storage.session` until the tab closes. They survive closing and reopening
the side panel. Imported Make a resume workspaces from older releases are restored.

The app has no Save App, automated posting checks, Play batches, Jobright opener,
Google Sheets writing, profile manager, prompt manager, or job-description editor.

## Shortcuts

Make Resume and Download Resume are optional Chrome commands. Assign them at
`chrome://extensions/shortcuts`. **Ctrl+A** picks up the resume while the workspace
has focus; text fields retain Select All. Closing a tab with **Ctrl+W** or its X
focuses the adjacent tab to the left while the side panel is visible.

## Google access

Google authorization is used only for reading or updating existing Google Docs.
PDF downloads use the document's export URL and the browser's signed-in account.
The extension does not request Google Sheets or Drive API scopes. The OAuth client
is configured in `manifest.json`.

## Load in Chrome

1. Open `chrome://extensions` and enable **Developer mode**.
2. Select **Load unpacked** and choose this repository.
3. Click the extension icon to open the side panel.

After an update, reload the extension. There is no build step or application server.

## Development checks

```powershell
node --check service-worker.js
node --check sidepanel/sidepanel.js
$testFiles = @(Get-ChildItem tests -Filter *.test.cjs | ForEach-Object { $_.FullName })
node --test $testFiles
```

The optional `tests/resume-workspace-browser-check.cjs` verifies the full importer
and workspace with synthetic Chrome APIs. Make Playwright available through
`NODE_PATH`, then run it with an optional screenshot directory and browser channel.
