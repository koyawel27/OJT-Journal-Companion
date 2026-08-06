# OJT Journal Companion Brand Guidelines

Source file: docs/BRAND_GUIDELINES.md

## 1. Document status

Purpose: This document is the source of truth for the product brand strategy, visual direction, product-facing copy, future local brand assets, Phase 5C Journal workspace presentation, Phase 5D Daily Log Editor presentation, and Phase 5E documentation synchronization.

Current phase: Phase 5C Journal workspace redesign: Complete and accepted. Phase 5D Daily Log Editor redesign: Complete and accepted through E3A. The initial Warm Journal integration remains checkpointed at `d5411e0`, and the rejected sidebar-constrained J1 experiment remains historical. Phase 5E Journal and Daily Log Editor documentation synchronization is complete; broader application-wide closeout remains separate.

Authority: This document governs generic product identity decisions for OJT Journal Companion. The current application source, protected data contracts, official DOCX template, and explicit institutional permissions remain higher-priority constraints where applicable.

Version/status: Stitch Warm Journal direction selected as a refinement of Concept A. Local SVG mark, favicon, SVG navigation family, Light tokens, component treatment, accepted responsive shell, Journal workspace, and Daily Log Editor presentation are documented as the current production refinement. `docs/STITCH_FRONTEND_INTEGRATION_PLAN.md` records the translation and acceptance boundaries. No merge, release, tag, or v1.2 is implied.

Controls: Product naming, brand position, promise, tagline, personality, anti-traits, visual principles, symbol direction, color philosophy, typography, icon direction, voice, placement rules, DOCX and backup boundaries, and later asset/integration requirements.

Completed in Phase 5C: primary responsive shell, Journal composition, accessible read-only day summaries, and Journal review/approval. Completed in Phase 5D: Daily Log Editor shell/lifecycle, content presentation, Editor review/approval, and E1A through E3A. Phase 5E documentation synchronization records the responsive Light/Dark review, keyboard/focus behavior, validation, photo workflows, backup, Preview, and browser DOCX evidence. Remaining work is broader application-wide regression, later screen-body refinement, and release preparation.

## 2. Product identity

Official name: OJT Journal Companion

Name rules:

- Use the full name in product-facing identity.
- Preserve the exact capitalization.
- Do not substitute OJC.
- Do not introduce OJT Companion as a second official name.
- Mark-only use is allowed in extremely constrained visual contexts when an accessible product name remains available.
- The production navigation destination is Preview & Export; do not shorten it to standalone Export.

The protected technical identity is:

    appName = OJT Journal Companion

Backup compatibility must not be changed casually for cosmetic branding.

## 3. Audience and user context

The primary audience is:

- students and interns completing OJT;
- users recording work experiences;
- users preparing official weekly journal content; and
- users responsible for their own local backups.

Supervisors, coordinators, administrators, and institutional staff are not current primary app users. The product remains a personal tool for one student on one browser/device.

## 4. User need

The product helps a student:

- capture daily work;
- track rendered hours;
- retain task and photo evidence;
- prepare weekly journal content;
- reflect on learning; and
- protect local records through JSON backup.

## 5. Brand position

> OJT Journal Companion is a warm, dependable digital work journal that helps students document their experiences, reflect on what they learn, and recognize their professional growth over time.

This is a product position, not exaggerated marketing copy. It describes the existing local journal, reflection, progress, and recovery behavior.

## 6. Brand promise

> Turn everyday OJT work into an organized, recoverable record of experience and growth.

This promise is intentionally limited to actual product behavior. It does not promise guaranteed data safety, cloud backup, institutional approval, automatic journal completion, or career success.

## 7. Core concept

    Work Journal
    +
    Growth Journey

    Work Journal = functional foundation
    Growth Journey = emotional meaning

The locked target balance is:

    70% Work Journal / 30% Growth Journey

Work Journal should lead the information architecture, terminology, forms, daily records, evidence, preview, and export. Growth Journey should add measured progress, learning, reflection, and completed-work context. Growth must remain evidence-based and connected to documented work, rendered hours, completed entries, learning, and reflection.

