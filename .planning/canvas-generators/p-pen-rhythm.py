import json, re, os, sys, html as _html, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart
from cssscope import unique_ids
import places as PL
LADDER = importlib.import_module('p-ladder')      # revision 2a's faces, one source (its PROPOSED_CSS; the mk-* rules in it match nothing here)
# Sid, 2026-10-22 (Mark, closing look-p10-batch-route-layout: "I want to see a board with the proposal recommendations so that I can judge next to as-built"): one board, canvas
# page "Log column rhythm", the batch route's record pen with its tasting open, filled as the layout probe filled it (p-pen-rhythm-capture.mjs: WebKit, app/dist at HEAD
# 61d2fe9c, 1366, coarse pointer, Mexican Chocolate v4), from the Batch head row to Cancel / Save batch. Left, as built, with the app's own stylesheets; right, the same
# markup with the change set of .impeccable/proposals/2026-10-22-batch-route-layout.md applied as rules in PROPOSED_CSS (every value a token) on top of ladder revision 2a's
# faces, and the caption option of decide-p10-at-draw-caption drawn (a 12 px caption between the cue and its two options). Every interval down the column is measured
# (p-pen-rhythm-measure.mjs: the text's line box to the next line box or control box, as the proposal's tables measure) and dimensioned in the margin with its token;
# in the proposed column only what changes is blue, with "was" under it.
#   python3 p-pen-rhythm.py measure <out> ; node p-pen-rhythm-measure.mjs <out>/measure.html ; python3 p-pen-rhythm.py <canvas.json read from the artifact root> <out>
CAP = json.load(open(HERE + '/p-pen-rhythm-capture.json'))['html']
M = json.load(open(HERE + '/p-pen-rhythm-measure.json')) if os.path.exists(HERE + '/p-pen-rhythm-measure.json') else {}
esc = lambda s: _html.escape(str(s), quote=True)

# the change set, items 1 to 7, as notebook.css rules scoped to .notebook-log (the proposal's wording in the comments)
PROPOSED_CSS = LADDER.PROPOSED_CSS + '''
/* 1. The reserve goes: a field-row caption is its line; a segmented or axis head is the 20 px cue line, baseline-aligned (Clear keeps its 44 px target as the overflowing ::after hit area app.css already gives it under a coarse pointer at 1366) */
.notebook-log .field-row .pen-caption:not(.segmented-field__caption){min-height:0}
.notebook-log .axis-mark__head,.notebook-log .segmented-field__head{min-height:var(--app-notebook-pen-cue-line-h);align-items:baseline}
/* 2. Between fields, 12: the row gap alone; 12 above a prose field and the caption's own 6 under it; 12 under the tasting note; 12 between segmented fields */
.notebook-log .field-row__label{margin-bottom:0}
.notebook-log .batch-margin__field{margin-top:var(--gap-s);gap:0}
.notebook-log .batch-margin__field--next-time{margin-top:var(--gap-l)}
.notebook-log .note-block{margin-top:var(--gap-s);padding-bottom:0;margin-bottom:var(--gap-s)}      /* margin-top: the 12 above How did it turn out? was the field-row label's margin, which item 2 sets to 0; without this the note sits 1 px under the Tasting temperature field. The proposal's table says the 12 "stays"; it does not, so this rule is added here */
.notebook-log .segmented-field + .segmented-field{margin-top:var(--gap-s)}
/* 3. The axes, 20: the grid's row gap is the one 20 */
.notebook-log .axes-grid__group > .axis-mark{margin-top:0}
.notebook-log .axes-grid__group > .axes-cue{margin-bottom:calc(var(--gap-s) - var(--gap-m))}
/* 4. The two seams: At draw and From freezer 12 under the note's underline (sketch 010 D13) */
.notebook-log .note-block + .mo-group,.notebook-log .batch-margin__field + .mo-group{margin-top:var(--gap-s);padding-top:0;border-top:0}
/* 5. Under the cue, 12 */
.notebook-log .mo-group .segmented-field__head{margin-bottom:var(--gap-s)}
/* 6. The Tasting head: 18 under it, as the Batch head row */
.notebook-log .tasting-head{margin-bottom:var(--app-notebook-log-group-gap)}
/* 7. The caption option (decide-p10-at-draw-caption, recommended; the word is open): the inserted caption keeps the caption's own 6 to the options. app.css's .segmented-field__caption{margin-bottom:0} would take it, so the proposal needs this one rule it does not list */
.notebook-log .mo-group .segmented-field__caption:not(.axes-cue){margin-bottom:var(--gap-xs)}
'''

