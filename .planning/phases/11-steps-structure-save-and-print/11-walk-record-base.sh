#!/bin/sh
# Phase 11 walk baseline: record the WebKit walk from a build of BASE, in a temporary git
# worktree, never from the working tree (D-19, T-11-02).
#
#   sh .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
#
# BASE is e37db11a, the commit before Phase 12. Its app tree equals af101f6e's, the newest
# app commit before Phase 12 (a quick fix): `git diff --stat af101f6e e37db11a -- app/` is
# empty. The recording at the earlier BASE cf64aa70 went stale against the post-Phase-11
# quick fixes (2026-10-27 to 2026-11-15) that never re-recorded it, and plan 12-08 traced
# every difference to the app commit that made it before moving BASE
# (12-08-walk-trace.md). The cf64aa70 recording stays in git history at 4d3b44f7.
#
# The script refuses to record (FAIL, exit 1, nothing written) when a commit after BASE
# touches app/ and is none of: a Phase 12 plan's commit (matched by
# [a-z]+\(12(-[0-9]+)?\):), an executor worktree merge, or a commit in NEUTRAL below. Such a
# commit would move the base again. It never writes app/dist and never starts Vite.
#
# NEUTRAL names the app commits after e37db11a that are neither a Phase 12 plan's nor a merge:
# the quick tasks 261116-80u and 261116-80v. Task 1 of plan 12-08 recorded the walk, text
# included, on a build of e37db11a and on a build of main, and the two compare "MATCH 112
# snapshots" with no DIFF: those commits moved no walked page text, method text, field, focus,
# status, button or stored record (12-08-walk-trace.md). A new app commit joins NEUTRAL only
# with the same proof.
#
# A patch may still be applied to the BASE worktree (WALK_PATCH). Plan 11-07's order patch is
# part of e37db11a and no longer applies, so the default is none. A patch is applied only
# when it may change the two regions only, and only into the checkout's code: it must change
# exactly app/src/ui/IngredientTable.jsx and app/src/ui/Method.jsx; each of those files must
# equal BASE (git show) outside the groupPortionsByStep function and the usesNames line; and
# those two regions must equal the checkout's. Anything else prints a line starting
# "FAIL patch:" and exits 1 before anything is built or recorded.
#
# Knobs (environment):
#   WALK_PATCH      a patch file applied to the BASE worktree before the build; default none;
#                   "none" skips it.
#   WALK_OUT        the file recorded into; default $PHASE/11-walk-before.json, the committed
#                   baseline: set it to a scratch file for any other recording.
#   WALK_KEEP_TEXT  1 passes --keep-text to record, so each snapshot keeps the text and
#                   methodText it hashes; any other value or none passes nothing.
set -eu

cd "$(git rev-parse --show-toplevel)"
ROOT=$(pwd)

PHASE=.planning/phases/11-steps-structure-save-and-print
BASE=e37db11a
OUT="${WALK_OUT:-$PHASE/11-walk-before.json}"
SCRATCH="${TMPDIR:-/tmp}/sprinkles-11"

# A Phase 12 plan's commit reads "type(12):" or "type(12-NN):"; a merge of an executor worktree
# holds "merge executor worktree". Anything else that touched app/ after BASE is a stranger,
# except the commits proven neutral (see the header).
NEUTRAL='1200f350|1acb082b|6b07e2d0|f3b9b384|9fdbd576|aa94c98d|7caf6c11'
LEFT=$(git log --format='%h %s' "$BASE"..HEAD -- app/ | grep -Eiv '^[0-9a-f]+ [a-z]+\(12(-[0-9]+)?\):|merge executor worktree' | grep -Ev "^($NEUTRAL)[0-9a-f]* " || true)
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

