---
phase: 01-read-the-churned-recipe
reviewed: 2026-09-05T23:00:00Z
depth: standard
files_reviewed: 31
files_reviewed_list:
  - .claude/CLAUDE.md
  - .impeccable/surfaces/route-recipe.md
  - CLAUDE.md
  - app/.gitignore
  - app/index.html
  - app/package.json
  - app/src/data/library.js
  - app/src/data/olive-oil.js
  - app/src/data/olive-oil.test.js
  - app/src/domain/composition.js
  - app/src/domain/composition.test.js
  - app/src/domain/figures.js
  - app/src/domain/figures.test.js
  - app/src/main.jsx
  - app/src/router.jsx
  - app/src/store/db.js
  - app/src/store/repository.js
  - app/src/store/seed.js
  - app/src/store/seed.test.js
  - app/src/store/transfer.js
  - app/src/store/transfer.test.js
  - app/src/styles/app.css
  - app/src/styles/tokens.css
  - app/src/ui/Authored.jsx
  - app/src/ui/BasisNote.jsx
  - app/src/ui/FormulationNote.jsx
  - app/src/ui/GraduatedRule.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipePage.jsx
  - app/vite.config.js
  - app/vitest.config.js
findings:
  critical: 1
  warning: 3
  info: 4
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-09-05T23:00:00Z
**Depth:** standard
**Files Reviewed:** 31
**Status:** issues_found

## Summary

The domain layer (`composition.js`, `figures.js`) is clean, well-tested (72 passing tests), framework-free as required, and its figures verifiably reproduce the printed sheet's numbers within the documented tolerance. The store seam and the CSS token discipline are respected — only `db.js` imports `idb`, and no component or stylesheet carries a raw colour/spacing literal.

The one blocking finding is in the import path: `validateStoreFile` — described in its own doc comment as "the only gate before a write" — does not validate `version.method` or `version.authored`, both of which `RecipePage.jsx` dereferences unconditionally (`version.authored.carriedForward`, `version.method.map(...)`). A store file that satisfies every check the validator runs (has `id`, `recipeName`, `coefficientSetId`, non-empty `rows`) but omits `method` or `authored` — a plausible hand-edited or partially-authored export — passes `importStore` with `ok: true` and then crashes the recipe page the next time it's opened. This directly undercuts the feature's own stated purpose (T-04-01, "a malformed file can never half-apply").

Also flagged: a latent inconsistency between `weakestBasis` (ignores `grams`, only checks the composition coefficient) and `buildFigures`' own contributor logic (which correctly gates on `grams`), which will produce a basis label with no named rows once struck (0-gram) rows exist in Phase 3; an `Export` button that revokes its object URL synchronously without appending the anchor to the DOM; and a few small duplication/maintainability items.

## Critical Issues

### CR-01: Import validator omits `method` and `authored`, which `RecipePage` dereferences unconditionally — a validator-approved file crashes the recipe view

**File:** `app/src/store/transfer.js:61-74` (validator), `app/src/ui/RecipePage.jsx:70,75`
**Issue:**
`validateVersion` in `transfer.js` only checks `id`, `recipeName`, `coefficientSetId`, and `rows`:

```js
function validateVersion(version, path, errors) {
  if (!isPlainObject(version)) { ... }
  if (!isNonEmptyString(version.id)) errors.push(...);
  if (typeof version.recipeName !== 'string') errors.push(...);
  if (typeof version.coefficientSetId !== 'string') errors.push(...);
  if (!Array.isArray(version.rows) || version.rows.length === 0) { ... }
  // no check for version.method or version.authored
}
```

`RecipePage.jsx` renders both fields without any guard:

```jsx
<Method steps={version.method} />
...
<Authored carriedForward={version.authored.carriedForward} beforeYouStart={version.authored.beforeYouStart} />
```

