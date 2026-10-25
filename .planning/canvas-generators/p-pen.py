import json, re, os, sys, html as _html, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart
from cssscope import unique_ids
import places as PL
PR = importlib.import_module('p-pen-rhythm')      # the 2026-10-22 change set, the faces (ladder revision 2a via p-ladder), the column drawing
# Sid, 2026-10-25: P10_Pen, the one proposed pen. Every row Mark answered on 2026-10-24 applied together (decide-p10-log-ladder-r2 revised with the cues as h3,
# decide-p10-at-draw-caption caption, decide-p10-pen-caption-align flex-end, decide-p10-control-text-size-r2 fourteen, decide-p10-reading-head-interval eighteen,
# "(Not recorded)" out of the pen, answer A on the cognitive-load section) plus his 2026-10-25 instruction (Tasting a region, a peer of Batch; "Tasting temperature"
# to "Temperature"), on the record pen with its tasting open, both entry paths (A: Record another then Add tasting, Olive Oil v1; B: Record a tasting from Home,
# Mexican Chocolate v3), at 1366 coarse and 393 (p-pen-capture.mjs). As built beside it at 1366 (path A). Every interval and role measured on the board in WebKit
# (p-pen-measure.mjs); in a proposed column what changes against as built is blue with "was".
#   node p-pen-capture.mjs <dist> ; python3 p-pen.py measure <out> ; node p-pen-measure.mjs <out>/measure.html ; python3 p-pen.py <canvas.json read from the artifact root> <out>
CAP = json.load(open(HERE + '/p-pen-capture.json'))
M = json.load(open(HERE + '/p-pen-measure.json')) if os.path.exists(HERE + '/p-pen-measure.json') else {}
esc = lambda s: _html.escape(str(s), quote=True)

PEN = '.notebook-log .batch-margin--pen'
PROPOSED_CSS = PR.PROPOSED_CSS.replace('align-items:baseline', 'align-items:flex-end') + f'''
/* decide-p10-pen-caption-align: flex-end (above, the rhythm change set's baseline replaced); nothing moves on a pick */
/* decide-p10-control-text-size-r2: the pen's choice controls at the content size */
{PEN} .axis-mark__stop, {PEN} .segmented__option {{ font-size: var(--app-size-meta); }}
/* decide-p10-log-ladder-r2, revised with headings: a cue is an h3 under its region's h2; the heading element adds nothing of its own */
.notebook-log h3.axes-cue, .notebook-log h3.pen-caption {{ margin: 0; }}
/* Mark, 2026-10-25: Tasting a region, a peer of Batch. The pen's two heads share the Batch head's grammar and one height (the touch floor, the fold row's own);
   18 under each (the reading's head interval, decide-p10-reading-head-interval); the region seam above Tasting: gap-m, the row hairline, gap-m */
.notebook-log .batch-row:has(.batch-margin--pen) > .batch-row__head, {PEN} .batch-row__head {{ min-height: var(--touch-min); align-items: center; }}      /* the Batch head's 18 is the section's own row gap (app-notebook-log-group-gap); the Tasting head, inside the pen, carries the same 18 itself */
{PEN} .batch-row__head {{ margin-bottom: var(--app-notebook-log-group-gap); }}
{PEN} .batch-row__head--tasting {{ margin-top: var(--gap-m); padding-top: var(--gap-m); border-top: var(--app-rule-row) solid var(--app-divider); }}
{PEN} .batch-row__head-lead {{ display: flex; align-items: baseline; gap: var(--app-notebook-recipe-rail-gap); }}
{PEN} .batch-row__head-acts {{ margin-left: auto; }}
{PEN} .batch-row__head .tasting-status:empty {{ display: none; }}
/* Mark, 2026-10-25: the churn trio on one line (Churned, Out of machine, Duration). The date field's token comes down to 120 app-wide (WebKit's intrinsic date box is 109.3 at 16 px); mirrored here as the token the app would carry in tokens.css */
.notebook-log {{ --sheet-field-w-date: 120px; }}
'''

