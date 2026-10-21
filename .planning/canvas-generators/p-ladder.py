import json, re, os, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart
from cssscope import scope_css, unique_ids
import places as PL
# Sid, 2026-10-21 (Mark: "I want a fresh proposal for every grouped surface in the log. it all reads the same to me as a user."): one board, canvas page "Log column rhythm",
# the proposed type ladder and spacing scale for aside.notebook-log beside the column as built, on four surfaces: the creation editor's Scales and Problems, the record pen's
# axes group (From freezer, Every recipe, This recipe only, Any problems?), the batch margin's reading state (the tasting groups), and the record pen's churn fields (the
# region head, the pen captions and the At draw cue). Every panel is the built app's own log markup (10-log-inventory.mjs: WebKit, the scratch build of HEAD 6ee9051b, 1366,
# coarse pointer, field values written in) with the app's own stylesheets; the proposed column adds the rules in PROPOSED_CSS (every value a token) and two markup edits
# (the creation card's head dropped, remove beside Name; "Targets" marked as a cue). Labels and dimensions are measured (p-ladder-measure.mjs); only what changes is in the accent.
#   python3 p-ladder.py measure <out> ; node p-ladder-measure.mjs <out>/measure.html ; python3 p-ladder.py <canvas.json read from the artifact root> <out>
CAP = json.load(open(HERE + '/log-capture.json'))
M = json.load(open(HERE + '/p-ladder-measure.json')) if os.path.exists(HERE + '/p-ladder-measure.json') else {}
esc = lambda s: _html.escape(str(s), quote=True)

PROPOSED_CSS = '''
/* Revision 2 (2026-10-21, after Mark rejected revision 1: "strong(4) looks bigger and bolder than its parents; This recipe only looks smallest ... looks completely random"): the ladder governs the values too.
   The sequence, top to bottom, never grows in size or weight: L1 region name 14/600 caps secondary; L2 group cue 14/600 sentence ink; L3 caption 12/600 caps secondary, a tag on its content;
   L4 content 14/400 ink (words, lists, figures with tabular numerals); the hand keeps its face, colour and its 20 px floor and sits under its cue by weight; chips 13/400; fields 16/400 in their boxes (controls, the touch floor). */
/* L1 region name: the Sheet's section size (14), caps, tracked, secondary, in the 44 px head row */
.notebook-log .region-name,.notebook-log .batch-row__head .region-name{font-size:var(--app-size-meta)}
/* L3 caption: one caption face in the log, the App's (notebook-caption): 12/600 caps, app-tracking-label, secondary; the axis names and the pen's captions join it */
.notebook-log .pen-caption{font-weight:600;letter-spacing:var(--app-tracking-label)}
.notebook-log .axis-mark__name{font-weight:600;letter-spacing:var(--app-tracking-label);color:var(--app-text-secondary)}
/* L2 group cue (sketch 011 decision 40 C): every first-level label that stands over two or more things of one kind */
.notebook-log .axes-cue,.notebook-log .mk-cue,.notebook-log .mk-cue-targets,.notebook-log .defects-head > .pen-caption,.notebook-log .tasting-reading__group > h4.batch-row__group-label{font-size:var(--app-size-meta);font-weight:600;text-transform:none;letter-spacing:0;line-height:var(--app-notebook-pen-cue-line-h);color:var(--app-text)}
/* a label nested under a cue (Every recipe and This recipe only inside Any problems?) is a caption, not a second cue */
.notebook-log .tasting-reading__subgroup > .batch-row__group-label,.notebook-log .defect-group > .axes-cue{font-size:var(--app-size-label);font-weight:600;text-transform:uppercase;letter-spacing:var(--app-tracking-label);line-height:normal;color:var(--app-text-secondary)}
/* L4 content: words, lists and figures under a cue or a caption at the meta size, regular, on the cue's line; the reading cell's figure comes down from 20/600 (sketch 011's log value) */
.notebook-log .mk-core{font-size:var(--app-size-meta);line-height:var(--app-notebook-pen-cue-line-h)}
.notebook-log .batch-row__cell-value{font-size:var(--app-size-meta);font-weight:400;line-height:var(--app-notebook-pen-cue-line-h)}
/* the hand: Caveat, pen blue, at its floor (size-hand-min), under its cue by weight and face */
.notebook-log .app-hand{font-size:var(--size-hand-min)}
/* the spacing scale: gap-l between groups, gap-xs under a cue over a one-line list, gap-s under a cue over a card, gap-s elsewhere */
.notebook-log .mk-cue{margin-top:var(--gap-m);margin-bottom:calc(var(--gap-xs) - var(--gap-s))}
.notebook-log .mk-body > .mk-cue:first-child{margin-top:0}
.notebook-log .mk-cue + .mk-card{margin-top:calc(var(--gap-s) - var(--gap-xs))}
/* the card: no head; remove stands beside the Name field */
.notebook-log .mk-caprow{display:flex;align-items:flex-end;column-gap:var(--gap-s)}
.notebook-log .mk-caprow .notebook-field{flex:1 1 auto}
'''

