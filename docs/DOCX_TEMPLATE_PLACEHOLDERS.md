# Active DOCX v2 Template Contract

## Active engine and template paths

The sole production engine is **docx-templates 4.15.0**, loaded from the locally vendored browser bundle.

| Path | Purpose | Git status |
| --- | --- | --- |
| app/assets/templates/bpc-ojt-weekly-journal.v2.docx | Sanitized v2 template and public fallback. | Tracked |
| app/assets/templates/bpc-ojt-weekly-journal.private.v2.docx | Optional approved official v2 template for local use. | Ignored |

The exporter loads the private v2 template first and falls back to the sanitized v2 template only when the private file returns HTTP 404.

The private official template is ignored. Never stage or commit it. The old v1 template and its Docxtemplater syntax are no longer production contracts.

## Command syntax

Active templates use docx-templates commands delimited by +++.

### Journal fields

| Template command | Data field |
| --- | --- |
| +++studentName+++ | StudentProfile studentName |
| +++companyName+++ | CompanyProfile companyName |
| +++weekNumberDisplay+++ | Display derived from OJTWeek weekNumber |
| +++inclusiveDatesDisplay+++ | Selected week inclusive start and end dates |
| +++totalRenderedDisplay+++ | Sum of related DailyLog renderedMinutes |
| +++weeklySkillsLearned+++ | OJTWeek weeklySkillsLearned |
| +++problemsEncountered+++ | OJTWeek problemsEncountered |
| +++reflectionOrPointsOfLearning+++ | OJTWeek reflectionOrPointsOfLearning |

### Dynamic daily rows

~~~text
+++FOR day IN days+++
+++$day.dayLabel+++
+++$day.docxAccomplishmentText+++
+++END-FOR day+++
~~~

Each day object has a date-inclusive label such as Day 1 July 7, 2026. Accomplishment text contains the task description, optional task duration, and status. Task duration never changes rendered-hours calculations.

### Conditional photo appendix

~~~text
+++IF hasPhotos+++
  [appendix page break and Photo Documentation heading]
+++END-IF+++

+++FOR group IN photoDays+++
+++$group.dayLabel+++
+++FOR row IN $group.photoRows+++
+++IMAGE getImage($row.leftPhoto)+++
+++$row.leftPhoto.captionDisplay+++
+++IMAGE getImage($row.rightPhoto)+++
+++$row.rightPhoto.captionDisplay+++
+++END-FOR row+++
+++END-FOR group+++
~~~

hasPhotos is true only when selected-week photos exist. The conditional includes the appendix page break, so a no-photo export has no heading, no photo grid, and no generated photo media.

Each photo-day group represents one selected-week DailyLog and its date. photoRows pairs prepared photos into left and right table-cell values. Each photo exposes image data plus captionDisplay. An odd final row uses a deliberately tiny placeholder image in the right cell so the cell remains structurally present but visually empty.

## Layout and image rules

- The photo appendix follows the journal and blank signature section.
- Day headings use keep-with-next behavior.
- Photo rows are non-splittable; an image and caption remain in the same table cell.
- Landscape and square images are bounded at 7.2 by 5.4 cm.
- Portrait images are bounded at 6.8 by 8.5 cm.
- Aspect ratio is preserved; images are not cropped, stretched, or upscaled.
- JPEG and PNG are inserted directly. WebP is converted temporarily to PNG without modifying the stored Blob.
- Captions are optional and long captions wrap naturally.

## Template authoring and security requirements

The template must remain developer-controlled. Users must not upload executable DOCX templates.

docx-templates evaluates template commands in its sandbox. Do not set noSandbox: true. The document body must retain the WordprocessingDrawing namespace needed for IMAGE commands.

The private and sanitized templates must use the same active v2 command contract. Do not mix the retired v1 brace placeholders such as {studentName}, {#days}, or {/days} with +++ commands.