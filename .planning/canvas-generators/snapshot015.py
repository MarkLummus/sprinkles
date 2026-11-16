# Sid, 2026-11-15 (Phase 12 Gate 1; Mark answered the four Gate 1 rows on Mark's List on 2026-11-15: decide-p12-low-to-high-read-back A, decide-p12-tasting-log-lines 4,
# look-p12-pen-and-reading "Approve", look-p12-printed-logs done with the note "The 2 3 4 under their ticks are not required"): snapshots the five boards of the canvas page
# "Phase 12 own scales and problems (Gate 1)" into .planning/sketches/015-own-scales-and-problems/.
#   python3 snapshot015.py <dir holding project/*.dc.html as read from the artifact root> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P12_Pen.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1794791268-56d5, canvas version 514 of 2026-11-15 local, read 2026-11-16 UTC), as snapshot014.py does; p12.py regenerates all five
# byte for byte (boards/P12_*.dc.html, cmp checked against the served files). Each is made to open on its own as snapshot010.py does: the canvas's support.js line is dropped and the
# font upload is pointed at the app's own copy of Caveat. Nothing else in the markup or the inlined CSS changes. The canvas wins.
# P12_Logs and P12_LogLines are the redraw for Mark's note (nothing under a Low to high scale's ticks on the printed row); that redraw awaits look-p12-printed-row-ends-only.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'
SERVED = {'P12_Pen': 'record-pen.html', 'P12_Reading': 'reading.html', 'P12_ReadBack': 'read-back-candidates.html', 'P12_Logs': 'printed-logs.html', 'P12_LogLines': 'tasting-log-lines.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1).replace(FONT_BLOB, FONT_LOCAL)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
