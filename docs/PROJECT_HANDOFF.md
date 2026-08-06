# OJT Journal Companion — Project Handoff

This is the primary continuation document for the current repository state.

## Status

Phase 1 — Journal UX Architecture: Complete
Phase 2 — Batch Photo Documentation: Complete
Phase 3 — Data and Recovery Hardening: Complete
Phase 4 — Accessible Responsive Visual Redesign: Complete
Phase 5A — Brand Discovery and Current Identity Audit: Complete
Phase 5B — Brand Strategy and Visual Direction: Complete
Phase 5C — Journal Workspace Redesign and Accepted Journal Checkpoints: Complete and accepted
Phase 5D — Daily Log Editor Redesign: Complete and accepted through E1A, E2A, and E3A
Phase 5E — Journal and Daily Log Editor Documentation Synchronization: Complete

The Stitch Warm Journal direction is selected as a production refinement of Concept A. The initial integration remains preserved at `d5411e0 chore(brand): checkpoint initial Warm Journal integration`, while the accepted Phase 5C Journal workspace and Phase 5D Daily Log Editor redesign through E3A are represented by the current implementation commits through `2283403`. `docs/BRAND_GUIDELINES.md` and `docs/STITCH_FRONTEND_INTEGRATION_PLAN.md` record the accepted visual and accessibility boundaries.

The project owner clarified that Stitch controls layout, hierarchy, spacing, geometry, and interaction character rather than serving only as a palette reference. The rejected sidebar-constrained J1 experiment remains historical; the accepted implementation now uses the compact responsive shell, Journal workspace, and Daily Log Editor translation. Existing persistence, validation, photo, backup, accessibility, Preview & Export, and DOCX behavior remain authoritative.

The active branch is `feature/brand-architecture`. The latest tagged stable release remains v1.1. Phase 4 is merged into master; Phase 5 brand work remains post-v1.1 roadmap work and has not created a release or tag. No v1.2 release is implied.

## Immediate repository sequence

```text
Phase 5C — accepted responsive shell
→ Phase 5C — Journal workspace and Daily Record summaries
→ Phase 5D — Daily Log Editor shell, tasks, photos, and actions
→ Phase 5D — focused E3A regression and acceptance
→ Phase 5E — Journal and Daily Log Editor documentation synchronization
→ broader application-wide regression and closeout
→ remaining screen-body visual refinement
```

Journal and Daily Log Editor approval gates are complete. Remaining Dashboard, Preview & Export, and Settings page-body refinement requires its own scoped implementation and regression review.

Do not merge, tag, or release from this documentation checkpoint. Release preparation and any broader application-wide regression remain separate work.

## Runtime architecture

| Layer | Current choice |
| --- | --- |
| App | HTML, CSS, vanilla JavaScript |
| Storage | IndexedDB version 4 |
| Backup format | backupVersion = "1.0" |
| DOCX | Client-side `docx-templates` Official DOCX Export with private-first v2 template loading and sanitized v2 fallback |
| Server requirement | Local/static HTTP for reliable template fetches |
| Build tooling | None |
| Product boundary | Offline-first personal app for one student on one browser/device |

There is no backend, account/login system, cloud synchronization, framework, bundler, coordinator/admin dashboard, GPS/QR attendance, or online submission workflow.

## Current interface

The app has four top-level destinations:

- **Dashboard:** progress, current-week status, backup reminder, and day handoffs.
- **Journal:** selected-week navigation, week management, Daily Logs, tasks, photos, summaries, and Log Today.
- **Preview & Export:** responsive browser Preview, Copy Weekly Journal, Official DOCX Export, and correction handoffs.
- **Settings:** Student Details, Company/OJT Placement, App Preferences, Data & Recovery, Restore Review, and Storage Health.

The completed Phase 4 runtime uses a desktop sidebar and fixed mobile bottom navigation; that sidebar is historical behavior and is intentionally superseded for Phase 5C Journal presentation. The accepted shell uses one compact top app bar, one centered responsive content canvas, a full-width fixed bottom navigation bar on compact/mobile screens, and a centered floating bottom-navigation dock on wider tablet and desktop screens. It keeps exactly the same four destinations, targets, labels, `aria-current` behavior, and `data-section` values. The theme control remains reachable from the top app bar, the full accessible product name remains available, the tagline is not persistently repeated, and safe-area/bottom clearance remains required.

