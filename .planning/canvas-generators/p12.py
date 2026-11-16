# Sid, 2026-11-15 (Phase 12 Gate 1; 12-CONTEXT.md D-01, D-02, D-06, D-07, D-15 to D-17; Mark answered the four Gate 1 rows the same day, snapshot 015 by snapshot015.py; the printed Low to high row's redraw awaits look-p12-printed-row-ends-only): a recipe's own scales and problems on the record pen, the reading and the printed logs.
#   P12_Pen        the record pen's tasting, the scales and Any problems?, at the 350 column and at 393
#   P12_Reading    the reading's Tasting fold, at the 350 column and at 393
#   P12_ReadBack   what a marked Low to high scale says back: three candidates side by side (decide-p12-low-to-high-read-back)
#   P12_Logs       the printed Batch log and Tasting log, letter, starting 1.5 in from the top of the paper (the clipboard margin)
#   P12_LogLines   the Tasting log's notes at 4 lines and at 5 (decide-p12-tasting-log-lines)
# Three recipes: "two" declares Body (Right in the middle) and Coffee flavour (Low to high) and the problems Bitter and Burnt taste; "one" declares Mint (Low to high) and Waxy chips;
# "none" is Mexican Chocolate v1 as seeded, which declares nothing and so shows no "This recipe only" cue anywhere. The example words are Sid's, not Mark's and not in the data.
# Every panel is the built app's own markup (p12-capture.mjs: WebKit, coarse, app/dist of 2026-11-15, the example recipes written into that context's throwaway IndexedDB) under the app's
# own stylesheets resolved at 1366 coarse and 393 coarse (a canvas artboard gets no narrow viewport), with only the Low to high scale drawn over it:
#   pen      D-01: the anchors line reads the low word and the high word, no "right"; the five numbered stops are as built; the stops' names for a screen reader are "1: faint", "2", "3", "4", "5: strong".
#            The end words stay UNDER stops 1 and 5 (not inside them): a built stop is 44 x 44 at 14 px and "strong" alone measures 43, so a word in the cell does not fit a longer label.
#   reading  D-02, the drawn candidate A: the end word with its number at 1 and 5, "n of 5" between (READBACK below); P12_ReadBack draws A, B and C.
#   print    D-01 as Mark amended it on look-p12-printed-logs ("The 2 3 4 under their ticks are not required"): the row keeps low word, 1, the rule with its five ticks, 5, high word, and nothing stands
#            under the ticks: no "right", no 2 3 4. The five bare ticks stay, as on every scale (they are where the mark goes). The row stays 36 px, in step with the other scales
#            (D19): with nothing in the grid's second line a bare row measures 25 px (WebKit and Chrome), so print_css gives every scale's second line the height "right" has today (small print, set solid:
#            12 px). One rule on .lf-sc, no new class; a Right in the middle row measures the same 36 with it.
#   print    D-15 to D-17: the two log pages start 1.5 in from the paper's top (0.5 in page margin plus a 1 in drop, the proposed token --sheet-print-clipboard-drop: the named exception is the
#            clipboard clip on the two pages written at the bench; 96 px here, 90 px in WebKit print where 1 CSS px is 0.8 pt). The room comes out of the notes lines: LINES below.
# Printed pages carry no "Every recipe" / "This recipe only" cue (sketch 010 D23), so the "none" Tasting log differs only by having four scales and four problems.
#   node p12-capture.mjs ; python3 p12.py measure <out> ; node p12-measure.mjs <out>/measure.html ; python3 p12.py <canvas.json read from the artifact root> <out>
import json, os, re, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, resolve_media, scope_css, unique_ids, _strip_comments, _block_end, APP_ROOT
import printstart
CAP = json.load(open(HERE + '/p12-capture.json'))
M = json.load(open(HERE + '/p12-measure.json')) if os.path.exists(HERE + '/p12-measure.json') else {}
esc = lambda s: _html.escape(str(s), quote=True)
PRINTC = open(os.path.join(APP_ROOT, 'print.css')).read()

