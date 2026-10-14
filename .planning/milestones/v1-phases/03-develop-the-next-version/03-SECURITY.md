---
phase: "03"
slug: "develop-the-next-version"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-09-08"
---

# Phase 03 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| device boundary | Nothing crosses it: no network call and no external model call under `app/src` (TRUST-01, IMP-01) | None |
| an imported store file → the store | The one untrusted input the app accepts; now carrying lineage fields, per-row/step removed flags and uses lists | Arbitrary JSON, hand-editable |
| a returning profile's stored records → the upgrade | Phase 1/2 records lifted to the version-3 shape inside a `versionchange` transaction | Stored versions and batches |
| maker's keystrokes → the pen draft → the stored child version | Grams, prose, targets, uses, version line, reason, citation | Untrusted text and numbers |
| stored row ids and step numbers → keyed writes into the draft | Keys originating in a hand-editable record used to index draft objects | Object keys from stored data |
| the churned parent record and its batches → what a child save may touch | D04: planning the next version never edits the record of what was made | Parent version, its batches |
| the version the pen was opened on → the version the page now shows | Pen state held across a route change | Draft state, amend target |
| unsaved ink → the page the maker leaves for | Draft loss on in-app navigation or reload | Unsaved draft |
| the `changes` search parameter → what the page renders | A display state from the address bar that must never reach a write | Opaque flag |
| the parent record → the child's rendering; a comparison → the records compared | The parent is read live for show-changes; `buildDiff` must not mutate either side | Parent and child versions |
| a version's own recorded data → what an advisory asserts | Derived claims must name their basis and never gate a save | Coefficients, targets, process |
| a free-text step target → the hydration parser | Ungrammatical prose read by a number parser | Step target text |
| a step's stored identity → the number printed for it | Two reference frames (current, baseline) on one page | Step keys |
| a row's step reference → the method beside it | A pointer to a removed step printed as a number | Row allocations |
| what the ink shows → what assistive technology announces | Margin numbers, struck marks and removed labels | Accessible names |
| a control's rendered box → the values beside it and the region beside the table | Overflow painting over figures, flag words or the Formulation Note | Layout |
| a class the component emits → a rule that matches it | Emitted vs. styled column sets under `table-layout: fixed` | CSS class names |
| an inherited note → a reader of the saved child | Provenance marker on notes carried from the parent | Note text, marker |
| a control's label → what the control does | Remove vs. restore on rows and steps | Control semantics |

---

## Threat Register

*Register authored at plan time: every one of the twelve plans carries a `<threat_model>` block. Evidence cites the file and line the auditor read on 2026-09-08 at commit 57ff311.*

### Plan 03-01 — the tracer and the store lift

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01 | Tampering | `app/src/store/db.js` upgrade | high | mitigate | Only awaits inside the upgrade are `db.js:31` `openCursor()` and `:34` `continue()`; `versionLift.js` has zero `await`; `tests/db-migration.test.js:130` proves a two-version pass | closed |
| T-03-02 | Tampering | `app/src/store/versionLift.js` | high | mitigate | `??` defaults plus spread, no deletes (`:63-93`); seed `uses` fills only where empty (`:86`); `db-migration.test.js:89` figures and batch identical, `:151` idempotent | closed |
| T-03-03 | Tampering | `app/src/ui/RecipePage.jsx` save handlers | high | mitigate | `RecipePage.jsx:914-925` one `saveVersion(child)` under a fresh `randomUUID()`, no `saveBatch(`; `lineage.js:77-101` never writes the parent | closed |
| T-03-04 | Tampering | `app/src/store/transfer.js` | high | mitigate | Type checks at `:68,85,88,106,257,262`; single `scanForUnsafeKeys` definition `:34` called once from the root `:288` | closed |
| T-03-05 | Tampering | `app/src/store/transfer.js` `importStore` | high | mitigate | D-09 parent gate `transfer.js:362-370` returns before `putAll` at `:372` | closed |
| T-03-06 | Tampering | `app/src/domain/axes.js` (closes T-02-32) | medium | mitigate | `axes.test.js:157-161` asserts the prototype is unchanged, the mark dropped, no pollution; `axes.js:66-74` spread plus delete | closed |
| T-03-07 | Denial of service | a second tab open across the database upgrade | low | accept | `idb`'s `blocked` path unhandled by design; single-user local store; see R-03-01 | closed |
| T-03-08 | Information disclosure | the struck-beside pair | medium | mitigate | `IngredientTable.jsx:92` `was N g, now N g` reaches the aria-label at `:525,:570`; sibling placement `app.css:378-380`; zero colour literals | closed |
| T-03-SC | Tampering | npm install | high | mitigate | `app/package.json`: `fake-indexeddb` 6.2.5 in devDependencies only; `03-RESEARCH.md:117` OK verdict, no `[SUS]`; `react-router` 8.3.1 unbumped | closed |

