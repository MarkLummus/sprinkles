---
phase: quick-261022-d3i
plan: 01
quick_id: 261022-d3i
status: complete
commits: 2
plan_head_before: 358b3ecea8286cde01c3ca11e06c8c699f736d03
plan_head_after: 1bc7ad9f
---

# Quick 261022-d3i: the log column's four prose fields type in the grotesk

One top-level rule, `.notebook-log .prose-field { font-family: var(--face-grotesk) }`, in `app/src/styles/notebook.css` (sketch 013 decision 26). At the machine, Ingredient notes, How did it turn out? and Next time now type in the grotesk. Pen blue, the Field Rule size and the inherited placeholder are unchanged.

## Commits

- c03ec90c fix(261022-d3i): the log column's four prose fields type in the grotesk (sketch 013 decision 26) (notebook.css, notebook.test.js, the probe)
- 1bc7ad9f docs(261022-d3i): sketch 013 decision 26 and the Prose field role: the log column's pen types in the grotesk (sketch 013 README, DESIGN.md)

## Verification

- notebook.test.js: 88 to 91 tests. RED first: tests A and B failed and C passed at base; all 91 pass after the rule.
- Full suite: 3731 passed (120 files), base 3728 + 3.
- Strict walk (10-walk-check.sh): `MATCH 94 snapshots`, 10-walk-before.json unchanged.
- tokens.css, app.css, app/src/ui and 10-walk-before.json are byte-identical to base. The five changed files are exactly the plan's files_modified.
- WebKit probe (scratch build, ephemeral 127.0.0.1 port, 4173 untouched): final line `112 PASS, 0 FAIL`.
  - Coarse (hasTouch): the four fields read the grotesk, rgb(31, 61, 122), 16px. Each placeholder reads the grotesk, italic, 12px, rgb(20, 20, 20), and matches the Version name placeholder in all four properties.
  - Fine: the same, at 15px.
  - The Sheet's seven prose fields (Sheet title, Sheet description, beforeYouStart notes 1 and 2, Step 1 lead-in, instruction, purpose) and the Why read the text face under both pointers.
  - Three saved lines in the log column read the hand under both pointers (Soft, not greasy; oil bottle opened 24 Jul; Bitter).
  - Every planning measurement was reproduced; none differed.

## Interpretation choices (from the plan)

1. "16px Field Rule size" is the Field Rule's own size: the rule sets the face only, so the size is 16px under a coarse pointer and 15px under a fine one, as for the Version name ink field.
2. The README entry says "sketch 011 decision 17", because a bare "decision 17" in sketch 013's README is a different decision.
3. No placeholder rule was added. The placeholder inherits the field's face, and a test pins that no ::placeholder rule declares a face.

## Deviations from Plan

None. The probe was written with the Write tool rather than a heredoc.

## Follow-ups for /impeccable document

DESIGN.md lines still describe typing in the text face more broadly than decision 26 allows: 372 (Pen Blue, "while they are being typed, in the prose-field role"), 389 (Typography scope, "the text face appears in the App only in the prose-field") and 432 (the Hand Rule, "the text face in sheet pen blue"). Only the Prose field role bullet was changed.

## Deferred Human Verification

The change is WebKit-verified on the Mac (Playwright, coarse and fine pointer emulation), not on Mark's iPad.

## Known Stubs

None.

## Self-Check: PASSED

Both commits are in the log; the five files are in the diff.
