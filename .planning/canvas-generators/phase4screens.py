import json, re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, SHELLC, APP_ROOT, resolve_media, scope_css, unique_ids
import printstart, markone
# Sid, 2026-10-07 (Mark's List row draw-phase-04-print-route-home-draft-notice; Phase 4 D-00, D-04, D-10, D-15, D-18; nothing approved): the three Phase 4 screens Mark asked to see, drawn on the built app.
#   (1) the print route on screen: one line (recipe, version line, saved date, Sheet code), the Print control, the pages as they will print; at 1280 and 393 (D-04: the canvas decides the 393 view)
#   (3) Home: the short link to the Sheet code field (D-10) and the active-work lead's open-draft line (D-18)
#   (4) the "draft kept" notice (D-15): the existing PageStatus over the Next version pen reopened with its ink; three wordings
# 2026-10-07, after Mark's answers (row draw-duplex-margin-page2-and-chosen-screens; README D20): the 393 print route is option A only (the pages shrink to the width); the draft-kept notice is the one wording
#   "Draft kept. Cancel discards it." and clears after 5 s, so the notice boards show the page at 0 s and 5 s later; Home also draws the case where the draft is on a recipe that was not touched last and that recipe takes the lead.
# Not drawn (Mark): the Search page's Sheet code field and its "No version has this code." line (D-13).
# 2026-10-08 (Bishop's audit gap 4): the recipe page carries the Batch reading below the Sheet, off every window here. The capture is the build of 2026-10-06, which still has the draw-temp cell and Exit consistency and Airiness before the notes;
#   (log_d12's one rule, .mo-readgroup, is the last line of NEW_CSS and carries no comment: scope_css prefixes a comment, not the rule after it.)
#   log_d12() puts that reading in the order README D12 and D17 draw (no draw-temp cell; the draw group's fields after the notes), so no stale markup is left in the board. Nothing in a window changes.
# Every panel is the built app's own shell markup (phase4screens-capture.json: WebKit, the dist of 2026-10-06; 1280 fine pointer, 393 coarse) with the app's own tokens.css, app.css, shell.css, home.css and notebook.css, their @media
# resolved at the panel's width and pointer, each panel's rules scoped to the panel (a canvas artboard does not get a viewport of its own width). The new parts are the markup and the few rules in this file (NEW_CSS); nothing else is changed.
# The paper pages in the print route are the canvas's pages as they stand after D16 to D26 (README D27), as pictures (phase4screens-pages.json, made by phase4screens-pages.mjs from the artifact root): Batch log, Tasting log, and the Sheet's three real pages (2026-10-08, README D29). The foot's code reads the route line's example code.
#   node phase4screens-capture.mjs ; node phase4screens-pages.mjs ; python3 phase4screens.py <canvas.json read from the artifact root> <out dir> ; node phase4screens-measure.mjs <out dir>/project   (writes phase4screens-measure.json; run this file again)
CAP = json.load(open(HERE + '/phase4screens-capture.json')); PG = json.load(open(HERE + '/phase4screens-pages.json'))
# 2026-10-10 (Mark's List row draw-restore-p4-print-route-393-board): the 393 board carries each page picture THREE times; as data: URIs it was 5.6 MB, over the 2 MiB the canvas editor syncs per board, and the editor dropped it from the outline.
#   The five pictures are uploaded to the canvas as assets (phase4screens-assets.json: page key -> /_blob url) and the 393 board references them (290 KB, the same pixels). The 1280 board (1.9 MB) and the measuring snippets keep the data: URIs.
ASSETS = json.load(open(HERE + '/phase4screens-assets.json'))
MEAS = json.load(open(HERE + '/phase4screens-measure.json')) if os.path.exists(HERE + '/phase4screens-measure.json') else {}
HOME = open(os.path.join(APP_ROOT, 'home.css')).read() + '\n'
FIX = '.shell{min-height:0;position:relative}.shell__tabs{position:absolute !important;inset-inline:0;inset-block-end:0}.shell__main{min-width:0}\n'
LABEL = '''.p4-lab{font-family:-apple-system,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}
.p4-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}
.p4-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''
CODE = 'K7QM-2X9D'      # an example in Crockford's alphabet (no I, L, O or U); the real code is derived (D-08), so this is not Olive Oil v1's
SAVED = '1 Jul 2026'    # Olive Oil v1's createdAt in the seeded store (phase4screens-capture.json facts)
NEW_CSS = '''
/* NEW (Home, D-10 and D-18): the open-draft line under the lead's version line, and the section row that holds the short link beside "Recipes" */
.home__lead-draft{margin:var(--gap-xs) 0 0;font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text)}
.home__lead-draft a{color:var(--app-blue-text);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--offset-link-underline)}
.home__section-row{display:flex;align-items:center;justify-content:space-between;column-gap:var(--gap-m);margin:0 0 var(--gap-s)}
.home__section-row .home__section{margin:0}
.home__code-link{font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-blue-text);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--offset-link-underline)}
/* NEW (print route, D-04): the one line, the Print control and the pages */
.print-route{padding-top:var(--gap-l)}
.print-route__head{display:flex;align-items:center;justify-content:space-between;column-gap:var(--gap-m);padding-bottom:var(--gap-m);margin-bottom:var(--gap-m);border-bottom:var(--app-rule-row) solid var(--app-divider)}
.print-route__id{min-width:0}
.print-route__line{margin:var(--gap-hair) 0 0;font-family:var(--face-grotesk);font-size:var(--app-size-meta);font-weight:400;color:var(--app-text-secondary);font-variant-numeric:tabular-nums}
.print-route__name{font-size:var(--app-size-recipe-name);font-weight:700;letter-spacing:-0.02em;color:var(--app-text)}
.print-route__code{font-weight:600;letter-spacing:0.04em;color:var(--app-text)}
.print-route__pages{display:flex;flex-direction:column;row-gap:var(--gap-m)}
.print-route__page{aspect-ratio:816/1056;display:block;box-sizing:border-box;width:100%;max-width:816px;height:auto;border:var(--app-rule-row) solid var(--app-divider);background:#ffffff}
.print-route__stack{padding-inline:var(--gap-page)}
.print-route__stack .print-route__name,.print-route__stack .print-route__part{display:block}
.print-route__stack .print-route__name{font-size:var(--app-size-lead-name)}
.print-route__stack .print-route__head{flex-direction:column;align-items:stretch;row-gap:var(--gap-s)}
.print-route__stack .notebook-action{width:100%}
.notebook-log .batch-row__cells.mo-readgroup{margin-top:var(--app-notebook-log-cell-gap-row)}
'''
COARSE_CSS = '''
/* NEW at a coarse pointer: the touch floor, as the app's own Home name links meet it (home.css, pointer: coarse) */
.home__code-link,.home__lead-draft a,.print-route__name{display:inline-flex;align-items:center;min-height:var(--touch-min)}
'''
STAMP = ' (drawn 2026-10-07; approved)'

def css_for(W, coarse, vid, extra=''):
    css = resolve_media(TOK, W, coarse) + resolve_media(APPC, W, coarse) + resolve_media(SHELLC, W, coarse) + resolve_media(HOME, W, coarse) + resolve_media(NBC, W, coarse)
    css = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', css)
    if coarse: css += COARSE_CSS
    return scope_css(css + FIX + NEW_CSS + extra, '.' + vid)

def drop_hidden(html): return printstart.drop_hidden(html)
def log_d12(h):
    """The Batch reading as the pen-reading board orders it (D12, D17): Time to draw temp. is cut out; Exit consistency and Airiness follow At the machine and Ingredient notes in a row of their own (mo-readgroup, as markone.reading draws it)."""
    h = markone._drop_temp(h); h, ex = markone.take_cell(h, 'Exit consistency'); h, ai = markone.take_cell(h, 'Airiness')
    n = re.search(r'<div class="batch-row__notes">.*?</div>', h); assert n and h.count('mo-readgroup') == 0
    return h[:n.end()] + '<div class="batch-row__cells mo-readgroup">' + ex + ai + '</div>' + h[n.end():]
def clean(html): return drop_hidden(html).replace('<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>', '<p class="shell__brand">Sprinkles</p>', 1)

# ---- Home (D-10, D-18)
def draft_line(path): return f'<p class="home__lead-draft" data-m="draft">Draft open on this version · <a href="{path}" tabindex="0" data-m="draftlink">Go to draft</a></p>'
DRAFT = draft_line('/notebook/mexican-chocolate/mexican-chocolate-v4')
DRAFT_OLIVE = draft_line('/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1')
SECTION = '<div class="home__section-row" data-m="sectionrow"><h2 class="home__section">Recipes</h2><a class="home__code-link" href="/search" tabindex="0" data-m="codelink">Enter Sheet code</a></div>'
def home(W, olive=False):
    h = clean(CAP['home_%d' % W])
    if olive:   # D20: the draft is on Olive Oil, which was not touched last: it takes the lead (the lead section is the build's own, captured with Olive Oil leading); the list below keeps its order
        lead = CAP['lead_%d' % W]['lead']; a = h.index('<section class="home__lead">'); b = h.index('</section>', a) + len('</section>'); h = h[:a] + lead + h[b:]
    m = re.search(r'<p class="home__lead-meta">[^<]*</p>', h); assert m
    h = h[:m.end()] + (DRAFT_OLIVE if olive else DRAFT) + h[m.end():]; assert h.count('<h2 class="home__section">Recipes</h2>') == 1
    return unique_ids(h.replace('<h2 class="home__section">Recipes</h2>', SECTION, 1), 'p4')

# ---- the print route (D-04)
def route_main(W, assets=False):
    stack = W < 760
    sep = '' if stack else ' <span aria-hidden="true">·</span> '
    line = (f'<h1 class="print-route__line"><a class="print-route__name" href="/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1" tabindex="0" data-m="name">Olive Oil Ice Cream</a>{sep}'
            f'<span class="print-route__part" data-m="version">Version 1 · 50 g oil · 800 g</span>{sep}'
            f'<span class="print-route__part" data-m="saved">Saved {SAVED} · Sheet code <span class="print-route__code" data-m="code">{CODE}</span></span></h1>')
    pages = ''.join(f'<img class="print-route__page" data-m="{k}" src="{ASSETS[k] if assets and W == 393 else PG[k]}" width="816" height="1056" alt="{a}">' for k, a in
                    (('log1', 'Batch log, side 1 of 2'), ('log2', 'Tasting log, side 2 of 2'), ('sheet1', 'The Sheet, page 1: Ingredients with Balance beside them'), ('sheet2', 'The Sheet, page 2: the end of the table, then Instructions, steps 1 to 4'), ('sheet3', 'The Sheet, page 3: Instructions, steps 5 to 10')))
    return (f'<div class="notebook print-route{" print-route__stack" if stack else ""}" data-m="route"><header class="print-route__head" data-m="head"><div class="print-route__id"><span class="notebook-caption">Print sheet</span>{line}</div>'
            f'<button type="button" class="notebook-action" tabindex="0" data-m="print">Print</button></header><div class="print-route__pages" data-m="pages">{pages}</div></div>')
def route(W):
    return unique_ids(clean(CAP['chrome_%d' % W]).replace('@@MAIN@@', route_main(W, assets=True)), 'p4')

# ---- the draft-kept notice (D-15)
WORDS = (('C', 'Draft kept. Cancel discards it.', 'chosen'),)   # Mark's answer (decide-p4-draft-kept-words): C; it clears after 5 s (decide-p4-draft-kept-lifetime)
EMPTY = '<p class="page-status" role="status" aria-live="polite"></p>'
def pen(W, text):
    h = log_d12(clean(CAP['pen_%d' % W])); assert h.count(EMPTY) == 1
    return unique_ids(h.replace(EMPTY, '<p class="page-status" role="status" aria-live="polite" data-m="notice">%s</p>' % text, 1), 'p4')
# the app's own max-width arm for the notice is calc(100vw - gap-page - gap-m); a canvas window is not the viewport, so the arm is resolved for the panel's width
def notice_arm(W): return '.page-status{max-width:min(var(--measure-prose),calc(%dpx - var(--gap-page) - var(--gap-m)))}\n' % W

# ---- boards
PANELS = []
def panel(vid, W, coarse, html, x, y, w, h, cap, x0=0, y0=0, sub='', shellh=None, scroll=0, extra=''):
    """A window w x h onto the panel's shell at width W. shellh fixes the shell's own height (a phone screen: the tab row sits at its foot); scroll moves the page under the fixed tab row."""
    ex = ''
    if shellh: ex += '.shell{height:%dpx;overflow:hidden}\n' % shellh
    if scroll: ex += '.shell__head{margin-top:-%dpx}\n' % scroll
    css = css_for(W, coarse, vid, ex + extra)
    PANELS.append(dict(vid=vid, W=W, html=html))
    lab = f'<div style="position:absolute;left:{x}px;top:{y}px;width:{max(w, 360)}px;"><p class="p4-lab">{cap}<small>{sub}</small></p></div>'
    win = (f'<div class="p4-win {vid}" style="position:absolute;left:{x}px;top:{y + 78}px;width:{w}px;height:{h}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div>')
    return lab + win, css

def board(key, title, bw, bh, parts, pid):
    body = ''.join(p[0] for p in parts); css = LABEL + ''.join(p[1] for p in parts) + '[hidden]{display:none !important}'
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    open(pid + '/project/' + key + '.dc.html', 'w').write(printstart.board(title, main, bw, bh, printstart.FONT + css, paper=True))

def m_(d, *p): return d
def m(key, *path, default=None):
    v = MEAS.get(key)
    for p in path:
        if v is None: return default
        v = v.get(p) if isinstance(v, dict) else None
    return default if v is None else v

def build(canvas_in, out):
    os.makedirs(out + '/project', exist_ok=True); c = json.load(open(canvas_in)); B = c['boards']; N = c['notes']
    GAP = 80; LABH = 78; sizes = {}
    # (1) the print route
    h1280 = int(m('route1280', 'docH', default=3800)); sizes['P4_PrintRoute1280'] = (1280, h1280 + LABH)
    board('P4_PrintRoute1280', 'Print route · the one line, the Print control and the pages as they print, at 1280' + STAMP, 1280, h1280 + LABH,
          [panel('p4r1', 1280, False, route(1280), 0, 0, 1280, h1280, 'Print sheet route at 1280 · fine pointer · /notebook/:recipeId/:versionId/print', sub='Olive Oil v1 · the pages are the canvas\'s current log pages and the Sheet\'s three real pages, as pictures; the code is an example')], out)
    S = 852; w3 = 393
    parts = [panel('p4r3a', 393, True, route(393), 0, 0, w3, S, 'The 393 view · the pages shrink to the width', sub='393 · coarse pointer · first screen', shellh=S),
             panel('p4r3b', 393, True, route(393), w3 + GAP, 0, w3, S, 'The same page, scrolled', sub='393 · coarse pointer · the pages as pictures at 43%', shellh=S, scroll=int(m('route393', 'headH', default=300)) + 60),
             # 2026-10-08 (README D28): the end of the route, scrolled to the foot, so the Sheet's end foot (D7) is on this board
             panel('p4r3c', 393, True, route(393), 0, S + LABH + 40, w3, S, 'The end of the page, scrolled', sub='393 · the Sheet\'s end foot, under step 10', shellh=S, scroll=int(MEAS.get('webkit_393', {}).get('route', {}).get('docH', 2770)) - S)]
    bw = 2 * w3 + GAP; bh3 = 2 * S + 2 * LABH + 40; sizes['P4_PrintRoute393'] = (bw, bh3)
    board('P4_PrintRoute393', 'Print route · the 393 view: the pages shrink to the width' + STAMP, bw, bh3, parts, out)
    # (3) Home: row 1 the draft is on the recipe touched last (the lead already is that recipe); row 2 the draft is on another recipe, which takes the lead (Mark's answer to decide-p4-home-draft-on-other-recipe)
    hh = int(m('home1280', 'docH', default=1240)); bw = 1280 + GAP + 393; y2 = max(hh, S) + LABH + GAP; bh = y2 + max(hh, S) + LABH; sizes['P4_Home'] = (bw, bh)
    parts = [panel('p4h1', 1280, False, home(1280), 0, 0, 1280, hh, 'Home at 1280 · the draft is on the recipe touched last', sub='the Sheet code link beside Recipes; the lead says a draft is open on its version and links to it'),
             panel('p4h2', 393, True, home(393), 1280 + GAP, 0, 393, S, 'Home at 393 · coarse pointer', sub='first screen', shellh=S),
             panel('p4h3', 1280, False, home(1280, True), 0, y2, 1280, hh, 'Home at 1280 · the draft is on Olive Oil, which was not touched last: it takes the lead', sub='the lead is the recipe with the open draft; Mexican Chocolate, touched last, is the first row; the list keeps its order'),
             panel('p4h4', 393, True, home(393, True), 1280 + GAP, y2, 393, S, 'Home at 393 · coarse pointer', sub='first screen', shellh=S)]
    board('P4_Home', 'Home · the Sheet code link and the open-draft line; the recipe with the open draft takes the lead' + STAMP, bw, bh, parts, out)
    # (4) the draft-kept notice: Mark chose C, cleared after 5 s
    C = WORDS[0][1]; DK = 1560; bw = 1280 + 2 * (GAP + 393); bh = DK + LABH; sizes['P4_DraftKept'] = (bw, bh)
    parts = [panel('p4d1', 1280, False, pen(1280, C), 0, 0, 1280, DK, 'Draft kept at 1280 · the Next version pen reopened with its ink', sub='the existing PageStatus; Version name, Why and Whole milk 110 g (was 120) typed before the reload; Cancel is still there, no dialog'),
             panel('p4d2', 393, True, pen(393, C), 1280 + GAP, 0, 393, S, 'Draft kept at 393 · coarse pointer', sub='first screen, the moment the page reopens', shellh=S, extra=notice_arm(393)),
             panel('p4d3', 393, True, pen(393, ''), 1280 + GAP + 393 + GAP, 0, 393, S, 'The same page, scrolled to the ink (the notice has cleared)', sub='393 · Whole milk 110 g is pen blue', shellh=S, scroll=int(CAP['facts_393']['gramY']) - 250, extra=notice_arm(393))]
    board('P4_DraftKept', 'Draft kept · the page notice over the pen reopened with its ink, at 1280 and 393' + STAMP, bw, bh, parts, out)
    # the notice at 0 s and 5 s later
    cw, ch, cw3, ch3 = 640, 170, 393, 200; parts = []
    parts.append(panel('p4w1a', 1280, False, pen(1280, C), 0, 0, cw, ch, '0 s · Draft kept. Cancel discards it.', x0=0, y0=0, sub='1280 · the top of the page'))
    parts.append(panel('p4w1b', 1280, False, pen(1280, ''), cw + GAP, 0, cw, ch, '5 s later · the notice has cleared', x0=0, y0=0, sub='1280 · the recipe name is clear'))
    parts.append(panel('p4w3a', 393, True, pen(393, C), 0, ch + LABH + 40, cw3, ch3, '', x0=0, y0=0, sub='393 · 0 s', extra=notice_arm(393)))
    parts.append(panel('p4w3b', 393, True, pen(393, ''), cw3 + GAP, ch + LABH + 40, cw3, ch3, '', x0=0, y0=0, sub='393 · 5 s later', extra=notice_arm(393)))
    bw = 2 * cw + GAP; bh = ch + LABH + 40 + ch3 + LABH; sizes['P4_DraftKeptWords'] = (bw, bh)
    board('P4_DraftKeptWords', 'Draft kept · "Draft kept. Cancel discards it." at 0 s and 5 s later, at 1280 and 393' + STAMP, bw, bh, parts, out)
    # the canvas: a board keeps the x and y it has; only its size and title follow the drawing
    PAGE = ('page-16', 'Phase 4 screens')
    if not any(p['id'] == PAGE[0] for p in c['pages']):
        i = [p['id'] for p in c['pages']].index('page-11'); c['pages'].insert(i + 1, {'id': PAGE[0], 'name': PAGE[1]})
    x = 0; row = ['P4_PrintRoute1280', 'P4_PrintRoute393', 'P4_Home', 'P4_DraftKept', 'P4_DraftKeptWords']; pos = {}
    for key in row:
        w, h = sizes[key]; fn = key + '.dc.html'
        B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h}
        pos[key] = B[fn]['x']; x = B[fn]['x'] + w + (560 if key == 'P4_PrintRoute1280' else 200)
        if fn not in c['order']: c['order'].append(fn)
    titles = {k: re.search(r'<title>(.*?)</title>', open(out + '/project/' + k + '.dc.html').read(), re.S).group(1) for k in row}
    for k in row: B[k + '.dc.html']['title'] = titles[k][:120]
    # the notes, with the measured numbers (phase4screens-measure.json: WebKit with a coarse pointer at 393; Chromium within 2 px)
    w1 = MEAS.get('webkit_1280', {}); w3 = MEAS.get('webkit_393', {})
    def note(key, fn, text, w=440):
        bx, by = B[fn + '.dc.html']['x'], B[fn + '.dc.html']['y']; right = fn == 'P4_PrintRoute1280'   # the first board is 3.5k tall: its note sits at the board's right, top; the others under their board
        N[key] = {**dict(x=bx + sizes[fn][0] + 40 if right else bx, y=by if right else by + sizes[fn][1] + 80), **N.get(key, {}), 'w': w, 'maxH': 1300, 'fill': 'gray', 'page': PAGE[0], 'text': text}
        if not right: N[key]['y'] = by + sizes[fn][1] + 80
    r1, r3 = w1.get('route', {}), w3.get('route', {})
    note('p4-route-note', 'P4_PrintRoute1280', (
        "Drawn 2026-10-07 on the built Shell for your look; approved by Mark 2026-10-08 (D-04, the print route on screen). The route is /notebook/:recipeId/:versionId/print. "
        "New: the caption Print sheet; one line (the Sheet title, a link back to the version, then the version line, the saved date and the Sheet code); the Print control, the app's filled action; then the pages as they print, as pictures: the Batch log and the Tasting log (side 1 and side 2 of the one sheet, the pages as they now stand after your margin, title, notes, rhythm, problems-row and five-line answers), and the Sheet's three real pages (README D29, redrawn 2026-10-08: Olive Oil v1's table does not fit, so the table breaks between step groups and the Instructions follow its tail, as Safari prints it; the boards are on the page Print method). The code is an example; the pages' foot carries the same code as the line. D7's foot is on every page that has one: the two log pages carry it with their side (Side 1 of 2, Side 2 of 2), and the Sheet's end, under step 10 on the Sheet's page 3, carries it without a side label (Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · K7QM-2X9D), in flow after the last step, as real markup on that board. The Sheet's pages 1 and 2 are not the end, so they have none.\n\n"
        f"Measured in the build with the markup injected, WebKit (Chromium within 1 px): at 1280 the line holds on one line ({r1.get('lineH')} px of line height), the head is {r1['head']['h']:g} px tall, Print is {r1['print']['w']:g} x {r1['print']['h']:g} at the right edge, the pages sit at the page gutter at their real 816 px, and the page reads {r1['docH']} px. "
        "Nothing overflows sideways.\n\nYour answers (2026-10-07): Print stays in the line only; the line does not say when a draft is open (it prints the saved version); the label is Print."))
    note('p4-route393-note', 'P4_PrintRoute393', (
        "Your answer, D-04: A, the pages shrink to the width. The line stacks in three (the name as a 44 px link, the version line, then the saved date and the code), Print takes the full width, "
        f"{r3['print']['w']:g} x {r3['print']['h']:g}, the head is {r3['head']['h']:g} px tall, and the pages shrink to the width: {r3['log1']['w']:g} of 816 px, a scale of {r3['pageScale']:.3f}, so 12 px type prints at {12 * r3['pageScale']:.1f} px. At that size a page shows which sheet it is, not its words; the words are on paper. "
        "The third panel is the page scrolled to its end: the Sheet's end foot, a rule and one line under step 10 on the Sheet's page 3, at 43% (the words are on paper). Board B (the pages keep their size and the page pans sideways) is removed.\n\n"
        "Measured in WebKit with a coarse pointer (Chromium within 1 px): no horizontal overflow; Print and the name link meet the 44 px floor. Not measured on the iPhone."))
    hb, ha = w1.get('homeBefore', {}), w1.get('home', {}); hb3, ha3 = w3.get('homeBefore', {}), w3.get('home', {}); Z = {'lead': {'h': 0}, 'docH': 0, 'draftlink': {'w': 0, 'h': 0}}; hl, hl3 = w1.get('homeLead', Z), w3.get('homeLead', Z)   # Z: the first pass, before the measurement has the key
    note('p4-home-note', 'P4_Home', (
        "Drawn 2026-10-07 on the built Home (the seeded store: the lead is Mexican Chocolate, version 4); approved by Mark 2026-10-08. Two new parts. (1) D-10: Enter Sheet code, a link at the right of the Recipes row, to the Search page where the field lives. "
        "(2) D-18: under the lead's version line, Draft open on this version · Go to draft, the link to that version's page, where the draft is restored. Nothing else on Home changes.\n\n"
        f"Measured, WebKit (Chromium within 1 px): at 1280 the lead grows from {hb['leadH']:g} to {ha['lead']['h']:g} px, the draft line is one line, the code link is {ha['codelink']['w']:g} x {ha['codelink']['h']:g} on the Recipes label's line; "
        f"at 393 with a coarse pointer the lead grows from {hb3['leadH']:g} to {ha3['lead']['h']:g} px (the link meets the 44 px floor), the code link is {ha3['codelink']['w']:g} x {ha3['codelink']['h']:g}, still on the label's line, and nothing overflows (scroll width {ha3['scrollW']}).\n\n"
        "Your answer: the recipe with the open draft takes the lead. The second row draws it: the draft is on Olive Oil Ice Cream, circulator (Version 1), which was not touched last, so its lead replaces Mexican Chocolate's, with its own actions (Next version, Adapt: it is Tasted) and the same draft line. "
        f"At 1280 that lead is {hl['lead']['h']:g} px tall (the page {hl['docH']} px), at 393 {hl3['lead']['h']:g} px ({hl3['docH']} px); the draft line is one line at 1280, and at 393 its link is {hl3['draftlink']['w']:g} x {hl3['draftlink']['h']:g}. "
        "The list below keeps its order, so Mexican Chocolate stays the first row and Olive Oil is the second: the lead is chosen, not the list. The build's ordering is activeWork(); drawing here does not decide how it picks."))
    ZN = {'box': {'w': 0, 'h': 0}}; mC1 = w1.get('notice', {}).get('C', ZN); mC3 = w3.get('notice', {}).get('C', ZN)
    note('p4-draft-note', 'P4_DraftKept', (
        "Drawn 2026-10-07 on the built Next version pen; approved by Mark 2026-10-08 (D-15). The notice is the app's own PageStatus, unchanged, with the words you chose, Draft kept. Cancel discards it. The pen is open with its ink: Version name, Why and Whole milk 110 g (was 120). Cancel is where it always is, and discards with no dialog.\n\n"
        f"What the build does, measured (WebKit, coarse pointer at 393; Chromium within 2 px): the running head D-15 names is gone (03.5-02), so the notice floats over the top left of the page at {mC1['box']['w']} x {mC1['box']['h']} px (1280) and covers the start of the recipe name ({mC1.get('titleAreaShare', 0)}% of the name's area), which is why it clears after 5 s, as you chose; at 393 it is {mC3['box']['w']} x {mC3['box']['h']} px and covers {mC3.get('titleAreaShare', 0)}% of the name. "
        "The third panel is the page scrolled to the ink, with the notice gone."))
    note('p4-words-note', 'P4_DraftKeptWords', (
        "Your answers: the words are Draft kept. Cancel discards it., and the notice clears after 5 seconds. Drawn in place at the top of the page: at 0 s it covers the start of the recipe name; 5 s later it is gone and the name reads. "
        f"The box is {mC1['box']['w']} x {mC1['box']['h']} px at 1280 and {mC3['box']['w']} x {mC3['box']['h']} at 393, one line at both. A and B are removed."), w=520)
    N['p4-title'] = dict(N.get('p4-title', {}), x=0, y=-300, text='Phase 4 screens: the print route, Home\'s code link and open-draft line, the draft-kept notice', kind='title1', maxW=x, page=PAGE[0])
    return c, pos, sizes, N, PAGE

def snippets():
    """What the measurement injects into the live build: the new rules, the new markup (page pictures swapped for an empty gif of the same attributes)."""
    gif = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs='
    strip = lambda h: re.sub(r'src="data:image/png;base64,[^"]*"', 'src="%s"' % gif, h)
    return dict(css=NEW_CSS, coarse=COARSE_CSS, draft=DRAFT, draftOlive=DRAFT_OLIVE, leadOlive={W: CAP['lead_%d' % W]['lead'] for W in (1280, 393)}, section=SECTION, route1280=strip(route_main(1280)), route393=strip(route_main(393)),
                words={k: t for k, t, _ in WORDS}, arm=notice_arm(393))

if __name__ == '__main__':
    json.dump(snippets(), open(HERE + '/phase4screens-snippets.json', 'w'), indent=1, ensure_ascii=False)
    c, pos, sizes, N, PAGE = build(sys.argv[1], sys.argv[2])
    json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
    print({k: v for k, v in sizes.items()})