CASES = {   # the Low to high scales of each example: key -> (name, low, high); the stop each reading stores
    'two': dict(name='Coffee', mag={'coffee': ('Coffee flavour', 'faint', 'strong')}, stored={'coffee': 2}, foot='Coffee · Version 1 · [Sheet code]',
                says='Body is Right in the middle, Coffee flavour is Low to high; problems Bitter and Burnt taste'),
    'one': dict(name='Mint chip', mag={'mint': ('Mint', 'faint', 'strong')}, stored={'mint': 5}, foot='Mint chip · Version 1 · [Sheet code]',
                says='Mint is Low to high; problem Waxy chips'),
    'none': dict(name='Mexican Chocolate', mag={}, stored={}, foot=None, says='no scale and no problem of its own'),
}
LINES = {'batch': 13, 'tasting': 4}      # notes lines left once the pages start 1.5 in down (built: 14 and 5); the Tasting log's count is Mark's to decide (P12_LogLines)
DROP = 96                                # the clipboard drop on the page picture, 1 in at 96 px; WebKit print needs 90 px for the same inch

def READBACK(cand, low, high, n):
    """What a marked Low to high scale says back on the reading (D-02). A is drawn on P12_Reading."""
    if cand == 'B': return f'{n} of 5'
    if cand == 'A': return f'{low} (1)' if n == 1 else f'{high} (5)' if n == 5 else f'{n} of 5'
    return f'{low} ({n})' if n <= 2 else f'{high} ({n})' if n >= 4 else '3 of 5'      # C: the nearer end word, the middle its number

def div_end(h, a):
    d = 0
    for m in re.finditer(r'<div\b|</div>', h[a:]):
        d += -1 if m.group(0) == '</div>' else 1
        if d == 0: return a + m.end()

# ---- the pen and the reading -------------------------------------------------------------------------------------------------------------------------------------------------
def pen(case, W):
    h = printstart.drop_hidden(CAP[f'{case}_pen_{W}']['html'])
    for key in CASES[case]['mag']:
        a = h.index(f'<div class="axis-mark axis-mark--declared"><div class="axis-mark__head"><span id="axis-name-{key}"'); b = div_end(h, a); seg = h[a:b]
        seg = re.sub(r'aria-label="([2-4]): [^"]*"', r'aria-label="\1"', seg); assert '<span>right</span>' in seg
        h = h[:a] + seg.replace('<span>right</span>', '') + h[b:]
    return h

def reading(case, W, cand='A', stops=None):
    h = printstart.drop_hidden(CAP[f'{case}_read_{W}']['html'])
    for key, (name, low, high) in CASES[case]['mag'].items():
        n = (stops or CASES[case]['stored'])[key]
        pat = re.compile(r'(<span class="batch-row__cell-label">%s</span><span class="batch-row__cell-value">)[^<]*(</span>)' % re.escape(name)); assert pat.search(h), name
        h = pat.sub(lambda m: m.group(1) + READBACK(cand, low, high, n) + m.group(2), h, count=1)
    return h

def wrap(html): return '<div class="notebook" style="padding:0;max-width:none;display:block">' + html + '</div>'
def panel_css():
    css = [printstart.FONT, resolve_media(TOK, 1366, True), NOTE_CSS]
    for W in (1366, 393):
        pc = resolve_media(TOK, W, True) + resolve_media(APPC, W, True) + resolve_media(NBC, W, True); pc = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', pc)
        css.append(scope_css(pc, f'.p12w-{W}'))
    return ''.join(css)

