import json, csv, os, re, html, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
# Sid, 2026-10-03 (decision 32, "Measures table"). Reads ladder-measures.json (measures-table.mjs) and writes ladder-measures.csv, the standalone page
# .planning/sketches/011-recipe-route-c/measures-table.html and the markdown that goes into the README (README.md between its two markers).
D = json.load(open(HERE + '/ladder-measures.json'))
ROWS = [r for r in D['rows'] if not r.get('error')]
ERR = [r for r in D['rows'] if r.get('error')]
BLOCKS = {b['id']: b for b in D['blocks']}
WINDOWS = D['windows']
CAND_ORDER = ['today', 'L', 'f collapsed', 'f expanded', 'g closed', 'final']
def cands_for(win): return ['today', 'final', 'final724'] if win[1] < 984 else CAND_ORDER
def cand_label(win, cand): return 'all candidates (tab row as built)' if (cand == 'today' and win[1] < 984) else ('FINAL DESIGN (fly-out + sticky bar from 984, Go to batch row, D3 from 724)' if cand == 'final' else ('OPTION: sticky bar + fly-out from 724 (no tab row)' if cand == 'final724' else cand))
def get(engine, block, window, cand):
    return next((r for r in ROWS if r['engine'] == engine and r['block'] == block and r['window'] == window and r['cand'] == cand), None)
def screens(y, vis):
    return None if y is None else round(y / vis, 1)
def derived(r):
    vis = r['vis']
    r = dict(r)
    r['screens'] = screens(r['docH'], vis)
    r['balScreens'] = screens(r['yBal'], vis); r['logScreens'] = screens(r['yLog'], vis)
    r['ingScreens'] = screens(r['yIng'], vis); r['totalScreens'] = screens(r['yTotal'], vis)
    return r
def estimate(window, cand):
    """Block A's page with Block B's Instructions region: A's page height plus the measured difference of the Instructions regions (the method region, which holds Before you start) between B and A, same window and candidate. Not a real recipe."""
    a, b = get('webkit', 'A', window, cand), get('webkit', 'B', window, cand)
    if not a or not b: return None
    return a['docH'] + (b['methodH'] - a['methodH'])
LAYOUT = lambda r: f"{r['nav']}; {r['sheetCols']}; Balance {r['balance']}; log {r['logPos']}"
# ---- CSV ----
cols = ['block', 'recipe', 'window', 'width', 'screen_height', 'visible_height_estimate', 'candidate', 'nav', 'sheet_columns', 'balance', 'log', 'sheet_w', 'table_w', 'balance_w', 'name_column_min', 'names_wrapping', 'max_name_rows',
        'page_height', 'screens_of_scroll', 'y_ingredients', 'y_table_bottom', 'y_total_row', 'y_balance', 'balance_screens_down', 'y_log', 'log_screens_down', 'instructions_region_h',
        'pen_h_record_another', 'pen_h_with_add_tasting', 'page_height_with_other_blocks_instructions_estimate', 'chrome_page_height', 'chrome_name_column_min', 'note']
