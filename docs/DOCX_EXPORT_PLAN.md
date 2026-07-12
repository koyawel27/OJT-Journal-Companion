# Official DOCX Export - Implementation Status

## Status

Official DOCX Export with an automatic Photo Documentation appendix is merged into master and released as v1.1. Final regression and release validation are complete. The v1.1 Git tag has been created and pushed, and v1.1 remains the stable released rollback baseline.

Post-v1.1 Phase 2 — Batch Photo Documentation updated the photo appendix to a set-aware layout contract. That work is complete and is not a new release or tag.

| Item | Status |
| --- | --- |
| Dependency and template review | Complete |
| Shared journal payload | Complete |
| Original text exporter | Complete historically |
| Private-template support | Complete |
| Photo feasibility and migration spike | Complete historically |
| Template stabilization | Complete |
| Production v2 templates | Complete |
| Production v2 exporter | Complete |
| Visible-button integration | Complete |
| Photo hydration fix | Complete |
| v1.1 compact two-column layout | Complete historically; superseded by Phase 2 set-aware layout |
| Phase 2 set-aware photo appendix | Complete |
| Regression and hardening | Complete |
| v1 runtime cleanup | Complete |
| Documentation synchronization | Complete |
| Final regression | Complete on merged master |
| PR review and merge | Complete |
| v1.1 release status | Released and tagged; stable rollback baseline |

## Final production design

- **Engine:** docx-templates 4.15.0, locally vendored browser build
- **Exporter:** app/assets/js/docx-export-v2.js
- **Tracked fallback template:** app/assets/templates/bpc-ojt-weekly-journal.v2.docx
- **Ignored local official template:** app/assets/templates/bpc-ojt-weekly-journal.private.v2.docx
- **Runtime model:** client-side browser generation, local HTTP template loading, no backend, CDN, runtime npm, or build workflow
- **Active template contract:** `docs/DOCX_TEMPLATE_PLACEHOLDERS.md`

The private official template must never be committed. The sanitized v2 template is the tracked fallback.

## Completed behavior

The selected week exports:

- Student name, company, week number, and inclusive dates
- Dynamic Day 1 through Day N rows with actual dates
- Task description, optional duration, and status
- Weekly rendered-hours total from DailyLog renderedMinutes
- Skills Learned, Problems Encountered, and Reflection / Points of Learning
- Blank signature areas
- Conditional Photo Documentation appendix after the journal section

Photos are filtered to selected-week DailyLogs and grouped into lightweight photo sets with legacy singleton handling for records without set metadata. JPEG and PNG use direct image data. WebP converts temporarily to PNG without modifying the stored Blob. Images preserve aspect ratio, do not crop or stretch, and do not upscale.

Current production ordering:

- Photo-set order within one DailyLog: (1) earliest valid `createdAt` across all images in the set; (2) stable set key as tie-breaker
- Image order within one set: (1) valid non-negative `photoSetIndex`; (2) valid `createdAt`; (3) attachment ID

The appendix groups photos by Day N and date, then by photo set within each day:

- One image: larger centered layout
- Two images: two columns
- Three images: three columns
- Four or more images: two-column rows within the set
- One shared caption below the complete set; category is not exported
- Images from separate sets never share one row
- No-photo documents contain no appendix heading, page break, grid, or generated media

Private-first v2 template loading with sanitized fallback on private-template 404 remains unchanged. Output remains editable.

### Margins

Moderate margins were evaluated but not adopted. The original accepted Part 3B margins remain active. Templates were fully restored after the experiment, and no widened table layout was adopted.

## Deprecated and rejected paths

- The old Docxtemplater/PizZip production path was removed after v2 acceptance.
- The old v1 exporter and tracked v1 sanitized template were removed.
- docxtemplater-image-module-free was rejected because of incompatibility and outdated-dependency concerns.
- The paid official Docxtemplater Image Module was not used.
- Moderate-margin appendix experiments were rejected and fully restored.

Historical migration work may be retained in ignored spikes, but it is not active production guidance.

## Safety and dependency rules

- docx-templates remains at version 4.15.0 with its full MIT notice.
- Templates are developer-controlled; users do not upload executable DOCX templates.
- Sandboxing remains enabled. Do not set noSandbox: true.
- No backend, cloud storage, online submission, login, or PDF export was added.
- JSON backup/restore remains separate from DOCX export.

### Template XML maintenance warning

A generic XML serializer rewrote WordprocessingML prefixes from `w:` to `ns0:`. The current DOCX command-processing path depends on the established `w:` command-containing elements, causing template commands to leak into generated exports. Do not mutate active DOCX template XML using a generic serializer that may rewrite prefixes. Use a prefix-preserving OOXML/package workflow and validate a real application export immediately after every template change.

## Regression evidence

The v1.1 regression covered selected-week correctness, no-photo output, JPEG, PNG, WebP conversion, portrait/landscape sizing, captions, 5/6/7-day behavior, warning accept/cancel behavior, command-leak checks, Word opening, LibreOffice conversion, private-template safety, and preservation of Weekly Preview, copy text, dashboard, Daily Logs, photos, backup, restore, and reset.

Phase 2 regression added batch photo sets, shared metadata edits, legacy singleton photos, deletion of first/middle/final images in a set, 1/2/3/4+ image DOCX layouts, one caption per set, no category export, no cross-set row packing, backup/restore compatibility, and Microsoft Word and LibreOffice verification on private and sanitized templates.

**Resolved pagination finding:** Microsoft Word placed the sanitized fallback reflection and signature content on page 2. The page contained legitimate content and was not blank. No DOCX patch was required.

Exported DOCX files remain editable, and manual photo sizing is allowed when needed.
