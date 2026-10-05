import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 41's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 41): decision 34's option A (start-aligned small info labels, a dot, then the count, state or date) at the phone, 393 and 723. Mark, 2026-10-04: "the phone too: Sid draws 393 and 723 first".
# Quick 261004-igr built A from 724 up; below 724 nothing is built. Every panel is the built app's own shell markup (labels-capture.json: WebKit, coarse pointer, the dist of 2026-10-04 after quick 261004-ly7)
# with the app's own stylesheets resolved at the panel's width and, in the A columns, igr's block moved down to the phone (declaration for declaration). The captions' numbers come from labels-measure.json
# (labels-measure.mjs measures the probe board this file also writes). Nothing here edits app/.
LC = json.load(open(HERE + '/labels-capture.json'))
LM = json.load(open(HERE + '/labels-measure.json')) if os.path.exists(HERE + '/labels-measure.json') else {}
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
LC = {k: drop_hidden(v).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in LC.items()}
STAMP_L = " (decision 41, drawn 2026-10-04, awaiting Mark's look; nothing approved)"
# igr's (min-width: 724px) block, moved to the phone; the batch head's gap is the column gap only (decision 42: 16px, the head's own, stays between lines)
A_CSS = ('.notebook .fold-row{justify-content:flex-start}\n'
         '.notebook .fold-row__count::before,.notebook .notebook-jump__status::before{content:"\\00b7";margin-right:var(--app-notebook-recipe-rail-gap)}\n'
         '.notebook-jump{justify-content:flex-start}\n'
         '.notebook-log .batch-row__head{justify-content:flex-start;column-gap:var(--gap-l)}\n')
def wm(html, W):
    # the build's header since quick 261004-ly8 is not the markup final.py's with_menu expects; the crops here are the log's rows, so the header is left as captured
    try: return with_menu(html, W)
    except AssertionError: return html
def batches(html):
    """The Batches fold row (two or more batches), constructed from the Tasting fold row's own markup: the app draws it only with two batches and none is seeded."""
    a = 'aria-label="Tasting, Show, tasted date unknown"'; assert a in html
    html = html.replace(a, 'aria-label="Batches, Show, 3 batches"', 1)
    b = 'Tasting<span class="fold-row__control">Show</span></span><span class="fold-row__count">tasted date unknown</span>'; assert b in html
    return html.replace(b, 'Batches<span class="fold-row__control">Show</span></span><span class="fold-row__count">3 batches</span>', 1)
def tasting_dated(html):
    """The Tasting row with a date: constructed (the seeded tasting has none)."""
    assert 'tasted date unknown</span>' in html
    return html.replace('tasted date unknown</span>', 'tasted 4 Aug 2026</span>', 1)
KINDS = {  # kind: (the opening tag the crop is cut from, short name)
    'history': ('<button type="button" class="fold-row" aria-expanded="false" aria-controls="fold-history" aria-label="History,', 'History'),
    'jump': ('<a class="notebook-jump"', 'Go to batch'),
    'tasting': ('<button type="button" class="fold-row" aria-expanded="false" aria-controls="fold-tasting" aria-label="Tasting,', 'Tasting'),
    'batches': ('<button type="button" class="fold-row" aria-expanded="false" aria-controls="fold-tasting" aria-label="Batches,', 'Batches'),
    'head': ('<div class="batch-row__head">', 'Batch head'),
}
def mark(html, kind):
    pat = KINDS[kind][0]; assert pat in html, (kind, pat)
    return html.replace(pat, pat.replace(' class=', ' data-m="row" class=', 1), 1)
PANELS = []
def panel(pid, W, html, cap, css='', crop=None):
    p = dict(pid=pid, W=W, html=html, cap=cap, css=css, crop=crop); PANELS.append(p); return p
def rect(pid, n): return RM_.get(pid, {}).get(n)
RM_ = LM
def facts(pid):
    m = LM.get(pid)
    if not m: return ''
    s = 'Row %g wide, %g tall' % (m['row']['w'], m['row']['h'])
    if m.get('gap') is not None: s += '; control word to the info %g px' % m['gap']
    if m.get('wrap') is not None: s += '; ' + m['wrap']
    return s + '.'
