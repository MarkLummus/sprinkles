---
phase: "09"
slug: "the-library-and-the-stored-shapes-plus-the-two-places"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-10-19"
---

# Phase 09 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Offline converter → generated module | `app/scripts/convert-ingredient-seed.mjs` reads Mark's dataset from `~/Downloads` once and writes `app/src/data/library-seed-db.js` | Ingredient names, figures, source text (string literals into a committed module) |
| Store file → IndexedDB | `transfer.js` import of a maker-chosen JSON file into the eight stores | Recipes, versions, batches, drafts, library, machines, styles, scales, problems |
| Seed tables → the running app | Boot check and `CatalogContext` read the library and four tables from IndexedDB | Scale and problem definitions used as object keys and rendered text |
| Stored text → the DOM | Notebook and Ingredients places, the record pen, the printed log | Names, notes, sources, descriptions (rendered as text, never markup) |
| Database version 9 → 10 | `upgradeStores` one-way reset on first open of a Phase 9 build | Every store on every profile |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-09-01 | Tampering | runConverter writing library-seed-db.js | high | mitigate | Every dataset string goes through `JSON.stringify` of the whole entries object; round-trip test with quote, backslash and brace | closed |
| T-09-02 | Information disclosure | the dataset and the mapping | medium | mitigate | Node built-ins only; nothing under app/src imports app/scripts or reads the dataset (acceptance grep); the app never fetches | closed |
| T-09-03 | Repudiation | 09-walk-before.json | medium | mitigate | Baseline built from 710a528 in a detached worktree; second record MATCHes; records refused when a non-Phase-9 commit touched app/ | closed |
| T-09-44 | Tampering | mapping coefficients writing into every library | low | mitigate | `convertEntry` accepts only the five typed keys and a `defaultStage` in STAGE_IDS; 09-07 tests the 26 against the approved object; 09-09's `validateLibraryRecord` checks at boot and import | closed |
| T-09-04 | Tampering | seeded versions' printed codes | high | mitigate | `SEED_SHEET_CODES` committed literal pinned against legacy `sheetCode()`; golden vector `64JH-G408` present | closed |
| T-09-05 | Spoofing | findVersionsByCode | medium | mitigate | Exact compare of normalised input with the stored field; nothing recomputed | closed |
| T-09-06 | Tampering | IngredientsPlace, NotebookPlace rendering stored text | high | mitigate | React text children only; tests render angle brackets escaped; no `dangerouslySetInnerHTML` under app/src (shell test asserts it) | closed |
| T-09-07 | Tampering | IngredientsPlace writing the library | medium | mitigate | Component calls `listLibrary` only; test spies every write method | closed |
| T-09-34 | Denial of service | IngredientsPlace rendering wrong-typed fields | medium | mitigate | `shownFields` keeps a display field only with the type the place reads; test with object/number fields | closed |
| T-09-08 | Tampering | draftMatchesCreate, isScaleDefinition | high | mitigate | `carriesUnsafeKey` / `UNSAFE_KEYS` refuse unsafe keys, scale keys, libraryId and reserved row ids (draft.js) | closed |
| T-09-09 | Tampering | useKeptDraft creating branch | medium | mitigate | Writes only the drafts store; hook test asserts no version, recipe or batch write | closed |
| T-09-45 | Tampering | late create-draft restore over typed ink | low | mitigate | `createDraftRef` compare skips the restore and marks the stored record present; deferred-getDraft tests | closed |
| T-09-10 | Tampering | validateRow libraryId | medium | mitigate | null or non-empty string outside UNSAFE_KEYS; `__proto__` refusal pinned (versionRow.js) | closed |
| T-09-11 | Tampering | figures read through the link | high | mitigate | No code reads a figure through libraryId; library-link.test.js changes the entry after save and figures do not move | closed |
| T-09-42 | Tampering | validateVersion serveTempC | low | mitigate | null or finite number, path-named refusal before any write | closed |
| T-09-12 | Tampering | repository.createVersion | high | mitigate | Read, pure check and put in one readwrite transaction; two-repositories collision test | closed |
| T-09-13 | Tampering | repository.saveVersion | high | mitigate | A different code for the same id is refused inside the transaction (`sheetCodeProblems(` in repository.js) | closed |
| T-09-35 | Repudiation | refused creation losing the maker's ink | low | mitigate | Catch keeps the pen open; clash case proves typed values survive and a second press stores them | closed |
| T-09-14 | Tampering | the 26 existing entries | high | mitigate | Merge spreads new entries first and the 26 last; key-clash and deep-equal tests | closed |
| T-09-15 | Tampering | figures of dairy entries | high | mitigate | Lactose invariant over every milk-solids entry and the four exceptions | closed |
| T-09-16 | Tampering | validateDeclaredAxes | high | mitigate | `isScaleDefinition` refuses unsafe keys; a key equal to a core key is refused | closed |
| T-09-17 | Tampering | createChildVersion | medium | mitigate | `structuredClone` of declaredAxes and declaredFlaws; parent-unchanged test | closed |
| T-09-18 | Tampering | upgradeStores reset branch | critical | mitigate | One destructive block bounded to `oldVersion < 10`; behavioural ratchet (DB_VERSION + 1) and comment-stripped static scan in db.test.js; 09-17 repeats the reset in WebKit (17/17 PASS) | closed |
| T-09-40 | Tampering | a stray build writing app/dist mid-phase | high | mitigate | `09-dist-guard.sh scan` (12 build commands, each with --outDir) and `check` (DIST UNCHANGED) at hand-over | closed |
| T-09-19 | Tampering | seedTableIfEmpty | medium | mitigate | Count and puts in one readwrite transaction, aborted by hand on failure | closed |
| T-09-20 | Denial of service | an old tab during the upgrade | low | accept | Existing blocked() line and blocking() reload unchanged, tested in db.test.js | closed (accepted) |
| T-09-21 | Tampering | importAll over eight stores | high | mitigate | One readwrite transaction over all eight stores, aborted on any failure; before/after store comparison tests | closed |
| T-09-22 | Tampering | imported Sheet codes | high | mitigate | Canonical-form check, pre-check and in-transaction `sheetCodeProblems`; never recomputed | closed |
| T-09-23 | Tampering | table rows and scale keys as object keys | high | mitigate | `scanForUnsafeKeys` over the payload plus SEED_TABLES validators; `__proto__` machine id pinned | closed |
| T-09-43 | Tampering | imported version without a serving temperature | low | mitigate | Own `serveTempC` required, null or finite number, whole file refused otherwise | closed |
| T-09-36 | Denial of service | import leaving a scales table the boot check refuses | medium | mitigate | Pre-check and in-transaction `catalogConflicts` over the merged scales (`CatalogConflictError`); race tests at both levels | closed |
| T-09-46 | Tampering | accepted import leaving an invalid next batch | medium | mitigate | `catalogConflicts` over resulting scales, problems and retained versions, pre-check and in transaction | closed |
| T-09-24 | Denial of service | an oversized file | low | accept | Out of scope at ASVS L1 for a local, single-user import the maker chooses | closed (accepted) |
| T-09-25 | Denial of service | boot with a damaged seed row | medium | mitigate | `firstDamagedTable` validates every row before App mounts; one line naming the table (main.jsx) | closed |
| T-09-26 | Tampering | a stale catalog after import | medium | mitigate | Shell awaits `reloadCatalog` before bumping storeRevision; order pinned by test | closed |
| T-09-37 | Repudiation | a failed catalog reload after a committed import | low | mitigate | Recovery state: routed page withheld, 'Import' placeholder with IMPORT_RELOAD_LINE until reload | closed |
| T-09-33 | Tampering | the new record pen's scales and chips | low | mitigate | Pen draws only the boot-validated catalog; chip words render as text inside Button | closed |
| T-09-38 | Tampering | createBatch's snapshot of the catalog | medium | mitigate | `coreScaleDefinitions` and `problemNames` build new objects; mutation-after-create test | closed |
| T-09-27 | Tampering | validateTasting marks | high | mitigate | Marks allowed only on the batch's own snapshot keys (`coreScales` + `declaredAxes`); keys pass `isScaleDefinition` | closed |
| T-09-28 | Tampering | validating against the receiving catalog | medium | mitigate | Validator reads only the batch's snapshot; accept/refuse tests | closed |
| T-09-29 | Tampering | draftMatchesVersion | medium | mitigate | Record draft checked against the catalog, Correct draft against its batch's snapshot | closed |
| T-09-30 | Tampering | a seed constant read at run time | low | mitigate | `seed-data-scan.test.js` static-import guard with an exact-path allow-list | closed |
| T-09-31 | Repudiation | the walk allow-list | medium | mitigate | 25 narrow paths each checked to an exact value; selftest refuses eight doctored files | closed |
| T-09-39 | Repudiation | the reset proven only in fake-indexeddb | medium | mitigate | `09-upgrade-check.mjs` in WebKit: base build writes v9, final build opens at 10, reopen resets nothing (17/17) | closed |
| T-09-41 | Tampering | handing Mark the device row after app/dist changed | high | mitigate | dist guard scan and check run before the device row is written; a FAIL stops the hand-over | closed |
| T-09-32 | Tampering | reading Mark's List | low | mitigate | Row text treated as data; writes use `if_version` from a fresh read; answers reported, never acted on | closed |
| T-09-SC | Tampering | npm installs (every plan) | low | accept | No package installed in any plan; `app/package.json` and `app/package-lock.json` unchanged from 710a528 | closed (accepted) |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-09-01 | T-09-20 | An old tab open during the 9→10 upgrade sees the existing blocked() line and blocking() reload; unchanged behaviour, tested | plan 09-09 (Claude), Mark proceeded with the reset 2026-10-19 | 2026-10-19 |
| R-09-02 | T-09-24 | An oversized store file is a local, single-user import the maker chooses; out of scope at ASVS L1 | plan 09-10 (Claude) | 2026-10-19 |
| R-09-03 | T-09-SC | No npm package was installed in any Phase 9 plan; lockfile unchanged | every plan (Claude) | 2026-10-19 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-19 | 47 | 47 | 0 | orchestrator (ASVS L1 grep-depth; register authored at plan time; every SUMMARY's Threat Flags: none) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-19
