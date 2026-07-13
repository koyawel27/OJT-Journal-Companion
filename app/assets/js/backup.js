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

  async function restoreBackup(event) {
    const messageElement = getElement("backup-message");
    const fileInput = event.target;
    const file = fileInput.files?.[0] || null;
    window.OJTUI.clearFormMessage(messageElement);

    if (!file) {
      return;
    }

    try {
      const parsedData = await readJsonFile(file);
      const validationResult = validateBackupData(parsedData, { purpose: "restore" });

      if (!validationResult.valid) {
        window.OJTUI.showFormMessage(messageElement, formatValidationMessage(validationResult, "restore"), "error");
        fileInput.value = "";
        return;
      }

      const confirmed = window.confirm(
        "Restore this backup?\n\nThis replaces ALL journal data in this browser. It cannot be undone.\n\nExport a backup of your current data first if you need it.\n\nContinue?"
      );

      if (!confirmed) {
        fileInput.value = "";
        return;
      }

      await window.OJTStorage.replaceAllData(validationResult.restoreCandidate);
      window.OJTUI.showFormMessage(messageElement, "Backup restored. Reloading...", "success");
      window.setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      const message = error.message === "File is not valid JSON."
        ? "File is not valid JSON."
        : (error.message || "Could not restore backup. Try again.");
      window.OJTUI.showFormMessage(messageElement, message, "error");
      console.error(error);
    } finally {
      fileInput.value = "";
    }
  }

  function bindBackupEvents() {
    getElement("export-backup-button")?.addEventListener("click", exportBackup);
    getElement("restore-backup-file")?.addEventListener("change", restoreBackup);
    getElement("reset-confirm-checkbox")?.addEventListener("change", updateResetButtonState);
    getElement("reset-confirm-text")?.addEventListener("input", updateResetButtonState);
    getElement("reset-local-data-button")?.addEventListener("click", resetLocalData);
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
