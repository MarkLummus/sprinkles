import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 40's boards
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 40): the record pen in App context, the batch log reading and recording, redrawn on today's build. Todo .planning/todos/pending/2026-09-25-draw-the-record-pen-in-app-context.md.
# Decision 29 (2026-10-02, approved) drew the recording state at 350 and 393 beside the pen as built; it was never built, and three things since change its basis: decision 38 (one 10px App radius,
# --app-radius-control, which retired --app-notebook-field-radius and --app-radius-action that decision 29's skin read), decision 34 (dot-separated labels, built) and the For Sid note on group cues.
# Every panel is the built app's own log markup (recordpen-capture.json: WebKit coarse, the dist of 2026-10-04 after quick 261004-ly7, Olive Oil v1) with the app's own stylesheets resolved at the window
# (1366 for the 350 column, 393 for the phone) and one added block, SKIN (colour, radius, rule colour; no size moves). The captions' numbers come from recordpen-measure.json (recordpen-measure.mjs
# measures the probe board this file also writes). Nothing here edits app/.
RPC = json.load(open(HERE + '/recordpen-capture.json'))
RPM = json.load(open(HERE + '/recordpen-measure.json')) if os.path.exists(HERE + '/recordpen-measure.json') else {}
STAMP_P = " (decision 40, drawn 2026-10-04, awaiting Mark's look; nothing approved)"
# decision 29's skin with decision 38's token: the one App control radius
SKIN = '''
.notebook-log *{border-color:var(--app-divider)}
.notebook-log .pen-caption{color:var(--app-text-secondary)}
.notebook-log .ink-field{border-radius:var(--app-radius-control);color:var(--app-text)}
.notebook-log .axis-mark__stop,.notebook-log .segmented__option{border-color:var(--app-text-secondary)}
.notebook-log .axis-mark__stop:first-child,.notebook-log .segmented__option:first-child{border-top-left-radius:var(--app-radius-control);border-bottom-left-radius:var(--app-radius-control)}
.notebook-log .axis-mark__stop:last-child,.notebook-log .segmented__option:last-child{border-top-right-radius:var(--app-radius-control);border-bottom-right-radius:var(--app-radius-control)}
.notebook-log .axis-mark__stop:has(input[type='radio']:checked),.notebook-log .segmented__option:has(input[type='radio']:checked){background:var(--app-blue-text);border-color:var(--app-blue-text);color:var(--app-background)}
.notebook-log .chip-toggle::before{border-color:var(--app-text-secondary);border-radius:var(--app-radius-rail)}
.notebook-log .chip-toggle[aria-pressed='true']::before{background:var(--app-blue-text);border-color:var(--app-blue-text)}
.notebook-log .save-ceremony button{border-color:var(--app-blue-text);border-radius:var(--app-radius-control);color:var(--app-blue-text);background:none}
.notebook-log .save-ceremony button:last-of-type{background:var(--app-blue-text);color:var(--app-background)}
'''
# group-cue options (decision 40, the For Sid note of 2026-10-01): "Every recipe" and "This recipe only" read in the face of the labels they head, 20px from them and 20px from the item before
CUE_FACE = '.notebook-log .axes-cue{font-size:var(--app-size-meta);font-weight:600;text-transform:none;letter-spacing:0;line-height:20px;color:var(--app-text)}\n'
def cue_space(W):
    # at the phone the axis head is 44 tall with its name at the bottom (the Clear control sets the height), so the first label sits 15px lower than at 350: the cue's margin takes the 15px back
    extra = ' - 15px' if W < 724 else ''
    return ('.notebook-log .axes-grid--stacked{gap:var(--gap-l)}\n.notebook-log .axes-grid__group > .axis-mark:first-of-type{margin-top:0}\n'
            '.notebook-log .axes-grid__group > .axes-cue{margin-bottom:calc(var(--gap-s) - var(--gap-m)%s)}\n' % extra +
            '.notebook-log .defects-head{margin-bottom:calc(var(--gap-s) - var(--gap-l))}\n')
def cue_opt(W): return (('built', 'As built (with the skin)', ''), ('A', 'A · the cue\'s face: 14px, 600, sentence case', CUE_FACE), ('B', 'B · the cue\'s space: 32 between groups, 12 to its items', cue_space(W)), ('C', 'C (recommended) · both', CUE_FACE + cue_space(W)))

def tag(html, what, W=1366):
    marks = {'log': ('<aside class="notebook-log"', 'log')}
    pat, name = marks['log']; assert pat in html
    html = html.replace(pat, pat.replace(' class=', ' data-m="log" class=', 1), 1)
    if what == 'cues':
        for pat, name in (('<div class="axes-grid axes-grid--stacked"', 'grid'), ('<p class="pen-caption axes-cue" id="axes-core-cue"', 'cue1')):
            assert pat in html, pat
            html = html.replace(pat, pat.replace(' class=', ' data-m="%s" class=' % name, 1), 1)
    pad = '0'   # the app's own padding (the phone's 20px page margin rides the log's own rule) stands
    return '<div class="notebook" style="padding:%s;max-width:none;display:block">' % pad + html + '</div>'   # the app's own ancestor: notebook.css scopes the fold rows and the dotted labels under .notebook
