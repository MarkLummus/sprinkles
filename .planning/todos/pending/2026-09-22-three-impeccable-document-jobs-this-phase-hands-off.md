---
created: 2026-09-22T01:05:44.000Z
title: Confirm the app text companions and the filled action in DESIGN.md (/impeccable document)
area: design
owner: impeccable
severity: minor
files:
  - DESIGN.md
---

**This is an `/impeccable document` job.** No GSD plan edits `DESIGN.md`; recorded here so the
follow-up is not lost, not so a GSD task picks it up.

Started as three follow-ups from Phase 03.4. Cleaned up 2026-10-05: jobs 1 and 3 are done, one remains.

## What remains

**The five `app-*-text` companions and the filled action wait on Mark seeing them in the real
app (D-19).** They ship as tokens and colour the rail's place names and each row's place name,
but DESIGN.md keeps them marked "tentatively approved 2026-09-21" until confirmed live. Mark has
passed the Notebook companion (UAT test 5). The other four (Recipe Book, Idea log, Ingredients,
App blue) and the filled action are still tentative.

Once Mark has reviewed the shell rail and Home's rows at 1280px and 393px, this is an
`/impeccable document` pass to confirm or revise those four companions and the filled action's
colour.

Run it in the same session as Mark's List row `run-impeccable-surface-removal` (amending the
recipe surface brief's "removal never cascades"). They are separate jobs but the same command.

## Done, kept for the record

1. **The Hand entry leaving pending (D-17):** done in `8024cfe` (2026-10-02). Mark passed the
   forced-colors and print fallback at UAT round two (test 2); DESIGN.md now reads "approved
   2026-09-21, built in Phase 03.4".
2. **`route.md` calling the shared action colour open:** done in the same commit. Section 3, the
   OWN-WORLD line and section 5 no longer call it open; DESIGN.md governs.

## Related

- 03.4-CONTEXT.md decisions D-17, D-19.
- `.planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-02-SUMMARY.md`,
  `03.4-03-SUMMARY.md`, `03.4-04-SUMMARY.md` — the end-of-phase UAT windows the remaining job waits on.
