# Sid, 2026-10-17 (Phase 9 design gate; Mark approved the Phase 9 places page on Mark's List: look-p9-place-boards 'approved', decide-p9-category-filter A, decide-p9-notebook-order A, decide-p9-provenance-words A):
# snapshots the approved boards into .planning/sketches/012-places/.
#   python3 snapshot012.py <dir holding project/*.dc.html as read from the artifact root at approval> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P9_Notebook.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1792211169-a33d), as snapshot010.py does. Each is self-contained (no canvas asset links), so the only change is that the canvas's support.js line is dropped.
# P9_CategoryOptions is not snapshotted: option B (chips) was rejected and is recorded in the README; places.py still draws it.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
SERVED = {'P9_Notebook': 'notebook-place.html', 'P9_Ingredients': 'ingredients-place.html', 'P9_IngredientsMany': 'ingredients-place-103-entries.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    assert 'support.js' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
