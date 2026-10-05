#!/bin/zsh
# Sid, 2026-10-04 (decisions 41 and 45): one pass of every generator behind the redrawn and the new print boards, in the order that keeps each board's last writer right (gen.py rewrites its own
# hand-drawn boards each time it is imported, so pen.py and breaks.py run before phone.py, and phone.py last). Reads the preview server already on 127.0.0.1:4173; starts nothing, builds nothing.
#   GEN_SP=<scratchpad> ./redraw.sh   then snapshot.py, final-calibrate.mjs and redraw-conform.mjs as the README's "How the boards are made" says.
set -e
cd "$(dirname "$0")"
node final-capture.mjs; node phone-capture.mjs; node breaks-capture.mjs
python3 pen.py > /dev/null
./breaks.sh
python3 phone.py | tail -1
