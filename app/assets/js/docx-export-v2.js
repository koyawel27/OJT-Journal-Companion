import { createReport } from "../vendor/docx-templates-4.15.0/browser.js";

const privateTemplatePath = "assets/templates/bpc-ojt-weekly-journal.private.v2.docx";
const sanitizedTemplatePath = "assets/templates/bpc-ojt-weekly-journal.v2.docx";
const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const directImageTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png"
};
const photoImageBoundsCm = {
  single: {
    landscape: { width: 13.5, height: 8.5 },
    portrait: { width: 8.5, height: 11.5 }
  },
  double: {
    landscape: { width: 7.2, height: 5.4 },
    portrait: { width: 6.8, height: 8.5 }
  },
  triple: {
    landscape: { width: 4.6, height: 3.5 },
    portrait: { width: 4.5, height: 6.0 }
  },
  grid: {
    landscape: { width: 7.2, height: 5.4 },
    portrait: { width: 6.8, height: 8.5 }
  }
};

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

function buildPhotoDayLabel(day) {
  const separator = String.fromCharCode(0x2014);
  return [day.dayLabel, formatDocxDayDate(day.date)].filter(Boolean).join(` ${separator} `);
}

function isValidPhotoDate(value) {
  return Boolean(value) && Number.isFinite(new Date(value).getTime());
}

function isValidPhotoSetId(value) {
  return typeof value === "string" && value.trim() !== "";
}

function comparePhotoImages(first, second) {
  const firstIndexValid = Number.isInteger(first.photoSetIndex) && first.photoSetIndex >= 0;
  const secondIndexValid = Number.isInteger(second.photoSetIndex) && second.photoSetIndex >= 0;

  if (firstIndexValid !== secondIndexValid) {
    return firstIndexValid ? -1 : 1;
  }

  if (firstIndexValid && first.photoSetIndex !== second.photoSetIndex) {
    return first.photoSetIndex - second.photoSetIndex;
  }

  const firstTime = isValidPhotoDate(first.createdAt) ? new Date(first.createdAt).getTime() : Number.POSITIVE_INFINITY;
  const secondTime = isValidPhotoDate(second.createdAt) ? new Date(second.createdAt).getTime() : Number.POSITIVE_INFINITY;
  return firstTime - secondTime || String(first.id || "").localeCompare(String(second.id || ""));
}

function getEarliestPhotoTimestamp(photos) {
  return photos.reduce((earliest, photo) => {
    if (!isValidPhotoDate(photo.createdAt)) {
      return earliest;
    }

    return Math.min(earliest, new Date(photo.createdAt).getTime());
  }, Number.POSITIVE_INFINITY);
}

