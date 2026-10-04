import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 36's boards
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 36): "Before you start" promoted out of Instructions into a Sheet section of its own. Mark, 2026-10-03: "promote 'Before you start' into a separate section, outside Instructions."
# Todo .planning/todos/pending/2026-10-03-promote-before-you-start-into-its-own-section-outside-instru.md. Every panel is the built app's own shell markup (bys-capture.json: WebKit, coarse pointer, the dist of
# 2026-10-04) with the app's own stylesheets resolved at the panel's width; the options move one rule or one block of markup per row. Crops come from bys-measure.json (bys-measure.mjs measures the probe
# board this file also writes). Nothing here edits app/.
BC = json.load(open(HERE + '/bys-capture.json'))
BM = json.load(open(HERE + '/bys-measure.json')) if os.path.exists(HERE + '/bys-measure.json') else {}
BC = {k: drop_hidden(v) for k, v in BC.items()}
STAMP_B = " (decision 36, options for Mark; drawn 2026-10-04, awaiting Mark's look; nothing approved)"
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
             ('<section class="method-region"', 'method'), ('<li id="method-step-1"', 'step1'), ('<li id="method-step-2"', 'step2'), ('<li id="method-step-3"', 'step3'), ('<div class="side-region"', 'side'),
             ('<div class="method__before"', 'before'), ('<h2 class="region-name">Instructions</h2>', 'instr'), ('<section class="ingredient-table-region"', 'ingr')]
    for pat, name in pairs:
        if pat.startswith('<h2'): html = html.replace(pat, '<h2 data-m="%s" class="region-name">Instructions</h2>' % name, 1)
        else: html = html.replace(pat, pat.replace(' class=', ' data-m="%s" class=' % name, 1) if ' class=' in pat else pat + ' data-m="%s"' % name, 1)
    return html
def propose(html, pen=False, empty_pen='keep', ruled=False):
    """The promoted section: Before you start leaves the Instructions region and stands as a section of its own (h2 like its peers), carrying the same list. The Instructions region leaves the page when it has no steps
    (reading); the pen keeps its Instructions heading (Mark, 2026-10-03). A section with no notes is left out (reading); in the pen, empty_pen decides: 'keep' draws the heading alone, 'omit' leaves it out."""
    m = MR.search(html)
    if not m:   # the app already leaves the Instructions section out (no steps, no notes): only the before-region modifier is added
        return re.sub(r'<article class="recipe-page[^"]*"', '<article class="recipe-page recipe-page--no-before recipe-page--no-method"', html, count=1)
    region = m.group(0); b = BF.search(region); assert b, 'no Before you start block'
    ul = b.group(1); has_notes = '<li' in ul; has_steps = '<li id="method-step' in region
    region2 = region.replace(b.group(0), '', 1)
    sec = ''
    if has_notes: sec = '<section class="before-region%s" aria-label="Before you start"><h2 class="region-name">Before you start</h2>%s</section>' % (' before-region--ruled' if ruled else '', ul)
    elif pen and empty_pen == 'keep': sec = '<section class="before-region%s" aria-label="Before you start"><h2 class="region-name">Before you start</h2></section>' % (' before-region--ruled' if ruled else '')
    keep_region = has_steps or pen
    html = html.replace(region, sec + (region2 if keep_region else ''), 1)
    cls = 'recipe-page' + ('' if sec else ' recipe-page--no-before') + ('' if keep_region else ' recipe-page--no-method')
    return re.sub(r'<article class="recipe-page[^"]*"', '<article class="%s"' % cls, html, count=1)

