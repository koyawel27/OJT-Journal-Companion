# OJT Journal Companion Build Plan

## 1. Build Plan Overview

This document defines a practical step-by-step coding plan for OJT Journal Companion v1.0.

The goal is to build a lightweight offline-first personal journal companion for one student using local browser data. The app should help the student manage profiles, weeks, daily logs, rendered time, photo documentation, weekly preview content, and JSON backup/restore.

The project should be built in small phases. Each phase should leave the app in a working state before moving forward.

## 2. Recommended Initial Folder Structure

```text
app/
  index.html
  assets/
    css/
      styles.css
    js/
      app.js
      db.js
      storage.js
      profile.js
      weeks.js
      daily-logs.js
      calculations.js
      journal-preview.js
      photos.js
      backup.js
      ui.js

docs/
  PROJECT_BRIEF.md
  FEATURES.md
  DATA_STRUCTURE.md
  WORKFLOWS.md
  BUILD_PLAN.md

README.md
```

Do not create extra folders or tools until the app clearly needs them.

## 3. Development Rules

- Use HTML, CSS, JavaScript, IndexedDB, and later PWA support.
- Start with a static app shell before adding IndexedDB.
- Use simple modular JavaScript files.
- Keep functions small and readable.
- Do not use frameworks yet.
- Do not add build tools yet unless clearly needed.
- Do not use PHP, MySQL, or a backend server.
- Use IndexedDB directly or through a very small helper module.
- Keep data shapes consistent with `docs/DATA_STRUCTURE.md`.
- Store `renderedMinutes` as the main calculated time value.
- Display rendered hours from `renderedMinutes`.
- Assume same-day time logs only.
- Use `YYYY-MM-DD` for dates.
- Use `HH:mm` for internal time fields.
- Use ISO 8601 timestamp strings for `createdAt` and `updatedAt`.
- JSON restore should replace current local data after user confirmation.
- Photo documentation should store `Blob` or equivalent browser-supported image data in IndexedDB.
- Downloading one attached photo back to the device is useful.
- Downloading all photos as a ZIP is future work.

## 4. Phase 1: Static App Shell

### Goal

Create the first visible app layout without IndexedDB, photo handling, or complex logic.

### Files Likely Affected

- `app/index.html`
- `app/assets/css/styles.css`
- `app/assets/js/app.js`

### Tasks

- Create the initial app folder structure.
- Add the main HTML layout.
- Add navigation sections:
  - Dashboard
  - Profile
  - Weeks
  - Daily Logs
  - Weekly Preview
  - Backup
- Add simple placeholder content for each section.
- Add basic responsive CSS.
- Add simple JavaScript for switching visible sections.

### Manual Testing Checklist

- App opens in the browser.
- Navigation sections are visible.
- Clicking each section shows the correct placeholder content.
- Layout is readable on desktop width.
- Layout remains usable on mobile width.

### Stop Condition Before Next Phase

Move on only when the static shell works without console errors and all main navigation sections are reachable.

## 5. Phase 2: Student and Company Profile

### Goal

Let the student enter and save local profile data.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/db.js`
- `app/assets/js/storage.js`
- `app/assets/js/profile.js`
- `app/assets/js/ui.js`
- `app/assets/css/styles.css`

### Tasks

- Add IndexedDB setup for `studentProfile`, `companyProfile`, and `appSettings`.
- Build student profile form fields.
- Build company profile form fields.
- Add optional required OJT hours field.
- Add preferred week start day setting.
- Save profile records locally.
- Load saved profile data when the app opens.
- Add basic validation for required fields.

### Manual Testing Checklist

- Student profile saves locally.
- Company profile saves locally.
- Saved data appears after refreshing the page.
- Required OJT hours accepts zero or positive numbers.
- Empty required fields show clear validation messages.

### Stop Condition Before Next Phase

Move on only when profile and settings data can be saved, loaded, edited, and refreshed without data loss.

## 6. Phase 3: OJT Week Management

### Goal

Let the student create and manage weekly journal periods.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/db.js`
- `app/assets/js/storage.js`
- `app/assets/js/weeks.js`
- `app/assets/js/ui.js`
- `app/assets/css/styles.css`

### Tasks

- Add IndexedDB store or storage functions for `OJTWeek`.
- Build week creation form.
- Include week number, inclusive start date, and inclusive end date.
- Use `YYYY-MM-DD` for date fields.
- List saved weeks.
- Allow editing week details.
- Validate unique week numbers.
- Validate that start date is not later than end date.
- Avoid overlapping week ranges if practical.

### Manual Testing Checklist

- User can create a week.
- User can edit a week.
- Saved weeks appear after refresh.
- Duplicate week numbers are blocked.
- Invalid date ranges are blocked.

