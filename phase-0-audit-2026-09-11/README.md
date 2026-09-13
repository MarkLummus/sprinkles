# Phase 0 — Existing Calculation Audit

Completed 11 September 2026. Scope: D0 and architecture/migration recommendations only, against the supplied **Sprinkles — Ice Cream Calculation Engine v0.1 SOW**. The document's later implementation instructions are not authorization to execute later phases. No engine, integration, schema migration, or maker-data changes were performed.

Audit reference: Git HEAD `99e436e7957d0c348c2f8a338e2a1037cc91fab5`, plus the existing working tree. Existing changes in `.planning` and `.impeccable` were left alone. All audit output and test copies are in this folder.

## Finding

There is one active composition implementation, `app/src/domain/composition.js`, already pure and independent of React and persistence. Reuse its mass-accounting approach, but **do not move the whole function unchanged**: its incomplete-data, water/solids, sugar, lactose, and PAC/POD semantics conflict with v0.1. The application already routes most consumers through this central function; that is a useful migration seam.

[Calculation inventory](calculation-inventory.md) records source locations, formulas, inputs, coefficient sources, consumers, tests, persistence implications, and migration dispositions. Paths there are relative to the project root. The recommendations describe future work, not changes made during this audit.

## Material behavior differences

1. **Missing composition becomes zero.** `computeBalance` uses `composition[key] ?? 0`; `weakestBasis` ignores missing/noncontributing values and can return `stated` for an entirely unknown property. There is no coverage/status envelope. A probe with 950 g at 10% fat and 50 g unknown reports 9.5% fat without uncertainty; v0.1 must identify 95 g as the known subtotal with 95% coverage and partial status. Existing sparse ingredient records need property-by-property characterization; their missing fields cannot all be relabeled known zero.
2. **Composition units differ.** Existing `fat: 0.035` is a fraction; the SOW requires `fat_pct: 3.5` in g/100 g. An explicit adapter must multiply composition fractions by 100. PAC/POD are different fields with different units; do not apply this conversion indiscriminately.
3. **Water and solids are inferred in the reverse direction.** Current solids sum fat + MSNF + generic sugar + other + emulsifier + stabilizer; water is mass minus that sum. v0.1 requires characterized water coverage before exact total solids. The seed's 473.4296 g water and 40.7976% solids are legacy estimates, not fully characterized v0.1 results.
4. **Lactose is always 54.5% of MSNF.** This contributes to PAC/POD without explicit lactose data. MSNF itself is an ingredient-level fraction, summed without checking dairy status. Keep existing facts and provenance, but do not silently convert this rule into characterized lactose. Use explicit lactose or an explicitly approved, versioned estimation policy; otherwise report partial/unavailable. MSNF coefficients need dairy provenance/vetting.
5. **PAC/POD normalization differs by 10×.** With unchanged component assumptions, current PAC/POD × 10 gives the SOW's per-1000-g reporting scale. The seed is PAC 24.06038 / POD 13.04614, or 240.60380 / 130.46139 after scale conversion alone. These are **not validated v0.1 results**. A 100 g sucrose + 900 g legacy neutral/water row probe returns 10/10 today; the SOW expects 100/100. Authored PAC `[22,26]` and POD `[12,16]` bands need unit-aware display conversion, not silent persisted rewrites. Rename POD to PRS deliberately and update labels, scales, provenance and comparisons together.
6. **Salt PAC is an unvetted estimate.** Fine sea salt has PAC 580 on the old sucrose=100 scale, sourced only as “colligative estimate.” It adds 2.32093 legacy PAC units (23.20928 on the new scale) to the seed. The SOW permits specifically characterized vetted coefficients, so salt is not categorically excluded; this record does not establish that vetting. Preserve legacy reproduction, and make new PAC coverage/limitations explicit until resolved.
7. **Generic sugar is not total identified sugar.** The current seed's 108 g excludes its separately inferred 37.046048 g lactose. v0.1's identified-sugar total must include characterized lactose. Individual sugar identity, syrup active mass, chemical form, ethanol and component contributions are absent. Generic dextrose's existing PAC 190 matches 1.90 numerically, but the anhydrous assumption must become explicit.
8. **Functional ingredients are already separated, but premix support is absent.** Lecithin is an emulsifier; the three gums are stabilizers. Their sums only feed solids today. The seed contains 1.2/1.04/0.48/0.16 g lecithin/LBG/guar/lambda, which is not the SOW's 4:4:2:1 reference premix. Do not rewrite that historical formulation to fit the reference fixture.
9. **“As-made total” fills missing actual amounts with plan amounts.** The row-level actual readers preserve unknown correctly, but `asMadeTotals` implements a hybrid total. A wholly unrecorded 100 g plan reports an as-made total of 100 g. Preserve or explicitly relabel this UI convention while calculating measured actual formulations separately; never claim its inferred denominator is fully measured. Actual formulation composition comparison does not yet exist.
10. **Current comparisons operate at display precision.** `buildDiff` compares formatted shares/one-decimal figures, while the engine needs full-precision numerical deltas and uncertainty on each side. Retain the UI highlighting convention outside the engine.

