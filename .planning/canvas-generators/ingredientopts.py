import sys; sys.argv=['x']
from gen import *
import json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-03 (decision 31; Mark checked the app on his iPad on 2026-10-03). The Sheet's ingredient table at 1366 and 1024:
#   1366 landscape: "With As made in a column and Show changes enabled the ingredient name wraps to 3 rows in some cases."
#   1024 portrait:  "I like the As made and changes stacked with the plan amount from iPhone better as it keeps the ingredient
#                    name from wrapping so aggressively."
# Every Sheet below is the built app's own markup (ingredientopts-capture.json: WebKit, coarse, the dist of 2026-10-03, Mexican
# Chocolate v3 with Show changes on, and Olive Oil v1 as the app prints it). The ONE edit to that markup: the seeded Mexican
# Chocolate batch has no as-made figures, so the figures in its As made column are constructed (two rows left blank). The
# app's own tokens.css, app.css and notebook.css are carried verbatim, their @media blocks resolved at the board's window width and
# the touch pointer (resolve_media) and scoped to each panel (scope_css), because a canvas artboard answers the viewer's window, not
# its own width. Each panel adds only its form's rules (ingredient-options.css; B is the app's own phone list-form block, read out of
# app.css), so the four panels of a row share one capture and differ in nothing else.
# The media-resolving and scoping helpers are copied from pen.py (not imported: pen.py asserts the app still carries the pen's old
# 760 literals, which decision 28 moved to 724, so importing it fails today). A canvas artboard answers the viewer's window, so every
# @media block of the app's stylesheets is resolved here at the board's window width and pointer, and each panel's stylesheet is scoped
# to the panel, so four forms share one board without one panel's rules reaching another's.
APP_ROOT = os.path.join(HERE, '..', '..', 'app', 'src', 'styles')
_read = lambda f: open(os.path.join(APP_ROOT, f)).read() + '\n'
TOK, APPC, NBC = _read('tokens.css'), _read('app.css'), _read('notebook.css')

def _strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

def _block_end(css, k):
    depth = 1; m = k + 1
    while depth:
        depth += (css[m] == '{') - (css[m] == '}'); m += 1
    return m

def _media_true(cond, width, coarse):
    for alt in cond.split(','):
        terms = re.findall(r'\(([^)]*)\)', alt); ok = bool(terms)
        for term in terms:
            t = term.replace(' ', '')
            mm = re.fullmatch(r'(max|min)-width:([\d.]+)px', t)
            if mm: ok = ok and ((width <= float(mm.group(2))) if mm.group(1) == 'max' else (width >= float(mm.group(2))))
            elif t == 'pointer:coarse': ok = ok and coarse
            else: ok = False
        if ok: return True
    return False

def resolve_media(css, width, coarse):
    """Unwrap the top-level @media blocks that hold at this window width and pointer; drop the rest (forced colours, print)."""
    css = _strip_comments(css); out = []; i = 0
    while True:
        j = css.find('@media', i)
        if j < 0: out.append(css[i:]); break
        out.append(css[i:j]); k = css.index('{', j); m = _block_end(css, k)
        if _media_true(css[j + 6:k].strip(), width, coarse): out.append(css[k + 1:m - 1])
        i = m
    return ''.join(out)

def _top_commas(sel):
    parts = []; depth = 0; cur = ''
    for ch in sel:
        depth += (ch in '([') - (ch in ')]')
        if ch == ',' and depth == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur); return parts

def scope_css(css, scope):
    """Prefix every rule with the panel's class; body becomes the panel itself."""
    out = []; i = 0
    while True:
        k = css.find('{', i)
        if k < 0: break
        sel = css[i:k].strip(); m = _block_end(css, k)
        assert not sel.startswith('@'), sel
        new = []
        for p in _top_commas(sel):
            p = p.strip()
            assert not p.startswith(':root') and not p.startswith('html'), p
            new.append(scope if p == 'body' else scope + ' ' + p)
        out.append(', '.join(new) + '{' + css[k + 1:m - 1] + '}\n'); i = m
    return ''.join(out)

