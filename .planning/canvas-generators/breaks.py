import sys
sys.argv = ['x']
from bys import *   # runs gen.py, final.py and bys.py first (their boards land in OUT as before); this file adds decision 45's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 45): the print page break for the ingredients table, by steps. Mark, 2026-10-04 (answer to decision 36's print question): "Always PC; if the ingredients table doesn't fit on one page,
# then break the table by Steps, so that when the ingredients are grouped into steps, all of the ingredients print on the same page. Also, the Ingredients table header should repeat on the next page."
# PC = Before you start opens the formula page above the table. Every page is the built app's own markup (breaks-capture.json: WebKit, 816 wide, the dist of 2026-10-04 after quick 261004-ly8) with the app's own
# stylesheets resolved at 816 and the print block, laid on a letter page (816 x 1056, 48 / 56 / 40 margins) exactly as decision 36's print board did; no Phase 4 geometry (no footer, no tick boxes, no ruled As made
# column). The break is computed from the measured row boxes (breaks-measure.mjs, breaks-measure.json): whole step groups, the Total row with the last group. Nothing here edits app/.
# Three runs (the layout is measured, then the marks and the numbers are laid on it):
#   python3 breaks.py                      -> writes R35C_BreakProbe (the unbroken pages)           node breaks-measure.mjs probe <probe file>
#   python3 breaks.py                      -> writes R35C_BysBreak (the pages, from the probe)       node breaks-measure.mjs board <board file>
#   python3 breaks.py                      -> the same board with the marks, the numbers and the clipped steps
BK = json.load(open(HERE + '/breaks-capture.json'))
BKM = json.load(open(HERE + '/breaks-measure.json')) if os.path.exists(HERE + '/breaks-measure.json') else {}
STAMP_K = " (decision 45, drawn 2026-10-04, awaiting Mark's look; nothing approved)"
TOPPAD, BOTPAD, PAGEH = 48, 40, 1056
LIMIT = PAGEH - BOTPAD       # the bottom margin line: content must end at or above it
USABLE = PAGEH - TOPPAD - BOTPAD

# ---- the built page's parts ---------------------------------------------------------------------------------------------------------------------------------------------
def parts(key):
    h = BK[key]
    head = re.search(r'<header class="headnote">.*?</header>', h, re.S).group(0)
    ingr = re.search(r'<section class="ingredient-table-region".*?</section>', h, re.S).group(0)
    ingr = re.sub(r'<th[^>]*>As made</th>', '', ingr)          # a blank sheet carries no batch (decision 36's print boards did the same)
    def drop_third(m):
        tds = re.findall(r'<td[^>]*>.*?</td>', m.group(0), re.S)
        return m.group(0).replace(tds[2], '', 1) if len(tds) == 4 else m.group(0)
    ingr = re.sub(r'<tr[^>]*aria-label[^>]*>.*?</tr>', drop_third, ingr, flags=re.S)
    ingr = ingr.replace('<td colspan="4">', '<td colspan="3">')
    ingr = re.sub(r'<span class="sheet-hand">[^<]*</span>', '', ingr)
    m = MR.search(h); meth = before = ''
    if m:
        meth = m.group(0)
        meth = re.sub(r'<span class="method-step__skipped-label">[^<]*</span>', '', meth)
        meth = meth.replace('method-step__prose--struck', 'method-step__prose')
        b = BF.search(meth); ul = b.group(1)
        meth = meth.replace(b.group(0), '', 1)
        if '<li' in ul: before = '<section class="before-region" aria-label="Before you start"><h2 class="region-name">Before you start</h2>%s</section>' % ul
        if '<li id="method-step-' not in meth: meth = ''
        meth = re.sub(r'<li id="method-step-(\d+)"', r'<li data-s="\1" id="method-step-\1"', meth)
    return dict(head=head, ingr=ingr, meth=meth, before=before)
OL, MX = parts('olive1v_816'), parts('mex3_816')
NOTES = OL['before']                                        # the two seeded notes (Olive Oil v1): the only notes the app holds
def more_notes(before, times):
    ul = re.search(r'<ul class="authored__notes">(.*?)</ul>', before, re.S).group(1)
    return before.replace(ul, ul * times, 1)

