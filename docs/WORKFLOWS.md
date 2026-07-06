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
2. User creates or opens a daily log under that week.
3. User enters the entry date.
4. User chooses a day status: `Worked`, `Absent`, or `No OJT / Rest Day`.
5. If the day status is `Worked`, user enters time in, time out, and break minutes.
6. If the day status is `Absent` or `No OJT / Rest Day`, user may add optional day remarks.
7. User adds one or more structured task/work items under the daily log when useful.
8. Each task item may include a description, optional time spent, personal status, and notes.
9. App validates required fields.
10. App saves the daily log and related task items locally using IndexedDB.
11. Worked days calculate rendered time from the daily log time fields. Absent and rest-day records save `0` rendered minutes.

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

The photo documentation workflow supports basic local photo documentation for daily logs.

1. User opens or creates a daily log.
2. User attaches or imports photo documentation for that daily log.
3. User chooses a photo category such as `General Documentation`, `Time In Photo`, `Time Out Photo`, `Task/Work Proof`, or `Other`.
4. App stores photo metadata locally.
5. App stores imported image data locally using IndexedDB as a `Blob` or equivalent browser-supported file data.
6. User may add a caption.
7. User may remove photo documentation from the daily log.
8. App saves changes locally.

Photo metadata may include file name, file type, file size, category, caption, related daily log ID, and created timestamp.

Photo categories are simple documentation labels. Time in and time out photo categories should not be treated as verified attendance, GPS proof, supervisor validation, or official proof logic.

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

The backup export workflow helps protect local offline data.

1. User chooses export backup.
2. App gathers student profile data.
3. App gathers company profile data.
4. App gathers weeks.
5. App gathers daily logs.
6. App gathers daily task items.
7. App gathers photo attachments.
8. App gathers app settings.
9. App creates a JSON backup.
10. User saves the backup file manually.

The JSON backup should include photo metadata. If photo data is included, it may need to be converted to Base64, which can make the backup file large.

A future ZIP backup may be better for photo-heavy data, but ZIP export is not required for v1.0.

## 10. Backup Restore Workflow

The backup restore workflow replaces the current local app data with a selected backup.

1. User chooses import or restore.
2. User selects a JSON backup file.
3. App checks that the file looks like an OJT Journal Companion backup.
4. App warns the user that restore will replace current local data.
5. User confirms the restore.
6. App replaces current local data with the backup contents.
7. App reloads or refreshes the restored local data view.

Merge behavior and import conflict handling are out of scope for v1.0.

## 11. Edit and Delete Workflow

The edit and delete workflow lets the student correct records while keeping related data understandable.

The user can edit:

- Student profile records
- Company profile records
- Weeks
- Daily logs
- Daily task/work items
- Weekly summary fields
- Photo captions

Deletion behavior should be simple:

- Deleting a week should also delete or require deletion of related daily logs and photos.
- Deleting a daily log should also delete related task items and photos.
- Deleting a task item should not delete the daily log.
- Deleting a photo should not delete the daily log.

Before deleting larger records such as weeks or daily logs, the app should warn the user about related records that will also be removed.

## 12. Offline Use Workflow

The offline use workflow describes how the app should behave as a local-first tool.

1. User opens the app in a supported browser.
2. App loads locally stored data from IndexedDB.
3. User creates, edits, reviews, and deletes records without needing internet.
4. App saves changes to the current device and browser.
5. User exports backups manually to protect data.

The app should work without internet once loaded.

Data stays on the current device and browser. Offline-first does not mean automatic sync between a phone and laptop.

The user must export backups to protect data, especially before clearing browser storage, changing devices, or doing browser maintenance.

## 13. v1.0 Workflow Boundaries

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
