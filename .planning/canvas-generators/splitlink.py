import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 44's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 44): the split row's remove link in the Next version pen. Mark, on the iPad and iPhone after quick 261004-eoi: "the remove link is visible on the first shared ingredient, but not on the others.
# Whole milk in Step 2 has remove link. Whole milk in Step 3 does not have remove link." Every panel is the built app's own shell markup (splitlink-capture.json: WebKit, the dist of 2026-10-04 after quick 261004-ly7;
# Olive Oil v1 with Next version open; 1600 fine, 1366 and 393 coarse) with the app's own stylesheets resolved at the width; the options move one or two pieces of markup. The captions' numbers come from
# splitlink-measure.json (splitlink-measure.mjs measures the probe board this file also writes). Nothing here edits app/.
SC = json.load(open(HERE + '/splitlink-capture.json'))
SM = json.load(open(HERE + '/splitlink-measure.json')) if os.path.exists(HERE + '/splitlink-measure.json') else {}
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
SC = {k: drop_hidden(v).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in SC.items()}
STAMP_S = " (decision 44, options for Mark; drawn 2026-10-04, awaiting Mark's look; nothing approved)"
LINK = '<span class="ingredient-table__remove-gap"> </span><button type="button" class="text-control" tabindex="0">%s</button>'
REMOVE = {'Whole milk': 'remove', 'Sucrose': 'remove'}
def rows_of(html): return list(re.finditer(r'<tr[ >].*?</tr>', html, flags=re.S))
def name_rows(html, name):
    return [m for m in rows_of(html) if 'aria-label="%s,' % name in m.group(0)]
def add_link(row, word):
    """The remove/restore link on a portion line that has none: after the name and the estimated tag, before the portion line (the same order quick 261004-eoi built for the first line)."""
    assert '<button' not in row and 'ingredient-table__portion-note' in row
    return row.replace('<span class="ingredient-table__portion-note">', LINK % word + '<span class="ingredient-table__portion-note">', 1)
def swap(html, m, new): return html[:m.start()] + new + html[m.end():]
def link_everywhere(html, words):
    """B: every portion line of a split ingredient carries the link (the word that ingredient's state asks: restore only on Whole milk once it is removed)."""
    for name in ('Whole milk', 'Sucrose'):
        ms = name_rows(html, name); assert len(ms) == 2, (name, len(ms))
        html = swap(html, ms[1], add_link(ms[1].group(0), words[name]))
    return html
def mark(html):
    ms = rows_of(html); first = [m for m in ms if 'ingredient-table__step-head' in m.group(0)][0]; lastsuc = name_rows(html, 'Sucrose')[1]
    html = swap(html, lastsuc, lastsuc.group(0).replace('<tr', '<tr data-m="z"', 1))
    html = swap(html, first, first.group(0).replace('<tr', '<tr data-m="a"', 1))
    h2 = '<section class="ingredient-table-region"'; assert h2 in html
    return html.replace(h2, '<section data-m="region" class="ingredient-table-region"', 1)
def panel_html(opt, state, W):
    pen, removed = SC['pen_%d' % W], SC['removed_%d' % W]
    if opt == 'A': return pen if state == 'rest' else removed
    if opt == 'B': return link_everywhere(pen, REMOVE) if state == 'rest' else link_everywhere(removed, {'Whole milk': 'restore', 'Sucrose': 'remove'})
    if opt == 'C':
        h = link_everywhere(pen, REMOVE)
        if state == 'rest': return h
        # pressed on the Step 3 line: that line alone strikes (its own markup from the removed capture, its share line left as the pen draws it, since the build does not compute this case)
        rm = name_rows(removed, 'Whole milk')[1].group(0); rm = add_link(rm, 'restore')
        pen_line = re.search(r'<span class="ingredient-table__portion-note">[^<]*</span>', name_rows(h, 'Whole milk')[1].group(0)).group(0)
        rm = re.sub(r'<span class="ingredient-table__portion-note">[^<]*</span>', pen_line, rm, count=1)
        return swap(h, name_rows(h, 'Whole milk')[1], rm)