ROWH = 70; LABH = 84
def labels_board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:3200px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:3200px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=p['css']))
            html = unique_ids(wm(p['html'], W), vid)
            r = rect(p['pid'], 'row')
            y0, hh = ((r['y'] - 10, r['h'] + 20) if r else (0, 100)); x0, ww = 0, W
            if p['crop'] and r: hh += p['crop'].get('below', 0); x0, ww = max(0, r['x'] - 16), r['w'] + 32
            cells.append((vid, W, html, y0, hh, p['cap'], p['pid'], x0, ww)); rowh = max(rowh, hh)
        for vid, W, html, y0, hh, cap, pid, x0, ww in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{facts(pid)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_L, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_L[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_L, snap=snap)
ENTRIES_L = {}
SRC = {'history': ('mex3', lambda h: h), 'jump': ('mex3', lambda h: h), 'jump2': ('olive1', lambda h: h), 'tasting': ('olive1', lambda h: h), 'tasting2': ('olive1', tasting_dated), 'batches': ('olive1', batches), 'head': ('olive1', lambda h: h)}
ROWS = [
  ('history', 'History · "History, Show" then the version count (Mexican Chocolate v3, 4 versions)', 'The whole row is one button, full width, 44px tall; only the order of its parts changes. The dot is CSS: the markup and the accessible name ("History, Show, 4 versions") are the build\'s.'),
  ('jump', 'Go to batch · the control word then the state (Mexican Chocolate v3, Awaiting tasting)', 'One link, full width, at least 44px tall. Its states are Tasted, Awaiting tasting and Not yet churned.'),
  ('jump2', 'Go to batch · Tasted (Olive Oil v1)', ''),
  ('tasting', 'Tasting · "Tasting, Show" then the date (Olive Oil v1, tasted date unknown)', 'The log\'s own fold row, the same button as History\'s.'),
  ('tasting2', 'Tasting · with a date (constructed: the seeded tasting has none)', 'The same row with "tasted 4 Aug 2026", from the built row\'s markup.'),
  ('batches', 'Batches · "Batches, Show" then the count (constructed: the app draws it only with two batches, and none is seeded)', 'The Tasting row\'s markup with the words of the Batches row.'),
  ('head', 'The batch head · "Batch", the churn date, then Correct and Record another (Olive Oil v1)', 'The actions follow the date 32px later where they fit on the line (723) and wrap under it where they do not (393), as the head does today; the head keeps its height.'),
]
def build_board():
    rows = []
    for kind, rtitle, rdesc in ROWS:
        base, fix = SRC[kind]; k0 = kind.rstrip('2')
        pn = []
        for W in (393, 723):
            html = mark(fix(LC[f'{base}_{W}']), k0)
            pn.append(panel(f'{kind}-built-{W}', W, html, f'As built · {W}', ''))
            pn.append(panel(f'{kind}-A-{W}', W, html, f'A · {W} · start-aligned with a dot', A_CSS))
        rows.append((rtitle, rdesc, pn))
    labels_board('R35C_InfoPhone', 'info-labels-phone', 'C · decision 34 at the phone · the small info labels, option A (start-aligned, a dot, then the count, state or date) beside as built, at 393 and 723: History, Go to batch, Tasting, Batches and the batch head', rows)
def write_probe():
    css_parts = []; body = ''; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['css']))
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="display:none;position:absolute;left:0;top:0;width:{W}px;"><div style="width:{W}px;">{unique_ids(wm(p["html"], W), vid)}</div></div>\n'
    main = f'<div style="position:relative;width:1700px;height:7000px;background:#ffffff;">{body}</div>'
    write_board('R35C_InfoPhoneProbe', 'probe', 1700, 7000, main, "@font-face{font-family:'Caveat';font-weight:400;src:url('file://" + os.path.abspath(os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')) + "') format('woff2')}\n" + ''.join(css_parts) + '[hidden]{display:none !important}')   # the probe is opened from a file with no network: the hand's own file, so the heights are the served board's
HEAD_BEFORE = '.notebook-log .batch-row__head{justify-content:space-between;gap:var(--app-notebook-log-head-outer-gap)}\n'   # before decision 34: the head's own rule, igr's block undone
HEAD_A2 = '.notebook-log .batch-row__head{column-gap:var(--gap-l);row-gap:var(--app-notebook-log-head-outer-gap)}\n'                # Mark, 2026-10-04: keep the head's height: 32 between date and actions, the head's own 16 between lines
def build_head_board():
    rows = []
    for W, label, desc in ((1366, '1366 and up · the 350 log column beside the Sheet', 'The actions wrap under the date in a 350px column: the date line is 18px and the actions 44px, so the head is 78.2px with a 16px gap between the two lines.'),
                           (744, '744 to 1365 · the log below the Sheet, full width', 'The actions fit on the date\'s line; the head is 44px with every option, only the gap between date and actions changes.')):
        html = mark(LC[f'olive1_{W}'], 'head'); pn = []
        for o, cap, css in (('before', 'Before decision 34 · space between, 16px gap', HEAD_BEFORE), ('A', 'A as built (quick 261004-igr) · 32px both ways', ''), ('A2', 'A redrawn · 32px between date and actions, 16px between lines (recommended)', HEAD_A2)):
            pn.append(panel(f'headrow-{o}-{W}', W, html, cap, css, crop={'below': 40}))
        rows.append((label, desc, pn))
    labels_board('R35C_InfoHead', 'info-labels-batch-head', 'C · decision 34, the batch head from 744 up: before, A as built (32px both ways) and A redrawn so the head keeps its height (32px between date and actions, 16px between lines)', rows)
build_board(); build_head_board(); write_probe()
json.dump({'boards': ENTRIES_L}, open(OUT + '/labels-canvas-entries.json', 'w'), indent=2)
print('ok labels', {fn: (e['w'], e['h']) for fn, e in ENTRIES_L.items()}, 'measured' if LM else 'not measured yet')
