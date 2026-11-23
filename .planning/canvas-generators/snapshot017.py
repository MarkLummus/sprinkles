# Sid, 2026-11-23 (bug-p11-pen-steps-no-reorder, answered "fix"; DRAWN, NOT APPROVED): snapshots the two boards of the canvas page "Phase 12 version pen: step order" into
# .planning/sketches/017-pen-step-order/, before Mark's answers, so the decide and look rows and a later plan can cite them.
#   python3 snapshot017.py <dir holding project/*.dc.html as read from the artifact root> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P12_PenStepOrder.dc.html", "project/P12_StepOrderShown.dc.html"], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (canvas version 591, 1795441159-70cc, read 2026-11-23), as snapshot016.py does; p12pm.py regenerates both byte for byte
# (boards/P12_*.dc.html, cmp checked against the served files). Each is made to open on its own: the canvas's support.js line is dropped and the font upload is pointed at the
# app's own copy of Caveat. Nothing else in the markup or the inlined CSS changes. The canvas wins. A board not in <dir> is skipped.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'
SERVED = {'P12_PenStepOrder': 'pen-step-order.html', 'P12_StepOrderShown': 'step-order-shown.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    if not os.path.exists(os.path.join(SRC, 'project', k + '.dc.html')): continue
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1).replace(FONT_BLOB, FONT_LOCAL)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