Growth must not become streaks, trophies, badges, points, competition, exaggerated motivational language, or a habit-tracker identity.

## 8. Tagline

The official brand line is:

> Record the work. Reflect on the journey.

Approved placement includes:

- README brand header;
- future brand presentation;
- selected onboarding or empty-state use;
- future documentation cover; and
- an optional Dashboard introduction when it is not repetitive.

Avoid using the tagline in every page, navigation labels, form headings, modal headings, status messages, validation messages, the official DOCX, JSON backup metadata, filenames, or restore validation. Do not repeat the tagline persistently on mobile screens. The checkpointed full sticky mobile brand header is provisional and is not the accepted final direction.

## 9. Personality

### Grounded

Meaning: Practical, local, honest, and connected to real OJT work.

Visible behavior: The app explains browser storage, backup limits, editable DOCX output, and recovery steps plainly.

Writing implication: Prefer concrete verbs and accurate limitations over grand claims.

Visual implication: Use warm surfaces, stable hierarchy, and restrained decoration.

Avoid: Rustic nostalgia, invented certainty, or decorative student-life clichés.

### Organized

Meaning: Helps a student find the right week, day, task, photo, and summary.

Visible behavior: Selected-week continuity, four clear destinations, structured records, and Restore Review.

Writing implication: Use predictable labels and one action per control.

Visual implication: Use spacing, grouping, dividers, and page-like structure before decoration.

Avoid: Dense dashboards, competing labels, or ornamental hierarchy.

### Reflective

Meaning: Makes room for learning and meaning without forcing a mood.

Visible behavior: Skills Learned, Problems Encountered, and Reflection / Points of Learning fields.

Writing implication: Invite review without judging the student.

Visual implication: Give summaries and reflection enough calm space to be read.

Avoid: Inspirational slogans, emotional pressure, or forced positivity.

### Progressive

Meaning: Shows movement through documented work and completed hours.

Visible behavior: Rendered-hour totals, progress, completion status, and day handoffs.

Writing implication: Describe evidence and next actions, not personal achievement scores.

Visual implication: Use one restrained rising motion or milestone cue.

Avoid: Analytics arrows, streaks, badges, trophies, or competitive ranking.

### Dependable

Meaning: Behaves predictably and explains risk honestly.

Visible behavior: Validation, recovery review, safety export, reset safeguards, and clear DOCX boundaries.

Writing implication: State what happened and what the user can do next.

Visual implication: Use stable tokens, visible focus, clear borders, and reliable contrast.

Avoid: Hidden state, ambiguous warnings, or identity that depends on animation.

### Encouraging

Meaning: Helps the student continue without judgment or pressure.

Visible behavior: Start-here guidance, actionable empty states, and what-to-do-next orientation.

Writing implication: Use supportive, direct instructions rather than praise inflation.

Visual implication: Let warmth come from color and spacing, not cartoon devices.

Avoid: Amazing, crush your goals, streak pressure, or childish rewards.

## 10. Anti-traits

- Childish: Cartoon mascots, stickers, exaggerated rewards, and playful sound effects would undermine the dependable journal role.
- Cartoon-like: Oversized faces, expressive characters, and comic motion would shift attention away from the student record.
- Gamified: Points, badges, trophies, competition, and reward loops would turn evidence of work into a score.
- Overly academic: Graduation caps, open-book clichés, and school-seal styling would narrow the product to institutional symbolism.
- School administration portal: Registration, approval, and coordinator-oriented language would misrepresent the current personal workflow.
- Corporate HR: Employee-performance framing, surveillance language, and managerial dashboards would misstate the audience.
- Attendance surveillance: GPS, verification, compliance, and monitoring metaphors are outside the product boundary.
- Generic productivity dashboard: Excessive KPI cards, charts, and analytics arrows would hide the journal foundation.
- Motivational habit tracker: Streaks, daily pressure, points, and never-miss-a-day language are prohibited.
- Rustic or vintage: Distressed paper, heavy texture, script type, and faux-aged materials would make the warm palette decorative rather than professional.
- Scrapbook: Torn paper, tape, stickers, and collage decoration would compete with the student evidence.
- Government form system: Rigid bureaucratic styling and official-seal cues would imply authority the app does not have.
- Unauthorized institutional brand: School, host-company, or BPC identity must not be guessed or embedded without permission.

