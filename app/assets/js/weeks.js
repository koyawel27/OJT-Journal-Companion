(function () {
  const state = {
    weeks: [],
    selectedWeekId: null
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

    return `week-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

  function getCurrentWeek() {
    const weekId = getValue("week-id");
    return state.weeks.find((week) => week.id === weekId) || null;
  }

  function buildWeekRecord() {
    const currentWeek = getCurrentWeek();
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
      return "Please enter the week number.";
    }

    if (Number.isNaN(weekRecord.weekNumber) || weekRecord.weekNumber <= 0) {
      return "Week number must be a positive number.";
    }

    const duplicateWeek = state.weeks.find((week) => {
      return week.id !== weekRecord.id && week.weekNumber === weekRecord.weekNumber;
    });

    if (duplicateWeek) {
      return "That week number is already saved. Please use a unique week number.";
    }

    if (!weekRecord.inclusiveStartDate) {
      return "Please choose the inclusive start date.";
    }

    if (!weekRecord.inclusiveEndDate) {
      return "Please choose the inclusive end date.";
    }

    if (weekRecord.inclusiveStartDate > weekRecord.inclusiveEndDate) {
      return "Inclusive start date must not be later than inclusive end date.";
    }

    if (hasOverlappingRange(weekRecord)) {
      return "This date range overlaps an existing week. Please choose a separate range.";
    }

    return "";
  }

  function resetWeekForm() {
    setValue("week-id", "");
    setValue("week-number", "");
    setValue("inclusive-start-date", "");
    setValue("inclusive-end-date", "");
    setText("week-form-title", "Create week");
    setText("save-week-button", "Save week");
    getElement("cancel-week-edit-button").hidden = true;
    window.OJTUI.clearFormMessage(getElement("week-form-message"));
  }

  function renderWeeksList() {
    const list = getElement("weeks-list");
    const countLabel = getElement("weeks-count-label");
    const sortedWeeks = sortWeeks(state.weeks);

    list.innerHTML = "";
    countLabel.textContent = sortedWeeks.length === 1 ? "1 week saved." : `${sortedWeeks.length} weeks saved.`;

    if (sortedWeeks.length === 0) {
      list.innerHTML = '<p class="empty-state">No weeks saved yet. Create your first OJT week above.</p>';
      return;
    }

    sortedWeeks.forEach((week) => {
      const isSelected = state.selectedWeekId === week.id;
      const detailButtonLabel = isSelected ? "Hide Details" : "View";
      const item = document.createElement("article");
      item.className = "week-item";
      item.innerHTML = `
        <div>
          <span class="card-label">Week ${week.weekNumber}</span>
          <h4>${week.inclusiveStartDate} to ${week.inclusiveEndDate}</h4>
          <p>No daily logs yet.</p>
        </div>
        <div class="week-actions">
          <button class="secondary-button" type="button" data-week-action="view" data-week-id="${week.id}" aria-expanded="${isSelected}" aria-controls="week-detail-panel">${detailButtonLabel}</button>
          <button class="secondary-button" type="button" data-week-action="edit" data-week-id="${week.id}">Edit</button>
          <button class="danger-button" type="button" data-week-action="delete" data-week-id="${week.id}">Delete</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  function renderDaySlots(week) {
    const daySlots = getElement("day-slots");
    const startDate = parseDate(week.inclusiveStartDate);
    const endDate = parseDate(week.inclusiveEndDate);
    let currentDate = startDate;
    let dayNumber = 1;

    daySlots.innerHTML = "";

    while (currentDate <= endDate) {
      const dateText = formatDate(currentDate);
      const slot = document.createElement("article");
      slot.className = "day-slot";
      slot.innerHTML = `
        <div>
          <strong>Day ${dayNumber} - ${dateText}</strong>
          <p>No daily log yet.</p>
        </div>
        <button class="secondary-button" type="button" disabled>Coming in Phase 4</button>
      `;
      daySlots.appendChild(slot);
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber += 1;
    }
  }

  function showWeekDetail(week) {
    state.selectedWeekId = week.id;
    const detailPanel = getElement("week-detail-panel");
    detailPanel.hidden = false;
    setText("week-detail-title", `Week ${week.weekNumber}`);
    setText("week-detail-range", `${week.inclusiveStartDate} to ${week.inclusiveEndDate}`);
    renderDaySlots(week);
    renderWeeksList();
  }

  function hideWeekDetail() {
    state.selectedWeekId = null;
    const detailPanel = getElement("week-detail-panel");
    detailPanel.hidden = true;
    setText("week-detail-title", "Select a week");
    setText("week-detail-range", "Choose View from the weeks list.");
    getElement("day-slots").innerHTML = "";
    renderWeeksList();
  }

  function startEditWeek(week) {
    setValue("week-id", week.id);
    setValue("week-number", week.weekNumber);
    setValue("inclusive-start-date", week.inclusiveStartDate);
    setValue("inclusive-end-date", week.inclusiveEndDate);
    setText("week-form-title", `Edit Week ${week.weekNumber}`);
    setText("save-week-button", "Save changes");
    getElement("cancel-week-edit-button").hidden = false;
    window.OJTUI.clearFormMessage(getElement("week-form-message"));
  }

  async function deleteWeek(week) {
    const confirmed = window.confirm(`Delete Week ${week.weekNumber}? This only removes the week record in Phase 3.`);

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteWeek(week.id);
      state.weeks = state.weeks.filter((savedWeek) => savedWeek.id !== week.id);
      if (state.selectedWeekId === week.id) {
        hideWeekDetail();
      } else {
        renderWeeksList();
      }
      window.OJTUI.updateWeeksSummary(state.weeks);
      window.OJTUI.showFormMessage(getElement("week-form-message"), "Week deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("week-form-message"), "Week could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  async function saveWeek(event) {
    event.preventDefault();
    const messageElement = getElement("week-form-message");
    window.OJTUI.clearFormMessage(messageElement);

    const weekRecord = buildWeekRecord();
    const validationMessage = validateWeek(weekRecord);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      const savedWeek = await window.OJTStorage.saveWeek(weekRecord);
      state.weeks = state.weeks.filter((week) => week.id !== savedWeek.id).concat(savedWeek);
      window.OJTUI.updateWeeksSummary(state.weeks);
      if (state.selectedWeekId === savedWeek.id) {
        showWeekDetail(savedWeek);
      } else {
        renderWeeksList();
      }
      resetWeekForm();
      window.OJTUI.showFormMessage(messageElement, "Week saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Week could not be saved. Please try again.", "error");
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

    if (button.dataset.weekAction === "view") {
      if (state.selectedWeekId === week.id) {
        hideWeekDetail();
      } else {
        showWeekDetail(week);
      }
    }

    if (button.dataset.weekAction === "edit") {
      startEditWeek(week);
    }

    if (button.dataset.weekAction === "delete") {
      deleteWeek(week);
    }
  }

  async function loadWeeks() {
    try {
      state.weeks = await window.OJTStorage.getWeeks();
      renderWeeksList();
      window.OJTUI.updateWeeksSummary(state.weeks);
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("week-form-message"), "Saved weeks could not be loaded. Please refresh and try again.", "error");
      console.error(error);
    }
  }

  function bindWeekEvents() {
    getElement("week-form")?.addEventListener("submit", saveWeek);
    getElement("cancel-week-edit-button")?.addEventListener("click", resetWeekForm);
    getElement("weeks-list")?.addEventListener("click", handleWeekAction);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindWeekEvents();
    loadWeeks();
  });
})();
