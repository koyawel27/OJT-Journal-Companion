(function () {
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

  function getWeekDates(week) {
    if (!week?.inclusiveStartDate || !week?.inclusiveEndDate) {
      return [];
    }

    const currentDate = parseDate(week.inclusiveStartDate);
    const endDate = parseDate(week.inclusiveEndDate);

    if (Number.isNaN(currentDate.getTime()) || Number.isNaN(endDate.getTime()) || currentDate > endDate) {
      return [];
    }

    const dates = [];

    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  function sortTasks(tasks) {
    return [...(tasks || [])].sort((first, second) => {
      return (first.sortOrder || 0) - (second.sortOrder || 0) ||
        String(first.createdAt || "").localeCompare(String(second.createdAt || ""));
    });
  }

  function getLogsForWeek(weekId, dailyLogs) {
    return (dailyLogs || []).filter((log) => log.weekId === weekId);
  }

  function getDailyLogForDate(weekId, dateText, dailyLogs) {
    return (dailyLogs || []).find((log) => log.weekId === weekId && log.entryDate === dateText) || null;
  }

  function getTasksForLog(dailyLogId, dailyTasks) {
    return sortTasks((dailyTasks || []).filter((task) => task.dailyLogId === dailyLogId));
  }

  function getSummaryText(value) {
    return String(value || "").trim() || "Not filled in yet.";
  }

  function formatTaskDuration(minutesValue) {
    const minutes = Number(minutesValue);

    if (!Number.isFinite(minutes) || minutes <= 0) {
      return "";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${remainingMinutes}m`;
  }

  function getTaskText(task, options = {}) {
    const description = String(task?.description || "").trim();

    if (!description) {
      return "";
    }

    const duration = formatTaskDuration(task.timeSpentMinutes);
    const status = String(task?.status || "").trim();
    let text = duration ? `${description} (${duration})` : description;

    if (options.includeStatus) {
      const statusText = status || options.fallbackStatus || "";

      if (statusText) {
        text += ` - ${statusText}`;
      }
    }

    if (options.includeBullet) {
      text = `\u2022 ${text}`;
    }

    return text;
  }

  function getTaskCopyText(task) {
    return getTaskText(task, { includeStatus: true });
  }

  function getTaskDocxText(task) {
    return getTaskText(task, { fallbackStatus: "Pending", includeBullet: true, includeStatus: true });
  }

  function getAccomplishmentLines(dailyLog, tasks, taskTextBuilder) {
    if (!dailyLog) {
      return ["No daily log recorded."];
    }

    const dayStatus = window.OJTCalculations.normalizeDayStatus(dailyLog.dayStatus);
    const remarks = String(dailyLog.dayRemarks || "").trim();

    if (dayStatus === "Absent" || dayStatus === "No OJT / Rest Day") {
      return [`${dayStatus}${remarks ? ` - ${remarks}` : ""}`];
    }

    const taskLines = tasks.map(taskTextBuilder).filter(Boolean);

    return taskLines.length > 0 ? taskLines : ["No task items recorded for this day."];
  }

  function buildWeeklyJournalPayload(options) {
    const week = options?.week || null;
    const studentProfile = options?.studentProfile || null;
    const companyProfile = options?.companyProfile || null;
    const dailyLogs = options?.dailyLogs || [];
    const dailyTasks = options?.dailyTasks || [];
    const weekLogs = week ? getLogsForWeek(week.id, dailyLogs) : [];
    const totalRenderedMinutes = window.OJTCalculations.sumRenderedMinutes(weekLogs);
    const dates = getWeekDates(week);

    const days = dates.map((dateText, index) => {
      const dailyLog = getDailyLogForDate(week.id, dateText, dailyLogs);
      const tasks = dailyLog ? getTasksForLog(dailyLog.id, dailyTasks) : [];
      const dayStatus = dailyLog ? window.OJTCalculations.normalizeDayStatus(dailyLog.dayStatus) : "";
      const renderedMinutes = dailyLog ? window.OJTCalculations.getRenderedMinutes(dailyLog) : 0;
      const copyLines = getAccomplishmentLines(dailyLog, tasks, getTaskCopyText);
      const docxLines = getAccomplishmentLines(dailyLog, tasks, getTaskDocxText);

      return {
        date: dateText,
        dayLabel: `Day ${index + 1}`,
        dailyLog,
        dayStatus,
        renderedMinutes,
        renderedDisplay: window.OJTCalculations.formatRenderedTime(renderedMinutes),
        tasks,
        previewText: copyLines.join("\n"),
        copyText: copyLines.join("\n"),
        docxAccomplishmentText: docxLines.join("\n")
      };
    });

    return {
      studentName: studentProfile?.studentName || "",
      companyName: companyProfile?.companyName || "",
      weekNumber: week?.weekNumber || "",
      inclusiveStartDate: week?.inclusiveStartDate || "",
      inclusiveEndDate: week?.inclusiveEndDate || "",
      inclusiveDatesDisplay: week ? `${week.inclusiveStartDate || "Not set"} to ${week.inclusiveEndDate || "Not set"}` : "Not set to Not set",
      totalRenderedMinutes,
      totalRenderedDisplay: window.OJTCalculations.formatRenderedTime(totalRenderedMinutes),
      weeklySkillsLearned: week?.weeklySkillsLearned || "",
      problemsEncountered: week?.problemsEncountered || "",
      reflectionOrPointsOfLearning: week?.reflectionOrPointsOfLearning || "",
      dailyLogCount: weekLogs.length,
      summaryDisplay: {
        weeklySkillsLearned: getSummaryText(week?.weeklySkillsLearned),
        problemsEncountered: getSummaryText(week?.problemsEncountered),
        reflectionOrPointsOfLearning: getSummaryText(week?.reflectionOrPointsOfLearning)
      },
      days
    };
  }

  window.OJTJournalPayload = {
    buildWeeklyJournalPayload,
    getSummaryText,
    getTaskCopyText,
    getTaskDocxText,
    getWeekDates
  };
})();
