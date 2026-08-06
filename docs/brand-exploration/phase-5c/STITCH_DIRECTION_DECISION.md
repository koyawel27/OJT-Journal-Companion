# Stitch Warm Journal Direction Decision

## Status

Selected visual direction for the accepted Phase 5C Journal workspace and Phase 5D Daily Log Editor redesigns.

The reviewed source package was `stitch_ojt_journal_companion.zip`, dated July 22, 2026. It contained Dashboard, Journal, Daily Log Editor, Preview & Export, Settings, logo, and Warm Journal design-system references.

The source package remains a visual reference. Its prototype HTML is not production application code.

## Selected direction

Adopt the Stitch **Warm Journal** direction as a refined production expression of Concept A — Rising Rule.

The selected identity combines:

- a structured journal page;
- two restrained journal rules;
- one final rule that rises gently;
- warm paper-like Light surfaces;
- earth-brown structural anchors;
- muted olive progress cues;
- quiet tonal layering instead of strong decoration; and
- rounded, professional controls and cards.

The official product name remains **OJT Journal Companion**. The official tagline remains **Record the work. Reflect on the journey.**

## Production translation

The production app will translate the direction into its existing HTML, CSS, and vanilla JavaScript architecture.

- Preserve all existing IDs, data attributes, form names, accessibility relationships, and script wiring.
- Preserve the four production destinations and their functional contracts; the accepted Phase 5C Journal presentation uses a compact responsive shell, mobile bottom navigation, and a floating wider-screen dock rather than a permanent desktop sidebar.
- Preserve System, Dark, and Light appearance behavior.
- Preserve the complete accepted Dark theme; the Stitch Light palette informs Light-theme refinement.
- Keep the approved system font stack.
- Use local SVG identity and navigation artwork.
- Use one restrained page-fold detail as a signature, not repeated decoration.
- Keep cards readable and work-ledger oriented.

## Explicitly not adopted

The following Stitch prototype implementation details are not production requirements:

- Tailwind CDN;
- Google Fonts fetches;
- Material Symbols fetches;
- mock button, theme, accordion, ripple, and export scripts;
- placeholder Vue, Pinia, or authentication copy;
- the shortened `OJT Companion` interface label;
- prototype-only mobile navigation links;
- incomplete Dark-theme classes; and
- replacement of working application workflows with static markup.

## Asset decision

The production mark is a refined local SVG based on Concept A and the Stitch silhouette.

- `app/assets/brand/brand-mark.svg` is the scalable master mark.
- `app/assets/brand/favicon.svg` is the simplified small-size mark.
- The interface uses accessible text alongside or near the mark.
- No rasterized wordmark or remote asset is required.
- PWA install icons remain Phase 6 work.

## Protected boundaries

This visual integration does not change:

- IndexedDB stores, schema version, or migration behavior;
- JSON backup and restore format;
- Weekly Preview, Copy Weekly Journal, or Official DOCX Export behavior;
- private institutional template handling;
- application routing, section targets, or task and journal data flows; or
- deployment, PWA, authentication, or cloud-sync scope.

