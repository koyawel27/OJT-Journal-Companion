# Stitch Frontend Integration Plan and Current-Chat Handoff

Prepared: July 25, 2026
Project: OJT Journal Companion
Audience: Project mentor, collaborating agent, and future implementation reviewer

## 1. Purpose

This document records only the project assessment, decisions, work, and revised direction discussed in the current Codex chat.

It is intended to let another agent or the project mentor understand:

- the current project state;
- what was completed during this chat;
- why the first Stitch integration was conservative;
- what branding and frontend result the project owner actually wants;
- how the uploaded Stitch package should be used; and
- the proposed implementation and verification plan.

This is a scoped implementation brief for the Stitch translation. `docs/POLISH_ROADMAP.md` remains the overall project roadmap.

## 2. Executive summary

The latest tagged stable version remains **v1.1**. Post-v1.1 project Phases 1 through 4 are complete and merged into `master`. Brand Architecture is the current project phase on branch `feature/brand-architecture`.

During this chat, the repository and documentation were reviewed, the supplied Stitch package was assessed, the **Stitch Warm Journal** direction was selected, and an initial conservative branding layer was integrated. That initial integration added the local mark, favicon, full product lockup, tagline, Warm Journal Light palette, shared SVG navigation family, and restrained card treatment without changing application JavaScript or the data and export contracts.

The project owner then clarified that the desired result is not merely a brand-inspired refinement. The desired result is a much more faithful translation of the complete Stitch frontend, with particular priority given to the **Journal page** and **Daily Log Editor**, because their layout, surfaces, transitions, and interaction feel are preferred.

This is technically feasible. The Stitch package uses Tailwind CSS, remote Google Fonts, Material Symbols, HTML, and small vanilla-JavaScript mock scripts. The existing application is also an HTML/CSS/vanilla-JavaScript application. No framework migration is required.

The correct approach is to treat the Stitch screenshots and design system as the source of truth for layout, hierarchy, spacing, geometry, and interaction character while translating the prototype markup into the working application's existing data, validation, accessibility, backup, photo, and DOCX workflows. Existing semantic theme tokens remain authoritative for production Dark-mode colors and contrast.

## 3. What happened during this chat

### 3.1 Project recovery and phase check

The repository was inspected after a period in which the project owner could not work on it consistently.

The current state was confirmed as:

- latest tagged stable release: `v1.1`;
- post-v1.1 Phases 1 through 4: complete and merged into `master`;
- current branch: `feature/brand-architecture`;
- Phase 5E Journal and Daily Log Editor documentation synchronization: complete;
- no v1.2 release, tag, or merge was created in this chat.

The existing roadmap and handoff documents were updated to reflect the active brand work. The accepted application behavior and the existing private DOCX-template protections were preserved.

### 3.2 Stitch package review

The supplied package was:

`stitch_ojt_journal_companion.zip`

The package contained visual and HTML references for:

- the product logo;
- Dashboard;
- Journal;
- Settings;
- Daily Log Editor;
- Preview & Export; and
- the Warm Journal design system.

The package showed a consistent visual direction built around warm paper-like surfaces, earth-brown structural colors, olive progress cues, rounded controls, quiet elevation, mobile-first navigation, and short scale/slide interactions.

The generated screens are prototypes. They contain hardcoded example data and mock interactions. Some placeholder content refers to Vue and Pinia even though those technologies are not part of this project.

### 3.3 Brand direction selected

The selected direction is **Stitch Warm Journal**, treated as a refined production expression of the earlier Concept A, Rising Rule.

The retained product identity is:

- product name: **OJT Journal Companion**;
- tagline: **Record the work. Reflect on the journey.**;
- primary symbol: a structured journal page with two restrained rules and a gently rising final rule;
- Light-theme character: warm, paper-like, calm, organic, and professional;
- structural color: earth brown;
- progress and positive accent: muted olive;
- decorative restraint: one meaningful journal/page signature rather than repeated ornament.