def proposed_markup(key, h):
    if key == 'creation':
        h = h.replace('<span class="notebook-caption">Targets</span>', '<span class="notebook-caption mk-cue-targets">Targets</span>')
        h = re.sub(r'<div class="mk-card__head"><span class="notebook-caption">[^<]*</span>(<button[^>]*>remove</button>)</div>(<label class="notebook-field"><span class="notebook-caption">Name</span>.*?</label>)',
                   r'<div class="mk-caprow">\2\1</div>', h, flags=re.S)
    return h

SURFACES = [
    ('creation', 'Creation editor · Scales and Problems', '.mk-region[aria-label="Scales"]', '.mk-region[aria-label="Problems"]', 'the region name comes up to 14 caps; the two cues take L2 (14/600 ink) and stand 32 off the group before them, 6 over the core names, 12 over a card; the core names read as content (14/400); the card loses its "Scale 1" head and remove stands beside Name; Kind\'s caption joins the one caption face'),
    ('tasting-pen', 'Record pen · the axes group and Any problems?', '.axes-grid__group--declared', '.defects-row__chips', 'This recipe only (and Every recipe, From freezer above it) already reads L2 (decision 40 C, kept); Any problems? takes L2 and its two sub-labels become captions, so the chips sit cue > caption > chip; the axis names join the one caption face (600, tracked, secondary)'),
    ('reading-olive', 'Batch margin · the reading state', '.tasting-reading__group', '.batch-row__conclusion', 'Every recipe and This recipe only already read L2 (kept); the mark words come down from 20/600 to 14/400 so a value is never bigger or bolder than its cue; Any problems? takes L2 and its This recipe only becomes a caption; the hand drops to its 20 px floor under a 14/600 cue; Next time stays a caption; the cell labels are the caption face already'),
    ('record-pen', 'Record pen · the churn fields and At draw', '.batch-row__head', '.segmented-field', 'the region name comes up to 14 caps so it tops the ladder; At draw already reads L2; every pen caption takes the one caption face, so Churn date and Exit consistency read as Out of machine does in the reading state; the fields stay 16 in their boxes (controls, the touch floor); nothing moves'),
]
VARIANTS = [('b', 'As built'), ('p', 'Proposed')]
ROLES = [('Region name', '.region-name'), ('Group cue', '.axes-cue, .mk-cue, .batch-row__group-label--cue'), ('Any problems?', '.defects-head > .pen-caption, h4.batch-row__group-label:not(.batch-row__group-label--cue)'),
         ('Core names', '.mk-core'), ('Card head', '.mk-card__head .notebook-caption'), ('Caption', '.notebook-caption, .segmented-field__caption:not(.axes-cue), .batch-margin__field > .pen-caption, .field-row__label > .pen-caption, .batch-row__cell-label'),
         ('Axis name', '.axis-mark__name'), ('Chip', '.chip-toggle'), ('Cell value', '.batch-row__cell-value'), ('Next time', 'h3.batch-row__group-label'), ('Stops line', '.mk-stops'), ('remove', '.mk-card .text-control'), ('Add link', '.mk-add'), ('Hand', '.app-hand')]
