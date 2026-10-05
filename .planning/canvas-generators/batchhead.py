import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 50's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 50): the Batch head and a Show/Hide on the Batch section (Mark, on the iPhone: "the Batch head timestamp looks different from Tasting head timestamp, and there is no show/hide on Batch section (we need to add
# this capability to be consistent)"). Every panel is the built app's own shell markup (batchhead-capture.json: WebKit, coarse pointer, Olive Oil v1 with its tasted batch; the A panels are that page with its DOM edited in the browser by
# batchhead-probe.mjs, the Batch word and its date made the fold row the Tasting head is, the batch's body inside #fold-batch) with the app's own stylesheets resolved at the width and the one rule of A added; cropped to the Batch head and the
# Tasting head under it. Rows: the build, A open, A closed. The captions' numbers come from batchhead-probe.json. Nothing here edits app/.
CAPB = {k: drop_hidden(v) for k, v in json.load(open(HERE + '/batchhead-capture.json')).items()}
BP = json.load(open(HERE + '/batchhead-probe.json'))
BM = json.load(open(HERE + '/batchhead-board-measure.json')) if os.path.exists(HERE + '/batchhead-board-measure.json') else {}   # the board's own positions (the Sheet above the log wraps a line or two differently in a drawing), read by batchhead-calibrate.mjs
STAMP_B = " (decision 50, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
PANEL_CSS = LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n'
BH_BASE = '.notebook-log .batch-row__head{row-gap:0;align-items:center}.notebook-log .batch-row__head-lead .region-name{margin:0;flex:0 1 auto}.notebook-log .batch-row__head-lead .fold-row{width:auto}'
BH_NARROW = '.notebook-log .batch-row__head-lead{flex:0 0 100%}.notebook-log .batch-row__head-lead .region-name{flex:1 1 auto}.notebook-log .batch-row__head-lead .fold-row{width:100%}'   # the log column under 447px: the phone's 353 and the 350 beside the Sheet
def bh_css(W, v): return '' if v == 'built' else BH_BASE + (BH_NARROW if W in (393, 1366) else '')
WIDTHS = ((393, 'phone'), (723, 'widest phone form'), (1024, 'iPad portrait; the log below the Sheet, 724 to 1365'), (1366, 'iPad landscape; the log beside the Sheet, 350 wide'))
VARS = (('built', 'The build now', "The Batch head is the heading and its date in 15px ink, with no control and no dot. The Tasting head under it is a fold row: the label, Show or Hide, a dot, then its date in 12px grey."),
        ('open', 'A (recommended), open: the Batch head is a fold row like Tasting\'s', "The Batch word, Hide, a dot, then the churned date in the same 12px grey the Tasting date has. Correct and Record another stay in the head and follow the date (decision 34). Where they would wrap (the phone, the 350px log column) the fold row takes the whole row, a 44px control like the other folds, and they stand under it."),
        ('closed', 'A, closed: only the head', "Show hides the batch's whole body: the measurements, the notes, Tasting (with its own fold), Next time and the record's dates. The head stays, with Correct and Record another."))
def facts(v, W):
    m = BP[f'{v}_{W}']; s = f"Head {m['head']['h']:g}px"
    if v == 'built': s += f"; the date starts {m['countInk'][0]:g}px from the log's left edge in 15px ink; Tasting's date {BP['built_%d' % W]['tastingCountInk'][0]:g}px in 12px grey after a dot."
    else:
        s += f" ({BP['built_%d' % W]['head']['h']:g} now); date {m['countInk'][0]:g}px from the log's left edge, {m['countCss']['fs']}, grey, after the dot; Correct at {m['correctInk'][0]:g}px ({BP['built_%d' % W]['correctInk'][0]:g} now)."
        if v == 'open': s += f" The section {m['section']['h']:g}px ({BP['built_%d' % W]['section']['h']:g} now)."
        else:
            d = BP['built_%d' % W]['doc'] - m['doc']
            s += f" The section {m['section']['h']:g}px" + (f"; the page {d:g}px shorter." if d else "; the page's height is set by the Sheet, so it does not change.")
    return s
LABH = 138; ROWH = 100
def build_board():
    css_parts = [PANEL_CSS]; seen = set(); body = ''; y = GAP; bw = 0
    for v, vname, vdesc in VARS:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2800px;"><p class="fp-title">{vname}</p><p class="fp-sub" style="max-width:2800px">{vdesc}</p></div>\n'
        y += ROWH; x = GAP; cells = []; rowh = 0
        for W, wname in WIDTHS:
            m = BP[f'{v}_{W}']; b = BP[f'built_{W}']; log = m['logAbs']
            bm = BM.get(f'{v}_{W}'); hy = bm['headY'] if bm else m['headAbs']['y']; ty = bm['tastingY'] if bm and bm['tastingY'] else m['tastingAbs']['y']
            x0 = max(0, log['x'] - 16); ww = round(min(W - x0, 560 if W < 1366 else 382)); y0 = hy - 16
            if v == 'closed': hh = round(m['head']['h'] + 32)
            else: hh = round(ty + 44 + 12 - hy + 16)
            cells.append((W, wname, x0, ww, y0, hh)); rowh = max(rowh, hh)
        for W, wname, x0, ww, y0, hh in cells:
            vid = f'fp-bh-{v}-{W}'
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=bh_css(W, v), onehead=False))
            html = unique_ids(with_menu(CAPB[f'{v}_{W}'], W), vid)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{W} · {wname}<small>{facts(v, W)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{rowh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    title = "C · the Batch head and a Show/Hide on the Batch section: the build, A open and A closed, at 393, 723, 1024 and 1366 (Olive Oil v1, its tasted batch)"
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_BatchHead', title + STAMP_B, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_B, snap='batch-head-show-hide')}
json.dump({'boards': build_board()}, open(OUT + '/batchhead-canvas-entries.json', 'w'), indent=2)
print('ok batchhead')
