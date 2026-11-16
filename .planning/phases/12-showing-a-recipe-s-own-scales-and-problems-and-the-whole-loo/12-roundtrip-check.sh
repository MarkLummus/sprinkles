#!/bin/sh
# Phase 12 round trip check (PROOF-01, D-10): build the app into a scratch directory, run the
# WebKit round trip twice, and compare the two runs byte for byte, in one command.
#
#   sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip-check.sh
#
# Each run makes a recipe in the built app, prints it, records a batch, exports, imports into an
# empty profile and compares the records (see 12-roundtrip.mjs). The fixed clock and the counted
# ids make the two runs write identical dumps of the made records and the exported file, so any
# difference between them is a finding. Its last line says the round trip passed, or it exits non-zero.
#
# It never starts a Vite server and never writes the build folder Mark's own `vite preview --host`
# serves. The scratch directory is keyed by the checkout's directory name, so two worktrees
# running at once never build into the same folder.
set -eu

cd "$(git rev-parse --show-toplevel)"

PHASE=.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
SCRATCH="${TMPDIR:-/tmp}/sprinkles-12/roundtrip-$(basename "$(pwd)")"

mkdir -p "$SCRATCH"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir

for RUN in 1 2; do
  echo "run $RUN"
  if ! PROBE_DIST="$SCRATCH/dist" node "$PHASE/12-roundtrip.mjs" --out "$SCRATCH/made-$RUN.json" > "$SCRATCH/run-$RUN.txt"; then
    cat "$SCRATCH/run-$RUN.txt"
    echo "FAIL run $RUN exited non-zero"
    exit 1
  fi
  cat "$SCRATCH/run-$RUN.txt"
  if grep -q '^FAIL' "$SCRATCH/run-$RUN.txt"; then
    echo "FAIL run $RUN printed a FAIL line"
    exit 1
  fi
  for STEP in create print batch reading export import compare figures seed drafts search; do
    if ! grep -q "^PASS $STEP " "$SCRATCH/run-$RUN.txt"; then
      echo "FAIL run $RUN printed no PASS $STEP line"
      exit 1
    fi
  done
done

cmp "$SCRATCH/made-1.json" "$SCRATCH/made-2.json"
echo "two runs wrote identical made records and exported file"
echo "ROUNDTRIP PASS"
