(function () {
  const taskStatuses = ["Pending", "In Progress", "Completed"];
  const state = {
    weeks: [],
    dailyLogs: [],
    dailyTasks: [],
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

  function getDayStatusText(dailyLog, taskCount) {
    if (!dailyLog) {
      return "No daily log yet";
    }

    let status = "Daily log saved";

    if (taskCount > 0) {
      status += taskCount === 1 ? " · 1 task item" : ` · ${taskCount} task items`;
    }

    return status;
  }

  function sortWeeks(weeks) {
    return [...weeks].sort((first, second) => first.weekNumber - second.weekNumber);
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

  function setSelectOptions(select, weeks) {
    if (!select) {
      return;
    }

    select.innerHTML = '<option value="">Choose a week</option>';
    weeks.forEach((week) => {
      const option = document.createElement("option");
      option.value = week.id;
      option.textContent = `Week ${week.weekNumber} (${week.inclusiveStartDate} to ${week.inclusiveEndDate})`;
      select.appendChild(option);
    });
    select.disabled = weeks.length === 0;
  }

  function renderWeekSelectors() {
    const sortedWeeks = sortWeeks(state.weeks);
    setSelectOptions(getElement("daily-log-week-select"), sortedWeeks);
    setValue("daily-log-week-select", state.selectedWeekId);

    if (sortedWeeks.length === 0) {
      setText("daily-log-week-help", "Create an OJT week first, then return here for daily logs.");
    } else {
      setText("daily-log-week-help", "Select a week to open its journal-style day records.");
    }
  }

  function updateWeekSummary() {
    const logs = getLogsForWeek(state.selectedWeekId);
    const countLabel = getElement("daily-log-count-label");

    if (!countLabel) {
      return;
    }

    if (!state.selectedWeekId) {
      countLabel.textContent = "";
      return;
    }

    countLabel.textContent = logs.length === 1
      ? "1 daily log saved for this week."
      : `${logs.length} daily logs saved for this week.`;
  }

  function selectWeek(weekId) {
    state.selectedWeekId = weekId || "";
    state.expandedDate = null;
    state.activeDailyLogId = null;
    setValue("daily-log-week-select", state.selectedWeekId);
    renderJournalWeek();
    updateWeekSummary();
  }

  function renderTaskBullets(tasks) {
    if (tasks.length === 0) {
      return '<p class="empty-state">No task/work items yet. Save the day record first, then add items below.</p>';
    }

    return `
      <ul class="task-bullet-list">
        ${tasks.map((task) => {
          const timeText = Number(task.timeSpentMinutes) > 0 ? ` (${task.timeSpentMinutes} min)` : "";
          const notesText = task.notes ? `<span class="task-note"> — ${escapeHtml(task.notes)}</span>` : "";
          return `
            <li class="task-bullet-item">
              <div class="task-bullet-content">
                <strong>${escapeHtml(task.description)}</strong>${escapeHtml(timeText)}
                <span class="status-pill">${escapeHtml(task.status)}</span>${notesText}
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

  function renderDayEditorBody(week, dateText, dailyLog) {
    const dayLabel = getDayLabel(week, dateText);
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
              <span>Time in</span>
              <input type="time" id="daily-log-time-in" value="${escapeHtml(dailyLog?.timeIn || "")}">
            </label>
            <label class="field">
              <span>Time out</span>
              <input type="time" id="daily-log-time-out" value="${escapeHtml(dailyLog?.timeOut || "")}">
            </label>
            <label class="field">
              <span>Break minutes</span>
              <input type="number" id="daily-log-break-minutes" min="0" step="1" inputmode="numeric" placeholder="0" value="${dailyLog?.breakMinutes ? dailyLog.breakMinutes : ""}">
            </label>

            <div class="calculation-placeholder" aria-live="polite">
              <strong>Rendered hours will be calculated in Phase 5.</strong>
              <p>Phase 4 saves the day/date and time fields only.</p>
            </div>

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
            <p class="phase-note">${tasksEnabled ? "Add bullet-style work items for this day." : "Save the day record first, then add task/work items."}</p>
          </div>

          <div class="task-list-display" id="daily-task-list">
            ${tasksEnabled ? renderTaskBullets(tasks) : '<p class="empty-state">Task items appear here after the day record is saved.</p>'}
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

            <p class="phase-note">Task time is for documentation only and is not used as the official rendered hours source.</p>

            <div class="form-actions">
              <button class="primary-button" type="submit" id="save-daily-task-button" ${tasksEnabled ? "" : "disabled"}>Save task item</button>
              <button class="secondary-button" type="button" id="cancel-daily-task-edit-button" hidden>Cancel task edit</button>
              <p class="form-message" id="daily-task-form-message" hidden></p>
            </div>
          </form>
        </div>
      </div>

      <p class="photo-placeholder">Photo documentation will be added in Phase 8.</p>
    `;
  }

  function renderJournalWeek() {
    const container = getElement("journal-week-accordions");
    const week = getSelectedWeek();

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!week) {
      container.innerHTML = '<p class="empty-state">Choose a saved week to show journal day records.</p>';
      return;
    }

    let currentDate = parseDate(week.inclusiveStartDate);
    const endDate = parseDate(week.inclusiveEndDate);
    let dayNumber = 1;

    while (currentDate <= endDate) {
      const dateText = formatDate(currentDate);
      const dailyLog = getDailyLogForDate(dateText);
      const taskCount = dailyLog ? getTasksForDailyLog(dailyLog.id).length : 0;
      const isExpanded = state.expandedDate === dateText;
      const dayLabel = `Day ${dayNumber}`;
      const statusText = getDayStatusText(dailyLog, taskCount);

      const accordion = document.createElement("article");
      accordion.className = `day-accordion${isExpanded ? " is-expanded" : ""}`;
      accordion.dataset.date = dateText;
      accordion.innerHTML = `
        <button class="day-accordion-header" type="button" aria-expanded="${isExpanded}" aria-controls="day-body-${dateText}">
          <span class="day-accordion-label">
            <strong>${escapeHtml(dayLabel)}</strong>
            <span class="day-accordion-date">${escapeHtml(formatDisplayDate(dateText))}</span>
          </span>
          <span class="day-accordion-status">${escapeHtml(statusText)}</span>
          <span class="day-accordion-chevron" aria-hidden="true"></span>
        </button>
        <div class="day-accordion-body" id="day-body-${dateText}" ${isExpanded ? "" : "hidden"}>
          ${isExpanded ? renderDayEditorBody(week, dateText, dailyLog) : ""}
        </div>
      `;
      container.appendChild(accordion);

      if (isExpanded) {
        state.activeDailyLogId = dailyLog?.id || null;
      }

      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber += 1;
    }
  }

  function expandDay(dateText) {
    if (state.expandedDate === dateText) {
      state.expandedDate = null;
      state.activeDailyLogId = null;
    } else {
      state.expandedDate = dateText;
      const dailyLog = getDailyLogForDate(dateText);
      state.activeDailyLogId = dailyLog?.id || null;
    }

    renderJournalWeek();
  }

  function openDay(dateText) {
    state.expandedDate = dateText;
    const dailyLog = getDailyLogForDate(dateText);
    state.activeDailyLogId = dailyLog?.id || null;
    renderJournalWeek();
  }

  function buildDailyLogRecord() {
    const existingLog = getActiveDailyLog() || getDailyLogForDate(getValue("daily-log-entry-date"));
    const timestamp = nowIso();
    const breakValue = getValue("daily-log-break-minutes");

    return {
      id: getValue("daily-log-id") || existingLog?.id || createId("daily-log"),
      weekId: getValue("daily-log-form-week") || state.selectedWeekId,
      entryDate: getValue("daily-log-entry-date") || state.expandedDate,
      timeIn: getValue("daily-log-time-in"),
      timeOut: getValue("daily-log-time-out"),
      breakMinutes: breakValue === "" ? 0 : Number(breakValue),
      renderedMinutes: existingLog?.renderedMinutes || 0,
      renderedHours: existingLog?.renderedHours || 0,
      createdAt: existingLog?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function isValidTime(value) {
    return value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function validateDailyLog(dailyLog) {
    const selectedWeek = state.weeks.find((week) => week.id === dailyLog.weekId);

    if (!dailyLog.weekId || !selectedWeek) {
      return "Please choose an OJT week before saving the daily log.";
    }

    if (!dailyLog.entryDate) {
      return "Please choose the entry date.";
    }

    if (dailyLog.entryDate < selectedWeek.inclusiveStartDate || dailyLog.entryDate > selectedWeek.inclusiveEndDate) {
      return "Entry date should be within the selected week's inclusive date range.";
    }

    if (!isValidTime(dailyLog.timeIn) || !isValidTime(dailyLog.timeOut)) {
      return "Time in and time out should use a valid HH:mm time when entered.";
    }

    if (Number.isNaN(dailyLog.breakMinutes) || dailyLog.breakMinutes < 0) {
      return "Break minutes must be zero or a positive number.";
    }

    const duplicateLog = state.dailyLogs.find((log) => {
      return log.id !== dailyLog.id && log.weekId === dailyLog.weekId && log.entryDate === dailyLog.entryDate;
    });

    if (duplicateLog) {
      return "A daily log already exists for this date.";
    }

    return "";
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
      return "Please save the day record before adding task items.";
    }

    if (!task.description) {
      return "Please enter a task or work item description.";
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
      window.OJTUI.showFormMessage(getElement("daily-log-form-message"), "Day record saved. You can add task items on the right.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Daily log could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  async function deleteDailyLog(dailyLog) {
    const confirmed = window.confirm(`Delete the daily log for ${dailyLog.entryDate}? Its task items will also be deleted.`);

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteDailyLog(dailyLog.id);
      state.dailyLogs = state.dailyLogs.filter((log) => log.id !== dailyLog.id);
      state.dailyTasks = state.dailyTasks.filter((task) => task.dailyLogId !== dailyLog.id);
      state.activeDailyLogId = null;
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
      window.OJTUI.showFormMessage(getElement("daily-log-form-message"), "Day record deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("daily-log-form-message"), "Daily log could not be deleted. Please try again.", "error");
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
    const confirmed = window.confirm("Delete this task item? The day record will stay saved.");

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteDailyTask(task.id);
      state.dailyTasks = state.dailyTasks.filter((savedTask) => savedTask.id !== task.id);
      resetTaskFormFields();
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.showFormMessage(getElement("daily-task-form-message"), "Task item deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("daily-task-form-message"), "Task item could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  function handleJournalClick(event) {
    if (event.target.id === "cancel-daily-task-edit-button") {
      resetTaskFormFields();
      return;
    }

    const accordionHeader = event.target.closest(".day-accordion-header");

    if (accordionHeader && !event.target.closest("button[data-log-action], button[data-task-action]")) {
      const accordion = accordionHeader.closest(".day-accordion");
      expandDay(accordion?.dataset.date);
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
      const [weeks, dailyLogs, dailyTasks] = await Promise.all([
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs(),
        window.OJTStorage.getDailyTasks()
      ]);

      state.weeks = weeks;
      state.dailyLogs = dailyLogs;
      state.dailyTasks = dailyTasks;

      if (!state.selectedWeekId || !state.weeks.some((week) => week.id === state.selectedWeekId)) {
        state.selectedWeekId = sortWeeks(weeks)[0]?.id || "";
      }

      renderWeekSelectors();
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
    } catch (error) {
      const container = getElement("journal-week-accordions");
      if (container) {
        container.innerHTML = '<p class="empty-state">Saved daily logs could not be loaded. Please refresh and try again.</p>';
      }
      console.error(error);
    }
  }

  function bindDailyLogEvents() {
    getElement("daily-log-week-select")?.addEventListener("change", (event) => {
      selectWeek(event.target.value);
    });

    getElement("journal-week-accordions")?.addEventListener("click", handleJournalClick);
    getElement("journal-week-accordions")?.addEventListener("submit", (event) => {
      if (event.target.id === "daily-log-form") {
        saveDailyLog(event);
      }

      if (event.target.id === "daily-task-form") {
        saveTask(event);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindDailyLogEvents();
    loadDailyLogData();
  });

  document.addEventListener("ojt:section-change", (event) => {
    if (event.detail?.sectionId === "daily-logs") {
      loadDailyLogData();
    }
  });

  document.addEventListener("ojt:open-daily-log", async (event) => {
    const detail = event.detail || {};
    await loadDailyLogData();

    if (detail.weekId) {
      state.selectedWeekId = detail.weekId;
      setValue("daily-log-week-select", state.selectedWeekId);
    }

    if (detail.entryDate) {
      openDay(detail.entryDate);
    } else {
      renderJournalWeek();
      updateWeekSummary();
    }
  });
})();