# ---- the table, as units ---------------------------------------------------------------------------------------------------------------------------------------------------
def table_units(ingr):
    """The table's pieces: thead, the units the break may fall between, tfoot. A unit is a step head with its rows; rows with no step head are units of one row each."""
    thead = re.search(r'<thead>.*?</thead>', ingr, re.S).group(0)
    tbody = re.search(r'<tbody>(.*?)</tbody>', ingr, re.S).group(1)
    tfoot = re.search(r'<tfoot>.*?</tfoot>', ingr, re.S).group(0)
    rows = re.findall(r'<tr[^>]*>.*?</tr>', tbody, re.S)
    units = []; grouped = False
    for r in rows:
        if 'ingredient-table__step-head' in r:
            units.append({'rows': [r], 'name': re.search(r'(Step \d+)', r).group(1)}); grouped = True
        elif grouped: units[-1]['rows'].append(r)
        else: units.append({'rows': [r], 'name': None})
    return thead, units, tfoot
def ingr_html(ingr, frm=0, upto=None, total=True, h2='Ingredients', widths=None, rowcut=None):
    """The ingredients region of one page: units [frm, upto), the Total row if total, the region heading (None leaves it out), and the whole table's column widths so this page's columns line up with the next one's.
    rowcut = (a, b) takes rows [a, b) instead of whole units (the browser's own default, which breaks between rows)."""
    thead, units, tfoot = table_units(ingr)
    if rowcut is not None:
        allrows = [r for u in units for r in u['rows']]; body = ''.join(allrows[rowcut[0]:rowcut[1]])
    else: body = ''.join(''.join(u['rows']) for u in units[frm:upto])
    n = [0]
    def tag(m): n[0] += 1; return '<tr data-r="%d"' % (n[0] - 1)
    body = re.sub(r'<tr', tag, body)
    cg = '<colgroup>' + ''.join('<col style="width:%spx">' % w for w in widths) + '</colgroup>' if widths else ''
    tstyle = ' style="table-layout:fixed;width:%spx"' % round(sum(widths), 2) if widths else ''
    foot = tfoot.replace('<tr', '<tr data-r="total"', 1) if total else ''
    return ('<section class="ingredient-table-region" aria-label="Ingredients">' + ('<h2 class="region-name" data-m="h2">%s</h2>' % h2 if h2 else '') +
            '<table class="ingredient-table"%s>%s%s<tbody>%s</tbody>%s</table></section>' % (tstyle, cg, thead.replace('<thead>', '<thead data-m="thead">', 1), body, foot))

# ---- measures (run 2 and 3) ----------------------------------------------------------------------------------------------------------------------------------------------
def Mp(pid): return BKM.get('probe', {}).get(pid)
def Mb(pid): return BKM.get('board', {}).get(pid)
def n0(v): return f'{round(v):,}'
def decide_break(ingr, pid):
    """Whole step groups on page 1 as long as each group's bottom is at or above the margin line; the Total row goes with the last group (never alone under a repeated header); no group fits -> the table moves whole."""
    m = Mp(pid); thead, units, tfoot = table_units(ingr); rows = {r['r']: r for r in m['rows']}; i = 0; boxes = []
    for u in units: boxes.append((rows[str(i)]['y'], rows[str(i + len(u['rows']) - 1)]['y'] + rows[str(i + len(u['rows']) - 1)]['h'])); i += len(u['rows'])
    k = 0
    for j, (t, b) in enumerate(boxes):
        if b <= LIMIT: k = j + 1
        else: break
    tot = rows['total']
    if k == len(units) and tot['y'] + tot['h'] > LIMIT: k -= 1
    return k, units, boxes, tot
def decide_rowbreak(pid):
    """The browser's own default: between rows, wherever the foot falls; a row that crosses the foot goes whole to the next page; a step head gets no keep-with-next."""
    m = Mp(pid); rows = [r for r in m['rows'] if r['r'] != 'total']; k = 0
    for i, r in enumerate(rows):
        if r['y'] + r['h'] <= LIMIT: k = i + 1
        else: break
    return k

