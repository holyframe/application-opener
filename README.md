# Application Opener

Application Opener is a dependency-free Chrome Manifest V3 extension for managing
job-application workflows from the Chrome side panel.

It combines:

- Applicant profiles, profile notes, resume templates, and reusable resume text
- Job-description and reusable AI prompt storage
- Google Docs template copying and resume generation
- Prompt submission to ChatGPT or DeepSeek, or context capture into a Google Doc
- Google Sheets application tracking
- Chrome keyboard shortcuts, in-panel save progress, and Google Docs PDF downloads

## Main workflow

Before saving an application, check one or more profiles and choose one resume
variant for each. Manual profile checks belong to the Chrome tab where they were
made: a different tab starts unchecked, and returning to the original tab restores
its checks. Profiles with Auto enabled are always checked on every tab. Choosing a
resume variant checks its profile automatically, while unchecking a profile keeps
its assigned resume available for the next application. Then provide a base AI
prompt and job description.

`Save App` normalizes the active job URL, copies each checked profile's
configured Google Docs resume template, submits the prepared message to the selected
AI provider, and saves the seven-column application record. An in-panel save progress
indicator starts with the action and ends as soon as the final Google Sheet row
is saved. It repeats that process once per checked profile, using the prompt and
job-description snapshot captured when the run starts. Only one Save App run can
be active at a time.

With ChatGPT or DeepSeek, `Save App` creates one selected-provider workflow per checked profile. ChatGPT
is the default; DeepSeek and No Model are also selectable in Save App settings.
It reuses the original job tab for the first profile and creates one additional
target tab for every remaining profile. Before navigating each target to the
selected provider, the extension opens a full-page Application workspace in the side panel. Its
header is labeled `Application workspace {profile name}`, and the copied
profile resume is embedded without a separate tab panel.

With `No Model`, Save App captures the current job title and URL, copies each
checked profile's Google Docs resume template, and appends the application row
to that profile's sheet tab. No AI prompt, job description, or prompt-resume
selection is required. The job-description card and automatic editor are hidden.
No Context Doc, new browser tab, or Application workspace is opened; the job page
stays in place. Column D contains `No Model`. In No Model mode, every profile card shows its
process panel from the start in a muted, disabled state. During saving, animated
connectors advance through page capture, resume copy, and Sheet save. Each involved
profile shows waiting, saved, failed, and cancelled states. Results remain visible for that job tab until its next No Model
save or until the tab closes. Existing AI text inputs and profile selections are
preserved when the process finishes.
After a profile is saved, its progress area shows matching `Open Google Sheet`
and `Delete` actions. The Sheet action opens that profile's exact tab in a new,
focused Chrome window. Confirming Delete removes only the matching Google Sheet
row and keeps the copied resume document.
The main action card also has an `Open Google Sheet` button outside the profile
list. It opens the currently configured workbook in a new, focused Chrome window.
`Check posting` sends the current job URL into the selected AI chat. The job
tab and the selected unpinned AI tab are placed in the same group, with the AI
chat on the left and the job on the right. If the AI tab already belongs to a
group, the job tab joins that group immediately to the AI tab's right instead of
creating another group. Otherwise, a new two-tab group is created. In both
cases, the group is named `Check with AI`. If the chat is not already open, it
opens before the pair is arranged and grouped. The URL is submitted when the
chat is idle; if the chat is responding, the URL is only inserted into the
prompt. Focus stays on that AI chat. Settings stores an editable URL for
Copilot, Perplexity, and DeepSeek, and which one is selected. Save App still
writes the original job URL to the Google Sheet. When Save App starts, that
job tab moves into a separate `Saving to Docs` group to the right of the
selected AI chat. Additional Save App tabs reuse the existing group instead of
creating another one. If that group is in another window, it moves to the
selected AI chat's window before the job joins it.
`Make or open AI tab` opens that selected chat, or creates it when it is not
already open, then moves its entire `Check with AI` group to the right end of
that Chrome window. Pinned tabs are left in place.
The Play icon beside `Check posting` is available on an unpinned ChatGPT,
Copilot chat, Perplexity, or DeepSeek tab. It selects the rightmost other tab
in that same Chrome window that is neither grouped nor pinned, moves it into
`Check with AI` beside the current chat, and sends its URL to that chat using
the Check posting process. In Check posting settings, set Play's number of tabs
(default 1) and assign its own hotkey. The first URL sends immediately. Larger
batches send one URL at a time, with a random 60–90 second wait before each next
submission. If the chat is responding, Play retries the same job after another
wait. Clicking Play or using its hotkey again stops the remaining batch.
Waiting batches survive closing the panel and extension-worker restarts; Chrome
may delay scheduled submissions while the device sleeps. Play finishes early
if no eligible tabs remain and stops if its chat or pending job changes.
When Play's tab count is greater than 1, each successful submission gets a
numbered job-tab icon: 1, 2, 3, and so on in submission order across the current
Chrome session. Single-tab Play leaves the icon unchanged and does not consume
a number. Numbers survive job-page reloads and extension-worker restarts. An unsent URL does not
get a number. Play does not request additional website permissions. The numbered
icon appears where Chrome already allows page access; otherwise, the submission
number remains available in the process log. Save App status icons take priority
during the save process.
If a run stops partway through, completed records and resume copies remain;
check the sheet before retrying to avoid duplicates.

