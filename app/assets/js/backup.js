(function () {
  const appName = "OJT Journal Companion";
  const backupVersion = "1.0";

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

  async function preparePhotoForBackup(photo) {
    const fileDataBase64 = await blobToBase64(photo.fileBlob);
    const { fileBlob, ...metadata } = photo;

    return {
      ...metadata,
      fileDataBase64,
      fileDataType: photo.fileType || fileBlob?.type || ""
    };
  }

  function preparePhotoForRestore(photo) {
    const { fileDataBase64, fileDataType, fileBlob, ...metadata } = photo;

    return {
      ...metadata,
      fileBlob: base64ToBlob(fileDataBase64, fileDataType || metadata.fileType)
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

  function isObjectOrNull(value) {
    return value === null || (typeof value === "object" && !Array.isArray(value));
  }

  function validateBackupData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return "Backup file does not contain a valid backup object.";
    }

    if (data.appName !== appName) {
      return "Backup file is not for OJT Journal Companion.";
    }

    if (!data.backupVersion) {
      return "Backup version is missing.";
    }

    if (!isObjectOrNull(data.studentProfile)) {
      return "Student profile data is invalid.";
    }

    if (!isObjectOrNull(data.companyProfile)) {
      return "Company profile data is invalid.";
    }

    if (!isObjectOrNull(data.appSettings)) {
      return "App settings data is invalid.";
    }

    const requiredArrays = ["weeks", "dailyLogs", "dailyTasks", "photoAttachments"];
    const missingArray = requiredArrays.find((key) => !Array.isArray(data[key]));

    if (missingArray) {
      return `Backup ${missingArray} data is missing or invalid.`;
    }

    const invalidArray = requiredArrays.find((key) => {
      return data[key].some((record) => !record || typeof record !== "object" || Array.isArray(record));
    });

    if (invalidArray) {
      return `Backup ${invalidArray} contains invalid records.`;
    }

    const missingIdArray = requiredArrays.find((key) => {
      return data[key].some((record) => !record.id);
    });

    if (missingIdArray) {
      return `Backup ${missingIdArray} contains records without IDs.`;
    }

    return "";
  }

  function normalizeRestoreData(data) {
    return {
      studentProfile: data.studentProfile,
      companyProfile: data.companyProfile,
      appSettings: data.appSettings,
      weeks: data.weeks,
      dailyLogs: data.dailyLogs,
      dailyTasks: data.dailyTasks,
      photoAttachments: data.photoAttachments.map(preparePhotoForRestore)
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
      const validationMessage = validateBackupData(parsedData);

      if (validationMessage) {
        window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
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

      await window.OJTStorage.replaceAllData(normalizeRestoreData(parsedData));
      window.OJTUI.showFormMessage(messageElement, "Backup restored. Reloading...", "success");
      window.setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, error.message || "Could not restore backup. Try again.", "error");
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

  document.addEventListener("DOMContentLoaded", bindBackupEvents);
})();