# One document holds four copies of the pen, and radio buttons of one name form one group across the document, so a pick in one
# panel would clear the same pick in another. Each panel's names, ids and the aria references to them take the panel's suffix.
def unique_ids(html, vid):
    html = re.sub(r' (name|id)="([^"]*)"', lambda m: ' %s="%s-%s"' % (m.group(1), m.group(2), vid), html)
    return re.sub(r' (aria-(?:labelledby|describedby|controls))="([^"]*)"',
                  lambda m: ' %s="%s"' % (m.group(1), ' '.join(i + '-' + vid for i in m.group(2).split())), html)

CAP = json.load(open(HERE + '/ingredientopts-capture.json'))
def drop_hidden(html):
    """The canvas does not honour the hidden attribute (Mark saw closed and open folds look the same), so a closed fold's content, which the
    app renders hidden, is left out of the drawing."""
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
OPT = open(HERE + '/ingredient-options.css').read()
def sec(name):
    m = re.search(r'/\* === ' + name + r' ===[^*]*\*/([\s\S]*?)(?=/\* === |$)', OPT)
    assert m, name
    return m.group(1)
FORM_A, FORM_C = sec('A'), sec('C')
FORM_D1, FORM_D1B, FORM_D2 = sec('D') + sec('D1'), sec('D') + sec('D1') + sec('D1b'), sec('D') + sec('D2')
FORM_D3 = sec('D') + sec('D2') + sec('D3')      # D1 and D2 share the grid and differ in where two figures sit
_i = APPC.index('.ingredient-table thead {')
_j = APPC.index('\n}\n', APPC.index('.ingredient-table td.ingredient-table__col-grams > .struck-value'))
FORM_B = APPC[_i:_j]            # the app's own phone list form (decision 15), without its media wrapper
FORMS = {'today': '', 'A': FORM_A, 'B': FORM_B, 'C': FORM_C, 'D1': FORM_D1, 'D1b': FORM_D1B, 'D2': FORM_D2, 'D3': FORM_D3}