Build resume, Download resume, and Exchange appear above the URL panel. Build
resume opens a Resume Context dialog and maps the submitted text onto the
existing copied document. Download resume exports that document as PDF.
Exchange stores the main supported-AI URL before navigating the main tab to
the job URL; the next Exchange restores the stored chat URL.

The Application workspace URL bar edits the embedded resume URL. Press Enter
or use Refresh to validate, save, and reload it, while Copy copies the current
field value. Pickup opens job or supported AI URLs in a new Chrome window
positioned on the right. For Save App, AI Pickup becomes available as soon as
the selected provider's exact conversation URL is captured, even while that
conversation is still open in the main tab. The Notes icon
to the left of Refresh opens the current profile's notes in a modal.

Build resume maps each non-empty input line to the next existing text paragraph
in the current copied Google Doc. It retains that document's paragraph
structure, headings, bullets, tables, and existing text-style pattern. Blank
input lines are ignored, and unused existing text paragraphs are cleared
without deleting their paragraph formatting. The configured master template is
never edited, and no placeholder is required.

No new Chrome tab group is created by `Save App`. It accepts an ungrouped or
already-grouped job tab and leaves any existing group unchanged. While a
ChatGPT or DeepSeek action is running, Cancel Process stays at the far right of
the matching workspace header. During a No Model save, every participating
profile panel has a Cancel Process button; any one cancels the shared run. The
header Exchange icon that switches between
Home and Application workspaces stays disabled on involved tabs until the
final Google Sheet row is saved. Saving that row ends progress immediately.
Cancel Process stops both progress and the active save early. Successful
completion or cancellation keeps profile selections unchanged. ChatGPT and
DeepSeek clear the job description; No Model preserves its unused AI text
inputs. Assigned prompt-resume variants are retained. By default, no profile is
checked; enabling Auto checks that profile automatically. When selection is not
locked by an active save, clicking anywhere in a profile's process panel also
toggles that profile. Its Open Sheet and Delete actions do not toggle selection.
Each tab keeps its manual profile checks, Application workspace details, process
logs, and status
until that Chrome tab is closed. Completed sheet rows and opened tabs are
never rolled back. The newest process log is shown first. No Chrome notification
is created.

While save progress is active, only the Chrome tabs involved in that run
keep the Home/Application workspace switch icon disabled. Other tabs stay unlocked for non-save work, but
another Save App request is rejected until the active run finishes or is cancelled.

Outside save progress, the matching workspace headers show an Exchange icon
for switching between the two views. The Home workspace header also provides
a left-side Settings icon that opens configuration in a modal.

Before `Save App` runs, and on browser tabs that are not bound to the current
saved application, the Application workspace shows an empty resume state and
disabled resume actions. Returning to any selected-provider tab created by the batch
restores that profile's populated side-panel workspace, including after the
side panel is closed and reopened. Each workspace and its process details are
removed only when its bound tab closes; after the final bound tab closes, the
empty Application workspace remains available.

## Google Sheet columns

Each profile uses its own sheet tab. Missing profile tabs are created
automatically. The extension appends seven columns:

| Column | Value |
| --- | --- |
| A | ISO timestamp |
| B | Job-page title |
| C | Profile name, exactly as stored in the app |
| D | Selected AI provider conversation URL, or `No Model` when no AI provider is used (older records may be blank or contain a Context Doc URL) |
| E | Normalized job URL |
| F | Copied resume-document URL |
| G | Reserved (left blank by Save App) |