### 3.4 Initial conservative integration completed

The first implementation pass added:

- a local scalable brand mark;
- a simplified SVG favicon;
- the full product name and tagline in the application shell;
- one shared SVG icon family for desktop and mobile navigation;
- Warm Journal Light-theme tokens;
- a focused `warm-journal.css` component layer;
- restrained page-fold and card details; and
- synchronized branding, feature, roadmap, and handoff documentation.

This pass intentionally preserved:

- all application JavaScript;
- IndexedDB stores and migrations;
- backup and restore format;
- Journal and Daily Log data behavior;
- photo documentation;
- Weekly Preview and Copy Weekly Journal;
- Official DOCX Export;
- private institutional template handling; and
- deployment and PWA scope.

### 3.5 Revised owner direction

After seeing the distinction between the Stitch prototype and the conservative integration, the project owner clarified the desired result:

> Use the Stitch output much more literally as the frontend direction. Reproduce the complete design and smooth interaction feel where practical, especially on the Journal page and Daily Log Editor, while keeping the application's real functionality.

Therefore, Phase 5C is recorded as the accepted high-fidelity Journal workspace redesign, and Phase 5D is recorded as the accepted Daily Log Editor redesign through E1A, E2A, and E3A. Phase 5E Journal and Daily Log Editor documentation synchronization is complete while broader application-wide closeout remains separate.

## 4. Current checkpoint state

The initial integration is preserved on `feature/brand-architecture` in the pushed checkpoint:

`d5411e0 chore(brand): checkpoint initial Warm Journal integration`

That checkpoint contains the local mark and favicon, Warm Journal stylesheet, application-shell integration, and synchronized brand/roadmap/handoff material. It remains a recovery point for the initial integration; the accepted Phase 5C Journal workspace and Phase 5D Daily Log Editor redesign are represented by the current implementation commits through `2283403`.

Phase 5C is complete for the accepted responsive shell, Journal workspace, accessible Daily Record summaries, and Journal checkpoints. Phase 5D is complete for the Daily Log Editor redesign through E3A. The first Journal J1 experiment remains historical because it retained the permanent desktop sidebar. Phase 5E Journal and Daily Log Editor documentation synchronization is complete; broader application-wide regression and release preparation remain separate. No merge, release, tag, or v1.2 is implied.


### 4.1 Accepted Phase 5C Journal and Phase 5D Daily Log Editor implementation evidence

The accepted Journal workspace uses the selected-week workflow, centered responsive canvas, compact top app bar, mobile bottom navigation, floating wider-screen dock, single-open accessible Daily Record accordions, real photo thumbnails, Daily Record summaries, Weekly Summary content, and Light/Dark behavior.

The accepted Daily Log Editor uses a rounded mobile bottom sheet and contained desktop dialog with a fixed header and independently scrolling body. It preserves date/day identity, Worked/Absent/No OJT / Rest Day statuses, Time In, Time Out, Break Minutes, Rendered Time, validation and focus behavior, Daily Tasks, Hours and Minutes task-duration entry, total-minute task storage independent of rendered hours, focused Add/Edit Task subviews, Photo Documentation metadata editing/download/deletion, Day Remarks, Save feedback, and the separated Delete Day danger action.

Verified accessibility behavior includes dialog semantics, accessible title and close control, focus trap, Escape, background inertness, focus restoration, visible focus, associated labels and validation messages, touch-friendly controls, no duplicate IDs, no horizontal overflow, and usable 200% text sizing at 390px. This is not formal WCAG certification.

Existing photo behavior remains bounded to add, Blob-backed rendering, category/caption editing, download, deletion, object-URL cleanup, JPEG/PNG/WebP validation, and the existing 5 MB limit. Stored-photo replacement is not present in the current baseline.

The focused acceptance pass generated a browser DOCX and passed structural inspection for media assets, content types, and template-marker safety. It did not establish a new native Microsoft Word or LibreOffice render. Private-first and sanitized fallback template paths remain protected.
## 5. Verification already completed

