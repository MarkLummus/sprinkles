#!/bin/sh
# Phase 9 walk check: build the app into a scratch directory, record the WebKit
# walk and compare it with the baseline, in one command.
#
#   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-check.sh [out.json]
#
# Ends "MATCH 94 snapshots" when the maker would see no change. It never starts
# a Vite server and never writes app/dist (Mark's own `vite preview --host`
# serves it); the build goes to $TMPDIR/sprinkles-09/dist.
set -eu

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places
SCRATCH="${TMPDIR:-/tmp}/sprinkles-09"
OUT="${1:-$SCRATCH/after.json}"

BASELINE="$PHASE/09-walk-before.json"
echo "baseline: $BASELINE"

mkdir -p "$SCRATCH"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dist" node "$PHASE/09-walk.mjs" record "$OUT"
node "$PHASE/09-walk.mjs" compare "$BASELINE" "$OUT"