When a profile tab is created, these column labels are written to row 1 before
the first application is appended. The header row is bold, and cells in columns
A–G use the Google Sheets `CLIP` wrap strategy.
Existing six-column profile tabs are upgraded automatically: column C is
inserted, existing rows receive that tab's profile name, and the previous
columns C-F shift to D-G.

## Other actions

- **Check posting** on the Home workspace sends the current job URL into the
  selected AI chat. An already-open unpinned tab with that chat URL is reused.
  The job and AI tabs are placed in the same group with the AI chat on the left
  and the job on the right. If the AI tab already has a group, the job tab joins
  that group immediately to the AI tab's right; no new group is created.
  Otherwise a new two-tab group is created. The resulting group is named
  `Check with AI`. The URL is submitted automatically when the selected AI chat
  is idle. If that chat is currently responding, the URL is inserted into its
  prompt without being submitted. Focus stays on that AI chat. Settings lets you choose Copilot,
  Perplexity, or DeepSeek and edit each chat URL. Save App
  still records the original job URL in the Google Sheet. Starting Save App also
  moves that job tab into a separate `Saving to Docs` group to the right of the
  selected AI chat. Additional saving tabs reuse that group across Chrome; if
  necessary, the group moves to the selected AI chat's window. It is available on
  job posting pages, not Jobright Recommendations or Google Sheets.
- **Open** in the Home workspace offers counts 1–5, 10, 25, 50, 100, and 150 on
  Jobright's `/jobs/recommend` page. For each eligible recommendation it opens the
  employer's application page in a background tab, removes the app's standard
  tracking parameters from its URL, converts Lever `/apply` links to the base job
  URL, keeps Jobright active, and selects **Already Applied** from that job's
  dislike menu.

  The apply button is a plain `<button>` with no link, and a click the extension
  dispatches carries no user activation, so Chrome's popup blocker discards the
  `window.open` Jobright's handler performs and no tab appears. Clicking is
  therefore not the primary path. `content/jobright.js` runs in the page's own
  realm at `document_start` and reads the job records Jobright loads for itself
  by hooking `fetch` and `XMLHttpRequest` (plus any JSON embedded in the
  document), keeping each job's application URL keyed by job id. The side panel
  looks that URL up by the card's id and hands it to `chrome.tabs.create`, so no
  page interaction is needed to open an application. When a job has no harvested
  URL the run falls back to clicking the button with `window.open` intercepted,
  and then to watching every window for a tab the page managed to open on its
  own; a popup window is folded back into the Jobright window. The interception
  is armed only while a run is in progress, expires on its own after 20 seconds,
  and is disarmed when the run ends so manual apply clicks keep working.

  Marking a job **Already Applied** removes its card, which pulls the next job
  into the virtualized list, so the run simply takes the topmost unprocessed
  card and only scrolls to move past jobs it had to skip. Larger selections run
  in batches of three with a short pause between applications, retry a scan that
  finds nothing up to four times, and stop after six consecutive failures.
  Because the helper script installs at page load, a Jobright tab that was
  already open when the extension was updated has to be reloaded once; the run
  logs how many loaded jobs carry an application URL so this is visible.
- **Make a resume** accepts rows copied from the seven-column Google Sheet
  layout written by Save App: timestamp, job title, profile, AI conversation,
  job page, Google Docs resume, and optional Apply Now (columns A-G). A row with
  only populated columns A-F is also accepted when G is blank.
  No Model rows marked `No Model`, as well as legacy rows with a blank conversation
  column, are accepted. The older
  four-field Profile, Chat, Job, Google Doc format remains supported. URL fields
  can be plain URLs or Markdown links such as `[**URL**](URL)`. It opens every
  job URL in a new main tab and registers each tab in the same full-page
  Application workspace used by Save App. The profile name labels the paired
  Google Docs resume and retrieves that profile's locally saved note.
- Pickup opens an imported ChatGPT or DeepSeek URL in a new
  right-side Chrome window while leaving the job URL in the main tab. For a
  saved AI conversation, the Application workspace also provides a separate
  text box and Send button. Send opens or reuses that exact picked-up tab and
  delivers the entered text to it. Each workspace keeps its own unsent draft.
  Exchange can still swap the stored main-tab job/chat URLs. The Notes icon
  displays the matched profile note in a modal. Switching among imported job
  tabs restores each tab's workspace. Make Resume is available only while the
  current tab is a Google Sheets spreadsheet.
- Profile notes are stored locally for reference and are not sent to an AI provider or
  written to the Google Sheet.