The initial integration passed the available non-rendered checks:

- JavaScript syntax checks across `app/assets/js`;
- local HTTP loading for the application and new assets;
- local HTTP loading for the active sanitized DOCX v2 template;
- SVG XML validation;
- CSS brace validation;
- brand lockup, tagline, stylesheet, and favicon wiring;
- Light-theme contrast checks;
- confirmation that the accepted Dark-theme token block was unchanged;
- confirmation that application JavaScript was unchanged by the brand pass;
- confirmation that `docs/DOCX_EXPORT_PLAN.md` was unchanged;
- confirmation that no new remote runtime dependency was introduced; and
- `git diff --check`.

Rendered browser visual and interaction QA could not be completed because the local Windows browser sandbox failed to initialize. This is a tooling limitation, not evidence of an application defect.

## 6. How the Stitch upload must be used in the next chat

The project owner will upload the Stitch folder or ZIP to the collaborating chat.

The receiving agent should inspect at minimum:

- `journal/screen.png`;
- `journal/code.html`;
- `daily_log_editor/screen.png`;
- `daily_log_editor/code.html`;
- `warm_journal/DESIGN.md`;
- `dashboard/screen.png` and `dashboard/code.html` for shared shell behavior;
- `preview_export/screen.png` for cross-screen consistency; and
- the supplied logo reference.

Use the package according to this hierarchy:

1. Screen images are the visual source of truth.
2. `warm_journal/DESIGN.md` supplies the design-system intent.
3. `code.html` files are structural and styling references.
4. Existing application source is the functional source of truth.

Do not replace the application with the prototype HTML.

Do not copy:

- hardcoded example records;
- placeholder Vue, Pinia, or authentication copy;
- mock save, delete, accordion, theme, ripple, or export scripts;
- Tailwind CDN loading;
- remote Google Fonts requests;
- remote Material Symbols requests;
- prototype-only links; or
- incomplete prototype Dark-theme behavior.

Translate the visual design into the existing application instead.

## 7. Why the Stitch code cannot simply be dropped in

The difficulty is not its programming language or framework.

The Stitch Journal and Daily Log screens are presentation prototypes. The existing application already has production-like behavior that the prototype does not contain:

- IndexedDB persistence;
- week and daily-log relationships;
- day-status rules;
- rendered-time calculations;
- task status, time, notes, editing, and deletion;
- grouped photo documentation;
- backup validation and restore review;
- accessible modal focus handling;
- Light, Dark, and System appearance behavior;
- Weekly Preview and copy output; and
- Official DOCX Export.

A direct file replacement would make the project look closer to Stitch but would remove or disconnect these working behaviors.

A faithful translation can achieve the desired appearance while retaining those behaviors.

## 8. Revised implementation objective

Create a high-fidelity, responsive translation of the Stitch Warm Journal frontend, beginning with Journal and Daily Log Editor, without changing the application's persistent data contracts or accepted export behavior.

The result should feel like the Stitch application rather than an application that merely borrowed its colors.

## 9. Locked production contracts

These contracts resolve the confirmed differences between the Stitch prototype, the initial checkpoint, and the production application. They are implementation requirements, not open options.

### 9.1 Typography

The production font stack is locked:

