---
phase: quick-261122-tqp
plan: 01
quick_id: 261122-tqp
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs
  - .planning/quick/261122-tqp-bug-p12-probes-accept-app-dist-copy-the-probe-dist-app-dist/261122-tqp-SUMMARY.md
autonomous: true

must_haves:
  truths:
    - "Run from the checkout's root, `PROBE_DIST=app/dist node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs` exits 1 and prints exactly one line, starting \"FAIL PROBE_DIST resolves to app/dist\". No server starts, no browser opens, and no file inside app/dist is opened or listed (closes the gap in 12-SECURITY.md row T-12-48)"
    - "The same holds for `PROBE_DIST=app/dist node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs move keys lines`"
    - "Both probes also refuse a scratch folder whose path ends in app/dist, and still let an ordinary scratch folder through to their own index.html check (an empty scratch folder prints \"FAIL no index.html in PROBE_DIST\")"
    - "The refusal in both probes is line for line the block at 12-phone-probe.mjs:45-59 (realOf plus the three-clause if), placed after `const DIST = path.resolve(process.env.PROBE_DIST);` and before the index.html check, as in 12-phone-probe.mjs"
    - "Nothing under app/ changes. 12-check.sh, 12-phone-probe.mjs and 12-SECURITY.md are not edited"
  artifacts:
    - path: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh"
      provides: "The reproducing test: runs 12-phone-probe.mjs, 12-tab-probe.mjs and 12-keys-probe.mjs against a decoy app/dist, the real app/dist (only after the decoy was refused) and a plain scratch folder. Ends REFUSAL PASS or exits 1"
    - path: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs"
      provides: "The app/dist refusal before the index.html check"
    - path: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs"
      provides: "The app/dist refusal before the index.html check"
  key_links:
    - from: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh"
      to: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs"
      via: "PROBE_DIST=<decoy>/app/dist, then PROBE_DIST=app/dist only when the decoy was refused"
    - from: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs"
      to: ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs"
      via: "startServers(DIST) is reached only after the refusal and the index.html check have passed"
---

<objective>
12-tab-probe.mjs and 12-keys-probe.mjs serve any PROBE_DIST that holds an index.html, Mark's own app/dist included. 12-14-PLAN.md:125 says every round-two probe refuses app/dist. 12-SECURITY.md row T-12-48 found that `PROBE_DIST=app/dist node 12-tab-probe.mjs` served app/dist read-only and walked it. This plan copies the refusal block from 12-phone-probe.mjs:44-59 into both probes and shows that each one refuses app/dist.

Purpose: Mark serves app/dist to his iPad with `vite preview --host`, and no Phase 12 probe may serve or walk it.
Output: one new check script (written first, failing on the two probes as they stand) and the copied block in the two probes. No app/ change.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.planning/STATE.md

