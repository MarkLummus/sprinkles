import json, re, os, sys
from cssscope import TOK, APPC, NBC, SHELLC, resolve_media, _strip_comments, _block_end
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-06 (Phase 4 D-00 as amended 2026-10-06): the "Print formats" page's two starting-point boards, captured again from the built Sheet after Phase 03.7 (Before you start above the Ingredients table, one tbody per step group).
# Markup: printstart-capture.json (node printstart-capture.mjs: WebKit, Olive Oil v1, 1280, the dist of 2026-10-06), left as the build renders it; only the closed fold content (hidden) is left out, because the canvas ignores `hidden`.
# Stylesheet: the app's own source files, inlined with their media blocks resolved, because a canvas artboard does not get a viewport of its own width (memory: design-canvas-artboards-do-not-get-a-narrow-viewport).
#   AsBuiltRecipePage.dc.html     1280, screen, desktop pointer: tokens.css, app.css, shell.css, notebook.css
#   PrintStartingPoint.dc.html    816 (letter), print: tokens.css, app.css and notebook.css resolved at 816 with the screen-only blocks dropped, and app.css's own @media print block laid on; the Sheet inside the build's .notebook frame with its gutter off. No Phase 4 geometry: no foot, no tick boxes, no ruled As made column.
# The two boards of 2026-09-23 are kept under new file names (AsBuiltRecipePageBefore037, PrintStartingPointBefore037), byte for byte, on their own page, Print formats superseded.
# 2026-10-06 (Mark via Sarge): Olive Oil v1 is captured with no batch (printstart-capture.mjs says how), and the blank batch log's two sides (logforms.py) open the page, in print order.
#   python3 printstart.py <canvas.json read from the artifact root> <out dir>     writes <out>/project/*.dc.html and <out>/project/canvas.json
#   Before the first run: node printstart-capture.mjs ; after the first run: node printstart-measure.mjs <out>/project/PrintStartingPoint.dc.html  (writes printstart-measure.json) and run again.
FONT = "@font-face{font-family:'Caveat';src:url('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc') format('woff2');font-weight:400;font-style:normal;font-display:swap}\n"   # app/public/fonts/caveat-regular.woff2, sha256 d0b7b931..., uploaded 2026-09-23
CAP = json.load(open(HERE + '/printstart-capture.json'))
MEASURE = json.load(open(HERE + '/printstart-measure.json')) if os.path.exists(HERE + '/printstart-measure.json') else {}

def drop_hidden(html):
    """The canvas does not honour the hidden attribute, so a closed fold's content is left out of the markup."""
    while True:
        m = re.search(r'<(div|dl|p|ul|ol|section)\b[^>]*\shidden(?:="")?[ >][^>]*>', html)
        if not m: return html
        tag, i, depth, j = m.group(1), m.start(), 0, m.start()
        for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', html[i:]):
            depth += -1 if t.group(1) else 1
            if depth == 0: j = i + t.end(); break
        html = html[:i] + html[j:]

def print_block():
    css = _strip_comments(APPC); i = css.index('@media print'); k = css.index('{', i); m = _block_end(css, k); return css[k + 1:m - 1]

def board(title, body, w, h, css, flow=False, paper=False):
    hs = '' if flow else f' height: {h}px; overflow: hidden;'
    if paper: hs += ' background: #ffffff;'
    props = json.dumps({"$preview": {"width": w, "height": h}})
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{{margin:0}}
{css}
</style>
</helmet>
<div style="width: {w}px;{hs} box-sizing: border-box;">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{props}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''

T_A = 'As built · the recipe page at 1280, no batch (production build, 2026-10-06, after Phase 03.7)'
T_B = 'Not chosen · Print starting point without Balance (kept for comparison)'
T_C = 'Chosen by Mark 2026-10-06 · Print starting point, Balance in column 2 (nothing approved yet)'   # the canvas cuts titles at 120 characters
NOTE_C = ("Chosen by Mark 2026-10-06: Balance in a second column beside the Ingredients table, no Hide control. "
          "This overrides the print brief's § 4 anti-goal (\"no Balance ... from column two\"); that brief change, with the tick box's retirement, goes to Impeccable later. "
          "No rules between ingredient rows: the heavier step rule carries the grouping. Nothing approved yet; no sketch 010.")
