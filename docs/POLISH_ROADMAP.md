# Polish Roadmap Status Note

This file is a secondary polish roadmap for OJT Journal Companion after the core v1.0 app became functional.

It does not override:
- PROJECT_BRIEF.md
- FEATURES.md
- DATA_STRUCTURE.md
- WORKFLOWS.md
- BUILD_PLAN.md

Current accepted status:
- Batch 1 Backup Safety Polish: completed and committed.
- Batch 2 Weekly Preview Official-Format Polish: completed and committed.
  - Adjustment: official task bullets use `description (duration/time) - status`.
- Batch 3A Dashboard Current Week Progress: completed and committed.
- Batch 4 Daily Logs Modal/Panel UI Polish: completed and committed.
- Batch 4.1 App Shell and Dashboard UI Polish: completed and committed.
- Batch 5 Code Hygiene / Refactor: deferred.

Use this roadmap only as a reference for remaining polish work. Do not apply all batches at once.

# OJT Journal Companion — Phased Implementation Outline

---

## Official Template Reference

The attached official template follows this structure:

```
┌──────────────────────────────────────────────┐
│     On-the Job Training Weekly Journal       │
├────────────────────┬─────────────────────────┤
│ Student Name       │ (value)                 │
│ Company            │ (value)                 │
│ Week Number        │ (i.e. #1)              │
│ Inclusive Dates     │ (i.e. June 22-June 29) │
├────────────────────┴─────────────────────────┤
│            Daily Accomplishments             │
├──────────┬───────────────────────────────────┤
│ Day 1    │ (accomplishment bullets)          │
├──────────┼───────────────────────────────────┤
│ Day 2    │ (accomplishment bullets)          │
├──────────┼───────────────────────────────────┤
│  ...     │  ...                              │
├──────────┼───────────────────────────────────┤
│ Day 6    │ (accomplishment bullets)          │
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
└──────────────────────────────────────────────┘
```

