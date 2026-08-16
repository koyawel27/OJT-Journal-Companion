(function () {
  const dashboardState = {
    studentProfile: null,
    companyProfile: null,
    appSettings: null,
    weeks: [],
    dailyLogs: [],
    dailyTasks: []
  };

  function showFormMessage(element, message, type) {
    if (!element) {
      return;
    }

    clearTimeout(Number(element.dataset.messageTimer || 0));
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.setAttribute("role", type === "error" ? "alert" : "status");
    element.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    element.setAttribute("aria-atomic", "true");
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
    element.removeAttribute("role");
    element.removeAttribute("aria-live");
    element.removeAttribute("aria-atomic");
    element.hidden = true;
  }

  function clearFormMessages(container) {
    const root = container || document;
    root.querySelectorAll(".form-message").forEach(clearFormMessage);
  }

  function clearFieldValidation(form) {
    if (!form) {
      return;
    }

    const messageId = form.querySelector(".form-message")?.id || "";
    form.querySelectorAll("[aria-invalid=\"true\"]").forEach((field) => {
      field.removeAttribute("aria-invalid");
      const describedBy = (field.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter((id) => id && id !== messageId);
      if (describedBy.length > 0) {
        field.setAttribute("aria-describedby", [...new Set(describedBy)].join(" "));
      } else {
        field.removeAttribute("aria-describedby");
      }
    });
  }

  function setText(id, text) {
    const element = document.getElementById(id);
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

  function formatRenderedTime(minutes) {
    return window.OJTCalculations?.formatRenderedTime(minutes) || "0h 0m";
  }

  function sumRenderedMinutes(dailyLogs) {
    return window.OJTCalculations?.sumRenderedMinutes(dailyLogs) || 0;
  }

  function isValidDate(date) {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  function formatDashboardDate(dateText, options) {
    const date = parseDate(dateText);
    if (!isValidDate(date)) {
      return String(dateText || "Not set");
    }

    return new Intl.DateTimeFormat("en-US", options || {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function formatDashboardWeekRange(startDateText, endDateText) {
    const startDate = parseDate(startDateText);
    const endDate = parseDate(endDateText);

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return `${startDateText || "Not set"} to ${endDateText || "Not set"}`;
    }

    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const startLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" })
    }).format(startDate);
    const endLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(endDate);

    return `${startLabel} – ${endLabel}`;
  }

  function formatBackupTimestamp(value) {
    const date = new Date(value);
    if (!isValidDate(date)) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  function parseDate(dateText) {
    const [year, month, day] = String(dateText || "").split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function todayText() {
    return formatDate(new Date());
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

  function chooseCurrentWeek(weeks) {
    return window.OJTSelectedWeek?.getSelectedWeek(weeks) || null;
  }

  function getLogsForWeek(weekId) {
    return (dashboardState.dailyLogs || []).filter((log) => log.weekId === weekId);
  }

  function getDailyLogForDate(weekId, dateText) {
    return (dashboardState.dailyLogs || []).find((log) => log.weekId === weekId && log.entryDate === dateText) || null;
  }

  function getTaskCount(dailyLogId) {
    return (dashboardState.dailyTasks || []).filter((task) => task.dailyLogId === dailyLogId).length;
  }

  function renderSummaryStatusItem(label, value) {
    const filled = Boolean(String(value || "").trim());
    const statusText = filled ? "Complete" : "Missing";
    const iconPath = filled
      ? '<path d="m7 12.5 3.1 3.1L17.5 8"></path><circle cx="12" cy="12" r="9"></circle>'
      : '<path d="M12 8v5M12 16.5v.1"></path><path d="M10.6 4.4 3.8 17a1.5 1.5 0 0 0 1.3 2.2h13.8a1.5 1.5 0 0 0 1.3-2.2L13.4 4.4a1.6 1.6 0 0 0-2.8 0Z"></path>';
    return `
      <li class="${filled ? "is-filled" : "is-missing"}">
        <span class="dashboard-readiness-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${iconPath}</svg></span>
        <span>${escapeHtml(label)}</span>
        <strong>${statusText}</strong>
      </li>
    `;
  }

  function normalizeDayStatus(value) {
    return window.OJTCalculations?.normalizeDayStatus(value) || "Worked";
  }

  function renderDashboardWeekProgress() {
    const week = chooseCurrentWeek(dashboardState.weeks);
    const daysElement = document.getElementById("dashboard-week-days");
    const summaryElement = document.getElementById("dashboard-week-summary-status");

    if (!daysElement || !summaryElement) {
      return;
    }

    if (!week) {
      setText("dashboard-week-title", "No OJT week yet");
      setText("dashboard-week-dates", "Create your first OJT week to see progress here.");
      setText("dashboard-week-rendered", formatRenderedTime(0));
      setText("dashboard-week-logged-days", "0 of 0");
      setText("dashboard-week-worked-days", "0");
      setText("dashboard-week-open-days", "0");
      setText("dashboard-summary-journal", "Open Journal");
      daysElement.innerHTML = '<li class="empty-state">Create an OJT week, then log each day in Journal.</li>';
      summaryElement.innerHTML = [
        renderSummaryStatusItem("Skills learned", ""),
        renderSummaryStatusItem("Problems encountered", ""),
        renderSummaryStatusItem("Reflection", "")
      ].join("");
      return;
    }

    const weekLogs = getLogsForWeek(week.id);
    const weekDates = getWeekDates(week);
    const weeklyRenderedMinutes = sumRenderedMinutes(weekLogs);
    const loggedDayCount = weekDates.filter((dateText) => Boolean(getDailyLogForDate(week.id, dateText))).length;
    const workedDayCount = weekLogs.filter((log) => normalizeDayStatus(log.dayStatus) === "Worked").length;
    const openDayCount = Math.max(weekDates.length - loggedDayCount, 0);
    const today = todayText();

    setText("dashboard-week-title", `Week ${week.weekNumber || "Not set"}`);
    setText("dashboard-week-dates", formatDashboardWeekRange(week.inclusiveStartDate, week.inclusiveEndDate));
    setText("dashboard-week-rendered", formatRenderedTime(weeklyRenderedMinutes));
    setText("dashboard-week-logged-days", `${loggedDayCount} of ${weekDates.length}`);
    setText("dashboard-week-worked-days", String(workedDayCount));
    setText("dashboard-week-open-days", String(openDayCount));
    setText("dashboard-summary-journal", `Open Week ${week.weekNumber || ""} in Journal`.replace(/\s+/g, " ").trim());

    daysElement.innerHTML = weekDates.length > 0
      ? weekDates.map((dateText, index) => {
        const log = getDailyLogForDate(week.id, dateText);
        const date = parseDate(dateText);
        const weekdayLabel = isValidDate(date)
          ? new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date).toUpperCase()
          : `DAY ${index + 1}`;
        const displayDate = formatDashboardDate(dateText);
        const isToday = dateText === today;
        const todayClass = isToday ? " is-today" : "";
        const todayLabel = isToday ? " · Today" : "";

        if (!log) {
          return `
            <li class="dashboard-day-row is-empty${todayClass}">
              <button class="dashboard-day-action" type="button" data-dashboard-day-date="${escapeHtml(dateText)}" data-dashboard-week-id="${escapeHtml(week.id)}" aria-label="Open Day ${index + 1}${todayLabel}, ${escapeHtml(dateText)}: Not logged yet in Journal Daily Log">
                <span class="dashboard-day-identity">
                  <strong>${escapeHtml(weekdayLabel)}</strong>
                  <small>${escapeHtml(displayDate)}${todayLabel}</small>
                </span>
                <span class="dashboard-day-status is-open">Open</span>
                <span class="dashboard-day-meta"><strong>—</strong><small>Not logged</small></span>
                <span class="dashboard-day-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m9 5 7 7-7 7"></path></svg></span>
              </button>
            </li>
          `;
        }

        const dayStatus = normalizeDayStatus(log.dayStatus);
        const statusClass = dayStatus === "Worked"
          ? "is-worked"
          : (dayStatus === "Absent" ? "is-absent" : "is-off");
        const taskCount = getTaskCount(log.id);
        const taskText = taskCount > 0 ? (taskCount === 1 ? "1 task" : `${taskCount} tasks`) : "No tasks";
        const renderedText = dayStatus === "Worked" ? formatRenderedTime(log.renderedMinutes) : formatRenderedTime(0);

        return `
          <li class="dashboard-day-row${todayClass}">
            <button class="dashboard-day-action" type="button" data-dashboard-day-date="${escapeHtml(dateText)}" data-dashboard-week-id="${escapeHtml(week.id)}" aria-label="Open Day ${index + 1}${todayLabel}, ${escapeHtml(dateText)}: ${escapeHtml(dayStatus)}, ${escapeHtml(renderedText)}, ${escapeHtml(taskText)} in Journal Daily Log">
              <span class="dashboard-day-identity">
                <strong>${escapeHtml(weekdayLabel)}</strong>
                <small>${escapeHtml(displayDate)}${todayLabel}</small>
              </span>
              <span class="dashboard-day-status ${statusClass}">${escapeHtml(dayStatus)}</span>
              <span class="dashboard-day-meta"><strong>${escapeHtml(renderedText)}</strong><small>${escapeHtml(taskText)}</small></span>
              <span class="dashboard-day-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m9 5 7 7-7 7"></path></svg></span>
            </button>
          </li>
        `;
      }).join("")
      : '<li class="empty-state">This week has no dates saved. Edit the week in Journal to fix the date range.</li>';

    summaryElement.innerHTML = [
      renderSummaryStatusItem("Skills learned", week.weeklySkillsLearned),
      renderSummaryStatusItem("Problems encountered", week.problemsEncountered),
      renderSummaryStatusItem("Reflection", week.reflectionOrPointsOfLearning)
    ].join("");

  }

  async function refreshDashboardWeekProgress() {
    if (!window.OJTStorage) {
      return;
    }

    try {
      const [weeks, dailyLogs, dailyTasks] = await Promise.all([
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs(),
        window.OJTStorage.getDailyTasks()
      ]);

      dashboardState.weeks = weeks || [];
      dashboardState.dailyLogs = dailyLogs || [];
      dashboardState.dailyTasks = dailyTasks || [];
      window.OJTSelectedWeek?.initialize(dashboardState.weeks);
      renderDashboardWeekProgress();
      updateRenderedProgressSummary();
    } catch (error) {
      const daysElement = document.getElementById("dashboard-week-days");
      if (daysElement) {
        daysElement.innerHTML = '<li class="empty-state">Could not load week progress. Refresh and try again.</li>';
      }
      console.error(error);
    }
  }

  function updateOjtProgressCard() {
    const totalRenderedMinutes = sumRenderedMinutes(dashboardState.dailyLogs);
    const requiredHours = Number(dashboardState.studentProfile?.requiredOjtHours || 0);
    const requiredMinutes = requiredHours * 60;

    const percentElement = document.getElementById("dashboard-ojt-percent");
    const barWrap = document.getElementById("dashboard-ojt-progress-bar-wrap");
    const bar = document.getElementById("dashboard-ojt-progress-bar");
    const stats = document.getElementById("dashboard-ojt-stats");
    const empty = document.getElementById("dashboard-ojt-empty");

    if (!percentElement || !barWrap || !bar || !stats || !empty) {
      return;
    }

    if (!Number.isFinite(requiredHours) || requiredHours <= 0) {
      percentElement.textContent = "—";
      percentElement.setAttribute("aria-hidden", "true");
      barWrap.hidden = true;
      stats.hidden = true;
      empty.hidden = false;
      empty.textContent = totalRenderedMinutes > 0
        ? "Add your required OJT hours in Settings to see completion progress."
        : "Add your required OJT hours in Settings to track overall progress here.";
      return;
    }

    const percent = requiredMinutes > 0
      ? Math.min(100, Math.round((totalRenderedMinutes / requiredMinutes) * 100))
      : 0;
    const remainingMinutes = Math.max(requiredMinutes - totalRenderedMinutes, 0);
    const requiredLabel = requiredHours === 1 ? "1 hour" : `${requiredHours} hours`;

    percentElement.textContent = `${percent}%`;
    percentElement.removeAttribute("aria-hidden");
    bar.style.width = `${percent}%`;
    barWrap.hidden = false;
    barWrap.setAttribute("aria-valuenow", String(percent));
    stats.hidden = false;
    empty.hidden = true;

    setText("dashboard-ojt-rendered", formatRenderedTime(totalRenderedMinutes));
    setText("dashboard-ojt-required", requiredLabel);
    setText("dashboard-ojt-remaining", formatRenderedTime(remainingMinutes));
  }

  function updateRenderedProgressSummary() {
    const totalRenderedMinutes = sumRenderedMinutes(dashboardState.dailyLogs);

    setText("summary-rendered-time", formatRenderedTime(totalRenderedMinutes));
    setText(
      "summary-rendered-detail",
      totalRenderedMinutes > 0
        ? "Total rendered time across all saved daily logs."
        : "Save complete daily time records to track OJT progress."
    );
    updateOjtProgressCard();
  }

  function updateDashboardBackupStatus(appSettings) {
    const reminderElement = document.getElementById("dashboard-backup-reminder");
    if (!reminderElement) {
      return;
    }

    const lastBackup = appSettings?.lastBackupDate;
    const lastBackupTime = lastBackup ? new Date(lastBackup).getTime() : Number.NaN;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let state = "missing";
    let title = "No backup yet";
    let detail = "Your journal is stored only in this browser. Export a JSON backup so your records can be restored if this browser data is lost.";
    let meta = "JSON backup is the recovery path. DOCX files cannot restore app data.";

    if (Number.isFinite(lastBackupTime)) {
      meta = `Last backup: ${formatBackupTimestamp(lastBackup)}.`;
      if (lastBackupTime < sevenDaysAgo) {
        state = "attention";
        title = "Backup needs attention";
        detail = "Your latest JSON backup is more than 7 days old. Export a fresh backup to keep your recoverable copy current.";
      } else {
        state = "current";
        title = "Backup current";
        detail = "Your latest JSON backup is recent. Records are still stored only in this browser, so keep exporting backups regularly.";
      }
    }

    reminderElement.dataset.backupState = state;
    setText("dashboard-backup-title", title);
    setText("dashboard-backup-detail", detail);
    setText("dashboard-backup-meta", meta);
    reminderElement.hidden = false;
  }

  function updateDashboardSummary(studentProfile, companyProfile, appSettings) {
    dashboardState.studentProfile = studentProfile;
    dashboardState.companyProfile = companyProfile;
    dashboardState.appSettings = appSettings;

    setText("summary-student-name", studentProfile?.studentName || "Not set yet");
    setText(
      "summary-student-detail",
      studentProfile?.courseOrProgram || "Add your student details in Settings so they appear on your journal."
    );

    setText("summary-company-name", companyProfile?.companyName || "Not set yet");
    setText(
      "summary-company-detail",
      companyProfile?.departmentOrAssignedArea || "Add your company details in Settings so they appear on your weekly journal preview."
    );

    updateDashboardBackupStatus(appSettings);

    updateRenderedProgressSummary();
    renderDashboardWeekProgress();
  }

  function updateWeeksSummary(weeks) {
    const count = weeks.length;
    const label = count === 1 ? "1 week" : `${count} weeks`;
    setText("summary-week-count", label);
    setText(
      "summary-week-detail",
      count > 0 ? "Saved weeks are ready in Journal and Preview & Export." : "Create your first OJT week in Journal before adding daily records."
    );
    refreshDashboardWeekProgress();
  }


  function updateDailyLogsSummary(dailyLogs) {
    const logs = dailyLogs || [];
    dashboardState.dailyLogs = logs;
    const count = logs.length;
    const label = count === 1 ? "1 log" : `${count} logs`;
    setText("summary-daily-log-count", label);
    setText(
      "summary-daily-log-detail",
      count > 0 ? "Daily records are grouped by the selected OJT week." : "Create a week in Journal, then log each day."
    );
    updateRenderedProgressSummary();
    refreshDashboardWeekProgress();
  }

  document.addEventListener("input", (event) => {
    const form = event.target.closest?.("form");

    if (form) {
      clearFormMessages(form);
      clearFieldValidation(form);
    }
  });

  document.addEventListener("change", (event) => {
    const form = event.target.closest?.("form");

    if (form) {
      clearFormMessages(form);
      clearFieldValidation(form);
    }
  });

  document.addEventListener("ojt:section-change", () => {
    clearFormMessages(document);
  });

  document.addEventListener("ojt:section-change", (event) => {
    if (event.detail?.sectionId === "dashboard") {
      refreshDashboardWeekProgress();
    }
  });

  document.addEventListener("ojt:selected-week-change", () => {
    refreshDashboardWeekProgress();
  });

  function openDashboardDay(event) {
    const button = event.target.closest?.("button[data-dashboard-day-date]");
    if (!button) {
      return;
    }

    const week = dashboardState.weeks.find((savedWeek) => savedWeek.id === button.dataset.dashboardWeekId);
    if (!week) {
      return;
    }

    window.OJTSelectedWeek?.selectWeek(week.id, { weeks: dashboardState.weeks, source: "dashboard:day" });
    window.OJTApp?.showSection("journal");
    document.dispatchEvent(new CustomEvent("ojt:open-daily-log", {
      detail: { weekId: week.id, entryDate: button.dataset.dashboardDayDate }
    }));
  }

  function openDashboardJournal() {
    const week = chooseCurrentWeek(dashboardState.weeks);
    if (week) {
      window.OJTSelectedWeek?.selectWeek(week.id, { weeks: dashboardState.weeks, source: "dashboard:summary" });
    }
    window.OJTApp?.showSection("journal");
  }

  document.addEventListener("DOMContentLoaded", () => {
    refreshDashboardWeekProgress();
    document.getElementById("dashboard-week-days")?.addEventListener("click", openDashboardDay);
    document.getElementById("dashboard-summary-journal")?.addEventListener("click", openDashboardJournal);
    document.getElementById("dashboard-reminder-recovery")?.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("ojt:focus-settings-section", { detail: { target: "recovery" } }));
    });
  });

  window.OJTUI = {
    showFormMessage,
    clearFormMessage,
    clearFormMessages,
    clearFieldValidation,
    refreshDashboardWeekProgress,
    updateDashboardSummary,
    updateWeeksSummary,
    updateDailyLogsSummary
  };
})();
