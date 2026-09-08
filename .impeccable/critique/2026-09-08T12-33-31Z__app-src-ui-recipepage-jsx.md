---
target: whole recipe page, all states
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:172a4b16ef67737924c8804433778edf00382cc4402b5b2cd9c82cd3ac2f5eb0"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-08T12-33-31Z
slug: app-src-ui-recipepage-jsx
---
**Method: dual-agent (A: general-purpose design-review subagent · B: general-purpose detector/browser subagent)**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Figures and advisories recompute live and every disabled control says why in words. In the pen, the rule heads never strike the parent figure, so "what did my change do" is memory work. |
| 2 | Match System / Real World | 3 | Sheet order, as-made column, "skipped", lowercase units, the maker's own axes. The churn date field says `mm/dd/yyyy` while the page prints "2 Aug 2026". |
| 3 | User Control and Freedom | 2 | Cancel exists in both pens, but Escape does nothing anywhere. "Save batch" and "Cancel" abut with about 4px between them, and batch Cancel drops focus to body. |
| 4 | Consistency and Standards | 2 | Region names are `h2` for table, method and note but `p` for headnote, margin and version strip. The reason field is text face; every other prose field is grotesk. |
| 5 | Error Prevention | 2 | Blocked save in words, unique version line, beforeunload guard. But a grams field holding "4o" keeps computing with the old value and saves it silently. Negative grams are accepted. |
| 6 | Recognition Rather Than Recall | 2 | The pen's Step select at 78px truncates every option to "3. Bu". The batch record sits a full screen below the table it annotates. |
| 7 | Flexibility and Efficiency | 2 | Show-changes is URL-addressable and Back works. No Escape, six rules stay in the tab path while the plan pen is open, and reaching the authored notes by keyboard crosses about 250 controls. |
| 8 | Aesthetic and Minimalist Design | 3 | The reading state is a 4: one heavy element, no chrome, generous gutters. The developing state is a 1. |
| 9 | Error Recovery | 3 | Cross-flags name causes in words. The blocked-save message sits at the top while the offending row is 1500px below and unmarked. |
| 10 | Help and Documentation | 3 | The page explains itself: basis note, "basis:" on every advisory. Nothing more is needed; nothing more exists. |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment.** Authored for this product until the pen opens. The reading state, the batch route and show-changes could not be mistaken for a recipe app or a calculator: hatched bands with a tick, deviation in words, bookcloth running heads, the record in blue beside the plan, a struck step with SKIPPED as text, "date unknown". Recording is half and half: the as-made column and the per-step "Skipped / What did you do differently?" belong to this product, while the margin's six full-width native fields and native buttons are any HTML form. Developing is category-interchangeable: full-width native inputs labelled Lead-in, Instruction, Purpose, Aside, a twelve-checkbox Uses grid on every one of ten steps, native grey buttons, a version-line field 1320px wide. The one authored moment is the grams cell, "~~40~~ 48" in ink and pen.

**Deterministic scan.** CLI detector over the twelve component files: exit 0, zero findings. Browser: 16 findings on reading, batch and recording views, 22 on developing. Discounting extension artifacts (`dark-glow` on the Claude tab border, `text-occlusion` on the extension banner), three families remain:

- `cramped-padding` on the 13 target chips and the current version-strip item. False positives for this world: chips are pinned at zero vertical padding and state is carried by an outline in place.
- `cramped-padding` on 21 `textarea.ink-field` elements in the developing state, 2px vertical padding for 15px text. Real; corroborates the first priority issue.
- `first-viewport-column-overflow` on the recipe article in reading, batch and recording states (column one 165–226% of viewport, column two 40–61%). Real; the mechanical shadow of the finding that the batch record never shares a screen with the table it annotates.

**Visual overlays.** Injection succeeded; overlays shown in the tab titled [Human] Sprinkles critique (15 outlines on the batch reading view). Live server stopped.

## Overall Impression

The reading spread is the product's promise made visible. The moment the pen opens, the recipe disappears and a form arrives. The version brief's thesis was "strike the old value and write the new one beside it"; the grams cells do exactly that, and everything else is the calculator's edit-everything spreadsheet the brief refused. The single biggest opportunity is to make the pen keep the page: prose fields drawn as the printed paragraph, the parent figure struck in the rule heads, and a button treatment so the browser stops painting a fifth colour.

## What's Working

- **The graduated rule.** Value in the figure role, hatch for the band, a 2.5px tick, anchors at the scale's ends, deviation and basis in words, the whole thing a button whose accessible name is the sentence. Tabbing onto PAC outlines the rule and bolds six rows without moving a pixel.
- **The record layer in reading.** Two inks strictly kept: 383 beside 370.4, 0 beside 1.2, SKIPPED as a text sibling of the strike, "unmarked" listed so silence is a value. A child version leaves the churned version and its batch unchanged, verified live.
- **Words carry state everywhere.** Every disabled control has its reason beside it. The stale-amount flag reads "amounts changed: Graza Drizzle 40 → 48 g" under the step that uses it.

## Priority Issues

**[P1] The developing pen is a form, not a page.** `Method.jsx` lines 136–325 render, for all ten steps at once, a lead-in input, an instruction textarea, two inputs per target chip, purpose and aside textareas even when empty, a twelve-checkbox Uses fieldset and a remove button; `Authored.jsx` and `Headnote.jsx` do the same for notes and the headnote. Detector: 21 textareas at 2px vertical padding. Why: the page stops reading as the sheet that prints. Fix: style pen-mode prose fields as the printed paragraph in the text face with no border until focus and auto height; render Purpose and Aside only when the step has text or the maker asks; collapse Uses to one line of names with a "change" control opening the checklist for that step only; give the version-line field and the Cites select the prose measure the reason field already has. Command: /impeccable layout