### Plan 03-02 — the pen in full

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-09 | Tampering | `app/src/domain/uses.js` | high | mitigate | Zero `.removed =` assignments in the module (all reads); `uses.test.js:197,206` removal never cascades | closed |
| T-03-10 | Tampering | pen draft keyed by row id and step number | medium | mitigate | Declared: every keyed write into `penDraft` uses spread and `delete`, presence tested with own-property checks. Found: `RecipePage.jsx:762,770,782` comply, but the seeding path at `RecipePage.jsx:719` (`rows[row.id] = {...}` in `handleStartDeveloping`) is a bare bracket write against a stored key, and the three readers (`RecipePage.jsx:165,891`, `lineage.js:156`) use bare reads. `transfer.js:54` validates `row.id` only as a non-empty string and `scanForUnsafeKeys` inspects keys, not values, so an imported `{"id": "__proto__"}` reaches it. Impact is a corrupted local pen draft, not global `Object.prototype`; single-user local store. Close with `Object.fromEntries` (DefineOwnProperty semantics) or re-disposition to accept with the local-only rationale. | open — below high threshold (non-blocking) |
| T-03-11 | Tampering | `app/src/domain/diff.js` | high | mitigate | Zero `.sort(` in `diff.js`; `diff.test.js:413` both arguments deep-equal a pre-call `structuredClone` | closed |
| T-03-12 | Repudiation | `app/src/ui/Authored.jsx` | high | mitigate | `Authored.jsx:37` marker rendered as words; `app.css:719-722` small print, no hue; `RecipePage.jsx:854` clears on edit, persists otherwise; `lineage.js:99` carries it to the child. Note: nothing yet originates `inheritedFrom` (see Observations) | closed |
| T-03-13 | Tampering | `app/src/domain/uses.js`, `app/src/ui/Method.jsx` | medium | mitigate | Zero `instruction` references in `uses.js`; no prose parsing in `Method.jsx`; `uses.test.js:188` flag rests on uses, not prose | closed |
| T-03-14 | Information disclosure | `Method.jsx`, `IngredientTable.jsx` | medium | mitigate | `Method.test.jsx:19` label closes outside the struck element; `:37` prose stays inside; zero colour literals | closed |
| T-03-15 | Tampering | every maker-typed field | high | mitigate | Tree-wide `dangerouslySetInnerHTML`/`innerHTML`/`eval` gate clean; zero `toFixed`/`Math.round` in `IngredientTable.jsx` | closed |

