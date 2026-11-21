# Sid, 2026-11-21 (Phase 12 Gate 2; PROPOSED, awaiting Mark's answers on Mark's List: look-p12-phone-entry-points, look-p12-pen-preview-step, look-p12-row-controls,
# decide-p12-desk-page-words, decide-p12-add-step-place): snapshots the six boards of the canvas page "Phase 12 entry points, pen preview and row controls (Gate 2)" into
# .planning/sketches/016-entry-points-pen-preview-row-controls/.
#   python3 snapshot016.py <dir holding project/*.dc.html as read from the artifact root> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P12G2_Band.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1795267623-c53a, canvas version 527, read 2026-11-21), as snapshot015.py does; p12g2.py regenerates all six byte for byte
# (boards/P12G2_*.dc.html, cmp checked against the served files). Each is made to open on its own: the canvas's support.js line is dropped and the font upload is pointed at the
# app's own copy of Caveat. Nothing else in the markup or the inlined CSS changes. The canvas wins.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'
SERVED = {'P12G2_Band': 'recipe-head-below-724.html', 'P12G2_Places': 'notebook-home-more-393.html', 'P12G2_DeskPage': 'one-line-page.html', 'P12G2_PenPreview': 'pen-preview-step.html',
          'P12G2_RowControls': 'row-controls.html', 'P12G2_StepOrder': 'add-step-place.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1).replace(FONT_BLOB, FONT_LOCAL)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