def pen_css(W, vid, extra=''):
    css = resolve_media(APPC, W, True) + resolve_media(NBC, W, True)
    css = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', css)
    return scope_css(css + extra, '.' + vid)

PANELS = []
def panel(pid, W, col, html, cap, css='', what='log'):
    p = dict(pid=pid, W=W, col=col, html=tag(html, what, W), cap=cap, css=css, what=what); PANELS.append(p); return p
def rect(pid, name): return RPM.get(pid, {}).get(name)
def facts(p):
    m = RPM.get(p['pid'])
    if not m: return ''
    if p['what'] == 'cues':
        g = m['cues']
        return 'Seen gaps: cue to its first label %g, last item to the next cue %g, "Any problems?" to its cue %g, cue to its chips %g px. Region %g tall.' % (g['cue_item'], g['group_cue'], g['head_cue'], g['cue_chips'], g['region'])
    return 'Log %g wide, %g tall; content past the column edge %g px.' % (m['log']['w'], m['log']['h'], m['over'])

ROWH = 70; LABH = 100
def pen_board(key, snap, title, rows, wide=2400):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:{wide}px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:{wide}px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(pen_css(W, vid, SKIN + p['css']))
            html = unique_ids(p['html'], vid)
            r = rect(p['pid'], 'log'); ww = p['col']
            if p['what'] == 'cues':
                c = RPM.get(p['pid'], {}).get('crop') or {'y': 0, 'h': 1200}; y0, hh = c['y'] - 8, c['h'] + 8
            else:
                y0, hh = (r['y'] if r else 0), (r['h'] if r else 1500)
                y0, hh = 0, hh + 24
            cells.append((vid, html, y0, ww, hh, p, W)); rowh = max(rowh, hh)
        for vid, html, y0, ww, hh, p, W in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div style="height:{LABH}px;"><p class="fp-lab">{p["cap"]}<small>{facts(p)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{ww}px;transform:translateY(-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += LABH + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_P, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_P[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_P, snap=snap)
ENTRIES_P = {}

def build_boards():
    rows = []
    for W, col, label in ((1366, 350, '350 · the log column beside the Sheet from 1366 (the 1366 window, coarse pointer)'), (393, 393, '393 · the phone, coarse pointer')):
        rows.append((label, 'Olive Oil v1: its batch as it reads, the pen open from Record another with the tasting not yet added, and the pen with every field typed, the tasting added, stops, segments and two defects picked. The skin is decision 29\'s with decision 38\'s one 10px radius; no size moves.',
                     [panel(f'read-{W}', W, col, RPC[f'read_{W}'], 'Reading · as built (the reading state needs no skin)'),
                      panel(f'blank-{W}', W, col, RPC[f'blank_{W}'], 'Recording · the pen opens'),
                      panel(f'filled-{W}', W, col, RPC[f'filled_{W}'], 'Recording · filled, the tasting added')]))
    pen_board('R35C_RecordPenApp', 'record-pen-app', 'C · the record pen in App context, reading and recording, at the 350 log column and the phone', rows, wide=1240)
    rows = []
    for W, col, label in ((1366, 350, '350 · the log column'), (393, 393, '393 · the phone')):
        rows.append((f'{label} · the group cues: "Every recipe", "This recipe only", "Any problems?"', 'The same filled pen cropped from the first cue to the end of the defects; one or two rules moved per column. The cues read in the labels\' face (12px, 500, small caps, ink); the first cue sits about 60px above its first label, farther than the labels sit from each other and nearer the group before it.',
                     [panel(f'cues-{o}-{W}', W, col, RPC[f'filled_{W}'], cap, css, what='cues') for o, cap, css in cue_opt(W)]))
    pen_board('R35C_RecordPenCues', 'record-pen-cues', 'C · the record pen\'s group cues: as built, A (the cue\'s face), B (its space) and C (both), at the 350 log column and the phone', rows, wide=1700)

def write_probe():
    css_parts = []; body = ''; seen = set()
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(pen_css(W, vid, SKIN + p['css']))
        body += f'<div data-pid="{p["pid"]}" data-what="{p["what"]}" class="fp-win {vid}" style="display:none;position:absolute;left:0;top:0;width:{p["col"]}px;"><div style="width:{p["col"]}px;">{unique_ids(p["html"], vid)}</div></div>\n'
    main = f'<div style="position:relative;width:1700px;height:7000px;background:#ffffff;">{body}</div>'
    write_board('R35C_RecordPenProbe', 'probe', 1700, 7000, main, ''.join(css_parts) + '[hidden]{display:none !important}')

build_boards()
write_probe()
json.dump({'boards': ENTRIES_P}, open(OUT + '/recordpen-canvas-entries.json', 'w'), indent=2)
print('ok recordpen', {fn: (e['w'], e['h']) for fn, e in ENTRIES_P.items()}, 'measured' if RPM else 'not measured yet')
