# OJT Journal Companion Workflows

## 1. Workflow Overview

This document defines the main user workflows for OJT Journal Companion v1.0.

**v1.0 status:** These workflows are implemented in the current app.

**Living document note:** This file preserves the v1.0 baseline. Accepted additive post-v1.1 behavior is included in place where the current application has evolved, without rewriting unrelated historical v1.0 boundaries.

The app is a personal offline-first journal companion for one student. It helps the student record daily OJT activities, calculate rendered time, attach basic photo documentation, prepare weekly journal content, and manually transfer that content into the official school template.

The app does not replace official school forms, signatures, supervisor validation, or submission requirements.

## 2. First-Time Setup Workflow

The first-time setup workflow prepares the app for one local student user.

1. User opens the app.
2. User fills out the student profile.
3. User fills out the company profile.
4. User optionally sets required OJT hours.
5. User optionally sets the preferred week start day.
6. App validates the setup fields.
7. App saves setup data locally using IndexedDB.

Student profile data may include student name, course or program, school or institution, section or year level, and required OJT hours.

Company profile data may include company name, company address, department or assigned area, supervisor name, and supervisor contact.

No login or account setup should be required.

## 3. Daily Log Workflow

The daily log workflow is the main record-keeping flow for the student.

1. User creates an OJT week in Weeks (if none exists yet).
2. User opens Daily Logs and selects a saved week.
3. User opens a day from the compact day card list (modal/panel editor on desktop and mobile).
4. User chooses a day status: `Worked`, `Absent`, or `No OJT / Rest Day`.
5. If the day status is `Worked`, user enters time in, time out, and break minutes.
6. If the day status is `Absent` or `No OJT / Rest Day`, user may add optional day remarks.
7. User saves the day record.
8. User adds one or more structured task/work items under the daily log when useful.
9. Each task item may include a description, optional time spent, personal status, and notes.
10. User may attach photo documentation after the day record is saved.
11. App validates required fields.
12. App saves the daily log and related records locally using IndexedDB.
13. Worked days calculate rendered time from the daily log time fields. Absent and rest-day records save `0` rendered minutes.

Daily logs should belong to an `OJTWeek` through `weekId`. Daily logs are day status and time records. Daily task/work items should belong to a `DailyLog` through `dailyLogId` and should hold the daily work/accomplishment bullet details.

Task items can later be used as bullet-style accomplishments in the weekly preview. Task status is personal progress tracking only; it does not mean supervisor approval or official school validation. Task time spent does not affect official rendered hours in v1.0.

## 4. Daily Task Item Workflow

The daily task item workflow captures structured work bullets under one daily log.

1. User opens or creates a daily log.
2. User adds a task or work item description.
3. User optionally adds task-level time spent in minutes.
4. User chooses a personal status: `Pending`, `In Progress`, or `Completed`.
5. User optionally adds task notes.
6. User may edit task details.
7. User may change task status.
8. User may reorder task items if practical.
9. User may delete a task item.
10. App saves task items locally using IndexedDB.

Task status is for personal progress tracking only. It is not supervisor approval, official validation, grading, or submission status. Task-level time spent is documentation detail only and should not be used as the official rendered hours calculation source.
## 5. Time Calculation Workflow

The time calculation workflow keeps daily and weekly rendered hours consistent.

1. App reads `dayStatus` from the daily log.
2. If `dayStatus` is `Worked`, app reads `timeIn`, `timeOut`, and `breakMinutes`.
3. App calculates the total time between `timeIn` and `timeOut`.
4. App subtracts `breakMinutes`.
5. App stores the result as `renderedMinutes`.
6. If `dayStatus` is `Absent` or `No OJT / Rest Day`, app stores `0` rendered minutes.
7. App displays rendered hours based on `renderedMinutes`.
8. When day status or time fields change, app recalculates `renderedMinutes` and displayed hours.

`renderedMinutes` should be the main stored calculated value because it avoids decimal rounding issues.

v1.0 assumes same-day time logs only. Overnight shifts are out of scope unless added later.

## 6. Weekly Journal Workflow

The weekly journal workflow helps the student prepare the weekly content required for manual transfer into the official school journal template.

1. User opens a week.
2. App shows the daily logs under that week.
3. App calculates weekly total rendered time from related daily logs.
4. User writes weekly skills learned.
5. User writes problems encountered.
6. User writes reflection or points of learning.
7. User may add additional notes.
8. App saves weekly summary fields locally using IndexedDB.

