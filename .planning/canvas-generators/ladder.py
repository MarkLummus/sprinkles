import sys; sys.argv=['x']
from gen import *
from cssscope import resolve_media, scope_css, unique_ids, _strip_comments, TOK, APPC, NBC, SHELLC
import json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-03 (decision 32; Mark challenged the ladder itself: "on the iPad Pro landscape, we have 4 columns: nav, ingredients, balance, batch;
# that forces ingredients to be narrow"; then: "Collapsing the side nav gives more space back to the ingredients table, and the side nav is a
# click-and-go whereas the recipe sections are for specific jobs"). Candidates for the recipe route's four columns at 1366 and 1194.
# Every panel is the built app's own shell markup (ladder-capture.json: WebKit, coarse, the dist of 2026-10-03; Mexican Chocolate v3 with Show changes on and
# constructed As made figures, and Olive Oil v1 as seeded), the app's own tokens.css, app.css, shell.css and notebook.css with their @media blocks resolved
# at a width per file, so a candidate is the app's own rule moved and nothing else is drawn:
#   a today (every file at the window)            b Balance below: app.css resolved at 983 (the one-column Sheet), the log still beside
#   c the log below: notebook.css resolved at 1365 d the tab row for the rail: shell.css resolved at 983, the header's Search, Import and Export kept
#   e a narrow rail that keeps the words: 84px, icon over label (the tab row's place style turned vertical)
# The ingredient table is today's column form in every panel, so the table is the one the app draws; D3's numbers are in the caption.
# Numbers in captions are read from ladder-measure.json (ladder-measure.mjs, the same rules injected in-page on the built app, WebKit and Chrome).
CAP = json.load(open(HERE + '/ladder-capture.json'))
M = json.load(open(HERE + '/ladder-measure.json'))
def drop_hidden(html):
    while True:
        m = re.search(r'<(div|dl|p|ul|ol|section)\b[^>]*\shidden(?:="")?[ >][^>]*>', html)
        if not m: return html
        tag, i, depth, j = m.group(1), m.start(), 0, m.start()
        for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', html[i:]):
            depth += -1 if t.group(1) else 1
            if depth == 0:
                j = i + t.end(); break
        html = html[:i] + html[j:]
CAP = {k: drop_hidden(v) for k, v in CAP.items()}

NARROW_RAIL = '.shell__rail{flex:0 0 84px;width:84px;padding:var(--gap-xs) var(--gap-xs) var(--gap-l)}.shell__rail .shell__place{flex-direction:column;justify-content:center;gap:var(--gap-hair);padding:var(--gap-xs) 0;text-align:center;font-size:var(--app-size-label)}'
FIX = '.shell{min-height:0}.shell__tabs{position:absolute !important;inset-inline:0;inset-block-end:0}.shell__main{min-width:0}'
LABEL_CSS = '''
.lc-title{font-family:var(--face-grotesk);color:var(--app-text);font-size:20px;line-height:26px;font-weight:600;margin:0}
.lc-sub{font-family:var(--face-grotesk);color:var(--app-text-secondary);font-size:15px;line-height:21px;margin:4px 0 0}
.lc-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''
def panel_css(key, W, vid):
    if key == 'c': W = 1365      # the app one pixel below the log's cut: its band, its folds and its History rail follow the cut (decisions 18 and 19)
    app_w = 983 if key == 'b' else W
    shell_w = 983 if key == 'd' else W
    nb_w = W
    shell = resolve_media(SHELLC, shell_w, True)
    if key == 'd':
        shell, n = re.subn(r'\.shell__tools > \.shell__place\s*\{\s*display:\s*none;\s*\}', '', shell)
        assert n == 1, 'the tab-row block no longer hides the header tools'
    css = resolve_media(APPC, app_w, True) + shell + resolve_media(NBC, nb_w, True) + (NARROW_RAIL if key == 'e' else '') + FIX
    return scope_css(css, '.' + vid)

def Mrow(width, label, state, form='column', folds='default', engine='webkit'):
    return next(r for r in M if r['engine'] == engine and r['width'] == width and r['label'] == label and r['state'].startswith(state) and r['form'] == form and r['folds'] == folds)
KEYS = {1366: {'a': (1366, 'a today'), 'b': (1366, 'b Balance below'), 'c': (1365, 'c log below (the app at 1365)'), 'd': (1366, 'd tab row for the rail'), 'e': (1366, 'e narrow rail')},
        1194: {'a': (1194, 'today = c'), 'd': (1194, 'd tab row'), 'e': (1194, 'e narrow rail')}}
TITLES = {'a': 'a · today: the rail, the ingredients, Balance and the log',
          'b': 'b · Balance below the ingredients (the Sheet in one column), the log still beside',
          'c': 'c · the log below the Sheet, Balance still beside the ingredients',
          'd': 'd · the bottom tab row in place of the rail (the existing tab row; Search, Import and Export stay in the header)',
          'e': 'e · a narrow rail that keeps the words (84px, icon over label)'}
def caption(W, key, state):
    w, lab = KEYS[W][key]
    r, c = Mrow(w, lab, state), Mrow(w, lab, state, engine='chrome')
    ro = Mrow(w, lab, state, 'column', 'open') if w < 1366 else r
    col, colc = Mrow(w, lab, state, 'column'), Mrow(w, lab, state, 'column', engine='chrome')
    d3, a_ = Mrow(w, lab, state, 'd3'), Mrow(w, lab, state, 'astack')
    nav = 'tab row' if r['tabs'] else (f"rail {r['nav']:.0f}" if r['nav'] else 'no rail')
    wraps = 'no name wraps' if col['maxRows'] == 1 else f"{len(col['wrapped'])} names wrap, the longest to {col['maxRows']} rows"
    wrapsc = '' if col['maxRows'] == c and False else ''
    side = f"Balance {r['side']:.0f}" if r['side'] != r['table'] else 'Balance below'
    logp = f"log {r['log']:.0f} beside" if r['logBeside'] else 'log below'
    bal = '' if r['side'] != r['table'] else f" ({ro['yBal'] - ro['yIng']}px below the Ingredients heading)"
    txt = (f"{nav}, Sheet {r['sheet']:.0f}, table {r['table']:.0f}, {side}{bal}, {logp}. Name column {col['nameMin']:.0f} ({colc['nameMin']:.0f} Chrome): {wraps}"
           + ('' if col['maxRows'] == 1 else f" (Chrome: {len(colc['wrapped'])} names, {colc['maxRows']} rows)") + f". In D3 form {d3['nameMin']:.0f}, in the stacked column form {a_['nameMin']:.0f}. "
           f"Page {ro['docH']}px tall with the folds open; the log's heading at y {ro['yBatch']}, the Ingredients heading at {ro['yIng']}.")
    return TITLES[key], txt

CAP_H = 150; GAP = 40
def board_for(W, keys):
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]
    rows = [('mex', f'mex3_{W}', 'Mexican', 2700), ('olive', f'olive1_{W}', 'Olive', 3100)]
    body = ''; y = GAP
    for rkey, capkey, st, h in rows:
        for i, key in enumerate(keys):
            vid = f'lc-{rkey}-{key}'
            css_parts.append(panel_css(key, W, vid))
            html = unique_ids(CAP[capkey.replace(str(W), '1365') if key == 'c' else capkey], vid)
            t, sub = caption(W, key, st)
            x = GAP + i * (W + GAP)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{CAP_H}px;"><p class="lc-title">{t}</p><p class="lc-sub">{sub}</p></div>'
                     f'<div class="lc-win {vid}" style="width:{W}px;height:{h}px;"><div class="notebook-ladder" style="width:{W}px;">{html}</div></div></div>\n')
        y += CAP_H + 8 + h + GAP
    bw, bh = GAP + len(keys) * (W + GAP), y
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    return bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}'

BT = {1366: "C · 1366 · iPad Pro 12.9 landscape · the four columns: today and four candidates, Mexican Chocolate v3 above and Olive Oil v1 below (drawn 2026-10-03, decision 32, awaiting Mark's look)",
      1194: "C · 1194 · iPad Pro 11 landscape · today, the tab row and the narrow rail, Mexican Chocolate v3 above and Olive Oil v1 below (drawn 2026-10-03, decision 32, awaiting Mark's look)"}
ENTRIES = {}; X = 0; Y5 = 62000
for W, keys in ((1366, 'abcde'), (1194, 'ade')):
    bw, bh, main, css = board_for(W, keys)
    fn = f'R35C_{W}Ladder.dc.html'
    html = board(BT[W], bw, bh, '', extra_css=css)
    assert html.count(TABLE_CSS) == 1
    html = html.replace(TABLE_CSS, '', 1)
    html = html.replace('<link rel="stylesheet" href="%s">\n' % STYLESHEET, '', 1)
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)
    ENTRIES[fn] = dict(x=X, y=Y5, w=bw, h=bh, page='page-13', title=BT[W])
    X += bw + 160
NOTES = {
  'r35-fourcol-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': Y5 - 240, 'maxW': 8000, 'text': "The recipe route's four columns on the iPad Pro: which drops first (decision 32; drawn 2026-10-03, awaiting Mark's look)"},
  'r35-fourcol-note': {'fill': 'gray', 'page': 'page-13', 'x': X, 'y': Y5, 'w': 400, 'text': "Mark's challenge (2026-10-03): on the iPad Pro landscape the nav, the ingredients, Balance and the batch log make four columns, which forces the ingredients narrow; and the side nav is click-and-go while the recipe sections are for specific jobs. Each board is one window (1366, 1194), Mexican Chocolate v3 above (Show changes on, constructed As made figures) and Olive Oil v1 below. Every panel is the built app's own markup and stylesheets with one rule moved: a today; b Balance below the ingredients; c the log below the Sheet; d the existing bottom tab row for the rail; e a narrow rail that keeps the words. The captions carry the widths, the name wraps, the page height and how far Balance and the log are from the top of the ingredients. Nothing is approved."},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/ladder-canvas-entries.json', 'w'), indent=2)
print('ok ladder', {fn: (e['w'], e['h']) for fn, e in ENTRIES.items()})
