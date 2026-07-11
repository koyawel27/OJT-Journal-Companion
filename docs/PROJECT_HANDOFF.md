# OJT Journal Companion - Project Handoff

Use this document to continue development or onboard a developer.

**Release context:** v1.0 is the original baseline release. Official DOCX Export with an automatic photo appendix is merged into master and released as v1.1. Final regression passed. The v1.1 Git tag is the remaining repository release action.

## Project summary

OJT Journal Companion is a personal offline-first browser app for one student on one browser/device. It records daily OJT work, calculates rendered hours, stores photo documentation, and prepares weekly journals for copy or DOCX export.

The app is a companion, not a school system. It has no backend, PHP application logic, login, cloud sync, online submission, approval workflow, or PDF export.

## Runtime architecture

| Layer | Current choice |
| --- | --- |
| App | HTML, CSS, vanilla JavaScript |
| Storage | IndexedDB |
| DOCX engine | Locally vendored docx-templates 4.15.0 browser build |
| Server requirement | Local/static HTTP for template fetches |
| Build/runtime install | None |

The repository is a static web app folder even when stored under C:\xampp-projects.

### Script order

1. db.js
2. storage.js
3. calculations.js
4. photos.js
5. ui.js
6. app.js
7. profile.js
8. weeks.js
9. daily-logs.js
10. journal-payload.js
11. docx-export-v2.js as a module
12. journal-preview.js
13. backup.js

Key globals include window.OJTDB, window.OJTStorage, window.OJTCalculations, window.OJTPhotos, window.OJTUI, window.OJTApp, window.OJTJournalPayload, and window.OJTDocxExportV2.

## Current status

| Area | Status |
| --- | --- |
| v1.0 core workflow | Released baseline |
| Dashboard, mobile tabs, backup/restore/reset | Complete |
| Official DOCX Export | v1.1 released and merged into master |
| Automatic photo appendix | v1.1 released and merged into master |
| v1.1 tag/release | Tag creation and push remain |
| PDF export, PWA, cloud workflows | Deferred |

## Data rules that must not change

- Daily rendered hours come from DailyLog time fields and stored renderedMinutes.
- Weekly totals sum related DailyLog renderedMinutes.
- DailyTask timeSpentMinutes is documentation only.
- Task status is personal tracking, not approval or grading.
- Daily logs link to weeks; tasks and photos link to daily logs.
- Deleting a daily log cascades to its tasks and photos.
- JSON restore replaces all local data; reset clears all stores.

## Official DOCX Export

### Key files

| Purpose | File |
| --- | --- |
| Shared payload | app/assets/js/journal-payload.js |
| Production exporter | app/assets/js/docx-export-v2.js |
| Visible export button and warnings | app/assets/js/journal-preview.js |
| Sanitized tracked template | app/assets/templates/bpc-ojt-weekly-journal.v2.docx |
| Private local template | app/assets/templates/bpc-ojt-weekly-journal.private.v2.docx |
| Vendored browser dependency | app/assets/vendor/docx-templates-4.15.0/browser.js |
| Active command contract | docs/DOCX_TEMPLATE_PLACEHOLDERS.md |

The private template is ignored and must never be staged or committed. The sanitized v2 template is the tracked fallback.

### Export workflow

Weekly Preview
-> selected week ID
-> OJTDocxExportV2.exportWeekById(...)
-> full journal payload and related PhotoAttachment loading
-> image processing
-> v2 DOCX template
-> browser download

The visible button uses the selected week ID rather than a stale preview-only payload. The exporter fetches current profile, company, weeks, DailyLogs, DailyTasks, and PhotoAttachments before creating the document.

### Export behavior

- Header fields, dynamic Day 1 through Day N rows, date-inclusive labels, task description/duration/status, totals, summaries, and blank signatures
- Private-first v2 template loading with sanitized fallback on private-template 404
- Only photos linked to DailyLogs in the selected week
- Photo order follows existing createdAt ordering
- JPEG and PNG direct handling; temporary WebP-to-PNG conversion without modifying the stored Blob
- Aspect-ratio preservation and no upscaling
- Conditional appendix: no photos means no appendix heading, break, grid, or media
- Two-column photo rows, same-cell captions, non-splitting rows, keep-with-next day headings, and visually empty odd right cells
- Output remains editable; optional manual photo resizing is allowed

Template commands execute only in the normal docx-templates sandbox. Templates are developer-controlled; do not add noSandbox: true or user template uploads.

## Student workflow

1. Save profile, company, and settings.
2. Create an OJT week.
3. Save Daily Logs, tasks, and photo attachments.
4. Fill weekly summaries.
5. Open Weekly Preview, review, copy text or export the selected week DOCX.
6. Export JSON backups regularly.

JSON backup/restore is separate from DOCX export. JSON preserves app data; DOCX is an editable submission document.

## Local running

Serve app through local HTTP. For the usual XAMPP PHP server:

~~~powershell
cd C:\xampp-projects\ojt-journal-companion
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8765 -t app
~~~

Open <http://127.0.0.1:8765/>. Direct file:// opening is not supported for reliable DOCX template loading.

## Regression checklist

### Core safety

- [ ] Weekly Preview still renders
- [ ] Copy Weekly Journal remains unchanged
- [ ] Dashboard totals remain correct
- [ ] Daily Log/task CRUD remains correct
- [ ] Photo add, caption edit, download, and removal remain correct
- [ ] JSON backup, restore, and reset remain unchanged

### DOCX export

- [ ] No-photo week
- [ ] JPEG, PNG, and WebP
- [ ] Portrait and landscape images
- [ ] Two photos, odd photo count, multiple photos, and multiple days
- [ ] Missing and long captions
- [ ] 5-, 6-, and 7-day weeks
- [ ] Warning accept and cancel behavior
- [ ] Correct rendered-hours total and task documentation fields
- [ ] No template-command leakage
- [ ] Word opens the document without repair
- [ ] LibreOffice opens or converts successfully
- [ ] Private template remains ignored and unstaged
- [ ] Sanitized v2 fallback works when the private template is unavailable

The compact two-column appendix layout was manually accepted. Configurable image sizing is a possible future polish item, not a v1.1 requirement.

## Release steps

1. Create and push the v1.1 Git tag.
2. Keep release notes synchronized with the active v2 export path.

## Deferred work

PDF export, PWA installability, stronger photo compression, search, configurable image sizing, login, cloud sync, online submission, supervisor dashboards, and multi-user deployment remain out of scope unless explicitly approved.