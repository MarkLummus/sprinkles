#!/bin/zsh
# the generators only (no capture), in redraw.sh's order
set -e
cd "$(dirname "$0")"
python3 pen.py > /dev/null; python3 breaks.py | tail -1 | cut -c1-60; python3 phone.py | tail -1 | cut -c1-60
