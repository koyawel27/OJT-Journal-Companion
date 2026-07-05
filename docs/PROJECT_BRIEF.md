# OJT Journal Companion Project Brief

## 1. Project Overview

OJT Journal Companion is a lightweight offline-first personal app for students and interns who need a simple way to record daily OJT activities, track rendered hours, keep photo documentation, and prepare weekly journal content before transferring it into an official school journal template.

The app is intended to support one student using local offline data. It may run on laptop, desktop, or mobile browsers, but v1.0 will not provide automatic syncing across devices. It is a personal productivity tool, not a school capstone, not an institutional system, and not a replacement for official school forms.

## 2. Problem Statement

Students and interns often record OJT activities across scattered notes, photos, messages, and manual hour calculations. This can make it difficult to remember daily work, organize documentation, and prepare weekly journal entries accurately.

OJT Journal Companion helps reduce that friction by giving the student a dedicated local workspace for daily logs, rendered hours, photo documentation records, and draft journal content.

## 3. Target User

The target user is one student or intern completing an OJT, practicum, or internship requirement who needs to:

- Record daily activities.
- Track rendered hours.
- Keep photo documentation organized.
- Draft weekly journal content.
- Manually transfer prepared content into an official school journal template.

## 4. Project Goal

The goal is to build a simple offline-first companion app that helps the student keep consistent and organized OJT journal records without requiring accounts, internet access, or server-side infrastructure.

## 5. v1.0 Scope

Version 1.0 should focus on the core needs of one local user:

- Set up a student profile for journal identity and output context.
- Set up a company profile for OJT placement context.
- Create, edit, and delete daily journal entries.
- Record date, time in, time out, break duration, and rendered hours.
- Automatic daily and weekly rendered hours calculation.
- Write daily activities, accomplishments, learnings, challenges, and notes.
- Attach imported photo documentation and store related photo metadata locally.
- View entries by date or week.
- Summarize weekly journal content.
- Prepare weekly skills learned, problems encountered, and reflection or points of learning.
- Preview, copy, or export weekly journal content for manual transfer.
- Export local data as a simple JSON backup.
- Import or restore local data from a JSON backup.
- Store data locally using IndexedDB.
- Work without login, cloud sync, or an online backend.

## 6. Out of Scope for v1.0

The first version should not include:

- Login or account registration.
- Admin dashboard.
- Supervisor approval workflows.
- Cloud sync.
- GPS attendance.
- Multi-user support.
- School-wide deployment features.
- Company or supervisor portals.
- Payroll, grading, or evaluation features.
- Automated submission to official school systems.

## 7. Intended Platform

The intended platform is a responsive browser-based offline-first app that can run on laptop, desktop, and mobile browsers. Initial development and testing may prioritize laptop or desktop use, but a mobile-friendly layout should be considered from the start.

The recommended stack is:

- HTML
- CSS
- JavaScript
- IndexedDB
- Later PWA support

The project is stored inside `C:\xampp-projects` only as a local project location. It is not intended to be a PHP or XAMPP application.

## 8. Basic User Workflow

1. The student opens the app locally.
2. The student sets up a student profile.
3. The student sets up a company profile.
4. The student creates or selects a journal week.
5. The student adds daily logs under that week.
6. The student records date, working hours, activities, accomplishments, notes, and optional photo documentation.
7. The app stores the entries locally.
8. The student prepares weekly summary fields.
9. The student previews, copies, or exports the weekly journal content.
10. The student manually transfers the prepared content into the official school journal template.
11. The student backs up local data as a JSON export when needed.

## 9. Journal Fields Supported

The initial journal structure may support student, company, daily log, and weekly journal information.

Student profile fields may include:

- Student name
- Course or program
- School or institution
- Section or year level
- Required OJT hours

Company profile fields may include:

- Company name
- Company address
- Department or assigned area
- Supervisor or contact person

Daily log fields may include:

- Entry date
- Week number or journal week
- Time in
- Time out
- Break duration
- Rendered hours
- Daily activities or accomplishments
- Notes
- Optional imported photo attachments
- Photo documentation metadata
- Photo records stored locally

Weekly journal fields may include:

- Week number or date range
- Inclusive dates
- Total weekly hours rendered
- Weekly skills learned
- Problems encountered
- Reflection or points of learning
- Additional notes

## 10. Data Storage Direction

Data should be stored locally using IndexedDB. This supports offline-first behavior and avoids the need for a backend server in v1.0.

Photo documentation should use imported photo attachments, photo records stored locally, and photo documentation metadata. Photo handling must be tested because browser storage limits and file behavior vary across browsers and devices.

Version 1.0 should include simple JSON backup/export and JSON import/restore so the student can save and recover local data.

## 11. Important Limitations

The app is a companion tool only. It does not replace official school templates, official signatures, supervisor validation, or formal submission processes.

Because v1.0 is local and offline-first, the student is responsible for keeping backup files safe after exporting them from the app.

Offline-first does not mean automatic cross-device sync. Data may be lost if browser storage is cleared before the user exports a backup.

## 12. Development Phases

### Phase 1: Planning and Documentation

- Define project scope.
- Document core features.
- Plan data structure.
- Map basic workflows.
- Prepare a simple build plan.

### Phase 2: Local App Prototype

- Build the basic interface.
- Add student profile and company profile setup.
- Add daily journal entry creation and editing.
- Store entries locally.
- Add rendered hours calculation.
- Add JSON backup/export and JSON import/restore.

### Phase 3: Journal Organization

- Add date and week-based views.
- Add weekly summary preparation.
- Improve entry filtering and review.

### Phase 4: Documentation and Export Support

- Add photo documentation support.
- Add simple export or copy-ready journal summaries.
- Prepare content for manual transfer to official templates.

### Phase 5: Offline App Polish

- Improve offline behavior.
- Add PWA support if needed.
- Polish backup and restore behavior.

## 13. Success Criteria

The project is successful when one student can use the app locally to:

- Set up student and company information.
- Record OJT activities consistently.
- Track daily and weekly rendered hours.
- Organize photo documentation records.
- Review previous journal entries.
- Generate or preview one complete weekly journal.
- Prepare weekly journal content more easily.
- Export and restore local data using JSON backup files.
- Use the app without login, cloud services, or an internet connection.

## 14. Project Direction

OJT Journal Companion should remain small, personal, and focused. The project should avoid growing into a full internship management system.

The preferred direction is a practical offline-first journal companion that helps one student stay organized during OJT while keeping development simple enough to build, maintain, and improve over time.
