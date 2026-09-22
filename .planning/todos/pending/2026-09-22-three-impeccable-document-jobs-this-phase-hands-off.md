---
created: 2026-09-22T01:05:44.000Z
title: Three /impeccable document follow-ups this phase hands to Impeccable, not code
area: design
owner: impeccable
severity: minor
files:
  - DESIGN.md
  - .impeccable/surfaces/route.md
---

**These are `/impeccable document` jobs.** No GSD plan edits `DESIGN.md`; recorded here so
the three follow-ups this phase's build surfaces are not lost, not so a GSD task picks them
up.

## The three follow-ups

1. **DESIGN.md's Hand entry can leave *pending* (D-17).** The hand's four tokens and the
   `.app-hand` role class shipped in plan 02, with the `forced-colors: active` and print
   fallback (the text face, in italic) added to `app.css`'s existing blocks. D-17 says the
   Hand entry leaves pending once the two-mode fallback has been seen — that verification
   is named an end-of-phase UAT window in 03.4-02's and 03.4-04's own `<verification>`
   sections. Once Mark has seen both fallbacks confirmed, this is an `/impeccable document`
   pass to lift the entry out of pending.

2. **The five `app-*-text` companions and the filled action wait on Mark seeing them in the
   real app (D-19).** They ship as tokens (plan 01) and colour the rail's place names
   (plan 03) and each row's place name (plan 04), but D-19 keeps them marked tentative in
   DESIGN.md until confirmed live. Once Mark has reviewed the shell rail and Home's rows at
   1280px and 393px (also named as end-of-phase UAT windows across plans 03 and 04), this is
   an `/impeccable document` pass to confirm or revise the five companions and the filled
   action's colour.

3. **`route.md` still describes the shared action colour as open while DESIGN.md governs.**
   `.impeccable/surfaces/route.md` § 5 has not been brought level with DESIGN.md's App marks
   section and its filled-action decision — a pre-existing gap this phase's build does not
   close (route.md is Impeccable's file, not GSD's). Bringing the two documents into
   agreement is an `/impeccable document` pass.

## Why this is one todo, not three

All three are the same kind of work (an `/impeccable document` pass reconciling DESIGN.md/
route.md against what Mark has now seen built) and depend on the same event — Mark's
end-of-phase UAT of Phase 03.4's Home, shell and hand fallbacks. Splitting them into three
files would not change who does the work or when.

## Related

- 03.4-CONTEXT.md decisions D-17, D-19.
- `.planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-02-SUMMARY.md`,
  `03.4-03-SUMMARY.md`, `03.4-04-SUMMARY.md` — the end-of-phase UAT windows each plan
  deferred, which this todo's three items wait on.
