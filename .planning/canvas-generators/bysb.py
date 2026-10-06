import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 36's placement B boards
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-06 (decision 36, Mark's answer 1: placement B; Mark's List row decide-bys-redraw-placement-b, "Redraw first"): the states, heading and pen boards of decision 36 were drawn in placement A
# (bys.py); this file draws them again in placement B, above the Ingredients and under the Sheet description, on the build as it stands. Every panel is the built app's own shell markup (bysb-capture.json:
# WebKit, coarse pointer, the dist of 2026-10-06 00:13, which carries decision 48's one-line head and decision 49 A's rows) with the app's own stylesheets resolved at the panel's width; each "built"
# panel is the build as it is today (Before you start still inside Instructions: phase 03.7 is not built), each "B" panel moves the one block of markup and the grid rules the plan builds
# (03.7-01: `section.before-region` before the Ingredients, four area sets at both widths, four row sets from 984 with the 1fr on the Instructions' row). bys.py and its five boards stay as the dated record of
# the options. Crops come from bysb-measure.json (bysb-measure.mjs measures the probe board this file also writes). Nothing here edits app/.
BC = json.load(open(HERE + '/bysb-capture.json'))
BM = json.load(open(HERE + '/bysb-measure.json')) if os.path.exists(HERE + '/bysb-measure.json') else {}
BC = {k: drop_hidden(v) for k, v in BC.items()}
STAMP_B = " (decision 36, placement B as Mark chose it; redrawn 2026-10-06, awaiting Mark's look; nothing approved)"
MR = re.compile(r'<section class="method-region" aria-label="Instructions">.*?</section>', re.S)
BF = re.compile(r'<div class="method__before"><p class="region-name">Before you start</p>(<ul class="authored__notes">.*?</ul>)</div>', re.S)
INHERIT = '<span class="authored__inherited"> from 50 g oil · 800 g</span>'

# ---- markup moves --------------------------------------------------------------------------------------------------------------------------------------------------------
def no_steps(html):
    """Constructed: the version's steps removed (Olive Oil v1 keeps its two notes), as the app would draw a version with notes and no steps."""
    return re.sub(r'<ol class="method-steps">.*?</ol>', '<ol class="method-steps"></ol>', html, count=1, flags=re.S)
def with_marker(html):
    """Constructed: the first note carries the inherited-from marker a saved child wears (reading), or the pen's draft wears it after the field."""
    i = html.index('<ul class="authored__notes">'); j = html.index('</li>', i)
    return html[:j] + INHERIT + html[j:]
def mark(html):
    """Names the elements a crop is cut between (data-m), so the measure pass can place every window."""
    pairs = [('<article class="recipe-page', 'page'), ('<header class="headnote"', 'head'), ('<table class="ingredient-table', 'table'), ('<section class="before-region', 'before'),
             ('<section class="method-region"', 'method'), ('<li id="method-step-1"', 'step1'), ('<div class="side-region"', 'side'),
             ('<div class="method__before"', 'before'), ('<section class="ingredient-table-region"', 'ingr')]
    for pat, name in pairs:
        html = html.replace(pat, pat.replace(' class=', ' data-m="%s" class=' % name, 1) if ' class=' in pat else pat + ' data-m="%s"' % name, 1)
    return html