# ---- pages ----------------------------------------------------------------------------------------------------------------------------------------------------------------
class Pg:
    def __init__(self, pid, cap, blocks, cut=None, units=None, tag=None, clip_steps=False):
        self.pid, self.cap, self.blocks, self.cut, self.units, self.tag, self.clip_steps = pid, cap, blocks, cut, units, tag, clip_steps
def probe_pages():
    """Run 1: the unbroken pages, to measure every row. Olive Oil v1 under PC; Mexican Chocolate v3 with the seeded notes (fits); Mexican Chocolate v3 with the notes three times over (constructed)."""
    return [Pg('olive-full', '', [OL['head'], OL['before'], ingr_html(OL['ingr'])]), Pg('olive-method', '', [OL['head'], OL['before'], ingr_html(OL['ingr']), OL['meth']]),
            Pg('mex-full', '', [MX['head'], NOTES, ingr_html(MX['ingr'])]), Pg('mex3x-full', '', [MX['head'], more_notes(NOTES, 3), ingr_html(MX['ingr'])])]

KCSS = PRINT_CSS + '''
.pp-bar{position:absolute;left:30px;width:5px;background:var(--app-blue-text);opacity:.5;border-radius:1px}
.pp-bar--total{opacity:.2}
.pp-tag{position:absolute;left:56px;right:56px;font-family:var(--face-grotesk);font-size:12px;line-height:16px;color:var(--app-blue-text);font-weight:600}
.pp--clip{overflow:hidden}
'''
def css_k(vid): return scope_css(resolve_media(APPC, 816, False, screen=False) + resolve_media(NBC, 816, False, screen=False) + PRINT_APP + KCSS, '.' + vid)
def page_html(p):
    return '<article class="recipe-page" data-m="article">' + ''.join(p.blocks) + '</article>'
def marks(p):
    """The blue marks laid over a page (the drawing's, not the page's), from the page's own measure on the board (run 3): a bar in the left margin for each step group and a lighter one for the Total, and a tag in the bottom margin."""
    m = Mb(p.pid); out = ''
    if m and p.units is not None:
        rows = {r['r']: r for r in m['rows']}; i = 0
        for u in p.units:
            a = rows[str(i)]; z = rows[str(i + len(u['rows']) - 1)]; i += len(u['rows'])
            out += '<div class="pp-bar" style="top:%.1fpx;height:%.1fpx"></div>' % (a['y'] + 2, z['y'] + z['h'] - a['y'] - 4)
        if 'total' in rows: out += '<div class="pp-bar pp-bar--total" style="top:%.1fpx;height:%.1fpx"></div>' % (rows['total']['y'] + 2, rows['total']['h'] - 4)
    if p.tag: out += '<div class="pp-tag" style="top:%dpx">%s</div>' % (LIMIT + 7, p.tag)
    return out
def clip_method(p):
    """K1: the Instructions run on from the table's tail and stop at the margin: steps are shown whole, the ones that would cross the foot are left for the next page (the Instructions' own break rule is Phase 4's, not drawn)."""
    m = Mb(p.pid); html = p.blocks[-1]
    if not m: return html
    for s in m['steps']:
        if s['y'] + s['h'] > LIMIT: html = re.sub(r'<li data-s="%s" id="method-step-%s".*?</li>' % (s['n'], s['n']), '', html, count=1, flags=re.S)
    return html

def kboard(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n', resolve_media(TOK, 816, False)]
    seen = set(); body = ''; y = GAP; bw = 0; LH = 112; ROW_H = 96
    for rtitle, rdesc, pages in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:3600px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:2500px">{rdesc}</p></div>\n'
        y += ROW_H; x = GAP; rowh = 0
        for p in pages:
            vid = 'fp-' + p.pid.replace('_', '-'); css_parts.append(css_k(vid))
            h = p.cut or PAGEH; rowh = max(rowh, h + (100 if p.pid == 'o-pc' else 0))
            cls = 'pp' + (' pp--cut' if p.cut else '')
            style = f'height:{h}px;' if p.cut else ''
            edge = '<div class="pp-edge"></div>' if p.cut else '<div class="pp-limit"></div><div class="pp-edge"></div>'
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:816px;"><div style="height:{LH}px;"><p class="fp-lab">{p.cap}</p></div>'
                     f'<div class="fp-win {vid}" data-pid="{p.pid}" style="width:816px;height:{h}px;background:#ffffff;overflow:visible;"><div class="{cls}" style="{style}">{unique_ids(page_html(p), vid)}{marks(p)}{edge}</div></div></div>\n')
            x += 816 + GAP
        bw = max(bw, x); y += LH + 8 + rowh + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_K, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return fn, bw, y

