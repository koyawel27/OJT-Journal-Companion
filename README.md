# OJT Journal Companion

A lightweight, offline-first personal browser app for one student or intern. Record daily OJT activities, track rendered hours, attach photo documentation, and prepare a weekly journal for copying or Official DOCX Export.

## Current status

The latest tagged stable release remains **v1.1**. Post-v1.1 Phases 1–4 are complete and merged into master. On `feature/brand-architecture`, the Phase 5C Journal workspace redesign and accepted Journal checkpoints are complete, and the Phase 5D Daily Log Editor redesign is complete through E3A. Phase 5E Journal and Daily Log Editor documentation synchronization is complete. This work has not created a new release or tag. No v1.2 release is implied.

## What this app is

OJT Journal Companion is a local, offline-first app for **one student on one browser/device**. It uses HTML, CSS, vanilla JavaScript, IndexedDB, and no bundler or framework. There is **no backend, no account/login system, and no cloud synchronization**.

Student, company, journal, task, photo, and app-settings records use IndexedDB. A small amount of non-authoritative browser UI/startup state may use localStorage for selected-week and appearance startup preferences. Journal content, photos, and JSON backup payloads are not stored in localStorage.

Browser storage can be cleared by the browser, device maintenance, or the user. Export a JSON backup regularly; it is the restorable recovery path. Official DOCX output is editable journal output and cannot restore app data.

## Main features

- Dashboard progress, current-week status, and backup reminders
- Journal workspace with week management, Daily Logs, day statuses, rendered-hour calculations, Daily Tasks, weekly summaries, and day handoffs
- Responsive compact app shell with a centered content canvas, fixed mobile bottom navigation, and a floating wider-screen navigation dock for four destinations: Dashboard, Journal, Preview & Export, and Settings
- Local Warm Journal identity with the full product name, official tagline, scalable mark/favicon, shared SVG navigation icons, and no remote brand dependency
- System, Dark, and Light appearance preferences, plus a top Light/Dark quick switch; the preference persists and System remains available in Settings
- Batch Photo Documentation for JPEG, PNG, and WebP files
- JSON backup, Restore Review, replace-style restore, Storage Health, and guarded local-data reset
- Official DOCX Export for the selected week


### Journal workspace and Daily Log Editor

The accepted Journal workspace uses the selected-week workflow, single-open accessible Daily Record accordions, real stored-photo thumbnails, Daily Record summaries, a Weekly Summary section, and Light/Dark responsive behavior. The shell uses a compact top app bar, centered content canvas, mobile bottom navigation, and a floating desktop/tablet navigation dock.

The Daily Log Editor is a rounded mobile bottom sheet and contained desktop dialog with a fixed header and independently scrolling document-like body. It preserves date/day identity, Worked/Absent/No OJT / Rest Day status, time and rendered-time fields, existing validation and focus behavior, Daily Tasks with Hours and Minutes controls, total-minute task storage independent of rendered hours, focused Add/Edit Task subviews, Photo Documentation cards, metadata editing, download/deletion, Day Remarks, save feedback, and a separated Delete Day danger action.

The editor behavior is documented as verified interaction behavior, not formal WCAG certification. Verified controls include dialog semantics, focus trap, Escape close, background inertness, focus restoration, visible focus, associated labels and validation messages, touch-friendly targets, no horizontal overflow, and usable 200% text sizing at 390px.

Stored-photo replacement is not present in the current baseline. Existing add-photo, Blob-backed rendering, metadata editing, download, deletion, object-URL cleanup, JPEG/PNG/WebP validation, and the existing 5 MB limit remain supported.

### Photo groups

One upload action may select one or multiple JPEG, PNG, or WebP files. The files share one category and caption, while each stored photo remains independently downloadable and deletable. Journal displays grouped photos with shared metadata once. Official DOCX Export preserves set-aware photo layouts.

### Preview and DOCX

Browser Preview & Export is optimized for responsive reading, accessibility, review, and correction. Official DOCX Export retains the official journal structure and remains editable. Copy and DOCX output do not include the browser Preview explanatory note. DOCX is not a restorable app backup.

## Backup and recovery

JSON backup includes the local journal data and photo data needed for restore. Restore uses Restore Review, blocks fatal validation errors, shows nonfatal warnings, and replaces current local data only after explicit confirmation. It does not merge backups. Storage Health provides approximate usage and persistence information, but persistence is not guaranteed; JSON backups remain necessary.

## How to run locally

No build step is required. Serve the static app folder through local HTTP:

~~~powershell
cd C:\xampp-projects\ojt-journal-companion
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8765 -t app
~~~

Then open http://127.0.0.1:8765/. Direct file URL opening is not supported for reliable DOCX template loading. The app still has no backend application logic or internet requirement.

## Official DOCX Export

Official DOCX Export creates an editable Word document for the selected week, including dynamic day rows, rendered-hour totals, weekly summaries, signatures, and a set-aware Photo Documentation appendix when photos exist. JPEG and PNG images are used directly; WebP is converted temporarily for export without changing the stored photo.

## Scope boundaries

In scope: one local student, browser-stored journal data, JSON backups, Restore Review, Storage Health, responsive navigation, and client-side DOCX generation.

Out of scope: backend services, PHP application logic, login/accounts, cloud sync, online submission, Google Drive integration, coordinator/admin dashboards, GPS or QR attendance, PDF export, and school-wide or multi-user deployment.

## Template safety

A private approved official template may be used locally when available. It is ignored by Git and must never be committed. The tracked sanitized v2 template remains the public fallback.

## Related documentation

| Document | Description |
| --- | --- |
| docs/FEATURES.md | Current implemented feature inventory |
| docs/PROJECT_HANDOFF.md | Primary continuation and closeout document |
| docs/POLISH_ROADMAP.md | Authoritative post-v1.1 roadmap |
| docs/WORKFLOWS.md | Current user workflows |
| docs/DATA_STRUCTURE.md | Current local data shape and compatibility |
| docs/BUILD_PLAN.md | Historical v1.0 build plan |
| docs/PROJECT_BRIEF.md | Baseline project definition |
