---
phase: "12"
slug: "showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo"
status: draft
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-16"
---

# Phase 12 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

The register was authored at plan time (the `<threat_model>` blocks of plans 12-01 to 12-07). It was verified by gsd-security-auditor on 2026-11-16 at ASVS level 1, block_on high. Evidence paths under `12-*.mjs` are in this phase folder.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| stored definition to screen and paper | a scale's name, end words and problems, typed by the maker or arriving in an imported store file, are drawn on the pen, the reading, the editor and the print route | maker text, untrusted as markup |
| store file to profile | the exported file crosses into a second profile through Import, behind validateStoreFile | the whole store |
| harness to network and disk | the probes, walks, board engine and checks load a scratch build and could fetch beyond 127.0.0.1 or write the build Mark serves | none intended |
| loopback server to Simulator and WKWebView | 12-safari-check.mjs serves the scratch build and a seed page on 127.0.0.1 and takes a report by POST | test fixtures only |
| evidence to decision | PASS lines and SUMMARY wording are what the verifier and Mark read as conformance | claims |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-12-01 | Tampering | Low to high words drawn as markup in AxisMark, the reading, the stops line | low | mitigate | React text children (AxisMark.jsx:74,114-116; BatchRow.jsx:309-310; CreationSetup.jsx:289); tag-carrying pins in AxisMark.test.jsx:177-183, BatchRow.test.jsx:2932-2942, CreationSetup.test.jsx:416; no dangerouslySetInnerHTML under app/src | closed |
| T-12-02 | Tampering | reading taking its kind from the live version | medium | mitigate | BatchRow.jsx:292 axesForBatch(batch); snapshot-versus-live test BatchRow.test.jsx:2909-2912 | closed |
| T-12-03 | Tampering | unknown kind from a hand-edited store file | low | mitigate | catalog.js:53 refuses it; transfer.js:377, :428 inside validateStoreFile (:686) before any write (:828); axes.js:26-28 reads only 'magnitude' as Low to high; axes.test.js:204-213, 245-253 | closed |
| T-12-17 | Tampering | scratch build overwriting app/dist | low | mitigate | builds go to ${TMPDIR}/sprinkles-12/...; app/dist last changed before the phase | closed |
| T-12-05 | Tampering | Low to high words printed as markup | low | mitigate | PrintLogPages.jsx:153,160,163,200-201 text children; PrintLogPages.test.jsx:209-217 | closed |
| T-12-06 | Repudiation | print check passing a spilled log or a missing drop | medium | mitigate | 12-print-check.mjs:304-328 fit FAILs past 810 or 864; :190-217 drop reads computed padding on both media; 12-safari-check.mjs:302-326 and 12-wkprint.swift:71-95 PDF check. Limit: the failing checks cover case two only; the long-words case (worst) is REPORT-only by decision (Open Question 2), so a GATE1 PASS does not mean every recipe's log fits one sheet | closed |
| T-12-07 | Information disclosure | print check reaching the network or writing app/dist | low | mitigate | 12-print-check.mjs:50-61 PROBE_DIST required; :75-84 127.0.0.1 only; no fs writes | closed |
| T-12-08 | Tampering | store file accepted half-written | low | mitigate | 12-roundtrip.mjs:339 imports through the shell's file input (Shell.jsx:528, transfer.js:828); :586-612 no import-errors panel and field-by-field compare | closed |
| T-12-09 | Information disclosure | walk touching Mark's profile, a non-local host, or --out outside scratch | medium | mitigate | In place: fresh contexts, 127.0.0.1-only requests (12-roundtrip.mjs:140-163), PROBE_DIST required (:69-77), the shipped --out call writes under sprinkles-12 (12-roundtrip-check.sh:20,27). Gap: the --out guard (:86-90) accepts any path under $TMPDIR, not only ${TMPDIR}/sprinkles-12 as the register says. One-line fix: resolve SCRATCH with 'sprinkles-12' | open — below high threshold (non-blocking) |
| T-12-10 | Repudiation | round trip passing while the built loop is broken | medium | mitigate | 12-roundtrip.mjs:329 download event on Export; :339 setInputFiles; :252-317 creation through the editor's controls; no store function called | closed |
| T-12-19 | Repudiation | surface spec passing vacuously | medium | mitigate | 12-board-logs.mjs:91-111 declared foot-words substitution (three pages: Coffee Batch log, Coffee Tasting log, Mint chip Tasting log; the plan said two); :79, :108 declared absences; :64 pageHeight on all four log panels; the 1 px run moved all sixteen panels | closed |
| T-12-12 | Information disclosure | engine reaching the network or writing app/dist | low | mitigate | 12-board-check.mjs:440-442 127.0.0.1 only; :424 boards from file: only; writes only to the evidence folder. Note: PROBE_DIST still defaults to app/dist read-only (:132) and --evidence has no folder check; scratch is kept by how runs are invoked | closed |
| T-12-13 | Repudiation | Simulator, Playwright or WKWebView result read as iPad proof | medium | mitigate | 12-05-SUMMARY.md:47, :95 and the scripts' own labels say device-unverified; no Phase 12 device row was written to Mark's List (orchestrator, 2026-11-16) | closed |
| T-12-14 | Information disclosure | check's server reachable beyond the Mac | low | mitigate | 12-safari-check.mjs:236 binds 127.0.0.1; reports in memory (:98, :209); 204 no body (:213-214); server.close() in finally (:482) | closed |
| T-12-15 | Tampering | seed page or outputs written into app/ or the build | low | mitigate | 12-safari-check.mjs:102-183, :197-198 seed from memory; :50 outputs under evidence-05; :66-69 refuses app/dist | closed |
| T-12-04 | Information disclosure | probe reaching the network or writing app/dist | low | mitigate | 12-stops-probe.mjs:41-52, :62-71, :258; no fs writes | closed |
| T-12-16 | Repudiation | base report built from a tree that already holds 12-01 | medium | mitigate | 12-06-SUMMARY.md:48 names e37db11a; the check FAILs on pen, reading and editor there | closed |
| T-12-11 | Repudiation | board engine passing vacuously | medium | mitigate | 12-board-check.mjs:174-178, :702-710 missing panel is a FAIL; :163-164 one panel reference; :411-432, :714, :753-754 against side on its own Page; :364-381 declared absences; selftest 19 PASS with five refusals | closed |
| T-12-18 | Information disclosure | engine's own proof reading Mark's build | low | mitigate | 12-board-check.mjs:424, :713-716; 12-board-selftest.mjs:21-24 runs with an empty scratch PROBE_DIST | closed |
| T-12-SC | Tampering | npm/pip/cargo installs | low | accept | no package installed: app/package.json and app/package-lock.json unchanged since e37db11a | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-12-01 | T-12-SC | No package is installed in this phase (RESEARCH Package Legitimacy Audit: none); verified against the lockfile | plan 12-01 to 12-07 (plan-time disposition) | 2026-11-16 |

*Accepted risks do not resurface in future audit runs.*

---

## Notes for the verifier

- 12-check.sh does not reach GATE1 PASS on merged main: every Phase 12 step passes and the last step, the Phase 11 walk, fails 15 scenarios. This bears on no threat's mitigation (a gate that refuses loudly is not a false pass), but the Phase 11 flows are not re-proven on the Phase 12 build by that walk.
- 12-05-SUMMARY lists requirements-completed beside gate1: FAIL.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-16 | 20 | 19 | 1 (medium, non-blocking) | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [ ] `status: verified` set in frontmatter

**Approval:** pending (T-12-09's --out guard is open below the blocking threshold)