def proposed_markup(h):
    h = PR.proposed_markup(h)                                                                   # the caption option on At draw and From freezer; "(Not recorded)" out
    h = re.sub(r'<(span|p)( class="[^"]*\baxes-cue\b[^"]*"[^>]*)>(.*?)</\1>', r'<h3\2>\3</h3>', h, flags=re.S)       # the cues as h3
    h = re.sub(r'(<div class="defects-head">)<p( class="pen-caption"[^>]*)>(.*?)</p>', r'\1<h3\2>\3</h3>', h, flags=re.S)       # Any problems?: a cue (decide-p10-any-problems-level-r2)
    # Tasting a region: the Batch head's grammar, h2, lead (name, status) and acts (Restore, Remove)
    h = re.sub(r'<div class="mo-end tasting-head"><h3 class="region-name">Tasting</h3>(<p class="tasting-status[^>]*>.*?</p>)(.*?)</div>',
               r'<div class="batch-row__head batch-row__head--tasting"><div class="batch-row__head-lead"><h2 class="region-name">Tasting</h2>\1</div><div class="batch-row__head-acts">\2</div></div>', h, count=1, flags=re.S)
    h = h.replace('>Tasting temperature<', '>Temperature<')                                      # the addendum: the label under an h2 Tasting
    h = h.replace('<span class="pen-caption">Churn date</span>', '<span class="pen-caption">Churned</span>').replace('<span class="pen-caption">Churn duration</span>', '<span class="pen-caption">Duration</span>')      # Mark, 2026-10-25: the churn trio on one line; the words are his (decide-p10-churn-trio)
    return h

PANELS = [      # pid, variant, path, width, label
    ('pen-b-A-1366', 'b', 'A', 1366, 'As built · Add tasting after a churn · 1366'),
    ('pen-p-A-1366', 'p', 'A', 1366, 'Proposed · Add tasting after a churn · 1366'),
    ('pen-p-B-1366', 'p', 'B', 1366, 'Proposed · Record a tasting (opens onto the tasting) · 1366'),
    ('pen-p-A-393', 'p', 'A', 393, 'Proposed · Add tasting after a churn · 393'),
    ('pen-p-B-393', 'p', 'B', 393, 'Proposed · Record a tasting · 393'),
]
S0, S1 = '.batch-row__head', '.save-ceremony'
def cls_of(v, W): return f'pp{v}{W}'
def css_for(v, W): return PR.css_for(cls_of(v, W), PROPOSED_CSS if v == 'p' else '', W, True)
PIDS = {}
def panel_html(v, pid):
    """p-pen-rhythm's column() calls panel_html(v, pid) from its own module; this one is installed there (PR.panel_html = panel_html) so its column draws these panels."""
    path, W = PIDS[pid]; v = 'p' if pid.startswith('pen-p') else 'b'      # the variant is the pid's (p-pen-rhythm's column passes its own letter)
    h = printstart.drop_hidden(CAP[f'{path}_{W}']['html']); h = proposed_markup(h) if v == 'p' else h
    return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet"></div>{h}</div></div>', pid)
PR.panel_html = panel_html
for pid, v, path, W, _ in PANELS: PIDS[pid] = (path, W)

def measure_html():
    body = ''
    for pid, v, path, W, _ in PANELS:
        cls = cls_of(v, W); css_for(v, W)
        body += f'<div class="p4-win {cls} {pid}" data-pid="{pid}" data-start="{esc(S0)}" data-end="{esc(S1)}" style="width:{W}px;position:relative;margin:0 0 40px 0"><div class="inner" style="width:{W}px">{panel_html(v, pid)}</div></div>'
    return f'<!doctype html><meta charset="utf-8"><style>body{{margin:0}}{PL.LABEL}{"".join(PR.CSS_BY.values())}</style>{body}'

