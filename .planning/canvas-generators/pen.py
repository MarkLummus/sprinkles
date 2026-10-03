import sys; sys.argv=['x']
from gen import *
import json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-02 (todo 2026-09-25-draw-the-record-pen-in-app-context; route-recipe-batch.md's 2026-09-23 amendment: the battery's
# visual treatment "moves to App context and is drawn on the 03.5 canvas, not invented by a builder"). No board drew the batch
# pen's recording state, so the app's battery still wears sketch 007/008's Sheet grammar (square ink boxes, a pen-blue picked fill)
# in the App's log column. Every board below is the built app's own markup, captured from the running app (pen-capture.json: Olive
# Oil v1, Record another, Add tasting, with values typed and stops, segments and two defects picked; the churn and tasted dates are
# set below), with ONE added stylesheet block, SKIN. The skin changes colour, corner radius and rule colour only: no width, height,
# gap or font size moves, so the pen's measured limits (decision 28: the stacked arrangement needs a 216px frame, the wide one 594)
# hold for the drawn pen exactly as for the built one. Every value is one the App already carries: the divider and neutral tokens, the
# 8px field radius and 10px action radius of 1600-pen.html, and the filled action's colour (app blue text companion, white label).
CAP = json.load(open(HERE + '/pen-capture.json'))

# Typed values the capture could not carry (a date input's value is a property, not an attribute)
def with_dates(html):
    html = html.replace('type="date" value=""', 'type="date" value="2026-08-02"', 1)
    html = html.replace('type="date" value=""', 'type="date" value="2026-08-04"', 1)
    return html

# The skin. Interactive boxes keep a boundary that reads at 3:1 (app-text-secondary, 7.0:1 on white); text fields and the page's
# own rules take the hairline divider, as 1600-pen.html draws the version pen's fields. The picked fill is the one open choice: the
# filled action's colour, since pen blue in the App is the maker's own words in the hand and the reading view already shows measured
# figures in ink.
SKIN = '''
/* App-context skin for the record pen: colour, radius and rule colour only; no size moves (decision 29) */
.notebook-log *{border-color:var(--app-divider)}
.notebook-log .pen-caption{color:var(--app-text-secondary)}
.notebook-log .ink-field{border-radius:var(--app-notebook-field-radius);color:var(--app-text)}
.notebook-log .axis-mark__stop,.notebook-log .segmented__option{border-color:var(--app-text-secondary)}
.notebook-log .axis-mark__stop:first-child,.notebook-log .segmented__option:first-child{border-top-left-radius:var(--app-notebook-field-radius);border-bottom-left-radius:var(--app-notebook-field-radius)}
.notebook-log .axis-mark__stop:last-child,.notebook-log .segmented__option:last-child{border-top-right-radius:var(--app-notebook-field-radius);border-bottom-right-radius:var(--app-notebook-field-radius)}
.notebook-log .axis-mark__stop:has(input[type='radio']:checked),.notebook-log .segmented__option:has(input[type='radio']:checked){background:var(--app-blue-text);border-color:var(--app-blue-text);color:var(--app-background)}
.notebook-log .chip-toggle::before{border-color:var(--app-text-secondary);border-radius:var(--app-radius-rail)}
.notebook-log .chip-toggle[aria-pressed='true']::before{background:var(--app-blue-text);border-color:var(--app-blue-text)}
.notebook-log .save-ceremony button{border-color:var(--app-blue-text);border-radius:var(--app-radius-action);color:var(--app-blue-text);background:none}
.notebook-log .save-ceremony button:last-of-type{background:var(--app-blue-text);color:var(--app-background)}
'''

# The canvas's stylesheet asset predates notebook.css and some tokens (53 of tokens.css's 182 custom properties are absent from it, and
# none of notebook.css's rules are in it), and the log is the App's own markup, so these boards carry the app's current tokens.css,
# app.css and notebook.css verbatim after it. Their media blocks answer the viewing window (the canvas gives an artboard no narrow
# viewport), so the 393 board adds FORCED, as every other 393 board does, and the 350 board reads as the 1366 rung.
APP_ROOT = os.path.join(HERE, '..', '..', 'app', 'src', 'styles')
APP_CSS = ''.join(open(os.path.join(APP_ROOT, f)).read() + '\n' for f in ('tokens.css', 'app.css', 'notebook.css'))

def dc(fn, title, w, h, main, css):
    html = board(title, w, h, '', extra_css=css + '[hidden]{display:none !important}')
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)

