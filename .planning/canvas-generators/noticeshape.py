import json, re, os, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import places as PL, printstart
from cssscope import unique_ids
# Sid, 2026-10-23 (bug-save-notice-covers-title-393; Mark's note: "a different kind/shape of notification toast? push up from bottom? always the same way? a larger card?"):
# the page notice right after Save batch, as built beside three shapes, at 1366 and 393. Every window is the built app's own shell (noticeshape-capture.json: WebKit, coarse,
# Olive Oil v1, Record a batch, churn date, Save batch at the pen foot) shown at the scroll position the save left, with the app's own stylesheets resolved at the width.
# The notice in each window is drawn at the box WebKit gave it in the real app with the option's rules injected (noticeshape-measure.mjs, noticeshape-options.json), so the
# intervals are measured, not reasoned. The 393 window has no viewport on the canvas: the tab row is placed by hand at the window's foot where the build fixes it.
# Sid, 2026-10-24 (Mark on decide-page-notice-shape: B, "but not styled like the Sheet. the same color background loses the card against the sheet. should it be styled
# in the Page instead?"; today: "redraw the B card in Page styling"): the board is now A as built, B in the Page's skin with a shadow (BS, the headline), B in the Page's
# skin flat (BP, the Import error panel's grammar), and B as drawn on 2026-10-23 in the Sheet's skin, for the comparison he made. C and D are dropped (rejected). The Page
# skin is the App context's tokens: --app-background, --app-text, the row hairline in --app-divider, --app-radius-control; BS adds --app-shadow-notice (proposed, not in
# tokens.css yet: the fly-out's blur and alpha cast downward). Contrast figures on the key are computed from the colours WebKit gave the card and what lies under it in the
# real app (noticeshape-measure.json "colours"), not from the token values.
#   node noticeshape-capture.mjs <dist> ; node noticeshape-measure.mjs <dist> ; python3 noticeshape.py <canvas.json read from the artifact root> <out dir>
CAP = json.load(open(HERE + '/noticeshape-capture.json'))
MEAS = json.load(open(HERE + '/noticeshape-measure.json'))
OPTS = json.load(open(HERE + '/noticeshape-options.json'))
esc = lambda s: _html.escape(str(s), quote=True)
STAMP = ' (drawn 2026-10-23; redrawn 2026-10-24 with B in Page styling for Mark\'s answer on decide-page-notice-shape; look-page-notice-card-page-styling)'
LABH = 78; GAP = 80; VIEW = {1366: 1024, 393: 852}
FOCUS = 'outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)'

NS_CSS = '''
.ns-notice{position:absolute;z-index:3;box-sizing:border-box;margin:0;border:var(--rule-baseline) solid var(--sheet-ink);background:var(--sheet-ground);color:var(--sheet-ink);font-family:var(--face-grotesk);white-space:nowrap;overflow:hidden}
.ns-A{padding:var(--gap-xs) var(--gap-s);font-size:var(--sheet-type-control)}
.ns-B,.ns-BP,.ns-BS,.ns-D{padding:var(--gap-s) var(--gap-m);font-size:var(--sheet-type-note);line-height:var(--sheet-leading-note)}
.ns-BP,.ns-BS{background:var(--app-background);color:var(--app-text);border:var(--app-rule-row) solid var(--app-divider);border-radius:var(--app-radius-control)}
.ns-BS{--app-shadow-notice:0 4px 16px rgba(20, 20, 20, 0.18);box-shadow:var(--app-shadow-notice)}

.ns-C{padding:var(--gap-s) var(--gap-page);border-width:0 0 var(--rule-baseline);font-size:var(--sheet-type-note);line-height:var(--sheet-leading-note)}
.ns-tabs .shell__tabs{position:absolute}
.ns-dim{position:absolute;background:var(--app-blue-text);z-index:4}
.ns-lab{position:absolute;z-index:4;font-family:var(--face-grotesk);font-size:12px;line-height:16px;font-weight:600;color:var(--app-blue-text);background:rgba(255,255,255,0.88);padding:0 4px;white-space:nowrap}
'''
CSS_BY_CLS = {}
def css_for(W):
    cls = 'ns%d' % W
    if cls not in CSS_BY_CLS: CSS_BY_CLS[cls] = PL.css_for(W, True, cls, extra=NS_CSS)
    return cls

