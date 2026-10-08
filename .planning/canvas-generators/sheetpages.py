import json, re, os, sys, shutil, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart
# Sid, 2026-10-08 (Mark: "draw the real break"; Bishop's audit of sketch 010, gap 2; README D29): the Sheet's real pages for Olive Oil v1, whose Ingredients table does NOT fit one page.
#   python3 sheetpages.py <canvas.json read from the artifact root> <out dir>      writes <out>/project/SheetPrintPage1, SheetPrintPage2 and SheetPrintPage3 .dc.html (the boards) and <out>/sheetpages-verify.html is not written (the verify script builds its own)
#   Before: node sheetpages-measure.mjs <the Sheet board as a standalone file>  (writes sheetpages-measure.json, which this file reads for where the pages break)
# What D-06a and D-06b say, and the app's own print block (app.css `@media print`) does: the table breaks BETWEEN STEP GROUPS only (a group never splits); the header row repeats alone, no "Ingredients, continued";
# the Total (tfoot) goes with the last group and prints once; the Instructions follow the table's tail on the SAME page and run on in whole steps; they open their own page only when the table fits (the variant, MethodPrintPage1 and 2).
# Olive Oil v1's table is 755 px tall and ends 1090.9 px under the content top (content coordinates; the page holds 900 in Safari, 960 in Chrome), so it breaks. The measured break (sheetpages-measure.mjs) is read from sheetpages-measure.json:
#   Safari 630 x 900 (WebKit, primary: Mark's iPad is WebKit): page 1 holds Step 2 and Step 3; page 2 holds Step 6, Step 8 and the Total, Instructions steps 1 to 4; page 3 steps 5 to 10 and the closing foot.
#   Chrome 672 x 960 (Chromium, noted, not drawn): page 1 holds Step 2, Step 3 and Step 6; page 2 Step 8 and the Total, steps 1 to 5; page 3 steps 6 to 10 and the foot.
# Balance (column 2) is taller than the table's first page too (its six gauges and basis note run 830 px from the Ingredients heading's top). D-06a says nothing of it, so it takes the same rule one level down, for Mark's decision (README D29, decide row):
# it breaks between gauges only, no heading again, and its remainder sits in column 2 beside the table's tail.
# A page is the Safari print drawn at its real size: the Sheet is laid out in Safari's 630 x 900 content box (WebKit prints 1 CSS px as 0.8 pt, README D20) and enlarged by 16/15 into the 672 x 960 box the 0.5 in / 0.75 in margins leave on the 816 x 1056 letter page.
# The closing foot (D7, D28) is real markup on page 3: a 1 px ink rule 32 px under step 10, 6 px above one line of 12 px grotesk, letter-spacing 0.02em.
MEAS = json.load(open(HERE + '/sheetpages-measure.json')) if os.path.exists(HERE + '/sheetpages-measure.json') else {}
PRIMARY = 'webkit_safari630'
CODE = 'K7QM-2X9D'    # an example in Crockford's alphabet, as on the route (not Olive Oil v1's real code)
FOOT = 'Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · ' + CODE
VOID = {'br', 'hr', 'img', 'input', 'path', 'line', 'rect', 'circle', 'polygon', 'polyline', 'use', 'stop'}

def elem_end(html, i):
    """Index just past the element whose opening tag starts at html[i]; svg children written <x/> or void names do not count."""
    m = re.match(r'<(\w+)\b[^>]*?(/?)>', html[i:]); tag = m.group(1)
    if m.group(2) or tag in VOID: return i + m.end()
    depth = 1; j = i + m.end()
    for t in re.finditer(r'<(/?)(\w+)\b[^>]*?(/?)>', html[j:]):
        if t.group(2) != tag or t.group(3): continue
        depth += -1 if t.group(1) else 1
        if depth == 0: return j + t.end()
    raise AssertionError('unbalanced ' + tag)