def column(w, pad):
    return f'<div style="width:{w}px;box-sizing:border-box;background:{APP_BG};padding:24px {pad}px 40px;">{with_dates(CAP["pen350"])}</div>'

# 350: the log column beside the Sheet from 1366 (decision 16); 393: the phone's full-width log with the 20px margin
H350, H393 = 2280, 2720
NO_PAD = '.notebook-log{padding:8px 0 0}\n'
dc('R35C_PenApp350.dc.html', 'C · 350 · the record pen in the log column · App context (drawn 2026-10-02, awaiting Mark\'s look)', 350, H350, column(350, 0), APP_CSS + NO_PAD + SKIN)
dc('R35C_PenApp393.dc.html', 'C · 393 · the record pen at the phone · App context (drawn 2026-10-02, awaiting Mark\'s look)', 393, H393, column(393, 20), APP_CSS + FORCED + NO_PAD + SKIN)
dc('R35C_PenAsBuilt350.dc.html', 'C · 350 · the record pen as built · Sheet grammar in the log column (reference)', 350, H350, column(350, 0), APP_CSS + NO_PAD)

Y = 40300
ENTRIES = {
  'R35C_PenAsBuilt350.dc.html': dict(x=0, y=Y, w=350, h=H350, page='page-13', title='C · 350 · the record pen as built · Sheet grammar in the log column (reference)'),
  'R35C_PenApp350.dc.html': dict(x=430, y=Y, w=350, h=H350, page='page-13', title='C · 350 · the record pen in the log column · App context (drawn 2026-10-02, awaiting Mark\'s look)'),
  'R35C_PenApp393.dc.html': dict(x=860, y=Y, w=393, h=H393, page='page-13', title='C · 393 · the record pen at the phone · App context (drawn 2026-10-02, awaiting Mark\'s look)'),
}
NOTES = {
  'r35-penapp-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': Y - 240, 'maxW': 1253, 'text': 'The record pen in App context (drawn 2026-10-02, awaiting Mark\'s look)'},
  'r35-penapp-note': {'fill': 'gray', 'page': 'page-13', 'x': 1333, 'y': Y, 'w': 400, 'text': 'Nothing drew the batch pen\'s recording state, so the app wears the Sheet\'s square ink boxes and pen-blue fill in the App\'s log column. Left: as built. Middle and right: the same markup, captured from the running app (Olive Oil v1, Record another, Add tasting, with values typed and some stops, segments and defects picked), with one skin on top. The skin changes colour, corner radius and rule colour only; no width, height, gap or font size moves, so the measured limits hold (the stacked arrangement needs a 216px frame, the wide one 594; the 350 column has 134 to spare).\n\nFields keep the App\'s hairline and 8px radius (as 1600-pen.html draws them) and their typed numbers read in ink; the maker\'s notes keep pen blue. Joined stops and segments take an 8px outer radius and a 7:1 boundary; the picked one fills in the filled action\'s blue with a white label. Defect squares round to 4px and fill the same way. Cancel is the outline action, Save batch the filled one. The one open choice is the picked fill: app blue, since pen blue in the App is the maker\'s words in the hand. The hairline on text fields is 1.4:1 on white, as on the version pen; WCAG 1.4.11 asks 3:1 of a control\'s boundary.'},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/pen-canvas-entries.json', 'w'), indent=2)
