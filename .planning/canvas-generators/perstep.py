import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 51's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 51): shared (split) ingredients and per-step operations. Mark, on his List: "if an ingredient is shared across multiple steps, I want to make sure that operations on each step don't affect the other.
# that's not the implementation that we have today." Every panel is the built app's own shell markup (perstep-capture.json: WebKit, coarse pointer, Olive Oil v1, the Next version pen or a saved version with Show changes) with the app's
# own stylesheets resolved at the width. The b_* panels and `rest` are the build untouched; the z_*, c_* and p_* panels are the same page after the browser's edit of the clone (perstep-capture.mjs says what each overlay does: a
# line removed per step is the build's own removed-row look laid on one line, its totals and shares computed by the app with that line at 0 g). The captions' numbers come from perstep-capture.json's facts. Crops come from
# perstep-measure.json (perstep-measure.mjs measures the probe board this file also writes). Nothing here edits app/.
PC = json.load(open(HERE + '/perstep-capture.json'))
PM_ = json.load(open(HERE + '/perstep-measure.json')) if os.path.exists(HERE + '/perstep-measure.json') else {}
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HTML = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in PC.items()}
FACT = {k: v['facts'] for k, v in PC.items()}
STAMP_P = " (decision 51, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
def rows_of(html): return list(re.finditer(r'<tr[ >].*?</tr>', html, flags=re.S))
def mark(html):
    ms = rows_of(html)
    first = [m for m in ms if 'ingredient-table__step-head' in m.group(0)][0]
    suc = [m for m in ms if 'aria-label="Sucrose,' in m.group(0)][-1]
    tot = [m for m in ms if 'aria-label="Total,' in m.group(0)][0]
    for m, tag in sorted(((suc, 'z'), (tot, 't'), (first, 'a')), key=lambda t: -t[0].start()):
        html = html[:m.start()] + m.group(0).replace('<tr', '<tr data-m="%s"' % tag, 1) + html[m.end():]
    h2 = '<section class="ingredient-table-region"'; assert h2 in html
    return html.replace(h2, '<section data-m="region" class="ingredient-table-region"', 1)
PANELS = []
def panel(pid, W, state, cap, crop='top', extra=''):
    p = dict(pid=pid, W=W, html=mark(HTML['%s_%d' % (state, W)]), cap=cap, crop=crop, extra=extra, state=state); PANELS.append(p); return p
def rect(pid, n): return PM_.get(pid, {}).get(n)
def tot(state, W):
    t = FACT['%s_%d' % (state, W)]['total']; m = re.match(r'^(\d+\.\d)(\d+\.\d g)$', t)
    return 'Total %s to %s.' % (m.group(1) + ' g', m.group(2)) if m else 'Total %s.' % t
def wm(state, W, k):
    ls = [l for l in FACT['%s_%d' % (state, W)]['lines'] if l['name'] == 'Whole milk']; l = ls[k]
    return l
def line_txt(state, W, k):
    l = wm(state, W, k); st = 'Step %d' % (2 + k); g = l['grams']
    if l['gramsStruck'] and g.startswith(l['gramsStruck']) and g != l['gramsStruck']: g = '%s to %s' % (l['gramsStruck'], g[len(l['gramsStruck']):])
    else: g = '%s g' % g.replace(' g', '')
    return '%s line %s%s%s' % (st, 'struck, ' if l['struck'] else '', g, ', reads "%s"' % l['note'])
def facts(pid):
    p = [x for x in PANELS if x['pid'] == pid][0]; s = p['state']; W = p['W']; f = FACT['%s_%d' % (s, W)]
    if s == 'b_step2': return tot(s, W) + ' Whole milk 250.4 g in Step 2 (the old Step 3, renumbered) and 120 g under Unallocated, both still in the batch; the three gums are flagged "used by Gum slurry, which is removed", each with its own remove this row.'
    if s == 'c_step2': return tot(s, W) + ' The same lines and flags as the build, but under a Removed head in the removed step\'s place instead of Unallocated at the foot.'
    if s == 'z_step2': return tot(s, W) + ' The five lines of the removed step (120 g milk, 12 g sucrose and the three gums, 133.7 g) are struck with no link of their own; Whole milk in the next step reads "250.4 g of 250.4 g \u00b7 37.6% in all". The "used by" flags are gone.'
    return tot(s, W) + ' ' + line_txt(s, W, 0) + '. ' + line_txt(s, W, 1) + '.'
