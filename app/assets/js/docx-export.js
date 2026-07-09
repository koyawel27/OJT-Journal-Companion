(function () {
  const privateTemplatePath = "assets/templates/bpc-ojt-weekly-journal.private.docx";
  const sanitizedTemplatePath = "assets/templates/bpc-ojt-weekly-journal.docx";
  const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  function assertDependencies() {
    if (!window.PizZip) {
      throw new Error("PizZip is not loaded. Check vendor script order in app/index.html.");
    }

    if (!window.docxtemplater) {
      throw new Error("docxtemplater is not loaded. Check vendor script order in app/index.html.");
    }

    if (!window.OJTJournalPayload) {
      throw new Error("OJTJournalPayload is not loaded. Check script order in app/index.html.");
    }
  }

  async function loadTemplateArrayBuffer() {
    let privateResponse = null;

    try {
      privateResponse = await fetch(privateTemplatePath);
    } catch (error) {
      console.warn("Private DOCX template could not be requested. Falling back to sanitized template.", error);
    }

    if (privateResponse?.ok) {
      return privateResponse.arrayBuffer();
    }

    if (privateResponse?.status && privateResponse.status !== 404) {
      console.warn(`Private DOCX template could not be loaded (${privateResponse.status}). Falling back to sanitized template.`);
    }

    const sanitizedResponse = await fetch(sanitizedTemplatePath);

    if (!sanitizedResponse.ok) {
      throw new Error(`DOCX template could not be loaded (${sanitizedResponse.status}).`);
    }

    return sanitizedResponse.arrayBuffer();
  }

  function getFallbackText(value) {
    return String(value || "").trim() || "Not filled in yet.";
  }

  function buildTemplateData(payload) {
    return {
      studentName: payload.studentName || "Not set",
      companyName: payload.companyName || "Not set",
      weekNumberDisplay: payload.weekNumber ? `#${payload.weekNumber}` : "Not set",
      inclusiveDatesDisplay: payload.inclusiveDatesDisplay || "Not set",
      totalRenderedDisplay: payload.totalRenderedDisplay || "0h 0m",
      weeklySkillsLearned: getFallbackText(payload.weeklySkillsLearned),
      problemsEncountered: getFallbackText(payload.problemsEncountered),
      reflectionOrPointsOfLearning: getFallbackText(payload.reflectionOrPointsOfLearning),
      days: (payload.days || []).map((day) => ({
        dayLabel: day.dayLabel,
        docxAccomplishmentText: day.docxAccomplishmentText || "No daily log recorded."
      }))
    };
  }

  function buildFilename(payload) {
    const weekNumber = payload.weekNumber || "Not-set";
    const startDate = payload.inclusiveStartDate || "no-date";

    return `OJT-Week-${weekNumber}-${startDate}.docx`;
  }

  async function generateBlobFromPayload(payload) {
    assertDependencies();

    const templateBuffer = await loadTemplateArrayBuffer();
    const zip = new window.PizZip(templateBuffer);
    const doc = new window.docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

    doc.render(buildTemplateData(payload));

    return doc.getZip().generate({
      type: "blob",
      mimeType: docxMimeType
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }

  async function buildPayloadForWeek(weekId) {
    const [studentProfile, companyProfile, weeks, dailyLogs, dailyTasks] = await Promise.all([
      window.OJTStorage.getStudentProfile(),
      window.OJTStorage.getCompanyProfile(),
      window.OJTStorage.getWeeks(),
      window.OJTStorage.getDailyLogs(),
      window.OJTStorage.getDailyTasks()
    ]);

    const week = weeks.find((candidate) => candidate.id === weekId);

    if (!week) {
      throw new Error("Selected OJT week could not be found.");
    }

    return window.OJTJournalPayload.buildWeeklyJournalPayload({
      week,
      studentProfile,
      companyProfile,
      dailyLogs,
      dailyTasks
    });
  }

  async function exportPayload(payload) {
    const blob = await generateBlobFromPayload(payload);
    const filename = buildFilename(payload);

    downloadBlob(blob, filename);

    return {
      blob,
      filename,
      payload
    };
  }

  async function exportWeekById(weekId) {
    if (!weekId) {
      throw new Error("Choose a week before exporting DOCX.");
    }

    const payload = await buildPayloadForWeek(weekId);
    return exportPayload(payload);
  }

  async function exportSelectedPreviewWeek() {
    const select = document.getElementById("weekly-preview-week-select");
    const weekId = select?.value || "";

    return exportWeekById(weekId);
  }

  function getDayCountWarning(payload) {
    const dayCount = payload.days.length;

    if (dayCount === 6) {
      return "";
    }

    if (dayCount === 5) {
      return "This week has 5 days. The official template is usually formatted for 6 days.";
    }

    if (dayCount === 7) {
      return "This week has 7 days. You may need to adjust formatting after opening the file.";
    }

    return `This week has ${dayCount} days, which is unusual for the official template.`;
  }

  window.OJTDocxExport = {
    buildFilename,
    buildPayloadForWeek,
    buildTemplateData,
    exportPayload,
    exportSelectedPreviewWeek,
    exportWeekById,
    generateBlobFromPayload,
    getDayCountWarning,
    loadTemplateArrayBuffer
  };
})();
