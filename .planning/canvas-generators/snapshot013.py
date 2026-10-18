# Sid, 2026-10-18 (Phase 10 design gate; Mark approved every look row for the canvas page "Phase 10 creation editor" on Mark's List: look-p10-notebook-entry, look-p10-editor-picker,
# look-p10-scales-style-machine, look-p10-serve-temp, look-p10-note-remove-link, look-p10-pod-rule-40, look-p10-editor-no-process, look-p10-machine-board, look-p10-style-clear-empties-temp,
# look-p10-editor-no-machine and look-p10-style-machine-menu): snapshots the approved boards into .planning/sketches/013-creation-editor/.
#   python3 snapshot013.py <dir holding project/*.dc.html as read from the artifact root at approval> <dest>
#   (read them with the Artifact tool: action read, paths ["project/P10_Editor.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The boards are taken AS SERVED by the canvas (version 1792355967-aa6d), as snapshot010.py and snapshot012.py do. Each is self-contained (no canvas asset links, no data: URIs), so the only
# change is that the canvas's support.js line is dropped. P10_Machine is not snapshotted: the board was retired on 2026-10-18 (the machine is out of the creation editor) and is no longer on the canvas.
# p10.py regenerates P10_Editor and P10_Style byte for byte; P10_Notebook, P10_Picker and P10_Scales were published 2026-10-17 and differ from today's p10.py only in the unused rules of the
# inlined shared block (no menu rules yet, one .mk-note rule since dropped); their markup is the same. The canvas wins.
import sys, os
SRC, DEST = sys.argv[1], sys.argv[2]
SERVED = {'P10_Notebook': 'notebook-new-recipe.html', 'P10_Editor': 'creation-editor.html', 'P10_Picker': 'ingredient-picker.html',
          'P10_Scales': 'scales-and-problems.html', 'P10_Style': 'style-menu-and-bands.html'}
os.makedirs(DEST, exist_ok=True)
for k, out in SERVED.items():
    s = open(os.path.join(SRC, 'project', k + '.dc.html')).read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    assert 'support.js' not in s and '/_blob/' not in s and 'src="data:' not in s
    open(os.path.join(DEST, out), 'w').write(s)
print('ok')
