import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 48's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 48): the ingredients table's head on one line from 724. Mark, decision ox8: "one head line"; and on the iPad and the Mac, "table header (Ingredient) is indented (I starts at about N in ingredients);
# As Made is wrapped and starts at left edge of the table". Every panel is the built app's own shell markup (final-capture.json: Olive Oil v1 with its batch at 1366, coarse; Standard Base v2, no batch yet, at 1600) with the app's own
# stylesheets resolved at the width, cropped to the Ingredients heading and the head and the first rows. Rows: the build's head (two lines), A (the head on one line, Ingredient where it stands: the page boards draw A) and B (the head on
# one line, Ingredient over the names). The captions' numbers come from onehead-opts.json (onehead-opts.mjs reads the build with each rule added). Nothing here edits app/.
OM = json.load(open(HERE + '/onehead-opts.json'))
ONEHEADB = sec(OPT, 'ONEHEADB')
STAMP_O = " (decision 48, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
PANEL_CSS = LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n'
VARS = (('two', 'The build now: the head on two lines', 'Ingredient on the first line over the amount and the names; As made wraps to two lines in a box 0.55px wide and starts at the table\'s left edge, % of batch on the second line.', ''),
        ('A', 'A (recommended): the head on one line, Ingredient where it stands', 'As made over its column, Ingredient over the amount and the names (decision 15), % of batch at the far end, all on one line.', ONEHEADB and ''),
        ('B', 'B: the head on one line, Ingredient over the names', 'As A, but Ingredient starts where the names start, so the amount column has no word over it.', ONEHEADB))
PAGES_O = (('batch', 'olive1', 1366, 'Olive Oil v1 · its batch in view · 1366'), ('none', 'base2', 1600, 'Standard Base v2 · no batch yet · 1600'))
def facts(vk, pk):
    m = OM[f'{vk}_{pk}']; th = {t['text']: t for t in m['ths']}; h = m['headingInk'][0]; ing = th['Ingredient']['ink'][0]
    s = f"Head {m['tr']['h']:g}px tall. Ingredient starts {ing - h:g}px after the heading's first letter (the names start {m['nameInk'][0] - h:g}px after)."
    if 'As made' in th: a = th['As made']['ink']; s += f" As made: {a[1] - a[0]:.0f}px wide, from {a[0] - h:g} to {a[1] - h:g}px after the heading's first letter" + (f", {ing - a[1]:g}px before Ingredient." if vk != 'two' else ', two lines.')
    return s
LABH = 104; ROWH = 78
def build_board():
    css_parts = [PANEL_CSS]; seen = set(); body = ''; y = GAP; bw = 0
    CH = round(OM['two_batch']['cropBottom'] - OM['two_batch']['region']['y'] + 24)
    for vk, vname, vdesc, vcss in VARS:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2400px;"><p class="fp-title">{vname}</p><p class="fp-sub" style="max-width:2400px">{vdesc}</p></div>\n'
        y += ROWH; x = GAP
        for pk, state, W, pname in PAGES_O:
            vid = f'fp-oh-{vk}-{pk}'; m = OM[f'{vk}_{pk}']; r = m['region']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=vcss, onehead=(vk != 'two')))
            html = unique_ids(panel_html(state, W), vid)
            x0, y0, ww = r['x'] - 12, r['y'] - 12, round(r['w'] + 24)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{pname}<small>{facts(vk, pk)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{CH}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + CH + GAP
    y = int(y + 0.999); bw = int(bw)
    title = "C · the ingredients table's head from 724: the build's two lines, one line with Ingredient where it stands (A), and one line with Ingredient over the names (B), with a batch in view and with none"
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_OneHead', title + STAMP_O, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_O, snap='table-head-one-line')}
json.dump({'boards': build_board()}, open(OUT + '/onehead-canvas-entries.json', 'w'), indent=2)
print('ok onehead')
