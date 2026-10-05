import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 49's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 49): the empty space under the ingredient table on Mexican Chocolate v3 with Balance and Watch for open (Mark, on the iPad: "it bothers me. ask Sid to fix"). Every panel is the built app's own shell
# markup (empty-capture.json: WebKit, coarse pointer, Mexican Chocolate v3 with its batch as the app opens it: Show changes off, As made as seeded) with the app's own stylesheets resolved at the width, cropped from the Ingredients
# heading to the foot of the Sheet's grid. Rows: the build, A (the Instructions' row takes the side column's surplus: rows auto auto 1fr auto) and AB (A, and Watch for closed). The captions' numbers come from empty-probe.json
# (empty-probe.mjs reads the build with each option added). The page boards draw the build's head as decision 48 draws it; these panels draw the build's own head (two lines), the numbers measured on it. Nothing here edits app/.
EC = {k: drop_hidden(v) for k, v in json.load(open(HERE + '/empty-capture.json')).items()}
EP = json.load(open(HERE + '/empty-probe.json'))
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
STAMP_E = " (decision 49, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
PANEL_CSS = LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n'
A_CSS = '.recipe-page{grid-template-rows:auto auto 1fr auto}.recipe-page--no-method{grid-template-rows:auto 1fr auto}'
VARS = (('built', 'The build now', 'The grid gives each of the Sheet column\'s two rows (the table, then the Instructions) half of what the side column (Balance, then Watch for) needs beyond them, so the Instructions start a long way under the table.', '', 'open'),
        ('A', 'A (recommended): the surplus goes to the foot of the column', 'The Instructions\' row takes all of it (the grid\'s rows are auto, auto, 1fr, auto), so the table and the Instructions sit together as they do on every other recipe, and the column ends where the Instructions end, beside the tail of Watch for. A style rule only.', A_CSS, 'open'),
        ('AB', 'AB: A, and Watch for closed at the start', 'As A, with Watch for closed when the page opens (Balance stays open). The side column is shorter, so the page is shorter and the empty foot smaller; Watch for is one tap away, which reopens it. This reverses part of decision 33 (Balance and Watch for open where beside).', A_CSS, 'closed'))
WIDTHS = ((1024, 'iPad portrait'), (1366, 'iPad landscape'))
def facts(vk, W):
    m = EP[f'mex3_{W}_{vk}']
    s = f"The Instructions start {m['tableToMethod']:.0f}px under the table, {m['emptyUnderTable']:.0f}px of it empty. The column's foot is {m['leftFoot']:.0f}px empty under the Instructions. Side column {m['side']['h']:.0f}px; page {m['page']['h']:.0f}px."
    return s
LABH = 126; ROWH = 100
def build_board():
    css_parts = [PANEL_CSS]; seen = set(); body = ''; y = GAP; bw = 0
    for vk, vname, vdesc, vcss, state in VARS:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2600px;"><p class="fp-title">{vname}</p><p class="fp-sub" style="max-width:2600px">{vdesc}</p></div>\n'
        y += ROWH; x = GAP; cells = []; rowh = 0
        for W, wname in WIDTHS:
            m = EP[f'mex3_{W}_{vk}']; y0 = m['region']['y'] - 12; hh = round(m['page']['bottom'] - y0 + 2)
            cells.append((W, wname, y0, hh)); rowh = max(rowh, hh)
        for W, wname, y0, hh in cells:
            vid = f'fp-em-{vk}-{W}'
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=vcss, onehead=False))
            html = unique_ids(with_menu(EC[f'{state}_{W}'], W), vid)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{LABH}px;"><p class="fp-lab">Mexican Chocolate v3 · its batch · {W} · {wname} · Balance {"and Watch for open" if state == "open" else "open, Watch for closed"}<small>{facts(vk, W)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{W}px;height:{rowh}px;"><div style="width:{W}px;transform:translateY(-{y0}px);">{html}</div></div></div>\n')
            x += W + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    title = "C · the empty space under the ingredient table on Mexican Chocolate v3 (984 and up, Balance and Watch for open): the build, A (the surplus goes to the foot of the column) and AB (A, and Watch for closed), at 1024 and 1366"
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_EmptySpace', title + STAMP_E, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_E, snap='empty-space-under-table')}
json.dump({'boards': build_board()}, open(OUT + '/empty-canvas-entries.json', 'w'), indent=2)
print('ok empty')
