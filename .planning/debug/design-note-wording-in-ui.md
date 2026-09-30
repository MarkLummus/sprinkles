---
status: diagnosed
trigger: "G-03.5-R2-1: Fold-head counts carry only the count (Batches reads '3 batches'), with no design-note wording. Mark (iPhone): 'some of the Claude Design notes ended up in the UX, e.g. on the Batches row there is · latest first after 3 batches.'"
created: 2026-09-30T00:00:00Z
updated: 2026-09-30T00:00:00Z
goal: find_root_cause_only
symptoms_prefilled: true
---

## Current Focus

bug_class: Bohrbug (deterministic copy defect, no concurrency)
hypothesis: CONFIRMED. The board generators draw reading-order hints inside the product region of the fold heads (as the fold_row / history_rail "count text"), not in a dashed annotation caption. Plans 05/17/18/21 quoted them as product copy, the app renders them, and every conformance/test/probe row compares the app to the board text, so the pins agree by construction.
test: grep every pin; parse all 011 boards (annotation = inside the border-bottom dashed caption block) and every string literal/JSX text/template/attribute under app/src/ui, domain, store (rolldown parseAst), then cross-match in both directions (exact + 3-word shingles)
expecting: n/a
next_action: return ROOT CAUSE FOUND to orchestrator (diagnose-only; no app, board or test edits made)
reasoning_checkpoint:
  hypothesis: "The UI carries board hint text because the generator draws it as the head count, and plans 17/18/21 restated it as requirements."
  confirming_evidence:
    - "counts.py:96 and :139 build the count as '3 batches' + (' · latest first' if open_) and '8 versions' + (' · latest first' if open_); gen.py:461 and longhist.py:29 build '· oldest left, latest right [· opens at the version in view]'"
    - "03.5-17-PLAN.md:38 and 03.5-18-PLAN.md:30 restate the hint text as a must_have; historyRail.js:95-100 and BatchRow.jsx:559 implement it; DESIGN.md:356 records it"
    - "railHint() run directly emits the four strings"
    - "README decision 19 authors the count as words ('3 batches', '2 versions') and uses 'latest first' only to describe row order"
  falsification_test: "If any 011 annotation caption (dashed block) appeared verbatim in an app string, the leak channel would be the captions, not the hints. The exact and shingle cross-match found none except the hint strings and common product phrases (Record a batch, not yet churned, edit this step)."
  fix_rationale: "n/a (diagnose only). The fix must start at the generators, because the boards are generated and 'never patched'."
  blind_spots: "Whether Mark approved '· oldest left, latest right' and '· opens at the version in view' as part of decision 18's 'long rail hint' (README line 66) cannot be settled from the repo; the desktop-state study artifact J7LiG5oEA8YeNjzH2Ugvbw was not opened. Rendered text of store data (seed library notes) was judged by reading the UI code paths that consume it, not by running the app."
  candidate_causes:
    - "code: BatchRow.jsx:559 and historyRail.js:95-100 append the hint (confirmed)"
    - "board/data: generators draw the hint in the head count of the fold (confirmed, origin)"
    - "docs/process: plans 05/17/18/21, DESIGN.md:356 and LADDER-CONFORMANCE rows restate and pin it; no gate separates annotation text from product copy (confirmed, propagation)"
  and_gate: "yes. The text reached the screen only because three things held at once: the board drew it in the head's count, the plans turned the drawn text into a requirement, and the conformance process compares app text to board text. Removing any one link would have kept it off the screen."

## Symptoms

expected: Fold-head counts carry only the count (Batches reads '3 batches'), with no design-note wording.
actual: Batches head reads '3 batches · latest first' while the list is open on the iPhone. History's upright head reads 'N versions · latest first' open. (From the same origin, History's horizontal head reads 'N versions · oldest left, latest right[ · opens at the version in view]' open, at 1366+.)
errors: none
reproduction: a recipe with 2+ batches on the iPhone; tap Show on Batches. Or 2+ versions, tap Show on History.
started: 03.5 plans 17/18 (2026-09-28); '· oldest left, latest right' since plan 05 (2026-09-25)

## Eliminated

- hypothesis: the app authored the wording itself
  evidence: git log -S shows the strings first in the generators/boards (993f37f 2026-09-24 gen.py; 30bfd9e/f9d70f0 2026-09-27 counts.py) before any app code (a449a7d 2026-09-25; 013448a, 13d2336 2026-09-28)
  timestamp: 2026-09-30
