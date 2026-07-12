const navButtons = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll(".app-section");
const menuButton = document.querySelector(".menu-button");
const drawer = document.querySelector(".mobile-drawer");
const drawerOverlay = document.querySelector(".drawer-overlay");
const drawerCloseButton = document.querySelector(".drawer-close");
const settingsTabs = document.querySelectorAll("[data-settings-tab]");
const settingsPanels = document.querySelectorAll(".settings-panel");

function activateSettingsTab(target) {
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
}

function openDrawer() {
  if (!drawer || !drawerOverlay || !menuButton) {
    return;
  }

  drawer.hidden = false;
  drawerOverlay.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("drawer-open");
  drawerCloseButton?.focus();
}

function closeDrawer() {
  if (!drawer || !drawerOverlay || !menuButton) {
    return;
  }

  drawer.hidden = true;
  drawerOverlay.hidden = true;
  drawer.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("drawer-open");
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
    closeDrawer();
  });
});

menuButton?.addEventListener("click", openDrawer);
drawerOverlay?.addEventListener("click", closeDrawer);
drawerCloseButton?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
  }
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
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateSettingsTab(tab.dataset.settingsTab);
    }
  });
});

activateSettingsTab("student");
