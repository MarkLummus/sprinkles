# Sid, 2026-10-07 (rows draw-hole-punch-left-margin, draw-remove-draw-temp-rename-logs, draw-method-print-treatment; README D16, D17, D18): prepares the changed boards for the three print redraws of the day,
# from a canvas.json read from the artifact root just before publishing. Only the boards a stage changes are written, plus canvas.json (the index keeps every other board, note and key as read).
#   python3 p4print-canvas.py <stage> <canvas.json as read from the root> <out dir>
#   stage t1  D16, the hole-punch margin: BatchLogForm, TastingLogForm, PrintStartingPointBalanceCol2, and the new HolePunchCheck (the log sheet with the punch holes drawn on, front and back)
#   stage t2  D17, no Time to draw temp., the logs renamed: BatchLogForm, TastingLogForm, MarkOnePenStates, MarkOnePenWhole, MarkOneReading (the pen boards come from markone.py)
#   stage t3  D18, the method on paper: the method boards on their own page "Print method"
#   stage t4  D19, the notes section and the groups set apart on the two log pages (and the punch check)
#   stage t5  D20, 0.75 in at the left AND the right of every page: the log pages (page 2 refitted), the alternative page 2 with one rule per scale, the Sheet, the method pages, the punch check. A board keeps the x and y it has on the canvas.
#   stage t6  D21, the log pages' titles at 32 px / 700 and each scale as one rule with five ticks above it: BatchLogForm, TastingLogForm, HolePunchCheck; TastingLogFormRule (the boxes-or-rule alternative) is removed
#   stage t9  D24, page 2 at 5 writing lines (Mark's answer on decide-page-2-lines-after-cues): TastingLogForm, HolePunchCheck
#   stage t8  D23, page 2 at 4 lines and without the Every recipe / This recipe only cues (Mark's answers on the rhythm review): TastingLogForm, HolePunchCheck
#   stage t10  D18 on the Sheet (2026-10-08, Mark's List row look-sketch-010-snapshot-contract): the Sheet board's Instructions carry the method treatment (Why, aside callout, tag row), and its note: PrintStartingPointBalanceCol2 only
#   stage t11  D29 (2026-10-08, Mark: "draw the real break"): the Sheet's real pages for Olive Oil v1 (SheetPrintPage1 to 3, sheetpages.py) on the Print method page, MethodPrintPage1 and 2 retitled as the table-fits variant, and the notes that say so (the route boards come from phase4screens.py)
#   stage t7  D22, the rhythm review of the printed pages as one set: BatchLogForm, TastingLogForm (section heads 14 px, 32 px above every section, the sub-group cues in the app's group-cue face, a 2 px guard at the right for WebKit's print), HolePunchCheck
# Each stage writes everything the earlier stages changed too, from the generators' current state, so a later stage is a superset; publish only what the stage names.
import json, os, sys, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart, logforms
stage, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out + '/project', exist_ok=True)
c = json.load(open(src)); B = c['boards']; N = c['notes']

def log_boards():
    fcss = logforms.css()
    open(out + '/project/BatchLogForm.dc.html', 'w').write(printstart.board(printstart.T_F1, logforms.side1(*logforms.LINES['side1']), 816, 1056, fcss, paper=True))
    open(out + '/project/TastingLogForm.dc.html', 'w').write(printstart.board(printstart.T_F2, logforms.side2(*logforms.LINES['side2']), 816, 1056, fcss, paper=True))
    B['BatchLogForm.dc.html']['title'] = printstart.T_F1
    B['TastingLogForm.dc.html']['title'] = printstart.T_F2

def sheet_board():
    tmp = out + '/_full'
    printstart.build(src, tmp)                       # writes every starting-point board; only the chosen one is taken
    shutil.copy(tmp + '/project/PrintStartingPointBalanceCol2.dc.html', out + '/project/PrintStartingPointBalanceCol2.dc.html')
    h_c = printstart.MEASURE.get('boardH_col2', 4000)
    B['PrintStartingPointBalanceCol2.dc.html'].update(h=h_c, title=printstart.T_C)
    N['balance-col2-note'].update(y=h_c + 80)
    shutil.rmtree(tmp)
    return h_c