BLOCKS = '.batch-row__head, .mk-cue, .mk-core, .mk-card__head, .mk-caprow, .mk-card > .notebook-field, .mk-pair, .mk-stops, .mk-add-row, .axis-mark, .segmented-field__head, .segmented:not(.segmented-field), .defects-head, .defects-row__chips, .batch-row__group-label, .batch-row__cell, .batch-row__conclusion > *, .batch-margin__field, .field-row, .tasting-reading__problems'

SIZES = {'12px': 'app-size-label', '13px': 'sheet-type-control', '14px': 'app-size-meta', '15px': 'app-notebook-size-body', '16px': 'sheet-size-ink-field', '22px': 'app-hand-size'}
COLORS = {'rgb(20, 20, 20)': 'app-text', 'rgb(89, 89, 89)': 'app-text-secondary', 'rgb(20, 117, 221)': 'app-blue-text', 'rgb(31, 61, 122)': 'sheet-pen-blue'}
GAPS = {2: 'gap-hair', 4: 'gap-field-unit', 6: 'gap-xs', 12: 'gap-s', 20: 'gap-m', 32: 'gap-l'}
def gap_name(px):
    px = round(px)
    if px in GAPS: return GAPS[px]
    for a in GAPS:
        for b in GAPS:
            if a <= b and a + b == px: return f'{GAPS[a]} + {GAPS[b]}'
    for a in GAPS:
        for b in GAPS:
            for c in GAPS:
                if a <= b <= c and a + b + c == px: return f'{GAPS[a]} + {GAPS[b]} + {GAPS[c]}'
    return 'own rule'
def spec(s):
    lh = s['lineHeight']
    if lh.endswith('px'): lh = '%g' % round(float(lh[:-2]), 1)
    case = 'caps' if s['textTransform'] == 'uppercase' else 'sentence'
    track = '' if s['letterSpacing'] in ('normal', '0px') else f', tracking {s["letterSpacing"]}'
    face = 'text' if 'Georgia' in s['fontFamily'] else ('hand' if 'Caveat' in s['fontFamily'] else 'grotesk')
    return f'{face} {s["fontSize"].replace("px", "")}/{s["fontWeight"]} · {case}{track} · {COLORS.get(s["color"], s["color"])} · line {lh} · {SIZES.get(s["fontSize"], "?")}'

LOGX = 976; LW, AW, DW, GAP, ROWGAP = 366, 470, 110, 60, 110
CSS_BY = {}
def css_for(v):
    if v not in CSS_BY: CSS_BY[v] = PL.css_for(1366, True, 'lv' + v, extra=PROPOSED_CSS if v == 'p' else '')
    return CSS_BY[v]
def panel_html(key, v, pid):
    h = CAP[key]; h = proposed_markup(key, h) if v == 'p' else h
    return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet"></div>{h}</div></div>', pid)

def measure_html():
    body = ''
    for key, title, s0, s1, sub in SURFACES:
        for v, vn in VARIANTS:
            pid = f'{key}-{v}'; css_for(v)
            body += f'<div class="p4-win lv{v} {pid}" data-pid="{pid}" data-start="{esc(s0)}" data-end="{esc(s1)}" style="width:1366px;position:relative;margin:0 0 40px 0"><div class="inner" style="width:1366px">{panel_html(key, v, pid)}</div></div>'
    return f'<!doctype html><meta charset="utf-8"><style>body{{margin:0}}{PL.LABEL}{"".join(CSS_BY.values())}</style>{body}'