T_F1 = 'Page 1 · Batch log, front: At the machine (blank, drawn 2026-10-06; awaiting Mark; nothing approved)'
T_F2 = 'Page 2 · Batch log, back: When you taste it (blank, drawn 2026-10-06; awaiting Mark; nothing approved)'
NOTE = ("Middle: the Sheet alone at letter width, as the app prints it today (one column, the app's own print rules, a white page), with your edits of 2026-10-06 laid on: "
        "As made is the first column, then the grams, then the ingredient; no tick box (retired by you, superseding the print brief's mise-en-place box, § 3 item 1 and § 6); a heavier rule above each step group and none between ingredient rows; no % of batch, no Watch for, no Balance; headings in ink. Beside it, the alternate with Balance in column 2. Right: the recipe page at 1280, as built. "
        "Both are captured from the production build of 2026-10-06 (real markup, the app's own stylesheets) with Olive Oil v1 as a version with no batch yet: "
        "the build's own no-batch markup, so no As made column, no logged figures and no skipped step. The app has no print design yet, so this is the starting point, not a proposal.\n\n"
        "Change the Print starting point board to design the print. What you change is what Phase 4 builds; what you leave is what the app already does.\n\n"
        "Left: the blank batch log, which prints first, front and back of one sheet (D-07a). Fields from the built record pens, sides and geometry from the print brief. "
        "The short code and the page count in the foot are placeholders. "
        "Decided by you 2026-10-06: numeric fields stay ruled lines with units; both pages carry a date (Churn date, Tasted); the printed caption is Airiness, without (estimated); "
        "the defects keep Any problems? with select all that apply; Next time is about the recipe, so it sits on page 1 under its own heading, where there was room. "
        "These amend the print brief's § 3 item 3, which goes to Impeccable with the other brief changes.\n\n"
        "The first capture (2026-09-23) is on the page Print formats superseded.")
NOTE_OLD = ("Superseded 2026-10-06. These two boards were captured 2026-09-23, before Phase 03.7 moved Before you start above the Ingredients table. "
            "Kept in case anything was drawn on them; the boards on Print formats replace them as the print starting point. Not a target.")
SUP_PAGE = ('page-15', 'Print formats superseded')

