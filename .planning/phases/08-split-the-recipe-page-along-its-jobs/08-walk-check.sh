#!/bin/sh
# Phase 8 walk check: build the app into a scratch directory, record the WebKit
# walk and compare it with the baseline, in one command.
#
#   sh .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh [out.json]
#
# Ends "MATCH 94 snapshots" when the maker would see no change. It never starts
# a Vite server and never writes app/dist (Mark's own `vite preview --host`
# serves it); the build goes to $TMPDIR/sprinkles-08/dist.
set -eu

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/08-split-the-recipe-page-along-its-jobs
SCRATCH="${TMPDIR:-/tmp}/sprinkles-08"
OUT="${1:-$SCRATCH/after.json}"

BASELINE="$PHASE/08-walk-before.json"
if [ ! -f "$BASELINE" ]; then
  BASELINE=.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk-before.json
fi
echo "baseline: $BASELINE"

mkdir -p "$SCRATCH"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dist" node "$PHASE/08-walk.mjs" record "$OUT"
node "$PHASE/08-walk.mjs" compare "$BASELINE" "$OUT"
