# Active DOCX v2 Template Contract

## Active engine and template paths

The sole production engine is **docx-templates 4.15.0**, loaded from the locally vendored browser bundle.

| Path | Purpose | Git status |
| --- | --- | --- |
| app/assets/templates/bpc-ojt-weekly-journal.v2.docx | Sanitized v2 template and public fallback. | Tracked |
| app/assets/templates/bpc-ojt-weekly-journal.private.v2.docx | Optional approved official v2 template for local use. | Ignored |

The exporter loads the private v2 template first and falls back to the sanitized v2 template only when the private file returns HTTP 404.

The private official template is ignored. Never stage or commit it. The old v1 template and its Docxtemplater syntax are no longer production contracts.

The private and sanitized templates must use the same active v2 command contract below.

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
+++FOR set IN $group.photoSets+++
+++IF $set.isSingle+++
+++IMAGE getImage($set.singlePhoto)+++
+++$set.captionDisplay+++
+++END-IF+++
+++IF $set.isDouble+++
+++IMAGE getImage($set.doublePhotos[0])+++
+++IMAGE getImage($set.doublePhotos[1])+++
+++$set.captionDisplay+++
+++END-IF+++
+++IF $set.isTriple+++
+++IMAGE getImage($set.triplePhotos[0])+++
+++IMAGE getImage($set.triplePhotos[1])+++
+++IMAGE getImage($set.triplePhotos[2])+++
+++$set.captionDisplay+++
+++END-IF+++
+++IF $set.isGrid+++
+++FOR row IN $set.gridRows+++
+++IMAGE getImage($row.leftPhoto)+++
+++IF !$row.rightPhoto.isPlaceholder+++
+++IMAGE getImage($row.rightPhoto)+++
+++END-IF+++
+++END-FOR row+++
+++$set.captionDisplay+++
+++END-IF+++
+++END-FOR set+++
+++END-FOR group+++
~~~

`hasPhotos` is true only when selected-week photos exist. The conditional includes the appendix page break, so a no-photo export has no heading, no photo grid, and no generated photo media. The no-photo conditional is unchanged from v1.1.

Each `photoDays` group represents one selected-week DailyLog and its date. Each `photoSets` entry is one logical photo set. New photo sets correspond to one upload action, while legacy photos without `photoSetId` are represented as runtime singleton sets. Images from separate sets never share one row.

### Set layout flags and image arrays

| Field | Meaning |
| --- | --- |
| `$set.isSingle` | One image in the set |
| `$set.isDouble` | Two images in the set |
| `$set.isTriple` | Three images in the set |
| `$set.isGrid` | Four or more images in the set |
| `$set.singlePhoto` | Prepared image object for a one-image set |
| `$set.doublePhotos` | Two prepared image objects |
| `$set.triplePhotos` | Three prepared image objects |
| `$set.gridRows` | Two-column rows within a four-or-more set |
| `$set.captionDisplay` | One shared optional caption below the complete set |

Photo category is not part of the DOCX template contract and is not exported.

### Compatibility exporter output

The exporter also emits `photoRows` on each `photoDays` group for backward compatibility. That field pairs photos into left/right cells and is **not** the active v2 template contract. Active templates must iterate `$group.photoSets`, not `$group.photoRows`.

## Layout and image rules

- The photo appendix follows the journal and blank signature section.
- Day headings use keep-with-next behavior.
- One image: larger centered layout (`isSingle`).
- Two images: two columns (`isDouble`).
- Three images: three columns (`isTriple`).
- Four or more images: two-column rows within the set (`isGrid`); odd final grid rows suppress the placeholder right image.
- One shared caption appears once below the complete set through `$set.captionDisplay`.
- Layout-specific image bounds apply; aspect ratio is preserved; images are not cropped, stretched, or upscaled.
- JPEG and PNG are inserted directly. WebP is converted temporarily to PNG without modifying the stored Blob.
- Captions are optional and long captions wrap naturally.
- The original accepted Part 3B margins remain active. Moderate margins were evaluated but not adopted; templates were fully restored after that experiment, and no widened table layout was adopted.

## Template authoring and security requirements

The template must remain developer-controlled. Users must not upload executable DOCX templates.

docx-templates evaluates template commands in its sandbox. Do not set noSandbox: true. The document body must retain the WordprocessingDrawing namespace needed for IMAGE commands.

Do not mix the retired v1 brace placeholders such as {studentName}, {#days}, or {/days} with +++ commands.

### Template XML maintenance warning

A generic XML serializer rewrote WordprocessingML prefixes from `w:` to `ns0:`. The current DOCX command-processing path depends on the established `w:` command-containing elements, causing template commands to leak into generated exports. Do not mutate active DOCX template XML using a generic serializer that may rewrite prefixes. Use a prefix-preserving OOXML/package workflow and validate a real application export immediately after every template change.
