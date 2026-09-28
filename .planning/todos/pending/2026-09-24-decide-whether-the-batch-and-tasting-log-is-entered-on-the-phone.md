---
created: 2026-09-24T12:30:00.000Z
title: Decide whether the batch and tasting log is entered on the phone, or only transcribed at the desk
area: design
severity: major
files:
  - .impeccable/surfaces/route-recipe.md:69
  - .impeccable/surfaces/route-recipe-batch.md:34
  - .impeccable/surfaces/route-recipe.md:155
  - .impeccable/critique/2026-09-27T18-26-51Z__lanning-sketches-011-recipe-route-c-393-batch-html.md
  - .planning/sketches/011-recipe-route-c/393-batch.html
---

## Deferred — 2026-09-24

Deferred out of 03.5 (Mark, 2026-09-24) to a product brief for phone-based jobs: `.planning/todos/pending/2026-09-24-write-a-product-brief-for-phone-based-jobs.md`. This todo is that brief's first input; 03.5 designs no phone logging.

## Problem

Phone logging is not designed. The recipe brief says "the phone reads and transcribes; it does
not formulate in milestone 1" and gives the phone the same page, read-only in feel, table first.
The batch brief says recording a batch is desktop only, with the phone given no design and no
testing; the maker transcribes the paper sheet's ink at the desk days after churning.

The 03.5 canvas (Sprinkles canvas https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, page
"Recipe route 03.5", board "C · 393 · phone") follows that rule: recipe band, History rail,
the whole Sheet, then the batch and tasting log last. Mark opened it on his iPhone on
2026-09-24 and found the page long for reading, and the log's position a problem if a maker is
expected to enter churn and tasting values on the phone at the machine.

## Solution

Decide in the product brief for phone-based jobs, not in 03.5 and not on the canvas:

- Keep the brief's rule (paper at the machine, transcribe at the desk): the 393 board stands,
  and the length is the recipe itself. Record the decision in the discussion log.
- Or allow phone logging: amend `route-recipe-batch.md` (drop "desktop only"; state what the
  phone captures), then draw a 393 state with a batch in progress that leads with the log or
  jumps to it from the band, and re-check on the device (the served copy at
  http://192.168.1.133:8393/ was the check used today; it is not kept).

Either way the folds on the phone board (Details, Balance, Tasting closed by default;
Carried forward dropped 2026-09-24) stay a narrow-width state; the Sheet reads whole at
desktop and in print.

## Update — 2026-09-27, the 393 Impeccable critique

Mark deferred both items to the phone shaping ("leave it for now"; "leave it as-is for now, we'll shape the phone version later"). They are not part of the decision-18/19 app change. Severity raised to major (Mark confirmed).

1. **P0: the transcribing fields sit about 4 screens deep.** On sketch 011's 393-batch.html (at a true 393 viewport) the batch log starts at y 3,335 and its first measured field at y 3,430, about 3.9 iPhone screens down. It comes after the full Ingredients and Instructions, which the maker is already holding on paper. The options raised:
   - a "Batch" jump link in the band;
   - the log before the Sheet below 724;
   - Ingredients and Instructions folded by default on the phone when a batch is in view (this reopens decision 6).
2. **P1: the phone's only filled action is Next version,** a desktop, formulating action. Record another (Record a batch) is an underlined word at the bottom of the page. The option raised: make the record action the filled one below 724 and demote Next version to a text control.

Related questions from the critique:
- Should "no stored fold state" hold for Tasting at 393, when opening it is the same first tap every visit?
- Is Next version on the phone a feature, or left over from the desktop band?
