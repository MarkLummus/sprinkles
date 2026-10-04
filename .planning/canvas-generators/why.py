import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 37's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 37): the Why row in the version details. Todo .planning/todos/pending/2026-09-27-why-row-in-version-details.md (Mark, 2026-09-27: "add a note to look into the Why row").
# Every panel is the built app's own shell markup (why-capture.json: WebKit, the dist of 2026-10-04; 1600 fine pointer, 1366 and 393 coarse) with the app's own stylesheets resolved at the panel's
# width; the options move one block of CSS per column (and, for the hand, one class). The captions' numbers come from why-measure.json (why-measure.mjs measures the probe board this file
# also writes), so they are what the panel draws. Nothing here edits app/.
WC = json.load(open(HERE + '/why-capture.json'))
WM = json.load(open(HERE + '/why-measure.json')) if os.path.exists(HERE + '/why-measure.json') else {}
WC = {k: drop_hidden(v) for k, v in WC.items()}
STAMP_W = " (decision 37, options for Mark; drawn 2026-10-04, awaiting Mark's look; nothing approved)"

# ---- markup and CSS moves ------------------------------------------------------------------------------------------------------------------------------------------------
def mark(html):
    """Names the elements a crop and a measurement are cut from (data-m)."""
    for pat, name in (('<section class="notebook-version"', 'ver'), ('<dl class="notebook-version__details"', 'dl'), ('<dt class="versions__lineage-label version-row__reason-label"', 'whyl'),
                      ('<dd class="version-row__reason', 'whyv'), ('<dd class="versions__lineage version-row__written"', 'wr')):
        assert pat in html, pat
        html = html.replace(pat, pat.replace(' class=', ' data-m="%s" class=' % name, 1), 1)
    return html
def hand(html):
    """DESIGN.md's Hand entry and decision 17: the saved Why in the hand (the .app-hand role, Caveat, sheet pen blue). The built page uses .prose-text (the text face, 16px)."""
    assert 'version-row__reason prose-text' in html
    return html.replace('version-row__reason prose-text', 'version-row__reason app-hand', 1)
# the role's size and leading win over .version-row__reason's own note size (app.css 637 comes after .app-hand at 403 and ties on specificity)
HAND_CSS = '.version-row__reason.app-hand{font-size:max(var(--size-hand),var(--size-hand-min));line-height:var(--leading-hand)}\n'
# A: inline like Written: the label in the first track, the value in the second, first baselines level
A_CSS = '.version-row__reason-label{grid-column:1;margin-top:0;align-self:baseline}.version-row__reason{grid-column:2;margin:0;align-self:baseline}\n'
# B: its own line under the label, flush with it: the one stray value is the user agent's 40px start margin on a dd the lineage rule never reached
B_CSS = '.version-row__reason{margin-inline-start:0}\n'

# ---- panels and board ------------------------------------------------------------------------------------------------------------------------------------------------------
PANELS = []
def panel(pid, W, html, cap, css=''):
    p = dict(pid=pid, W=W, html=html, cap=cap, css=css); PANELS.append(p); return p
def rect(pid, name): return WM.get(pid, {}).get(name)
def window(p):
    v = rect(p['pid'], 'ver')
    if not v: return 0, 0, 380, 300
    return v['x'] - 12, v['y'] - 12, v['w'] + 24, v['h'] + 24
def facts(pid):
    """The panel's measured numbers: left edges of the label, Written's value and the Why value, the Why value's height, the section's height."""
    dl = rect(pid, 'dl'); l = rect(pid, 'whyl'); v = rect(pid, 'whyv'); w = rect(pid, 'wr'); ver = rect(pid, 'ver')
    if not (dl and l and v and w): return ''
    return 'Label at %d, Written value at %d, Why value at %d (%+d from the label); Why value %d tall; section %d tall.' % (l['x'] - dl['x'], w['x'] - dl['x'], v['x'] - dl['x'], v['x'] - l['x'], v['h'], ver['h'])
ROWH = 70; LABH = 66
def why_board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2200px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:2200px">{rdesc}</p></div>\n'
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
    fn = write_board(key, title + STAMP_W, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_W[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_W, snap=snap)
ENTRIES_W = {}

def build_board():
    rows = []
    for W, pl in ((1600, '1600 · fine pointer'), (1366, '1366 · iPad landscape, coarse pointer'), (393, '393 · phone, coarse pointer')):
        # saved Why (Mexican Chocolate v3, the seeded Why, 151 characters; the only seeded version with one)
        m3 = WC[f'mex3_{W}']
        rows.append((f'{pl} · a saved Why (Mexican Chocolate v3)', 'As built, A and B draw the saved words in the hand (Caveat 22px, sheet pen blue, as DESIGN.md\'s Hand entry and decision 17 say); the last panel is B in the text face the app draws today (Georgia 16px).', [
            panel(f'saved-built-{W}', W, mark(m3), f'As built · {W}'),
            panel(f'saved-A-{W}', W, mark(hand(m3)), f'A · inline like Written, in the hand', HAND_CSS + A_CSS),
            panel(f'saved-B-{W}', W, mark(hand(m3)), f'B (recommended) · its own line, flush with the label, in the hand', HAND_CSS + B_CSS),
            panel(f'saved-Bt-{W}', W, mark(m3), f'B in the text face the app draws today', B_CSS)]))
        # no Why, with a From version row (Mexican Chocolate v2): the label column is the widest
        m2 = WC[f'mex2_{W}']
        o1 = WC[f'olive1_{W}']
        rows.append((f'{pl} · no Why, with From version (Mexican Chocolate v2) and without (Olive Oil v1, a first version)', 'The label column is as wide as its widest label: 97px with From version, 58px without. The empty value stays in the printed system\'s grotesk, ink, 13px, in every option.', [
            panel(f'none-built-{W}', W, mark(m2), f'As built · v2 · {W}'),
            panel(f'none-A-{W}', W, mark(m2), f'A · inline · v2', A_CSS),
            panel(f'none-B-{W}', W, mark(m2), f'B (recommended) · own line · v2', B_CSS),
            panel(f'first-built-{W}', W, mark(o1), f'As built · v1 · {W}'),
            panel(f'first-A-{W}', W, mark(o1), f'A · inline · v1', A_CSS),
            panel(f'first-B-{W}', W, mark(o1), f'B (recommended) · own line · v1', B_CSS)]))
    why_board('R35C_WhyRow', 'why-row', 'C · the Why row in the version details: as built, A (inline like Written) and B (its own line, flush with the label), with a saved Why and with none, at 1600, 1366 and 393', rows)

# ---- the probe: every panel at natural size, for why-measure.mjs ------------------------------------------------------------------------------------------------------------
def write_probe():
    css_parts = []; body = ''; y = 0; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid, extra=p['css']))
        body += f'<div data-pid="{p["pid"]}" class="fp-win {vid}" style="position:absolute;left:0;top:{y}px;width:{W}px;"><div style="width:{W}px;">{unique_ids(with_menu(p["html"], W), vid)}</div></div>\n'
        y += 7000
    main = f'<div style="position:relative;width:1700px;height:{y}px;background:#ffffff;">{body}</div>'
    write_board('R35C_WhyProbe', 'probe', 1700, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')

build_board()
write_probe()
json.dump({'boards': ENTRIES_W}, open(OUT + '/why-canvas-entries.json', 'w'), indent=2)
print('ok why', {fn: (e['w'], e['h']) for fn, e in ENTRIES_W.items()}, 'measured' if WM else 'not measured yet')
