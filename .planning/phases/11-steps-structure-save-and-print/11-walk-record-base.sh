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
#
# Plan 11-07 records BASE cf64aa70 plus the order of Mark's 2026-10-26 answer
# (decide-p11-row-order-across-steps) and nothing else, so the recorded baseline cannot hide a
# change on the walked routes (D-19). A patch is therefore applied to the BASE worktree only
# when it may change the two regions only, and only into the checkout's code: it must change
# exactly app/src/ui/IngredientTable.jsx and app/src/ui/Method.jsx; each of those files must
# equal BASE (git show) outside the groupPortionsByStep function and the usesNames line; and
# those two regions must equal the checkout's. Anything else prints a line starting
# "FAIL patch:" and exits 1 before anything is built or recorded.
#
# Knobs (environment):
#   WALK_PATCH      a patch file applied to the BASE worktree before the build; default
#                   $PHASE/11-walk-order.patch when that file exists, else none; "none" skips it.
#   WALK_OUT        the file recorded into; default $PHASE/11-walk-before.json, the committed
#                   baseline: set it to a scratch file for any other recording.
#   WALK_KEEP_TEXT  1 passes --keep-text to record, so each snapshot keeps the text and
#                   methodText it hashes; any other value or none passes nothing.
set -eu

cd "$(git rev-parse --show-toplevel)"
ROOT=$(pwd)

PHASE=.planning/phases/11-steps-structure-save-and-print
BASE=cf64aa70
OUT="${WALK_OUT:-$PHASE/11-walk-before.json}"
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

PATCH="${WALK_PATCH:-}"
if [ -z "$PATCH" ]; then
  if [ -f "$PHASE/11-walk-order.patch" ]; then PATCH="$PHASE/11-walk-order.patch"; else PATCH=none; fi
fi
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
PROBE_DIST="$SCRATCH/dist-base" node "$PHASE/11-walk.mjs" record "$OUT" $KEEP
