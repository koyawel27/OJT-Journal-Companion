(function () {
  const state = {
    studentProfile: null,
    companyProfile: null,
    weeks: [],
    dailyLogs: [],
    dailyTasks: [],
    selectedWeekId: "",
    copyText: ""
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const element = getElement(id);
    if (element) {
      element.textContent = text;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function sortWeeks(weeks) {
    return [...weeks].sort((first, second) => first.weekNumber - second.weekNumber);
  }

  function getSelectedWeek() {
    return state.weeks.find((week) => week.id === state.selectedWeekId) || null;
  }

  function buildPayload(week) {
    return window.OJTJournalPayload.buildWeeklyJournalPayload({
      week,
      studentProfile: state.studentProfile,
      companyProfile: state.companyProfile,
      dailyLogs: state.dailyLogs,
      dailyTasks: state.dailyTasks
    });
  }

  function renderProfileWarnings() {
    const warnings = [];

    if (!state.studentProfile?.studentName) {
      warnings.push("Student profile is missing. Save it in Profile before copying your final journal.");
    }

    if (!state.companyProfile?.companyName) {
      warnings.push("Company profile is missing. Save it in Profile so your journal shows the right placement.");
    }

    if (warnings.length === 0) {
      return "";
    }

    return `
      <div class="preview-warnings">
        ${warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("")}
      </div>
    `;
  }

  function renderTaskBullets(tasks) {
    const taskBullets = tasks.map(window.OJTJournalPayload.getTaskCopyText).filter(Boolean);

    if (taskBullets.length === 0) {
      return '<p class="empty-state">No task items recorded for this day.</p>';
    }

    return `
      <ul class="preview-task-list">
        ${taskBullets
          .map((taskText) => `<li>${escapeHtml(taskText)}</li>`)
          .join("")}
      </ul>
    `;
  }

  function renderDailyAccomplishment(day) {
    const dailyLog = day.dailyLog;

    if (!dailyLog) {
      return '<p class="empty-state">No daily log recorded.</p>';
    }

    const dayStatus = day.dayStatus;
    const remarks = String(dailyLog.dayRemarks || "").trim();

    if (dayStatus === "Absent" || dayStatus === "No OJT / Rest Day") {
      return `
        <p class="preview-status-line">${escapeHtml(dayStatus)}</p>
        ${remarks ? `<p class="preview-day-remarks">${escapeHtml(remarks)}</p>` : ""}
      `;
    }

    return renderTaskBullets(day.tasks);
  }

  function renderDailyRows(payload) {
    if (payload.days.length === 0) {
      return `
        <div class="preview-table-row">
          <div class="preview-day-cell">No dates</div>
          <div class="preview-work-cell"><p class="empty-state">No inclusive date range saved for this week.</p></div>
        </div>
      `;
    }

    return payload.days.map((day) => {
      return `
        <div class="preview-table-row">
          <div class="preview-day-cell">
            <strong>${escapeHtml(day.dayLabel)}</strong>
            <span>${escapeHtml(day.date)}</span>
            ${day.dayStatus ? `<span>${escapeHtml(day.dayStatus)}</span>` : ""}
          </div>
          <div class="preview-work-cell">${renderDailyAccomplishment(day)}</div>
        </div>
      `;
    }).join("");
  }

  function renderDailyLogEmptyNote(payload) {
    if (payload.dailyLogCount > 0) {
      return "";
    }

    return '<p class="empty-state preview-empty-note">No daily logs are saved for this week yet.</p>';
  }

  function renderSummarySection(title, content) {
    const summaryText = window.OJTJournalPayload.getSummaryText(content);
    const isEmpty = !String(content || "").trim();

    return `
      <section class="preview-section-block">
        <h4>${escapeHtml(title)}</h4>
        <p class="${isEmpty ? "empty-state" : ""}">${escapeHtml(summaryText)}</p>
      </section>
    `;
  }

  function buildPlainText(payload) {
    const lines = [];

    lines.push(`Student Name: ${payload.studentName || "Not set"}`);
    lines.push(`Company: ${payload.companyName || "Not set"}`);
    lines.push(`Week Number: ${payload.weekNumber || "Not set"}`);
    lines.push(`Inclusive Dates: ${payload.inclusiveStartDate || "Not set"} to ${payload.inclusiveEndDate || "Not set"}`);
    lines.push("");
    lines.push("DAILY ACCOMPLISHMENTS");

    if (payload.days.length === 0) {
      lines.push("No inclusive date range saved for this week.");
    }

    payload.days.forEach((day) => {
      lines.push("");
      lines.push(`${day.dayLabel} - ${day.date}`);

      if (!day.dailyLog) {
        lines.push("- No daily log recorded.");
        return;
      }

      day.copyText.split("\n").forEach((line) => {
        lines.push(`- ${line}`);
      });
    });

    lines.push("");
    lines.push(`Total weekly Hours Rendered: ${payload.totalRenderedDisplay}`);
    lines.push("");
    lines.push("Skills Learned:");
    lines.push(payload.summaryDisplay.weeklySkillsLearned);
    lines.push("");
    lines.push("Problems Encountered:");
    lines.push(payload.summaryDisplay.problemsEncountered);
    lines.push("");
    lines.push("Reflection (Points of Learning):");
    lines.push(payload.summaryDisplay.reflectionOrPointsOfLearning);

    return lines.join("\n");
  }

  function renderPreview() {
    const output = getElement("weekly-preview-output");
    const copyButton = getElement("copy-weekly-journal-button");
    const week = getSelectedWeek();

    window.OJTUI.clearFormMessage(getElement("weekly-preview-message"));
    state.copyText = "";

    if (!output || !copyButton) {
      return;
    }

    if (!week) {
      output.innerHTML = '<p class="empty-state">Choose a saved week to preview your weekly journal.</p>';
      copyButton.disabled = true;
      return;
    }

    const payload = buildPayload(week);
    state.copyText = buildPlainText(payload);
    copyButton.disabled = false;

    output.innerHTML = `
      ${renderProfileWarnings()}
      <article class="journal-preview-card">
        <div class="preview-info-grid">
          <div>
            <span>Student Name</span>
            <strong>${escapeHtml(payload.studentName || "Not set")}</strong>
          </div>
          <div>
            <span>Company</span>
            <strong>${escapeHtml(payload.companyName || "Not set")}</strong>
          </div>
          <div>
            <span>Week Number</span>
            <strong>${escapeHtml(payload.weekNumber || "Not set")}</strong>
          </div>
          <div>
            <span>Inclusive Dates</span>
            <strong>${escapeHtml(payload.inclusiveStartDate || "Not set")} to ${escapeHtml(payload.inclusiveEndDate || "Not set")}</strong>
          </div>
        </div>

        <section class="preview-section-block preview-accomplishments-section">
          <h4>Daily Accomplishments</h4>
          ${renderDailyLogEmptyNote(payload)}
          <div class="preview-table">
            <div class="preview-table-header">
              <div>Day</div>
              <div>Daily Accomplishments</div>
            </div>
            ${renderDailyRows(payload)}
          </div>
        </section>

        <section class="preview-total-row">
          <span>Total weekly Hours Rendered</span>
          <strong>${escapeHtml(payload.totalRenderedDisplay)}</strong>
        </section>

        ${renderSummarySection("Skills Learned", week.weeklySkillsLearned)}
        ${renderSummarySection("Problems Encountered", week.problemsEncountered)}
        ${renderSummarySection("Reflection (Points of Learning)", week.reflectionOrPointsOfLearning)}
      </article>
    `;
  }

  function setWeekOptions() {
    const select = getElement("weekly-preview-week-select");
    const sortedWeeks = sortWeeks(state.weeks);

    if (!select) {
      return;
    }

    select.innerHTML = '<option value="">Choose a week</option>';

    sortedWeeks.forEach((week) => {
      const option = document.createElement("option");
      option.value = week.id;
      option.textContent = `Week ${week.weekNumber} (${week.inclusiveStartDate} to ${week.inclusiveEndDate})`;
      select.appendChild(option);
    });

    select.disabled = sortedWeeks.length === 0;

    if (state.selectedWeekId && sortedWeeks.some((week) => week.id === state.selectedWeekId)) {
      select.value = state.selectedWeekId;
    } else {
      state.selectedWeekId = "";
      select.value = "";
    }

    setText(
      "weekly-preview-help",
      sortedWeeks.length === 0 ? "Create a week in Weeks first, then return here to preview." : "Choose a week to preview, then copy the journal text."
    );
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (!copied) {
      throw new Error("Clipboard fallback failed.");
    }
  }

  async function copyWeeklyJournal() {
    const messageElement = getElement("weekly-preview-message");
    window.OJTUI.clearFormMessage(messageElement);

    if (!state.copyText) {
      window.OJTUI.showFormMessage(messageElement, "Choose a week before copying.", "error");
      return;
    }

    try {
      await copyTextToClipboard(state.copyText);
      window.OJTUI.showFormMessage(messageElement, "Weekly journal copied to clipboard.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Copy failed — select and copy the preview manually.", "error");
      console.error(error);
    }
  }

  async function loadPreviewData() {
    try {
      const [studentProfile, companyProfile, weeks, dailyLogs, dailyTasks] = await Promise.all([
        window.OJTStorage.getStudentProfile(),
        window.OJTStorage.getCompanyProfile(),
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs(),
        window.OJTStorage.getDailyTasks()
      ]);

      state.studentProfile = studentProfile;
      state.companyProfile = companyProfile;
      state.weeks = weeks;
      state.dailyLogs = dailyLogs;
      state.dailyTasks = dailyTasks;

      setWeekOptions();
      renderPreview();
    } catch (error) {
      const output = getElement("weekly-preview-output");
      if (output) {
        output.innerHTML = '<p class="empty-state">Could not load preview. Refresh and try again.</p>';
      }
      console.error(error);
    }
  }

  function bindPreviewEvents() {
    getElement("weekly-preview-week-select")?.addEventListener("change", (event) => {
      state.selectedWeekId = event.target.value;
      renderPreview();
    });

    getElement("copy-weekly-journal-button")?.addEventListener("click", copyWeeklyJournal);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindPreviewEvents();
    loadPreviewData();
  });

  document.addEventListener("ojt:section-change", (event) => {
    if (event.detail?.sectionId === "weekly-preview") {
      loadPreviewData();
    }
  });
})();