## 11. Visual principles

1. Structured before decorative. Journal hierarchy, dates, tasks, evidence, and summaries must remain immediately legible.
2. Warm but professional. Use earth tones as measured atmosphere, not as a rustic theme.
3. Progress without gamification. Show movement through hours and completed records, never through scores or rewards.
4. Quiet confidence. Let spacing, borders, and consistent states communicate reliability more than visual effects.
5. Accessible in every theme. Semantic roles, focus, forced colors, reduced motion, zoom, and touch usability outrank decorative brand color.

## 12. Primary symbol strategy

Primary: Structured journal page plus subtle rising progress line.

The symbol should communicate:

    Document -> Reflect -> Progress

The progress cue must not be a literal generic arrow. The symbol should be simple, calm, structured, recognizable, professional, warm, compact, distinct at small sizes, and adaptable to Light and Dark.

Fallback: Page corner plus subtle milestone. Use this only if small-size testing shows the primary construction cannot remain legible.

The selected production direction is the Stitch Warm Journal refinement of Concept A — Rising Rule. The decision is recorded in `docs/brand-exploration/phase-5c/STITCH_DIRECTION_DECISION.md`. `app/assets/brand/brand-mark.svg` is the canonical mark geometry; inline copies must match it or an explicitly documented approved variant, and mark changes begin with the canonical asset.

## 13. Symbol construction constraints

The selected square-canvas mark uses:

- rounded page geometry;
- restrained corner radius;
- consistent stroke;
- no more than two or three journal lines;
- one restrained progress motion;
- no literal arrowhead unless extremely subtle and justified; and
- no more than two visual ideas in one mark.

The mark must be tested at:

    16px
    24px
    32px
    48px
    128px
    512px

The 16px version may use a simplified form. It must remain recognizable, balanced, and clear in one color, reversed, without text, and beside the full product name. It must not resemble analytics software.

## 14. Logo architecture

Future variants may include:

    Brand mark
    Horizontal lockup
    One-color mark
    Reverse mark
    Favicon simplification

Use live text for the wordmark where practical. Retain the system-font identity. Do not embed a decorative display font or place the full product name inside tiny raster assets. The app uses local scalable SVG mark assets and live product-name text.

## 15. Compact identity rule

- The full product name remains preferred.
- There is no second official compact name.
- Mark-only use is acceptable in constrained areas.
- An accessible product name must remain available.
- Mobile UI must not become crowded merely to display branding.
- Do not require a new mobile logo header.

`OJT Companion` is a rejected Stitch prototype shorthand, not an approved production identity or interface label.

### 15.1 Primary responsive shell

- Use one compact top app bar with the theme control reachable from it.
- Keep the full accessible product name available without persistently repeating the tagline.
- Use one centered responsive content canvas.
- Use a full-width fixed bottom navigation bar on compact/mobile screens.
- Use a centered floating bottom-navigation dock on wider tablet and desktop screens.
- Keep navigation exactly Dashboard, Journal, Preview & Export, and Settings while preserving targets, labels, `aria-current`, and `data-section` values.
- Preserve bottom clearance, safe areas, keyboard access, visible focus, touch targets, zoom, and reduced motion.
- Do not use a permanent desktop sidebar in the accepted Phase 5C Journal translation.

The desktop sidebar remains historical Phase 4 behavior and is intentionally superseded for Phase 5C Journal presentation only. This shell decision does not authorize functional or data changes.

## 16. Color philosophy

The color foundation uses warm earth tones to create journal warmth and grounded professionalism. Olive and green cues communicate measured progress without becoming reward colors. Existing semantic theme tokens are authoritative for production Dark-mode colors and contrast. The incomplete Stitch Dark implementation is not a source of truth, and the Light screenshot must not be mechanically inverted. New components must work through semantic tokens in Light, Dark, and System appearance.

