# DOCX Template Placeholders

This document lists the placeholders used by `app/assets/templates/bpc-ojt-weekly-journal.docx`.

The committed template is sanitized. It preserves an official-like weekly journal structure, but it must not include restricted BPC branding, logos, or private institutional content. Keep the real BPC template local/private unless public sharing is confirmed.

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
| `{dayLabel}` | Derived label, such as `Day 1` |
| `{docxAccomplishmentText}` | Status-free accomplishment text from the shared journal payload |

`docxAccomplishmentText` intentionally omits task status. Task duration may appear because it is documentation text, but it must not affect rendered hours.

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
- Task status is not included in DOCX accomplishment text.
- Signature lines remain blank.