The source of the copy, and the two targets (read each once):
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs lines 27-63. The imports include realpathSync. HERE and REPO_ROOT are defined at 38-39, before the unset check at 40. DIST is at 44. realOf and the refusal are at 45-59. The index.html check is at 60-63.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs lines 32-61. Line 34 imports only existsSync from node:fs. Lines 38-46 load playwright-core. Lines 48-57 hold the unset check, DIST at 53 and the index.html check at 54-57. HERE and REPO_ROOT come only at 59-60, after the check, and BOARD at 61 uses REPO_ROOT.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs lines 26-61. Line 28 imports existsSync and readFileSync from node:fs. Lines 32-40 load playwright-core. Lines 42-51 hold the unset check, DIST at 47 and the index.html check at 48-51. HERE is defined only at 53. There is no REPO_ROOT. BOARD at 54 uses HERE. The mode check at 56-61 comes after the PROBE_DIST check.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh lines 27-51 hold the house style for a check script (POSIX sh, `cd "$(git rev-parse --show-toplevel)"`, scratch under "${TMPDIR:-/tmp}/sprinkles-12/" keyed by the checkout's directory name). Do not edit it.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-SECURITY.md line 91 (row T-12-48). Read only. Do not edit it.

Grounded at planning time (HEAD b06add6f):
- With PROBE_DIST set to an empty scratch folder whose path ends in /app/dist, 12-phone-probe.mjs page exits 1 and prints one line, "FAIL PROBE_DIST resolves to app/dist (...)". 12-tab-probe.mjs and 12-keys-probe.mjs move both exit 1 and print one line, "FAIL no index.html in PROBE_DIST ...". That difference is the defect, reproduced without touching app/dist.
- With PROBE_DIST set to an empty scratch folder named dist, all three print "FAIL no index.html in PROBE_DIST ...".
- 12-band-probe.mjs and 12-device-steps.mjs already carry the phone probe's block line for line. They are not part of this item.
- app/dist exists in Mark's main checkout and is git-ignored, so a fresh worktree has none.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write 12-refusal-check.sh and show that it fails on the tab and keys probes as they stand</name>
  <files>.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh</files>
  <precondition>playwright-core exists at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, or PLAYWRIGHT_CORE names it. 12-tab-probe.mjs and 12-keys-probe.mjs import it before their PROBE_DIST check, and without it they print the playwright FAIL instead of reaching the guard.</precondition>
  <behavior>
    - 12-phone-probe.mjs page (the control, which already refuses): PASS on decoy, app/dist and scratch.
    - 12-tab-probe.mjs, unfixed: FAIL on decoy, because the one line it prints starts "FAIL no index.html". The app/dist case is SKIPPED, not run. PASS on scratch.
    - 12-keys-probe.mjs move keys lines, unfixed: the same as the tab probe.
    - The script exits 1 and its last line is "REFUSAL FAIL 2".
  </behavior>
  <action>Create the check script as a POSIX sh file in the style of 12-check.sh: a header comment, then `set -u` and `cd "$(git rev-parse --show-toplevel)"`. Use no bash-only syntax, because 12-check.sh is run with sh.

The header comment says what the script proves. Each round-two probe that the item names refuses a PROBE_DIST resolving to app/dist, and it does so before it opens any file in that folder. The header also states the safety rule. Each probe is first pointed at a decoy, an empty scratch folder whose path ends in app/dist. Only a probe that refused the decoy is then run with PROBE_DIST=app/dist, because the refusal's endsWith clause that caught the decoy also catches app/dist before the index.html check. An unrefused probe is never pointed at Mark's served build. Give the usage line `sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh` and say that every result is a Node run on a Mac, with no browser.

Set PHASE to the phase directory, relative to the root, as 12-check.sh does. Set SCRATCH to "${TMPDIR:-/tmp}/sprinkles-12/refusal-$(basename "$(pwd)")". Set DECOY to "$SCRATCH/decoy/app/dist" and PLAIN to "$SCRATCH/plain/dist". Create both with `mkdir -p` and remove any index.html from them with `rm -f`. Never remove a folder recursively. Neither folder may hold an index.html.

Write one helper that runs a probe with a given PROBE_DIST and its arguments. It captures stdout and stderr together, the exit status and the number of output lines. A run is refused when all three of these hold: the status is non-zero, the output is exactly one line, and that line starts with "FAIL PROBE_DIST resolves to app/dist". A run is accepted when the status is non-zero, the output is exactly one line, and that line starts with "FAIL no index.html in PROBE_DIST". That shows the guard let a scratch path through.

For each of three probes, in this order: "12-phone-probe.mjs" with the argument page, "12-tab-probe.mjs" with no arguments, and "12-keys-probe.mjs" with the arguments move keys lines (12-check.sh's arguments). Run these cases:
(a) decoy. PROBE_DIST="$DECOY" must be refused.
(b) app/dist. Run this case only when (a) passed. Use PROBE_DIST=app/dist, the literal relative path, resolved from the root the script has cd'd to. It must be refused. When (a) failed, print "SKIP refusal <file> app/dist (not run: the decoy was not refused)" and do not run the probe.
(c) scratch. PROBE_DIST="$PLAIN" must be accepted.

Print one line per case: "PASS refusal <file> <case>", or "FAIL refusal <file> <case>: exit <status>, printed <the first output line>". The case names are decoy, app/dist and scratch. Count the FAILs. A SKIP is not counted, because the failed decoy case is already counted. End with "REFUSAL PASS" and exit 0 when no case failed. Otherwise end with "REFUSAL FAIL <count>" and exit 1.

Do not add this script to 12-check.sh, and do not change any probe in this task. Never run 12-tab-probe.mjs or 12-keys-probe.mjs by hand with PROBE_DIST=app/dist before Task 2 has landed: as they stand, they serve that folder. Commit the script alone as `test(261122-tqp): a check that the phone, tab and keys probes refuse app/dist; tab and keys do not`, with the attribution lines from the session.</action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && OUT=$(sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh 2>&1); ST=$?; printf '%s\n' "$OUT"; [ "$ST" -ne 0 ] && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-phone-probe.mjs decoy' && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-phone-probe.mjs app/dist' && printf '%s\n' "$OUT" | grep -q '^FAIL refusal 12-tab-probe.mjs decoy' && printf '%s\n' "$OUT" | grep -q '^FAIL refusal 12-keys-probe.mjs decoy' && printf '%s\n' "$OUT" | grep -q '^SKIP refusal 12-tab-probe.mjs app/dist' && printf '%s\n' "$OUT" | grep -q '^SKIP refusal 12-keys-probe.mjs app/dist' && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-tab-probe.mjs scratch' && printf '%s\n' "$OUT" | tail -1 | grep -qx 'REFUSAL FAIL 2' && echo RED-CONFIRMED</automated>
  </verify>
  <acceptance_criteria>
    - The verify command prints RED-CONFIRMED [HEAD: the script does not exist; EXPECT after Task 1: RED-CONFIRMED]
    - `git log -1 --format=%s` starts with "test(261122-tqp):" and `git show --name-only --format= HEAD` lists only 12-refusal-check.sh
    - `grep -v '^\s*#' .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh | grep -c 'rm -r'` prints 0 [HEAD=absent EXPECT==0]
    - `git diff --quiet HEAD -- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh` exits 0 (no probe and no gate touched in this task)
  </acceptance_criteria>
  <done>The check script exists and is committed. Run on the tree as it stands, it shows the phone probe refusing the decoy and app/dist. It shows the tab and keys probes failing on the decoy, with their app/dist runs skipped. It exits 1 with "REFUSAL FAIL 2".</done>
</task>

<task type="auto">
  <name>Task 2: Copy 12-phone-probe.mjs:44-59 into 12-tab-probe.mjs and 12-keys-probe.mjs</name>
  <files>.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs</files>
  <action>The copied block reads REPO_ROOT and realpathSync, and neither probe has both in place before its check. Each probe needs these surgical edits and nothing else.

12-tab-probe.mjs:
(1) Line 34: add realpathSync to the node:fs import, so it reads existsSync, realpathSync.
(2) Move the two lines `const HERE = path.dirname(fileURLToPath(import.meta.url));` and `const REPO_ROOT = path.resolve(HERE, '..', '..', '..');` from 59-60 up to just above the comment "No default: the probe must never fall back to app/dist." This is where 12-phone-probe.mjs:38-39 puts them, before its unset check. Leave BOARD where it is. It still follows REPO_ROOT.
(3) Directly after `const DIST = path.resolve(process.env.PROBE_DIST);` and before the `if (!existsSync(path.join(DIST, 'index.html')))` check, insert 12-phone-probe.mjs lines 45-59 unchanged. That is the realOf arrow function with its try and catch around realpathSync, then the if with its three clauses. The clauses are realOf(DIST) equal to realOf(path.join(REPO_ROOT, 'app', 'dist')), DIST ending with the separator-joined app/dist, and realOf(DIST) ending with the same. Its console.log prints the template line starting "FAIL PROBE_DIST resolves to app/dist (" followed by DIST and "): build to a scratch folder instead", and then it calls process.exit(1).

12-keys-probe.mjs:
(1) Line 28: add realpathSync to the node:fs import, so it reads existsSync, readFileSync, realpathSync.
(2) Move `const HERE = path.dirname(fileURLToPath(import.meta.url));` from 53 up to just above the comment "No default: the probe must never fall back to app/dist." Under it, add `const REPO_ROOT = path.resolve(HERE, '..', '..', '..');`, the same line as 12-phone-probe.mjs:39. Leave BOARD, which uses HERE, where it is and as it is. Do not rewrite it to use REPO_ROOT.
(3) The same insertion as in the tab probe: phone lines 45-59 unchanged, after DIST and before the index.html check.

Leave the playwright-core loading where it is in both files, ahead of the guard. Moving it is not part of this item. Change no comment, no header and no other line. Then run 12-refusal-check.sh (Task 1). Once it ends with REFUSAL PASS, run the two literal commands in the acceptance criteria from the checkout's root. Commit the two probes together as `fix(261122-tqp): the tab and keys probes refuse a PROBE_DIST that resolves to app/dist (T-12-48)`, with the attribution lines from the session. Do not edit 12-SECURITY.md: the orchestrator or `/gsd-secure-phase 12` records T-12-48 as closed with this commit's hash. Record the commit hash in the SUMMARY.</action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && P=.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo && node --check "$P/12-tab-probe.mjs" && node --check "$P/12-keys-probe.mjs" && OUT=$(sh "$P/12-refusal-check.sh" 2>&1); ST=$?; printf '%s\n' "$OUT"; [ "$ST" -eq 0 ] && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-tab-probe.mjs decoy' && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-tab-probe.mjs app/dist' && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-keys-probe.mjs decoy' && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-keys-probe.mjs app/dist' && printf '%s\n' "$OUT" | grep -q '^PASS refusal 12-keys-probe.mjs scratch' && printf '%s\n' "$OUT" | tail -1 | grep -qx 'REFUSAL PASS' && blk() { awk '/^const realOf = \(candidate\) => \{$/{f=1} f{print} f&&/resolves to app\/dist/{g=1} g&&/^}$/{exit}' "$1"; } && diff <(blk "$P/12-phone-probe.mjs") <(blk "$P/12-tab-probe.mjs") && diff <(blk "$P/12-phone-probe.mjs") <(blk "$P/12-keys-probe.mjs") && echo GREEN-CONFIRMED</automated>
  </verify>
  <acceptance_criteria>
    - The verify command prints GREEN-CONFIRMED: the script exits 0 and ends REFUSAL PASS, the tab and keys probes each PASS decoy, app/dist and scratch, and the copied blocks are line for line equal to the phone probe's. At HEAD the block diff is non-empty for both probes; after the fix it must be empty
    - From the checkout's root, `PROBE_DIST=app/dist node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs; echo "exit=$?"` prints exactly two lines: one starting "FAIL PROBE_DIST resolves to app/dist", then "exit=1"
    - From the checkout's root, `PROBE_DIST=app/dist node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs move keys lines; echo "exit=$?"` prints exactly two lines: one starting "FAIL PROBE_DIST resolves to app/dist", then "exit=1"
    - In each of 12-tab-probe.mjs and 12-keys-probe.mjs, the line number that `grep -n 'PROBE_DIST resolves to app/dist'` prints is smaller than the line number that `grep -n 'no index.html in PROBE_DIST'` prints. The refusal comes before the index.html check [HEAD=absent EXPECT==present]
    - `grep -c 'realpathSync' .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs` [HEAD=0 EXPECT>=1], and the same for 12-keys-probe.mjs [HEAD=0 EXPECT>=1]
    - `grep -c "^const REPO_ROOT = path.resolve(HERE, '..', '..', '..');$" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs` [HEAD=0 EXPECT>=1]. In 12-tab-probe.mjs the line moves rather than being added: the runtime refusal above shows it is defined before use, because a const read before its line throws a ReferenceError instead of printing the refusal
    - `git log --format=%h --grep='(261122-tqp)' -- app/` prints nothing [HEAD=0 EXPECT==0 @b06add6f GUARD MUTATION: a 261122-tqp commit that touches app/]
    - `git log --format=%h --grep='(261122-tqp)' -- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-SECURITY.md` prints nothing [HEAD=0 EXPECT==0 @b06add6f GUARD MUTATION: a 261122-tqp commit that edits the gate, the source probe or the security record]
  </acceptance_criteria>
  <done>Both probes refuse app/dist and any folder whose path ends in app/dist, using the phone probe's own block. They exit 1 with a single refusal line before their index.html check, so no server, browser or file read inside app/dist happens. An ordinary scratch folder still passes the guard. 12-refusal-check.sh ends REFUSAL PASS. Nothing under app/ changed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe script → Mark's served build | app/dist is what Mark's `vite preview --host` serves to his iPad over the LAN. A probe that serves it, or walks the app against it, works on the build he is testing. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-12-48 | Tampering | 12-tab-probe.mjs and 12-keys-probe.mjs serving PROBE_DIST | low | mitigate | Task 2 copies 12-phone-probe.mjs:45-59 into both, ahead of the index.html check. 12-refusal-check.sh and the two literal `PROBE_DIST=app/dist` runs prove an exit 1 with a single refusal line. The 12-SECURITY.md row itself is closed by the orchestrator or `/gsd-secure-phase 12`, not here. |
| T-tqp-01 | Tampering | the reproducing run before the fix | low | mitigate | 12-refusal-check.sh points each probe at a scratch decoy ending in app/dist first, and runs PROBE_DIST=app/dist only for a probe that refused the decoy. The unfixed probes are never pointed at the real folder. Task 1's action also forbids running them that way by hand. |
| T-tqp-SC | Tampering | package installs | low | accept | This plan installs nothing. It reuses the playwright-core already in the npx cache that the probes name. |
</threat_model>

<verification>
- Task 1's RED-CONFIRMED is recorded, from a run on the tree before Task 2's edit.
- Task 2's GREEN-CONFIRMED and the two literal `PROBE_DIST=app/dist` runs (exit 1, one refusal line each) are recorded.
- `git log --format=%s --grep='(261122-tqp)'` shows the test commit before the fix commit.
- No app/ file and no other phase file changed. The app suite is not affected and does not need to run.
- Every result is a Node run on a Mac. Nothing here needs a device.
</verification>

<success_criteria>
`PROBE_DIST=app/dist` makes 12-tab-probe.mjs and 12-keys-probe.mjs exit 1 with "FAIL PROBE_DIST resolves to app/dist ...", in the same way 12-phone-probe.mjs, 12-band-probe.mjs and 12-device-steps.mjs already do, and before any file inside app/dist is opened. The proof is a committed check script that failed first and now ends REFUSAL PASS.
</success_criteria>

<output>
Create `.planning/quick/261122-tqp-bug-p12-probes-accept-app-dist-copy-the-probe-dist-app-dist/261122-tqp-SUMMARY.md` when done. Include the RED and GREEN outputs of 12-refusal-check.sh, the two literal refusal lines with their exit codes, both commit hashes, and a note that the T-12-48 row in 12-SECURITY.md is still marked open, waiting for the orchestrator or `/gsd-secure-phase 12` to close it with the fix commit.
</output>
