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
    const statusText = filled ? "filled" : "missing";
    return `<li class="${filled ? "is-filled" : "is-missing"}">${escapeHtml(label)}: ${statusText}</li>`;
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
      daysElement.innerHTML = '<li class="empty-state">Create an OJT week, then log each day in Journal.</li>';
      summaryElement.innerHTML = `
        <li class="is-missing">Skills Learned: missing</li>
        <li class="is-missing">Problems Encountered: missing</li>
        <li class="is-missing">Reflection: missing</li>
      `;
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
    setText("dashboard-week-dates", `${week.inclusiveStartDate || "Not set"} to ${week.inclusiveEndDate || "Not set"}`);
    setText("dashboard-week-rendered", formatRenderedTime(weeklyRenderedMinutes));
    setText("dashboard-week-logged-days", `${loggedDayCount} of ${weekDates.length}`);
    setText("dashboard-week-worked-days", String(workedDayCount));
    setText("dashboard-week-open-days", String(openDayCount));

    daysElement.innerHTML = weekDates.length > 0
      ? weekDates.map((dateText, index) => {
        const log = getDailyLogForDate(week.id, dateText);
        const isToday = dateText === today;
        const todayClass = isToday ? " is-today" : "";
        const todayLabel = isToday ? " · Today" : "";

        if (!log) {
          return `
            <li class="dashboard-day-row is-empty${todayClass}">
              <button class="dashboard-day-action" type="button" data-dashboard-day-date="${escapeHtml(dateText)}" data-dashboard-week-id="${escapeHtml(week.id)}" aria-label="Open Day ${index + 1}${todayLabel}, ${escapeHtml(dateText)}: Not logged yet in Journal Daily Log">
                <span class="dashboard-day-main">Day ${index + 1}${todayLabel} <small>${escapeHtml(dateText)}</small></span>
                <strong class="dashboard-day-result">Not logged yet</strong>
              </button>
            </li>
          `;
        }

        const dayStatus = normalizeDayStatus(log.dayStatus);
        const taskCount = getTaskCount(log.id);
        const taskText = taskCount > 0 ? (taskCount === 1 ? "1 task" : `${taskCount} tasks`) : "No tasks";
        const renderedText = dayStatus === "Worked" ? formatRenderedTime(log.renderedMinutes) : formatRenderedTime(0);

        return `
          <li class="dashboard-day-row${todayClass}">
            <button class="dashboard-day-action" type="button" data-dashboard-day-date="${escapeHtml(dateText)}" data-dashboard-week-id="${escapeHtml(week.id)}" aria-label="Open Day ${index + 1}${todayLabel}, ${escapeHtml(dateText)}: ${escapeHtml(dayStatus)}, ${escapeHtml(renderedText)}, ${escapeHtml(taskText)} in Journal Daily Log">
              <span class="dashboard-day-main">Day ${index + 1}${todayLabel} <small>${escapeHtml(dateText)}</small></span>
              <strong class="dashboard-day-result">
                <span class="dashboard-day-status">${escapeHtml(dayStatus)}</span>
                <span>${escapeHtml(renderedText)}</span>
                <small>${escapeHtml(taskText)}</small>
              </strong>
            </button>
          </li>
        `;
      }).join("")
      : '<li class="empty-state">This week has no dates saved. Edit the week in Journal to fix the date range.</li>';

    summaryElement.innerHTML = [
      renderSummaryStatusItem("Skills Learned", week.weeklySkillsLearned),
      renderSummaryStatusItem("Problems Encountered", week.problemsEncountered),
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

    const reminderElement = document.getElementById("dashboard-backup-reminder");
    if (reminderElement) {
      const lastBackup = appSettings?.lastBackupDate;
      let showReminder = false;
      if (!lastBackup) {
        showReminder = true;
      } else {
        const lastBackupTime = new Date(lastBackup).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (lastBackupTime < sevenDaysAgo) {
          showReminder = true;
        }
      }
      reminderElement.hidden = !showReminder;
    }

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

  document.addEventListener("DOMContentLoaded", () => {
    refreshDashboardWeekProgress();
    document.getElementById("dashboard-week-days")?.addEventListener("click", openDashboardDay);
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
