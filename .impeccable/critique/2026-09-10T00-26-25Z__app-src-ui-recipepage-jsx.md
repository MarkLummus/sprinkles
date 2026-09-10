---
target: whole recipe page, all states, re-run after the focus fix and the grams guards
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 4
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:08d4e91dc159aa01ec6b0fcdd89bd2e59c6b82ac25447e26ba697da01f5d28f2"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-10T00-26-25Z
slug: app-src-ui-recipepage-jsx
---
**Method: dual-agent (A: general-purpose design-review subagent · B: general-purpose detector/browser subagent)**

Re-run of the 2026-09-09T11-54-37Z snapshot (28/40) after five commits: the focus-on-open fix (`7f50ae9`), `parseGramsDraft` (`e3efbdd`, `be86eb5`), and the zero-floor guards (`84c915b`, `66d0849`).

## Design Health Score

| # | Heuristic | Prior | Now | Key Issue |
|---|---|---|---|---|
| 1 | Visibility of System Status | 3 | **2** | Nothing renders until IndexedDB resolves — no loading state at all — and a grams field holding `-5` strikes the printed `40` while every figure silently goes on using `40`, with no message until Save. |
| 2 | Match System / Real World | 4 | 4 | Still the binder's words. Held at 4, but the vocabulary Mark settled on 2026-09-09 is unshipped: the page still says Come-up, Overrun, Draw notes, Meltdown at 20 min, DATA, ADVISORIES. |
| 3 | User Control and Freedom | 3 | 3 | Escape and focus return verified on all three pens; focus after **Save** lands on `<body>`, and the current version's strip entry is still a link to the page you are on. |
| 4 | Consistency and Standards | 2 | 2 | Every prior item stands verbatim, plus `declaredAxes` shape drift. |
| 5 | Error Prevention | 3 | 3 | `-5` no longer moves the live figures — but `.5` and `45.` are refused with "amount is not a number", which is false, and the refusal is invisible until Save. |
| 6 | Recognition Rather Than Recall | 2 | 2 | Draw notes / Ingredient notes / Next time are still three 457x17px borderless, placeholder-less, label-less inputs in 89px of blank paper. |
| 7 | Flexibility and Efficiency | 3 | **4** | **Moved.** Focus-on-open gone; the six rules now carry `tabindex="-1"` in the pen as the brief required; one hint sentence per pen instead of four. |
| 8 | Aesthetic and Minimalist Design | 2 | 2 | 32 method buttons, 16 chips at 376px, 10 bands at 892px, an 830px outlined `li`, 5x "uses nothing yet" — all measured unchanged. |
| 9 | Error Recovery | 3 | 3 | Sentences name the row and say what to do; the version-line block still masks every grams block, so errors surface one Save at a time. |
| 10 | Help and Documentation | 3 | 3 | Basis lines and anchors everywhere; nothing explains "uses"; two axes ship with no name and no anchors at all. |
| **Total** | **28** | **28/40** | **Good** |

**The score did not move.** One heuristic up, one down. Seven went up for exactly the work the five commits did — the P0 is genuinely fixed. One went down for a status gap neither prior run had looked for. Everything else is measured unchanged.

## Design Specificity Verdict

**LLM assessment.** The reading state remains unmistakably this product's: the book spread, Georgia against grotesk tabular figures, four colours and no fifth, six rules stating deviation in words, "trace" in the share column. The proof is still the trace — focusing the fat rule bolds and outlines its four contributing rows in place, nothing moving, nothing changing hue. The developing state is the same half-and-half as a week ago, and the split has not moved: the table is the page with a pen on it (`40` struck before a blue `48`, the total struck, the fat rule reading `18.0% 18.8%`), while the method column is a form of 32 bordered buttons, chips swollen to 376px field pairs, and twelve selects that clip their own labels. The pen more than doubles the document — 1833px reading to 3761px developing, with the method alone 2566px of it.

**Deterministic scan — a correction to the record.** The CLI detector returned exit 0, zero findings, as it did last week. That is a **null result, not a clean bill**: Assessment B verified the detector against controls and found it emits nothing whatsoever for `.jsx` — a deliberately broken JSX control produced 0 findings while the identical faults in HTML produced 2. The previous critique reported this same exit 0 as evidence of cleanliness. It never was. All static evidence here comes from the in-page detector, which found 15 / 15 / 2 / 13 across the four views; discounting this world's conventions (chips and the strip item pinned at zero vertical padding, `em-dash-overuse` counting authored recipe prose, `line-length` estimated from box width), the only real family left is `first-viewport-column-overflow` on the reading and batch states.