NOTE_CSS = '''
.dl-wrap{font-family:var(--face-grotesk);color:#141414}
.dl-title{font-size:20px;line-height:26px;font-weight:600;margin:0}
.dl-sub{font-size:15px;line-height:21px;color:#595959;margin:4px 0 0}
.dl-cap{font-family:var(--face-grotesk);font-size:15px;line-height:21px;font-weight:600;margin:0;color:#141414}
.dl-cap small{display:block;font-weight:400;font-size:13px;line-height:18px;color:#595959}
.dl-page{box-sizing:border-box;position:relative;background:#ffffff;box-shadow:0 0 0 1px #c9c9c4}
.dl-clip{position:absolute;left:-18px;top:0;width:4px;background:#7a2e8e}
.dl-cliplab{position:absolute;left:-74px;font-family:var(--face-grotesk);font-size:12px;line-height:1.2;font-weight:600;color:#7a2e8e;white-space:nowrap;width:50px;text-align:right}
.dl-mk{font-family:var(--face-grotesk);font-size:12px;line-height:16px;font-weight:600;color:#595959;margin:0 0 4px}
.fp-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''

PANELS = []      # the app panels, measured at their natural size by p12-measure.mjs (crop: the element the window shows)
def P(pid, W, html, crop, cap, sub): PANELS.append(dict(pid=pid, W=W, html=wrap(html), crop=crop, cap=cap, sub=sub)); return PANELS[-1]
def win(p):
    m = M.get(p['pid'], {}); top, hh = m.get('cropTop', 0), m.get('cropH', 900); ww = 350 if p['W'] == 1366 else 393
    return ww, hh, f'<div class="fp-win p12w-{p["W"]}" style="width:{ww}px;height:{hh}px"><div style="width:{ww}px;transform:translateY(-{top}px)">{unique_ids(p["html"], p["pid"])}</div></div>'

def flow(head, sub, rows, gap=64, capw=None, PAD=48):
    """Rows of captioned cells. A cell is (width, height, html, cap, sub). Returns (body html, board width, board height)."""
    y = 48; body = f'<div class="dl-wrap" style="position:absolute;left:{PAD}px;top:{y}px;width:1500px"><p class="dl-title">{esc(head)}</p><p class="dl-sub">{sub}</p></div>'; y += 120; bw = 1600
    for title, desc, cells in rows:
        if title:
            body += f'<div class="dl-wrap" style="position:absolute;left:{PAD}px;top:{y}px;width:1500px"><p class="dl-cap" style="font-size:17px;line-height:23px">{esc(title)}<small style="font-size:14px;line-height:20px">{desc}</small></p></div>'; y += 84
        x = PAD; LABH = 104; rowh = max(c[1] for c in cells)
        for w, h, html, cap, s in cells:
            cw = capw or max(w, 350)
            body += f'<div style="position:absolute;left:{x}px;top:{y}px;width:{cw}px"><div style="height:{LABH}px"><p class="dl-cap">{esc(cap)}<small>{s}</small></p></div>{html}</div>\n'
            x += max(w, cw) + gap
        bw = max(bw, x - gap + PAD); y += LABH + rowh + 72
    return body, int(bw), int(y)

PEN_SUB = {'two': 'Coffee flavour is Low to high: its end words stand under 1 and 5 and nothing stands under 3. Body is Right in the middle and keeps "right". Two problem chips under their own cue.',
           'one': 'One scale, Low to high, and one problem chip, each under "This recipe only".',
           'none': 'No scale and no problem of its own: no "This recipe only" cue, on the scales or on the problems.'}
READ_SUB = {'two': 'Body reads its word and number as built. Coffee flavour, marked 2, reads "2 of 5" (candidate A; see P12_ReadBack).',
            'one': 'Mint, marked 5, reads its high word and number, "strong (5)".',
            'none': 'Nothing of its own stored: only "Every recipe" shows.'}

def build_pen():
    rows = []
    for W, lab in ((1366, 'At 1366, the 350 column'), (393, 'At 393')):
        cells = []
        for case in ('two', 'one', 'none'):
            p = P(f'pen-{case}-{W}', W, pen(case, W), 'axes-grid', CASES[case]['name'], PEN_SUB[case]); cells.append((*win(p), p['cap'], p['sub']))
        rows.append((lab, 'The pen from Record another with Add tasting pressed, cut to the scales and Any problems?. Some stops and chips are marked.', cells))
    return flow("Record pen · a recipe's own scales and problems", 'Phase 12 Gate 1. Built markup; only the Low to high scale is drawn over it. Not approved yet.', rows)

def build_reading():
    rows = []
    for W, lab in ((1366, 'At 1366, the 350 column'), (393, 'At 393')):
        cells = []
        for case in ('two', 'one', 'none'):
            p = P(f'read-{case}-{W}', W, reading(case, W), 'tasting-reading', CASES[case]['name'], READ_SUB[case]); cells.append((*win(p), p['cap'], p['sub']))
        rows.append((lab, 'A recorded batch, its Tasting fold open. The reading lists only what was marked or ticked.', cells))
    return flow("Reading · a recipe's own scales and problems", 'Phase 12 Gate 1. Built markup; only what the Low to high scale says back is drawn over it. Not approved yet.', rows)

CANDS = [('A', 'A · end word at 1 and 5, number between (drawn on the Reading board)', 'Says back exactly what the stop said on the pen: a word where the pen had a word, a number where it had a number.'),
         ('B', 'B · always the number of five', 'One form for every stop. The end words never show on the reading.'),
         ('C', 'C · nearer end word, middle as a number', 'As the build reads today but for the middle. Marked 2 reads "faint (2)", though the pen never called stop 2 faint.')]
def strip(cand):
    """The five read-backs of one scale, each as the reading's own cell (label and value), in a design-time row."""
    cells = ''.join(f'<div style="flex:1"><p class="dl-mk">marked {n}</p><div class="batch-row__cell"><span class="batch-row__cell-label">Coffee flavour</span><span class="batch-row__cell-value">{READBACK(cand, "faint", "strong", n)}</span></div></div>' for n in range(1, 6))
    return f'<div class="notebook-log"><section class="batch-row" style="margin:0;padding:0;border:0"><div class="batch-margin" style="margin:0;padding:0;border:0"><section class="tasting-reading" style="margin:0;padding:0;border:0"><div class="tasting-reading__group" style="margin:0;padding:0;border:0"><div style="display:flex;gap:16px;padding:16px">{cells}</div></div></section></div></section></div>'
def build_readback():
    r1, r2 = [], []
    for cand, cap, sub in CANDS:
        r1.append((760, 92, f'<div class="fp-win p12w-1366" style="width:760px;height:92px">{wrap(strip(cand))}</div>', cap, sub))
        p = P(f'rb-{cand}', 1366, reading('two', 1366, cand), 'tasting-reading', f'{cand} · in the reading, Coffee flavour marked 2', 'Beside Body, a Right in the middle scale, which reads "heavy (4)".'); r2.append((*win(p), p['cap'], p['sub']))
    return flow('What a marked Low to high scale says back on the reading', 'Phase 12 Gate 1, for decide-p12-low-to-high-read-back. Coffee flavour runs faint to strong. The other kind of scale reads "soft (2)", "right (3)"; that does not change.',
                [('The same scale marked 1 to 5', 'Each cell is the reading\'s own cell. The grey "marked n" line is a note, not in the app.', r1), ('In the reading', '', r2)], capw=760)

# ---- the printed logs -------------------------------------------------------------------------------------------------------------------------------------------------------
def print_css():
    css = _strip_comments(PRINTC); i = css.index('@page'); css = css[:i] + css[_block_end(css, css.index('{', i)):]
    return (printstart.FONT + resolve_media(TOK, 816, False) + resolve_media(APPC, 816, False) + resolve_media(NBC, 816, False) + resolve_media(css, 816, False) + NOTE_CSS + '''
