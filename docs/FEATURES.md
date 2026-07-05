# OJT Journal Companion Features

## 1. Feature Overview

OJT Journal Companion is a personal offline-first journal companion for one student using local offline data. Its features should help the student record daily OJT work, track rendered hours, organize basic photo documentation, and prepare weekly journal content for manual transfer into an official school template.

The app should stay lightweight. It is not a full internship management system, and v1.0 should not include accounts, approval flows, dashboards for other roles, online submission, or automatic syncing across devices.

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

## 3. v1.0 Should-Have Features

These features are strongly useful for v1.0, but they can be implemented after the core journal flow works.

- Basic filtering by week or date
- Simple dashboard summary
- Required OJT hours progress
- Basic validation for time records
- Mobile-friendly layout

## 4. v1.0 Nice-to-Have Features

These features would improve the experience, but v1.0 can still work without them.

- Printable weekly journal page
- Basic search
- Photo preview
- Draft status indicators
- Export as plain text or Markdown

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
| Student profile | Must-have | Required | Used for journal identity and output context. |
| Company profile | Must-have | Required | Stores OJT placement context. |
| Daily logs | Must-have | Required | Main record for daily OJT activity. |
| Time records | Must-have | Required | Includes time in, time out, and break duration. |
| Daily hours calculation | Must-have | Required | Calculates rendered hours for each daily log. |
| Weekly hours calculation | Must-have | Required | Totals rendered hours by week. |
| Weekly grouping | Must-have | Required | Organizes daily logs into weekly journal periods. |
| Basic photo documentation support | Must-have | Required | Supports attaching or importing photo documentation to daily logs, with careful testing because browser storage behavior may vary. |
| Weekly journal content | Must-have | Required | Includes skills learned, problems encountered, and reflection. |
| Weekly preview | Must-have | Required | Lets the student review the prepared weekly journal. |
| Copy-ready output | Must-have | Required | Helps the student manually transfer content to the official template. |
| IndexedDB storage | Must-have | Required | Stores data locally for offline-first use. |
| JSON backup/export | Must-have | Required | Lets the student save a backup file. |
| JSON import/restore | Must-have | Required | Lets the student restore local data from a backup file. |
| Week/date filtering | Should-have | Recommended | Helps review entries faster. |
| Dashboard summary | Should-have | Recommended | Shows quick progress and recent journal status. |
| Required hours progress | Should-have | Recommended | Compares rendered hours against required OJT hours. |
| Time validation | Should-have | Recommended | Helps avoid invalid or incomplete time records. |
| Mobile-friendly layout | Should-have | Recommended | Supports use on mobile browsers without changing the offline-first scope. |
| Printable weekly page | Nice-to-have | Optional | Useful for review or manual records. |
| Basic search | Nice-to-have | Optional | Helps find older entries. |
| Photo preview | Nice-to-have | Optional | Useful if photo handling is stable in browser storage. |
| Draft status indicators | Nice-to-have | Optional | Helps show whether a weekly journal is still incomplete. |
| Plain text or Markdown export | Nice-to-have | Optional | Useful for copying or saving prepared journal content. |

## 8. v1.0 MVP Definition

The v1.0 MVP is complete when one student can use the app locally to:

1. Set up student and company information.
2. Create, edit, and delete daily OJT logs.
3. Record time in, time out, and break duration.
4. Automatically calculate daily and weekly rendered hours.
5. Group daily logs by week.
6. Write daily activities and accomplishments.
7. Attach or record basic photo documentation for daily logs.
8. Prepare weekly skills learned, problems encountered, and reflection or points of learning.
9. Preview and copy weekly journal content for manual transfer to the official school template.
10. Store data locally using IndexedDB.
11. Export and restore data using JSON backup files.

## 9. Feature Notes and Boundaries

The app may run on laptop, desktop, and mobile browsers, but v1.0 will not provide automatic cross-device sync. Offline-first means the app should work with local browser data, not that data automatically moves between devices.

IndexedDB should be the main local storage direction for v1.0. JSON backup/export and JSON import/restore are required because local browser storage can be cleared by the user, the browser, or device maintenance.

Basic photo documentation is part of v1.0. The app should let the student attach or import photo documentation for daily logs, store related metadata locally, and remove photo documentation from a daily log.

Photo documentation should be included carefully. Imported photos, photo records, and related metadata may require storage testing because browser storage limits and file behavior vary across browsers and devices.

Advanced photo features such as preview, compression, gallery viewing, or image editing are not required for v1.0. Photo preview may remain a nice-to-have feature, while compression and richer image handling should be treated as future work.

Weekly journal output should focus on helping the student prepare content for manual transfer into the official school journal template. The app should not submit journals online or replace official school forms.

The project should remain lightweight and personal-first. Avoid features that require user accounts, servers, supervisors, administrators, coordinators, attendance tracking systems, or school-wide deployment.