**A second correction.** Assessment B reported that pen blue paints nowhere in any view. Checked directly: `.ink-field`, `.prose-field`, `.ink-text` and `.prose-text` all compute to `rgb(31, 61, 122)`. That was an enumeration artifact, not a finding. Every value that actually paints resolves to a token.

**Visual overlays.** The in-page detector ran in a `[Human]`-labelled tab across four views; that tab and the live server on port 8400 were both closed before reporting.

## Overall Impression

The five commits did what they said. The P0 is fixed at the right level — an `openedByUser` ref in `Method.jsx:47`, not a scroll patch — and Develop now lands on the version-line input at `scrollY 0`. But the score sits still, and the reason is worth more than the number: **the design record moved much further than the code did this week.** Since the last snapshot Mark settled the page's entire vocabulary (13:31), and sketch 003 closed with him choosing rows across the whole page, the table in step order, and — answering the last critique's own question — a read-only method in the pen with one "edit this step" text control per step. None of that is built. The three P1s that "remain" below are not unanswered design questions any more; they are approved decisions waiting for a plan. The single biggest opportunity is no longer critique. It is `/impeccable shape route:/recipe` against sketch 003's handoff, then a phase.

## What's Working

- **The rule-to-row trace.** Focusing a figure marks exactly its contributing rows in bold plus a 1px ink outline offset 2px — `Total fat` marks four rows — and nothing moves, because the table's fixed layout and 1.2 leading were settled first. It carries meaning in the page's own structure, so keyboard, screen reader and print read the same fact.
- **Strike-and-beside under live edit.** One keystroke over `40` produces struck `40` before the blue field, struck `5.0%` before `5.9%`, struck `799.7` before `807.7 g`, the fat head reading `18.0% 18.8%`, and an accessible name of "was 40 g, now 48 g". It is the binder's own convention — six of Mark's 29 sheets carry hand-overwritten grams — not a diff viewer borrowed from software.
- **The P0 fix is made in the right place.** The focus effect now fires only for a field the maker's own press opened, with a comment stating why. Alongside it the six rules left the pen's tab path, closing a build gap the brief had named twice.

## Priority Issues

**[P0] Two of the six tasting axes ship with no name, no anchors, and one shared radio group.** `398d822` (2026-09-06) changed `declaredAxes` in the seed from `['Olive oil character', 'Bitterness']` to `{name, low, high}` objects. `liftVersionRecord` never lifts that field — while lifting the *identical* string-to-object drift for authored notes twelve lines above it, in `liftAuthoredNote`. `VERSION_SCHEMA_VERSION` stayed at 2, so no migration runs. `axes.js:34` then reads `axis.name` off a string. Measured live before the fix: two empty `<legend>`s, `role="group" aria-label="undefined, undefined to undefined"` twice, and `document.querySelectorAll('input[name="axis-undefined"]').length === 18` — both axes are one native radio group, so marking the second clears the first, and both marks land in `marks[undefined]`. Why it matters: PRODUCT.md's milestone-1 working case *is* this batch — oil character 4.5, bitterness 5, sweetness 4. On any profile carried forward from Phase 1, which is precisely the case the lift exists for, two of those three lines cannot both hold a mark. Fix: lift `declaredAxes` in `liftVersionRecord` (map string `s` to `{name: s, low: null, high: null}`, idempotent by `typeof`), bump `VERSION_SCHEMA_VERSION` and `DB_VERSION` in lockstep, and lift `batch.snapshot.declaredAxes` too; make an axis with no resolvable name fail loudly rather than render. Command: /impeccable harden

**Note on reproducibility:** Assessment A wrote the corrected object shape into the local dev database while investigating, so this machine's store no longer reproduces the bug. It reproduces on any profile seeded before `398d822`.

**[P1] An unreadable grams value strikes the old number and then quietly uses it.** `parseGramsDraft` returns `null` for anything but `/^\d+(\.\d{1,2})?$/`, and readers fall back with `?? row.grams` — but the strike is decided by a raw string comparison at `IngredientTable.jsx:591`. So `-5`, `4o`, `.5` and `45.` each render `~~40~~ -5` with every figure still reading 40 and **no message anywhere** until Save. The fallback is the *parent's* value, not the last good one: type `48`, then edit to `4o`, and the fat figure jumps backwards from 18.8% to 18.0% while the field shows the maker's own edit. `.5` and `45.` are legitimate transcriptions from a 0.01 g scale, and the sentence they eventually get calls them "not a number". Fix: decide the strike with `parseGramsDraft`, not the raw string; show the blocked-save sentence live beside the row instead of only after Save; accept `.5` and `45.` and normalise on blur. Command: /impeccable harden