def shell_html(W, vid):
    h = PL.clean(CAP[str(W)]['html'])
    h = re.sub(r'<div class="page-status-anchor">.*?</div>', '', h, count=1, flags=re.S)
    h = re.sub(r'<nav class="shell__tabs".*?</nav>', '', h, count=1, flags=re.S)
    # the focused Batch heading (the save lands focus there): the app's one focus ring
    for m in re.finditer(r'<h2 class="region-name">(.*?)</h2>', h, re.S):
        text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        if text.startswith('Batch') and not text.startswith('Batches'):
            h = h[:m.start()] + f'<h2 class="region-name" style="{FOCUS}">' + h[m.start() + len('<h2 class="region-name">'):]; break
    return unique_ids(h, vid)
def tabs_html(W, vid):
    m = re.search(r'<nav class="shell__tabs".*?</nav>', CAP[str(W)]['html'], re.S)
    return unique_ids(m.group(0), vid + 't')

# ---- dimension marks (annotations, in the app's text blue; never part of the design)
def vdim(x, y1, y2, label, side='right'):
    y1, y2 = sorted((y1, y2)); t = f'<div class="ns-dim" style="left:{x - 4}px;top:{y1}px;width:9px;height:1px"></div><div class="ns-dim" style="left:{x - 4}px;top:{y2}px;width:9px;height:1px"></div>'
    line = f'<div class="ns-dim" style="left:{x}px;top:{y1}px;width:1px;height:{max(y2 - y1, 1)}px"></div>'
    ly = (y1 + y2) / 2 - 8; lx = x + 8 if side == 'right' else None
    lab = f'<div class="ns-lab" style="{"left:%dpx" % lx if lx is not None else "right:%dpx" % (0)};top:{ly}px">{esc(label)}</div>' if side == 'right' else f'<div class="ns-lab" style="left:{x - 8}px;top:{ly}px;transform:translateX(-100%)">{esc(label)}</div>'
    return t + line + lab
def hdim(y, x1, x2, label, above=True):
    x1, x2 = sorted((x1, x2)); t = f'<div class="ns-dim" style="left:{x1}px;top:{y - 4}px;width:1px;height:9px"></div><div class="ns-dim" style="left:{x2}px;top:{y - 4}px;width:1px;height:9px"></div>'
    line = f'<div class="ns-dim" style="left:{x1}px;top:{y}px;width:{max(x2 - x1, 1)}px;height:1px"></div>'
    lab = f'<div class="ns-lab" style="left:{x1 - 4}px;top:{y - 20 if above else y + 6}px;transform:translateX(-100%)">{esc(label)}</div>'
    return t + line + lab
def box_label(n, label, above=False):
    """The card's size; above the card for the bottom-edge rows (2026-10-24), so it does not sit on the tab-row dimension."""
    return f'<div class="ns-lab" style="left:{n["x"]}px;top:{n["y"] - 20 if above else n["y"] + n["h"] + 4}px">{esc(label)}</div>'

