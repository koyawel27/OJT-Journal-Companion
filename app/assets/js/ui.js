(function () {
  function showFormMessage(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.className = `form-message ${type}`;
    element.hidden = false;
  }

  function clearFormMessage(element) {
    if (!element) {
      return;
    }

    element.textContent = "";
    element.className = "form-message";
    element.hidden = true;
  }

  function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function updateDashboardSummary(studentProfile, companyProfile, appSettings) {
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
    const count = dailyLogs.length;
    const label = count === 1 ? "1 log" : `${count} logs`;
    setText("summary-daily-log-count", label);
    setText(
      "summary-daily-log-detail",
      count > 0 ? "Saved daily logs are grouped by their OJT week." : "Create daily logs after choosing a saved week."
    );
  }
  window.OJTUI = {
    showFormMessage,
    clearFormMessage,
    updateDashboardSummary,
    updateWeeksSummary,
    updateDailyLogsSummary
  };
})();
