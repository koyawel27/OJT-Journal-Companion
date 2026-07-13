# OJT Journal Companion - Project Handoff

Use this document to continue development or onboard a developer.

**Release context:** v1.0 is the original baseline release. Official DOCX Export with an automatic photo appendix is merged into master and released and tagged as v1.1. Final regression passed, and v1.1 is the stable rollback baseline and latest tagged stable release. Phase 1 Journal UX Architecture, Phase 2 Batch Photo Documentation, and Phase 3 Data and Recovery Hardening are complete post-v1.1 roadmap work; none is a new tagged release. **Phase 4 - Accessible Responsive Visual Redesign is the next approved roadmap phase.**

## Project summary

OJT Journal Companion is a personal offline-first browser app for one student on one browser/device. It records daily OJT work, calculates rendered hours, stores photo documentation, and prepares weekly journals for copy or DOCX export.

The app is a companion, not a school system. It has no backend, PHP application logic, login, cloud sync, online submission, approval workflow, or PDF export.

## Runtime architecture

| Layer | Current choice |
| --- | --- |
| App | HTML, CSS, vanilla JavaScript |
| Storage | IndexedDB version 4 |
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
| Automatic photo appendix | v1.1 released; Phase 2 set-aware layout complete |
| v1.1 tag/release | Released and tagged; stable post-release baseline |
| Phase 1 Journal UX Architecture | Complete; regression accepted on the post-v1.1 roadmap |
| Phase 2 Batch Photo Documentation | Complete; accepted implementation at `a7a0775` |
| Shared selected-week state | Complete through `window.OJTSelectedWeek` |
| Journal workspace | Complete; Weeks, Daily Logs, tasks, batch photo sets, summaries, and Log Today are consolidated |
| Preview & Export | Complete; review, copy, Official DOCX, and return-to-Journal handoffs remain available |
| Settings | Complete; Student, Company, Preferences, and Data & Recovery handoffs are available |
| Phase 3 Data and Recovery Hardening | Complete; validation, restore review, and Storage Health accepted |
| PDF export and cloud workflows | Deferred; PWA is scheduled in roadmap Phase 6 |

## Post-v1.1 roadmap

`docs/POLISH_ROADMAP.md` is the authoritative post-v1.1 product, UX, hardening, PWA, and beta roadmap. Phase 1 - Journal UX Architecture, Phase 2 - Batch Photo Documentation, and Phase 3 - Data and Recovery Hardening are complete. **Phase 4 - Accessible Responsive Visual Redesign is the next approved roadmap phase.**

## Current UI architecture

The app has four top-level destinations:

- **Dashboard:** Overall and selected-week progress, with a direct Daily Progress day-to-Journal handoff.
- **Journal:** Selected-week navigation, Week CRUD, compact All Weeks, Daily Logs, tasks, batch photo sets, weekly summaries, and Log Today.
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
- Batch photos use optional `photoSetId` and `photoSetIndex` on existing `PhotoAttachment` records only; there is no separate group store, no migration, `DB_VERSION` remains `4`, and backup version remains `1.0`.

## Phase 3 Data and Recovery Hardening

Phase 3 is completed post-v1.1 roadmap work. It did not change DB_VERSION = 4, backupVersion = "1.0", the seven existing IndexedDB stores, the backup JSON structure, or replace-style restore. No migration or new object store was added.

### Validation and export integrity

The supported backup gate requires exact app identity and backup version "1.0", required structure, duplicate IDs, and parent references from Daily Logs to OJT Weeks, Daily Tasks to Daily Logs, and Photo Attachments to Daily Logs. Export and restore photo checks cover JPEG, PNG, and WebP MIME types, Base64, and a usable non-empty Blob. Invalid export data blocks download; invalid restore data is rejected before any IndexedDB write.

Safe unknown fields and legacy photos without Phase 2 set metadata remain compatible with nonfatal warnings. Restore creates a normalized in-memory candidate without mutating parsed backup data. fileDataBase64 and fileDataType are transport-only and are removed before persistence; restored fileType matches the reconstructed Blob type. Current app normalization is applied to dayStatus and photoCategory. This validation is focused on the implemented backup, relationship, and photo integrity rules; it does not claim broad strict validation for every optional date or time field.

### Restore review and safety export

The current workflow is:

Select JSON backup
-> parse and validate
-> show restore review
-> show metadata, counts, errors, and warnings
-> optionally export current data first
-> explicitly choose Restore This Backup
-> final replace confirmation
-> existing atomic replace transaction
-> reload

One in-memory pending review holds the parsed data, validation result, and normalized candidate. The review shows file information, metadata, counts, profile/settings presence, categorized fatal errors, and nonfatal warnings. Details are limited to a readable count while total counts remain visible. Invalid backups cannot restore; warning-only backups may restore. A new file replaces the previous pending review, and Cancel Restore clears the pending state and file selection. Analysis does not perform a second parse, validation, or photo decode.

Export Current Data First reuses the existing JSON export workflow, including export validation, large-export confirmation, lastBackupDate, Dashboard reminder refresh, and ojt:backup-exported. It does not duplicate backup logic or automatically continue with restore. Restore and safety export are mutually exclusive and repeated activation is guarded. Final confirmation cancellation performs no write and keeps the review available. Failed replacement restores controls and keeps the review; successful replacement uses the existing one-transaction path and reloads.

### Storage Health and recovery guidance

