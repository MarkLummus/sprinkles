import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 56's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 56): as made while recording a batch on a saved version that has a line out. Mark, on his List (per-step-as-made-line-out): "ask Sid to draw this and recommend the solution/approach". Every panel is
# the built app's own shell markup (asmade-capture.json: WebKit, coarse pointer, Olive Oil v1; real clicks and fills on app/dist served on a throwaway port) with the app's own stylesheets resolved at the width. The a_*
# panels are the build untouched. The b_* panels are the same page after the browser's edit of the clone (asmade-capture.mjs says what the edit is: the build's removed look, struck name and struck amount and no share, laid
# over the build's own as-made field). Nothing here is a build and nothing here edits app/. The captions' numbers come from asmade-capture.json's facts; crops come from asmade-measure.json (asmade-measure.mjs measures the
# probe board this file also writes).
PC = json.load(open(HERE + '/asmade-capture.json'))
PM_ = json.load(open(HERE + '/asmade-measure.json')) if os.path.exists(HERE + '/asmade-measure.json') else {}
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HTML = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in PC.items()}
FACT = {k: v['facts'] for k, v in PC.items()}
STAMP_A = " (decision 56, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
def rows_of(html): return list(re.finditer(r'<tr[ >].*?</tr>', html, flags=re.S))
def mark(html):
    ms = rows_of(html)
    first = [m for m in ms if 'ingredient-table__step-head' in m.group(0)][0]
    tot = [m for m in ms if 'aria-label="Total,' in m.group(0)][0]
    lines = [m for m in ms if 'ingredient-table__step-head' not in m.group(0) and '<th' not in m.group(0) and 'aria-label="Total,' not in m.group(0)]
    last = lines[-1]
    for m, tag in sorted(((last, 'z'), (tot, 't'), (first, 'a')), key=lambda t: -t[0].start()):
        html = html[:m.start()] + m.group(0).replace('<tr', '<tr data-m="%s"' % tag, 1) + html[m.end():]
    h2 = '<section class="ingredient-table-region"'; assert h2 in html
    return html.replace(h2, '<section data-m="region" class="ingredient-table-region"', 1)
PANELS = []
def panel(pid, W, state, cap, crop='full', extra=''):
    p = dict(pid=pid, W=W, html=mark(HTML['%s_%d' % (state, W)]), cap=cap, crop=crop, extra=extra, state=state); PANELS.append(p); return p
def rect(pid, n): return PM_.get(pid, {}).get(n)
def fact_of(p): return FACT['%s_%d' % (p['state'], p['W'])]
def th(pid):
    r = rect(pid, 'full'); g = rect(pid, 'region'); return ('Heading to Total: %s px' % ('%.1f' % (r['y'] + r['h'] - g['y'])).rstrip('0').rstrip('.')) if r and g else ''
def facts(pid):
    p = [x for x in PANELS if x['pid'] == pid][0]; s = p['state']; f = fact_of(p); n = len(f['fields']); t = th(pid)
    if s == 'a_read': return 'Saved v2, the build of quick 261005-cgb: %d lines, none struck, Total %s. Whole milk reads once, in Step 3, with no portion line. %s.' % (f['n'], f['total'], t)
    if s == 'a_v1': return 'The same recipe with nothing out, for comparison: %d fields, Total %s. %s.' % (n, f['total'], t)
    if s == 'a_rec': return '%d fields, one per line still in; plan %s. Recording keeps Whole milk\'s portion line, "250.4 g of 250.4 g \u00b7 36.8%% in all", which that quick left alone until this is decided. Its field is named "Whole milk, as made, grams, portion 2": a screen reader says portion 2; nothing on screen does. %s.' % (n, f['total'], t)
    if s == 'a2_typed': return 'Recommended. Recording reads like the Sheet: Whole milk is one line with no portion line, its field named "Whole milk, as made, grams". 245, 12.5 and 63 typed: as made total %s against plan %s. Stored as built: Whole milk [null, 245], Sucrose [12.5, 63]. %s.' % (f['footAsMade'], f['total'], t)
    if s == 'b_rec': return '%d fields, one more; the struck line draws no share; plan %s, the line being out of it. Whole milk\'s Step 3 line keeps its portion line. %s.' % (n, f['total'], t)
    if s == 'b_typed': return 'As made total %s against plan %s: it counts the 120 g, which the plan does not. That figure is the build\'s rule applied by hand. %s.' % (f['footAsMade'], f['total'], t)
    if s == 'a_rec_step2': return '%d fields; plan %s. Whole milk and Sucrose each keep a portion line, "250.4 g of 250.4 g" and "64 g of 64.0 g", and a field named portion 2. %s.' % (n, f['total'], t)
    if s == 'a2_rec_step2': return 'Recommended. %d fields; plan %s. Whole milk and Sucrose each read as one line, with no portion line and a field named without portion 2. %s.' % (n, f['total'], t)
    if s == 'b_rec_step2': return '%d fields, five more; plan %s. The five lines of the removed step stay under a Removed head. %s.' % (n, f['total'], t)
    return ''