## Architecture and migration recommendation

Use **`app/src/ice-cream-engine/`** for the eventual independent pure ES-module boundary. The repository has one application package (`app/package.json`), Vite with the React plugin, and Vitest's Node environment. Keeping the engine under that package makes imports and test discovery straightforward without new workspaces, a second package, or tooling restructuring. Logical independence is sufficient under SOW §4. A root-level engine is possible, but offers no demonstrated benefit for v0.1; revisit extraction when another real consumer needs packaging.

Sprinkles adapters should filter removed rows, sum portions, preserve row/ingredient identity and embedded ingredient snapshots, map legacy units explicitly, and resolve batch actual portions. The engine should accept plain mass/composition inputs, own the authoritative calculations, and import no application modules. `rows.js` can retain portion aggregation as input preparation; the canonical engine total and fractions must have one implementation. Formatting, authored targets, method/equipment advisories, version creation and persistence stay with Sprinkles.

Future migration order:

1. Freeze current regression fixtures and define the legacy provenance/unit adapter. Resolve the policy questions below before selecting new numerical behavior.
2. Add the engine boundary, nullable inputs, independent model/coefficient versions, coverage, validation and component-level calculations.
3. Route `computeBalance`'s consumers through an adapter to engine results; update `figures`, `BasisNote`, `diff` and batch calculations together. Preserve display-only rules where appropriate. Any retained historical calculator must be explicitly version-selected and limited to legacy reproduction, never a competing authority for new v0.1 results.
4. Add pure candidate/planned-actual comparisons and migrate consumers; remove superseded formula branches once regression and migration tests pass.
5. Handle schema compatibility explicitly, preserving maker-authored versions, targets, batch snapshots and coefficients.

## Persistence implications

Versions embed cloned ingredient composition/basis/source data; batches snapshot rows and `coefficientSetId`. Library edits therefore do not automatically change historical inputs. However, `computeBalance` does not dispatch by stored coefficient-set ID, and `BasisNote` prints the global coefficient label. Changing code constants would change historical recalculation despite preserved IDs. Historical reproducibility needs frozen model behavior as well as frozen input coefficients.

`store/transfer.js:validateRow` accepts only finite numbers for present composition values, so explicit `null` fields cannot round-trip. Missing keys are currently allowed. The future adapter can preserve existing records while exposing engine nulls; persisting new nullable records requires corresponding schema/validator work.

`store/db.js` is at DB version 4 and deletes/recreates versions and batches when upgrading from a prior nonzero version. **Do not reuse this reset strategy for engine migration.** Whole-store transfer supports schema 4 only; version and batch schema numbers are separate. No live IndexedDB data was read or changed during this audit.

## Decisions to settle before implementation

No clarification was needed to complete Phase 0. These are unresolved implementation choices, not requests to extend this task:

- Whether legacy derived lactose/water and estimated salt PAC remain available only as historical results, or gain an explicitly defined estimation/vetting policy. The safe v0.1 default is partial/unavailable where characterization is absent.
- Whether the UI adopts new PAC/PRS units immediately or temporarily converts for existing authored bands, and how historical coefficient/model selection is represented.
- What an actual batch with missing portion masses means for result coverage and its denominator; distinguish measured totals from plan-filled estimates.
- Clarify SOW §26 precedence so explicit ingredient overrides and component calculations cannot double-count the same mass. Specify monohydrate composition versus product-mass coefficient handling, and how MSNF dairy provenance is represented.
- Define stable calculation IDs (including model/coefficient/input identity), comparison status propagation, numeric tolerance/order determinism, and the threshold for composition-sum/target-mass warnings. Floating-point summation is not exactly order invariant; the SOW's invariant needs a numerical tolerance or canonical ordering policy.

## Verification and stopping point

- Reviewed active source, tests, package/build configuration, persistence and transfer, plus design explorations and hidden HTML sketches. Excluded dependencies/generated output and Git history from calculation ownership. References to `old-sprinkles` in comments are provenance; that predecessor implementation is not present as an active imported module here.
- Ran existing domain, data and store tests against an isolated copy: **13 files, 374 tests passed**. Used existing dependencies, native config loading and disabled cache. No full UI/build claim is made. See [test-results.txt](test-results.txt).
- Executed read-only probes of the current functions: [probe-results.json](probe-results.json), with [reproducible script](probes.mjs). These characterize existing behavior, not new engine tests or implementation.
- Phase 0 is complete. Stop here; D1–D7 and subsequent SOW phases remain unperformed.