OPTS = (('A', 'A · as built: the link on the first line only'), ('B', 'B (recommended) · the link on every line, each removes the ingredient'), ('C', 'C · the link on every line, each removes its own line'))
STATES = (('rest', 'resting'), ('removed', 'after remove'))
PANELS = []
def panel(pid, W, html, cap, extra=''):
    p = dict(pid=pid, W=W, html=html, cap=cap, extra=extra); PANELS.append(p); return p
def rect(pid, n): return SM.get(pid, {}).get(n)
def facts(pid):
    m = SM.get(pid)
    if not m: return ''
    return 'Remove links %s; table %g wide, crop %g tall.' % (m['links'], m['region']['w'], m['crop']['h'])
ROWH = 70; LABH = 112
def board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:4000px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:4000px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=p['extra']))
            try: html = with_menu(p['html'], W)
            except AssertionError: html = p['html']
            html = unique_ids(html, vid)
            r = rect(p['pid'], 'region'); c = rect(p['pid'], 'crop')
            x0, ww = (max(0, r['x'] - 12), r['w'] + 24) if r else (0, W)
            y0, hh = (c['y'] - 10, c['h'] + 28) if c else (0, 700)
            cells.append((vid, W, html, x0, y0, ww, hh, p['cap'], p['pid'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap, pid in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{facts(pid)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_S, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_S[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_S, snap=snap)
ENTRIES_S = {}
def build_board():
    rows = []
    for W, label in ((1600, '1600 · fine pointer'), (1366, '1366 · iPad landscape, coarse pointer'), (393, '393 · phone, coarse pointer')):
        pn = []
        for o, oname in OPTS:
            for s, sname in STATES:
                pn.append(panel(f'{o}-{s}-{W}', W, mark(panel_html(o, s, W)), f'{oname} · {sname}' if s == 'rest' else f'{o} · {sname}' + (' (Whole milk, Step 2 line)' if o != 'C' else ' (Whole milk, Step 3 line)')))
        rows.append((f'{label} · Olive Oil v1, the Next version pen: Whole milk and Sucrose are split across Step 2 and Step 3',
                     'Each pair of panels is one option, resting and after the link is pressed. As built (A), the first line carries the only link, and pressing it strikes both lines of the ingredient. B repeats the link on the later line with the same effect. C repeats it but strikes only the pressed line (drawn for the Step 3 line; the percentages are not recomputed, the build has no such state).', pn))
    board('R35C_SplitRemove', 'split-remove-link', 'C · the split row\'s remove link in the Next version pen: A (the first line only, as built), B (every line removes the ingredient) and C (every line removes its own line), resting and after remove, at 1600, 1366 and 393', rows)
def write_probe():
    css_parts = []; body = ''; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['extra']))
        try: html = with_menu(p['html'], W)
        except AssertionError: html = p['html']
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="display:none;position:absolute;left:0;top:0;width:{W}px;"><div style="width:{W}px;">{unique_ids(html, vid)}</div></div>\n'
    main = f'<div style="position:relative;width:1700px;height:7000px;background:#ffffff;">{body}</div>'
    write_board('R35C_SplitRemoveProbe', 'probe', 1700, 7000, main, "@font-face{font-family:'Caveat';font-weight:400;src:url('file://" + os.path.abspath(os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')) + "') format('woff2')}\n" + ''.join(css_parts) + '[hidden]{display:none !important}')
build_board(); write_probe()
json.dump({'boards': ENTRIES_S}, open(OUT + '/splitlink-canvas-entries.json', 'w'), indent=2)
print('ok splitlink', {fn: (e['w'], e['h']) for fn, e in ENTRIES_S.items()}, 'measured' if SM else 'not measured yet')