KEY = ('<b>The one proposed pen (2026-10-25).</b> Every row Mark answered on 2026-10-24, applied together on the record pen with its tasting open: ladder revision 2 (region name 14/600 caps secondary; cue 14/600 sentence ink; caption 12/600 caps secondary as a tag; content 14/400) with the cues as h3 under the region\'s h2; '
       'the rhythm change set of 2026-10-22 (the caption reserve gone, 6 / 12 / 20 / 32, At draw and From freezer with a caption on their options, the word still open: "Why blank" here); pen captions flex-end on the head line; the choice controls at 14; 18 under each head; "(Not recorded)" out of the pen (answer A). '
       '<b>Tasting is a region, a peer of Batch</b> (Mark, 2026-10-25): an h2 in the Batch head\'s own grammar (the name and the status line in the lead, Restore and Remove tasting in the acts), one 44 px head row for both heads, the region seam above it (20, the row hairline, 20) where the pen had the 32 px group seam and no rule, 18 under it as under Batch. '
       'The region appears on Add tasting and Record a tasting opens the pen with it present (decide-p10-tasting-gate, recommended); the two ceremonies and Clear are untouched. '
       '<b>"Tasting temperature" is "Temperature"</b> (Mark, 2026-10-25): the row Tasted · Tempering · Temperature fits one line at 1366 and 393 (327 in 350 / 353; the long label made 386 and wrapped); the word is Mark\'s ("Served at" is the other defensible one). '
       '<b>The churn trio on one line</b> (Mark, 2026-10-25): Churned · Out of machine · Duration, the Batch region\'s mirror of the tasting row, with the date field at 120 (the token --sheet-field-w-date, app-wide; WebKit\'s intrinsic date box is 109.3 at 16 px): 120 + 12 + 119.5 + 12 + 82 = 345.5 in 350 / 353. As built the three are one field row that wraps (128 + 12 + 111.5 + 12 + 116.3 = 380, Churn duration on a second line). The words are Mark\'s (decide-p10-churn-trio): "Churned" parallels "Tasted" and the fold\'s own "churned 2 Aug 2026"; "Duration" drops the repeated churn. '
       '<b>Reads with it:</b> every interval is measured on this board in WebKit from a label\'s text line to the next text line or control box; the token beside it is the one the interval reads. In a proposed column what changes against as built is blue with "was" or "new". '
       'Path A is Record another on Olive Oil v1 then Add tasting, filled; path B is Record a tasting from Home on Mexican Chocolate v3 (an untasted batch), the same pen opened onto its tasting. Device-unverified: WebKit on the Mac, not the iPad.')
TITLE = 'The record pen, proposed · every decided row of 2026-10-24 and Tasting as a peer region (2026-10-25), both entry paths, at 1366 beside as built and at 393 (for Mark\'s look: look-p10-ladder-redraw)'
LW393 = 409
def build(out):
    parts = []; y = 190; bw = 0
    rows = [[p for p in PANELS if p[3] == 1366], [p for p in PANELS if p[3] == 393]]
    for row in rows:
        x = 0; rowh = 0
        for pid, v, path, W, lab in row:
            cls = cls_of(v, W); css_for(v, W); lw = PR.LW if W == 1366 else LW393
            other = M.get('pen-b-A-1366') if v == 'p' else None
            parts.append(f'<div style="position:absolute;left:{x}px;top:{y}px;width:{PR.DW + lw + PR.AW}px;"><p class="p4-lab" style="font-size:13px;color:#595959">{esc(lab)}</p></div>')
            html, h = PR.column(pid, cls, M.get(pid), x, y + 40, other, lw=lw); parts.append(html); rowh = max(rowh, h + 40); x += PR.DW + lw + PR.AW + PR.GAP
        bw = max(bw, x - PR.GAP); y += rowh + 80
    body = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;"><div class="ld-key" style="left:0;top:0;width:{bw}px;">{KEY}</div>{"".join(parts)}</div>'
    css = PL.LABEL + ''.join(PR.CSS_BY.values()) + PR.LAB
    open(out + '/project/P10_Pen.dc.html', 'w').write(printstart.board(TITLE, body, bw, y, css, paper=True))
    return bw, y

if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        os.makedirs(sys.argv[2] + '/project', exist_ok=True); open(sys.argv[2] + '/measure.html', 'w').write(measure_html()); print('ok')
    else:
        c = json.load(open(sys.argv[1])); os.makedirs(sys.argv[2] + '/project', exist_ok=True); w, h = build(sys.argv[2])
        fn = 'P10_Pen.dc.html'
        prev = c['boards']['P10_PenRhythm.dc.html']; PAGE = prev['page']; x = prev['x'] + prev['w'] + 240
        c['boards'][fn] = {**dict(x=x, y=prev.get('y', 0), page=PAGE), **c['boards'].get(fn, {}), 'w': w, 'h': h, 'title': TITLE}
        if fn not in c['order']: c['order'].append(fn)
        c['notes']['p10-pen-title'] = dict(c['notes'].get('p10-pen-title', {}), x=x, y=-300, text='The record pen, proposed: every decided row and Tasting as a peer region, both entry paths, 1366 and 393', kind='title1', maxW=w, page=PAGE)
        json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(w, h)