**[P1] The pen's rules never strike the parent figure.** `RecipePage.jsx` line 1041 passes only `changeDiff` (null while developing), so `GraduatedRule.jsx` never draws the struck old figure or the hollow tick it already supports. Verified live: PAC 24.1 → 23.8 with no strike. Fix: compute a pen diff from the draft against the version, as `Method.jsx` line 93 already does locally, and pass it to the formulation note; set `tabIndex={-1}` on the rules while developing (brief § 6). Command: /impeccable polish

**[P1] Native control chrome breaks the four-colour system.** No `button`, checkbox or `:focus-visible` rule in `app.css`. Live: grey filled rounded buttons, grey disabled buttons, system-blue checked checkboxes, Chrome's blue focus ring inside the ink outline on the version strip, calendar icons and blue segment highlight on both date fields. Fix: binder button in ink at hairline weight with no fill, disabled by dashed stroke; global ink `:focus-visible` outline; checkboxes drawn as the radios already are. Command: /impeccable polish

**[P2] Two-Ink leaks: the system's words painted in the maker's blue.** "was 50 g oil · 800 g" (`Headnote.jsx` line 69) is the parent's own line in pen blue; "unknown" and "unmarked" render inside blue spans in `BatchMargin.jsx` though the batch brief says a blank reads as "unknown" in ink; the split-step suffix in the pen's Step cell (`IngredientTable.jsx` line 191) is printed matter painted blue. Fix: drop the blue class from those sites and wrap only a real recorded value in it. Command: /impeccable clarify

**[P2] Numeric-column arithmetic fails in the pen and show-changes.** The total row wraps to "~~799.7~~ / ~~g~~807.7 g" (struck total keeps its unit; `IngredientTable.jsx` 629–633 vs 123). The Step select at `--col-step: 78px` truncates every option to "3. Bu". In show-changes, Whole milk's Step cell reads a dangling "+ 1" (lines 511–514) and the gum rows read "unallocated" in clean reading but blank in show-changes. Fix: strike the bare number in the total with the unit once and `white-space: nowrap`; widen the Step column while developing via a new token; make the diff step cell print "unallocated" when neither side resolves and suppress the suffix when the primary is absent. Command: /impeccable layout

## Persona Red Flags

**Alex:** No Escape from either pen. No way past 120 Uses checkboxes to the authored notes. Six rules stay in the tab path in the pen. Step allocation illegible until each select is opened. The current version in the strip is a link to itself. The parent figure cannot be seen while editing.

**Sam:** Step numbers `aria-hidden` on an `ol` with `list-style: none`, so no step number is announced. Ten "Skipped" checkboxes and ten "Uses" legends carry no step in their names. Headnote, Margin and Version strip region names are paragraphs, not headings. Every table row carries an `aria-label`, so each row is announced twice. Batch Cancel and Save batch drop focus to body.

**Riley:** "4o" in a grams field: figures use 40, maker sees "4o", Save persists 40 silently. "-5" accepted. Remove all twelve rows and the Formulation note region vanishes, running head included. A mis-click on Cancel beside Save batch discards a full sheet silently.

**Mark (sheet in hand):** Three date grammars in one line ("8/2/2026", "2 Aug 2026", `mm/dd/yyyy` with icon). The churn section sits at about 975px on a 1000px viewport, so the as-made column and draw temperature never share a screen. Numeric margin fields 430px wide for "20", "−6", "?". "Overrun ?" becomes a blank that reads "unknown" in his blue as though he wrote it.

## Cognitive Load

Reading, batch and show-changes pass all eight items. Recording partially fails visual hierarchy and progressive disclosure. Developing fails seven of eight. Interactive elements: 13 reading, ~48 recording, ~261 developing.

## Minor Observations

- Prose in the grotesk: headnote prose field, all step text fields, authored note textareas, draw notes, and the saved batch words "Soft, not greasy"; the saved per-step line uses the text face, so the same kind of sentence changes face between margin and method.
- Native textarea resize grips on every textarea.
- Show-changes toggle: pressed outline and focus outline are identical; same for `is-current` and `is-marked`.
- Adjacent marked rows' outlines overlap the row rule and read as a heavy double rule.
- Version strip "50 g oil · 800 gchurned": the 2px gap reads as one token.
- Headnote prose field sits after Save and Cancel in the tab order.
- "Amend" and "Record another batch" separated only by JSX whitespace.
- Four pen-hint sentences repeat the same clause on one scroll.
- `GraduatedRule.jsx` puts `div` and `p` inside a `button`.
- No breakpoint exists; the grid holds at 1100 and does not stack, against the brief's expectation below 1280. `.batch-margin__list a` has no `color: inherit` and will be browser blue/purple when a second batch appears.

## Questions to Consider

- If the pen must show every field of every step at once, has striking-and-writing-beside become the live spreadsheet the brief refused? What if the only things that changed when the pen opened were the values, not the paragraphs?
- The batch record lives a full screen below the table it annotates. On a churned version, which margin does the table need beside it: the six rules, or the maker's ink?
- "unknown" and "unmarked" are painted in the maker's blue. The system speaking about the record is a third voice. Does it write in ink, in blue, or does it need a rule of its own?
