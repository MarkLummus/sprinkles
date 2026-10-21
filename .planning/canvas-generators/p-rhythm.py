import json, re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import p10, printstart
from p10 import (esc, style_region, scales_region, problems_region, scale_card, problem_row, BANDS, STYLE_TEMP, KINDS, log_html, css_for, CSS_BY_CLS)
from cssscope import scope_css, unique_ids
LOGX = 976      # the log column at 1366 (p10.py): 350 wide at 984
def log_only(W, vid, *regions): return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet"></div>{log_html(*regions)}</div></div>', vid)
import places as PL
# Sid, 2026-10-21 (Mark, on look-p10-scales-group-cue: "create a board on another page with the elements of the log to show the rhythm. I still think that this needs work"; his note of
# 2026-10-01, .planning/notes/2026-10-01-for-sid-section-rhythm.md: "Items like 'Every recipe' are not distinguishable from the items within that area"): one board, canvas page
# "Log column rhythm", that isolates sketch 013's log column (Style, Scales, Problems: the right-hand authoring column of the creation editor at 1366) and labels every text role in it
# with its face, size, weight, case, colour token and line height, and dimensions every gap in the Scales region with its spacing token. Three columns: the column as drawn (canvas
# version 424, decision 25's cue face), then two proposed revisions, A and B, each with the same labels and dimensions, for decide-p10-log-rhythm. Measured, never reasoned from CSS:
#   python3 p-rhythm.py measure <out> ; node p-rhythm-measure.mjs <out>/measure.html ; python3 p-rhythm.py <canvas.json read from the artifact root> <out>
# Before you start and Version name are not in the log column (the Sheet and the band hold them), so they are not here.
M = json.load(open(HERE + '/p-rhythm-measure.json')) if os.path.exists(HERE + '/p-rhythm-measure.json') else {}

# the proposed revisions: rules on top of p10.py's, every value a token
VARIANTS = {
    'r0': ('As drawn', 'the column as published (canvas version 424): the Group cue face on "Every recipe" and "This recipe only", the items under it at the body size, 12 px between everything', ''),
    'rA': ('A · space only', 'the same faces; the pen\'s rhythm around a group cue: 32 above it (gap-l) and 6 below (gap-xs), so the cue belongs to what follows and stands off what precedes; 12 (gap-s) everywhere else',
           '.notebook-log .mk-cue{margin-top:var(--gap-m);margin-bottom:calc(var(--gap-xs) - var(--gap-s))}\n.notebook-log .mk-body > .mk-cue:first-child{margin-top:0}\n'),
    'rB': ('B · space and the pen\'s item size', 'A, and the core names under the cue at the meta size on the cue\'s 20 px line (the pen\'s axis names are 14 under a 14/600 cue), so no item outsizes its heading; the fields keep the body size',
           '.notebook-log .mk-cue{margin-top:var(--gap-m);margin-bottom:calc(var(--gap-xs) - var(--gap-s))}\n.notebook-log .mk-body > .mk-cue:first-child{margin-top:0}\n'
           '.notebook-log .mk-core{font-size:var(--app-size-meta);line-height:var(--app-notebook-pen-cue-line-h)}\n'),
}
# the roles: name, selector (first match in the panel), what the label says it is
ROLES = [
    ('Region name', '.mk-region .batch-row__head .region-name'),
    ('Clear (head act)', '.batch-row__head-acts .text-control'),
    ('Menu value', '.mk-menu'),
    ('Field caption', '.notebook-field .notebook-caption'),
    ('Field value', '.notebook-field .ink-field'),
    ('Unit', '.mk-unit'),
    ('Targets caption', '.mk-region[aria-label="Style"] > .mk-body > .notebook-caption'),
    ('Band label', '.mk-band__label'),
    ('Band term', '.mk-band__label small'),
    ('Band field', '.mk-band .ink-field'),
    ('Group cue', '.mk-cue'),
    ('Core names', '.mk-core'),
    ('Card head', '.mk-card__head .notebook-caption'),
    ('remove', '.mk-card__head .text-control'),
    ('Kind caption', '.segmented-field__caption'),
    ('Kind cell', '.segmented__option'),
    ('Stops line', '.mk-stops'),
    ('Required', '.field-requirement'),
    ('Add link', '.mk-add'),
]
# the blocks whose gaps are dimensioned, in document order, inside the Scales region
BLOCKS = '.batch-row__head, .mk-cue, .mk-core, .mk-card__head, .mk-card > .notebook-field, .mk-pair, .segmented-field, .mk-stops, .mk-add-row'

