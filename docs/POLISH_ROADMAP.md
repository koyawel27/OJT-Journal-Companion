# OJT Journal Companion Post-v1.1 Roadmap

## 1. Document Purpose

This is the authoritative post-v1.1 product, UX, hardening, PWA, and beta roadmap for OJT Journal Companion. It replaces the earlier batch-oriented polish plan as the active roadmap; do not create parallel post-v1.1, UX, or PWA roadmaps.

v1.1 is the stable released and tagged baseline. Future work must be phased, reviewable, reversible where practical, and protected by regression checks. This roadmap defines sequencing and outcomes, not implementation code. Implementation details remain governed by the current app and its source documents, including `PROJECT_BRIEF.md`, `FEATURES.md`, `DATA_STRUCTURE.md`, `WORKFLOWS.md`, and the DOCX documents.

Completed pre-v1.1 polish—backup safety, Preview & Export formatting, Dashboard progress, the Daily Logs editor, the muted theme, intern-focused microcopy, reset, and Official DOCX Export—is now regression history, not active work. The deferred broad utility/IndexedDB refactor is not an approved standalone phase; any maintainability change must be justified within an active phase and kept narrow.

## 2. Current Baseline

| Area | v1.1 baseline |
| --- | --- |
| Version | v1.1 released and tagged; stable rollback baseline. |
| Architecture | Static HTML, CSS, vanilla JavaScript, and IndexedDB version 4; no backend, accounts, cloud sync, framework, or permanent build workflow. |
| Records | StudentProfile, CompanyProfile, AppSettings, OJTWeek, DailyLog, DailyTask, and PhotoAttachment. |
| Capabilities | Profiles/settings, week management, daily records, tasks, photos, weekly summaries, preview/copy, JSON backup/restore/reset, and Official DOCX Export. |
| DOCX | Client-side `docx-templates` v2 export with a private-first official template and tracked sanitized fallback. |
| Strengths | Mature single-user feature set, offline-first data ownership, official rendered-hours rules, editable output, responsive foundations, and no server dependency. |
| Main weakness | Former v1.1 weakness resolved by Phase 1: the weekly workflow was split across Weeks, Daily Logs, Dashboard, and a separate preview destination with independent week selection. The shared selected-week Journal architecture now owns that workflow. Phase 2 batch photo documentation and Phase 3 Data and Recovery Hardening are complete; Phase 4 Accessible Responsive Visual Redesign is the next active concern. |

## 3. Product Principles

- Remain offline-first for one student using one browser/device.
- No backend, accounts, login, or cloud sync for the planned beta.
- Remain beginner-maintainable; no framework rewrite or permanent build workflow without a separately approved need.
- Preserve v1.1 data compatibility and official rendered-hours rules.
- Deliver small, reviewable phases with practical rollback paths.
- Treat schema and backup changes as migrations with backward-compatibility tests.
- Target WCAG 2.2 AA where practical, including keyboard, focus, reduced motion, and non-drag interactions.
- Validate mobile-first behavior while retaining strong desktop and tablet workflows.
- Keep private institutional assets uncommitted and out of public deployments.
- Keep the generic product configurable and forkable; institutional identity requires authorization.

## 4. Accepted Product Decisions

These decisions are approved and must not be reopened unless the current code reveals a direct technical conflict:

- Primary navigation: Dashboard, Journal, Preview & Export, and Settings.
- Weeks and Daily Logs fully merge into Journal.
- Journal shows one selected week's full daily list; previous weeks stay compact and selectable.
- Selection priority: week containing today, last valid selected week, latest week, then no selection. A new week becomes selected immediately.
- Journal owns week CRUD, selected-week overview, daily records, tasks, photos, and weekly-summary editing. A quick Log Today action remains easy to reach.
- Preview & Export remains a review/copy/export destination, not the primary summary editor.
- Batch Photo Documentation is the accepted Phase 2 direction: one upload action may create one or more normal PhotoAttachment records sharing an optional `photoSetId`, `photoSetIndex`, category, and caption. Existing photos without the identifier remain independent singleton sets.
- Data/recovery hardening occurs before broad public reliance. Restore remains replace-style; cloud sync is excluded.
- A static hosted installable PWA is the primary distribution target, with GitHub Pages first.
- The generic core identity is OJT Journal Companion. BPC identity requires authoritative assets and permission.
- Official template import follows the initial PWA friend beta unless beta evidence establishes an earlier blocker.
- Capacitor/Android or Tauri/Windows packaging is evidence-based only and will not run in parallel.