Weekly total rendered time should be calculated from `DailyLog` records linked to the selected week. It should not be manually typed into the week record.

## 7. Photo Documentation Workflow

The photo documentation workflow supports local photo documentation for daily logs, including batch upload with shared metadata.

1. User opens or creates a daily log.
2. User selects one or multiple JPEG, PNG, or WebP files in one upload action for that daily log.
3. App assigns one generated `photoSetId` to the upload batch and `photoSetIndex` values in native file-selection order.
4. User chooses one photo category such as `General Documentation`, `Time In Photo`, `Time Out Photo`, `Task/Work Proof`, or `Other` for the set.
5. User may add one shared caption for the set.
6. App validates the complete batch before writing.
7. App stores each image as a normal `PhotoAttachment` with duplicated shared category and caption, using atomic IndexedDB transactions for batch creation.
8. Journal displays shared category and caption once per set while each image remains individually downloadable and deletable.
9. User may edit shared category and caption atomically for an existing set.
10. User may delete individual images from a set; deleting the first image preserves shared metadata, stored indices are not renumbered, and deleting the final image removes the set naturally.
11. App saves changes locally.

Photo metadata may include file name, file type, file size, category, caption, optional `photoSetId`, optional `photoSetIndex`, related daily log ID, and created timestamp. Existing records without set metadata behave as runtime singleton sets. There is no separate group entity or store.

Photo categories are simple documentation labels. Time in and time out photo categories should not be treated as verified attendance, GPS proof, supervisor validation, or official proof logic. Photo category is not exported in Official DOCX Export.

When a photo is imported into the app and stored in IndexedDB as a `Blob` or equivalent browser-supported file data, the app should treat it as its own local copy. If the original photo is later deleted from the phone or laptop, the app may still retain the imported copy as long as browser storage has not been cleared.

The user should be able to download an attached photo back to the device if the stored photo data is still available. This photo download or recovery behavior is useful, but it depends on local browser storage remaining intact.

Photo storage must be tested because browser storage behavior and size limits vary across browsers and devices.

Advanced preview, gallery viewing, compression, and image editing are not required for v1.0.

Downloading all photos as a ZIP is future work and is not required for v1.0.

## 8. Weekly Preview and Copy Workflow

The weekly preview and copy workflow helps the student prepare content before manually transferring it into the official school template.

1. User opens a week.
2. App gathers student profile data.
3. App gathers company profile data.
4. App gathers week details, including inclusive dates.
5. App gathers daily logs under the week.
6. App gathers related daily task/work items for bullet-style accomplishments.
7. App gathers weekly summary fields.
8. App calculates total rendered hours for the week.
9. App generates a weekly journal preview.
10. User reviews the prepared content.
11. User copies or exports the content.
12. User manually transfers the content into the official school journal template.

The app should support copy-ready weekly journal content. It should not submit the journal online or replace the official school template.

## 9. Backup Export Workflow

The backup export workflow protects local offline data and preserves the existing JSON shape.

1. User chooses Export Backup in Settings - Data & Recovery.
2. App gathers the seven existing data stores and photo payloads.
3. App validates exact app identity, supported "1.0" version, structure, IDs, relationships, and photo MIME/Base64/usable Blob integrity.
4. Invalid export data blocks the download and shows an integrity error.
5. Large photo-heavy exports keep the existing confirmation; cancellation performs no download.
6. A valid export downloads JSON, updates lastBackupDate, refreshes the Dashboard reminder, and dispatches ojt:backup-exported.

JSON includes photo metadata and serialized photo data, so photo-heavy files can be large. A future ZIP backup remains outside the current workflow.

## 10. Backup Restore Review and Replacement Workflow

Restore is replace-style and does not merge. The current workflow is:

1. User selects a JSON backup file.
2. App parses and validates it without writing data.
3. App shows file information, backup metadata, record counts, profile/settings presence, fatal errors, and nonfatal warnings.
4. Invalid backups cannot restore. Warning-only backups may restore.
5. User may choose Export Current Data First, which reuses the existing JSON export workflow, preserves the pending review, and does not continue automatically into restore.
6. User chooses Restore This Backup and accepts the final replacement confirmation.
7. The existing atomic replace transaction runs, then the app reloads.