# ---- grid rules for each option (the spec the app brief points at) -------------------------------------------------------------------------------------------------------
def grid_css(opt, narrow):
    """The Sheet's grid areas for the four combinations of before-region and method-region present. Selectors carry an element name to out-rank the app's own modifier rule."""
    order = {'A': ['ingredients', 'side', 'before', 'method'] if narrow else ['ingredients', 'before', 'method'],
             'A1': ['ingredients', 'before', 'side', 'method'] if narrow else ['ingredients', 'before', 'method'],
             'B': ['before', 'ingredients', 'side', 'method'] if narrow else ['before', 'ingredients', 'method']}[opt]
    out = ''
    for sel, drop in (('article.recipe-page', ()), ('article.recipe-page.recipe-page--no-before', ('before',)), ('article.recipe-page.recipe-page--no-method', ('method',)),
                      ('article.recipe-page.recipe-page--no-before.recipe-page--no-method', ('before', 'method'))):
        rows = [r for r in order if r not in drop]
        if narrow: areas = ['band'] + rows + ['foot']
        else: areas = ['band band'] + [r + ' side' if r != 'side' else None for r in rows] + ['foot foot']
        areas = [a for a in areas if a]
        out += sel + '{grid-template-areas:' + ''.join('"%s"' % a for a in areas) + '}\n'
    return out + '.before-region{grid-area:before;min-width:0;max-width:var(--measure-prose)}\n'
RULED = '.before-region--ruled{padding-bottom:var(--gap-m);border-bottom:var(--rule-graduation) solid var(--sheet-ink)}\n'

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
ROWH = 96; LABH = 50
def bys_board(key, snap, title, rows, ncols_note=''):
    """rows = [(title, description, [panels])]; each panel is a cropped window of the built page, its one-line label above it."""
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n']; seen = set(); body = ''; y = GAP; bw = 0
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
    ENTRIES_B[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_B, snap=snap)
ENTRIES_B = {}
def css_for(opt, W, ruled=False):
    return grid_css(opt, W < 984) + (RULED if ruled else '')

# ---- the cases ----------------------------------------------------------------------------------------------------------------------------------------------------------
def case(name, W):
    """The built page's markup for each case: olive (notes and steps), mex (steps, no notes), notes_only (constructed), base (neither)."""
    return {'olive': BC[f'olive1v_{W}'], 'mex': BC[f'mex3_{W}'], 'notes_only': no_steps(BC[f'olive1v_{W}']), 'base': BC[f'base2_{W}'],
            'olive_marker': with_marker(BC[f'olive1v_{W}']),
            'olive_pen': BC[f'olive1vpen_{W}'], 'mex_pen': BC[f'mex3pen_{W}'], 'base_pen': BC[f'base2pen_{W}'], 'olive_pen_marker': None}[name]
WIDTHS = (1366, 393)

# Board 1: the position in the Sheet (reading, with notes), as built and three places
def pos_row(opt):
    """The Olive Oil v1 reading panels at 1366 and 393: as built (opt None), or the section moved to place A or B."""
    out = []
    for W in WIDTHS:
        base = case('olive', W); tag = f'pos-{opt or "built"}-{W}'
        if opt is None:
            out.append(panel(tag, W, mark(base), f'{W} · as built', ('table:b', -170, 'step1', 10)))
        elif opt == 'B':
            out.append(panel(tag, W, mark(propose(base)), f'{W} · above the Ingredients', ('head', -10, 'table', 120), css_for(opt, W)))
        else:
            out.append(panel(tag, W, mark(propose(base)), f'{W} · directly above Instructions', ('table:b', -170, 'step1', 10), css_for(opt, W)))
    return out