Key observations from the official template:
- **4-row info header** at top: Student Name, Company, Week Number, Inclusive Dates
- **"Daily Accomplishments"** section title spans full width
- **Two-column daily table**: narrow left column (Day 1, Day 2...) and wide right column (accomplishment content)
- **6 day rows** (template assumes a 6-day work week, but the app should support whatever the week's date range contains)
- **"Total weekly Hours Rendered"** row at the bottom of the daily table
- **Three full-width summary sections** below the table: Skills Learned, Problems Encountered, Reflection (Points of Learning)
- No time-in/time-out columns visible in the official table — those are internal OJT records, not part of the copied journal output
- No photo documentation section in the official template

---

## Batch 1: Backup Safety Polish

### Goal

Make backup export safer and more transparent, especially for photo-heavy data. Add a backup reminder so users don't forget to protect their local data.

### Files Likely Affected

- [backup.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/backup.js)
- [ui.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/ui.js)
- [storage.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/storage.js)
- [index.html](file:///c:/xampp-projects/ojt-journal-companion/app/index.html)
- [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css)

### Exact Changes

#### 1.1. Pre-export size estimate and warning

In [backup.js `exportBackup()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/backup.js#L183-L196):

- Before calling `buildBackupData()`, fetch photo attachments separately first using `OJTStorage.getPhotoAttachments()`.
- Sum all `photo.fileSize` values to get estimated raw photo bytes.
- Calculate estimated Base64 size: `rawBytes * 1.37` (Base64 overhead ≈ 33% + JSON structure).
- If estimated total exceeds 10 MB, show a `window.confirm()`:
  *"This backup includes N photos (~XX MB estimated). Large backups may take a moment. Continue?"*
- If the user cancels, stop the export and show an informational message.
- If no photos or under 10 MB, proceed without the confirm dialog.

#### 1.2. Remove pretty-print indentation from backup JSON

In [backup.js L190](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/backup.js#L190):

- Change `JSON.stringify(backupData, null, 2)` → `JSON.stringify(backupData)`.
- This reduces file size by ~20–30% on large backups with no functional impact.

#### 1.3. Safety backup recommendation before restore

In [backup.js `restoreBackup()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/backup.js#L218-L257):

- Change the existing confirm dialog text from:
  *"Restore this backup? This will replace all current local OJT Journal Companion data in this browser."*
- To:
  *"Restore this backup? This will replace ALL current local data.\n\nWe recommend exporting a backup of your current data first.\n\nContinue with restore?"*

#### 1.4. Track last backup date in AppSettings

In [storage.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/storage.js):

- No schema change needed — `appSettings` is a freeform key-value store with `keyPath: "id"`.
- After a successful export in [backup.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/backup.js), call:
  ```js
  const settings = await OJTStorage.getAppSettings();
  await OJTStorage.saveAppSettings({
    ...settings,
    lastBackupDate: new Date().toISOString()
  });
  ```

#### 1.5. Dashboard backup reminder

In [ui.js `updateDashboardSummary()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/ui.js#L83-L111):

- Accept the `appSettings` parameter (already passed in).
- Read `appSettings.lastBackupDate`.
- If `lastBackupDate` is missing or older than 7 days, show a reminder message in a new element on the dashboard.

In [index.html](file:///c:/xampp-projects/ojt-journal-companion/app/index.html) dashboard section:

- Add a new `<p>` element with `id="dashboard-backup-reminder"` after the summary cards, initially hidden.
- Style it as a soft warning (yellow/amber background, similar to `.preview-warnings`).
- Text: *"You haven't exported a backup in over 7 days. Your data is stored only in this browser."*
- Add a "Go to Backup" link/button that navigates to the backup section.

### Risks

- **Low risk.** All changes are additive. No data structure changes. No IndexedDB version bump needed.
- The `lastBackupDate` field is a new optional property on AppSettings but is not required by any existing code. Old records without it simply show the reminder.

### Manual Testing Checklist

- [ ] Export backup with no photos — no size warning appears, file downloads.
- [ ] Add several photos (total > 10 MB estimated), export — size warning dialog appears with correct estimated size.
- [ ] Cancel the size warning — export is stopped, informational message shown.
- [ ] Confirm the size warning — export proceeds, file downloads.
- [ ] Exported JSON file is compact (no indentation/pretty-print).
- [ ] Restore a backup — confirm dialog mentions "We recommend exporting a backup first."
- [ ] After successful export, `lastBackupDate` is stored in appSettings.
- [ ] Dashboard shows backup reminder if `lastBackupDate` is missing.
- [ ] Dashboard shows backup reminder if `lastBackupDate` is older than 7 days.
- [ ] Dashboard hides backup reminder if `lastBackupDate` is within 7 days.
- [ ] "Go to Backup" link navigates to the Backup section.
- [ ] Existing app functionality (profiles, weeks, daily logs) is unaffected.

### Stop Condition

Move to Batch 2 when backup export shows a size warning for large photo-heavy backups, the restore dialog recommends a safety backup, the last backup date is tracked, and the dashboard shows a backup reminder when overdue.

---

## Batch 2: Weekly Preview Official-Format Polish

### Goal

Make the Weekly Preview output match the official "On-the Job Training Weekly Journal" template as closely as practical. The copy-ready text should transfer cleanly into the official school template.

### Files Likely Affected

- [journal-preview.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js)
- [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css)

### Exact Changes

#### 2.1. Update the preview info grid to match the official 4-row header

Current preview info grid shows: Student Name, Company, Week Number, Inclusive Dates in a 2×2 grid.

Change [journal-preview.js `renderPreview()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js#L297-L363):

- Restructure `.preview-info-grid` to a **single-column, 4-row layout** matching the official template:
  ```
  Student Name     | Juan Dela Cruz
  Company          | ABC Corp
  Week Number      | 1
  Inclusive Dates   | June 22 – June 29, 2025
  ```
- Each row: left cell = bold label, right cell = value.
- Use `grid-template-columns: minmax(140px, auto) 1fr` instead of `repeat(2, minmax(0, 1fr))`.
- Add course/program and school as additional rows below Student Name (these appear on many official templates as context, and the data already exists in `studentProfile`).

Updated row order:
1. Student Name
2. Course / Program
3. School / Institution
4. Company
5. Week Number
6. Inclusive Dates

#### 2.2. Add a "Daily Accomplishments" section title

In the rendered preview, add a full-width heading **"Daily Accomplishments"** before the daily table, matching the official template's section title.

#### 2.3. Simplify the Day/Date left column to match the official format

The official template's left column only shows **"Day 1"**, **"Day 2"**, etc. — no date, no time, no status.

Change [journal-preview.js `renderDailyRows()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js#L177-L216):

- Left cell (`.preview-day-cell`) content: Only **"Day N"** as a bold label.
- Move the date, day status, rendered time, and remarks into the **right cell** (`.preview-work-cell`) as secondary info above the task bullets:
  ```
  Date: Jun 30, 2025
  Status: Worked | Time: 8:00 AM – 5:00 PM | Rendered: 8h 0m
  
  • Task description 1 — Completed
  • Task description 2 — In Progress
  
  Remarks: (if any)
  ```
- For `Absent` or `No OJT / Rest Day` status, show:
  ```
  Date: Jul 1, 2025
  Status: Absent
  Remarks: (if any, or "No remarks")
  ```
- Remove photo documentation count from the preview output. The official template has no photo field. Photo info is tracked in the app but should not appear in the copy-ready journal.

#### 2.4. Update the "Total weekly Hours Rendered" row

Current row shows the label and value. Keep this but:

- Rename the label to match the official template exactly: **"Total weekly Hours Rendered"** (note the lowercase "weekly" matching the template image).
- Keep the value as the calculated `Xh Ym` format.

#### 2.5. Rename summary section titles to match the official template

Current titles: "Skills Learned", "Problems Encountered", "Reflection / Points of Learning".

Official template titles: "Skills Learned", "Problems Encountered", "Reflection (Points of Learning)".

Change in [journal-preview.js `renderPreview()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js#L357-L360):

- Change `"Reflection / Points of Learning"` → `"Reflection (Points of Learning)"` to match the official template exactly.

#### 2.6. Add a missing-content banner

At the top of the preview (after profile warnings), add a yellow banner if any of the three required summary fields (Skills Learned, Problems Encountered, Reflection) are empty:

- *"1 of 3 weekly summary fields is not filled in yet. Fill in all fields before copying final journal content."*

This helps the user spot incomplete weeks before copying.

#### 2.7. Update `buildPlainText()` for cleaner copy output

Change [journal-preview.js `buildPlainText()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js#L231-L295):

Updated format:
```
On-the Job Training Weekly Journal

Student Name: Juan Dela Cruz
Course / Program: BSIT
School / Institution: XYZ University
Company: ABC Corp
Week Number: 1
Inclusive Dates: 2025-06-22 to 2025-06-29

--- Daily Accomplishments ---

Day 1 — 2025-06-22
Status: Worked | Time: 08:00–17:00 | Rendered: 8h 0m
- Installed development tools — Completed
- Attended orientation — Completed

Day 2 — 2025-06-23
Status: Absent
Remarks: Sick leave

...

Total weekly Hours Rendered: 32h 0m

--- Skills Learned ---
(content or "Not filled in yet.")

--- Problems Encountered ---
(content or "Not filled in yet.")

--- Reflection (Points of Learning) ---
(content or "Not filled in yet.")
```

Key changes from current format:
- Add "On-the Job Training Weekly Journal" title at top.
- Add course/program and school/institution lines.
- Add `---` separator lines between major sections.
- Per-day: include date, status, time range, rendered hours on info lines; task bullets as `- description — status`.
- Remove photo documentation count from copy text.
- Use `"Reflection (Points of Learning)"` not `"Reflection / Points of Learning"`.
- Keep time format as `HH:mm` since the app stores 24-hour internally.

#### 2.8. CSS adjustments for the preview

In [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css):

- Update `.preview-info-grid` to use `grid-template-columns: minmax(140px, auto) 1fr` and stack all rows vertically (one label-value pair per row).
- Remove the `nth-child(odd)` right border rule since it's no longer a 2-column grid.
- On mobile (≤760 px), keep the same single-column layout — it naturally works.
- Narrow the `.preview-day-cell` column since it now only holds "Day N" — change grid template from `minmax(120px, 0.35fr)` to `minmax(70px, 0.18fr)`.

### Risks

- **Low risk.** Only affects `journal-preview.js` rendering and CSS. No data structure changes.
- The copy-text format change could surprise a user who has already gotten used to the current format. But since the goal is to match the official template, this is intentional.
- Removing photo documentation from the preview output means users who relied on seeing photo counts in the copy text will no longer see them. This is correct — the official template has no photo field.

### Manual Testing Checklist

- [ ] Preview info grid shows 6 rows: Student Name, Course/Program, School, Company, Week Number, Inclusive Dates.
- [ ] "Daily Accomplishments" heading appears above the daily table.
- [ ] Left column of daily table shows only "Day 1", "Day 2", etc.
- [ ] Right column shows date, status, time/rendered hours, then task bullets below.
- [ ] Absent/rest days show status and optional remarks but no time fields.
- [ ] Days with no daily log show "No daily log recorded."
- [ ] Photo documentation count does NOT appear in the preview.
- [ ] "Total weekly Hours Rendered" row appears at the bottom with correct calculation.
- [ ] Summary sections are titled "Skills Learned", "Problems Encountered", "Reflection (Points of Learning)".
- [ ] Missing-content banner appears when any summary field is empty.
- [ ] Missing-content banner disappears when all 3 summary fields are filled.
- [ ] Copy button copies updated plain-text format to clipboard.
- [ ] Plain text starts with "On-the Job Training Weekly Journal" title.
- [ ] Plain text includes course/program and school.
- [ ] Plain text uses `---` separator lines between sections.
- [ ] Plain text per-day includes date, status, time, rendered hours, and task bullets.
- [ ] Plain text does NOT include photo documentation count.
- [ ] Preview layout looks correct on desktop (wide screen).
- [ ] Preview layout looks correct on mobile (narrow screen).
- [ ] Existing weeks/daily logs data still renders without errors after the changes.

### Stop Condition

Move to Batch 3 when the Weekly Preview HTML output and the copy-ready plain text both match the official template structure, with the info header, daily accomplishments table, total hours row, and three summary sections all aligned to the official format.

---

## Batch 3: Dashboard and Small UX Polish

### Goal

Replace dashboard placeholders with real data, add day-completeness indicators, use human-friendly date formatting, and add scroll-into-view behavior.

### Files Likely Affected

- [ui.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/ui.js)
- [index.html](file:///c:/xampp-projects/ojt-journal-companion/app/index.html)
- [weeks.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/weeks.js)
- [daily-logs.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js)
- [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css)

### Exact Changes

#### 3.1. Replace the "Recent logs" placeholder with a real list

In [index.html L125-L129](file:///c:/xampp-projects/ojt-journal-companion/app/index.html#L125-L129):

- Replace the static "Planned → Recent logs" placeholder card with a dynamic container:
  ```html
  <article class="placeholder-card">
    <span class="card-label">Recent activity</span>
    <h3>Recent logs</h3>
    <div id="summary-recent-logs">
      <p>Save daily logs to see recent activity here.</p>
    </div>
  </article>
  ```

In [ui.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/ui.js):

- In `updateDailyLogsSummary()`, after updating the log count, also populate `#summary-recent-logs`:
  - Sort `dailyLogs` by `updatedAt` descending.
  - Take the 5 most recent.
  - For each, render a compact line: `"Jun 30, 2025 — Worked — 8h 0m"` or `"Jul 1, 2025 — Absent"`.
  - If no logs, show the empty-state text.

#### 3.2. Show human-friendly dates in the week list and week selectors

In [weeks.js `renderWeeksList()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/weeks.js#L282-L322):

- Change line 306 from:
  `${week.inclusiveStartDate} to ${week.inclusiveEndDate}`
- To:
  `${formatDisplayDate(week.inclusiveStartDate)} to ${formatDisplayDate(week.inclusiveEndDate)}`
  (e.g., "Jun 30, 2025 to Jul 4, 2025")
- `formatDisplayDate()` already exists in the file.

In [daily-logs.js `setSelectOptions()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L194-L207):

- Change the option text from:
  `Week ${week.weekNumber} (${week.inclusiveStartDate} to ${week.inclusiveEndDate})`
- To:
  `Week ${week.weekNumber} (${formatDisplayDate(week.inclusiveStartDate)} to ${formatDisplayDate(week.inclusiveEndDate)})`

In [journal-preview.js `setWeekOptions()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js#L365-L395):

- Same change for the preview week selector.

#### 3.3. Add scroll-into-view when a day accordion expands

In [daily-logs.js `renderJournalWeek()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L533-L586):

- After the while loop builds all accordions, if `state.expandedDate` is set, find the expanded accordion element and call:
  ```js
  accordion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  ```
- Use a short `requestAnimationFrame` or `setTimeout(…, 50)` to ensure the DOM has settled before scrolling.

#### 3.4. Remove the dead ternary on the "Save day record" button

In [daily-logs.js L475](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L475):

- Change `${dailyLog ? "Save day record" : "Save day record"}` to just `Save day record`.

#### 3.5. Add day-completeness indicator to accordion headers

In [daily-logs.js `getDayStatusText()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L128-L152):

- After building the status string, append a completeness hint:
  - If `dayStatus` is `Worked` and (`timeIn` is empty OR `timeOut` is empty OR `taskCount === 0`): append `" · Incomplete"`.
  - Otherwise if `dayStatus` is `Worked` and has time + at least 1 task: append `" · Complete"`.
  - For `Absent` and `No OJT / Rest Day`: no completeness label (these are inherently complete as-is).

In [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css):

- No new CSS class needed — the text is part of the existing `.day-accordion-status` span.
- Optionally use a subtle color difference (green for complete, amber for incomplete) via an inline style or a CSS class toggle on the accordion status span.

#### 3.6. Abbreviate accordion status text on mobile

In [daily-logs.js `getDayStatusText()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L128-L152):

- This function doesn't know about viewport width, so the abbreviation should happen via CSS, not JS.
- In the accordion header, split the status into two elements:
  - `.day-accordion-status-full` (shown on desktop, hidden on mobile)
  - `.day-accordion-status-short` (hidden on desktop, shown on mobile)
- The short version: `"Worked · 8h · 3 tasks"` (drop "items", drop photo count, drop " 0m" when 0).
- Alternatively, keep one element but use CSS `text-overflow: ellipsis` with a `max-width` on mobile. This is simpler but less precise.

**Simpler approach chosen:** Keep the existing single `.day-accordion-status` element. On mobile, apply `max-width: 50vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` so long text truncates with "…". This avoids duplicating the status text.

### Risks

- **Low risk.** Dashboard changes are additive. Date formatting uses an existing function. Scroll-into-view is a visual enhancement.
- The day-completeness indicator adds visual noise; keeping it subtle (small text, not a loud badge) avoids overwhelming the accordion header.
- The CSS `text-overflow: ellipsis` approach for mobile truncation means users can't read the full status without expanding the accordion. This is acceptable since expanding reveals all details.

### Manual Testing Checklist

- [ ] Dashboard "Recent logs" card shows the 5 most recent daily logs with human-friendly dates.
- [ ] Dashboard "Recent logs" card shows empty-state text when no logs exist.
- [ ] Week list shows human-friendly dates (e.g., "Jun 30, 2025") instead of raw "2025-06-30".
- [ ] Week selector dropdowns in Daily Logs and Weekly Preview show human-friendly dates.
- [ ] Expanding a day accordion smoothly scrolls it into view.
- [ ] Collapsing a day accordion does not trigger a scroll.
- [ ] "Save day record" button no longer has a dead ternary (visual: no change, code cleanup only).
- [ ] Accordion header shows "· Incomplete" for worked days missing time or tasks.
- [ ] Accordion header shows "· Complete" for worked days with time and at least 1 task.
- [ ] Accordion header shows no completeness label for absent/rest days.
- [ ] On mobile, long accordion status text truncates with "…" instead of wrapping to multiple lines.
- [ ] On desktop, full accordion status text is visible.
- [ ] Existing daily log CRUD still works after all changes.

### Stop Condition

Move to Batch 4 when the dashboard shows real recent-log data, week dates are human-friendly everywhere, day accordions scroll into view on expand, accordion headers show completeness hints, and mobile status text is truncated cleanly.

---

## Batch 4: Daily Logs UI Polish

### Goal

Make the expanded day accordion feel more like the official journal format: **left: day/date/time/status** as a compact read summary, **right: task/work bullet items** as the primary content area. Keep the interactive edit capability but push form controls below the read view.

### Files Likely Affected

- [daily-logs.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js)
- [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css)
- [index.html](file:///c:/xampp-projects/ojt-journal-companion/app/index.html) (no structural changes, but JS-rendered HTML changes)

### Exact Changes

#### 4.1. Add a compact read-only day summary at the top of the expanded accordion

In [daily-logs.js `renderDayEditorBody()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L425-L531):

- Before the existing `.journal-row` form grid, add a **read-only summary row** (only when a daily log already exists):

  ```html
  <div class="journal-summary-row">
    <div class="journal-summary-day">
      <strong>Day 1</strong>
      <span>Jun 30, 2025</span>
      <span class="status-pill">Worked</span>
      <span>8:00 AM – 5:00 PM</span>
      <strong class="rendered-badge">8h 0m</strong>
    </div>
    <div class="journal-summary-tasks">
      <ul>
        <li>• Installed dev tools — Completed</li>
        <li>• Attended orientation — Completed</li>
      </ul>
      <p class="empty-state">No task items yet.</p>
    </div>
  </div>
  ```

- This summary row is **journal-like** — it looks like the official template's Day row with left day/date/time and right accomplishment bullets.
- Below this summary row, keep the existing editable form grid (`.journal-row` with `.journal-col-time` and `.journal-col-tasks`) as the "edit area."
- If no daily log exists yet (creating a new day), skip the summary row and show only the edit form.

#### 4.2. Style the read-only summary row

In [styles.css](file:///c:/xampp-projects/ojt-journal-companion/app/assets/css/styles.css):

- `.journal-summary-row`: two-column grid matching the official template proportions. Left column ~25%, right column ~75%. Light background (`#fbfcfa`), 1 px border, 8 px border-radius.
- `.journal-summary-day`: stack day label, date, status pill, time range, and rendered hours vertically. Compact spacing.
- `.journal-summary-tasks`: bullet list with the same style as `.preview-task-list`. Read-only, no edit/delete buttons.
- Add a thin visual separator between the summary row and the edit form below.
- On mobile (≤760 px): the summary row should also go single-column (day info on top, task bullets below), but keep it compact — no form controls here.

#### 4.3. Add day status color to the status pill in the summary

- `Worked` → green pill (existing `.status-pill` style).
- `Absent` → red/coral pill: new `.status-pill.status-absent` class with `border-color: #e6cbc8; background: #fff4f2; color: #a43d35;`.
- `No OJT / Rest Day` → gray pill: new `.status-pill.status-rest` class with `border-color: var(--line); background: #f2f4f2; color: var(--muted);`.

Apply these in the summary row and also in the accordion header if practical.

#### 4.4. Visually separate the "edit area" from the summary

Add a subtle section divider between the summary row and the edit form:

```css
.journal-edit-separator {
  margin: 16px 0;
  border: 0;
  border-top: 1px dashed var(--line);
}
```

And a small heading above the edit form: *"Edit day record"* or *"Day record details"*.

#### 4.5. Collapse the photo caption form by default

In [daily-logs.js `renderPhotoList()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L335-L369):

- Wrap each `.photo-caption-form` in a `<details>` element (native HTML disclosure):
  ```html
  <details class="photo-caption-details">
    <summary class="secondary-button">Edit caption</summary>
    <form class="photo-caption-form" ...>...</form>
  </details>
  ```
- Move the Download and Delete buttons outside the `<details>`, keeping them always visible.
- This reduces visual clutter from 3 buttons + textarea per photo to just 2 buttons per photo (Download, Delete) with caption editing hidden until clicked.

#### 4.6. Use a compact task bullet display in the main task list

In [daily-logs.js `renderTaskBullets()`](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js#L252-L277):

- Reduce the visual weight of each task bullet. Currently each task is a bordered card with Edit/Delete buttons always visible.
- Change to: show task as a compact line with a "•" bullet, description, status pill, and optional time/notes inline.
- Show Edit and Delete buttons only on hover (desktop) or via a toggle (mobile):
  - Desktop: `.task-bullet-actions { opacity: 0; } .task-bullet-item:hover .task-bullet-actions { opacity: 1; }`.
  - Mobile: keep buttons visible since there's no hover. Use the existing mobile CSS block to maintain `opacity: 1`.

### Risks

- **Medium risk.** This batch changes the visual structure of the most complex section. Careful testing needed.
- The read-only summary + editable form pattern adds more rendered HTML per expanded day. Performance should be fine for a single expanded day at a time.
- Collapsing photo captions into `<details>` changes the submit event flow — the form is still inside the delegated container, so existing event delegation should still work. Test carefully.
- Hiding task action buttons on hover means keyboard-only users must be able to tab to them. Ensure the buttons are still focusable (no `display: none`; use `opacity` only).

### Manual Testing Checklist

- [ ] Expanding a day with a saved log shows the journal-style summary row at the top.
- [ ] Summary row left column shows: Day N, date, status pill (colored), time range, rendered hours.
- [ ] Summary row right column shows: task bullets as a read-only list.
- [ ] Summary row right column shows "No task items yet" if no tasks.
- [ ] Below the summary row, the edit form is visible with a separator.
- [ ] Expanding a day with NO saved log shows only the edit form (no summary row).
- [ ] Day status pills use correct colors: green (Worked), red (Absent), gray (Rest Day).
- [ ] Photo caption forms are collapsed by default behind "Edit caption" toggle.
- [ ] Clicking "Edit caption" expands the caption form.
- [ ] Download and Delete buttons are always visible for each photo.
- [ ] Saving a caption from within the `<details>` element works correctly.
- [ ] Task bullet Edit/Delete buttons are hidden by default on desktop, visible on hover.
- [ ] Task bullet Edit/Delete buttons are visible on mobile (no hover).
- [ ] Task bullet buttons are focusable via keyboard tab on desktop.
- [ ] Overall layout matches the official journal mental model: left = day/date/time, right = tasks.
- [ ] Mobile layout stacks correctly without breaking.
- [ ] All CRUD operations (save day, save task, attach photo, delete) still work.

### Stop Condition

Move to Batch 5 when expanded day accordions show a journal-style read summary above the edit form, day status uses colored pills, photo captions are collapsed by default, and task bullets are visually compact with action buttons hidden until needed.

---

## Batch 5: Code Hygiene / Refactor

### Goal

Consolidate duplicated utility functions, add dependency-order documentation, and cache the IndexedDB connection. No visual changes — pure code quality improvement.

### Files Likely Affected

- **New file:** [utils.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/utils.js)
- [db.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/db.js)
- [weeks.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/weeks.js)
- [daily-logs.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js)
- [journal-preview.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js)
- [photos.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/photos.js)
- [profile.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/profile.js)
- [index.html](file:///c:/xampp-projects/ojt-journal-companion/app/index.html) (add `utils.js` script tag)

### Exact Changes

#### 5.1. Create `utils.js` with shared utility functions

Create [app/assets/js/utils.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/utils.js):

```js
(function () {
  function escapeHtml(value) { /* single canonical copy */ }
  function parseDate(dateText) { /* single canonical copy */ }
  function formatDate(date) { /* single canonical copy */ }
  function formatDisplayDate(dateText) { /* single canonical copy */ }
  function createId(prefix) { /* single canonical copy */ }
  function nowIso() { /* single canonical copy */ }
  function sortWeeks(weeks) { /* single canonical copy */ }
  function sortDailyLogs(logs) { /* single canonical copy */ }
  function sortTasks(tasks) { /* single canonical copy */ }

  window.OJTUtils = {
    escapeHtml,
    parseDate,
    formatDate,
    formatDisplayDate,
    createId,
    nowIso,
    sortWeeks,
    sortDailyLogs,
    sortTasks
  };
})();
```

#### 5.2. Update all consumer files to use `window.OJTUtils`

In each file, replace local function definitions with calls to `OJTUtils`:

| File | Functions to replace |
|---|---|
| [weeks.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/weeks.js) | `escapeHtml`, `parseDate`, `formatDate`, `formatDisplayDate`, `createId`, `nowIso`, `sortWeeks` |
| [daily-logs.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/daily-logs.js) | `escapeHtml`, `parseDate`, `formatDate`, `formatDisplayDate`, `createId`, `nowIso`, `sortWeeks`, `sortDailyLogs`, `sortTasks` |
| [journal-preview.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/journal-preview.js) | `escapeHtml`, `parseDate`, `formatDate`, `sortWeeks`, `sortDailyLogs`, `sortTasks` |
| [photos.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/photos.js) | `createId` |
| [profile.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/profile.js) | `nowIso` |

Each replacement pattern:
- Delete the local function definition.
- At the top of the IIFE, add a short alias: `const escapeHtml = window.OJTUtils.escapeHtml;` (or use destructuring).
- This keeps each file readable — short local aliases rather than long `window.OJTUtils.escapeHtml()` calls throughout.

#### 5.3. Add `utils.js` to the HTML script load order

In [index.html](file:///c:/xampp-projects/ojt-journal-companion/app/index.html):

- Add `<script src="assets/js/utils.js"></script>` **before** `db.js` (it has no dependencies and everything else may depend on it):

  ```html
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/db.js"></script>
  <script src="assets/js/storage.js"></script>
  ...
  ```

#### 5.4. Add dependency comments to each JS file

At the top of each file's IIFE, add a comment block:

```js
/**
 * weeks.js — OJT Week management
 * Dependencies: OJTUtils, OJTDB, OJTStorage, OJTCalculations, OJTUI, OJTApp
 */
```

This serves as human-readable documentation without adding runtime checks.

#### 5.5. Cache the IndexedDB connection in `db.js`

In [db.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/db.js):

- Add a module-level variable: `let cachedDb = null;`.
- In `openDatabase()`:
  - If `cachedDb` is not null and not closed, return it immediately.
  - Otherwise, open a new connection and cache it.
- Remove all `db.close()` calls from [storage.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/storage.js) transaction handlers.
- Add an `onversionchange` handler on the cached db:
  ```js
  db.onversionchange = () => {
    db.close();
    cachedDb = null;
  };
  ```
  This handles the case where another tab opens the same app with a newer DB version.

#### 5.6. Remove `db.close()` calls from storage.js

In [storage.js](file:///c:/xampp-projects/ojt-journal-companion/app/assets/js/storage.js):

- Remove all `db.close()` calls from `transaction.oncomplete` handlers (lines 30–31, 53–54, 81–82, 100–101, 120–121, 177–178, 225–226).
- The connection stays open and is reused. This reduces IndexedDB round-trips from ~42 per section switch to ~1 (first load).

### Risks

- **Medium risk.** Touching every JS file increases the chance of typos or missed replacements. Careful file-by-file testing needed.
- Caching the IndexedDB connection is a standard pattern but must handle the `onversionchange` event to avoid blocking other tabs.
- Removing `db.close()` means the connection stays open for the lifetime of the page. This is normal and expected for IndexedDB apps. The browser handles cleanup on page unload.
- If `utils.js` fails to load (script tag missing or typo), all other files will break. The dependency comment helps debug this.

### Manual Testing Checklist

- [ ] App loads without console errors.
- [ ] All navigation sections are reachable.
- [ ] Student profile saves and loads correctly.
- [ ] Company profile saves and loads correctly.
- [ ] App settings save and load correctly.
- [ ] Weeks can be created, edited, and deleted.
- [ ] Daily logs can be created, edited, and deleted.
- [ ] Task items can be created, edited, and deleted.
- [ ] Photo attachments can be attached and deleted.
- [ ] Time calculations are correct.
- [ ] Weekly preview generates and copies correctly.
- [ ] Backup export works.
- [ ] Backup restore works (including page reload).
- [ ] No duplicate function definitions remain in weeks.js, daily-logs.js, journal-preview.js, photos.js, or profile.js.
- [ ] `window.OJTUtils` is available in the browser console.
- [ ] Opening the app in two tabs does not cause IndexedDB blocked errors.
- [ ] Closing and reopening the app still loads all data correctly.
- [ ] Dashboard summary updates correctly after profile/week/log changes.
- [ ] Mobile drawer navigation still works.

### Stop Condition

Batch 5 is complete when all duplicated utility functions are consolidated into `utils.js`, every JS file has a dependency comment, the IndexedDB connection is cached, and all existing functionality passes manual testing without regressions.

---

## Summary Table

| Batch | Goal | Risk | Key Impact |
|---|---|---|---|
| 1. Backup Safety | Size warning, safety backup reminder, dashboard reminder | Low | Prevents data loss |
| 2. Weekly Preview | Match official template format | Low | Core deliverable quality |
| 3. Dashboard & UX | Real data, friendly dates, scroll, completeness hints | Low | Daily usability |
| 4. Daily Logs UI | Journal-style summary, colored pills, compact tasks/photos | Medium | Visual alignment with official format |
| 5. Code Hygiene | Shared utils, DB caching, dependency docs | Medium | Maintainability |

Each batch leaves the app in a working state. No batch depends on a later batch, but they build naturally on each other.
