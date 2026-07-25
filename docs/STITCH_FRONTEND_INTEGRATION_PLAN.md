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

The correct approach is to treat the Stitch screenshots and design system as the visual source of truth while translating the prototype markup into the working application's existing data, validation, accessibility, backup, photo, and DOCX workflows.

## 3. What happened during this chat

### 3.1 Project recovery and phase check

The repository was inspected after a period in which the project owner could not work on it consistently.

The current state was confirmed as:

- latest tagged stable release: `v1.1`;
- post-v1.1 Phases 1 through 4: complete and merged into `master`;
- current branch: `feature/brand-architecture`;
- current roadmap phase: Phase 5, Brand Architecture;
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
- Preview and Export; and
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

Therefore, Phase 5D should be treated as **reopened for a fidelity expansion**. Phase 5E closeout should wait until the closer Journal and Daily Log Editor translation is implemented and reviewed.

## 4. Current working-tree state

The current work is local and uncommitted on `feature/brand-architecture`.

Tracked files modified during the current brand work include:

- `README.md`;
- `app/index.html`;
- `app/assets/css/styles.css`;
- `docs/BRAND_GUIDELINES.md`;
- `docs/FEATURES.md`;
- `docs/POLISH_ROADMAP.md`; and
- `docs/PROJECT_HANDOFF.md`.

New local files include:

- `app/assets/brand/brand-mark.svg`;
- `app/assets/brand/favicon.svg`;
- `app/assets/css/warm-journal.css`;
- `docs/brand-exploration/phase-5c/STITCH_DIRECTION_DECISION.md`;
- `docs/brand-exploration/phase-5c/PHASE_5C_CONCEPT_REVIEW.md`;
- the Phase 5C concept SVGs; and
- the Phase 5C concept board.

No files were staged or committed during this chat.

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

## 9. Proposed implementation plan

### Stage 0 — Protect and document the baseline

Before additional edits:

1. Inspect `git status` and the complete diff.
2. Preserve all current uncommitted brand work.
3. Confirm `DB_VERSION = 4`.
4. Confirm `backupVersion = "1.0"`.
5. Confirm the active private-first and sanitized DOCX v2 template paths.
6. Record baseline screenshots if browser tooling is available.
7. Do not stage, commit, merge, tag, or release unless the project owner separately requests it.

### Stage 1 — Extract the Stitch screen contract

Create a short implementation mapping from each visible Stitch element to the corresponding working feature.

For Journal, map:

- page heading and supporting copy;
- week navigation;
- Log Today action;
- week overview;
- journal tip;
- daily-record accordion cards;
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

Resolve differences in favor of preserving real application capabilities.

### Stage 2 — Faithful Journal page translation

Reshape the current Journal workspace to follow the Stitch composition:

- use the Stitch content width, vertical rhythm, card hierarchy, and twelve-column desktop composition;
- reproduce the Week Overview card and its bookmark/progress signature;
- present Daily Records as smooth expandable cards;
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

### Stage 3 — Faithful Daily Log Editor translation

Reshape the working editor into the Stitch-style rounded bottom sheet or responsive drawer:

- approximately 300ms entrance and exit motion;
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

Preserve all IDs, data attributes, event targets, validation messages, focus trapping, Escape behavior, and focus restoration unless a deliberate refactor provides equivalent verified behavior.

Primary implementation areas:

- `renderDayEditorBody()` in `app/assets/js/daily-logs.js`;
- `renderDayEditorModal()` in `app/assets/js/daily-logs.js`;
- related focus and event helpers in the same file; and
- the Daily Log Editor sections of `app/assets/css/styles.css` and `app/assets/css/warm-journal.css`.

### Stage 4 — Shared smoothness and visual system

Create a small, deliberate interaction system instead of scattered animation:

- shared motion durations and easing;
- card hover elevation only on hover-capable devices;
- restrained active-scale feedback;
- smooth accordion expansion;
- sheet entrance and exit;
- clear focus-visible treatment;
- disabled and loading states;
- `prefers-reduced-motion` support; and
- no decorative motion that delays data entry.

Use local SVG icons rather than remote Material Symbols.

Typography decision:

- closest Stitch match: bundle Plus Jakarta Sans and Work Sans locally after confirming the project owner and mentor approve the asset addition;
- lower-risk fallback: retain the approved system font stack with adjusted weights, sizes, and spacing;
- never add a Google Fonts runtime dependency.

### Stage 5 — Extend the direction to remaining screens

After Journal and Daily Log Editor are accepted, apply the same system to:

- Dashboard;
- Preview and Export;
- Settings; and
- remaining shared shell and navigation details.

This stage should reuse the accepted components rather than independently redesigning each page.

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

Do not close Phase 5 until rendered visual review and core workflow regression pass.

## 10. Acceptance criteria

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

## 11. Protected non-goals

This frontend fidelity pass does not authorize:

- a framework migration;
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

## 12. Recommended execution order

The recommended order is:

1. preserve the current branch and diff;
2. inspect the uploaded Stitch folder;
3. produce the visual-to-functional mapping;
4. implement Journal;
5. verify Journal;
6. implement Daily Log Editor;
7. verify Daily Log Editor;
8. obtain project-owner visual approval;
9. extend the accepted system to remaining screens;
10. complete Phase 5E regression and documentation;
11. only then consider merge, release, or Phase 6.

Journal should be reviewed before the Daily Log Editor is finalized because the editor is opened from the Journal workflow and should inherit the accepted layout, spacing, typography, and component decisions.

## 13. Handoff instruction for the next agent

Start by reading:

1. this document;
2. `docs/PROJECT_HANDOFF.md`;
3. `docs/POLISH_ROADMAP.md`;
4. `docs/BRAND_GUIDELINES.md`;
5. `docs/brand-exploration/phase-5c/STITCH_DIRECTION_DECISION.md`; and
6. the uploaded Stitch package.

Then inspect the current source and diff before proposing or applying changes.

Do not restart the project, discard the existing brand work, replace the working data layer, or assume the Stitch mock scripts are production implementations.

The immediate implementation target is a **faithful Stitch Journal and Daily Log Editor translation with existing functionality preserved**.

## 14. Mentor review points

The mentor may wish to confirm:

- whether locally bundled Plus Jakarta Sans and Work Sans are acceptable;
- whether the Daily Log Editor should remain a bottom sheet on desktop or become a contained desktop dialog while retaining the Stitch character;
- whether Journal and Daily Log Editor should be approved before the remaining screens are translated;
- whether the final Phase 5 work should be merged as one brand/frontend change or separated into reviewable commits; and
- what rendered browser and device evidence is required before Phase 5 closeout.
