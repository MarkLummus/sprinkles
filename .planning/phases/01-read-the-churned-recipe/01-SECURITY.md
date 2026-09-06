---
phase: "01"
slug: "read-the-churned-recipe"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-09-06"
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → build | Third-party package code executes at install and build time | Package code (vite, plugin-react, react, react-router, idb, vitest) |
| authored seed content → store | In-repo transcription written into IndexedDB on first run | Recipe version with embedded ingredient coefficients |
| store → domain → screen | Values crossing out of persistence into computation and display | Version rows, coefficients, computed figures |
| stored note strings → DOM | Headnote, instruction, purpose, aside, authored notes rendered | Free-text strings, rendered as text only |
| third-party origin → browser | Any font, script, stylesheet, or asset the page fetches | None permitted in milestone 1 |
| user-supplied JSON file → store | Import of a store file the maker chose | Untrusted JSON, validated before any write |
| device boundary | Nothing crosses it — no network, no account, no external model (TRUST-01, IMP-01) | None |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-SC | Tampering | npm installs of vite, @vitejs/plugin-react, react-router, vitest | high | mitigate | Exact versions pinned in `app/package.json` (idb 8.0.3, react 19.2.8, react-dom 19.2.8, react-router 8.3.1, @vitejs/plugin-react 6.1.1, vite 8.2.2, vitest 5.0.0); no caret/tilde ranges. Legitimacy gate recorded in 01-RESEARCH.md. | closed |
| T-01-01 | Information disclosure | `app/src/**` | medium | mitigate | No fetch, XMLHttpRequest, WebSocket, sendBeacon, or EventSource anywhere under `app/src` (grep clean). | closed |
| T-01-02 | Tampering | `app/src/data/library.js`, `app/src/data/olive-oil.js` | high | mitigate | Version rows embed `structuredClone(ingredient)` at authoring time (`olive-oil.js:13`); `composition.test.js:89` proves mutating the shared library does not move a stored version's PAC. | closed |
| T-01-03 | Repudiation | `app/src/data/olive-oil.js` | medium | mitigate | Version record carries `schemaVersion: 1` and `coefficientSetId: '2026.1-slice-transcription'` (`olive-oil.js:19,25`). | closed |
| T-01-04 | Denial of service | IndexedDB quota exhaustion | low | accept | Accepted — see AR-01. | closed |
| T-01-05 | Spoofing / Elevation of privilege | — | low | accept | Accepted — see AR-02. | closed |
| T-02-01 | Information disclosure | `app/index.html`, `app/src/styles/*` | high | mitigate | No `http(s)://` origin, `url()`, or `@import` in the document shell or stylesheets; type faces are system stacks (`tokens.css:12-13`). | closed |
| T-02-02 | Tampering | `app/src/ui/Method.jsx`, `Authored.jsx`, `RecipePage.jsx` | high | mitigate | No `dangerouslySetInnerHTML` or `innerHTML` anywhere under `app/src` (grep clean). | closed |
| T-02-03 | Tampering | `.impeccable/surfaces/route-recipe.md` | low | accept | Accepted — see AR-03. | closed |
| T-02-04 | Repudiation | design decisions made at build time | medium | mitigate | Direction contract in `route-recipe.md` names what is pinned and what is left open (§ 7 "Constraints and open decisions", "What stays open after this contract"). | closed |
| T-03-01 | Repudiation | `app/src/ui/BasisNote.jsx`, `app/src/domain/figures.js` | high | mitigate | `BasisNote.jsx` renders `COEFFICIENT_SET.name` imported from `domain/composition.js`, not typed; version carries the same id (T-01-03). | closed |
| T-03-02 | Tampering | `app/src/domain/figures.js` | high | mitigate | Band read via `Object.prototype.hasOwnProperty.call(targets, spec.targetKey)` (`figures.js:102`), never defaulted; `figures.test.js:77` asserts sugar band is null and reads "no target set". | closed |
| T-03-03 | Information disclosure | `app/src/ui/GraduatedRule.jsx` | medium | mitigate | Rule carries `aria-label={accessibleName}` (`GraduatedRule.jsx:71`); value, band, and deviation printed as text beside the drawing. | closed |
| T-03-04 | Tampering | `app/src/domain/figures.js` | medium | mitigate | No `.sort`, `.splice`, or assignment into `version`/`rows` in `figures.js`; pushes target local arrays only; `figures.test.js:170` confirms row order is not rewritten. | closed |
| T-03-05 | Denial of service | figure computation on render | low | accept | Accepted — see AR-04. | closed |
| T-04-01 | Tampering | `app/src/store/transfer.js` | high | mitigate | `validateStoreFile` checks shape, required fields, and `grams` as finite ≥ 0 (`transfer.js:47`); `importStore` returns the error list and writes nothing when `ok` is false. | closed |
| T-04-02 | Tampering | `app/src/store/transfer.js` | high | mitigate | `UNSAFE_KEYS` (`__proto__`, `constructor`, `prototype`) rejected by `scanForUnsafeKeys` before traversal (`transfer.js:8,25-35`); `transfer.test.js:162` asserts a fresh object stays unpolluted after a rejected import. | closed |
| T-04-03 | Information disclosure | `app/src/ui/RecipeList.jsx` | medium | mitigate | Export/import use local file APIs only; no network API under `app/src` (same gate as T-01-01). | closed |
| T-04-04 | Repudiation | `app/src/ui/GraduatedRule.jsx`, `IngredientTable.jsx` | high | mitigate | Figure prints "estimated: <rows>" / "unreviewed: <rows>" in text (`GraduatedRule.jsx:55-56`); table Data column prints the word "estimated" per row (`IngredientTable.jsx:21`). Confirmed by UAT tests 4 and 5. | closed |
| T-04-05 | Information disclosure | `app/src/styles/app.css` | medium | mitigate | `.is-marked` carries outline and `font-weight: 700` only (`app.css:127-131`); unmarked rows untouched; estimated flag is text. Confirmed by UAT tests 5 and 6. | closed |
| T-04-06 | Denial of service | import of a very large file | low | accept | Accepted — see AR-05. | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01 | T-01-04 | Single local user, one recipe record in milestone 1, records measured in kilobytes. Revisit if bulk import lands. | 01-01-PLAN.md threat model | 2026-09-06 |
| AR-02 | T-01-05 | No accounts, sessions, roles, or server exist in milestone 1; no identity to spoof, no privilege to elevate. | 01-01-PLAN.md threat model | 2026-09-06 |
| AR-03 | T-02-03 | The brief is an in-repo, git-tracked document; changes are visible in the diff. | 01-02-PLAN.md threat model | 2026-09-06 |
| AR-04 | T-03-05 | Six figures over at most fifteen rows, recomputed synchronously; no memoisation warranted. | 01-03-PLAN.md threat model | 2026-09-06 |
| AR-05 | T-04-06 | Single local user importing a file they chose; a size guard would add a limit with no basis for its number. Revisit if bulk import lands. | 01-04-PLAN.md threat model | 2026-09-06 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-06 | 21 | 21 | 0 | /gsd-secure-phase (L1 grep-depth short-circuit; register authored at plan time) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-06