## 5. Phase Overview

| Phase | Name | Objective | Data-model impact | Major dependency | Release/beta gate | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Baseline and Roadmap Alignment | Establish one accurate post-v1.1 plan and regression baseline. | None | Released/tagged v1.1 | Roadmap approval | Complete |
| 1 | Journal UX Architecture | Unify the weekly workflow and selected-week state. | None expected | Phase 0 | Journal workflow acceptance | Complete |
| 2 | Batch Photo Documentation | Support one or multiple related images per upload with one shared category and caption. | Additive optional metadata fields on existing PhotoAttachment records; no new object store, IndexedDB version increase, migration, or backup-version increase | Phase 1 | Batch upload/export acceptance | Complete |
| 3 | Data and Recovery Hardening | Make restore and browser-storage risks safer and visible. | Validation; format change only if reviewed | Phase 2 | Recovery drill passes | Complete |
| 4 | Accessible Responsive Visual Redesign | Apply an accessible shell and responsive component system. | None expected | Phases 1-3 | Accessibility/responsive acceptance | Next |
| 5 | Brand Architecture | Make identity configurable; apply authorized assets only. | Config/settings only if reviewed | Phase 4 and asset permission | Identity approval or generic fallback | Planned |
| 6 | Static Deployment and PWA | Provide one hosted, installable, offline-capable URL. | None expected | Phases 3–5 | Hosted/PWA readiness | Planned |
| 7 | Friend Beta | Validate workflows, recovery, offline use, and DOCX. | None by default | Phase 6 | Beta success criteria met | Planned |
| 8 | Official DOCX Template Import | Safely manage a local private template. | Local template storage likely | Phase 7 and security review | Import/fallback acceptance | Planned |
| 9 | Native Packaging Decision | Decide whether PWA limitations justify one native path. | Decision-dependent | Phase 7 evidence | Explicit adoption or deferral | Planned |

## 6. Detailed Phase Plans

### Phase 0 — Baseline and Roadmap Alignment

**Objective:** Make the released v1.1 state and post-v1.1 sequence unambiguous.

**Problem being solved:** Older plans mix completed v1.0 polish, deferred ideas, and stale release actions with future work.

**In scope:** Record v1.1 as released/tagged; make this file authoritative; record accepted decisions/order; establish the regression baseline and branch rules; reclassify completed polish as history.

**Out of scope:** Reopening released implementation, application changes, screen redesign, runtime refactoring, migrations, or PWA artifacts.

**Likely files/modules:** `docs/POLISH_ROADMAP.md` and a minimal `docs/PROJECT_HANDOFF.md` alignment.

**Data-model impact:** None.

**Migration/backward-compatibility considerations:** None; v1.1 data, backups, and DOCX behavior remain untouched.

**Risks:** Duplicated planning, stale release wording, or historical items competing with the accepted roadmap.

**Required testing:** Documentation review; branch/tag/status verification; duplicate heading/phase checks; stale DOCX/photo wording search; table review; `git diff --check`; confirm no app file changed.

**Exit criteria:** Roadmap is authoritative, v1.1 is the stable baseline, and Phase 0 QA passes.

**Dependencies on earlier phases:** None.

### Phase 1 — Journal UX Architecture

**Objective:** Create one Journal workspace with shared selected-week context.

**Problem being solved:** Weeks, Daily Logs, Dashboard, and Preview & Export independently chose or retained week context, increasing effort and wrong-week risk.

**In scope:**