def build(canvas_in, out):
    import logforms
    os.makedirs(out + '/project', exist_ok=True)
    c = json.load(open(canvas_in))
    # the boards
    shell = drop_hidden(CAP['page1280']); sheet = drop_hidden(CAP['sheet'])
    css_a = FONT + resolve_media(TOK, 1280, False) + resolve_media(APPC, 1280, False) + resolve_media(SHELLC, 1280, False) + resolve_media(NBC, 1280, False)
    # the Sheet sits in the ancestors the build gives it (.notebook > .notebook-body > .notebook-body__sheet), because notebook.css scopes some of its rules (the fold rows) under .notebook;
    # the one line of CSS added is the frame's own side gutter and width cap taken off, so the Sheet is 816 wide, the page, as the first capture had it
    css_b = FONT + resolve_media(TOK, 816, False, screen=False) + resolve_media(APPC, 816, False, screen=False) + resolve_media(NBC, 816, False, screen=False) + print_block() + '\n.notebook{padding:0;max-width:none;margin:0}'
    # the page is white, as the real print renders it (Mark, 2026-10-06: printed pages are white). Measured 2026-10-06 on the dist of that day: Chrome's PDF (Background graphics off, the
    # dialog's default) and WebKit's print (wkprint.swift) both drop the Sheet's ground (#f7f7f4), and the app sets no print-color-adjust; the board showed the screen tint before. As built, not a change.
    css_b += '\n.recipe-page{background:#ffffff}'
    # Mark's edits on the capture (sheetedits.py: E1 As made first with a tick box, E2 no % of batch, E3 no Watch for, E4 no Balance here, Balance in column 2 on the alternate)
    import sheetedits
    wrap = lambda x: '<div class="notebook"><div class="notebook-body"><div class="notebook-body__sheet">' + x + '</div></div></div>'
    sheet_col2 = wrap(sheetedits.col2_board(sheet)); sheet = wrap(sheetedits.main_board(sheet))
    css_b += sheetedits.CSS
    h_a = max(CAP['facts'][k]['docH'] for k in CAP['facts'] if k.endswith('_1280_screen'))
    h_b = MEASURE.get('boardH', 4600)
    open(out + '/project/AsBuiltRecipePage.dc.html', 'w').write(board(T_A, shell, 1280, h_a, css_a))
    open(out + '/project/PrintStartingPoint.dc.html', 'w').write(board(T_B, sheet, 816, h_b, css_b, flow=True, paper=True))
    h_c = MEASURE.get('boardH_col2', 4000)
    open(out + '/project/PrintStartingPointBalanceCol2.dc.html', 'w').write(board(T_C, sheet_col2, 816, h_c, css_b + sheetedits.CSS_COL2, flow=True, paper=True))
    fcss = logforms.css()
    open(out + '/project/BatchLogForm.dc.html', 'w').write(board(T_F1, logforms.side1(*logforms.LINES['side1']), 816, 1056, fcss, paper=True))
    open(out + '/project/TastingLogForm.dc.html', 'w').write(board(T_F2, logforms.side2(*logforms.LINES['side2']), 816, 1056, fcss, paper=True))
    # canvas.json: Print formats reads left to right in print order: the log's two sides, the Sheet, then the recipe page as built; the superseded boards and their note go to their own page
    B = c['boards']; N = c['notes']
    if not any(p['id'] == SUP_PAGE[0] for p in c['pages']):
        i = [p['id'] for p in c['pages']].index('page-12'); c['pages'].insert(i, {'id': SUP_PAGE[0], 'name': SUP_PAGE[1]})
    B['AsBuiltRecipePageBefore037.dc.html'].update(page=SUP_PAGE[0], x=0, y=0)
    B['PrintStartingPointBefore037.dc.html'].update(page=SUP_PAGE[0], x=1360, y=0)
    N['asbuilt-superseded-note'].update(page=SUP_PAGE[0], x=2256, y=0, text=NOTE_OLD)
    B['BatchLogForm.dc.html'] = dict(x=0, y=0, w=816, h=1056, page='page-11', paper='letter', title=T_F1)
    B['TastingLogForm.dc.html'] = dict(x=896, y=0, w=816, h=1056, page='page-11', paper='letter', title=T_F2)
    B['PrintStartingPoint.dc.html'].update(x=1792, y=0, w=816, h=h_b, title=T_B, paper='letter', print='flow')
    B['PrintStartingPointBalanceCol2.dc.html'] = dict(B.get('PrintStartingPointBalanceCol2.dc.html', {}), x=2688, y=0, w=816, h=h_c, page='page-11', paper='letter', print='flow', title=T_C)
    B['AsBuiltRecipePage.dc.html'].update(x=3584, y=0, w=1280, h=h_a, title=T_A)
    N['asbuilt-note'].update(x=4944, y=0, text=NOTE)
    N['balance-col2-note'] = dict(N.get('balance-col2-note', {}), fill='gray', page='page-11', w=400, x=2688, y=h_c + 80, text=NOTE_C)
    N['asbuilt-title'].update(maxW=4864)
    for k in ('BatchLogForm.dc.html', 'TastingLogForm.dc.html', 'PrintStartingPointBalanceCol2.dc.html'):
        if k not in c['order']: c['order'].append(k)
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
    return h_a, h_b

if __name__ == '__main__':
    print(build(sys.argv[1], sys.argv[2]))
