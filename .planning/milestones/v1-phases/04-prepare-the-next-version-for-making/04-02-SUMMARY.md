---
phase: 04-prepare-the-next-version-for-making
plan: 02
subsystem: domain, ui
tags: [sheet-code, search, crockford-base32, fnv-1a, golden-vector, d-08]

requires:
  - phase: 04-01
    provides: "shared Button (the Find button is born on it); the raw-control scan"
provides:
  - "app/src/domain/sheetCode.js: SHEET_CODE_DERIVATION, CROCKFORD_ALPHABET, printedContent, canonicalPrintedContent, sheetCode, normaliseCode, findVersionsByCode (pure)"
  - "SheetCodeSearch on /search: Sheet code field, Find button, the lookup, the no-match line"
  - "Home's Enter Sheet code link at the right of the Recipes row"
affects: [04-06, 04-07, 04-08]

actuals:
  tokens: 8200
  tasks: 3
  commits: 2
plan_head_before: 919d1b8f5f8e3cdc7d65bea7a8ac2ae069d8a423
plan_head_after: 738bec75f55e916bcd383e227370b1a05eb202d8
commits: 2

tech-stack:
  added: []
  patterns:
    - "A derived identifier is computed on read from the record, never stored: 64-bit FNV-1a in BigInt over NFC canonical JSON, top 40 bits as Crockford base32"
    - "Collision rules are tested against real colliding pairs found once by a birthday search and pinned, not against a stubbed hash"

key-files:
  created:
    - app/src/domain/sheetCode.js
    - app/src/domain/sheetCode.test.js
    - app/src/ui/SheetCodeSearch.jsx
    - app/src/ui/SheetCodeSearch.test.jsx
  modified:
    - app/src/router.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipeList.test.jsx
    - app/src/styles/home.css
    - app/src/styles/shell.css

key-decisions:
  - "Olive Oil v1's Sheet code is 64JH-G408, pinned by a golden-vector test and cross-checked against an independent Python FNV-1a; derivation tag sprinkles-sheet-code:1"
  - "Task 2 (Search submit control) auto-selected option-a (a filled Find button) because Mark is away; the plan itself calls it safe to take unattended. Mark can still change it."
  - "The code reads only printed recipe content (title, description, version name, Before you start texts, active lines with printed step numbers and grams, active steps); reason, citation, dates, lineage, declared axes and coefficients leave it alone"

patterns-established:
  - "The Search route's lookup builds its landing address from the matched stored version's ids via notebookPath, never from typed text"

requirements-completed: [PRINT-04, UX1-01, UX1-03]

coverage:
  - id: D1
    description: "sheetCode is one pure derivation: deterministic, paper-neutral changes keep the code, printed changes move it, NFC-stable, Olive Oil v1 pinned to 64JH-G408"
    requirement: PRINT-04
    verification:
      - kind: unit
        ref: "app/src/domain/sheetCode.test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "A code typed on /search with or without hyphen, either case, I/L/O misreads, lands on notebookPath(recipeId, versionId); a collision lands on the newest createdAt then id"
    requirement: PRINT-04
    verification:
      - kind: unit
        ref: "app/src/ui/SheetCodeSearch.test.jsx; app/src/domain/sheetCode.test.js#findVersionsByCode"
        status: pass
    human_judgment: false
  - id: D3
    description: "No match, an empty submit and a blank submit all read exactly No version has this code. in a polite status region, with focus kept in the field"
    requirement: UX1-03
    verification:
      - kind: unit
        ref: "app/src/ui/SheetCodeSearch.test.jsx#no match"
        status: pass
    human_judgment: false
  - id: D4
    description: "Home carries Enter Sheet code at the right of the Recipes row, to /search, tabindex 0; every Search control is a Tab stop"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeList.test.jsx#Enter Sheet code; app/src/ui/tabindex-scan.test.js"
        status: pass
    human_judgment: false
  - id: D5
    description: "The Search page as built from the app's grammar, and the iPad flow from Home through a typed code to the version, read well on the device"
    requirement: PRINT-04
    verification: []
    human_judgment: true
    rationale: "Page is not drawn in sketch 010; layout and the device keyboard (Go key, capitals) are not asserted by any test"

duration: ~6min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 02: Sheet code derivation, Search lookup and Home link Summary

**A pure Sheet code (FNV-1a 40 bits, Crockford base32, `XXXX-XXXX`) derived from the version id and its printed recipe content, pinned for Olive Oil v1 as `64JH-G408`, with Home's Enter Sheet code link leading to a Search page that lands a typed code on its version.**

## Performance

- **Duration:** ~6 min
- **Completed:** 2026-10-11T06:15Z
- **Tasks:** 3 (1 tracer, 1 decision, 1 auto)
- **Files:** 4 created, 5 modified

## Accomplishments

- `sheetCode.js` is the one derivation the print plans (04-06 to 04-08) will read for the feet and route line. No store, DOM or framework import, no Web Crypto, no random, no clock. The header comment lists field by field what counts and what does not, and says a change needs a new derivation tag (D-08, D-22a).
- Olive Oil v1's code is pinned in `sheetCode.test.js` as `64JH-G408` and was cross-checked against an independent Python FNV-1a over the same canonical text.
- `/search` renders `SheetCodeSearch`: Sheet code label, text field (capitals, no spell check, Go key), a filled Find button, and a polite status line. A match navigates to `notebookPath(recipeId, versionId)`; no match, empty or blank reads exactly `No version has this code.` and keeps focus in the field.
- Home's Recipes heading sits in `div.home__section-row` with `Enter Sheet code` at its right, `tabIndex={0}`, and the 44px floor under a coarse pointer.
- Collision handling is tested on real colliding pairs (found by a one-off 6M-step birthday search and pinned): one pair differing in version name, one in id alone.

