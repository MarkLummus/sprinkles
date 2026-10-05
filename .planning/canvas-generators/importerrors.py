import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 52's board
import json, re, os, html as H
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 52): where the Import error list goes from 724 (Mark's decide row: "Sid draws where the list goes from 724"; today it sits inside the 57px sticky bar and grows it). Every window is the built app's own
# shell markup (imp-capture.json: WebKit, coarse; Olive Oil v1 at scroll 0; the errors set on the shell's own file input) with the app's own stylesheets resolved at the width. A is the build untouched. B and C are the same page without the
# list in the bar and one added element (the panel or the dialog), drawn in the rules below with the app's own tokens only (no new value). Each window is a viewport (900 high; 852 at 393), the page at scroll 0 unless the caption says
# scrolled; fixed things are placed by hand in a drawing. Nothing here edits app/.
IC = json.load(open(HERE + '/imp-capture.json'))
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HT = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in IC.items()}
FACT = {k: v['facts'] for k, v in IC.items()}
STAMP_I = " (decision 52, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
LABH = 150; ROWH = 112
CSS_B = '''.imp-panel{position:absolute;z-index:12;box-sizing:border-box;background:var(--app-background);border:var(--app-rule-row) solid var(--app-divider);border-radius:var(--app-radius-control);padding:var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m);font-family:var(--face-grotesk);color:var(--app-text);display:flex;flex-direction:column;gap:var(--gap-xs)}
.imp-panel__head{display:flex;align-items:center;justify-content:space-between;gap:var(--gap-s)}
.imp-panel__title{margin:0;font-size:var(--app-size-meta);font-weight:600;line-height:1.3}
.imp-panel__sub{margin:0;color:var(--app-text-secondary);font-size:var(--app-size-label);line-height:1.5}
.imp-panel__list{margin:0;padding-left:var(--gap-s);font-size:var(--app-size-label);line-height:1.5;overflow-y:auto;overflow-wrap:anywhere}
.imp-panel__foot{display:flex;justify-content:flex-end}
.imp-panel .shell__place{background:none;border:none;color:inherit;cursor:pointer}
'''
def lines_of(state, W): return FACT[f'{state}_{W}']['lines']
def panel_el(W, lines, kind):
    """B: a panel under the bar's Import, right-aligned, over the page (6 lines then it scrolls); at 393 above the tab row. C: a dialog under a scrim (8 lines then it scrolls)."""
    n = len(lines); sub = f'{n} problem' + ('s' if n != 1 else '') + ' found'
    lis = ''.join(f'<li>{H.escape(l)}</li>' for l in lines)
    lh = 'max-height:9em' if kind == 'B' else 'max-height:12em'
    close = '<button type="button" class="shell__place" tabindex="0">Close</button>'
    if kind == 'B':
        pos = ('left:var(--gap-page);right:var(--gap-page);bottom:calc(var(--app-size-tab-h) + var(--gap-xs))' if W < 724 else 'top:var(--app-size-header-h);right:var(--gap-page);width:480px;margin-top:var(--gap-xs)')
        return (f'<div class="imp-panel" role="alert" style="{pos}"><div class="imp-panel__head"><div><p class="imp-panel__title">This file can’t be imported</p><p class="imp-panel__sub">{sub}</p></div>{close}</div>'
                f'<ul class="imp-panel__list" style="{lh}">{lis}</ul></div>')
    pos = ('left:var(--gap-page);right:var(--gap-page);top:96px' if W < 724 else 'top:96px;left:50%;margin-left:-260px;width:520px')
    scrim = f'<div class="shell__scrim" aria-hidden="true" style="position:absolute;left:0;right:0;top:{57 if W >= 724 else 0}px;bottom:0"></div>'
    return (scrim + f'<div class="imp-panel" role="alertdialog" aria-label="Import" style="{pos}"><div><p class="imp-panel__title">This file can’t be imported</p><p class="imp-panel__sub">{sub}</p></div>'
            f'<ul class="imp-panel__list" style="{lh}">{lis}</ul><div class="imp-panel__foot">{close}</div></div>')
def window(vid, W, VH, html, scroll=0, overlay='', tabs=False):
    tab = ''
    if tabs:
        m = re.search(r'<nav class="shell__tabs".*?</nav>', html, flags=re.S); tab = m.group(0).replace('<nav ', '<nav style="position:absolute;left:0;right:0;bottom:0;z-index:6" ', 1)
    return f'<div class="fp-win {vid}" style="width:{W}px;height:{VH}px;"><div style="width:{W}px;transform:translateY(-{scroll}px);">{html}</div>{tab}{overlay}</div>'