Semantic tokens control components. Brand colors do not override accessibility roles.

## 17. Light brand roles

| Color | Provisional role | Preferred use | Restricted use / overuse risk |
| --- | --- | --- | --- |
| Vanilla Cream #f0ead2 | Primary warm canvas | Main background, calm reading surfaces, light mark support | Avoid using it for low-contrast text or every elevated surface |
| Ash Brown #6c584c | Strongest Light brand anchor | Top app bar, navigation dock, secondary text, grounded structural emphasis | Do not use for small text where contrast is insufficient |
| Muted Olive #adc178 | Progress/accent support | Progress fill, selected emphasis, restrained active cues | Do not make every action green or imply status by color alone |
| Tea Green #dde5b6 | Calm selected/inset support | Inset panels, selected surfaces, gentle grouping | Large-area overuse can make the interface feel pastel or childish |
| Faded Copper #a98467 | Structural/detail accent | Borders, quiet dividers, limited interaction accents | Do not use as body text or as a dominant decorative color |

These are provisional brand roles over the existing semantic CSS foundation. CSS is unchanged in Phase 5B.

## 18. Dark brand roles

| Color | Provisional role | Preferred use | Restricted use / overuse risk |
| --- | --- | --- | --- |
| Matterhorn #4e3c3b | Dark structural brand anchor | Top app bar, navigation dock, strong earth-toned shell surfaces | Avoid making every surface brown or reducing hierarchy |
| Cameo #d8b99d | Primary Dark highlight/accent | Interactive emphasis, borders, restrained highlights | Cameo on Siam is not appropriate for normal body text |
| Vanilla Cream #f0ead2 | High-readability text/light mark support | Primary text and reversed mark support | Reserve for readable emphasis, not decorative noise |
| Siam #5c5f4f | Muted selected/inset/progress support | Inset surfaces and subdued active states | Weak decorative pairs remain decorative only |
| Tundora #474747 | Elevated surface hierarchy | Shell and elevated neutral surfaces | Do not flatten all dark surfaces to the same gray |
| Mine Shaft #292929 | Deep canvas | Main dark canvas and strong contrast base | Avoid low-contrast text or muted decoration against it |

Known constraint: Cameo on Siam is not appropriate for normal body text. Weak decorative pairs must remain decorative only. Semantic theme tokens, not raw Stitch swatches, control production contrast and Dark-mode behavior.

## 19. Brand-color usage rules

- Primary: Vanilla Cream and the strongest theme-specific structural anchor.
- Secondary: Ash Brown in Light; Cameo and Matterhorn relationships in Dark.
- Supporting: Muted Olive, Tea Green, and Siam for selected, inset, and progress support.
- Canvas: Theme canvas tokens remain responsible for readable surfaces.
- Text: Semantic text tokens take precedence over brand swatches.
- Focus: Focus tokens must remain visibly distinct in both themes.
- Status: Error, warning, success, and information colors remain semantic state colors, not decorative brand colors.

No state may be communicated by color alone.

## 20. Typography

The existing system stack is locked:

    system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Rules:

- No Google Fonts or other runtime font request.
- No new bundled font dependency.
- Plus Jakarta Sans and Work Sans are rejected Stitch prototype dependencies, not Phase 5D options.
- Approximate Stitch typography through size, weight, spacing, line height, and layout.
- No handwritten or script font.
- No decorative serif in the live application.
- Changing the locked font policy requires a separate explicit brand decision.

Practical weight roles are:

    Regular  = body copy and longer reading
    Medium   = supporting labels and quiet emphasis
    Semibold = controls, navigation, and compact headings
    Bold     = section headings and primary hierarchy

No unsupported font files are implied.

## 21. Icon system

Future UI icons should use:

