---
phase: "02"
slug: "record-the-first-batch"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-09-07"
---

# Phase 02 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| maker's keystrokes → the stored batch, tasting, or amendment | The first writable surface in the app; free text, numbers, and marks typed by hand | Untrusted text and numbers; personal notes |
| user-supplied JSON file → store | The one untrusted input the app accepts, now carrying batches beside versions | Whole store contents, hand-editable |
| the stored snapshot → what a reopened batch shows | The claim a batch makes about the rows, coefficients, and axes it was recorded against; an amendment is where it is most likely to be lost | Snapshotted version rows, coefficients, declared axes |
| the live version record → the batch and tasting layer | A measured value must never be filled from the plan: the recipe's targets, process, and serve temperature are on the page but never in the record | Planned values (must not cross) |
| the URL's `batchId` → what the margin claims about the record | An address the maker can type or bookmark; the page must not make a false statement because it did not recognise one | Opaque batch id |
| the pen layer's draft → the stored batch | Which save path runs (create or amend) is decided by one piece of component state; an abandoned draft must be a provable no-op | Draft state, amend target |
| device boundary | Nothing crosses it: no network API and no external model call under `app/src` (TRUST-01, IMP-01) | None |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-02-01 | Tampering | `app/src/ui/BatchMargin.jsx`, `app/src/ui/IngredientTable.jsx` | high | mitigate | Maker text renders as JSX text nodes; no `dangerouslySetInnerHTML`/`innerHTML`/`eval` under `app/src` (tree-wide negative gate, `02-VERIFICATION.md:137`) | closed |
| T-02-02 | Tampering | `app/src/domain/batch.js` | high | mitigate | `structuredClone` taken once in `createBatch` (`batch.js:65-66`); `batch.test.js:68,184` prove later version edits leave the snapshot unchanged | closed |
| T-02-03 | Tampering | `app/src/domain/batch.js`, `app/src/ui/IngredientTable.jsx` | high | mitigate | Own-property checks (`batch.js:96,117,175`; `IngredientTable.jsx:42,54,102`); no rounding call in the module; `batch.test.js:127-234` | closed |
| T-02-04 | Tampering | `app/src/store/db.js` | high | mitigate | Both `createObjectStore` calls in the v2 `upgrade` guarded by `objectStoreNames.contains` (`db.js:15,18`) | closed |
| T-02-05 | Information disclosure | `app/src/styles/app.css`, `app/src/ui/BatchMargin.jsx` | medium | mitigate | Zero colour literals; recorded vs planned carried by label, position, and its own column (`app.css:433-445`, `IngredientTable.jsx:91`); no verdict wording | closed |
| T-02-06 | Information disclosure | all of `app/src` | medium | mitigate | No `fetch`/`XMLHttpRequest`/`WebSocket`/`EventSource`/`sendBeacon`/dynamic `import(`; no `http(s)://` under `app/src` (`02-VERIFICATION.md:118`) | closed |
| T-02-07 | Spoofing | `app/src/domain/batch.js` | low | accept | Opaque `crypto.randomUUID()` ids in a single-user local store grant no capability; revisit if batches are shared (02-01-PLAN) | closed |
| T-02-08 | Tampering | `app/src/store/transfer.js` | high | mitigate | Collect-all-errors gate returns before any write (`transfer.js:265-267`); `transfer.test.js:325` asserts zero `putAll` and zero `putAllBatches` calls with one bad batch beside a good one | closed |
| T-02-09 | Tampering | `app/src/store/transfer.js` | high | mitigate | `scanForUnsafeKeys` (`transfer.js:25-38`) recurses generically over arrays and objects from the root (`:213`); `transfer.test.js:280` asserts refusal and no pollution | closed |
| T-02-10 | Tampering | `app/src/store/transfer.js`, `app/src/domain/batch.js` | high | mitigate | `isAbsentOrNull` is an explicit `undefined`/`null` test (`transfer.js:61-63`); as-made values gated by `isFiniteNumber` so `0` passes; `batch.js:78-80` uses `!= null`; `transfer.test.js:256` | closed |
| T-02-11 | Tampering | `app/src/ui/Method.jsx`, `app/src/ui/BatchMargin.jsx` | high | mitigate | Same tree-wide negative gate as T-02-01; text nodes at `Method.jsx:44,68`, `BatchMargin.jsx:38-39,272-274` | closed |
| T-02-12 | Repudiation | `app/src/ui/BatchMargin.jsx` | high | mitigate | `readMeasured` (`batch.js:144-151`) is the only reader; returns `unknown` on absent; component reads only `version.id`, never `targets`/`process`/`iceEd`; `batch.test.js:248,253` | closed |
| T-02-13 | Information disclosure | `app/src/styles/app.css`, `app/src/ui/Method.jsx` | medium | mitigate | Literal `Skipped` text label (`Method.jsx:54`); strike is `line-through` with no hue (`app.css:253-262`); zero colour literals | closed |
| T-02-14 | Information disclosure | all of `app/src` | medium | mitigate | Network gate re-run over the whole tree after the transfer changes; export is a local file hand-off (`transfer.js:248-258`) | closed |
| T-02-15 | Denial of service | import of a very large file | low | accept | Single local user importing a file they chose; no basis for a size number; carried from Phase 1 T-04-06 (02-02-PLAN) | closed |
| T-02-16 | Tampering | `app/src/domain/batch.js` | high | mitigate | `addTasting` (`:256-270`) and `recordAmendment` (`:282-288`) are separate; `batch.test.js:417,458` assert identity of untouched fields | closed |
| T-02-17 | Tampering | `app/src/domain/axes.js` | high | mitigate | `axesForBatch` reads `batch.snapshot.declaredAxes` only (`axes.js:34`); `axes.test.js:61` empties the live version's axes and asserts six remain | closed |
| T-02-18 | Repudiation | `app/src/ui/BatchMargin.jsx` | high | mitigate | "This batch has not been tasted yet." + "Add a tasting" (`:308-322`); `date unknown` (`:16,287`); date bound to `draft.date` initialised `''` (`RecipePage.jsx:290`) | closed |
| T-02-19 | Tampering | `app/src/ui/BatchMargin.jsx` | high | mitigate | No `iceEd`/`targets`/`process` expression in the file; temperature bound to `draft.tastingTempC` and read via `readMeasured` | closed |
| T-02-20 | Tampering | `app/src/ui/BatchMargin.jsx`, `app/src/ui/AxisMark.jsx` | high | mitigate | Negative gate; text nodes at `AxisMark.jsx:23,35,48` | closed |
| T-02-21 | Information disclosure | `app/src/ui/AxisMark.jsx`, `app/src/styles/app.css` | medium | mitigate | Checked stop = ink fill + border (`app.css:527-534`); open batch = weight + outline (`:465-468`); disabled save explained in words (`BatchMargin.jsx:121`) | closed |
| T-02-22 | Elevation of privilege | `app/src/ui/BatchMargin.jsx` | medium | accept | Native radio group emits only its nine values; an out-of-range mark from a hand-edited file misleads only its editor; revisit if batches are shared (02-03-PLAN) | closed |
| T-02-23 | Denial of service | very many tastings on one batch | low | accept | Realistic range 0–4 per batch; a cap has no basis and No-Verdict forbids judging volume (02-03-PLAN) | closed |
| T-02-24 | Tampering | `app/src/ui/RecipePage.jsx` | high | mitigate | `setAmendingBatchId(null)` in `handleStartRecording` (`:139`) and `handleCancelRecording` (`:285`), plus the amend save path (`:259`); `02-VERIFICATION.md:76` | closed |
| T-02-25 | Repudiation | `app/src/ui/BatchMargin.jsx` | medium | mitigate | Fallthrough line chosen from `batches.length` (`:333`); `BatchMargin.test.jsx` asserts the correct sentence and `not.toContain` the false one | closed |
| T-02-26 | Tampering | `app/src/ui/RecipePage.jsx` | high | mitigate | `handleCancelRecording` (`:282-286`) is three `setState` calls: no repository call, no navigation, no batch-list mutation | closed |
| T-02-27 | Denial of service | the cancel control | medium | accept | Cancel discards without confirmation per A-1 and D-24; native unload warning still guards tab close; draft persistence is UX1-02 in Phase 4 (02-04-PLAN) | closed |
| T-02-28 | Repudiation | `app/src/ui/Method.jsx`, `app/src/styles/app.css` | medium | mitigate | `Skipped` label is a sibling of the struck span (`Method.jsx:43-54`); `Method.test.jsx` asserts the structure, not string presence | closed |
| T-02-29 | Tampering | `app/src/ui/RecipePage.jsx`, `app/src/domain/axes.js` | high | mitigate | `setMark` delete path (`axes.js:69`); handler `RecipePage.jsx:309-311`; `axes.test.js:112-142` including the save gate returning to `false` | closed |
| T-02-30 | Information disclosure | `app/src/ui/AxisMark.jsx` | medium | mitigate | Text `<button>` "Clear" with `aria-label` naming its axis (`AxisMark.jsx:41-50`); `AxisMark.test.jsx:32` | closed |
| T-02-31 | Tampering | `app/src/domain/axes.js` | low | accept | Carried from T-02-22; the control emits only nine stops or `null` (02-05-PLAN) | closed |
| T-02-32 | Elevation of privilege | `app/src/domain/axes.js` | medium | mitigate | Planned control: own-property-only write. Delete path complies; the write path at `axes.js:71` is a plain bracket assignment (`next[axisKey] = stop`), and no `__proto__`-keyed test exists. Verified today: a `__proto__` axis name silently drops the mark and does not pollute, because stops are numbers or `null`; the safety is incidental, not the committed control. Closed 2026-09-08 by Phase 03 T-03-06: `axes.js:66-74` now writes by spread plus delete and `axes.test.js:157-161` asserts a `__proto__` axis name leaves the prototype unchanged and drops the mark. | closed |
| T-02-SC | Tampering | npm installs | high | mitigate | No package installed this phase: `app/package.json` holds 4 dependencies + 3 devDependencies, unchanged since Phase 1 commit `4b96b8d`; no lockfile commit in Phase 2 (`02-VERIFICATION.md:113`) | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-02-01 | T-02-07 | Opaque batch ids in a single-user local store are identifiers, not a security boundary | Mark (plan 02-01 approval) | 2026-09-06 |
| R-02-02 | T-02-15 | Single local user importing a file they chose; a size cap has no basis; carried from Phase 1 T-04-06 | Mark (plan 02-02 approval) | 2026-09-06 |
| R-02-03 | T-02-22 | Out-of-range mark from a hand-edited store file misleads only its editor; UI control emits only nine values | Mark (plan 02-03 approval) | 2026-09-06 |
| R-02-04 | T-02-23 | 0–4 tastings per batch is the realistic range; a cap would be arbitrary and contrary to No-Verdict | Mark (plan 02-03 approval) | 2026-09-06 |
| R-02-05 | T-02-27 | Cancel discards without confirmation by Mark's stated default (A-1, D-24); native unload warning still fires; draft persistence is Phase 4 UX1-02 | Mark (plan 02-04 approval) | 2026-09-06 |
| R-02-06 | T-02-31 | Carried from T-02-22 unchanged | Mark (plan 02-05 approval) | 2026-09-06 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-07 | 33 | 32 | 1 (0 blocking; T-02-32 medium) | gsd-security-auditor (ASVS L1, block_on high); all 180 tests across 10 files passing at audit time |
| 2026-09-08 | 33 | 33 | 0 | T-02-32 closed by reference to Phase 03 T-03-06 (secure-phase 03 audit) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed (T-02-32 closed 2026-09-08 by reference to 03-SECURITY.md T-03-06)
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-07
