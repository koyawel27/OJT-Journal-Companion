# DOCX Template Placeholders

This document lists the placeholders used by the DOCX export templates.

Current implementation: `app/assets/js/docx-export.js` builds the template data, and `app/assets/js/journal-payload.js` builds the shared day/accomplishment payload.

## Template Files

| Path | Purpose | Git status |
| --- | --- | --- |
| `app/assets/templates/bpc-ojt-weekly-journal.docx` | Sanitized public template committed to the repository. It preserves an official-like weekly journal structure without restricted BPC branding, logos, or private institutional content. | Tracked |
| `app/assets/templates/bpc-ojt-weekly-journal.private.docx` | Optional local real official template for private use on the maintainer's machine. | Gitignored |

The export engine tries the private official template first. If that file is missing or returns `404`, it falls back to the sanitized public template.

Do not commit the private official template unless public sharing is explicitly confirmed.

## Header Fields

| Placeholder | Source |
| --- | --- |
| `{studentName}` | `StudentProfile.studentName` |
| `{companyName}` | `CompanyProfile.companyName` |
| `{weekNumberDisplay}` | Derived from `OJTWeek.weekNumber`, such as `#1` |
| `{inclusiveDatesDisplay}` | `OJTWeek.inclusiveStartDate` to `OJTWeek.inclusiveEndDate` |

## Daily Accomplishments Loop

The template uses a docxtemplater loop around one table row:

```text
{#days}
{dayLabel}
{docxAccomplishmentText}
{/days}
```

| Placeholder | Source |
| --- | --- |
| `{dayLabel}` | DOCX display label built from the derived day label and selected week date, such as `Day 1 July 7, 2026` |
| `{docxAccomplishmentText}` | Accomplishment text from the shared journal payload, with worked-day task lines formatted as description, optional duration, and status |

`dayLabel` is date-inclusive only in the DOCX template data. Weekly Preview and Copy Weekly Journal keep their existing date display/output.

`docxAccomplishmentText` includes worked-day task lines as `• description (optional duration) - status`, such as `• Bible Reading & Devotion (30m) - Completed`. Task duration may appear because it is documentation text, but it must not affect rendered hours.

## Summary Fields

| Placeholder | Source |
| --- | --- |
| `{totalRenderedDisplay}` | Sum of related `DailyLog.renderedMinutes`, formatted with `OJTCalculations.formatRenderedTime()` |
| `{weeklySkillsLearned}` | `OJTWeek.weeklySkillsLearned` |
| `{problemsEncountered}` | `OJTWeek.problemsEncountered` |
| `{reflectionOrPointsOfLearning}` | `OJTWeek.reflectionOrPointsOfLearning` |

## Intentional Exclusions

- Photos are not included.
- Time in, time out, and break columns are not included.
- Task status is included in DOCX accomplishment text for worked-day task lines, but it remains personal tracking and is not supervisor approval, official validation, grading, or a signature.
- Signature lines remain blank.