```text
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

- There is no Google Fonts runtime request.
- There is no new bundled font dependency.
- Stitch typography must be approximated through size, weight, spacing, line height, and layout.
- Plus Jakarta Sans and Work Sans are rejected prototype dependencies, not active Phase 5C or Phase 5D implementation options.
- Changing this policy requires a separate explicit brand decision.

### 9.2 Product identity and navigation wording

The official production strings are:

```text
OJT Journal Companion
Preview & Export
```

The Stitch prototype strings `OJT Companion` and standalone navigation label `Export` must not replace them. The full product name remains the official application identity.

### 9.2.1 Primary responsive shell

The accepted Phase 5C Journal presentation shell is mobile-first and expands responsively without introducing a permanent navigation column:

- use one compact top app bar at every supported width;
- keep the theme control reachable from the top app bar;
- keep the full accessible product name available without persistently repeating the tagline;
- use one centered responsive main-content canvas;
- use a full-width fixed bottom navigation bar on compact/mobile screens;
- use a centered floating bottom-navigation dock on wider tablet and desktop screens;
- preserve bottom-navigation clearance and safe-area behavior;
- keep primary navigation exactly `Dashboard`, `Journal`, `Preview & Export`, and `Settings`;
- preserve the existing navigation targets, labels, `aria-current` behavior, and `data-section` values; and
- preserve keyboard access, visible focus, touch targets, zoom behavior, and reduced-motion support.

There is no permanent desktop sidebar in the accepted Stitch translation. The sidebar remains historical Phase 4 runtime behavior, but Phase 5C intentionally supersedes it for Journal presentation. Desktop width may expand the Journal's internal columns inside the centered content canvas; navigation must not consume a permanent left column.

This presentation contract does not authorize changes to selected-week architecture, Journal ownership, Log Today, Dashboard handoffs, Preview & Export handoffs, Settings, Daily Log Editor behavior, database or backup contracts, photo-set behavior, DOCX behavior, or appearance persistence.

### 9.3 Journal day interaction

Journal uses one hybrid interaction:

1. A Daily Record header expands or collapses a read-only summary.
2. The summary may show day status, rendered time, day remarks, real task information, and real photo summaries or thumbnails.
3. An explicit `Open Daily Log`, `Create Daily Log`, or `Edit Daily Log` action opens the full existing Daily Log Editor.
4. `Log Today` may directly open the editor for today.
5. Inline expansion must not become a second editing workflow.
6. The existing selected-week architecture remains authoritative.

Daily Record accordions must use suitable buttons with `aria-expanded` and `aria-controls`. Collapsed content must not remain incorrectly available to keyboard or assistive-technology navigation.

### 9.4 Daily Log Editor presentation and accessibility

- Compact/mobile presentation is a Stitch-style rounded bottom sheet.
- Desktop presentation is a contained responsive dialog that retains the Stitch visual character.
- A bottom sheet must not be forced across large desktop screens.
- Existing production dialog semantics and functionality remain authoritative.

The translation must preserve:

- `role="dialog"` and `aria-modal`;
- labelled and described relationships;
- focus trapping and initial focus;
- Escape close;
- background inertness and body scroll locking;
- focus preservation during rerenders; and
- opener/day-card focus restoration.

### 9.5 Editor motion lifecycle

The current editor cannot receive a true exit animation through CSS alone because its DOM is destroyed immediately. Entrance and exit motion therefore require one centralized lifecycle:

```text
closed
→ opening/open
→ closing
→ transition completed or timeout fallback
→ DOM removed
→ inertness and aria-hidden cleared
→ focus restored
```

That lifecycle must safely handle repeated close attempts, Escape during closing, backdrop close, save or delete during closing, transition-end failure, timeout fallback, reduced-motion bypass, and error cleanup. It must prevent the application from remaining permanently inert or `aria-hidden`.

No mock Stitch `setTimeout` close script may replace the production lifecycle.

### 9.6 Dark-mode authority

- Stitch screenshots control layout, hierarchy, spacing, geometry, and interaction character.
- Existing application semantic theme tokens control production Dark-mode colors and contrast.
- The supplied Stitch Dark implementation is incomplete and is not the production source of truth.
- Do not mechanically invert the Light screenshot.
- New components must use semantic tokens in Light, Dark, and System appearance.

### 9.7 CSS ownership

`styles.css` owns:

- semantic tokens;
- theme-neutral structure and responsive layout;
- component mechanics and accessibility;
- focus states;
- dialog and sheet behavior;
- motion lifecycle and reduced-motion behavior; and
- semantic success, warning, danger, and information states.

`warm-journal.css` owns:

- the Warm Journal visual skin;
- approved brand relationships and restrained decorative details;
- brand-specific surface treatment;
- visual radii and shadow refinement that do not alter functional mechanics; and
- product lockup and mark presentation.

Do not maintain competing complete layout definitions for one component in both files. Do not normalize the implementation through broad late overrides or unnecessary `!important`.

### 9.8 Compact top app bar

- Use one compact top app bar across compact, tablet, and desktop widths.
- Keep the full accessible product name available; constrained visual treatments may use the mark when the accessible name remains present.
- Keep the theme control reachable from this app bar.
- Do not persistently repeat the tagline in the app bar.
- Do not pair the app bar with a permanent desktop sidebar.

This documentation contract does not change the current runtime shell by itself.

### 9.9 Brand-mark source of truth

`app/assets/brand/brand-mark.svg` is the canonical mark geometry. Inline copies must not become independently redesigned versions. Any later inline SVG must match the canonical geometry or be generated from an explicitly documented approved variant. Changes begin with the canonical asset to prevent visual drift.

### 9.10 Photo-thumbnail lifecycle

Journal and editor thumbnails may be generated from stored photo Blobs. Temporary object URLs are runtime-only and must be revoked when replaced, rerendered, closed, or no longer used. Object URLs must never be saved to IndexedDB, backups, or DOCX payload contracts.

Existing photo-set grouping, metadata, individual download and deletion, backup, restore, and DOCX behavior remain unchanged.

### 9.11 Protected application boundaries

Phase 5C and Phase 5D must preserve:

```text
DB_VERSION = 4
backupVersion = "1.0"
seven IndexedDB stores
replace-style restore
selected-week architecture
photo-set model
Official DOCX engine
private-first v2 template loading
sanitized fallback template
System, Dark, and Light appearance support
one-student local/offline-first boundary
```

## 10. Proposed implementation plan

### Stage 0 — Protect and document the baseline

Before additional edits:

1. Inspect `git status` and the complete diff.
2. Preserve checkpoint `d5411e0` and any later accepted documentation contract.
3. Confirm `DB_VERSION = 4`.
4. Confirm `backupVersion = "1.0"`.
5. Confirm all seven IndexedDB stores and replace-style restore.
6. Confirm the selected-week architecture and photo-set model.
7. Confirm the active Official DOCX engine and private-first/sanitized v2 template paths.
8. Record baseline screenshots if browser tooling is available.
9. Do not merge, tag, release, rebase, squash, or force-push unless separately authorized.

### Stage 1 — Extract the Stitch screen contract

Create a short implementation mapping from each visible Stitch element to the corresponding working feature.

For Journal, map:

- page heading and supporting copy;
- week navigation;
- Log Today action;
- week overview;
- journal tip;
- accessible read-only Daily Record accordion summaries;
- explicit Open/Create/Edit Daily Log actions;
- task and photo summaries;
- Weekly Summary fields; and
- mobile navigation and floating action treatment.

For Daily Log Editor, map:

- rounded sheet/dialog shell;
- drag handle and close action;
- date and current status;
- day status;
- time in, time out, and break;
- rendered-time feedback;
- task cards and task editing;
- photo documentation;
- save action;
- delete action; and
- internal scrolling and responsive behavior.

Resolve differences in favor of the locked production contracts and real application capabilities.

### Stage 2 — Phase 5C primary responsive shell and faithful Journal page translation (complete)

Implementation record: the accepted Phase 5C Journal shell established a compact top app bar, centered content canvas, fixed full-width mobile bottom navigation, and centered floating bottom-navigation dock on wider screens. The rejected sidebar-constrained J1 experiment remains historical, and the four production destinations and their functional contracts are preserved.

Implementation record: the Journal workspace was reshaped inside that centered canvas to follow the Stitch composition:

- use the Stitch content width, vertical rhythm, card hierarchy, and twelve-column desktop composition;
- reproduce the Week Overview card and its bookmark/progress signature;
- present Daily Records as accessible expandable read-only summaries;
- keep all Daily Log editing in the existing full editor reached through explicit actions;
- retain meaningful task, rendered-time, and photo information;
- reproduce the Weekly Summary grouping and action placement;
- keep the existing week selector and real selected-week state;
- keep the existing Log Today behavior;
- keep empty, long-content, and many-week states usable; and
- preserve responsive behavior from 320px through wide desktop.

Likely implementation areas:

- `app/index.html`;
- Journal-related rendering in `app/assets/js/daily-logs.js`;
- existing Journal orchestration scripts where required; and
- `app/assets/css/warm-journal.css`.

Do not change stored record shapes for this visual work.

### Stage 3 — Phase 5D faithful Daily Log Editor translation through E3A (complete)

Implementation record: the working editor was reshaped into a Stitch-style rounded bottom sheet on compact/mobile screens and a contained responsive dialog on desktop:

- centralized entrance and exit motion with reduced-motion bypass and timeout fallback;
- fixed backdrop;
- rounded upper corners;
- visible sheet handle on compact screens;
- sticky or stable editor heading;
- internally scrolling content;
- clear section hierarchy;
- two-column time controls where space permits;
- smooth task cards;
- two-column photo grid where space permits;
- full-width primary save action;
- quieter but clear destructive action; and
- active press, hover, focus, disabled, success, and error states.

Preserve all IDs, data attributes, event targets, validation messages, dialog semantics, labelled/described relationships, focus trapping, initial focus, Escape behavior, background inertness, body scroll locking, focus preservation during rerenders, and opener/day-card focus restoration unless a deliberate refactor provides equivalent verified behavior.

Primary implementation areas:

- `renderDayEditorBody()` in `app/assets/js/daily-logs.js`;
- `renderDayEditorModal()` in `app/assets/js/daily-logs.js`;
- related focus and event helpers in the same file; and
- the Daily Log Editor sections of `app/assets/css/styles.css` and `app/assets/css/warm-journal.css`.

### Stage 4 — Shared smoothness and visual system (complete for accepted Journal and Daily Log Editor surfaces)

Create a small, deliberate interaction system instead of scattered animation:

- shared motion durations and easing;
- card hover elevation only on hover-capable devices;
- restrained active-scale feedback;
- smooth accordion expansion;
- centralized dialog/sheet entrance and exit lifecycle;
- clear focus-visible treatment;
- disabled and loading states;
- `prefers-reduced-motion` support; and
- no decorative motion that delays data entry.

Use local SVG icons rather than remote Material Symbols.

Typography contract:

- use only `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
- approximate Stitch through weight, size, spacing, line height, and layout;
- do not add Google Fonts or a bundled font dependency; and
- require a separate explicit brand decision before changing the locked font policy.

