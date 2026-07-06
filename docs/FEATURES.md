# OJT Journal Companion Features

## 1. Feature Overview

OJT Journal Companion is a personal offline-first journal companion for one student using local offline data. Its features help the student record daily OJT work, track rendered hours, organize basic photo documentation, and prepare weekly journal content for manual transfer into an official school template.

The app stays lightweight. It is not a full internship management system, and v1.0 does not include accounts, approval flows, dashboards for other roles, online submission, or automatic syncing across devices.

**v1.0 status:** Core features listed below are implemented and have passed final manual regression testing.

## 2. v1.0 Must-Have Features

These features are required for the first usable version.

- Student profile
- Company profile
- Daily log creation, editing, and deletion
- Time in, time out, and break duration fields
- Automatic daily rendered hours calculation
- Automatic weekly rendered hours calculation
- Weekly grouping for daily logs
- Daily activities and accomplishments
- Structured daily task/work items under daily logs
- Task description, optional task time spent, personal status, optional notes, and task ordering when practical
- Basic photo documentation support for daily logs
- Attach or import photo documentation for a daily log
- Store related photo metadata locally
- Remove photo documentation from a daily log
- Weekly skills learned
- Problems encountered
- Reflection or points of learning
- Weekly journal preview
- Copy-ready weekly journal content
- IndexedDB local storage
- JSON backup/export
- JSON import/restore
- Backup reminder on Dashboard (when no recent export)
- Reset Local App Data (guarded full local clear)
- Dashboard with OJT progress and current/latest week summary
- Mobile tab navigation
- App settings (preferred week start day, time format, required OJT hours)

## 3. v1.0 Should-Have Features

These features were strongly useful for v1.0. Most are now implemented.

- Basic filtering by week or date — **implemented** (week selectors on Daily Logs and Weekly Preview)
- Simple dashboard summary — **implemented**
- Required OJT hours progress — **implemented**
- Basic validation for time records — **implemented**
- Mobile-friendly layout — **implemented** (responsive layout plus bottom tab navigation)

## 4. v1.0 Nice-to-Have Features

These features improve the experience but v1.0 works without them.

- Printable weekly journal page
- Basic search
- Photo preview (inline gallery-style preview is not required; attach, caption, category, and download are implemented)
- Draft status indicators
- Export as plain text or Markdown (copy Weekly Journal plain text is implemented)
- Bullet-style task output in weekly journal previews — **implemented**

## 5. Future Features

These features may be considered after v1.0 is stable and the basic offline-first workflow works well.

- PDF export
- DOCX export
- PWA installability
- Better photo compression
- Optional AI summary assistance
- Optional manual cross-device transfer

Future features should still respect the personal-first direction of the project. They should not turn the app into a school-wide or company-wide internship platform.

## 6. Do-Not-Build-Yet Features

These features are outside the v1.0 direction and should not be built yet.

- Login or accounts
- Admin dashboard
- Coordinator dashboard
- Supervisor approval
- Online submission
- Cloud sync
- GPS attendance
- QR attendance
- Multi-user management
- School-wide deployment
- Grading or evaluation system
- Payroll or allowance tracking

## 7. Feature Priority Table

