# OJT Journal Companion Workflows

## Current boundary

These are the current user workflows for the local, offline-first app. The app supports one student on one browser/device. It has no login, backend, cloud sync, online submission, or merge-style restore.

## App startup and appearance

Open app
→ startup appearance cache applies early theme
→ IndexedDB app settings reconcile the authoritative preference
→ System follows browser/device appearance

The startup cache key is ojt-journal-companion:appearance-mode. It is optional, non-authoritative, and contains only the appearance mode. Invalid or missing cached values fall back to System. IndexedDB remains authoritative. No journal, profile, task, photo, or backup content is stored in the appearance cache.

## First-time setup

1. Open the app.
2. Open Settings and complete Student Details.
3. Complete Company/OJT Placement.
4. Optionally set required OJT hours and preferred week start day.
5. Open App Preferences and choose an appearance mode if desired.
6. Save settings.

Profile, company, and app-settings records are stored in IndexedDB.

## Settings appearance workflow

Settings
→ App Preferences
→ choose System, Dark, or Light
→ preview immediately
→ Save settings to persist

Appearance changes preview immediately. Saving persists the selected appearanceMode in AppSettings. System follows the browser/device appearance. A failed save restores the persisted mode. Changing an appearance option previews it immediately; Save settings persists it. An unsaved preview is not persisted.

## Quick switch workflow

Top switch
→ toggle effective Light/Dark
→ save explicit opposite mode immediately
→ synchronize Settings

The top switch does not expose System. System remains available in Settings. The quick switch saves only appearance; unrelated unsaved Settings values are not persisted.

## Responsive navigation

Accepted Phase 5C Journal presentation flow:

Compact/mobile:

Compact top app bar with reachable theme control
→ centered content canvas
→ full-width fixed bottom navigation
→ Dashboard / Journal / Preview & Export / Settings

Wider tablet/desktop:

Compact top app bar with reachable theme control
→ centered content canvas
→ centered floating bottom-navigation dock
→ Dashboard / Journal / Preview & Export / Settings

Navigation keeps the existing targets, labels, `aria-current` behavior, and `data-section` values. The full accessible product name remains available, the tagline is not persistently repeated in the top app bar, and bottom clearance plus safe-area behavior remain required. Keyboard access, visible focus, touch targets, zoom, and reduced motion remain part of the workflow contract. There is no mobile drawer, separate appearance destination, or permanent desktop sidebar.

The completed Phase 4 desktop sidebar remains historical runtime behavior and is intentionally superseded by this Phase 5C Journal presentation contract. This documentation update does not change navigation destinations or application workflows.
## Journal and week workflow

1. Open Journal.
2. Create or select an OJT week.
3. Review the selected-week overview and day list.
4. Use Previous, Next, or the compact All Weeks selector when needed.
5. Open a day to edit its Daily Log.
6. Save weekly summary fields in the selected-week summary area.
7. Use Dashboard or Preview & Export handoffs to return to the relevant Journal week/day.

Selected-week state is a small local UI preference. The week records themselves remain in IndexedDB.

## Daily Log workflow

1. Open a day in Journal.
2. Choose Worked, Absent, or No OJT / Rest Day.
3. For Worked, enter time in, time out, and break minutes.
4. Add optional day remarks.
5. Save the day record.
6. Add Daily Tasks with descriptions, optional task time, personal status, and notes.
7. Attach photos after the day record is saved.
8. Correct or delete the day record when needed.

Worked rendered time is calculated from DailyLog time fields. Absent and rest-day records save zero rendered minutes. Task time is documentation only and does not change official rendered hours.

### Daily Log Editor presentation and interaction

On compact/mobile screens the editor opens as a rounded bottom sheet; on wider screens it opens as a contained dialog. The header remains stable while the document-like body scrolls independently. The editor preserves date/day identity, status selection, time fields, rendered-time feedback, Daily Tasks, Photo Documentation, Day Remarks, Save feedback, and the separated Delete Day danger action.