## Keyboard shortcuts

- `Ctrl+Q`: Save App (default Chrome command shortcut)
- `Ctrl+D`: Protected close. With this side panel visible and fully loaded,
  close the current tab only if no profiles are checked (including Auto-selected
  profiles) and the tab is neither saving nor failed. Focus moves immediately
  left after closing; if no left tab exists, Chrome chooses normally. Otherwise
  the tab stays open and the panel explains why. Hidden/closed panels, unknown
  profile state, and switching tabs during the check never authorize a close.
- `Ctrl+W`: Chrome closes the current tab; while this side panel is visible,
  focus then moves to the tab immediately to its left. This also applies to
  closing the active tab with its X button. It does not skip save statuses;
  the save-start switching rules below are separate. If no left neighbor exists,
  Chrome chooses the remaining tab normally. Closing background tabs or entire
  windows does not redirect focus.
- Make Resume, Open, Check posting, Play, and Download Resume are available as unassigned Chrome commands.
- Each action settings modal shows its current shortcut and links to Chrome's
  Extensions Shortcuts page for assignment.
- `Ctrl+A`: Pick up the Application Workspace resume URL in a right-side
  window. Text fields keep the normal Select All behavior.

`Ctrl+Q` is handled whenever the side panel is open. `Ctrl+A` is handled while
the side panel has keyboard focus. If the panel is closed, Chrome ignores both
application actions.

One-time setup for `Ctrl+D`: after reloading the extension, open
`chrome://extensions/shortcuts`, find Application Opener's **Close tab only when
no profiles are selected**, and assign `Ctrl+D` (In Chrome). Chrome will not
automatically override its bookmark shortcut from the extension manifest.
Once assigned, this replaces bookmarking even while the panel is closed
(when protected close does nothing). Use the address-bar star to bookmark.

Chrome reserves `Ctrl+W`, so the extension cannot intercept it or prevent it
from closing saving/failed tabs. Protection for the app's own close actions
still applies. After the side panel is closed or hidden, Chrome's normal
tab-close focus behavior applies.

After Save App accepts a run from either the button or `Ctrl+Q`, its favicon
shows an amber hourglass. Focus moves to the nearest waiting tab to its left,
skipping tabs already saving, saved, or failed. If no waiting tab exists to
the left, focus stays in place without wrapping around.
The source title changes to `Job title — successfully saved` after success
or `Job title — failed` after failure. The favicon becomes a green square check
on success or a red cross on failure. The title has no status emoji, so there
is only one status symbol, visible in narrow and pinned tabs. Waiting tabs retain
their normal titles and site icons. The Home workspace shows `Saved successfully.`
or `Save failed: reason` as a non-blocking alert.

The app's batch-close and pickup-window cleanup actions keep saving and failed
tabs open. A pickup window containing either status is kept open as a whole.
Tabs whose status cannot be checked are not closed, and skipped closes are
reported in the process log. This does not prevent manually closing tabs in Chrome.

After it is opened, the side panel stays available while switching between or
navigating normal tabs, including pinned tabs. Opening `chrome://extensions/`
automatically closes the panel for that tab; returning to any other page enables
it again. Per-tab process and workspace details are kept until those tabs close.

## Configuration and storage

The header Settings modal accepts a Google Spreadsheet URL or ID and an AI
provider. ChatGPT is the default; DeepSeek and No Model are also available.
Application records are routed to the tab matching each selected profile name, and missing
profile tabs are created automatically. The configured default tab name is
retained for backward compatibility.

Profiles, prompts, job descriptions, notes, selected resume variants, and
sheet configuration are stored in `chrome.storage.local`. Manual profile checks,
Application workspace details, process logs, and status are kept per tab in
`chrome.storage.session` until that Chrome tab closes. Auto-enabled profiles are
global and remain checked on every tab. The extension has no application server
or third-party JavaScript dependencies.

Google authorization uses `chrome.identity` and the OAuth configuration in
`manifest.json`. The signed-in account must be able to access the configured
spreadsheet and resume-template documents. If Chrome browser sign-in has been
turned off, a Google action opens Chrome's sign-in settings; turn sign-in back
on, sign in to Google, and retry the action.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this repository directory.
5. Click the extension icon to open the side panel.

## Development checks

There is no build step. The JavaScript files can be syntax-checked with:

```powershell
node --check service-worker.js
node --check sidepanel\sidepanel.js
node --check content\chatgpt.js
node --check content\ai-provider.js
```
