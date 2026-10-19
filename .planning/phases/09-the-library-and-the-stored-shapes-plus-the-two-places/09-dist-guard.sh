#!/bin/sh
# Phase 9 dist guard (plan 09-09, threat T-09-40): no build in this phase may
# write app/dist, the directory Mark's own `vite preview --host` serves to his
# devices. DB_VERSION 10 resets a profile on first open, so a device must not
# be served an intermediate build between the bump and the end of the phase.
#
#   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-guard.sh scan
#   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-guard.sh fingerprint
#   sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-guard.sh check
#
# scan         every build command in an automated verify line of the phase's
#              PLAN.md files, or in a .sh / .mjs file here, must carry --outDir
#              pointing somewhere other than app/dist.
# fingerprint  one sha256 over the main checkout's app/dist (path and file hash
#              of every file), or "absent".
# check        fails when the fingerprint differs from the first line of
#              09-dist-fingerprint.txt, written before DB_VERSION moved.
set -eu

cd "$(git rev-parse --show-toplevel)"

P=.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places

scan() {
  gathered=$(mktemp)
  trap 'rm -f "$gathered"' EXIT

  # An automated verify line: its first non-blank text is the opening tag of
  # the automated element. Prose that merely names app/dist is not gathered.
  for f in "$P"/*-PLAN.md; do
    [ -f "$f" ] || continue
    grep -nE '^[[:space:]]*<automated>' "$f" | sed "s|^|$f:|" >> "$gathered" || true
  done
  # Every line of every script here except this one.
  for f in "$P"/*.sh "$P"/*.mjs; do
    [ -f "$f" ] || continue
    [ "$(basename "$f")" = "09-dist-guard.sh" ] && continue
    grep -n '' "$f" | sed "s|^|$f:|" >> "$gathered" || true
  done

  builds=0
  failed=0
  while IFS= read -r record; do
    case "$record" in
      *"run build"* | *"vite build"*) ;;
      *) continue ;;
    esac
    builds=$((builds + 1))
    case "$record" in
      *--outDir*) ;;
      *)
        echo "FAIL build without --outDir: $record"
        failed=$((failed + 1))
        continue
        ;;
    esac
    target=$(printf '%s' "$record" | sed -n -E 's/.*--outDir[ =]+("[^"]*"|'"'"'[^'"'"']*'"'"'|[^ ]+).*/\1/p')
    target=$(printf '%s' "$target" | tr -d "\"'" | sed -E 's|/+$||; s|[;)]+$||')
    case "$target" in
      app/dist | ./app/dist | */app/dist)
        echo "FAIL build writes app/dist: $record"
        failed=$((failed + 1))
        ;;
      "")
        echo "FAIL build with an unreadable --outDir: $record"
        failed=$((failed + 1))
        ;;
    esac
  done < "$gathered"

  if [ "$failed" -gt 0 ]; then
    exit 1
  fi
  echo "SCAN OK $builds build commands, each with --outDir"
}

# Mark's preview serves the main checkout's app/dist. From a worktree the main
# checkout is the parent of git's common directory, so a stray build inside an
# executor's worktree never reaches a device and a run there reads the same
# directory the main checkout would.
fingerprint() {
  common=$(git rev-parse --path-format=absolute --git-common-dir)
  main=$(dirname "$common")
  dist="$main/app/dist"
  if [ ! -d "$dist" ]; then
    echo absent
    return 0
  fi
  (
    cd "$dist"
    find . -type f | LC_ALL=C sort | while IFS= read -r file; do
      printf '%s %s\n' "$file" "$(shasum -a 256 < "$file" | cut -d' ' -f1)"
    done | shasum -a 256 | cut -d' ' -f1
  )
}

check() {
  recorded=$(head -n 1 "$P/09-dist-fingerprint.txt")
  current=$(fingerprint)
  if [ "$recorded" = "$current" ]; then
    echo "DIST UNCHANGED"
    return 0
  fi
  echo "FAIL DIST CHANGED since plan 09-09"
  exit 1
}

case "${1:-}" in
  scan) scan ;;
  fingerprint) fingerprint ;;
  check) check ;;
  *)
    echo "usage: sh 09-dist-guard.sh scan|fingerprint|check" >&2
    exit 2
    ;;
esac