One in-memory pending review is reused for the final operation. A new file replaces the prior review. Cancel Restore clears the review and file selection. Confirmation cancellation performs no write and keeps the review. Repeated restore/export activation is guarded, restore and safety export cannot overlap, and failures restore controls while keeping the review. No second JSON parse, validation, or photo decode occurs after review.

## 11. Reset Local App Data Workflow

The reset workflow lets the student permanently clear all local journal data from the current browser.

1. User opens Settings - Data & Recovery and reads the danger-zone panel.
2. User checks the confirmation checkbox and types exact RESET.
3. The reset button enables only after both guards are satisfied.
4. User clicks Reset Local App Data and accepts the final native confirmation.
5. If cancelled, nothing is deleted.
6. If confirmed, all seven IndexedDB stores are cleared and selected-week state is cleared.
7. The app reloads to a fresh empty state.

Reset is irreversible without a JSON backup. Export a backup first if the student may need the data later.

### Storage Health and Recovery Guidance

Settings reports approximate browser-reported site/origin usage, quota, and usage percentage only when valid. Unsupported or failed APIs show graceful states without NaN, Infinity, or fabricated values. Persistent-storage status distinguishes granted, not granted, unavailable, and check failure. Request Persistent Storage is explicit and guarded; Refresh Storage Status is guarded, does not reload, and does not modify app data. Storage Health values remain in memory only and are not stored in IndexedDB, localStorage, or JSON backup data.

The guidance explains current-browser-profile storage, clearing and maintenance/device loss, temporary private/incognito storage, non-transfer between browsers/profiles/devices, portable JSON recovery backups stored outside the browser/device when practical, editable non-restorable DOCX output, and that persistent storage may reduce eviction risk but cannot prevent all data loss. Persistence is not guaranteed, and cloud sync does not exist.

## 12. Dashboard Workflow

The dashboard workflow gives the student a quick starting view.

1. User opens Dashboard (default section on load).
2. App shows overall OJT progress when required hours are set in Profile.
3. App shows student and company identity summary cards.
4. App shows the current or latest week with daily check-in status and weekly summary readiness.
5. User may jump to Daily Logs, Weekly Preview, or Backup from quick actions.
6. If no backup was exported in over 7 days, app shows a backup reminder banner.

## 13. Mobile Navigation Workflow

On narrow screens, the app uses bottom tab navigation instead of the sidebar.

1. User taps Home, Weeks, Logs, Preview, or Backup tabs.
2. App switches the visible section without changing data.
3. User taps the profile button in the header to open Profile.

## 14. Edit and Delete Workflow

The edit and delete workflow lets the student correct records while keeping related data understandable.

The user can edit:

- Student profile records
- Company profile records
- Weeks
- Daily logs
- Daily task/work items
- Weekly summary fields
- Shared photo-set category and caption for attachments in the same set

Deletion behavior should be simple:

- Deleting a week is blocked while related daily logs still exist. The user must delete daily logs first.
- Deleting a daily log also deletes related task items and photo attachments.
- Deleting a task item does not delete the daily log.
- Deleting a photo does not delete the daily log.
- Deleting an individual photo from a set does not delete the daily log; shared set metadata remains on surviving attachments until the final image in the set is removed.

Before deleting larger records such as weeks or daily logs, the app warns the user about related records that will also be removed.

## 15. Offline Use Workflow

The offline use workflow describes how the app should behave as a local-first tool.

1. User opens the app in a supported browser.
2. App loads locally stored data from IndexedDB.
3. User creates, edits, reviews, and deletes records without needing internet.
4. App saves changes to the current device and browser.
5. User exports backups manually to protect data.

The app should work without internet once loaded.

Data stays on the current device and browser. Offline-first does not mean automatic sync between a phone and laptop.

The user must export backups to protect data, especially before clearing browser storage, changing devices, doing browser maintenance, or using Reset Local App Data.

## 16. v1.0 Workflow Boundaries

The v1.0 workflows should not include:

- Login
- User accounts
- Admin dashboard
- Coordinator dashboard
- Supervisor approval
- Online submission
- Cloud sync
- GPS attendance
- QR attendance
- Multi-user workflows
- School-wide deployment workflow
- Grading or evaluation workflow
- Payroll or allowance workflow

OJT Journal Companion should remain a lightweight personal journal companion. Its workflows should focus on one student using local offline data to prepare weekly OJT journal content for manual transfer into official school requirements.
