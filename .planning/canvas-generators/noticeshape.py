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
# Sid, 2026-10-25 (check-notice-card-devices failed; Mark: "the toast appears, but it's background color is still too similar to the sheet. is that supposed to be white? we might
# want Sid to define some contrasting color palette options so that it stands out"; bug-notice-card-ground-too-close-to-sheet): the build now carries BS (quick 261025-elq), so
# A, nothing injected, is BS as built, and the rows beside it are the card's ground drawn from the App context's own palette, no new hue: BI the ink card (--app-text ground,
# --app-background text), BB the filled action's blue (--app-blue-text, white text), BG the secondary text grey as a ground (--app-text-secondary, white text), and BW white with
# a 2px ink border (--rule-hover solid --app-text), drawn although the gate rules it out. BT, a light tint of the Notebook colour with ink text, is measured and off the board
# (its ground is 1.15:1 against the Sheet; no tint in the palette clears 3:1). Gate: the card's ground 3:1 or better against the Sheet, its text 4.5:1 or better on the card.
# Every row keeps --app-shadow-notice (what floats casts). The old B, BP and Sheet-skin rows are retired.
#   node noticeshape-capture.mjs <dist> ; node noticeshape-measure.mjs <dist> ; python3 noticeshape.py <canvas.json read from the artifact root> <out dir>
CAP = json.load(open(HERE + '/noticeshape-capture.json'))
MEAS = json.load(open(HERE + '/noticeshape-measure.json'))
OPTS = json.load(open(HERE + '/noticeshape-options.json'))
esc = lambda s: _html.escape(str(s), quote=True)
STAMP = ' (drawn 2026-10-23; redrawn 2026-10-24 with B in Page styling; redrawn 2026-10-25 with the card\'s ground from the App palette after check-notice-card-devices failed; decide-notice-card-palette)'
LABH = 78; GAP = 80; VIEW = {1366: 1024, 393: 852}
FOCUS = 'outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)'