def window(opt, W, x, y, vid):
    H = VIEW[W]; m = MEAS[f'{opt}_{W}']; n = m['notice']; f = m['focused']['box']; sc = m['scrollY']
    body = f'<div style="width:{W}px;transform:translateY(-{sc}px)">{shell_html(W, vid)}</div>'
    text = CAP[str(W)]['facts']['after']['text']
    notice = f'<p class="ns-notice ns-{opt}" style="left:{n["x"]}px;top:{n["y"]}px;width:{n["w"]}px;height:{n["h"]}px">{esc(text)}</p>'
    tabs = f'<div class="ns-tabs" style="position:absolute;left:0;right:0;bottom:0;height:{m["tabs"]["h"]}px">{tabs_html(W, vid)}</div>' if m.get('tabs') else ''
    d = []
    nx_mid = n['x'] + n['w'] / 2
    # the interval to the bar's bottom edge (1366, where the bar is on screen) or to the window's top (393, the bar scrolled off)
    ex = n['x'] - 24 if n['x'] >= 200 else n['x'] + 24; eside = 'left' if n['x'] >= 200 else 'right'
    if opt[0] != 'B':
        top_ref = 57 if W == 1366 else 0
        d.append(vdim(ex, top_ref, n['y'], f'{n["y"] - top_ref:g}px ' + ('under the bar' if W == 1366 else 'from the top'), side=eside))
        if n['w'] < W: d.append(hdim(n['y'] + n['h'] + 34, n['x'] + n['w'], W, f'{W - n["x"] - n["w"]:g}px to the edge', above=False))
    else:
        bottom_ref = m['tabs']['y'] if m.get('tabs') else H
        d.append(vdim(ex, n['y'] + n['h'], bottom_ref, f'{bottom_ref - n["y"] - n["h"]:g}px ' + ('above the tab row' if m.get('tabs') else 'above the bottom edge'), side=eside))
    # the interval to the focused Batch heading
    fx = min(nx_mid, W - 240); fside = 'right' if fx < W / 2 else 'left'
    if n['y'] > f['y'] + f['h']: d.append(vdim(fx, f['y'] + f['h'], n['y'], f'{n["y"] - f["y"] - f["h"]:g}px below the focused heading', side=fside))
    else: d.append(vdim(fx, n['y'] + n['h'], f['y'], f'{f["y"] - n["y"] - n["h"]:g}px above the focused heading', side=fside))
    if opt[0] != 'B' and m.get('tabs'): d.append(vdim(W - 60, n['y'] + n['h'], m['tabs']['y'], f'{m["tabs"]["y"] - n["y"] - n["h"]:g}px to the tab row', side='left'))
    d.append(box_label(n, f'{n["w"]:g} × {n["h"]:g}, {m["font"]} text', above=opt[0] == 'B'))
    cls = css_for(W)
    return f'<div class="p4-win {cls} {vid}" style="position:absolute;left:{x}px;top:{y}px;width:{W}px;height:{H}px;">{body}{tabs}{notice}{"".join(d)}</div>'

def covers_text(m):
    seen = [];
    for c in m['covers']:
        t = c['text']
        if not any(t in s or s in t for s in seen): seen.append(t)
    return ', '.join('"%s"' % s for s in seen[:3]) or 'nothing'
def label(x, y, w, cap_text, sub):
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;"><p class="p4-lab">{esc(cap_text)}<small>{esc(sub)}</small></p></div>'

