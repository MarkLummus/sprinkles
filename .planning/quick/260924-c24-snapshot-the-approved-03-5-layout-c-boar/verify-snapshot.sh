#!/usr/bin/env bash
# Gates for quick task 260924-c24 (sketch 011 snapshot).
# Usage: bash verify-snapshot.sh boards|docs|all
# SNAP_SRC overrides the scratchpad folder the boards were copied from.
set -u
ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
D="$ROOT/.planning/sketches/011-recipe-route-c"
SRC="${SNAP_SRC:-/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/e947efa9-cbd9-47de-b7bc-29227ee7e381/scratchpad/snap/011-recipe-route-c}"
BOARDS="1600-no-batch.html 1600-batch.html 1600-pen.html 1366-batch.html 1024-batch.html 393-batch.html 1600-long-history.html recipe-book-form-reference.html"
fail=0
bad() { echo "FAIL: $*"; fail=1; }

boards() {
  [ -d "$SRC" ] || bad "scratchpad source missing: $SRC"
  for f in $BOARDS; do
    [ -f "$D/$f" ] || { bad "missing board $f"; continue; }
    cmp -s "$SRC/$f" "$D/$f" || bad "$f is not byte-identical to the scratchpad copy"
    for lit in 'Carried forward' 'fold-notes' '_blob' 'support.js'; do
      n=$(grep -cF -- "$lit" "$D/$f")
      [ "$n" -eq 0 ] || bad "$f carries '$lit' ($n lines)"
    done
    grep -qF '../../../app/public/fonts/caveat-regular.woff2' "$D/$f" || bad "$f lacks the repo-relative Caveat path"
  done
  [ -f "$D/../../../app/public/fonts/caveat-regular.woff2" ] || bad "the Caveat path does not resolve from the sketch folder"
  I="$D/index.html"
  [ -f "$I" ] || { bad "index.html missing"; return; }
  for f in $BOARDS; do
    n=$(grep -oF "href=\"$f\"" "$I" | wc -l | tr -d ' ')
    [ "$n" -eq 1 ] || bad "index.html links $f $n times (want 1)"
  done
  for h in $(grep -oE 'href="[^"]*"' "$I" | sed 's/^href="//; s/"$//'); do
    case "$h" in
      http*|/*) bad "index.html has a non-relative href: $h" ;;
      README.md) ;;  # written by task 2; the docs gate checks it exists
      *) [ -f "$D/$h" ] || bad "index.html href does not resolve: $h" ;;
    esac
  done
  [ "$(grep -ciE '<script|src="http' "$I")" -eq 0 ] || bad "index.html carries a script or an external asset"
}

docs() {
  n=$(ls -A "$D" | wc -l | tr -d ' ')
  [ "$n" -eq 10 ] || bad "the sketch folder holds $n entries (want 10: 8 boards, index.html, README.md)"
  R="$D/README.md"
  if [ -f "$R" ]; then
    for lit in 'SETTLED' '2026-09-23' '2026-09-24' '1600' '1366' '1024' '393' 'iPhone' \
      '.planning/canvas-generators/' 'gen.py' 'longhist.py' 'python3 -m http.server' \
      '/.planning/sketches/011-recipe-route-c/index.html' 'illustrative' 'focused-only' 'always-shown' \
      'Recipe Book' 'Yield' 'Rename' 'Done' 'Cancel' 'Instructions' 'Carried forward' 'estimated' \
      'style 6' 'Hand Rule' 'single authority' 'side-by-side' '010-bench-sheet'; do
      grep -qF -- "$lit" "$R" || bad "README.md lacks '$lit'"
    done
  else
    bad "README.md missing"
  fi
  M="$ROOT/.planning/sketches/MANIFEST.md"
  l8=$(grep -nE '^\| 008 \| control-sheet \|' "$M" | cut -d: -f1)
  l9=$(grep -nE '^\| 009 \| wide-touch \|' "$M" | cut -d: -f1)
  l11=$(grep -nE '^\| 011 \| recipe-route-c \|' "$M" | cut -d: -f1)
  [ -n "$l9" ] || bad "MANIFEST.md has no 009 row"
  [ -n "$l11" ] || bad "MANIFEST.md has no 011 row"
  if [ -n "$l8" ] && [ -n "$l9" ] && [ -n "$l11" ]; then
    [ "$l9" -eq $((l8 + 1)) ] && [ "$l11" -eq $((l9 + 1)) ] || bad "MANIFEST.md rows are not 008, 009, 011 in sequence"
  fi
  grep -qE '^\| 010 \|' "$M" && bad "MANIFEST.md has a 010 row; 010 is reserved for the Phase 4 bench sheet"
  for l in "$l9" "$l11"; do
    [ -n "$l" ] || continue
    cols=$(sed -n "${l}p" "$M" | awk -F'|' '{print NF}')
    [ "$cols" -eq 7 ] || bad "MANIFEST.md line $l has $((cols - 2)) columns (want 5)"
  done
  C="$ROOT/.planning/.continue-here.md"
  grep -qE '^task: 6$' "$C" || bad ".continue-here.md frontmatter task is not 6"
  awk '/^<completed_work>/,/^<\/completed_work>/' "$C" | grep -qF '.planning/sketches/011-recipe-route-c' || bad "completed_work does not record task 6 with the sketch 011 path"
  awk '/^<remaining_work>/,/^<\/remaining_work>/' "$C" | grep -qF 'Task 6' && bad "remaining_work still lists Task 6"
  awk '/^<current_state>/,/^<\/current_state>/' "$C" | grep -qF 'has NOT been made yet' && bad "current_state still says the snapshot is not made"
  NA=$(awk '/^<next_action>/,/^<\/next_action>/' "$C")
  echo "$NA" | grep -qF '/gsd-discuss-phase 03.5' || bad "next_action does not name /gsd-discuss-phase 03.5"
  echo "$NA" | grep -qiF 'rebuild the boards' && bad "next_action still starts with rebuilding the boards"
  [ -z "$(git -C "$ROOT" status --porcelain -- app)" ] || bad "app/ has changes"
}

case "${1:-all}" in
  boards) boards ;;
  docs) docs ;;
  all) boards; docs ;;
  *) echo "usage: $0 boards|docs|all"; exit 2 ;;
esac
[ "$fail" -eq 0 ] && echo "PASS: ${1:-all}"
exit "$fail"