- local inline SVG;
- no external library;
- a 24px default viewBox;
- simple outline construction;
- rounded linecaps and line joins;
- a consistent 2px stroke where practical;
- recognizable small-size silhouettes; and
- semantic color or contained fill for active state when useful.

An icon cannot be the only accessible name for an unfamiliar action.

Desktop and mobile navigation use one local inline SVG family with visible text labels and unchanged navigation targets.

## 22. Imagery and illustration

There is no required illustration system in the current scope. Do not add a mascot, cartoon sticker system, or decorative stock photography. User-uploaded OJT photos are work content, not brand decoration.

Permitted future support includes restrained line motifs, page dividers, subtle progress paths, and documentation diagrams when they improve comprehension.

## 23. Shape and surface language

Preserve the Phase 4 foundation:

- rounded but professional surfaces;
- restrained shadows;
- clear borders;
- page-like hierarchy;
- strong spacing;
- consistent cards; and
- clear focus outlines.

Avoid torn paper, realistic notebook rings, aged paper textures, heavy grain, scrapbook decoration, excessive page curls, and other literal stationery effects.

## 24. Motion

Branding cannot depend on animation. Do not add continuous decorative motion or a required loading animation. Any future mark transition must be subtle and must respect reduced-motion preferences. Static clarity is the source of truth.

## 25. Voice and tone

The voice is:

    Clear
    Calm
    Supportive
    Practical
    Nonjudgmental
    Trustworthy

- Clear: Name the action and result plainly.
- Calm: Avoid urgency, hype, and emotional overstatement.
- Supportive: Give a useful next step without judgment.
- Practical: Describe what the user can do now.
- Nonjudgmental: Report missing or incomplete information without blame.
- Trustworthy: State limits, especially around local storage and recovery.

Approved examples:

| Avoid | Prefer |
| --- | --- |
| You failed to complete this field! | Enter your student name. |
| Your data is totally safe. | Export a JSON backup regularly to keep your records recoverable. |
| Amazing! You crushed your week! | Week complete. Review your journal before exporting. |

Current application copy is not being rewritten during Phase 5B.

## 26. Messaging hierarchy

Product name: OJT Journal Companion

Tagline: Record the work. Reflect on the journey.

Brand promise: Turn everyday OJT work into an organized, recoverable record of experience and growth.

Functional description: A local, offline-first journal for recording OJT work, rendered hours, tasks, photos, weekly reflection, backup, and Official DOCX preparation.

These roles must not be mixed. The tagline is not a form label, the promise is not a validation message, and the functional description is not a slogan.

## 27. Brand placement rules

| Surface | Rule |
| --- | --- |
| Top app bar | Pair a compact mark treatment with the full accessible product name. Keep the theme control reachable and do not persistently repeat the tagline. |
| Primary navigation | Use a full-width fixed bottom bar on compact/mobile screens and a centered floating bottom dock on wider tablet and desktop screens. Keep exactly four production destinations. |
| Dashboard | Allow one restrained tagline or brand-promise use, preferably in onboarding or an empty state. Avoid repetition on every card. |
| Navigation | Do not use the tagline. Keep labels functional. |
| Dialogs and forms | Prioritize clarity and safety. Do not add decorative brand copy. |
| Preview | Keep product identity subtle and preserve the official journal purpose. |
| Settings and Recovery | Prioritize clarity, safety, and honest storage guidance over decoration. |
| README | Approved future use includes product name, mark, tagline, and a concise product promise. |

The checkpointed sticky mobile header and permanent desktop sidebar are historical Phase 4 runtime behavior. The accepted Phase 5C Journal presentation intentionally supersedes both with the compact top app bar and responsive bottom-navigation system.

## 28. Favicon and app-icon strategy

The app includes a local scalable brand mark and an SVG favicon with Light/Dark-compatible styling. PWA PNG install icons remain Phase 6 work.

Installable PWA work is not automatically part of this phase. A service worker, offline installation flow, web app manifest, and 192px/512px install icons require an explicitly approved deployment feature. Do not add manifest.webmanifest as part of branding alone.

## 29. Asset-format rules

The active asset path is:

    app/assets/brand/

