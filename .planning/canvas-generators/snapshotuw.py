# Sid, 2026-10-26 (the ultra-wide frame; Mark's answers on Mark's List, decide-ultrawide-frame = centred (A) at 01:53 UTC and decide-ultrawide-lists = fill at 01:54 UTC, 2026-10-26;
# sketch 011 README decision 59): snapshots the two boards of the canvas page "Ultra-wide" into sketch 011's folder, .planning/sketches/011-recipe-route-c/, as the ladder's top rung.
#   python3 snapshotuw.py <dir holding project/UW_*.dc.html as read from the artifact root at approval> <dest>
#   (read them with the Artifact tool: action read, paths ["project/UW_Home.dc.html", "project/UW_Recipe.dc.html"], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1792979564-8c87, canvas version 473 of 2026-10-26, the version the survey committed), as snapshot014.py does: self-contained
# (no canvas asset links, no data: URIs), so the only change is that the canvas's support.js line is dropped. Each board keeps every panel (as built, A, B, and on Home A with the list at
# the Sheet's width): panel A on each is what Mark approved; the other panels are the record of what was not chosen and are not cut out, since a snapshot is never hand-edited.
# sha256 of the served files: UW_Home 2b8d11f1, UW_Recipe 6036c210. ultrawide.py is the generator.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
SERVED = {'UW_Home': '2560-home-frame.html', 'UW_Recipe': '2560-recipe-frame.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