- Shared selected-week state across Dashboard, Journal, and Preview & Export.
- Full Weeks/Daily Logs merge; compact selector, previous/next controls, and New Week action.
- Selection priority: today-containing, last valid, latest, or none; new-week auto-selection and safe fallback after edits/deletion.
- One selected-week view with dates, rendered hours, logged-day count, and summary-completion status.
- Compact rows like `Tue, Jul 7 · Worked · 7h · 4 tasks · 2 photos`, with collapsible details.
- Compact old-week history; never render every old week's complete days at once.
- Journal editing for Skills Learned, Problems Encountered, Reflection / Points of Learning, and existing optional notes.
- Selected-week Preview & Export handoff and an easy quick/floating Log Today action.
- Approved four-destination navigation.

**Out of scope:** Photo grouping, schema changes, final branding, PWA work, backend/accounts, or framework rewrite.

**Likely files/modules:** `app/index.html`, `styles.css`, `app.js`, `ui.js`, `weeks.js`, `daily-logs.js`, `journal-preview.js`, and possibly a small shared selection module after review. Touch `journal-payload.js`/`docx-export-v2.js` only for a narrow handoff need.

**Data-model impact:** No IndexedDB database-version increase, new object store, or object-store migration is required.

**Migration/backward-compatibility considerations:** Existing weeks, logs, tasks, photos, summaries, backups, preview/copy, and DOCX must work unchanged. Missing/deleted/invalid selected IDs must fall back safely.

**Risks:** Selection loops/staleness, wrong-week Preview/DOCX, slow long-history rendering, or lost today-log convenience.

**Required testing:** No weeks; one; two; 10–20; today-containing and none; new week; edited dates; deleted selection; reload; Dashboard/Journal/Preview synchronization; Preview handoff; copy/DOCX selected-week correctness; desktop/mobile navigation and Log Today.

**Exit criteria:** A user can create/select one week, complete daily/summary work in Journal, and open Preview & Export without reselecting or changing weeks; v1.1 regression passes.

**Completion status:** Complete and accepted. Phase 1 now provides shared selected-week state through `window.OJTSelectedWeek`; one Journal workspace owns Weeks and Daily Logs, including Previous/Next/dropdown navigation, New Week and compact All Weeks actions, the selected-week overview, Daily Log/task/photo/weekly-summary editing, and Log Today. Dashboard day handoffs open Journal on the correct date, and Preview & Export receives the selected week without re-selection. Top-level navigation is Dashboard, Journal, Preview & Export, and Settings; Settings owns profile, company, preferences, backup, restore, and reset. No IndexedDB schema or backup-format changes were made, and v1.1 data/export behavior remains preserved.

**Phase 1 verification evidence:** The four reviewed Phase 1 parts passed static checks and manual regression for selected-week synchronization, Week/DailyLog/task/photo/summary behavior, Dashboard handoffs/calculations, Preview & Export, Settings tabs/handoffs, backup/restore/reset, Copy Weekly Journal, and representative DOCX export. Desktop, tablet, and mobile layouts were reviewed, including native-browser paths that automated checks could not fully cover. No confirmed Phase 1 defect remains; this note does not claim a full image-matrix rerun.

**Dependencies on earlier phases:** Phase 0 approval and regression baseline.

### Phase 2 — Batch Photo Documentation

**Objective:** Let a student select one or multiple related JPEG, PNG, or WebP images in one upload action, apply one category and shared caption, and display that caption once in Journal and Official DOCX Export.

**Problem being solved:** Before Phase 2, upload accepted one image and edited captions/categories per attachment, while related images needed a lightweight shared batch identity.

**In scope:** Enable one or multiple files per upload; assign one generated `photoSetId` per new upload action and automatic `photoSetIndex` values based on captured file-selection order; copy the shared category and caption to every attachment in the set; validate the complete batch before writing; use atomic IndexedDB transactions for batch creation and shared edits; render set metadata once in Journal; export one shared caption below the complete set in DOCX with set-aware layout (one centered, two columns, three columns, or two-column rows for four or more); preserve singleton behavior for existing photos without set metadata; update the v2 DOCX template to the `photoSets` contract.

