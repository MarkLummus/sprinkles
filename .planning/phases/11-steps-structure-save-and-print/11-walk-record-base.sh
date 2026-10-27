#!/bin/sh
# Phase 11 before-walk: record the WebKit walk from a build of the phase's BASE commit,
# in a temporary git worktree, never from the working tree (D-19, T-11-02).
#
#   sh .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
#
# BASE is cf64aa70, the newest commit to touch app/ before any Phase 11 plan
# ("feat(261025-uge): the rail and the page travel as one block..."); every commit after
# it up to the start of Phase 11 is docs only. Its app tree is Phase 10's result plus the
# quick tasks that followed it. The baseline is re-recorded here, not copied from
# Phase 10, because the snapshot gains a method hash (D-19).
#
# The script refuses to record (FAIL, exit 1, nothing written) when a commit after BASE
# touches app/ and is neither a Phase 11 plan's commit nor an executor worktree merge:
# such a commit would move the base again. It never writes app/dist and never starts Vite.
set -eu

cd "$(git rev-parse --show-toplevel)"
ROOT=$(pwd)

PHASE=.planning/phases/11-steps-structure-save-and-print
BASE=cf64aa70
SCRATCH="${TMPDIR:-/tmp}/sprinkles-11"

# A Phase 11 plan's commit reads "type(11):" or "type(11-NN):"; a merge of an executor worktree
# holds "merge executor worktree". Anything else that touched app/ after BASE is a stranger.
LEFT=$(git log --format='%h %s' "$BASE"..HEAD -- app/ | grep -Eiv '^[0-9a-f]+ [a-z]+\(11(-[0-9]+)?\):|merge executor worktree' || true)
if [ -n "$LEFT" ]; then
  echo "FAIL app/ changed after BASE by a commit that is not a Phase 11 plan's:"
  echo "$LEFT"
  echo "move BASE to the newest of them and record again"
  exit 1
fi

mkdir -p "$SCRATCH"
if [ -e "$SCRATCH/base" ]; then
  git worktree remove --force "$SCRATCH/base" >/dev/null 2>&1 || rm -rf "$SCRATCH/base"
  git worktree prune
fi
git worktree add --detach "$SCRATCH/base" "$BASE"
trap 'git worktree remove --force "$SCRATCH/base" >/dev/null 2>&1 || true' EXIT

ln -s "$ROOT/app/node_modules" "$SCRATCH/base/app/node_modules"
npm --prefix "$SCRATCH/base/app" run build -- --outDir "$SCRATCH/dist-base" --emptyOutDir

PROBE_DIST="$SCRATCH/dist-base" node "$PHASE/11-walk.mjs" record "$PHASE/11-walk-before.json"