LAB = '''
.ld-dim{position:absolute;width:0;border-left:1px solid #595959}
.ld-dim::before,.ld-dim::after{content:"";position:absolute;left:-4px;width:9px;border-top:1px solid #595959}
.ld-dim::before{top:0}.ld-dim::after{bottom:0}
.ld-dim.on,.ld-dim.on::before,.ld-dim.on::after{border-color:#1475dd}
.ld-dimlab{position:absolute;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:16px;font-weight:400;color:#595959;text-align:right}
.ld-dimlab.on{font-weight:700;color:#1475dd}
.ld-dimlab small{display:block;font-weight:400;font-size:12px;color:#595959}
.ld-dimlab .was{display:block;font-weight:400;font-size:12px;color:#1475dd}
.ld-tick{position:absolute;width:0;border-left:2px solid #595959}
.ld-tick.on{border-color:#1475dd}
.ld-lead{position:absolute;height:0;border-top:1px dotted #8a8f8c}
.ld-drop{position:absolute;width:0;border-left:1px dotted #8a8f8c}
.ld-lead.on,.ld-drop.on{border-color:#1475dd}
.ld-lab{position:absolute;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#595959}
.ld-lab b{font-weight:700;color:#595959}
.ld-lab.on b{color:#1475dd}
.ld-lab.on{color:#141414}
.ld-lab .was{display:block;color:#1475dd}
.ld-key{position:absolute;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;color:#141414;max-width:1500px}
.ld-key b{color:#1475dd}
'''
def column(key, v, x, y, other):
    """One panel with its dimensions at the left and its role labels at the right; `other` is the paired variant's measurement for marking the deltas."""
    pid = f'{key}-{v}'; m = M.get(pid); css_for(v)
    if not m: return '', 0
    y0, h = m['start'], m['end'] - m['start']
    px = x + DW
    win = (f'<div class="p4-win lv{v} {pid}" style="position:absolute;left:{px}px;top:{y}px;width:{LW}px;height:{h}px;">'
           f'<div style="width:1366px;transform:translate(-{LOGX}px,{-y0:g}px);">{panel_html(key, v, pid)}</div></div>')      # y0 may be negative (a crop that starts at the log's top)
    ann = ''
    og = {(g['a'], g['b']): g for g in other['gaps']} if other else {}
    for g in m['gaps']:
        top = y + g['from'] - y0; gh = g['to'] - g['from']
        if gh <= 0: continue
        o = og.get((g['a'], g['b'])); changed = o is not None and round(o['to'] - o['from']) != round(gh); on = ' on' if (changed and v == 'p') else ''
        was = f'<span class="was">was {round(o["to"] - o["from"])}</span>' if (changed and v == 'p') else ''
        ann += (f'<div class="ld-dim{on}" style="left:{x + DW - 14}px;top:{top}px;height:{gh}px;"></div>'
                f'<div class="ld-dimlab{on}" style="left:{x}px;top:{top + gh / 2 - 8}px;width:{DW - 20}px;">{round(gh)} <small>{esc(gap_name(gh))}</small>{was}</div>')
    orl = {r['role']: r for r in other['roles']} if other else {}
    last = -1000; LH = 36
    for r in m['roles']:
        o = orl.get(r['role']); changed = o is not None and spec(o) != spec(r); on = ' on' if (changed and v == 'p') else ''
        ly = max(y + r['top'] - y0 - 4, last + LH); last = ly
        ey = y + r['top'] - y0 + r['height'] / 2; kx = px + LW + 16; ty = ly + 8
        was = f'<span class="was">was {esc(spec(o))}</span>' if (changed and v == 'p') else ''
        ann += (f'<div class="ld-lead{on}" style="left:{px + r["right"] + 4}px;top:{ey}px;width:{kx - px - r["right"] - 4}px;"></div>'
                f'<div class="ld-drop{on}" style="left:{kx}px;top:{min(ey, ty)}px;height:{abs(ty - ey)}px;"></div>'
                f'<div class="ld-lead{on}" style="left:{kx}px;top:{ty}px;width:10px;"></div>'
                f'<div class="ld-tick{on}" style="left:{px + r["right"]}px;top:{y + r["top"] - y0}px;height:{r["height"]}px;"></div>'
                f'<div class="ld-lab{on}" style="left:{px + LW + 28}px;top:{ly}px;width:{AW - 28}px;"><b>{esc(r["role"])}</b> {esc(spec(r))}{was}</div>')
        if changed and v == 'p': last += 16
    return win + ann, max(h, last + LH - y)

