import json, re, os, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import places as PL, printstart
from cssscope import unique_ids
# Sid, 2026-10-23 (bug-save-notice-covers-title-393; Mark's note: "a different kind/shape of notification toast? push up from bottom? always the same way? a larger card?"):
# the page notice right after Save batch, as built beside three shapes, at 1366 and 393. Every window is the built app's own shell (noticeshape-capture.json: WebKit, coarse,
# Olive Oil v1, Record a batch, churn date, Save batch at the pen foot) shown at the scroll position the save left, with the app's own stylesheets resolved at the width.
# The notice in each window is drawn at the box WebKit gave it in the real app with the option's rules injected (noticeshape-measure.mjs, noticeshape-options.json), so the
# intervals are measured, not reasoned. The 393 window has no viewport on the canvas: the tab row is placed by hand at the window's foot where the build fixes it.
#   node noticeshape-capture.mjs <dist> ; node noticeshape-measure.mjs <dist> ; python3 noticeshape.py <canvas.json read from the artifact root> <out dir>
CAP = json.load(open(HERE + '/noticeshape-capture.json'))
MEAS = json.load(open(HERE + '/noticeshape-measure.json'))
OPTS = json.load(open(HERE + '/noticeshape-options.json'))
esc = lambda s: _html.escape(str(s), quote=True)
STAMP = ' (drawn 2026-10-23, options for decide-page-notice-shape; nothing approved)'
LABH = 78; GAP = 80; VIEW = {1366: 1024, 393: 852}
FOCUS = 'outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)'

NS_CSS = '''
.ns-notice{position:absolute;z-index:3;box-sizing:border-box;margin:0;border:var(--rule-baseline) solid var(--sheet-ink);background:var(--sheet-ground);color:var(--sheet-ink);font-family:var(--face-grotesk);white-space:nowrap;overflow:hidden}
.ns-A{padding:var(--gap-xs) var(--gap-s);font-size:var(--sheet-type-control)}
.ns-B,.ns-D{padding:var(--gap-s) var(--gap-m);font-size:var(--sheet-type-note);line-height:var(--sheet-leading-note)}
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
def box_label(n, label):
    return f'<div class="ns-lab" style="left:{n["x"]}px;top:{n["y"] + n["h"] + 4}px">{esc(label)}</div>'

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
    if opt != 'B':
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
    if opt != 'B' and m.get('tabs'): d.append(vdim(W - 60, n['y'] + n['h'], m['tabs']['y'], f'{m["tabs"]["y"] - n["y"] - n["h"]:g}px to the tab row', side='left'))
    d.append(box_label(n, f'{n["w"]:g} × {n["h"]:g}, {m["font"]} text'))
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
    ('A', 'As built', 'the one-line 13px pill under the bar at the end edge (quick 261021-07s, sketch 013 decision 23); below 724 the bar scrolls away and the notice sticks to the window\'s top'),
    ('B', 'A card rising from the bottom edge', 'centred at the bottom of the window, 16px text, above the tab row where there is one; one place at every width and for every trigger'),
    ('C', 'A band dropping from under the bar', 'the width of the window under the bar (at 393, at the window\'s top), 16px text'),
    ('D', 'A larger card where it is now', 'the as-built place with the note size and more padding: the size question on its own'),
]
def build(out):
    parts = []; y = 0
    for opt, name, what in ROWS:
        x = 0
        for W in (1366, 393):
            m = MEAS[f'{opt}_{W}']; n = m['notice']; sub = f'{what}. Here it covers {covers_text(m)}'
            if W == 393 and m['atTop']['name']['ov']: sub += f'; scrolled to the top it covers the recipe name ({m["atTop"]["name"]["ov"]["w"]:g} × {m["atTop"]["name"]["ov"]["h"]:g})'
            sub += f'. {n["w"]:g} × {n["h"]:g} at {m["font"]}; {m["toFocus"]:g}px from the focused Batch heading'
            if m.get('tabs'): sub += f'; {m["toTabs"]:g}px from the tab row'
            parts.append(label(x, y, W, f'{opt} · {name} · {W} · after Save batch', sub))
            parts.append(window(opt, W, x, y + LABH, f'w{opt}{W}'))
            x += W + GAP
        y += LABH + max(VIEW.values()) + GAP
    bw = 1366 + GAP + 393; bh = y - GAP
    css = PL.LABEL + ''.join(CSS_BY_CLS.values())
    body = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{"".join(parts)}</div>'
    os.makedirs(out + '/project', exist_ok=True)
    open(out + '/project/Notice_Shape.dc.html', 'w').write(printstart.board('Page notice after Save batch · as built beside three shapes, at 1366 and 393' + STAMP, body, bw, bh, css, paper=True))
    return bw, bh

TITLE = 'Page notice after Save batch · as built beside three shapes, at 1366 and 393'
if __name__ == '__main__':
    c = json.load(open(sys.argv[1])); out = sys.argv[2]; bw, bh = build(out)
    B = c['boards']; N = c['notes']; PAGE = ('page-23', 'Page notice shape')
    if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(0, {'id': PAGE[0], 'name': PAGE[1]})
    fn = 'Notice_Shape.dc.html'
    B[fn] = {**dict(x=0, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': bw, 'h': bh, 'title': TITLE + STAMP}
    if fn not in c['order']: c['order'].append(fn)
    N['notice-shape-title'] = dict(N.get('notice-shape-title', {}), x=0, y=-300, text='The page notice: where it should appear after a save, and how big (bug-save-notice-covers-title-393)', kind='title1', maxW=bw, page=PAGE[0])
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(bw, bh)