def write_probe_k():
    css_parts = [resolve_media(TOK, 816, False)]; body = ''; y = 0
    for p in probe_pages():
        vid = 'fp-' + p.pid.replace('_', '-'); css_parts.append(css_k(vid))
        body += f'<div data-pid="{p.pid}" class="fp-win {vid}" style="position:absolute;left:0;top:{y}px;width:816px;"><div class="pp">{unique_ids(page_html(p), vid)}</div></div>\n'
        y += 3000
    write_board('R35C_BreakProbe', 'probe', 900, y, f'<div style="position:relative;width:900px;height:{y}px;background:#ffffff;">{body}</div>', ''.join(css_parts) + '[hidden]{display:none !important}')

def spare(pid):
    m = Mb(pid); return None if not m else LIMIT - (m['article']['y'] + m['article']['h'])
def fill(pid):
    m = Mb(pid); return None if not m else (m['article']['y'] + m['article']['h'] - TOPPAD) / USABLE
def pack_pages(heights, gaps, start=0.0):
    """Whole steps, greedy, onto pages of the usable height; start = where the first of them begins on its page (from the page's top margin). Returns the number of pages and the steps on the first."""
    pages = 1; y = start; first = 0
    for i, h in enumerate(heights):
        g = gaps[i - 1] if i else 0
        if y + (g if y > 0 else 0) + h > USABLE and y > 0: pages += 1; y = h
        else: y += (g if y > 0 else 0) + h
        if pages == 1: first = i + 1
    return pages, first
def instr_counts(tail_h):
    """K1 against K2 for Olive Oil v1, in pages after the formula page, from the probe's own step boxes (steps break between steps; the Instructions' own rule is Phase 4's)."""
    o = Mp('olive-method'); st = o['steps']; hs = [x['h'] for x in st]; gaps = [st[i + 1]['y'] - (st[i]['y'] + st[i]['h']) for i in range(len(st) - 1)]
    head = st[0]['y'] - o['method']['y']
    # K1: the Instructions follow the tail on its page
    k1_pages, k1_first = pack_pages(hs, gaps, tail_h + 32 + head)       # 32 = the article's gap between blocks (--gap-l, measured: the Total's foot to the Instructions heading)
    # K2: the tail has its own page, the Instructions open the next
    k2_instr, _ = pack_pages(hs, gaps, head)
    return dict(steps=len(hs), instr_h=o['method']['h'], k1_first=k1_first, k1_pages=k1_pages, k2_pages=1 + k2_instr)
