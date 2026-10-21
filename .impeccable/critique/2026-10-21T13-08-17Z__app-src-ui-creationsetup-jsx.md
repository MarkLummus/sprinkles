---
target: "the built creation editor /notebook/new at 1366x744: the log column (Style, Scales, Problems) and its rhythm against the record pen"
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/CreationSetup.jsx"
target_fingerprint: "sha256:7ec71aa8a845c35b57b6feb630ecf803b6923e2d4333dce4ed3f1efbe27b1e8c"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/CreationSetup.jsx
timestamp: 2026-10-21T13-08-17Z
slug: app-src-ui-creationsetup-jsx
---
⚠️ DEGRADED: single-context (no sub-agent/Task tool is exposed to this agent; Assessment A, the measured review of the served route, was finished before the detector ran; then Assessment B; both in this one context)

Target: the built creation editor, `/notebook/new` at 1366 × 744, HEAD 3f8ee617 built to a scratch `--outDir` and served on an ephemeral 127.0.0.1 port (never 4173, no second Vite), in Playwright WebKit with a coarse pointer, driven to the rhythm board's state (draft "Vanilla", two rows, Philadelphia, one added scale Creaminess, one added problem Bitter). Surface under review: the log column (`aside.notebook-log`, 350 wide at x 984), its rhythm and hierarchy as built; the rest of the page as context. Standard: the record pen's axes group (`.notebook-log .axes-cue`, sketch 011 decision 40 C), measured on Olive Oil v1 with Record another → Add tasting open. Source files: `app/src/ui/CreationSetup.jsx`, `CreationPage.jsx`, `Segmented.jsx`, `FieldFeedback.jsx`, `app/src/styles/notebook.css`. Mode: Operate.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | the draft is kept and says so; a picked style shows Clear; Required stands under an empty field; nothing says which group a card belongs to except its position |
| 2 | Match System / Real World | 3 | plain words throughout (Every recipe, This recipe only, Right in the middle); the core lines read as prose where the pen reads them as items |
| 3 | User Control and Freedom | 3 | Clear, remove, Cancel; no undo for remove (decision 5, by design) |
| 4 | Consistency and Standards | 1 | the column does not match the record pen it sits beside: the pen's group cue is 14/600 sentence-case ink; here "Every recipe" is 12/500 caps secondary, the caption face, and sits 12 px from everything like a caption |
| 5 | Error Prevention | 3 | Required under empty fields, the two-of-each limit removes the add control; a Kind can be left unpicked and saved later |
| 6 | Recognition Rather Than Recall | 2 | four levels of structure (region, group, card, field) in one small-caps voice: the reader works out the nesting from order, not from the type |
| 7 | Flexibility and Efficiency | 2 | every control is 44 tall and keyboard-reachable; no shortcut to the next card; the menu is the browser's own |
| 8 | Aesthetic and Minimalist Design | 2 | nothing is decorative, but with one 12 px gap everywhere the column is a stack, not a rhythm; the cue, its items and the card head run together |
| 9 | Error Recovery | 3 | "Enter a recipe name." and Required are in place, near the field; amounts that are not numbers are said in words |
| 10 | Help and Documentation | 2 | the core lines are the only explanation of what "Every recipe" means; nothing says the cards are "This recipe only" items except the cue above them |
| **Total** | | **24/40** | **Acceptable (60%)** |

## Design Specificity Verdict

**LLM assessment.** The column is unmistakably Sprinkles: the App context's field chrome, the destination-blue links, the Kind segmented group, the stops line written from the maker's own two words. What is not yet Sprinkles is the hierarchy: the record pen next door has a settled grammar for a group inside the log (a 14/600 sentence-case cue in ink, standing 32 px off the group before it and 12 or 6 px over its own items, which are smaller than it), and this column, built for the same log, did not inherit it. It inherited the caption face for every label it has, so region name, group cue, card head and field caption are four levels in one 12 px uppercase secondary voice, separated by one 12 px gap. That is the whole finding, and it is a system defect, not a taste call.

**Deterministic scan.** `impeccable detect --json` over `CreationSetup.jsx`, `CreationPage.jsx`, `Segmented.jsx`, `FieldFeedback.jsx` and `notebook.css`: 0 findings, 0 advisory. The detector sees nothing wrong, which is the point: every value reads a token and every size is on the ramp; the defect is which token the cue reads.

