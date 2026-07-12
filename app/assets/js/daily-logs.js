(function () {
  const taskStatuses = ["Pending", "In Progress", "Completed"];
  const dayStatuses = ["Worked", "Absent", "No OJT / Rest Day"];
  const state = {
    weeks: [],
    dailyLogs: [],
    dailyTasks: [],
    photoAttachments: [],
    selectedWeekId: "",
    expandedDate: null,
    activeDailyLogId: null
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function getValue(id) {
    return getElement(id)?.value.trim() || "";
  }

  function setValue(id, value) {
    const element = getElement(id);
    if (element) {
      element.value = value ?? "";
    }
  }

  function setText(id, text) {
    const element = getElement(id);
    if (element) {
      element.textContent = text;
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function createId(prefix) {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function notifyJournalDataChange() {
    document.dispatchEvent(new CustomEvent("ojt:daily-log-data-change"));
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

  function formatDisplayDate(dateText) {
    if (!dateText) {
      return "No date";
    }

    return parseDate(dateText).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function getDayLabel(week, dateText) {
    if (!week || !dateText) {
      return "Day";
    }

    const start = parseDate(week.inclusiveStartDate);
    const current = parseDate(dateText);
    const dayNumber = Math.round((current - start) / 86400000) + 1;

    return `Day ${dayNumber}`;
  }

  function formatRenderedTime(minutes) {
    return window.OJTCalculations.formatRenderedTime(minutes);
  }

  function calculateRenderedTime(timeIn, timeOut, breakMinutes) {
    return window.OJTCalculations.calculateRenderedTime(timeIn, timeOut, breakMinutes);
  }

  function getTaskTotalMinutes(tasks) {
    return window.OJTCalculations.sumTaskMinutes(tasks);
  }

  function normalizeDayStatus(value) {
    return window.OJTCalculations.normalizeDayStatus(value);
  }

  function isWorkedStatus(dayStatus) {
    return normalizeDayStatus(dayStatus) === "Worked";
  }

  function getDailyLogStatus(dailyLog) {
    return normalizeDayStatus(dailyLog?.dayStatus);
  }

  function getDayStatusClass(dayStatus) {
    const normalizedStatus = normalizeDayStatus(dayStatus);

    if (normalizedStatus === "Worked") {
      return "is-worked";
    }

    if (normalizedStatus === "Absent") {
      return "is-absent";
    }

    return "is-rest";
  }

  function renderDayStatusBadge(dayStatus) {
    const normalizedStatus = normalizeDayStatus(dayStatus);
    return `<span class="day-status-badge ${getDayStatusClass(normalizedStatus)}">${escapeHtml(normalizedStatus)}</span>`;
  }

  function getRenderedTimeText(dailyLog) {
    const dayStatus = getDailyLogStatus(dailyLog);
    const renderedMinutes = Number(dailyLog?.renderedMinutes);

    if (dayStatus !== "Worked") {
      return formatRenderedTime(0);
    }

    if (Number.isFinite(renderedMinutes)) {
      return formatRenderedTime(renderedMinutes);
    }

    return "Not calculated";
  }

  function normalizePhotoCategory(value) {
    return window.OJTPhotos.normalizePhotoCategory(value);
  }

  function renderOptions(options, selectedValue) {
    return options.map((option) => {
      const selected = option === selectedValue ? " selected" : "";
      return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
    }).join("");
  }

  function getDayStatusText(dailyLog, taskCount, photoCount) {
    if (!dailyLog) {
      return "No daily log yet";
    }

    const dayStatus = getDailyLogStatus(dailyLog);
    let status = dayStatus;
    const renderedMinutes = Number(dailyLog.renderedMinutes);

    if (dayStatus !== "Worked") {
      status += " - 0h 0m";
    } else if (Number.isFinite(renderedMinutes) && renderedMinutes > 0) {
      status += ` - ${formatRenderedTime(renderedMinutes)}`;
    }

    if (taskCount > 0) {
      status += taskCount === 1 ? " - 1 task item" : ` - ${taskCount} task items`;
    }

    if (photoCount > 0) {
      status += photoCount === 1 ? " - 1 photo" : ` - ${photoCount} photos`;
    }

    return status;
  }

  function sortWeeks(weeks) {
    return window.OJTSelectedWeek?.sortWeeksChronologically(weeks) || [...(weeks || [])];
  }

  function sortDailyLogs(logs) {
    return [...logs].sort((first, second) => first.entryDate.localeCompare(second.entryDate));
  }

  function sortTasks(tasks) {
    return [...tasks].sort((first, second) => {
      return (first.sortOrder || 0) - (second.sortOrder || 0) || first.createdAt.localeCompare(second.createdAt);
    });
  }

  function getSelectedWeek() {
    return state.weeks.find((week) => week.id === state.selectedWeekId) || null;
  }

  function getDailyLogForDate(dateText) {
    return state.dailyLogs.find((log) => log.weekId === state.selectedWeekId && log.entryDate === dateText) || null;
  }

  function getActiveDailyLog() {
    return state.dailyLogs.find((log) => log.id === state.activeDailyLogId) || null;
  }

  function getLogsForWeek(weekId) {
    return sortDailyLogs(state.dailyLogs.filter((log) => log.weekId === weekId));
  }

  function getTasksForDailyLog(dailyLogId) {
    return sortTasks(state.dailyTasks.filter((task) => task.dailyLogId === dailyLogId));
  }

  function getPhotosForDailyLog(dailyLogId) {
    return [...state.photoAttachments]
      .filter((photo) => photo.dailyLogId === dailyLogId)
      .sort((first, second) => String(first.createdAt || "").localeCompare(String(second.createdAt || "")));
  }

  function updateWeekSummary() {
    const logs = getLogsForWeek(state.selectedWeekId);
    const countLabel = getElement("journal-daily-summary");

    if (!countLabel) {
      return;
    }

    if (!state.selectedWeekId) {
      countLabel.textContent = "";
      return;
    }

    const weeklyTotal = window.OJTCalculations.sumRenderedMinutes(logs);
    const logsText = logs.length === 1
      ? "1 daily log saved"
      : `${logs.length} daily logs saved`;

    countLabel.textContent = `${logsText} this week · ${formatRenderedTime(weeklyTotal)} rendered total.`;
  }

  function selectWeek(weekId) {
    window.OJTUI.clearFormMessages(getElement("journal-week-accordions"));
    window.OJTSelectedWeek?.selectWeek(weekId, { weeks: state.weeks, source: "journal:daily-records" });
    state.selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || "";
    state.expandedDate = null;
    state.activeDailyLogId = null;
    renderJournalWeek();
    updateWeekSummary();
  }

  function renderTaskBullets(tasks) {
    if (tasks.length === 0) {
      return '<p class="empty-state">No tasks yet. Save the day record first, then add work items below.</p>';
    }

    return `
      <ul class="task-bullet-list">
        ${tasks.map((task) => {
          const timeText = Number(task.timeSpentMinutes) > 0 ? `${task.timeSpentMinutes} min` : "No task time";
          const notesText = task.notes ? `<p class="task-note">${escapeHtml(task.notes)}</p>` : "";
          return `
            <li class="task-bullet-item">
              <div class="task-bullet-content">
                <div class="task-title-row">
                  <strong>${escapeHtml(task.description)}</strong>
                  <span class="status-pill">${escapeHtml(task.status)}</span>
                </div>
                <div class="task-meta-row">
                  <span>${escapeHtml(timeText)}</span>
                  <span>Documentation only</span>
                </div>
                ${notesText}
              </div>
              <div class="task-bullet-actions">
                <button class="secondary-button" type="button" data-task-action="edit" data-task-id="${task.id}">Edit</button>
                <button class="danger-button" type="button" data-task-action="delete" data-task-id="${task.id}">Delete</button>
              </div>
            </li>
          `;
        }).join("")}
      </ul>
    `;
  }

  function renderRenderedTimePanel(dailyLog, tasks) {
    const dayStatus = getDailyLogStatus(dailyLog);
    const worked = isWorkedStatus(dayStatus);
    const calculation = calculateRenderedTime(
      dailyLog?.timeIn || "",
      dailyLog?.timeOut || "",
      dailyLog?.breakMinutes || 0
    );
    const taskTotalMinutes = getTaskTotalMinutes(tasks);
    const renderedText = !worked
      ? formatRenderedTime(0)
      : calculation.isComplete
      ? formatRenderedTime(calculation.renderedMinutes)
      : "Not calculated";
    const helpText = !worked
      ? "Absent and rest days count as 0 rendered hours."
      : calculation.error || "Enter time in, time out, and break minutes to calculate rendered hours.";
    let taskComparison = "";

    if (worked && taskTotalMinutes > 0) {
      if (calculation.isComplete && taskTotalMinutes !== calculation.renderedMinutes) {
        taskComparison = `
          <p class="time-reference warning">
            Task item time totals ${escapeHtml(formatRenderedTime(taskTotalMinutes))}. Task item time is for documentation only and may not match rendered hours.
          </p>
        `;
      } else {
        taskComparison = `
          <p class="time-reference">
            Task item time total: ${escapeHtml(formatRenderedTime(taskTotalMinutes))}. Task item time is documentation only.
          </p>
        `;
      }
    }

    return `
      <div class="calculation-result" aria-live="polite">
        <span class="card-label">Rendered time</span>
        <strong id="daily-rendered-time-preview">${escapeHtml(renderedText)}</strong>
        <p id="daily-rendered-time-help">${escapeHtml(helpText)}</p>
        ${taskComparison}
      </div>
    `;
  }

  function formatPhotoCreatedAt(createdAt) {
    if (!createdAt) {
      return "No created date";
    }

    return new Date(createdAt).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function renderPhotoList(photos) {
    if (photos.length === 0) {
      return '<p class="empty-state">No photos attached yet. Save the day record first, then add photos below.</p>';
    }

    return `
      <ul class="photo-attachment-list">
        ${photos.map((photo) => `
          <li class="photo-attachment-item">
            <div class="photo-attachment-main">
              <strong>${escapeHtml(photo.fileName || "Untitled photo")}</strong>
              <p class="item-meta">
                ${escapeHtml(photo.fileType || "Unknown type")} - ${escapeHtml(window.OJTPhotos.formatFileSize(photo.fileSize))} - ${escapeHtml(formatPhotoCreatedAt(photo.createdAt))}
              </p>
              <p class="photo-category">Category: ${escapeHtml(normalizePhotoCategory(photo.photoCategory))}</p>
              ${photo.caption ? `<p class="photo-caption">${escapeHtml(photo.caption)}</p>` : '<p class="photo-caption empty-caption">No caption saved.</p>'}
            </div>

            <details class="photo-caption-details">
              <summary>Edit caption and photo actions</summary>
              <form class="photo-caption-form" data-photo-caption-form data-photo-id="${escapeHtml(photo.id)}" novalidate>
                <label class="field">
                  <span>Caption</span>
                  <textarea name="caption" rows="2">${escapeHtml(photo.caption)}</textarea>
                </label>
                <div class="form-actions">
                  <button class="secondary-button" type="submit">Save caption</button>
                  <button class="secondary-button" type="button" data-photo-action="download" data-photo-id="${escapeHtml(photo.id)}">Download</button>
                  <button class="danger-button" type="button" data-photo-action="delete" data-photo-id="${escapeHtml(photo.id)}">Delete</button>
                  <p class="form-message" hidden></p>
                </div>
              </form>
            </details>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderPhotoSection(dailyLog) {
    if (!dailyLog) {
      return `
        <section class="photo-documentation-panel">
          <div class="journal-col-header">
            <span class="card-label">Photo documentation</span>
            <h4>Attached photos</h4>
            <p class="phase-note">Save the day record before attaching photos.</p>
          </div>
        </section>
      `;
    }

    const photos = getPhotosForDailyLog(dailyLog.id);

    return `
      <section class="photo-documentation-panel" aria-labelledby="photo-documentation-title-${escapeHtml(dailyLog.id)}">
        <div class="journal-col-header">
          <span class="card-label">Photo documentation</span>
          <h4 id="photo-documentation-title-${escapeHtml(dailyLog.id)}">Attached photos</h4>
          <p class="phase-note">Optional — attach JPEG, PNG, or WebP up to ${escapeHtml(window.OJTPhotos.formatFileSize(window.OJTPhotos.maxPhotoSizeBytes))}.</p>
        </div>

        <div class="photo-attachment-list-wrap" id="photo-attachment-list">
          ${renderPhotoList(photos)}
        </div>

        <form class="photo-upload-form" id="photo-upload-form" data-daily-log-id="${escapeHtml(dailyLog.id)}" novalidate>
          <div class="form-grid">
            <label class="field">
              <span>Photo file</span>
              <input type="file" id="photo-upload-file" accept="image/jpeg,image/png,image/webp">
            </label>
            <label class="field">
              <span>Category</span>
              <select id="photo-upload-category">
                ${renderOptions(window.OJTPhotos.photoCategories, "General Documentation")}
              </select>
            </label>
            <label class="field field-wide">
              <span>Caption</span>
              <textarea id="photo-upload-caption" rows="2" placeholder="Optional caption"></textarea>
            </label>
          </div>

          <div class="form-actions">
            <button class="primary-button" type="submit">Attach photo</button>
            <p class="form-message" id="photo-upload-message" hidden></p>
          </div>
        </form>
      </section>
    `;
  }

  function renderDayEditorBody(week, dateText, dailyLog) {
    const dayLabel = getDayLabel(week, dateText);
    const dayStatus = getDailyLogStatus(dailyLog);
    const worked = isWorkedStatus(dayStatus);
    const timeFieldState = worked ? "" : "disabled";
    const timePanelClass = worked ? "" : " is-muted";
    const tasks = dailyLog ? getTasksForDailyLog(dailyLog.id) : [];
    const tasksEnabled = Boolean(dailyLog);
    const deleteButton = dailyLog
      ? `<button class="danger-button" type="button" data-log-action="delete" data-log-id="${dailyLog.id}">Delete day record</button>`
      : "";

    return `
      <div class="journal-row">
        <div class="journal-col journal-col-time">
          <form class="day-record-form" id="daily-log-form" novalidate>
            <input type="hidden" id="daily-log-id" value="${escapeHtml(dailyLog?.id || "")}">
            <input type="hidden" id="daily-log-form-week" value="${escapeHtml(week.id)}">
            <input type="hidden" id="daily-log-entry-date" value="${escapeHtml(dateText)}">

            <span class="card-label">${escapeHtml(dayLabel)}</span>
            <h4 class="journal-day-heading">${escapeHtml(formatDisplayDate(dateText))}</h4>

            <label class="field">
              <span>Day status</span>
              <select id="daily-log-day-status">
                ${renderOptions(dayStatuses, dayStatus)}
              </select>
            </label>

            <label class="field time-field${timePanelClass}">
              <span>Time in</span>
              <input type="time" id="daily-log-time-in" value="${escapeHtml(dailyLog?.timeIn || "")}" ${timeFieldState}>
            </label>
            <label class="field time-field${timePanelClass}">
              <span>Time out</span>
              <input type="time" id="daily-log-time-out" value="${escapeHtml(dailyLog?.timeOut || "")}" ${timeFieldState}>
            </label>
            <label class="field time-field${timePanelClass}">
              <span>Break minutes</span>
              <input type="number" id="daily-log-break-minutes" min="0" step="1" inputmode="numeric" placeholder="0" value="${dailyLog?.breakMinutes ? dailyLog.breakMinutes : ""}" ${timeFieldState}>
            </label>
            <label class="field field-wide">
              <span>Day remarks</span>
              <textarea id="daily-log-day-remarks" rows="2" placeholder="Optional reason or notes">${escapeHtml(dailyLog?.dayRemarks || "")}</textarea>
            </label>

            ${renderRenderedTimePanel(dailyLog, tasks)}

            <div class="form-actions">
              <button class="primary-button" type="submit" id="save-daily-log-button">${dailyLog ? "Save day record" : "Save day record"}</button>
              ${deleteButton}
              <p class="form-message" id="daily-log-form-message" hidden></p>
            </div>
          </form>
        </div>

        <div class="journal-col journal-col-tasks">
          <div class="journal-col-header">
            <span class="card-label">Task/work items</span>
            <h4>Accomplishments</h4>
            <p class="phase-note">${tasksEnabled ? "Add what you accomplished today — these become journal bullets." : "Save the day record first, then add task items here."}</p>
          </div>

          <div class="task-list-display" id="daily-task-list">
            ${tasksEnabled ? renderTaskBullets(tasks) : '<p class="empty-state">Task items appear here after you save the day record.</p>'}
          </div>

          <form class="task-form" id="daily-task-form" novalidate>
            <input type="hidden" id="daily-task-id" value="">
            <div class="form-grid">
              <label class="field field-wide">
                <span>Task or work item description</span>
                <input type="text" id="daily-task-description" ${tasksEnabled ? "" : "disabled"} required>
              </label>
              <label class="field">
                <span>Time spent in minutes</span>
                <input type="number" id="daily-task-time-spent" min="0" step="1" inputmode="numeric" placeholder="Optional" ${tasksEnabled ? "" : "disabled"}>
              </label>
              <label class="field">
                <span>Status</span>
                <select id="daily-task-status" ${tasksEnabled ? "" : "disabled"}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
              <label class="field field-wide">
                <span>Task notes</span>
                <textarea id="daily-task-notes" rows="2" ${tasksEnabled ? "" : "disabled"}></textarea>
              </label>
            </div>

            <p class="phase-note">Task time is for your notes only — rendered hours come from time in, time out, and break.</p>

            <div class="form-actions">
              <button class="primary-button" type="submit" id="save-daily-task-button" ${tasksEnabled ? "" : "disabled"}>Save task item</button>
              <button class="secondary-button" type="button" id="cancel-daily-task-edit-button" hidden>Cancel task edit</button>
              <p class="form-message" id="daily-task-form-message" hidden></p>
            </div>
          </form>
        </div>
      </div>

      ${renderPhotoSection(dailyLog)}
    `;
  }

  function renderDayCard(week, dateText, dayNumber, dailyLog) {
    const tasks = dailyLog ? getTasksForDailyLog(dailyLog.id) : [];
    const photos = dailyLog ? getPhotosForDailyLog(dailyLog.id) : [];
    const dayStatus = dailyLog ? getDailyLogStatus(dailyLog) : "No log yet";
    const renderedText = dailyLog && getDailyLogStatus(dailyLog) === "Worked"
      ? getRenderedTimeText(dailyLog)
      : "";
    const taskText = tasks.length > 0 ? (tasks.length === 1 ? "1 task" : `${tasks.length} tasks`) : "";
    const photoText = photos.length > 0 ? (photos.length === 1 ? "1 photo" : `${photos.length} photos`) : "";
    const metaItems = [renderedText, taskText, photoText].filter(Boolean);
    const statusMarkup = dailyLog
      ? renderDayStatusBadge(dayStatus)
      : '<span class="day-status-badge is-empty">Not logged yet</span>';
    const actionText = dailyLog ? "Open / Edit" : "Create Log";

    return `
      <button class="daily-log-day-card" type="button" data-day-action="open" data-date="${escapeHtml(dateText)}">
        <span class="day-card-main">
          <span class="day-card-label">Day ${escapeHtml(dayNumber)}</span>
          <strong>${escapeHtml(formatDisplayDate(dateText))}</strong>
        </span>
        <span class="day-card-summary">
          ${statusMarkup}
          <span class="day-card-meta">${metaItems.length > 0 ? metaItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : "Tap to log this day"}</span>
        </span>
        <span class="day-card-action">${escapeHtml(actionText)}</span>
      </button>
    `;
  }

  function renderDayEditorModal(week, dateText, dailyLog) {
    if (!dateText) {
      return "";
    }

    const dayLabel = getDayLabel(week, dateText);
    const titleId = `daily-log-editor-title-${dateText}`;
    const statusMarkup = dailyLog
      ? renderDayStatusBadge(dailyLog.dayStatus)
      : '<span class="day-status-badge is-empty">Not logged yet</span>';

    return `
      <div class="daily-log-editor-overlay" data-editor-close="true">
        <section class="daily-log-editor-panel" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(titleId)}">
          <div class="daily-log-editor-header">
            <div>
              <span class="card-label">Daily Log Editor</span>
              <h3 id="${escapeHtml(titleId)}">${escapeHtml(dayLabel)} - ${escapeHtml(formatDisplayDate(dateText))}</h3>
              ${statusMarkup}
            </div>
            <button class="secondary-button editor-close-button" type="button" id="daily-log-editor-close" data-editor-close="true">Close</button>
          </div>
          <div class="daily-log-editor-body">
            ${renderDayEditorBody(week, dateText, dailyLog)}
          </div>
        </section>
      </div>
    `;
  }

  function closeDailyLogEditor() {
    const closingDate = state.expandedDate;
    state.expandedDate = null;
    state.activeDailyLogId = null;
    renderJournalWeek();
    window.requestAnimationFrame(() => {
      const dayButton = Array.from(document.querySelectorAll("button[data-day-action='open']"))
        .find((button) => button.dataset.date === closingDate);
      dayButton?.focus();
    });
  }

  function syncDailyLogEditorState() {
    document.body.classList.toggle("daily-log-editor-open", Boolean(state.expandedDate));
  }
  function renderJournalWeek() {
    const container = getElement("journal-week-accordions");
    const week = getSelectedWeek();

    if (!container) {
      syncDailyLogEditorState();
      return;
    }

    container.innerHTML = "";

    if (!week) {
      state.expandedDate = null;
      state.activeDailyLogId = null;
      syncDailyLogEditorState();
      container.innerHTML = '<p class="empty-state">Choose a week above to see its days.</p>';
      return;
    }

    const dayCards = [];
    let currentDate = parseDate(week.inclusiveStartDate);
    const endDate = parseDate(week.inclusiveEndDate);
    let dayNumber = 1;

    while (currentDate <= endDate) {
      const dateText = formatDate(currentDate);
      const dailyLog = getDailyLogForDate(dateText);
      dayCards.push(renderDayCard(week, dateText, dayNumber, dailyLog));

      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber += 1;
    }

    const activeDailyLog = state.expandedDate ? getDailyLogForDate(state.expandedDate) : null;
    state.activeDailyLogId = activeDailyLog?.id || null;

    container.innerHTML = `
      <div class="daily-log-day-list" aria-label="Daily log days">
        ${dayCards.join("")}
      </div>
      ${state.expandedDate ? renderDayEditorModal(week, state.expandedDate, activeDailyLog) : ""}
    `;
    syncDailyLogEditorState();
  }

  function expandDay(dateText) {
    openDay(dateText);
  }

  function openDay(dateText) {
    if (!dateText) {
      return;
    }

    window.OJTUI.clearFormMessages(getElement("journal-week-accordions"));
    state.expandedDate = dateText;
    const dailyLog = getDailyLogForDate(dateText);
    state.activeDailyLogId = dailyLog?.id || null;
    renderJournalWeek();
    getElement("daily-log-editor-close")?.focus();
  }

  function buildDailyLogRecord() {
    const existingLog = getActiveDailyLog() || getDailyLogForDate(getValue("daily-log-entry-date"));
    const timestamp = nowIso();
    const dayStatus = normalizeDayStatus(getValue("daily-log-day-status") || existingLog?.dayStatus);
    const worked = isWorkedStatus(dayStatus);
    const breakValue = getValue("daily-log-break-minutes");
    const breakMinutes = worked ? (breakValue === "" ? 0 : Number(breakValue)) : 0;
    const timeIn = worked ? getValue("daily-log-time-in") : "";
    const timeOut = worked ? getValue("daily-log-time-out") : "";
    const calculation = calculateRenderedTime(
      timeIn,
      timeOut,
      breakMinutes
    );

    return {
      id: getValue("daily-log-id") || existingLog?.id || createId("daily-log"),
      weekId: getValue("daily-log-form-week") || state.selectedWeekId,
      entryDate: getValue("daily-log-entry-date") || state.expandedDate,
      dayStatus,
      timeIn,
      timeOut,
      breakMinutes,
      renderedMinutes: worked && calculation.isComplete ? calculation.renderedMinutes : 0,
      renderedHours: worked && calculation.isComplete ? calculation.renderedHours : 0,
      dayRemarks: getValue("daily-log-day-remarks"),
      createdAt: existingLog?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function isValidTime(value) {
    return value === "" || window.OJTCalculations.isValidTime(value);
  }

  function validateDailyLog(dailyLog) {
    const selectedWeek = state.weeks.find((week) => week.id === dailyLog.weekId);

    if (!dailyLog.weekId || !selectedWeek) {
      return "Choose an OJT week before saving.";
    }

    if (!dailyLog.entryDate) {
      return "Please choose the entry date.";
    }

    if (dailyLog.entryDate < selectedWeek.inclusiveStartDate || dailyLog.entryDate > selectedWeek.inclusiveEndDate) {
      return "Entry date must fall within the selected week's date range.";
    }

    if (!dayStatuses.includes(dailyLog.dayStatus)) {
      return "Day status must be Worked, Absent, or No OJT / Rest Day.";
    }

    const duplicateLog = state.dailyLogs.find((log) => {
      return log.id !== dailyLog.id && log.weekId === dailyLog.weekId && log.entryDate === dailyLog.entryDate;
    });

    if (duplicateLog) {
      return "A daily log already exists for this date.";
    }

    if (!isWorkedStatus(dailyLog.dayStatus)) {
      return "";
    }

    if (!dailyLog.timeIn || !dailyLog.timeOut) {
      return "Time in and time out are required on worked days.";
    }

    if (!isValidTime(dailyLog.timeIn) || !isValidTime(dailyLog.timeOut)) {
      return "Time in and time out should use a valid HH:mm time when entered.";
    }

    if (Number.isNaN(dailyLog.breakMinutes) || dailyLog.breakMinutes < 0) {
      return "Break minutes must be zero or a positive number.";
    }

    const calculation = calculateRenderedTime(dailyLog.timeIn, dailyLog.timeOut, dailyLog.breakMinutes);

    if (calculation.error) {
      return calculation.error;
    }

    if (calculation.isComplete && calculation.renderedMinutes < 0) {
      return "Rendered minutes must not be negative.";
    }

    return "";
  }

  function updateRenderedPreview() {
    const previewElement = getElement("daily-rendered-time-preview");
    const helpElement = getElement("daily-rendered-time-help");

    if (!previewElement || !helpElement) {
      return;
    }

    const dayStatus = normalizeDayStatus(getValue("daily-log-day-status"));

    if (!isWorkedStatus(dayStatus)) {
      previewElement.textContent = formatRenderedTime(0);
      helpElement.textContent = "Absent and rest days count as 0 rendered hours.";
      return;
    }

    const breakValue = getValue("daily-log-break-minutes");
    const calculation = calculateRenderedTime(
      getValue("daily-log-time-in"),
      getValue("daily-log-time-out"),
      breakValue === "" ? 0 : Number(breakValue)
    );

    previewElement.textContent = calculation.isComplete
      ? formatRenderedTime(calculation.renderedMinutes)
      : "Not calculated";
    helpElement.textContent = calculation.error || "Enter time in, time out, and break minutes to calculate rendered hours.";
  }

  function updateDayStatusControls() {
    const dayStatus = normalizeDayStatus(getValue("daily-log-day-status"));
    const worked = isWorkedStatus(dayStatus);

    ["daily-log-time-in", "daily-log-time-out", "daily-log-break-minutes"].forEach((id) => {
      const input = getElement(id);
      const field = input?.closest(".time-field");

      if (input) {
        input.disabled = !worked;
      }

      if (field) {
        field.classList.toggle("is-muted", !worked);
      }
    });

    updateRenderedPreview();
  }

  function buildTaskRecord() {
    const selectedLog = getActiveDailyLog();
    const taskId = getValue("daily-task-id");
    const currentTask = state.dailyTasks.find((task) => task.id === taskId) || null;
    const timestamp = nowIso();
    const timeSpentValue = getValue("daily-task-time-spent");
    const existingTasks = getTasksForDailyLog(selectedLog?.id || "");
    const nextSortOrder = existingTasks.length === 0 ? 1 : Math.max(...existingTasks.map((task) => task.sortOrder || 0)) + 1;

    return {
      id: currentTask?.id || createId("daily-task"),
      dailyLogId: selectedLog?.id || "",
      description: getValue("daily-task-description"),
      timeSpentMinutes: timeSpentValue === "" ? 0 : Number(timeSpentValue),
      status: getValue("daily-task-status") || "Pending",
      notes: getValue("daily-task-notes"),
      sortOrder: currentTask?.sortOrder || nextSortOrder,
      createdAt: currentTask?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function validateTask(task) {
    if (!task.dailyLogId) {
      return "Save the day record before adding tasks.";
    }

    if (!task.description) {
      return "Enter a task or work item description.";
    }

    if (!taskStatuses.includes(task.status)) {
      return "Task status must be Pending, In Progress, or Completed.";
    }

    if (Number.isNaN(task.timeSpentMinutes) || task.timeSpentMinutes < 0) {
      return "Task time spent must be zero or a positive number.";
    }

    return "";
  }

  function resetTaskFormFields() {
    setValue("daily-task-id", "");
    setValue("daily-task-description", "");
    setValue("daily-task-time-spent", "");
    setValue("daily-task-status", "Pending");
    setValue("daily-task-notes", "");
    const saveButton = getElement("save-daily-task-button");
    if (saveButton) {
      saveButton.textContent = "Save task item";
    }
    const cancelButton = getElement("cancel-daily-task-edit-button");
    if (cancelButton) {
      cancelButton.hidden = true;
    }
    window.OJTUI.clearFormMessage(getElement("daily-task-form-message"));
  }

  async function saveDailyLog(event) {
    event.preventDefault();
    const messageElement = getElement("daily-log-form-message");
    window.OJTUI.clearFormMessage(messageElement);

    const dailyLog = buildDailyLogRecord();
    const validationMessage = validateDailyLog(dailyLog);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      const savedLog = await window.OJTStorage.saveDailyLog(dailyLog);
      state.dailyLogs = state.dailyLogs.filter((log) => log.id !== savedLog.id).concat(savedLog);
      state.activeDailyLogId = savedLog.id;
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
      notifyJournalDataChange();
      const saveMessage = savedLog.renderedMinutes !== null &&
        savedLog.renderedMinutes !== undefined &&
        Number.isFinite(Number(savedLog.renderedMinutes))
        ? `Day saved — ${formatRenderedTime(savedLog.renderedMinutes)} rendered.`
        : "Day saved. Add time in and time out to calculate rendered hours.";
      window.OJTUI.showFormMessage(getElement("daily-log-form-message"), saveMessage, "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not save daily log. Try again.", "error");
      console.error(error);
    }
  }

  async function deleteDailyLog(dailyLog) {
    const confirmed = window.confirm(`Delete the log for ${dailyLog.entryDate}? Tasks and photos for this day will also be removed.`);

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteDailyLog(dailyLog.id);
      state.dailyLogs = state.dailyLogs.filter((log) => log.id !== dailyLog.id);
      state.dailyTasks = state.dailyTasks.filter((task) => task.dailyLogId !== dailyLog.id);
      state.photoAttachments = state.photoAttachments.filter((photo) => photo.dailyLogId !== dailyLog.id);
      state.expandedDate = null;
      state.activeDailyLogId = null;
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("daily-log-form-message"), "Day log deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("daily-log-form-message"), "Could not delete daily log. Try again.", "error");
      console.error(error);
    }
  }

  async function saveTask(event) {
    event.preventDefault();
    const messageElement = getElement("daily-task-form-message");
    window.OJTUI.clearFormMessage(messageElement);

    const task = buildTaskRecord();
    const validationMessage = validateTask(task);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      const savedTask = await window.OJTStorage.saveDailyTask(task);
      state.dailyTasks = state.dailyTasks.filter((existingTask) => existingTask.id !== savedTask.id).concat(savedTask);
      resetTaskFormFields();
      renderJournalWeek();
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("daily-task-form-message"), "Task item saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Task item could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  function startEditTask(task) {
    setValue("daily-task-id", task.id);
    setValue("daily-task-description", task.description);
    setValue("daily-task-time-spent", Number(task.timeSpentMinutes) > 0 ? task.timeSpentMinutes : "");
    setValue("daily-task-status", task.status);
    setValue("daily-task-notes", task.notes);
    setText("save-daily-task-button", "Save task changes");
    getElement("cancel-daily-task-edit-button").hidden = false;
    window.OJTUI.clearFormMessage(getElement("daily-task-form-message"));
  }

  async function deleteTask(task) {
    const confirmed = window.confirm("Delete this task item? The day log will stay saved.");

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteDailyTask(task.id);
      state.dailyTasks = state.dailyTasks.filter((savedTask) => savedTask.id !== task.id);
      resetTaskFormFields();
      renderJournalWeek();
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("daily-task-form-message"), "Task item deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("daily-task-form-message"), "Task item could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  async function savePhotoAttachment(event) {
    event.preventDefault();
    const form = event.target;
    const messageElement = getElement("photo-upload-message");
    const selectedLog = getActiveDailyLog();
    const fileInput = getElement("photo-upload-file");
    const caption = getValue("photo-upload-caption");
    const photoCategory = normalizePhotoCategory(getValue("photo-upload-category"));
    const file = fileInput?.files?.[0] || null;

    window.OJTUI.clearFormMessage(messageElement);

    if (!selectedLog) {
      window.OJTUI.showFormMessage(messageElement, "Save the day record before attaching photos.", "error");
      return;
    }

    const validationMessage = window.OJTPhotos.validatePhotoFile(file);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      const photoAttachment = window.OJTPhotos.buildPhotoAttachment(file, selectedLog.id, caption, photoCategory);
      const savedPhoto = await window.OJTStorage.savePhotoAttachment(photoAttachment);
      state.photoAttachments = state.photoAttachments.filter((photo) => photo.id !== savedPhoto.id).concat(savedPhoto);
      form.reset();
      renderJournalWeek();
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo attached.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not attach photo. Try again.", "error");
      console.error(error);
    }
  }

  async function savePhotoCaption(form) {
    const photo = state.photoAttachments.find((attachment) => attachment.id === form.dataset.photoId);
    const messageElement = form.querySelector(".form-message");
    const formData = new FormData(form);

    window.OJTUI.clearFormMessage(messageElement);

    if (!photo) {
      window.OJTUI.showFormMessage(messageElement, "Photo attachment could not be found. Please refresh and try again.", "error");
      return;
    }

    try {
      const savedPhoto = await window.OJTStorage.savePhotoAttachment({
        ...photo,
        photoCategory: normalizePhotoCategory(photo.photoCategory),
        caption: String(formData.get("caption") || "").trim()
      });
      state.photoAttachments = state.photoAttachments.filter((attachment) => attachment.id !== savedPhoto.id).concat(savedPhoto);
      renderJournalWeek();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo caption saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Photo caption could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  function downloadPhoto(photo) {
    try {
      window.OJTPhotos.downloadPhotoAttachment(photo);
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Stored photo data is not available for download.", "error");
      console.error(error);
    }
  }

  async function deletePhoto(photo) {
    const confirmed = window.confirm(`Delete ${photo.fileName || "this photo"}? The day log will stay saved.`);

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deletePhotoAttachment(photo.id);
      state.photoAttachments = state.photoAttachments.filter((attachment) => attachment.id !== photo.id);
      renderJournalWeek();
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo attachment deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo attachment could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  function handleJournalClick(event) {
    if (event.target.id === "cancel-daily-task-edit-button") {
      resetTaskFormFields();
      return;
    }

    if (event.target.matches("[data-editor-close]") || event.target.closest("button[data-editor-close]")) {
      closeDailyLogEditor();
      return;
    }

    const dayButton = event.target.closest("button[data-day-action='open']");
    if (dayButton) {
      openDay(dayButton.dataset.date);
      return;
    }

    const logButton = event.target.closest("button[data-log-action]");
    if (logButton?.dataset.logAction === "delete") {
      const dailyLog = state.dailyLogs.find((log) => log.id === logButton.dataset.logId);
      if (dailyLog) {
        deleteDailyLog(dailyLog);
      }
      return;
    }

    const photoButton = event.target.closest("button[data-photo-action]");
    if (photoButton) {
      const photo = state.photoAttachments.find((attachment) => attachment.id === photoButton.dataset.photoId);

      if (!photo) {
        return;
      }

      if (photoButton.dataset.photoAction === "download") {
        downloadPhoto(photo);
      }

      if (photoButton.dataset.photoAction === "delete") {
        deletePhoto(photo);
      }

      return;
    }

    const taskButton = event.target.closest("button[data-task-action]");
    if (!taskButton) {
      return;
    }

    const task = state.dailyTasks.find((savedTask) => savedTask.id === taskButton.dataset.taskId);
    if (!task) {
      return;
    }

    if (taskButton.dataset.taskAction === "edit") {
      startEditTask(task);
    }

    if (taskButton.dataset.taskAction === "delete") {
      deleteTask(task);
    }
  }

  async function loadDailyLogData() {
    try {
      const [weeks, dailyLogs, dailyTasks, photoAttachments] = await Promise.all([
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs(),
        window.OJTStorage.getDailyTasks(),
        window.OJTStorage.getPhotoAttachments()
      ]);

      state.weeks = weeks;
      state.dailyLogs = dailyLogs;
      state.dailyTasks = dailyTasks;
      state.photoAttachments = photoAttachments;

      state.selectedWeekId = window.OJTSelectedWeek?.initialize(state.weeks) || "";

      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
    } catch (error) {
      const container = getElement("journal-week-accordions");
      if (container) {
        container.innerHTML = '<p class="empty-state">Could not load daily logs. Refresh and try again.</p>';
      }
      console.error(error);
    }
  }

  function bindDailyLogEvents() {
    getElement("journal-week-accordions")?.addEventListener("click", handleJournalClick);
    getElement("journal-week-accordions")?.addEventListener("input", (event) => {
      if (["daily-log-time-in", "daily-log-time-out", "daily-log-break-minutes"].includes(event.target.id)) {
        updateRenderedPreview();
      }
    });
    getElement("journal-week-accordions")?.addEventListener("change", (event) => {
      if (event.target.id === "daily-log-day-status") {
        updateDayStatusControls();
      }
    });
    getElement("journal-week-accordions")?.addEventListener("submit", (event) => {
      if (event.target.id === "daily-log-form") {
        saveDailyLog(event);
      }

      if (event.target.id === "daily-task-form") {
        saveTask(event);
      }

      if (event.target.id === "photo-upload-form") {
        savePhotoAttachment(event);
      }

      if (event.target.matches("[data-photo-caption-form]")) {
        event.preventDefault();
        savePhotoCaption(event.target);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindDailyLogEvents();
    loadDailyLogData();
  });

  document.addEventListener("ojt:selected-week-change", (event) => {
    const weekId = event.detail?.weekId || "";
    if (event.detail?.source === "weeks:delete" || (weekId && !state.weeks.some((week) => week.id === weekId))) {
      loadDailyLogData();
      return;
    }
    state.selectedWeekId = weekId;
    state.expandedDate = null;
    state.activeDailyLogId = null;
    renderJournalWeek();
    updateWeekSummary();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.expandedDate) {
      closeDailyLogEditor();
    }
  });
  document.addEventListener("ojt:weeks-data-change", loadDailyLogData);

  document.addEventListener("ojt:section-change", (event) => {
    if (event.detail?.sectionId === "journal") {
      loadDailyLogData();
      return;
    }

    state.expandedDate = null;
    state.activeDailyLogId = null;
    syncDailyLogEditorState();
  });

  document.addEventListener("ojt:open-daily-log", async (event) => {
    const detail = event.detail || {};
    await loadDailyLogData();

    if (detail.weekId) {
      selectWeek(detail.weekId);
      }

    if (detail.entryDate) {
      openDay(detail.entryDate);
    } else {
      renderJournalWeek();
      updateWeekSummary();
    }
  });
})();