def proposed_markup(h):
    """Item 7, the caption option: a 12 px caption between the cue's head and the two options in each .mo-group (At draw, From freezer)."""
    return re.sub(r'(<div class="segmented-field mo-group"[^>]*?data-mo="([^"]+)"[^>]*><div class="segmented-field__head">.*?</div>)',
                  lambda m: m.group(1) + f'<span class="pen-caption segmented-field__caption" id="{m.group(2)}-why">Why blank</span>', h, flags=re.S)

SURFACE = ('pen', 'Record pen with a tasting · from the Batch head row to Cancel / Save batch', '.batch-row__head', '.save-ceremony')
VARIANTS = [('b', 'As built (app/dist at HEAD, the build the iPad shows)', ''), ('p', 'Proposed (the change set of 2026-10-22 on revision 2a; At draw and From freezer drawn with the caption option)', PROPOSED_CSS)]

SIZES = LADDER.SIZES; COLORS = LADDER.COLORS; GAPS = LADDER.GAPS; spec = LADDER.spec
def gap_name(px):
    """The one token the interval reads, or "no token": a reserve plus a margin (the proposal's finding); sums of tokens are not named."""
    return GAPS[round(px)] if abs(px - round(px)) <= 0.15 and round(px) in GAPS else 'no token'
def fmt(px): return str(round(px)) if abs(px - round(px)) <= 0.15 else '%.1f' % px

LOGX = 976; LW, AW, DW, GAP = 366, 430, 180, 60
CSS_BY = {}
def css_for(v, extra):
    if v not in CSS_BY: CSS_BY[v] = PL.css_for(1366, True, 'lv' + v, extra=extra)
    return CSS_BY[v]
def panel_html(v, pid):
    h = printstart.drop_hidden(CAP); h = proposed_markup(h) if v == 'p' else h
    return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet"></div>{h}</div></div>', pid)

def measure_html():
    body = ''
    key, title, s0, s1 = SURFACE
    for v, vn, extra in VARIANTS:
        pid = f'{key}-{v}'; css_for(v, extra)
        body += f'<div class="p4-win lv{v} {pid}" data-pid="{pid}" data-start="{esc(s0)}" data-end="{esc(s1)}" style="width:1366px;position:relative;margin:0 0 40px 0"><div class="inner" style="width:1366px">{panel_html(v, pid)}</div></div>'
    return f'<!doctype html><meta charset="utf-8"><style>body{{margin:0}}{PL.LABEL}{"".join(CSS_BY.values())}</style>{body}'