Potential later assets include:

    brand-mark.svg
    favicon.svg
    favicon-32.png

Assets are local, optimized, small, free of external font embedding, free of remote dependencies, and paired with accessible product-name text in the interface. `app/assets/brand/brand-mark.svg` remains the canonical source for mark geometry.

## 30. Official DOCX boundary

OJT Journal Companion branding must not be added to the official DOCX by default.

The official output preserves school-template identity, signature and institutional requirements, editable layout, and blank signature areas. Product branding may conflict with official submission expectations. Any future DOCX branding requires explicit approval and must not alter the current template contract casually.

## 31. Backup boundary

The following values are protected:

    appName = OJT Journal Companion
    backupVersion = "1.0"

Do not alter backup identity for cosmetic branding. Do not add the tagline, logo data, brand colors, or decorative metadata to the backup contract without a separate compatibility decision. JSON remains the restore path; DOCX remains editable output and cannot restore app data.

## 32. Institutional-branding boundary

Keep these identities separate:

    Product brand
    School brand
    Host-company brand
    Official journal-template brand

Do not place BPC identity, host-company identity, or guessed school identity in the product shell. Official template branding remains template-controlled. Configurable institutional theming is deferred until authoritative assets, permission, and requirements exist.

## 33. Accessibility rules

Brand implementation must preserve text and focus contrast, keyboard access, touch targets, 200–400% zoom, narrow screens, forced-colors behavior, reduced motion, Light/Dark/System behavior, semantic status meaning, and non-color cues.

Prohibited brand patterns:

- logo-only navigation without accessible names;
- decorative low-contrast text;
- text over complex textures;
- color-only state;
- script fonts;
- hidden focus rings; and
- brand colors overriding error, warning, success, or information meaning.

This document does not claim formal WCAG conformance.

## 34. Offline and performance rules

Brand identity must use local assets, avoid runtime brand fetches, avoid external fonts and icon libraries, keep SVG and PNG assets small, and never delay access to journal data. No branding dependency may block app startup.

## 35. Phase 5C design brief

Phase 5C selected the primary journal-page plus subtle-rising-progress-line direction through the Stitch Warm Journal refinement of Concept A.

Future exploration requirements:

- three primary-direction variations;
- one fallback variation;
- monochrome check;
- Light treatment;
- Dark treatment;
- 16px simplification;
- 24px UI mark;
- 32px navigation-dock mark;
- 128px documentation mark; and
- 512px source master.

The scalable master and simplified favicon are prepared. Journal and Daily Log Editor Light/Dark acceptance is recorded; any broader small-size mark confirmation remains a separate closeout check and is not claimed here.

## 36. Phase 5C Journal and Phase 5D Daily Log Editor integration boundaries

`docs/STITCH_FRONTEND_INTEGRATION_PLAN.md` is the implementation contract. The locked boundaries are:

- Journal Daily Record headers control accessible read-only accordion summaries; explicit Open/Create/Edit actions own full editing, and Log Today may open today's editor directly.
- Compact/mobile uses a rounded bottom sheet; desktop uses a contained responsive dialog. Existing dialog semantics, focus lifecycle, inertness, scroll locking, Escape behavior, and focus restoration remain authoritative.
- A real exit animation requires one centralized open/closing/removal lifecycle with transition and timeout completion, reduced-motion bypass, error cleanup, and protection against permanently inert application state.
- `styles.css` owns semantic tokens, theme-neutral structure, responsive mechanics, accessibility, dialog/sheet behavior, focus, motion lifecycle, reduced motion, and semantic status states.
- `warm-journal.css` owns the Warm Journal visual skin, approved brand relationships, restrained decorative treatment, non-mechanical radius/shadow refinement, and product lockup/mark presentation.
- Do not maintain competing complete layouts in both stylesheets, broad late overrides, or unnecessary `!important`.
- Stored photo Blobs may produce runtime-only thumbnail object URLs. Revoke them when replaced, rerendered, closed, or unused; never persist them to IndexedDB, backups, or DOCX payloads.
- The accepted implementation establishes the compact top app bar, centered canvas, fixed compact/mobile bottom bar, and centered floating wider-screen dock. It does not retain a permanent desktop sidebar.
- Journal and Daily Log Editor visual and functional approval gates are complete. Dashboard, Preview & Export, Settings, and remaining page bodies require separately scoped reuse of the accepted system.

