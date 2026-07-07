# OJT Journal Companion

A lightweight, offline-first personal browser app for students and interns. Record daily OJT activities, track rendered hours, attach photo documentation, and prepare weekly journal content — then copy it into your official school journal template.

**v1.0 is complete.** Core features are implemented and have passed final manual regression testing.

## What this app is

This is a **local, offline-first personal app** for **one student on one browser/device**. All data stays in your browser using **IndexedDB**. There is **no backend**, **no login**, **no cloud sync**, and **no PDF or DOCX export** in v1.0.

Export JSON backups regularly. Browser storage can be cleared by you, the browser, or device maintenance — without a backup, your data may be lost.

## Tech stack

| Layer | Choice |
| --- | --- |
| Markup | HTML |
| Styling | CSS (single stylesheet) |
| Logic | Vanilla JavaScript (no framework, no bundler) |
| Storage | IndexedDB |
| Server | None required |

## Main features (v1.0)

- **Profile** — Student and company info, plus app settings (week start day, time format, required OJT hours)
- **OJT weeks** — Create, edit, and manage weekly journal periods with summary fields
- **Daily logs** — Day status (Worked / Absent / Rest), time in/out, break duration, automatic rendered hours
- **Task items** — Structured accomplishments under each daily log with personal status tracking
- **Photo documentation** — Attach JPEG/PNG/WebP photos with caption and category; download or remove
- **Weekly preview** — Official journal-like preview with **Copy Weekly Journal** plain-text output
- **Dashboard** — OJT progress, current-week status, and backup reminder
- **Backup** — JSON export/import (photos included as Base64), plus guarded **Reset Local App Data**
- **Mobile-friendly** — Responsive layout with compact mobile tab navigation on small screens

## How to run locally

No build step. Serve the static `app/` folder.

### Option A — Local static server (recommended)

From the project root:

```bash
python -m http.server 8080
```

Then open: `http://localhost:8080/app/`

Any simple static file server pointing at this repo works the same way.

### Option B — XAMPP / Apache

If the project folder is under `htdocs` or a vhost:

`http://localhost/ojt-journal-companion/app/`

Adjust the path to match your local setup.

### Option C — Open file directly

Opening `app/index.html` via `file://` may work in some browsers, but a local HTTP server is more reliable for IndexedDB.

**Requirements:** A modern browser with IndexedDB support. No backend or internet connection is needed once the app is loaded from a local/static source.

## Backup, restore, and reset

| Action | What it does |
| --- | --- |
| **Export** | Downloads a JSON backup of all app data (photos included as Base64). Updates the dashboard backup reminder. |
| **Restore** | Replaces all local data from a JSON backup after confirmation, then reloads the page. Does not merge with existing data. |
| **Reset** | Clears every IndexedDB store after guardrails: checkbox confirmation, typing `RESET`, and a final confirm dialog. Export first if you still need your data. |

Keep backup files in a safe place outside the browser. They are your only recovery path when moving devices or after storage is cleared.

## Scope boundaries

**In scope (v1.0):** One local student user, profiles, weeks, daily logs, weekly preview, dashboard, JSON backup/restore/reset.

**Out of scope (v1.0):** Login or accounts, backend server, cloud sync, GPS/QR attendance, supervisor or admin dashboards, PDF/DOCX export, multi-user or school-wide deployment, online journal submission.

This repo is a **static web app folder**. It is not a PHP or XAMPP application, even though it may live under `C:\xampp-projects` as a local project location.

## Known limitations

- **Single browser, single device** — no automatic sync between phone and laptop
- **Data loss risk** if browser storage is cleared without a JSON backup
- **Photo storage** depends on browser IndexedDB limits; large backups can be slow or heavy
- **No inline photo gallery preview** — attach, list, caption, and download only
- **No search** across logs or tasks
- **No printable, PDF, or DOCX export** — copy weekly journal text to clipboard only
- **No PWA** — not installable as an app shell in v1.0
- **Companion only** — does not replace official school forms, signatures, or supervisor validation

## Future improvements

Possible post–v1.0 enhancements (not committed):

- PDF or DOCX export
- PWA installability
- Better photo compression and ZIP backups for photo-heavy data
- Basic search and printable weekly page
- Plain-text or Markdown file export (clipboard copy exists today)
- Optional AI summary assistance

The app will stay personal-first. It is not intended to become a school-wide or company-wide internship platform.

## Related documentation

| Document | Description |
| --- | --- |
| [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) | Vision, scope, and success criteria |
| [`docs/FEATURES.md`](docs/FEATURES.md) | Feature list and v1.0 completion status |
| [`docs/PROJECT_HANDOFF.md`](docs/PROJECT_HANDOFF.md) | Developer handoff, data rules, and regression checklist |
| [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) | Phase-by-phase build history |
| [`docs/DATA_STRUCTURE.md`](docs/DATA_STRUCTURE.md) | Entities, fields, and validation rules |
| [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) | Step-by-step user flows |
| [`docs/POLISH_ROADMAP.md`](docs/POLISH_ROADMAP.md) | UI polish history and deferred items |
