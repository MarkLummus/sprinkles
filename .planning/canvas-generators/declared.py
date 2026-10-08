# Sid, 2026-10-07 (row draw-recipe-declared-notation; Mark's note on look-phase-4-screens-final; README D25): the notation boards for core items and recipe-declared items, on a canvas page of their own.
# Redrawn 2026-10-07 for row draw-declared-two-slots-each (Mark: "anticipate 2 of each"; README D26): a recipe declares up to two scales and up to two problems, each 0, 1 or 2.
#   python3 declared.py <out dir>      writes <out>/project/{DeclaredLogPagesNone,DeclaredLogPages,DeclaredLogPagesTwo,DeclaredPage2Variants,DeclaredPenReading}.dc.html and <out>/declared-probe.html (every app panel at its natural size, for declared-measure.mjs)
# Core = every recipe has the item. Declared = only a recipe whose version lists it: the scales in version.declaredAxes (Body, Oil for Olive Oil v1) and the problem in version.declaredFlaw (Bitter).
# The marks are DESIGN-TIME NOTATION and sit in a gutter outside the page or the panel: they do not print and are not in the app. They are on boards of their own so that BatchLogForm and TastingLogForm, which the snapshot
# of sketch 010 takes as served, stay exactly as Mark approved them (logforms.py's defaults still draw them byte for byte). The log pages are drawn twice from the same generator: Olive Oil v1 (declares Body, Oil, Bitter) and
# Mexican Chocolate v4 (app/src/data/mexican-chocolate.js: declaredAxes [] and declaredFlaw null on every version), so the variation and the fit show. The pen and the reading are the built app's own markup
# (declared-capture.mjs: WebKit, the dist of 2026-10-06): the pen for Olive Oil, the pen for Mexican Chocolate AS BUILT (it still draws an empty "This recipe only" cue and the Bitter chip: red marks) and the pen as the
# D25 rule draws it (the empty cue and the Bitter group left out). Bars and labels come from declared-measure.json (two passes, as markone.py does).
# Redrawn 2026-10-08 (Bishop's audit gap 4: the panels carried the pre-D6 pen and reading): every pen and reading panel is now put through markone.py's own moves (markone.pen, markone.reading: D11 to D14 order,
#   At draw and From freezer in the pen, the hand note before Melt test in the reading, 'Time to draw temp.' cut out of the markup, D17), on the same captures as before. What a reader sees does not change but the order of the
#   reading's hand note. These readings all store marks in the tasting group, so by D6a the reading carries no From freezer cell (the cell is for a group that holds a pick: pen-reading.html).
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, resolve_media, scope_css, unique_ids
import printstart, logforms, markone
import declared_variants as V

CAP = json.load(open(HERE + '/declared-capture.json'))
MEAS = json.load(open(HERE + '/declared-measure.json')) if os.path.exists(HERE + '/declared-measure.json') else {}
FIT = json.load(open(HERE + '/declared-fit.json')) if os.path.exists(HERE + '/declared-fit.json') else {}   # declared-fit.py: the page 2 fit of every variant, WebKit and Chromium
STAMP = ' (2026-10-07; awaiting Mark)'
MX_FOOT = 'Mexican Chocolate · Version 4 · v4 · [short code] · Side {n} of 2'   # the app's own version line for Mexican Chocolate v4 reads "Version 4 · v4" (the version's name is v4)
GREY, PURPLE = '#595959', '#7a2e8e'
COL = {'core': GREY, 'decl': PURPLE}   # D26: the red flag (the built pen drawing what the version does not declare) is gone: Mark decided the pen follows the rule, so the sketch draws the rule