PATCH="${WALK_PATCH:-}"
if [ -z "$PATCH" ]; then PATCH=none; fi
if [ "$PATCH" != none ]; then
  case "$PATCH" in /*) ;; *) PATCH="$ROOT/$PATCH" ;; esac
  if [ ! -f "$PATCH" ]; then
    echo "FAIL patch: $PATCH is not a file"
    exit 1
  fi
  if ! git -C "$SCRATCH/base" apply --check "$PATCH"; then
    echo "FAIL patch: $PATCH does not apply to BASE $BASE"
    exit 1
  fi
  git -C "$SCRATCH/base" apply "$PATCH"
  # status, not diff --name-only: a file the patch adds is untracked and diff would not list it.
  CHANGED=$(git -C "$SCRATCH/base" status --porcelain --untracked-files=all | sed 's/^...//' | sort | tr '\n' ' ')
  if [ "$CHANGED" != "app/src/ui/IngredientTable.jsx app/src/ui/Method.jsx " ]; then
    echo "FAIL patch: must change exactly app/src/ui/IngredientTable.jsx and app/src/ui/Method.jsx, changes ${CHANGED% }"
    exit 1
  fi
  # Six texts: the two files at BASE (git show), in the patched worktree and in the checkout.
  node -e '
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const [worktree, root, base] = process.argv.slice(1);
const refuse = (why) => {
  console.log(`FAIL patch: ${why}`);
  process.exit(1);
};
const copies = {
  BASE: (file) => execFileSync("git", ["show", `${base}:${file}`], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 }),
  "the patched worktree": (file) => fs.readFileSync(`${worktree}/${file}`, "utf8"),
  "the checkout": (file) => fs.readFileSync(`${root}/${file}`, "utf8"),
};
const files = [
  {
    name: "IngredientTable.jsx",
    path: "app/src/ui/IngredientTable.jsx",
    outside: "IngredientTable.jsx changes outside groupPortionsByStep",
    differs: "groupPortionsByStep differs from the checkout",
    // The line starting "export function groupPortionsByStep(" to the next line that is exactly "}".
    find: (lines) => {
      const starts = lines.flatMap((line, i) => (line.startsWith("export function groupPortionsByStep(") ? [i] : []));
      if (starts.length !== 1) return null;
      const end = lines.indexOf("}", starts[0] + 1);
      return end < 0 ? null : [starts[0], end];
    },
  },
  {
    name: "Method.jsx",
    path: "app/src/ui/Method.jsx",
    outside: "Method.jsx changes outside the usesNames line",
    differs: "usesNames differs from the checkout",
    // The one line holding "const usesNames".
    find: (lines) => {
      const hits = lines.flatMap((line, i) => (line.includes("const usesNames") ? [i] : []));
      return hits.length === 1 ? [hits[0], hits[0]] : null;
    },
  },
];
// parts[file name][copy] = { before, region, after }, each a list of lines.
const parts = {};
for (const file of files) {
  parts[file.name] = {};
  for (const [copy, read] of Object.entries(copies)) {
    let lines = null;
    try {
      lines = read(file.path).split("\n");
    } catch (error) {
      lines = null;
    }
    const span = lines && file.find(lines);
    if (!span) refuse(`${file.name} region not found once in ${copy}`);
    parts[file.name][copy] = {
      before: lines.slice(0, span[0]),
      region: lines.slice(span[0], span[1] + 1),
      after: lines.slice(span[1] + 1),
    };
  }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const file of files) {
  const at = parts[file.name];
  if (!same(at.BASE.before, at["the patched worktree"].before) || !same(at.BASE.after, at["the patched worktree"].after)) refuse(file.outside);
}
for (const file of files) {
  const at = parts[file.name];
  if (!same(at["the patched worktree"].region, at["the checkout"].region)) refuse(file.differs);
}
' "$SCRATCH/base" "$ROOT" "$BASE" || exit 1
fi

ln -s "$ROOT/app/node_modules" "$SCRATCH/base/app/node_modules"
npm --prefix "$SCRATCH/base/app" run build -- --outDir "$SCRATCH/dist-base" --emptyOutDir

KEEP=""
if [ "${WALK_KEEP_TEXT:-}" = "1" ]; then KEEP="--keep-text"; fi
# $KEEP is empty or one word, so it is left unquoted on purpose.
PROBE_DIST="$SCRATCH/dist-base" node "$PHASE/11-walk.mjs" record "$OUT" --baseline $KEEP