### Stop Condition Before Next Phase

Move on only when weeks can be created, edited, listed, and loaded reliably.

## 7. Phase 4: Daily Log Management

### Goal

Let the student create, edit, and delete daily OJT logs under a selected week.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/db.js`
- `app/assets/js/storage.js`
- `app/assets/js/daily-logs.js`
- `app/assets/js/weeks.js`
- `app/assets/js/ui.js`
- `app/assets/css/styles.css`

### Tasks

- Add storage functions for `DailyLog`.
- Build daily log form.
- Allow selecting a week for the log.
- Add fields for entry date, time in, time out, break minutes, activities, learnings, challenges, and notes.
- Use `YYYY-MM-DD` for entry date.
- Use `HH:mm` for time fields.
- List logs by selected week.
- Add edit and delete controls.
- Add confirmation before deleting a daily log.

### Manual Testing Checklist

- User can create a daily log under a week.
- User can edit a daily log.
- User can delete a daily log.
- Daily logs remain linked to the correct week.
- Saved logs appear after refresh.

### Stop Condition Before Next Phase

Move on only when daily logs can be created, edited, deleted, and listed by week.

## 8. Phase 5: Time Calculation

### Goal

Calculate daily and weekly rendered time correctly.

### Files Likely Affected

- `app/assets/js/calculations.js`
- `app/assets/js/daily-logs.js`
- `app/assets/js/weeks.js`
- `app/assets/js/ui.js`

### Tasks

- Create a function that calculates `renderedMinutes` from `timeIn`, `timeOut`, and `breakMinutes`.
- Display rendered hours from `renderedMinutes`.
- Recalculate when time fields change.
- Store `renderedMinutes` with the daily log.
- Calculate weekly total rendered minutes from related daily logs.
- Display weekly total rendered hours.
- Validate same-day time logs only.
- Block break minutes greater than total time.

### Manual Testing Checklist

- Daily rendered minutes calculate correctly.
- Displayed hours match the stored minutes.
- Weekly total updates when logs are added or edited.
- Invalid time ranges are blocked.
- Overnight shifts are not accepted in v1.0.

### Stop Condition Before Next Phase

Move on only when daily and weekly rendered time calculations are reliable and readable.

## 9. Phase 6: Weekly Journal Summary

### Goal

Let the student write and save weekly journal summary fields.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/weeks.js`
- `app/assets/js/journal-preview.js`
- `app/assets/js/ui.js`
- `app/assets/css/styles.css`

### Tasks

- Add fields for weekly skills learned.
- Add fields for problems encountered.
- Add fields for reflection or points of learning.
- Add optional additional notes.
- Save summary fields to the related `OJTWeek`.
- Load saved summary fields when the week is opened.

### Manual Testing Checklist

- User can save weekly summary fields.
- Summary fields remain after refresh.
- Summary fields stay linked to the correct week.
- Empty optional fields do not break the page.

### Stop Condition Before Next Phase

Move on only when weekly summary content can be saved, edited, and loaded by week.

## 10. Phase 7: Weekly Preview and Copy Output

### Goal

Generate a copy-ready weekly journal preview for manual transfer into the official school template.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/journal-preview.js`
- `app/assets/js/profile.js`
- `app/assets/js/weeks.js`
- `app/assets/js/daily-logs.js`
- `app/assets/js/calculations.js`
- `app/assets/js/ui.js`
- `app/assets/css/styles.css`

### Tasks

- Gather student profile data.
- Gather company profile data.
- Gather selected week details.
- Gather daily logs under the selected week.
- Include weekly summary fields.
- Include weekly total rendered hours.
- Generate a readable weekly preview.
- Add a copy button for prepared content.
- Keep output focused on manual transfer, not online submission.

### Manual Testing Checklist

- Preview shows correct student and company data.
- Preview shows correct week details and daily logs.
- Weekly total rendered hours are correct.
- Copy button copies the prepared content.
- Missing optional fields do not break the preview.

### Stop Condition Before Next Phase

Move on only when a complete weekly journal preview can be generated and copied.

## 11. Phase 8: Photo Documentation

### Goal

Add basic photo documentation support for daily logs.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/db.js`
- `app/assets/js/storage.js`
- `app/assets/js/photos.js`
- `app/assets/js/daily-logs.js`
- `app/assets/js/ui.js`
- `app/assets/css/styles.css`

### Tasks

- Add storage functions for `PhotoAttachment`.
- Add photo import control to daily logs.
- Store file metadata.
- Store imported image data in IndexedDB as a `Blob` or equivalent browser-supported file data.
- Add optional caption field.
- Allow removing a photo from a daily log.
- Allow downloading one attached photo back to the device when stored data is available.
- Limit supported image types to JPEG, PNG, and WebP.
- Test practical photo file size limits.

