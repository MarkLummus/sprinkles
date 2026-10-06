import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds the redrawn phone boards of decision 41's question 2
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-04 (decision 41, question 2; Mark: "Redraw the other boards with the dots now"; decision 38: the one 10px App radius): the phone boards, 393-batch, 723-batch, 393-phone-log, 723-phone-log and 393-all-folded, redrawn
# from the built app. Every panel is the build's own shell markup (phone-capture.json: WebKit, coarse pointer, the preview server on 4173, the dist of 2026-10-04 after quick 261004-ly8) with the app's own tokens.css, app.css, shell.css and
# notebook.css resolved at the panel's width. Two blocks of the final design are laid on, both parts the build does not have below 724 yet: P3 (the phone table's struck figure under the plan amount: decision 24 as amended, brief task 1)
# and decision 41's A (the small info labels start-aligned with a dot, 32px from the control word to the count, state or date: Mark, 2026-10-04, "the phone too"). The radius (10px, decision 38), the weight 600 of the active rail place
# (the phone has the tab row: it keeps its shipped weight and takes the radius), the Why in the hand, the wordmark link and the Go to batch row are the build's own. The old hand-drawn boards (gen.py, phonelog.py, allfolded.py) are
# replaced: they drew the History row, the Go to batch row and the batch head from hand markup (history-disclosure), not the build's, and carried the square tab places and the far-end counts. Nothing here edits app/.
PC = json.load(open(HERE + '/phone-capture.json')); PG = json.load(open(HERE + '/phone-geo.json'))
PC = {k: drop_hidden(v) for k, v in PC.items()}
P3 = sec(OPT, 'P3')
A_CSS = ('.notebook .fold-row{justify-content:flex-start}\n'
         '.notebook .fold-row__count::before,.notebook .notebook-jump__status::before{content:"\\00b7";margin-right:var(--app-notebook-recipe-rail-gap)}\n'
         '.notebook-jump{justify-content:flex-start}\n'
         '.notebook-log .batch-row__head{justify-content:flex-start;column-gap:var(--gap-l)}\n')   # igr's block (notebook.css 1057 to 1085), moved down to the phone; the batch head's gap is the column gap only (decision 42)
STAMP_P = " (redrawn 2026-10-04 from the build with decision 41's dots and decision 38's radius; drawn, awaiting Mark's look; nothing approved)"
RECIPE_P = {'mex3off': 'Mexican Chocolate v3 · a parent, a batch awaiting its tasting; Show changes off, constructed As made figures',
            'mex3': 'Mexican Chocolate v3 · a parent, four versions, a batch awaiting its tasting; Show changes on, constructed As made figures',
            'olive1': 'Olive Oil v1 · a tasted batch, its real As made figures; one version, so no History row',
            'under2': 'Underbelly Light Base v2 · a parent, no batch yet, Show changes on'}
def pcss(W, vid):
    """The build's own rules at W, and P3 and the dots only where the build does not have them (quicks 261004-ox7 and 261004-ox5 built them at 18:57 and 18:49; before that they were drawn on top)."""
    return final_css(W, vid, extra=('' if built_p3(W) else P3) + ('' if built_dots(W) else A_CSS))
def phone_html(state, W, fix=None):
    html = PC[f'{state}_{W}']
    if fix: html = fix(html)
    return with_menu(html, W)