## Accepted Phase 5C Journal and Phase 5D Daily Log Editor implementation

The Journal workspace uses a compact top app bar, centered responsive content canvas, mobile bottom navigation, and a floating wider-screen navigation dock. It preserves the selected-week workflow, single-open accessible Daily Record accordions, real photo thumbnails, Daily Record summaries, Weekly Summary content, and Light/Dark responsive behavior.

The Daily Log Editor is a rounded mobile bottom sheet and contained desktop dialog with a fixed header and independently scrolling document-like body. It preserves date/day identity, Worked/Absent/No OJT / Rest Day statuses, Time In, Time Out, Break Minutes, Rendered Time, existing validation and focus behavior, Daily Tasks, Hours and Minutes task-duration entry, total-minute task storage independent of rendered hours, focused Add/Edit Task subviews, Photo Documentation metadata editing/download/deletion, Day Remarks, Save feedback, and a separated Delete Day danger action.

Verified accessibility behavior includes dialog semantics, accessible title and close control, focus trap, Escape close, background inertness, focus restoration, visible focus indicators, associated labels and validation messages, touch-friendly controls, no duplicate IDs, no horizontal overflow, and usable 200% text sizing at 390px. This is not formal WCAG certification.

Existing photo behavior remains bounded to add, Blob-backed rendering, category/caption metadata editing, download, deletion, object-URL cleanup, JPEG/PNG/WebP validation, and the existing 5 MB limit. Stored-photo replacement is not present in the current baseline.

The focused acceptance pass generated a browser DOCX and passed structural package inspection for media assets, content types, and template-marker safety. It did not establish a new native Microsoft Word or LibreOffice render. Private-first and sanitized fallback template paths remain protected.

The Phase 5D E3A browser evidence used an isolated Edge fallback after the native helper could not leave `about:blank`. No application code or protected data/export contract was changed.

