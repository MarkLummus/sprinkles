import json, re, os, sys
from cssscope import TOK, APPC, NBC, SHELLC, resolve_media, _strip_comments, _block_end
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-06 (Phase 4 D-00 as amended 2026-10-06): the "Print formats" page's two starting-point boards, captured again from the built Sheet after Phase 03.7 (Before you start above the Ingredients table, one tbody per step group).
# Markup: printstart-capture.json (node printstart-capture.mjs: WebKit, Olive Oil v1, 1280, the dist of 2026-10-06), left as the build renders it; only the closed fold content (hidden) is left out, because the canvas ignores `hidden`.
# Stylesheet: the app's own source files, inlined with their media blocks resolved, because a canvas artboard does not get a viewport of its own width (memory: design-canvas-artboards-do-not-get-a-narrow-viewport).
#   AsBuiltRecipePage.dc.html     1280, screen, desktop pointer: tokens.css, app.css, shell.css, notebook.css
#   PrintStartingPoint.dc.html    816 (letter), print: tokens.css, app.css and notebook.css resolved at 816 with the screen-only blocks dropped, and app.css's own @media print block laid on; the Sheet inside the build's .notebook frame with its gutter off. No Phase 4 geometry: no foot, no tick boxes, no ruled As made column.
# The two boards of 2026-09-23 are kept under new file names and marked superseded; Mark's edits, if any, travel with them.
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

def board(title, body, w, h, css, flow=False):
    hs = '' if flow else f' height: {h}px; overflow: hidden;'
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

T_A = 'As built · the recipe page at 1280 (production build, 2026-10-06, after Phase 03.7)'
T_B = 'Print starting point · the Sheet as built, at letter width, no print design yet (2026-10-06, after Phase 03.7)'
NOTE = ("Left: the recipe page as the app renders it today, at 1280, captured from the production build of 2026-10-06 (real markup, the app's own stylesheets). "
        "Right: the Sheet alone at letter width, as the app prints it today: one column, with the app's own print rules on (the save notice hidden, the hand in italic text). "
        "The app has no print design yet, so this is the starting point, not a proposal.\n\n"
        "Change the right-hand artboard here to design the print. What you change is what Phase 4 builds; what you leave is what the app already does.\n\n"
        "Captured again 2026-10-06: Before you start now sits above the Ingredients table, and the table has its header row and one group per step. "
        "The first capture (2026-09-23) is kept at the far right, marked superseded.")
NOTE_OLD = ("Superseded 2026-10-06. These two boards were captured 2026-09-23, before Phase 03.7 moved Before you start above the Ingredients table. "
            "Kept in case anything was drawn on them; the boards at the left replace them as the print starting point. Not a target.")

def build(canvas_in, out):
    os.makedirs(out + '/project', exist_ok=True)
    c = json.load(open(canvas_in))
    # the boards
    shell = drop_hidden(CAP['page1280']); sheet = drop_hidden(CAP['sheet'])
    css_a = FONT + resolve_media(TOK, 1280, False) + resolve_media(APPC, 1280, False) + resolve_media(SHELLC, 1280, False) + resolve_media(NBC, 1280, False)
    # the Sheet sits in the ancestors the build gives it (.notebook > .notebook-body > .notebook-body__sheet), because notebook.css scopes some of its rules (the fold rows) under .notebook;
    # the one line of CSS added is the frame's own side gutter and width cap taken off, so the Sheet is 816 wide, the page, as the first capture had it
    css_b = FONT + resolve_media(TOK, 816, False, screen=False) + resolve_media(APPC, 816, False, screen=False) + resolve_media(NBC, 816, False, screen=False) + print_block() + '\n.notebook{padding:0;max-width:none;margin:0}'
    sheet = '<div class="notebook"><div class="notebook-body"><div class="notebook-body__sheet">' + sheet + '</div></div></div>'
    h_a = max(CAP['facts'][k]['docH'] for k in CAP['facts'] if k.endswith('_1280_screen'))
    h_b = MEASURE.get('boardH', 4600)
    # the superseded copies carry the files exactly as read from the artifact root, under new names
    root = os.path.dirname(canvas_in)
    for new, old in (('AsBuiltRecipePageBefore037.dc.html', 'AsBuiltRecipePage.dc.html'), ('PrintStartingPointBefore037.dc.html', 'PrintStartingPoint.dc.html')):
        src = os.path.join(root, old)
        if not os.path.exists(os.path.join(root, new)):    # a re-run never copies the new capture over the superseded one
            open(os.path.join(out, 'project', new), 'w').write(open(src).read())
    open(out + '/project/AsBuiltRecipePage.dc.html', 'w').write(board(T_A, shell, 1280, h_a, css_a))
    open(out + '/project/PrintStartingPoint.dc.html', 'w').write(board(T_B, sheet, 816, h_b, css_b, flow=True))
    # canvas.json: new boards keep the x and y Mark has them at; the old ones move right and are marked
    B = c['boards']; N = c['notes']
    oa, ob = B['AsBuiltRecipePage.dc.html'], B['PrintStartingPoint.dc.html']
    if 'AsBuiltRecipePageBefore037.dc.html' not in B:
        B['AsBuiltRecipePageBefore037.dc.html'] = dict(oa, x=2800, y=0, title='Superseded 2026-10-06 · ' + oa['title'] + ' · captured before Phase 03.7')
        B['PrintStartingPointBefore037.dc.html'] = dict(ob, x=4160, y=0, title='Superseded 2026-10-06 · ' + ob['title'] + ' · captured before Phase 03.7')
    B['AsBuiltRecipePage.dc.html'] = dict(oa, w=1280, h=h_a, title=T_A)
    B['PrintStartingPoint.dc.html'] = dict(ob, w=816, h=h_b, title=T_B, paper='letter', print='flow')
    for k in ('AsBuiltRecipePageBefore037.dc.html', 'PrintStartingPointBefore037.dc.html'):
        if k not in c['order']: c['order'].append(k)
    N['asbuilt-note']['text'] = NOTE
    N.setdefault('asbuilt-superseded-note', dict(fill='gray', page='page-11', w=400, x=2800, y=-300))['text'] = NOTE_OLD
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
    return h_a, h_b

if __name__ == '__main__':
    print(build(sys.argv[1], sys.argv[2]))