ROWH = 112
def board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, labh, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:4400px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:3000px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=p['extra'], onehead=False))
            try: html = with_menu(p['html'], W)
            except AssertionError: html = p['html']
            html = unique_ids(html, vid)
            r = rect(p['pid'], 'region'); c = rect(p['pid'], p['crop'])
            x0, ww = (max(0, r['x'] - 12), r['w'] + 24) if r else (0, W)
            y0, hh = (r['y'] - 3, c['y'] + c['h'] - r['y'] + 4) if (r and c) else (0, 700)   # the window runs from the region's heading to the Total row's bottom
            cells.append((vid, W, html, x0, y0, ww, hh, p['cap'], p['pid'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap, pid in cells:
            fl = facts(pid)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div class="fp-labbox" style="height:{labh}px;"><p class="fp-lab">{cap}<small>{fl}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += labh + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_A, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_A[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_A, snap=snap)
ENTRIES_A = {}
def build_board():
    rows = []
    def row(W, label, desc, specs, labh):
        rows.append((f'{label} · Olive Oil v1', desc, labh, [panel(f'{pid}-{W}', W, st, cap) for pid, st, cap in specs]))
    row(1366, '1366 · iPad landscape, coarse pointer · Whole milk\'s Step 2 line is out, and the version is saved as v2',
        'On the reading Sheet a line that is out is not drawn. A keeps that in the recording table: it is the reading table with the as-made column added, so a line that is out has no row and no field. B keeps the line in the recording table, struck, with a field of its own.',
        [('read', 'a_read', 'Reading the saved v2: the line is not drawn'),
         ('a-rec', 'a_rec', 'A · as built: Record a batch'),
         ('a2-typed', 'a2_typed', 'A · recommended: Record a batch, with 245, 12.5 and 63 typed'),
         ('b-rec', 'b_rec', 'B · the line that is out stays, struck, with its own field'),
         ('b-typed', 'b_typed', 'B · 120 typed on the struck line')], 112)
    row(1366, '1366 · removing a step takes its lines: the step Gum slurry is out, and the version is saved as v2',
        'B has to hold for a step, and for a whole ingredient, or it is not one rule. Removing Gum slurry puts five lines out.',
        [('v1', 'a_v1', 'Nothing out: Record another on v1'),
         ('a-step', 'a_rec_step2', 'A · as built: Record a batch'),
         ('a2-step', 'a2_rec_step2', 'A · recommended: Record a batch'),
         ('b-step', 'b_rec_step2', 'B · the five lines stay, struck, under Removed')], 112)
    row(393, '393 · phone, coarse pointer · Whole milk\'s Step 2 line is out, and the version is saved as v2',
        'The same states as the first row.',
        [('a-rec', 'a_rec', 'A · as built: Record a batch'),
         ('a2-typed', 'a2_typed', 'A · recommended, 245, 12.5 and 63 typed'),
         ('b-rec', 'b_rec', 'B · the line stays, struck, with its field'),
         ('b-typed', 'b_typed', 'B · 120 typed on the struck line')], 150)
    row(393, '393 · removing a step takes its lines: the step Gum slurry is out, and the version is saved as v2',
        'As the second row.',
        [('a-step', 'a_rec_step2', 'A · as built: Record a batch'),
         ('a2-step', 'a2_rec_step2', 'A · recommended: Record a batch'),
         ('b-step', 'b_rec_step2', 'B · the five lines stay, struck, under Removed')], 150)
    board('R35C_AsMade', 'as-made-line-out', 'C · as made while recording a batch on a version with a line out: A, the build (no field for a line that is out), A as recommended (recording reads like the Sheet) and B (the line stays, struck, with a field) (Olive Oil v1 saved as v2; 1366 and 393)', rows)
def write_probe():
    css_parts = []; body = ''; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['extra'], onehead=False))
        try: html = with_menu(p['html'], W)
        except AssertionError: html = p['html']
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="display:none;position:absolute;left:0;top:0;width:{W}px;"><div style="width:{W}px;">{unique_ids(html, vid)}</div></div>\n'
    main = f'<div style="position:relative;width:1700px;height:9000px;background:#ffffff;">{body}</div>'
    write_board('R35C_AsMadeProbe', 'probe', 1700, 9000, main, "@font-face{font-family:'Caveat';font-weight:400;src:url('file://" + os.path.abspath(os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')) + "') format('woff2')}\n" + ''.join(css_parts) + '[hidden]{display:none !important}')
build_board(); write_probe()
json.dump({'boards': ENTRIES_A}, open(OUT + '/asmade-canvas-entries.json', 'w'), indent=2)
print('ok asmade', {fn: (e['w'], e['h']) for fn, e in ENTRIES_A.items()}, 'measured' if PM_ else 'not measured yet')
