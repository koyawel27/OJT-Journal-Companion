import { createReport } from "../vendor/docx-templates-4.15.0/browser.js";

const privateTemplatePath = "assets/templates/bpc-ojt-weekly-journal.private.v2.docx";
const sanitizedTemplatePath = "assets/templates/bpc-ojt-weekly-journal.v2.docx";
const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const directImageTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png"
};
const maxImageWidthCm = 13.2;
const maxImageHeightCm = 10.5;

function createExportError(message, cause) {
  const error = new Error(message);
  error.cause = cause;
  return error;
}

function assertDependencies() {
  if (!window.OJTJournalPayload) {
    throw createExportError("DOCX export data helpers are not available. Reload the app and try again.");
  }

  if (!window.OJTStorage) {
    throw createExportError("Saved OJT data is not available. Reload the app and try again.");
  }

  if (typeof createReport !== "function") {
    throw createExportError("The DOCX v2 export library is not available. Reload the app and try again.");
  }
}

async function loadTemplateArrayBuffer() {
  let privateResponse;

  try {
    privateResponse = await fetch(privateTemplatePath);
  } catch (error) {
    throw createExportError("The private v2 DOCX template could not be requested.", error);
  }

  if (privateResponse.ok) {
    return privateResponse.arrayBuffer();
  }

  if (privateResponse.status !== 404) {
    throw createExportError(`The private v2 DOCX template could not be loaded (${privateResponse.status}).`);
  }

  let sanitizedResponse;

  try {
    sanitizedResponse = await fetch(sanitizedTemplatePath);
  } catch (error) {
    throw createExportError("The sanitized v2 DOCX template could not be requested.", error);
  }

  if (!sanitizedResponse.ok) {
    throw createExportError(`The sanitized v2 DOCX template could not be loaded (${sanitizedResponse.status}).`);
  }

  return sanitizedResponse.arrayBuffer();
}

function getFallbackText(value) {
  return String(value || "").trim() || "Not filled in yet.";
}

function formatDocxDayDate(dateText) {
  const [year, month, day] = String(dateText || "").split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function buildDocxDayLabel(day) {
  return [day.dayLabel, formatDocxDayDate(day.date)].filter(Boolean).join(" ");
}

function sortPhotosForDailyLog(photos, dailyLogId) {
  return [...(photos || [])]
    .filter((photo) => photo.dailyLogId === dailyLogId)
    .sort((first, second) => String(first.createdAt || "").localeCompare(String(second.createdAt || "")));
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(blob);
    const image = new Image();

    function cleanup() {
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(imageUrl);
    }

    image.onload = () => {
      const widthPx = image.naturalWidth;
      const heightPx = image.naturalHeight;
      cleanup();

      if (!widthPx || !heightPx) {
        reject(createExportError("A related photo could not be decoded."));
        return;
      }

      resolve({ widthPx, heightPx, image });
    };

    image.onerror = () => {
      cleanup();
      reject(createExportError("A related photo could not be decoded."));
    };
    image.src = imageUrl;
  });
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(createExportError("The WebP photo could not be converted to PNG."));
    }, "image/png");
  });
}

async function prepareImageBlob(photo) {
  const sourceBlob = photo?.fileBlob;
  const sourceType = String(photo?.fileType || sourceBlob?.type || "").toLowerCase();

  if (!sourceBlob || typeof sourceBlob.arrayBuffer !== "function") {
    throw createExportError(`Photo read failed for ${photo?.fileName || "a related photo"}.`);
  }

  if (directImageTypes[sourceType]) {
    const decoded = await loadImage(sourceBlob);
    return {
      blob: sourceBlob,
      extension: directImageTypes[sourceType],
      ...decoded
    };
  }

  if (sourceType !== "image/webp") {
    throw createExportError(`Unsupported image type for ${photo?.fileName || "a related photo"}: ${sourceType || "unknown"}.`);
  }

  try {
    const decoded = await loadImage(sourceBlob);
    const canvas = document.createElement("canvas");
    canvas.width = decoded.widthPx;
    canvas.height = decoded.heightPx;
    canvas.getContext("2d").drawImage(decoded.image, 0, 0);
    const convertedBlob = await canvasToPngBlob(canvas);

    return {
      blob: convertedBlob,
      extension: ".png",
      widthPx: decoded.widthPx,
      heightPx: decoded.heightPx
    };
  } catch (error) {
    throw createExportError(`WebP conversion failed for ${photo?.fileName || "a related photo"}.`, error);
  }
}