## Task Commits

1. **Task 1 (tracer): derivation, Search page, Home link** - `ae59763` (feat)
2. **Task 2 (decision): Search submit control** - no commit; auto-selected option-a (see Deviations)
3. **Task 3: Find button, `.search__form`, keyboard and words pinned** - `738bec7` (feat)

Tracer gate: `<verify>` was automated-only and `human_verify_mode` is end-of-phase, so the targeted tests and the full suite were re-run before expansion and passed.

## Decisions Made

See key-decisions. Task 2 was auto-selected, not asked.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] RecipeList.test.jsx link count moved from 11 to 12**
- **Found during:** Task 1
- **Issue:** The existing test counts every `<a>` on Home for three recipes (11). Adding Enter Sheet code makes it 12; the plan asked for the link, so the pinned count had to follow.
- **Fix:** Count and its description updated (Enter Sheet code 1; lead 3; rows 8). The empty-shelf count (2) is unchanged because the link only renders with recipes.
- **Files modified:** `app/src/ui/RecipeList.test.jsx`
- **Commit:** `ae59763`

**2. [Rule 3 - Blocking] `.search__form` could not use a media query or an unscoped selector in shell.css**
- **Found during:** Task 3
- **Issue:** `shell.test.js` pins shell.css to exactly two `@media` blocks and requires every rule under `.shell` or `.place`. The plan's "wraps under 724 px" rule broke three tests.
- **Fix:** Scoped the rules as `.place .search__form` and dropped the media query: the row is `flex-wrap: wrap` with the field growing to the prose measure, so field and Find sit on one row at every width and wrap only when a window cannot hold both. The 724 stack the plan described is not implemented; the iPhone look is part of the deferred human check.
- **Files modified:** `app/src/styles/shell.css`
- **Commit:** `738bec7`

**3. [Plan variation] Collision test uses real colliding pairs instead of a vi.mock of sheetCode**
- The plan said to stub `sheetCode` through vi.mock. A stub cannot reach the call inside `findVersionsByCode` (same module), so I pinned real colliding minimal versions instead; the same newest-createdAt-then-id rule is proven in the domain suite and the UI suite. No production change.

**4. [Checkpoint handling] Task 2 `checkpoint:decision` taken with `auto_select="option-a"` while Mark is away**
- Standard mode would stop. The plan states option-a "is safe to take unattended", the choice is reversible (one control and one CSS rule), and Mark is away. Logged as `Auto-selected: option-a`. Mark's List could not be updated from this executor (ArtifactData is not available to it); the decide row is listed below for the orchestrator to add.

**Total deviations:** 2 auto-fixed (blocking), 1 plan variation, 1 checkpoint auto-selected. **Impact:** none on behavior the plan specified except the phone stack in deviation 2.

## Issues Encountered

- The first acceptance regex (`crypto.subtle` absent from sheetCode.js) matched my own header comment; the comment was reworded.
- The commit guard that refuses protected-branch commits reports `main` as protected, and `git.allow_default_branch_commits` is not set. The orchestrator's instruction (sequential on main, as 04-01 did) was followed; config was not changed.

## Known Stubs

None.

## Threat Flags

None. T-04-03 (input never reaches a path: navigation is built by `notebookPath` from the matched version's ids; the no-match line is a constant rendered as text), T-04-04 (collision lands deterministically on newest createdAt then id, tested), T-04-05 (golden vector and derivation tag) are mitigated as planned. T-04-SC: no package installed.

## Deferred Human Verification

human_judgment: true (D5). Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

1. iPad: from Home tap Enter Sheet code, type a printed sheet's code in lower case without the hyphen, press Go; the version's page opens.
2. Type a wrong code; the line reads `No version has this code.`
3. Look at the Search page as built from the app's grammar (not drawn in sketch 010), and at 393 wide, where the plan wanted the button stacked and this build keeps it beside the field.

Mark's List rows for the orchestrator to add (this executor could not reach ArtifactData):
- decide, `owner: mark`, `needs: answer`: "Search page submit control: Find button (taken, recommended), no visible button, or have Sid draw the page first". Options: option-a Find button (recommended), option-b Enter or Go only, option-c Sid draws first.
- look, `owner: mark`, `needs: hands`: the three device steps above.

## Self-Check: PASSED

- Created files exist: sheetCode.js, sheetCode.test.js, SheetCodeSearch.jsx, SheetCodeSearch.test.jsx (FOUND)
- Commits `ae59763`, `738bec7` are ancestors of HEAD
- `npm --prefix app test -- --run`: 67 files, 1991 passed, 0 failed (baseline 1950)
- `npm --prefix app run build` exits 0
- Acceptance: the `crypto.subtle|Math.random|Date.now|from '../store'` check on sheetCode.js exits 0; golden literal `64JH-G408` present in sheetCode.test.js; `/search` maps to `SheetCodeSearch`; `<Button type="submit"` and `Find` in SheetCodeSearch.jsx