def children(inner):
    """Top-level elements of an inner-HTML string."""
    out = []; i = 0
    while True:
        m = re.compile(r'<\w+').search(inner, i)
        if not m: return out
        e = elem_end(inner, m.start()); out.append(inner[m.start():e]); i = e

def inner(el):
    m = re.match(r'<\w+\b[^>]*>', el); tag = re.match(r'<(\w+)', el).group(1)
    return el[m.end():el.rindex('</' + tag + '>')], el[:m.end()]

def board_parts():
    """The Sheet board's CSS and its article, from printstart.build's own PrintStartingPointBalanceCol2 (byte-identical to the canvas's, checked 2026-10-08)."""
    tmp = tempfile.mkdtemp()
    try:
        canvas = os.environ.get('SHEETPAGES_CANVAS') or sys.argv[1]
        printstart.build(canvas, tmp); s = open(tmp + '/project/PrintStartingPointBalanceCol2.dc.html').read()
    finally: shutil.rmtree(tmp)
    css = re.search(r'<helmet>\s*<style>\n(.*?)\n</style>\s*</helmet>', s, re.S).group(1)
    a = s.index('<article class="recipe-page">'); art = s[a:elem_end(s, a)]
    return css, art

def parse(art):
    ai, _ = inner(art); kids = children(ai); P = {}
    for k in kids:
        c = re.search(r'class="([^"]*)"', k).group(1)
        if c == 'recipe-band': P['band'] = k
        elif c == 'before-region': P['before'] = k
        elif c == 'ingredient-table-region': P['ing'] = k
        elif c == 'method-region': P['method'] = k
        elif c == 'side-region': P['side'] = k
    ing = P['ing']; P['ing_h2'] = re.search(r'<h2 class="region-name">.*?</h2>', ing).group(0)
    P['thead'] = re.search(r'<thead>.*?</thead>', ing, re.S).group(0); P['groups'] = re.findall(r'<tbody>.*?</tbody>', ing, re.S); P['tfoot'] = re.search(r'<tfoot>.*?</tfoot>', ing, re.S).group(0)
    P['table_open'] = re.search(r'<table[^>]*>', ing).group(0)
    me = P['method']; P['m_h2'] = re.search(r'<h2 class="region-name">.*?</h2>', me).group(0); P['steps'] = re.findall(r'<li id="method-step-\d+" class="mp-step">.*?</li>', me, re.S)
    sd = P['side']; P['bal_h2'] = re.search(r'<h2 class="region-name">.*?</h2>', sd).group(0)
    fn = re.search(r'<div class="formulation-note">', sd); fe = elem_end(sd, fn.start()); P['gauges'] = children(inner(sd[fn.start():fe])[0]); P['basis'] = re.search(r'<p class="basis-note">.*?</p>', sd, re.S).group(0)
    assert len(P['groups']) == 4 and len(P['steps']) == 10 and len(P['gauges']) == 6, (len(P['groups']), len(P['steps']), len(P['gauges']))
    assert all(g.startswith('<div class="formulation-note__rule">') for g in P['gauges'])
    return P

def table(P, with_thead, groups, with_tfoot):
    return P['table_open'] + (P['thead'] if with_thead else '') + ''.join(groups) + (P['tfoot'] if with_tfoot else '') + '</table>'
def balance(P, heading, gauges, basis):
    h = P['bal_h2'] if heading else ''
    return ('<div class="side-region"><section class="formulation-note-region" aria-label="Balance">' + h + '<div id="fold-balance"><div class="formulation-note">' + ''.join(gauges) + '</div>'
            + (P['basis'] if basis else '') + '</div></section></div>')
def steps_ol(P, idx): return '<ol class="mp-steps">' + ''.join(P['steps'][i] for i in idx) + '</ol>'
def wrap(body, n):
    return (f'<div class="sp sp-p{n}"><div class="sp-fit"><div class="notebook"><div class="notebook-body"><div class="notebook-body__sheet"><article class="recipe-page">{body}</article></div></div></div></div></div>')

