# OJT Journal Companion — Project Handoff

This is the primary continuation document for the current repository state.

## Status

Phase 1 — Journal UX Architecture: Complete
Phase 2 — Batch Photo Documentation: Complete
Phase 3 — Data and Recovery Hardening: Complete
Phase 4 — Accessible Responsive Visual Redesign: Complete

Phase 4 implementation and regression work are complete. Documentation synchronization is complete after this task. Feature-branch merge remains the next repository action.

The active branch is feature/accessible-responsive-redesign. The latest tagged stable release remains v1.1. Phase 4 is post-v1.1 roadmap work and has not created a release or tag. The expected worktree state after the documentation commit is clean. No v1.2 release is implied.

## Immediate repository sequence

~~~text
review documentation diff
→ commit documentation
→ merge feature branch into master
→ verify master
~~~

Do not merge or tag as part of the documentation synchronization task.

## Runtime architecture

| Layer | Current choice |
| --- | --- |
| App | HTML, CSS, vanilla JavaScript |
| Storage | IndexedDB version 4 |
| Backup format | backupVersion = "1.0" |
| DOCX | Client-side Official DOCX Export with private-first template fallback |
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

Desktop uses sidebar navigation. Mobile uses a fixed bottom navigation with exactly the same four destinations and safe-area support. The top Light/Dark quick switch is an appearance control, not a fifth destination.

## Completed Phase 4 scope

Phase 4 delivered:

- Accessible responsive app shell and semantic design tokens.
- Desktop sidebar navigation and fixed mobile bottom navigation.
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

The safety patch is committed as c89d5a6 (fix: escape restored IDs in daily log markup). The accepted application boundaries remain unchanged for Dashboard, Journal, Daily Log editing, photos, Weekly Summary, Preview & Export, Copy Weekly Journal, Official DOCX Export, Settings, backup/restore, Storage Health, reset, appearance, and responsive navigation.

## Next phase

**Phase 5 — Brand Architecture**

Phase 4 introduced no permanent institutional branding. Phase 5 should define generic or authorized brand direction deliberately, using source-driven assets and explicit permission before any institutional identity is introduced.

## Historical documents

docs/BUILD_PLAN.md remains the historical v1.0 build plan. docs/PROJECT_BRIEF.md remains the baseline project-definition document. Neither is the live release-status document, so neither was rewritten during closeout.