def build_boards():
    rows = []
    # position
    r1 = pos_row(None)
    rA = pos_row('A')
    rB = pos_row('B')
    # A1: the narrow-only variant (before the Balance column on the phone), 393 only
    html = mark(propose(case('olive', 393))); rA1 = [panel('pos-A1-393', 393, html, '393 · under the Ingredients, ahead of Balance and Watch for', ('table:b', -170, 'step1', 10), css_for('A1', 393))]
    rows.append(('As built: Before you start is the first thing inside Instructions', 'The label is a paragraph styled like a heading, under the Instructions heading, closed by a hairline rule. Olive Oil v1, two authored notes; Balance and Watch for beside (1366) or folded above Instructions (393).', r1))
    rows.append(('A (recommended): its own section directly above Instructions', 'One rule: the new row sits directly above Instructions in the grid. In the Sheet column it is under the Ingredients; at 393 it follows Balance and Watch for, so nothing that exists today moves. Heading is an h2 like its peers; no closing rule (H1). Sheet height (WebKit): 2,362 as built, 2,353 here at 1366; 2,766 and 2,745 at 393 (the old block\'s rule and padding go).', rA))
    rows.append(('A1: under the Ingredients at the phone too', 'Same as A from 984 up. At 393 Before you start comes ahead of Balance and Watch for, which then separate it from Instructions. Not drawn at 1366: identical to A.', rA1))
    rows.append(('B: above the Ingredients, under the Sheet description', 'The order of doing: the checks come before the weighing. The Balance column starts level with it. At 393 the table top moves from 801 to 990 (189px lower); the Sheet is 2,745 tall, as in A.', rB))
    bys_board('R35C_BysPosition', 'before-you-start-position', 'C · "Before you start" as its own Sheet section: where it sits (reading, with notes; 1366 and 393)', rows)

    # states: with and without notes and steps, as built vs proposed (recommended placement A, heading H1)
    st = []
    def pair(name, label, W, key, end):
        base = case(name, W)
        built = panel(f'st-{key}-built-{W}', W, mark(base), f'{W} · as built', ('table:b', -110) + end)
        prop = panel(f'st-{key}-prop-{W}', W, mark(propose(base)), f'{W} · proposed', ('table:b', -110) + end, css_for('A', W))
        return [built, prop]
    s2 = sum((pair('mex', '', W, 'nonotes', ('step1', 10)) for W in WIDTHS), [])
    s3 = sum((pair('notes_only', '', W, 'nosteps', ('before', 10)) for W in WIDTHS), [])
    s4 = sum((pair('base', '', W, 'neither', ('table:b', 330)) for W in WIDTHS), [])
    s5 = []
    for W in WIDTHS:
        base = case('olive_marker', W)
        s5.append(panel(f'st-marker-prop-{W}', W, mark(propose(base)), f'{W} · proposed, saved child', ('table:b', -110, 'step1', 10), css_for('A', W)))
    st.append(('Steps, no notes (Mexican Chocolate v3, a real version)', 'As built, an empty "Before you start" label and its rule still render under Instructions. Proposed, the section is not drawn at all. At 393 the Sheet is 1,089 as built and 1,023 here (66px shorter); at 1366 the Balance column is the taller one, so the page does not change.', s2))
    st.append(('Notes, no steps (constructed: Olive Oil v1 with its steps removed)', 'As built, the Instructions heading stands over the notes. Proposed, only Before you start renders; the Instructions section and its grid row leave (no extra row gap). At 393 the Sheet is 1,525 as built and 1,459 here.', s3))
    st.append(('Neither (Standard Base v2, a real version)', 'Nothing renders under the table in either; the Sheet ends at Balance and Watch for. Shown to prove the two rows leave together and leave no gap.', s4))
    st.append(('The inherited-note marker (constructed: a saved child whose first note was inherited)', 'The marker stays on the note, after its text, in small print: unchanged by the move. Proposed only.', s5))
    bys_board('R35C_BysStates', 'before-you-start-states', 'C · "Before you start" as its own Sheet section: with notes, without notes, without steps, with neither (reading; 1366 and 393)', st)

    # heading: H1 vs H2 on option A
    hd = []
    h1 = [panel(f'hd-h1-{W}', W, mark(propose(case('olive', W))), f'{W} · H1', ('table:b', -150, 'step1', 10), css_for('A', W)) for W in WIDTHS]
    h2 = [panel(f'hd-h2-{W}', W, mark(propose(case('olive', W), ruled=True)), f'{W} · H2', ('table:b', -150, 'step1', 10), css_for('A', W, ruled=True)) for W in WIDTHS]
    hd.append(('H1 (recommended): the h2 heading alone', 'Same heading as Ingredients and Instructions, uppercase small type in bookcloth. The gap between sections separates it; the hairline that closed the old block is not carried over.', h1))
    hd.append(('H2: the heading and the old closing hairline', 'The block still ends in the graduation-weight hairline it has today (it is the rule between the notes and step 1), now under a section of its own: padding gap-m, then the section gap, so the notes sit in a ruled band above Instructions. 21px taller than H1 at both widths (2,374 against 2,353 at 1366; 2,766 against 2,745 at 393).', h2))
    bys_board('R35C_BysHeading', 'before-you-start-heading', 'C · "Before you start" as its own Sheet section: the heading and the hairline (placement A; 1366 and 393)', hd)

    # pen
    pn = []
    olive_b = [panel(f'pen-olive-built-{W}', W, mark(case('olive_pen', W)), f'{W} · as built', ('table:b', -90, 'before', 20)) for W in WIDTHS]
    olive_p = [panel(f'pen-olive-prop-{W}', W, mark(propose(case('olive_pen', W), pen=True)), f'{W} · proposed', ('table:b', -90, 'step1', 10), css_for('A', W)) for W in WIDTHS]
    pn.append(('Next version open, with notes (Olive Oil v1): as built, then proposed', 'The notes stay editable fields with remove, in the new section. There is still no add-note control in the pen (not part of this change). Instructions keeps its heading and its steps.', olive_b + olive_p))
    mex_b = [panel(f'pen-mex-built-{W}', W, mark(case('mex_pen', W)), f'{W} · as built', ('table:b', -90, 'step1', 40)) for W in WIDTHS]
    mex_e2 = [panel(f'pen-mex-e2-{W}', W, mark(propose(case('mex_pen', W), pen=True, empty_pen='keep')), f'{W} · E2: heading kept', ('table:b', -90, 'step1', 40), css_for('A', W)) for W in WIDTHS]
    mex_e1 = [panel(f'pen-mex-e1-{W}', W, mark(propose(case('mex_pen', W), pen=True, empty_pen='omit')), f'{W} · E1: section left out', ('table:b', -90, 'step1', 40), css_for('A', W)) for W in WIDTHS]
    pn.append(('Next version open, no notes (Mexican Chocolate v3): as built, E2 (recommended), E1', 'E2 keeps the heading in the pen, as Mark keeps the empty Instructions heading in the pen (2026-10-03); E1 leaves the section out until an add-note control exists. Either way the reading view draws nothing for no notes. At 393 the Sheet is 1,665 as built, 1,644 with E2 and 1,599 with E1.', mex_b + mex_e2 + mex_e1))
    base_b = [panel(f'pen-base-built-{W}', W, mark(case('base_pen', W)), f'{W} · as built', ('table:b', -90, 'side', 40)) for W in WIDTHS]
    base_e2 = [panel(f'pen-base-e2-{W}', W, mark(propose(case('base_pen', W), pen=True, empty_pen='keep')), f'{W} · E2', ('table:b', -90, 'side', 40), css_for('A', W)) for W in WIDTHS]
    pn.append(('Next version open, no steps and no notes (Standard Base v2): as built, then E2', 'With no steps the pen keeps the Instructions heading (Mark, 2026-10-03), and with E2 the Before you start heading above it. Both are headings over nothing, in the pen only.', base_b + base_e2))
    mk = [panel(f'pen-marker-{W}', W, mark(propose(with_marker_pen(case('olive_pen', W)), pen=True)), f'{W} · proposed, a note carrying the inherited marker', ('table:b', -90, 'step1', 10), css_for('A', W)) for W in WIDTHS]
    pn.append(('Next version open, a note that carries the inherited marker (constructed)', 'The marker follows the field, as the app draws it: unchanged by the move.', mk))
    bys_board('R35C_BysPen', 'before-you-start-pen', 'C · "Before you start" as its own Sheet section: the Next version pen (1366 and 393)', pn)

