# OJT Journal Companion Features

## Feature overview

OJT Journal Companion is a personal offline-first journal companion for one student using browser-local data. It records daily OJT work, rendered hours, task details, photo documentation, and weekly journal content.

**v1.0 status:** released baseline.

**v1.1 status:** Released, merged, and tagged after final regression. Official DOCX Export with an automatic photo appendix is included. v1.1 remains the stable released rollback baseline.

**Post-v1.1 Phase 2 — Batch Photo Documentation:** Complete. This is completed roadmap work, not a new release or tag. **Post-v1.1 Phase 3 - Data and Recovery Hardening:** Complete. Phase 3 is completed roadmap work, not a new release or tag. Phase 4 Accessible Responsive Visual Redesign is the next approved roadmap phase. v1.1 remains the latest tagged stable release.

The app is not an internship management system. It has no accounts, approval workflow, online submission, or automatic cross-device sync.

## Implemented features

- Student profile, company profile, and personal settings
- OJT week creation and weekly summaries
- Daily Logs with worked, absent, and rest-day handling
- Rendered-hours calculation from DailyLog time records
- Structured tasks with description, optional duration, and personal status
- JPEG, PNG, and WebP photo attachments: one or multiple images per upload, shared category and caption per set, once-per-set Journal display, individual download and removal
- Weekly Preview and Copy Weekly Journal
- Dashboard OJT progress and backup reminder
- JSON backup/export, replace-style restore, and guarded reset

## Data and Recovery Hardening - Phase 3 complete

Phase 3 hardens the existing JSON recovery path without changing the backup shape, DB_VERSION = 4, backupVersion = "1.0", or the seven existing stores.

- **Backup/export integrity:** exact app identity and supported version gate, required structure, duplicate IDs, parent references, and JPEG/PNG/WebP MIME, Base64, and usable non-empty Blob validation. Invalid export data blocks download.
- **Restore validation:** invalid data is rejected before IndexedDB writes; safe unknown fields and legacy singleton photos remain compatible; normalized restore candidates do not mutate parsed backups and remove transport-only photo fields before persistence.
- **Restore review:** metadata, counts, profile/settings presence, categorized fatal errors, and nonfatal warnings appear before replacement. Warning-only backups may restore; invalid backups cannot.
- **Safety and replacement:** Export Current Data First reuses the existing export workflow. Restore requires explicit guarded confirmation, remains replace-style, and preserves the review after cancellation or failure.
- **Storage Health:** approximate site/origin usage, quota, and valid percentage; graceful API failures; persistent-storage status and explicit guarded request/refresh actions. Values remain runtime-only.
- **Recovery guidance:** data is local to the current browser profile; JSON is the portable recovery backup; DOCX is editable output and cannot restore app data; persistent storage may reduce eviction risk but cannot prevent all data loss, is not guaranteed protection, and cloud sync does not exist.
- **Reset preservation:** checkbox, exact RESET, final native confirmation, all-seven-store clearing, selected-week clearing, and backup-first guidance remain unchanged.

## Batch Photo Documentation — Phase 2 complete

One upload action may select one or multiple JPEG, PNG, or WebP files. The app creates one generated `photoSetId` per upload action and assigns `photoSetIndex` in native file-selection order. Every image remains a normal `PhotoAttachment`; shared category and caption are duplicated across set records. Journal displays shared metadata once per set, and shared metadata edits are atomic. Each image remains individually downloadable and deletable. Deleting the first image preserves shared metadata; stored indices are not renumbered; deleting the final image removes the set naturally. Legacy records without set metadata behave as runtime singleton sets. There is no separate group entity or store, no migration, `DB_VERSION` remains `4`, backup version remains `1.0`, and older supported backups remain compatible.

## Official DOCX Export — v1.1 released, Phase 2 appendix updated

The Official DOCX button in Preview & Export creates one editable Word document for the selected week.

The export includes:

- Student name, company, week number, and inclusive dates
- Dynamic Day 1 through Day N rows, each with its actual date
- Task description, optional duration, and task status
- Total weekly rendered hours
- Skills Learned, Problems Encountered, and Reflection / Points of Learning
- Blank student and supervisor signature areas
- Optional Photo Documentation appendix after the journal section when photos exist

Photo documentation is grouped by day and date, then by photo set within each day:

- One image: larger centered layout
- Two images: two columns
- Three images: three columns
- Four or more images: two-column rows within the set
- One shared caption below the complete set; category is not exported
- Images from separate sets never share one row

JPEG and PNG images are used directly. WebP images are converted temporarily to PNG for the export; the original saved photo is not changed. Aspect ratio is preserved; images are not cropped, stretched, or upscaled. Captions are optional, long captions wrap naturally, and the resulting DOCX stays editable. No-photo exports contain no photo appendix structure or generated image media.

The exporter tries a locally ignored private approved v2 template first, then uses the tracked sanitized v2 fallback. It requires local HTTP serving for reliable template loading. Microsoft Word and LibreOffice regression passed.

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