CSS = '''
/* sheetpages.py (README D29): a page of the Sheet as Safari prints it. The Sheet is laid out in Safari's content box (630 x 900: letter less the 0.5 in / 0.75 in margins, with WebKit's 1 CSS px = 0.8 pt) and enlarged by 16/15 into the 672 x 960 box of the 816 x 1056 letter page. */
.sp{box-sizing:border-box;width:816px;height:1056px;padding:48px 72px;background:#ffffff}
.sp-fit{width:630px;height:900px;transform:scale(1.0666667);transform-origin:0 0}
.sp .notebook{padding:0;max-width:none;margin:0}
.sp .recipe-page{box-sizing:border-box;width:630px;padding:0;background:#ffffff}
.sp-p1 .recipe-page{grid-template-areas:'band band' 'before before' 'ingredients side'}
.sp-p2 .recipe-page{grid-template-areas:'ingredients side' 'method method'}
.sp-p3 .recipe-page{grid-template-areas:'method method'}
.sp .mp-foot{margin-top:var(--gap-l);padding-top:var(--gap-xs);border-top:var(--rule-ink-field) solid var(--sheet-ink);font-family:var(--face-grotesk);font-size:var(--sheet-size-small-print);letter-spacing:0.02em;color:var(--sheet-ink)}
'''
T1 = 'Sheet page 1 · formula: Before you start, Ingredients to Step 3, Balance (Olive Oil v1 as Safari prints it; approved)'
T2 = 'Sheet page 2 · the table\'s tail, Balance\'s end, Instructions 1 to 4 (as Safari prints it; approved)'
T3 = 'Sheet page 3 · Instructions 5 to 10 and the closing foot (as Safari prints it; approved)'

def plan():
    """Where the pages break, from the WebKit-at-Safari-width measurement."""
    m = MEAS.get(PRIMARY)
    if not m: return dict(groups=2, gauges=4, steps=[list(range(0, 4)), list(range(4, 10))])      # the first pass, before the measurement exists
    sp = [[int(x) - 1 for x in range(int(a), int(b) + 1)] for a, b in (p.split('-') for p in m['stepPages'])]
    assert len(sp) == 2, 'the real break is meant to give three pages: ' + str(m['stepPages'])
    return dict(groups=m['groupsOnPage1'], gauges=m['gaugesOnPage1'], steps=sp)

def pages(P, pl):
    k, g = pl['groups'], pl['gauges']
    p1 = (P['band'] + P['before'] + '<section class="ingredient-table-region" aria-label="Ingredients">' + P['ing_h2'] + table(P, True, P['groups'][:k], False) + '</section>'
          + balance(P, True, P['gauges'][:g], False))
    p2 = ('<section class="ingredient-table-region" aria-label="Ingredients">' + table(P, True, P['groups'][k:], True) + '</section>' + balance(P, False, P['gauges'][g:], True)
          + '<section class="method-region" aria-label="Instructions">' + P['m_h2'] + steps_ol(P, pl['steps'][0]) + '</section>')
    p3 = '<section class="method-region" aria-label="Instructions">' + steps_ol(P, pl['steps'][1]) + f'<div class="mp-foot">{FOOT}</div></section>'
    return [wrap(p1, 1), wrap(p2, 2), wrap(p3, 3)]

def build(canvas_in, out):
    os.makedirs(out + '/project', exist_ok=True); os.environ['SHEETPAGES_CANVAS'] = canvas_in
    css, art = board_parts(); P = parse(art); pl = plan(); sizes = {}
    for n, (body, t) in enumerate(zip(pages(P, pl), (T1, T2, T3)), 1):
        fn = 'SheetPrintPage%d' % n
        open(out + '/project/%s.dc.html' % fn, 'w').write(printstart.board(t, body, 816, 1056, css + CSS, paper=True)); sizes[fn] = (816, 1056, t)
    return sizes, pl

if __name__ == '__main__':
    s, pl = build(sys.argv[1], sys.argv[2]); print({k: v[:2] for k, v in s.items()}, pl)