NS_CSS = '''
.ns-notice{position:absolute;z-index:3;box-sizing:border-box;margin:0;border:var(--rule-baseline) solid var(--sheet-ink);background:var(--sheet-ground);color:var(--sheet-ink);font-family:var(--face-grotesk);white-space:nowrap;overflow:hidden}
.ns-A,.ns-BI,.ns-BB,.ns-BG,.ns-BW{padding:var(--gap-s) var(--gap-m);font-size:var(--sheet-type-note);line-height:var(--sheet-leading-note);background:var(--app-background);color:var(--app-text);border:var(--app-rule-row) solid var(--app-divider);border-radius:var(--app-radius-control);box-shadow:var(--app-shadow-notice)}
.ns-BI{background:var(--app-text);color:var(--app-background);border-color:var(--app-text)}
.ns-BB{background:var(--app-blue-text);color:var(--app-background);border-color:var(--app-blue-text)}
.ns-BG{background:var(--app-text-secondary);color:var(--app-background);border-color:var(--app-text-secondary)}
.ns-BW{border:var(--rule-hover) solid var(--app-text)}
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
    if False:
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
    if False and m.get('tabs'): d.append(vdim(W - 60, n['y'] + n['h'], m['tabs']['y'], f'{m["tabs"]["y"] - n["y"] - n["h"]:g}px to the tab row', side='left'))
    d.append(box_label(n, f'{n["w"]:g} × {n["h"]:g}, {m["font"]} text', above=True))
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
    ('A', 'BS as built (quick 261025-elq): white ground, the hairline and the shadow', 'the approved card in the App\'s ground (--app-background, white) with the row hairline in --app-divider, the 10px radius and --app-shadow-notice; on the iPad Mark reads its ground as the paper\'s: only the hairline and the shadow lift it'),
    ('BI', 'Ink card (proposed): --app-text ground, white text', 'the same card with the App\'s ink as its ground and --app-background as its text; no hairline (the border takes the ground\'s colour); the shadow stays. The inverse card: the App\'s own ink, already the scrim\'s and the focus ring\'s colour, carries no verdict and is nobody\'s destination'),
    ('BB', 'Blue card: --app-blue-text ground, white text', 'the filled action\'s own pairing (the blue companion under a white label, 4.55:1) as a card; no hairline; the shadow stays. The cost: it reads as the App\'s action, a button that is not one'),
    ('BG', 'Grey card: --app-text-secondary ground, white text', 'the secondary text colour as a ground under white text; no hairline; the shadow stays. Quieter than the ink; a text token used as a fill for the first time'),
    ('BW', 'White with a 2px ink border (ruled out: the ground is still 1.07:1 against the Sheet)', 'the as-built card with --rule-hover (2px) solid --app-text in place of the hairline; drawn for the comparison. Its edge lifts, its ground does not, which is what Mark called lost at 1.5px in the Sheet-skin card'),
]
def _lum(c):
    nums = [float(v) for v in re.findall(r'\d*\.?\d+', c.split('(', 1)[1])[:3]]
    r, g, b = [v * 255 if c.startswith('color(') else v for v in nums]
    f = lambda v: (v / 255) / 12.92 if v / 255 <= 0.03928 else ((v / 255 + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def contrast(a, b):
    la, lb = _lum(a), _lum(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
def c_text(opt, shadow=True):
    """The card's contrast figures from the colours WebKit gave it in the real app: ground against the Sheet and the App ground, border against both, text on the card. (The border's width is not quoted: WebKit paints the Sheet skin's 1.5px as 1px at 1x.)"""
    c = MEAS[f'{opt}_1366']['colours']; bcol = c['border'].split(' ', 1)[1]
    same = bcol == c['background']
    return (f'card ground {contrast(c["background"], c["sheet"]):.2f}:1 against the Sheet and {contrast(c["background"], c["app"]):.2f}:1 against the App ground; '
            + ('no border of its own; ' if same else f'its {c["border"].split(" ")[0]} border {contrast(bcol, c["sheet"]):.2f}:1 against the Sheet and {contrast(bcol, c["app"]):.2f}:1 against the App ground; ')
            + f'text {contrast(c["color"], c["background"]):.1f}:1 on the card'
            + (('; shadow ' + c['shadow'] if c['shadow'] != 'none' else '; no shadow') if shadow else ''))
KEY = ('<b>What Mark found (2026-10-25, check-notice-card-devices, on the web and at iPad width):</b> "the toast appears, but it\'s background color is still too similar to the sheet. is that supposed to be white? we might want Sid to define some contrasting color palette options so that it stands out" (bug-notice-card-ground-too-close-to-sheet). '
       'Yes, it is white: the App\'s ground, 1.07:1 against the Sheet\'s paper, so only the hairline and the shadow lifted the card, and on the device they do not. '
       '<b>Rows:</b> BS as built, then the card\'s ground drawn from the App context\'s own palette (no new hue): the ink card, the filled action\'s blue, the secondary text grey, and white with a 2px ink border. Every window is the built app after Save batch (Olive Oil v1, WebKit, coarse) at the scroll the save left; the card is drawn at the box WebKit gave it with the option\'s rules injected; at 1366 it sits over the Sheet\'s last Balance row, at 393 over the log on the App ground. '
       '<b>Gate:</b> the card\'s ground 3:1 or better against the Sheet, its text 4.5:1 or better on the card. <b>Contrast, measured in the real app (WCAG, from the computed colours):</b> as built {cA}. Ink {cBI}. Blue {cBB}. Grey {cBG}. White with 2px ink {cBW}. '
       'Ruled out: the 2px border (ground 1.07:1; the edge lifts, the ground does not) and a light Notebook tint with ink text, measured and not drawn (an 18% tint of --app-notebook on white is 1.15:1 against the Sheet; the accent itself would be 2.9:1, and a red card on "recorded" is a verdict the No-Verdict Rule forbids). '
       '<b>Reading:</b> the ink card is the one row that stands off both grounds at the same strength as the Sheet\'s own ink (17:1, 18:1), in a colour the App already uses for what sits over the page (the scrim is this ink at 28%, the focus ring is this ink), and that belongs to no destination and no action. The blue card passes the gate by a hair (4.24:1, text 4.55:1) and reads as the filled action, a button that does nothing. The grey card passes (6.5:1, 7.0:1) and is quieter, at the cost of a text token becoming a fill. Each is tokens only; none needs a new token, and none touches the card\'s box, place or type. '
       'Device-unverified: WebKit on the Mac; the iPad is Mark\'s.')
KEY_CSS = '.ns-key{position:absolute;left:0;top:0;font-family:-apple-system,Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#141414;margin:0}.ns-key b{font-weight:600}'
KEYH = 300
def build(out):
    bw = 1366 + GAP + 393
    parts = [f'<p class="ns-key" style="width:{bw}px">{KEY.format(**{"c" + o: c_text(o, shadow=False) for o in ("A", "BI", "BB", "BG", "BW")})}</p>']; y = KEYH
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

TITLE = 'Page notice after Save batch · BS as built beside the card\'s ground from the App palette (ink, blue, grey, white with 2px ink), at 1366 and 393'
if __name__ == '__main__':
    c = json.load(open(sys.argv[1])); out = sys.argv[2]; bw, bh = build(out)
    B = c['boards']; N = c['notes']; PAGE = ('page-23', 'Page notice shape')
    if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(0, {'id': PAGE[0], 'name': PAGE[1]})
    fn = 'Notice_Shape.dc.html'
    B[fn] = {**dict(x=0, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': bw, 'h': bh, 'title': TITLE + STAMP}
    if fn not in c['order']: c['order'].append(fn)
    N['notice-shape-title'] = dict(N.get('notice-shape-title', {}), x=0, y=-300, text='The page notice: the card\'s ground, after the device check failed (decide-notice-card-palette, 2026-10-25)', kind='title1', maxW=bw, page=PAGE[0])
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(bw, bh)
