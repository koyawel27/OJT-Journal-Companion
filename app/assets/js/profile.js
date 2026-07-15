(function () {
  const defaultSettings = {
    preferredWeekStartDay: "Monday",
    timeFormat: "24-hour",
    appearanceMode: "system"
  };

  const state = {
    studentProfile: null,
    companyProfile: null,
    appSettings: null
  };

  function getValue(id) {
    return document.getElementById(id)?.value.trim() || "";
  }

  function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value ?? "";
    }
  }

  function getSelectedAppearanceMode() {
    const selected = document.querySelector('input[name="appearance-mode"]:checked');
    return window.OJTAppearance.normalizeAppearanceMode(selected?.value);
  }

  function setSelectedAppearanceMode(value) {
    const normalizedMode = window.OJTAppearance.normalizeAppearanceMode(value);
    document.querySelectorAll('input[name="appearance-mode"]').forEach((radio) => {
      radio.checked = radio.value === normalizedMode;
    });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function buildTimestampFields(existingRecord) {
    const timestamp = nowIso();
    return {
      createdAt: existingRecord?.createdAt || timestamp,
      updatedAt: timestamp
    };
  }

  function buildStudentProfile() {
    const requiredHoursValue = getValue("required-ojt-hours");
    const requiredOjtHours = requiredHoursValue === "" ? 0 : Number(requiredHoursValue);

    return {
      studentName: getValue("student-name"),
      courseOrProgram: getValue("course-or-program"),
      schoolOrInstitution: getValue("school-or-institution"),
      sectionOrYearLevel: getValue("section-or-year-level"),
      requiredOjtHours,
      ...buildTimestampFields(state.studentProfile)
    };
  }

  function buildCompanyProfile() {
    return {
      companyName: getValue("company-name"),
      companyAddress: getValue("company-address"),
      departmentOrAssignedArea: getValue("department-or-assigned-area"),
      supervisorName: getValue("supervisor-name"),
      supervisorContact: getValue("supervisor-contact"),
      ...buildTimestampFields(state.companyProfile)
    };
  }

  function buildAppSettings() {
    const record = {
      preferredWeekStartDay: getValue("preferred-week-start-day") || defaultSettings.preferredWeekStartDay,
      timeFormat: getValue("time-format") || defaultSettings.timeFormat,
      appearanceMode: getSelectedAppearanceMode(),
      ...buildTimestampFields(state.appSettings)
    };
    if (state.appSettings && state.appSettings.lastBackupDate) {
      record.lastBackupDate = state.appSettings.lastBackupDate;
    }
    return record;
  }

  function validateStudentProfile(profile) {
    if (!profile.studentName) {
      return "Enter your student name before saving.";
    }

    if (Number.isNaN(profile.requiredOjtHours) || profile.requiredOjtHours < 0) {
      return "Required OJT hours must be zero or higher.";
    }

    return "";
  }

  function validateCompanyProfile(profile) {
    if (!profile.companyName) {
      return "Enter your company name before saving.";
    }

    return "";
  }

  function showValidationError(fieldId, messageElement, message) {
    const field = document.getElementById(fieldId);
    window.OJTUI.showFormMessage(messageElement, message, "error");

    if (!field) {
      return;
    }

    const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    if (messageElement?.id) {
      describedBy.add(messageElement.id);
    }
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
    field.focus();
  }

  function populateStudentForm(profile) {
    if (!profile) {
      return;
    }

    setValue("student-name", profile.studentName);
    setValue("course-or-program", profile.courseOrProgram);
    setValue("school-or-institution", profile.schoolOrInstitution);
    setValue("section-or-year-level", profile.sectionOrYearLevel);
    setValue("required-ojt-hours", profile.requiredOjtHours);
  }

  function populateCompanyForm(profile) {
    if (!profile) {
      return;
    }

    setValue("company-name", profile.companyName);
    setValue("company-address", profile.companyAddress);
    setValue("department-or-assigned-area", profile.departmentOrAssignedArea);
    setValue("supervisor-name", profile.supervisorName);
    setValue("supervisor-contact", profile.supervisorContact);
  }

  function populateSettingsForm(settings) {
    const activeSettings = {
      ...defaultSettings,
      ...settings
    };
    setValue("preferred-week-start-day", activeSettings.preferredWeekStartDay);
    setValue("time-format", activeSettings.timeFormat);
    if (!window.OJTAppearance.hasActivePreview()) {
      setSelectedAppearanceMode(activeSettings.appearanceMode);
    }
  }

  async function loadProfileData() {
    try {
      const [studentProfile, companyProfile, appSettings] = await Promise.all([
        window.OJTStorage.getStudentProfile(),
        window.OJTStorage.getCompanyProfile(),
        window.OJTStorage.getAppSettings()
      ]);

      state.studentProfile = studentProfile;
      state.companyProfile = companyProfile;
      state.appSettings = appSettings;

      const appearanceMode = window.OJTAppearance.applyAuthoritativeMode(appSettings?.appearanceMode);
      populateStudentForm(studentProfile);
      populateCompanyForm(companyProfile);
      populateSettingsForm({ ...appSettings, appearanceMode });
      window.OJTUI.updateDashboardSummary(studentProfile, companyProfile, appSettings);
    } catch (error) {
      const message = "Could not load Settings data. Refresh and try again.";
      window.OJTUI.showFormMessage(document.getElementById("student-profile-message"), message, "error");
      console.error(error);
    }
  }

  async function saveStudentProfile(event) {
    event.preventDefault();
    const messageElement = document.getElementById("student-profile-message");
    window.OJTUI.clearFormMessage(messageElement);
    window.OJTUI.clearFieldValidation(event.currentTarget);

    const profile = buildStudentProfile();
    const validationMessage = validateStudentProfile(profile);

    if (validationMessage) {
      const fieldId = !profile.studentName
        ? "student-name"
        : "required-ojt-hours";
      showValidationError(fieldId, messageElement, validationMessage);
      return;
    }

    try {
      state.studentProfile = await window.OJTStorage.saveStudentProfile(profile);
      window.OJTUI.updateDashboardSummary(state.studentProfile, state.companyProfile, state.appSettings);
      window.OJTUI.showFormMessage(messageElement, "Student profile saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not save student profile. Try again.", "error");
      console.error(error);
    }
  }

  async function saveCompanyProfile(event) {
    event.preventDefault();
    const messageElement = document.getElementById("company-profile-message");
    window.OJTUI.clearFormMessage(messageElement);
    window.OJTUI.clearFieldValidation(event.currentTarget);

    const profile = buildCompanyProfile();
    const validationMessage = validateCompanyProfile(profile);

    if (validationMessage) {
      showValidationError("company-name", messageElement, validationMessage);
      return;
    }

    try {
      state.companyProfile = await window.OJTStorage.saveCompanyProfile(profile);
      window.OJTUI.updateDashboardSummary(state.studentProfile, state.companyProfile, state.appSettings);
      window.OJTUI.showFormMessage(messageElement, "Company profile saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Could not save company profile. Try again.", "error");
      console.error(error);
    }
  }

  async function saveAppSettings(event) {
    event.preventDefault();
    const messageElement = document.getElementById("app-settings-message");
    window.OJTUI.clearFormMessage(messageElement);

    try {
      state.appSettings = await window.OJTStorage.saveAppSettings(buildAppSettings());
      window.OJTAppearance.commitMode(state.appSettings.appearanceMode);
      window.OJTUI.updateDashboardSummary(state.studentProfile, state.companyProfile, state.appSettings);
      window.OJTUI.showFormMessage(messageElement, "Settings saved.", "success");
    } catch (error) {
      const persistedMode = window.OJTAppearance.restorePersistedMode();
      setSelectedAppearanceMode(persistedMode);
      window.OJTUI.showFormMessage(messageElement, "Could not save settings. Try again.", "error");
      document.querySelector('input[name="appearance-mode"]:checked')?.focus();
      console.error(error);
    }
  }

  function bindProfileForms() {
    document.getElementById("student-profile-form")?.addEventListener("submit", saveStudentProfile);
    document.getElementById("company-profile-form")?.addEventListener("submit", saveCompanyProfile);
    const settingsForm = document.getElementById("app-settings-form");
    settingsForm?.addEventListener("submit", saveAppSettings);
    settingsForm?.addEventListener("change", (event) => {
      if (event.target.matches('input[name="appearance-mode"]')) {
        window.OJTAppearance.applyPreviewMode(event.target.value);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindProfileForms();
    loadProfileData();
  });

  document.addEventListener("ojt:backup-exported", (event) => {
    if (event.detail && event.detail.settings) {
      state.appSettings = event.detail.settings;
    }
  });
})();
