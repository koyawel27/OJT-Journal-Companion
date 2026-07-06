(function () {
  const dashboardState = {
    studentProfile: null,
    companyProfile: null,
    appSettings: null,
    dailyLogs: []
  };

  function showFormMessage(element, message, type) {
    if (!element) {
      return;
    }

    clearTimeout(Number(element.dataset.messageTimer || 0));
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.hidden = false;

    if (type === "success") {
      const timer = window.setTimeout(() => {
        clearFormMessage(element);
      }, 3500);
      element.dataset.messageTimer = String(timer);
    } else {
      delete element.dataset.messageTimer;
    }
  }

  function clearFormMessage(element) {
    if (!element) {
      return;
    }

    clearTimeout(Number(element.dataset.messageTimer || 0));
    delete element.dataset.messageTimer;
    element.textContent = "";
    element.className = "form-message";
    element.hidden = true;
  }

  function clearFormMessages(container) {
    const root = container || document;
    root.querySelectorAll(".form-message").forEach(clearFormMessage);
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function formatRenderedTime(minutes) {
    return window.OJTCalculations?.formatRenderedTime(minutes) || "0h 0m";
  }

  function sumRenderedMinutes(dailyLogs) {
    return window.OJTCalculations?.sumRenderedMinutes(dailyLogs) || 0;
  }

  function updateRenderedProgressSummary() {
    const totalRenderedMinutes = sumRenderedMinutes(dashboardState.dailyLogs);
    const requiredHours = Number(dashboardState.studentProfile?.requiredOjtHours || 0);
    const requiredMinutes = requiredHours * 60;

    setText("summary-rendered-time", formatRenderedTime(totalRenderedMinutes));

    if (requiredMinutes > 0) {
      const remainingMinutes = Math.max(requiredMinutes - totalRenderedMinutes, 0);
      const remainingText = formatRenderedTime(remainingMinutes);
      setText("summary-rendered-detail", `${remainingText} remaining from ${requiredHours} required hours.`);
      return;
    }

    setText(
      "summary-rendered-detail",
      totalRenderedMinutes > 0
        ? "Total rendered time across all saved daily logs."
        : "Save complete daily time records to track OJT progress."
    );
  }

  function updateDashboardSummary(studentProfile, companyProfile, appSettings) {
    dashboardState.studentProfile = studentProfile;
    dashboardState.companyProfile = companyProfile;
    dashboardState.appSettings = appSettings;

    setText("summary-student-name", studentProfile?.studentName || "Not set yet");
    setText(
      "summary-student-detail",
      studentProfile?.courseOrProgram || "Save your student profile to show it here."
    );

    setText("summary-company-name", companyProfile?.companyName || "Not set yet");
    setText(
      "summary-company-detail",
      companyProfile?.departmentOrAssignedArea || "Save your company profile to show it here."
    );

    const weekStart = appSettings?.preferredWeekStartDay || "Monday";
    const timeFormat = appSettings?.timeFormat || "24-hour";
    setText("summary-settings", `${weekStart}, ${timeFormat}`);

    if (studentProfile && Number(studentProfile.requiredOjtHours) > 0) {
      setText("summary-required-hours", `${studentProfile.requiredOjtHours} required OJT hours saved.`);
    } else {
      setText("summary-required-hours", "Required OJT hours will appear after saving.");
    }

    updateRenderedProgressSummary();
  }

  function updateWeeksSummary(weeks) {
    const count = weeks.length;
    const label = count === 1 ? "1 week" : `${count} weeks`;
    setText("summary-week-count", label);
    setText(
      "summary-week-detail",
      count > 0 ? "Saved OJT weeks are ready for future daily logs." : "Create OJT weeks to organize future daily logs."
    );
  }


  function updateDailyLogsSummary(dailyLogs) {
    const logs = dailyLogs || [];
    dashboardState.dailyLogs = logs;
    const count = logs.length;
    const label = count === 1 ? "1 log" : `${count} logs`;
    setText("summary-daily-log-count", label);
    setText(
      "summary-daily-log-detail",
      count > 0 ? "Saved daily logs are grouped by their OJT week." : "Create daily logs after choosing a saved week."
    );
    updateRenderedProgressSummary();
  }

  document.addEventListener("input", (event) => {
    const form = event.target.closest?.("form");

    if (form) {
      clearFormMessages(form);
    }
  });

  document.addEventListener("change", (event) => {
    const form = event.target.closest?.("form");

    if (form) {
      clearFormMessages(form);
    }
  });

  document.addEventListener("ojt:section-change", () => {
    clearFormMessages(document);
  });

  window.OJTUI = {
    showFormMessage,
    clearFormMessage,
    clearFormMessages,
    updateDashboardSummary,
    updateWeeksSummary,
    updateDailyLogsSummary
  };
})();