# ---------------------------------------------------------------------------------------------------------------------
# The record pen between 724 and 759 (Sid, 2026-10-02; decision 28's addendum, still proposed): what the app does today at the
# window widths 724, 740 and 759 (the pen's wide-to-stacked cut at 760) beside what the cut at 724 would give. Each board is one
# window width, two arrangements side by side (columns) and mouse over touch (rows), four panels, each panel a window-wide strip
# of the built app's own log markup. The markup is captured from two builds of the app at a 740 window (pen-capture.json keys
# range_today, range_today_touch, range_cut724, range_cut724_touch): the app as it stands, and a scratch copy with the pen's three
# literals moved from 760 to 724 (the width-only block, the wide-touch block and BatchRow's useBelow760 query). The textarea's inline
# height differs by pointer, which is why touch has its own capture.
#
# A canvas artboard answers the viewer's window, not its own width, so every @media block of the app's stylesheets is resolved here
# at the panel's window width and pointer (resolve_media) and each panel's stylesheet is scoped to the panel (scope_css), so
# four arrangements share one board without one panel's rules reaching another's. Nothing else is added except SKIN (decision 29).
# The canvas's old stylesheet asset is left out of these boards: the app's own tokens.css, app.css and notebook.css are complete.
# ---------------------------------------------------------------------------------------------------------------------
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

# The cut at 724 is in the app (decision 28, approved by Mark 2026-10-02 and applied: the pen's width-only block and its wide-touch block
# both read 724). The two panels are built from the app as it stands: "cut at 724" is the app's stylesheet unchanged, and "today, cut at
# 760" moves those two literals back to 760, so the board still shows what the app did before the cut. Each literal is asserted exactly once,
# so this generator fails (instead of drawing a wrong panel) the day the app itself changes them. (Until 2026-10-03 this asserted the old
# 760 literals and moved them to 724, which failed once the app moved them.)
PEN_CUT = (('@media (max-width: 723.98px) {\n  .axis-mark__stops,', '@media (max-width: 759.98px) {\n  .axis-mark__stops,'),
           ('@media (min-width: 724px) and (pointer: coarse) {', '@media (min-width: 760px) and (pointer: coarse) {'))
def _cut724(app_css):
    for a, _ in PEN_CUT:
        assert app_css.count(a) == 1, a
    return app_css
def _cut760(app_css):
    for a, b in PEN_CUT:
        assert app_css.count(a) == 1, a
        app_css = app_css.replace(a, b)
    return app_css

_read = lambda f: open(os.path.join(APP_ROOT, f)).read() + '\n'
TOK, APPC, NBC = _read('tokens.css'), _read('app.css'), _read('notebook.css')
LABEL_CSS = '''
.rng-title{font-family:var(--face-grotesk);color:var(--app-text);font-size:18px;line-height:24px;font-weight:600;margin:0}
.rng-sub{font-family:var(--face-grotesk);color:var(--app-text-secondary);font-size:14px;line-height:20px;margin:0}
.rng-win{box-sizing:border-box;background:var(--app-background);outline:1px solid var(--app-divider);padding:24px 32px 40px}
'''
RNG_ROW_H = {False: 1580, True: 1870}   # panel heights, mouse and touch rows: the tallest log (stacked) plus the strip's padding
RNG_LABEL_H = 44
RNG_GAP = 40

# One document holds four copies of the pen, and radio buttons of one name form one group across the document, so a pick in one
# panel would clear the same pick in another. Each panel's names, ids and the aria references to them take the panel's suffix.
def unique_ids(html, vid):
    html = re.sub(r' (name|id)="([^"]*)"', lambda m: ' %s="%s-%s"' % (m.group(1), m.group(2), vid), html)
    return re.sub(r' (aria-(?:labelledby|describedby|controls))="([^"]*)"',
                  lambda m: ' %s="%s"' % (m.group(1), ' '.join(i + '-' + vid for i in m.group(2).split())), html)

