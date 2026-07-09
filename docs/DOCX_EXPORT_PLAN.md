# Official DOCX Export Plan

Implementation plan and status document for the post-v1.0 / v1.1 candidate feature: **Official BPC OJT Weekly Journal DOCX Export**.

The feature is implemented on `feature/docx-export` and is in Phase 4 final regression, polish, and documentation review.

---

## Plan Status

| Item | Status |
| --- | --- |
| v1.0 app release | Complete, tagged, and released |
| Weekly Preview + copy text | Complete (manual transfer workflow) |
| Official DOCX export | **Implemented on `feature/docx-export`; Phase 4 final regression/polish in progress** |
| Official BPC `.docx` template in repo | **Private official template remains local/ignored; sanitized fallback template is committed** |
| Client-side DOCX library decision | **Complete; vendored docxtemplater + PizZip** |
| DOCX photo documentation appendix | **Required by adviser; Phase 0 feasibility reviewed on `feature/docx-photo-appendix`; implementation pending dependency approval** |
| Phase 0 dependency/template review | Complete |
| Phase 1 shared journal payload helper | Complete |
| Phase 2 core DOCX export engine | Complete |
| Phase 3 UI integration and warnings | Complete |
| Phase 4 final regression, polish, docs | In progress |

---

## Phase 0 Dependency Review

Phase 0 review checked the current plan against the v1.0 codebase and current upstream dependency metadata. The recommended direction remains realistic for this no-build, offline-first app: use browser-ready, vendored scripts loaded by `<script>` tags, keep generation client-side, and avoid npm/build tooling.

| Library | Version considered | License | Source checked | Acceptable to vendor? | Restrictions or cautions |
| --- | --- | --- | --- | --- | --- |
| docxtemplater | 3.69.0 | MIT or GPL-3.0 dual license; package metadata lists MIT | Upstream GitHub `package.json`, upstream `LICENSE.md`, Docxtemplater browser docs at `https://docxtemplater.com/docs/get-started-browser/` | Yes, under the MIT option | Include/retain license notice when vendoring. The open-source core is enough for text, loops, and line breaks, but the required photo appendix needs a separate image insertion dependency decision before implementation. |
| PizZip | 3.2.0 | MIT or GPL-3.0 dual license | Upstream GitHub `package.json`, upstream `LICENSE.markdown`, Docxtemplater browser docs at `https://docxtemplater.com/docs/get-started-browser/` | Yes, under the MIT option | Include/retain license notice when vendoring. PizZip depends on `pako`; if a downloaded browser build includes bundled dependency code, preserve bundled notices and verify the distributed file's license header before committing. |

Dependency shape notes:

- Docxtemplater's browser documentation demonstrates loading `docxtemplater@3.69.0` and `pizzip@3.2.0` directly in the browser with plain script tags, so the proposed no-npm/no-bundler approach fits the current vanilla app architecture.
- The docs also show `pizzip-utils` and `file-saver` in examples. For this app, prefer native `fetch()`/`arrayBuffer()` for the local template and a temporary `<a download>` with a generated Blob, so no extra library is planned unless implementation testing proves it necessary.
- Docxtemplater package metadata currently lists `@xmldom/xmldom` as a dependency. Before vendoring a specific built file, inspect that distributed file and record any bundled transitive license notices if present.

Codebase alignment notes:

- `journal-preview.js` already derives Day 1 through Day N from `OJTWeek.inclusiveStartDate` and `inclusiveEndDate`, matching the dynamic day-row decision.
- Weekly totals already use `OJTCalculations.sumRenderedMinutes()` over related `DailyLog` records, so no IndexedDB schema or stored weekly total is needed.
- Current copy text includes task status through `getTaskBulletText()`. DOCX export should share date/log/task collection with preview and include task status in DOCX-specific accomplishment lines because the official journal submission requires it.
- `calculations.js` exposes the needed status normalization and rendered-time helpers; Phase 1 should reuse those rules without changing calculation behavior.

## Template Asset Decision

Do not commit the real official BPC-branded DOCX template to the public repository unless public sharing is confirmed by the school or institution.

Recommended default:

- Commit a sanitized template in the repo, using the same layout and placeholder names but without restricted BPC branding or private institutional content.
- Keep the real official BPC template local only, under `app/assets/templates/bpc-ojt-weekly-journal.private.docx`.
- `.gitignore` now excludes that private local template path to reduce accidental commits. If a different private filename is used later, add only that exact path.

