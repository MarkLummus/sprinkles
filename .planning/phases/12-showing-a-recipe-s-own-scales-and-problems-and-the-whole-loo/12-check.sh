#!/bin/sh
# Phase 12's checks in one command: round one's gate, then round two's, ending "GATE2 PASS".
#
#   sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh
#
# Round one (unchanged, "GATE1 PASS" prints after it): the whole app suite; one scratch build; the stops probe
# (pen, reading, editor); the print check (rows, drop, lines, fit, worst); the round trip; the WebKit PDF
# of the log pages; mobile Safari in the iOS Simulator; the Phase 11 walk, whose line must start
# "MATCH 94 snapshots" (the five Phase 11 scenarios NEW and passing their own expectations).
#
# Round two adds, on the same scratch build, five steps (12-14, D-06): board, the side-by-side board check
# (12-board-check.mjs with --selftest) over every Phase 12 spec, round one's five (12-board-selftest,
# -pen, -reading, -logs, -limits) and round two's six (12-board-places, -more, -band, -penpreview,
# -rowcontrols, -keys); phone, 12-phone-probe.mjs page; band, 12-band-probe.mjs held widen; tabs,
# 12-tab-probe.mjs; keys, 12-keys-probe.mjs move keys lines. The last line is GATE2 PASS.
#
# Phase 11's board specs (11-board-steps, -structure, -first-version, -save) and 11-device-steps.mjs are
# not run: they hold sketch 014's control order, which sketch 016 overrides.
#
# It never starts a Vite server and never writes the build Mark serves (app/dist): the one build
# goes to a scratch folder keyed by the checkout's directory name, as 11-walk-check.sh keys its own.
# Every result is device-unverified (Playwright WebKit, a WKWebView and the Simulator are not the
# iPad); the iPad proof is Mark's three rows (12-ipad-rows.md), walked first by 12-device-steps.mjs.
#
# The app suite runs as `npx vitest run` from app/, which is what `npm --prefix app test` runs; the
# npm form has hung inside linked worktrees.
set -eu

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
SCRATCH="${TMPDIR:-/tmp}/sprinkles-12/check-$(basename "$(pwd)")"
mkdir -p "$SCRATCH"

# Runs a command, shows its output, and stops the script when it exits non-zero or prints a line
# starting FAIL. The output is kept in $SCRATCH/<name>.txt.
step() {
  NAME="$1"
  shift
  echo "== $NAME"
  if ! "$@" > "$SCRATCH/$NAME.txt" 2>&1; then
    cat "$SCRATCH/$NAME.txt"
    echo "FAIL $NAME exited non-zero"
    exit 1
  fi
  cat "$SCRATCH/$NAME.txt"
  if grep -q '^FAIL' "$SCRATCH/$NAME.txt"; then
    echo "FAIL $NAME printed a FAIL line"
    exit 1
  fi
}

step suite sh -c 'cd app && npx vitest run'
if ! grep -Eq 'Tests +[0-9]+ passed' "$SCRATCH/suite.txt" || grep -Eq '[0-9]+ failed' "$SCRATCH/suite.txt"; then
  echo "FAIL suite did not end with every test passing"
  exit 1
fi

step build npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
export PROBE_DIST="$SCRATCH/dist"

step probe node "$PHASE/12-stops-probe.mjs" check pen reading editor
step print node "$PHASE/12-print-check.mjs" rows drop lines fit worst
step roundtrip node "$PHASE/12-roundtrip.mjs"
if ! grep -q '^PASS import' "$SCRATCH/roundtrip.txt"; then
  echo "FAIL roundtrip printed no PASS import line"
  exit 1
fi
step pdf node "$PHASE/12-safari-check.mjs" pdf
step sim node "$PHASE/12-safari-check.mjs" sim

step walk sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh
if ! grep -q '^MATCH 94 snapshots' "$SCRATCH/walk.txt"; then
  echo "FAIL walk printed no line starting MATCH 94 snapshots"
  exit 1
fi

echo "GATE1 PASS"

step board node "$PHASE/12-board-check.mjs" \
  "$PHASE/12-board-selftest.mjs" "$PHASE/12-board-pen.mjs" "$PHASE/12-board-reading.mjs" \
  "$PHASE/12-board-logs.mjs" "$PHASE/12-board-limits.mjs" \
  "$PHASE/12-board-places.mjs" "$PHASE/12-board-more.mjs" "$PHASE/12-board-band.mjs" \
  "$PHASE/12-board-penpreview.mjs" "$PHASE/12-board-rowcontrols.mjs" "$PHASE/12-board-keys.mjs" \
  --selftest
step phone node "$PHASE/12-phone-probe.mjs" page
step band node "$PHASE/12-band-probe.mjs" held widen
step tabs node "$PHASE/12-tab-probe.mjs"
step keys node "$PHASE/12-keys-probe.mjs" move keys lines

echo "GATE2 PASS"
