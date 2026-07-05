const navButtons = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll(".app-section");
const menuButton = document.querySelector(".menu-button");
const drawer = document.querySelector(".mobile-drawer");
const drawerOverlay = document.querySelector(".drawer-overlay");
const drawerCloseButton = document.querySelector(".drawer-close");

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

window.OJTApp = {
  showSection
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