**Visual overlays.** Injection preflight passed in a fresh WebKit tab (`[Human]`, a script tag appended); `detect.js` from the critique's live server (port 8400) injected on the served `/notebook/new`; console: `[impeccable] 3 anti-patterns found`, six overlay nodes. The three: two `cramped-padding` on `span.target-chip` (the "estimated" chips on the Sheet rows: DESIGN.md's Target chip is "0 by 6px padding" by design, so a false positive against the design system, and outside the log column) and one `first-viewport-column-overflow` (the Sheet article runs 155% of the 744 px viewport while its sibling fits; context: the Balance column is what makes the Sheet tall, and the log column starts at the same y). None concerns the log column's rhythm. The overlay existed in headless WebKit only; no on-screen tab. Both servers stopped before this report.

## Overall Impression

The column works and reads as the App; it does not read as a column of groups. Measured as built: "SCALES" (12/600 caps secondary), 18 px, "EVERY RECIPE" (12/500 caps secondary), 12 px, the four core names (15/400 ink), 12 px, "THIS RECIPE ONLY" (12/500 caps), 12 px, "SCALE 1" (12/600 caps) with remove, 12 px, "NAME" (12/600 caps), the field, 12, 12, 12, 12, then 30 above Add scale. Problems the same. Every label is the same size, weight, case and colour within a hair, and every gap is the same 12 px, so the eye finds no group: "Every recipe" reads as a caption for the line under it, "This recipe only" as a caption for "Scale 1", which is a caption for Name. This is exactly Mark's 2026-10-01 note on the batch pen ("items like Every recipe are not distinguishable from the items within that area"), which the pen fixed with decision 40 C and this column never received. The single biggest opportunity: give the two cues the pen's cue and the pen's rhythm, and the column becomes three groups at a glance.

## What's Working

- **The field grammar is right.** 44 px controls, caption over field in the App's chrome, Required under an empty field, Low end and High end as a pair, the stops line written from the maker's own words in secondary: the card's inside is calm and consistent.
- **The region heads do their job.** STYLE, SCALES, PROBLEMS in the region-name face with 20 px padding and a hairline between regions: the three regions are distinct, and that is the same grammar the pen's Batch head uses.
- **Nothing carries state in colour.** The picked Kind cell is a filled segment plus a checked radio; Required is a word; Clear appears only when there is something to clear.

## Priority Issues

- **[P1] The group cue is the caption face, so the group is invisible.** Measured: `.mk-cue` 12 px / 500 / uppercase / 0.48 px tracking / rgb(89,89,89) / 16.2 px line; the pen's `.axes-cue` 14 px / 600 / sentence case / 0 / rgb(20,20,20) / 20 px line. **Why it matters:** the cue's one job is to say "what follows belongs together"; set as a caption it says "here is the label of the next thing". It is the note Mark left on 2026-10-01, come back on a new surface (sketch 013 decision 25 already answers it on the canvas; the build does not have it). **Fix:** one rule in `notebook.css`, `.notebook-log .mk-cue` with the five declarations of `.notebook-log .axes-cue` (two classes, or the log's `.pen-caption` colour wins). **Suggested command:** /impeccable typeset.
- **[P1] One 12 px gap everywhere, so there is no rhythm to read.** Measured in Scales: 18, 12, 12, 12, 12, 12, 12, 12, 30; in Problems: 18, 12, 12, 12, 12, 30. The pen: 32 px between groups (`gap-l`), 12 px between a cue and its first axis, 6 px between a cue and its chips. **Why it matters:** the same gap between a cue and its item as between an item and the next cue means a reader cannot tell where one group ends; "This recipe only" sits as close to the core names above it as to the card below it. **Fix:** the pen's rule, in tokens: `gap-l` above a cue that follows another group, `gap-xs` below a cue over a one-line list (as the pen's chips), the column's `gap-s` elsewhere; the first cue after the region head keeps its 18. **Suggested command:** /impeccable layout.
- **[P2] The items under the cue outsize it.** The core names are 15 px (`--app-notebook-size-body`) under a cue of 12 px today and 14 px after the fix; in the pen an item under the cue is smaller than the cue (the axis names are the 12/500 caption; the problem chips are 13 px controls). **Why it matters:** even with the cue face in place, a 15 px prose line under a 14 px heading reads as the content with a label, not as items in a group. **Fix:** the core line at `--app-size-meta` on the cue's 20 px line (the rhythm board's B), or, closer to the pen, as the pen draws its items. **Suggested command:** /impeccable typeset.
- **[P2] The card head and the field captions are one face.** "SCALE 1" and "NAME" are both 12/600 caps secondary, 12 px apart; "KIND" is 12/500 (`.pen-caption`) beside them at 12/600 (`.notebook-caption`), a weight difference no reader is meant to see. **Why it matters:** the card has no head of its own, and the two caption classes leak a mismatch. **Fix:** after the cue is settled, decide whether the card head stays a caption (then the hairline above the card is its real head, and the caption words could go) or becomes a sub-cue; make Kind's caption the same class as Name's. **Suggested command:** /impeccable typeset.
- **[P3] The region-to-region seam is 40 px plus a rule, the group seam will be 32.** Once groups get `gap-l`, the regions need to stay clearly larger: today 20 px padding either side of the hairline; fine, but check it after the fix so a region seam never reads smaller than a group seam. **Suggested command:** /impeccable layout.

