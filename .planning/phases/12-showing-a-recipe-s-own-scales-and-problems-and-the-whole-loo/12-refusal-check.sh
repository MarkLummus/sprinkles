#!/bin/sh
# Shows that each round-two probe refuses a PROBE_DIST that resolves to app/dist, and does so before it
# opens any file in that folder (12-SECURITY.md row T-12-48; 12-14-PLAN.md:125).
#
#   sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-refusal-check.sh
#
# Safety rule: each probe is first pointed at a decoy, an empty scratch folder whose path ends in
# app/dist. Only a probe that refused the decoy is then run with PROBE_DIST=app/dist, because the
# refusal's endsWith clause that catches the decoy also catches app/dist before the index.html check.
# A probe that did not refuse the decoy is never pointed at Mark's served build.
#
# Per probe: decoy (must be refused), app/dist (must be refused; run only after the decoy was), scratch
# (an ordinary folder, must be let through to the index.html check). Ends REFUSAL PASS, or REFUSAL FAIL <n>
# and exit 1. Every result is a Node run on a Mac, with no browser and no device.
set -u

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
SCRATCH="${TMPDIR:-/tmp}/sprinkles-12/refusal-$(basename "$(pwd)")"
DECOY="$SCRATCH/decoy/app/dist"
PLAIN="$SCRATCH/plain/dist"
mkdir -p "$DECOY" "$PLAIN"
rm -f "$DECOY/index.html" "$PLAIN/index.html"

FAILS=0

# run_probe <PROBE_DIST> <probe file> [probe arguments...]
# Sets STATUS, FIRST (the first output line) and LINES (the number of output lines).
run_probe() {
  DIST_ARG="$1"
  FILE="$2"
  shift 2
  OUT=$(PROBE_DIST="$DIST_ARG" node "$PHASE/$FILE" "$@" 2>&1)
  STATUS=$?
  FIRST=$(printf '%s\n' "$OUT" | head -n 1)
  LINES=$(printf '%s\n' "$OUT" | grep -c '')
}

# is_refused: non-zero status, one line, starting with the refusal text.
is_refused() {
  [ "$STATUS" -ne 0 ] && [ "$LINES" -eq 1 ] && case "$FIRST" in "FAIL PROBE_DIST resolves to app/dist"*) true ;; *) false ;; esac
}

# is_accepted: non-zero status, one line, starting with the index.html text (the guard let the path through).
is_accepted() {
  [ "$STATUS" -ne 0 ] && [ "$LINES" -eq 1 ] && case "$FIRST" in "FAIL no index.html in PROBE_DIST"*) true ;; *) false ;; esac
}

report() {
  # report <ok: 0 or 1> <file> <case>
  if [ "$1" -eq 0 ]; then
    echo "PASS refusal $2 $3"
  else
    echo "FAIL refusal $2 $3: exit $STATUS, printed $FIRST"
    FAILS=$((FAILS + 1))
  fi
}

check_probe() {
  FILE="$1"
  shift

  run_probe "$DECOY" "$FILE" "$@"
  if is_refused; then
    report 0 "$FILE" decoy
    DECOY_OK=1
  else
    report 1 "$FILE" decoy
    DECOY_OK=0
  fi

  if [ "$DECOY_OK" -eq 1 ]; then
    run_probe app/dist "$FILE" "$@"
    if is_refused; then report 0 "$FILE" app/dist; else report 1 "$FILE" app/dist; fi
  else
    echo "SKIP refusal $FILE app/dist (not run: the decoy was not refused)"
  fi

  run_probe "$PLAIN" "$FILE" "$@"
  if is_accepted; then report 0 "$FILE" scratch; else report 1 "$FILE" scratch; fi
}

check_probe 12-phone-probe.mjs page
check_probe 12-tab-probe.mjs
check_probe 12-keys-probe.mjs move keys lines

if [ "$FAILS" -eq 0 ]; then
  echo "REFUSAL PASS"
  exit 0
fi
echo "REFUSAL FAIL $FAILS"
exit 1