:root{--sheet-print-clipboard-drop:96px}
.p12-clip .print-page--log{padding-top:calc(var(--sheet-print-margin-y) + var(--sheet-print-clipboard-drop))}
.lf-sc{grid-template-rows:auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid))}
''')

def log_page(case, side, drawn=True, lines=None):
    """One log page of the print route: side 0 the Batch log, side 1 the Tasting log. drawn=False is the build's own page, untouched."""
    h = CAP[f'{case}_print']['pages'][side]
    if CASES[case]['foot']: h = re.sub(r'(<div class="lf-foot">).*?( · Side)', lambda m: m.group(1) + CASES[case]['foot'] + m.group(2), h, count=1)
    if not drawn: return h
    for name, low, high in (CASES[case]['mag'].values() if side else ()):
        a = h.index(f'<div class="lf-srow"><span class="axis-mark__name">{name}</span>'); b = div_end(h, a); seg = h[a:b]; mid = '<span class="lf-anchor lf-mid">right</span>'; assert mid in seg
        h = h[:a] + seg.replace(mid, '') + h[b:]
    n = lines or LINES['tasting' if side else 'batch']
    return re.sub(r'(<div class="lf-lines">)(?:<div class="lf-line"></div>)+', lambda m: m.group(1) + '<div class="lf-line"></div>' * n, h, count=1)

PAGES = []      # every drawn page, measured by p12-measure.mjs at Safari's and Chrome's content widths
def page_cell(pid, case, side, drawn=True, lines=None, cap='', sub=''):
    h = log_page(case, side, drawn, lines); PAGES.append(dict(pid=pid, html=h, drawn=drawn))
    clip = f'<div class="dl-clip" style="height:{48 + DROP}px"></div><div class="dl-cliplab" style="top:{(48 + DROP) // 2 - 14}px">1.5 in<br>clip</div>' if drawn else '<div class="dl-clip" style="height:48px;background:#595959"></div><div class="dl-cliplab" style="top:17px;color:#595959">0.5 in</div>'
    inner = f'<div class="notebook print-route{" p12-clip" if drawn else ""}" style="padding:0;max-width:none;display:block"><div class="print-route__pages" style="--sheet-print-picture-scale:1"><div class="print-route__picture" style="outline:none">{h}</div></div></div>'
    return (816, 1056, f'<div class="dl-page" style="width:816px;height:1056px">{clip}{inner}</div>', cap, sub)

def fit(pid):
    m = M.get(pid)
    if not m: return ''
    s, c = m['safari'], m['chrome']; d = m['drawn']
    return (f'{m["lines"]} notes lines. Safari: needs {s["total"]:g} of {900 - (90 if d else 0)} px, {s["spare"]:g} spare. Chrome: {c["spare"]:g} spare.')

def build_logs():
    r0 = [page_cell('built-batch', 'two', 0, False, cap='As built today · Batch log', sub='Starts 0.5 in from the top of the paper. @@built-batch@@'),
          page_cell('built-tasting-two', 'two', 1, False, cap='As built today · Tasting log · Coffee', sub='Coffee flavour, a Low to high scale, prints "right" under its middle tick (the bug). @@built-tasting-two@@')]
    r1 = [page_cell('batch', 'two', 0, cap='Batch log · the same page for every recipe but its foot', sub='Starts 1.5 in down. One notes line fewer than today; nothing else moves or shrinks. @@batch@@'),
          page_cell('tasting-two', 'two', 1, cap='Tasting log · Coffee · two scales and two problems of its own', sub='Coffee flavour: faint, 1, the rule with its five ticks, 5, strong. Nothing under the ticks: no "right", no 2 3 4. Six scales, six problems. @@tasting-two@@'),
          page_cell('tasting-one', 'one', 1, cap='Tasting log · Mint chip · one scale and one problem of its own', sub='Five scales, five problems. @@tasting-one@@'),
          page_cell('tasting-none', 'none', 1, cap='Tasting log · Mexican Chocolate · none of its own', sub='Four scales, four problems, as every recipe has. @@tasting-none@@')]
    return flow('Printed logs · own scales and problems, and the clipboard margin', 'Phase 12 Gate 1. Letter pages at full size. The purple bar beside a page marks the 1.5 in the clip covers; it is a note and does not print. The printed pages carry no "This recipe only" cue (as approved in sketch 010). Redrawn 2026-11-15 for Mark\'s note on look-p12-printed-logs: a Low to high scale has nothing under its ticks.',
                [('As built today, for comparison', 'The build\'s own print route, 2026-11-15.', r0), ('Drawn: 1.5 in clear at the top, the room taken from the notes lines', 'The bench sheet pages are not drawn here: they keep 0.5 in.', r1)], gap=110, capw=780, PAD=110)

def build_loglines():
    r = [page_cell('lines-4', 'two', 1, lines=4, cap='4 lines (drawn on the Logs board)', sub='Holds one page even when two long problem names wrap the problems row onto a second line (about 26 px). @@lines-4@@'),
         page_cell('lines-5', 'two', 1, lines=5, cap='5 lines (as today)', sub='Fits only just in Safari. Longer problem names that wrap the row would push the foot to a second sheet. @@lines-5@@')]
    return flow('Tasting log · how many notes lines once the page starts 1.5 in down', 'Phase 12 Gate 1, for decide-p12-tasting-log-lines. The fullest page: two scales and two problems of its own. The Batch log has no choice to make: 13 lines fit, 14 do not.', [('', '', r)], gap=110, capw=780, PAD=110)

TITLES = {'P12_Pen': "Record pen · a recipe's own scales and problems, each kind and none · 350 and 393 (2026-11-15; proposed)",
          'P12_Reading': "Reading · a recipe's own scales and problems, each kind and none · 350 and 393 (2026-11-15; proposed)",
          'P12_ReadBack': 'What a marked Low to high scale says back · three candidates (2026-11-15; for Mark to pick)',
          'P12_Logs': 'Printed Batch log and Tasting log · own scales and problems · 1.5 in clipboard margin (2026-11-15; redrawn the same day: nothing under a Low to high scale\'s ticks)',
          'P12_LogLines': 'Tasting log · 4 notes lines or 5 under the clipboard margin (2026-11-15; Mark picked 4; redrawn the same day: nothing under a Low to high scale\'s ticks)'}

def build_boards(out):
    sizes = {}
    for key, fn, css, paper in (('P12_Pen', build_pen, panel_css, False), ('P12_Reading', build_reading, panel_css, False), ('P12_ReadBack', build_readback, panel_css, False), ('P12_Logs', build_logs, print_css, True), ('P12_LogLines', build_loglines, print_css, True)):
        body, w, h = fn(); body = re.sub(r'@@([\w-]+)@@', lambda m: fit(m.group(1)), body)
        main = f'<div style="position:relative;width:{w}px;height:{h}px;background:{"#eceae4" if paper else "#ffffff"}">{body}</div>'
        open(f'{out}/project/{key}.dc.html', 'w').write(printstart.board(TITLES[key], main, w, h, css() + '[hidden]{display:none !important}')); sizes[key] = (w, h)
    return sizes

def measure_html():
    pb = ''.join(f'<div data-pid="{p["pid"]}" data-crop="{p["crop"]}" class="fp-win p12w-{p["W"]}" style="display:none;position:absolute;left:0;top:0;width:{350 if p["W"] == 1366 else 393}px"><div>{unique_ids(p["html"], p["pid"])}</div></div>\n' for p in PANELS)
    pg = ''.join(f'<div data-page="{p["pid"]}" data-drawn="{int(p["drawn"])}" class="notebook print-route" style="display:none;padding:0;max-width:none"><div class="print-route__pages" style="--sheet-print-picture-scale:1">{p["html"]}</div></div>\n' for p in PAGES)
    doc = '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s</style></head><body>%s</body></html>'
    return doc % (panel_css(), pb), doc % (print_css(), pg)

if __name__ == '__main__':
    out = sys.argv[2]; os.makedirs(out + '/project', exist_ok=True)
    if sys.argv[1] == 'measure':
        build_boards(out); a, b = measure_html(); open(out + '/measure.html', 'w').write(a); open(out + '/measure-print.html', 'w').write(b); print(len(PANELS), 'panels', len(PAGES), 'pages')
    else:
        c = json.load(open(sys.argv[1])); sizes = build_boards(out); B = c['boards']; N = c['notes']; PAGE = ('page-26', "Phase 12 own scales and problems (Gate 1)")      # page-25 is Alternates (the first publish stacked these boards on it; moved to page-26 at canvas version 503)
        if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(0, {'id': PAGE[0], 'name': PAGE[1]})      # pages newest first
        x = 0
        for key, (w, h) in sizes.items():
            fn = key + '.dc.html'; B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h, 'title': TITLES[key]}
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + w + 240
        N['p12-title'] = {**dict(x=0, y=-300, maxW=x), **N.get('p12-title', {}), **dict(text="Phase 12 Gate 1: a recipe's own scales and problems on the pen, the reading and the printed logs", kind='title1', page=PAGE[0])}      # a placed title keeps its place
        json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