with open(HERE + '/ladder-measures.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(cols)
    for blk in ('A', 'B'):
        for win in WINDOWS:
            for cand in cands_for(win):
                r = get('webkit', blk, win[0], cand)
                if not r: continue
                r = derived(r); c = get('chrome', blk, win[0], cand)
                est = estimate(win[0], cand) if blk == 'A' else None
                w.writerow([blk, BLOCKS[blk]['recipe'], win[0], win[1], win[2], r['vis'], cand_label(win, cand), r['nav'], r['sheetCols'], r['balance'], r['logPos'], r['sheetW'], r['tableW'], r['balanceW'], r['nameMin'],
                            len(r['wrapped']), r['maxRows'], r['docH'], r['screens'], r['yIng'], r['yTableBottom'], r['yTotal'], r['yBal'], r['balScreens'], r['yLog'], r['logScreens'], r['methodH'], r['penH'], r['penTastingH'],
                            est if est is not None else '', c['docH'] if c else '', c['nameMin'] if c else '', r['note']])
# ---- shared text ----
VISNOTE = f"The visible height is an ESTIMATE, not measured on Mark's device: the screen height less {D['chromeUi']}px (iPadOS status bar about 24 plus Safari's compact tab and address bar about 46). Playwright's iPad descriptors give the full screen as the viewport and no Safari chrome, so they cannot supply it."
HEADNOTE = ("Rules: one recipe per block, every fold open (Details, History, Balance, Watch for, the log's Tasting; every collapsed fold button in the page, clicked until none is left), coarse pointer, WebKit "
            "(Chrome's page heights are in the CSV; the largest difference from WebKit is 4.3%), the built app (dist of 2026-10-03) with one rule moved per candidate, the ingredient table drawn with As made as its first column from 724 up (Mark's standing preference; the phone keeps it stacked and is not in this table). "
            "Candidates: FINAL DESIGN (Mark's choice, decision 32/33: g closed, the Go to batch row from 724 to 1365, D3 from 724; the last row of each window); today (the ladder as built); L (the rail yields to the bottom tab row below 1590, the Sheet's two-column minimum 920); f collapsed (a 57px icon rail) and f expanded (the 224 rail, on L's sums); g closed (no rail, a menu button). "
            "Below 984 every candidate is the bottom tab row as built, so one row stands for all of them. The narrow rail e is not in this table (a 1366 and 1194 candidate only; its numbers are on the ladder boards). f expanded at 1366 is measured at 1365 (the log below), 1px narrower.")
def fmt(v, suffix=''):
    return '' if v is None else f'{v}{suffix}'
def rec_label(blk):
    return f"Block {blk}: {BLOCKS[blk]['recipe']} ({BLOCKS[blk]['label']})"
# ---- findings (computed, then named by block) ----
def cell(block, window, cand): 
    r = get('webkit', block, window, cand); return derived(r) if r else None
# ---- the final-design block (both recipes, the FINAL DESIGN row of every window) ----
def final_rows():
    out = []
    for win in WINDOWS:
        for blk in ('A', 'B'):
            r = cell(blk, win[0], 'final')
            if r: out.append((win, blk, r))
    return out
def final_md():
    h = '| Window (screen, visible est.) | Recipe | Layout | Page (screens) | Ingredients y | Total y | Balance y (screens) | Log y (screens) | Table / name column; wraps | Pen, Record another / + tasting |'
    o = ['*Block F: the final design (decision 33): the fly-out closed, D3 from 724 with As made first, the Go to batch row from 724 to 1365; both recipes, every fold open, the same rules as Blocks A and B.*', '', h, '|' + '---|' * (h.count('|') - 1)]
    for win, blk, r in final_rows():
        wraps = 'none' if not r['wrapped'] else f"{len(r['wrapped'])} wrap ({r['maxRows']} rows)"
        o.append(f"| {win[0]} {win[1]} x {win[2]} (visible about {r['vis']}) | {BLOCKS[blk]['recipe']} | {LAYOUT(r)} | {r['docH']:,} ({r['screens']}) | {r['yIng']:,} | {r['yTotal']:,} | {r['yBal']:,} ({r['balScreens']}) | {r['yLog']:,} ({r['logScreens']}) | {r['tableW']:.0f} / {r['nameMin']:.0f}; {wraps} | {r['penH']:,} / {r['penTastingH']:,} |")
    return '\n'.join(o)
def final_html():
    out = ['<h2>Block F: the final design (decision 33): the fly-out closed, D3 from 724 with As made first, the Go to batch row from 724 to 1365</h2>', '<table>' + th('Window (screen, visible est.)', 'Recipe', 'Layout', 'Page height', 'Screens', 'Ingredients y', 'Total row y', 'Balance y (screens)', 'Log y (screens)', 'Table / name column', 'Names wrapping', 'Pen: Record another / + tasting')]
    last = None
    for win, blk, r in final_rows():
        label = f"<b>{html.escape(win[0])}</b><br>{win[1]} x {win[2]}, visible about {r['vis']}" if win[0] != last else ''
        last = win[0]
        wraps = 'none' if not r['wrapped'] else f"{len(r['wrapped'])} ({r['maxRows']} rows)"
        out.append(td(label, html.escape(BLOCKS[blk]['recipe']), html.escape(LAYOUT(r)), f"{r['docH']:,}", f"{r['screens']}", f"{r['yIng']:,}", f"{r['yTotal']:,}", f"{r['yBal']:,} ({r['balScreens']}), {r['balance']}", f"{r['yLog']:,} ({r['logScreens']}), {r['logPos']}", f"{r['tableW']:.0f} / {r['nameMin']:.0f}", wraps, f"{r['penH']:,} / {r['penTastingH']:,}", cls='first' if label else None))
    out.append('</table>')
    return '\n'.join(out)
# ---- HTML ----
def th(*h): return '<tr>' + ''.join(f'<th>{html.escape(x)}</th>' for x in h) + '</tr>'
def td(*c, cls=None):
    return '<tr' + (f' class="{cls}"' if cls else '') + '>' + ''.join(f'<td>{x}</td>' for x in c) + '</tr>'
def blk_table(blk):
    out = [f'<h2>{html.escape(rec_label(blk))}</h2>']
    hdr = ['Window (screen, visible est.)', 'Candidate', 'Layout', 'Page height', 'Screens', 'Ingredients y', 'Total row y', 'Balance y (screens)', 'Log y (screens)', 'Table / name column', 'Names wrapping', 'Pen: Record another / + tasting']
    if blk == 'A': hdr += ['Estimate: page with Olive Oil\'s Instructions (not a real recipe)']
    out.append('<table>' + th(*hdr))
    for win in WINDOWS:
        first = True
        for cand in cands_for(win):
            r = cell(blk, win[0], cand)
            if not r: continue
            label = f"<b>{html.escape(win[0])}</b><br>{win[1]} x {win[2]}, visible about {r['vis']}" if first else ''
            first = False
            cname = cand_label(win, cand)
            wraps = 'none' if not r['wrapped'] else f"{len(r['wrapped'])} ({r['maxRows']} rows)"
            est = estimate(win[0], cand) if blk == 'A' else None
            row = [label, html.escape(cname), html.escape(LAYOUT(r)), f"{r['docH']:,}", f"{r['screens']}", f"{r['yIng']:,}", f"{r['yTotal']:,}",
                   f"{r['yBal']:,} ({r['balScreens']}), {r['balance']}", f"{r['yLog']:,} ({r['logScreens']}), {r['logPos']}", f"{r['tableW']:.0f} / {r['nameMin']:.0f}", wraps, f"{r['penH']:,} / {r['penTastingH']:,}" if r['penH'] else 'not measured']
            if blk == 'A': row.append(f"{est:,} ({round(est / r['vis'], 1)} screens)" if est else '')
            out.append(td(*row, cls='first' if label else None))
    out.append('</table>')
    return '\n'.join(out)
def build_html(findings_html):
    css = '''body{font:14px/1.4 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#141414;margin:24px auto;max-width:1500px;padding:0 16px;background:#fff}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 8px}p{max-width:110ch;margin:6px 0}.note{color:#595959}
table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:13px}th,td{border:1px solid #d6dad7;padding:5px 7px;text-align:left;vertical-align:top}
th{background:#f3f4f2;position:sticky;top:0}tr.first td{border-top:2px solid #141414}code{background:#f3f4f2;padding:0 3px}.flag{background:#fff7e0;border:1px solid #e0c060;padding:8px 10px;margin:12px 0}'''
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Measures table</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>{css}</style></head><body>
<h1>Measures table: the recipe route's columns on the iPad</h1>
<p class="note">Sketch 011, decision 32. Drawn and measured 2026-10-03; awaiting Mark's look; nothing is approved. Generated by <code>.planning/canvas-generators/measures-table.mjs</code> and <code>measures-table.py</code>; the same numbers are in <code>ladder-measures.csv</code> beside the generator.</p>
<div class="flag"><b>What is an estimate.</b> {html.escape(VISNOTE)} Every height and every y is a measurement of the built app in Playwright WebKit, not of Mark's iPad. The Block A estimate column is Block A's page height plus the difference between Block B's and Block A's Instructions regions (which hold Before you start) at the same window and candidate: it is arithmetic, not a real recipe.</div>
<p>{html.escape(HEADNOTE)}</p>
<p>Screens = page height / visible height. A y is a distance from the top of the page in px; (screens) is that y / visible height, so 0.4 is on the first screen and 2.0 is two full screens of scroll away. Pen = the record pen's height in the log after Record another, and after Add tasting is opened too.</p>
{findings_html}
{final_html()}
{blk_table('A')}
{blk_table('B')}
</body></html>'''
# ---- markdown for the README ----
def md_block(blk):
    out = [f"*{rec_label(blk)}.*", '']
    hdr = '| Window (screen, visible est.) | Candidate | Layout | Page (screens) | Ingredients y | Total y | Balance y (screens) | Log y (screens) | Table / name column; wraps | Pen, Record another / + tasting |' + (' A with Olive Oil\'s Instructions (estimate) |' if blk == 'A' else '')
    out.append(hdr); out.append('|' + '---|' * (hdr.count('|') - 1))
    for win in WINDOWS:
        first = True
        for cand in cands_for(win):
            r = cell(blk, win[0], cand)
            if not r: continue
            lab = f"{win[0]} {win[1]} x {win[2]} (visible about {r['vis']})" if first else ''
            first = False
            wraps = 'none' if not r['wrapped'] else f"{len(r['wrapped'])} wrap ({r['maxRows']} rows)"
            est = estimate(win[0], cand) if blk == 'A' else None
            row = f"| {lab} | {cand_label(win, cand)} | {LAYOUT(r)} | {r['docH']:,} ({r['screens']}) | {r['yIng']:,} | {r['yTotal']:,} | {r['yBal']:,} ({r['balScreens']}) | {r['yLog']:,} ({r['logScreens']}) | {r['tableW']:.0f} / {r['nameMin']:.0f}; {wraps} | {r['penH']:,} / {r['penTastingH']:,} |"
            if blk == 'A': row += f" {est:,} ({round(est / r['vis'], 1)}) |" if est else ' |'
            out.append(row)
    return '\n'.join(out)
def build_md(findings_md):
    return (f"**Measures table (decision 32 addendum, drawn 2026-10-03, awaiting Mark's look; nothing approved).** Mark: \"do we have a table of measures? with all folds open, and at the iPad portrait and landscape widths, what is screen height?\" then \"use the same recipe for each to be consistent\". The full table is `measures-table.html` beside the boards and `.planning/canvas-generators/ladder-measures.csv` (sortable); the generator is `measures-table.mjs` and `measures-table.py`. "
            f"{HEADNOTE} {VISNOTE} Screens = page height / visible height; a y is the distance from the top of the page in px, and (screens) is that y / visible height. The page-height estimate column is Block A plus the Instructions difference to Block B, arithmetic, not a real recipe.\n\n"
            + findings_md + '\n\n' + final_md() + '\n\n' + md_block('A') + '\n\n' + md_block('B') + '\n')
if __name__ == '__main__':
    fm = open(HERE + '/measures-findings.md').read() if os.path.exists(HERE + '/measures-findings.md') else ''
    fh = ('<h2>Findings that change the recommendation</h2>' + ''.join('<p>' + html.escape(p) + '</p>' for p in fm.split('\n\n') if p.strip())) if fm else ''
    open(os.path.join(REPO, '.planning', 'sketches', '011-recipe-route-c', 'measures-table.html'), 'w').write(build_html(fh))
    md = build_md(fm)
    open(HERE + '/ladder-measures.md', 'w').write(md)
    readme = os.path.join(REPO, '.planning', 'sketches', '011-recipe-route-c', 'README.md')
    t = open(readme).read(); a_, b_ = '<!-- measures-table:start -->', '<!-- measures-table:end -->'
    if a_ in t:
        i, j = t.index(a_), t.index(b_)
        open(readme, 'w').write(t[:i] + a_ + '\n' + md + t[j:])
    print('ok rows', len(ROWS), 'errors', len(ERR), 'csv, html, md written')
