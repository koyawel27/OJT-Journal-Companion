(function () {
  const appName = "OJT Journal Companion";
  const backupVersion = "1.0";
  const supportedBackupVersion = "1.0";

  const storeKeys = ["weeks", "dailyLogs", "dailyTasks", "photoAttachments"];

  const knownTopLevelFields = new Set([
    "appName",
    "backupVersion",
    "exportedAt",
    "studentProfile",
    "companyProfile",
    "appSettings",
    "weeks",
    "dailyLogs",
    "dailyTasks",
    "photoAttachments"
  ]);

  const knownRecordFields = {
    weeks: new Set([
      "id",
      "weekNumber",
      "inclusiveStartDate",
      "inclusiveEndDate",
      "weeklySkillsLearned",
      "problemsEncountered",
      "reflectionOrPointsOfLearning",
      "additionalNotes",
      "createdAt",
      "updatedAt"
    ]),
    dailyLogs: new Set([
      "id",
      "weekId",
      "entryDate",
      "dayStatus",
      "timeIn",
      "timeOut",
      "breakMinutes",
      "renderedMinutes",
      "renderedHours",
      "dayRemarks",
      "createdAt",
      "updatedAt"
    ]),
    dailyTasks: new Set([
      "id",
      "dailyLogId",
      "description",
      "timeSpentMinutes",
      "status",
      "notes",
      "sortOrder",
      "createdAt",
      "updatedAt"
    ]),
    photoAttachments: new Set([
      "id",
      "dailyLogId",
      "fileName",
      "fileType",
      "fileSize",
      "fileBlob",
      "fileDataBase64",
      "fileDataType",
      "photoCategory",
      "caption",
      "photoSetId",
      "photoSetIndex",
      "createdAt",
      "updatedAt"
    ])
  };

  const knownSingletonFields = {
    studentProfile: new Set([
      "id",
      "studentName",
      "courseOrProgram",
      "schoolOrInstitution",
      "sectionOrYearLevel",
      "requiredOjtHours",
      "createdAt",
      "updatedAt"
    ]),
    companyProfile: new Set([
      "id",
      "companyName",
      "companyAddress",
      "departmentOrAssignedArea",
      "supervisorName",
      "supervisorContact",
      "createdAt",
      "updatedAt"
    ]),
    appSettings: new Set([
      "id",
      "preferredWeekStartDay",
      "timeFormat",
      "lastBackupDate",
      "createdAt",
      "updatedAt"
    ])
  };

  const errorCodes = {
    INVALID_BACKUP_OBJECT: "INVALID_BACKUP_OBJECT",
    INVALID_JSON: "INVALID_JSON",
    MISSING_APP_NAME: "MISSING_APP_NAME",
    WRONG_APP_NAME: "WRONG_APP_NAME",
    MISSING_BACKUP_VERSION: "MISSING_BACKUP_VERSION",
    UNSUPPORTED_BACKUP_VERSION: "UNSUPPORTED_BACKUP_VERSION",
    INVALID_PROFILE: "INVALID_PROFILE",
    MISSING_STORE_ARRAY: "MISSING_STORE_ARRAY",
    INVALID_STORE_ARRAY: "INVALID_STORE_ARRAY",
    INVALID_RECORD: "INVALID_RECORD",
    MISSING_RECORD_ID: "MISSING_RECORD_ID",
    EMPTY_RECORD_ID: "EMPTY_RECORD_ID",
    INVALID_RECORD_ID: "INVALID_RECORD_ID",
    DUPLICATE_RECORD_ID: "DUPLICATE_RECORD_ID",
    ORPHAN_DAILY_LOG: "ORPHAN_DAILY_LOG",
    ORPHAN_DAILY_TASK: "ORPHAN_DAILY_TASK",
    ORPHAN_PHOTO_ATTACHMENT: "ORPHAN_PHOTO_ATTACHMENT",
    MISSING_PHOTO_PAYLOAD: "MISSING_PHOTO_PAYLOAD",
    EMPTY_PHOTO_PAYLOAD: "EMPTY_PHOTO_PAYLOAD",
    INVALID_PHOTO_BASE64: "INVALID_PHOTO_BASE64",
    MISSING_PHOTO_MIME: "MISSING_PHOTO_MIME",
    UNSUPPORTED_PHOTO_MIME: "UNSUPPORTED_PHOTO_MIME",
    INVALID_PHOTO_BLOB: "INVALID_PHOTO_BLOB",
    MALFORMED_PHOTO_SET_ID: "MALFORMED_PHOTO_SET_ID",
    MALFORMED_PHOTO_SET_INDEX: "MALFORMED_PHOTO_SET_INDEX",
    EXPORT_PHOTO_MISSING_BLOB: "EXPORT_PHOTO_MISSING_BLOB"
  };

  const warningCodes = {
    UNKNOWN_TOP_LEVEL_FIELD: "UNKNOWN_TOP_LEVEL_FIELD",
    UNKNOWN_RECORD_FIELD: "UNKNOWN_RECORD_FIELD",
    MISSING_PHOTO_SET_METADATA: "MISSING_PHOTO_SET_METADATA",
    LEGACY_SINGLETON_PHOTO: "LEGACY_SINGLETON_PHOTO",
    NORMALIZED_DAY_STATUS: "NORMALIZED_DAY_STATUS",
    NORMALIZED_PHOTO_CATEGORY: "NORMALIZED_PHOTO_CATEGORY",
    NULL_PROFILE_RECORD: "NULL_PROFILE_RECORD"
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function todayText() {
    return new Date().toISOString().slice(0, 10);
  }

  function downloadTextFile(fileName, content) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      if (!blob) {
        resolve("");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };

      reader.onerror = () => {
        reject(reader.error || new Error("Photo data could not be read."));
      };

      reader.readAsDataURL(blob);
    });
  }

  function base64ToBlob(base64, type) {
    if (!base64) {
      return null;
    }

    const safeBase64 = String(base64).includes(",") ? String(base64).split(",")[1] : String(base64);
    const binary = atob(safeBase64);
    const bytes = [];

    for (let index = 0; index < binary.length; index += 1) {
      bytes.push(binary.charCodeAt(index));
    }

    return new Blob([new Uint8Array(bytes)], { type: type || "application/octet-stream" });
  }

  function getSupportedPhotoTypes() {
    return window.OJTPhotos?.supportedPhotoTypes || ["image/jpeg", "image/png", "image/webp"];
  }

  function normalizePhotoCategory(value) {
    if (window.OJTPhotos?.normalizePhotoCategory) {
      return window.OJTPhotos.normalizePhotoCategory(value);
    }

    const categories = [
      "General Documentation",
      "Time In Photo",
      "Time Out Photo",
      "Task/Work Proof",
      "Other"
    ];

    return categories.includes(value) ? value : "General Documentation";
  }

  function normalizeDayStatus(value) {
    if (window.OJTCalculations?.normalizeDayStatus) {
      return window.OJTCalculations.normalizeDayStatus(value);
    }

    const dayStatuses = ["Worked", "Absent", "No OJT / Rest Day"];
    return dayStatuses.includes(value) ? value : "Worked";
  }

  function isObjectOrNull(value) {
    return value === null || (typeof value === "object" && !Array.isArray(value));
  }

  function isValidRecordId(id) {
    return typeof id === "string" && id.trim() !== "";
  }

  function pushError(errors, code, message, details) {
    errors.push({
      code,
      message,
      ...(details || {})
    });
  }

  function pushWarning(warnings, code, message, details) {
    warnings.push({
      code,
      message,
      ...(details || {})
    });
  }

  function collectUnknownFields(record, knownFields, store, recordId, warnings) {
    Object.keys(record).forEach((fieldName) => {
      if (!knownFields.has(fieldName)) {
        pushWarning(warnings, warningCodes.UNKNOWN_RECORD_FIELD, `Unknown field "${fieldName}" on ${store} record.`, {
          store,
          recordId,
          field: fieldName
        });
      }
    });
  }

  function collectUnknownSingletonFields(record, store, warnings) {
    if (record === null) {
      return;
    }

    collectUnknownFields(record, knownSingletonFields[store], store, record.id || null, warnings);
  }

  function validateRecordId(record, store, index, errors) {
    if (!Object.prototype.hasOwnProperty.call(record, "id") || record.id === null || record.id === undefined) {
      pushError(errors, errorCodes.MISSING_RECORD_ID, `${store} record at index ${index} is missing an ID.`, {
        store,
        index
      });
      return false;
    }

    if (typeof record.id === "string" && record.id.trim() === "") {
      pushError(errors, errorCodes.EMPTY_RECORD_ID, `${store} record at index ${index} has an empty ID.`, {
        store,
        index
      });
      return false;
    }

    if (!isValidRecordId(record.id)) {
      pushError(errors, errorCodes.INVALID_RECORD_ID, `${store} record at index ${index} has an invalid ID.`, {
        store,
        index,
        recordId: String(record.id)
      });
      return false;
    }

    return true;
  }

  function findDuplicateIds(records, store, errors) {
    const seen = new Map();

    records.forEach((record, index) => {
      if (!isValidRecordId(record?.id)) {
        return;
      }

      if (seen.has(record.id)) {
        pushError(errors, errorCodes.DUPLICATE_RECORD_ID, `Duplicate ${store} ID "${record.id}".`, {
          store,
          recordId: record.id,
          index,
          duplicateOfIndex: seen.get(record.id)
        });
        return;
      }

      seen.set(record.id, index);
    });
  }

  function normalizeBase64Payload(value) {
    if (value === null || value === undefined) {
      return "";
    }

    const text = String(value);
    return text.includes(",") ? text.split(",")[1] : text;
  }

  function decodePhotoPayload(base64Value, mimeType) {
    const normalizedBase64 = normalizeBase64Payload(base64Value);

    if (!normalizedBase64) {
      return {
        blob: null,
        normalizedBase64: "",
        errorCode: errorCodes.EMPTY_PHOTO_PAYLOAD,
        errorMessage: "Photo image data is empty."
      };
    }

    try {
      const blob = base64ToBlob(normalizedBase64, mimeType);

      if (!blob || blob.size === 0) {
        return {
          blob: null,
          normalizedBase64,
          errorCode: errorCodes.INVALID_PHOTO_BLOB,
          errorMessage: "Photo image data could not produce a usable image."
        };
      }

      return {
        blob,
        normalizedBase64,
        errorCode: "",
        errorMessage: ""
      };
    } catch {
      return {
        blob: null,
        normalizedBase64,
        errorCode: errorCodes.INVALID_PHOTO_BASE64,
        errorMessage: "Photo image data is not valid Base64."
      };
    }
  }

  function resolvePhotoMimeType(photo) {
    return String(photo.fileDataType || photo.fileType || "").trim().toLowerCase();
  }

  function validatePhotoRecord(photo, index, dailyLogIds, errors, warnings, decodedPhotos, purpose) {
    const recordId = isValidRecordId(photo?.id) ? photo.id : `index-${index}`;
    const supportedPhotoTypes = getSupportedPhotoTypes();

    if (!photo || typeof photo !== "object" || Array.isArray(photo)) {
      pushError(errors, errorCodes.INVALID_RECORD, `photoAttachments record at index ${index} is not a valid object.`, {
        store: "photoAttachments",
        index
      });
      return;
    }

    collectUnknownFields(photo, knownRecordFields.photoAttachments, "photoAttachments", recordId, warnings);

    if (!isValidRecordId(photo.id)) {
      validateRecordId(photo, "photoAttachments", index, errors);
    }

    if (!photo.dailyLogId || !dailyLogIds.has(photo.dailyLogId)) {
      pushError(errors, errorCodes.ORPHAN_PHOTO_ATTACHMENT, `Photo "${recordId}" references a missing daily log.`, {
        store: "photoAttachments",
        recordId,
        index,
        field: "dailyLogId"
      });
    }

    const hasPhotoSetId = Object.prototype.hasOwnProperty.call(photo, "photoSetId");
    const hasPhotoSetIndex = Object.prototype.hasOwnProperty.call(photo, "photoSetIndex");

    if (!hasPhotoSetId && !hasPhotoSetIndex) {
      pushWarning(warnings, warningCodes.LEGACY_SINGLETON_PHOTO, `Photo "${recordId}" is a legacy singleton photo without photo-set metadata.`, {
        store: "photoAttachments",
        recordId,
        index
      });
    } else if (hasPhotoSetId !== hasPhotoSetIndex) {
      pushWarning(warnings, warningCodes.MISSING_PHOTO_SET_METADATA, `Photo "${recordId}" has partial photo-set metadata.`, {
        store: "photoAttachments",
        recordId,
        index
      });
    }

    if (hasPhotoSetId) {
      if (typeof photo.photoSetId !== "string" || photo.photoSetId.trim() === "") {
        pushError(errors, errorCodes.MALFORMED_PHOTO_SET_ID, `Photo "${recordId}" has an invalid photoSetId.`, {
          store: "photoAttachments",
          recordId,
          index,
          field: "photoSetId"
        });
      }
    }

    if (hasPhotoSetIndex) {
      if (!Number.isInteger(photo.photoSetIndex) || photo.photoSetIndex < 0) {
        pushError(errors, errorCodes.MALFORMED_PHOTO_SET_INDEX, `Photo "${recordId}" has an invalid photoSetIndex.`, {
          store: "photoAttachments",
          recordId,
          index,
          field: "photoSetIndex"
        });
      }
    }

    if (Object.prototype.hasOwnProperty.call(photo, "photoCategory") && normalizePhotoCategory(photo.photoCategory) !== photo.photoCategory) {
      pushWarning(warnings, warningCodes.NORMALIZED_PHOTO_CATEGORY, `Photo "${recordId}" has a photo category that will be normalized on restore.`, {
        store: "photoAttachments",
        recordId,
        index,
        field: "photoCategory"
      });
    }

    const hasSerializedPayload = Object.prototype.hasOwnProperty.call(photo, "fileDataBase64");
    const hasRuntimeBlob = photo.fileBlob instanceof Blob;

    if (purpose === "export" && !hasSerializedPayload) {
      pushError(errors, errorCodes.MISSING_PHOTO_PAYLOAD, `Photo "${recordId}" is missing serialized image data.`, {
        store: "photoAttachments",
        recordId,
        index
      });
      return;
    }

    if (!hasSerializedPayload && !hasRuntimeBlob) {
      pushError(errors, errorCodes.MISSING_PHOTO_PAYLOAD, `Photo "${recordId}" is missing image data.`, {
        store: "photoAttachments",
        recordId,
        index
      });
      return;
    }

    const mimeType = resolvePhotoMimeType(photo);

    if (!mimeType) {
      pushError(errors, errorCodes.MISSING_PHOTO_MIME, `Photo "${recordId}" is missing a supported image type.`, {
        store: "photoAttachments",
        recordId,
        index,
        field: "fileType"
      });
      return;
    }

    if (!supportedPhotoTypes.includes(mimeType)) {
      pushError(errors, errorCodes.UNSUPPORTED_PHOTO_MIME, `Photo "${recordId}" uses unsupported image type "${mimeType}".`, {
        store: "photoAttachments",
        recordId,
        index,
        field: "fileType"
      });
      return;
    }

    let decoded;

    if (hasSerializedPayload) {
      if (photo.fileDataBase64 === null || photo.fileDataBase64 === undefined) {
        pushError(errors, errorCodes.MISSING_PHOTO_PAYLOAD, `Photo "${recordId}" is missing image data.`, {
          store: "photoAttachments",
          recordId,
          index
        });
        return;
      }

      decoded = decodePhotoPayload(photo.fileDataBase64, mimeType);
    } else if (hasRuntimeBlob) {
      if (photo.fileBlob.size === 0) {
        pushError(errors, errorCodes.EMPTY_PHOTO_PAYLOAD, `Photo "${recordId}" image data is empty.`, {
          store: "photoAttachments",
          recordId,
          index
        });
        return;
      }

      decoded = {
        blob: photo.fileBlob,
        normalizedBase64: "",
        errorCode: "",
        errorMessage: ""
      };
    } else {
      pushError(errors, errorCodes.MISSING_PHOTO_PAYLOAD, `Photo "${recordId}" is missing image data.`, {
        store: "photoAttachments",
        recordId,
        index
      });
      return;
    }

    if (decoded.errorCode) {
      pushError(errors, decoded.errorCode, `Photo "${recordId}" ${decoded.errorMessage}`, {
        store: "photoAttachments",
        recordId,
        index
      });
      return;
    }

    if (decodedPhotos) {
      decodedPhotos.set(recordId, decoded.blob);
    }
  }

  function buildRestoreCandidate(data, decodedPhotos) {
    return {
      studentProfile: data.studentProfile === null ? null : { ...data.studentProfile },
      companyProfile: data.companyProfile === null ? null : { ...data.companyProfile },
      appSettings: data.appSettings === null ? null : { ...data.appSettings },
      weeks: data.weeks.map((week) => ({ ...week })),
      dailyLogs: data.dailyLogs.map((log) => ({
        ...log,
        dayStatus: normalizeDayStatus(log.dayStatus)
      })),
      dailyTasks: data.dailyTasks.map((task) => ({ ...task })),
      photoAttachments: data.photoAttachments.map((photo) => {
        const { fileDataBase64, fileDataType, fileBlob, ...metadata } = photo;
        const recordId = photo.id;
        const resolvedBlob = decodedPhotos.get(recordId) || null;
        const resolvedType = resolvePhotoMimeType(photo) || metadata.fileType || "application/octet-stream";

        return {
          ...metadata,
          photoCategory: normalizePhotoCategory(metadata.photoCategory),
          fileType: resolvedType,
          fileBlob: resolvedBlob
        };
      })
    };
  }

  function validateBackupData(data, options) {
    const settings = options || {};
    const purpose = settings.purpose === "export" ? "export" : "restore";
    const errors = [];
    const warnings = [];
    const decodedPhotos = purpose === "restore" ? new Map() : null;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      pushError(errors, errorCodes.INVALID_BACKUP_OBJECT, "Backup file does not contain a valid backup object.");
      return {
        valid: false,
        errors,
        warnings,
        metadata: null,
        counts: null,
        restoreCandidate: null
      };
    }

    Object.keys(data).forEach((fieldName) => {
      if (!knownTopLevelFields.has(fieldName)) {
        pushWarning(warnings, warningCodes.UNKNOWN_TOP_LEVEL_FIELD, `Unknown top-level field "${fieldName}".`, {
          field: fieldName
        });
      }
    });

    if (!Object.prototype.hasOwnProperty.call(data, "appName") || data.appName === null || data.appName === undefined || String(data.appName).trim() === "") {
      pushError(errors, errorCodes.MISSING_APP_NAME, "Backup application name is missing.");
    } else if (data.appName !== appName) {
      pushError(errors, errorCodes.WRONG_APP_NAME, "Backup file is not for OJT Journal Companion.");
    }

    if (!Object.prototype.hasOwnProperty.call(data, "backupVersion") || data.backupVersion === null || data.backupVersion === undefined || String(data.backupVersion).trim() === "") {
      pushError(errors, errorCodes.MISSING_BACKUP_VERSION, "Backup version is missing.");
    } else if (data.backupVersion !== supportedBackupVersion) {
      pushError(errors, errorCodes.UNSUPPORTED_BACKUP_VERSION, `Backup version "${data.backupVersion}" is not supported.`);
    }

    if (!isObjectOrNull(data.studentProfile)) {
      pushError(errors, errorCodes.INVALID_PROFILE, "Student profile data is invalid.");
    } else if (data.studentProfile === null) {
      pushWarning(warnings, warningCodes.NULL_PROFILE_RECORD, "Student profile is null.");
    } else {
      collectUnknownSingletonFields(data.studentProfile, "studentProfile", warnings);
    }

    if (!isObjectOrNull(data.companyProfile)) {
      pushError(errors, errorCodes.INVALID_PROFILE, "Company profile data is invalid.");
    } else if (data.companyProfile === null) {
      pushWarning(warnings, warningCodes.NULL_PROFILE_RECORD, "Company profile is null.");
    } else {
      collectUnknownSingletonFields(data.companyProfile, "companyProfile", warnings);
    }

    if (!isObjectOrNull(data.appSettings)) {
      pushError(errors, errorCodes.INVALID_PROFILE, "App settings data is invalid.");
    } else if (data.appSettings === null) {
      pushWarning(warnings, warningCodes.NULL_PROFILE_RECORD, "App settings is null.");
    } else {
      collectUnknownSingletonFields(data.appSettings, "appSettings", warnings);
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
        metadata: {
          appName: data.appName,
          backupVersion: data.backupVersion,
          exportedAt: data.exportedAt || null
        },
        counts: null,
        restoreCandidate: null
      };
    }

    storeKeys.forEach((store) => {
      if (!Object.prototype.hasOwnProperty.call(data, store) || data[store] === null || data[store] === undefined) {
        pushError(errors, errorCodes.MISSING_STORE_ARRAY, `Backup ${store} data is missing.`, { store });
        return;
      }

      if (!Array.isArray(data[store])) {
        pushError(errors, errorCodes.INVALID_STORE_ARRAY, `Backup ${store} data is not an array.`, { store });
      }
    });

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
        metadata: {
          appName: data.appName,
          backupVersion: data.backupVersion,
          exportedAt: data.exportedAt || null
        },
        counts: null,
        restoreCandidate: null
      };
    }

    storeKeys.forEach((store) => {
      data[store].forEach((record, index) => {
        if (!record || typeof record !== "object" || Array.isArray(record)) {
          pushError(errors, errorCodes.INVALID_RECORD, `${store} contains an invalid record at index ${index}.`, {
            store,
            index
          });
          return;
        }

        if (store !== "photoAttachments") {
          collectUnknownFields(record, knownRecordFields[store], store, record.id || `index-${index}`, warnings);
        }
        validateRecordId(record, store, index, errors);

        if (store === "dailyLogs" && Object.prototype.hasOwnProperty.call(record, "dayStatus") && normalizeDayStatus(record.dayStatus) !== record.dayStatus) {
          pushWarning(warnings, warningCodes.NORMALIZED_DAY_STATUS, `Daily log "${record.id || index}" has a day status that will be normalized on restore.`, {
            store,
            recordId: record.id,
            index,
            field: "dayStatus"
          });
        }
      });
    });

    storeKeys.forEach((store) => {
      findDuplicateIds(data[store], store, errors);
    });

    const weekIds = new Set(data.weeks.filter((week) => isValidRecordId(week?.id)).map((week) => week.id));
    const dailyLogIds = new Set(data.dailyLogs.filter((log) => isValidRecordId(log?.id)).map((log) => log.id));

    data.dailyLogs.forEach((log, index) => {
      const recordId = log?.id || `index-${index}`;

      if (!log?.weekId || !weekIds.has(log.weekId)) {
        pushError(errors, errorCodes.ORPHAN_DAILY_LOG, `Daily log "${recordId}" references a missing week.`, {
          store: "dailyLogs",
          recordId,
          index,
          field: "weekId"
        });
      }
    });

    data.dailyTasks.forEach((task, index) => {
      const recordId = task?.id || `index-${index}`;

      if (!task?.dailyLogId || !dailyLogIds.has(task.dailyLogId)) {
        pushError(errors, errorCodes.ORPHAN_DAILY_TASK, `Daily task "${recordId}" references a missing daily log.`, {
          store: "dailyTasks",
          recordId,
          index,
          field: "dailyLogId"
        });
      }
    });

    data.photoAttachments.forEach((photo, index) => {
      validatePhotoRecord(photo, index, dailyLogIds, errors, warnings, decodedPhotos, purpose);
    });

    const counts = {
      weeks: data.weeks.length,
      dailyLogs: data.dailyLogs.length,
      dailyTasks: data.dailyTasks.length,
      photoAttachments: data.photoAttachments.length,
      hasStudentProfile: data.studentProfile !== null,
      hasCompanyProfile: data.companyProfile !== null,
      hasAppSettings: data.appSettings !== null
    };

    const metadata = {
      appName: data.appName,
      backupVersion: data.backupVersion,
      exportedAt: data.exportedAt || null
    };

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
        metadata,
        counts,
        restoreCandidate: null
      };
    }

    return {
      valid: true,
      errors,
      warnings,
      metadata,
      counts,
      restoreCandidate: purpose === "restore" ? buildRestoreCandidate(data, decodedPhotos) : null
    };
  }

  function formatValidationMessage(result, context) {
    if (!result || result.valid) {
      return "";
    }

    const codes = result.errors.map((entry) => entry.code);
    const firstMessage = result.errors[0]?.message || "Backup validation failed.";

    if (codes.includes(errorCodes.MISSING_APP_NAME) || codes.includes(errorCodes.WRONG_APP_NAME)) {
      return result.errors.find((entry) => entry.code === errorCodes.MISSING_APP_NAME || entry.code === errorCodes.WRONG_APP_NAME)?.message ||
        "Backup file is not for OJT Journal Companion.";
    }

    if (codes.includes(errorCodes.MISSING_BACKUP_VERSION) || codes.includes(errorCodes.UNSUPPORTED_BACKUP_VERSION)) {
      return result.errors.find((entry) => entry.code === errorCodes.MISSING_BACKUP_VERSION || entry.code === errorCodes.UNSUPPORTED_BACKUP_VERSION)?.message ||
        "Unsupported backup version. This app supports version 1.0 only.";
    }

    if (codes.some((code) => code === errorCodes.DUPLICATE_RECORD_ID || code.startsWith("ORPHAN_"))) {
      return `Backup has incompatible records: ${firstMessage}`;
    }

    if (
      context === "export" ||
      codes.some((code) => (
        code === errorCodes.EXPORT_PHOTO_MISSING_BLOB ||
        code === errorCodes.MISSING_PHOTO_PAYLOAD ||
        code === errorCodes.EMPTY_PHOTO_PAYLOAD ||
        code === errorCodes.INVALID_PHOTO_BASE64 ||
        code === errorCodes.MISSING_PHOTO_MIME ||
        code === errorCodes.UNSUPPORTED_PHOTO_MIME ||
        code === errorCodes.INVALID_PHOTO_BLOB ||
        code === errorCodes.MALFORMED_PHOTO_SET_ID ||
        code === errorCodes.MALFORMED_PHOTO_SET_INDEX
      ))
    ) {
      if (context === "export") {
        return `Backup export integrity check failed: ${firstMessage}`;
      }

      return `Backup photo data is incomplete or invalid: ${firstMessage}`;
    }

    return `Backup file is damaged or incomplete: ${firstMessage}`;
  }

  const restoreReviewMessageLimit = 10;
  let pendingRestore = null;
  let restoreAnalysisToken = 0;
  let restoreInProgress = false;
  let safetyExportInProgress = false;

  function setRestoreBusy(busy) {
    const panel = getReviewElement("restore-review-panel");
    const restoreButton = getReviewElement("restore-this-backup-button");
    const cancelButton = getReviewElement("cancel-restore-review-button");
    const exportButton = getReviewElement("export-current-data-first-button");
    const fileInput = getElement("restore-backup-file");
    const hasValidReview = Boolean(pendingRestore?.validationResult.valid && pendingRestore.restoreCandidate);
    const operationBusy = busy || safetyExportInProgress;

    if (panel) {
      if (operationBusy) {
        panel.setAttribute("aria-busy", "true");
      } else {
        panel.removeAttribute("aria-busy");
      }
    }
    if (restoreButton) {
      restoreButton.disabled = operationBusy || !hasValidReview;
      restoreButton.textContent = busy ? "Restoring..." : "Restore This Backup";
      restoreButton.setAttribute("aria-busy", String(busy));
    }
    if (cancelButton) {
      cancelButton.disabled = operationBusy || !pendingRestore;
    }
    if (exportButton) {
      exportButton.disabled = operationBusy || !hasValidReview;
    }
    if (fileInput) {
      fileInput.disabled = operationBusy;
    }
  }

  function setSafetyExportBusy(busy) {
    const panel = getReviewElement("restore-review-panel");
    const restoreButton = getReviewElement("restore-this-backup-button");
    const cancelButton = getReviewElement("cancel-restore-review-button");
    const button = getReviewElement("export-current-data-first-button");
    const fileInput = getElement("restore-backup-file");
    const hasValidReview = Boolean(pendingRestore?.validationResult.valid && pendingRestore.restoreCandidate);
    const operationBusy = busy || restoreInProgress;

    if (panel) {
      if (operationBusy) {
        panel.setAttribute("aria-busy", "true");
      } else {
        panel.removeAttribute("aria-busy");
      }
    }
    if (restoreButton) {
      restoreButton.disabled = operationBusy || !hasValidReview;
    }
    if (cancelButton) {
      cancelButton.disabled = operationBusy || !pendingRestore;
    }
    if (button) {
      button.disabled = operationBusy || !hasValidReview;
      button.textContent = busy ? "Exporting..." : "Export Current Data First";
      button.setAttribute("aria-busy", String(busy));
    }
    if (fileInput) {
      fileInput.disabled = operationBusy;
    }
  }

  function getReviewElement(id) {
    return getElement(id);
  }

  function setReviewText(id, value) {
    const element = getReviewElement(id);
    if (element) {
      element.textContent = String(value ?? "");
    }
  }

  function clearReviewList(id) {
    const list = getReviewElement(id);
    if (!list) {
      return;
    }

    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }

  function createReviewResult(code, message) {
    return {
      valid: false,
      errors: [{ code, message }],
      warnings: [],
      metadata: null,
      counts: null,
      restoreCandidate: null
    };
  }

  function formatReviewFileSize(bytes) {
    if (Number.isFinite(bytes) && window.OJTPhotos?.formatFileSize) {
      return window.OJTPhotos.formatFileSize(bytes);
    }

    if (!Number.isFinite(bytes) || bytes < 0) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = -1;

    do {
      size /= 1024;
      unitIndex += 1;
    } while (size >= 1024 && unitIndex < units.length - 1);

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  function formatReviewDate(value) {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleString();
  }

  function formatReviewCount(value) {
    return Number.isFinite(value) ? String(value) : "Unavailable";
  }

  function formatReviewPresence(value, counts) {
    if (!counts) {
      return "Unavailable";
    }

    return value ? "Present" : "Not present";
  }

  function getValidationCategory(code) {
    if (code === errorCodes.INVALID_JSON) {
      return "Invalid JSON";
    }

    if (code === errorCodes.WRONG_APP_NAME || code === errorCodes.MISSING_APP_NAME) {
      return "Wrong application";
    }

    if (code === errorCodes.MISSING_BACKUP_VERSION || code === errorCodes.UNSUPPORTED_BACKUP_VERSION) {
      return "Unsupported backup version";
    }

    if (code === errorCodes.DUPLICATE_RECORD_ID || code.startsWith("ORPHAN_")) {
      return "Incompatible relationships or duplicate records";
    }

    if (code === "FILE_READ_ERROR") {
      return "File read error";
    }

    return "Damaged or incomplete backup";
  }

  function renderReviewMessages(listId, entries) {
    clearReviewList(listId);
    const list = getReviewElement(listId);

    if (!list) {
      return;
    }

    entries.slice(0, restoreReviewMessageLimit).forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = `${getValidationCategory(entry.code)}: ${entry.message}`;
      list.appendChild(item);
    });

    const remaining = entries.length - restoreReviewMessageLimit;
    if (remaining > 0) {
      const item = document.createElement("li");
      item.textContent = `And ${remaining} more.`;
      list.appendChild(item);
    }
  }

  function resetRestoreReviewPanel() {
    const panel = getReviewElement("restore-review-panel");
    if (panel) {
      panel.hidden = true;
    }

    setReviewText("restore-review-status", "Select a JSON backup to begin.");
    setReviewText("restore-review-file-name", "Not selected");
    setReviewText("restore-review-file-size", "—");
    setReviewText("restore-review-app-name", "—");
    setReviewText("restore-review-version", "—");
    setReviewText("restore-review-exported-at", "—");
    setReviewText("restore-review-validation", "—");
    setReviewText("restore-review-weeks", "—");
    setReviewText("restore-review-daily-logs", "—");
    setReviewText("restore-review-daily-tasks", "—");
    setReviewText("restore-review-photos", "—");
    setReviewText("restore-review-student-profile", "—");
    setReviewText("restore-review-company-profile", "—");
    setReviewText("restore-review-app-settings", "—");
    setReviewText("restore-review-error-summary", "");
    setReviewText("restore-review-warning-summary", "");
    clearReviewList("restore-review-error-list");
    clearReviewList("restore-review-warning-list");

    [
      "restore-review-errors",
      "restore-review-warnings",
      "restore-review-replacement-warning"
    ].forEach((id) => {
      const element = getReviewElement(id);
      if (element) {
        element.hidden = true;
      }
    });

    [
      "restore-this-backup-button",
      "export-current-data-first-button",
      "cancel-restore-review-button"
    ].forEach((id) => {
      const element = getReviewElement(id);
      if (element) {
        element.disabled = true;
      }
    });

    const fileInput = getElement("restore-backup-file");
    if (fileInput) {
      fileInput.disabled = false;
    }
    setRestoreBusy(false);
    setSafetyExportBusy(false);
  }

  function clearPendingRestore(options) {
    const settings = options || {};
    restoreAnalysisToken += 1;
    pendingRestore = null;
    resetRestoreReviewPanel();

    const fileInput = getElement("restore-backup-file");
    if (settings.clearFile !== false && fileInput) {
      fileInput.value = "";
    }

    if (settings.focus && fileInput) {
      fileInput.focus();
    }
  }

  function renderRestoreReview(file, validationResult) {
    const panel = getReviewElement("restore-review-panel");
    if (!panel) {
      return;
    }

    const metadata = validationResult.metadata || {};
    const counts = validationResult.counts;
    const valid = validationResult.valid === true;
    const status = getReviewElement("restore-review-status");

    panel.hidden = false;
    setReviewText("restore-review-file-name", file.name || "Unnamed file");
    setReviewText("restore-review-file-size", formatReviewFileSize(file.size));
    setReviewText("restore-review-app-name", metadata.appName || "Unavailable");
    setReviewText("restore-review-version", metadata.backupVersion || "Unavailable");
    setReviewText("restore-review-exported-at", formatReviewDate(metadata.exportedAt));
    setReviewText("restore-review-validation", valid ? "Valid — ready to restore" : "Invalid — restore blocked");
    setReviewText("restore-review-weeks", formatReviewCount(counts?.weeks));
    setReviewText("restore-review-daily-logs", formatReviewCount(counts?.dailyLogs));
    setReviewText("restore-review-daily-tasks", formatReviewCount(counts?.dailyTasks));
    setReviewText("restore-review-photos", formatReviewCount(counts?.photoAttachments));
    setReviewText("restore-review-student-profile", formatReviewPresence(counts?.hasStudentProfile, counts));
    setReviewText("restore-review-company-profile", formatReviewPresence(counts?.hasCompanyProfile, counts));
    setReviewText("restore-review-app-settings", formatReviewPresence(counts?.hasAppSettings, counts));

    if (status) {
      status.dataset.state = valid ? "valid" : "invalid";
      status.textContent = valid
        ? "This backup passed validation and is ready for your review."
        : "This backup cannot be restored until its validation errors are resolved.";
    }

    const errors = validationResult.errors || [];
    const warnings = validationResult.warnings || [];
    const errorPanel = getReviewElement("restore-review-errors");
    const warningPanel = getReviewElement("restore-review-warnings");
    const replacementWarning = getReviewElement("restore-review-replacement-warning");

    if (errorPanel) {
      errorPanel.hidden = errors.length === 0;
    }
    if (errors.length > 0) {
      const categories = [...new Set(errors.map((entry) => getValidationCategory(entry.code)))];
      setReviewText("restore-review-error-summary", `${errors.length} error${errors.length === 1 ? "" : "s"}: ${categories.join(", ")}.`);
      renderReviewMessages("restore-review-error-list", errors);
    }

    if (warningPanel) {
      warningPanel.hidden = warnings.length === 0;
    }
    if (warnings.length > 0) {
      setReviewText("restore-review-warning-summary", `This backup can still be restored. ${warnings.length} warning${warnings.length === 1 ? "" : "s"} found.`);
      renderReviewMessages("restore-review-warning-list", warnings);
    }

    if (replacementWarning) {
      replacementWarning.hidden = !valid;
    }

    const restoreButton = getReviewElement("restore-this-backup-button");
    const exportButton = getReviewElement("export-current-data-first-button");
    const cancelButton = getReviewElement("cancel-restore-review-button");
    if (restoreButton) {
      restoreButton.disabled = !valid;
    }
    if (exportButton) {
      exportButton.disabled = !valid;
    }
    if (cancelButton) {
      cancelButton.disabled = false;
    }
    setRestoreBusy(restoreInProgress);
    setSafetyExportBusy(safetyExportInProgress);

    const heading = getReviewElement("restore-review-title");
    if (heading) {
      window.setTimeout(() => heading.focus(), 0);
    }
  }

  function createPendingRestore(file, parsedData, validationResult) {
    pendingRestore = {
      fileName: file.name || "Unnamed file",
      fileSize: Number.isFinite(file.size) ? file.size : 0,
      parsedData,
      validationResult,
      restoreCandidate: validationResult.valid ? validationResult.restoreCandidate : null
    };
    renderRestoreReview(file, validationResult);
  }

  async function analyzeRestoreFile(event) {
    if (restoreInProgress || safetyExportInProgress) {
      return;
    }

    const fileInput = event.target;
    const file = fileInput.files?.[0] || null;
    const messageElement = getElement("backup-message");
    window.OJTUI.clearFormMessage(messageElement);
    clearPendingRestore({ clearFile: false, focus: false });

    if (!file) {
      return;
    }

    const analysisToken = ++restoreAnalysisToken;

    try {
      const parsedData = await readJsonFile(file);
      if (analysisToken !== restoreAnalysisToken) {
        return;
      }

      const validationResult = validateBackupData(parsedData, { purpose: "restore" });
      createPendingRestore(file, parsedData, validationResult);
    } catch (error) {
      if (analysisToken !== restoreAnalysisToken) {
        return;
      }

      const isInvalidJson = error.message === "File is not valid JSON.";
      const result = createReviewResult(
        isInvalidJson ? errorCodes.INVALID_JSON : "FILE_READ_ERROR",
        isInvalidJson ? "The selected file is not valid JSON." : "The backup file could not be read."
      );
      createPendingRestore(file, null, result);
    }
  }

  async function restorePendingBackup() {
    const messageElement = getElement("backup-message");
    const review = pendingRestore;

    if (restoreInProgress || safetyExportInProgress || !review || !review.validationResult.valid || !review.restoreCandidate) {
      return;
    }

    const confirmed = window.confirm(
      "Restore this backup?\n\nThis replaces ALL journal data in this browser. It cannot be undone.\n\nExport current data first if you need a recovery copy.\n\nContinue?"
    );

    if (!confirmed) {
      return;
    }

    restoreInProgress = true;
    setRestoreBusy(true);

    try {
      await window.OJTStorage.replaceAllData(review.restoreCandidate);
      restoreInProgress = false;
      clearPendingRestore({ clearFile: true, focus: false });
      window.OJTUI.showFormMessage(messageElement, "Backup restored. Reloading...", "success");
      window.setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      restoreInProgress = false;
      setRestoreBusy(false);
      window.OJTUI.showFormMessage(messageElement, error.message || "Could not restore backup. Try again.", "error");
    }
  }

  async function exportCurrentDataFirst() {
    if (restoreInProgress || safetyExportInProgress || !pendingRestore?.validationResult.valid) {
      return;
    }

    safetyExportInProgress = true;
    setSafetyExportBusy(true);

    try {
      await exportBackup();
    } finally {
      safetyExportInProgress = false;
      setSafetyExportBusy(false);
    }
  }

  function cancelRestoreReview() {
    if (restoreInProgress || safetyExportInProgress) {
      return;
    }

    clearPendingRestore({ clearFile: true, focus: true });
  }

  const storageHealthState = {
    estimate: { status: "checking", usage: null, quota: null, percentage: null },
    persistence: { status: "checking", canRequest: false }
  };
  let storageHealthRefreshInProgress = false;
  let persistentStorageRequestInProgress = false;

  function getStorageManager() {
    return window.navigator?.storage || null;
  }

  function isValidStorageNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }

  function formatStorageBytes(value) {
    if (!isValidStorageNumber(value)) {
      return "Unavailable";
    }

    if (value < 1024) {
      return `${value} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let size = value;
    let unitIndex = -1;

    do {
      size /= 1024;
      unitIndex += 1;
    } while (size >= 1024 && unitIndex < units.length - 1);

    const decimals = size >= 100 || unitIndex === 0 ? 0 : 1;
    return `${size.toFixed(decimals)} ${units[unitIndex]}`;
  }

  function formatStoragePercentage(value) {
    return isValidStorageNumber(value) ? `${value.toFixed(1)}%` : "Unavailable";
  }

  function setStorageHealthText(id, value) {
    const element = getElement(id);
    if (element) {
      element.textContent = String(value ?? "");
    }
  }

  function setStorageHealthMessage(message, type) {
    const element = getElement("storage-health-message");
    if (!element) {
      return;
    }

    if (!message) {
      window.OJTUI.clearFormMessage(element);
      return;
    }

    window.OJTUI.showFormMessage(element, message, type || "info");
  }

  function updateStorageHealthControls() {
    const refreshButton = getElement("refresh-storage-status-button");
    const requestButton = getElement("request-persistent-storage-button");
    const requestAvailable = storageHealthState.persistence.canRequest && storageHealthState.persistence.status !== "granted";

    if (refreshButton) {
      refreshButton.disabled = storageHealthRefreshInProgress || persistentStorageRequestInProgress;
      refreshButton.textContent = storageHealthRefreshInProgress ? "Refreshing..." : "Refresh Storage Status";
      refreshButton.setAttribute("aria-busy", String(storageHealthRefreshInProgress));
    }

    if (requestButton) {
      requestButton.hidden = !requestAvailable;
      requestButton.disabled = persistentStorageRequestInProgress || storageHealthRefreshInProgress || !requestAvailable;
      requestButton.textContent = persistentStorageRequestInProgress ? "Requesting..." : "Request Persistent Storage";
      requestButton.setAttribute("aria-busy", String(persistentStorageRequestInProgress));
    }
  }

  function renderStorageHealth() {
    const estimate = storageHealthState.estimate;
    const persistence = storageHealthState.persistence;

    if (estimate.status === "unavailable") {
      setStorageHealthText("storage-health-estimate-status", "Storage estimates are unavailable in this browser.");
    } else if (estimate.status === "error") {
      setStorageHealthText("storage-health-estimate-status", "Storage estimates could not be checked right now.");
    } else if (estimate.status === "checking") {
      setStorageHealthText("storage-health-estimate-status", "Checking browser storage estimates...");
    } else {
      setStorageHealthText("storage-health-estimate-status", "These are approximate browser estimates for this site/origin.");
    }

    setStorageHealthText("storage-health-used", formatStorageBytes(estimate.usage));
    setStorageHealthText("storage-health-quota", formatStorageBytes(estimate.quota));
    setStorageHealthText("storage-health-percentage", formatStoragePercentage(estimate.percentage));

    const persistenceStatus = {
      checking: "Checking persistent-storage status...",
      granted: "Persistent storage is currently granted.",
      notGranted: "Persistent storage is not currently granted.",
      unavailable: "Persistent-storage status is unavailable in this browser.",
      error: "Persistent-storage status could not be checked."
    }[persistence.status] || "Persistent-storage status is unavailable in this browser.";
    setStorageHealthText("storage-health-persistence-status", persistenceStatus);
    updateStorageHealthControls();
  }

  async function readStorageEstimate() {
    const storageManager = getStorageManager();
    if (!storageManager || typeof storageManager.estimate !== "function") {
      return { status: "unavailable", usage: null, quota: null, percentage: null };
    }

    try {
      const estimate = await storageManager.estimate();
      const usage = isValidStorageNumber(estimate?.usage) ? estimate.usage : null;
      const quota = isValidStorageNumber(estimate?.quota) ? estimate.quota : null;
      const percentage = usage !== null && quota !== null && quota > 0
        ? (usage / quota) * 100
        : null;

      return {
        status: "available",
        usage,
        quota,
        percentage: isValidStorageNumber(percentage) ? percentage : null
      };
    } catch {
      return { status: "error", usage: null, quota: null, percentage: null };
    }
  }

  async function readPersistentStorageStatus() {
    const storageManager = getStorageManager();
    const canRequest = Boolean(storageManager && typeof storageManager.persist === "function");

    if (!storageManager || typeof storageManager.persisted !== "function") {
      return { status: "unavailable", canRequest };
    }

    try {
      const persisted = await storageManager.persisted();
      return {
        status: persisted === true ? "granted" : persisted === false ? "notGranted" : "error",
        canRequest
      };
    } catch {
      return { status: "error", canRequest };
    }
  }

  async function loadStorageHealthStatus(interactive) {
    if (storageHealthRefreshInProgress || persistentStorageRequestInProgress) {
      return;
    }

    storageHealthRefreshInProgress = true;
    if (interactive) {
      setStorageHealthMessage("");
    }
    updateStorageHealthControls();

    try {
      const [estimate, persistence] = await Promise.all([
        readStorageEstimate(),
        readPersistentStorageStatus()
      ]);
      storageHealthState.estimate = estimate;
      storageHealthState.persistence = persistence;
      renderStorageHealth();
      const states = [estimate.status, persistence.status];
      const statusMessage = states.includes("error")
        ? "Storage status checked, but some information could not be read."
        : states.includes("unavailable")
          ? "Storage status checked. Some information is unavailable in this browser."
          : interactive
            ? "Storage status refreshed."
            : "Storage status checked.";
      setStorageHealthMessage(statusMessage, "info");
    } finally {
      storageHealthRefreshInProgress = false;
      updateStorageHealthControls();
    }
  }

  async function refreshStorageStatus() {
    await loadStorageHealthStatus(true);
  }

  async function requestPersistentStorage() {
    const storageManager = getStorageManager();
    if (storageHealthRefreshInProgress || persistentStorageRequestInProgress || !storageManager || typeof storageManager.persist !== "function" || !storageHealthState.persistence.canRequest || storageHealthState.persistence.status === "granted") {
      return;
    }

    persistentStorageRequestInProgress = true;
    setStorageHealthMessage("");
    updateStorageHealthControls();

    try {
      const granted = await storageManager.persist();
      storageHealthState.persistence = {
        status: granted === true ? "granted" : "notGranted",
        canRequest: true
      };
      renderStorageHealth();
      setStorageHealthMessage(
        granted === true
          ? "Persistent storage is now granted. JSON backups remain important."
          : "Persistent storage was not granted. Keep using JSON backups for recovery.",
        granted === true ? "success" : "info"
      );
    } catch {
      storageHealthState.persistence = { status: "error", canRequest: true };
      renderStorageHealth();
      setStorageHealthMessage("Persistent storage could not be requested. You can keep using the app and JSON backups.", "info");
    } finally {
      persistentStorageRequestInProgress = false;
      updateStorageHealthControls();
    }
  }

  function initializeStorageHealth() {
    setStorageHealthMessage("Checking browser storage status...", "info");
    renderStorageHealth();
    void loadStorageHealthStatus(false);
  }

  async function preparePhotoForBackup(photo) {
    const fileDataBase64 = await blobToBase64(photo.fileBlob);
    const { fileBlob, ...metadata } = photo;

    return {
      ...metadata,
      fileDataBase64,
      fileDataType: photo.fileType || fileBlob?.type || ""
    };
  }

  async function buildBackupData() {
    const [
      studentProfile,
      companyProfile,
      appSettings,
      weeks,
      dailyLogs,
      dailyTasks,
      photoAttachments
    ] = await Promise.all([
      window.OJTStorage.getStudentProfile(),
      window.OJTStorage.getCompanyProfile(),
      window.OJTStorage.getAppSettings(),
      window.OJTStorage.getWeeks(),
      window.OJTStorage.getDailyLogs(),
      window.OJTStorage.getDailyTasks(),
      window.OJTStorage.getPhotoAttachments()
    ]);

    return {
      appName,
      backupVersion,
      exportedAt: new Date().toISOString(),
      studentProfile,
      companyProfile,
      appSettings,
      weeks,
      dailyLogs,
      dailyTasks,
      photoAttachments: await Promise.all(photoAttachments.map(preparePhotoForBackup))
    };
  }

  async function exportBackup() {
    const messageElement = getElement("backup-message");
    window.OJTUI.clearFormMessage(messageElement);

    try {
      const photoAttachments = await window.OJTStorage.getPhotoAttachments();
      const totalRawBytes = photoAttachments.reduce((sum, photo) => sum + (photo.fileSize || 0), 0);
      const estimatedBase64Bytes = totalRawBytes * 1.37;

      if (estimatedBase64Bytes > 10 * 1024 * 1024) {
        const formattedSize = window.OJTPhotos.formatFileSize(estimatedBase64Bytes);
        const confirmed = window.confirm(
          `This backup includes ${photoAttachments.length} photos (~${formattedSize} estimated). Large files may take a moment. Continue?`
        );
        if (!confirmed) {
          window.OJTUI.showFormMessage(messageElement, "Export cancelled.", "error");
          return;
        }
      }

      const backupData = await buildBackupData();
      const validationResult = validateBackupData(backupData, { purpose: "export" });

      if (!validationResult.valid) {
        window.OJTUI.showFormMessage(messageElement, formatValidationMessage(validationResult, "export"), "error");
        return;
      }

      const fileName = `ojt-journal-companion-backup-${todayText()}.json`;
      downloadTextFile(fileName, JSON.stringify(backupData));

      try {
        const settings = await window.OJTStorage.getAppSettings() || {};
        settings.lastBackupDate = new Date().toISOString();
        const savedSettings = await window.OJTStorage.saveAppSettings(settings);
        const studentProfile = await window.OJTStorage.getStudentProfile();
        const companyProfile = await window.OJTStorage.getCompanyProfile();
        window.OJTUI.updateDashboardSummary(studentProfile, companyProfile, savedSettings);

        document.dispatchEvent(new CustomEvent("ojt:backup-exported", {
          detail: { settings: savedSettings }
        }));
      } catch (settingsError) {
        console.error("Could not save lastBackupDate:", settingsError);
      }

      window.OJTUI.showFormMessage(messageElement, "Backup downloaded.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not export backup. Try again.", "error");
      console.error(error);
    }
  }

  function readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          resolve(JSON.parse(String(reader.result || "")));
        } catch (error) {
          reject(new Error("File is not valid JSON."));
        }
      };

      reader.onerror = () => {
        reject(reader.error || new Error("Backup file could not be read."));
      };

      reader.readAsText(file);
    });
  }

  // Restore preparation is intentionally separate from the destructive action.

  function bindBackupEvents() {
    getElement("export-backup-button")?.addEventListener("click", exportBackup);
    getElement("restore-backup-file")?.addEventListener("change", analyzeRestoreFile);
    getElement("restore-this-backup-button")?.addEventListener("click", restorePendingBackup);
    getElement("export-current-data-first-button")?.addEventListener("click", exportCurrentDataFirst);
    getElement("cancel-restore-review-button")?.addEventListener("click", cancelRestoreReview);
    getElement("refresh-storage-status-button")?.addEventListener("click", refreshStorageStatus);
    getElement("request-persistent-storage-button")?.addEventListener("click", requestPersistentStorage);
    getElement("reset-confirm-checkbox")?.addEventListener("change", updateResetButtonState);
    getElement("reset-confirm-text")?.addEventListener("input", updateResetButtonState);
    getElement("reset-local-data-button")?.addEventListener("click", resetLocalData);
    initializeStorageHealth();
  }

  function isResetReady() {
    const checkbox = getElement("reset-confirm-checkbox");
    const textInput = getElement("reset-confirm-text");
    return Boolean(checkbox?.checked) && textInput?.value.trim() === "RESET";
  }

  function updateResetButtonState() {
    const button = getElement("reset-local-data-button");
    if (button) {
      button.disabled = !isResetReady();
    }
  }

  async function resetLocalData() {
    const messageElement = getElement("backup-message");
    window.OJTUI.clearFormMessage(messageElement);

    if (!isResetReady()) {
      window.OJTUI.showFormMessage(messageElement, "Check the box and type RESET to continue.", "error");
      return;
    }

    const confirmed = window.confirm(
      "Reset local app data?\n\nThis permanently deletes your OJT journal from this browser — profile, weeks, daily logs, tasks, photos, and settings.\n\nThis cannot be undone. Export a backup first if you need your data.\n\nContinue?"
    );

    if (!confirmed) {
      return;
    }

    const button = getElement("reset-local-data-button");
    if (button) {
      button.disabled = true;
    }

    try {
      await window.OJTStorage.clearAllData();
      window.OJTSelectedWeek?.clearSelection({ source: "reset" });
      window.OJTUI.showFormMessage(messageElement, "Local data reset. Reloading...", "success");
      window.setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      updateResetButtonState();
      window.OJTUI.showFormMessage(messageElement, "Could not reset local data. Try again.", "error");
      console.error(error);
    }
  }

  window.OJTBackup = {
    appName,
    backupVersion,
    supportedBackupVersion,
    errorCodes,
    warningCodes,
    base64ToBlob,
    blobToBase64,
    buildBackupData,
    decodePhotoPayload,
    formatValidationMessage,
    validateBackupData
  };

  document.addEventListener("DOMContentLoaded", bindBackupEvents);
})();