def with_marker_pen(html):
    i = html.index('<ul class="authored__notes">'); j = html.index('</li>', i)
    return html[:j] + INHERIT + html[j:]

# ---- print ------------------------------------------------------------------------------------------------------------------------------------------------------------------
PRINT_CSS = '''
.pp{box-sizing:border-box;width:816px;height:1056px;padding:48px 56px 40px;background:#ffffff;color:var(--sheet-ink);position:relative;overflow:visible;--sheet-bookcloth:var(--sheet-ink);--sheet-ground:#ffffff;outline:1px solid #c9c9c9}
.pp--cut{height:620px;overflow:hidden}
.pp article.recipe-page{display:flex;flex-direction:column;gap:var(--gap-l);padding:0;background:transparent;margin:0}
.pp .text-control,.pp button,.pp .history-disclosure,.pp .table-small-print{display:none}
.pp .method-step__acts{display:none}
.pp-edge{position:absolute;left:0;right:0;bottom:0;height:0;border-bottom:2px dashed #9a9a9a}
.pp-limit{position:absolute;left:0;right:0;bottom:40px;height:0;border-bottom:1px dotted #9a9a9a}
.pp .before-region{max-width:var(--measure-prose)}
'''
def print_parts(key):
    h = BC[key]
    head = re.search(r'<header class="headnote">.*?</header>', h, re.S).group(0)
    ingr = re.search(r'<section class="ingredient-table-region".*?</section>', h, re.S).group(0)
    # a blank sheet carries no batch: the As made column, the skipped label and the strikes go
    ingr = re.sub(r'<th[^>]*>As made</th>', '', ingr)
    def drop_third(m):
        tds = re.findall(r'<td[^>]*>.*?</td>', m.group(0), re.S)
        if len(tds) == 4: return m.group(0).replace(tds[2], '', 1)
        return m.group(0)
    ingr = re.sub(r'<tr[^>]*aria-label[^>]*>.*?</tr>', drop_third, ingr, flags=re.S)
    ingr = ingr.replace('<td colspan="4">', '<td colspan="3">')
    ingr = re.sub(r'<span class="sheet-hand">[^<]*</span>', '', ingr)
    m = MR.search(h)
    if not m: return head, ingr, '', ''
    meth = m.group(0)
    meth = re.sub(r'<span class="method-step__skipped-label">[^<]*</span>', '', meth)
    meth = meth.replace('method-step__prose--struck', 'method-step__prose')
    b = BF.search(meth); ul = b.group(1)
    meth2 = meth.replace(b.group(0), '', 1)
    before = '<section class="before-region" aria-label="Before you start"><h2 class="region-name">Before you start</h2>%s</section>' % ul if '<li' in ul else ''
    return head, ingr, meth2, before
