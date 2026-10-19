#!/bin/sh
# Phase 9 upgrade check (plan 09-17, threat T-09-39): a profile stored by the base
# commit's build (DB_VERSION 9) and then opened by the working tree's build at the
# same origin must reset to version 10 in WebKit, and reopen without a second reset.
#
#   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-upgrade-check.sh
#
# BASE is the same commit 09-walk-record-base.sh builds: the newest app tree before the
# phase (any DB_VERSION 9 build would do for the old profile). Both builds go to the
# scratch directory; the script never writes app/dist (Mark's own `vite preview --host`
# serves it) and never starts Vite. The base worktree is removed on every exit.
set -eu

cd "$(git rev-parse --show-toplevel)"
ROOT=$(pwd)

PHASE=.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places
BASE=710a528
SCRATCH="${TMPDIR:-/tmp}/sprinkles-09"

mkdir -p "$SCRATCH"
if [ -e "$SCRATCH/base-up" ]; then
  git worktree remove --force "$SCRATCH/base-up" >/dev/null 2>&1 || rm -rf "$SCRATCH/base-up"
  git worktree prune
fi
git worktree add --detach "$SCRATCH/base-up" "$BASE"
trap 'git worktree remove --force "$SCRATCH/base-up" >/dev/null 2>&1 || true' EXIT

ln -s "$ROOT/app/node_modules" "$SCRATCH/base-up/app/node_modules"
npm --prefix "$SCRATCH/base-up/app" run build -- --outDir "$SCRATCH/dist-base-up" --emptyOutDir

npm --prefix app run build -- --outDir "$SCRATCH/dist-up" --emptyOutDir

BASE_DIST="$SCRATCH/dist-base-up" PROBE_DIST="$SCRATCH/dist-up" node "$PHASE/09-upgrade-check.mjs"