# the log sheet with the punch holes drawn on: front (holes at the left edge) and the back of the same sheet turned like a page (holes at the right edge). The discs are a guide, not part of the page.
def hole_check():
    fcss = logforms.css()
    def disc(x, y): return f'<div style="position:absolute;left:{x - 13.44:.2f}px;top:{y - 13.44:.2f}px;width:26.88px;height:26.88px;box-sizing:border-box;border-radius:50%;background:#dddddd;border:1px solid #888888"></div>'
    def frame(page, edge, cap):
        x = 48 if edge == 'left' else 816 - 48                       # 0.5 in from the punched edge
        holes = ''.join(disc(x, inch * 96) for inch in (1.25, 5.5, 9.75))   # 4.25 in apart, the middle one on the sheet's centre
        return (f'<div style="width:816px"><p style="margin:0 0 12px;font-family:var(--face-grotesk);font-size:14px;line-height:1.4;color:#141414">{cap}</p>'
                f'<div style="position:relative;width:816px;height:1056px">{page}{holes}</div></div>')
    body = ('<div style="display:flex;gap:80px;align-items:flex-start">'
            + frame(logforms.side1(*logforms.LINES['side1']), 'left', 'Front, page 1. The grey discs are the punch holes (0.28 in across, centred 0.5 in from the edge, 4.25 in apart). They are a guide and do not print.')
            + frame(logforms.side2(*logforms.LINES['side2']), 'right', 'Back of the same sheet, page 2, turned like a page. The punched edge is now on the right' + (', and the ink stops 0.75 in from it, as at the left (D20).' if stage in ('t5', 't6', 't7', 't8', 't9') else ', where the ink runs to 0.5 in from the edge.'))
            + '</div>')
    W, H = 816 * 2 + 80, 1056 + 12 + 56
    open(out + '/project/HolePunchCheck.dc.html', 'w').write(printstart.board('Punch check · the log sheet with the holes drawn on, front and back (D20, awaiting Mark)' if stage in ('t5', 't6', 't7', 't8', 't9') else 'Punch check · the log sheet with the holes drawn on, front and back (D16, awaiting Mark)', body, W, H, fcss, paper=True))
    ttl = 'Punch check · the log sheet with the holes drawn on, front and back (D24, awaiting Mark)' if stage == 't9' else 'Punch check · the log sheet with the holes drawn on, front and back (D23, awaiting Mark)' if stage == 't8' else 'Punch check · the log sheet with the holes drawn on, front and back (D22, awaiting Mark)' if stage == 't7' else 'Punch check · the log sheet with the holes drawn on, front and back (D21, awaiting Mark)' if stage == 't6' else 'Punch check · the log sheet with the holes drawn on, front and back (D20, awaiting Mark)' if stage == 't5' else 'Punch check · the log sheet with the holes drawn on, front and back (D16, awaiting Mark)'
    B['HolePunchCheck.dc.html'] = {**dict(x=0, y=1900), **B.get('HolePunchCheck.dc.html', {}), 'w': W, 'h': H, 'page': 'page-11', 'title': ttl}
    if 'HolePunchCheck.dc.html' not in c['order']: c['order'].append('HolePunchCheck.dc.html')
    return H

if stage in ('t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'):
    log_boards()
def pen_boards():
    import markone
    sizes = markone.build(out + '/project')
    x = 5440
    for key, (w, h, title) in sizes.items():
        fn = key + '.dc.html'; B[fn] = dict(B.get(fn, {}), x=x, y=0, w=w, h=h, page='page-11', title=title)
        if fn not in c['order']: c['order'].append(fn)
        x += w + 80
    N['markone-note'].update(y=sizes['MarkOnePenStates'][1] + 80)
    return sizes

if stage == 't2':
    H = hole_check(); sizes = pen_boards()
    T = json.load(open(HERE + '/p4print-notes.json'))
    N['logpages-note'].update(text=T['t2']['logpages']); N['markone-note'].update(text=T['t2']['pen'])
    N['holecheck-note'].update(y=1900 + H + 80)
def method_boards():
    import method
    sizes, pages, used = method.build(out + '/project')
    PG = 'page-17'
    if not any(p['id'] == PG for p in c['pages']):
        i = [p['id'] for p in c['pages']].index('page-11'); c['pages'].insert(i + 1, {'id': PG, 'name': 'Print method'})
    x = 0
    for key, (w, h, title) in sizes.items():
        fn = key + '.dc.html'; B[fn] = {**dict(x=x, y=0), **B.get(fn, {}), 'w': w, 'h': h, 'page': PG, 'title': title, 'paper': 'letter'}
        if key == 'MethodPrintAsBuilt': B[fn]['print'] = 'flow'
        if fn not in c['order']: c['order'].append(fn)
        x += w + 80
    N['method-title'] = dict(N.get('method-title', {}), x=0, y=-300, text='The method on paper', kind='title1', maxW=x - 80, page=PG)
    N['method-note'] = dict({**dict(x=x, y=0), **N.get('method-note', {})}, fill='gray', page=PG, w=440, maxH=1500, text=json.load(open(HERE + '/p4print-notes.json'))['t5' if stage == 't5' else 't3']['method'])
    return sizes