def page(pid, cap, blocks, cut=False):
    inner = '<article class="recipe-page">' + ''.join(blocks) + '</article>'
    return dict(pid=pid, cap=cap, html='<div class="pp%s">%s%s</div>' % (' pp--cut' if cut else '', inner, '<div class="pp-edge"></div>' if cut else '<div class="pp-limit"></div><div class="pp-edge"></div>'), cut=cut)
def pm(pid, field):
    return (BM.get('print', {}).get(pid.replace('-', '-'), {}) or {}).get(field)
def over_text(pid):
    o = pm(pid, 'over'); u = pm(pid, 'usable'); c = pm(pid, 'content')
    if o is None: return ''
    return (f' Content {c}px against {u}px of usable height: {"it falls off the page by " + str(o) + "px" if o > 0 else "it fits, with " + str(-o) + "px to spare"}.')

def print_pages():
    head, ingr, meth, before = print_parts('olive1v_816')
    mhead, mingr, mmeth, _ = print_parts('mex3_816')
    bhead, bingr, _, _ = print_parts('base2_816')
    r3 = [page('pr-PA-3', 'PA · page 3: the formula page is unchanged.' + over_text('pr-PA-3'), [head, ingr]),
          page('pr-PB-3', 'PB · page 3: Before you start under the table.' + over_text('pr-PB-3'), [head, ingr, before]),
          page('pr-PC-3', 'PC · page 3: Before you start above the table.' + over_text('pr-PC-3'), [head, before, ingr])]
    r4 = [page('pr-PA-4', 'PA · page 4 (top): the Instructions page opens with Before you start, then the Instructions heading.', [before, meth], cut=True),
          page('pr-PC-4', 'PC · page 4 (top): the Instructions page opens at the Instructions heading. (PB, where the section fits under the table on page 3, comes here too.)', [meth], cut=True)]
    nonotes = [page('pr-nonotes-3', 'No notes (Mexican Chocolate v3) · page 3: the table ends the page.' + over_text('pr-nonotes-3'), [mhead, mingr]),
               page('pr-nonotes-4', 'No notes · page 4 (top): opens at the Instructions heading. No empty label, no rule.', [mmeth], cut=True),
               page('pr-short-3', 'PB where it fits (constructed: Standard Base v2 with the two seeded notes; no steps) · page 3: ends with Before you start; there is no page 4.' + over_text('pr-short-3'), [bhead, bingr, before])]
    return r3, r4, nonotes

