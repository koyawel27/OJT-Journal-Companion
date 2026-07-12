(function () {
  const state = {
    weeks: [],
    dailyLogs: [],
    selectedWeekId: null,
    historyOpen: false,
    weekFormOpen: false
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

  function createId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return "week-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function parseDate(dateText) {
    const parts = String(dateText || "").split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function formatDisplayDate(dateText) {
    return parseDate(dateText).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatRenderedTime(minutes) {
    return window.OJTCalculations.formatRenderedTime(minutes);
  }

  function sortWeeks(weeks) {
    return window.OJTSelectedWeek?.sortWeeksChronologically(weeks) || [...(weeks || [])];
  }

  function getSelectedWeek() {
    return state.weeks.find((week) => week.id === state.selectedWeekId) || null;
  }

  function getCurrentFormWeek() {
    const weekId = getValue("week-id");
    return state.weeks.find((week) => week.id === weekId) || null;
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

  function getLogsForWeek(week) {
    if (!week) {
      return [];
    }

    return state.dailyLogs.filter((dailyLog) => {
      return dailyLog.weekId === week.id &&
        dailyLog.entryDate >= week.inclusiveStartDate &&
        dailyLog.entryDate <= week.inclusiveEndDate;
    });
  }

  function getWeekRenderedMinutes(week) {
    return window.OJTCalculations.sumRenderedMinutes(getLogsForWeek(week));
  }

  function getSummaryState(week) {
    const requiredFields = [
      week?.weeklySkillsLearned,
      week?.problemsEncountered,
      week?.reflectionOrPointsOfLearning
    ];
    const filledCount = requiredFields.filter((value) => String(value || "").trim()).length;

    if (filledCount === 0) {
      return "Not started";
    }

    if (filledCount === requiredFields.length) {
      return "Complete";
    }

    return "In progress";
  }

  function buildWeekRecord() {
    const currentWeek = getCurrentFormWeek();
    const timestamp = nowIso();

    return {
      id: currentWeek?.id || createId(),
      weekNumber: Number(getValue("week-number")),
      inclusiveStartDate: getValue("inclusive-start-date"),
      inclusiveEndDate: getValue("inclusive-end-date"),
      weeklySkillsLearned: currentWeek?.weeklySkillsLearned || "",
      problemsEncountered: currentWeek?.problemsEncountered || "",
      reflectionOrPointsOfLearning: currentWeek?.reflectionOrPointsOfLearning || "",
      additionalNotes: currentWeek?.additionalNotes || "",
      createdAt: currentWeek?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function hasOverlappingRange(weekRecord) {
    return state.weeks.some((week) => {
      if (week.id === weekRecord.id) {
        return false;
      }

      return weekRecord.inclusiveStartDate <= week.inclusiveEndDate &&
        weekRecord.inclusiveEndDate >= week.inclusiveStartDate;
    });
  }

  function validateWeek(weekRecord) {
    if (!getValue("week-number")) {
      return "Enter the week number.";
    }

    if (Number.isNaN(weekRecord.weekNumber) || weekRecord.weekNumber <= 0) {
      return "Week number must be a positive number.";
    }

    const duplicateWeek = state.weeks.find((week) => {
      return week.id !== weekRecord.id && week.weekNumber === weekRecord.weekNumber;
    });

    if (duplicateWeek) {
      return "That week number is already used. Pick a different one.";
    }

    if (!weekRecord.inclusiveStartDate) {
      return "Choose the inclusive start date.";
    }

    if (!weekRecord.inclusiveEndDate) {
      return "Choose the inclusive end date.";
    }

    if (weekRecord.inclusiveStartDate > weekRecord.inclusiveEndDate) {
      return "Start date must be on or before the end date.";
    }

    if (hasOverlappingRange(weekRecord)) {
      return "These dates overlap another saved week. Adjust the range.";
    }

    return "";
  }

  function setWeekFormOpen(open) {
    state.weekFormOpen = Boolean(open);
    const panel = getElement("week-form-panel");
    if (panel) {
      panel.hidden = !state.weekFormOpen;
    }
  }

  function resetWeekForm(options) {
    const settings = options || {};
    setValue("week-id", "");
    setValue("week-number", "");
    setValue("inclusive-start-date", "");
    setValue("inclusive-end-date", "");
    setText("week-form-title", "Create week");
    setText("save-week-button", "Save week");
    window.OJTUI.clearFormMessage(getElement("week-form-message"));

    if (settings.hide !== false) {
      setWeekFormOpen(false);
    }
  }

  function focusWeekNumber() {
    window.requestAnimationFrame(() => {
      getElement("week-number")?.focus();
    });
  }

  function openNewWeekForm() {
    resetWeekForm({ hide: false });
    setWeekFormOpen(true);
    focusWeekNumber();
  }

  function startEditWeek(week) {
    if (!week) {
      return;
    }

    window.OJTSelectedWeek?.selectWeek(week.id, {
      weeks: state.weeks,
      source: "journal:edit-week"
    });
    state.selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || week.id;
    setValue("week-id", week.id);
    setValue("week-number", week.weekNumber);
    setValue("inclusive-start-date", week.inclusiveStartDate);
    setValue("inclusive-end-date", week.inclusiveEndDate);
    setText("week-form-title", "Edit Week " + week.weekNumber);
    setText("save-week-button", "Save changes");
    window.OJTUI.clearFormMessage(getElement("week-form-message"));
    setWeekFormOpen(true);
    focusWeekNumber();
  }

  function renderWeekSelect() {
    const select = getElement("journal-week-select");
    const sortedWeeks = sortWeeks(state.weeks);

    if (!select) {
      return;
    }

    select.innerHTML = "";
    sortedWeeks.forEach((week) => {
      const option = document.createElement("option");
      option.value = week.id;
      option.textContent = "Week " + week.weekNumber + " (" + week.inclusiveStartDate + " to " + week.inclusiveEndDate + ")";
      select.appendChild(option);
    });
    select.disabled = sortedWeeks.length === 0;
    select.value = state.selectedWeekId || "";
  }

  function renderToolbar() {
    const sortedWeeks = sortWeeks(state.weeks);
    const selectedWeek = getSelectedWeek();
    const navigation = getElement("journal-week-navigation");
    const previousButton = getElement("journal-previous-week");
    const nextButton = getElement("journal-next-week");
    const historyButton = getElement("journal-all-weeks");

    if (sortedWeeks.length === 0) {
      state.historyOpen = false;
    }

    renderWeekSelect();

    if (navigation) {
      navigation.hidden = sortedWeeks.length === 0;
    }

    if (previousButton) {
      previousButton.disabled = !selectedWeek ||
        !window.OJTSelectedWeek?.getPreviousWeek(sortedWeeks, selectedWeek.id);
    }

    if (nextButton) {
      nextButton.disabled = !selectedWeek ||
        !window.OJTSelectedWeek?.getNextWeek(sortedWeeks, selectedWeek.id);
    }

    if (historyButton) {
      historyButton.disabled = sortedWeeks.length === 0;
      historyButton.setAttribute("aria-expanded", String(state.historyOpen));
    }
  }

  function renderOverview() {
    const week = getSelectedWeek();
    const emptyState = getElement("journal-empty-state");
    const workspace = getElement("journal-selected-workspace");

    if (emptyState) {
      emptyState.hidden = Boolean(week);
    }

    if (workspace) {
      workspace.hidden = !week;
    }

    if (!week) {
      return;
    }

    const dates = getWeekDates(week);
    const logs = getLogsForWeek(week);
    setText("journal-overview-title", "Week " + week.weekNumber);
    setText("journal-overview-dates", formatDisplayDate(week.inclusiveStartDate) + " to " + formatDisplayDate(week.inclusiveEndDate));
    setText("journal-overview-rendered", formatRenderedTime(getWeekRenderedMinutes(week)));
    setText("journal-overview-logged-days", logs.length + " of " + dates.length);
    setText("journal-overview-summary-state", getSummaryState(week));
  }

  function renderWeeklySummaryForm() {
    const container = getElement("journal-weekly-summary");
    const week = getSelectedWeek();

    if (!container) {
      return;
    }

    if (!week) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = [
      '<form class="weekly-summary-form" data-week-summary-form data-week-id="' + escapeHtml(week.id) + '" novalidate>',
      '  <div class="form-grid">',
      '    <label class="field field-wide"><span>Skills Learned</span><textarea name="weeklySkillsLearned" rows="3">' + escapeHtml(week.weeklySkillsLearned) + '</textarea></label>',
      '    <label class="field field-wide"><span>Problems Encountered</span><textarea name="problemsEncountered" rows="3">' + escapeHtml(week.problemsEncountered) + '</textarea></label>',
      '    <label class="field field-wide"><span>Reflection / Points of Learning</span><textarea name="reflectionOrPointsOfLearning" rows="4">' + escapeHtml(week.reflectionOrPointsOfLearning) + '</textarea></label>',
      '    <label class="field field-wide"><span>Additional Notes</span><textarea name="additionalNotes" rows="3">' + escapeHtml(week.additionalNotes) + '</textarea></label>',
      '  </div>',
      '  <div class="form-actions">',
      '    <button class="primary-button" type="submit">Save weekly summary</button>',
      '    <p class="form-message" id="weekly-summary-message" hidden></p>',
      '  </div>',
      '</form>'
    ].join("");
  }

  function renderWeeksList() {
    const list = getElement("weeks-list");
    const countLabel = getElement("weeks-count-label");
    const panel = getElement("all-weeks-panel");
    const sortedWeeks = sortWeeks(state.weeks).reverse();

    if (panel) {
      panel.hidden = !state.historyOpen;
    }

    if (!list || !countLabel) {
      return;
    }

    countLabel.textContent = sortedWeeks.length === 1
      ? "1 week saved."
      : sortedWeeks.length + " weeks saved.";
    list.innerHTML = "";

    sortedWeeks.forEach((week) => {
      const logs = getLogsForWeek(week);
      const selected = week.id === state.selectedWeekId;
      const item = document.createElement("article");
      item.className = "week-item journal-history-item" + (selected ? " is-selected" : "");
      item.innerHTML = [
        '<div class="week-item-main">',
        '  <div>',
        '    <span class="card-label">Week ' + escapeHtml(week.weekNumber) + (selected ? " - Selected" : "") + '</span>',
        '    <h4>' + escapeHtml(formatDisplayDate(week.inclusiveStartDate)) + ' to ' + escapeHtml(formatDisplayDate(week.inclusiveEndDate)) + '</h4>',
        '    <p>' + escapeHtml(formatRenderedTime(getWeekRenderedMinutes(week))) + ' rendered - ' + logs.length + (logs.length === 1 ? " daily log" : " daily logs") + ' - Summary: ' + escapeHtml(getSummaryState(week)) + '</p>',
        '  </div>',
        '  <div class="week-actions">',
        '    <button class="secondary-button" type="button" data-week-action="select" data-week-id="' + escapeHtml(week.id) + '"' + (selected ? " disabled" : "") + '>' + (selected ? "Selected" : "Select") + '</button>',
        '    <button class="secondary-button" type="button" data-week-action="edit" data-week-id="' + escapeHtml(week.id) + '">Edit</button>',
        '    <button class="danger-button" type="button" data-week-action="delete" data-week-id="' + escapeHtml(week.id) + '">Delete</button>',
        '  </div>',
        '</div>'
      ].join("");
      list.appendChild(item);
    });
  }

  function renderJournalContext() {
    renderToolbar();
    renderOverview();
    renderWeeksList();
    setWeekFormOpen(state.weekFormOpen);
  }

  function renderJournal() {
    renderJournalContext();
    renderWeeklySummaryForm();
  }

  function selectWeek(weekId, source) {
    const previousWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || null;
    const selected = window.OJTSelectedWeek?.selectWeek(weekId, {
      weeks: state.weeks,
      source: source || "journal"
    });

    if (!selected) {
      return;
    }

    const selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || weekId;
    if (selectedWeekId === previousWeekId) {
      state.selectedWeekId = selectedWeekId;
      renderJournalContext();
    }
  }

  function selectAdjacentWeek(direction) {
    const week = getSelectedWeek();
    if (!week) {
      return;
    }

    const adjacentWeek = direction === "previous"
      ? window.OJTSelectedWeek?.getPreviousWeek(state.weeks, week.id)
      : window.OJTSelectedWeek?.getNextWeek(state.weeks, week.id);

    if (adjacentWeek) {
      selectWeek(adjacentWeek.id, "journal:" + direction);
    }
  }

  function toggleHistory() {
    state.historyOpen = !state.historyOpen;
    renderJournalContext();
  }

  async function deleteWeek(week) {
    const messageElement = getElement("journal-message");

    try {
      const dailyLogs = await window.OJTStorage.getDailyLogs();
      const relatedLogs = dailyLogs.filter((dailyLog) => dailyLog.weekId === week.id);

      if (relatedLogs.length > 0) {
        window.OJTUI.showFormMessage(
          messageElement,
          "This week still has daily logs. Delete them in Journal before removing the week.",
          "error"
        );
        return;
      }
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Related daily logs could not be checked. Please try again.", "error");
      console.error(error);
      return;
    }

    const confirmed = window.confirm("Delete Week " + week.weekNumber + "? This only removes the week record - it cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      const wasSelected = window.OJTSelectedWeek?.getSelectedWeekId() === week.id;
      const previousWeek = window.OJTSelectedWeek?.getPreviousWeek(state.weeks, week.id);
      const nextWeek = window.OJTSelectedWeek?.getNextWeek(state.weeks, week.id);
      await window.OJTStorage.deleteWeek(week.id);
      state.weeks = state.weeks.filter((savedWeek) => savedWeek.id !== week.id);

      if (wasSelected) {
        const fallbackWeek = state.weeks.find((savedWeek) => savedWeek.id === previousWeek?.id) ||
          state.weeks.find((savedWeek) => savedWeek.id === nextWeek?.id) || null;

        if (fallbackWeek) {
          window.OJTSelectedWeek?.selectWeek(fallbackWeek.id, {
            weeks: state.weeks,
            source: "weeks:delete"
          });
        } else {
          window.OJTSelectedWeek?.clearSelection({
            weeks: state.weeks,
            source: "weeks:delete"
          });
        }
      }

      state.selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || null;

      if (!wasSelected) {
        renderJournalContext();
      }

      window.OJTUI.updateWeeksSummary(state.weeks);
      document.dispatchEvent(new CustomEvent("ojt:weeks-data-change"));
      window.OJTUI.showFormMessage(messageElement, "Week deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Week could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  async function saveWeek(event) {
    event.preventDefault();
    const messageElement = getElement("week-form-message");
    window.OJTUI.clearFormMessage(messageElement);

    const isNewWeek = !getValue("week-id");
    const weekRecord = buildWeekRecord();
    const validationMessage = validateWeek(weekRecord);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      const savedWeek = await window.OJTStorage.saveWeek(weekRecord);
      const previousWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || null;
      state.weeks = state.weeks.filter((week) => week.id !== savedWeek.id).concat(savedWeek);
      window.OJTSelectedWeek?.selectWeek(savedWeek.id, {
        weeks: state.weeks,
        source: isNewWeek ? "weeks:new-week" : "weeks:edit"
      });
      state.selectedWeekId = savedWeek.id;
      resetWeekForm();

      if (previousWeekId === savedWeek.id) {
        renderJournal();
      }
      window.OJTUI.updateWeeksSummary(state.weeks);
      document.dispatchEvent(new CustomEvent("ojt:weeks-data-change"));
      window.OJTUI.showFormMessage(getElement("journal-message"), isNewWeek ? "Week created and selected." : "Week changes saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Week could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  function buildWeeklySummaryRecord(form) {
    const week = state.weeks.find((savedWeek) => savedWeek.id === form.dataset.weekId);
    const formData = new FormData(form);

    if (!week) {
      return null;
    }

    return {
      ...week,
      weeklySkillsLearned: String(formData.get("weeklySkillsLearned") || "").trim(),
      problemsEncountered: String(formData.get("problemsEncountered") || "").trim(),
      reflectionOrPointsOfLearning: String(formData.get("reflectionOrPointsOfLearning") || "").trim(),
      additionalNotes: String(formData.get("additionalNotes") || "").trim(),
      updatedAt: nowIso()
    };
  }

  async function saveWeeklySummary(event) {
    event.preventDefault();
    const form = event.target;
    const summaryRecord = buildWeeklySummaryRecord(form);
    const messageElement = form.querySelector(".form-message");
    window.OJTUI.clearFormMessage(messageElement);

    if (!summaryRecord) {
      window.OJTUI.showFormMessage(messageElement, "This week could not be found. Please refresh and try again.", "error");
      return;
    }

    try {
      const savedWeek = await window.OJTStorage.saveWeek(summaryRecord);
      state.weeks = state.weeks.filter((week) => week.id !== savedWeek.id).concat(savedWeek);
      window.OJTSelectedWeek?.selectWeek(savedWeek.id, {
        weeks: state.weeks,
        source: "weeks:summary"
      });
      state.selectedWeekId = savedWeek.id;
      renderJournal();
      window.OJTUI.updateWeeksSummary(state.weeks);
      document.dispatchEvent(new CustomEvent("ojt:weeks-data-change"));
      window.OJTUI.showFormMessage(getElement("weekly-summary-message"), "Weekly summary saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Weekly summary could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  function handleWeekAction(event) {
    const button = event.target.closest("button[data-week-action]");
    if (!button) {
      return;
    }

    const week = state.weeks.find((savedWeek) => savedWeek.id === button.dataset.weekId);
    if (!week) {
      return;
    }

    if (button.dataset.weekAction === "select") {
      selectWeek(week.id, "journal:history");
    }

    if (button.dataset.weekAction === "edit") {
      startEditWeek(week);
    }

    if (button.dataset.weekAction === "delete") {
      deleteWeek(week);
    }
  }

  function getLocalDateText() {
    return formatDate(new Date());
  }

  function logToday() {
    const today = getLocalDateText();
    const containingWeek = sortWeeks(state.weeks).find((week) => {
      return week.inclusiveStartDate <= today && week.inclusiveEndDate >= today;
    });

    const journalSection = getElement("journal");
    if (!journalSection?.classList.contains("is-visible")) {
      window.OJTApp?.showSection("journal");
    }

    if (!containingWeek) {
      window.OJTUI.showFormMessage(
        getElement("journal-message"),
        "No saved week includes today. Select or create a week to continue.",
        "info"
      );
      return;
    }

    const previousWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || null;
    window.OJTSelectedWeek?.selectWeek(containingWeek.id, {
      weeks: state.weeks,
      source: "journal:log-today"
    });
    state.selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || containingWeek.id;

    if (state.selectedWeekId === previousWeekId) {
      renderJournalContext();
    }

    document.dispatchEvent(new CustomEvent("ojt:open-daily-log", {
      detail: {
        weekId: containingWeek.id,
        entryDate: today
      }
    }));
  }

  async function loadJournalData() {
    try {
      const results = await Promise.all([
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs()
      ]);
      state.weeks = results[0] || [];
      state.dailyLogs = results[1] || [];
      state.selectedWeekId = window.OJTSelectedWeek?.initialize(state.weeks) || null;
      renderJournal();
      window.OJTUI.updateWeeksSummary(state.weeks);
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("journal-message"), "Journal data could not be loaded. Refresh and try again.", "error");
      console.error(error);
    }
  }

  async function refreshJournalContextData() {
    try {
      const results = await Promise.all([
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs()
      ]);
      state.weeks = results[0] || [];
      state.dailyLogs = results[1] || [];

      const selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || null;
      state.selectedWeekId = state.weeks.some((week) => week.id === selectedWeekId)
        ? selectedWeekId
        : window.OJTSelectedWeek?.initialize(state.weeks) || null;

      renderJournalContext();
      window.OJTUI.updateWeeksSummary(state.weeks);
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("journal-message"), "Journal data could not be refreshed. Please try again.", "error");
      console.error(error);
    }
  }

  function bindWeekEvents() {
    getElement("week-form")?.addEventListener("submit", saveWeek);
    getElement("cancel-week-edit-button")?.addEventListener("click", () => resetWeekForm());
    getElement("journal-new-week")?.addEventListener("click", openNewWeekForm);
    getElement("journal-empty-new-week")?.addEventListener("click", openNewWeekForm);
    getElement("journal-edit-week")?.addEventListener("click", () => startEditWeek(getSelectedWeek()));
    getElement("journal-focus-weekly-summary")?.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("ojt:focus-weekly-summary", { detail: { source: "journal" } }));
    });
    getElement("journal-open-preview")?.addEventListener("click", () => window.OJTApp?.showSection("weekly-preview"));
    getElement("journal-all-weeks")?.addEventListener("click", toggleHistory);
    getElement("journal-log-today")?.addEventListener("click", logToday);
    getElement("journal-previous-week")?.addEventListener("click", () => selectAdjacentWeek("previous"));
    getElement("journal-next-week")?.addEventListener("click", () => selectAdjacentWeek("next"));
    getElement("journal-week-select")?.addEventListener("change", (event) => {
      selectWeek(event.target.value, "journal:selector");
    });
    getElement("weeks-list")?.addEventListener("click", handleWeekAction);
    getElement("journal-weekly-summary")?.addEventListener("submit", (event) => {
      if (event.target.matches("[data-week-summary-form]")) {
        saveWeeklySummary(event);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindWeekEvents();
    loadJournalData();
  });

  document.addEventListener("ojt:selected-week-change", (event) => {
    const weekId = event.detail?.weekId || null;

    if (weekId && !state.weeks.some((week) => week.id === weekId)) {
      loadJournalData();
      return;
    }

    const selectionChanged = state.selectedWeekId !== weekId;
    if (selectionChanged) {
      resetWeekForm();
    }

    state.selectedWeekId = weekId;

    if (selectionChanged) {
      renderJournal();
    } else {
      renderJournalContext();
    }
  });

  function focusWeeklySummary() {
    const journalSection = getElement("journal");
    if (!journalSection?.classList.contains("is-visible")) {
      window.OJTApp?.showSection("journal");
    }

    const week = getSelectedWeek();
    if (!week) {
      window.OJTUI.showFormMessage(getElement("journal-message"), "Create or select a week before editing its weekly summary.", "info");
      return;
    }

    window.requestAnimationFrame(() => {
      const summaryPanel = getElement("journal-weekly-summary");
      const firstField = summaryPanel?.querySelector("textarea");
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      summaryPanel?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      firstField?.focus();
    });
  }

  document.addEventListener("ojt:focus-weekly-summary", focusWeeklySummary);
  document.addEventListener("ojt:log-today", logToday);
  document.addEventListener("ojt:daily-log-data-change", refreshJournalContextData);

  document.addEventListener("ojt:section-change", (event) => {
    if (event.detail?.sectionId === "journal") {
      refreshJournalContextData();
    }
  });
})();