def build_board_k():
    mp = Mp('olive-full'); widths = mp['cols']
    k, units, boxes, tot = decide_break(OL['ingr'], 'olive-full')
    names = [u['name'] for u in units]
    last_on_1 = names[k - 1]; moved = names[k:]
    page1_bottom = boxes[k - 1][1]; room = LIMIT - page1_bottom
    moved_h = boxes[-1][1] - boxes[k][0]
    over = mp['article']['y'] + mp['article']['h'] - LIMIT
    tail_h = boxes[-1][1] - boxes[k][0] + 40.78 + 31 + 0   # header + the groups moved + the Total row
    ic = instr_counts(tail_h)
    # --- row 1: Olive Oil v1, the break and its recommended continuation ---
    now = Pg('o-pc', f'Always PC, as it stands (decision 36) · page 3. Content {n0(mp["article"]["h"])}px against {n0(USABLE)}px of usable height: it falls off the page by {n0(over)}px, so the last rows and the Total fall past the foot. The blue bars mark the step groups.',
             [OL['head'], OL['before'], ingr_html(OL['ingr'])], units=units)
    p1 = Pg('o-p1', f'Break by steps · page 3. Before you start, then {", ".join(names[:k-1])} and {last_on_1}: whole groups only. The page ends {n0(room)}px above the foot; {" and ".join(moved)} ({n0(moved_h)}px: the head and two rows) does not fit in it, so it starts the next page whole. No Total here: it goes with the last group.',
            [OL['head'], OL['before'], ingr_html(OL['ingr'], 0, k, total=False, widths=widths)], units=units[:k],
            tag=f'Page 3 ends here. {" and ".join(moved)} starts the next page.')
    meth_blocks = None
    p2_tail = ingr_html(OL['ingr'], k, None, total=True, h2=None, widths=widths)
    p2 = Pg('o-p2k1', 'Break by steps · page 3, continued, with the Instructions following (K1, recommended). The table\'s header repeats; then ' + ' and '.join(moved) + ' and the Total; the Instructions follow on the same page, steps 1 to ' + str(ic['k1_first']) + ' of ' + str(ic['steps']) + ' fit whole, the other ' + str(ic['steps'] - ic['k1_first']) + ' go on the next page: ' + str(ic['k1_pages']) + ' pages after the formula page in all.',
            [p2_tail, OL['meth']], units=units[k:], clip_steps=True, tag='The Instructions continue on the next page.')
    rows = [('Olive Oil v1 · where the break falls: between step groups, never inside one', 'Letter portrait, the built page at print width, no Phase 4 geometry (no footer, no tick boxes, no ruled As made column): these are the best cases for fitting, and the real page fills sooner. The dotted line is the bottom margin, the dashed line the page edge. Decision 36 settled PC (Before you start opens the formula page); this is what it does when the table does not fit.', [now, p1, p2])]
    # --- row 2: K2, the alternative continuation ---
    k2a = Pg('o-p2k2', 'K2 · page 3, continued, with only the table\'s tail: the header repeats, then ' + ' and '.join(moved) + ' and the Total. The page is about ' + str(round(100 * (tail_h) / USABLE)) + '% full; the Instructions (' + n0(ic['instr_h']) + 'px) open the next page as they do when the table fits and take ' + str(ic['k2_pages'] - 1) + ' more pages: ' + str(ic['k2_pages']) + ' pages after the formula page in all (K1: ' + str(ic['k1_pages']) + ').',
             [ingr_html(OL['ingr'], k, None, total=True, h2=None, widths=widths)], units=units[k:])
    k2b = Pg('o-p4k2', 'K2 · page 4 (top): the Instructions page, opening at its heading, as for a recipe whose table fits.', [OL['meth']], cut=620)
    rows.append(('After the table\'s tail (question 1): K1 above, or K2 here', 'K1 puts the Instructions straight after the tail, on the same page; K2 gives the tail a page of its own and the Instructions open the next one. Same break, same repeated header; the difference is one sheet of paper and a rule: under K2 the Instructions always open a page, under K1 they do so only when the table ends its page.', [k2a, k2b]))
    # --- row 3: the heading ---
    h2c = Pg('o-p2h', 'The heading too (question 2): "Ingredients, continued" over the repeated header, the table as in K1. Mark asked for the header to repeat; the heading would be one line of new words.',
             [ingr_html(OL['ingr'], k, None, total=True, h2='Ingredients, continued', widths=widths)], cut=400, units=units[k:])
    h2n = Pg('o-p2n', 'Header only (as Mark asked, recommended) · the same page top: the repeated header is the table\'s own, so the page reads as the table going on; the foot Phase 4 draws names the recipe and the page.',
             [ingr_html(OL['ingr'], k, None, total=True, h2=None, widths=widths)], cut=400, units=units[k:])
    rows.append(('The repeated header (question 2): header only, or with a heading', 'Both pages show the header row (Ingredient, % of batch) at the top of the table\'s second page, in the same columns as the first. The difference is the line above it.', [h2n, h2c]))
    rk = decide_rowbreak('olive-full')
    # --- row 5: a recipe that fits ---
    mp2 = Mp('mex-full'); mu = table_units(MX['ingr'])[1]
    f1 = Pg('m-p1', f'A recipe that fits (Mexican Chocolate v3 with the two seeded notes added: constructed, since only Olive Oil v1 has notes) · page 3. Content {n0(mp2["article"]["h"])}px against {n0(USABLE)}px: it fits with {n0(LIMIT - mp2["article"]["y"] - mp2["article"]["h"])}px to spare. No break, no repeated header; the Total closes the table.',
            [MX['head'], NOTES, ingr_html(MX['ingr'], widths=mp2['cols'])], units=mu)
    f2 = Pg('m-p4', 'A recipe that fits · page 4 (top): the Instructions open the next page (decision 36\'s PC; the same as K2\'s page 4).', [MX['meth']], cut=620)
    rows.append(('A recipe that fits: the page is as decision 36 drew it', 'The rule changes nothing when the table fits: the break and the repeated header only appear when the table does not.', [f1, f2]))
    # --- row 6: the edge, one step holds the whole table ---
    mp3 = Mp('mex3x-full'); k3, u3, b3, t3 = decide_break(MX['ingr'], 'mex3x-full'); nrows3 = len([r for r in mp3['rows'] if r['r'] != 'total']); rk3 = min(decide_rowbreak('mex3x-full'), nrows3 - 2)   # never fewer than two rows on the next page: the engine's own widow rule (Chrome, measured)
    nb = more_notes(NOTES, 3)
    e1 = Pg('e-w1', f'Edge (constructed: Mexican Chocolate v3 with the seeded notes three times over, so the page is full) · one step holds every ingredient, and it does not fit. Whole-group rule, recommended: page 3 ends after Before you start, with {n0(LIMIT - (Mp("mex3x-full")["before"]["y"] + Mp("mex3x-full")["before"]["h"]))}px of the page empty; the Ingredients heading goes with the table.',
            [MX['head'], nb], tag='Page 3 ends here. The Ingredients heading and its table start the next page.')
    e2 = Pg('e-w2', 'Whole-group rule · page 3, continued: the Ingredients heading, the header, Step 1 with all twelve rows and the Total, on one page.',
            [ingr_html(MX['ingr'], widths=mp3['cols'])], units=u3, cut=None)
    s1 = Pg('e-s1', f'Alternative: no rule, the browser\'s own default (measured in Chrome\'s print: it splits a group where the foot falls, and keeps two rows for the next page) · page 3. The table starts under Before you start and runs to row {rk3 - 1} of 12; Step 1 is cut in two.',
            [MX['head'], nb, ingr_html(MX['ingr'], rowcut=(0, rk3), total=False, widths=mp3['cols'])], tag='Page 3 ends here, inside Step 1.')
    s2 = Pg('e-s2', 'Alternative · page 3, continued: the header repeats, then the last two rows of Step 1 and the Total, under no step head: nothing on the page says which step they are in.',
            [ingr_html(MX['ingr'], rowcut=(rk3, 99), total=True, h2=None, widths=mp3['cols'])], cut=400)
    rows.append(('Edge (question 3): one step holds the whole table and it does not fit', 'Many versions put every ingredient under one step (Mexican Chocolate v3, Step 1; twelve rows). The rule keeps that group whole, so a full page 3 sends the whole table to page 4. The alternative is what a browser does with no rule: it splits the group where the foot falls.', [e1, e2, s1, s2]))
    # the K1 page's Instructions: whole steps only (needs the board's own measure)
    for r in rows:
        for p in r[2]:
            if p.clip_steps: p.blocks[-1] = clip_method(p)
    return rows, dict(ic=ic, k=k, names=names, moved=moved, room=room, moved_h=moved_h, over=over, rk=rk, e=dict(rk3=rk3))

if __name__ == '__main__':
    if not BKM.get('probe'):
        write_probe_k(); print('probe written; measure it: node breaks-measure.mjs probe <R35C_BreakProbe.dc.html>')
    else:
        rows, facts = build_board_k()
        fn, bw, bh = kboard('R35C_BysBreak', 'before-you-start-print-break', 'C · print: the ingredients table breaks by step groups, the header repeats (letter portrait; Olive Oil v1, a recipe that fits, and the edge)', rows)
        json.dump({'boards': {fn: dict(w=bw, h=bh, page='page-13', title='C · print: the ingredients table breaks by step groups, the header repeats' + STAMP_K, snap='before-you-start-print-break')}, 'facts': facts}, open(OUT + '/breaks-canvas-entries.json', 'w'), indent=2)
        print('ok breaks', fn, bw, bh, facts, 'measured' if BKM.get('board') else 'board not measured yet')