### Stage 5 — Extend the direction to remaining screens

The Journal and Daily Log Editor approval gates are complete. The same system may be applied to remaining screen bodies only through separately scoped work:

- Dashboard;
- Preview & Export;
- Settings; and
- remaining page-body details.

The shared shell and navigation are established before the Journal approval gate and must not be independently redesigned in this later stage. This stage should reuse the accepted components rather than independently redesigning each page.

### Stage 6 — Functional and visual regression

Run:

- Light, Dark, and System appearance checks;
- 320px, 390px, tablet, desktop, and wide-desktop review;
- keyboard-only navigation;
- focus trapping, Escape, and focus restoration;
- reduced-motion review;
- empty, loading, error, success, long-content, and many-week states;
- create, edit, and delete Daily Log flows;
- task create, edit, status, time, notes, and delete flows;
- photo upload, render, edit, delete, backup, and restore flows;
- Weekly Summary save and restore;
- Weekly Preview and Copy Weekly Journal;
- Official DOCX Export;
- Word and LibreOffice output review where available;
- JavaScript syntax;
- local HTTP smoke checks;
- remote-dependency scan;
- `git diff --check`; and
- final `git status --short`.

The focused Journal and Daily Log Editor visual/interaction review and E3A core workflow regression passed. Broader application-wide regression, remaining screen-body refinement, and release preparation are not claimed complete here.