def range_board(W):
    css_parts = [resolve_media(TOK, W, False), LABEL_CSS]; panels = {}
    variants = [('today', 'Today, cut at 760', 'Stacked: 216 track, 44 x 44 stops', _cut760(APPC)),
                ('cut724', 'Cut at 724', 'Three columns: 186 track, 38 x 32 stops (38 x 44 on touch)', _cut724(APPC))]
    for coarse in (False, True):
        for key, head, sub, app_css in variants:
            vid = 'v-%s-%s' % (key, 'touch' if coarse else 'mouse')
            sheet = resolve_media(app_css, W, coarse) + resolve_media(NBC, W, coarse) + SKIN
            css_parts.append(scope_css(sheet, '.' + vid))
            html = unique_ids(with_dates(CAP['range_' + key + ('_touch' if coarse else '')]), vid)
            panels[(key, coarse)] = (vid, head, sub, html)
    cols = {k: RNG_GAP + i * (W + RNG_GAP) for i, k in enumerate(('today', 'cut724'))}
    body = ''; y = RNG_GAP
    for coarse in (False, True):
        for key in ('today', 'cut724'):
            vid, head, sub, html = panels[(key, coarse)]
            ptr = 'touch' if coarse else 'mouse'
            body += ('<div style="position:absolute;left:%dpx;top:%dpx;width:%dpx;">' % (cols[key], y, W)
                     + '<p class="rng-title">%s · %s · window %d</p><p class="rng-sub">%s</p>' % (head, ptr, W, sub)
                     + '<div class="rng-win %s" style="width:%dpx;height:%dpx;margin-top:8px;overflow:hidden;">' % (vid, W, RNG_ROW_H[coarse])
                     + '<div style="width:%dpx;">%s</div></div></div>\n' % (W - 64, html))
        y += RNG_LABEL_H + 8 + RNG_ROW_H[coarse] + RNG_GAP
    bw, bh = 2 * W + 3 * RNG_GAP, y
    main = '<div style="position:relative;width:%dpx;height:%dpx;background:#ffffff;">%s</div>' % (bw, bh, body)
    return bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}'

RNG_TITLES = {724: 'C · 724 · the record pen at the narrowest window of the range · today (cut at 760) beside the cut at 724 (drawn 2026-10-02, decision 28 still proposed)',
              740: 'C · 740 · the record pen in the middle of the range · today (cut at 760) beside the cut at 724 (drawn, decision 28 still proposed)',
              759: 'C · 759 · the record pen at the widest window of the range · today (cut at 760) beside the cut at 724 (drawn, decision 28 still proposed)'}
RNG_ENTRIES = {}; RX = 0; RY = 43300
for RW in (724, 740, 759):
    bw, bh, main, css = range_board(RW)
    fn = 'R35C_PenRange%d.dc.html' % RW
    html = board(RNG_TITLES[RW], bw, bh, '', extra_css=css)
    html = html.replace('<link rel="stylesheet" href="%s">\n' % STYLESHEET, '', 1)
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)
    RNG_ENTRIES[fn] = dict(x=RX, y=RY, w=bw, h=bh, page='page-13', title=RNG_TITLES[RW])
    RX += bw + 80
RNG_NOTES = {
  'r35-penrange-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': RY - 240, 'maxW': RX - 80, 'text': 'The record pen between 724 and 759 (drawn 2026-10-02, decision 28 still proposed)'},
  'r35-penrange-note': {'fill': 'gray', 'page': 'page-13', 'x': RX, 'y': RY, 'w': 400, 'text': 'Decision 28 proposes moving the pen\'s wide-to-stacked cut from 760 down to 724. Each board is one window width (724, 740, 759); left is what the app does today, right is what the cut at 724 would give; the top row is a mouse, the bottom row touch. The pen is the built app\'s own markup in the App skin of decision 29, captured from two builds of the app at a 740 window. The pen\'s frame is 640 at all three widths, so the boards differ only in the margin around it. Today the pen stacks (216 track, 44 x 44 stops); with the cut it reads in three columns (186 track, 38 x 32 stops, 38 x 44 on touch) and is shorter. Nothing overflows in either.'},
}
json.dump({'boards': RNG_ENTRIES, 'notes': RNG_NOTES}, open(OUT + '/penrange-canvas-entries.json', 'w'), indent=2)
print('ok')