def panel_html(pid):
    card = scale_card(1, 'Creaminess', 'thin', 'rich', KINDS[0])
    return log_only(1366, pid, style_region('Philadelphia', BANDS['Philadelphia'], STYLE_TEMP['Philadelphia']), scales_region([card]), problems_region([problem_row(1, '', hint=True)]))

# ---- tokens: computed values back to names (the values of tokens.css at 1366)
SIZES = {'12px': 'app-size-label', '13px': 'sheet-type-control', '14px': 'app-size-meta', '15px': 'app-notebook-size-body', '16px': 'sheet-size-ink-field'}
COLORS = {'rgb(20, 20, 20)': 'app-text', 'rgb(89, 89, 89)': 'app-text-secondary', 'rgb(20, 117, 221)': 'app-blue-text', 'rgb(255, 255, 255)': 'app-background'}
GAPS = {2: 'gap-hair', 6: 'gap-xs', 12: 'gap-s', 20: 'gap-m', 32: 'gap-l'}      # the spacing tokens; a gap that is a sum reads as its parts (30 under the stops line: the card's padding, the column's gap, the add row's margin)
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
    return 'no token'
def face(ff): return 'grotesk' if 'Helvetica' in ff or 'Inter' in ff or 'system' in ff or 'apple' in ff.lower() else ('text' if 'Georgia' in ff else ff.split(',')[0])
def spec(s):
    size = s['fontSize']; lh = s['lineHeight']
    if lh.endswith('px'): lh = ('%g' % round(float(lh[:-2]), 1)) + 'px'
    case = 'caps' if s['textTransform'] == 'uppercase' else 'sentence'
    track = '' if s['letterSpacing'] in ('normal', '0px') else f', tracking {s["letterSpacing"]}'
    return (f'{face(s["fontFamily"])} {size.replace("px", "")}/{s["fontWeight"]} · {case}{track} · {COLORS.get(s["color"], s["color"])} · line {lh.replace("px", "")}'
            + f' · size {SIZES.get(size, "?")}')

LW, AW, DW, GAP = 366, 560, 110, 80       # the log panel, its label column, the dimension column at its left, between columns
LABH = 112
def column(pid, x, y):
    """One variant: the dimension column, the panel, the label column; returns (html, css, height)."""
    name, sub, vcss = VARIANTS[pid]; m = M.get(pid, {})
    h = int(m.get('height', 1400))
    css_for(1366)
    head = f'<div style="position:absolute;left:{x}px;top:{y}px;width:{DW + LW + AW}px;"><p class="p4-lab">{esc(name)}<small>{esc(sub)}</small></p></div>'
    px = x + DW
    win = (f'<div class="p4-win pc1366 {pid}" style="position:absolute;left:{px}px;top:{y + LABH}px;width:{LW}px;height:{h}px;">'
           f'<div style="width:1366px;transform:translate(-{LOGX}px,0);">{panel_html(pid)}</div></div>')
    ann = ''
    # the gaps, dimensioned at the panel's left
    for g in m.get('gaps', []):
        top = y + LABH + g['from']; gh = g['to'] - g['from']
        if gh <= 0: continue
        ann += (f'<div class="rh-dim" style="left:{x + DW - 14}px;top:{top}px;height:{gh}px;"></div>'
                f'<div class="rh-dimlab" style="left:{x}px;top:{top + gh / 2 - 8}px;width:{DW - 20}px;">{round(gh)} <small>{esc(gap_name(gh))}</small></div>')
    # the roles, labelled at the panel's right, stacked so no two labels overlap
    last = -1000; LH = 40
    for r in m.get('roles', []):
        ly = max(y + LABH + r['top'] - 4, last + LH)
        last = ly
        ey = y + LABH + r['top'] + r['height'] / 2; kx = px + LW + 20; ty = ly + 8      # the leader: out of the element, down (or up) the margin, into the label
        ann += (f'<div class="rh-lead" style="left:{px + r["right"] + 4}px;top:{ey}px;width:{kx - px - r["right"] - 4}px;"></div>'
                f'<div class="rh-drop" style="left:{kx}px;top:{min(ey, ty)}px;height:{abs(ty - ey)}px;"></div>'
                f'<div class="rh-lead" style="left:{kx}px;top:{ty}px;width:{12}px;"></div>'
                f'<div class="rh-tick" style="left:{px + r["right"]}px;top:{y + LABH + r["top"]}px;height:{r["height"]}px;"></div>'
                f'<div class="rh-lab" style="left:{px + LW + 32}px;top:{ly}px;width:{AW - 32}px;"><b>{esc(r["role"])}</b> <span>{esc(spec(r))}</span></div>')
    css = scope_css(vcss, '.' + pid) if vcss else ''
    return head + win + ann, css, max(h, last + LH - y - LABH) + LABH

