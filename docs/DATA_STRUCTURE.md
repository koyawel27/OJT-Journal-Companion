# OJT Journal Companion Data Structure

## Current storage contract

The app is an offline-first browser app for one student on one browser/device.

- DB_VERSION = 4
- backupVersion = "1.0"
- Seven IndexedDB object stores:
  - studentProfile
  - companyProfile
  - appSettings
  - ojtWeeks
  - dailyLogs
  - dailyTasks
  - photoAttachments
- No new store, migration, or database-version increase was added for Phase 4.
- JSON restore remains replace-style, not merge-style.

IndexedDB is authoritative for application records. Small non-authoritative UI/startup preferences may use localStorage.

## StudentProfile

Stores student identity and journal output context.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| studentName | string | Student name. |
| courseOrProgram | string | Course or program. |
| schoolOrInstitution | string | School or institution. |
| sectionOrYearLevel | string | Section, year level, or class detail. |
| requiredOjtHours | number | Zero or positive required hours. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

## CompanyProfile

Stores the OJT placement context.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| companyName | string | Company or organization. |
| companyAddress | string | Company address. |
| departmentOrAssignedArea | string | Department or assigned area. |
| supervisorName | string | Supervisor or contact person. |
| supervisorContact | string | Optional contact detail. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

## OJTWeek

Groups daily logs into a weekly journal period.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| weekNumber | number | Student week number. |
| inclusiveStartDate | string | YYYY-MM-DD start date. |
| inclusiveEndDate | string | YYYY-MM-DD end date. |
| weeklySkillsLearned | string | Weekly skills summary. |
| problemsEncountered | string | Weekly problems summary. |
| reflectionOrPointsOfLearning | string | Weekly reflection. |
| additionalNotes | string | Optional weekly notes. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

Weekly rendered time is calculated from related DailyLog records, not manually typed into the week.

## DailyLog

Stores one day/status/time record.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| weekId | string | Related OJTWeek ID. |
| entryDate | string | YYYY-MM-DD. |
| dayStatus | string | Worked, Absent, or No OJT / Rest Day. |
| timeIn | string | HH:mm for Worked days. |
| timeOut | string | HH:mm for Worked days. |
| breakMinutes | number | Non-negative break duration. |
| renderedMinutes | number | Calculated official rendered time. |
| renderedHours | number | Display convenience value. |
| dayRemarks | string | Optional day remarks. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

For Worked days, official rendered time comes from timeIn, timeOut, and breakMinutes. Absent and rest-day records save zero rendered minutes. Same-day time records are supported; overnight shifts are out of scope.

## DailyTask

Stores a structured accomplishment item under a DailyLog.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| dailyLogId | string | Related DailyLog ID. |
| description | string | Task or work description. |
| timeSpentMinutes | number | Optional documentation detail only. |
| status | string | Pending, In Progress, or Completed. |
| notes | string | Optional task notes. |
| sortOrder | number | Display order. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

Task time does not affect official rendered hours. Task status is personal tracking, not approval or grading.

## PhotoAttachment

Stores one imported photo and its metadata.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| dailyLogId | string | Related DailyLog ID. |
| fileName | string | Original/display name. |
| fileType | string | JPEG, PNG, or WebP MIME type. |
| fileSize | number | Size in bytes. |
| fileBlob | Blob | Imported image data in IndexedDB. |
| photoCategory | string | Documentation category. |
| caption | string | Optional shared caption for a batch. |
| photoSetId | string | Optional ID shared by one upload action. |
| photoSetIndex | number | Optional non-negative native selection index. |
| createdAt | string | ISO timestamp. |

One multi-file attach action shares one photoSetId. photoSetIndex preserves native selection order. Every photo remains an independent PhotoAttachment with individual download and delete actions. Legacy records without set metadata remain valid and act as singleton groups. No group store, migration, or DB-version increase exists. Stored indices are not renumbered when a photo is deleted; deleting the final image removes the logical group naturally.

## AppSettings

Stores local app preferences and backup reminder metadata.

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Unique local ID. |
| preferredWeekStartDay | string | Preferred weekly start day. |
| timeFormat | string | 12-hour or 24-hour display preference. |
| appearanceMode | string | Optional System, Dark, or Light value. |
| lastBackupDate | string | Optional ISO timestamp of last successful JSON export. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

appearanceMode is optional. Allowed values are System, Dark, and Light; the source value is system, dark, or light. Missing old values remain valid and default to System. Invalid restored values normalize to System with a nonfatal warning. No migration or DB-version increase was added. Timestamps continue to use ISO 8601 strings and are updated when settings are saved.

## Local-storage distinction

The exact non-authoritative localStorage keys are:

- ojt-journal-companion:selected-week-id — selected-week UI state.
- ojt-journal-companion:appearance-mode — startup appearance cache.

IndexedDB remains authoritative for profiles, company data, weeks, daily logs, tasks, photos, and AppSettings. localStorage does not contain journal content, task content, photos, or JSON backup payloads. localStorage is not an eighth data store.

## BackupData

JSON backup includes:

| Field | Type | Notes |
| --- | --- | --- |
| appName | string | OJT Journal Companion identity. |
| backupVersion | string | Exactly "1.0". |
| exportedAt | string | ISO timestamp. |
| studentProfile | object or null | StudentProfile record. |
| companyProfile | object or null | CompanyProfile record. |
| weeks | array | OJTWeek records. |
| dailyLogs | array | DailyLog records. |
| dailyTasks | array | DailyTask records. |
| photoAttachments | array | PhotoAttachment records and photo payloads. |
| appSettings | object or null | AppSettings record. |

There is no top-level backup-format change. Optional photoSetId and photoSetIndex fields export naturally. Optional appearanceMode exports inside AppSettings. Older supported backups without these optional fields remain compatible. Restore validates before writing, then performs replace-style atomic replacement after confirmation.

## Relationships and deletion

- One app has one StudentProfile, CompanyProfile, and AppSettings record.
- One app can have many OJTWeek records.
- One OJTWeek can have many DailyLog records through weekId.
- One DailyLog can have many DailyTask and PhotoAttachment records.
- Deleting a DailyLog deletes its related tasks and photos.
- Deleting a week is blocked while related DailyLogs remain.
- Reset clears all seven stores and selected-week state, resets appearance to System, and reconciles the appearance startup cache without changing the schema.

## Safety boundary

IDs remain their original values in storage and lookup. Dynamic HTML serialization escapes restored/user-controlled values. Selector contexts use selector-safe handling. No backup validation rule unnecessarily restricts arbitrary non-empty restored IDs.

## Storage and recovery notes

Browser storage limits and clearing behavior vary by browser and device. JSON backup is required for portable recovery. Official DOCX output is editable journal output, not a restorable app backup. Storage Health estimates and persistence status are runtime-only and do not change the data structure.
