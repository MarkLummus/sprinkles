# Sid, 2026-10-06 (Phase 4 D-02; Mark approved the Print formats page: "approved, snapshot 010 and update the brief"): snapshots the approved boards into .planning/sketches/010-bench-sheet/.
# Retaken again 2026-10-08 for D29 (the Sheet's three real pages; the method pages retitled as the table-fits variant; the route pictures).
# Retaken 2026-10-08 after Mark closed the design (Mark's List row decide-design-done-snapshot-2: D1 to D28): the log pages, Sheet, method pages, record pen and reading, recipe-declared notation boards and Phase 4 screens, all as served at version 1791421339-aeaf.
#   python3 snapshot010.py <dir holding project/*.dc.html as read from the artifact root at approval> <dest> [<Board> ...]
#   (read them with the Artifact tool: action read, paths ["project/<Board>.dc.html", ...], out_dir <dir>; never hand-edit a board or a snapshot)
# The approved boards are taken AS SERVED by the canvas (the canvas wins over this repo's generators); the as-built Sheet they started from is generated here from printstart-capture.json
# with none of Mark's edits (sheetedits.py E1 to E8), so the delta is explicit. Every file is made to open on its own: the canvas's support.js line is dropped and the font upload is
# pointed at the app's own copy of Caveat. Nothing else in the markup or the inlined CSS changes.
import sys, os, re, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart
SRC, DEST = sys.argv[1], sys.argv[2]
ONLY = sys.argv[3:]   # 2026-10-18 (README D30, D31): board names after <dest> retake only those boards, as served; nothing else in DEST is touched (the as-built Sheet and the measurements are left alone)
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'
# 2026-10-10: the 393 print route board references its five page pictures as canvas assets (phase4screens-assets.json), not data: URIs, so the served board is 290 KB, not 5.6 MB (the editor drops a board over 2 MiB).
# The snapshot opens on its own, so those urls go back to the same pictures as data: URIs (phase4screens-pages.json).
PAGES = json.load(open(HERE + '/phase4screens-pages.json')); PAGE_ASSETS = json.load(open(HERE + '/phase4screens-assets.json'))
def standalone(s):
    s = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1)
    for k, blob in PAGE_ASSETS.items(): s = s.replace('src="%s"' % blob, 'src="%s"' % PAGES[k])
    return s.replace(FONT_BLOB, FONT_LOCAL)
os.makedirs(DEST, exist_ok=True)
SERVED = {  # canvas board -> snapshot file
    # the printed set, approved (D1 to D23)
    'BatchLogForm': 'page-1-batch-log.html',                       # approved
    'TastingLogForm': 'page-2-tasting-log.html',                   # approved
    'PrintStartingPointBalanceCol2': 'sheet-balance-col2.html',    # approved: the acceptance target for the Sheet's printed pages
    'MethodPrintPage1': 'method-page-1.html',                      # approved (D18, D20, D22): steps 1 to 7; since 2026-10-08 (D29) the VARIANT for a table that fits
    'MethodPrintPage2': 'method-page-2.html',                      # approved: steps 8 to 10; the same variant
    # Olive Oil v1's real pages (README D29, 2026-10-08, Mark: "draw the real break"): its table does not fit, so it breaks between step groups and the Instructions follow its tail
    'SheetPrintPage1': 'sheet-page-1-formula.html',
    'SheetPrintPage2': 'sheet-page-2-table-tail.html',
    'SheetPrintPage3': 'sheet-page-3-instructions-end.html',
    # the record pen and its reading (D6 to D14), approved
    'MarkOnePenStates': 'pen-states.html',
    'MarkOnePenWhole': 'pen-whole.html',
    'MarkOneReading': 'pen-reading.html',
    # recipe-declared items and their test rule (D25, D26), approved; the notation gutters are design-time marks, not part of a page
    'DeclaredLogPages': 'declared-log-pages-olive-oil.html',
    'DeclaredLogPagesNone': 'declared-log-pages-none.html',
    'DeclaredLogPagesTwo': 'declared-log-pages-two.html',
    'DeclaredPage2Variants': 'declared-page-2-variants.html',
    'DeclaredPenReading': 'declared-pen-reading.html',
    # the Phase 4 screens (D15, D20, D27, D28), approved
    'P4_PrintRoute1280': 'screen-print-route-1280.html',
    'P4_PrintRoute393': 'screen-print-route-393.html',
    'P4_Home': 'screen-home.html',
    'P4_DraftKept': 'screen-draft-kept.html',
    'P4_DraftKeptWords': 'screen-draft-kept-words.html',
    # guides and references, not targets
    'HolePunchCheck': 'guide-hole-punch-check.html',               # guide: the log pages with the punch holes drawn on
    'PrintStartingPoint': 'reference-sheet-not-chosen.html',       # reference only (Mark: not chosen)
    'AsBuiltRecipePage': 'as-built-recipe-page-1280.html',         # as built, reference: the screen it started from
    'MethodPrintAsBuilt': 'method-as-built.html',                  # as built, reference: the method the build prints today
}
for k, out in SERVED.items():
    if ONLY and k not in ONLY: continue
    open(os.path.join(DEST, out), 'w').write(standalone(open(os.path.join(SRC, 'project', k + '.dc.html')).read()))
if ONLY: print('retaken:', [SERVED[k] for k in ONLY]); sys.exit(0)
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