`Method` immediately calls `steps.map(...)` and `Authored` immediately reads `.carriedForward`/`.beforeYouStart` off its props. A store file with valid `id`/`recipeName`/`coefficientSetId`/`rows` but no `method` or `authored` key — easy to produce by hand-editing an exported file, or exporting from a future version of the schema that hasn't added these fields yet — passes `validateStoreFile` (`ok: true`) and is written via `importStore`/`repository.putAll`. The next time that recipe is opened, `RecipePage` throws (`Cannot read properties of undefined (reading 'carriedForward')`, or `.map is not a function`), and because there's no error boundary anywhere in the app, the whole page goes blank. This is exactly the failure mode the transfer module's own comment says it prevents ("a malformed file can never half-apply and leave versions that misstate what they were computed from") — the validator's own doc comment (`transfer.js:76-80`) calls it "the one gate before a write," but the gate has a hole two of the page's own components depend on.

**Fix:** Either close the gap in the validator (preferred, since it is the documented single gate):
```js
function validateVersion(version, path, errors) {
  // ...existing checks...
  if (!Array.isArray(version.method)) {
    errors.push(`${path}.method: expected an array`);
  }
  if (!isPlainObject(version.authored) ||
      !Array.isArray(version.authored.carriedForward) ||
      !Array.isArray(version.authored.beforeYouStart)) {
    errors.push(`${path}.authored: expected { carriedForward: [], beforeYouStart: [] }`);
  }
}
```
or, at minimum, guard the render site so a missing field degrades instead of crashing:
```jsx
<Method steps={version.method ?? []} />
<Authored
  carriedForward={version.authored?.carriedForward ?? []}
  beforeYouStart={version.authored?.beforeYouStart ?? []}
/>
```
The validator fix is the more correct one, since it keeps the "one gate" promise the code itself makes.

## Warnings

### WR-01: `weakestBasis` ignores `grams`, unlike `buildFigures`' own contributor gate — will report a basis with no named rows once rows can be struck to 0 g

**File:** `app/src/domain/composition.js:68-76`, `app/src/domain/figures.js:105-123`
**Issue:** `weakestBasis` decides whether a row "contributes" to a field using only the composition coefficient:
```js
export function weakestBasis(rows, field) {
  let worst = 'stated';
  for (const row of rows) {
    if (!(row.ingredient.composition[field] > 0)) continue;   // no grams check
    const basis = row.ingredient.basis?.[field] ?? 'inherited';
    if (BASIS_RANK[basis] > BASIS_RANK[worst]) worst = basis;
  }
  return worst;
}
```
`buildFigures`, by contrast, correctly requires a non-zero mass contribution before treating a row as a contributor:
```js
const contributes = spec.fields.some((field) => (row.ingredient.composition[field] ?? 0) * row.grams > 0);
```
`figures.js` computes a figure's `basis` field via `weakestBasis(version.rows, field)` (the ungated function) but computes `estimatedRowNames` via the grams-gated loop. The two will disagree the moment a row has `grams === 0` while still carrying a composition coefficient — exactly the shape the surface brief describes for Phase 3 ("a row removed, struck, restorable," §5 of `route-recipe.md`). In that case `GraduatedRule` would render `basis === 'estimated'` (from the ungated calculation) with `estimatedRowNames === []` (from the gated one), producing `"estimated: "` with no rows named — the opposite of what D-04/T-04-04 ask for ("naming the rows it rests on"). Not visible today (all seeded rows have positive grams), but it's a real bug in code Phase 3 will build directly on top of.
**Fix:** Gate `weakestBasis` on mass contribution the same way `buildFigures` does:
```js
if (!((row.ingredient.composition[field] ?? 0) * row.grams > 0)) continue;
```

### WR-02: Export button revokes its Blob URL synchronously and never attaches the anchor to the DOM

**File:** `app/src/ui/RecipeList.jsx:26-35`
**Issue:**
```js
async function handleExport() {
  const exported = await exportStore(repository);
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'sprinkles-store.json';
  anchor.click();
  URL.revokeObjectURL(url);
}
```
The anchor is never appended to `document.body`, and `URL.revokeObjectURL` is called on the same tick as `.click()`. Both are well-known cross-browser download foot-guns: several browser versions require a `download`-attribute anchor to be attached to the DOM for the click to reliably trigger a save, and revoking the object URL before the browser has finished processing the download request can silently abort it. This is the app's only backup/restore mechanism (per the phase's threat register, T-04-03) for a local-only store, so a flaky export is a real loss-of-data-recourse risk, not just cosmetic.
**Fix:**
```js
document.body.appendChild(anchor);
anchor.click();
anchor.remove();
setTimeout(() => URL.revokeObjectURL(url), 0);
```

