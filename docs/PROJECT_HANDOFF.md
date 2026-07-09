# OJT Journal Companion — Project Handoff

Use this document to continue development in a fresh chat or onboard a developer later. For deeper detail, see the linked docs in `docs/`.

**Handoff date context:** v1.0 core features are released. Official DOCX Export is implemented on `feature/docx-export` as a post-v1.0 / v1.1 candidate and is in final regression/polish.

---

## 1. Project Summary

**OJT Journal Companion** is a personal offline-first browser app for one student/intern. It helps record daily OJT work, calculate rendered hours, attach photo documentation, and prepare weekly journal content for **manual copy** or **Official DOCX Export** into an official school template workflow.

It is a lightweight companion tool — not a school system, not a supervisor portal, and not a replacement for official forms or signatures.

**Target user:** One student on one device/browser, managing their own OJT journal locally.

---

## 2. Tech Stack

| Layer | Choice |
| --- | --- |
| Markup | HTML (`app/index.html`) |
| Styling | CSS (`app/assets/css/styles.css`) — single stylesheet, muted mid-tone theme |
| Logic | Vanilla JavaScript (IIFE modules, no bundler) |
| Storage | IndexedDB via `app/assets/js/db.js` and `app/assets/js/storage.js` |
| Server | No backend; local/static HTTP serving is recommended for DOCX template fetches |
| Frameworks | None |
| Build tools | None |

**Script load order** (in `app/index.html`):

1. `db.js`
2. `storage.js`
3. `calculations.js`
4. `photos.js`
5. `ui.js`
6. `app.js`
7. `profile.js`
8. `weeks.js`
9. `daily-logs.js`
10. `vendor/pizzip.min.js`
11. `vendor/docxtemplater.min.js`
12. `journal-payload.js`
13. `docx-export.js`
14. `journal-preview.js`
15. `backup.js`

**Global namespaces:** `window.OJTDB`, `window.OJTStorage`, `window.OJTCalculations`, `window.OJTPhotos`, `window.OJTUI`, `window.OJTApp`, `window.OJTJournalPayload`, `window.OJTDocxExport`.

---

## 3. Scope Boundaries

### In scope (v1.0)

- One local student user
- Local browser use with IndexedDB storage; no backend required
- Profile, weeks, daily logs, weekly preview, dashboard, backup/restore/reset
- Official DOCX Export on `feature/docx-export` as a post-v1.0 / v1.1 candidate

### Out of scope (do not add without explicit decision)

- Login / accounts
- Backend, PHP, MySQL
- Cloud sync
- GPS / QR attendance
- Supervisor / admin / coordinator dashboards
- PDF export
- Frameworks or build tools
- Multi-user or school-wide deployment
- Online journal submission
- Google Drive upload, email sending, cloud submission, and signature automation

The repo lives under `C:\xampp-projects\ojt-journal-companion` as a **static web app folder**. It is not a PHP/XAMPP application.

---

## 4. Current v1.0 Status

| Area | Status |
| --- | --- |
| Core journal workflow | Complete |
| Dashboard + mobile tabs | Complete |
| Backup export / restore | Complete |
| Reset Local App Data | Complete |
| UI theme + microcopy polish | Accepted for now |
| Final manual regression | Passed |
| PWA / installable app | Deferred |
| Official DOCX export | Implemented on `feature/docx-export`; final regression/polish |
| PDF export | Deferred |

**MVP definition:** Met per `docs/FEATURES.md` section 8.

---

## 5. Completed Features

### Profile & settings

- Student profile (name, course, school, section, required OJT hours)
- Company profile (name, address, department, supervisor)
- App settings (preferred week start day, time format)

### Weeks

- Create, edit, delete OJT weeks (week number + inclusive date range)
- Weekly summary fields on expanded week: Skills Learned, Problems Encountered, Reflection, Additional Notes
- Day slot list per week with links to Daily Logs

### Daily Logs

- Week selector → compact **day cards** → **modal/panel editor**
- Day status: `Worked`, `Absent`, `No OJT / Rest Day`
- Time in, time out, break minutes, day remarks
- Automatic rendered-hours calculation (worked days only)
- Task/work items (description, optional minutes, status, notes, sort order)
- Photo documentation (JPEG/PNG/WebP, category, caption, download, delete)

### Weekly Preview

- Official journal-like HTML preview per selected week
- **Copy Weekly Journal** plain-text output to clipboard
- Profile warnings when student/company name missing

