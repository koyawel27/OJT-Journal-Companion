# OJT Journal Companion Data Structure

## 1. Data Structure Overview

This document defines the planned local data structure for OJT Journal Companion v1.0 before coding starts.

The app is a personal offline-first journal companion for one student. It should store student details, company details, weekly journal records, daily logs, basic photo documentation, and simple app settings using local browser storage.

This is not a server database design. The structure should stay simple enough for a beginner-friendly HTML, CSS, and JavaScript app.

## 2. Storage Direction

IndexedDB is the main storage direction for v1.0. It is better suited than plain localStorage for structured data, larger records, and possible photo-related data.

Recommended IndexedDB object stores:

- `studentProfile`
- `companyProfile`
- `ojtWeeks`
- `dailyLogs`
- `dailyTasks`
- `photoAttachments`
- `appSettings`

The data model should also support JSON backup/export and JSON import/restore. A backup file should contain all records needed to restore the student's local journal data.

For v1.0, JSON import/restore should replace the current local app data after user confirmation. Merge behavior and import conflict handling are out of scope for v1.0.

## 3. Main Data Entities

The v1.0 data model should include these main entities:

- `StudentProfile`
- `CompanyProfile`
- `OJTWeek`
- `DailyLog`
- `DailyTask`
- `PhotoAttachment`
- `AppSettings`
- `BackupData`

No extra entities should be added unless they clearly support the v1.0 journal workflow.

## 4. StudentProfile

Stores information about the student using the app.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `studentName` | string | Student's full name. |
| `courseOrProgram` | string | Course or program name. |
| `schoolOrInstitution` | string | School or institution name. |
| `sectionOrYearLevel` | string | Section, year level, or class detail. |
| `requiredOjtHours` | number | Total required OJT hours. |
| `createdAt` | string | Date and time the record was created. |
| `updatedAt` | string | Date and time the record was last updated. |

v1.0 should normally have one `StudentProfile` record because the app is for one student.

## 5. CompanyProfile

Stores information about the student's OJT placement.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `companyName` | string | Company or organization name. |
| `companyAddress` | string | Company address. |
| `departmentOrAssignedArea` | string | Department, team, or assigned work area. |
| `supervisorName` | string | Supervisor or contact person's name. |
| `supervisorContact` | string | Optional contact detail. |
| `createdAt` | string | Date and time the record was created. |
| `updatedAt` | string | Date and time the record was last updated. |

v1.0 should normally have one `CompanyProfile` record.

## 6. OJTWeek

Groups daily logs into a weekly journal period and stores weekly journal text fields.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `weekNumber` | number | Week number used by the student. |
| `inclusiveStartDate` | string | Start date of the week. |
| `inclusiveEndDate` | string | End date of the week. |
| `weeklySkillsLearned` | string | Summary of skills learned during the week. |
| `problemsEncountered` | string | Problems or challenges encountered during the week. |
| `reflectionOrPointsOfLearning` | string | Weekly reflection or points of learning. |
| `additionalNotes` | string | Optional weekly notes. |
| `createdAt` | string | Date and time the record was created. |
| `updatedAt` | string | Date and time the record was last updated. |

Weekly total hours should be calculated from related `DailyLog` records, not manually typed into `OJTWeek`.

## 7. DailyLog

Stores one day/time record for a daily OJT journal entry. Daily work details and accomplishment bullets belong in related `DailyTask` records.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `weekId` | string | ID of the related `OJTWeek`. |
| `entryDate` | string | Date of the daily log. |
| `dayStatus` | string | `Worked`, `Absent`, or `No OJT / Rest Day`. Missing older values should default to `Worked`. |
| `timeIn` | string | Start time for worked OJT days. Required only when `dayStatus` is `Worked`. |
| `timeOut` | string | End time for worked OJT days. Required only when `dayStatus` is `Worked`. |
| `breakMinutes` | number | Break duration in minutes for worked days. Defaults to `0` when empty. |
| `renderedMinutes` | number | Calculated rendered time in minutes. |
| `renderedHours` | number | Calculated rendered hours for the day. |
| `dayRemarks` | string | Optional reason or notes, especially useful for absent or rest days. |
| `createdAt` | string | Date and time the record was created. |
| `updatedAt` | string | Date and time the record was last updated. |

`renderedMinutes` should be the main stored calculated value because it avoids decimal rounding issues. `renderedHours` may be displayed by the app or stored only for convenience, but it should be derived from `renderedMinutes` or recalculated whenever `timeIn`, `timeOut`, `breakMinutes`, or `dayStatus` changes.

If `dayStatus` is `Worked`, official rendered hours should come from `timeIn`, `timeOut`, and `breakMinutes`. If `dayStatus` is `Absent` or `No OJT / Rest Day`, `timeIn` and `timeOut` are not required and `renderedMinutes` should be `0`.

