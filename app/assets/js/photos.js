(function () {
  const maxPhotoSizeBytes = 5 * 1024 * 1024;
  const supportedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
  const photoCategories = [
    "General Documentation",
    "Time In Photo",
    "Time Out Photo",
    "Task/Work Proof",
    "Other"
  ];

  function normalizePhotoCategory(value) {
    return photoCategories.includes(value) ? value : "General Documentation";
  }

  function createId(prefix) {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function validatePhotoFile(file) {
    if (!file) {
      return "Please choose a photo to attach.";
    }

    if (!supportedPhotoTypes.includes(file.type)) {
      return "Photo must be a JPEG, PNG, or WebP file.";
    }

    if (file.size > maxPhotoSizeBytes) {
      return `Photo must be ${formatFileSize(maxPhotoSizeBytes)} or smaller.`;
    }

    return "";
  }

  function formatFileSize(bytes) {
    const size = Number(bytes);

    if (!Number.isFinite(size) || size < 0) {
      return "Unknown size";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function buildPhotoAttachment(file, dailyLogId, caption, photoCategory, photoSetId, photoSetIndex) {
    const photoAttachment = {
      id: createId("photo"),
      dailyLogId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileBlob: file,
      photoCategory: normalizePhotoCategory(photoCategory),
      caption: caption || "",
      createdAt: new Date().toISOString()
    };

    if (photoSetId !== undefined) {
      const normalizedPhotoSetId = String(photoSetId ?? "").trim();

      if (!normalizedPhotoSetId) {
        throw new Error("Photo set ID must contain non-whitespace characters.");
      }

      photoAttachment.photoSetId = normalizedPhotoSetId;
    }

    if (photoSetIndex !== undefined) {
      if (!Number.isInteger(photoSetIndex) || photoSetIndex < 0) {
        throw new TypeError("photoSetIndex must be a non-negative integer when supplied.");
      }

      photoAttachment.photoSetIndex = photoSetIndex;
    }

    return photoAttachment;
  }

  function downloadPhotoAttachment(photoAttachment) {
    if (!photoAttachment?.fileBlob) {
      throw new Error("Stored photo data is not available.");
    }

    const url = URL.createObjectURL(photoAttachment.fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = photoAttachment.fileName || "ojt-photo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  window.OJTPhotos = {
    buildPhotoAttachment,
    downloadPhotoAttachment,
    formatFileSize,
    maxPhotoSizeBytes,
    normalizePhotoCategory,
    photoCategories,
    supportedPhotoTypes,
    validatePhotoFile
  };
})();