**Out of scope:** A `PhotoDocumentationGroup` object store, IndexedDB version increase, database migration, backupVersion change, individual image captions inside new photo sets, adding images later to an existing set, manual set/image ordering, drag-and-drop, empty sets, group-level delete, visible Preview photo expansion, adoption of Moderate margins or widened table layouts, and the Phase 4 visual redesign.

**Likely files/modules:** `photos.js`, `storage.js`, `daily-logs.js`, `styles.css`, `docx-export-v2.js`, and the v2 DOCX templates. `db.js`, `backup.js`, `journal-payload.js`, `journal-preview.js`, and `app/index.html` should remain unchanged unless source evidence reveals a narrow compatibility need.

**Data-model impact:** Additive optional metadata fields on existing PhotoAttachment records; no new object store, IndexedDB version increase, migration, or backup-version increase.

**Migration/backward-compatibility considerations:** No database migration was added. Existing photos remain unchanged and are treated as independent singleton sets at read time. Existing JSON backups restore through the current path; missing optional batch metadata must remain valid. `DB_VERSION` remains `4`; backup version remains `1.0`; older supported backups remain compatible.

**Risks:** Partial batch writes, shared-metadata drift, equal timestamps, large multi-file selections, deleting the first image in a set, and confusing set boundaries in DOCX grid output.

**Required testing:** One and multiple files; complete-batch validation; atomic creation and shared edits; legacy singleton photos; deletion of first, middle, and final images; equal timestamps and FileList order; JPEG/PNG/WebP; backup/restore; no-photo DOCX; private and sanitized templates; Word/LibreOffice; desktop/tablet/mobile Journal behavior; 1/2/3/4+ image DOCX layouts.

**Exit criteria:** A user can upload one or multiple images as one lightweight batch, edit the shared category/caption atomically, delete individual images safely, see the caption once in Journal, export it once below the complete set in DOCX, and preserve all v1.1 photo/backup behavior without a schema version or backup-version increase.

**Completion status:** Complete and accepted. One or multiple JPEG, PNG, or WebP files may be selected in one upload action. One upload action creates one `photoSetId`. `photoSetIndex` follows native file-selection order. Every image remains a normal `PhotoAttachment`. Shared category and caption are duplicated across every attachment in the set. Journal displays category and caption once per set. Shared metadata updates are atomic. Individual images remain downloadable and deletable. Deleting the first image preserves shared metadata; stored indices are not renumbered; deleting the final image removes the set naturally. Existing photos without set metadata remain runtime singleton sets. No separate group entity or IndexedDB store exists. Official DOCX Export uses the `photoSets` template contract with layout-specific image bounds, one shared caption per set, no category export, and no cross-set row packing. v1.1 remains the latest tagged stable release; Phase 2 is completed post-v1.1 roadmap work and is not a new release or tag.

**Dependencies on earlier phases:** Phase 1 Journal structure and selected-week architecture.

### Phase 3 — Data and Recovery Hardening

**Objective:** Make restore and browser-local storage risks understandable, validated, and recoverable before hosted reliance.

**Problem being solved:** Restore currently checks basic shape then replaces data; it lacks comprehensive semantic validation, a restore report, persistence status, and storage-pressure guidance.

**In scope:** Supported backup-version checks; duplicate IDs; week/log/task/photo relationships and optional batch metadata; enum/status, required-ID, date/range, time-derived, and image-data validation; pre-restore counts/warnings/errors report; preserve current data on failed validation; persistent-storage request; quota/usage feedback; reviewed backup reminders and recovery guidance.

**Out of scope:** Cloud sync, accounts, merge restore, remote backups, or guarantees of browser-storage permanence.

**Likely files/modules:** `backup.js`, `storage.js`, `db.js`, `ui.js`, `app/index.html`, `styles.css`, and related data/workflow/handoff docs.

**Data-model impact:** Validation/reporting may need no new store. Any backup/settings change must be reviewed and versioned; do not assume a schema bump.

