# OJT Journal Companion Features

## Feature overview

OJT Journal Companion is a personal offline-first journal companion for one student using browser-local data. It records daily OJT work, rendered hours, task details, photo documentation, and weekly journal content.

**v1.0 status:** released baseline.

**v1.1 status:** Released, merged, and tagged after final regression. Official DOCX Export with an automatic photo appendix is included. v1.1 remains the stable released rollback baseline.

The app is not an internship management system. It has no accounts, approval workflow, online submission, or automatic cross-device sync.

## Implemented features

- Student profile, company profile, and personal settings
- OJT week creation and weekly summaries
- Daily Logs with worked, absent, and rest-day handling
- Rendered-hours calculation from DailyLog time records
- Structured tasks with description, optional duration, and personal status
- JPEG, PNG, and WebP photo attachments with optional captions
- Weekly Preview and Copy Weekly Journal
- Dashboard OJT progress and backup reminder
- JSON backup/export, replace-style restore, and guarded reset

## Official DOCX Export - v1.1 released

The Weekly Preview export button creates one editable Word document for the selected week.

The export includes:

- Student name, company, week number, and inclusive dates
- Dynamic Day 1 through Day N rows, each with its actual date
- Task description, optional duration, and task status
- Total weekly rendered hours
- Skills Learned, Problems Encountered, and Reflection / Points of Learning
- Blank student and supervisor signature areas
- Optional Photo Documentation appendix after the journal section

Photo documentation is grouped by day and date in a compact two-column layout. Images and captions stay together, rows do not split across pages, and an odd final photo leaves the right side visually empty.

JPEG and PNG images are used directly. WebP images are converted temporarily to PNG for the export; the original saved photo is not changed. Captions are optional, long captions wrap naturally, and the resulting DOCX stays editable.

The exporter tries a locally ignored private approved v2 template first, then uses the tracked sanitized v2 fallback. It requires local HTTP serving for reliable template loading.

## Boundaries

- JSON backup/restore is separate from DOCX export: JSON protects app data; DOCX is a submission document.
- Daily rendered hours come from DailyLog renderedMinutes. Task duration is documentation only.
- DOCX export is client-side only. There is no backend, cloud storage, runtime npm install, or CDN.
- PDF export, online submission, account/login, cloud sync, and supervisor approval remain out of scope.

## Future candidates

- PWA installability
- PDF export
- Better photo compression and photo-heavy backup handling
- Search and printable weekly views
- Configurable DOCX image sizing, if needed after real-world use