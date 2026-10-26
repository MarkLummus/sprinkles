# Sid, 2026-10-26 (Phase 11 design gate; Mark approved the four boards on the canvas page "Phase 11 steps, structure and save" on Mark's List: P11_Save on look-p11-save-r2 (2026-10-25),
# P11_Steps, P11_Structure and P11_FirstVersion on look-p11-steps-r3 (2026-10-25), with decisions 30 to 34 of sketch 013's list and the roadmap's 22 to 25 drawn on them):
# snapshots the approved boards into .planning/sketches/014-steps-structure-save/.
#   python3 snapshot014.py <dir holding project/*.dc.html as read from the artifact root at approval> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P11_Steps.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1792972438-f009, canvas version 468 of 2026-10-25), as snapshot013.py does. Each is self-contained (no canvas asset links,
# no data: URIs), so the only change is that the canvas's support.js line is dropped. p11.py regenerates all four byte for byte (boards/P11_*.dc.html match the served files, sha256 checked
# 2026-10-26). The canvas wins.
# 2026-10-26, later: P11_Structure redrawn for roadmap decision 24 (the removed step's grams fold back; Mark: "redraw it now") and republished as canvas version 469 (1792973563-74b9);
# add-remove-move.html re-taken from that served file the same way (byte-identical minus the support.js line, sha256 05826a8d).
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
SERVED = {'P11_Steps': 'instructions-steps.html', 'P11_Structure': 'add-remove-move.html', 'P11_Save': 'save.html', 'P11_FirstVersion': 'first-version.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