ROWS = [
    ('A', 'As built', 'the one-line 13px pill under the bar at the end edge (quick 261021-07s, sketch 013 decision 23), in the Sheet\'s ground with an ink border; below 724 the bar scrolls away and the notice sticks to the window\'s top'),
    ('BS', 'B in Page styling, with a shadow (proposed)', 'B\'s card, centred at the bottom edge, 16px text, above the tab row where there is one, in the App context\'s skin: app ground, app text, the row hairline in the divider colour, the one App radius (10px), and a shadow for what floats (--app-shadow-notice, proposed: the fly-out\'s blur and alpha cast downward)'),
    ('BP', 'B in Page styling, flat', 'the same card with no shadow: the Import error panel\'s grammar exactly (app ground, hairline, 10px radius); the card stands off the paper by its hairline alone'),
    ('B', 'B as drawn 2026-10-23, in the Sheet\'s skin (Mark: lost against the Sheet)', 'the same geometry in the Sheet\'s ground with a 1.5px ink border: on the Sheet the card\'s ground is the paper\'s own colour'),
]
def _lum(c):
    r, g, b = [int(v) for v in re.findall(r'\d+', c)[:3]]
    f = lambda v: (v / 255) / 12.92 if v / 255 <= 0.03928 else ((v / 255 + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def contrast(a, b):
    la, lb = _lum(a), _lum(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
def c_text(opt, shadow=True):
    """The card's contrast figures from the colours WebKit gave it in the real app: ground against the Sheet and the App ground, border against both, text on the card. (The border's width is not quoted: WebKit paints the Sheet skin's 1.5px as 1px at 1x.)"""
    c = MEAS[f'{opt}_1366']['colours']; bcol = c['border'].split(' ', 1)[1]
    return (f'card ground {contrast(c["background"], c["sheet"]):.2f}:1 against the Sheet and {contrast(c["background"], c["app"]):.2f}:1 against the App ground; '
            f'its border {contrast(bcol, c["sheet"]):.2f}:1 against the Sheet and {contrast(bcol, c["app"]):.2f}:1 against the App ground; text {contrast(c["color"], c["background"]):.1f}:1 on the card'
            + (('; shadow ' + c['shadow'] if c['shadow'] != 'none' else '; no shadow') if shadow else ''))
KEY = ('<b>What Mark asked (2026-10-24, on decide-page-notice-shape: B, "but not styled like the Sheet. the same color background loses the card against the sheet. should it be styled in the Page instead?").</b> '
       'Rows: as built; B in the Page\'s skin with a shadow (the proposal); B in the Page\'s skin flat; B as drawn on 2026-10-23 in the Sheet\'s skin. C and D are off the board (rejected on the decide row). Every window is the built app after Save batch (Olive Oil v1, WebKit, coarse) at the scroll the save left; the card is drawn at the box WebKit gave it with the option\'s rules injected. '
       '<b>Contrast, measured in the real app (WCAG, from the computed colours):</b> at 1366 the card sits over the Sheet\'s last Balance row, at 393 over the log on the App ground. '
       'Sheet skin (B): {cB}. Page skin (BP, BS): {cBP}. '
       '<b>Reading:</b> the Page\'s ground is white and the Sheet\'s paper is 1.07:1 from it, so in Page tokens the ground alone cannot lift the card off the Sheet any more than the Sheet\'s own ground could (1.00:1); the hairline is 1.3:1 against the paper. What lifts the card is the shadow: BS is the one row where the card reads as a thing on top of the page at both widths, and it borrows the fly-out\'s rule (what floats casts) without touching the Sheet-Is-Flat rule, since the notice is App context. '
       'The App is otherwise flat (DESIGN.md Elevation: only the fly-out carries a shadow), so BS adds a third floating thing and one token, --app-shadow-notice; BP keeps the App flat and relies on the hairline. Device-unverified: WebKit on the Mac; the iPad and the iPhone are Mark\'s.')
KEY_CSS = '.ns-key{position:absolute;left:0;top:0;font-family:-apple-system,Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#141414;margin:0}.ns-key b{font-weight:600}'
KEYH = 230
def build(out):
    bw = 1366 + GAP + 393
    parts = [f'<p class="ns-key" style="width:{bw}px">{KEY.format(cB=c_text("B", shadow=False), cBP=c_text("BP", shadow=False))}</p>']; y = KEYH
    for opt, name, what in ROWS:
        x = 0
        for W in (1366, 393):
            m = MEAS[f'{opt}_{W}']; n = m['notice']; sub = f'{what}. Here it covers {covers_text(m)}'
            if W == 393 and m['atTop']['name']['ov']: sub += f'; scrolled to the top it covers the recipe name ({m["atTop"]["name"]["ov"]["w"]:g} × {m["atTop"]["name"]["ov"]["h"]:g})'
            sub += f'. {n["w"]:g} × {n["h"]:g} at {m["font"]}; {m["toFocus"]:g}px from the focused Batch heading'
            if m.get('tabs'): sub += f'; {m["toTabs"]:g}px from the tab row'
            if W == 1366: sub += '. ' + c_text(opt)[0].upper() + c_text(opt)[1:]
            parts.append(label(x, y, W, f'{opt} · {name} · {W} · after Save batch', sub))
            parts.append(window(opt, W, x, y + LABH, f'w{opt}{W}'))
            x += W + GAP
        y += LABH + max(VIEW.values()) + GAP
    bh = y - GAP
    css = PL.LABEL + ''.join(CSS_BY_CLS.values()) + KEY_CSS
    body = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{"".join(parts)}</div>'
    os.makedirs(out + '/project', exist_ok=True)
    open(out + '/project/Notice_Shape.dc.html', 'w').write(printstart.board(TITLE + STAMP, body, bw, bh, css, paper=True))
    return bw, bh

TITLE = 'Page notice after Save batch · as built, B in Page styling (shadow, flat) and B in the Sheet\'s skin, at 1366 and 393'
if __name__ == '__main__':
    c = json.load(open(sys.argv[1])); out = sys.argv[2]; bw, bh = build(out)
    B = c['boards']; N = c['notes']; PAGE = ('page-23', 'Page notice shape')
    if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(0, {'id': PAGE[0], 'name': PAGE[1]})
    fn = 'Notice_Shape.dc.html'
    B[fn] = {**dict(x=0, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': bw, 'h': bh, 'title': TITLE + STAMP}
    if fn not in c['order']: c['order'].append(fn)
    N['notice-shape-title'] = dict(N.get('notice-shape-title', {}), x=0, y=-300, text='The page notice: B, the card from the bottom edge, in Page styling (decide-page-notice-shape, Mark 2026-10-24)', kind='title1', maxW=bw, page=PAGE[0])
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(bw, bh)