For v1.0, daily logs should assume same-day time records only. Overnight shifts are out of scope unless added later.

If older local test records contain daily text fields such as activities, learnings, challenges, or notes, the app should stop displaying those fields as primary daily log fields. New saves should prefer the simplified `DailyLog` shape above.

## 8. DailyTask

Stores one structured task, work item, or bullet item under a daily log.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `dailyLogId` | string | ID of the related `DailyLog`. |
| `description` | string | Task or work item description. |
| `timeSpentMinutes` | number | Optional task-level time spent in minutes. This is documentation detail only. |
| `status` | string | Personal task status: `Pending`, `In Progress`, or `Completed`. |
| `notes` | string | Optional notes for the task item. |
| `sortOrder` | number | Display order within the daily log. |
| `createdAt` | string | ISO timestamp for when the task record was created. |
| `updatedAt` | string | ISO timestamp for when the task record was last updated. |

Daily tasks support bullet-style accomplishment records for each daily log. Task status is personal progress tracking only. It is not supervisor approval, official validation, grading, or submission status.

`timeSpentMinutes` may be useful as task-level documentation detail, but official daily rendered hours should still come from the related `DailyLog` time in, time out, and break duration fields.

## 9. PhotoAttachment

Stores basic photo documentation information for a daily log.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `dailyLogId` | string | ID of the related `DailyLog`. |
| `fileName` | string | Original or display file name. |
| `fileType` | string | File MIME type, such as `image/jpeg` or `image/png`. |
| `fileSize` | number | File size in bytes. |
| `fileBlob` | Blob | Imported image data stored locally in IndexedDB. |
| `photoCategory` | string | `General Documentation`, `Time In Photo`, `Time Out Photo`, `Task/Work Proof`, or `Other`. Missing older values should default to `General Documentation`. |
| `caption` | string | Optional caption or description. |
| `createdAt` | string | ISO timestamp for when the attachment record was created. |

Photo storage needs testing because browser storage behavior and size limits vary across browsers and devices. v1.0 should store imported photo data in IndexedDB as a `Blob` or equivalent browser-supported file data, along with related metadata. v1.0 should support basic attach/import, category labels, metadata storage, and removal from a daily log. Time in and time out photo categories are documentation labels only; they are not verified attendance, GPS proof, supervisor validation, or official proof logic. Advanced preview, gallery, compression, and image editing are not required for v1.0.

## 10. AppSettings

Stores simple local preferences for the app.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique local ID. |
| `preferredWeekStartDay` | string | Preferred start day for weekly grouping, such as `Monday`. |
| `timeFormat` | string | Preferred time display format, such as `12-hour` or `24-hour`. |
| `createdAt` | string | Date and time the record was created. |
| `updatedAt` | string | Date and time the record was last updated. |

Settings should stay minimal in v1.0.

## 11. BackupData Format

JSON export should include all data needed to restore the local app state.

| Field | Type | Notes |
| --- | --- | --- |
| `appName` | string | Should identify the app, such as `OJT Journal Companion`. |
| `backupVersion` | string | Version of the backup format. |
| `exportedAt` | string | Date and time the backup was exported. |
| `studentProfile` | object or null | The saved `StudentProfile` record. |
| `companyProfile` | object or null | The saved `CompanyProfile` record. |
| `weeks` | array | List of `OJTWeek` records. |
| `dailyLogs` | array | List of `DailyLog` records. |
| `dailyTasks` | array | List of `DailyTask` records. |
| `photoAttachments` | array | List of `PhotoAttachment` records. |
| `appSettings` | object or null | The saved `AppSettings` record. |

The backup format should be easy to inspect and restore. It should not depend on a server, user account, or cloud service.

JSON backup should include photo metadata. If photo data is included in the JSON backup, it may need to be converted to Base64. Including photos in JSON backup can make backup files large, especially if the student attaches many images.

A future ZIP backup may be better for photo-heavy data because photos can remain as separate files, but ZIP export is not required for v1.0.

For v1.0, importing a JSON backup should replace the current local app data after user confirmation. The app should not try to merge two backups or resolve import conflicts in v1.0.

## 12. Relationships Between Data

The data relationships should stay simple:

- One app has one `StudentProfile`.
- One app has one `CompanyProfile`.
- One app has one `AppSettings` record.
- One app can have many `OJTWeek` records.
- One `OJTWeek` can have many `DailyLog` records.
- One `DailyLog` belongs to one `OJTWeek` through `weekId`.
- One `DailyLog` can have many `DailyTask` records.
- One `DailyTask` belongs to one `DailyLog` through `dailyLogId`.
- One `DailyLog` can have many `PhotoAttachment` records.
- One `PhotoAttachment` belongs to one `DailyLog` through `dailyLogId`.

`OJTWeek` should group daily logs by `weekId`. `DailyTask` and `PhotoAttachment` should belong to a `DailyLog`.