### Plan 03-03 — the ceremony, the strip and the list

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-16 | Repudiation | the save ceremony | high | mitigate | `lineage.js:151-153` trimmed blank plus `versionLineUnique`; `RecipePage.jsx:885-889` blocks before `saveVersion`; `Headnote.test.jsx:88,99` | closed |
| T-03-17 | Repudiation | the reason and the citation | high | mitigate | `RecipePage.jsx:722-724` all ceremony fields seed empty or null; `Headnote.test.jsx:51,129` `no reason recorded` | closed |
| T-03-18 | Elevation of privilege | `Save over this version` | high | mitigate | `RecipePage.jsx:932` handler re-checks `batches.length > 0` and returns; `Headnote.test.jsx:70,80` control absent on a churned version | closed |
| T-03-19 | Elevation of privilege | balance as a gate | high | mitigate | Zero `band`/`deviation`/`advisor` in `Headnote.jsx`; in `lineage.js` only the `:147` comment; `Headnote.test.jsx:233` identical controls in and out of bands | closed |
| T-03-20 | Information disclosure | `app/src/ui/RecipeList.jsx` | medium | mitigate | `RecipeList.jsx:109` `latestVersionPerRecipe`; `:104` comment names `VersionStrip.jsx` as the reachability dependency | closed |
| T-03-21 | Information disclosure | the strip and the ceremony | medium | mitigate | `app.css:277-282` current version by weight and outline, never hue; `:202-203` shared focus outline token; zero colour literals | closed |
| T-03-22 | Denial of service | very many versions of one recipe | low | accept | No version cap anywhere under `app/src`; see R-03-02 | closed |

### Plan 03-04 — show changes

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-23 | Tampering | the show-changes state | high | mitigate | `RecipePage.jsx:223` read-only `searchParams.has`, `:332` live `getVersion`, `:453` `buildDiff`; no parent snapshot stored on the child (`lineage.js:82-83`) | closed |
| T-03-24 | Repudiation | a parent that cannot be read | medium | mitigate | `Headnote.jsx` toggle gated on `parentVersion &&`; lineage names `version.parentVersionLabel` regardless; `Headnote.test.jsx:188` | closed |
| T-03-25 | Information disclosure | the `changes` parameter | low | accept | `RecipePage.jsx:742` sets an empty-string value: no identifier, no record content; see R-03-03 | closed |
| T-03-26 | Information disclosure | strike-only signalling | medium | mitigate | `GraduatedRule.jsx:68` reaches the `:85` aria-label; `GraduatedRule.test.jsx:46-48`; colour gate `03-04-PLAN.md:214` returns 0 | closed |
| T-03-27 | Tampering | a mark with no visible cause | medium | mitigate | `diff.js:60-61` share compared via `formatShareOfBatch` output, `:193` `toFixed(decimals)`; `diff.test.js:72,98` sub-precision moves not marked | closed |
| T-03-28 | Elevation of privilege | a direction of merit | high | mitigate | Operative gates `03-04-PLAN.md:150,216` forbid `↑`/`↓` and both return 0 over `IngredientTable`/`FormulationNote`/`Method`/`Authored`; the `→` in `Method.jsx:242,400` is a from-to transition, not a merit direction (see Observations) | closed |

### Plan 03-05 — the derived advisories

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-29 | Repudiation | `app/src/domain/advisories.js` | high | mitigate | `basis` on all four (`:68,88,133`, estimated `:146`); `advisories.test.js:53` non-empty words and basis for every advisory | closed |
| T-03-30 | Tampering | estimated-exposure advisory | high | mitigate | `advisories.js:146-147` restructures `buildFigures`' own `estimatedRowNames`; zero `library.js` import; `advisories.test.js:174,185` | closed |
| T-03-31 | Elevation of privilege | an advisory as a gate | high | mitigate | `domain/advisories.js` imported only by `DerivedAdvisories.jsx:1`; zero advisory reference in either save handler (`RecipePage.jsx:914,931`) | closed |
| T-03-32 | Repudiation | advisory wording | high | mitigate | No forbidden wording in the module (only the `:43` comment); `advisories.test.js:214` never correct/safe/guaranteed/sensory | closed |
| T-03-33 | Tampering | the hydration target parser | medium | mitigate | `advisories.js:21` `TEMP_TARGET_RE` demands a `°C` mark, `:26` returns null on no match; `advisories.test.js:144` unparseable range does not throw | closed |
| T-03-34 | Information disclosure | `app/src/ui/DerivedAdvisories.jsx` | medium | mitigate | Plain text paragraphs under a `derived` legend; `app.css:668-686` small print, no colour, icon or badge | closed |
| T-03-35 | Tampering | `equipment.minFillG` | low | accept | Read by nothing (only `olive-oil.js:62` data and the `advisories.js:41` comment); gated by `advisories.test.js:244`; see R-03-04 | closed |