## Locked translation contract
- Production identity is `OJT Journal Companion`; production navigation is `Preview & Export`, never the Stitch shorthand or standalone `Export`.
- The primary shell is a compact top app bar plus centered canvas, fixed full-width compact/mobile bottom bar, and centered floating wider-screen bottom dock. It has no permanent desktop sidebar and preserves all four navigation contracts, bottom clearance, safe areas, keyboard access, focus, touch targets, zoom, and reduced motion.
- Typography remains `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. There is no Google Fonts request or new bundled font dependency.
- Daily Record headers expose accessible read-only summaries with real status, time, remarks, tasks, and photo summaries. Explicit Open/Create/Edit actions own the full editor; inline expansion is not a second editing workflow.
- Compact/mobile editor presentation is a rounded bottom sheet; desktop is a contained responsive dialog. Existing dialog semantics, focus trap, initial focus, Escape, inertness, scroll lock, rerender focus, and opener restoration remain authoritative.
- Exit motion requires one centralized opening/open/closing/removal lifecycle with transition and timeout completion, reduced-motion bypass, error cleanup, and guaranteed inertness/focus restoration.
- Existing semantic theme tokens own production Dark-mode colors and contrast. Stitch Dark is incomplete and must not be treated as authoritative or produced by mechanically inverting Light.
- `styles.css` owns tokens, theme-neutral structure, mechanics, accessibility, dialog/sheet behavior, focus, motion, reduced motion, and semantic states. `warm-journal.css` owns the Warm Journal visual skin and non-mechanical brand refinement.
- `app/assets/brand/brand-mark.svg` is the canonical mark geometry. Inline copies must match it or an explicitly documented approved variant.
- Photo thumbnails may use temporary object URLs from stored Blobs. Revoke them when replaced, rerendered, closed, or unused; never persist them to IndexedDB, backups, or DOCX payloads.

## Completed Phase 4 scope

Phase 4 delivered:

- Accessible responsive app shell and semantic design tokens.
- Historical Phase 4 desktop sidebar navigation and fixed mobile bottom navigation, now intentionally superseded for Phase 5C Journal presentation.
- Journal workspace redesign with selected-week continuity.
- Accessible Daily Log dialog/mobile sheet with focus containment, Escape close, background inertness, and opener-focus restoration.
- Dashboard redesign and responsive day handoffs.
- Semantic, reading-oriented browser Preview.
- Settings tabs, keyboard behavior, validation improvements, and first-invalid focus.
- Recovery redesign with Restore Review, safety export, Storage Health, persistence request, guidance, and reset safeguards.
- System/Dark/Light appearance preference and top Light/Dark quick switch.
- Warm Light and Urban Earth Dark visual identities.
- Responsive, visible-focus, reduced-motion, and touch-target improvements.
- Final restored-ID rendering safety correction.

No formal WCAG conformance is claimed, and no permanent institutional branding was introduced.

## Data boundaries that must not change

- DB_VERSION = 4
- backupVersion = "1.0"
- Seven IndexedDB object stores: studentProfile, companyProfile, appSettings, ojtWeeks, dailyLogs, dailyTasks, and photoAttachments
- Existing selected-week architecture remains authoritative
- Existing photo-set model and metadata remain unchanged
- Official `docx-templates` engine, private-first v2 path, and sanitized v2 fallback remain unchanged
- System, Dark, and Light appearance support remains
- JSON restore remains replace-style, not merge-style
- One student on one browser/device
- No cloud sync

### Phase 2 behavior

Batch Photo Documentation uses optional photoSetId and photoSetIndex fields on existing PhotoAttachment records. One multi-file attach action shares one generated set ID and preserves native selection order through the index. Each photo remains independently downloadable and deletable. Legacy photos without set metadata remain supported as singleton groups. There is no new object store, migration, or database-version increase. Official DOCX uses set-aware layouts.

### Phase 3 behavior

Backup validation checks app identity, supported version, structure, duplicate IDs, relationships, and supported photo payloads. Restore Review separates fatal errors from nonfatal warnings. Fatal errors block restore; warning-only backups may restore. Export Current Data First reuses JSON export. Restore is replace-style and atomic after explicit confirmation. Storage Health reports approximate usage and persistence status, supports an explicit persistence request and refresh, and provides recovery guidance. Reset retains its checkbox, exact RESET, final confirmation, all-seven-store clear, selected-week clear, System appearance reset, appearance startup-cache reconciliation, reload, and backup-first safeguards.

### Phase 4 safety correction

Restored arbitrary non-empty string IDs remain compatible. Dynamic IDs are escaped at HTML serialization boundaries, raw IDs remain unchanged for storage and lookup, and selector contexts use selector-safe handling. No backup-format restriction was introduced.

## Persistence and recovery

IndexedDB is authoritative for application records. The appearance startup cache and selected-week preference are small, non-authoritative local UI state. They do not contain journal content, task content, photos, or backup payloads.

Browser storage can be cleared or lost. JSON backup is the portable recovery path. Official DOCX output is editable journal output and cannot restore application data. Persistent storage may reduce eviction risk but is not guaranteed protection.

## Verification and protected behavior

The safety patch is committed as c89d5a6 (fix: escape restored IDs in daily log markup). The accepted application boundaries remain unchanged for Dashboard, Journal, Daily Log editing, photos, Weekly Summary, Preview & Export, Copy Weekly Journal, Official DOCX Export, Settings, backup/restore, Storage Health, reset, appearance, and responsive navigation. The focused Phase 5D E3A regression passed JavaScript syntax, CSS structure, protected-contract, responsive, accessibility, backup, Preview, and browser DOCX checks; broader application-wide regression remains separate.

## Next work

Broader application-wide regression and closeout:

- full-app regression across Dashboard, Preview & Export, and Settings;
- Preview & Export visual refinement, if separately approved;
- Settings visual refinement, if separately approved;
- optional review of project-scoped skills; and
- release preparation without changing the current branch's contracts.

No merge, release, tag, or v1.2 is implied.

## Historical documents

docs/BUILD_PLAN.md remains the historical v1.0 build plan. docs/PROJECT_BRIEF.md remains the baseline project-definition document. Neither is the live release-status document, so neither was rewritten during closeout.