LAB = LADDER.LAB + '''
.ld-lab .open{display:block;color:#1475dd}
.ld-dimlab{text-align:left;white-space:nowrap}
.ld-dimlab small,.ld-dimlab .was{display:inline}
'''
def column(v, extra, x, y, other):
    """One panel with its dimensions at the left and its role labels at the right; `other` is the paired variant's measurement for marking the deltas."""
    key = SURFACE[0]; pid = f'{key}-{v}'; m = M.get(pid); css_for(v, extra)
    if not m: return '', 0
    y0, h = m['start'], m['end'] - m['start']
    px = x + DW
    win = (f'<div class="p4-win lv{v} {pid}" style="position:absolute;left:{px}px;top:{y}px;width:{LW}px;height:{h}px;">'
           f'<div style="width:1366px;transform:translate(-{LOGX}px,{-y0:g}px);">{panel_html(v, pid)}</div></div>')
    ann = ''
    og = {(g['a'], g['b']): g for g in other['gaps']} if other else {}
    last = -1000; DLH = 17
    for g in m['gaps']:
        top = y + g['from'] - y0; gh = g['to'] - g['from']
        if gh <= 0: continue
        o = og.get((g['a'], g['b'])); changed = v == 'p' and (o is None or round(o['to'] - o['from']) != round(gh)); on = ' on' if changed else ''
        was = (' <span class="was">new</span>' if o is None else f' <span class="was">was {fmt(o["to"] - o["from"])}</span>') if changed else ''
        my = top + gh / 2; ly = max(my - 8, last + DLH); last = ly; dx = x + DW - 14
        ann += (f'<div class="ld-dim{on}" style="left:{dx}px;top:{top}px;height:{gh}px;"></div>'
                f'<div class="ld-lead{on}" style="left:{dx - 22}px;top:{my}px;width:16px;"></div>'
                f'<div class="ld-drop{on}" style="left:{dx - 22}px;top:{min(my, ly + 8)}px;height:{abs(ly + 8 - my)}px;"></div>'
                f'<div class="ld-dimlab{on}" style="left:{x}px;top:{ly}px;width:{DW - 28}px;">{fmt(gh)} <small>{esc(gap_name(gh))}</small>{was}</div>')
    orl = {r['role']: r for r in other['roles']} if other else {}
    last = -1000; LH = 16
    for r in sorted(m['roles'], key=lambda r: r['top']):
        o = orl.get(r['role']); changed = v == 'p' and (o is None or spec(o) != spec(r)); on = ' on' if changed else ''
        ly = max(y + r['top'] - y0 - 4, last); lines = -(-len(r['role'] + spec(r)) // 60) + (-(-len(spec(o)) // 60) if changed and o else 0) + (2 if r['role'] == 'Control caption' else 0)
        last = ly + lines * LH + 8
        ey = y + r['top'] - y0 + r['height'] / 2; kx = px + LW + 16; ty = ly + 8
        was = ('' if o is None else f'<span class="was">was {esc(spec(o))}</span>') if changed else ''
        if r['role'] == 'Control caption': was += '<span class="open">decide-p10-at-draw-caption: the caption option, recommended; the word ("Why blank" or "Reason") is open</span>'
        ann += (f'<div class="ld-lead{on}" style="left:{px + r["right"] + 4}px;top:{ey}px;width:{kx - px - r["right"] - 4}px;"></div>'
                f'<div class="ld-drop{on}" style="left:{kx}px;top:{min(ey, ty)}px;height:{abs(ty - ey)}px;"></div>'
                f'<div class="ld-lead{on}" style="left:{kx}px;top:{ty}px;width:10px;"></div>'
                f'<div class="ld-tick{on}" style="left:{px + r["right"]}px;top:{y + r["top"] - y0}px;height:{r["height"]}px;"></div>'
                f'<div class="ld-lab{on}" style="left:{px + LW + 28}px;top:{ly}px;width:{AW - 28}px;"><b>{esc(r["role"])}</b> {esc(spec(r))}{was}</div>')
    return win + ann, max(h, last + LH - y)

KEY = ('<b>The pen as built beside the proposal of 2026-10-22</b> (.impeccable/proposals/2026-10-22-batch-route-layout.md, for look-p10-batch-route-layout). Both columns are the built app\'s own markup and stylesheets: the record pen with its tasting open on Mexican Chocolate v4, '
       'filled as the layout probe filled it, at 1366 under a coarse pointer (the iPad\'s engine and width, WebKit; the device itself is unverified). '
       '<b>The change set, tokens only:</b> the two-line caption reserve goes from the log (a field caption is its line; a segmented or axis head is the 20 px cue line); 6 from a caption to its control; 12 between fields, under a cue over a control and under the seam rule; '
       '20 between axes and from From freezer\'s options to Every recipe; 32 between groups and above Cancel / Save batch; At draw and From freezer 12 under the note\'s underline (sketch 010 D13); 18 under the Tasting head as under the Batch head. '
       '<b>Faces:</b> ladder revision 2a (P10_LogLadder), unchanged by this change set: region name 14/600 caps secondary, group cue 14/600 sentence ink on the 20 px line, caption 12/600 caps secondary as a tag, content 14/400. '
       '<b>At draw and From freezer</b> are drawn with the caption option of decide-p10-at-draw-caption (recommended, not decided): a 12 px caption between the cue and its two options, the word open ("Why blank" here). '
       '<b>Reads with it:</b> every dimension is measured on this board in WebKit, from a label\'s text line to the next label\'s text line or the next control\'s box (so a reserved caption box does not count as text); the token beside it is the one the interval reads, "no token" where a reserve and a margin add up to it. '
       'In the proposed column only what changes is blue, with "was" (or "new") beside it. '
       '<b>What the drawing shows the proposal did not say:</b> a 12 px caption on the 20 px head line (Exit consistency, Airiness, Melt style) sits 8 over its options and 13.8 under the control before it, not 6 and 12, because baseline alignment leaves the line\'s spare 3.8 under the caption; '
       'an axis name moves 1.5 px when its axis is picked (Clear\'s baseline), so the axes read 21 / 22.3 and 8.7 / 10, not one 20; Tasting to Tasted reads 31, not 18, because the head row is the 44 px Remove tasting button\'s and the name sits in it; '
       'How did it turn out? to Melt test reads 15.3, not 12, the textarea\'s 3.3 px inline descent in the note block; and two rules the change set needs but does not list are drawn here (12 above the note block, since the field label\'s margin it relied on is set to 0; the inserted caption\'s own 6).')
TITLE = 'The batch route\'s pen rhythm · as built beside the proposal of 2026-10-22: the reserve removed, 6 / 12 / 20 / 32, At draw and From freezer with the caption option (open), at 1366 (for Mark\'s look)'

def build(out):
    parts = []; y = 150; bw = 0
    key, title, s0, s1 = SURFACE
    parts.append(f'<div style="position:absolute;left:0;top:{y}px;width:1900px;"><p class="p4-lab">{esc(title)}</p></div>'); y += 40
    x = 0; rowh = 0
    for v, vn, extra in VARIANTS:
        other = M.get(f'{key}-{"p" if v == "b" else "b"}')
        parts.append(f'<div style="position:absolute;left:{x}px;top:{y}px;width:{DW + LW + AW}px;"><p class="p4-lab" style="font-size:13px;color:#595959">{esc(vn)}</p></div>')
        html, h = column(v, extra, x, y + 40, other); parts.append(html); rowh = max(rowh, h + 40); x += DW + LW + AW + GAP
    bw = max(bw, x - GAP); y += rowh + 60
    body = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;"><div class="ld-key" style="left:0;top:0;width:{bw}px;">{KEY}</div>{"".join(parts)}</div>'
    css = PL.LABEL + ''.join(CSS_BY.values()) + LAB
    open(out + '/project/P10_PenRhythm.dc.html', 'w').write(printstart.board(TITLE, body, bw, y, css, paper=True))
    return bw, y

if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        os.makedirs(sys.argv[2] + '/project', exist_ok=True); open(sys.argv[2] + '/measure.html', 'w').write(measure_html()); print('ok')
    else:
        c = json.load(open(sys.argv[1])); os.makedirs(sys.argv[2] + '/project', exist_ok=True); w, h = build(sys.argv[2])
        fn = 'P10_PenRhythm.dc.html'
        prev = c['boards']['P10_LogLadder.dc.html']; PAGE = prev['page']; x = prev['x'] + prev['w'] + 240
        c['boards'][fn] = {**dict(x=x, y=prev.get('y', 0), page=PAGE), **c['boards'].get(fn, {}), 'w': w, 'h': h, 'title': TITLE}
        if fn not in c['order']: c['order'].append(fn)
        c['pages'] = [pg for pg in c['pages'] if pg['id'] == PAGE] + [pg for pg in c['pages'] if pg['id'] != PAGE]      # the page in play stays first
        c['notes']['p10-pen-rhythm-title'] = dict(c['notes'].get('p10-pen-rhythm-title', {}), x=x, y=-300, text='The pen\'s rhythm: as built and proposed, one column each', kind='title1', maxW=w, page=PAGE)
        json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(w, h)
