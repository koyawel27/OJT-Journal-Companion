const appearanceController = (() => {
  const cacheKey = "ojt-journal-companion:appearance-mode";
  const allowedModes = new Set(["system", "dark", "light"]);
  const root = document.documentElement;
  let authoritativeMode = "system";
  let currentMode = normalizeAppearanceMode(root.dataset.appearance);
  let previewActive = false;
  let mediaQuery = null;
  let mediaListenerBound = false;

  function normalizeAppearanceMode(value) {
    return typeof value === "string" && allowedModes.has(value) ? value : "system";
  }

  function getSystemMediaQuery() {
    if (mediaQuery || typeof window.matchMedia !== "function") {
      return mediaQuery;
    }

    try {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      mediaQuery = null;
    }
    return mediaQuery;
  }

  function resolveEffectiveTheme(mode) {
    const normalizedMode = normalizeAppearanceMode(mode);
    if (normalizedMode !== "system") {
      return normalizedMode;
    }

    const query = getSystemMediaQuery();
    return query ? (query.matches ? "dark" : "light") : "dark";
  }

  function applyRootMode(mode) {
    currentMode = normalizeAppearanceMode(mode);
    root.dataset.appearance = currentMode;
    root.dataset.theme = resolveEffectiveTheme(currentMode);
    return currentMode;
  }

  function reconcileCache(mode) {
    const normalizedMode = normalizeAppearanceMode(mode);
    try {
      if (normalizedMode === "system") {
        window.localStorage.removeItem(cacheKey);
      } else {
        window.localStorage.setItem(cacheKey, normalizedMode);
      }
    } catch {
      // The cache is optional; IndexedDB remains authoritative.
    }
  }

  function applyPreviewMode(mode) {
    previewActive = true;
    return applyRootMode(mode);
  }

  function applyAuthoritativeMode(mode) {
    authoritativeMode = normalizeAppearanceMode(mode);
    reconcileCache(authoritativeMode);
    if (!previewActive) {
      applyRootMode(authoritativeMode);
    }
    return authoritativeMode;
  }

  function commitMode(mode) {
    authoritativeMode = normalizeAppearanceMode(mode);
    previewActive = false;
    applyRootMode(authoritativeMode);
    reconcileCache(authoritativeMode);
    return authoritativeMode;
  }

  function restorePersistedMode() {
    previewActive = false;
    applyRootMode(authoritativeMode);
    reconcileCache(authoritativeMode);
    return authoritativeMode;
  }

  function resetToSystem() {
    authoritativeMode = "system";
    previewActive = false;
    applyRootMode("system");
    reconcileCache("system");
  }

  function handleSystemAppearanceChange() {
    if (currentMode === "system") {
      applyRootMode("system");
    }
  }

  function bindSystemListener() {
    const query = getSystemMediaQuery();
    if (!query || mediaListenerBound) {
      return;
    }

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleSystemAppearanceChange);
    } else if (typeof query.addListener === "function") {
      query.addListener(handleSystemAppearanceChange);
    } else {
      return;
    }
    mediaListenerBound = true;
  }

  function unbindSystemListener() {
    if (!mediaQuery || !mediaListenerBound) {
      return;
    }

    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", handleSystemAppearanceChange);
    } else if (typeof mediaQuery.removeListener === "function") {
      mediaQuery.removeListener(handleSystemAppearanceChange);
    }
    mediaListenerBound = false;
  }

  bindSystemListener();
  applyRootMode(currentMode);
  window.addEventListener("pagehide", unbindSystemListener, { once: true });

  return {
    cacheKey,
    normalizeAppearanceMode,
    applyPreviewMode,
    applyAuthoritativeMode,
    commitMode,
    restorePersistedMode,
    resetToSystem,
    getCurrentMode: () => currentMode,
    getAuthoritativeMode: () => authoritativeMode,
    hasActivePreview: () => previewActive
  };
})();

window.OJTAppearance = appearanceController;
const navButtons = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll(".app-section");
const settingsTabs = document.querySelectorAll("[data-settings-tab]");
const settingsPanels = document.querySelectorAll(".settings-panel");

function activateSettingsTab(target, options) {
  const settings = options || {};
  const tab = Array.from(settingsTabs).find((candidate) => candidate.dataset.settingsTab === target) || document.querySelector("[data-settings-tab=\"student\"]");
  const controlsId = tab?.getAttribute("aria-controls");

  settingsTabs.forEach((settingsTab) => {
    const isActive = settingsTab === tab;
    settingsTab.setAttribute("aria-selected", String(isActive));
    settingsTab.tabIndex = isActive ? 0 : -1;
  });

  settingsPanels.forEach((panel) => {
    panel.hidden = panel.id !== controlsId;
  });
  if (settings.focusTab) {
    tab?.focus();
  }
}

function showSection(sectionId) {
  sections.forEach((section) => {
    const isTarget = section.id === sectionId;
    section.hidden = !isTarget;
    section.classList.toggle("is-visible", isTarget);
  });

  navButtons.forEach((button) => {
    const isCurrent = button.dataset.section === sectionId;
    button.classList.toggle("is-active", isCurrent);

    if (isCurrent) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  document.dispatchEvent(new CustomEvent("ojt:section-change", {
    detail: { sectionId }
  }));
}

function focusSettingsArea(target) {
  const targetIds = {
    student: "student-name",
    company: "company-name",
    preferences: "preferred-week-start-day",
    recovery: "export-backup-button"
  };
  const targetId = targetIds[target] || targetIds.student;

  showSection("settings");
  activateSettingsTab(target);
  window.requestAnimationFrame(() => {
    const control = document.getElementById(targetId);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    control?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    control?.focus();
  });
}

window.OJTApp = {
  showSection,
  focusSettingsArea
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

document.addEventListener("ojt:focus-settings-section", (event) => {
  focusSettingsArea(event.detail?.target);
});

document.getElementById("settings")?.addEventListener("click", (event) => {
  const tab = event.target.closest?.("button[data-settings-tab]");
  if (tab) {
    activateSettingsTab(tab.dataset.settingsTab);
  }
});

settingsTabs.forEach((tab) => {
  tab.addEventListener("keydown", (event) => {
    const tabs = Array.from(settingsTabs);
    const currentIndex = tabs.indexOf(tab);
    let nextIndex = null;

    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      activateSettingsTab(tabs[nextIndex].dataset.settingsTab, { focusTab: true });
    }
  });
});

activateSettingsTab("student");
