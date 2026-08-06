# OJT Journal Companion project contract

This is a routing snapshot prepared from the accepted project documents
available on August 7, 2026. Always compare it with the live repository and its
newest accepted handoff before acting.

## Contents

1. Source map
2. Protected architecture
3. Current product and frontend direction
4. Protected workflows and contracts
5. Design boundaries
6. Verification gates
7. Generic-skill exceptions

## 1. Source map

| Work area | Read first |
| --- | --- |
| Current status and next action | `PROJECT_HANDOFF.md` |
| Overall sequencing and accepted phases | `POLISH_ROADMAP.md` |
| Stitch translation | `STITCH_FRONTEND_INTEGRATION_PLAN.md` |
| Product identity and visual rules | `BRAND_GUIDELINES.md` |
| Baseline scope and audience | `PROJECT_BRIEF.md` |
| Features and user-facing behavior | `FEATURES.md` |
| Records and compatibility | `DATA_STRUCTURE.md` |
| User and recovery flows | `WORKFLOWS.md` |
| Historical build decisions | `BUILD_PLAN.md` |
| Official DOCX behavior | `DOCX_EXPORT_PLAN.md` and `DOCX_TEMPLATE_PLACEHOLDERS.md` |

When documents conflict, prefer the live handoff and authoritative roadmap for
status, the specific accepted contract for its domain, and verified source for
current behavior. Surface unresolved contradictions instead of inventing a merge.

For Stitch work, use this hierarchy:

1. Stitch screen images for visual composition.
2. Warm Journal `DESIGN.md` for design-system intent.
3. Prototype `code.html` for structural and styling reference.
4. Existing application source for functionality.

## 2. Protected architecture

- Static HTML, CSS, and vanilla JavaScript.
- IndexedDB version `4`.
- Backup format `backupVersion = "1.0"`.
- Product backup identity `appName = OJT Journal Companion`.
- Seven stores: `studentProfile`, `companyProfile`, `appSettings`, `ojtWeeks`,
  `dailyLogs`, `dailyTasks`, and `photoAttachments`.
- IndexedDB is authoritative for application data.
- localStorage is limited to non-authoritative selected-week and appearance state.
- One student on one browser/device.
- No backend, login, accounts, cloud sync, framework, bundler, supervisor portal,
  GPS or QR attendance, online submission, or PDF export.
- JSON is the portable recovery format. DOCX cannot restore application data.
- Restore is validated, replace-style, confirmed, and atomic.

Do not change these contracts during visual or accessibility work.

## 3. Current product and frontend direction

The product is a warm, dependable digital work journal:

- Official name: OJT Journal Companion.
- Tagline: Record the work. Reflect on the journey.
- Position: 70% Work Journal and 30% Growth Journey.
- Current visual direction: Stitch Warm Journal.
- Accepted Phase 5C Journal workspace: compact top app bar, centered content canvas, fixed mobile bottom navigation, and floating wider-screen navigation dock.
- Accepted Phase 5D Daily Log Editor: rounded mobile bottom sheet and contained desktop dialog through E3A.
- Phase 5E Journal and Daily Log Editor documentation synchronization is complete; broader application-wide regression and closeout remain next.

Refresh the phase from the live handoff; do not assume this snapshot remains current.

## 4. Protected workflows and contracts

Preserve:

- Four destinations: Dashboard, Journal, Preview & Export, and Settings.
- Compact responsive shell with fixed mobile bottom navigation and a floating wider-screen dock for exactly four destinations: Dashboard, Journal, Preview & Export, and Settings. The Phase 4 desktop sidebar is historical and superseded for Journal presentation.
- Shared selected-week behavior and Journal ownership of week CRUD, daily records,
  tasks, photos, summaries, and Log Today.
- Worked, Absent, and No OJT or Rest Day rules.
- Official rendered time from time in, time out, and break; task time is descriptive only.
- Batch photo groups through optional `photoSetId` and `photoSetIndex` on normal
  PhotoAttachment records; no group store or migration.
- Individual photo download and deletion plus legacy singleton compatibility.
- Weekly Preview, Copy Weekly Journal, and editable Official DOCX output.
- Private-first official DOCX template with tracked sanitized fallback.
- Backup validation, Restore Review, safety export, reset safeguards, Storage
  Health guidance, appearance modes, and restored-ID rendering safety.
- Daily Log dialog or sheet focus containment, Escape close, background inertness,
  opener-focus restoration, validation semantics, and status announcements.

## 5. Design boundaries

- Keep the locked system UI font stack unless a later accepted decision changes it.
- No external fonts, icon libraries, image fetches, or runtime brand dependency.
- Use local inline SVG icons with accessible names.
- Warm earth tones and muted olive support the journal; semantic tokens control states.
- Preserve Light, Dark, and System modes.
- Use rounded professional surfaces, clear borders, restrained shadows, and
  page-like hierarchy.
- Do not add stock photography, mascots, stickers, heavy texture, scrapbook or
  vintage effects, gamification, streaks, badges, analytics-dashboard styling,
  surveillance cues, or guessed institutional branding.
- Motion must be restrained, interruptible, nonessential, and reduced-motion safe.
- No color-only states, hidden focus, disabled zoom, or inaccessible logo-only controls.
- Do not add OJT Journal Companion branding to the official DOCX without approval.

## 6. Verification gates

Choose tests proportional to the change and record evidence:

- JavaScript syntax and focused source checks.
- CSS structure and remote-dependency scan.
- `git diff --check` and final status review.
- Light, Dark, and System.
- 320px, 390px, tablet, desktop, and wide desktop.
- Keyboard navigation, visible focus, focus trap, Escape, restoration, and reduced motion.
- Empty, long-content, many-week, error, success, and disabled states.
- Daily Log create, edit, and delete plus rendered-time rules.
- Task create, edit, status, time, notes, and delete.
- Photo multi-select, grouping, download, deletion, backup, and restore.
- Weekly Summary, Preview, copy, JSON backup or restore, reset, and Official DOCX.
- Word and LibreOffice review when DOCX layout changes.

Do not equate source review with rendered accessibility or browser regression.

## 7. Generic-skill exceptions

For this project, do not blindly apply generic recommendations to:

- swap the system font or fetch remote fonts;
- add gradients, grain, stock imagery, broken grids, parallax, cinematic scroll,
  spring motion everywhere, or hover-only meaning;
- replace functional accordions, sheets, cards, or navigation merely because
  a generic design audit dislikes the pattern;
- encode tabs or selected-week state in URLs without an approved architecture change;
- add CDN preconnects or remote asset optimization;
- virtualize small lists or add a framework to satisfy a performance heuristic;
- rewrite approved sentence-case product copy into generic title case;
- add legal, cookie, authentication, or server patterns outside the product boundary.

Evaluate the user problem and project evidence first. Record useful findings as
required defects, context-dependent recommendations, or intentional exceptions.