LABEL_CSS = '''
.io-title{font-family:var(--face-grotesk);color:var(--app-text);font-size:18px;line-height:24px;font-weight:600;margin:0}
.io-sub{font-family:var(--face-grotesk);color:var(--app-text-secondary);font-size:14px;line-height:20px;margin:4px 0 0}
.io-win{box-sizing:border-box;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''
CAP_H = 190       # caption block height, so every window in a row starts on one line
GAP = 40
SHEET_W = {1366: 696, 1024: 736}           # the Sheet's width at each window (measured in the built app)

# Row heights: the table region's bottom in each window plus the Sheet's own 48px bottom pad; measured on the first render of each
# board (ingredientopts-heights.json is written by the calibration run and read here, so a regeneration is repeatable).
try:
    HEIGHTS = json.load(open(HERE + '/ingredientopts-heights.json'))
except FileNotFoundError:
    HEIGHTS = {}

# Every number in a caption is read from ingredientopts-measure.json (ingredientopts-measure.mjs: the built app, the form's CSS injected
# in-page, WebKit and system Chrome, coarse pointer; fine measures the same), so a caption cannot drift from a measurement.
M = json.load(open(HERE + '/ingredientopts-measure.json'))
ST_MEX = 'mex3 batch, changes on, as made written'
ST_MEX_SEED = 'mex3 batch, changes on, as made empty (the seed)'
ST_MEX_READ = 'mex3 batch, as made written'
ST_MEX4 = 'mex4 reading (no batch)'
ST_OLIVE = 'olive1 batch (real as made)'
def m(engine, W, state, form):
    return next(r for r in M if r['engine'] == engine and r['coarse'] and r['width'] == W and r['state'] == state and r['form'] == form)
def num(W, state, form, key):
    return round(m('webkit', W, state, form)[key]), round(m('chrome', W, state, form)[key])
def wk_ch(W, state, form, key):
    a, b = num(W, state, form, key)
    return f'{a}px (Chrome {b})'
def mex_text(W):
    t = {}
    tw, tc = m('webkit', W, ST_MEX, 'today'), m('chrome', W, ST_MEX, 'today')
    t['today'] = ('Today · As made a column, the struck and current figures side by side',
                  f"Name column {wk_ch(W, ST_MEX, 'today', 'nameMin')} of a {round(tw['region'])}px table, between an amount column {round(tw['cells'][0])}, As made {round(tw['cells'][2])} and % of batch {round(tw['cells'][3])}. "
                  f"{len(tw['wrapped'])} of 12 names wrap, Dried Skimmed Milk Powder to {tw['maxRows']} rows (Chrome: {len(tc['wrapped'])} names, {tc['maxRows']} rows). "
                  f"With the seeded batch, As made empty, it is {m('webkit', W, ST_MEX_SEED, 'today')['maxRows']} rows (Chrome {m('chrome', W, ST_MEX_SEED, 'today')['maxRows']}). Table {wk_ch(W, ST_MEX, 'today', 'tableH')} tall.")
    aw, ac = m('webkit', W, ST_MEX, 'A'), m('chrome', W, ST_MEX, 'A')
    awr, acr = m('webkit', W, ST_MEX_READ, 'A'), m('chrome', W, ST_MEX_READ, 'A')
    if aw['maxRows'] == 1:
        a_rows = 'No name wraps.'
    else:
        a_rows = f"One name wraps, to {aw['maxRows']} rows (Dried Skimmed Milk Powder)."
    t['A'] = ('A · the changed figure stacked, As made stays a column',
              f"Decision 24's rule (the struck figure above the new one) without the phone media block. Name column {wk_ch(W, ST_MEX, 'A', 'nameMin')}. {a_rows} Table {wk_ch(W, ST_MEX, 'A', 'tableH')} tall. "
              f"With a batch and no changes it draws what is drawn today, and in that state the name column is {wk_ch(W, ST_MEX_READ, 'A', 'nameMin')}"
              + (", still 2 rows for that one name." if awr['maxRows'] > 1 else "."))
    bw_, bc_ = m('webkit', W, ST_MEX, 'B'), m('chrome', W, ST_MEX, 'B')
    t['B'] = ('B · the phone list form',
              f"The app's own phone rules at this width. Name column {wk_ch(W, ST_MEX, 'B', 'nameMin')}, no name wraps. As made stands under the amount, the head row is gone, the rules go to the phone's lighter weight. "
              f"Table {wk_ch(W, ST_MEX, 'B', 'tableH')} tall. With no batch and no changes it is {round(m('webkit', W, ST_MEX4, 'B')['tableH'] - m('webkit', W, ST_MEX4, 'today')['tableH'])}px taller than today ({wk_ch(W, ST_MEX4, 'B', 'tableH')} against {wk_ch(W, ST_MEX4, 'today', 'tableH')}) and has no head.")
    t['C'] = ('C · the middle form: the table\'s head and rules, the phone\'s stack',
              f"Name column {wk_ch(W, ST_MEX, 'C', 'nameMin')}, no name wraps. The head keeps Ingredient and % of batch; the As made head is dropped, the hand under the amount reads as it does on the phone. "
              f"Table {wk_ch(W, ST_MEX, 'C', 'tableH')} tall. With no batch and no changes it is {wk_ch(W, ST_MEX4, 'C', 'tableH')} against {wk_ch(W, ST_MEX4, 'today', 'tableH')} today: the same table to within {abs(round(m('webkit', W, ST_MEX4, 'C')['tableH'] - m('webkit', W, ST_MEX4, 'today')['tableH']))}px.")
    return t
def olive_text(W):
    t = {}
    t['today'] = ('Today · Olive Oil v1, a batch with real As made figures',
                  f"No Show changes (version 1 has no parent). Name column {wk_ch(W, ST_OLIVE, 'today', 'nameMin')}, no name wraps. Table {wk_ch(W, ST_OLIVE, 'today', 'tableH')} tall.")
    t['A'] = ('A · no change here', 'Nothing is struck, so A draws what the app draws today.')
    t['B'] = ('B · the phone list form', f"Name column {wk_ch(W, ST_OLIVE, 'B', 'nameMin')}. Table {wk_ch(W, ST_OLIVE, 'B', 'tableH')} tall, {round(m('webkit', W, ST_OLIVE, 'B')['tableH'] - m('webkit', W, ST_OLIVE, 'today')['tableH'])}px more.")
    t['C'] = ('C · the middle form', f"Name column {wk_ch(W, ST_OLIVE, 'C', 'nameMin')}. Table {wk_ch(W, ST_OLIVE, 'C', 'tableH')} tall, {round(m('webkit', W, ST_OLIVE, 'C')['tableH'] - m('webkit', W, ST_OLIVE, 'today')['tableH'])}px more.")
    return t
# Option D (decision 31, 2026-10-03): ingredientopts-d-measure.json, the same kind of measurement across every state the table has.
DM = json.load(open(HERE + '/ingredientopts-d-measure.json'))
def dm(engine, W, state, form):
    return next(r for r in DM if r['engine'] == engine and r['width'] == W and r['state'] == state and r['form'] == form)
def dwk(W, state, form, key):
    return f"{round(dm('webkit', W, state, form)[key])}px (Chrome {round(dm('chrome', W, state, form)[key])})"
def dwraps(W, state, form):
    a, c = dm('webkit', W, state, form), dm('chrome', W, state, form)
    def one(r):
        n = len(r['wrapped'])
        return 'no name wraps' if r['maxRows'] == 1 else f"{n} name{'s' if n != 1 else ''} wrap, the longest to {r['maxRows']} rows"
    return one(a) + ('' if one(a) == one(c) else f' (Chrome: {one(c)})')
S_BOTH, S_PEN, S_OLIVE, S_REC = 'As made + Show changes', 'pen, amounts changed', 'As made (Olive Oil v1, real figures)', 'recording (Olive Oil v1)'
def d_text(W, state, form, extra=''):
    if form == 'D1':
        return ('D1 · the struck figure left of the plan amount, As made below it',
                f"Name column {dwk(W, state, 'D1', 'nameMin')}, {dwraps(W, state, 'D1')}. The struck figure stays on the plan amount's line, to its left, as the table draws it today (in the share too); As made stands under the plan amount on its right edge, as on the phone. "
                f"Table {dwk(W, state, 'D1', 'tableH')} tall. {extra}")
    if form == 'D1b':
        return ('D1b · as D1, the share\'s struck figure above the current one',
                f"Name column {dwk(W, state, 'D1b', 'nameMin')}, {dwraps(W, state, 'D1b')}. The amount is D1's (struck left, As made below); the share keeps decision 24's stack, so it stays one figure wide. The struck figure is then left in one column and above in the other. "
                f"Table {dwk(W, state, 'D1b', 'tableH')} tall. {extra}")
    if form == 'D3':
        return ('D3 · as D2, the struck figure below the plan amount (Mark, 2026-10-03)',
                f"Name column {dwk(W, state, 'D3', 'nameMin')}, {dwraps(W, state, 'D3')}. The plan amount keeps the first line of its cell, in the amount, the share, the Total and the pen's field; Show changes adds the struck old figure on a line under it. This reverses decisions 24 and 25 (struck above), drawn here for the wide widths only. "
                f"Table {dwk(W, state, 'D3', 'tableH')} tall. {extra}")
    return ('D2 · the struck figure above the plan amount, As made left of it',
            f"Name column {dwk(W, state, 'D2', 'nameMin')}, {dwraps(W, state, 'D2')}. The struck figure stands above the plan amount in the amount and the share (decisions 24 and 25, as the phone); As made has its own track left of the plan amount, under its own head. "
            f"Table {dwk(W, state, 'D2', 'tableH')} tall. {extra}")
def row_text(W, state, label_today):
    t = {'today': (label_today, f"Name column {dwk(W, state, 'today', 'nameMin')}, {dwraps(W, state, 'today')}. Table {dwk(W, state, 'today', 'tableH')} tall."),
         'C': ('C · the middle form', f"Name column {dwk(W, state, 'C', 'nameMin')}, {dwraps(W, state, 'C')}. Table {dwk(W, state, 'C', 'tableH')} tall."),
         'D1': d_text(W, state, 'D1'), 'D1b': d_text(W, state, 'D1b'), 'D2': d_text(W, state, 'D2'), 'D3': d_text(W, state, 'D3')}
    return t
def olive_d(W):
    t = olive_text(W)
    t['D1'] = ('D1 · the struck figure left, As made below', f"Name column {dwk(W, S_OLIVE, 'D1', 'nameMin')}, {dwraps(W, S_OLIVE, 'D1')}. Table {dwk(W, S_OLIVE, 'D1', 'tableH')} tall. Nothing is struck here, so D1 reads as C with As made under the amount.")
    t['D2'] = ('D2 · the struck figure above, As made left', f"Name column {dwk(W, S_OLIVE, 'D2', 'nameMin')}, {dwraps(W, S_OLIVE, 'D2')}. Table {dwk(W, S_OLIVE, 'D2', 'tableH')} tall. As made stands in its own track left of the plan amount, under its head.")
    t['D1b'] = ('D1b · as D1, the share\'s struck figure above', f"Name column {dwk(W, S_OLIVE, 'D1b', 'nameMin')}, {dwraps(W, S_OLIVE, 'D1b')}. Table {dwk(W, S_OLIVE, 'D1b', 'tableH')} tall. Nothing is struck here, so D1b is D1.")
    t['D3'] = ('D3 · as D2, the struck figure below', f"Name column {dwk(W, S_OLIVE, 'D3', 'nameMin')}, {dwraps(W, S_OLIVE, 'D3')}. Table {dwk(W, S_OLIVE, 'D3', 'tableH')} tall. Nothing is struck here, so D3 is D2.")
    return t
def mex_d(W):
    t = mex_text(W)
    t['D1'] = d_text(W, S_BOTH, 'D1')
    t['D1b'] = d_text(W, S_BOTH, 'D1b')
    t['D2'] = d_text(W, S_BOTH, 'D2')
    t['D3'] = d_text(W, S_BOTH, 'D3')
    return t
TEXT = {str(W): {'mex': mex_d(W), 'olive': olive_d(W),
                 'pen': row_text(W, S_PEN, 'Today · the pen open from Next version, Mexican Chocolate v3, three amounts changed'),
                 'rec': row_text(W, S_REC, 'Today · the recording pen (Record another), Olive Oil v1, four As made figures typed')} for W in (1366, 1024)}
TEXT['note'] = ("Mark checked the app on his iPad on 2026-10-03. At 1366 landscape, with As made in a column and Show changes on, the ingredient name wraps to 3 rows in some cases; at 1024 portrait he likes the phone's stacking better because it keeps the name from wrapping so much. "
  "Each board is one window width. Row 1: Mexican Chocolate v3 with Show changes on and a batch in view (the seeded batch has no As made figures, so the figures in that column are constructed, two rows left blank). Row 2: Olive Oil v1 with its real As made figures. Row 3: the pen open from Next version on Mexican Chocolate v3, three amounts changed. Row 4: the recording pen (Record another) on Olive Oil v1, four As made figures typed. "
  "Today beside A (stack only the changed figure, As made stays a column), B (the phone's list form), C (a middle form that keeps the table's head and rules and stacks As made and the changed figure under the plan amount), and, added the same day after Mark asked for one more: D1 and D2, which stack one figure and place one to the left, so the plan amount, the struck figure and As made keep one place relative to each other in every state, the pen's field where the plan amount sits. "
  "D3, added after Mark picked D2 as the direction and asked for the struck old figure under the plan amount instead of above it, so the plan amount never moves when Show changes is toggled (it reverses decisions 24 and 25, which stand the struck figure above; drawn here at the wide widths only). Every Sheet is the built app's own markup, the app's own stylesheets, one form's rules added per panel. The table is the same on a mouse and on touch. Nothing here is approved.")

def panel_css(W, vid, form):
    sheet = resolve_media(APPC, W, True) + resolve_media(NBC, W, True) + _strip_comments(FORMS[form])
    return scope_css(sheet, '.' + vid)

def board_for(W):
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]
    S = SHEET_W[W]
    # rows: key, capture, forms drawn. Columns are fixed by form, so a form sits in one column on every row.
    rows = [('mex', f'mex3_{W}_show', ('today', 'A', 'B', 'C', 'D1', 'D1b', 'D2', 'D3')),
            ('olive', f'olive1_{W}_plain', ('today', 'B', 'C', 'D1', 'D1b', 'D2', 'D3')),
            ('pen', f'mex3pen_{W}', ('today', 'C', 'D1', 'D1b', 'D2', 'D3')),
            ('rec', f'olive1rec_{W}', ('today', 'C', 'D1', 'D1b', 'D2', 'D3'))]
    cols = {'today': 0, 'A': 1, 'B': 2, 'C': 3, 'D1': 4, 'D1b': 5, 'D2': 6, 'D3': 7}
    notes = {'olive': {'A': TEXT[str(W)]['olive']['A']},
             'pen': {'A': ('A and B · not drawn in this state', 'The pen shows its struck parent before the field in the table form; the stacking forms are drawn in C, D1 and D2.')},
             'rec': {'A': ('A and B · not drawn in this state', 'The recording pen puts the As made field in the As made column; the stacking forms are drawn in C, D1 and D2.')}}
    body = ''; y = GAP
    for rkey, capkey, forms in rows:
        h = HEIGHTS.get(str(W), {}).get(rkey, 1400)
        for form in forms:
            vid = f'io-{rkey}-{form}'
            css_parts.append(panel_css(W, vid, form))
            html = unique_ids(CAP[capkey], vid)
            title, sub = TEXT[str(W)][rkey][form]
            x = GAP + cols[form] * (S + GAP)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{S}px;">'
                     f'<div style="height:{CAP_H}px;"><p class="io-title">{title}</p><p class="io-sub">{sub}</p></div>'
                     f'<div class="io-win {vid}" style="width:{S}px;height:{h}px;"><div class="notebook" style="width:{S}px;max-width:none;padding:0;margin:0;display:block;">{html}</div></div></div>\n')
        for slot, (ttl, sub) in notes.get(rkey, {}).items():
            x = GAP + cols[slot] * (S + GAP)
            body += f'<div style="position:absolute;left:{x}px;top:{y}px;width:{S}px;"><p class="io-title">{ttl}</p><p class="io-sub">{sub}</p></div>\n'
        y += CAP_H + 8 + h + GAP
    bw, bh = GAP + 8 * (S + GAP), y
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    return bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}'

TITLES = {
  1366: 'C · 1366 · iPad landscape · the ingredient table with As made and Show changes · today beside seven forms, A to D3 (drawn 2026-10-03, decision 31, awaiting Mark\'s look)',
  1024: 'C · 1024 · iPad portrait · the ingredient table with As made and Show changes · today beside seven forms, A to D3 (drawn 2026-10-03, decision 31, awaiting Mark\'s look)',
}
ENTRIES = {}; X = 0; Y4 = 54000
for W in (1366, 1024):
    bw, bh, main, css = board_for(W)
    fn = f'R35C_{W}IngredientOptions.dc.html'
    html = board(TITLES[W], bw, bh, '', extra_css=css)
    assert html.count(TABLE_CSS) == 1
    html = html.replace(TABLE_CSS, '', 1)                                  # its !important column widths would override the forms
    html = html.replace('<link rel="stylesheet" href="%s">\n' % STYLESHEET, '', 1)   # the app's own stylesheets are carried whole
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)
    ENTRIES[fn] = dict(x=X, y=Y4, w=bw, h=bh, page='page-13', title=TITLES[W])
    X += bw + 160
NOTES = {
  'r35-ingopt-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': Y4 - 240, 'maxW': X - 160, 'text': 'The ingredient table at 1366 and 1024: As made and the changed figure under or beside the plan amount, seven forms (drawn 2026-10-03, decision 31, awaiting Mark\'s look)'},
  'r35-ingopt-note': {'fill': 'gray', 'page': 'page-13', 'x': X, 'y': Y4, 'w': 400, 'text': TEXT['note']},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/ingredientopts-canvas-entries.json', 'w'), indent=2)
print('ok ingredient options', {fn: (e['w'], e['h']) for fn, e in ENTRIES.items()})
