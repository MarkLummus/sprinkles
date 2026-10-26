import json, re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, SHELLC, APP_ROOT, resolve_media, scope_css, unique_ids
import printstart
# Sid, 2026-10-26 (the ultra-wide survey; nothing approved yet). Mark, 2026-10-26: "we need to decide how each destination page deals with viewports that are REALLY wide. I'm looking at home on a
# ultra-wide monitor and it's unusable b/c it's so wide" and, on sketch 011 decision 16's cap: "The center from 1770 is also wrong. The left nav stays pinned left."
# Two boards on the page "Ultra-wide" (page-24), each the built app at 2560 with a fine pointer, as built and under each frame rule, 1000 px windows:
#   UW_Home     Home as built (the list fills 2240), A the block centred (the rail and the page travel together, capped at 1770), B the block left-anchored, A with the list capped at the Sheet's width
#   UW_Recipe   the recipe route as built (the content centred, the rail at the window's edge, 395 between), A, B
# Every panel is the built app's own shell (ultrawide-capture.json: WebKit, the scratch build of 2026-10-26, 2560, fine pointer) with the app's own tokens.css, app.css, home.css, notebook.css and shell.css,
# their @media resolved at 2560 and scoped to the panel. The new rules are in RULE_A / RULE_B / LIST_CAP below; every value reads an existing token or the one proposed token, --app-frame-max, derived from
# three existing ones (224 + 1482 + 2 x 32 = 1770). The survey's numbers are in .planning/notes/2026-10-26-ultra-wide-survey.md.
#   node ultrawide-capture.mjs ; python3 ultrawide.py <canvas.json read from the artifact root> <out dir> ; node ultrawide-measure.mjs <out dir>/project ; python3 ultrawide.py ... again (labels carry the measured numbers)
CAP = json.load(open(HERE + '/ultrawide-capture.json'))
MEAS = json.load(open(HERE + '/ultrawide-measure.json')) if os.path.exists(HERE + '/ultrawide-measure.json') else {}
HOMEC = open(os.path.join(APP_ROOT, 'home.css')).read() + '\n'
W, H = 2560, 1000
FIX = '.shell{min-height:0;position:relative}.shell__main{min-width:0}.shell__rail{position:static;height:%dpx}\n' % (H - 57)   # the panel is a 1000 px window: the rail runs to its foot as it does under the sticky bar (100vh is the canvas here, so the height is stated)
LABEL = '''.p4-lab{font-family:-apple-system,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}
.p4-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}
.p4-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''
# The proposed token: the frame's maximum, the rail and the main area together. 224 + 1482 + 2 x 32 = 1770, the window where sketch 011 decision 16's content cap first bites with the rail.
TOKEN = 'body{--app-frame-max:calc(var(--app-size-nav-w) + var(--app-notebook-content-max) + 2 * var(--app-notebook-gutter))}\n'
# A: the rail and the page are one block, capped at --app-frame-max and centred in the window; the header's wordmark and tools sit over the block's edges (its hairline and ground still span the window).
RULE_A = TOKEN + '''.shell__body{width:100%;max-width:var(--app-frame-max);margin-inline:auto}
.shell__head{padding-inline:max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page)))}
'''
# B: the same block, left-anchored: the rail stays at the window's left edge, the content caps against it, the leftover on the right; the tools sit over the block's right edge.
RULE_B = TOKEN + '''.shell__body{width:100%;max-width:var(--app-frame-max)}
.shell__head{padding-inline:var(--gap-page) max(var(--gap-page), calc(100% - var(--app-frame-max) + var(--gap-page)))}
'''
# Home's own question inside the frame: the list fills the frame (1450 at the cap), or stops at the Sheet's reading width (1482 - 32 - 350 = 1100, the two-column Sheet's maximum, decision 16).
LIST_CAP = '.list-page > .home{max-width:calc(var(--app-notebook-content-max) - var(--app-notebook-gutter) - var(--app-notebook-log-w))}\n'

CSS_BY_CLS = {}
def css_for(cls, extra=''):
    css = ''.join(resolve_media(c, W, False) for c in (TOK, APPC, HOMEC, SHELLC, NBC))
    css = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', css)
    return scope_css(css + FIX + extra, '.' + cls)
def clean(h): return printstart.drop_hidden(h).replace('<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>', '<p class="shell__brand">Sprinkles</p>', 1)
def panel(vid, html, x, y, cap, sub='', extra=''):
    cls = 'pc' + vid
    CSS_BY_CLS[cls] = css_for(cls, extra)
    lab = f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><p class="p4-lab">{cap}<small>{sub}</small></p></div>'
    win = f'<div class="p4-win {cls} {vid}" style="position:absolute;left:{x}px;top:{y + LABH}px;width:{W}px;height:{H}px;"><div style="width:{W}px;">{unique_ids(clean(html), vid)}</div></div>'
    return lab + win
def board(key, title, bh, parts, out):
    css = LABEL + ''.join(CSS_BY_CLS.values()); CSS_BY_CLS.clear()
    main = f'<div style="position:relative;width:{W}px;height:{bh}px;background:#ffffff;">{"".join(parts)}</div>'
    open(out + '/project/' + key + '.dc.html', 'w').write(printstart.board(title, main, W, bh, css, paper=True))
LABH = 78; GAP = 80; STAMP = ' (drawn 2026-10-26; for your choice: decide-ultrawide-frame)'
def m(key, vid, part, field):
    v = MEAS.get(key, {}).get(vid, {}).get(part); return '?' if not v else int(round(v[field]))

def build(canvas_in, out):
    os.makedirs(out + '/project', exist_ok=True); c = json.load(open(canvas_in)); B = c['boards']; N = c['notes']
    home, rec = CAP['home_2560'], CAP['recipe_2560']
    def g(key, vid, part, field): return m(key, vid, part, field)
    # ---- Home
    k = 'UW_Home'; y = 0; parts = []
    parts.append(panel('uh1', home, 0, y, 'Home at 2560 · as built', f"the rail at the window's edge (0 to 224); the list fills the main area: a row {g(k,'uh1','row','w')} px wide, the tally at {g(k,'uh1','tally','l')}, the lead block {g(k,'uh1','lead','w')} px")); y += LABH + H + GAP
    parts.append(panel('uh2', home, 0, y, 'A · one block, centred (recommended)', f"the rail and the page travel together, capped at 1770 (--app-frame-max = 224 + 1482 + 2 x 32) and centred: the rail {g(k,'uh2','rail','l')} to {g(k,'uh2','rail','r')}, the page to {g(k,'uh2','main','r')}, {g(k,'uh2','rail','l')} px of ground each side; the wordmark and the tools sit over the block's edges; the list is {g(k,'uh2','row','w')} px, as at a 1770 window", RULE_A)); y += LABH + H + GAP
    parts.append(panel('uh3', home, 0, y, 'B · one block, left-anchored', f"the same block against the window's left edge: the rail stays at 0, the page stops at {g(k,'uh3','main','r')}, the leftover ({W - 1770} px) on the right; the tools sit over the block's right edge", RULE_B)); y += LABH + H + GAP
    parts.append(panel('uh4', home, 0, y, "A, with the list at the Sheet's width", f"Home's own choice inside the frame (decide-ultrawide-lists): the lead block and the rows stop at 1100 (1482 - 32 - 350, the two-column Sheet's maximum), the tally at {g(k,'uh4','tally','l')}; the same rule would hold the Notebook and Ingredients lists", RULE_A + LIST_CAP)); y += LABH + H
    board(k, 'Ultra-wide · Home at 2560 · as built, then the frame rule A (one block, centred), B (one block, left-anchored), and A with the list at the Sheet\'s width' + STAMP, y, parts, out)
    sizes = {k: (W, y)}
    # ---- the recipe route
    k = 'UW_Recipe'; y = 0; parts = []
    parts.append(panel('ur1', rec, 0, y, 'The recipe route at 2560 · as built', f"decision 16's cap: the content stops at 1482 and centres in the main area ({g(k,'ur1','first','l')} to {g(k,'ur1','first','r')}), while the rail stays at the window's edge (0 to 224): {g(k,'ur1','first','l') - 224 if isinstance(g(k,'ur1','first','l'), int) else '?'} px between the rail's hairline and the band")); y += LABH + H + GAP
    parts.append(panel('ur2', rec, 0, y, 'A · one block, centred (recommended)', f"the rail {g(k,'ur2','rail','l')} to {g(k,'ur2','rail','r')}, the band {g(k,'ur2','first','l')} to {g(k,'ur2','first','r')}, the Sheet {g(k,'ur2','sheet','w')} and the log {g(k,'ur2','log','w')} as at 1770; 32 from the rail's hairline to the band, as at every rail window; {g(k,'ur2','rail','l')} px of ground each side", RULE_A)); y += LABH + H + GAP
    parts.append(panel('ur3', rec, 0, y, 'B · one block, left-anchored', f"the rail at 0, the band {g(k,'ur3','first','l')} to {g(k,'ur3','first','r')}, the leftover ({W - 1770} px) on the right", RULE_B)); y += LABH + H
    board(k, 'Ultra-wide · the recipe route at 2560 · as built (the content centred, the rail pinned), then A (one block, centred) and B (one block, left-anchored)' + STAMP, y, parts, out)
    sizes[k] = (W, y)
    # ---- the canvas: a new page, first in the list; boards keep the x and y they have
    PAGE = ('page-24', 'Ultra-wide')
    if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(0, {'id': PAGE[0], 'name': PAGE[1]})
    x = 0
    for key in ['UW_Home', 'UW_Recipe']:
        w, h = sizes[key]; fn = key + '.dc.html'
        B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h}; x = B[fn]['x'] + w + 240
        if fn not in c['order']: c['order'].append(fn)
        B[fn]['title'] = re.search(r'<title>(.*?)</title>', open(out + '/project/' + fn).read(), re.S).group(1)[:120]
    N['uw-title'] = dict(N.get('uw-title', {}), x=0, y=-300, text='Ultra-wide: what the frame does past 1770', kind='title1', maxW=x, page=PAGE[0])
    hb, rb = B['UW_Home.dc.html'], B['UW_Recipe.dc.html']
    N['uw-note'] = {**N.get('uw-note', {}), 'x': hb['x'], 'y': hb['y'] + hb['h'] + 80, 'w': 620, 'maxH': 1500, 'fill': 'gray', 'page': PAGE[0], 'text': (
        "Drawn 2026-10-26 from the ultra-wide survey (WebKit and Chrome, identical: 1366, 1770, 1920, 2560, 3440). Nothing is approved; the choice is decide-ultrawide-frame on your list. "
        "As built, the rail is pinned at the window's left edge from 1590 and the list pages have no cap: at 2560 a Home row is 2240 px wide and at 3440 it is 3120, the tally 2650 px from the name. The recipe route, the batch route, the creation editor and the print route stop at 1482 and centre in the main area (decision 16), so at 2560 there are 395 px of ground between the rail's hairline and the band, 835 at 3440. "
        "A (recommended): one block, the rail and the page together, capped at 1770 (a token derived from three existing ones: 224 + 1482 + 2 x 32) and centred in the window; the header's wordmark and tools sit over the block's edges while its hairline spans the window. Every page then looks as it does at a 1770 window; the rail and the content never part. B: the same block against the left edge, the leftover on the right. "
        "Home's own question (decide-ultrawide-lists): inside the frame the list fills 1450, as at a 1770 window today, or stops at the Sheet's width, 1100 (the last panel).")}
    return c

if __name__ == '__main__':
    c = build(sys.argv[1], sys.argv[2])
    json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
    print({k: (v['w'], v['h'], v['x'], v['y']) for k, v in c['boards'].items() if k.startswith('UW_')})