### Plan 03-06 — the one pen

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-36 | Tampering | `RecipePage.jsx` save-as-new path across a route change | critical | mitigate | `router.jsx:28` `<RecipePage key={`${id}::${batchId ?? ''}`} />`: a route change forces a new instance, so no pen survives it | closed |
| T-03-37 | Denial of service | `handleSaveBatch` amend path across a route change | high | mitigate | Same route key at `router.jsx:28`; `amendingBatchId` cannot outlive the route change | closed |
| T-03-38 | Repudiation | `Headnote.jsx` Develop control | high | mitigate | `Headnote.jsx:229` `disabled={openPen !== null}` plus `:232` reason in words; `Headnote.test.jsx:202,212,221` | closed |
| T-03-39 | Tampering | `BatchMargin.jsx` Add a tasting | high | mitigate | `BatchMargin.jsx:351` uniform `disabled={openPen !== null}`; `BatchMargin.test.jsx:220` asserts the attribute | closed |
| T-03-40 | Elevation of privilege | per-control availability | medium | mitigate | One exported `derivePenState` (`RecipePage.jsx:193`, consumed `:398`); all four openers read `openPen !== null` (`BatchMargin.jsx:298,328,351,363`, `Headnote.jsx:229`) | closed |
| T-03-41 | Information disclosure | the four reason strings | low | accept | `RecipePage.jsx:195,199,201,204` name which pen is open; see R-03-05 | closed |

### Plan 03-07 — links that state why they will not move

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-42 | Denial of service | `isPenDraftDirty` | high | mitigate | `RecipePage.jsx:159-181` covers all seven writers including method, headnote and authored; wired into `beforeunload` at `:363` | closed |
| T-03-43 | Repudiation | `isDraftDirty` amend path | medium | mitigate | `RecipePage.jsx:57,72-77` compares against the supplied baseline; `amendBaseline` in the effect deps at `:374` | closed |
| T-03-44 | Tampering | in-app navigation with a pen open | high | mitigate | Strip `VersionStrip.jsx:32,39` (`test:90-92`), batch list `BatchMargin.jsx:314,308` (`test:255-263`), lineage `Headnote.jsx:178,186,216` (`test:256`) | closed |
| T-03-45 | Elevation of privilege | a navigation blocker or a dialog | medium | accept | Tree-wide gate: zero `useBlocker`/`usePrompt`/`window.confirm` under `app/src`; see R-03-06 | closed |
| T-03-46 | Information disclosure | the suppressed links' labels | low | accept | `VersionStrip.test.jsx:90` and `BatchMargin.test.jsx:255`: labels still read as words; see R-03-07 | closed |

### Plan 03-08 — columns sized by identity

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-47 | Information disclosure | ingredient table while developing | high | mitigate | `app.css:437-440` shrink guard `min-width: 0` on the step select; `:356` the column has its own width | closed |
| T-03-48 | Repudiation | As made column on a batchless version | medium | mitigate | `IngredientTable.jsx:461` `hasAsMadeLayer &&` on the `th`: the column is removed, not blanked; `IngredientTable.test.jsx:131` | closed |
| T-03-49 | Tampering | conditional columns under positional widths | high | mitigate | Zero `nth-child`/`nth-of-type` in `app.css` (only the `:350` comment); class-based `ingredient-table__col-*` at `IngredientTable.jsx:459-465` | closed |
| T-03-50 | Denial of service | table shape under a conditional column | medium | mitigate | `IngredientTable.test.jsx:123-129` `assertCellCountsAgree` (thead/tbody/tfoot) invoked in seven rendered states | closed |
| T-03-51 | Information disclosure | the closed select's truncated option text | low | accept | Deferred to 03-10, which shortened the label (`IngredientTable.jsx:181`); see R-03-08 | closed |