No selected-week, Journal ownership, Log Today, handoff, Settings, Daily Log Editor, database, backup, photo-set, DOCX, appearance-persistence, deployment, framework, font, icon-library, or product-boundary change is authorized by this visual translation.

## 37. Acceptance checklist

Before brand integration is accepted:

- The product name remains OJT Journal Companion, and production navigation remains Preview & Export.
- The Journal and Daily Log Editor passed their separate approval gates; remaining screens are not marked complete by this checkpoint.
- The mark works at 16px and in one color.
- The mark works in Light and Dark.
- No external dependency is required.
- No contrast regression exists.
- No responsive, focus, or navigation regression exists.
- Backup identity is unchanged.
- DOCX branding is absent unless separately approved.
- No institutional-brand assumption is introduced.
- The tagline is used selectively.
- The icon system is consistent.
- The brand does not become childish, rustic, corporate, or gamified.

## 38. Decision register

| Decision | Status | Current rule |
| --- | --- | --- |
| Official name | Locked | OJT Journal Companion |
| Production export navigation | Locked | Preview & Export; never standalone Export |
| Compact name | Locked | No second official compact name; mark-only use is allowed when accessible naming remains available |
| Tagline | Locked | Record the work. Reflect on the journey. |
| Brand position | Locked | Warm, dependable digital work journal supporting documentation, reflection, and professional growth |
| Brand promise | Locked | Turn everyday OJT work into an organized, recoverable record of experience and growth. |
| Combined concept | Locked | Work Journal + Growth Journey |
| Balance | Locked | 70% Work Journal / 30% Growth Journey |
| Personality | Locked | Grounded, Organized, Reflective, Progressive, Dependable, Encouraging |
| Anti-traits | Locked | No childish, gamified, corporate HR, surveillance, rustic/vintage, scrapbook, government-form, or unauthorized institutional identity |
| Primary symbol | Locked and implemented | Stitch Warm Journal refinement of Concept A: structured journal page + subtle rising progress line |
| Canonical mark source | Locked | `app/assets/brand/brand-mark.svg`; inline use must match canonical or an approved documented variant |
| Fallback symbol | Retained as exploration history | Page corner + subtle milestone remains available only if a separately scoped future small-size test rejects the primary mark |
| Palette family | Locked foundation | Existing Light and Dark earth-toned families; semantic roles remain authoritative |
| Dark-mode authority | Locked | Existing semantic theme tokens control production colors and contrast; Stitch Dark is not authoritative |
| Primary shell | Locked | Compact top app bar; centered canvas; fixed full-width compact/mobile bottom bar; centered floating wider-screen dock; no permanent desktop sidebar |
| Mobile header | Locked | The compact top app bar keeps the accessible product name and theme control available without persistent tagline repetition |
| CSS ownership | Locked | `styles.css` owns mechanics/accessibility; `warm-journal.css` owns the Warm Journal skin |
| Typography | Locked | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; no runtime or bundled font dependency |
| Icon style | Locked and implemented | Local inline SVG, simple outline family shared by desktop and mobile navigation |
| Favicon | Implemented | `app/assets/brand/favicon.svg`; PWA PNG install icons remain deferred |
| Web app manifest | Deferred | Not automatically in scope for branding |
| DOCX branding | Protected boundary | Excluded by default; requires explicit approval |
| Backup identity | Protected boundary | appName = OJT Journal Companion; backupVersion = "1.0" |
| Institutional theming | Deferred | Requires authoritative assets, permission, and separate scope |
| Asset path | Active | `app/assets/brand/` |
| External dependencies | Locked | No remote fonts, icon libraries, image fetches, or branding runtime dependency |
