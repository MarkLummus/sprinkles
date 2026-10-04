import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 38's board
from cssscope import APP_ROOT
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 38): the App-context radius, drawn against the rail's active place. Todo .planning/todos/pending/2026-09-22-settle-app-context-radius-then-revisit-rail-active-item.md.
# Every panel is the built app's own shell markup (radius-capture.json: WebKit, the dist of 2026-10-04, 1600 fine pointer; Home for the rail and the lead block, the Next version pen for the
# ceremony fields and its two actions) with the app's own stylesheets (home.css too) resolved at 1600; each option moves the radius tokens and one rule on the rail's places. Crops come from
# radius-measure.json (radius-measure.mjs measures the probe board this file also writes). Nothing here edits app/.
RC = json.load(open(HERE + '/radius-capture.json'))
RM = json.load(open(HERE + '/radius-measure.json')) if os.path.exists(HERE + '/radius-measure.json') else {}
RC = {k: drop_hidden(v) for k, v in RC.items()}
HOMEC = open(os.path.join(APP_ROOT, 'home.css')).read() + '\n'
HOME_CSS = resolve_media(HOMEC, 1600, True)
STAMP_R = " (decision 38, options for Mark; drawn 2026-10-04, awaiting Mark's look; nothing approved)"
W = 1600

def mark(html, pen):
    pairs = [('<nav class="shell__rail"', 'rail')] + ([('<form class="notebook-ceremony"', 'cer')] if pen else [('<section class="home__lead"', 'lead')])
    for pat, name in pairs:
        assert pat in html, pat
        html = html.replace(pat, pat.replace(' class=', ' data-m="%s" class=' % name, 1), 1)
    return html
def tokens(a, f, l): return 'body{--app-radius-action:%dpx;--app-notebook-field-radius:%dpx;--app-radius-lead:%dpx}\n' % (a, f, l)
def rail(n): return '.shell__rail .shell__place{border-radius:%dpx}\n' % n
BOLD = ".shell__rail .shell__place[aria-current='page']{font-weight:600}\n"
FOCUS = '.shell__place--recipe-book{outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)}\n'
ACTIVE_ONLY = ".shell__rail .shell__place[aria-current='page']{border-radius:%dpx}\n"
OPTIONS = {
  'shipped': ('As shipped', '', 'Nav, menu button, tools and tabs square; field 8; filled and outline actions 10; lead block 10 (tokens.css 364, 365, 404; shell.css has no radius on a place).'),
  'A': ('A · one radius, 8px', tokens(8, 8, 8) + rail(8), 'Nav item 8 (board 170), field 8 (board 1600-pen). The filled and outline actions and the lead block move from 10 to 8 (3 rules read --app-radius-action, 1 reads --app-radius-lead).'),
  'B': ('B (recommended) · one radius, 10px', tokens(10, 10, 10) + rail(10), 'Actions and lead block stay at 10. The field moves from 8 to 10 (1 rule); the nav item takes 10 (board 170 draws 8).'),
  'C': ('C · two named values: 8px for rows and fields, 10px for actions and the lead block', rail(8), 'Nothing built moves: the nav item takes board 170\'s 8. A split, so it needs a named exception.'),
}
PANELS = []
def panel(pid, html, pen, css, cap):
    p = dict(pid=pid, html=html, pen=pen, css=css, cap=cap); PANELS.append(p); return p
def rect(pid, n): return RM.get(pid, {}).get(n)
def window(p, what):
    r = rect(p['pid'], what)
    if not r: return 0, 0, 300, 300
    pad = 4 if what == 'lead' else 12
    if what == 'rail': return 0, r['y'] - 6, r['w'], 296        # the rail's six places and two dividers (the nav itself stretches to the page's height)
    return r['x'] - pad, r['y'] - pad, r['w'] + 2 * pad, r['h'] + 2 * pad
ROWH = 70; LABH = 50
def radius_board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n', resolve_media(TOK, W, True)]
    body = ''; y = GAP; bw = 0
    for rtitle, rdesc, cells_spec in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2300px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:2300px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p, what, cap in cells_spec:
            vid = 'fp-' + p['pid'].replace('_', '-') + '-' + what
            css_parts.append(final_css(W, vid, extra=HOME_CSS + p['css']))
            html = unique_ids(with_menu(p['html'], W), vid)
            x0, y0, ww, hh = window(p, what); cells.append((vid, html, x0, y0, ww, hh, cap)); rowh = max(rowh, hh)
        for vid, html, x0, y0, ww, hh, cap in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}</p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_R, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_R[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_R, snap=snap)
ENTRIES_R = {}
def trio(tag, css):
    home = panel(f'{tag}-home', mark(RC['home_1600'], False), False, css, '')
    pen = panel(f'{tag}-pen', mark(RC['mex3pen_1600'], True), True, css, '')
    return home, pen
def build_board():
    rows = []
    for k, (name, css, desc) in OPTIONS.items():
        home, pen = trio(k, css)
        rows.append((name, desc, [(pen, 'rail', 'The rail · Notebook active'), (home, 'rail', 'The rail · Home active'), (pen, 'cer', 'Ceremony field and actions'), (home, 'lead', 'Lead block and actions')]))
    # the active place's weight (board 170 draws 600; the app draws 400) on the 10px option, and the focus ring with the radius on every place or on the active place only
    css = OPTIONS['B'][1]
    wh, wp = trio('wt', css + BOLD)
    fa_h, fa_p = trio('focus-all', css + FOCUS)
    fo_h, fo_p = trio('focus-one', tokens(10, 10, 10) + ACTIVE_ONLY % 10 + FOCUS)
    rows.append(('The active place\'s weight, and the focus ring', 'Drawn on B. Left: weight 600 as boards 170 and 171 draw it (the app draws 400). Middle: the radius on every place, so the focus ring on Recipe book follows it. Right: the radius on the active place only, so a focused place keeps a square ring.',
                 [(wp, 'rail', 'Weight 600 · Notebook active'), (wh, 'rail', 'Weight 600 · Home active'), (fa_p, 'rail', 'Radius on every place · focus on Recipe book'), (fo_p, 'rail', 'Radius on the active place only · focus on Recipe book')]))
    radius_board('R35C_AppRadius', 'app-radius', 'C · the App-context radius against the rail\'s active place: as shipped, A (one 8px), B (one 10px) and C (8px and 10px), and the weight and focus ring', rows)
def write_probe():
    css_parts = [resolve_media(TOK, W, True)]; body = ''; y = 0
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-')
        css_parts.append(final_css(W, vid, extra=HOME_CSS + p['css']))
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="position:absolute;left:0;top:{y}px;width:{W}px;"><div style="width:{W}px;">{unique_ids(with_menu(p["html"], W), vid)}</div></div>\n'
        y += 3000
    main = f'<div style="position:relative;width:1700px;height:{y}px;background:#ffffff;">{body}</div>'
    write_board('R35C_RadiusProbe', 'probe', 1700, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
build_board(); write_probe()
json.dump({'boards': ENTRIES_R}, open(OUT + '/radius-canvas-entries.json', 'w'), indent=2)
print('ok radius', {fn: (e['w'], e['h']) for fn, e in ENTRIES_R.items()}, 'measured' if RM else 'not measured yet')
