#!/bin/sh
# Sid, 2026-10-17: regenerate the Phase 10 boards (two passes: measure, then build). sh p10-run.sh <out dir> <canvas.json read from the artifact root>
set -e; cd "$(dirname "$0")"; OUT="$1"; mkdir -p "$OUT"
python3 p10.py measure "$OUT" >/dev/null && node p10-measure.mjs "$OUT/measure.html" >/dev/null && python3 p10.py "$2" "$OUT"