### Plan 03-09 — a step strikes only what changed

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-52 | Repudiation | struck-beneath device in `Method.jsx` | high | mitigate | Per-field flags `Method.jsx:260,271`; `Method.test.jsx:142` (pen) and `:454` (show-changes) both render none for removed-with-untouched-text | closed |
| T-03-53 | Tampering | remove-this-step on a removed step | high | mitigate | `Method.test.jsx:356` exactly one control on a removed step, reading restore; `:305` no remove control on the coverage path | closed |
| T-03-54 | Repudiation | absent-vs-empty in `buildDiff` | medium | mitigate | `diff.test.js:270,279,288,297` both directions for purpose and aside; `:306` real text still true | closed |
| T-03-55 | Information disclosure | a removed step that flags nothing | medium | mitigate | `Method.test.jsx:305` coverage cue in words; `:338` no cue where the table already carries the answer | closed |
| T-03-56 | Elevation of privilege | the orphaned-row rule itself | medium | accept | Rule unwidened: `uses.test.js:126,133,139` pin `orphanedRows`; see R-03-09 | closed |
| T-03-57 | Tampering | a second strike class | low | mitigate | Reuses `.method-step__prose--struck` (`app.css:571`); every stroke reads `--rule-strike` (`:400,414,528`) | closed |

### Plan 03-10 — the derived step number

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-58 | Repudiation | `StepCell`'s selector | high | mitigate | `IngredientTable.jsx:425` options span the whole method; `:184` `<option value={step.n} disabled={step.removed}>` so the bound value always has a home | closed |
| T-03-59 | Tampering | renumbering the stored key | critical | mitigate | Zero `.n =` assignment in `domain/stepNumbers.js` (`:1-12` records the rule); `Method.test.jsx:925` anchor id stays on the stored key; `IngredientTable.jsx:184` option values are stored keys | closed |
| T-03-60 | Information disclosure | a row naming a step the method lacks | high | mitigate | `IngredientTable.jsx:23-27` `resolveStepNumber` plus `:34` null-safe; `IngredientTable.test.jsx:394` reads `unallocated`, a word, not a dangling number; read-time only | closed |
| T-03-61 | Repudiation | numbering disagreeing between regions | high | mitigate | One `displayNumbers` module threaded from `RecipePage.jsx:470`; `Method.test.jsx:705,777`; the advisory reads the same module (`advisories.test.js:164`) | closed |
| T-03-62 | Information disclosure | ink vs. announced position | medium | mitigate | `Method.test.jsx:705` field labels name the number the margin prints, not the stored key | closed |
| T-03-63 | Elevation of privilege | selecting a removed step | medium | mitigate | `IngredientTable.jsx:184` `disabled={step.removed}`; `IngredientTable.test.jsx:232` | closed |
| T-03-64 | Tampering | migrating saved children | low | accept | Remap on read only: `stepNumbers.js` never writes the key; see R-03-10 | closed |

### Plan 03-11 — honest column widths

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-65 | Information disclosure | the table's Data column | high | mitigate | `columns.test.js:281-285` Data and Remove tokens clear their measured minimums; `:294-296` sized columns fit at every UAT width | closed |
| T-03-66 | Information disclosure | Formulation Note beside the table | medium | mitigate | `columns.test.js:319-325` asserts the reading state's widest shape separately at 1280 | closed |
| T-03-67 | Tampering | the derivation in `tokens.css` | high | mitigate | `columns.test.js:191-196` border-box on the shared th/td rule; `:198-205` padding via `--table-cell-pad-x`; budget recomputed from the tokens at `:287` onward | closed |
| T-03-68 | Denial of service | a column class matched by nothing | high | mitigate | `columns.test.js:242-250` emitted set from the component vs. styled set from the stylesheet, asserted equal | closed |
| T-03-69 | Repudiation | an ingredient name that wraps without anyone deciding | low | accept | `columns.test.js:310-316` asserts positive-but-not-clearing at 1024 (D-UAT-6); see R-03-11 | closed |
| T-03-70 | Tampering | hiding the collision | medium | mitigate | `columns.test.js:268-279` no ingredient-table rule declares overflow, clip, z-index, position or text-overflow | closed |