**[P1] The pen's method column is still a form — every measurement identical.** 32 bordered buttons in `.method-region`, four per step, each on its own line because `.method-step__on-demand { display: block }`. Sixteen chips at 376px holding two 180px fields, because `app.css:844` `width: auto` is still defeated by `app.css:1094` `width: 100%` — same specificity, later in source, unchanged. "uses nothing yet" x 5. Twelve selects clipping: 124px of box for a 268px label. Ten "done differently" bands at 892px in the batch pen. **This is no longer an open question:** sketch 003's handoff records Mark's decision of 2026-09-09 — the method opens read-only in the pen with one "edit this step" text control per step. Command: /impeccable quieter, after shape

**[P1] The batch margin's three prose fields are invisible.** Draw notes, Ingredient notes and Next time render as an empty `<label>` around a borderless `.prose-field` with no visible text and no placeholder — three 457x17px inputs in 89px of blank paper between Overrun and ADVISORIES. `route-recipe-batch.md` section 6 requires a visible label on every field. The outline-on-focus-only rule was decided for prose the maker is *re-writing*, where a printed paragraph already holds the place; a blank line the maker must find has nothing standing in for it. Mark has "Soft, not greasy" in his hand and 89px of nothing on the screen. Fix: a small-print label word above each empty field, or a hairline baseline rule until it holds text — the way the printed batch-log page rules its lines. Command: /impeccable clarify

**[P1] The settled vocabulary is unshipped.** Mark settled the recipe page's labels on 2026-09-09 at 13:31, after the last critique ran at 11:54. Nothing landed: the page still reads Advisories (-> Things to check), Version line (-> Version), Cites (-> From batch), Reason (-> Why), Parent (-> From version), Develop (-> Next version), Amend (-> Correct), Come-up (-> Time to temperature), Overrun (-> Air), Draw notes (-> At the machine), Words (-> How did it turn out?), Meltdown at 20 min (-> Melt test), Data (-> Source). This is product authority, not taste. Command: /impeccable clarify

**[P2] No loading state, and a store that hangs shows a blank page forever.** `main.jsx:10` top-level-awaits `seedIfEmpty` before the first render, and its `catch` writes a message only on *rejection*; `db.js:10` registers no `blocked`, `blocking` or `terminated` handler on `openDB`. So nothing renders until IndexedDB resolves, and if it never resolves the page stays literally empty with no text at all. Observed once: `indexedDB.open('sprinkles')` pending after 5s with no `success`, `blocked` or `error` event, `#root` empty. Not reproducible afterwards — two concurrent tabs load fine, so the trigger was transient store contention, not concurrency as such. The mechanism is code-verified regardless. Command: /impeccable harden

## Persona Red Flags

**Alex (power user).** The 2757px scroll on every Develop is gone. But three save-shaped controls whose labels do not distinguish them (`Save as` / `Save`), repeated again at the foot; 154 focusables in the pen; the version-line block still masking every grams block so errors surface one Save at a time; the current version's strip entry still a link to the page he is standing on, which the brief forbids in terms. He types `.5` for half a gram and gets nothing, twice.

**Sam (screen reader, keyboard).** Real gains: Escape and focus return on all three pens; the rules out of the pen's tab path; the churn and tasting date inputs now carry visible `<span>` labels and real accessible names. Remaining: the `Batch` and `Tasting` legends are still `<p>`, so the record is absent from the H1-to-five-H2 outline the brief requires; the tasting date is announced twice under one name for two different controls; a grams field holding `-5` announces "was 40 g, now -5 g" for a value the page has discarded; and two axis groups announce "undefined, undefined to undefined".

**Riley (stress tester).** `999999 g` clips the total cell (`scrollWidth 130` inside `width 94`) against section 6's "never wraps". `-5`, `4o`, `.5`, `45.` all sit struck-beside with no complaint. In the *batch* pen `-5` moves the as-made total to 424.3 g while `4o` is silently ignored — the open decision recorded in `6af7a6e`, measured but not scored. Below ~1146px the name column collapses; at 390 the page overflows by 268px reading and 475px developing, with no breakpoint — documented Phase 4 work, not scored.