**Migration/backward-compatibility considerations:** Normalize explicitly supported legacy backups; reject unsupported versions before clearing; preserve replace-style restore; test v1.1 and Phase 2 backups.

**Risks:** Rejecting valid old backups, clearing before validation, browser-varying estimates, or persistence wording that overpromises.

**Required testing:** Valid legacy/current backups; unsupported/missing versions; duplicate/orphan IDs; invalid enums/dates/images; interrupted restore; report accuracy; replace confirmation; persistence supported/unsupported/denied; quota thresholds; reset/reminders.

**Exit criteria:** Unsupported/invalid data cannot replace current data; valid supported backups restore with a clear report; storage risk is visible; recovery drill passes.

**Dependencies on earlier phases:** Phase 2 batch-photo compatibility behavior and regression evidence.

### Phase 3 completion status

Phase 3 is complete and accepted as post-v1.1 roadmap work; it is not a release or tag. The implementation adds a supported "1.0" backup-version gate, exact app identity and structural checks, duplicate and parent-reference validation, JPEG/PNG/WebP photo MIME/Base64/usable-Blob checks, nonfatal compatibility warnings, and export-integrity blocking. Legacy singleton photos and Phase 2 set metadata remain compatible. Restore now uses a review with metadata, counts, categorized errors and warnings, optional safety export, explicit replace confirmation, guarded mutual exclusion, and the existing atomic replacement path.

Settings now reports approximate site/origin usage, quota, and valid percentage values, distinguishes persistent-storage states, and offers explicit guarded persistence requests and refresh. Recovery guidance explains local browser storage, clearing/device/private-session loss, non-transfer between profiles/devices, JSON recovery backups, non-restorable DOCX output, and that persistent storage may reduce eviction risk but cannot prevent all data loss. Persistence is not guaranteed, and there is no cloud sync. Storage Health values are runtime-only.

No new object store, IndexedDB version increase, migration, backup-format change, or backup-version increase was added. DB_VERSION remains 4; backupVersion remains "1.0". Focused automated assertions, syntax/repository checks, and primary-browser manual verification passed with no observed blocking defect; broader browser/device testing remains future testing.

### Phase 4 — Accessible Responsive Visual Redesign

**Objective:** Apply a coherent accessible shell and responsive component system after Journal architecture stabilizes.

**Problem being solved:** The functional responsive UI needs consistent desktop/tablet/mobile patterns plus stronger dialog, focus, status, motion, and touch behavior.

**In scope:**

- Desktop, tablet, and mobile shells and responsive navigation.
- Reusable components and semantic tokens for typography, spacing, color roles, borders, elevation, and feedback.
- Selected-week summary, compact day rows, day-editor sections, batch-photo controls, weekly-summary editor, empty states, and feedback.
- Desktop visible/expanded summary editing; tablet full-width expandable panel; mobile focused accordion or full-height sheet.
- Dialog/sheet focus trapping, Escape, background inertness, focus restoration, visible focus, status meaning beyond color, reduced motion, touch targets, and non-drag ordering.

**Out of scope:** Reopening Journal architecture, final BPC colors/assets without authorization, feature expansion, framework migration, or data changes.

**Likely files/modules:** `app/index.html`, `styles.css`, `app.js`, `ui.js`, Journal modules, photo-group UI, Preview, and Settings surfaces.

**Data-model impact:** None expected.

**Migration/backward-compatibility considerations:** Data/backups remain unchanged. Preserve stable event/element contracts or update consumers together with regression coverage.

**Risks:** Color-only meaning, lost focus, mobile sheet traps, excessive motion, broad CSS regression, or accidental institutional styling.

**Required testing:** Keyboard-only and screen-reader use; focus lifecycle/Escape/restoration; reduced motion; 320px through wide desktop; touch targets; zoom/text scaling; empty/long content; 10–20 weeks; full v1.1 regression.

**Exit criteria:** The stable Journal is usable at target sizes; critical dialogs/sheets meet the accessibility contract; responsive/accessibility review passes.

