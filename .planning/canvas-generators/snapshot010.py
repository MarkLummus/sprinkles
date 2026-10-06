# Sid, 2026-10-06 (Phase 4 D-02; Mark approved the Print formats page: "approved, snapshot 010 and update the brief"): snapshots the approved boards into .planning/sketches/010-bench-sheet/.
#   python3 snapshot010.py <dir holding project/*.dc.html as read from the artifact root at approval> <dest>
# The approved boards are taken AS SERVED by the canvas (the canvas wins over this repo's generators); the as-built Sheet they started from is generated here from printstart-capture.json
# with none of Mark's edits (sheetedits.py E1 to E8), so the delta is explicit. Every file is made to open on its own: the canvas's support.js line is dropped and the font upload is
# pointed at the app's own copy of Caveat. Nothing else in the markup or the inlined CSS changes.
import sys, os, re, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart
SRC, DEST = sys.argv[1], sys.argv[2]
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'
def standalone(s):
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    return s.replace(FONT_BLOB, FONT_LOCAL)
os.makedirs(DEST, exist_ok=True)
SERVED = {  # canvas board -> snapshot file
    'BatchLogForm': 'page-1-batch-log.html',                       # approved
    'TastingLogForm': 'page-2-tasting-log.html',                   # approved
    'PrintStartingPointBalanceCol2': 'sheet-balance-col2.html',    # approved: the acceptance target for the Sheet's printed pages
    'PrintStartingPoint': 'reference-sheet-not-chosen.html',       # reference only (Mark: not chosen)
    'AsBuiltRecipePage': 'as-built-recipe-page-1280.html',         # as built, reference: the screen it started from
}
for k, out in SERVED.items():
    open(os.path.join(DEST, out), 'w').write(standalone(open(os.path.join(SRC, 'project', k + '.dc.html')).read()))
# the as-built printed Sheet (no batch), before E1 to E8: the capture, the app's own stylesheets resolved for print at 816, the page white as the real print renders it
CAP = printstart.CAP
sheet = printstart.drop_hidden(CAP['sheet'])
css = (printstart.FONT + printstart.resolve_media(printstart.TOK, 816, False, screen=False) + printstart.resolve_media(printstart.APPC, 816, False, screen=False)
       + printstart.resolve_media(printstart.NBC, 816, False, screen=False) + printstart.print_block() + '\n.notebook{padding:0;max-width:none;margin:0}\n.recipe-page{background:#ffffff}')
body = '<div class="notebook"><div class="notebook-body"><div class="notebook-body__sheet">' + sheet + '</div></div></div>'
html = printstart.board('As built · the printed Sheet, no batch, at letter width (capture of 2026-10-06, before Mark\'s edits)', body, 816, 3230, css, flow=True, paper=True)
open(os.path.join(DEST, 'as-built-sheet-letter.html'), 'w').write(standalone(html))
shutil.copy(os.path.join(HERE, 'printstart-measure.json'), os.path.join(DEST, 'measurements.json'))
print(sorted(os.listdir(DEST)))