| Feature | Priority | v1.0 Status | Notes |
| --- | --- | --- | --- |
| Student profile | Must-have | Complete | Used for journal identity and output context. |
| Company profile | Must-have | Complete | Stores OJT placement context. |
| App settings | Must-have | Complete | Week start day, time format, required OJT hours. |
| Daily logs | Must-have | Complete | Compact day cards with modal/panel editor. |
| Day status (Worked / Absent / Rest) | Must-have | Complete | Drives rendered-hours rules per day. |
| Daily task/work items | Must-have | Complete | Bullet-style accomplishments under each daily log. |
| Time records | Must-have | Complete | Time in, time out, and break duration. |
| Daily hours calculation | Must-have | Complete | Calculates rendered hours from daily log time fields. |
| Weekly hours calculation | Must-have | Complete | Totals rendered hours by week. |
| Weekly grouping | Must-have | Complete | OJT weeks organize daily logs and preview. |
| Basic photo documentation | Must-have | Complete | Attach, caption, category, download, remove. |
| Weekly journal content | Must-have | Complete | Skills learned, problems encountered, reflection. |
| Weekly preview | Must-have | Complete | Official journal-like preview layout. |
| Copy-ready output | Must-have | Complete | Copy Weekly Journal to clipboard. |
| IndexedDB storage | Must-have | Complete | Local offline-first storage. |
| JSON backup/export | Must-have | Complete | Includes photos as Base64 in JSON. |
| JSON import/restore | Must-have | Complete | Replace-style restore with confirmation. |
| Backup reminder | Must-have | Complete | Dashboard reminder when export is overdue. |
| Reset Local App Data | Must-have | Complete | Checkbox, type RESET, confirm dialog, full store clear. |
| Dashboard summary | Should-have | Complete | OJT progress card and current/latest week panel. |
| Required hours progress | Should-have | Complete | Compared on Dashboard from profile setting. |
| Time validation | Should-have | Complete | Worked-day time rules and break validation. |
| Mobile-friendly layout | Should-have | Complete | Responsive CSS and mobile tab navigation. |
| Week/date filtering | Should-have | Complete | Week pickers on Daily Logs and Weekly Preview. |
| Printable weekly page | Nice-to-have | Deferred | Not in v1.0. |
| Basic search | Nice-to-have | Deferred | Not in v1.0. |
| Photo preview gallery | Nice-to-have | Deferred | Basic attach/download only in v1.0. |
| Draft status indicators | Nice-to-have | Deferred | Dashboard shows summary fill state partially. |
| Plain text or Markdown export file | Nice-to-have | Partial | Copy to clipboard implemented; file export deferred. |

## 8. v1.0 MVP Definition

The v1.0 MVP is complete when one student can use the app locally to:

1. Set up student and company information.
2. Create, edit, and delete daily OJT logs.
3. Record time in, time out, and break duration.
4. Automatically calculate daily and weekly rendered hours.
5. Group daily logs by week.
6. Write daily activities and accomplishments.
7. Add structured task/work items under a daily log for bullet-style accomplishments.
8. Attach or record basic photo documentation for daily logs.
9. Prepare weekly skills learned, problems encountered, and reflection or points of learning.
10. Preview and copy weekly journal content for manual transfer to the official school template.
11. Store data locally using IndexedDB.
12. Export and restore data using JSON backup files.
13. See OJT progress and current-week status on the Dashboard.
14. Reset all local app data from Backup when starting fresh (with guardrails).

## 9. Feature Notes and Boundaries

The app may run on laptop, desktop, and mobile browsers, but v1.0 will not provide automatic cross-device sync. Offline-first means the app should work with local browser data, not that data automatically moves between devices.

IndexedDB should be the main local storage direction for v1.0. JSON backup/export and JSON import/restore are required because local browser storage can be cleared by the user, the browser, or device maintenance. Reset Local App Data on the Backup screen clears all IndexedDB stores after checkbox confirmation, typing `RESET`, and a final confirm dialog — it does not replace the need for JSON export when moving devices.

Basic photo documentation is part of v1.0. The app should let the student attach or import photo documentation for daily logs, store related metadata locally, and remove photo documentation from a daily log.

Photo documentation should be included carefully. Imported photos, photo records, and related metadata may require storage testing because browser storage limits and file behavior vary across browsers and devices.

Advanced photo features such as preview, compression, gallery viewing, or image editing are not required for v1.0. Photo preview may remain a nice-to-have feature, while compression and richer image handling should be treated as future work.

Weekly journal output should focus on helping the student prepare content for manual transfer into the official school journal template. The app should not submit journals online or replace official school forms.


Structured daily task/work items support multiple accomplishment bullets under one daily log. Each task item may include a description, optional task-level time spent, personal status (`Pending`, `In Progress`, or `Completed`), optional notes, and display ordering. Task items appear as bullet-style output in the weekly journal preview.

Task status is personal progress tracking only. It is not supervisor approval, official school validation, grading status, or submission status.

Daily rendered hours should still come from the daily log's time in, time out, and break duration. Task-level time spent is only documentation detail and should not become the official rendered hours calculation source in v1.0.

The project should remain lightweight and personal-first. Avoid features that require user accounts, servers, supervisors, administrators, coordinators, attendance tracking systems, or school-wide deployment.
