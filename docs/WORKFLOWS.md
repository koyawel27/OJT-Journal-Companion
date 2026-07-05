# OJT Journal Companion Workflows

## 1. Workflow Overview

This document defines the main user workflows for OJT Journal Companion v1.0 before coding starts.

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

1. User selects an existing week or creates a new week.
2. User creates a daily log under that week.
3. User enters the entry date.
4. User enters time in, time out, and break minutes.
5. User writes activities or accomplishments.
6. User may write learnings, challenges, and notes.
7. App validates required fields.
8. App calculates rendered minutes and displayed rendered hours.
9. App saves the daily log locally using IndexedDB.

Daily logs should belong to an `OJTWeek` through `weekId`.

## 4. Time Calculation Workflow

The time calculation workflow keeps daily and weekly rendered hours consistent.

1. App reads `timeIn`, `timeOut`, and `breakMinutes` from the daily log.
2. App calculates the total time between `timeIn` and `timeOut`.
3. App subtracts `breakMinutes`.
4. App stores the result as `renderedMinutes`.
5. App displays rendered hours based on `renderedMinutes`.
6. When time fields change, app recalculates `renderedMinutes` and displayed hours.

`renderedMinutes` should be the main stored calculated value because it avoids decimal rounding issues.

v1.0 assumes same-day time logs only. Overnight shifts are out of scope unless added later.

## 5. Weekly Journal Workflow

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

## 6. Photo Documentation Workflow

The photo documentation workflow supports basic local photo documentation for daily logs.

1. User opens or creates a daily log.
2. User attaches or imports photo documentation for that daily log.
3. App stores photo metadata locally.
4. App stores imported image data locally using IndexedDB as a `Blob` or equivalent browser-supported file data.
5. User may add a caption.
6. User may remove photo documentation from the daily log.
7. App saves changes locally.

Photo metadata may include file name, file type, file size, caption, related daily log ID, and created timestamp.

When a photo is imported into the app and stored in IndexedDB as a `Blob` or equivalent browser-supported file data, the app should treat it as its own local copy. If the original photo is later deleted from the phone or laptop, the app may still retain the imported copy as long as browser storage has not been cleared.

The user should be able to download an attached photo back to the device if the stored photo data is still available. This photo download or recovery behavior is useful, but it depends on local browser storage remaining intact.

Photo storage must be tested because browser storage behavior and size limits vary across browsers and devices.

Advanced preview, gallery viewing, compression, and image editing are not required for v1.0.

Downloading all photos as a ZIP is future work and is not required for v1.0.

## 7. Weekly Preview and Copy Workflow

The weekly preview and copy workflow helps the student prepare content before manually transferring it into the official school template.

1. User opens a week.
2. App gathers student profile data.
3. App gathers company profile data.
4. App gathers week details, including inclusive dates.
5. App gathers daily logs under the week.
6. App gathers weekly summary fields.
7. App calculates total rendered hours for the week.
8. App generates a weekly journal preview.
9. User reviews the prepared content.
10. User copies or exports the content.
11. User manually transfers the content into the official school journal template.

The app should support copy-ready weekly journal content. It should not submit the journal online or replace the official school template.

## 8. Backup Export Workflow

The backup export workflow helps protect local offline data.

1. User chooses export backup.
2. App gathers student profile data.
3. App gathers company profile data.
4. App gathers weeks.
5. App gathers daily logs.
6. App gathers photo attachments.
7. App gathers app settings.
8. App creates a JSON backup.
9. User saves the backup file manually.

The JSON backup should include photo metadata. If photo data is included, it may need to be converted to Base64, which can make the backup file large.

A future ZIP backup may be better for photo-heavy data, but ZIP export is not required for v1.0.

## 9. Backup Restore Workflow

The backup restore workflow replaces the current local app data with a selected backup.

1. User chooses import or restore.
2. User selects a JSON backup file.
3. App checks that the file looks like an OJT Journal Companion backup.
4. App warns the user that restore will replace current local data.
5. User confirms the restore.
6. App replaces current local data with the backup contents.
7. App reloads or refreshes the restored local data view.

Merge behavior and import conflict handling are out of scope for v1.0.

## 10. Edit and Delete Workflow

The edit and delete workflow lets the student correct records while keeping related data understandable.

The user can edit:

- Student profile records
- Company profile records
- Weeks
- Daily logs
- Weekly summary fields
- Photo captions

Deletion behavior should be simple:

- Deleting a week should also delete or require deletion of related daily logs and photos.
- Deleting a daily log should also delete related photos.
- Deleting a photo should not delete the daily log.

Before deleting larger records such as weeks or daily logs, the app should warn the user about related records that will also be removed.

## 11. Offline Use Workflow

The offline use workflow describes how the app should behave as a local-first tool.

1. User opens the app in a supported browser.
2. App loads locally stored data from IndexedDB.
3. User creates, edits, reviews, and deletes records without needing internet.
4. App saves changes to the current device and browser.
5. User exports backups manually to protect data.

The app should work without internet once loaded.

Data stays on the current device and browser. Offline-first does not mean automatic sync between a phone and laptop.

The user must export backups to protect data, especially before clearing browser storage, changing devices, or doing browser maintenance.

## 12. v1.0 Workflow Boundaries

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
