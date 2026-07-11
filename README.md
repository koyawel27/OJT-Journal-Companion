# OJT Journal Companion

A lightweight, offline-first personal browser app for students and interns. Record daily OJT activities, track rendered hours, attach photo documentation, and prepare a weekly journal for copying or official DOCX submission.

**v1.0 is the released baseline.** Official DOCX Export with an automatic photo appendix is implemented on the current feature branch as the **v1.1 release candidate**. It is not tagged or released yet.

## What this app is

This is a local, offline-first personal app for **one student on one browser/device**. All data stays in the browser with IndexedDB. There is **no backend**, **no account/login**, and **no cloud sync**.

Export JSON backups regularly. Browser storage can be cleared by you, the browser, or device maintenance; without a backup, data can be lost.

## Main features

- Profile, company details, and OJT settings
- OJT weeks, Daily Logs, task items, and rendered-hours tracking
- Photo documentation with JPEG, PNG, or WebP files, captions, categories, download, and removal
- Weekly Preview and Copy Weekly Journal
- **Official DOCX Export** for the selected week:
  - Dynamic Day 1 through Day N rows with dates
  - Task description, optional duration, and status
  - Weekly rendered-hours total and weekly summaries
  - Automatic Photo Documentation appendix with optional captions
  - JPEG and PNG support; WebP is converted temporarily during export
  - Editable Word output for any permitted manual photo resizing or rearrangement
- JSON backup, restore, and guarded local-data reset
- Dashboard progress and responsive mobile navigation

## How to run locally

No build step is required. Serve the static app folder through local HTTP:

~~~powershell
cd C:\xampp-projects\ojt-journal-companion
& 'C:\xampp\php\php.exe' -S 127.0.0.1:8765 -t app
~~~

Then open <http://127.0.0.1:8765/>.

Direct file:// opening is not supported for reliable DOCX export because the template assets must be fetched through local HTTP. The app still has no backend application logic or internet requirement.

## Backup versus DOCX export

| Feature | Purpose |
| --- | --- |
| JSON backup/restore | Protects and restores app data, including photo data. |
| Official DOCX Export | Creates an editable journal submission document for the selected week. |

A DOCX is not a restorable app backup. Keep JSON backups somewhere safe outside the browser.

## Template safety

A private approved official template may be used locally when available. It is ignored by Git and must never be committed. The tracked sanitized v2 template remains the public fallback.

## Scope boundaries

In scope: one local student, browser-stored journal data, JSON backups, and client-side DOCX generation.

Out of scope: backend services, PHP application logic, login/accounts, cloud sync, online submission, Google Drive integration, PDF export, and school-wide or multi-user deployment.

## Known limitations

- Single browser and device; no automatic sync
- Browser storage can be lost without a JSON backup
- Photo-heavy data can approach browser storage limits
- No PDF export or online submission
- The app remains a companion; students still review, sign, and submit documents through normal school channels

## Related documentation

| Document | Description |
| --- | --- |
| docs/FEATURES.md | User-facing feature status |
| docs/PROJECT_HANDOFF.md | Technical handoff and regression checklist |
| docs/DOCX_EXPORT_PLAN.md | DOCX implementation status and release steps |
| docs/DOCX_TEMPLATE_PLACEHOLDERS.md | Active v2 template command contract |
| docs/BUILD_PLAN.md | Historical build phases |