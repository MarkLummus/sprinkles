---
quick_id: 260916-ufq
slug: move-the-end-of-record-ceremony-below-th
date: 2026-09-16
mode: quick
authority:
  - .planning/sketches/007-full-battery/index.html (THE DESIGN AUTHORITY — the sketch is edited FIRST; the app follows it, never the reverse)
  - Mark's ruling, 2026-09-16 — the end-of-record ceremony moves BELOW the shared Next time; the sketch rule changes from "after whichever section is last" to "after all record content". Settled; not re-openable by this task.
  - .impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md issue 3 (the origin — the measured tab path Cancel(27), Save batch(28), Next time(29); Cancel/Save top=1297, Next time textarea top=1365)
  - CLAUDE.md §3 (surgical — every changed line traces to the reorder, the sibling rule, the README entry, or a shifted citation)
files_modified:
  - .planning/sketches/007-full-battery/index.html
  - .planning/sketches/007-full-battery/README.md
  - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md
  - app/src/ui/BatchRow.jsx
  - app/src/ui/PenFoot.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/PenFoot.test.jsx
  - app/src/styles/app.css
autonomous: true
must_haves:
  truths:
    - In sketch 007 the shared Next time field precedes the end-of-record ceremony in DOM order, in both the tasting-open and tasting-closed states.
    - In the app's record pen the same is true, so a maker tabbing to the end reaches Next time BEFORE the ceremony's Cancel and Save.
    - The foot ceremony has not moved, and both ceremonies still read "Save batch" — the twin-save redundancy Mark ratified 2026-09-16 is untouched.
    - Sketch 007 is still line-count neutral from line 308 to the end of the file, so every citation of 310-314, 484, 505-510, 542-543, 560-561, 362 still lands where it did.
    - Every live "007 line NNN" citation naming the ceremony, the record-status region, Add tasting, Cancel/Save or Next time points at the element it names in the revised sketch.
    - The vertical rhythm around Next time and the ceremony is unchanged in the sketch (32px / 32px / 32px) and reads only tokens — no px literal enters either file.
  artifacts:
    - "sketch 007 index.html: .next-time-shared at line 301, the ceremony comment at 302, #record-saves at 303-307, line 54's sibling rule re-derived"
    - "sketch 007 README.md: an eleventh-round entry dated 2026-09-16 recording the reversal and what it supersedes at README:203"
    - "app/src/ui/BatchRow.jsx: the Next time label mounted above <SaveCeremony>, carrying batch-margin__field--next-time"
    - "app/src/styles/app.css: .batch-margin__field--next-time { margin-top: var(--gap-l) } — the app's counterpart of sketch line 54"
    - "app/src/ui/BatchRow.test.jsx: the DOM-order inventory assertion flipped, plus one new tab-order test covering both tasting states"
  key_links:
    - "Line 54's rule is ONE line and must stay one line. Reflowing it into two shifts every line from 55 to the end of the file and turns a 15-citation update into a 60-citation one."
    - "The .saves block and the .next-time-shared label are MOVED byte-for-byte. Task 1's verify diffs the moved blocks against a pre-edit copy — a retyped line fails it."
    - ".batch-margin__field--next-time must sit AFTER .batch-margin__field in app.css: equal specificity, so source order is the only thing that makes 32px beat 6px."
    - "Three 007 citations are commit-pinned (007 @ 109733d) and are left verbatim — they name a snapshot, not today's file. Renumbering them would make them false."
    - "The phrases 'above Next time' and 'whichever section is last' become gates. Do not write either into the sketch HTML, app/src, or the skill's structure doc — not even inside a comment explaining the change."
---

# Move the end-of-record ceremony below the shared Next time

Mark's ruling, 2026-09-16. The end-of-record ceremony currently sits above the last
field of the record and before it in the tab path, so a maker who tabs to the end and
presses Enter commits an unrepeatable record without "Next time" — the one field that
carries the product's core value. The ceremony moves below it. Target order:

    …churn / tasting sections… → Next time → ceremony A → [recipe placeholder] → #form-status → foot ceremony

**This was never an implementation defect.** The app faithfully implements sketch 007,
which is this project's single design authority. The sketch's rule was "the ceremony
sits after whichever *section* is last" — and `Next time` is not a section, it is
`.next-time-shared`, a field of the whole record outside both sections, so the rule
placed the ceremony above it by construction. The rule itself is what changes: **after
all record content**, not after the last section.

