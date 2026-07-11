(function () {
  const STORAGE_KEY = "ojt-journal-companion:selected-week-id";
  let selectedWeekId = null;
  let currentWeeks = [];

  function getLocalDateText() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getPersistedWeekId() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || null;
    } catch (error) {
      console.warn("Selected week preference could not be read:", error);
      return null;
    }
  }

  function persistWeekId(weekId) {
    try {
      if (weekId) {
        window.localStorage.setItem(STORAGE_KEY, weekId);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Selected week preference could not be saved:", error);
    }
  }

  function compareWeeks(first, second) {
    const startDateComparison = String(first?.inclusiveStartDate || "").localeCompare(String(second?.inclusiveStartDate || ""));
    if (startDateComparison !== 0) {
      return startDateComparison;
    }

    const endDateComparison = String(first?.inclusiveEndDate || "").localeCompare(String(second?.inclusiveEndDate || ""));
    if (endDateComparison !== 0) {
      return endDateComparison;
    }

    const firstNumber = Number(first?.weekNumber);
    const secondNumber = Number(second?.weekNumber);
    const firstNumberIsValid = Number.isFinite(firstNumber);
    const secondNumberIsValid = Number.isFinite(secondNumber);

    if (firstNumberIsValid && secondNumberIsValid && firstNumber !== secondNumber) {
      return firstNumber - secondNumber;
    }

    if (firstNumberIsValid !== secondNumberIsValid) {
      return firstNumberIsValid ? -1 : 1;
    }

    return String(first?.id || "").localeCompare(String(second?.id || ""));
  }

  function sortWeeksChronologically(weeks) {
    return [...(Array.isArray(weeks) ? weeks : [])].sort(compareWeeks);
  }

  function getValidWeekId(weekId, weeks) {
    if (!weekId) {
      return null;
    }

    return (weeks || []).some((week) => week?.id === weekId) ? weekId : null;
  }

  function resolveInitialSelection(weeks) {
    const sortedWeeks = sortWeeksChronologically(weeks);
    const today = getLocalDateText();
    const containingWeek = sortedWeeks.find((week) => {
      return week.inclusiveStartDate <= today && week.inclusiveEndDate >= today;
    });

    if (containingWeek) {
      return containingWeek.id;
    }

    const persistedWeekId = getValidWeekId(getPersistedWeekId(), sortedWeeks);
    if (persistedWeekId) {
      return persistedWeekId;
    }

    return sortedWeeks.at(-1)?.id || null;
  }

  function dispatchSelectionChange(source) {
    document.dispatchEvent(new CustomEvent("ojt:selected-week-change", {
      detail: {
        weekId: selectedWeekId,
        source: source || "selected-week"
      }
    }));
  }

  function setSelection(weekId, source) {
    const nextWeekId = weekId || null;
    const changed = selectedWeekId !== nextWeekId;

    selectedWeekId = nextWeekId;
    persistWeekId(selectedWeekId);

    if (changed) {
      dispatchSelectionChange(source);
    }

    return selectedWeekId;
  }

  function initialize(weeks) {
    currentWeeks = Array.isArray(weeks) ? weeks : [];
    const currentSelection = getValidWeekId(selectedWeekId, currentWeeks);
    const nextSelection = currentSelection || resolveInitialSelection(currentWeeks);
    const source = selectedWeekId ? "initialize-invalid-selection" : "initialize";

    return setSelection(nextSelection, source);
  }

  function getSelectedWeekId() {
    return selectedWeekId;
  }

  function getSelectedWeek(weeks) {
    const availableWeeks = Array.isArray(weeks) ? weeks : currentWeeks;
    return availableWeeks.find((week) => week?.id === selectedWeekId) || null;
  }

  function selectWeek(weekId, options) {
    const settings = options || {};
    if (Array.isArray(settings.weeks)) {
      currentWeeks = settings.weeks;
    }

    const validWeekId = getValidWeekId(weekId, currentWeeks);
    if (!validWeekId) {
      return false;
    }

    setSelection(validWeekId, settings.source || "select");
    return true;
  }

  function clearSelection(options) {
    const settings = options || {};
    if (Array.isArray(settings.weeks)) {
      currentWeeks = settings.weeks;
    }

    setSelection(null, settings.source || "clear");
  }

  function getPreviousWeek(weeks, weekId) {
    const sortedWeeks = sortWeeksChronologically(weeks);
    const index = sortedWeeks.findIndex((week) => week.id === weekId);
    return index > 0 ? sortedWeeks[index - 1] : null;
  }

  function getNextWeek(weeks, weekId) {
    const sortedWeeks = sortWeeksChronologically(weeks);
    const index = sortedWeeks.findIndex((week) => week.id === weekId);
    return index >= 0 && index < sortedWeeks.length - 1 ? sortedWeeks[index + 1] : null;
  }

  window.OJTSelectedWeek = {
    initialize,
    getSelectedWeekId,
    getSelectedWeek,
    selectWeek,
    resolveInitialSelection,
    sortWeeksChronologically,
    getPreviousWeek,
    getNextWeek,
    clearSelection,
    storageKey: STORAGE_KEY
  };
})();
