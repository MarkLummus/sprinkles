#!/bin/zsh
# Sid, 2026-10-04 (decision 45): the print break board's three passes (the layout is measured, then the marks, the numbers and the clipped steps are laid on it). GEN_SP=<scratchpad> ./breaks.sh
set -e
cd "$(dirname "$0")"
rm -f breaks-measure.json
python3 breaks.py > /dev/null                                   # no measure yet: writes R35C_BreakProbe, the unbroken pages
node breaks-measure.mjs probe "$GEN_SP/canvas/project/R35C_BreakProbe.dc.html"
python3 breaks.py > /dev/null                                   # the pages, broken from the probe
node breaks-measure.mjs board "$GEN_SP/canvas/project/R35C_BysBreak.dc.html"
python3 breaks.py | tail -1 | cut -c1-400                       # the same board with the marks, the numbers and the K1 page's whole steps