## Persona Red Flags

**Alex (Mark, who authored the recipe and knows what a scale is):** scans for "my scales" and finds "This recipe only" as a caption-sized line between two 12 px gaps; reads the four core names as his own first scale; at two cards, "SCALE 1" and "SCALE 2" and "NAME" interleave in one voice. Will rely on the hairlines above cards, which are the only structural marks that differ.

**Jordan (first recipe, iPad):** reads "EVERY RECIPE" as a caption and expects a field under it; finds a sentence; reads "THIS RECIPE ONLY" as the caption of "SCALE 1". The nesting (region > group > card > field) is only recoverable by indentation, and there is none: every level starts at x 984.

**Sam (VoiceOver, keyboard):** the cues are `<p>` in the markup, not headings, so there is no heading level for the group; the region is a labelled `section` (good) and the card is a `group` with its name (good); Tab reaches every control; the picked Kind cell announces as a checked radio. The visual defect is also a structural one: a group with no heading element.

## Minor Observations

- The region name "SCALES" and the first cue are 18 px apart (the head's 44 px row minus the cue's line), which is already the largest gap in the region: the column's one accidental hint of rhythm.
- `Clear` in the Style head is 14/600 blue and `remove` in a card head is 14/600 blue: the same control at two levels, which is fine, but it makes the card head's caption look lighter than its own action.
- The Style region's Targets caption is 39 px above its first band row (the caption's margin plus the first band's 44 px minimum), a different rhythm from Scales; harmless, but a third spacing in one column.
- The log column starts at y 297 while the Sheet's Balance runs to y 1800: at 744 tall the Style region fills the first screen and Scales starts below the fold (the overlay's column-overflow note).
- Nothing overflows sideways (1366); the page is 1806 tall in this state.

## What is wrong, what the standard says, what fixes it

**Wrong, in plain words:** the two group cues are drawn as captions, every label in the column is the same small-caps voice, and every gap is 12 px, so the column has levels but no hierarchy and groups but no rhythm.

**The standard (the record pen's axes group, measured today):** the cue is 14 px, weight 600, sentence case, ink, on a 20 px line; it stands 32 px off the group before it; its own items start 12 px below it (axes) or 6 px (chips); the items are smaller than the cue (the axis names are the 12/500 caption). The pen's region head stays the 12/600 caps secondary region name, so the ladder reads region (small caps, secondary) > cue (14, bold, ink) > items (caption or control size).

**Which fixes it:** neither A nor B alone, in that order of effect. A (space only) gives the groups their seams but leaves the cue in the caption face in the build and a 15 px item under it, so the group is still read from white space alone. B (A plus the core names at 14) is the closest of the two to the pen: the cue becomes the heaviest thing in its group and nothing under it is larger. But both A and B on the canvas start from decision 25's cue face, which the build does not yet have; so the fix for the build is three parts in order: the cue face (decision 25, one rule), then the pen's gaps (A), then the item size (B). B carries all three, and is what the critique recommends. "Something else" worth a look rather than a rule: the pen puts its items in the caption size under the cue; if the core lines went to the caption voice the column would match the pen exactly, at the cost of reading four scale names as a label. Keep B.

## Questions to Consider

- Should the two cues be headings in the markup (an `h3` under the region's `h2`), so the structure the type now shows is also the structure a screen reader hears?
- Does the card need its "Scale 1" caption at all once the cue and the hairline do the grouping, or is remove beside Name enough?
- If the log column's groups take the pen's 32 px seam, should the region seam grow with it, or does the hairline carry the difference?