RH_CSS = '''
.rh-dim{position:absolute;width:0;border-left:1px solid #1475dd}
.rh-dim::before,.rh-dim::after{content:"";position:absolute;left:-4px;width:9px;border-top:1px solid #1475dd}
.rh-dim::before{top:0}.rh-dim::after{bottom:0}
.rh-dimlab{position:absolute;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:16px;font-weight:600;color:#1475dd;text-align:right}
.rh-dimlab small{display:block;font-weight:400;font-size:11px;color:#595959}
.rh-tick{position:absolute;width:0;border-left:2px solid #1475dd}
.rh-lead{position:absolute;height:0;border-top:1px dotted #1475dd}
.rh-drop{position:absolute;width:0;border-left:1px dotted #1475dd}
.rh-lab{position:absolute;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;color:#141414}
.rh-lab b{font-weight:700;color:#1475dd}
.rh-lab span{color:#595959}
'''
TITLE = 'Log column rhythm · every text role of the creation editor\'s log column with its face, size, weight, case, colour and line, and every gap in Scales with its token: as drawn, then revisions A and B, at 1366 (drawn 2026-10-21; for Mark\'s choice)'

def measure_html():
    body = ''.join(f'<div class="p4-win pc1366 {pid}" data-pid="{pid}" style="width:1366px;position:relative;margin:0 0 40px 0"><div class="inner" style="width:1366px">{panel_html(pid)}</div></div>' for pid in VARIANTS)
    css_for(1366)
    vc = ''.join(scope_css(v[2], '.' + pid) for pid, v in VARIANTS.items() if v[2])
    return f'<!doctype html><meta charset="utf-8"><style>body{{margin:0}}{PL.LABEL}{"".join(CSS_BY_CLS.values())}{vc}</style>{body}'

def build(out):
    parts = []; css = ''; x = 0; bh = 0
    for pid in VARIANTS:
        html, vcss, h = column(pid, x, 0); parts.append(html); css += vcss; x += DW + LW + AW + GAP; bh = max(bh, h)
    bw = x - GAP; bh += 40
    body = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{"".join(parts)}</div>'
    allcss = PL.LABEL + ''.join(CSS_BY_CLS.values()) + css + RH_CSS
    open(out + '/project/P10_LogRhythm.dc.html', 'w').write(printstart.board(TITLE, body, bw, bh, allcss, paper=True))
    return bw, bh

if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        os.makedirs(sys.argv[2] + '/project', exist_ok=True); open(sys.argv[2] + '/measure.html', 'w').write(measure_html()); print('ok')
    else:
        c = json.load(open(sys.argv[1])); os.makedirs(sys.argv[2] + '/project', exist_ok=True); w, h = build(sys.argv[2])
        PAGE = ('page-22', 'Log column rhythm'); fn = 'P10_LogRhythm.dc.html'
        if not any(p['id'] == PAGE[0] for p in c['pages']):
            i = [p['id'] for p in c['pages']].index('page-21'); c['pages'].insert(i + 1, {'id': PAGE[0], 'name': PAGE[1]})
        c['boards'][fn] = {**dict(x=0, y=0, page=PAGE[0]), **c['boards'].get(fn, {}), 'w': w, 'h': h, 'title': TITLE}
        if fn not in c['order']: c['order'].append(fn)
        c['notes']['p10-rhythm-title'] = dict(c['notes'].get('p10-rhythm-title', {}), x=0, y=-300, text='Log column rhythm: the roles and the gaps, as drawn and two revisions', kind='title1', maxW=w, page=PAGE[0])
        json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(w, h)
