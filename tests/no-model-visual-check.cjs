// Optional visual QA: NODE_PATH must expose Playwright. Pass a screenshot folder.
// Uses synthetic data and an isolated browser; never calls Chrome extension or Google APIs.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "sidepanel/sidepanel.css"), "utf8");
const source = fs.readFileSync(path.join(root, "sidepanel/sidepanel.js"), "utf8");
const renderer = ["isGoogleSheetsDocumentUrl", "createNoModelProfileProgress"].map((name) =>
  source.match(new RegExp("^function " + name + "\\b[\\s\\S]*?^}\\r?$", "m"))[0]
).join("\n");
const outputDir = process.argv[2];
if (!outputDir) throw new Error("Pass a screenshot output directory.");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.argv[3] || undefined
  });
  try {
    const page = await browser.newPage({ reducedMotion: "reduce" });
    await page.route("**/*", (route) => route.abort());
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(`<!doctype html>
      <html><head><style>${css}</style></head><body><main class="app">
        <section class="card profile-picker-card">
          <div class="card-title-row"><h2>Profiles</h2></div>
          <ul id="profileList" class="profile-list" aria-label="Profiles"></ul>
        </section>
      </main></body></html>`);
    await page.addScriptTag({ content: `
      ${renderer}
      const areActionButtonsDisabled = false;
      let savePostProcessState = null;
      let isSavePostProcessRequestPending = false;
      function isSavePostProcessActive(state = savePostProcessState) {
        return Boolean(state?.runId);
      }
      async function cancelSavePostProcess() {}
      function requestDeleteNoModelProfileApplication() {}
      const profileList = document.getElementById("profileList");
      function addProfileCard(report, profile) {
        const item = document.createElement("li");
        item.className = "profile-item has-no-model-progress";
        item.dataset.profileId = profile.id;
        item.dataset.saveStatus = profile.status;
        const header = document.createElement("div");
        header.className = "profile-item-header";
        const drag = document.createElement("span");
        drag.className = "profile-drag-handle";
        drag.textContent = "\\u22ee";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "profile-selection-checkbox";
        checkbox.checked = true;
        const label = document.createElement("button");
        label.className = "profile-copy profile-name profile-selection-label";
        const labelText = document.createElement("span");
        labelText.className = "profile-label";
        labelText.textContent = profile.name;
        label.append(labelText);
        const actions = document.createElement("div");
        actions.className = "profile-actions";
        const auto = document.createElement("button");
        auto.className = "profile-auto-select";
        auto.textContent = "Auto";
        actions.append(auto);
        header.append(drag, checkbox, label, actions);
        item.append(header, createNoModelProfileProgress(report, profile));
        profileList.append(item);
      }
      function previewStatus(status) {
        const report = {
          runId: status === "running" ? "visual-run" : "",
          jobTitle: "Senior software engineer - Platform",
          status,
          jobUrl: "https://jobs.example/42",
          error: ["failed", "cancelled"].includes(status)
            ? "Save stopped. Completed records are kept; check the sheet before retrying."
            : "",
          profiles: [
            { id: "frontend", name: "Frontend",
              status: status === "idle" ? "idle" : "saved",
              stage: status === "idle" ? "idle" : "done",
              resumeUrl: status === "idle" ? "" : "https://docs.google.com/document/d/one/edit",
              sheetUrl: status === "idle" ? "" : "https://docs.google.com/spreadsheets/d/test/edit#gid=1" },
            { id: "backend", name: "Backend / Platform engineering",
              status: status === "idle" ? "idle" : status === "completed" ? "saved" : status === "running" ? "running" : status,
              stage: status === "idle" ? "idle" : status === "completed" ? "done" : "sheet",
              resumeUrl: status === "idle" ? "" : "https://docs.google.com/document/d/two/edit",
              sheetUrl: status === "completed"
                ? "https://docs.google.com/spreadsheets/d/test/edit#gid=2"
                : "" },
            { id: "data", name: "Data and analytics",
              status: status === "idle" ? "idle" : status === "completed" ? "saved" : status === "running" ? "queued" :
                status === "cancelled" ? "cancelled" : "skipped",
              stage: status === "completed" ? "done" : "resume",
              resumeUrl: status === "completed"
                ? "https://docs.google.com/document/d/three/edit"
                : "",
              sheetUrl: status === "completed"
                ? "https://docs.google.com/spreadsheets/d/test/edit#gid=3"
                : "" }
          ]
        };
        savePostProcessState = status === "running"
          ? { runId: report.runId }
          : null;
        profileList.replaceChildren();
        report.profiles.forEach((profile) => addProfileCard(report, profile));
      }
    ` });
    fs.mkdirSync(outputDir, { recursive: true });
    for (const width of [320, 440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const status of ["idle", "running", "completed", "failed", "cancelled"]) {
        await page.evaluate((value) => previewStatus(value), status);
        const dimensions = await page.evaluate(() => ({
          bodyWidth: document.documentElement.clientWidth,
          contentWidth: document.documentElement.scrollWidth,
          profileCount: document.querySelectorAll(".profile-item").length,
          embeddedProgressCount:
            document.querySelectorAll(".profile-item > .no-model-profile-progress").length,
          standalonePanelCount: document.querySelectorAll("#noModelProgressPanel").length,
          errorCount: document.querySelectorAll(".no-model-profile-error").length,
          openSheetCount:
            document.querySelectorAll(".no-model-profile-open-sheet").length,
          deleteCount: document.querySelectorAll(".no-model-profile-delete").length,
          cancelCount: document.querySelectorAll(".no-model-profile-cancel").length,
          disabledProgressCount:
            document.querySelectorAll(".no-model-profile-progress.is-disabled").length,
          activeConnectorCount:
            document.querySelectorAll('[data-connector-state="active"]').length
        }));
        assert.equal(dimensions.profileCount, 3);
        assert.equal(dimensions.embeddedProgressCount, 3);
        assert.equal(dimensions.standalonePanelCount, 0);
        assert.equal(
          dimensions.errorCount,
          status === "failed" ? 1 : status === "cancelled" ? 2 : 0
        );
        const completedCount = status === "idle" ? 0 : status === "completed" ? 3 : 1;
        assert.equal(dimensions.openSheetCount, completedCount);
        assert.equal(dimensions.deleteCount, completedCount);
        assert.equal(dimensions.cancelCount, status === "running" ? 3 : 0);
        assert.equal(dimensions.disabledProgressCount, status === "idle" ? 3 : 0);
        assert.equal(dimensions.activeConnectorCount, status === "running" ? 1 : 0);
        assert.ok(
          dimensions.contentWidth <= dimensions.bodyWidth,
          JSON.stringify(dimensions)
        );
        await page.screenshot({
          path: path.join(outputDir, `no-model-embedded-${status}-${width}.png`),
          fullPage: true
        });
      }
    }
    assert.equal(await page.evaluate(() => {
      const card = document.createElement("section");
      card.className = "card job-description-card is-hidden";
      document.body.append(card);
      const hidden = getComputedStyle(card).display === "none";
      card.remove();
      return hidden;
    }), true);
    assert.deepEqual(errors, []);
    console.log(
      "Visual QA passed: embedded profile progress at 320px and 440px, all states, no overflow."
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