Settings reports approximate browser-reported site/origin usage, quota, and a percentage only when valid. Unsupported or failed APIs show graceful unavailable/error states without NaN, Infinity, or fabricated values. Persistent-storage status distinguishes granted, not granted, unavailable, and check failure. Request Persistent Storage is explicit and guarded; no automatic persistence request occurs. Refresh Storage Status is guarded, does not reload, and does not modify app data. Storage Health values remain in memory only and are not stored in IndexedDB, localStorage, or JSON backup data.

Guidance explains browser-profile-local data, clearing and maintenance/device loss, temporary private browsing storage, non-transfer between browsers/profiles/devices, portable JSON recovery backups, outside-browser backup storage, editable non-restorable DOCX output, and that persistent storage may reduce eviction risk but cannot prevent all data loss. Persistence is not guaranteed, and cloud sync does not exist.

### Phase 3 closeout

Focused automated assertions, JavaScript syntax checks, and repository checks passed. Primary-browser manual verification passed with no observed blocking defect. Valid export/restore, invalid-version blocking, warning-only review, safety export, restore cancellation, successful restore, Storage Health, responsive behavior, and cross-phase regression paths were reviewed. Broader cross-browser/device testing remains future testing.

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
-> image processing and photo-set grouping
-> v2 DOCX template
-> browser download

The visible button uses the selected week ID rather than a stale preview-only payload. The exporter fetches current profile, company, weeks, DailyLogs, DailyTasks, and PhotoAttachments before creating the document.

### Export behavior

- Header fields, dynamic Day 1 through Day N rows, date-inclusive labels, task description/duration/status, totals, summaries, and blank signatures
- Private-first v2 template loading with sanitized fallback on private-template 404
- Only photos linked to DailyLogs in the selected week, grouped into lightweight photo sets with legacy singleton handling
- Photo-set order within one DailyLog: (1) earliest valid `createdAt` across all images in the set; (2) stable set key as tie-breaker
- Image order within one set: (1) valid non-negative `photoSetIndex`; (2) valid `createdAt`; (3) attachment ID
- JPEG and PNG direct handling; temporary WebP-to-PNG conversion without modifying the stored Blob
- Aspect-ratio preservation; no cropping, stretching, or upscaling
- Conditional appendix: no photos means no appendix heading, break, grid, or media
- Set-aware appendix layout: one centered image, two columns, three columns, or two-column rows for four or more images within a set
- One shared caption below the complete set; category is not exported; images from separate sets never share one row
- Keep-with-next day headings; non-splitting rows within grid sets; odd grid rows suppress the placeholder right image
- Output remains editable; optional manual photo resizing is allowed
- The original accepted Part 3B margins remain active. Moderate margins were evaluated but not adopted; templates were fully restored after the experiment, and no widened table layout was adopted

Template commands execute only in the normal docx-templates sandbox. Templates are developer-controlled; do not add noSandbox: true or user template uploads.

### Template XML maintenance warning

A generic XML serializer rewrote WordprocessingML prefixes from `w:` to `ns0:`. The current DOCX command-processing path depends on the established `w:` command-containing elements, causing template commands to leak into generated exports. Do not mutate active DOCX template XML using a generic serializer that may rewrite prefixes. Use a prefix-preserving OOXML/package workflow and validate a real application export immediately after every template change.

## Student workflow

1. Open Settings and save Student Details, Company/OJT Placement, and App Preferences; use Data & Recovery for backup, restore, and reset.
2. Open Journal and create or select an OJT week; a newly created week becomes selected.
3. Save Daily Logs, tasks, and photo sets in Journal.
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

**Phase 2 closeout:** Batch Photo Documentation regression is accepted at implementation checkpoint `a7a0775`. Review covered one and multiple file uploads, shared metadata edits, legacy singleton photos, deletion of first/middle/final images in a set, backup/restore, 1/2/3/4+ image DOCX layouts, one caption per set, no category export, no cross-set row packing, private and sanitized templates, Microsoft Word and LibreOffice opening, and command-leak checks. **Resolved pagination finding:** Microsoft Word placed the sanitized fallback reflection and signature content on page 2. The page contained legitimate content and was not blank. No DOCX patch was required.

### Core safety

- [ ] Preview & Export still renders
- [ ] Copy Weekly Journal remains unchanged
- [ ] Dashboard totals remain correct
- [ ] Daily Log/task CRUD remains correct
- [ ] Photo batch upload, shared metadata edit, download, and removal remain correct
- [ ] JSON backup, restore, and reset remain unchanged

### DOCX export

- [ ] No-photo week
- [ ] JPEG, PNG, and WebP
- [ ] Portrait and landscape images
- [ ] One-, two-, three-, and four-or-more-image photo sets
- [ ] Multiple photo sets and multiple days
- [ ] Missing and long shared captions
- [ ] 5-, 6-, and 7-day weeks
- [ ] Warning accept and cancel behavior
- [ ] Correct rendered-hours total and task documentation fields
- [ ] No template-command leakage
- [ ] Word opens the document without repair
- [ ] LibreOffice opens or converts successfully
- [ ] Private template remains ignored and unstaged
- [ ] Sanitized v2 fallback works when the private template is unavailable

Configurable image sizing is a possible future polish item, not a v1.1 requirement.

## Next development step

**Phase 4 - Accessible Responsive Visual Redesign is the next approved roadmap phase. Preserve the v1.1 rollback baseline, accepted Phase 1 architecture, completed Phase 2 batch photo behavior, and completed Phase 3 recovery hardening while improving the accessible responsive shell.**

## Deferred work

PDF export, stronger photo compression, search, configurable image sizing, login, cloud sync, online submission, supervisor dashboards, and multi-user deployment remain out of scope unless explicitly approved. PWA work is planned only through the ordered phases in `docs/POLISH_ROADMAP.md`.