def f_head(state, W):
    f = FACT[f'{state}_{W}']; b = FACT[f'base_{W}']
    return f"The bar is {f['head']['h']:g}px ({b['head']['h']:g}px with no list), and the page's first heading starts at {f['h2']['y']:g}px ({b['h2']['y']:g}px)." if f['head']['h'] != b['head']['h'] else 'The bar does not grow.'
PAN = []
def board():
    rows = []
    for rid, rtitle, rdesc, items in ROWS:
        rows.append((rtitle, rdesc, items))
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, items in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:4400px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:3200px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0
        for (pid, W, VH, state, kind, scroll, cap, fact) in items:
            vid = 'fp-' + pid.replace('_', '-')
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=CSS_B, onehead=False))
            src = state if kind == 'A' else 'base'
            html = HT[f'{src}_{W}']
            try: html = with_menu(html, W)
            except AssertionError: pass
            html = unique_ids(html, vid)
            ov = '' if kind == 'A' else panel_el(W, lines_of(state, W), kind)
            win = window(vid, W, VH, html, scroll, ov, tabs=(kind != 'A' and W < 724))
            body += f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{fact}</small></p></div>{win}</div>\n'
            x += W + GAP; rowh = max(rowh, VH)
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    title = 'C · where the Import error list goes: A (in the bar, as built), B (a panel under Import) and C (a dialog), for a short list and a long one, at 1366, 724 and 393'
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_ImportErrors', title + STAMP_I, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_I, snap='import-errors-placement')}
OLD = 'a file from an older Sprinkles: 3 lines'; MANY = 'a wrong-shaped file: 49 lines'
ROWS = [
 ('A', 'A · as built: the list is a flex item inside the bar’s tools row (the bar is sticky from 724)', 'Measured in the build: the list takes the width left between Search, Import and Export, wraps inside it, and the bar grows to hold it. Nothing closes it: it stays across a route change and until a file imports, with no control of its own. Below 724 the bar is not sticky and the list sits in the page’s top, so a maker scrolled down sees nothing.',
  [('A-older-1366', 1366, 900, 'older', 'A', 0, '1366 · ' + OLD, f_head('older', 1366) + ' The list is 402px wide beside the three controls.'),
   ('A-many-1366', 1366, 900, 'many', 'A', 0, '1366 · ' + MANY, f_head('many', 1366) + ' A sticky bar 84% of this 900px window, 478px wide list, no way to close it.'),
   ('A-older-724', 724, 900, 'older', 'A', 0, '724 · ' + OLD, f_head('older', 724) + ' The list is 120px wide.'),
   ('A-older-393', 393, 852, 'older', 'A', 0, '393 · ' + OLD + ', the page at its top', f_head('older', 393)),
   ('A-older-393s', 393, 852, 'older', 'A', 400, '393 · the same, the page scrolled 400px', 'The bar scrolled away with the list; nothing on screen says the import failed.')]),
 ('B', 'B · (recommended) a panel under Import, over the page: the bar stays 57px, nothing moves, it has Close', 'The panel is fixed under the bar at its right end, below the Import the maker just used, and over the page, so the page does not move and the bar keeps its height. A plain heading and a count; the list stays, six lines high, then it scrolls inside the panel. Below 724 it sits above the tab row, where More’s Import is. Close dismisses it.',
  [('B-older-1366', 1366, 900, 'older', 'B', 0, '1366 · ' + OLD, 'Bar 57px. Panel 480px wide, under Import.'),
   ('B-many-1366', 1366, 900, 'many', 'B', 0, '1366 · ' + MANY, 'Bar 57px. Panel the same size: six lines, then the list scrolls.'),
   ('B-older-724', 724, 900, 'older', 'B', 0, '724 · ' + OLD, 'Bar 57px.'),
   ('B-older-393', 393, 852, 'older', 'B', 400, '393 · ' + OLD + ', the page scrolled 400px', 'Fixed above the tab row, so it shows wherever the page is.'),
   ('B-many-393', 393, 852, 'many', 'B', 0, '393 · ' + MANY, 'Six lines, then it scrolls.')]),
 ('C', 'C · a dialog: centered under a scrim, the page behind it inert until Close', 'The same words and list in a box in the middle of the window, over a scrim like the fly-out’s (the bar stays above it). The maker has to close it. The app has no dialog today.',
  [('C-older-1366', 1366, 900, 'older', 'C', 0, '1366 · ' + OLD, 'Eight lines, then it scrolls.'),
   ('C-many-1366', 1366, 900, 'many', 'C', 0, '1366 · ' + MANY, 'Eight lines, then it scrolls.'),
   ('C-older-393', 393, 852, 'older', 'C', 0, '393 · ' + OLD, 'Left and right gutters of 20px.')]),
]
json.dump({'boards': board()}, open(OUT + '/importerrors-canvas-entries.json', 'w'), indent=2)
print('ok importerrors')