### WR-03: No error handling around store startup — a failed `openDB`/`seedIfEmpty` leaves a permanently blank page

**File:** `app/src/main.jsx:9`, `app/src/store/db.js:8-14`
**Issue:** `main.jsx` does `await seedIfEmpty(repository);` at module top level with no try/catch, and `openStore()` in `db.js` registers no `blocked`/`terminated` handler on `openDB`. If IndexedDB is unavailable or blocked (private-browsing restrictions, a stale connection from another tab holding an upgrade lock, storage quota errors), the awaited promise rejects, the module throws during evaluation, and `createRoot(...).render(...)` never runs — the maker sees a permanently blank page with no diagnostic, for an app whose core value proposition is "a maker must still be able to develop a recipe... and get back a record of what happened."
**Fix:** Wrap the seed call and surface a visible fallback:
```js
try {
  await seedIfEmpty(repository);
} catch (err) {
  document.getElementById('root').textContent = 'Could not open the local store. Try reloading.';
  throw err;
}
```

## Info

### IN-01: `repository.getAll()` and `repository.listVersions()` are identical implementations

**File:** `app/src/store/repository.js:9-24`
**Issue:** Both methods do `const db = await dbPromise; return db.getAll('versions');` — two names for the same operation, one used by the UI and one used by `transfer.js`. Not wrong, but it's an unnecessary surface on the repository seam that two different call sites now have to remember to keep interchangeable.
**Fix:** Pick one name and use it from both call sites, or have one delegate to the other (`getAll() { return this.listVersions(); }`).

### IN-02: Basis-ranking logic is implemented three times with three separate `BASIS_ORDER`/`BASIS_RANK` literals

**File:** `app/src/domain/composition.js:66`, `app/src/domain/figures.js:112-116`, `app/src/ui/IngredientTable.jsx:7-17`
**Issue:** `composition.js`'s `BASIS_RANK`, `IngredientTable.jsx`'s `BASIS_ORDER`/`weakestRowBasis`, and the inline `isEstimated` check in `figures.js` all re-implement "walk a set of composition fields, rank basis stated < derived < estimated < inherited, keep the worst" — with the ranking order duplicated as a literal array/object in each place. A future change to the ranking (e.g., adding a fifth basis tier) has to be applied in three places to stay consistent, with no test that would catch a divergence.
**Fix:** Not urgent given the current size, but worth consolidating the ranking table into one exported constant (e.g., from `composition.js`) that the other two import.

### IN-03: `GraduatedRule.jsx`'s rule-drawing constants duplicate `tokens.css` values with nothing enforcing the mirror

**File:** `app/src/ui/GraduatedRule.jsx:13-17`, `app/src/styles/tokens.css:33-38`
**Issue:** `RULE_BASELINE = 1.5`, `RULE_GRADUATION = 1`, `RULE_BAND_EDGE = 1`, `RULE_TICK = 2.5`, `HATCH_STROKE = 1.2` are plain numbers justified by a comment as necessarily numeric (SVG presentation attributes need unitless user-space values, unlike `stroke="var(--ink)"` which works for colour). The rationale for using numbers instead of CSS values is sound, but the numbers themselves are copy-pasted from `--rule-baseline: 1.5px` etc. in `tokens.css` with no mechanism keeping them in sync — a change to the token file silently stops matching the rendered rule.
**Fix:** Low priority; if `tokens.css`'s rule weights ever change, a comment reminder or a small build-time check would prevent silent drift. Not worth restructuring for a single-recipe phase 1.

### IN-04: `Authored.jsx` list keys are derived from note text, not a stable id

**File:** `app/src/ui/Authored.jsx:12-14, 21-23`
**Issue:** `key={note}` for both the `carriedForward` and `beforeYouStart` lists. Fine while every note string is unique (true of the seeded data), but two identical authored notes (plausible once makers are typing free text in Phase 3) would collide as React keys, which is a silent correctness issue in list reconciliation, not just a console warning.
**Fix:** Key by index or by a stable per-note id once notes become editable content rather than static seed data: `carriedForward.map((note, i) => <li key={i}>{note}</li>)`.

---

_Reviewed: 2026-09-05T23:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