## 11. Acceptance criteria

The work is accepted when:

1. Journal and Daily Log Editor are recognizably faithful to the supplied Stitch screens.
2. The interface feels smooth through consistent spacing, hierarchy, motion, and interaction feedback.
3. The production name and approved tagline are used correctly.
4. The Rising Rule journal mark remains the primary identity.
5. The application works without Tailwind CDN, Google Fonts requests, or Material Symbols requests.
6. Light, Dark, and System modes remain usable.
7. Keyboard and reduced-motion users receive equivalent functionality.
8. Existing records survive the visual update without migration.
9. Backup version remains `1.0`.
10. Database version remains `4` unless a separately approved functional change genuinely requires migration.
11. Weekly Preview, copy output, photos, and DOCX export continue working.
12. No private institutional template is staged or exposed.
13. The final diff contains no unrelated redesign or roadmap work.

## 12. Protected non-goals

This frontend fidelity pass does not authorize:

- a framework migration;
- a Tailwind production dependency;
- Google Fonts or Material Symbols;
- a database redesign;
- a backup-format change;
- cloud sync;
- authentication;
- a DOCX engine replacement;
- static deployment or PWA implementation;
- native packaging;
- release tagging; or
- replacement of working features with prototype-only behavior.

Any of these requires a separate decision and scope.