### Plan 03-12 — a removed step's number

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-71 | Repudiation | the pen's margin number | high | mitigate | `Method.jsx:348` baseline-frame number takes `method-step__n--struck` in show-changes and is suppressed in the pen; `Method.test.jsx:649,681,812` | closed |
| T-03-72 | Information disclosure | a removed step's accessible name | medium | mitigate | `Method.test.jsx:730` labels name the number the step had; `:755` invents none where it has no position | closed |
| T-03-73 | Repudiation | option list and orphaned-row flag | medium | mitigate | `IngredientTable.jsx:181` `${step.leadIn} (removed)` with no number; `:319` flag names by lead-in; `test:232,265,472,502` | closed |
| T-03-74 | Elevation of privilege | the removed step's option | medium | mitigate | `IngredientTable.jsx:184` option still present and still disabled; `IngredientTable.test.jsx:232` | closed |
| T-03-75 | Tampering | a guardrail asserting only halves | high | mitigate | `Method.test.jsx:611` `assertNoDuplicateMargins` union check, invoked six times including `:876` non-adjacent double removal and `:901` last-step removal | closed |
| T-03-76 | Denial of service | `extractStepEntries`' regex | low | mitigate | `Method.test.jsx:598-600` captures class attribute and numeral together and asserts the mark itself | closed |
| T-03-77 | Tampering | renumbering the stored key to dodge the collision | critical | accept | Not attempted: `Method.test.jsx:925` anchor-id gate, `stepNumbers.js` writes no key; see R-03-12 | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

### Project-wide invariants (verified once, cited throughout)