**Dependencies on earlier phases:** Phase 1 architecture, Phase 2 batch-photo behavior, and known Phase 3 feedback requirements.

### Phase 5 — Brand Architecture

**Objective:** Make identity configurable while retaining a safe generic open-source default.

**Problem being solved:** BPC identity may be desired, but authoritative assets, palette, usage rules, and public permissions are unresolved.

**In scope:** Configurable app/institution name, approved logo/colors/icons/documentation identity; semantic CSS tokens; generic OJT Journal Companion default; authorized BPC configuration only after permissions; asset provenance and permission for repository, hosted app, icons, screenshots, and promotion.

**Out of scope:** Sampled/guessed colors, unofficial logos, private assets, or mandatory BPC identity for forks.

**Likely files/modules:** Reviewed configuration, `app/index.html`, `styles.css`, Phase 6 icon sources, README/docs identity, and asset/license records; exact files depend on authorized assets.

**Data-model impact:** None expected. A user-stored identity would need separate review and must not leak private assets.

**Migration/backward-compatibility considerations:** Generic defaults work without institutional configuration. Existing data/exports remain readable; DOCX branding follows approved template rules.

**Risks:** Unauthorized use, inconsistent app/DOCX identity, poor contrast, or difficult forks.

**Required testing:** Generic fallback; authorized/missing assets; contrast/icon legibility; name consistency; public-build private-file scan; license/permission review.

**Exit criteria:** Generic forkable identity works; any institution identity has authoritative assets and permission; no private asset reaches the public repo/deployment.

**Dependencies on earlier phases:** Phase 4 tokens and responsive shell.

### Phase 6 — Static Deployment and PWA

**Objective:** Let testers open one GitHub Pages URL, optionally install, and use the app offline without XAMPP, commands, or a terminal.

**Problem being solved:** The app currently needs manually served local HTTP and has no install/update/offline-cold-launch lifecycle.

**In scope:** GitHub Pages project deployment; manifest/icons; service worker; offline cold launch; versioned app-shell caching; update-ready notice and safe activation; Phase 3 persistence/usage feedback; install/storage guidance; subpath-safe routes, fetches, assets, and templates; hosted Preview/copy/DOCX validation.

**Out of scope:** Journal records/photos in Cache Storage, cloud sync, server API, private template deployment, background upload, native packaging, or unversioned caching.

**Likely files/modules:** Manifest, service worker, icons, Pages workflow/config, `app/index.html`, focused PWA/app module, update UI styles, DOCX path handling, and deployment docs.

**Data-model impact:** No journal-store change expected; persistence metadata may reuse reviewed Phase 3 settings.

**Migration/backward-compatibility considerations:** Service-worker updates must not delete IndexedDB; clean only old app-shell caches. Explain origin-specific storage and backup/restore migration from local HTTP to hosted origin.

**Risks:** Stale shells, update loops, Pages subpath failure, offline DOCX misses, origin confusion, or private-template deployment.

**Required testing:** Online first load; installed/non-installed; offline cold launch/reload; update activation and old-cache cleanup; subpath assets; persistence/quota states; Chrome/Edge/Brave Windows and Chrome Android; hosted JPEG/PNG/WebP DOCX; private-file deployment scan.

**Exit criteria:** A tester can open one URL, complete the core workflow, install where supported, cold-launch offline, safely update, export DOCX, and understand storage/backup risk.

**Dependencies on earlier phases:** Phase 3 hardening, Phase 4 quality, and Phase 5 generic or authorized identity.
### Phase 7 — Friend Beta

**Objective:** Validate the hosted workflow with real users and collect evidence for fixes and later decisions.

**Problem being solved:** Internal regression cannot prove first-time setup, selection, recovery, install, and output quality on real devices.

**In scope:** Small informed tester group; privacy/storage warnings; primary Chrome/Edge/Brave Windows and Chrome Android; best-effort Brave Android, Safari iPhone/iPad, Firefox desktop; tasks covering setup, multiple weeks, selected-week behavior, daily logs, tasks, photo groups, summaries, Preview/copy/DOCX, backup/replace restore, offline use, install/update, and storage risk; recovery drill; feedback form; reproducible issue template; predefined success criteria.

