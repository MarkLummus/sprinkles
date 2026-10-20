#!/bin/sh
# Phase 10 walk check: build the app into a scratch directory, record the WebKit
# walk and compare it with the baseline, in one command.
#
#   sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh [out.json]
#
# Ends "MATCH 94 snapshots" when the maker would see no change in page state or
# stores (the walk does not measure geometry; the board engine does). It never
# starts a Vite server and never writes app/dist (Mark's own `vite preview --host`
# serves it). The scratch directory is keyed by the checkout's directory name, so
# two worktrees running at once never build into the same dist.
set -eu

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/10-the-creation-editor-without-save
SCRATCH="${TMPDIR:-/tmp}/sprinkles-10/walk-$(basename "$(pwd)")"
OUT="${1:-$SCRATCH/after.json}"

BASELINE="$PHASE/10-walk-before.json"
echo "baseline: $BASELINE"

mkdir -p "$SCRATCH"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dist" node "$PHASE/10-walk.mjs" record "$OUT"
node "$PHASE/10-walk.mjs" compare "$BASELINE" "$OUT"