def propose(html, pen=False):
    """The promoted section: Before you start leaves the Instructions region and stands as a section of its own (h2 like its peers, no rule: H1), carrying the same list. The Instructions region leaves the page when
    it has no steps (reading); the pen keeps its Instructions heading (Mark, 2026-10-03). A section with no notes is left out (reading); in the pen it stays as the heading alone (E2, Mark's answer 3)."""
    m = MR.search(html)
    if not m:   # the app already leaves the Instructions section out (no steps, no notes): only the before-region modifier is added
        return re.sub(r'<article class="recipe-page[^"]*"', '<article class="recipe-page recipe-page--no-before recipe-page--no-method"', html, count=1)
    region = m.group(0); b = BF.search(region); assert b, 'no Before you start block'
    ul = b.group(1); has_notes = '<li' in ul; has_steps = '<li id="method-step' in region
    region2 = region.replace(b.group(0), '', 1)
    sec = ''
    if has_notes or pen: sec = '<section class="before-region" aria-label="Before you start"><h2 class="region-name">Before you start</h2>%s</section>' % (ul if has_notes else '')
    keep_region = has_steps or pen
    # the section goes between the band and the Ingredients (DOM order is the grid's order: band, before, ingredients, method, side, foot)
    html = html.replace(region, region2 if keep_region else '', 1)
    ing = '<section class="ingredient-table-region"'
    if sec:
        assert html.count(ing) == 1, 'ingredient region not found'
        html = html.replace(ing, sec + ing, 1)
    cls = 'recipe-page' + ('' if sec else ' recipe-page--no-before') + ('' if keep_region else ' recipe-page--no-method')
    return re.sub(r'<article class="recipe-page[^"]*"', '<article class="%s"' % cls, html, count=1)

# ---- the grid, placement B (plan 03.7-01's four area sets and four row sets) --------------------------------------------------------------------------------------------
def grid_css(narrow):
    """B: before, ingredients, (side on the phone), method. Four combinations of before-region and method-region present. From 984 the rows are decision 49 A's with the before row added: the 1fr stays on the
    Instructions' row (or the Ingredients' when there are none). Selectors carry an element name to out-rank the app's own modifier rule."""
    order = ['before', 'ingredients', 'side', 'method'] if narrow else ['before', 'ingredients', 'method']
    out = ''
    for sel, drop in (('article.recipe-page', ()), ('article.recipe-page.recipe-page--no-before', ('before',)), ('article.recipe-page.recipe-page--no-method', ('method',)),
                      ('article.recipe-page.recipe-page--no-before.recipe-page--no-method', ('before', 'method'))):
        rows = [r for r in order if r not in drop]
        if narrow: areas = ['band'] + rows + ['foot']
        else: areas = ['band band'] + [r + ' side' for r in rows] + ['foot foot']
        out += sel + '{grid-template-areas:' + ''.join('"%s"' % a for a in areas) + '}\n'
        if not narrow:
            last = max(i for i, r in enumerate(rows) if r in ('method', 'ingredients'))
            tr = ' '.join(['auto'] + ['1fr' if i == last else 'auto' for i in range(len(rows))] + ['auto'])
            out += sel + '{grid-template-rows:' + tr + '}\n'
    return out + '.before-region{grid-area:before;min-width:0;max-width:var(--measure-prose)}\n'

# ---- panels and boards ---------------------------------------------------------------------------------------------------------------------------------------------------
PANELS = []   # every panel of every board, for the probe
def panel(pid, W, html, cap, crop, css=''):
    """crop = (from marker, dy, to marker, dy): the window runs from the from-marker's top (or bottom with ":b") + dy to the to-marker's bottom (or top with ":t") + dy."""
    p = dict(pid=pid, W=W, html=html, cap=cap, crop=crop, css=css); PANELS.append(p); return p
def rect(pid, name):
    return BM.get(pid, {}).get(name)
def window(p):
    pg = rect(p['pid'], 'page'); cf, d0, ct, d1 = p['crop']
    a = rect(p['pid'], cf.split(':')[0]); b = rect(p['pid'], ct.split(':')[0])
    if not (pg and a and b): return 0, 0, p['W'], 900
    y0 = max(0, a['y'] + (a['h'] if cf.endswith(':b') else 0) + d0); y1 = b['y'] + (0 if ct.endswith(':t') else b['h']) + d1
    x0 = pg['x']; w = min(pg['w'], p['W'] - x0)
    return x0, y0, w, max(60, y1 - y0)