KEY = ('<b>Revision 2.</b> Revision 1 was rejected on 2026-10-21 (Mark: "strong(4) looks bigger and bolder than its parents; This recipe only looks smallest. same with Bitter, bigger than Any problems?, a different color, and a different typeface ... looks completely random"): it left the values alone. '
       '<b>The ladder, a sequence that never grows in size or weight going down.</b> L1 Region name: grotesk 14/600 caps, app-tracking-label, app-text-secondary, the 44 px head row. L2 Group cue: grotesk 14/600 sentence, app-text, the 20 px line (sketch 011 decision 40 C): the first-level label over two or more things of one kind. '
       'L3 Caption: grotesk 12/600 caps, app-tracking-label, app-text-secondary: a tag over one field, value or control, and any label nested under a cue. L4 Content: grotesk 14/400 sentence, app-text, the 20 px line: words, lists and figures (tabular numerals). '
       'The hand keeps Caveat in sheet-pen-blue at its 20 px floor (size-hand-min) and sits under its cue by weight and face. Chips 13/400 and fields 16/400 in their boxes are controls, under the touch floor rule, not levels. '
       '<b>The scale.</b> Region seam gap-m + rule + gap-m. Group seam gap-l. Cue to a one-line list or chips gap-xs; cue to a card or control gap-s. Between items gap-s. A card: a rule, gap-s inside. '
       '<b>The rule.</b> Count what stands under the label: a region, its name (L1); two or more of one kind at the first level, a cue (L2); one field, value or control, or anything nested under a cue, a caption (L3); the rest is content (L4). '
       '<b>Reads with it:</b> dimensions at each panel\'s left and role labels at its right are measured in WebKit; in the proposed column only what changes is blue, with "was" under it.')
TITLE = 'The log column\'s ladder, revision 2 · four levels that never grow going down, one spacing scale, for every grouped surface in aside.notebook-log, as built beside the proposal, at 1366 (redrawn 2026-10-21; for Mark\'s choice)'

def build(out):
    parts = []; y = 150; bw = 0
    for key, title, s0, s1, sub in SURFACES:
        parts.append(f'<div style="position:absolute;left:0;top:{y}px;width:1900px;"><p class="p4-lab">{esc(title)}<small>{esc(sub)}</small></p></div>'); y += 78
        x = 0; rowh = 0
        for v, vn in VARIANTS:
            other = M.get(f'{key}-{"p" if v == "b" else "b"}')
            parts.append(f'<div style="position:absolute;left:{x}px;top:{y}px;"><p class="p4-lab" style="font-size:13px;color:#595959">{vn}</p></div>')
            html, h = column(key, v, x, y + 30, other); parts.append(html); rowh = max(rowh, h + 30); x += DW + LW + AW + GAP
        bw = max(bw, x - GAP); y += rowh + ROWGAP
    body = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;"><div class="ld-key" style="left:0;top:0;width:{bw}px;">{KEY}</div>{"".join(parts)}</div>'
    css = PL.LABEL + ''.join(CSS_BY.values()) + LAB
    open(out + '/project/P10_LogLadder.dc.html', 'w').write(printstart.board(TITLE, body, bw, y, css, paper=True))
    return bw, y

if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        os.makedirs(sys.argv[2] + '/project', exist_ok=True); open(sys.argv[2] + '/measure.html', 'w').write(measure_html()); print('ok')
    else:
        c = json.load(open(sys.argv[1])); os.makedirs(sys.argv[2] + '/project', exist_ok=True); w, h = build(sys.argv[2])
        fn = 'P10_LogLadder.dc.html'; PAGE = 'page-22'
        prev = c['boards'].get('P10_LogRhythm.dc.html', {}); x = prev.get('x', 0) + prev.get('w', 3268) + 240
        c['boards'][fn] = {**dict(x=x, y=0, page=PAGE), **c['boards'].get(fn, {}), 'w': w, 'h': h, 'title': TITLE}
        if fn not in c['order']: c['order'].append(fn)
        c['notes']['p10-ladder-title'] = dict(c['notes'].get('p10-ladder-title', {}), x=x, y=-300, text='The log column\'s ladder, revision 2: as built and proposed, four surfaces', kind='title1', maxW=w, page=PAGE)
        json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(w, h)
