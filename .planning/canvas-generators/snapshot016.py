# Sid, 2026-11-21 (Phase 12 Gate 2; APPROVED by Mark 2026-11-21 on Mark's List: look-p12-phone-entry-points, decide-p12-desk-page-words = A, look-p12-pen-preview-step,
# look-p12-row-controls-r3, decide-p12-add-step-place = A): snapshots the six boards of the canvas page "Phase 12 entry points, pen preview and row controls (Gate 2)" into
# .planning/sketches/016-entry-points-pen-preview-row-controls/.
#   python3 snapshot016.py <dir holding project/*.dc.html as read from the artifact root> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P12G2_Band.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# Re-run 2026-11-21 after P12G2_RowControls was redrawn for Mark's decision of that day (decide-p12-add-step-place = last-line; two groups; Cmd+Return) and P12G2_StepOrder retitled
# as decided: row-controls.html and add-step-place.html are retaken (canvas version 528, 1795269711-4219); the other four are byte-equal to the first snapshot.
# Re-run again the same day for the move keys (Ctrl+Cmd+Up, Ctrl+Cmd+Down) and the one line of key words per region: row-controls.html retaken (canvas version 529, 1795269901-446d).
# Re-run at approval: the five approved boards say approved in their titles and headings and the one-line page's B and C read Not chosen; all five retaken (canvas version 530,
# 1795294127-0877). add-step-place.html is unchanged.
# Re-run after Mark's answer on decide-p12-record-with-draft-held (B, 2026-11-21): recipe-head-below-724.html retaken, its draft-kept panel without the record act (canvas version
# 532, 1795296627-c04d). The other five are unchanged.
# The boards are taken AS SERVED by the canvas (version 1795267623-c53a, canvas version 527, read 2026-11-21), as snapshot015.py does; p12g2.py regenerates all six byte for byte
# (boards/P12G2_*.dc.html, cmp checked against the served files). Each is made to open on its own: the canvas's support.js line is dropped and the font upload is pointed at the
# app's own copy of Caveat. Nothing else in the markup or the inlined CSS changes. The canvas wins.
# Round two redraws (Sid, 2026-11-22; decide-p12-phone-home-held-draft, decide-p12-desk-line-words, decide-p12-picker-says-where): three more boards, made by p12r2.py, snapshotted
# as served (canvas version 587, 1795401178-8f0f) before Mark's answer, so the build can cite them; a board not in <dir> is skipped, so the six approved files are not retaken.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'
SERVED = {'P12G2_Band': 'recipe-head-below-724.html', 'P12G2_Places': 'notebook-home-more-393.html', 'P12G2_DeskPage': 'one-line-page.html', 'P12G2_PenPreview': 'pen-preview-step.html',
          'P12G2_RowControls': 'row-controls.html', 'P12G2_StepOrder': 'add-step-place.html',
          'P12R2_HomeDraft': 'home-held-draft-393.html', 'P12R2_DeskLine': 'desk-line-words.html', 'P12R2_PickerWhere': 'picker-says-where.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    if not os.path.exists(os.path.join(SRC, 'project', k + '.dc.html')): continue
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1).replace(FONT_BLOB, FONT_LOCAL)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