**Out of scope:** Major features, accounts/cloud sync, supervisor workflows, public launch, or changes unrelated to validated blockers.

**Likely files/modules:** Beta checklist, feedback/issue templates, release notes, browser guidance, and only narrow evidence-based fixes.

**Data-model impact:** None by default; any discovered schema need returns to migration review.

**Migration/backward-compatibility considerations:** Back up before updates/recovery drills; preserve Phase 2/3 backup compatibility and IndexedDB data.

**Risks:** Tester data loss, weak device coverage, vague feedback, scope growth, or premature best-effort support promises.

**Required testing:** First setup; multiple/long histories; selected-week synchronization/today action; tasks/photos/groups/summaries; Preview/copy/DOCX; backup/restore/reset; offline cold launch; install/update; quota/persistence messaging; browser matrix; issue reproduction.

**Exit criteria:** No unresolved data-loss/core blocker; recovery and DOCX targets pass; findings are triaged; evidence supports Phase 8 necessity and Phase 9 deferral/adoption.

**Dependencies on earlier phases:** Phase 6 hosted PWA and Phases 1–5 gates.

### Phase 8 — Official DOCX Template Import

**Objective:** If beta confirms the need, manage an approved private DOCX template locally without committing or backing it up by default.

**Problem being solved:** v1.1's private template is a file at a known app path, unsuitable as a hosted-app import workflow.

**In scope:** Local import and reviewed IndexedDB/origin storage; validate type, package structure, required commands, allowlist/contract, and compatibility before activation; sanitized fallback; replace/remove/reset/status/errors; explain exclusion from ordinary JSON backups and required re-import after restore/origin/device changes.

**Out of scope:** Arbitrary executable commands, `noSandbox: true`, public sharing, server storage, private-template deployment, or silent ordinary-backup inclusion.

**Likely files/modules:** `db.js`, `storage.js`, focused template-management UI/module, `docx-export-v2.js`, `backup.js`, Settings, fallback template, and DOCX/security/handoff docs.

**Data-model impact:** Likely IndexedDB version change and local template record/store; exact schema awaits security/migration review.

**Migration/backward-compatibility considerations:** No import still uses sanitized fallback. Guide file-based private-template users. Imported templates stay excluded from ordinary JSON backups and require re-import after restore.

**Risks:** Command execution, malformed OOXML, storage pressure, private leakage, fallback bypass, or an unverifiable contract.

**Required testing:** Valid approved, wrong type, malformed, missing/extra/disallowed commands, oversized; replace/remove/reset; corrupt/missing fallback; backup exclusion and re-import; offline/hosted export; security review; Word/LibreOffice.

**Exit criteria:** Import exists only if beta justifies it; accepted files are constrained to the safe contract; private data stays local/excluded; fallback/removal/reset pass.

**Dependencies on earlier phases:** Phase 7 evidence, Phase 3 validation, Phase 6 hosted storage.

### Phase 9 — Native Packaging Decision

**Objective:** Decide from beta evidence whether to remain PWA-only or pursue one native path.

**Problem being solved:** Native packaging adds signing, distribution, updates, platform, and maintenance duties without value unless a PWA limitation is demonstrated.

**In scope:** Compare continued PWA, Capacitor Android, and Tauri Windows; assess evidence for Play Store, camera, native sharing, managed install, EXE/MSI, filesystem, or browser-independent shell; estimate ownership, toolchain, security updates, signing, distribution, data migration, and update strategy; choose at most one later track or explicitly defer.

**Out of scope:** Wrapper implementation, parallel Android/Windows work, or packaging for aesthetics.

**Likely files/modules:** Decision record, beta evidence, feasibility notes, ownership/security plan; no production wrapper code without a later approved roadmap.

**Data-model impact:** None for the decision; any later package must define migration from browser-origin IndexedDB.

**Migration/backward-compatibility considerations:** Preserve JSON portability, v1.1-and-later records, and a documented hosted-PWA transition.