### Manual Testing Checklist

- User can attach or import a photo to a daily log.
- Photo metadata saves locally.
- Photo data remains after refresh if browser storage is intact.
- User can edit a caption.
- User can remove a photo.
- User can download one attached photo back to the device.
- Unsupported file types are blocked.

### Stop Condition Before Next Phase

Move on only when basic attach/import, metadata storage, removal, and single-photo download work reliably enough for v1.0.

## 12. Phase 9: JSON Backup and Restore

### Goal

Allow the student to export and restore local data using JSON backup files.

### Files Likely Affected

- `app/index.html`
- `app/assets/js/backup.js`
- `app/assets/js/storage.js`
- `app/assets/js/db.js`
- `app/assets/js/ui.js`

### Tasks

- Gather student profile, company profile, weeks, daily logs, photo attachments, and app settings.
- Create a JSON backup with `appName`, `backupVersion`, and `exportedAt`.
- Include photo metadata.
- Include photo data converted to a JSON-safe format such as Base64 when practical.
- Warn that including photo data may make JSON backup files large.
- If photo backup becomes too heavy during testing, clearly warn the user before export.
- Keep ZIP backup for many photos as future work, not a v1.0 requirement.
- Add export backup button.
- Add import/restore control.
- Validate that imported JSON looks like an OJT Journal Companion backup.
- Warn that restore will replace current local data.
- Replace current local data after user confirmation.
- Do not implement merge or conflict handling.

### Manual Testing Checklist

- User can export a JSON backup.
- Backup contains expected app data.
- Backup includes photo metadata.
- Backup includes photo data as Base64 or another JSON-safe format when practical.
- App warns clearly if photo-heavy backup export may create a large file.
- User can import a valid backup.
- Restore warns before replacing data.
- Restored data appears correctly after refresh.
- Invalid backup files are rejected safely.

### Stop Condition Before Next Phase

Move on only when backup export and replace-style restore work consistently for normal app data.

## 13. Phase 10: Offline Polish and Optional PWA Setup

### Goal

Polish offline behavior and optionally prepare PWA support after the main app works.

### Files Likely Affected

- `app/index.html`
- `app/assets/css/styles.css`
- `app/assets/js/app.js`
- `app/assets/js/ui.js`
- Optional future PWA files if added later

### Tasks

- Improve empty states and error messages.
- Improve mobile-friendly layout.
- Add dashboard summaries.
- Add required OJT hours progress if profile data supports it.
- Confirm app behavior without internet after initial load.
- Consider PWA installability later.
- Avoid adding sync, accounts, or server behavior.

### Manual Testing Checklist

- Main workflows remain usable offline.
- Layout works on laptop, desktop, and mobile browser widths.
- Empty states are understandable.
- Backup reminders are visible or easy to find.
- No login or network-dependent workflow appears.

### Stop Condition Before Next Phase

v1.0 is ready for broader personal testing when the main workflows work offline, the UI is understandable, and backup/restore has been tested.

## 14. Testing Checklist by Phase

| Phase | Main Test Focus |
| --- | --- |
| Phase 1 | Static layout, navigation, responsive basics |
| Phase 2 | Student profile, company profile, settings persistence |
| Phase 3 | Week creation, editing, uniqueness, date validation |
| Phase 4 | Daily log create, edit, delete, week linking |
| Phase 5 | Daily and weekly rendered time calculations |
| Phase 6 | Weekly summary save and load |
| Phase 7 | Weekly preview generation and copy output |
| Phase 8 | Photo attach/import, metadata, removal, single-photo download |
| Phase 9 | JSON backup export and replace-style restore |
| Phase 10 | Offline usability, mobile layout, final polish |

## 15. First Coding Milestone

The first coding milestone should be small and static.

Create:

- `app/index.html`
- `app/assets/css/styles.css`
- `app/assets/js/app.js`

Build a simple static layout with navigation sections:

- Dashboard
- Profile
- Weeks
- Daily Logs
- Weekly Preview
- Backup

Do not add IndexedDB yet.

Do not add photo handling yet.

Do not add complex logic yet.

The milestone is complete when the app opens in the browser, shows all navigation sections, and can switch between sections with simple JavaScript.

## 16. Features to Avoid During v1.0

Do not build these during v1.0:

- Login
- User accounts
- Backend server
- PHP
- MySQL
- Admin dashboard
- Supervisor approval
- Coordinator dashboard
- Cloud sync
- GPS attendance
- QR attendance
- Multi-user features
- School-wide deployment features
- Online journal submission
- Grading or evaluation system
- Payroll or allowance tracking
- ZIP download for all photos

These features would expand the app beyond a lightweight personal offline-first journal companion.
