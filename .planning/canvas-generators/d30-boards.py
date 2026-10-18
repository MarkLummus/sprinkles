import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import pod40, noteremove
# Sid, 2026-10-18: the sketch 010 boards that change for README D30 (the Sweetness rule on 0 to 40; decide-p10-pod-rule-end) and D31 (the Before you start note remove looks like the row remove).
# The boards are patched as served (the canvas wins over the generators; approved-wording.py does the same), every old shape must be found, and nothing else in a board changes.
#   python3 d30-boards.py <dir holding project/<Board>.dc.html as read from the artifact root> <out dir>   (writes <out>/project/<Board>.dc.html for each board below)
# P4_PrintRoute1280 carries the Sheet's page 1 as a picture: d30-route.py swaps that picture for the new SheetPrintPage1 (needs the pictures made by phase4screens-pages.mjs).
BOARDS = {'PrintStartingPointBalanceCol2': (1, 0), 'SheetPrintPage1': (1, 0), 'P4_DraftKept': (1, 6), 'P4_DraftKeptWords': (2, 8)}   # board -> (Sweetness rules, note removes) that must be found
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out + '/project', exist_ok=True)
for b, (npod, nnote) in BOARDS.items():
    s = open(f'{src}/project/{b}.dc.html').read()
    s, a = pod40.rescale(s, 40); s, c = noteremove.apply(s)
    assert (a, c) == (npod, nnote), (b, a, c)
    open(f'{out}/project/{b}.dc.html', 'w').write(s); print(b, 'Sweetness rules', a, 'note removes', c)
