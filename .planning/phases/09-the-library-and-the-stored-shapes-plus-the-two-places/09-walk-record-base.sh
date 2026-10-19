#!/bin/sh
# Phase 9 before-walk: record the WebKit walk from a build of the phase's BASE commit,
# in a temporary git worktree, never from the working tree (D-15, T-09-03).
#
#   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-record-base.sh
#
# BASE is the last commit to touch app/ before any Phase 9 plan: its app tree is Phase 8's
# result plus quick tasks 261017-tit (the note remove's text-control look, D31),
# 261017-ttf (the Sweetness rule widened to 0 to 40, D30) and 261018-rn9 (the kept-draft fix
# for bug-stale-draft-survives-pen-opened-during-read). The earlier base 71add62 predates
# the first two, so a walk recorded there would carry the old 0-to-30 rule.
#
# The script refuses to record (FAIL, exit 1, nothing written) when a commit after BASE
# touches app/ and is neither a Phase 9 plan's commit nor an executor worktree merge:
# such a commit would move the base again. It never writes app/dist and never starts Vite.
set -eu

cd "$(git rev-parse --show-toplevel)"
ROOT=$(pwd)

PHASE=.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places
BASE=710a528
SCRATCH="${TMPDIR:-/tmp}/sprinkles-09"

# A Phase 9 plan's commit reads "type(09):" or "type(09-NN):"; a merge of an executor worktree
# holds "merge executor worktree". Anything else that touched app/ after BASE is a stranger.
LEFT=$(git log --format='%h %s' "$BASE"..HEAD -- app/ | grep -Eiv '^[0-9a-f]+ [a-z]+\(09(-[0-9]+)?\):|merge executor worktree' || true)
if [ -n "$LEFT" ]; then
  echo "FAIL app/ changed after BASE by a commit that is not a Phase 9 plan's:"
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

PROBE_DIST="$SCRATCH/dist-base" node "$PHASE/09-walk.mjs" record "$PHASE/09-walk-before.json"