LEG_CSS = '''
.dl-wrap{font-family:var(--face-grotesk);color:#141414}
.dl-title{font-size:20px;line-height:26px;font-weight:600;margin:0}
.dl-sub{font-size:15px;line-height:21px;color:#595959;margin:4px 0 0}
.dl-leg{display:flex;flex-direction:column;gap:10px;margin:14px 0 0}
.dl-leg p{display:flex;align-items:center;gap:12px;margin:0;font-size:15px;line-height:21px}
.dl-leg b{font-weight:600}
.dl-bar{flex:none;width:4px;height:22px}
.dl-box{flex:none;width:40px;height:22px;box-sizing:border-box;outline:1.5px dashed #7a2e8e;outline-offset:-2px}
.dl-cap{font-family:var(--face-grotesk);font-size:15px;line-height:21px;font-weight:600;margin:0 0 10px;color:#141414}
.dl-cap small{display:block;font-weight:400;font-size:13px;line-height:18px;color:#595959}
.dl-page{box-sizing:border-box;background:#ffffff;box-shadow:0 0 0 1px #c9c9c4}
.dl-lab{position:absolute;font-family:var(--face-grotesk);font-size:12px;line-height:1.2;font-weight:600;white-space:nowrap}
.dl-tick{position:absolute;width:4px}
.fp-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''

def legend():
    h = '<div class="dl-wrap"><p class="dl-title">Notation: core and declared</p><p class="dl-sub">Design-time marks in the gutter. They do not print and are not in the app.</p><div class="dl-leg">'
    h += '<p><span class="dl-bar" style="background:%s"></span><span><b>core</b>  Every recipe has it. A test checks it for every recipe.</span></p>' % GREY
    h += '<p><span class="dl-bar" style="background:%s"></span><span><b style="color:%s">declared</b>  Only a recipe whose version lists it has it: up to two scales and up to two problems, so 0, 1 or 2 of each. A test checks it against that recipe\'s own list. A recipe that lists none shows none.</span></p>' % (PURPLE, PURPLE)
    h += '<p><span class="dl-box"></span><span>A declared option that sits inside a shared row (a problem).</span></p>'
    return h + '</div></div>'

# ---- the log pages --------------------------------------------------------------------------------------------------------------------------------------------------------------
GUT = 300   # the gutter right of each page, for the labels
STAMP2 = ' (2026-10-07; awaiting Mark)'
LOG = {   # board key -> (scales, problems, title, caption 1, caption 2)
    'DeclaredLogPages': (2, 1, 'Core and declared · the log pages for two scales and one problem (Olive Oil v1)'),
    'DeclaredLogPagesNone': (0, 0, 'Core and declared · the log pages for a recipe that declares nothing (Mexican Chocolate v4)'),
    'DeclaredLogPagesTwo': (2, 2, 'Core and declared · the log pages for two scales and two problems (a drawn example)'),
}
def declares_line(ns, np_):
    nm = V.name(ns, np_)
    if (ns, np_) == (0, 0): return 'Declares nothing (declaredAxes [], declaredFlaw null): four core scales, four core problems, no Body, Oil or Bitter.'
    if nm == 'Olive Oil': return 'Declares Body and Oil (version.declaredAxes) and Bitter (version.declaredFlaw).'
    return 'A drawn example, not a seed recipe: declares %s. The second problem word is an example.' % V.declares(ns, np_)

def fit_line(ns, np_):
    f = FIT.get('%d,%d' % (ns, np_))
    if not f: return ''
    return 'Page 2 at Safari 630 x 900: %s px, %s spare. Chrome 672 x 960: %s spare.' % (f['safari_h'], f['safari_spare'], f['chrome_spare'])

def log_board(key):
    ns, np_, title = LOG[key]
    css = logforms.css() + logforms.GUIDE_CSS + LEG_CSS
    foot = V.foot(ns, np_); nm = V.name(ns, np_); vers = {'Mexican Chocolate': 'v4', 'Olive Oil': 'v1'}.get(nm, 'v1')
    gap = {'axes': 'declared: none (no Body, no Oil)', 'flaw': 'core ×4 · declared: none'}
    p1 = logforms.side1(*logforms.LINES['side1'], foot=foot, guide=True)
    p2 = logforms.side2(*logforms.LINES['side2'], axes_declared=V.scales(ns), flaw=V.problems(np_), foot=foot, guide=True, gap_notes=gap)
    cap1 = ('Page 1 · Batch log · %s %s' % (nm, vers), 'Every item here is core: this page has no declared slot, so it is the same page for every recipe but its foot.')
    cap2 = ('Page 2 · Tasting log · %s %s' % (nm, vers), declares_line(ns, np_) + ' ' + fit_line(ns, np_))
    PW = 816; X2 = PW + GUT + 40; W = X2 + PW + GUT; TOP = 190
    body = '<div style="position:absolute;left:0;top:0;width:1400px">%s</div>' % legend()
    for x, p, (c, s_) in ((0, p1, cap1), (X2, p2, cap2)):
        body += '<div style="position:absolute;left:%dpx;top:%dpx;width:%dpx"><p class="dl-cap">%s<small>%s</small></p></div>' % (x, TOP, PW + GUT, c, s_)
        body += '<div class="dl-page" style="position:absolute;left:%dpx;top:%dpx;width:%dpx;height:1056px">%s</div>' % (x, TOP + 60, PW, p)
    H = TOP + 60 + 1056 + 40
    main = '<div style="position:relative;width:%dpx;height:%dpx;background:#eceae4">%s</div>' % (W, H, body)
    return title + STAMP, printstart.board(title + STAMP, main, W, H, css + '[hidden]{display:none !important}'), W, H

def variants_board():
    """Page 2 of all nine recipes: 0, 1 or 2 declared scales (rows) by 0, 1 or 2 declared problems (columns). Page 1 is the same for all nine."""
    css = logforms.css() + logforms.GUIDE_CSS + LEG_CSS
    PW = 816; CW = PW + GUT; TOP = 230; CAPH = 96; RH = CAPH + 1056 + 90
    gap = {'axes': 'declared: none (no Body, no Oil)', 'flaw': 'core ×4 · declared: none'}
    body = '<div style="position:absolute;left:0;top:0;width:2400px">%s<p class="dl-sub" style="margin-top:12px">Page 2 for every combination. Rows: how many scales the recipe declares. Columns: how many problems. Page 1 has no declared slot and is the same for all nine.</p></div>' % legend()
    for r in range(3):
        for c in range(3):
            foot = V.foot(r, c); x = c * CW; y = TOP + r * RH
            p2 = logforms.side2(*logforms.LINES['side2'], axes_declared=V.scales(r), flaw=V.problems(c), foot=foot, guide=True, gap_notes=gap)
            cap = '%s scale%s · %s problem%s' % (r, '' if r == 1 else 's', c, '' if c == 1 else 's')
            sub = '%s. %s' % (V.name(r, c) + (' v4' if (r, c) == (0, 0) else ' v1' if (r, c) == (2, 1) else ''), fit_line(r, c))
            body += '<div style="position:absolute;left:%dpx;top:%dpx;width:%dpx"><p class="dl-cap">%s<small>%s</small></p></div>' % (x, y, CW - 40, cap, sub)
            body += '<div class="dl-page" style="position:absolute;left:%dpx;top:%dpx;width:%dpx;height:1056px">%s</div>' % (x, y + CAPH, PW, p2)
    W = 3 * CW; H = TOP + 3 * RH
    t = 'Core and declared · page 2 for 0, 1 and 2 declared scales and problems'
    main = '<div style="position:relative;width:%dpx;height:%dpx;background:#eceae4">%s</div>' % (W, H, body)
    return t + STAMP2, printstart.board(t + STAMP2, main, W, H, css + '[hidden]{display:none !important}'), W, H

# ---- the app panels -------------------------------------------------------------------------------------------------------------------------------------------------------------
def close_of(h, open_tag):
    a = h.index(open_tag); d = 0
    for m in re.finditer(r'<div\b|</div>', h[a:]):
        d += -1 if m.group(0) == '</div>' else 1
        if d == 0: return a + m.start() + len('</div>')

def tag(h, needle, val, once=True):
    """Add data-gd="kind|label" to the element whose opening tag starts with `needle` (the needle ends before its closing >, or at the class attribute's end)."""
    assert needle in h, needle
    i = h.index(needle) + len(needle)
    return h[:i] + ' data-gd="%s"' % val + h[i:]

def cut(h, open_tag):
    a = h.index(open_tag); b = close_of(h, open_tag); return h[:a] + h[b:]

OIL_CELL = '<div class="batch-row__cell"><span class="batch-row__cell-label">Oil</span>'
BODY_CELL = '<div class="batch-row__cell"><span class="batch-row__cell-label">Body</span><span class="batch-row__cell-value">heavy (4)</span></div>'   # readMarkWord: stop 4 reads the high anchor (axes.js)
CHIP = '<button type="button" class="chip-toggle" aria-pressed="false" tabindex="0">%s</button>'

def pen(W, ns, np_):
    """The built pen for a recipe that declares `ns` scales and `np_` problems. The markup is the built pen's own: Olive Oil v1's (Body, Oil, Bitter) with the declared scale or chip taken out or put in,
    or Mexican Chocolate's with both declared groups left out (D25: the empty cue and the Bitter group show only when the version declares them; Mark decided this 2026-10-07, row decide-pen-declared-for-none-recipe).
    The second problem chip is the same chip as Bitter with another word: the built pen draws one chip only, so the second is drawn, not captured."""
    h = markone.pen(W, 'blank', 'blank', base=markone._drop_temp(printstart.drop_hidden(CAP[('oo' if (ns or np_) else 'mx') + '_pen_%d' % W])))   # D6 to D14 and D17, as the pen-reading board draws the pen
    if ns == 0: h = cut(h, '<div class="axes-grid__group axes-grid__group--declared">')
    if ns == 1: h = cut(h, '<div class="axis-mark axis-mark--declared"><div class="axis-mark__head"><span id="axis-name-oil"')
    if np_ == 0: h = cut(h, '<div class="defect-group defect-group--declared"')
    if np_ == 2: h = h.replace('>Bitter</button>', '>Bitter</button>' + CHIP % 'Waxy', 1); assert 'Waxy' in h
    h = tag(h, '<div class="axes-grid__group"', 'core|core')
    if ns: h = tag(h, '<div class="axes-grid__group axes-grid__group--declared"', 'decl|declared: ' + ', '.join(a[0] for a in V.scales(ns)))
    h = tag(h, '<div class="defects-head"', 'core|core')
    h = tag(h, '<div class="defect-group defect-group--core"', 'core|core')
    if np_: h = tag(h, '<div class="defect-group defect-group--declared"', 'decl|declared: ' + ', '.join(V.problems(np_)))
    return h

def read(W, nm, nt):
    """The reading of a batch that stores `nm` declared marks and `nt` declared ticks (the reading shows only what is stored: an unmarked scale is dropped). 0,0 is Mexican Chocolate's seeded batch,
    1,1 Olive Oil's seeded batch (Oil marked, Bitter ticked); 2,2 is the same batch with Body marked and a second problem ticked (drawn)."""
    h = printstart.drop_hidden(CAP[('mx' if (nm, nt) == (0, 0) else 'oo') + '_read_%d' % W])
    if (nm, nt) == (2, 2):
        assert OIL_CELL in h and 'tasting-reading__problems">Bitter</span>' in h
        h = h.replace(OIL_CELL, BODY_CELL + OIL_CELL, 1).replace('tasting-reading__problems">Bitter</span>', 'tasting-reading__problems">Bitter · Waxy</span>', 1)
    h = markone.reading(W, None, None, None, base=markone._drop_temp(h))   # D12, D14 and D17: the pen's order, the hand note before Melt test, no draw-temp cell; a group that holds marks has no cell of its word (D6a)
    n = [0]
    def cond(m):   # the conditions row, or both rows when a hand note splits it (the note sits between them): the first carries the label
        n[0] += 1; return m.group(0) + ' data-gd="core|%s"' % ('core' if n[0] == 1 else '')
    h = re.sub(r'<div class="batch-row__cells tasting-reading__conditions"', cond, h); assert n[0] in (1, 2)
    def add(h, head_html, kind, lab):
        k = head_html
        if k not in h: return h
        j = h.index(k); i = h.rindex('<div class="', 0, j); e = h.index('>', i)
        return h[:e] + ' data-gd="%s|%s"' % (kind, lab) + h[e:]
    ax = 'declared: ' + ', '.join({1: ['Oil'], 2: ['Body', 'Oil']}[nm]) if nm else ''   # the stored marks: Olive Oil's seeded batch marks Oil only
    pr = 'declared: ' + ', '.join(V.problems(nt)) if nt else ''
    h = add(h, '<h4 class="batch-row__group-label batch-row__group-label--cue">Every recipe</h4>', 'core', 'core')
    h = add(h, '<h4 class="batch-row__group-label batch-row__group-label--cue">This recipe only</h4>', 'decl', ax)
    h = add(h, '<h5 class="batch-row__group-label batch-row__group-label--cue">Every recipe</h5>', 'core', 'core')
    h = add(h, '<h5 class="batch-row__group-label batch-row__group-label--cue">This recipe only</h5>', 'decl', pr)
    return h

def wrap(html): return '<div class="notebook" style="padding:0;max-width:none;display:block">' + html + '</div>'

PANELS = []
def panel(pid, W, html, cap, sub, crop):
    p = dict(pid=pid, W=W, html=wrap(html), cap=cap, sub=sub, crop=crop); PANELS.append(p); return p

def rows():
    out = []
    PEN = [(0, 0, 'Mexican Chocolate · none', 'Declares nothing: the pen has no This recipe only cue and no Bitter chip'),
           (1, 1, 'Example · one scale, one problem', 'Declares Body and Bitter: one scale and one chip under their cues'),
           (2, 1, 'Olive Oil v1 · two scales, one problem', 'Declares Body, Oil and Bitter, as the built pen draws it today'),
           (2, 2, 'Example · two scales, two problems', 'Declares Body, Oil, Bitter and Waxy: two chips side by side under one cue')]
    READ = [(0, 0, 'Mexican Chocolate · nothing stored', 'Only core groups show, and nothing says what is missing'),
            (1, 1, 'Olive Oil v1 · one mark, one tick', 'The seeded batch: Oil marked and Bitter ticked, Body left unmarked and so dropped'),
            (2, 2, 'Example · two marks, two ticks', 'Body and Oil marked, Bitter and Waxy ticked: two cells in one group, two words in the hand')]
    for W, ww in ((1366, 350), (393, 393)):
        out.append(('%d · the record pen, the scales and the problems' % ww, 'The built pen from Record another with Add tasting pressed, cropped to the scales and Any problems?. The pen keeps its own cues, Every recipe and This recipe only (Mark: the pen keeps them, the print drops them), and shows them for a recipe only when the recipe declares them. The second chip is drawn, not captured.', [
            panel('pen%d%d-%d' % (a, b, W), W, pen(W, a, b), cap, sub, 'axes-grid') for a, b, cap, sub in PEN], W))
        out.append(('%d · the reading, the Tasting fold' % ww, 'A batch as the app reads it. The reading draws a This recipe only group only when a declared mark or a declared tick is stored, and lists what is stored.', [
            panel('read%d%d-%d' % (a, b, W), W, read(W, a, b), cap, sub, 'tasting-reading') for a, b, cap, sub in READ], W))
    return out

def crop_for(pid):
    m = MEAS.get(pid)
    if not m: return (0, 1800, [])
    return (m['cropTop'], m['cropH'], m['tags'])

def build(out):
    os.makedirs(out + '/project', exist_ok=True)
    sizes = {}
    for key in LOG:
        t, html, W, H = log_board(key); open(out + '/project/%s.dc.html' % key, 'w').write(html); sizes[key] = (W, H, t)
    t, html, W, H = variants_board(); open(out + '/project/DeclaredPage2Variants.dc.html', 'w').write(html); sizes['DeclaredPage2Variants'] = (W, H, t)
    # the app panels: one scoped stylesheet per width (the tokens too, because 350 and 393 differ and one board holds both)
    GAP = 48; ROWH = 96; LABH = 96; LAB = 250; LEG_H = 250
    css = [printstart.FONT, resolve_media(TOK, 1366, True), LEG_CSS]
    for W in (1366, 393):
        pc = resolve_media(TOK, W, True) + resolve_media(APPC, W, True) + resolve_media(NBC, W, True); pc = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', pc)
        css.append(scope_css(pc + markone.DRAWN, '.fpw-%d' % W))
    body = '<div style="position:absolute;left:%dpx;top:%dpx;width:1500px">%s</div>' % (GAP, GAP, legend())
    y = GAP + LEG_H; bw = 0
    for rt, rd, panels, W in rows():
        body += '<div style="position:absolute;left:%dpx;top:%dpx;width:1700px"><p class="dl-cap" style="font-size:20px;line-height:26px;margin:0">%s<small style="font-size:15px;line-height:21px;max-width:1500px">%s</small></p></div>\n' % (GAP, y, rt, rd)
        y += ROWH; x = GAP; rowh = 0
        cells = []
        for p in panels:
            top, hh, tags = crop_for(p['pid']); cells.append((p, top, hh, tags)); rowh = max(rowh, hh)
        for p, top, hh, tags in cells:
            ww = 350 if p['W'] == 1366 else 393; vid = 'dp-' + p['pid']
            body += ('<div style="position:absolute;left:%dpx;top:%dpx;width:%dpx"><div style="height:%dpx"><p class="dl-cap" style="margin:0">%s<small>%s</small></p></div>'
                     '<div class="fp-win fpw-%d" style="width:%dpx;height:%dpx"><div style="width:%dpx;transform:translateY(-%dpx)">%s</div></div>' % (x, y, ww + LAB - 20, LABH, p['cap'], p['sub'], p['W'], ww, hh, ww, top, unique_ids(p['html'], vid)))
            for t in tags:   # the gutter beside the panel: a bar over the element's own height and its label
                c = COL[t['kind']]; ty = LABH + t['top'] - top
                body += '<div class="dl-tick" style="left:%dpx;top:%dpx;height:%dpx;background:%s"></div>' % (ww + 14, ty + 2, max(4, t['h'] - 4), c)
                if t['label']: body += '<div class="dl-lab" style="left:%dpx;top:%dpx;color:%s;transform:translateY(-50%%)">%s</div>' % (ww + 26, ty + t['h'] / 2, c, t['label'])
            body += '</div>\n'
            x += ww + LAB + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    bw = int(bw); y = int(y + 0.999)
    t = 'Core and declared · the pen and its reading for 0, 1 and 2 scales and problems' + STAMP
    main = '<div style="position:relative;width:%dpx;height:%dpx;background:#ffffff">%s</div>' % (bw, y, body)
    open(out + '/project/DeclaredPenReading.dc.html', 'w').write(printstart.board(t, main, bw, y, ''.join(css) + '[hidden]{display:none !important}'))
    sizes['DeclaredPenReading'] = (bw, y, t)
    # the probe: every panel at its natural size, one at a time
    pcss = [printstart.FONT, resolve_media(TOK, 1366, True)]
    for W in (1366, 393):
        pc = resolve_media(TOK, W, True) + resolve_media(APPC, W, True) + resolve_media(NBC, W, True); pc = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', pc)
        pcss.append(scope_css(pc + markone.DRAWN, '.fpw-%d' % W))
    pb = ''
    for p in PANELS:
        ww = 350 if p['W'] == 1366 else 393
        pb += '<div data-pid="%s" data-crop="%s" class="fp-win fpw-%d" style="display:none;position:absolute;left:0;top:0;width:%dpx"><div style="width:%dpx">%s</div></div>\n' % (p['pid'], p['crop'], p['W'], ww, ww, unique_ids(p['html'], 'dp-' + p['pid']))
    open(out + '/declared-probe.html', 'w').write('<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s%s[hidden]{display:none !important}</style></head><body>%s</body></html>' % (''.join(pcss), LEG_CSS, pb))
    return sizes

if __name__ == '__main__':
    print({k: v[:2] for k, v in build(sys.argv[1]).items()}, 'measured' if MEAS else 'not measured yet')