def print_boards():
    r3, r4, nonotes = print_pages()
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n', resolve_media(TOK, 816, False)]
    body = ''; y = GAP; bw = 0
    def row(title, desc, pages, rowh0=0):
        nonlocal body, y, bw
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2600px;"><p class="fp-title">{title}</p><p class="fp-sub" style="max-width:2400px">{desc}</p></div>\n'
        y += ROWH; x = GAP; rowh = rowh0
        for p in pages:
            vid = 'fp-' + p['pid'].replace('_', '-')
            css_parts.append(scope_css(resolve_media(APPC, 816, False) + resolve_media(NBC, 816, False) + PRINT_APP + PRINT_CSS, '.' + vid))
            h = 620 if p['cut'] else 1056; rowh = max(rowh, h)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:816px;"><div style="height:{LABH + 24}px;"><p class="fp-lab">{p["cap"]}</p></div>'
                     f'<div class="fp-win {vid}" style="width:816px;height:{h}px;background:#ffffff;overflow:visible;">{unique_ids(p["html"], vid)}</div></div>\n')
            x += 816 + GAP
        bw = max(bw, x); y += LABH + 24 + 8 + rowh + GAP
    row('Page 3, the formula page, by option (Olive Oil v1, two notes)', 'Letter portrait, the built page as it prints today (the same sheet at letter width, no Phase 4 geometry: no footer, no tick boxes, no blank As made column), the batch layer removed. The dotted line is the bottom margin, the dashed line the page edge; what runs past them falls off the page. Phase 4 draws the real page, with more on it, so these are the best cases for fitting.', r3, 1056 + 130)
    row('Page 4, the top of the Instructions page, by option', 'Cut at 620px; the dashed line is the cut, not the page foot.', r4)
    row('Other states', 'No notes prints no empty label and no rule. A version with notes and no steps prints no Instructions at all (page 4 does not exist).', nonotes)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    title = 'C · "Before you start" as its own Sheet section: print (letter portrait; the formula page and the top of the Instructions page)'
    fn = write_board('R35C_BysPrint', title + STAMP_B, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_B[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_B, snap='before-you-start-print')

# the app's own print block, which resolve_media drops (@media print); copied from app.css so the page carries the hand's fallback
from cssscope import _block_end, _strip_comments
def _print_block():
    css = _strip_comments(APPC); i = css.index('@media print'); k = css.index('{', i); m = _block_end(css, k); return css[k + 1:m - 1]
PRINT_APP = _print_block()

# ---- the probe: every panel at natural size, for bys-measure.mjs ------------------------------------------------------------------------------------------------------------
def write_probe():
    css_parts = []; body = ''; y = 0; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-').replace(':', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['css']))
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="position:absolute;left:0;top:{y}px;width:{W}px;"><div style="width:{W}px;">{unique_ids(with_menu(p["html"], W), vid)}</div></div>\n'
        y += 7000
    main = f'<div style="position:relative;width:1400px;height:{y}px;background:#ffffff;">{body}</div>'
    write_board('R35C_BysProbe', 'probe', 1400, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')

build_boards()
print_boards()
write_probe()
json.dump({'boards': ENTRIES_B}, open(OUT + '/bys-canvas-entries.json', 'w'), indent=2)
print('ok bys', {fn: (e['w'], e['h']) for fn, e in ENTRIES_B.items()}, 'measured' if BM else 'not measured yet')