The existing interaction contract includes dialog semantics, an accessible title and close control, initial focus, focus trapping, Escape close, background inertness, body scroll locking, visible focus, validation-message associations, and opener focus restoration. The focused Task Editor is a subview for Add/Edit Task and supports Hours and Minutes entry while storing total `timeSpentMinutes` independently from rendered hours.

## Photo workflow

Attach one/multiple photos

→ one photo group for multi-select
→ shared category/caption
→ save normal PhotoAttachment records
→ individual download/delete

The picker accepts JPEG, PNG, and WebP. One upload action can create one or multiple records sharing one photoSetId. photoSetIndex preserves native selection order. Each photo remains independently downloadable and deletable. Existing records without set metadata remain supported as singleton groups.

Stored-photo replacement is not present in the current baseline. Existing add-photo, real Blob-backed thumbnail rendering, category/caption editing, download, deletion, object-URL cleanup, and the existing 5 MB validation limit are the supported photo behaviors.

## Preview workflow


Select week
→ review reading-optimized Preview
→ correct missing information
→ Copy Weekly Journal or Export Official DOCX

Browser Preview is optimized for responsive reading, accessibility, and correction. Official DOCX Export keeps the official journal layout and remains editable. The Preview explanatory note is not included in Copy or DOCX output.

The focused acceptance pass generated a browser DOCX and passed structural package inspection for media assets, content types, and template-marker safety. It did not establish a new native Microsoft Word or LibreOffice render.

## Backup workflow

Export JSON backup
→ validate current data
→ download recovery file
→ update last-backup state

JSON backup includes the seven existing stores and photo payloads. Export validation blocks invalid data and warns before large photo-heavy exports. JSON is the restorable backup; DOCX is not.

## Restore workflow

Select JSON
→ analyze only
→ Restore Review
→ fatal errors block
→ warnings may remain restorable
→ optional Export Current Data First
→ final replacement confirmation
→ atomic replace
→ reload

Restore is replace-style, not merge-style. File selection and review do not write data. A new file replaces the pending review. Cancel Restore clears the pending review and file selection without writing. Canceling the final replacement confirmation performs no write and keeps the review. Export Current Data First reuses the existing JSON export and does not automatically continue to restore.

## Storage Health workflow

1. Open Settings → Data & Recovery.
2. Review approximate usage and quota when the browser provides valid values.
3. Review persistent-storage status.
4. Use Request Persistent Storage only when explicitly desired.
5. Use Refresh Storage Status to recheck.
6. Keep JSON backups regardless of the displayed status.

Storage Health is approximate and runtime-only. Persistence may reduce eviction risk but is not guaranteed and does not replace JSON backup.

## Reset workflow

1. Open Settings → Data & Recovery.
2. Read the danger-zone warning.
3. Check the confirmation checkbox.
4. Type exact RESET.
5. Click Reset Local App Data.
6. Accept the final native confirmation.
7. If canceled, nothing is deleted.
8. If confirmed, all seven IndexedDB stores and selected-week state are cleared, appearance resets to System, and the appearance startup cache is reconciled.
9. The app reloads to a fresh empty state.

Reset is irreversible without a JSON backup. Export a backup first when data may be needed later.

## Dashboard workflow

1. Open Dashboard.
2. Review overall OJT progress when required hours are set.
3. Review the current or latest week.
4. Use a day handoff to open the correct Journal date.
5. Follow the backup reminder when the last JSON export is older than the reminder threshold.

## Edit and delete behavior

- Weeks cannot be deleted while related Daily Logs remain.
- Deleting a Daily Log also deletes its Daily Tasks and PhotoAttachments.
- Deleting a task does not delete its Daily Log.
- Deleting an individual photo does not delete its Daily Log.
- Deleting a photo from a group preserves shared metadata on surviving images; deleting the final image removes the logical group naturally.

## Offline and recovery boundary

The app can create, edit, review, and delete local records without internet after loading. Data is local to the current browser profile and device. Browser storage may be cleared or lost, so keep JSON backups outside the browser when practical. DOCX is editable output for review, sharing, or printing and cannot restore app data.