function buildPhotoSetsForDailyLog(photos, dailyLogId) {
  const groups = new Map();

  (photos || [])
    .filter((photo) => photo.dailyLogId === dailyLogId)
    .forEach((photo) => {
      const hasPhotoSetId = isValidPhotoSetId(photo.photoSetId);
      const key = hasPhotoSetId ? `set:${photo.photoSetId}` : `legacy:${photo.id}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          photoSetId: hasPhotoSetId ? photo.photoSetId : "",
          photos: []
        });
      }

      groups.get(key).photos.push(photo);
    });

  return [...groups.values()]
    .map((photoSet) => ({
      ...photoSet,
      photos: photoSet.photos.sort(comparePhotoImages)
    }))
    .sort((first, second) => {
      return getEarliestPhotoTimestamp(first.photos) - getEarliestPhotoTimestamp(second.photos) ||
        first.key.localeCompare(second.key);
    });
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

function fitImage(widthPx, heightPx, layout) {
  const naturalWidthCm = (widthPx / 96) * 2.54;
  const naturalHeightCm = (heightPx / 96) * 2.54;
  const layoutBounds = photoImageBoundsCm[layout] || photoImageBoundsCm.grid;
  const bounds = heightPx > widthPx ? layoutBounds.portrait : layoutBounds.landscape;
  const scale = Math.min(1, bounds.width / naturalWidthCm, bounds.height / naturalHeightCm);

  return {
    width: Number((naturalWidthCm * scale).toFixed(2)),
    height: Number((naturalHeightCm * scale).toFixed(2))
  };
}

const emptyGridPhoto = {
  image: {
    data: "iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANiSURBVHhe7Z3BattAEIb9Hn2oQJ+gjxIozaVvUHrIsdBLL8GQYyCQW3MLPqaQU4shh6QEl6q77s56NBpJKyxF9s8/8AVrdzTyzicpCjHJYnn7o3r/9ZqAsohf3rz7SEChYHAoGBwKBoeCwaFgcCgYHAoGh4LBoWBwKBgcCgaHgsGhYHAmE/x2ua5qcXvh5k3DRXWVDnv12du27Oa9uF+e+7mNNfUc5/Smuk/zu1hX56dO7ki4vw8++fDFTY7jNtfj091zevMmHlZu/visqlU65OrG27bs5tvi1913J/e5ur7069jjfHtIEy2xq9/PED+Ln8GFJU54BeK4l295SW96s0ljMhDi6Xc9dyrkkC/hhbdtaZt//JMm/oZrzeRuQ43rOV1nHfogkXti8mOU9maIn0kF60U+hUbYMcmLC/MW6o0JufESPY2225bWeZkI8WhyJbw16TFZu5W7Jawr+h9y4s8uWBa0DdN4jW1UjrCPOulzSIMbciXCuK29r+CuK3ij1mnl5zpJYAzJ2ZfZBetF6bBnqTQji8kDIZwxe2VLw/It0JEwVHBb6P10LXktV6ee2+bLQAgcwQnvSmtrVMlY4zZmT6SJBLedmNtaaseYV5uL+WpeC+7rTRcHIzijRTgSdANLxmrfAnSMILikyTY3v58grVFHrV2v6XgFywpD1G5JMr6vYFVfGjLmLbqkyY1cJVFC1+l8yFLzJceOzCtYLVYvKJ/lewr2ZHbVlqbZbUvfvMbLtVdkrY7sEMJK1j9ClRw7Mq/ggHf7kdCLkHUPEayb1YgZBevxGHauqycSpQ9hswuO6DNTQkuLSEMGCQ7btdpJqs2R7dcU3Hs1hvfmtKXRlz4OQjCZDgoGh4LBoWBwKBgcCgaHgsGhYHAoGBwKBoeCwaFgcCgYHAoGh4LBoWBwKBgcCgbnoATzj512E/vj9a2LuF+pn8kFt9Ui/xmzp14tCp6ZMXvq1aLgmRmzp14tCp6ZMXvq1aLgmRmzp16tyQXzKbqbo3+KJuNDweBQMDgUDA4Fg0PB4FAwOBQMDgWDQ8HgUDA4FAwOBYNDweBQMDgUDA4FgzOZ4JOzsn/KQaYlevD8xDnrcpBgcthQMDgUDA4Fg0PB4BQL5meZjxPvM9auYIIDBYNDweBQMDRV9Q8usF/+Gq1aoQAAAABJRU5ErkJggg==",
    extension: ".png",
    width: 0.01,
    height: 0.01
  },
  captionDisplay: "",
  isPlaceholder: true
};

function createEmptyGridPhoto() {
  return {
    ...emptyGridPhoto,
    image: { ...emptyGridPhoto.image }
  };
}

function buildPhotoRows(photos) {
  const rows = [];

  for (let index = 0; index < photos.length; index += 2) {
    rows.push({
      leftPhoto: photos[index],
      rightPhoto: photos[index + 1] || createEmptyGridPhoto()
    });
  }

  return rows;
}

function getPhotoSetLayout(photoCount) {
  return photoCount === 1
    ? "single"
    : photoCount === 2
    ? "double"
    : photoCount === 3
    ? "triple"
    : "grid";
}

async function preparePhotoSet(photoSet) {
  const sharedCaption = String(photoSet.photos[0]?.caption ?? "").trim();
  const layout = getPhotoSetLayout(photoSet.photos.length);
  const preparedPhotos = [];

  for (const [index, photo] of photoSet.photos.entries()) {
    const prepared = await prepareImageBlob(photo);
    preparedPhotos.push({
      image: {
        data: await prepared.blob.arrayBuffer(),
        extension: prepared.extension,
        widthPx: prepared.widthPx,
        heightPx: prepared.heightPx,
        ...fitImage(prepared.widthPx, prepared.heightPx, layout)
      },
      captionDisplay: index === 0 ? sharedCaption : ""
    });
  }

  return {
    key: photoSet.key,
    photoSetId: photoSet.photoSetId,
    captionDisplay: sharedCaption,
    photos: preparedPhotos,
    layout,
    isSingle: layout === "single",
    isDouble: layout === "double",
    isTriple: layout === "triple",
    isGrid: layout === "grid",
    singlePhoto: layout === "single" ? preparedPhotos[0] : null,
    doublePhotos: layout === "double" ? preparedPhotos : [],
    triplePhotos: layout === "triple" ? preparedPhotos : [],
    gridRows: layout === "grid" ? buildPhotoRows(preparedPhotos) : [],
    compatibilityPhotoRows: buildPhotoRows(preparedPhotos)
  };
}
async function buildPhotoDays(payload) {
  const relatedPhotos = payload.photoAttachments || [];
  const photoDays = [];

  for (const day of payload.days || []) {
    if (!day.dailyLog?.id) {
      continue;
    }

    const photoSets = buildPhotoSetsForDailyLog(relatedPhotos, day.dailyLog.id);

    if (photoSets.length === 0) {
      continue;
    }

    const preparedSets = [];

    for (const photoSet of photoSets) {
      preparedSets.push(await preparePhotoSet(photoSet));
    }

    photoDays.push({
      dayLabel: buildPhotoDayLabel(day),
      photos: preparedSets.flatMap((photoSet) => photoSet.photos),
      photoSets: preparedSets,
      photoRows: preparedSets.flatMap((photoSet) => photoSet.compatibilityPhotoRows)
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
  buildPhotoSetsForDailyLog,
  buildPhotoRows,
  buildTemplateData,
  exportPayload,
  exportSelectedPreviewWeek,
  exportWeekById,
  generateBlobFromPayload,
  loadTemplateArrayBuffer
};