### Official DOCX Export

- **Export Official DOCX** button in Weekly Preview
- Client-side DOCX generation with vendored `PizZip` and `docxtemplater`
- Shared payload builder in `journal-payload.js` keeps preview/copy/export data mapping aligned
- Dynamic Day 1 through Day N rows from the selected week date range; DOCX row labels include the date, such as `Day 1 July 7, 2026`
- Worked-day task lines include description, optional duration, and personal status
- Uses the ignored private official template first when present, then falls back to the sanitized committed template
- Leaves signatures blank and does not include photos, time-in/time-out columns, backend calls, or online submission

### Dashboard

- Overall OJT progress (when required hours set)
- Student/company identity strip
- Current/latest week: daily check-in, weekly rendered total, summary readiness
- Backup reminder when no export in 7+ days

### Backup screen

- JSON export (includes photos as Base64)
- JSON restore (replace-style, with confirmation, then reload)
- Reset Local App Data (danger zone — see section 9)

### Mobile

- Mobile tab navigation: Home, Weeks, Logs, Preview, Backup
- Profile button in header on small screens

---

## 6. Important Data / Model Rules

**IndexedDB:** database name `ojt-journal-companion`, version **4**.

**Object stores:**

- `studentProfile` — single record (`id: student-profile`)
- `companyProfile` — single record (`id: company-profile`)
- `appSettings` — single record (`id: app-settings`); includes optional `lastBackupDate`
- `ojtWeeks` — many week records
- `dailyLogs` — many logs linked by `weekId`
- `dailyTasks` — many tasks linked by `dailyLogId`
- `photoAttachments` — many photos linked by `dailyLogId`; `fileBlob` stored in IndexedDB

**Key rules:**

- **Rendered hours** come from daily log `timeIn`, `timeOut`, `breakMinutes` when `dayStatus` is `Worked`. Store `renderedMinutes` as the source of truth.
- **Absent / rest days** → `0` rendered minutes; time fields not required.
- **Task `timeSpentMinutes`** is documentation only — never the official rendered-hours source.
- **Task status** (`Pending`, `In Progress`, `Completed`) is personal tracking only — not approval or grading. It is included in DOCX task accomplishment lines because the official journal submission requires it.
- **Weekly total hours** are calculated from related `DailyLog` records, not typed into `OJTWeek`.
- **Dates:** `YYYY-MM-DD`; times internal `HH:mm`; timestamps ISO 8601.
- **Same-day logs only** — overnight shifts out of scope.
- **Week delete** is blocked while daily logs exist for that week.
- **Daily log delete** cascades to tasks and photos via `deleteDailyLogWithRelatedRecords()`.
- **Restore** replaces all local data — no merge/conflict handling.
- **Reset** calls `OJTStorage.clearAllData()` — clears every store.

Full field tables: `docs/DATA_STRUCTURE.md`.

---

## 7. Important Workflow Rules

Recommended student flow:

1. **Profile** — student + company + settings (required OJT hours for dashboard progress)
2. **Weeks** — create OJT week(s)
3. **Daily Logs** — pick week → open each day → save status/time → add tasks → attach photos
4. **Weeks** (expand week) — fill weekly summary fields
5. **Weekly Preview** — pick week → review → copy journal text or export Official DOCX
6. **Backup** — export JSON regularly; restore or reset only when intentional

**Navigation:** Desktop uses sidebar; mobile uses compact tabs + profile header button.

**Weekly Preview copy text** is generated by `buildPlainText()` in `journal-preview.js`. DOCX export data is generated through `journal-payload.js` and `docx-export.js`. Do not change official journal labels or DOCX placeholder mapping without an explicit product decision.

**Do not** auto-submit journals or replace official school forms.

Full workflows: `docs/WORKFLOWS.md`.

---

## 8. UI / UX Status

**Accepted for v1.0:**

- Muted mid-tone theme (flat surfaces, no gradients) — Batch UI-4.1
- Intern-focused microcopy and helper text — Batch UI-4.2
- Daily Logs compact day cards + full-screen/modal editor — Batch 4
- Dashboard current/latest week progress — Batch 3A
- Weekly Preview official-format layout — Batch 2
- Backup safety polish (size warning, restore wording, reminder) — Batch 1

**Main sections:** Dashboard, Profile, Weeks, Daily Logs, Weekly Preview, Backup.

**CSS:** All global theme variables and layout in `app/assets/css/styles.css`.