**Risks:** Signing/toolchain burden, duplicate releases, platform divergence, data silos, or solving a hypothetical problem.

**Required testing:** Evidence against explicit PWA limitations; separately approved feasibility checks only; maintenance/signing/update/security and migration review.

**Exit criteria:** Written evidence-based adoption of one later track or explicit native deferral. Deferral is a successful exit.

**Dependencies on earlier phases:** Phase 7 evidence; Phase 8 only if template behavior materially affects the decision.

## 7. Cross-Phase Dependencies

- Phase 4 must build on the settled Phase 1 Journal architecture and must not reopen it without a documented direct conflict.
- Batch-photo behavior is settled before Phase 3 finalizes current backup validation.
- Data hardening before broad public reliance.
- Responsive/accessibility and generic or authorized branding readiness before public-facing beta material.
- PWA before friend beta.
- Friend beta before template import unless evidence identifies a blocker.
- Beta evidence before deciding if template import or native packaging is necessary.

## 8. Regression Baseline

Future phases must preserve:

- Student/company profiles and settings.
- Week CRUD and guarded deletion.
- Daily Logs; Worked, Absent, No OJT / Rest Day; time in/out/breaks; official `renderedMinutes` and totals.
- DailyTask description, optional duration, personal status, and ordering behavior.
- Local photos, shared set captions/categories, individual download, and deletion.
- Weekly summaries.
- Preview & Export and Copy Weekly Journal.
- JSON backup/export, replace-style restore, and guarded reset.
- Official DOCX Export: dynamic day rows, summaries, editable output, blank signatures, and selected-week correctness.
- Automatic Photo Documentation appendix with set-aware layout: one centered image, two columns, three columns, or two-column rows for four or more images within a set; one shared caption per set below the complete set; no category export; no cross-set row packing.
- JPEG/PNG direct handling and temporary WebP-to-PNG conversion without changing stored blobs.
- Private-first v2 template behavior, tracked sanitized fallback, and private-template ignore/uncommitted guarantee.

## 9. Do-Not-Do List

- No framework rewrite for aesthetics.
- No backend/accounts/cloud sync for planned beta.
- No supervisor/coordinator/admin portal.
- No attendance verification, GPS, QR, grading, payroll, or submission platform.
- No commit/deployment of private official templates.
- No guessed BPC branding.
- No arbitrary executable DOCX imports or disabled sandbox.
- No premature Capacitor/Tauri work or parallel Android/Windows packaging.
- No unversioned PWA caching or journal/photo data in Cache Storage.
- No data migration without legacy database and backup compatibility tests.
- No visual redesign that bypasses or reopens the settled Journal architecture.
- No duplicate post-v1.1, UX, or PWA roadmap.

## 10. Open Decisions

Only these remain unresolved:

- Authoritative BPC assets, palette, guidance, and permissions for repository, hosted app, icons, screenshots, and promotion.
- Exact GitHub Pages repository/project URL.
- Exact backup reminder, quota, and storage-warning thresholds after browser testing.
- Whether official template import remains necessary after beta.
- Whether beta evidence supports one native path or continued PWA-only use.

## 11. Roadmap Change Control

- v1.1 remains the stable rollback/regression baseline.
- Phase 1 Journal architecture is settled. Phase 2 Batch Photo Documentation and Phase 3 Data and Recovery Hardening are complete. **Phase 4 - Accessible Responsive Visual Redesign is the next approved roadmap phase.**
- Review phase scope, current code, likely files, risks, and tests before coding.
- Data-model phases require explicit IndexedDB migration, backup-version, restore-compatibility, and rollback/recovery review.
- Keep changes phase-scoped; do not combine opportunistic framework/platform work.
- On phase completion, update this roadmap and minimally update `PROJECT_HANDOFF.md` with current state and next phase. Phase 4 builds on the settled Phase 1 Journal architecture; do not reopen that architecture during visual redesign.
- Do not reopen accepted decisions or completed phases without a documented direct conflict from current implementation evidence.