- hypothesis: a decision (README) authored the head wording
  evidence: decision 19 (README.md:67, added by 257d041) says the batch count is "in words ('3 batches')" and closed shows "the count ('2 versions')". "latest first" appears only as a description of row order. Only decision 18's last sentence (README.md:66) mentions "the long rail hint" for the 1366 board, which is ambiguous.
  timestamp: 2026-09-30
- hypothesis: the dashed annotation caption paragraphs are being copied into the UI
  evidence: none of the 36 dashed-caption chunks (18 panels, title plus note) on the five 011-options-counts boards, nor any of the 20 board titles, appears in an app string; 3-word shingle match found only common product phrases and the hint strings
  timestamp: 2026-09-30
- hypothesis: other rendered text carries process vocabulary ("option B", "Not a decision", "as drawn", "TBD", "Mark", "picked", "illustrative", "hollow:", "In view", "Batches (n)")
  evidence: none occurs in any rendered string under ui/, domain/, store/, data/ (comments only). No title= attributes, no sr-only text, no CSS content: strings, index.html title is "Sprinkles". Library `note` fields (strawberry.js:67 "(Mark 2026-09-25)", library.js:124 "D-04: ...") are never read by a component.
  timestamp: 2026-09-30

## Evidence

- timestamp: 2026-09-30
  checked: the two known strings and the generator
  found: BatchRow.jsx:559 count={`${batches.length} batches${batchListOpen ? ' · latest first' : ''}`}; historyRail.js:98 `${base} · latest first` (upright), :99 `${base} · oldest left, latest right` and `· opens at the version in view` (overflowing). Generators: counts.py:96, counts.py:139, counts.py:39, counts.py:42, gen.py:461, gen.py:489 (then gen.py:522 regex strips ' · latest first' when closed), longhist.py:29.
  implication: the generator deliberately draws the hint only in the OPEN state (gen.py:522 strips it closed), which is exactly the app's rule. The app copied the board's state logic as well as its words.

- timestamp: 2026-09-30
  checked: what the boards draw in fold heads (parsed every 011 board)
  found: '3 batches · latest first' on batches-many.html and upright-393.html (Batches open); '8 versions · latest first' on upright-393.html (History open); '2 versions · oldest left, latest right' on 1366-batch, 1600-batch, 1600-no-batch, 1600-pen, 1920-batch, recipe-book-form-reference, and versions-1-vs-many; '8 versions · oldest left, latest right · opens at the version in view' on 1600-long-history and versions-1-vs-many. Sub-1366 main boards (1024, 984, 983, 723, 393) draw the closed head, count only.
  implication: the hint sits in the head's count slot, inside the product region, not in a dashed caption. No automated "annotation vs copy" distinction could have flagged it.

- timestamp: 2026-09-30
  checked: pins (tests, conformance, probes, plans, design record)
  found: see Resolution.artifacts and the pin list in the report
  implication: a fix has to touch each pin or the suite/conformance goes red or stale

- timestamp: 2026-09-30
  checked: UAT history
  found: 03.5-UAT-round1.md:40 wrote 'BatchesHide3 batches · latest first' as the expected value for test 5; Mark's round 1 answer did not mention it. He raised it in round 2 test 1.
  implication: the UAT's own expected line was copied from the conformance row, so the UAT script re-asserted the note as the target.

- timestamp: 2026-09-30
  checked: accessible name
  found: FoldRow.jsx:26 builds `${name}, ${controlWord}, ${count}`, so VoiceOver reads the hint too ('Batches, Hide, 3 batches · latest first').
  implication: removing the hint also changes the announced name when open; UAT test 3's closed expectation ('Batches, Show, 3 batches') is unaffected.

## Resolution

root_cause: "The boards draw reading-order hints as the count text of the open fold heads, and the app reproduces them. Origin: the generators (counts.py:96 and :139 for ' · latest first'; gen.py:461, counts.py:39 and :42, longhist.py:29 for ' · oldest left, latest right' and ' · opens at the version in view') put the hint inside the head's count slot, in the product region, open state only (gen.py:522 strips it when closed). Propagation: plans 17 (03.5-17-PLAN.md:38), 18 (03.5-18-PLAN.md:30) and 21 (:166) restated the drawn text as a requirement; BatchRow.jsx:559 and historyRail.js:95-100 implement it; DESIGN.md:356 records it as design; LADDER-CONFORMANCE rows and tests pin it. Nothing authored it as a decision: README decision 19 says the count is in words and uses 'latest first' only for row order. The dashed annotation captions themselves did not leak; the leak channel is the generators' count_text argument. No other rendered string is a board annotation (sweep in the report)."
fix: (not applied; find_root_cause_only)
verification: n/a
files_changed: []
