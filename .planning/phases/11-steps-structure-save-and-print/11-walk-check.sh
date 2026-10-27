#!/bin/sh
# Phase 11 walk check: build the app into a scratch directory, record the WebKit
# walk and compare it with the baseline, in one command.
#
#   sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh [out.json]
#
# Ends "MATCH 94 snapshots" when the maker would see no change in page state or
# stores on the twelve baseline scenarios (the walk does not measure geometry; the
# board engine does); a later plan's new scenarios appear on the same line as
# "; NEW <name> <steps>". It never starts a Vite server and never writes app/dist
# (Mark's own `vite preview --host` serves it). The scratch directory is keyed by the
# checkout's directory name, so two worktrees running at once never build into the
# same dist.
set -eu

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/11-steps-structure-save-and-print
SCRATCH="${TMPDIR:-/tmp}/sprinkles-11/walk-$(basename "$(pwd)")"
OUT="${1:-$SCRATCH/after.json}"

BASELINE="$PHASE/11-walk-before.json"
echo "baseline: $BASELINE"

mkdir -p "$SCRATCH"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dist" node "$PHASE/11-walk.mjs" record "$OUT"
node "$PHASE/11-walk.mjs" compare "$BASELINE" "$OUT"