Deletion behavior should be simple and predictable:

- Deleting an `OJTWeek` should also delete or require deletion of its related `DailyLog`, `DailyTask`, and `PhotoAttachment` records.
- Deleting a `DailyLog` should also delete its related `DailyTask` and `PhotoAttachment` records.
- Deleting a `DailyTask` should not delete the related `DailyLog`.
- Deleting a `PhotoAttachment` should not delete the related `DailyLog`.

## 13. Required Calculated Values

These values should be calculated by the app:

- Daily rendered minutes
- Daily rendered hours
- Weekly total minutes rendered
- Weekly total hours rendered
- Total rendered minutes across all daily logs
- Total rendered hours across all daily logs
- Remaining OJT hours, if `requiredOjtHours` is set

Daily rendered minutes should use `timeIn`, `timeOut`, and `breakMinutes` only when `dayStatus` is `Worked`. Daily rendered hours should be derived from rendered minutes for display. Absent and rest-day records should count as `0` rendered minutes.
`DailyTask.timeSpentMinutes` may be summed for reference only. If the task time total differs from the daily log's `renderedMinutes`, the app may show a soft warning later, but it should not block saving in v1.0.

Weekly total hours should be calculated from `DailyLog` records linked to the same `weekId`. It should not be manually typed into the `OJTWeek` record.

Total rendered hours should be calculated from all saved `DailyLog` records.

## 14. Validation Rules

Basic validation should help prevent incomplete or confusing records.

- `studentName` should not be empty once the student profile is saved.
- `companyName` should not be empty once the company profile is saved.
- `requiredOjtHours` should be zero or a positive number.
- `weekNumber` should be a positive number.
- `weekNumber` should be unique.
- `inclusiveStartDate` should not be later than `inclusiveEndDate`.
- `OJTWeek` date ranges should not overlap if practical.
- `entryDate` should not be empty for a daily log.
- `weekId` should refer to an existing `OJTWeek`.
- `dayStatus` should be `Worked`, `Absent`, or `No OJT / Rest Day`.
- If `dayStatus` is `Worked`, `timeIn` and `timeOut` are required.
- `timeIn` and `timeOut` should be valid time values when provided.
- `timeOut` should be later than `timeIn` for worked same-day logs.
- `breakMinutes` should be zero or a positive number.
- `breakMinutes` should not be greater than or equal to the total time between `timeIn` and `timeOut` for worked days.
- v1.0 assumes same-day time logs only; overnight shifts are out of scope unless added later.
- `renderedMinutes` should not be negative.
- `renderedHours` should not be negative.
- `dailyLogId` should refer to an existing `DailyLog` for each daily task.
- `DailyTask.description` should not be empty.
- `DailyTask.status` should be one of `Pending`, `In Progress`, or `Completed`.
- `DailyTask.timeSpentMinutes` should be zero or a positive number.
- `dailyLogId` should refer to an existing `DailyLog` for each photo attachment.
- `photoCategory` should be one of the allowed documentation labels.
- `fileSize` should be zero or a positive number.
- Photo files should be limited to supported image types such as JPEG, PNG, or WebP.
- A practical maximum photo file size should be tested before final coding.

Validation should stay beginner-friendly and practical. It should guide the student without adding complex approval workflows.

## 15. Important Storage Notes

IndexedDB stores data inside the browser on the local device. Offline-first does not mean automatic cross-device sync.

Data may be lost if the browser storage is cleared before the user exports a backup. JSON backup/export and JSON import/restore are required for v1.0 so the student can save and recover local data manually.

Photo storage must be tested carefully. Browser storage limits, file size behavior, and long-term storage behavior may vary by browser and device.

JSON backup should include photo metadata. If photo data is included in JSON backup, it may need to be converted to Base64, which can make backup files large. A future ZIP backup may be better for photo-heavy data, but ZIP export is not required for v1.0.

Dates and times should be stored in a consistent format so calculations and backup files stay predictable:

- Dates should use `YYYY-MM-DD`.
- Time fields should use 24-hour `HH:mm` format internally.
- `createdAt` and `updatedAt` should use ISO 8601 timestamp strings.

For v1.0, JSON import/restore should replace the current local app data after user confirmation. Merge/import conflict handling should not be designed for v1.0.

The data model should avoid unnecessary tables or entities. v1.0 should stay focused on one student's journal records.

## 16. v1.0 Data Boundaries

The v1.0 data structure should not include:

- Login or account records
- Passwords
- Admin users
- Coordinator users
- Supervisor approval records
- Online submission records
- Cloud sync metadata
- GPS attendance records
- QR attendance records
- Multi-user management
- School-wide deployment data
- Grading or evaluation records
- Payroll or allowance records

The data structure should support a lightweight local journal companion only. It should help one student record OJT work, calculate rendered hours, manage basic photo documentation, prepare weekly journal content, and export or restore local JSON backups.
