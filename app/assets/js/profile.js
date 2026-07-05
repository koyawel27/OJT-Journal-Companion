(function () {
  const defaultSettings = {
    preferredWeekStartDay: "Monday",
    timeFormat: "24-hour"
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
    return {
      preferredWeekStartDay: getValue("preferred-week-start-day") || defaultSettings.preferredWeekStartDay,
      timeFormat: getValue("time-format") || defaultSettings.timeFormat,
      ...buildTimestampFields(state.appSettings)
    };
  }

  function validateStudentProfile(profile) {
    if (!profile.studentName) {
      return "Please enter the student name before saving.";
    }

    if (Number.isNaN(profile.requiredOjtHours) || profile.requiredOjtHours < 0) {
      return "Required OJT hours must be zero or a positive number.";
    }

    return "";
  }

  function validateCompanyProfile(profile) {
    if (!profile.companyName) {
      return "Please enter the company name before saving.";
    }

    return "";
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
    const activeSettings = settings || defaultSettings;
    setValue("preferred-week-start-day", activeSettings.preferredWeekStartDay);
    setValue("time-format", activeSettings.timeFormat);
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

      populateStudentForm(studentProfile);
      populateCompanyForm(companyProfile);
      populateSettingsForm(appSettings);
      window.OJTUI.updateDashboardSummary(studentProfile, companyProfile, appSettings);
    } catch (error) {
      const message = "Saved profile data could not be loaded. Please refresh and try again.";
      window.OJTUI.showFormMessage(document.getElementById("student-profile-message"), message, "error");
      console.error(error);
    }
  }

  async function saveStudentProfile(event) {
    event.preventDefault();
    const messageElement = document.getElementById("student-profile-message");
    window.OJTUI.clearFormMessage(messageElement);

    const profile = buildStudentProfile();
    const validationMessage = validateStudentProfile(profile);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      state.studentProfile = await window.OJTStorage.saveStudentProfile(profile);
      window.OJTUI.updateDashboardSummary(state.studentProfile, state.companyProfile, state.appSettings);
      window.OJTUI.showFormMessage(messageElement, "Student profile saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Student profile could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  async function saveCompanyProfile(event) {
    event.preventDefault();
    const messageElement = document.getElementById("company-profile-message");
    window.OJTUI.clearFormMessage(messageElement);

    const profile = buildCompanyProfile();
    const validationMessage = validateCompanyProfile(profile);

    if (validationMessage) {
      window.OJTUI.showFormMessage(messageElement, validationMessage, "error");
      return;
    }

    try {
      state.companyProfile = await window.OJTStorage.saveCompanyProfile(profile);
      window.OJTUI.updateDashboardSummary(state.studentProfile, state.companyProfile, state.appSettings);
      window.OJTUI.showFormMessage(messageElement, "Company profile saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Company profile could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  async function saveAppSettings(event) {
    event.preventDefault();
    const messageElement = document.getElementById("app-settings-message");
    window.OJTUI.clearFormMessage(messageElement);

    try {
      state.appSettings = await window.OJTStorage.saveAppSettings(buildAppSettings());
      window.OJTUI.updateDashboardSummary(state.studentProfile, state.companyProfile, state.appSettings);
      window.OJTUI.showFormMessage(messageElement, "Settings saved.", "success");
    } catch (error) {
      window.OJTUI.showFormMessage(messageElement, "Settings could not be saved. Please try again.", "error");
      console.error(error);
    }
  }

  function bindProfileForms() {
    document.getElementById("student-profile-form")?.addEventListener("submit", saveStudentProfile);
    document.getElementById("company-profile-form")?.addEventListener("submit", saveCompanyProfile);
    document.getElementById("app-settings-form")?.addEventListener("submit", saveAppSettings);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindProfileForms();
    loadProfileData();
  });
})();
