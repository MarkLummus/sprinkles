#!/bin/zsh
# Sid, 2026-10-04: the whole pass in one go (captures, generators, snapshot into a scratch folder, calibration, generators again with the calibrated heights, snapshot, conformance). GEN_SP=<scratchpad> UNBUILT=d3,jump ./redraw-all.sh
set -e
cd "$(dirname "$0")"
DEST="$GEN_SP/snap-new/011-recipe-route-c"
KEYS=(R35C_744 R35C_834 R35C_983 R35C_984 R35C_1024 R35C_1366 R35C_Batch R35C_1920 R35C_NoBatch R35C_Pen R35C_LongHistory R35C_GoToBatchWide R35C_RemoveLink R35C_1366Sticky R35C_984Sticky R35C_744Sticky R35C_1600StickyRail R35C_393 R35C_723 R35C_393PhoneLog R35C_723PhoneLog R35C_393ShowChangesHead R35C_723ShowChangesHead R35C_393AllFolded R35C_BysBreak R35C_PenApp350 R35C_PenApp393 R35C_PenRange724 R35C_PenRange740 R35C_PenRange759)
snap() { (cd ../.. && rm -rf "$DEST" && python3 .planning/canvas-generators/snapshot.py "$GEN_SP" "$DEST" $KEYS > /dev/null); }
./redraw.sh
snap
node final-calibrate.mjs '["744-batch","834-batch","983-batch","984-batch","1024-batch","1366-batch","1600-batch","1920-batch","1600-no-batch","1600-pen","1600-long-history"]' "$DEST" | tail -1
node phone-measure.mjs "$GEN_SP/canvas/project/R35C_393AllFolded.dc.html"
./redraw-gen.sh
snap
node final-calibrate.mjs '["744-batch","834-batch","983-batch","984-batch","1024-batch","1366-batch","1600-batch","1920-batch","1600-no-batch","1600-pen","1600-long-history"]' "$DEST" | tail -1
./redraw-gen.sh
snap
node redraw-conform.mjs "$DEST" | tail -25
node redraw-conform-open.mjs "$DEST" | tail -8