if stage == 't4':
    H = hole_check()
    N['logpages-note'].update(text=json.load(open(HERE + '/p4print-notes.json'))['t4']['logpages'])
    N['holecheck-note'].update(y=1900 + H + 80)
if stage == 't3':
    method_boards()

# D20: the alternative page 2, one rule with five ticks per scale instead of five boxes (Mark's note on decide-page-2-notes-lines, which the first reading did not use), beside the punch check's column
def alt_board():
    fn = 'TastingLogFormRule.dc.html'; t = 'Page 2 · back: Tasting log, ALTERNATIVE with one rule per scale (D20; awaiting Mark)'
    open(out + '/project/' + fn, 'w').write(printstart.board(t, logforms.side2(*logforms.LINES['side2r'], rule=True), 816, 1056, logforms.css(), paper=True))
    B[fn] = {**dict(x=896, y=3104), **B.get(fn, {}), 'w': 816, 'h': 1056, 'page': 'page-11', 'paper': 'letter', 'title': t}
    if fn not in c['order']: c['order'].append(fn)

if stage == 't5':
    sheet_board(); alt_board(); H = hole_check(); method_boards()
    T = json.load(open(HERE + '/p4print-notes.json'))['t5']
    N['logpages-note'].update(text=T['logpages']); N['balance-col2-note'].update(text=T['sheet'])
    N['holecheck-note'].update(text=T['check'], y=B['HolePunchCheck.dc.html']['y'] + H + 80)
if stage == 't6':
    H = hole_check()
    B.pop('TastingLogFormRule.dc.html', None)
    if 'TastingLogFormRule.dc.html' in c['order']: c['order'].remove('TastingLogFormRule.dc.html')
    T = json.load(open(HERE + '/p4print-notes.json'))['t6']
    N['logpages-note'].update(text=T['logpages']); N['holecheck-note'].update(text=T['check'])
if stage == 't1':
    h_c = sheet_board(); H = hole_check()
    T = json.load(open(HERE + '/p4print-notes.json'))['t1']
    N['logpages-note'].update(text=T['logpages'])
    N['balance-col2-note'].update(text=T['sheet'])
    N['holecheck-note'] = dict(N.get('holecheck-note', {}), fill='gray', page='page-11', w=640, maxH=700, x=0, y=1900 + H + 80, text=T['check'])
if stage == 't7':
    H = hole_check()
    T = json.load(open(HERE + '/p4print-notes.json'))['t7']
    N['logpages-note'].update(text=T['logpages']); N['holecheck-note'].update(text=T['check'])
if stage in ('t8', 't9'):
    H = hole_check()
    T = json.load(open(HERE + '/p4print-notes.json'))[stage]
    N['logpages-note'].update(text=T['logpages']); N['holecheck-note'].update(text=T['check'])
if stage == 't10':
    sheet_board()
    N['balance-col2-note'].update(text=json.load(open(HERE + '/p4print-notes.json'))['t10']['sheet'])
if stage == 't11':
    import sheetpages
    T = json.load(open(HERE + '/p4print-notes.json'))['t11']
    method_boards()                                                                   # MethodPrintAsBuilt (unchanged), MethodPrintPage1 and 2 (retitled: the table-fits variant)
    sizes, pl = sheetpages.build(src, out)
    PG = 'page-17'; ROW_Y = 1700; x = 0
    for key, (w, h, title) in sizes.items():
        fn = key + '.dc.html'; B[fn] = {**dict(x=x, y=ROW_Y), **B.get(fn, {}), 'w': w, 'h': h, 'page': PG, 'title': title, 'paper': 'letter'}
        if fn not in c['order']: c['order'].append(fn)
        x += w + 80
    N['sheetpages-title'] = dict(N.get('sheetpages-title', {}), x=0, y=ROW_Y - 300, text="The Sheet's real pages: Olive Oil v1's table breaks", kind='title1', maxW=x - 80, page=PG)
    N['sheetpages-note'] = dict({**dict(x=x, y=ROW_Y), **N.get('sheetpages-note', {})}, fill='gray', page=PG, w=440, maxH=1500, text=T['pages'])
    N['method-note'].update(text=T['method']); N['balance-col2-note'].update(text=T['sheet'])
json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
print(stage, 'written', sorted(f for f in os.listdir(out + '/project')))
