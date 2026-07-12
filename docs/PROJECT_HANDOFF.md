# OJT Journal Companion - Project Handoff

Use this document to continue development or onboard a developer.

**Release context:** v1.0 is the original baseline release. Official DOCX Export with an automatic photo appendix is merged into master and released and tagged as v1.1. Final regression passed, and v1.1 is the stable rollback baseline. Phase 1 Journal UX Architecture is complete on the post-v1.1 roadmap; it is not a new tagged release. The next approved work is Phase 2 planning.

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
5. selected-week.js
6. ui.js
7. app.js
8. profile.js
9. weeks.js
10. daily-logs.js
11. journal-payload.js
12. docx-export-v2.js as a module
13. journal-preview.js
14. backup.js

`docx-export-v2.js` is loaded directly by `app/index.html` as a module and exposes `window.OJTDocxExportV2`.

Key globals include `window.OJTDB`, `window.OJTStorage`, `window.OJTCalculations`, `window.OJTPhotos`, `window.OJTSelectedWeek`, `window.OJTUI`, `window.OJTApp`, `window.OJTJournalPayload`, and `window.OJTDocxExportV2`.

## Current status

| Area | Status |
| --- | --- |
| v1.0 core workflow | Released baseline |
| Dashboard, mobile tabs, backup/restore/reset | Complete |
| Official DOCX Export | v1.1 released and merged into master |
| Automatic photo appendix | v1.1 released and merged into master |
| v1.1 tag/release | Released and tagged; stable post-release baseline |
| Phase 1 Journal UX Architecture | Complete; regression accepted on the post-v1.1 roadmap |
| Shared selected-week state | Complete through `window.OJTSelectedWeek` |
| Journal workspace | Complete; Weeks, Daily Logs, tasks, photos, summaries, and Log Today are consolidated |
| Preview & Export | Complete; review, copy, Official DOCX, and return-to-Journal handoffs remain available |
| Settings | Complete; Student, Company, Preferences, and Data & Recovery handoffs are available |
| Phase 2 Photo Documentation Groups | Next; focused migration/compatibility design review required before implementation |
| PDF export and cloud workflows | Deferred; PWA is scheduled in roadmap Phase 6 |

## Post-v1.1 roadmap

`docs/POLISH_ROADMAP.md` is the authoritative post-v1.1 product, UX, hardening, PWA, and beta roadmap. Phase 1 — Journal UX Architecture is complete: Weeks and Daily Logs are consolidated into one Journal workspace with shared selected-week behavior. The next approved work is Phase 2 planning; do not treat deferred items below as a competing implementation order.

## Current UI architecture

The app has four top-level destinations:

- **Dashboard:** Overall and selected-week progress, with a direct Daily Progress day-to-Journal handoff.
- **Journal:** Selected-week navigation, Week CRUD, compact All Weeks, Daily Logs, tasks, current photo attachments, weekly summaries, and Log Today.
- **Preview & Export:** Review, Copy Weekly Journal, Official DOCX export, and return-to-Journal correction handoffs.
- **Settings:** Student Details, Company/OJT Placement, App Preferences, and Data & Recovery for backup, restore, and reset.

Weeks, Daily Logs, Profile, and Backup are not separate top-level destinations. The internal `weekly-preview` section ID and `journal-preview.js` filename remain unchanged; user-facing navigation calls this destination **Preview & Export**.

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

Preview & Export
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

1. Open Settings and save Student Details, Company/OJT Placement, and App Preferences; use Data & Recovery for backup, restore, and reset.
2. Open Journal and create or select an OJT week; a newly created week becomes selected.
3. Save Daily Logs, tasks, and current photo attachments in Journal.
4. Fill weekly summaries in Journal.
5. Use Dashboard or Journal day handoffs to open the correct Journal date when correcting a daily entry.
6. Open Preview & Export to review, copy text, or export the selected week DOCX; return to Journal when a correction is needed.
7. Export JSON backups regularly from Settings → Data & Recovery.

JSON backup/restore is separate from DOCX export. JSON preserves app data; DOCX is an editable submission document.

## Local running

Serve app through local HTTP. For the usual XAMPP PHP server:

~~~powershell
cd C:\xampp-projects\ojt-journal-companion
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8765 -t app
~~~

Open <http://127.0.0.1:8765/>. Direct file:// opening is not supported for reliable DOCX template loading.

## Regression checklist

**Phase 1 closeout:** The Journal UX Architecture regression is accepted. Static checks passed, and manual review covered selected-week synchronization, Week/DailyLog/task/photo/summary behavior, Dashboard handoffs and calculations, Preview & Export, Settings tabs and handoffs, backup/restore/reset, Copy Weekly Journal, and representative DOCX export across desktop, tablet, and mobile layouts. Native-browser paths that automated checks could not fully cover were manually checked. No confirmed Phase 1 defect remains. The checklist below remains a useful ongoing safety list; it does not claim that every future browser/image-matrix item was executed in this closeout.

### Core safety

- [ ] Preview & Export still renders
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

## Next development step

The next development step is **Phase 2 — Photo Documentation Groups**, but implementation must not start from this closeout. Begin with the focused migration and compatibility design review described in `docs/POLISH_ROADMAP.md`, covering:

- group and attachment shapes, IndexedDB versioning, and migration of existing `PhotoAttachment` records, including implicit one-photo legacy groups;
- ordering, cascade behavior, backup version/format, old-backup restore, rollback/recovery, and populated v1.1 database/legacy-backup tests; and
- Preview/DOCX payload compatibility and representative no-photo/photo export coverage.

Do not approve a final schema or change application code until that review is complete. Preserve the v1.1 rollback baseline and the accepted Phase 1 architecture.

## Deferred work

PDF export, stronger photo compression, search, configurable image sizing, login, cloud sync, online submission, supervisor dashboards, and multi-user deployment remain out of scope unless explicitly approved. PWA work is planned only through the ordered phases in `docs/POLISH_ROADMAP.md`.