| Invariant | Result at audit |
|-----------|-----------------|
| No `dangerouslySetInnerHTML` / `innerHTML` / `eval` under `app/src` | clean |
| No `fetch` / `XMLHttpRequest` / `WebSocket` / `EventSource` / `sendBeacon` / dynamic `import(` / `http(s)://` under `app/src` | clean |
| Repository seam | only `store/repository.js:1` imports `db.js`; only `db.js:1` imports `idb` |
| No colour literal outside `styles/tokens.css` | clean (`app.css` zero) |
| No `useBlocker` / `usePrompt` / `window.confirm` under `app/src` | clean |
| Working tree | `git status --porcelain -- app/` empty; all verified code is committed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-03-01 | T-03-07 | `idb`'s `blocked` path is unhandled; a stale second tab stalls the upgrade until closed. Single-user, single-machine, local-only store; a blocked handler would be a UI of its own with no design contract. Revisit if the store ever leaves one browser. | 03-01-PLAN threat model | 2026-09-07 |
| R-03-02 | T-03-22 | Realistic range is 1–6 versions per recipe in a single-user local store; strip and list derive in memory from one read. A cap would be a number with no basis, and the No-Verdict rule forbids judging how many attempts the maker makes. | 03-03-PLAN threat model | 2026-09-07 |
| R-03-03 | T-03-25 | The `changes` parameter names a display state only: no identifier, no secret, no record content, and no server to leak to. Accepting it is what makes the state shareable and back-button-addressable (D-02). | 03-04-PLAN threat model | 2026-09-07 |
| R-03-04 | T-03-35 | `equipment.minFillG` stays in the record, read by nothing. D-05 holds batch mass against the machine's minimum fill for SCALE-01; an advisory that told the maker their batch clears the machine would be a safety claim this app is not entitled to make. Gated by `advisories.test.js:244`. | 03-05-PLAN threat model | 2026-09-07 |
| R-03-05 | T-03-41 | The reason strings name which pen is open, information already on screen. Naming the pen rather than one generic sentence is the point: a maker who cannot tell which pen to close cannot act on the words. | 03-06-PLAN threat model | 2026-09-07 |
| R-03-06 | T-03-45 | A navigation blocker or dialog is deliberately not built. D-10 grants two mechanisms for unsaved ink and a modal is not one; D-UAT-2 chose disabled-with-a-reason. A grep gate forbids `useBlocker`, `usePrompt` and `window.confirm` under `app/src`. | 03-07-PLAN threat model; D-UAT-2 (Mark) | 2026-09-07 |
| R-03-07 | T-03-46 | Version lines and batch dates still render as words while a pen is open; only their links go. Hiding the labels would cost the maker the ability to see what else exists while deciding what to write; nothing here is sensitive and the page is local. | 03-07-PLAN threat model | 2026-09-07 |
| R-03-08 | T-03-51 | With the shrink guard the closed select clips its longest option label; the full text remains in the open list. 03-10 owns what an option label says and shortened it; solving it twice would be churn. | 03-08-PLAN threat model | 2026-09-07 |
| R-03-09 | T-03-56 | The orphaned-row rule is not widened to flag every row a removed step used. Code, unit test and brief agree, and D-UAT-3 keeps them agreeing; widening it would flag rows still in use and push the maker toward removals they did not intend. The coverage cue answers the legibility problem without moving the rule. | 03-09-PLAN threat model; D-UAT-3 (Mark) | 2026-09-07 |
| R-03-10 | T-03-64 | Saved children whose rows name a removed step are remapped on read, not rewritten. A migration would write a churned version's descendants for a display concern; D04's never-overwrite discipline makes read-time resolution the cheaper and safer answer. Assumed and not objected. | 03-10-PLAN threat model | 2026-09-07 |
| R-03-11 | T-03-69 | Below about 1146px the widest seed name wraps to two lines. Accepted under D-UAT-6, which trades the wrap for readable numeric columns; recorded in the derivation comment, asserted in the test as positive-but-not-clearing, and put in front of Mark at 1024 and 1152 by UAT test 17 (pass). | 03-11-PLAN threat model; D-UAT-6 (Mark) | 2026-09-08 |
| R-03-12 | T-03-77 | Renumbering the stored step key to dodge the display collision was tested directly in 03-10: it makes eight of nine surviving steps read as rewritten and would strand every row reference, the pen's handlers, the seed uses lists and every batch's step changes. Not attempted; 03-12 touches only what is printed. Anchor-id and domain-untouched gates keep it out. Critical severity acknowledged: the accepted risk is the design constraint that `n` stays immutable identity (D-UAT-4), not an unmitigated exposure. | 03-12-PLAN threat model; D-UAT-4 (Mark) | 2026-09-08 |

*Accepted risks do not resurface in future audit runs.*

---

## Observations (not threats, for the record)

1. **T-03-12's marker is never originated.** The threat closes on its declared mitigation (render, preserve-or-clear, persist to child), but nothing under `app/src` yet sets `inheritedFrom` to a parent's version line: `versionLift.js:47-48` defaults it to `null`, `RecipePage.jsx:854` only preserves-or-clears, `createChildVersion` clones notes verbatim, and all seed notes are `null`. A child developed from the seed shows no provenance, so the control has no practical effect yet. Backlog item for Phase 4, not a reopened threat.
2. **T-02-32 (inherited open from Phase 02) is closed by T-03-06.** `02-SECURITY.md` asked for an own-property-only write or a `__proto__` test; `axes.test.js:157-161` supplies the test and `axes.js:66-74` the spread-plus-delete write. Marked closed in `02-SECURITY.md` by reference.
3. **T-03-28 register wording vs. operative gate.** The register says "no arrow glyph"; the plan's operative gates forbid only `↑`/`↓`. `Method.jsx:242,400` render `→` in a from-to transition (`40 → 48 g`), which is not a direction of merit. Closed on the operative definition.
4. **No unregistered flags.** No summary carries a `## Threat Flags` section; no new attack surface was declared during implementation.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-08 | 78 | 77 | 1 (0 blocking; T-03-10 medium) | gsd-security-auditor (ASVS L1, block_on high); all 519 tests across 26 files passing at audit time; code at 57ff311 |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (12, including the critical-severity T-03-77)
- [x] `threats_open: 0` confirmed (T-03-10 remains open below the blocking threshold)
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-08