---

## Feature Goal

Let the student select a saved OJT week in **Weekly Preview** and download a filled **official BPC OJT weekly journal DOCX file** that matches the school template layout as closely as practical.

The export should:

- Run entirely in the browser (offline-first, no backend).
- Fill the official template from existing IndexedDB records.
- Use the selected week's **inclusive date range** to decide how many Day rows appear in the output.
- Leave signature lines blank.
- Preserve the official journal pages and layout, then append a separate **Photo Documentation** section after the official journal content.
- Group exported photos by Day N and actual date, with saved captions when available.
- Exclude photos from Daily Accomplishments table cells and exclude time-in/time-out columns from the official document body. Task status remains personal progress tracking inside the app, but it is included in DOCX output as part of each submitted accomplishment line because the official journal submission requires it.
- Not submit, email, upload, or auto-sign anything.

This feature extends the current "copy to clipboard" workflow. It does not replace JSON backup or change how local data is stored.

---

## User Workflow

1. Student completes profile, company info, OJT week, daily logs, tasks, and weekly summary fields (same as v1.0).
2. Student opens **Weekly Preview** and selects the target week.
3. Student reviews the on-screen preview (existing v1.0 behavior).
4. Student clicks **Export Official DOCX**.
5. If the week is not exactly 6 days, the app shows a **non-blocking warning** explaining the day-count mismatch (see [Warning Behavior](#warning-behavior-for-non-6-day-weeks)).
6. If profile or summary data is missing, the app shows warnings but may still allow export (same spirit as current profile warnings).
7. App builds a DOCX from the official BPC template + mapped app data.
8. Browser downloads the file (suggested name: `OJT-Week-{weekNumber}-{inclusiveStartDate}.docx`).
9. Student opens the DOCX locally, adds signatures by hand, and submits through normal school channels.

No login, cloud sync, Google Drive upload, or online submission is involved.

---

## Scope Boundaries

### In scope (proposed v1.1)

- One selected `OJTWeek` → one downloadable DOCX.
- Dynamic Day 1…Day N rows from `inclusiveStartDate` to `inclusiveEndDate`, with DOCX row labels showing both day number and calendar date.
- Header fields: Student Name, Company, Week Number, Inclusive Dates.
- Daily Accomplishments table with accomplishment text per day.
- Total weekly Hours Rendered (calculated from `DailyLog` records).
- Weekly summary sections: Skills Learned, Problems Encountered, Reflection (Points of Learning).
- Blank signature lines preserved from the official template.
- Separate Photo Documentation appendix after the official journal content, grouped by Day N and actual date, preserving image aspect ratio and captions when available.
- Client-side generation only; works offline after the app and template asset are loaded.

### Out of scope (this feature)

- PDF export (separate future feature).
- Placing photos inside Daily Accomplishments table cells.
- Time in / time out / break columns in the official DOCX (internal records only).
- Treating task status labels (`Pending`, `In Progress`, `Completed`) as supervisor approval, official validation, grading, or signatures.
- Auto-signatures, supervisor validation, or approval workflows.
- Google Drive upload, email sending, or online submission.
- Backend server, login, accounts, or cloud sync.
- Batch export of all weeks in one file.
- Merge or edit existing DOCX files the user already signed.
- ZIP export, PWA changes, or build-tool migration.

---

## Official BPC Weekly Journal Template Structure

Based on the official template reference documented in `docs/POLISH_ROADMAP.md` and aligned with the current Weekly Preview layout:

```
┌──────────────────────────────────────────────┐
│     On-the Job Training Weekly Journal       │
├────────────────────┬─────────────────────────┤
│ Student Name       │ (value)                 │
│ Company            │ (value)                 │
│ Week Number        │ (i.e. #1)               │
│ Inclusive Dates    │ (i.e. June 22–June 29)  │
├────────────────────┴─────────────────────────┤
│            Daily Accomplishments             │
├──────────┬───────────────────────────────────┤
│ Day 1    │ (accomplishment bullets)          │
├──────────┼───────────────────────────────────┤
│ Day 2    │ (accomplishment bullets)          │
├──────────┼───────────────────────────────────┤
│  ...     │  ...                              │
├──────────┼───────────────────────────────────┤
│ Day N    │ (accomplishment bullets)          │
├──────────┴───────────────────────────────────┤
│           Total weekly Hours Rendered: __    │
├──────────────────────────────────────────────┤
│ Skills Learned                               │
│ (text)                                       │
├──────────────────────────────────────────────┤
│ Problems Encountered                         │
│ (text)                                       │
├──────────────────────────────────────────────┤
│ Reflection (Points of Learning)              │
│ (text)                                       │
├──────────────────────────────────────────────┤
│ (signature lines — remain blank)             │
└──────────────────────────────────────────────┘
```

**Template observations:**

- The sample template shows **6 day rows**, which matches a typical 6-day OJT week.
- The left column shows **Day 1 July 7, 2026**, **Day 2 July 8, 2026**, etc. — not time fields or day status.
- The right column holds accomplishment text (usually bullet-style lines).
- **Total weekly Hours Rendered** uses the exact label from the official template (lowercase "weekly").
- Summary section titles must match exactly: **Skills Learned**, **Problems Encountered**, **Reflection (Points of Learning)**.
- No photo section exists in the official form.
- Signature blocks must stay empty for the student and supervisor to fill in by hand.

**Implementation note:** The sanitized public `.docx` template is committed as a static asset. The real official BPC template can be used locally at `app/assets/templates/bpc-ojt-weekly-journal.private.docx`, but that private path is ignored and must not be committed unless public sharing is confirmed.

**Public repository caution:** Before committing the official BPC `.docx` template to a public GitHub repository, confirm that public sharing is allowed by the school or institution. If public sharing is **not** allowed, commit a **sanitized sample template** (same layout and placeholders, no school branding or restricted content) and keep the actual school template as a **local ignored file** (e.g. listed in `.gitignore` for developer machines only).

---

## Accepted Dynamic Day-Row Decision

**Decision (accepted):** Day rows in the exported DOCX must follow the selected `OJTWeek` date range, not a fixed Day 1–Day 6 layout.

Implementation rule (same logic as `getWeekDates()` in `journal-preview.js`):

1. Read `inclusiveStartDate` and `inclusiveEndDate` from the selected week.
2. Walk each calendar day from start to end (inclusive).
3. Assign **Day 1**, **Day 2**, … **Day N** in order.
4. Map each date to its matching `DailyLog` (if any) and related `DailyTask` records.
5. Format the DOCX row label as **Day N Month D, YYYY** using the selected week's actual date for that row.

**Examples:**

| Week range | Days in range | DOCX day rows |
| --- | --- | --- |
| Mon–Fri (5 days) | 5 | Day 1 + date … Day 5 + date |
| Mon–Sat (6 days) | 6 | Day 1 + date … Day 6 + date |
| Mon–Sun (7 days) | 7 | Day 1 + date … Day 7 + date |

The export must **not** pad a 5-day week with an empty Day 6, and must **not** truncate a 7-day week to 6 rows.

This matches how Weekly Preview already builds day rows today.

**Template fidelity note:** When the selected week is not exactly 6 days, the exported file may **not** be an exact row-for-row copy of the original school `.docx` (for example, fewer or more day rows than the printed template). The export should still preserve the official structure, section titles, and field labels as closely as practical for the actual day count.

---

## Warning Behavior for Non-6-Day Weeks

The official BPC template appears designed for a **6-day week**. When the selected week has a different day count, show a clear warning before download.

| Day count | Warning behavior |
| --- | --- |
| **6 days** | No day-count warning. Proceed with export (profile/summary warnings may still apply). |
| **5 days** | Show informational warning: *"This week has 5 days. The official template is usually formatted for 6 days. The exported file will include Day 1 through Day 5 only. Continue?"* User confirms or cancels. |
| **7 days** | Show informational warning: *"This week has 7 days. The official template is usually formatted for 6 days. The exported file will include Day 1 through Day 7. You may need to adjust formatting after opening the file. Continue?"* User confirms or cancels. |
| **Other counts (< 5 or > 7)** | Show a stronger warning explaining the day count is unusual for the official template. Still allow export after confirmation if data is valid. |

Additional warnings (non-blocking, same spirit as v1.0 Weekly Preview):

- Missing `studentName` or `companyName`.
- Empty weekly summary fields (Skills Learned, Problems Encountered, Reflection).
- Days in the range with no daily log saved.

Warnings should use plain language. They inform the student; they do not block export unless the user cancels the confirm dialog.

---

## Data Mapping from App Records to DOCX Fields

### Header block

| DOCX field | App source | Notes |
| --- | --- | --- |
| Student Name | `StudentProfile.studentName` | Required for a complete journal; warn if missing. |
| Company | `CompanyProfile.companyName` | Required for a complete journal; warn if missing. |
| Week Number | `OJTWeek.weekNumber` | Display as `#1`, `#2`, etc., if that matches the official form. |
| Inclusive Dates | `OJTWeek.inclusiveStartDate` + `OJTWeek.inclusiveEndDate` | Format for human readability (e.g. `June 22–June 29, 2025`). Internal storage stays `YYYY-MM-DD`. |

Optional context fields (include only if the official BPC template has placeholders for them):

| DOCX field | App source |
| --- | --- |
| Course / Program | `StudentProfile.courseOrProgram` |
| School / Institution | `StudentProfile.schoolOrInstitution` |
| Department / Area | `CompanyProfile.departmentOrAssignedArea` |
| Supervisor | `CompanyProfile.supervisorName` |

Confirm against the actual BPC `.docx` before coding. Do not invent fields that are not on the official form.

### Daily Accomplishments (per day row)

For each date in the week's inclusive range:

| DOCX cell | App source | Notes |
| --- | --- | --- |
| Left: `Day N Month D, YYYY` | Computed index (1-based) + selected week date | Not stored; derived from date order and formatted for DOCX only, e.g. `Day 1 July 7, 2026`. |
| Right: accomplishment text | `DailyLog` + related `DailyTask[]` | See [Export Content Rules](#export-content-rules). |

**Not mapped to the official DOCX:**

- `DailyLog.timeIn`, `timeOut`, `breakMinutes` (internal time records).
- `DailyLog.renderedMinutes` per day (only the **weekly total** appears on the form).
- `DailyTask.timeSpentMinutes` is included only as optional documentation text in the accomplishment line; it must not affect rendered hours.
- `DailyTask.status` is personal tracking inside the app, but it is included in DOCX output as part of the submitted accomplishment line because the official journal submission requires it.
- `OJTWeek.additionalNotes` (unless the official template has a matching field — currently it does not).

### Footer / summary block

| DOCX field | App source | Notes |
| --- | --- | --- |
| Total weekly Hours Rendered | Sum of `DailyLog.renderedMinutes` for the week | Use `OJTCalculations.sumRenderedMinutes()` and `formatRenderedTime()`. Only worked days contribute. |
| Skills Learned | `OJTWeek.weeklySkillsLearned` | Plain text; preserve line breaks. |
| Problems Encountered | `OJTWeek.problemsEncountered` | Plain text; preserve line breaks. |
| Reflection (Points of Learning) | `OJTWeek.reflectionOrPointsOfLearning` | Exact section title from official template. |
| Signature lines | — | **Leave blank.** |

### Photo Documentation Appendix

Photo documentation is now a required DOCX feature, but implementation is pending until the image insertion dependency is approved.

Accepted direction:

- Keep the official BPC journal pages unchanged as the primary document body.
- Add a separate **Photo Documentation** section after the official journal content.
- Pull photos from the selected week's related `DailyLog` and `PhotoAttachment` records in IndexedDB.
- Group photos by the same derived day order as the journal rows: `Day N Month D, YYYY`.
- Include the saved `PhotoAttachment.caption` when present.
- Preserve image aspect ratio and constrain photos to a predictable page width/height.
- Multi-page output is acceptable.

This should not change rendered-hours logic, task logic, backup/restore/reset behavior, or the IndexedDB schema unless a real blocker is found during implementation.

### Time calculation rules (must not change)

- `DailyLog.renderedMinutes` is the source of truth for rendered time.
- Rendered hours come from `timeIn`, `timeOut`, and `breakMinutes` when `dayStatus` is `Worked`.
- `DailyTask.timeSpentMinutes` is documentation only and must not affect official rendered hours or the weekly total.
- Weekly total hours come from related `DailyLog` records, not from a stored value on `OJTWeek`.
- Absent and rest days contribute `0` to the weekly total.

---

## Export Content Rules

Align DOCX day-cell text with the existing `buildPlainText()` / `renderDailyAccomplishment()` behavior in `journal-preview.js` unless the official template requires a different plain-text shape.

### Worked day (`dayStatus === "Worked"`)

- Output bullet-style lines from related `DailyTask` records, sorted by `sortOrder`.
- Each bullet uses task `description`.
- Optionally append task duration in parentheses if `timeSpentMinutes` is set (for example: `"Task name (1h 30m)"`).
- Include task status after the description/duration, separated by ` - ` (for example: `"• Task name (1h 30m) - Completed"`). Task status remains personal progress tracking inside the app, but it is included in DOCX output as part of the submitted accomplishment line.
- If multiple tasks exist, render as separate lines or Word bullet paragraphs inside the day cell.

### Worked day with no task items

- Export a single placeholder line: **"No task items recorded for this day."**
- Same as current Weekly Preview empty-state text.
- Do not infer accomplishments from photos or remarks.

### Absent day (`dayStatus === "Absent"`)

- Export: **`Absent`** on its own line.
- If `dayRemarks` is not empty, append on the same or next line: **`Absent — {dayRemarks}`** (matches copy-text format).

### Rest day (`dayStatus === "No OJT / Rest Day"`)

- Export: **`No OJT / Rest Day`** on its own line.
- Append `dayRemarks` the same way as absent days if present.

### Day in range with no `DailyLog` record

- Export: **"No daily log recorded."** (matches current copy text).
- Day label (`Day N`) still appears in the left column.

### Weekly summary fields empty

- Export empty paragraph or a neutral placeholder such as **"Not filled in yet."** (matches current preview helper text).
- Prefer empty cells if the official template looks cleaner that way — decide during template integration testing.

### Photos

- Append photos only in the Photo Documentation section after the official journal content.
- Do not place photos in Daily Accomplishments table cells.
- Group photos by Day N and actual date.
- Include captions when available.
- Preserve image aspect ratio.
- Do not infer accomplishments, rendered hours, attendance, approval, or validation from photos.

### Signatures

- Do not pre-fill student, supervisor, or school official names in signature blocks.
- Do not generate digital signatures or dates in signature areas.

---

## Technical Implementation Options

All options assume **client-side, offline-capable** generation with **no backend**.

### Option A — Template fill with docxtemplater + PizZip

Store the official BPC `.docx` in the repo. Add placeholders (e.g. `{studentName}`, `{day1Accomplishments}`) or use loop syntax for dynamic rows. Load vendored minified scripts via `<script>` tags (consistent with the no-bundler app style). PizZip is a zip utility commonly used with docxtemplater to read and write `.docx` files in the browser.

| Pros | Cons |
| --- | --- |
| Good fit for filling an existing official template | Adds vendored third-party JS (docxtemplater, pizzip) |
| Preserves school formatting, fonts, borders | Dynamic row counts may need docxtemplater loop blocks or multiple template variants |
| Beginner-friendly once placeholders are documented | Placeholder setup in Word requires care |

### Option B — JSZip + manual OOXML XML editing

Unzip the `.docx`, replace text nodes or table rows in `word/document.xml`, re-zip.

| Pros | Cons |
| --- | --- |
| Smallest dependency (JSZip only, likely already needed) | Fragile when the template changes |
| Full control over row cloning | Harder to maintain for beginners |
| No templating DSL to learn | Easy to break Word layout with bad XML edits |

### Option C — Generate DOCX from scratch (e.g. `docx` npm library)

Build the document programmatically without a school template file.

| Pros | Cons |
| --- | --- |
| Dynamic rows are straightforward in code | Hard to match official BPC layout exactly |
| Clean API for paragraphs and tables | Usually expects npm + bundler — conflicts with current no-build-tool setup |
| | School may reject visually mismatched output |

### Option D — HTML → DOCX conversion

Render HTML similar to Weekly Preview and convert to DOCX.

| Pros | Cons |
| --- | --- |
| Reuses existing preview HTML | Poor fidelity for official forms, tables, and page breaks |
| Fast to prototype | Unreliable across Word versions |

---

## Recommended Implementation Approach

**Recommended: Option A — template fill with vendored docxtemplater + PizZip**, with one official BPC template file prepared with placeholders.

**Why this fits the project:**

- The goal is to fill the **official** school form, not approximate it.
- The app already has no bundler; vendored scripts in `app/assets/js/vendor/` match the lightweight direction.
- Weekly Preview already defines the data shape and text rules; DOCX export should reuse that logic, not duplicate business rules.
- Dynamic day rows are best handled with a **loop block** in the template (one row pattern repeated) rather than hard-coding Day 1–Day 6 placeholders.

**Suggested architecture:**

1. Add `docx-export.js` module exposing `window.OJTDocxExport`.
2. Extract shared "week journal payload" builder from `journal-preview.js` (or call shared helpers) so copy text and DOCX use the same mapping rules.
3. Load template from `app/assets/templates/bpc-ojt-weekly-journal.docx` via `fetch()` (requires HTTP server, same as the rest of the app).
4. Build payload: header fields + array of `{ dayLabel, accomplishmentText }` + weekly total + summary fields. DOCX template data formats `dayLabel` as `Day N Month D, YYYY`.
5. Run docxtemplater → produce Blob → trigger download via temporary `<a download>`.
6. Wire **Export Official DOCX** button in Weekly Preview section.

**Dynamic rows strategy:**

- Prepare the official template with a single table row pattern inside a `{#days}` … `{/days}` loop (docxtemplater syntax).
- Each iteration fills `{dayLabel}` (e.g. "Day 1 July 7, 2026") and `{accomplishmentText}` (multiline string or sub-bullets).
- Avoid maintaining separate 5-day, 6-day, and 7-day template files unless loop rows prove unreliable in Word.

**Fallback if loops fail in Word:** maintain one master template and clone table rows programmatically (Option A + limited Option B hybrid) — only if testing shows the loop block breaks layout.

### Photo Appendix Feasibility Review

The existing vendored docxtemplater + PizZip setup can fill text, loops, and line breaks in an existing DOCX template, but it does not insert image binary parts by itself. A photo appendix needs one of these approved paths before implementation:

1. Add an image-capable docxtemplater module and keep the current template-driven architecture.
2. Manually edit DOCX Open XML package parts with PizZip, including image files, relationships, content types, and drawing XML.
3. Leave photo placement manual if dependency approval or browser testing fails.

Preferred direction is an image-capable docxtemplater module because it keeps the export architecture closest to the current implementation. Dependency approval must happen before coding image export.

---

## Files Affected

| File | Change |
| --- | --- |
| `app/assets/templates/bpc-ojt-weekly-journal.docx` | Sanitized committed fallback template with placeholders |
| `app/assets/templates/bpc-ojt-weekly-journal.private.docx` | Optional ignored local official template; must not be staged or committed |
| `app/assets/js/journal-payload.js` | Shared week/date/log/task payload builder for preview, copy text, and DOCX export |
| `app/assets/js/docx-export.js` | Template loading, docxtemplater merge, future photo appendix image handling, Blob generation, and download |
| `app/assets/js/journal-preview.js` | Export button warnings, confirmation flow, and UI integration |
| `app/index.html` | Export button and script tags for vendor libraries plus export modules |
| `app/assets/css/styles.css` | Styling for export controls and preview layout |
| `app/assets/js/vendor/pizzip.min.js` | Vendored DOCX zip dependency |
| `app/assets/js/vendor/docxtemplater.min.js` | Vendored DOCX templating dependency |
| `app/assets/js/vendor/*image-module*` | Potential future image insertion dependency, only after license and redistribution approval |
| `docs/DOCX_TEMPLATE_PLACEHOLDERS.md` | Template paths and placeholder map |
| `docs/DOCX_EXPORT_PLAN.md` | Implementation status and regression checklist |

Do not modify `backup.js`, `storage.js` schema, or IndexedDB version for this feature unless a separate decision adds export metadata (not required for v1.1).

---

## Dependency Decision

Decision recorded for this feature branch:

| Question | Options | Recommendation |
| --- | --- | --- |
| Which client library? | docxtemplater + PizZip, JSZip-only, other | **docxtemplater + PizZip**, vendored |
| How to add the library? | Vendored minified files in repo vs CDN | **Vendored in repo** (offline-first; no CDN required at runtime) |
| npm / build tools? | Add bundler vs stay vanilla | **Stay vanilla** — no npm, no bundler |
| Template preparation | Who adds Word placeholders? | Developer prepares one `.docx` from official BPC file and documents placeholders in this plan or a short `docs/DOCX_TEMPLATE_PLACEHOLDERS.md` |
| License check | docxtemplater, PizZip, and any other chosen library | Review and record in this document before vendoring |
| Photo appendix dependency | Paid official image module vs open-source community image module vs manual OOXML | **Pending approval**; do not implement image export until this is decided |

**Third-party license gate:** Completed for current text-only DOCX export dependencies. A new license gate is required before adding any image insertion dependency.

**Explicit constraint:** DOCX dependencies must remain vendored browser scripts. Do not introduce a build pipeline just for DOCX export.

---

## Risks and Tradeoffs

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Template layout breaks with 5 or 7 day rows | Exported file looks wrong in Word | Use loop rows; test all day counts; show non-6-day warnings |
| Official BPC template changes | Placeholders stop matching | Version the template file; document placeholder map |
| docxtemplater + Word compatibility | Bullets or line breaks render oddly | Test in Microsoft Word and LibreOffice; keep accomplishment text plain |
| Large accomplishment text overflows cells | Visual clipping in Word | Soft warning for very long text; preserve line breaks |
| Duplicated mapping logic | Copy text and DOCX drift apart | Share one payload builder between preview and export |
| `fetch()` for template requires HTTP server | `file://` may fail | Document same server requirement as IndexedDB testing |
| Vendored library size | Slightly heavier app load | Load vendor scripts only on Weekly Preview or lazy-load before export |
| Student assumes export replaces official submission | Process confusion | Clear microcopy: export is a draft; signatures and submission are manual |
| Photo-heavy DOCX files become large or slow | Browser memory pressure, slow download, difficult upload/submission | Keep current per-photo size limit, warn on large photo totals, and only downscale/compress after separate approval |
| Image module licensing is not approved | Cannot safely redistribute dependency | Keep photo placement manual, or use a reviewed alternative |

---

## Build Phases

### Phase 0 — Template and dependency prep — Complete

- Obtain official BPC weekly journal `.docx`.
- Confirm public-sharing rules; use sanitized sample template in repo if needed (see [Public repository caution](#official-bpc-weekly-journal-template-structure)).
- Add placeholders / loop block for dynamic days.
- Choose client libraries and complete the [third-party license gate](#dependency-decision-needed).
- Vendor approved libraries only after licenses are recorded in this document.
- Document placeholder names.

**Stop:** Template opens in Word and manual test fill looks correct; library licenses reviewed and recorded.

### Phase 1 — Shared journal payload builder — Complete

- Extract week export payload from existing preview logic (dates, logs, tasks, summaries, weekly total).
- Unit-test payload shape manually (console/log checklist).

**Stop:** Payload for 5-, 6-, and 7-day weeks matches Weekly Preview rules, and DOCX accomplishment text includes task description, optional duration, and task status.

### Phase 2 — Core DOCX generation — Complete

- Implement `docx-export.js`: load template, merge payload, produce Blob, trigger download.
- Handle missing profile/summary data gracefully.

**Stop:** Downloaded DOCX opens in Word with correct header, day rows, total, and summaries.

### Phase 3 — UI integration and warnings — Complete

- Add **Export Official DOCX** button to Weekly Preview.
- Implement non-6-day week confirm dialog.
- Reuse profile warning patterns from preview.

**Stop:** Full workflow works from week selection to downloaded file.

### Phase 4 — Manual regression and polish — In progress

- Run manual testing checklist (below).
- Adjust template or text formatting based on real Word output.
- Update this plan's status section.

**Stop:** Meets [Stop Condition](#stop-condition).

### Photo Appendix Phase 0 — Feasibility and implementation planning — Complete

- Confirmed photo records already exist in IndexedDB as `PhotoAttachment` records linked to `DailyLog`.
- Confirmed current DOCX payload does not load photo records yet.
- Confirmed existing docxtemplater + PizZip core is not enough for image insertion without an image module or manual OOXML work.
- Accepted appendix direction: preserve official journal pages, append Photo Documentation after official content, group by Day N and actual date, include captions, preserve image aspect ratio.
- Implementation remains pending until the dependency/license path is approved.

**Stop:** No code implementation in this phase.

---

## Manual Testing Checklist

Run on a local HTTP server after implementation.

### Setup

- [ ] App loads without console errors
- [ ] Student profile saved with name
- [ ] Company profile saved with name
- [ ] At least one OJT week with valid inclusive dates
- [ ] Weekly Preview still renders
- [ ] Copy Weekly Journal still works
- [ ] Export Official DOCX works

### Day-count scenarios

- [ ] Export **5-day** week → DOCX has Day 1–Day 5 only; warning shown
- [ ] Export **6-day** week → DOCX has Day 1–Day 6; no day-count warning
- [ ] Export **7-day** week → DOCX has Day 1–Day 7; warning shown
- [ ] DOCX day labels include dates, formatted like `Day 1 July 7, 2026`
- [ ] Canceling a warning stops export

### Day content scenarios

- [ ] Worked day with tasks → bullet-style accomplishments in day cell, formatted as `• description (optional duration) - status`
- [ ] Worked day with no tasks → "No task items recorded for this day."
- [ ] Absent day → "Absent" (+ remarks if set)
- [ ] Rest day → "No OJT / Rest Day" (+ remarks if set)
- [ ] Date in range with no log → "No daily log recorded."

### Calculations and summaries

- [ ] Weekly total matches Dashboard / Weekly Preview total
- [ ] Absent and rest days do not add to weekly total
- [ ] Task `timeSpentMinutes` does not change weekly total
- [ ] Skills Learned, Problems Encountered, Reflection text appears correctly
- [ ] Empty summary fields handled consistently

### Exclusions and safety

- [ ] Photo Documentation appendix appears after official journal content when photos exist
- [ ] Photos are grouped by Day N and actual date
- [ ] Saved captions appear when available
- [ ] Photos are not placed inside Daily Accomplishments table cells
- [ ] Image aspect ratio is preserved
- [ ] Signature lines remain blank
- [ ] No time in / time out columns in official output
- [ ] Task status appears in each worked-day task line in the official output
- [ ] Export works offline (after initial page load)
- [ ] No network calls except loading local template asset
- [ ] Private official template is ignored and not committed
- [ ] Sanitized fallback template still works if private template is unavailable

### Edge cases

- [ ] Missing student or company name → warning shown; export still works if user confirms
- [ ] Very long accomplishment text → readable in Word (no corruption)
- [ ] Filename is sensible and unique per week
- [ ] Cancel on non-6-day warning → no download

---

## Stop Condition

Official DOCX Export is ready for v1.1 when:

1. A student can select a week in Weekly Preview and download a filled BPC weekly journal DOCX.
2. Day rows follow the week's inclusive date range (5, 6, or 7 days) without forced padding or truncation.
3. Non-6-day weeks show the documented warning before export.
4. Data mapping follows all [time calculation rules](#time-calculation-rules-must-not-change) and [export content rules](#export-content-rules).
5. Photo documentation is appended after the official journal content; signatures, backend calls, and online submission are absent.
6. Manual testing checklist passes on the target browser (Chrome/Edge minimum; note LibreOffice differences if tested).

---

## Explicit Out-of-Scope Items

Do not implement these as part of Official DOCX Export:

- Login, accounts, or authentication
- Backend API or PHP/MySQL server
- Cloud sync or multi-device auto sync
- Google Drive, OneDrive, or any upload integration
- Email sending or sharing
- Online journal submission to school systems
- Supervisor approval or validation workflows
- Auto-signatures or digital signature fields
- PDF export
- Placing photos inside Daily Accomplishments table cells
- GPS / QR attendance
- Admin, coordinator, or supervisor dashboards
- Multi-user or school-wide deployment features
- npm bundler or build-tool migration (unless separately approved)
- Changing IndexedDB schema or JSON backup format
- Replacing JSON backup/export
- Grading, payroll, or evaluation features
- Overnight shift time handling
- Merge/conflict handling for exported files

---

## Related Documentation

| Document | Use for |
| --- | --- |
| `docs/FEATURES.md` | v1.0 feature status and post-v1.0 DOCX export candidate status |
| `docs/DATA_STRUCTURE.md` | Field names, relationships, calculation rules |
| `docs/WORKFLOWS.md` | Weekly preview and manual transfer workflow |
| `docs/POLISH_ROADMAP.md` | Official template structure reference |
| `docs/PROJECT_HANDOFF.md` | Current app architecture and file map |
| `app/assets/js/journal-preview.js` | Existing preview and copy-text mapping to align with |

---

*Implementation/status document. Re-run the manual checklist before merging `feature/docx-export` into `master`.*