**Deferred polish** (see `docs/POLISH_ROADMAP.md`): Batch 5 code hygiene (`utils.js`, DB connection caching), some Batch 3 UX niceties (recent logs card, human-friendly dates everywhere, accordion completeness hints).

---

## 9. Backup, Restore, and Reset Behavior

### Export (`backup.js`)

- Builds JSON with `appName`, `backupVersion` (`1.0`), `exportedAt`, all entities
- Photos converted to Base64 in export
- Warns before export if estimated photo payload exceeds ~10 MB
- On success, sets `appSettings.lastBackupDate` and updates dashboard reminder

### Restore

- User picks JSON file → validation → confirm dialog → `replaceAllData()` → reload after ~800 ms
- **Replace only** — does not merge with existing data

### Reset Local App Data

Located on Backup screen in danger-zone panel.

**Guardrails (all required):**

1. Checkbox: understand permanent deletion
2. Type exactly `RESET`
3. Button enabled only when both pass
4. Final `window.confirm()` before deletion

**On success:** `clearAllData()` clears all IndexedDB stores → success message → page reload → empty app.

**On cancel:** No data changed.

JSON backup/restore/reset behavior is separate from Official DOCX Export. JSON files are for app data recovery or transfer; DOCX files are editable journal submission drafts and cannot restore app data.

---

## 10. How to Run Locally

No build step. Serve or open the static `app/` folder.

### Option A — Local static server (recommended)

From project root:

```bash
# Python 3
python -m http.server 8080
````

Then open: `http://localhost:8080/app/`

Or use any simple static file server pointing at the repo.

### Option B — XAMPP / Apache

If the project folder is under `htdocs` or a vhost, open:

`http://localhost/ojt-journal-companion/app/`

Adjust the path to match your local setup.

### Option C — Open file directly

Opening `app/index.html` via `file://` may work in some browsers for IndexedDB, but a local HTTP server is more reliable for testing.

**Requirements:** Modern browser with IndexedDB support. No backend or internet connection is required when served from a local/static source.

---

## 11. Manual Regression Checklist

Run after any meaningful change:

### Setup

* [ ] Save student profile (name required)
* [ ] Save company profile (name required)
* [ ] Save app settings

### Weeks

* [ ] Create week with valid dates
* [ ] Reject duplicate week number / overlapping dates
* [ ] Expand week, save weekly summary
* [ ] Block week delete when daily logs exist

### Daily Logs

* [ ] Select week, open day card, save Worked day with time → rendered hours calculate
* [ ] Save Absent / Rest day → 0 rendered hours
* [ ] Add, edit, delete task item
* [ ] Attach photo, edit caption, download, delete photo
* [ ] Delete daily log (confirm) — tasks/photos removed

### Weekly Preview

* [ ] Preview shows correct week data
* [ ] Copy Weekly Journal to clipboard
* [ ] Profile warnings when names missing

### Dashboard

* [ ] OJT progress when required hours set
* [ ] Current/latest week day list and summary status
* [ ] Backup reminder when `lastBackupDate` old or missing

### Backup

* [ ] Export JSON backup
* [ ] Restore from backup (confirm, reload, data returns)
* [ ] Reset: checkbox + `RESET` + confirm → all data cleared after reload

### Official DOCX Export

* [ ] App loads without console errors
* [ ] Weekly Preview still renders
* [ ] Copy Weekly Journal still works
* [ ] Export Official DOCX works
* [ ] 5-day week exports Day 1 through Day 5 with warning
* [ ] 6-day week exports Day 1 through Day 6 without day-count warning
* [ ] 7-day week exports Day 1 through Day 7 with warning
* [ ] DOCX day labels include dates, formatted like `Day 1 July 7, 2026`
* [ ] Canceling a warning stops export
* [ ] Worked day task bullets include duration and status
* [ ] Missing daily log shows "No daily log recorded."
* [ ] Absent/rest day output is correct
* [ ] Weekly total matches `DailyLog.renderedMinutes` total
* [ ] Photos are not included
* [ ] Signature lines remain blank
* [ ] Private official template is ignored and not committed
* [ ] Sanitized fallback template still works if private template is unavailable

### Mobile (≤760px width)

* [ ] Mobile tabs switch sections
* [ ] Daily log editor usable on small screen

### Offline / local use

* [ ] Core flows work from the local/static app source without needing a backend or internet connection

---

## 12. Known Limitations

