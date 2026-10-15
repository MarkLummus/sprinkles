---
phase: "05"
slug: "split-the-recipe-page"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-15"
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Stored row ids to draft keys | Row ids from stored versions, batches and imported files become keys and lookups in pen and record drafts | Untrusted ids, including `__proto__`, `constructor`, `prototype` |
| Drafts store to pen state | A kept draft in IndexedDB is restored into usePenDraft or useRecordDraft | Kept draft objects |
| Stored batch to record draft | draftFromBatch copies a stored batch into a draft | Batch fields, as-made values |
| Record draft to stored batch | Save assembly turns a draft into a stored record | Measured fields, tasting marks, notes |
| Page components to pen ops | Field and list names are literals from the page's own call sites | Field names |
| Notes and prose to markup | Typed notes render as text, never as markup | Maker's prose |
| Walk script to local build | 05-walk.mjs serves a scratch build on ephemeral 127.0.0.1 ports | Scratch build only; never :4173 or :8077 |
| npm registry to workspace | No manifest or lockfile changed during the phase | Dependencies |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-05-01 | Tampering / Information disclosure | 05-walk.mjs serving and browsing | low | mitigate | Listens on 127.0.0.1 ephemeral ports; every other host aborted (05-walk.mjs:79-86); fresh contexts; scratch outDir | closed |
| T-05-02 | Tampering / Elevation | draft-row reads by id | low | mitigate | Own-key reads through penDraftRow (penDraft.js:16-18) at the five declared sites; penDraft.test.js:50-70 | closed |
| T-05-03 | Tampering (integrity) | moved pen dirty check | low | mitigate | isPenDraftDirty identical to 4f1f98f apart from the accessor; it() counts unchanged; walk drafts dump matches | closed |
| T-05-04 | Tampering | computed keys in pen ops | low | mitigate | Literal field and list names at every call site; row reads through penDraftRow; penDraft.test.js:210 | closed |
| T-05-05 | Tampering | kept-draft restore into usePenDraft | low | mitigate | draftMatchesVersion runs before restore (RecipePage.jsx:511, 535); carriesUnsafeKey refuses prototype keys (draft.js:112-117); RecipePage.drafts.test.jsx:405 | closed |
| T-05-06 | Tampering (integrity) | moved save assembly and record dirty check | medium | mitigate | Save assembly identical to 4f1f98f apart from an Object.fromEntries hardening; it() counts unchanged; RECORD_DRAFT_KEYS pin; walk store dumps match | closed |
| T-05-07 | Tampering / Elevation | draftFromBatch reads of a stored batch | low | mitigate | Own-entry copy, no mutation of input (recordDraft.js:258-263); recordDraft.test.js:128-159 | closed |
| T-05-08 | Tampering | setAsMadePortion row-id keys | low | accept | Accepted at plan time; later superseded by the Object.fromEntries rebuild (recordDraft.js:504-518, c33594a) and by import refusing reserved row ids (transfer.js:105, c642340) | closed (accepted, superseded) |
| T-05-09 | Tampering | kept record and amend draft restore | low | mitigate | draftMatchesVersion first, then amend redirect, then recordPen.restore (RecipePage.jsx:511-544); draft.js:236-264; walk scenarios match | closed |
| T-05-10 | Information disclosure | notes and prose typed into the record pen | low | mitigate | No JSX in useRecordDraft.js or recordDraft.js; RecipePage.shell.test.js:184-195; no innerHTML-family use in app/src | closed |
| T-05-11 | Tampering (integrity) | the split as a whole | medium | mitigate | WebKit walk of HEAD compares MATCH 94 snapshots against the baseline, store dumps included; baseline never edited | closed |
| T-05-12 | Information disclosure / Injection | notes and prose rendered by the page | low | mitigate | RecipePage.shell.test.js:184-195 over the six files; string-aware stripComments covered at :71-94 | closed |
| T-05-SC | Tampering (supply chain) | npm installs | high | mitigate | package.json and package-lock.json identical from the phase base to HEAD | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on (high) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-08 | Accepted in plan 05-05: "moved verbatim". The reasoning was wrong (05-REVIEW WR-01: a prototype-named id dropped the maker's as-made grams and made the pen look clean). Superseded by c33594a and c642340; closed on code evidence. | Plan 05-05 (plan-time disposition) | 2026-10-15 |

*Accepted risks do not resurface in future audit runs.*

---

## Notes From The Audit

- **Unregistered flag (low, not blocking):** `noteOrigins` (added in commit 737d2be) is not shape-checked on restore (`fitsPlanShape`, draft.js:190-219). A kept draft with `noteOrigins: {beforeYouStart: [99]}` passes `draftMatchesVersion`, and the next note edit throws a TypeError inside the state updater (penDraft.js:385-389). Local only: the drafts store is not exported or imported, and the app writes only valid origins. Recorded as a bug row on Mark's List for triage.
- **T-05-10 wording:** the plan says the guard scans `app/src`; the test checks six files (BatchRow.jsx is not one). It holds today because a grep finds no non-comment innerHTML-family use.
- **T-05-02 sixth read:** `domain/lineage.js:224` (`findBlockedRow`) reads `penFields.rows[row.id]` without the own-key check. Safe in practice: every version row has an own key and a `__proto__` key is refused. Noted in 05-02-SUMMARY.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-15 | 13 | 13 | 0 | gsd-security-auditor (ASVS 1, block_on high), HEAD 03ca0bd |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-15
