(function () {
  const dayStatuses = ["Worked", "Absent", "No OJT / Rest Day"];

  function normalizeDayStatus(value) {
    return dayStatuses.includes(value) ? value : "Worked";
  }

  function isWorkedDay(log) {
    return normalizeDayStatus(log?.dayStatus) === "Worked";
  }

  function isValidTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");
  }

  function parseTimeToMinutes(value) {
    if (!isValidTime(value)) {
      return null;
    }

    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function normalizeBreakMinutes(value) {
    const minutes = Number(value || 0);
    return Number.isFinite(minutes) ? minutes : NaN;
  }

  function calculateRenderedTime(timeIn, timeOut, breakMinutesValue) {
    const breakMinutes = normalizeBreakMinutes(breakMinutesValue);

    if (Number.isNaN(breakMinutes) || breakMinutes < 0) {
      return {
        renderedMinutes: null,
        renderedHours: null,
        isComplete: false,
        error: "Break minutes must be zero or a positive number."
      };
    }

    if (!timeIn || !timeOut) {
      return {
        renderedMinutes: null,
        renderedHours: null,
        isComplete: false,
        error: ""
      };
    }

    if (!isValidTime(timeIn) || !isValidTime(timeOut)) {
      return {
        renderedMinutes: null,
        renderedHours: null,
        isComplete: false,
        error: "Time in and time out should use valid HH:mm values."
      };
    }

    const startMinutes = parseTimeToMinutes(timeIn);
    const endMinutes = parseTimeToMinutes(timeOut);
    const totalMinutes = endMinutes - startMinutes;

    if (totalMinutes <= 0) {
      return {
        renderedMinutes: null,
        renderedHours: null,
        isComplete: false,
        error: "Time out must be later than time in. Same-day logs only are supported."
      };
    }

    if (breakMinutes >= totalMinutes) {
      return {
        renderedMinutes: null,
        renderedHours: null,
        isComplete: false,
        error: "Break minutes must be less than the total time between time in and time out."
      };
    }

    const renderedMinutes = totalMinutes - breakMinutes;

    return {
      renderedMinutes,
      renderedHours: renderedMinutes / 60,
      isComplete: true,
      error: ""
    };
  }

  function formatRenderedTime(minutesValue) {
    const minutes = Number(minutesValue);

    if (!Number.isFinite(minutes) || minutes < 0) {
      return "Not calculated";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  }

  function getRenderedMinutes(log) {
    if (!isWorkedDay(log)) {
      return 0;
    }

    const minutes = Number(log?.renderedMinutes);
    return Number.isFinite(minutes) && minutes >= 0 ? minutes : 0;
  }

  function sumRenderedMinutes(logs) {
    return (logs || []).reduce((total, log) => total + getRenderedMinutes(log), 0);
  }

  function sumTaskMinutes(tasks) {
    return (tasks || []).reduce((total, task) => {
      const minutes = Number(task?.timeSpentMinutes);
      return Number.isFinite(minutes) && minutes > 0 ? total + minutes : total;
    }, 0);
  }

  window.OJTCalculations = {
    calculateRenderedTime,
    dayStatuses,
    formatRenderedTime,
    getRenderedMinutes,
    isValidTime,
    isWorkedDay,
    normalizeDayStatus,
    sumRenderedMinutes,
    sumTaskMinutes
  };
})();