* **Single browser, single device** — no automatic sync between phone and laptop
* **Data loss risk** if browser storage is cleared without a JSON backup
* **Photo storage** depends on browser IndexedDB limits; large backups can be slow or large
* **No inline photo gallery preview** — attach, list, caption, download only
* **No search** across logs or tasks
* **No PDF export** — Official DOCX Export is available, but downloaded files still need manual review, signatures, and normal submission
* **No PWA** — not installable as an app shell in v1.0
* **Week selectors** may still show raw `YYYY-MM-DD` in some places (human-friendly dates partially deferred)
* **Companion only** — does not validate with school, supervisor, or official submission systems
* **Task time vs rendered time** may differ; app may warn but does not block save

---

## 13. Deferred / Future Improvements

From `docs/FEATURES.md` and `docs/POLISH_ROADMAP.md`:

### Product (post–v1.0 candidates)

* PDF export
* PWA installability
* Better photo compression
* Basic search
* Printable weekly page
* Plain-text/Markdown file export (clipboard copy exists today)
* Optional AI summary assistance
* ZIP backup for photo-heavy data
* Light/dark theme toggle, with the current muted mid-tone theme as a dark or dark-like option

### Code quality (optional)

* Batch 5: shared `utils.js`, dependency comments, IndexedDB connection caching
* Batch 3 remainder: recent logs on dashboard, friendly dates in all selectors, day completeness hints

### Explicitly do-not-build (without scope change)

* Login, cloud sync, Google Drive upload, email sending, online submission, GPS/QR, admin/supervisor dashboards, grading, payroll, multi-user

---

## 14. Suggested Next Steps After v1.0

Pick one direction per change batch; keep the app working after each step.

1. **Release hygiene** — Keep README/docs synced with the active branch; tag releases intentionally; optional changelog
2. **Real-world soak test** — One full OJT week of daily use on target browser/device; verify backup/restore on second browser profile
3. **Small UX wins** — Human-friendly dates in week selectors; dashboard recent-activity list (low risk, `ui.js` / selectors only)
4. **Export upgrade** — PDF or future DOCX template revisions if school requirements change (plan first)
5. **PWA** — `manifest.json` + service worker for offline shell (separate batch; test cache vs IndexedDB carefully)
6. **Code hygiene** — Batch 5 refactor only if maintenance pain appears; test all CRUD + backup/restore/reset after

---

## Quick Reference — Key Files

| Purpose                          | File                               |
| -------------------------------- | ---------------------------------- |
| App shell + sections             | `app/index.html`                   |
| Theme / layout                   | `app/assets/css/styles.css`        |
| IndexedDB setup                  | `app/assets/js/db.js`              |
| All storage CRUD, restore, clear | `app/assets/js/storage.js`         |
| Rendered time math               | `app/assets/js/calculations.js`    |
| Photo validation                 | `app/assets/js/photos.js`          |
| Dashboard + messages             | `app/assets/js/ui.js`              |
| Section navigation               | `app/assets/js/app.js`             |
| Profile forms                    | `app/assets/js/profile.js`         |
| Weeks + weekly summary           | `app/assets/js/weeks.js`           |
| Daily logs UI + CRUD             | `app/assets/js/daily-logs.js`      |
| Shared weekly journal payload    | `app/assets/js/journal-payload.js` |
| Official DOCX generation         | `app/assets/js/docx-export.js`     |
| Weekly preview + copy text       | `app/assets/js/journal-preview.js` |
| Export, restore, reset           | `app/assets/js/backup.js`          |

## Related Documentation

| Doc                      | Use for                                     |
| ------------------------ | ------------------------------------------- |
| `docs/PROJECT_BRIEF.md`  | Vision, scope, success criteria             |
| `docs/FEATURES.md`       | Feature list and completion status          |
| `docs/DATA_STRUCTURE.md` | Entities, fields, validation, relationships |
| `docs/WORKFLOWS.md`      | Step-by-step user flows                     |
| `docs/BUILD_PLAN.md`     | How the app was built in phases             |
| `docs/POLISH_ROADMAP.md` | UI polish batch history and deferred items  |
| `docs/DOCX_EXPORT_PLAN.md` | Official DOCX Export plan, status, and checklist |
| `docs/DOCX_TEMPLATE_PLACEHOLDERS.md` | DOCX template paths and placeholder mapping |

---

*End of handoff. Do not treat this file as a feature spec for new scope — confirm against code and `docs/FEATURES.md` before implementing changes.*