ROWH = 96; LABH = 92
def bysb_board(key, snap, title, rows):
    """rows = [(title, description, [panels])]; each panel is a cropped window of the built page, its one-line label above it."""
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}.fp-lab-n{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n']; seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:1300px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:1300px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-').replace(':', '-')
            W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=p['css']))
            html = unique_ids(with_menu(p['html'], W), vid)
            x0, y0, ww, hh = window(p); cells.append((vid, W, html, x0, y0, ww, hh, p['cap'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}</p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_B, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_B[fn] = dict(w=bw, h=y, page='page-14', title=title + STAMP_B, snap=snap)
ENTRIES_B = {}

# ---- the cases ----------------------------------------------------------------------------------------------------------------------------------------------------------
def case(name, W):
    """The built page's markup for each case: olive (notes and steps), mex (steps, no notes), notes_only (constructed), base (neither), and the pen's three."""
    return {'olive': BC[f'olive1v_{W}'], 'mex': BC[f'mex3_{W}'], 'notes_only': no_steps(BC[f'olive1v_{W}']), 'base': BC[f'base2_{W}'],
            'olive_marker': with_marker(BC[f'olive1v_{W}']),
            'olive_pen': BC[f'olive1vpen_{W}'], 'mex_pen': BC[f'mex3pen_{W}'], 'base_pen': BC[f'base2pen_{W}']}[name]
WIDTHS = (1366, 393)
def N(v): return f'{v:,}' if isinstance(v, int) else (f'{v:,.0f}' if abs(v - round(v)) < 0.05 else f'{v:,.1f}')
def cap(pid, label, what):
    """The panel's one-line label and, under it, what was measured on the probe board (px from the top of the app window; the Sheet is the article's own height). what: top, ins or head."""
    if pid not in BM: return label
    m = BM[pid]; pg = m['page']['h']; sec = m.get('_sec'); bits = []
    if what == 'top':
        if sec and sec['h'] > 26: bits.append(f"section {N(sec['h'])} tall at {N(m['before']['y'])}")
        elif sec: bits.append(f"heading alone, {N(sec['h'])} tall, at {N(m['before']['y'])}")
        else: bits.append('no section')
        bits.append(f"Ingredients at {N(m['ingr']['y'])}")
    elif what == 'ins':
        if 'method' in m: bits.append(f"Instructions at {N(m['method']['y'])}, {N(m['method']['h'])} tall")
        else: bits.append('no Instructions')
    elif what == 'head' and sec:
        g = sec['h2']; bits.append(f"heading {g['size']}, {g['weight']}, {g['transform']}, {g['spacing']} tracking, {g['mb']} under it, the same as the Ingredients heading")
        bits.append(f"list {N(sec['ulH'])} tall ({' and '.join(N(v) for v in sec['lis'])}), {N(sec['toIngr'])} to the Ingredients, border {sec['border'][1]}, bottom padding {sec['padB']}")
    bits.append(f"Sheet {N(pg)} tall")
    return label + '<span class="fp-lab-n">' + '; '.join(bits) + '</span>'

def pair(row, W, name, tag, top, instr, pen=False):
    """One state at one width: the build and B, each cropped to the top of the Sheet (top) and/or to the Instructions (instr). Returns (top panels, instruction panels)."""
    base = case(name, W)
    built = mark(base); b = mark(propose(base, pen=pen)); css = grid_css(W < 984)
    t, i = [], []
    if top:
        t.append(panel(f'{tag}-top-built-{W}', W, built, cap(f'{tag}-top-built-{W}', f'{W} · as built', 'top'), top)); t.append(panel(f'{tag}-top-b-{W}', W, b, cap(f'{tag}-top-b-{W}', f'{W} · B', 'top'), top, css))
    if instr:
        i.append(panel(f'{tag}-ins-built-{W}', W, built, cap(f'{tag}-ins-built-{W}', f'{W} · as built', 'ins'), instr[0])); i.append(panel(f'{tag}-ins-b-{W}', W, b, cap(f'{tag}-ins-b-{W}', f'{W} · B', 'ins'), instr[1], css))
    return t, i
TOP = ('head', -10, 'ingr:t', 230)         # the top of the Sheet: the description, the section (B), the Ingredients head and the first rows

def build_boards():
    # ---- states -------------------------------------------------------------------------------------------------------------------------------------------------
    st = []
    def rowset(name, tag, top, instr, pen=False, topfirst=True):
        tops, ins = [], []
        for W in WIDTHS:
            t, i = pair(None, W, name, tag, top, instr, pen); tops += t; ins += i
        return tops, ins
    ot, oi = rowset('olive', 'bs-olive', TOP, (('method', -40, 'step1', 10), ('method', -40, 'step1', 10)))
    st.append(('Notes and steps (Olive Oil v1, a real version): the top of the Sheet', 'Before you start is a section under the description, above the Ingredients: the heading, then the two notes. Nothing else on the page moves up.', ot))
    st.append(('Notes and steps: the Instructions', 'The block leaves Instructions: the heading stands over the steps, and the rule and its padding go.', oi))
    mt, mi = rowset('mex', 'bs-mex', None, (('table:b', -60, 'step1', 10), ('table:b', -60, 'step1', 10)))
    mtb = [panel(f'bs-mex-top-b-{W}', W, mark(propose(case('mex', W))), cap(f'bs-mex-top-b-{W}', f'{W} · B', 'top'), TOP, grid_css(W < 984)) for W in WIDTHS]
    st.append(('Steps, no notes (Mexican Chocolate v3, a real version): the top of the Sheet', 'B draws no section and no extra row gap, so the Ingredients follow the description. As built draws the same top, so only B is shown.', mtb))
    st.append(('Steps, no notes: the Instructions', 'Built: an empty Before you start label, an empty list and a rule under the Instructions heading. B: the empty block is gone.', mi))
    nt, ni = rowset('notes_only', 'bs-nosteps', TOP, (('table:b', -110, 'before', 10), ('table:b', -110, 'table:b', 120)))
    st.append(('Notes, no steps (constructed: Olive Oil v1 with its steps removed): the top of the Sheet', 'Before you start renders alone, at the top, above the Ingredients.', nt))
    st.append(('Notes, no steps: under the table', 'Built: the Instructions heading stands over the notes. B: the Instructions section and its grid row leave, so nothing stands under the table.', ni))
    bt, bi = rowset('base', 'bs-neither', None, (('table:b', -110, 'table:b', 330), ('table:b', -110, 'table:b', 330)))
    bt_b = [panel(f'bs-neither-top-b-{W}', W, mark(propose(case('base', W))), cap(f'bs-neither-top-b-{W}', f'{W} · B', 'top'), TOP, grid_css(W < 984)) for W in WIDTHS]
    st.append(('Neither (Standard Base v2, a real version): the top of the Sheet', 'Nothing renders for either section: the Ingredients follow the description, with no gap left for a row.', bt_b))
    st.append(('Neither: under the table', 'Nothing renders for either section in either: the two rows leave together and leave no gap.', bi))
    mk = [panel(f'bs-marker-top-b-{W}', W, mark(propose(case('olive_marker', W))), cap(f'bs-marker-top-b-{W}', f'{W} · B, a saved child with an inherited note', 'top'), TOP, grid_css(W < 984)) for W in WIDTHS]
    st.append(('The inherited-note marker (constructed: a saved child whose first note was inherited)', 'The marker stays on the note, after its text, in small print: the move does not change it.', mk))
    bysb_board('R35C_BysStatesB', 'before-you-start-states-b', 'C · "Before you start" above the Ingredients: with notes, without notes, without steps, with neither (reading; 1366 and 393)', st)

    # ---- heading ------------------------------------------------------------------------------------------------------------------------------------------------
    hd = []
    HT = ('before', -40, 'ingr:t', 140)         # the section and the Ingredients head under it, close
    h = [panel(f'bh-h1-{W}', W, mark(propose(case('olive', W))), cap(f'bh-h1-{W}', f'{W} · the heading alone', 'head'), HT, grid_css(W < 984)) for W in WIDTHS]
    hd.append(('The heading: the h2 alone, as Ingredients and Instructions have it', 'No rule under the notes and no bottom padding: the gap between sections separates it. The old closing hairline is not carried over. Olive Oil v1; the measured type and gaps are in the captions.', h))
    bysb_board('R35C_BysHeadingB', 'before-you-start-heading-b', 'C · "Before you start" above the Ingredients: the heading (placement B; 1366 and 393)', hd)

    # ---- pen ----------------------------------------------------------------------------------------------------------------------------------------------------
    pn = []
    ot, oi = rowset('olive_pen', 'bp-olive', TOP, (('method', -40, 'step1', 10), ('method', -40, 'step1', 10)), pen=True)
    pn.append(('Next version open, with notes (Olive Oil v1): the top of the Sheet', 'The notes stay editable fields with remove, in the new section, above the Ingredients. There is still no add-note control in the pen (not part of this change).', ot))
    pn.append(('Next version open, with notes: the Instructions', 'The note fields leave Instructions: it keeps its heading and its steps.', oi))
    mt, mi = rowset('mex_pen', 'bp-mex', TOP, (('table:b', -60, 'step1', 40), ('table:b', -60, 'step1', 40)), pen=True)
    pn.append(('Next version open, no notes (Mexican Chocolate v3): E2, the heading alone, the top of the Sheet', 'The pen keeps the heading, as it keeps the empty Instructions heading (Mark, 2026-10-03). The reading view draws nothing for no notes.', mt))
    pn.append(('Next version open, no notes: the Instructions', 'Built: an empty Before you start label and rule under the Instructions heading. B: the Instructions keep their heading and steps, and nothing else.', mi))
    bt, bi = rowset('base_pen', 'bp-base', TOP, (('table:b', -60, 'side', 40), ('table:b', -60, 'side', 40)), pen=True)
    pn.append(('Next version open, no steps and no notes (Standard Base v2): both headings, the top of the Sheet', 'With E2 the Before you start heading stands above the Ingredients, over nothing, in the pen only.', bt))
    pn.append(('Next version open, no steps and no notes: under the table', 'With no steps the pen keeps the Instructions heading, over nothing. Built has the Before you start label inside it; B has the Instructions heading alone.', bi))
    mk = [panel(f'bp-marker-top-b-{W}', W, mark(propose(with_marker_pen(case('olive_pen', W)), pen=True)), cap(f'bp-marker-top-b-{W}', f'{W} · B, a note carrying the inherited marker', 'top'), TOP, grid_css(W < 984)) for W in WIDTHS]
    pn.append(('Next version open, a note that carries the inherited marker (constructed)', 'The marker follows the field, as the app draws it: the move does not change it.', mk))
    bysb_board('R35C_BysPenB', 'before-you-start-pen-b', 'C · "Before you start" above the Ingredients: the Next version pen (placement B; 1366 and 393)', pn)

def with_marker_pen(html):
    i = html.index('<ul class="authored__notes">'); j = html.index('</li>', i)
    return html[:j] + INHERIT + html[j:]

# ---- the probe: every panel at natural size, for bysb-measure.mjs -----------------------------------------------------------------------------------------------------------
def write_probe():
    css_parts = []; body = ''; y = 0; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-').replace(':', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['css']))
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="position:absolute;left:0;top:{y}px;width:{W}px;"><div style="width:{W}px;">{unique_ids(with_menu(p["html"], W), vid)}</div></div>\n'
        y += 7000
    main = f'<div style="position:relative;width:1400px;height:{y}px;background:#ffffff;">{body}</div>'
    write_board('R35C_BysBProbe', 'probe', 1400, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')

build_boards()
write_probe()
json.dump({'boards': ENTRIES_B}, open(OUT + '/bysb-canvas-entries.json', 'w'), indent=2)
print('ok bysb', {fn: (e['w'], e['h']) for fn, e in ENTRIES_B.items()}, 'measured' if BM else 'not measured yet')
