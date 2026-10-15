---
phase: "06"
slug: "the-ingredient-library-in-the-store"
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-15"
---

# Phase 06 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Store upgrade | A returning browser profile at database version 8 opens at 9 | Maker's recipes, versions, batches, drafts (must survive) |
| Boot seed | Two tabs may seed the library at once, or a seed may run after an import | Seeded library records vs records an import changed |
| Backup file in | A file the maker picks is parsed and written to four stores | Untrusted JSON: recipes, versions, batches, library |
| Backup file out | The four stores are read into one file | Library and records; drafts stay on the device |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 | Tampering (data loss) | db.js upgrade 8 to 9 | high | mitigate | Reset branch bounded to profiles below 8; only a guarded library create added (db.js:24, 54-56); version-8 fixture test | closed |
| T-06-02 | Tampering (partial write) | putAllLibrary | low | mitigate | Abort-by-hand catch (repository.js:104-121); unclonable-record test | closed |
| T-06-03 | Tampering (integrity) | library change reaching stored figures | high | mitigate | Rows and batch snapshots are structuredClone copies; no production reader of the library store; real-IndexedDB and export/import tests | closed |
| T-06-04 | Denial of service (integrity) | interrupted or parallel boot seed | medium | mitigate | Two independent guards, put-by-key writes, abort-by-hand (seed.js:21-28); interrupted-seed and parallel-seed tests | closed |
| T-06-05 | Tampering | later boot overwriting library records | low | mitigate | Count then write in one transaction; a filled library is never written (repository.js:136-139) | closed |
| T-06-06 | Tampering | malformed library record in an imported file | medium | mitigate | validateLibraryRecord and required $.library (transfer.js:218-241, 598-602); validation precedes any write | closed |
| T-06-07 | Tampering / Elevation | prototype-mutating keys in a library entry | high | mitigate | scanForUnsafeKeys over the whole payload (transfer.js:564) | closed |
| T-06-08 | Tampering (integrity) | part-applied import across four stores | high | mitigate | importAll is one readwrite transaction over four stores with abort-by-hand (repository.js:158-180) | closed |
| T-06-09 | Tampering (integrity) | torn backup from a second tab mid-export | medium | mitigate | exportAll is one readonly transaction over four stores; aborts and quiets reads on failure (repository.js:185-208) | closed |
| T-06-10 | Information disclosure | drafts leaking into the export | medium | mitigate | exportAll never names drafts; exportStore returns a fixed key list | closed |
| T-06-11 | Tampering | unchecked entry fields carried into the store | low | accept | See Accepted Risks Log | closed (accepted) |
| T-06-12 | Denial of service | very large library list in a chosen file | low | accept | See Accepted Risks Log | closed (accepted) |
| T-06-13 | Tampering (integrity) | second tab's seed writing over records | medium | mitigate | Check and write in one readwrite transaction in seedLibraryIfEmpty (repository.js:130-152); two-connection and held-seed tests | closed |
| T-06-14 | Tampering / Elevation | library id of __proto__, constructor or prototype | medium | mitigate | UNSAFE_KEYS check on record.id (transfer.js:224); it.each test over all three | closed |
| T-06-15 | Tampering (integrity) | held seed after an import changed a record | medium | mitigate | Same mitigation as T-06-13 (cross-reference); held-seed test with a real importStore (library.test.js:361) | closed |
| T-06-SC | Tampering (supply chain) | npm installs | high | mitigate | No dependency changed: package.json and package-lock.json identical to d66a3ed | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on (high) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-11 | The validator checks the file wrapper only. Nothing outside tests reads library entries, and no markup is rendered from them (no dangerouslySetInnerHTML). Reasoning from 06-03-PLAN.md threat register. | Plan 06-03 (plan-time disposition) | 2026-10-15 |
| AR-06-02 | T-06-12 | A local file the maker picks; the same exposure the other three lists already carry. Reasoning from 06-03-PLAN.md threat register. | Plan 06-03 (plan-time disposition) | 2026-10-15 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-15 | 16 | 16 | 0 | gsd-security-auditor (ASVS 1, block_on high) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-15
