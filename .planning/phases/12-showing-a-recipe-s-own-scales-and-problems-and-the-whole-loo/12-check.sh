#!/bin/sh
# Phase 12 round one's checks in one command, ending "GATE1 PASS".
#
#   sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh
#
# It runs every round-one check except the board check, which is 12-04's own command
# (12-board-check.mjs with its four spec modules and --selftest) and runs beside it. Steps, each
# stopping the script on failure: the whole app suite; one scratch build; the stops probe (pen,
# reading, editor); the print check (rows, drop, lines, fit, worst); the round trip; the WebKit PDF
# of the log pages; mobile Safari in the iOS Simulator; the Phase 11 walk, whose line must start
# "MATCH 94 snapshots". Its last line is GATE1 PASS.
#
# It never starts a Vite server and never writes the build Mark serves (app/dist): the one build
# goes to a scratch folder keyed by the checkout's directory name, as 11-walk-check.sh keys its own.
# Every result is device-unverified (Playwright WebKit, a WKWebView and the Simulator are not the
# iPad); the paper check waits for round two's iPad rows. Round two reruns this after Gate 2 lands.
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
