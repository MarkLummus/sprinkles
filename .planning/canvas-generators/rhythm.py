import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 39's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 39): the rhythm of the Version details (Written, From version, Why). Todo .planning/todos/pending/2026-10-04-sid-needs-to-review-the-rhythm-of-the-version-section-detail.md
# (Mark: "there is more vertical space between From Version and Why than there is between Written and From Version").
# Every panel is the built app's own shell markup (rhythm-capture.json: WebKit, the dist of 2026-10-04 after quick 261004-ly6; 1600 fine pointer, 1366 and 393 coarse) with the app's own stylesheets resolved at the
# panel's width; the options move one or two rules. The captions' numbers come from rhythm-measure.json (rhythm-measure.mjs measures the probe board this file also writes), so they are what the panel draws.
# Nothing here edits app/.
RC = json.load(open(HERE + '/rhythm-capture.json'))
RM = json.load(open(HERE + '/rhythm-measure.json')) if os.path.exists(HERE + '/rhythm-measure.json') else {}
# the build since quick 261004-ly8 draws the wordmark as a link; final.py's with_menu adds that link itself to the older header markup it expects, so the capture is put back (the crop is the Version section only)
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
RC = {k: drop_hidden(v).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in RC.items()}
STAMP_RH = " (decision 39, options for Mark; drawn 2026-10-04, awaiting Mark's look; nothing approved)"

def mark(html):
    """Names the elements a crop and a measurement are cut from (data-m)."""
    for pat, name in (('<section class="notebook-version"', 'ver'), ('<dl class="notebook-version__details"', 'dl')):
        assert pat in html, pat
        html = html.replace(pat, pat.replace(' class=', ' data-m="%s" class=' % name, 1), 1)
    return html
def with_batch(html):
    """A version that cites a batch: the From batch row the app draws after Why (VersionRow.jsx), constructed because no seeded version cites one."""
    row = ('<dt class="versions__lineage-label">From batch</dt><dd class="versions__lineage version-row__batch-provenance"><a tabindex="0" href="/notebook/mexican-chocolate/mexican-chocolate-v2/batch" data-discover="true">2 Jan 2026</a></dd>')
    m = re.search(r'(<dd class="version-row__reason[^"]*">.*?</dd>)(</dl>)', html, flags=re.S)
    assert m, 'no why dd'
    return html[:m.end(1)] + row + html[m.start(2):]
# the options: the as-built rule is `.version-row__reason-label { margin-top: var(--gap-s) }` (app.css 636), 12px on top of the list's 4px row gap
A_CSS = '.version-row__reason-label{margin-top:0}\n'
B_CSS = '.notebook-version__details{row-gap:8px}.version-row__reason-label{margin-top:0;margin-bottom:-4px}\n'
C_CSS = '.version-row__reason-label{margin-top:var(--gap-hair);margin-bottom:-4px}\n'
OPT = (('built', 'As built', ''), ('A', 'A · one 4px gap', A_CSS), ('B', 'B (recommended) · one 8px gap', B_CSS), ('C', 'C · the facts untouched', C_CSS))

PANELS = []
def panel(pid, W, html, cap, css=''):
    p = dict(pid=pid, W=W, html=html, cap=cap, css=css); PANELS.append(p); return p
def rect(pid, name): return RM.get(pid, {}).get(name)
def window(p):
    v = rect(p['pid'], 'ver')
    if not v: return 0, 0, 380, 300
    return v['x'] - 12, v['y'] - 12, v['w'] + 24, v['h'] + 24
def facts(pid):
    """The panel's measured numbers: the box gap and the ink gap between successive lines of the details, the details' height, the Version section's height."""
    m = RM.get(pid)
    if not m or 'gaps' not in m: return ''
    g = m['gaps']
    box = ' / '.join('%g' % x for x in g['box']); ink = ' / '.join('%g' % x for x in g['ink'])
    return 'Gaps between lines, box %s px; seen (ink) %s px. Details %g tall; section %g tall.' % (box, ink, m['dl']['h'], m['ver']['h'])
ROWH = 70; LABH = 66
def rhythm_board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2400px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:2400px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-')
            W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=p['css']))
            html = unique_ids(with_menu(p['html'], W), vid)
            x0, y0, ww, hh = window(p); cells.append((vid, W, html, x0, y0, ww, hh, p['cap'], p['pid'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap, pid in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{facts(pid)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_RH, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_RH[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_RH, snap=snap)
ENTRIES_RH = {}

def build_board():
    rows = []
    PL = {1600: '1600 · fine pointer', 1366: '1366 · iPad landscape, coarse pointer', 393: '393 · phone, coarse pointer'}
    for W in (1600, 1366, 393):
        for st, what, desc in (('mex3', 'a saved Why (Mexican Chocolate v3, with From version)', 'The saved Why is in the hand, flush with its label, as quick 261004-ly6 built it. A: Why loses its 12px top margin, the list keeps its 4px row gap. B: the list takes an 8px row gap and the Why label is tucked 4px to its words. C: Why keeps 2px of top margin and the label sits on its words.'),
                               ('mex2', 'no Why (Mexican Chocolate v2, with From version)', 'The empty value stays in the printed system\'s grotesk, 13px, in every option.'),
                               ('olive1', 'no Why and no From version (Olive Oil v1, a first version)', 'Written, then Why: the same extra space sits under Written.')):
            html = mark(RC[f'{st}_{W}'])
            rows.append((f'{PL[W]} · {what}', desc, [panel(f'{st}-{o}-{W}', W, html, cap, css) for o, cap, css in OPT]))
    html = mark(with_batch(RC['mex3_1366']))
    rows.append((f'{PL[1366]} · a saved Why and a From batch row (constructed: no seeded version cites a batch)', 'The app draws From batch after Why, so as built the row sits 4px under the saved words while Why has 16px above it. B tucks the Why label 4px closer to its words (its box gap to them stays 4).',
                 [panel(f'batch-{o}-1366', 1366, html, cap, css) for o, cap, css in OPT]))
    rhythm_board('R35C_Rhythm', 'version-details-rhythm', 'C · the rhythm of the Version details (Written, From version, Why): as built, A (one 4px gap), B (one 8px gap) and C (the facts untouched), with a saved Why, with none and in a first version, at 1600, 1366 and 393', rows)

# ---- the probe: every panel at natural size, one shown at a time, for rhythm-measure.mjs ------------------------------------------------------------------------------------
def write_probe():
    css_parts = []; body = ''; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['css']))
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="display:none;position:absolute;left:0;top:0;width:{W}px;"><div style="width:{W}px;">{unique_ids(with_menu(p["html"], W), vid)}</div></div>\n'
    main = f'<div style="position:relative;width:1700px;height:7000px;background:#ffffff;">{body}</div>'
    write_board('R35C_RhythmProbe', 'probe', 1700, 7000, main, ''.join(css_parts) + '[hidden]{display:none !important}')

build_board()
write_probe()
json.dump({'boards': ENTRIES_RH}, open(OUT + '/rhythm-canvas-entries.json', 'w'), indent=2)
print('ok rhythm', {fn: (e['w'], e['h']) for fn, e in ENTRIES_RH.items()}, 'measured' if RM else 'not measured yet')
