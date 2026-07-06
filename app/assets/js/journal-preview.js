(function () {
  const state = {
    studentProfile: null,
    companyProfile: null,
    weeks: [],
    dailyLogs: [],
    dailyTasks: [],
    photoAttachments: [],
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

  function parseDate(dateText) {
    const [year, month, day] = dateText.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function sortWeeks(weeks) {
    return [...weeks].sort((first, second) => first.weekNumber - second.weekNumber);
  }

  function sortDailyLogs(logs) {
    return [...logs].sort((first, second) => first.entryDate.localeCompare(second.entryDate));
  }

  function sortTasks(tasks) {
    return [...tasks].sort((first, second) => {
      return (first.sortOrder || 0) - (second.sortOrder || 0) ||
        String(first.createdAt || "").localeCompare(String(second.createdAt || ""));
    });
  }

  function formatRenderedTime(minutes) {
    return window.OJTCalculations.formatRenderedTime(minutes);
  }

  function getSelectedWeek() {
    return state.weeks.find((week) => week.id === state.selectedWeekId) || null;
  }

  function getLogsForWeek(weekId) {
    return sortDailyLogs(state.dailyLogs.filter((log) => log.weekId === weekId));
  }

  function getDailyLogForDate(weekId, dateText) {
    return state.dailyLogs.find((log) => log.weekId === weekId && log.entryDate === dateText) || null;
  }

  function getTasksForLog(dailyLogId) {
    return sortTasks(state.dailyTasks.filter((task) => task.dailyLogId === dailyLogId));
  }

  function getPhotoCountForLog(dailyLogId) {
    return state.photoAttachments.filter((photo) => photo.dailyLogId === dailyLogId).length;
  }

  function getPhotosForLog(dailyLogId) {
    return state.photoAttachments.filter((photo) => photo.dailyLogId === dailyLogId);
  }

  function normalizeDayStatus(value) {
    return window.OJTCalculations.normalizeDayStatus(value);
  }

  function normalizePhotoCategory(value) {
    return window.OJTPhotos.normalizePhotoCategory(value);
  }

  function getPhotoCategorySummary(dailyLogId) {
    const categoryCounts = getPhotosForLog(dailyLogId).reduce((summary, photo) => {
      const category = normalizePhotoCategory(photo.photoCategory);
      summary[category] = (summary[category] || 0) + 1;
      return summary;
    }, {});

    return Object.entries(categoryCounts)
      .map(([category, count]) => `${category}: ${count}`)
      .join(", ");
  }

  function getWeekDates(week) {
    if (!week?.inclusiveStartDate || !week?.inclusiveEndDate) {
      return [];
    }

    const dates = [];
    const currentDate = parseDate(week.inclusiveStartDate);
    const endDate = parseDate(week.inclusiveEndDate);

    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  function getTaskText(task) {
    const parts = [task.description];

    if (Number(task.timeSpentMinutes) > 0) {
      parts.push(`${task.timeSpentMinutes} min`);
    }

    if (task.status) {
      parts.push(task.status);
    }

    if (task.notes) {
      parts.push(task.notes);
    }

    return parts.filter(Boolean).join(" - ");
  }

  function renderProfileWarnings() {
    const warnings = [];

    if (!state.studentProfile?.studentName) {
      warnings.push("Student profile is missing. Save your student profile before copying final journal content.");
    }

    if (!state.companyProfile?.companyName) {
      warnings.push("Company profile is missing. Save your company profile before copying final journal content.");
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
    if (tasks.length === 0) {
      return '<p class="empty-state">No task/work items recorded.</p>';
    }

    return `
      <ul class="preview-task-list">
        ${tasks.map((task) => `<li>${escapeHtml(getTaskText(task))}</li>`).join("")}
      </ul>
    `;
  }

  function renderDailyRows(week) {
    const dates = getWeekDates(week);

    if (dates.length === 0) {
      return `
        <div class="preview-table-row">
          <div class="preview-day-cell">No dates</div>
          <div class="preview-work-cell"><p class="empty-state">No inclusive date range saved for this week.</p></div>
        </div>
      `;
    }

    return dates.map((dateText, index) => {
      const dailyLog = getDailyLogForDate(week.id, dateText);
      const tasks = dailyLog ? getTasksForLog(dailyLog.id) : [];
      const photoCount = dailyLog ? getPhotoCountForLog(dailyLog.id) : 0;
      const dayStatus = dailyLog ? normalizeDayStatus(dailyLog.dayStatus) : "";
      const categorySummary = dailyLog ? getPhotoCategorySummary(dailyLog.id) : "";
      const workHtml = dailyLog
        ? renderTaskBullets(tasks)
        : '<p class="empty-state">No daily log recorded.</p>';
      const photoText = dailyLog
        ? `<p class="preview-photo-count">Photo documentation: ${photoCount === 1 ? "1 attached" : `${photoCount} attached`}.${categorySummary ? ` ${escapeHtml(categorySummary)}.` : ""}</p>`
        : "";
      const remarksText = dailyLog?.dayRemarks
        ? `<p class="preview-day-remarks">Remarks: ${escapeHtml(dailyLog.dayRemarks)}</p>`
        : "";

      return `
        <div class="preview-table-row">
          <div class="preview-day-cell">
            <strong>Day ${index + 1}</strong>
            <span>${escapeHtml(dateText)}</span>
            ${dayStatus ? `<span>${escapeHtml(dayStatus)}</span>` : ""}
          </div>
          <div class="preview-work-cell">${workHtml}${remarksText}${photoText}</div>
        </div>
      `;
    }).join("");
  }

  function getWeekTotalText(week) {
    return formatRenderedTime(window.OJTCalculations.sumRenderedMinutes(getLogsForWeek(week.id)));
  }

  function renderSummarySection(title, content) {
    return `
      <section class="preview-section-block">
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(content || "Not filled in yet.")}</p>
      </section>
    `;
  }

  function buildPlainText(week) {
    const lines = [];
    const dates = getWeekDates(week);

    lines.push(`Student Name: ${state.studentProfile?.studentName || "Not set"}`);
    lines.push(`Company: ${state.companyProfile?.companyName || "Not set"}`);
    lines.push(`Week Number: ${week.weekNumber || "Not set"}`);
    lines.push(`Inclusive Dates: ${week.inclusiveStartDate || "Not set"} to ${week.inclusiveEndDate || "Not set"}`);
    lines.push("");
    lines.push("Daily Accomplishments:");

    if (dates.length === 0) {
      lines.push("No inclusive date range saved for this week.");
    }

    dates.forEach((dateText, index) => {
      const dailyLog = getDailyLogForDate(week.id, dateText);
      const tasks = dailyLog ? getTasksForLog(dailyLog.id) : [];
      const photoCount = dailyLog ? getPhotoCountForLog(dailyLog.id) : 0;
      const categorySummary = dailyLog ? getPhotoCategorySummary(dailyLog.id) : "";

      lines.push(`Day ${index + 1} - ${dateText}`);

      if (!dailyLog) {
        lines.push("- No daily log recorded.");
        return;
      }

      lines.push(`Status: ${normalizeDayStatus(dailyLog.dayStatus)}`);

      if (tasks.length === 0) {
        lines.push("- No task/work items recorded.");
      } else {
        tasks.forEach((task) => {
          lines.push(`- ${getTaskText(task)}`);
        });
      }

      if (dailyLog.dayRemarks) {
        lines.push(`Remarks: ${dailyLog.dayRemarks}`);
      }

      lines.push(`Photo documentation: ${photoCount === 1 ? "1 attached" : `${photoCount} attached`}.${categorySummary ? ` ${categorySummary}.` : ""}`);
    });

    lines.push("");
    lines.push(`Total Weekly Hours Rendered: ${getWeekTotalText(week)}`);
    lines.push("");
    lines.push("Skills Learned:");
    lines.push(week.weeklySkillsLearned || "Not filled in yet.");
    lines.push("");
    lines.push("Problems Encountered:");
    lines.push(week.problemsEncountered || "Not filled in yet.");
    lines.push("");
    lines.push("Reflection / Points of Learning:");
    lines.push(week.reflectionOrPointsOfLearning || "Not filled in yet.");

    if (week.additionalNotes) {
      lines.push("");
      lines.push("Additional Notes:");
      lines.push(week.additionalNotes);
    }

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
      output.innerHTML = '<p class="empty-state">Choose a saved week to generate a weekly journal preview.</p>';
      copyButton.disabled = true;
      return;
    }

    const hasAdditionalNotes = Boolean(String(week.additionalNotes || "").trim());
    state.copyText = buildPlainText(week);
    copyButton.disabled = false;

    output.innerHTML = `
      ${renderProfileWarnings()}
      <article class="journal-preview-card">
        <div class="preview-info-grid">
          <div>
            <span>Student Name</span>
            <strong>${escapeHtml(state.studentProfile?.studentName || "Not set")}</strong>
          </div>
          <div>
            <span>Company</span>
            <strong>${escapeHtml(state.companyProfile?.companyName || "Not set")}</strong>
          </div>
          <div>
            <span>Week Number</span>
            <strong>${escapeHtml(week.weekNumber || "Not set")}</strong>
          </div>
          <div>
            <span>Inclusive Dates</span>
            <strong>${escapeHtml(week.inclusiveStartDate || "Not set")} to ${escapeHtml(week.inclusiveEndDate || "Not set")}</strong>
          </div>
        </div>

        <section class="preview-section-block">
          <h4>Daily Accomplishments</h4>
          <div class="preview-table">
            <div class="preview-table-header">
              <div>Day / Date</div>
              <div>Task / Work / Accomplishment Bullets</div>
            </div>
            ${renderDailyRows(week)}
          </div>
        </section>

        <section class="preview-total-row">
          <span>Total Weekly Hours Rendered</span>
          <strong>${escapeHtml(getWeekTotalText(week))}</strong>
        </section>

        ${renderSummarySection("Skills Learned", week.weeklySkillsLearned)}
        ${renderSummarySection("Problems Encountered", week.problemsEncountered)}
        ${renderSummarySection("Reflection / Points of Learning", week.reflectionOrPointsOfLearning)}
        ${hasAdditionalNotes ? renderSummarySection("Additional Notes", week.additionalNotes) : ""}
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
      sortedWeeks.length === 0 ? "Create a week first, then return here for preview output." : "Preview and copy prepared journal text."
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
      window.OJTUI.showFormMessage(messageElement, "Choose a week before copying journal content.", "error");
      return;
    }

    try {
      await copyTextToClipboard(state.copyText);
      window.OJTUI.showFormMessage(messageElement, "Weekly journal copied to clipboard.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Copy failed. Please select and copy the preview manually.", "error");
      console.error(error);
    }
  }

  async function loadPreviewData() {
    try {
      const [studentProfile, companyProfile, weeks, dailyLogs, dailyTasks, photoAttachments] = await Promise.all([
        window.OJTStorage.getStudentProfile(),
        window.OJTStorage.getCompanyProfile(),
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs(),
        window.OJTStorage.getDailyTasks(),
        window.OJTStorage.getPhotoAttachments()
      ]);

      state.studentProfile = studentProfile;
      state.companyProfile = companyProfile;
      state.weeks = weeks;
      state.dailyLogs = dailyLogs;
      state.dailyTasks = dailyTasks;
      state.photoAttachments = photoAttachments;

      setWeekOptions();
      renderPreview();
    } catch (error) {
      const output = getElement("weekly-preview-output");
      if (output) {
        output.innerHTML = '<p class="empty-state">Weekly preview data could not be loaded. Please refresh and try again.</p>';
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