LABH = 124; ROWH = 112
def board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
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
            y0, hh = (c['y'] - 3, c['h'] + 10) if c else (0, 700)
            cells.append((vid, W, html, x0, y0, ww, hh, p['cap'], p['pid'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap, pid in cells:
            fl = facts(pid)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{fl}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_P, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_P[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_P, snap=snap)
ENTRIES_P = {}
def build_board():
    rows = []
    def row(W, label, desc, specs):
        rows.append((f'{label} · Olive Oil v1: Whole milk and Sucrose are each split across Step 2 and Step 3', desc, [panel(f'{pid}-{W}', W, st, cap, crop) for pid, st, cap, crop in specs]))
    R1 = [('rest', 'rest', 'Resting', 'top'),
          ('built', 'b_wm2', 'As built (decision 44 B): press remove on the Step 2 line', 'top'),
          ('step-a', 'z_wm2', 'Per step: press remove on the Step 2 line', 'top'),
          ('step-b', 'b_wm2', 'Per step: then press it on the Step 3 line too: the ingredient is out (the same page as the build\'s one press)', 'top'),
          ('step-c', 'z_wm3', 'Per step: from there, press restore on the Step 2 line only', 'top')]
    row(1366, '1366 · iPad landscape, coarse pointer · the remove link on one line', 'Today one press strikes both lines of the ingredient. Per step, a press acts on its own line: the other line, its amount and its link do not change, and the ingredient leaves the recipe only when its last line is out. The batch total and every share follow, because those are whole-batch figures.', R1)
    row(1366, '1366 · removing Step 2', 'Today the step\'s lines drop to "Unallocated" at the foot, at full amounts, still in the total (A). C keeps that rule (a step does not remove anything for the maker) but keeps the lines under the removed step instead of "Unallocated". B (recommended) takes the step\'s lines with the step, struck, and brings them back with the step.',
        [('rm-a', 'b_step2', 'A · as built: the lines drop to Unallocated, untouched', 'full'),
         ('rm-c', 'c_step2', 'C · the lines stay with the removed step, untouched; the maker removes each', 'full'),
         ('rm-b', 'z_step2', 'B · (recommended) the lines go with the step, struck; restoring the step brings them back', 'full')])
    row(1366, '1366 · an amount on one line, and Show changes', 'An amount is already per line in the build. The portion line is not: after an edit it reads the opening total (the pen) and, in Show changes, a removed split ingredient reads against the new batch. Per step, the portion line follows the lines still in, and Show changes strikes the changed line.',
        [('amt-a', 'b_edit', 'As built · Step 2 line 120 g to 100 g in the pen', 'top'),
         ('amt-b', 'p_edit', 'Portion lines read the lines still in (the saved version already reads this)', 'top'),
         ('sc-a', 'b_show_edit', 'As built · saved, Show changes: no strike on either line', 'top'),
         ('sc-b', 'p_show_edit', 'Per step · saved, Show changes: the changed line carries its struck amount and share', 'top'),
         ('scr-a', 'b_show_rm', 'As built · saved after removing Whole milk, Show changes (86.3% and the shares against the new batch)', 'top'),
         ('scr-b', 'p_show_rm', 'Per step · saved after removing the Step 2 line, Show changes', 'top')])
    row(393, '393 · phone, coarse pointer · the remove link on one line', 'The same four states as the first row.',
        [('rest', 'rest', 'Resting', 'top'), ('built', 'b_wm2', 'As built: press remove on the Step 2 line', 'top'), ('step-a', 'z_wm2', 'Per step: press remove on the Step 2 line', 'top'), ('step-c', 'z_wm3', 'Per step: only the Step 3 line out', 'top')])
    row(393, '393 · removing Step 2', 'As the second row: as built and B.', [('rm-a', 'b_step2', 'A · as built', 'full'), ('rm-b', 'z_step2', 'B · (recommended) the lines go with the step, struck', 'full')])
    board('R35C_PerStep', 'per-step-shared-ingredient', 'C · shared ingredients, per step: what remove, restore, removing a step, an amount and Show changes do on a split ingredient, as built and per step (Olive Oil v1; 1366 and 393)', rows)
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
    write_board('R35C_PerStepProbe', 'probe', 1700, 9000, main, "@font-face{font-family:'Caveat';font-weight:400;src:url('file://" + os.path.abspath(os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')) + "') format('woff2')}\n" + ''.join(css_parts) + '[hidden]{display:none !important}')
build_board(); write_probe()
json.dump({'boards': ENTRIES_P}, open(OUT + '/perstep-canvas-entries.json', 'w'), indent=2)
print('ok perstep', {fn: (e['w'], e['h']) for fn, e in ENTRIES_P.items()}, 'measured' if PM_ else 'not measured yet')