PCAP_H = 200   # the captions here run to six lines at 393
def phone_board(key, snap, title, W, states, caps=None):
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]; body = ''; x = GAP; H = 0
    for st in states:
        vid = f'fp-{st}-{W}'; css_parts.append(pcss(W, vid)); g = PG[f'{st}_{W}']; h = int(g['docH']) + 4; H = max(H, h)
        html = unique_ids(phone_html(st, W), vid)
        cap = (caps or {}).get(st, '')
        body += (f'<div style="position:absolute;left:{x}px;top:{GAP}px;width:{W}px;"><div style="height:{PCAP_H}px;"><p class="fp-title">{RECIPE_P[st].split(" · ")[0]} · {W} wide</p><p class="fp-sub">{RECIPE_P[st].split(" · ", 1)[1]}. {cap} Page {g["docH"]:,}px; the band {g["band"]["h"]:g}px.</p></div>'
                 f'<div class="fp-win {vid}" style="width:{W}px;height:{h}px;"><div style="width:{W}px;">{html}</div></div></div>\n')
        x += W + GAP
    bw, bh = x, GAP + PCAP_H + 8 + H + GAP
    fn = write_board(key, title + STAMP_P, bw, bh, f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>', ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_PH[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP_P, snap=snap)
ENTRIES_PH = {}
NOTE = ('The small info labels read from the left with a dot (decision 41: 32px from the control word to the count, state or date; not built below 724 yet), the table\'s struck figures stand under the plan amount (decision 24, D3; not built yet); '
        'everything else, the tab row with its 10px places, the Go to batch row, the Why in the hand and the folds, is the build\'s own.')

# ---- 393-batch and 723-batch -----------------------------------------------------------------------------------------------------------------------------------------------
for W in (393, 723):
    phone_board('R35C_%d' % W, '%d-batch' % W, 'C · %d · the phone page, as the build draws it with decision 41\'s dots: Mexican Chocolate v3 and Olive Oil v1' % W, W, ['mex3', 'olive1'], {'mex3': NOTE, 'olive1': ''})

# ---- the band and the log, by the state of the batch (decision 30) -----------------------------------------------------------------------------------------------------------
def window_board(key, snap, title, W, states, desc):
    """Each state's band (to the History row) and its log, two cropped windows one above the other, as decision 30's boards drew the three states side by side."""
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]; body = ''; x = GAP; Htot = 0
    for st, label, sub in states:
        vid = f'fp-{st}-{W}'; css_parts.append(pcss(W, vid)); g = PG[f'{st}_{W}']; html = unique_ids(phone_html(st, W), vid)
        band_h = int(g['band']['y'] + g['band']['h'] + 12)
        lg = g['log']; log_y = int(lg['y']) - 10; log_h = int(lg['h']) + 60
        y = GAP
        body += f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{CAP_H}px;"><p class="fp-title">{label} · {W} wide</p><p class="fp-sub">{sub}</p></div></div>\n'
        y += CAP_H + 8
        body += (f'<div class="fp-win {vid}" style="position:absolute;left:{x}px;top:{y}px;width:{W}px;height:{band_h}px;"><div style="width:{W}px;">{html}</div></div>\n')
        y += band_h + GAP
        body += (f'<div class="fp-win {vid}" style="position:absolute;left:{x}px;top:{y}px;width:{W}px;height:{log_h}px;"><div style="width:{W}px;transform:translateY(-{log_y}px);">{html.replace("id=", "data-id=")}</div></div>\n')
        y += log_h + GAP; Htot = max(Htot, y); x += W + GAP
    bw, bh = x, Htot
    fn = write_board(key, title + STAMP_P, bw, bh, f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>', ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_PH[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP_P, snap=snap)
for W in (393, 723):
    window_board('R35C_%dPhoneLog' % W, '%d-phone-log' % W, 'C · %d · Go to batch, the filled action and the log, by the state of the batch (decision 30), as the build draws them with decision 41\'s dots' % W, W,
                 [('olive1', 'A tasted batch', 'Olive Oil v1. Record another is the filled action; the Go to batch row reads Tasted; the log below holds the batch and its tasting.'),
                  ('mex3', 'A batch awaiting its tasting', 'Mexican Chocolate v3. Record a tasting is the filled action; the Go to batch row reads Awaiting tasting; the log says the batch has not been tasted yet.'),
                  ('under2', 'No batch yet', 'Underbelly Light Base v2. Record a batch is the filled action; the Go to batch row reads Not yet churned and jumps to the log; Show changes is at the Ingredients head (decision 30\'s addendum, option 3).')], '')


# ---- decision 30's addendum, option 3: Show changes at the Ingredients head, three states (393-show-changes-head, 723-show-changes-head) ----------------------------------------------------------
def head_board(key, snap, title, W, states):
    """The band and the Ingredients region of each state, one window to the foot of the table: the build's own markup, so the control sits where the build puts it (the Ingredients head, right-aligned, below 724)."""
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]; body = ''; x = GAP; Hm = 0
    for st, label, sub in states:
        vid = f'fp-{st}-{W}-head'; css_parts.append(pcss(W, vid)); g = PG[f'{st}_{W}']; html = unique_ids(phone_html(st, W), vid)
        h = int(g['ing']['y'] + g['ing']['h'] + 24); Hm = max(Hm, h)
        body += (f'<div style="position:absolute;left:{x}px;top:{GAP}px;width:{W}px;"><div style="height:{PCAP_H}px;"><p class="fp-title">{label}</p><p class="fp-sub">{sub}</p></div>'
                 f'<div class="fp-win {vid}" style="width:{W}px;height:{h}px;"><div style="width:{W}px;">{html}</div></div></div>\n')
        x += W + GAP
    bw, bh = x, GAP + PCAP_H + 8 + Hm + GAP
    fn = write_board(key, title + STAMP_P, bw, bh, f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>', ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_PH[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP_P, snap=snap)
for W in (393, 723):
    head_board('R35C_%dShowChangesHead' % W, '%d-show-changes-head' % W, 'C · %d · Show changes at the head of the Ingredients table (decision 30\'s addendum, option 3), as the build draws it: changes hidden, changes shown, a version with no parent' % W, W,
               [('mex3off', 'Changes hidden · Show changes at the table\'s head', 'Mexican Chocolate v3, a batch awaiting tasting. The band keeps Record a tasting, Next version and Go to batch; Show changes sits on the Ingredients row, right-aligned.'),
                ('mex3', 'Changes shown · Hide changes, the struck figure under the new', 'The same page after Show changes: the control reads Hide changes and the table draws decision 24 as amended 2026-10-03 (the plan amount, As made, then the struck figure).'),
                ('olive1', 'No parent · no control', 'Olive Oil v1 has no parent: the Ingredients row is the heading alone and the band is the approved one.')])

# ---- 393-all-folded: an exploration (Mark, 2026-09-27): every section closed to its label and a Show control, to see the page height ------------------------------------------------
def fold_btn(label, ctl='Show', count=None):
    c = f'<span class="fold-row__count">{count}</span>' if count else ''
    return f'<button type="button" class="fold-row" aria-expanded="false" aria-label="{label}, {ctl}" tabindex="0"><span class="fold-row__head">{label}<span class="fold-row__control">{ctl}</span></span>{c}</button>'
def balanced(html, i, tag):
    depth = 0
    for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', html[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: return i + t.end()
def all_folded(html):
    """The Ingredients, Instructions and Batch sections do not fold in the build (decision 18's folds are Version, History, Balance, Watch for and Tasting): drawn closed with the fold row's own markup, as the exploration asked."""
    for tag_open, label in (('<section class="ingredient-table-region" aria-label="Ingredients">', 'Ingredients'), ('<section class="method-region" aria-label="Instructions">', 'Instructions')):
        i = html.index(tag_open); j = balanced(html, i, 'section')
        html = html[:i] + tag_open + f'<h2 class="region-name">{fold_btn(label)}</h2></section>' + html[j:]
    i = html.index('<aside class="notebook-log" aria-label="Batch">'); j = balanced(html, i, 'aside')
    date = re.search(r'<span class="fold-row__count">([^<]*)</span>', html[i:j]).group(1)   # Sid, 2026-10-06: the build's Batch head is a fold row since 261004-uyd (decision 50); its count carries the churned date, not the old batch-row__date span
    html = html[:i] + '<aside class="notebook-log" aria-label="Batch"><section class="batch-row" aria-label="Batch">' + fold_btn('Batch', 'Show', date) + '</section></aside>' + html[j:]
    return html
def folded_board():
    W = 393; st = 'mex3'; vid = f'fp-{st}-{W}-folded'
    css = resolve_media(TOK, W, True) + LABEL_CSS + pcss(W, vid)
    html = unique_ids(phone_html(st, W, all_folded), vid)
    # the page's own height, measured from the board (folded.json written by phone-measure.mjs), else a generous default
    h = FOLDED_H or 1700
    cap = ('Every section closed to its label and a Show control, to see the page height. The build folds Version, History, Balance and Watch for; Ingredients, Instructions and the Batch are closed here with the same fold row (they do not fold in the build). '
           'The Batch row reads "Batch · Show · churned date unknown" with the dot like the Tasting row.')
    body = (f'<div style="position:absolute;left:{GAP}px;top:{GAP}px;width:{W}px;"><div style="height:{CAP_H + 40}px;"><p class="fp-title">Mexican Chocolate v3 · {W} wide · all folded</p><p class="fp-sub">{cap}</p></div>'
            f'<div class="fp-win {vid}" style="width:{W}px;height:{h}px;"><div style="width:{W}px;">{html}</div></div></div>')
    bw, bh = GAP + W + GAP, GAP + CAP_H + 40 + 8 + h + GAP
    title = 'C · 393 · exploration · every section folded, to see the page height'
    fn = write_board('R35C_393AllFolded', title + STAMP_P, bw, bh, f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>', css + '[hidden]{display:none !important}')
    ENTRIES_PH[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP_P, snap='393-all-folded')
FOLDED_H = json.load(open(HERE + '/phone-measure.json')).get('folded_h') if os.path.exists(HERE + '/phone-measure.json') else None
folded_board()
json.dump({'boards': ENTRIES_PH}, open(OUT + '/phone-canvas-entries.json', 'w'), indent=2)
print('ok phone', {fn: (e['w'], e['h']) for fn, e in ENTRIES_PH.items()})