function fitImage(widthPx, heightPx) {
  const naturalWidthCm = (widthPx / 96) * 2.54;
  const naturalHeightCm = (heightPx / 96) * 2.54;
  const scale = Math.min(1, maxImageWidthCm / naturalWidthCm, maxImageHeightCm / naturalHeightCm);

  return {
    width: Number((naturalWidthCm * scale).toFixed(2)),
    height: Number((naturalHeightCm * scale).toFixed(2))
  };
}

async function buildPhotoDays(payload) {
  const relatedPhotos = payload.photoAttachments || [];
  const photoDays = [];

  for (const day of payload.days || []) {
    if (!day.dailyLog?.id) {
      continue;
    }

    const photos = sortPhotosForDailyLog(relatedPhotos, day.dailyLog.id);

    if (photos.length === 0) {
      continue;
    }

    const preparedPhotos = [];

    for (const photo of photos) {
      const prepared = await prepareImageBlob(photo);
      preparedPhotos.push({
        image: {
          data: await prepared.blob.arrayBuffer(),
          extension: prepared.extension,
          widthPx: prepared.widthPx,
          heightPx: prepared.heightPx,
          ...fitImage(prepared.widthPx, prepared.heightPx)
        },
        captionDisplay: String(photo.caption || "").trim()
      });
    }

    photoDays.push({
      dayLabel: buildDocxDayLabel(day),
      photos: preparedPhotos
    });
  }

  return photoDays;
}

async function buildTemplateData(payload) {
  const photoDays = await buildPhotoDays(payload);

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
      dayLabel: buildDocxDayLabel(day),
      docxAccomplishmentText: day.docxAccomplishmentText || "No daily log recorded."
    })),
    hasPhotos: photoDays.length > 0,
    photoDays
  };
}

function buildFilename(payload) {
  const weekNumber = payload.weekNumber || "Not-set";
  const startDate = payload.inclusiveStartDate || "no-date";
  return `OJT-Week-${weekNumber}-${startDate}.docx`;
}

async function generateBlobFromPayload(payload) {
  assertDependencies();

  let templateBuffer;
  let templateData;

  try {
    [templateBuffer, templateData] = await Promise.all([
      loadTemplateArrayBuffer(),
      buildTemplateData(payload)
    ]);
  } catch (error) {
    console.error("OJT DOCX v2 preparation failed.", error);
    throw error;
  }

  try {
    const report = await createReport({
      template: templateBuffer,
      cmdDelimiter: "+++",
      processLineBreaks: true,
      data: templateData,
      additionalJsContext: {
        getImage(photo) {
          return photo.image;
        }
      }
    });

    return new Blob([report], { type: docxMimeType });
  } catch (error) {
    console.error("OJT DOCX v2 generation failed.", error);
    throw createExportError("DOCX generation failed. No document was downloaded.", error);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function buildPayloadForWeek(weekId) {
  const [studentProfile, companyProfile, weeks, dailyLogs, dailyTasks, photoAttachments] = await Promise.all([
    window.OJTStorage.getStudentProfile(),
    window.OJTStorage.getCompanyProfile(),
    window.OJTStorage.getWeeks(),
    window.OJTStorage.getDailyLogs(),
    window.OJTStorage.getDailyTasks(),
    window.OJTStorage.getPhotoAttachments()
  ]);
  const week = weeks.find((candidate) => candidate.id === weekId);

  if (!week) {
    throw createExportError("Selected OJT week could not be found.");
  }

  return {
    ...window.OJTJournalPayload.buildWeeklyJournalPayload({
      week,
      studentProfile,
      companyProfile,
      dailyLogs,
      dailyTasks
    }),
    photoAttachments
  };
}

async function exportPayload(payload) {
  const blob = await generateBlobFromPayload(payload);
  const filename = buildFilename(payload);
  downloadBlob(blob, filename);

  return { blob, filename, payload };
}

async function exportWeekById(weekId) {
  if (!weekId) {
    throw createExportError("Choose a week before exporting DOCX.");
  }

  const payload = await buildPayloadForWeek(weekId);
  return exportPayload(payload);
}

async function exportSelectedPreviewWeek() {
  const select = document.getElementById("weekly-preview-week-select");
  return exportWeekById(select?.value || "");
}

window.OJTDocxExportV2 = {
  buildFilename,
  buildPayloadForWeek,
  buildPhotoDays,
  buildTemplateData,
  exportPayload,
  exportSelectedPreviewWeek,
  exportWeekById,
  generateBlobFromPayload,
  loadTemplateArrayBuffer
};