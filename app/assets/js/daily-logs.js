(function () {
  const taskStatuses = ["Pending", "In Progress", "Completed"];
  const dayStatuses = ["Worked", "Absent", "No OJT / Rest Day"];
  const state = {
    weeks: [],
    dailyLogs: [],
    dailyTasks: [],
    photoAttachments: [],
    selectedWeekId: "",
    expandedRecordDate: null,
    expandedDate: null,
    activeDailyLogId: null,
    returnFocusElement: null,
    taskEditorMode: "",
    taskEditorTaskId: "",
    taskEditorScrollTop: 0,
    taskEditorOriginFocusKey: "",
    dailyLogFeedback: null
  };
  let dailyLogKeydownHandler = null;
  const dailyRecordThumbnailUrls = new Map();
  const dailyLogEditorPhotoUrls = new Map();

  function getElement(id) {
    return document.getElementById(id);
  }

  function getValue(id) {
    return getElement(id)?.value.trim() || "";
  }

  function setValue(id, value) {
    const element = getElement(id);
    if (element) {
      element.value = value ?? "";
    }
  }

  function setText(id, text) {
    const element = getElement(id);
    if (element) {
      element.textContent = text;
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }
  function getEditorRoot() {
    return getElement("daily-log-editor-root");
  }

  function getEditorPanel() {
    return getEditorRoot()?.querySelector("[role=\"dialog\"]") || null;
  }

  function isVisibleFocusable(element) {
    if (!element || !element.isConnected || element.disabled || element.hidden || element.closest("[inert]") || element.closest("[aria-hidden=\"true\"]")) {
      return false;
    }

    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return styles.display !== "none" && styles.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  function getEditorFocusableElements() {
    const panel = getEditorPanel();
    if (!panel) {
      return [];
    }

    return Array.from(panel.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex=\"-1\"])")).filter(isVisibleFocusable);
  }

  function getEditorFocusKey(element) {
    const panel = getEditorPanel();
    if (!panel || !element || !panel.contains(element)) {
      return "";
    }

    if (element.dataset.taskAction && element.dataset.taskId) {
      return `task:${element.dataset.taskId}:${element.dataset.taskAction}`;
    }

    if (element.dataset.photoAction && element.dataset.photoId) {
      return `photo:${element.dataset.photoId}:${element.dataset.photoAction}`;
    }

    if (element.dataset.photoSetAction && element.dataset.photoSetId) {
      return `photo-set:${element.dataset.photoSetId}:${element.dataset.photoSetAction}`;
    }

    if (element.dataset.photoUploadAction) {
      return `photo-upload:${element.dataset.photoUploadAction}`;
    }

    const photoSetForm = element.closest("[data-photo-set-form]");
    if (photoSetForm?.dataset.photoSetId && element.name) {
      return `photo-set:${photoSetForm.dataset.photoSetId}:${element.name}`;
    }

    return element.id ? `id:${element.id}` : "";
  }

  function captureEditorFocusKey() {
    return getEditorFocusKey(document.activeElement);
  }

  function findEditorFocusTarget(focusKey) {
    const panel = getEditorPanel();
    if (!panel || !focusKey) {
      return null;
    }

    const parts = focusKey.split(":");
    if (parts[0] === "task" && parts[1] && parts[2]) {
      return panel.querySelector(`[data-task-action="${CSS.escape(parts[2])}"][data-task-id="${CSS.escape(parts[1])}"]`);
    }

    if (parts[0] === "photo" && parts[1] && parts[2]) {
      const target = panel.querySelector(`[data-photo-action="${CSS.escape(parts[2])}"][data-photo-id="${CSS.escape(parts[1])}"]`);
      const details = target?.closest("details");
      if (details) {
        details.open = true;
      }
      return target;
    }

    if (parts[0] === "photo-set" && parts[1] && parts[2]) {
      const target = parts[2] === "save"
        ? panel.querySelector(`[data-photo-set-action="save"][data-photo-set-id="${CSS.escape(parts[1])}"]`)
        : panel.querySelector(`[data-photo-set-form][data-photo-set-id="${CSS.escape(parts[1])}"] [name="${CSS.escape(parts[2])}"]`);
      const details = target?.closest("details");
      if (details) {
        details.open = true;
      }
      return target;
    }

    if (parts[0] === "photo-upload" && parts[1]) {
      return panel.querySelector(`[data-photo-upload-action="${CSS.escape(parts[1])}"]`);
    }

    if (parts[0] === "id" && parts[1]) {
      return panel.querySelector(`#${CSS.escape(parts.slice(1).join(":"))}`);
    }

    return null;
  }

  function getEditorFallbackTarget(focusKey) {
    const panel = getEditorPanel();
    if (!panel) {
      return null;
    }

    let selectors = ["#daily-log-day-status", "#daily-log-editor-close"];
    if (focusKey?.startsWith("task:")) {
      selectors = ["[data-task-action=\"edit\"]", "[data-task-action=\"delete\"]", "#daily-task-description", ...selectors];
    } else if (focusKey?.startsWith("photo:") || focusKey?.startsWith("photo-set:") || focusKey?.startsWith("photo-upload:")) {
      selectors = ["[data-photo-action=\"download\"]", "[data-photo-action=\"delete\"]", "[data-photo-set-action=\"save\"]", "[data-photo-upload-action=\"attach\"]", "#photo-upload-file", ...selectors];
    }

    return selectors.map((selector) => panel.querySelector(selector)).find(isVisibleFocusable) || null;
  }

  function restoreEditorFocus(focusKey, fallbackKey = "") {
    if (!focusKey) {
      return;
    }

    window.requestAnimationFrame(() => {
      const target = findEditorFocusTarget(focusKey) || findEditorFocusTarget(fallbackKey) || getEditorFallbackTarget(focusKey);
      if (isVisibleFocusable(target)) {
        target.focus();
      }
    });
  }

  function focusEditorInitialControl() {
    window.requestAnimationFrame(() => {
      const panel = getEditorPanel();
      const target = panel?.querySelector("[data-editor-initial-focus]") || panel?.querySelector("#daily-log-editor-close");
      if (isVisibleFocusable(target)) {
        target.focus();
      }
    });
  }



  function showValidationError(form, message, fieldIds) {
    window.OJTUI.clearFieldValidation(form);
    const messageElement = form?.querySelector(".form-message") ||
      getElement("daily-log-form-message");
    const validFields = (fieldIds || []).map((id) => getElement(id)).filter(Boolean);
    validFields.forEach((field) => {
      field.setAttribute("aria-invalid", "true");
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      if (messageElement?.id) {
        describedBy.add(messageElement.id);
      }
      if (describedBy.size > 0) {
        field.setAttribute("aria-describedby", [...describedBy].join(" "));
      }
    });
    window.OJTUI.showFormMessage(messageElement, message, "error");
    window.requestAnimationFrame(() => {
      const firstField = validFields.find(isVisibleFocusable);
      firstField?.focus();
    });
  }

  function createId(prefix) {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function notifyJournalDataChange() {
    document.dispatchEvent(new CustomEvent("ojt:daily-log-data-change"));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function parseDate(dateText) {
    const [year, month, day] = dateText.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateText) {
    if (!dateText) {
      return "No date";
    }

    return parseDate(dateText).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatEditorDisplayDate(dateText) {
    if (!dateText) {
      return "No date";
    }

    return parseDate(dateText).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function getDayLabel(week, dateText) {
    if (!week || !dateText) {
      return "Day";
    }

    const start = parseDate(week.inclusiveStartDate);
    const current = parseDate(dateText);
    const dayNumber = Math.round((current - start) / 86400000) + 1;

    return `Day ${dayNumber}`;
  }

  function formatRenderedTime(minutes) {
    return window.OJTCalculations.formatRenderedTime(minutes);
  }

  function calculateRenderedTime(timeIn, timeOut, breakMinutes) {
    return window.OJTCalculations.calculateRenderedTime(timeIn, timeOut, breakMinutes);
  }

  function getTaskTotalMinutes(tasks) {
    return window.OJTCalculations.sumTaskMinutes(tasks);
  }

  function normalizeDayStatus(value) {
    return window.OJTCalculations.normalizeDayStatus(value);
  }

  function isWorkedStatus(dayStatus) {
    return normalizeDayStatus(dayStatus) === "Worked";
  }

  function getDailyLogStatus(dailyLog) {
    return normalizeDayStatus(dailyLog?.dayStatus);
  }

  function getDayStatusClass(dayStatus) {
    const normalizedStatus = normalizeDayStatus(dayStatus);

    if (normalizedStatus === "Worked") {
      return "is-worked";
    }

    if (normalizedStatus === "Absent") {
      return "is-absent";
    }

    return "is-rest";
  }

  function renderDayStatusBadge(dayStatus) {
    const normalizedStatus = normalizeDayStatus(dayStatus);
    return `<span class="day-status-badge ${getDayStatusClass(normalizedStatus)}">${escapeHtml(normalizedStatus)}</span>`;
  }

  function getRenderedTimeText(dailyLog) {
    const dayStatus = getDailyLogStatus(dailyLog);
    const renderedMinutes = Number(dailyLog?.renderedMinutes);

    if (dayStatus !== "Worked") {
      return formatRenderedTime(0);
    }

    if (Number.isFinite(renderedMinutes)) {
      return formatRenderedTime(renderedMinutes);
    }

    return "Not calculated";
  }

  function normalizePhotoCategory(value) {
    return window.OJTPhotos.normalizePhotoCategory(value);
  }

  function renderOptions(options, selectedValue) {
    return options.map((option) => {
      const selected = option === selectedValue ? " selected" : "";
      return `<option value="${escapeHtml(option)}"${selected}>${escapeHtml(option)}</option>`;
    }).join("");
  }

  function getDayStatusText(dailyLog, taskCount, photoCount) {
    if (!dailyLog) {
      return "No daily log yet";
    }

    const dayStatus = getDailyLogStatus(dailyLog);
    let status = dayStatus;
    const renderedMinutes = Number(dailyLog.renderedMinutes);

    if (dayStatus !== "Worked") {
      status += " - 0h 0m";
    } else if (Number.isFinite(renderedMinutes) && renderedMinutes > 0) {
      status += ` - ${formatRenderedTime(renderedMinutes)}`;
    }

    if (taskCount > 0) {
      status += taskCount === 1 ? " - 1 task item" : ` - ${taskCount} task items`;
    }

    if (photoCount > 0) {
      status += photoCount === 1 ? " - 1 photo" : ` - ${photoCount} photos`;
    }

    return status;
  }

  function sortWeeks(weeks) {
    return window.OJTSelectedWeek?.sortWeeksChronologically(weeks) || [...(weeks || [])];
  }

  function sortDailyLogs(logs) {
    return [...logs].sort((first, second) => first.entryDate.localeCompare(second.entryDate));
  }

  function sortTasks(tasks) {
    return [...tasks].sort((first, second) => {
      return (first.sortOrder || 0) - (second.sortOrder || 0) || first.createdAt.localeCompare(second.createdAt);
    });
  }

  function getSelectedWeek() {
    return state.weeks.find((week) => week.id === state.selectedWeekId) || null;
  }

  function getDailyLogForDate(dateText) {
    return state.dailyLogs.find((log) => log.weekId === state.selectedWeekId && log.entryDate === dateText) || null;
  }

  function getActiveDailyLog() {
    return state.dailyLogs.find((log) => log.id === state.activeDailyLogId) || null;
  }

  function getLogsForWeek(weekId) {
    return sortDailyLogs(state.dailyLogs.filter((log) => log.weekId === weekId));
  }

  function getTasksForDailyLog(dailyLogId) {
    return sortTasks(state.dailyTasks.filter((task) => task.dailyLogId === dailyLogId));
  }

  function isValidPhotoDate(value) {
    return Boolean(value) && Number.isFinite(new Date(value).getTime());
  }

  function comparePhotoDates(first, second) {
    const firstTime = isValidPhotoDate(first.createdAt) ? new Date(first.createdAt).getTime() : Number.POSITIVE_INFINITY;
    const secondTime = isValidPhotoDate(second.createdAt) ? new Date(second.createdAt).getTime() : Number.POSITIVE_INFINITY;
    return firstTime - secondTime || String(first.id || "").localeCompare(String(second.id || ""));
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

    return comparePhotoDates(first, second);
  }

  function getEarliestPhotoTimestamp(photos) {
    return photos.reduce((earliest, photo) => {
      if (!isValidPhotoDate(photo.createdAt)) {
        return earliest;
      }

      return Math.min(earliest, new Date(photo.createdAt).getTime());
    }, Number.POSITIVE_INFINITY);
  }

  function getPhotoSetsForDailyLog(dailyLogId) {
    const groups = new Map();

    state.photoAttachments
      .filter((photo) => photo.dailyLogId === dailyLogId)
      .forEach((photo) => {
        const hasPhotoSetId = typeof photo.photoSetId === "string" && photo.photoSetId.trim() !== "";
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
        const firstTimestamp = getEarliestPhotoTimestamp(first.photos);
        const secondTimestamp = getEarliestPhotoTimestamp(second.photos);
        return firstTimestamp - secondTimestamp || first.key.localeCompare(second.key);
      });
  }
  function getPhotosForDailyLog(dailyLogId) {
    return getPhotoSetsForDailyLog(dailyLogId).flatMap((photoSet) => photoSet.photos);
  }

  function revokeDailyLogEditorPhotoUrls() {
    dailyLogEditorPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
    dailyLogEditorPhotoUrls.clear();
  }

  function revokeDailyRecordThumbnailUrls() {
    dailyRecordThumbnailUrls.forEach((url) => URL.revokeObjectURL(url));
    dailyRecordThumbnailUrls.clear();
  }

  function createDailyRecordThumbnailUrl(photo) {
    if (!(photo?.fileBlob instanceof Blob) || !String(photo.fileBlob.type || photo.fileType || "").startsWith("image/")) {
      return "";
    }

    const url = URL.createObjectURL(photo.fileBlob);
    dailyRecordThumbnailUrls.set(photo.id, url);
    return url;
  }

  function createDailyLogEditorPhotoUrl(photo) {
    if (!(photo?.fileBlob instanceof Blob) || !String(photo.fileBlob.type || photo.fileType || "").startsWith("image/")) {
      return "";
    }

    const url = URL.createObjectURL(photo.fileBlob);
    dailyLogEditorPhotoUrls.set(photo.id, url);
    return url;
  }

  function renderDailyRecordAttachments(photos, dayLabel) {
    if (photos.length === 0) {
      return '<p class="daily-record-empty-message">No photos attached.</p>';
    }

    const visiblePhotos = photos.slice(0, 3);
    const remainingCount = Math.max(photos.length - visiblePhotos.length, 0);
    const thumbnails = visiblePhotos.map((photo, index) => {
      const thumbnailUrl = createDailyRecordThumbnailUrl(photo);
      const altText = `Photo attachment ${index + 1} for ${dayLabel}`;

      if (!thumbnailUrl) {
        return `
          <span class="daily-record-thumbnail is-unavailable" role="img" aria-label="${escapeHtml(`${altText} unavailable`)}">
            <span>Unavailable</span>
          </span>
        `;
      }

      return `
        <span class="daily-record-thumbnail">
          <img
            src="${escapeHtml(thumbnailUrl)}"
            alt="${escapeHtml(altText)}"
            decoding="async"
            data-daily-record-thumbnail
          >
          <span class="daily-record-thumbnail-unavailable" hidden>Unavailable</span>
        </span>
      `;
    }).join("");
    const overflowIndicator = remainingCount > 0
      ? `<span class="daily-record-thumbnail-overflow" aria-hidden="true">+${escapeHtml(String(remainingCount))}</span>`
      : "";

    return `
      <div class="daily-record-thumbnail-strip">
        ${thumbnails}
        ${overflowIndicator}
      </div>
    `;
  }
  function updateWeekSummary() {
    const logs = getLogsForWeek(state.selectedWeekId);
    const countLabel = getElement("journal-daily-summary");

    if (!countLabel) {
      return;
    }

    if (!state.selectedWeekId) {
      countLabel.textContent = "";
      return;
    }

    const weeklyTotal = window.OJTCalculations.sumRenderedMinutes(logs);
    const logsText = logs.length === 1
      ? "1 daily log saved"
      : `${logs.length} daily logs saved`;

    countLabel.textContent = `${logsText} this week · ${formatRenderedTime(weeklyTotal)} rendered total.`;
  }

  function selectWeek(weekId) {
    window.OJTUI.clearFormMessages(getElement("journal-week-accordions"));
    window.OJTSelectedWeek?.selectWeek(weekId, { weeks: state.weeks, source: "journal:daily-records" });
    state.selectedWeekId = window.OJTSelectedWeek?.getSelectedWeekId() || "";
    state.expandedRecordDate = null;
    state.expandedDate = null;
    state.activeDailyLogId = null;
    renderJournalWeek();
    updateWeekSummary();
  }

  function renderTaskBullets(tasks) {
    if (tasks.length === 0) {
      return '<p class="empty-state">No tasks yet. Save the day record first, then add work items below.</p>';
    }

    return `
      <ul class="task-bullet-list">
        ${tasks.map((task) => {
          const timeText = Number(task.timeSpentMinutes) > 0 ? `${task.timeSpentMinutes} min` : "No task time";
          const notesText = task.notes ? `<p class="task-note">${escapeHtml(task.notes)}</p>` : "";
          return `
            <li class="task-bullet-item">
              <div class="task-bullet-content">
                <div class="task-title-row">
                  <strong>${escapeHtml(task.description)}</strong>
                  <span class="status-pill">${escapeHtml(task.status)}</span>
                </div>
                <div class="task-meta-row">
                  <span>${escapeHtml(timeText)}</span>
                  <span>Documentation only</span>
                </div>
                ${notesText}
              </div>
              <div class="task-bullet-actions">
                <button class="secondary-button" type="button" data-task-action="edit" data-task-id="${escapeHtml(task.id)}">Edit</button>
                <button class="danger-button" type="button" data-task-action="delete" data-task-id="${escapeHtml(task.id)}">Delete</button>
              </div>
            </li>
          `;
        }).join("")}
      </ul>
    `;
  }

  function renderRenderedTimePanel(dailyLog, tasks) {
    const dayStatus = getDailyLogStatus(dailyLog);
    const worked = isWorkedStatus(dayStatus);
    const calculation = calculateRenderedTime(
      dailyLog?.timeIn || "",
      dailyLog?.timeOut || "",
      dailyLog?.breakMinutes || 0
    );
    const taskTotalMinutes = getTaskTotalMinutes(tasks);
    const renderedText = !worked
      ? formatRenderedTime(0)
      : calculation.isComplete
      ? formatRenderedTime(calculation.renderedMinutes)
      : "Not calculated";
    const helpText = !worked
      ? "Absent and rest days count as 0 rendered hours."
      : calculation.error || "Enter time in, time out, and break minutes to calculate rendered hours.";
    let taskComparison = "";

    if (worked && taskTotalMinutes > 0) {
      if (calculation.isComplete && taskTotalMinutes !== calculation.renderedMinutes) {
        taskComparison = `
          <p class="time-reference warning">
            Task item time totals ${escapeHtml(formatRenderedTime(taskTotalMinutes))}. Task item time is for documentation only and may not match rendered hours.
          </p>
        `;
      } else {
        taskComparison = `
          <p class="time-reference">
            Task item time total: ${escapeHtml(formatRenderedTime(taskTotalMinutes))}. Task item time is documentation only.
          </p>
        `;
      }
    }

    return `
      <div class="calculation-result rendered-time-strip" aria-live="polite">
        <span class="card-label">Rendered time</span>
        <strong id="daily-rendered-time-preview">${escapeHtml(renderedText)}</strong>
        <p id="daily-rendered-time-help">${escapeHtml(helpText)}</p>
        ${taskComparison}
      </div>
    `;
  }

  function formatPhotoCreatedAt(createdAt) {
    if (!createdAt) {
      return "No created date";
    }

    return new Date(createdAt).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function buildPhotoPreviewAltText(photo, category, caption, index, total) {
    const position = total > 1 ? `, image ${index + 1} of ${total}` : "";
    const description = caption.trim() || photo.fileName || "stored photo";
    return `${category}${position}: ${description}`;
  }

  function renderPhotoPreview(photo, category, caption, index, total) {
    const previewUrl = createDailyLogEditorPhotoUrl(photo);
    const altText = buildPhotoPreviewAltText(photo, category, caption, index, total);

    if (!previewUrl) {
      return `
        <div class="photo-preview-frame is-unavailable" role="img" aria-label="${escapeHtml(`${altText} unavailable`)}">
          <span>Preview unavailable</span>
        </div>
      `;
    }

    return `
      <div class="photo-preview-frame">
        <img
          src="${escapeHtml(previewUrl)}"
          alt="${escapeHtml(altText)}"
          width="640"
          height="400"
          loading="lazy"
          decoding="async"
          data-photo-preview
        >
        <span class="photo-preview-unavailable" role="img" aria-label="${escapeHtml(`${altText} unavailable`)}" hidden>Preview unavailable</span>
      </div>
    `;
  }

  function renderPhotoSet(photoSet) {
    const firstPhoto = photoSet.photos[0];
    const isSharedSet = Boolean(photoSet.photoSetId);
    const category = normalizePhotoCategory(firstPhoto.photoCategory);
    const caption = String(firstPhoto.caption ?? "");
    const imageCount = photoSet.photos.length;
    const setLabel = isSharedSet ? "Photo set" : "Photo";
    const editForm = isSharedSet
      ? `
        <form class="photo-caption-form photo-set-edit-form" data-photo-set-form data-photo-set-id="${escapeHtml(photoSet.photoSetId)}" novalidate>
          <label class="field">
            <span>Shared category</span>
            <select name="photoCategory">${renderOptions(window.OJTPhotos.photoCategories, category)}</select>
          </label>
          <label class="field">
            <span>Shared caption</span>
            <textarea name="caption" rows="2">${escapeHtml(caption)}</textarea>
          </label>
          <div class="form-actions">
            <button class="secondary-button" type="submit" data-photo-set-action="save" data-photo-set-id="${escapeHtml(photoSet.photoSetId)}">Save shared details</button>
            <p class="form-message" hidden></p>
          </div>
        </form>
      `
      : `
        <form class="photo-caption-form" data-photo-caption-form data-photo-id="${escapeHtml(firstPhoto.id)}" novalidate>
          <label class="field">
            <span>Category</span>
            <select name="photoCategory">${renderOptions(window.OJTPhotos.photoCategories, category)}</select>
          </label>
          <label class="field">
            <span>Caption</span>
            <textarea name="caption" rows="2">${escapeHtml(caption)}</textarea>
          </label>
          <div class="form-actions">
            <button class="secondary-button" type="submit" data-photo-action="save-details" data-photo-id="${escapeHtml(firstPhoto.id)}">Save details</button>
            <p class="form-message" hidden></p>
          </div>
        </form>
      `;

    return `
      <li class="photo-set-item">
        <ul class="photo-set-image-list" aria-label="${escapeHtml(`${setLabel} images`)}">
          ${photoSet.photos.map((photo, index) => `
            <li class="photo-attachment-item">
              ${renderPhotoPreview(photo, category, caption, index, imageCount)}
              <div class="photo-attachment-main">
                <strong>${escapeHtml(photo.fileName || "Untitled photo")}</strong>
                <p class="item-meta">
                  ${escapeHtml(window.OJTPhotos.formatFileSize(photo.fileSize))} &middot; ${escapeHtml(formatPhotoCreatedAt(photo.createdAt))}
                </p>
              </div>
              <div class="photo-item-actions" aria-label="${escapeHtml(`Actions for ${photo.fileName || "stored photo"}`)}">
                <button class="photo-quiet-button" type="button" data-photo-action="download" data-photo-id="${escapeHtml(photo.id)}">Download</button>
                <button class="photo-delete-button" type="button" data-photo-action="delete" data-photo-id="${escapeHtml(photo.id)}">Delete</button>
              </div>
            </li>
          `).join("")}
        </ul>
        <div class="photo-set-header">
          <div class="photo-set-summary">
            <div class="photo-set-meta-row">
              <span class="photo-category">${escapeHtml(category)}</span>
              <span class="photo-image-count">${escapeHtml(imageCount === 1 ? "1 image" : `${imageCount} images`)}</span>
            </div>
            ${caption ? `<p class="photo-caption">${escapeHtml(caption)}</p>` : '<p class="photo-caption empty-caption">No caption saved.</p>'}
          </div>
          <details class="photo-caption-details">
            <summary>Edit ${isSharedSet ? "shared details" : "details"}</summary>
            ${editForm}
          </details>
        </div>
      </li>
    `;
  }

  function renderPhotoList(photoSets) {
    if (photoSets.length === 0) {
      return '<p class="photo-empty-state">No photos yet. Add optional work evidence when it helps document this day.</p>';
    }

    return `<ul class="photo-attachment-list">${photoSets.map(renderPhotoSet).join("")}</ul>`;
  }
  function renderPhotoSection(dailyLog) {
    if (!dailyLog) {
      return `
        <section class="photo-documentation-panel editor-section">
          <div class="journal-col-header">
            <span class="card-label">Attachments</span>
            <h4>Photo Documentation</h4>
            <p class="phase-note">Save the day record before attaching photos.</p>
          </div>
        </section>
      `;
    }

    const photoSets = getPhotoSetsForDailyLog(dailyLog.id);

    return `
      <section class="photo-documentation-panel editor-section" aria-labelledby="photo-documentation-title-${escapeHtml(dailyLog.id)}">
        <div class="photo-section-header">
          <div>
            <span class="card-label">Attachments</span>
            <h4 id="photo-documentation-title-${escapeHtml(dailyLog.id)}">Photo Documentation</h4>
          </div>
          <button class="photo-add-button" type="button" data-photo-upload-action="choose" aria-controls="photo-upload-form">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 7.5h3l1.4-2h7.2l1.4 2h3v11H4z"></path>
              <circle cx="12" cy="13" r="3.25"></circle>
              <path d="M19 3.5v4M17 5.5h4"></path>
            </svg>
            <span>Add Photo</span>
          </button>
        </div>
        <div class="photo-section-intro">
          <p class="phase-note">Optional — attach JPEG, PNG, or WebP up to ${escapeHtml(window.OJTPhotos.formatFileSize(window.OJTPhotos.maxPhotoSizeBytes))}.</p>
        </div>

        <div class="photo-attachment-list-wrap" id="photo-attachment-list">
          ${renderPhotoList(photoSets)}
        </div>

        <form class="photo-upload-form" id="photo-upload-form" data-daily-log-id="${escapeHtml(dailyLog.id)}" novalidate>
          <div class="form-grid">
            <label class="field">
              <span>Photo files</span>
              <input type="file" id="photo-upload-file" name="photoFiles" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-upload-selection" multiple>
              <p class="photo-selection-count" id="photo-upload-selection" aria-live="polite">No photos selected.</p>
            </label>
            <label class="field">
              <span>Category</span>
              <select id="photo-upload-category" name="photoCategory" autocomplete="off">
                ${renderOptions(window.OJTPhotos.photoCategories, "General Documentation")}
              </select>
            </label>
            <label class="field field-wide">
              <span>Caption</span>
              <textarea id="photo-upload-caption" name="caption" rows="2" autocomplete="off" placeholder="Optional caption&#8230;"></textarea>
            </label>
          </div>

          <div class="form-actions">
            <button class="primary-button" type="submit" data-photo-upload-action="attach">Attach photos</button>
            <p class="form-message" id="photo-upload-message" hidden></p>
          </div>
        </form>
      </section>
    `;
  }

  function renderTaskEditorSubview() {
    return `
      <section class="task-editor-subview" id="daily-task-editor-view" aria-labelledby="daily-task-form-title">
        <div class="task-editor-subview-header">
          <button class="secondary-button task-editor-back-button" type="button" data-task-action="cancel-editor">Back to Daily Log</button>
          <div>
            <span class="card-label">Task Editor</span>
            <h4 id="daily-task-form-title">${state.taskEditorMode === "edit" ? "Edit Task" : "Add Task"}</h4>
            <p class="phase-note">Record one work item without leaving this daily log.</p>
          </div>
        </div>

        <form class="task-form task-editor-form" id="daily-task-form" aria-labelledby="daily-task-form-title" novalidate>
          <input type="hidden" id="daily-task-id" value="">
          <input type="hidden" id="daily-task-time-spent" value="">
          <div class="form-grid">
            <label class="field field-wide">
              <span>Task or work item description</span>
              <input type="text" id="daily-task-description" autocomplete="off" required>
            </label>
            <div class="task-details-row field-wide">
              <fieldset class="task-duration-fieldset">
                <legend>Task duration (optional)</legend>
                <div class="task-duration-fields">
                  <label class="field">
                    <span>Hours</span>
                    <input type="number" id="daily-task-time-hours" min="0" step="1" inputmode="numeric" autocomplete="off" aria-describedby="daily-task-duration-help">
                  </label>
                  <label class="field">
                    <span>Minutes</span>
                    <input type="number" id="daily-task-time-minutes" min="0" max="59" step="1" inputmode="numeric" autocomplete="off" aria-describedby="daily-task-duration-help">
                  </label>
                </div>
              </fieldset>
              <label class="field task-status-field">
                <span>Status</span>
                <select id="daily-task-status" autocomplete="off">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>
            <label class="field field-wide">
              <span>Task notes</span>
              <textarea id="daily-task-notes" rows="2" autocomplete="off"></textarea>
            </label>
          </div>

          <p class="phase-note" id="daily-task-duration-help">Task duration is optional and for documentation only. Rendered hours still come from time in, time out, and break.</p>

          <div class="form-actions task-editor-actions">
            <button class="primary-button" type="submit" id="save-daily-task-button">Save Task</button>
            <button class="secondary-button" type="button" id="cancel-daily-task-edit-button">Cancel</button>
            <p class="form-message" id="daily-task-form-message" aria-live="polite" hidden></p>
          </div>
        </form>
      </section>
    `;
  }

  function renderDayEditorBody(week, dateText, dailyLog) {
    const dayLabel = getDayLabel(week, dateText);
    const dayStatus = getDailyLogStatus(dailyLog);
    const worked = isWorkedStatus(dayStatus);
    const timeFieldState = worked ? "" : "disabled";
    const timePanelClass = worked ? "" : " is-muted";
    const tasks = dailyLog ? getTasksForDailyLog(dailyLog.id) : [];
    const tasksEnabled = Boolean(dailyLog);
    const deleteButton = dailyLog
      ? `<div class="destructive-actions">
          <span class="destructive-label">Danger zone</span>
          <button class="danger-button" type="button" data-log-action="delete" data-log-id="${escapeHtml(dailyLog.id)}">Delete day record</button>
        </div>`
      : "";

    const saveFeedback = state.dailyLogFeedback;
    const saveFeedbackClass = saveFeedback ? ` ${saveFeedback.type}` : "";
    const saveFeedbackHidden = saveFeedback ? "" : "hidden";
    const saveFeedbackMessage = saveFeedback ? escapeHtml(saveFeedback.message) : "";
    return `
      <div class="daily-log-editor-flow">
          <form class="day-record-form editor-section editor-details-section" id="daily-log-form" novalidate>
            <input type="hidden" id="daily-log-id" value="${escapeHtml(dailyLog?.id || "")}">
            <input type="hidden" id="daily-log-form-week" value="${escapeHtml(week.id)}">
            <input type="hidden" id="daily-log-entry-date" value="${escapeHtml(dateText)}">

            <div class="daily-details-heading">
              <span class="card-label">${escapeHtml(dayLabel)}</span>
              <h4 class="journal-day-heading">${escapeHtml(formatEditorDisplayDate(dateText))}</h4>
            </div>

            <div class="daily-status-group">
              <label class="field daily-status-field">
                <span>Day status</span>
                <select id="daily-log-day-status" data-editor-initial-focus="true">
                  ${renderOptions(dayStatuses, dayStatus)}
                </select>
              </label>
            </div>

            <fieldset class="journal-fieldset time-entry-fieldset">
              <legend>Time fields</legend>
              <div class="time-entry-grid">
                <label class="field time-field${timePanelClass}">
                  <span>Time in</span>
                  <input type="time" id="daily-log-time-in" aria-describedby="daily-rendered-time-help" value="${escapeHtml(dailyLog?.timeIn || "")}" ${timeFieldState}>
                </label>
                <label class="field time-field${timePanelClass}">
                  <span>Time out</span>
                  <input type="time" id="daily-log-time-out" aria-describedby="daily-rendered-time-help" value="${escapeHtml(dailyLog?.timeOut || "")}" ${timeFieldState}>
                </label>
                <label class="field time-field${timePanelClass}">
                  <span>Break minutes</span>
                  <input type="number" id="daily-log-break-minutes" aria-describedby="daily-rendered-time-help" min="0" step="1" inputmode="numeric" placeholder="0" value="${dailyLog?.breakMinutes ? dailyLog.breakMinutes : ""}" ${timeFieldState}>
                </label>
              </div>
              ${renderRenderedTimePanel(dailyLog, tasks)}
            </fieldset>
          </form>

        <section class="editor-section daily-tasks-section" aria-labelledby="daily-tasks-title">
          <div class="journal-col-header daily-tasks-header">
            <div class="daily-tasks-heading-row">
              <div>
                <span class="card-label">Work completed</span>
                <h4 id="daily-tasks-title">Daily Tasks</h4>
              </div>
              <button class="secondary-button task-add-button" type="button" id="daily-task-add-button" data-task-action="add" ${tasksEnabled ? "" : "disabled"}>Add Task</button>
            </div>
            <p class="phase-note">${tasksEnabled ? "Add what you accomplished today - these become journal bullets." : "Save the day record first, then add task items here."}</p>
          </div>

          <div class="task-list-display" id="daily-task-list">
            ${tasksEnabled ? renderTaskBullets(tasks) : '<p class="empty-state">Task items appear here after you save the day record.</p>'}
          </div>
          <p class="form-message" id="daily-task-list-message" aria-live="polite" hidden></p>
        </section>

        ${renderPhotoSection(dailyLog)}

        <section class="editor-section daily-remarks-section" aria-labelledby="daily-remarks-title">
          <div class="journal-col-header">
            <span class="card-label">Optional notes</span>
            <h4 id="daily-remarks-title">Day Remarks</h4>
          </div>
          <label class="field field-wide">
            <span>Remarks for this day</span>
            <textarea id="daily-log-day-remarks" form="daily-log-form" rows="2" placeholder="Optional reason or notes">${escapeHtml(dailyLog?.dayRemarks || "")}</textarea>
          </label>
        </section>

        <div class="editor-final-actions">
          <div class="form-actions day-record-actions">
            <button class="primary-button" type="submit" form="daily-log-form" id="save-daily-log-button">Save day record</button>
            <p class="form-message${saveFeedbackClass}" id="daily-log-form-message" ${saveFeedbackHidden}>${saveFeedbackMessage}</p>
          </div>
          ${deleteButton}
        </div>
      </div>
    `;
  }
  function getDayRecordToggleId(dateText) {
    return `daily-record-toggle-${dateText}`;
  }

  function getDayRecordPanelId(dateText) {
    return `daily-record-panel-${dateText}`;
  }

  function getWeekdayBadgeLabel(dateText) {
    return parseDate(dateText).toLocaleDateString(undefined, { weekday: "short" }).replace(".", "").slice(0, 3).toUpperCase();
  }

  function renderReadOnlyTaskList(tasks) {
    if (tasks.length === 0) {
      return '<p class="daily-record-empty-message">No tasks recorded for this day.</p>';
    }

    return `
      <ul class="daily-record-task-list">
        ${tasks.map((task) => `
          <li>
            <span>${escapeHtml(task.description)}</span>
            <span class="daily-record-task-status">${escapeHtml(task.status || "Pending")}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function getDayRecordMessage(dailyLog) {
    if (!dailyLog) {
      return "No daily log has been created for this day.";
    }

    const remarks = String(dailyLog.dayRemarks || "").trim();
    if (remarks) {
      return remarks;
    }

    const dayStatus = getDailyLogStatus(dailyLog);
    if (dayStatus === "Absent") {
      return "No work was recorded for this absent day.";
    }
    if (dayStatus === "No OJT / Rest Day") {
      return "No OJT work was scheduled for this day.";
    }
    return "";
  }

  function renderDayCard(week, dateText, dayNumber, dailyLog) {
    const tasks = dailyLog ? getTasksForDailyLog(dailyLog.id) : [];
    const photos = dailyLog ? getPhotosForDailyLog(dailyLog.id) : [];
    const dayStatus = dailyLog ? getDailyLogStatus(dailyLog) : "Not logged yet";
    const renderedText = dailyLog ? getRenderedTimeText(dailyLog) : "—";
    const taskText = tasks.length === 1 ? "1 task" : `${tasks.length} tasks`;
    const photoText = photos.length === 1 ? "1 photo" : `${photos.length} photos`;
    const metaItems = dailyLog ? [`${renderedText} rendered`, taskText, photoText] : [];
    const statusMarkup = dailyLog
      ? renderDayStatusBadge(dayStatus)
      : '<span class="day-status-badge is-empty">Not logged yet</span>';
    const actionText = dailyLog ? "Open / Edit full log" : "Create log";
    const isExpanded = state.expandedRecordDate === dateText;
    const toggleId = getDayRecordToggleId(dateText);
    const panelId = getDayRecordPanelId(dateText);
    const dateLabel = formatDisplayDate(dateText);
    const dayLabel = `Day ${dayNumber}`;
    const dayMessage = getDayRecordMessage(dailyLog);
    const tasksMarkup = dailyLog
      ? renderReadOnlyTaskList(tasks)
      : '<p class="daily-record-empty-message">Create a log to add task details.</p>';
    const attachmentsMarkup = isExpanded ? renderDailyRecordAttachments(photos, dayLabel) : "";

    return `
      <article class="daily-record-accordion${isExpanded ? " is-expanded" : ""}">
        <button
          class="daily-log-day-card daily-record-toggle"
          type="button"
          id="${escapeHtml(toggleId)}"
          data-day-action="toggle"
          data-date="${escapeHtml(dateText)}"
          aria-expanded="${isExpanded ? "true" : "false"}"
          aria-controls="${escapeHtml(panelId)}"
          aria-label="${escapeHtml(`${dayLabel}, ${dateLabel}. ${dayStatus}. ${isExpanded ? "Collapse" : "Expand"} daily record`)}"
        >
          <span class="daily-record-day-badge" aria-hidden="true">${escapeHtml(getWeekdayBadgeLabel(dateText))}</span>
          <span class="day-card-main">
            <strong>${escapeHtml(dateLabel)}</strong>
            <span class="day-card-label">${escapeHtml(dayLabel)}</span>
          </span>
          <span class="day-card-summary">
            ${statusMarkup}
            ${metaItems.length > 0 ? `<span class="day-card-meta">${metaItems.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</span>` : ""}
          </span>
          <span class="daily-record-chevron" aria-hidden="true"></span>
        </button>
        <div
          class="daily-record-panel"
          id="${escapeHtml(panelId)}"
          role="region"
          aria-labelledby="${escapeHtml(toggleId)}"
          ${isExpanded ? "" : "hidden"}
        >
          <div class="daily-record-content-grid">
            <div class="daily-record-key-tasks">
              <span class="daily-record-section-label">Key Tasks</span>
              ${tasksMarkup}
            </div>
            <div class="daily-record-attachments">
              <span class="daily-record-section-label">Attachments</span>
              ${attachmentsMarkup}
            </div>
          </div>
          ${dayMessage ? `<p class="daily-record-note">${escapeHtml(dayMessage)}</p>` : ""}
          <div class="daily-record-panel-actions">
            <button class="secondary-button daily-record-editor-action" type="button" data-day-action="open" data-date="${escapeHtml(dateText)}">${escapeHtml(actionText)}</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderDayEditorModal(week, dateText, dailyLog) {
    if (!dateText) {
      return "";
    }

    const dayLabel = getDayLabel(week, dateText);
    const titleId = `daily-log-editor-title-${dateText}`;
    const descriptionId = `daily-log-editor-description-${dateText}`;
    const statusMarkup = dailyLog
      ? renderDayStatusBadge(dailyLog.dayStatus)
      : '<span class="day-status-badge is-empty">Not logged yet</span>';

    return `
      <div class="daily-log-editor-overlay" data-editor-close="true">
        <section class="daily-log-editor-panel" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(titleId)}" aria-describedby="${escapeHtml(descriptionId)}">
          <div class="daily-log-editor-header">
            <div>
              <span class="card-label">Daily Log Editor</span>
              <h3 id="${escapeHtml(titleId)}">${escapeHtml(dayLabel)} - ${escapeHtml(formatDisplayDate(dateText))}</h3>
              <p class="sr-only" id="${escapeHtml(descriptionId)}">Edit the selected day’s status, time, tasks, and photo documentation.</p>
              ${statusMarkup}
            </div>
            <button class="secondary-button editor-close-button" type="button" id="daily-log-editor-close" data-editor-close="true">Close</button>
          </div>
          <div class="daily-log-editor-body">
            ${renderDayEditorBody(week, dateText, dailyLog)}
          </div>
        </section>
      </div>
    `;
  }
  function closeDailyLogEditor() {
    const closingDate = state.expandedDate;
    const returnFocusElement = state.returnFocusElement;
    let closeError = null;
    state.expandedDate = null;
    state.activeDailyLogId = null;
    state.returnFocusElement = null;
    state.taskEditorMode = "";
    state.taskEditorTaskId = "";
    state.taskEditorScrollTop = 0;
    state.dailyLogFeedback = null;
    state.taskEditorOriginFocusKey = "";

    try {
      renderJournalWeek();
    } catch (error) {
      closeError = error;
      console.error(error);
    } finally {
      const root = getEditorRoot();
      if (root) {
        root.innerHTML = "";
      }
      syncDailyLogEditorState();
    }

    window.requestAnimationFrame(() => {
      if (returnFocusElement?.isConnected && isVisibleFocusable(returnFocusElement)) {
        returnFocusElement.focus();
        return;
      }
      const dayButton = Array.from(document.querySelectorAll("button[data-day-action='open']"))
        .find((button) => button.dataset.date === closingDate);
      (dayButton || getElement("journal-log-today") || getElement("journal-week-select"))?.focus();
    });

    if (closeError) {
      throw closeError;
    }
  }

  function attachDailyLogKeydownListener() {
    if (dailyLogKeydownHandler) {
      return;
    }
    dailyLogKeydownHandler = handleDailyLogKeydown;
    document.addEventListener("keydown", dailyLogKeydownHandler);
  }

  function detachDailyLogKeydownListener() {
    if (!dailyLogKeydownHandler) {
      return;
    }
    document.removeEventListener("keydown", dailyLogKeydownHandler);
    dailyLogKeydownHandler = null;
  }

  function handleDailyLogKeydown(event) {
    if (!state.expandedDate) {
      return;
    }
    if (event.key === "Escape") {
      if (state.taskEditorMode) {
        event.preventDefault();
        closeTaskEditor();
        return;
      }
      event.preventDefault();
      closeDailyLogEditor();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const focusable = getEditorFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const panel = getEditorPanel();
    if (!panel?.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function syncDailyLogEditorState() {
    const isOpen = Boolean(state.expandedDate);
    const root = getEditorRoot();
    const appShell = document.querySelector(".app-shell");
    if (isOpen) {
      attachDailyLogKeydownListener();
    } else {
      detachDailyLogKeydownListener();
    }
    document.body.classList.toggle("daily-log-editor-open", isOpen);
    if (appShell) {
      appShell.inert = isOpen;
      appShell.toggleAttribute("inert", isOpen);
      appShell.setAttribute("aria-hidden", isOpen ? "true" : "false");
    }
    if (root) {
      root.hidden = !isOpen;
      root.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }
  }

  function renderJournalWeek(options = {}) {
    const container = getElement("journal-week-accordions");
    const root = getEditorRoot();
    const week = getSelectedWeek();
    const focusKey = state.expandedDate ? captureEditorFocusKey() : "";
    const fallbackKey = options.focusFallbackKey || "";

    if (!container) {
      revokeDailyRecordThumbnailUrls();
      revokeDailyLogEditorPhotoUrls();
      syncDailyLogEditorState();
      return;
    }

    container.innerHTML = "";
    revokeDailyRecordThumbnailUrls();
    revokeDailyLogEditorPhotoUrls();
    if (root) {
      root.innerHTML = "";
    }

    if (!week) {
      state.expandedRecordDate = null;
      state.expandedDate = null;
      state.activeDailyLogId = null;
      syncDailyLogEditorState();
      container.innerHTML = '<p class="empty-state">Choose a week above to see its days.</p>';
      return;
    }

    const dayCards = [];
    let currentDate = parseDate(week.inclusiveStartDate);
    const endDate = parseDate(week.inclusiveEndDate);
    let dayNumber = 1;
    while (currentDate <= endDate) {
      const dateText = formatDate(currentDate);
      const dailyLog = getDailyLogForDate(dateText);
      dayCards.push(renderDayCard(week, dateText, dayNumber, dailyLog));
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber += 1;
    }

    const activeDailyLog = state.expandedDate ? getDailyLogForDate(state.expandedDate) : null;
    state.activeDailyLogId = activeDailyLog?.id || null;
    container.innerHTML = `
      <div class="daily-log-day-list" aria-label="Daily log days">
        ${dayCards.join("")}
      </div>
    `;
    if (root && state.expandedDate) {
      root.innerHTML = renderDayEditorModal(week, state.expandedDate, activeDailyLog);
    }
    syncDailyLogEditorState();
    if (state.expandedDate && focusKey) {
      restoreEditorFocus(focusKey, fallbackKey);
    }
  }

  function toggleDayRecord(dateText) {
    if (!dateText) {
      return;
    }

    state.expandedRecordDate = state.expandedRecordDate === dateText ? null : dateText;
    renderJournalWeek();
    window.requestAnimationFrame(() => getElement(getDayRecordToggleId(dateText))?.focus());
  }

  function expandDay(dateText) {
    openDay(dateText);
  }

  function openDay(dateText) {
    if (!dateText) {
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement?.isConnected && activeElement.matches("button, a, input, select, textarea")) {
      state.returnFocusElement = activeElement;
    }
    window.OJTUI.clearFormMessages(getElement("journal-week-accordions"));
    state.dailyLogFeedback = null;
    state.expandedDate = dateText;
    const dailyLog = getDailyLogForDate(dateText);
    state.activeDailyLogId = dailyLog?.id || null;
    renderJournalWeek();
    focusEditorInitialControl();
  }
  function buildDailyLogRecord() {
    const existingLog = getActiveDailyLog() || getDailyLogForDate(getValue("daily-log-entry-date"));
    const timestamp = nowIso();
    const dayStatus = normalizeDayStatus(getValue("daily-log-day-status") || existingLog?.dayStatus);
    const worked = isWorkedStatus(dayStatus);
    const breakValue = getValue("daily-log-break-minutes");
    const breakMinutes = worked ? (breakValue === "" ? 0 : Number(breakValue)) : 0;
    const timeIn = worked ? getValue("daily-log-time-in") : "";
    const timeOut = worked ? getValue("daily-log-time-out") : "";
    const calculation = calculateRenderedTime(
      timeIn,
      timeOut,
      breakMinutes
    );

    return {
      id: getValue("daily-log-id") || existingLog?.id || createId("daily-log"),
      weekId: getValue("daily-log-form-week") || state.selectedWeekId,
      entryDate: getValue("daily-log-entry-date") || state.expandedDate,
      dayStatus,
      timeIn,
      timeOut,
      breakMinutes,
      renderedMinutes: worked && calculation.isComplete ? calculation.renderedMinutes : 0,
      renderedHours: worked && calculation.isComplete ? calculation.renderedHours : 0,
      dayRemarks: getValue("daily-log-day-remarks"),
      createdAt: existingLog?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function isValidTime(value) {
    return value === "" || window.OJTCalculations.isValidTime(value);
  }

  function validateDailyLog(dailyLog) {
    const selectedWeek = state.weeks.find((week) => week.id === dailyLog.weekId);

    if (!dailyLog.weekId || !selectedWeek) {
      return "Choose an OJT week before saving.";
    }

    if (!dailyLog.entryDate) {
      return "Please choose the entry date.";
    }

    if (dailyLog.entryDate < selectedWeek.inclusiveStartDate || dailyLog.entryDate > selectedWeek.inclusiveEndDate) {
      return "Entry date must fall within the selected week's date range.";
    }

    if (!dayStatuses.includes(dailyLog.dayStatus)) {
      return "Day status must be Worked, Absent, or No OJT / Rest Day.";
    }

    const duplicateLog = state.dailyLogs.find((log) => {
      return log.id !== dailyLog.id && log.weekId === dailyLog.weekId && log.entryDate === dailyLog.entryDate;
    });

    if (duplicateLog) {
      return "A daily log already exists for this date.";
    }

    if (!isWorkedStatus(dailyLog.dayStatus)) {
      return "";
    }

    if (!dailyLog.timeIn || !dailyLog.timeOut) {
      return "Time in and time out are required on worked days.";
    }

    if (!isValidTime(dailyLog.timeIn) || !isValidTime(dailyLog.timeOut)) {
      return "Time in and time out should use a valid HH:mm time when entered.";
    }

    if (Number.isNaN(dailyLog.breakMinutes) || dailyLog.breakMinutes < 0) {
      return "Break minutes must be zero or a positive number.";
    }

    const calculation = calculateRenderedTime(dailyLog.timeIn, dailyLog.timeOut, dailyLog.breakMinutes);

    if (calculation.error) {
      return calculation.error;
    }

    if (calculation.isComplete && calculation.renderedMinutes < 0) {
      return "Rendered minutes must not be negative.";
    }

    return "";
  }

  function updateRenderedPreview() {
    const previewElement = getElement("daily-rendered-time-preview");
    const helpElement = getElement("daily-rendered-time-help");

    if (!previewElement || !helpElement) {
      return;
    }

    const dayStatus = normalizeDayStatus(getValue("daily-log-day-status"));

    if (!isWorkedStatus(dayStatus)) {
      previewElement.textContent = formatRenderedTime(0);
      helpElement.textContent = "Absent and rest days count as 0 rendered hours.";
      return;
    }

    const breakValue = getValue("daily-log-break-minutes");
    const calculation = calculateRenderedTime(
      getValue("daily-log-time-in"),
      getValue("daily-log-time-out"),
      breakValue === "" ? 0 : Number(breakValue)
    );

    previewElement.textContent = calculation.isComplete
      ? formatRenderedTime(calculation.renderedMinutes)
      : "Not calculated";
    helpElement.textContent = calculation.error || "Enter time in, time out, and break minutes to calculate rendered hours.";
  }

  function updateDayStatusControls() {
    const dayStatus = normalizeDayStatus(getValue("daily-log-day-status"));
    const worked = isWorkedStatus(dayStatus);

    ["daily-log-time-in", "daily-log-time-out", "daily-log-break-minutes"].forEach((id) => {
      const input = getElement(id);
      const field = input?.closest(".time-field");

      if (input) {
        input.disabled = !worked;
      }

      if (field) {
        field.classList.toggle("is-muted", !worked);
      }
    });

    updateRenderedPreview();
  }

  function buildTaskRecord() {
    const selectedLog = getActiveDailyLog();
    const taskId = getValue("daily-task-id");
    const currentTask = state.dailyTasks.find((task) => task.id === taskId) || null;
    const timestamp = nowIso();
    const timeSpentValue = getValue("daily-task-time-spent");
    const existingTasks = getTasksForDailyLog(selectedLog?.id || "");
    const nextSortOrder = existingTasks.length === 0 ? 1 : Math.max(...existingTasks.map((task) => task.sortOrder || 0)) + 1;

    return {
      id: currentTask?.id || createId("daily-task"),
      dailyLogId: selectedLog?.id || "",
      description: getValue("daily-task-description"),
      timeSpentMinutes: timeSpentValue === "" ? 0 : Number(timeSpentValue),
      status: getValue("daily-task-status") || "Pending",
      notes: getValue("daily-task-notes"),
      sortOrder: currentTask?.sortOrder || nextSortOrder,
      createdAt: currentTask?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function getTaskDurationValues() {
    const hoursValue = getValue("daily-task-time-hours");
    const minutesValue = getValue("daily-task-time-minutes");

    return {
      hoursValue,
      minutesValue,
      hasValue: hoursValue !== "" || minutesValue !== "",
      hours: hoursValue === "" ? 0 : Number(hoursValue),
      minutes: minutesValue === "" ? 0 : Number(minutesValue)
    };
  }

  function validateTaskDuration(duration) {
    if (duration.hoursValue !== "" && (!/^\d+$/.test(duration.hoursValue) || !Number.isInteger(duration.hours) || duration.hours < 0)) {
      return "Task duration hours must be a non-negative whole number.";
    }

    if (duration.minutesValue !== "" && (!/^\d+$/.test(duration.minutesValue) || !Number.isInteger(duration.minutes) || duration.minutes < 0 || duration.minutes > 59)) {
      return "Task duration minutes must be a whole number from 0 through 59.";
    }

    return "";
  }

  function syncTaskDurationTotal(duration = getTaskDurationValues()) {
    const totalMinutes = duration.hours * 60 + duration.minutes;
    setValue("daily-task-time-spent", duration.hasValue && totalMinutes > 0 ? totalMinutes : "");
  }

  function setTaskDurationControls(totalMinutes) {
    const normalizedMinutes = Number(totalMinutes);

    if (!Number.isFinite(normalizedMinutes) || normalizedMinutes <= 0) {
      setValue("daily-task-time-hours", "");
      setValue("daily-task-time-minutes", "");
      setValue("daily-task-time-spent", "");
      return;
    }

    const wholeMinutes = Math.floor(normalizedMinutes);
    setValue("daily-task-time-hours", Math.floor(wholeMinutes / 60));
    setValue("daily-task-time-minutes", wholeMinutes % 60);
    setValue("daily-task-time-spent", wholeMinutes);
  }

  function validateTask(task) {
    if (!task.dailyLogId) {
      return "Save the day record before adding tasks.";
    }

    if (!task.description) {
      return "Enter a task or work item description.";
    }

    if (!taskStatuses.includes(task.status)) {
      return "Task status must be Pending, In Progress, or Completed.";
    }

    if (Number.isNaN(task.timeSpentMinutes) || task.timeSpentMinutes < 0) {
      return "Task time spent must be zero or a positive number.";
    }

    return "";
  }

  function resetTaskFormFields() {
    setValue("daily-task-id", "");
    setValue("daily-task-description", "");
    setTaskDurationControls(0);
    setValue("daily-task-status", "Pending");
    setValue("daily-task-notes", "");
    setText("daily-task-form-title", "Add Task");
    const saveButton = getElement("save-daily-task-button");
    if (saveButton) {
      saveButton.textContent = "Save Task";
    }
    const cancelButton = getElement("cancel-daily-task-edit-button");
    if (cancelButton) {
      cancelButton.hidden = !state.taskEditorMode;
    }
    window.OJTUI.clearFormMessage(getElement("daily-task-form-message"));
  }

  function refreshTaskListInEditor() {
    const dailyLog = getActiveDailyLog();
    const list = getElement("daily-task-list");
    if (!dailyLog || !list) {
      return;
    }

    list.innerHTML = renderTaskBullets(getTasksForDailyLog(dailyLog.id));
  }

  function openTaskEditor(task, originButton) {
    const editorBody = getEditorPanel()?.querySelector(".daily-log-editor-body");
    const mainEditor = editorBody?.querySelector(".daily-log-editor-flow");
    if (!editorBody || !mainEditor || !getActiveDailyLog()) {
      return;
    }

    state.taskEditorMode = task ? "edit" : "add";
    state.taskEditorTaskId = task?.id || "";
    state.taskEditorScrollTop = editorBody.scrollTop;
    state.taskEditorOriginFocusKey = getEditorFocusKey(originButton) || "id:daily-task-add-button";

    editorBody.querySelector("#daily-task-editor-view")?.remove();
    mainEditor.hidden = true;
    mainEditor.inert = true;
    mainEditor.setAttribute("inert", "");
    editorBody.insertAdjacentHTML("beforeend", renderTaskEditorSubview());
    editorBody.scrollTop = 0;

    if (task) {
      startEditTask(task);
    } else {
      resetTaskFormFields();
    }

    window.requestAnimationFrame(() => getElement("daily-task-description")?.focus());
  }

  function closeTaskEditor(options = {}) {
    if (!state.taskEditorMode) {
      return;
    }

    const editorBody = getEditorPanel()?.querySelector(".daily-log-editor-body");
    const mainEditor = editorBody?.querySelector(".daily-log-editor-flow");
    const scrollTop = state.taskEditorScrollTop;
    const focusKey = options.focusKey || state.taskEditorOriginFocusKey || "id:daily-task-add-button";

    editorBody?.querySelector("#daily-task-editor-view")?.remove();
    if (mainEditor) {
      mainEditor.hidden = false;
      mainEditor.inert = false;
      mainEditor.removeAttribute("inert");
    }

    state.taskEditorMode = "";
    state.taskEditorTaskId = "";
    state.taskEditorScrollTop = 0;
    state.taskEditorOriginFocusKey = "";

    if (options.refreshTasks) {
      refreshTaskListInEditor();
    }
    if (options.message) {
      window.OJTUI.showFormMessage(getElement("daily-task-list-message"), options.message, "success");
    }

    if (editorBody) {
      editorBody.scrollTop = scrollTop;
    }
    window.requestAnimationFrame(() => {
      if (editorBody) {
        editorBody.scrollTop = scrollTop;
      }
      const target = findEditorFocusTarget(focusKey) || getElement("daily-task-add-button");
      if (isVisibleFocusable(target)) {
        target.focus();
      }
    });
  }

  function getDailyLogInvalidFieldIds(message) {
    if (/Day status|week|entry date|already exists/i.test(message)) {
      return ["daily-log-day-status"];
    }
    if (/Break minutes/i.test(message)) {
      return ["daily-log-break-minutes"];
    }
    if (/Rendered minutes/i.test(message)) {
      return ["daily-log-time-in", "daily-log-time-out"];
    }
    if (/Time in|time out|HH:mm|calculation|negative/i.test(message)) {
      return ["daily-log-time-in", "daily-log-time-out"];
    }
    return ["daily-log-day-status"];
  }
  async function saveDailyLog(event) {
    event.preventDefault();
    const form = event.target;
    const messageElement = getElement("daily-log-form-message");
    window.OJTUI.clearFieldValidation(form);
    state.dailyLogFeedback = null;
    window.OJTUI.clearFormMessage(messageElement);

    const dailyLog = buildDailyLogRecord();
    const validationMessage = validateDailyLog(dailyLog);
    if (validationMessage) {
      showValidationError(form, validationMessage, getDailyLogInvalidFieldIds(validationMessage));
      return;
    }

    try {
      const savedLog = await window.OJTStorage.saveDailyLog(dailyLog);
      state.dailyLogs = state.dailyLogs.filter((log) => log.id !== savedLog.id).concat(savedLog);
      state.activeDailyLogId = savedLog.id;
      state.dailyLogFeedback = {
        message: savedLog.renderedMinutes !== null &&
          savedLog.renderedMinutes !== undefined &&
          Number.isFinite(Number(savedLog.renderedMinutes))
          ? `Day saved - ${formatRenderedTime(savedLog.renderedMinutes)} rendered.`
          : "Day saved. Add time in and time out to calculate rendered hours.",
        type: "success"
      };
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
      notifyJournalDataChange();
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not save daily log. Try again.", "error");
      console.error(error);
    }
  }
  async function deleteDailyLog(dailyLog) {
    const confirmed = window.confirm(`Delete the log for ${dailyLog.entryDate}? Tasks and photos for this day will also be removed.`);

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteDailyLog(dailyLog.id);
      state.dailyLogs = state.dailyLogs.filter((log) => log.id !== dailyLog.id);
      state.dailyTasks = state.dailyTasks.filter((task) => task.dailyLogId !== dailyLog.id);
      state.photoAttachments = state.photoAttachments.filter((photo) => photo.dailyLogId !== dailyLog.id);
      const returnFocusElement = state.returnFocusElement;
      const closingDate = state.expandedDate;
      state.expandedDate = null;
      state.activeDailyLogId = null;
      state.returnFocusElement = null;
      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("journal-message"), "Day log deleted.", "success");
      window.requestAnimationFrame(() => {
        if (returnFocusElement?.isConnected && isVisibleFocusable(returnFocusElement)) {
          returnFocusElement.focus();
          return;
        }
        const dayButton = Array.from(document.querySelectorAll("button[data-day-action='open']"))
          .find((button) => button.dataset.date === closingDate);
        (dayButton || getElement("journal-log-today") || getElement("journal-week-select"))?.focus();
      });
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("journal-message"), "Could not delete daily log. Try again.", "error");
      console.error(error);
    }
  }

  async function saveTask(event) {
    event.preventDefault();
    const form = event.target;
    const messageElement = getElement("daily-task-form-message");
    window.OJTUI.clearFieldValidation(form);
    window.OJTUI.clearFormMessage(messageElement);

    const duration = getTaskDurationValues();
    const durationValidationMessage = validateTaskDuration(duration);
    if (durationValidationMessage) {
      const invalidFieldId = /hours/i.test(durationValidationMessage) ? "daily-task-time-hours" : "daily-task-time-minutes";
      showValidationError(form, durationValidationMessage, [invalidFieldId]);
      return;
    }

    syncTaskDurationTotal(duration);
    const task = buildTaskRecord();
    const validationMessage = validateTask(task);
    if (validationMessage) {
      showValidationError(form, validationMessage, ["daily-task-description"]);
      return;
    }

    try {
      const savedTask = await window.OJTStorage.saveDailyTask(task);
      state.dailyTasks = state.dailyTasks.filter((existingTask) => existingTask.id !== savedTask.id).concat(savedTask);
      updateWeekSummary();
      notifyJournalDataChange();
      closeTaskEditor({
        refreshTasks: true,
        message: "Task item saved.",
        focusKey: `task:${savedTask.id}:edit`
      });
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Task item could not be saved. Please try again.", "error");
      console.error(error);
    }
  }
  function startEditTask(task) {
    setValue("daily-task-id", task.id);
    setValue("daily-task-description", task.description);
    setTaskDurationControls(task.timeSpentMinutes);
    setValue("daily-task-status", task.status);
    setValue("daily-task-notes", task.notes);
    setText("daily-task-form-title", "Edit Task");
    setText("save-daily-task-button", "Save Task Changes");
    getElement("cancel-daily-task-edit-button").hidden = false;
    window.OJTUI.clearFormMessage(getElement("daily-task-form-message"));
  }

  async function deleteTask(task) {
    const confirmed = window.confirm("Delete this task item? The day log will stay saved.");

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deleteDailyTask(task.id);
      state.dailyTasks = state.dailyTasks.filter((savedTask) => savedTask.id !== task.id);
      resetTaskFormFields();
      renderJournalWeek();
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("daily-task-list-message"), "Task item deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("daily-task-list-message"), "Task item could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  function updatePhotoSelectionCount() {
    const fileInput = getElement("photo-upload-file");
    const countElement = getElement("photo-upload-selection");
    const count = fileInput?.files?.length || 0;
    if (countElement) {
      countElement.textContent = count === 0 ? "No photos selected." : `${count} ${count === 1 ? "photo" : "photos"} selected.`;
    }
  }

  async function savePhotoAttachment(event) {
    event.preventDefault();
    const form = event.target;
    const messageElement = getElement("photo-upload-message");
    const selectedLog = getActiveDailyLog();
    const fileInput = getElement("photo-upload-file");
    const files = Array.from(fileInput?.files || []);
    const caption = getValue("photo-upload-caption");
    const photoCategory = normalizePhotoCategory(getValue("photo-upload-category"));


    window.OJTUI.clearFieldValidation(form);
    window.OJTUI.clearFormMessage(messageElement);

    if (!selectedLog) {
      showValidationError(form, "Save the day record before attaching photos.", ["photo-upload-file"]);
      return;
    }

    if (files.length === 0) {
      showValidationError(form, "Choose at least one photo.", ["photo-upload-file"]);
      return;
    }

    for (const file of files) {
      const validationMessage = window.OJTPhotos.validatePhotoFile(file);
      if (validationMessage) {
        showValidationError(form, `${file.name}: ${validationMessage}`, ["photo-upload-file"]);
        return;
      }
    }

    try {
      const photoSetId = createId("photo-set");
      const attachments = files.map((file, index) => {
        return window.OJTPhotos.buildPhotoAttachment(file, selectedLog.id, caption, photoCategory, photoSetId, index);
      });
      const savedPhotos = await window.OJTStorage.savePhotoAttachments(attachments);
      state.photoAttachments = state.photoAttachments
        .filter((photo) => !savedPhotos.some((savedPhoto) => savedPhoto.id === photo.id))
        .concat(savedPhotos);
      form.reset();
      updatePhotoSelectionCount();
      renderJournalWeek();
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), `${files.length} ${files.length === 1 ? "photo" : "photos"} attached.`, "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not attach the selected photos. No photos were saved.", "error");
      console.error(error);
    }
  }

  async function savePhotoSetMetadata(form) {
    const photoSetId = form.dataset.photoSetId;
    const messageElement = form.querySelector(".form-message");
    const formData = new FormData(form);
    window.OJTUI.clearFormMessage(messageElement);

    try {
      const updatedPhotos = await window.OJTStorage.updatePhotoSetMetadata(photoSetId, {
        caption: formData.get("caption"),
        photoCategory: formData.get("photoCategory")
      });
      state.photoAttachments = state.photoAttachments
        .filter((photo) => !updatedPhotos.some((updatedPhoto) => updatedPhoto.id === photo.id))
        .concat(updatedPhotos);
      renderJournalWeek();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Shared photo details saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Shared photo details could not be saved. No changes were applied.", "error");
      console.error(error);
    }
  }

  async function savePhotoCaption(form) {
    const photo = state.photoAttachments.find((attachment) => attachment.id === form.dataset.photoId);
    const messageElement = form.querySelector(".form-message");
    const formData = new FormData(form);

    window.OJTUI.clearFormMessage(messageElement);

    if (!photo) {
      window.OJTUI.showFormMessage(messageElement, "Photo attachment could not be found. Please refresh and try again.", "error");
      return;
    }

    try {
      const savedPhoto = await window.OJTStorage.savePhotoAttachment({
        ...photo,
        photoCategory: normalizePhotoCategory(formData.get("photoCategory")),
        caption: String(formData.get("caption") ?? "").trim()
      });
      state.photoAttachments = state.photoAttachments.filter((attachment) => attachment.id !== savedPhoto.id).concat(savedPhoto);
      renderJournalWeek();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo details saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Photo details could not be saved. Please try again.", "error");
      console.error(error);
    }
  }
  function downloadPhoto(photo) {
    try {
      window.OJTPhotos.downloadPhotoAttachment(photo);
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Stored photo data is not available for download.", "error");
      console.error(error);
    }
  }

  function getPhotoDeleteFallbackKey(photo) {
    const photoSet = getPhotoSetsForDailyLog(photo.dailyLogId).find((set) => set.photos.some((item) => item.id === photo.id));
    if (photoSet) {
      const index = photoSet.photos.findIndex((item) => item.id === photo.id);
      const nextPhoto = photoSet.photos[index + 1];
      const previousPhoto = photoSet.photos[index - 1];
      if (nextPhoto) {
        return `photo:${nextPhoto.id}:delete`;
      }
      if (previousPhoto) {
        return `photo:${previousPhoto.id}:delete`;
      }
      if (photoSet.photoSetId) {
        return `photo-set:${photoSet.photoSetId}:save`;
      }
    }
    return "photo-upload:attach";
  }
  async function deletePhoto(photo) {
    const confirmed = window.confirm(`Delete ${photo.fileName || "this photo"}? The day log will stay saved.`);

    if (!confirmed) {
      return;
    }

    try {
      await window.OJTStorage.deletePhotoAttachment(photo.id);
      const focusFallbackKey = getPhotoDeleteFallbackKey(photo);
      state.photoAttachments = state.photoAttachments.filter((attachment) => attachment.id !== photo.id);
      renderJournalWeek({ focusFallbackKey });
      updateWeekSummary();
      notifyJournalDataChange();
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo attachment deleted.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(getElement("photo-upload-message"), "Photo attachment could not be deleted. Please try again.", "error");
      console.error(error);
    }
  }

  function handleJournalClick(event) {
    if (event.target.id === "cancel-daily-task-edit-button") {
      closeTaskEditor();
      return;
    }

    if (event.target.matches("[data-editor-close]") || event.target.closest("button[data-editor-close]")) {
      closeDailyLogEditor();
      return;
    }

    const dayButton = event.target.closest("button[data-day-action]");
    if (dayButton?.dataset.dayAction === "toggle") {
      toggleDayRecord(dayButton.dataset.date);
      return;
    }
    if (dayButton?.dataset.dayAction === "open") {
      openDay(dayButton.dataset.date);
      return;
    }

    const logButton = event.target.closest("button[data-log-action]");
    if (logButton?.dataset.logAction === "delete") {
      const dailyLog = state.dailyLogs.find((log) => log.id === logButton.dataset.logId);
      if (dailyLog) {
        deleteDailyLog(dailyLog);
      }
      return;
    }

    const photoUploadButton = event.target.closest("button[data-photo-upload-action]");
    if (photoUploadButton?.dataset.photoUploadAction === "choose") {
      const photoInput = getElement("photo-upload-file");
      if (photoInput) {
        photoInput.click();
      }
      return;
    }

    const photoButton = event.target.closest("button[data-photo-action]");
    if (photoButton) {
      const photo = state.photoAttachments.find((attachment) => attachment.id === photoButton.dataset.photoId);

      if (!photo) {
        return;
      }

      if (photoButton.dataset.photoAction === "download") {
        downloadPhoto(photo);
      }

      if (photoButton.dataset.photoAction === "delete") {
        deletePhoto(photo);
      }

      return;
    }

    const taskButton = event.target.closest("button[data-task-action]");
    if (!taskButton) {
      return;
    }

    if (taskButton.dataset.taskAction === "cancel-editor") {
      closeTaskEditor();
      return;
    }

    if (taskButton.dataset.taskAction === "add") {
      openTaskEditor(null, taskButton);
      return;
    }

    const task = state.dailyTasks.find((savedTask) => savedTask.id === taskButton.dataset.taskId);
    if (!task) {
      return;
    }

    if (taskButton.dataset.taskAction === "edit") {
      openTaskEditor(task, taskButton);
    }

    if (taskButton.dataset.taskAction === "delete") {
      deleteTask(task);
    }
  }

  async function loadDailyLogData() {
    try {
      const [weeks, dailyLogs, dailyTasks, photoAttachments] = await Promise.all([
        window.OJTStorage.getWeeks(),
        window.OJTStorage.getDailyLogs(),
        window.OJTStorage.getDailyTasks(),
        window.OJTStorage.getPhotoAttachments()
      ]);

      state.weeks = weeks;
      state.dailyLogs = dailyLogs;
      state.dailyTasks = dailyTasks;
      state.photoAttachments = photoAttachments;

      const previousSelectedWeekId = state.selectedWeekId;
      state.selectedWeekId = window.OJTSelectedWeek?.initialize(state.weeks) || "";
      if (previousSelectedWeekId && previousSelectedWeekId !== state.selectedWeekId) {
        state.expandedRecordDate = null;
      }

      renderJournalWeek();
      updateWeekSummary();
      window.OJTUI.updateDailyLogsSummary(state.dailyLogs);
    } catch (error) {
      const container = getElement("journal-week-accordions");
      if (container) {
        container.innerHTML = '<p class="empty-state">Could not load daily logs. Refresh and try again.</p>';
      }
      console.error(error);
    }
  }

  function bindDailyLogEvents() {
    const roots = [getElement("journal-week-accordions"), getEditorRoot()].filter(Boolean);
    roots.forEach((root) => {
      root.addEventListener("click", handleJournalClick);
      root.addEventListener("error", (event) => {
        if (event.target.matches("[data-photo-preview]")) {
          const preview = event.target.closest(".photo-preview-frame");
          const unavailable = preview?.querySelector(".photo-preview-unavailable");
          event.target.remove();
          preview?.classList.add("is-unavailable");
          if (unavailable) {
            unavailable.hidden = false;
          }
          return;
        }

        if (!event.target.matches("[data-daily-record-thumbnail]")) {
          return;
        }

        const thumbnail = event.target.closest(".daily-record-thumbnail");
        const unavailable = thumbnail?.querySelector(".daily-record-thumbnail-unavailable");
        event.target.remove();
        thumbnail?.classList.add("is-unavailable");
        if (unavailable) {
          unavailable.hidden = false;
        }
      }, true);
      root.addEventListener("input", (event) => {
        const form = event.target.closest("form");
        if (form) {
          window.OJTUI.clearFieldValidation(form);
        }
        if (["daily-log-time-in", "daily-log-time-out", "daily-log-break-minutes"].includes(event.target.id)) {
          updateRenderedPreview();
        }
        if (["daily-task-time-hours", "daily-task-time-minutes"].includes(event.target.id)) {
          const duration = getTaskDurationValues();
          if (!validateTaskDuration(duration)) {
            syncTaskDurationTotal(duration);
          }
        }
      });
      root.addEventListener("change", (event) => {
        const form = event.target.closest("form");
        if (form) {
          window.OJTUI.clearFieldValidation(form);
        }
        if (event.target.id === "daily-log-day-status") {
          updateDayStatusControls();
        }
        if (event.target.id === "photo-upload-file") {
          updatePhotoSelectionCount();
        }
      });
      root.addEventListener("submit", (event) => {
        if (event.target.id === "daily-log-form") {
          saveDailyLog(event);
        }
        if (event.target.id === "daily-task-form") {
          saveTask(event);
        }
        if (event.target.id === "photo-upload-form") {
          savePhotoAttachment(event);
        }
        if (event.target.matches("[data-photo-set-form]")) {
          event.preventDefault();
          savePhotoSetMetadata(event.target);
        }
        if (event.target.matches("[data-photo-caption-form]")) {
          event.preventDefault();
          savePhotoCaption(event.target);
        }
      });
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    bindDailyLogEvents();
    loadDailyLogData();
  });

  document.addEventListener("ojt:selected-week-change", (event) => {
    const weekId = event.detail?.weekId || "";
    if (event.detail?.source === "weeks:delete" || (weekId && !state.weeks.some((week) => week.id === weekId))) {
      loadDailyLogData();
      return;
    }
    state.selectedWeekId = weekId;
    state.expandedRecordDate = null;
    state.expandedDate = null;
    state.activeDailyLogId = null;
    renderJournalWeek();
    updateWeekSummary();
  });


  document.addEventListener("ojt:weeks-data-change", loadDailyLogData);

  document.addEventListener("ojt:section-change", (event) => {
    if (event.detail?.sectionId === "journal") {
      loadDailyLogData();
      return;
    }

    state.expandedDate = null;
    state.activeDailyLogId = null;
    revokeDailyLogEditorPhotoUrls();
    if (getEditorRoot()) {
      getEditorRoot().innerHTML = "";
    }
    syncDailyLogEditorState();
  });

  document.addEventListener("ojt:open-daily-log", async (event) => {
    const detail = event.detail || {};
    await loadDailyLogData();

    if (detail.weekId) {
      selectWeek(detail.weekId);
      }

    if (detail.entryDate) {
      openDay(detail.entryDate);
    } else {
      renderJournalWeek();
      updateWeekSummary();
    }
  });
})();