**Mark, at the kitchen table in the evening.** Reading, the screen is the sheet; this is still the best hour of the product. Developing, he now lands on the version line where he should, changes 40 to 48, watches four figures answer — then scrolls past a hundred controls to reach Save. Recording, he reaches the margin with "Soft, not greasy" in hand and finds blank paper. Adding the tasting a day later, he marks oil character 4.5 and bitterness 5 on two unlabelled rows, and the second mark erases the first. And every label he settled on 2026-09-09 is still the old word.

## Minor Observations

- A row typed to exactly `0 g` reads **"trace"** in the share column (`composition.js:82` tests `share < 0.05` with no zero branch). The batch brief is explicit that "0 is a written value and reads as one".
- Step 10's number column is 22px against 11px for steps 1-9, so its body indents 11.2px further. `min-width: 2ch` fixes it. Unchanged from the last critique.
- The step select **regressed**: now 124px on split-step rows, down from the 160px it was widened to, against a 268px label.
- After saving a batch, `document.activeElement` is `<body>`. The brief requires the opener.
- The save confirmation read "recorded 10 Sep 2026" on 9 Sep — worth checking for a UTC/local off-by-one.
- The graduated rule's accessible name reads "Total fat, 18.0%, target 16-20%" — the target, not the deviation sentence DESIGN.md describes.
- Measured fields still sized to the column, not their content: churn date 830px, tasting date 830px, come-up / draw temp / overrun 457px each for two or three characters.
- Column-two void at 1440: a 745px balance note against a 429px table. Superseded by sketch 003's variant B; not worth fixing on the current structure.
- `tokens.css:8` still says pen blue is "unused on screen this phase". It is used in four rules.
- Hover thickens a button's border to 1.5px without moving it — the one hover the brief permits, done right.

## Status of the 2026-09-09 findings

| Finding | Status | Live evidence |
|---|---|---|
| **[P0]** Pen focuses step 8's aside, scrolls to y=2757 | **Fixed** | `activeElement` = the version-line input, `scrollY === 0`. Cause removed at `Method.jsx:47` via an `openedByUser` ref. |
| [P1] Method column is a form (32 boxed buttons) | Remains | 32 buttons; "uses nothing yet" x 5; `display: block` unchanged. Now an approved decision awaiting build. |
| [P1] Target chips swell to 377px | Remains | 16 chips at 376px, two 180px fields each; the CSS collision is unchanged. |
| [P1] "done differently" is an 850px band | Remains, wider | 10 controls at 892px, centred. |
| [P1] Batch margin's prose fields invisible | Remains | Three 457x17px fields, `border: 0px none`, 89px of blank paper. |
| [P2] Versions band outlines collide | Remains | Strip `li` top 187 = Amend button bottom 187; open-batch `li` 830x18px outlined; "800 gchurned" with no space. |
| [P2] Negative grams reaches the live figures | **Fixed, new defect** | `-5` moves no figure — but the parent is struck beside it, silently, and the fallback is the parent's value. Superseded by the P1 above. |
| [P2] Escape did nothing | Fixed, holds | Untouched pens close and return focus; the browser's leave warning fires on a touched pen. |
| [P2] Rules stay in the pen's tab path | **Fixed** | Both sampled rules carry `tabindex="-1"`. |
| [P2] Step select truncated at 160px | **Regressed** | Now 124px on split-step rows against a 268px label. |
| [P2] Batch/tasting legends are `<p>` | Remains | `P: Batch`, `P: Tasting`. |
| [P2] Empty accessible names on date inputs | **Fixed** | Both now wrapped in `<label><span>...`. |
| [P2] Tasting date exists twice | Remains | Two date inputs, both named "Tasting date", 830px and 457px. |
| [P2] Date placeholder vs printed date | By decision | Native date input, the named exception. |
| [P2] "4o" accepted silently | Fixed at Save, open live | Blocks with the row named; but see the P1 — it is struck as if in force until then. |
| Unreadable as-made value in the batch pen | Open decision | `6af7a6e` records this for the batch brief to settle. Measured, not scored. |

## Questions to Consider

- The method column has now survived two critiques and a revision of its own brief written specifically to fix it, with the button count identical. Mark has since answered it — read-only, one "edit this step" per step. Is anything still blocking that, or has it simply never been planned?
- A system whose only state carriers are weight and outline has no way to say "this value is on the page but not in force" — exactly the gap `-5` fell into. Does that need a fourth strike meaning the rule forbids, or should an unreadable value never be struck at all?
- `declaredAxes` drifted because a data shape changed without the schema number that guards it, and the render layer answered by printing "undefined" into an aria-label rather than failing. The lift file's own header warns that "two lifts drift". What, other than a critique, would have caught this before Mark opened his tasting pen?