## 13. Approval-gated execution order

The completed order and current continuation are:

```text
Phase 5C — accepted responsive shell and Journal workspace
→ Phase 5D — accepted Daily Log Editor shell, tasks, photos, and actions
→ Phase 5D — focused E3A regression and acceptance
→ Phase 5E — Journal and Daily Log Editor documentation synchronization
→ broader application-wide regression and closeout
→ remaining screen-body visual refinement
```

The Journal and Daily Log Editor approval gates are complete. The primary shell remains the shared presentation foundation, not a redesign of navigation destinations or other page workflows. Dashboard, Preview & Export, and Settings page-body translation remains separately scoped.

## 14. Handoff instruction for the next agent

Start by reading:

1. this document;
2. `docs/PROJECT_HANDOFF.md`;
3. `docs/POLISH_ROADMAP.md`;
4. `docs/BRAND_GUIDELINES.md`;
5. `docs/brand-exploration/phase-5c/STITCH_DIRECTION_DECISION.md`; and
6. the uploaded Stitch package.

Then inspect the current source and diff before proposing or applying changes.

Do not restart the project, discard the existing brand work, replace the working data layer, or assume the Stitch mock scripts are production implementations.

The next runtime batch must first establish the accepted primary responsive shell, then restart the **Journal static composition and accessible read-only day summaries** inside that shell. No Journal runtime implementation is part of this documentation correction. Daily Log Editor implementation remains blocked until explicit Journal approval.

## 15. Mentor review points

The mentor review should verify:

- the locked system-font policy and absence of new font dependencies;
- the compact top app bar, centered canvas, fixed mobile bottom bar, and centered floating wider-screen dock with no permanent sidebar;
- the unchanged four navigation labels, targets, `aria-current` behavior, and `data-section` values;
- the hybrid read-only Journal accordion plus explicit editor workflow;
- compact/mobile bottom-sheet and contained desktop-dialog behavior;
- the centralized editor exit lifecycle and complete accessibility cleanup;
- semantic-token authority for Dark mode and the `styles.css`/`warm-journal.css` ownership boundary;
- the completed separate Journal and Daily Log Editor approval gates; and
- the focused rendered browser evidence recorded for E3A, with broader application-wide evidence remaining separate.
