# OJT Journal Companion Features

## Current status

The latest tagged stable release is **v1.1**. Phase 4 — Accessible Responsive Visual Redesign is complete post-v1.1 roadmap work on feature/accessible-responsive-redesign; it is not a new release or tag. No v1.2 release is implied.

The app is a local, offline-first companion for one student on one browser/device. It has no account/login, backend, cloud sync, online submission, coordinator/admin dashboard, or formal accessibility certification.

## Implemented feature inventory

### Responsive app shell

- Desktop sidebar navigation with app identity and four destinations.
- Mobile fixed bottom navigation with exactly Dashboard, Journal, Preview & Export, and Settings.
- Safe-area support and responsive desktop, tablet, and mobile layouts.
- The mobile drawer navigation is not part of the current interface.

### Journal and dashboard

- Student and company details with personal app settings.
- Dashboard OJT progress, current-week status, day handoffs, and backup reminder.
- OJT week creation, editing, deletion safeguards, and selected-week synchronization.
- Daily Logs with Worked, Absent, and No OJT / Rest Day statuses.
- Rendered-hour calculations from DailyLog time fields and stored renderedMinutes.
- Daily Tasks with description, optional time, notes, personal status, and ordering.
- Weekly Summary fields for skills learned, problems encountered, reflection, and additional notes.

### Accessible interaction improvements

The current interface includes visible focus treatment, Daily Log dialog/sheet focus containment, Escape close, opener-focus restoration, background inertness, Settings keyboard tabs, first-invalid focus, field-level validation semantics, and controlled status announcements. These are implementation features, not a formal WCAG conformance claim.

### Appearance

- System, Dark, and Light appearance modes.
- Persisted appearanceMode in AppSettings.
- Settings preview changes immediately and Save settings persists the selected mode.
- System follows the browser/device appearance.
- The top Light/Dark quick switch toggles the effective theme and saves only the appearance preference immediately.
- System remains available in Settings.

### Batch Photo Documentation

- Select one or multiple JPEG, PNG, or WebP files in one upload action.
- Apply shared category and caption metadata to the group.
- Store each image as an independent PhotoAttachment.
- Download or delete individual files.
- Display grouped photos once per set in Journal.
- Preserve legacy photos without set metadata as singleton groups.
- Use set-aware Official DOCX layouts without a new store, migration, or DB-version increase.

### Preview and export

- Responsive, reading-oriented browser Preview with semantic daily structure.
- Copy Weekly Journal for convenient text transfer.
- Official DOCX Export retains the official journal layout, remains editable, and is independent of the browser Preview layout.
- DOCX output is not a restorable backup.

### Recovery

- JSON backup containing the local app data and photo payloads.
- Restore Review with metadata, counts, fatal errors, and nonfatal warnings.
- Fatal errors block restore; warning-only backups may remain restorable.
- Export Current Data First safety export.
- Replace-style restore with final confirmation and atomic replacement.
- Storage Health estimates, persistence status, explicit persistence request, refresh, and recovery guidance.
- Reset safeguards requiring the confirmation checkbox, exact RESET, and final confirmation.

### Safe rendering boundary

Restored and user-controlled values are safely rendered at HTML serialization boundaries. Restored IDs remain compatible with storage and lookup without unsafe HTML interpolation; selector contexts use selector-safe handling.

## Data and scope boundaries

The app uses IndexedDB for application records and may use localStorage only for small non-authoritative selected-week and appearance startup state. Journal content, tasks, photos, and JSON backup payloads are not stored in localStorage. JSON backup is the recovery path; browser storage can still be lost.

The app does not provide PDF export, login, accounts, cloud sync, GPS/QR attendance, online submission, supervisor approval, or multi-user management.
