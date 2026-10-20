#!/bin/sh
# Phase 10 before-walk: record the WebKit walk from a build of the phase's BASE commit,
# in a temporary git worktree, never from the working tree (D-11, T-10-02).
#
#   sh .planning/phases/10-the-creation-editor-without-save/10-walk-record-base.sh
#
# BASE is ec44fa72, the newest commit to touch app/ before any Phase 10 plan
# ("chore: merge executor worktree"); every commit after it up to the start of
# Phase 10 is docs only. Its app tree is Phase 9's result.
#
# The script refuses to record (FAIL, exit 1, nothing written) when a commit after BASE
# touches app/ and is neither a Phase 10 plan's commit nor an executor worktree merge:
# such a commit would move the base again. It never writes app/dist and never starts Vite.
set -eu

cd "$(git rev-parse --show-toplevel)"
ROOT=$(pwd)

PHASE=.planning/phases/10-the-creation-editor-without-save
BASE=ec44fa72
SCRATCH="${TMPDIR:-/tmp}/sprinkles-10"

# A Phase 10 plan's commit reads "type(10):" or "type(10-NN):"; a merge of an executor worktree
# holds "merge executor worktree". Anything else that touched app/ after BASE is a stranger.
LEFT=$(git log --format='%h %s' "$BASE"..HEAD -- app/ | grep -Eiv '^[0-9a-f]+ [a-z]+\(10(-[0-9]+)?\):|merge executor worktree' || true)
if [ -n "$LEFT" ]; then
  echo "FAIL app/ changed after BASE by a commit that is not a Phase 10 plan's:"
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

PROBE_DIST="$SCRATCH/dist-base" node "$PHASE/10-walk.mjs" record "$PHASE/10-walk-before.json"
