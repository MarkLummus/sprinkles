---
date: "2026-10-01 10:26"
promoted: false
---

**For Sid** (from Mark, iPad UAT, 2026-10-01): we need to work on the rhythm of the sections. Items like "Every recipe" are not distinguishable from the items within that area.

Context Sarge measured while chasing the note-to-cue gap (not a design, just where to start looking):

- The batch record pen's group cues ("Every recipe", "This recipe only", and the "Any problems?" caption) use the same small-caps caption face as the labels of the items they head, so a group heading reads as one more item. See `.pen-caption`, `.axes-cue`, `.axes-cue--core` and `.axes-cue--declared` in `app/src/styles/app.css` (around the axes grid), and `AxesGrid` and the defects groups in `app/src/ui/BatchRow.jsx`.
- Spacing is part of the same problem. Hicks restored sketch 007's space under the tasting note (`.note-block`: 20px margin plus the board's 12px label space, so about 35px from the textarea to the "Every recipe" cue), but the space between a cue and its own items, and between one group and the next, is not drawn as a deliberate rhythm.
- Sketch 007 is the authority for the pen; sketch 008 for the control sheet. Any change is a sketch decision first (Claude Design canvas, then snapshot into `.planning/sketches/`), then a GSD plan for `app/`.
- Related, not the same: seed SEED-261001-iq4 (recipe-specific tasting measures and failures) will change what sits under "This recipe only", including hiding that label when a recipe defines nothing. Keep the group-heading treatment compatible with an empty "This recipe only" group disappearing.
- Check it on the iPad (WebKit, 1366 landscape, coarse pointer) as well as 393, and measure the real DOM before proposing values.

Scope is Mark's call: this may be the batch pen only, or every sectioned surface (Sheet, recipe band, History and Batches folds).