## How to read this plan

**Authority order is the whole reason for the task ordering.** The sketch is edited
first (Task 1). The citations that address it are corrected second (Task 2). The app is
changed last (Task 3), citing the revised sketch. Never the reverse.

**The line-number contract.** 17 files cite "007 line NNN" roughly 60 times; keeping
those numbers stable while other artifacts cite them is a standing project rule. The
swap is line-count neutral, so **only lines 301-307 and line 54 may change in the
sketch**. Do not reflow, reindent, reformat or rewrap anything else in that file — a
single reflowed line above 308 invalidates every downstream citation at once.

**Moved, not rewritten.** The `.saves` div and the `.next-time-shared` label keep every
attribute, id, class, handler and inner element byte-for-byte. Same for the app's JSX:
relocate the `<SaveCeremony>` element and its comment block; do not re-author them. Only
the sentences that state the superseded placement change.

**Project rules that bind every edit** (`CLAUDE.md`, `.claude/CLAUDE.md`): every visual
value reads through a token — `binder.test.js` already gates `app.css` against bare px
and hex, so the one new rule must read `var(--gap-l)`; agent prose and commit messages
are English; surgical changes only.

**Two phrases are gates.** After this task, `grep -rn 'above Next time\|whichever
section is last'` over `app/src`, the sketch HTML and the skill's structure doc must
print nothing. Do not write either phrase into those files, including inside a comment
that explains the move — say "below the shared Next time" or "after all record content"
instead. (`README.md` is exempt: its round entries are a dated log and history is not
rewritten. `references/batch-record-tasting-battery.md:35` is also exempt — its "above
Next time" is about the melt block, which genuinely still sits above Next time.)

## Discovered at planning

Everything below was measured in the live tree at planning time. Re-observe before
editing; the numbers are a planning-time grep result, not a contract (#3786).

**1. The comment line goes WITH the ceremony, not above Next time.** The naive swap
(leave the comment at 301, Next time to 302, `.saves` 303-307) leaves the ceremony's own
comment describing an element three lines below it, separated by an unrelated field, and
makes ceremony A a non-contiguous citation ("lines 301, 303-307"). Instead the comment
travels with its block: **Next time to 301, the comment to 302, `.saves` to 303-307**.
Equally line-count neutral; everything from 308 keeps its number either way.

**2. The app has no counterpart to sketch line 54, and the move exposes it.**
`.batch-margin__field` carries `margin-top: var(--gap-xs)` (6px) — the rhythm for prose
fields stacking *inside* a section. Today Next time follows the ceremony, so the ceremony
row separates it. After the move it would sit 6px under the melt block (tasting open) or
6px under Ingredient notes (tasting closed), reading as a field *of that section* —
exactly the thing that makes Next time "shared". The sketch has always given it
`var(--gap-l)` (32px) via line 54; the app has always diverged here. Task 3 closes that
gap with one scoped rule. **This is the one design judgment in the plan** — flagged for
Mark; it is one line to back out if he or Impeccable rules otherwise.

**3. Three citations are commit-pinned and must NOT be renumbered.** `PenFoot.jsx:5-8`
(`007 @ 109733d lines 55, 301-306, 310-314, 484` and its continuation `lines 245, 303,
505-510`), `RecipePage.jsx:46-47` (`007 @ 109733d lines 303, 543, 561`) and
`RecipePage.jsx:628` (`007 @ 109733d line 303`). Verified: those numbers are correct at
commit 109733d and stay correct. Renumbering them would make them false. `RecipePage.jsx`
is therefore not in this task's file list at all.

**4. The skill's reference doc carries eight live citations the prompt's list missed,**
because it cites bare "(line NNN)" with no "007" prefix and uses en dashes:
`batch-record-tasting-battery-structure.md` lines 49, 430, 449, 450, 451, 487, 527, 531.

**5. The skill's `sources/007-full-battery/index.html` is a stale pre-tenth-round
snapshot** (1.5px hover borders, a 2px prose baseline). It is NOT edited here — it is
refreshed by `/gsd-sketch --wrap-up`, as the README's ninth round records.

**6. The contract does not conflict.** `.impeccable/surfaces/route-recipe-batch.md:54,60`
says "one ceremony closes the record body" and never states a position relative to Next
time — still true after the move, in fact more true. No brief revision is needed, and
brief revision is Impeccable's job regardless.

**7. `.planning/phases/**` and `.planning/quick/**` PLANs and SUMMARYs are not
renumbered.** They are a historical record of what was true when they were written.

**8. Five existing app assertions must change** — listed in Task 3, each with its reason.
None of them is weakened.

## The line map (sketch 007 index.html)

| Old | Content | New |
|-----|---------|-----|
| 301 | `<!-- end-of-record ceremony … -->` | **302** (reworded) |
| 302 | `<div class="saves" … id="record-saves">` | **303** |
| 303 | `#record-status` live region + `#undo-record-slot` | **304** |
| 304 | `.add-tasting` button | **305** |
| 305 | Cancel + Save batch buttons | **306** |
| 306 | `</div>` | **307** |
| 307 | `<label class="next-time-shared">` | **301** |
| 54 | the `.next-time-shared` sibling rule | 54 (selector re-derived) |
| 308+ | placeholder, `#form-status`, foot ceremony, all JS | **unchanged** |

## Tasks

---

### Task 1 — The sketch: the reorder, the re-derived sibling rule, and the round entry

**Files:** `.planning/sketches/007-full-battery/index.html`,
`.planning/sketches/007-full-battery/README.md`

**Before editing anything,** take the pre-edit copies the verify gate diffs against:

```
cd /Users/mark/Documents/projects/sprinkles
cp .planning/sketches/007-full-battery/index.html "${TMPDIR:-/tmp}/007-before.html"
cp .planning/sketches/007-full-battery/README.md  "${TMPDIR:-/tmp}/007-README-before.md"
```

**1a. Swap the two blocks (lines 301-307).** Read 299-310 live first and confirm the map
above still matches. Then produce exactly this order, with the `.saves` block and the
`.next-time-shared` label moved verbatim — same indentation, same attributes, same inline
`style`, same ids, same handlers, same inner elements:

- **301** — the `.next-time-shared` label, byte-identical to old 307.
- **302** — the ceremony comment, reworded. Keep the `03.3.1 D-01` attribution and the
  "identical to the foot set" clause. Replace the placement clause with the new rule:
  the ceremony sits after all record content, below the shared Next time, in every state,
  and note that this revises the after-the-last-section placement (2026-09-16). One line;
  do not add a second comment line. Do not use the two gated phrases.
- **303-307** — the `.saves` block, byte-identical to old 302-306.

Nothing else in the file is touched. No blank line is inserted or removed.

**1b. Re-derive line 54 — IN PLACE, still exactly one line.** It currently reads:

```
.pen section + .next-time-shared, .pen .saves + .next-time-shared { margin-top: var(--gap-l); }
```

The derivation, from the live CSS and the new element order (`section.churn`,
`section.tasting`, `label.next-time-shared`, `div.saves#record-saves`,
`div.recipe-placeholder`, `p#form-status`, `div.saves`):

- `.next-time-shared` now follows the last **section** in every state, so the FIRST half
  becomes the live match and stays. It matches in the tasting-closed state too: `[hidden]
  { display: none !important }` removes the box, not the element, so the adjacent-sibling
  match is against `section.tasting` either way, and the churn section's zero bottom
  margin means the 32px comes from the label regardless.
- The SECOND half can no longer match anything — no `.next-time-shared` follows a
  `.saves` in the new order — so it comes out. The rule is re-derived, not deleted.
- **No new declaration is needed for the ceremony.** Line 55 already gives every
  `.pen .saves` `margin-top: var(--gap-l)`. The label's own `margin-bottom: var(--gap-s)`
  (12px, from line 34's `label` rule) collapses with that 32px into 32px — sibling margins
  collapse normally here: `.pen` is a plain block, and a flex container suppresses
  collapsing with its *children*, not with its siblings.
- Rhythm, before → after, unchanged at every step: `section` → 32 → `.saves` → 32 →
  `NextTime` → 32 → placeholder becomes `section` → 32 → `NextTime` → 32 → `.saves` → 32
  → placeholder. (`--gap-l` is 32px in both the sketch theme and the app's tokens.css;
  the two scales are identical.)

So line 54 becomes the first half alone, keeping `var(--gap-l)`, with a short trailing
comment naming the 2026-09-16 reversal. **The comment must not name the retired
selector** — the verify gate greps line 54 for `saves + .next-time-shared` and expects
zero hits, so mentioning it in prose fails the gate. No px literal on that line.

**1c. Append an eleventh-round entry to README.md.** Strictly appended after the current
last line (232); nothing above it is edited. Follow the file's existing round style —
`## Eleventh round — <subject> (2026-09-16)`, a short framing paragraph, then
`- **Bold lede.** detail` bullets. It must record:

- The rule change: "after whichever section is last" → **after all record content**, and
  the resulting order (sections → Next time → ceremony A → placeholder → `#form-status` →
  foot ceremony).
- Why: the 2026-09-16 BatchRow critique's P1 — measured tab path Cancel(27), Save
  batch(28), Next time(29); Cancel/Save at top=1297 with the Next time textarea at
  top=1365 — so a maker who tabs to the end and presses Enter commits the record without
  the field that carries the product's core value.
- That this was **not** an implementation defect: the app implemented the sketch
  faithfully, and the old placement fell out of the rule's wording, not from a decision
  that Save should precede the last field.
- That it **supersedes the placement recorded in the ninth round's ceremonies bullet
  (README:203)**, and that the `03.3.1 D-01` / `03.3.1.1 D-14` attribution there is now
  **partially** superseded: the twin ceremonies, their "Add tasting | Cancel | Save batch"
  order, their right alignment, and the single "Save batch" label all stand — only the
  placement relative to Next time changes. The foot ceremony does not move, and the
  twin-save redundancy Mark ratified earlier the same day is untouched.
- The line-number consequence: `.next-time-shared` 307 → 301, the ceremony 301-306 →
  302-307, line-count neutral, everything from 308 unchanged; the live citation set was
  corrected in the same task.
- The CSS consequence: line 54 now reads `.pen section + .next-time-shared` alone; the
  ceremony takes its own 32px from line 55 and the label's 12px bottom margin collapses
  into it, so the rhythm is unchanged.
- That the app gains the 32px separation above Next time that the sketch's line 54 always
  gave it, and that browser confirmation is a separate UAT step.

**Verify:**

```
cd /Users/mark/Documents/projects/sprinkles
F=.planning/sketches/007-full-battery/index.html; B="${TMPDIR:-/tmp}/007-before.html"
R=.planning/sketches/007-full-battery/README.md;  RB="${TMPDIR:-/tmp}/007-README-before.md"

# nothing outside line 54 and the 301-307 window moved or changed
diff <(sed -n '1,53p'   "$B") <(sed -n '1,53p'   "$F") && echo OK-head
diff <(sed -n '55,300p' "$B") <(sed -n '55,300p' "$F") && echo OK-middle
diff <(sed -n '308,$p'  "$B") <(sed -n '308,$p'  "$F") && echo OK-tail

# the two blocks were MOVED verbatim, not rewritten
diff <(sed -n '307p'     "$B") <(sed -n '301p'     "$F") && echo OK-nexttime-moved
diff <(sed -n '302,306p' "$B") <(sed -n '303,307p' "$F") && echo OK-ceremony-moved

# the ceremony's comment travelled with it
sed -n '302p' "$F" | grep -q 'end-of-record ceremony' && echo OK-comment

# the re-derived rule: one live selector, token only, retired half gone, no literal
[ "$(sed -n '54p' "$F" | grep -c 'pen section + .next-time-shared')" -eq 1 ] && echo OK-selector
sed -n '54p' "$F" | grep -q 'var(--gap-l)' && echo OK-token
sed -n '54p' "$F" | grep -q 'saves + .next-time-shared' && echo FAIL-retired-half-present
sed -n '54p' "$F" | grep -qE ':[[:space:]]*[0-9.]+px' && echo FAIL-literal

# line-count neutral, and the gated phrases are gone from the sketch
[ "$(wc -l < "$F")" -eq "$(wc -l < "$B")" ] && echo OK-linecount
grep -n 'above Next time\|whichever section is last' "$F" || echo OK-no-stale-phrase

# README: history untouched, entry appended, and it records what it supersedes
diff "$RB" <(sed -n '1,232p' "$R") && echo OK-readme-history
grep -q '^## Eleventh round' "$R" && echo OK-readme-entry
sed -n '233,$p' "$R" | grep -q '2026-09-16' && echo OK-readme-date
sed -n '233,$p' "$R" | grep -qi 'supersed'  && echo OK-readme-supersedes
sed -n '233,$p' "$R" | grep -q 'D-14'       && echo OK-readme-attribution
```

Every `OK-*` must print; neither `FAIL-*` may. The three `diff`s over `$B` must be
silent. Run this BEFORE committing (after a commit the copies in `$TMPDIR` are still the
pre-edit state, so the gate stays valid either way — but do not delete them until Task 3
is done).

**Then commit** the sketch and the README together —
`docs(quick-260916-ufq): move sketch 007's end-of-record ceremony below Next time`.

**Done:** sketch 007 reads Next time (301), the ceremony comment (302), `#record-saves`
(303-307), and is byte-identical to its previous self everywhere else except line 54 and
that window; line 54 carries one live token-only selector; the README has a dated
eleventh-round entry that names what it supersedes.

---

### Task 2 — The citations: renumber only what actually moved

**Files:** `app/src/ui/BatchRow.jsx`, `app/src/ui/PenFoot.jsx`,
`app/src/ui/BatchRow.test.jsx`, `app/src/ui/PenFoot.test.jsx`,
`.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md`

Re-run the finder first and reconcile against the table below — correct what you find,
not what this plan predicts:

```
grep -rn '007 line' app/src .impeccable .claude/skills .planning/sketches
grep -rnE 'lines? (303|307)([^0-9]|$)|lines? 301[-–]306|lines? 304[-–]306|lines? 302, 310|lines? 304, 311|lines? 305, 312' app/src .claude/skills/sketch-findings-sprinkles/references
grep -rn 'above Next time\|whichever section is last' app/src .claude/skills/sketch-findings-sprinkles/references .planning/sketches/007-full-battery/index.html
```

**Check each hit's MEANING against the revised sketch before renumbering it.** A citation
that names the ceremony must still point at the ceremony, not at whatever now occupies
the old number. A mechanical search-and-replace is wrong here.

**This task renumbers and corrects prose only.** It changes no assertion and moves no
element — Task 3 owns the DOM order, including the placement sentence inside ceremony A's
JSX comment. Where both touch the same comment block, Task 2 fixes the numbers and leaves
the placement sentence for Task 3.

| Site | Now | Becomes | Why |
|------|-----|---------|-----|
| `BatchRow.jsx:735` | `(007 line 303)` | `line 304` | the record-status live region |
| `BatchRow.jsx:748` | `(sketch 007 line 307; …)` | `line 301` | the Next time field |
| `PenFoot.jsx:15` | `(007 line 303; …)` | `line 304` | record-status, unpinned citation |
| `BatchRow.test.jsx:753` | `007 lines 301-306, 484, 505-510` | `302-307, 484, 505-510` | ceremony A incl. its comment |
| `BatchRow.test.jsx:791` | `(007 lines 303, 561; …)` | `304, 561` | record-status |
| `BatchRow.test.jsx:806` | `(007 line 303)` | `line 304` | record-status |
| `BatchRow.test.jsx:900` | `(sketch 007 line 307; …)` | `line 301` | Next time |
| `PenFoot.test.jsx:121` | `(D-14, 007 lines 301-306)` | `302-307` | ceremony A |
| `PenFoot.test.jsx:232` | `(D-14, 007 lines 304-306)` | `305-307` | the ceremony's control rows, uniform +1 |
| skill doc `:49` | "the end-of-record ceremony above Next time" | "…below the shared Next time" | the superseded-note's right-hand side describes today's HTML |
| skill doc `:430` | "the record status (line 303)" | `(line 304)` | record-status |
| skill doc `:449` | "both ceremonies (lines 305, 312–313)" | `(lines 306, 312–313)` | Cancel/Save row |
| skill doc `:450` | "Add tasting (lines 304, 311)" | `(lines 305, 311)` | Add tasting |
| skill doc `:451` | `#record-saves` `(lines 301–306)`; "sits after whichever section is last, just above Next time"; `align-items: baseline` `(lines 302, 310)`; `#record-status` `(line 303:` ; `` `.pen .saves + .next-time-shared { margin-top: var(--gap-l) }` (line 54) `` | `(lines 302–307)`; "sits after all record content, below the shared Next time"; `(lines 303, 310)`; `(line 304:`; `` `.pen section + .next-time-shared { margin-top: var(--gap-l) }` (line 54) `` | the ceremonies bullet, the doc's home for this structure |
| skill doc `:451` lede | "(ninth round; …; unchanged by the tenth)" | "…unchanged by the tenth; placement revised 2026-09-16" | the doc's own provenance idiom; the ONLY provenance marker added |
| skill doc `:487` | `` `.pen section + .next-time-shared, .pen .saves + .next-time-shared` (line 54) ``; "Order at the pen's foot (lines 301–314): the end-of-record ceremony, Next time, …" | `` `.pen section + .next-time-shared` (line 54) ``; "…: Next time, the end-of-record ceremony, …" | the re-derived rule and the order list |
| skill doc `:527` | "one end-of-record ceremony above Next time" | "…below Next time" | span `301–314` is unchanged — correct the prose only |
| skill doc `:531` | "an identical end-of-record ceremony (`#record-saves`) above Next time" | "…below the shared Next time" | same reason as `:49` |

**Left verbatim, each checked (do not touch):**

- `PenFoot.jsx:5-8` — `007 @ 109733d lines 55, 301-306, 310-314, 484` and its
  continuation `(lines 245, 303, 505-510)`. Commit-pinned; true at that commit.
- `RecipePage.jsx:46-47`, `RecipePage.jsx:628` — `007 @ 109733d`. Same. `RecipePage.jsx`
  is not edited by this task.
- `RecipePage.jsx:632` — `(line 309)`, `#form-status`, still at 309.
- `PenFoot.jsx:66`, `PenFoot.test.jsx:146` — `007 lines 310-314`, the foot ceremony, unmoved.
- `PenFoot.test.jsx:242` — `007 lines 245, 505-510`.
- `BatchRow.jsx:368`, `RecipePage.jsx:1231,1235` — `542, 543, 560, 561`.
- `app.css` (lines 55, 172, and the `@ 2a212be` pin), `tokens.css`, `binder.test.js`,
  `cross-cutting.test.js`, `Segmented*`, `AxisMark.jsx`, sketches 008/009 — all outside
  the 301-307 window.
- `.claude/skills/sketch-findings-sprinkles/sources/007-full-battery/index.html` — a
  pre-tenth-round snapshot; `/gsd-sketch --wrap-up` owns it.
- `references/batch-record-tasting-battery.md:35` — "above Next time" describes the melt
  block, which still is.
- `.planning/phases/**`, `.planning/quick/**` — historical record.

The skill doc's edits are **in-place substring replacements**: do not rewrap or reflow
any line (two artifacts cite that file by line number), and add no new lines.

**Verify:**

```
cd /Users/mark/Documents/projects/sprinkles
D=.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md

# no stale live pointer survives; RecipePage.jsx excluded — its two window citations are
# commit-pinned to 109733d and its `line 309` is unaffected
grep -rnE 'lines? (303|307)([^0-9]|$)|lines? 301[-–]306|lines? 304[-–]306|lines? 302, 310|lines? 304, 311|lines? 305, 312' \
  app/src "$D" | grep -v 'RecipePage.jsx' || echo OK-no-stale-citation

# the gated phrases are gone from the three scopes that must not carry them
grep -rn 'above Next time\|whichever section is last' \
  app/src "$D" .planning/sketches/007-full-battery/index.html || echo OK-no-stale-phrase

# the pinned citations are still intact, all three of them
[ "$(grep -rc '109733d' app/src/ui/PenFoot.jsx)" -eq 1 ] && echo OK-pin-penfoot
[ "$(grep -rc '109733d' app/src/ui/RecipePage.jsx)" -eq 2 ] && echo OK-pin-recipepage

# the new numbers are actually present where they belong
grep -q 'line 304' app/src/ui/PenFoot.jsx && echo OK-penfoot-304
grep -q 'line 301' app/src/ui/BatchRow.jsx && echo OK-batchrow-301
grep -q 'lines 302-307' app/src/ui/PenFoot.test.jsx && echo OK-penfoot-test
grep -q 'pen section + .next-time-shared' "$D" && echo OK-skill-rule
grep -q 'saves + .next-time-shared' "$D" && echo FAIL-skill-retired-half

# nothing else changed shape: the skill doc keeps its line count
[ "$(wc -l < "$D")" -eq "$(git show HEAD:"$D" | wc -l)" ] && echo OK-skill-linecount

npm --prefix app test
```

Every `OK-*` prints, no `FAIL-*`, suite green (the suite must still pass at this point —
Task 2 changes only describe/it strings and comments).

**Then commit** — `docs(quick-260916-ufq): renumber the sketch 007 citations the ceremony
move shifted`.

**Done:** every live citation of the 301-307 window names the element it points at in the
revised sketch; the three commit-pinned citations are untouched; the skill's structure doc
states the new order and the re-derived rule; no file changed line count.

---

### Task 3 — The app: Next time above the ceremony, and the tab path proven

**Files:** `app/src/ui/BatchRow.jsx`, `app/src/styles/app.css`,
`app/src/ui/BatchRow.test.jsx`

**3a. Move the Next time block above the ceremony** (read `BatchRow.jsx` 720-770 live
first; these were lines 724-769 at planning time). New order inside the `mode ===
'recording'` branch:

1. the Next time comment (748-750) + its `<label>` (751-763)
2. the ceremony A comment (724-737) + `<SaveCeremony … />` (738-747)
3. the form-status comment (764-766) + `<p className="form-status">` (767-769)

Relocate the elements verbatim: every prop, ref, ternary, `aria-label`, `dir`, `rows`,
`placeholder`, `onChange` and `onInput` unchanged. Comments travel with their elements.

Two comment sentences change, and only these two:

- **Ceremony A's opening sentence** — replace "after the tasting section when it is open,
  after the churn section when it is not, just above the shared Next time" with the new
  rule: the ceremony closes the record body after all record content, below the shared
  Next time, in every state (placement revised 2026-09-16, sketch 007's eleventh round).
  Everything after it — the hint sentence, Add tasting, Restore tasting, the status
  region, the refs — stays verbatim (with Task 2's corrected numbers). Do not write either
  gated phrase.
- **form-status' comment** stays as it is: it is still the record body's last element,
  still directly above PenFoot's ceremony B. Both claims survive the move.

**3b. Give the relocated field the sketch's own separation.** The Next time label takes a
second class and app.css gains one rule — the app's counterpart of sketch line 54, which
the app has never had:

- `app/src/ui/BatchRow.jsx`: `className="batch-margin__field batch-margin__field--next-time"`.
- `app/src/styles/app.css`: immediately **after** the `.batch-margin__field` rule (line
  1429 at planning time), a `.batch-margin__field--next-time { margin-top: var(--gap-l); }`
  rule with a short comment citing sketch 007 line 54's re-derived selector and naming why
  Next time is not a field of either section. **Source order is load-bearing**: equal
  specificity, so the modifier must come after the base rule or 6px wins. Token only — no
  literal (`binder.test.js` gates this). The `@media (max-width: 600px)`
  `.batch-margin__field` rule sets only `font-size`, so nothing overrides it at any width.

**3c. The five assertions that change, each with its reason.** None is weakened.

1. `BatchRow.test.jsx:230` — `expect(nextTimeIndex).toBeGreaterThan(ceremonyIndex)` is the
   old order asserted directly. **Flip it** to `expect(ceremonyIndex).toBeGreaterThan(nextTimeIndex)`
   and **add** `expect(nextTimeIndex).toBeGreaterThan(ingredientNotesIndex)` so the chain
   stays unbroken from the churn date to the ceremony (a strengthening, not a swap).
2. `BatchRow.test.jsx:202` — the `it` name ends "…the two textareas, then ceremony A, in
   that DOM order". Rename to put the shared Next time between them. A name, not an
   assertion, but it is the contract a reader trusts.
3. `BatchRow.test.jsx:829-831` — the form-status test still passes unchanged
   (`formStatusIndex > nextTimeIndex` is still true). **Add** `expect(formStatusIndex)
   .toBeGreaterThan(ceremonyIndex)` so the new order is pinned at both ends rather than
   only above.
4. `BatchRow.test.jsx:903` — asserts `<label class="batch-margin__field">` verbatim for
   Next time, which 3b changes. Update to the two-class string
   `class="batch-margin__field batch-margin__field--next-time"` — more specific, so it
   still pins what it pinned plus the new modifier.
5. **New test** (the point of the whole task): in the same `describe` as (1), one `it`
   proving the tab path in **both** tasting states. For `tastingOpen: true` and
   `tastingOpen: false`, render and assert
   `nextTimeIndex < ceremonyIndex < cancelIndex < saveIndex`, taking `cancelIndex` and
   `saveIndex` with `markup.indexOf('Cancel', ceremonyIndex)` /
   `indexOf('Save batch', ceremonyIndex)` so they are the ceremony's own controls. Name it
   for what it protects: Next time is reached before the ceremony's Cancel and Save in
   both states. In the test's own comment, record why DOM order is tab order here — no
   element in the record pen carries a tabIndex override, so the browser's sequential
   order is the DOM order — and that the browser confirmation is UAT, not this gate. That
   note goes in the TEST file, not in `BatchRow.jsx` or `PenFoot.jsx`: the verify greps
   those two for `tabIndex` and expects none.

No other `ceremonyIndex` assertion changes: `:308` (after the tasting eyebrow), `:369` and
`:659` (after Ingredient notes / the melt block) are all still true, and the four
`lastIndexOf('class="save-ceremony"')` tests at `:756-786` read within the ceremony only.

**Verify:**

```
cd /Users/mark/Documents/projects/sprinkles

# the app's DOM order, both states, plus every other suite
npm --prefix app test

# DOM order is tab order: no tabIndex override in the pen's two components
grep -n 'tabIndex' app/src/ui/BatchRow.jsx app/src/ui/PenFoot.jsx || echo OK-no-tabindex

# the separation rule exists, reads the token, and sits after the base rule
grep -A4 'batch-margin__field--next-time {' app/src/styles/app.css | grep -q 'margin-top: var(--gap-l)' && echo OK-rule
[ "$(grep -n '^\.batch-margin__field {'          app/src/styles/app.css | head -1 | cut -d: -f1)" \
  -lt "$(grep -n '^\.batch-margin__field--next-time {' app/src/styles/app.css | head -1 | cut -d: -f1)" ] && echo OK-source-order
grep -A4 'batch-margin__field--next-time {' app/src/styles/app.css | grep -qE ':[[:space:]]*[0-9.]+px' && echo FAIL-literal

# the JSX order actually changed (Next time's label precedes the ceremony element)
[ "$(grep -n 'batch-margin__field--next-time' app/src/ui/BatchRow.jsx | head -1 | cut -d: -f1)" \
  -lt "$(grep -n '<SaveCeremony' app/src/ui/BatchRow.jsx | head -1 | cut -d: -f1)" ] && echo OK-jsx-order

# the gated phrases stayed out
grep -rn 'above Next time\|whichever section is last' app/src || echo OK-no-stale-phrase
```

Every `OK-*` prints, no `FAIL-*`, and `npm --prefix app test` is green with the new
tab-order test present (not skipped).

**Then commit** — `fix(quick-260916-ufq): mount Next time above the end-of-record
ceremony`.

**Done:** in the record pen, Next time renders before ceremony A in both tasting states,
with 32px of separation above it; the form-status region is still last; the suite is green
with one new test pinning the tab path and four updated assertions, each traceable to the
reorder.

---

## UAT — browser confirmation (after the task, not a gate)

Deferred deliberately: the plan gates are DOM-order assertions, which are cheaper and
more stable than a measurement. For Mark or a later Impeccable pass:

1. At `/recipe/olive-oil-ice-cream-v1`, open the record pen and Tab to the end of the
   record. Confirm the order is Next time → Cancel → Save batch, tasting open and tasting
   closed.
2. Confirm the 32px above Next time reads as a record-level boundary and not as a field of
   the tasting — this is the one design judgment in the plan (Discovered at planning, item
   2) and the one line to back out if it reads wrong.
3. Confirm in the sketch tab too, hard-reloaded (port 8077 sends no cache headers).
4. Not addressed here, still open from the critique: the silent save and the blocked
   save's off-screen sentence (issues 1 and 2).

## Success criteria

- [ ] Sketch 007 reads Next time (301), the ceremony comment (302), `#record-saves`
      (303-307); byte-identical elsewhere except line 54.
- [ ] Line 54 is one line, one live selector, `var(--gap-l)`, no literal, no mention of
      the retired half.
- [ ] README has an eleventh-round entry dated 2026-09-16 naming what it supersedes at
      README:203, appended with no edit above it.
- [ ] Every live 301-307 citation renumbered by meaning; the three commit-pinned
      citations untouched; no file changed line count.
- [ ] The app renders Next time before ceremony A in both tasting states, proven by a
      test, with the form-status region still last.
- [ ] `npm --prefix app test` green; four updated assertions and one new test, each
      traceable to the reorder; no assertion weakened.
- [ ] Three commits, in authority order: sketch → citations → app.

## Output

`.planning/quick/260916-ufq-move-the-end-of-record-ceremony-below-th/260916-ufq-SUMMARY.md`
— recording the final citation set as corrected, the re-derived selector and its
reasoning, the assertions changed, and the two items flagged for Mark (the 32px app-side
separation; whether the three commit-pinned citations should ever be repinned to the
revised sketch).
