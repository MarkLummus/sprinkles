import sys; sys.argv=['x']
from gen import *
from cssscope import resolve_media, scope_css, unique_ids, _strip_comments, TOK, APPC, NBC, SHELLC
import json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-03 (decision 33): the wide boards redrawn to the final design Mark settled in decision 32: the fly-out nav (g: no rail, the wordmark a link to Home, a pinned 44px menu
# button), the ladder cuts 984 and 1366 with a Sheet minimum of 920 (no rail in the sums), D3 from 724 up (As made the table's first column, a 56px writing column, absent with no
# batch; the struck figure under the plan amount), the phone's stacked order below 724 (approved boards, unchanged), the Go to batch row from 724 to 1365 wherever the log sits below
# the Sheet, and Balance and Watch for open wherever the Balance column is beside the ingredients (Mark, "Balance folds open"). Every panel is the built app's own shell markup
# (final-capture.json: WebKit, coarse, the dist of 2026-10-03) with the app's own tokens.css, app.css, shell.css and notebook.css, their @media resolved at the panel's window width,
# and the final design's rules moved on top (ingredient-options.css D, D2, D3; nav-candidates.css G, JUMP). These boards REPLACE the canvas keys of the earlier hand-drawn pages
# (R35C_984 ... R35C_1920, R35C_Batch, R35C_NoBatch, R35C_LongHistory, R35C_Pen, the two sticky boards): gen.py still writes those, this file overwrites them after it.
CAP = json.load(open(HERE + '/final-capture.json'))
def drop_hidden(html):
    while True:
        m = re.search(r'<(div|dl|p|ul|ol|section)\b[^>]*\shidden(?:="")?[ >][^>]*>', html)
        if not m: return html
        tag, i, depth, j = m.group(1), m.start(), 0, m.start()
        for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', html[i:]):
            depth += -1 if t.group(1) else 1
            if depth == 0:
                j = i + t.end(); break
        html = html[:i] + html[j:]
CAP = {k: drop_hidden(v) for k, v in CAP.items()}
OPT = open(HERE + '/ingredient-options.css').read(); NCSS = open(HERE + '/nav-candidates.css').read()
def sec(css, name):
    m = re.search(r'/\* === ' + name + r' ===[^*]*\*/([\s\S]*?)(?=/\* === |$)', css); assert m, name; return m.group(1)
D3 = sec(OPT, 'D') + sec(OPT, 'D2') + sec(OPT, 'D3')
G = sec(NCSS, 'G'); GO = sec(NCSS, 'GO'); JUMP = sec(NCSS, 'JUMP'); HDR = sec(NCSS, 'HDR'); HDR724 = sec(NCSS, 'HDR724')
BAR_FROM = 724     # Mark, 2026-10-03, Rule A: the sticky header and the fly-out are the shell from 724 up; the bottom tab row stays only below 724
RAIL_FROM = 1590   # Mark, 2026-10-03: the rail returns where four columns fit (224 + 3 x 32 + 350 + 920 = 1590); the header and the fly-out apply from 724 to 1589
HEAD_H = 57       # the sticky header: 44px targets + 2 x 6px padding + the 1px hairline (header-test.json)
KEBAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle></svg>'
FIX = '.shell{min-height:0;position:relative}.shell__tabs{position:absolute !important;inset-inline:0;inset-block-end:0}.shell__main{min-width:0}.shell__brand a{color:inherit;text-decoration:none}'
LABEL_CSS = '''
.fp-title{font-family:var(--face-grotesk);color:var(--app-text);font-size:20px;line-height:26px;font-weight:600;margin:0}
.fp-sub{font-family:var(--face-grotesk);color:var(--app-text-secondary);font-size:15px;line-height:21px;margin:4px 0 0}
.fp-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''
def with_menu(html, W):
    """Below 724 and from 1590 the wordmark is a link to Home and nothing more (the tab row, or the rail, is the nav); from 724 to 1589 the rail is the fly-out and a menu button stands beside the wordmark (closed)."""
    if W < BAR_FROM or W >= RAIL_FROM:
        w = '<p class="shell__brand">Sprinkles</p>'; assert html.count(w) == 1
        return html.replace(w, '<p class="shell__brand"><a href="/" tabindex="0">Sprinkles</a></p>', 1)
    a = '<header class="shell__head"><div><p class="shell__brand">Sprinkles</p>'
    b = '</div></div><div class="shell__tools">'
    assert html.count(a) == 1 and html.count(b) == 1, 'header markup changed'
    html = html.replace(a, '<header class="shell__head"><div class="shell__lead"><button type="button" class="shell__menu" aria-label="Places" aria-expanded="false" aria-controls="places" tabindex="0">' + KEBAB + '</button><div><p class="shell__brand"><a href="/" tabindex="0">Sprinkles</a></p>', 1)
    return html.replace(b, '</div></div></div><div class="shell__tools">', 1)
def final_css(W, vid, extra=''):
    css = resolve_media(APPC, W, True) + resolve_media(SHELLC, W, True) + resolve_media(NBC, W, True) + FIX
    if W >= BAR_FROM:
        css += HDR.replace('html{scroll-padding-top:57px}', '')      # the sticky header (scroll-padding is on html, which a panel cannot scope)
        if W < RAIL_FROM: css += G                                    # 724 to 1589: the rail is the fly-out, opened from the header's menu button
        if W < 984: css += HDR724                                     # 724 to 983: the header's tools show and the tab row goes
        css += D3
    if BAR_FROM <= W <= 1365: css += JUMP
    return scope_css(css + extra, '.' + vid)
HEIGHTS = json.load(open(HERE + '/final-heights.json')) if os.path.exists(HERE + '/final-heights.json') else {}
FACTS = json.load(open(HERE + '/final-board-measure.json')) if os.path.exists(HERE + '/final-board-measure.json') else {}
CAP_H = 150; GAP = 40
RECIPE = {'mex3': ('Mexican Chocolate v3', 'a parent, a batch in view, Show changes on, constructed As made figures'), 'olive1': ('Olive Oil v1', 'its batch\'s real As made figures; no parent, so no Show changes'),
          'under2': ('Underbelly Light Base v2', 'a parent, no batch yet, Show changes on'), 'base2': ('Standard Base v2', 'no batch yet, no parent'),
          'olive1pen': ('Olive Oil v1, the pen open from Next version', 'edit this step open'), 'mex3pen': ('Mexican Chocolate v3, the pen open from Next version', 'three amounts changed, a step open'),
          'mex3long': ('Mexican Chocolate v3 with eight versions', 'versions 5 to 8 constructed, as the earlier long-history board constructed 3 to 8')}
def facts_line(key):
    f = FACTS.get(key)
    if not f: return ''
    return (f"{f['nav']}; Sheet {f['sheetW']:.0f}, table {f['tableW']:.0f}, name column {f['nameMin']:.0f} ({'no name wraps' if f['maxRows'] == 1 else str(len(f['wrapped'])) + ' names wrap'}); Balance {f['balance']}, log {f['logPos']}. Page {f['docH']:,}px.")
def history_eight(html):
    """8 versions in the horizontal rail: the app's four nodes, then four more built from its 'not churned' node (Version 5 to 8)."""
    ol = re.search(r'(<ol class="notebook-history__nodes">)(.*?)(</ol>)', html, flags=re.S)
    nodes = re.findall(r'<li class="notebook-history__node".*?</li>', ol.group(2), flags=re.S)
    assert len(nodes) == 4
    v2, v4 = nodes[1], nodes[3]
    new4 = v4.replace(' · Latest', '')
    extra = []
    for n, d in ((5, '3 Sep'), (6, '9 Sep'), (7, '14 Sep'), (8, '21 Sep')):
        t = v2.replace('Version 2 · v2', f'Version {n} · v{n}').replace('11 Jan', d).replace('/notebook/mexican-chocolate/mexican-chocolate-v2', f'/notebook/mexican-chocolate/mexican-chocolate-v{n}')
        extra.append(t)
    extra[-1] = extra[-1].replace('not churned', 'not yet churned · Latest')
    html = html.replace(ol.group(0), ol.group(1) + nodes[0] + nodes[1] + nodes[2] + new4 + ''.join(extra) + ol.group(3), 1)
    return html.replace('--app-notebook-history-count: 4;', '--app-notebook-history-count: 8;').replace('4 versions', '8 versions')
def jump_into_version(html):
    """Option: the Go to batch row inside the Version section, directly under the acts, instead of the band grid's third child."""
    m = re.search(r'<a class="notebook-jump".*?</a>', html, flags=re.S); assert m
    row = m.group(0)
    html = html.replace(row, '', 1)
    acts = re.search(r'<div class="notebook-version__acts">.*?</div>', html, flags=re.S); assert acts
    return html.replace(acts.group(0), acts.group(0) + row.replace('class="notebook-jump"', 'class="notebook-jump" style="grid-column:auto"', 1), 1)
def remove_before_note(html):
    """Mark, 2026-10-03 (1600-pen): the remove link stands on the name's line, after the name and the estimated tag, and the split row's portion line goes under both (the app puts the link after the portion line, which is a block, so the link drops under it)."""
    pat = re.compile(r'(<span class="ingredient-table__portion-note">[^<]*</span>)(<span class="ingredient-table__remove-gap">[^<]*</span><button[^>]*>(?:remove|restore)</button>)')
    html, n = pat.subn(lambda m: m.group(2) + m.group(1), html); return html
def panel_html(state, W, jumpin=False, asbuilt=False):
    key = f'{state}_{W}'
    html = CAP[key] if key in CAP else CAP[f'{state.replace("long", "")}_{W}']
    if state == 'mex3long': html = history_eight(html)
    if jumpin: html = jump_into_version(html)
    if state.endswith('pen') and not asbuilt: html = remove_before_note(html)
    return with_menu(html, W)
def page_board(W, states, fn_title, full_title, pstates=None):
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]
    body = ''; x = GAP; H = 0
    keys = []
    for i, st in enumerate(states):
        vid = f'fp-{st}-{W}'
        css_parts.append(final_css(W, vid))
        html = unique_ids(panel_html(st, W), vid)
        h = HEIGHTS.get(f'{st}_{W}', 3200); H = max(H, h)
        rec, what = RECIPE[st]
        fl = facts_line(f'{st}_{W}')
        body += (f'<div style="position:absolute;left:{x}px;top:{GAP}px;width:{W}px;"><div style="height:{CAP_H}px;"><p class="fp-title">{rec} · {W} wide</p><p class="fp-sub">{what}. {fl}</p></div>'
                 f'<div class="fp-win {vid}" style="width:{W}px;height:{h}px;"><div style="width:{W}px;">{html}</div></div></div>\n')
        x += W + GAP
    bw, bh = x, GAP + CAP_H + 8 + H + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    return bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}'
def write_board(key, W_title, bw, bh, main, css):
    fn = key + '.dc.html'
    html = board(W_title, bw, bh, '', extra_css=css)
    html = html.replace(TABLE_CSS, '', 1)
    html = html.replace('<link rel="stylesheet" href="%s">\n' % STYLESHEET, '', 1)
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)
    return fn
STAMP = " (redrawn 2026-10-03 to the final design, decision 33; drawn, awaiting Mark's look)"
BOARDS = [  # canvas key, snapshot name, width, states, short title
  ('R35C_744', '744-batch', 744, ['mex3', 'olive1'], 'C · 744 · iPad mini portrait · the sticky header and the fly-out (no tab row; Rule A), the Sheet in one column, the log below, the Go to batch row, D3'),
  ('R35C_834', '834-batch', 834, ['mex3', 'olive1'], 'C · 834 · 11in iPad Pro portrait · the sticky header and the fly-out (no tab row; Rule A), the Sheet in one column, the log below, the Go to batch row, D3'),
  ('R35C_983', '983-batch', 983, ['mex3', 'olive1'], 'C · 983 · widest with one column · the sticky header and the fly-out (no tab row; Rule A), the Sheet in one column, the log below, the Go to batch row, D3'),
  ('R35C_984', '984-batch', 984, ['mex3', 'olive1'], 'C · 984 · narrowest with two columns · sticky header and fly-out, the Sheet at 920, Balance beside and open, the log below with the Go to batch row'),
  ('R35C_1024', '1024-batch', 1024, ['mex3', 'olive1'], 'C · 1024 · iPad Pro 12.9 portrait · the fly-out, the Sheet in two columns, Balance open beside, the log below with the Go to batch row'),
  ('R35C_1366', '1366-batch', 1366, ['mex3', 'olive1'], 'C · 1366 · iPad Pro 12.9 landscape · the fly-out, the Sheet in two columns at 920, the log beside, folds open'),
  ('R35C_Batch', '1600-batch', 1600, ['mex3', 'olive1'], 'C · 1600 · the rail is back (224, four columns: rail, Sheet, Balance, log), the sticky header without a menu button, folds open'),
  ('R35C_1920', '1920-batch', 1920, ['mex3', 'olive1'], 'C · 1920 · wide · the rail (224) and the sticky header, content capped at 1482 and centred in the area beside the rail'),
  ('R35C_NoBatch', '1600-no-batch', 1600, ['under2', 'base2'], 'C · 1600 · not yet churned · the rail, no As made column until a batch is in view'),
  ('R35C_Pen', '1600-pen', 1600, ['olive1pen', 'mex3pen'], 'C · 1600 · the rail; the pen open from Next version · edit this step, one step open'),
  ('R35C_LongHistory', '1600-long-history', 1600, ['mex3long'], 'C · 1600 · the rail; History as a dated rail, eight versions, scrolling'),
]
ENTRIES = {}
for key, snap, W, states, title in BOARDS:
    bw, bh, main, css = page_board(W, states, snap, title)
    fn = write_board(key, title + STAMP, bw, bh, main, css)
    ENTRIES[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP, snap=snap)

# ---- the band of 724 to 1365: the Go to batch row where the log sits below the Sheet ----
def crop_board(key, snap, title, panels, h):
    css_parts = [LABEL_CSS]; body = ''; x = GAP; seen = set()
    for st, W, cap, *var in panels:
        var = var[0] if var else ''
        vid = f'fp-{st}-{W}-{var or "x"}'
        if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
        css_parts.append(final_css(W, vid))
        html = unique_ids(panel_html(st, W, jumpin=(var == 'jumpin')), vid)
        rec, what = RECIPE[st]
        body += (f'<div style="position:absolute;left:{x}px;top:{GAP}px;width:{W}px;"><div style="height:{CAP_H}px;"><p class="fp-title">{rec} · {W} wide</p><p class="fp-sub">{cap}</p></div>'
                 f'<div class="fp-win {vid}" style="width:{W}px;height:{h}px;"><div style="width:{W}px;">{html}</div></div></div>\n')
        x += W + GAP
    bw, bh = x, GAP + CAP_H + 8 + h + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP, bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP, snap=snap)
GO_CAP = "The band's Go to batch row (decision 30 drew it below 724; Mark, 2026-10-03: it extends wherever the log sits below the Sheet, so up to 1365): in the Version column under Next version and Show changes, History's row grammar, the control word and the batch's status, the whole row one 44px target; it jumps to the log. The row is the app's own and the app hides it above 723; the drawing shows it displayed."
crop_board('R35C_GoToBatchWide', '724-1365-go-to-batch', 'C · 744, 1024 and 1194 · the band with the Go to batch row, where the log sits below the Sheet; and an option with the row inside the Version section',
           [('mex3', 744, GO_CAP + ' Batch awaiting its tasting. As built: the band grid\'s third child.'), ('mex3', 1024, GO_CAP + ' As built: the band grid\'s third child.'), ('olive1', 1194, GO_CAP + ' A tasted batch (Olive Oil v1). As built.'),
            ('mex3', 1024, 'OPTION (Mark has not answered): the row inside the Version section, directly under Next version and Hide changes, 12px below them, so it reads as part of the version\'s acts; a DOM move in the band.', 'jumpin'),
            ('olive1', 1194, 'OPTION: the same, a tasted batch.', 'jumpin')], 900)

# ---- the split row's remove link: as built, and where Mark wants it (decision 26, amended 2026-10-03) ----
def rows_board(key, snap, title, W, state, panels, x0, y0, ww, hh):
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]; body = ''; x = GAP
    for i, (cap, asbuilt) in enumerate(panels):
        vid = f'fp-rows{i}-{W}'
        css_parts.append(final_css(W, vid))
        html = unique_ids(panel_html(state, W, asbuilt=asbuilt), vid)
        body += (f'<div style="position:absolute;left:{x}px;top:{GAP}px;width:{ww}px;"><div style="height:{CAP_H}px;"><p class="fp-title">{"As built" if asbuilt else "Proposed"} · {W} wide, the pen open</p><p class="fp-sub">{cap}</p></div>'
                 f'<div class="fp-win {vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
        x += ww + GAP
    bw, bh = x, GAP + CAP_H + 8 + hh + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP, bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP, snap=snap)
rows_board('R35C_RemoveLink', '1600-remove-link', 'C · 1600 · the split row\'s remove link: as built, and on the name\'s line', 1600, 'olive1pen',
           [('The app today, and what the wide authority showed before this redraw: the portion line ("120 g of 370.4 g · 46.3% in all") is a block that comes before the link in the cell, so the link falls under it, away from the name and the estimated tag.', True),
            ('PROPOSED (Mark, 2026-10-03: the link should be next to estimated): the link follows the name and the tag on the name\'s line, with the same 14px gap, and the portion line goes under both. Only the DOM order of the cell changes: name, tag, link, then the line.', False)], 294, 1050, 580, 330)

# ---- the pinned menu button and the fly-out, where decision 27 drew the pinned rail options ----
KEBAB_STYLED = KEBAB.replace('<svg ', '<svg style="width:20px;height:20px;transform:rotate(90deg)" ')
def rail_nav(html):
    m = re.search(r'<nav class="shell__rail".*?</nav>', html, flags=re.S); assert m
    return m.group(0)
def sticky_board(key, snap, title, W, vh, scroll, state):
    css_parts = [resolve_media(TOK, W, True), LABEL_CSS]
    body = ''; x = GAP
    for i, opened in enumerate((False, True)):
        vid = f'fp-sticky{i}-{W}'
        css_parts.append(final_css(W, vid))
        base = panel_html(state, W)
        nav = rail_nav(CAP[f'{state}_{W}'])
        html = unique_ids(base, vid); nav = unique_ids(nav, vid)
        # the sticky header, drawn where it stands when the page is scrolled: at the window's top, over the page (a sticky element has no scroll container in a drawing)
        hdr = re.search(r'<header class="shell__head">.*?</header>', html, flags=re.S).group(0)
        bar = hdr.replace('<header class="shell__head">', '<header class="shell__head" style="position:absolute;top:0;left:0;right:0;z-index:7">', 1)
        if opened: bar = bar.replace('aria-expanded="false"', 'aria-expanded="true"', 1)
        flyout = ''
        if opened:
            nav = nav.replace('<nav class="shell__rail"', f'<nav class="shell__rail" style="display:flex !important;position:absolute;left:0;top:{HEAD_H}px;bottom:0;width:224px;z-index:5;background:var(--app-background);box-shadow:4px 0 16px rgba(20,20,20,.18);flex:none"', 1)
            flyout = f'<div style="position:absolute;left:0;right:0;top:{HEAD_H}px;bottom:0;z-index:4;background:rgba(20,20,20,.28);"></div>{nav}'
        cap = (f'Closed, the window {scroll}px down the page: the bar has stayed at the top, {HEAD_H}px tall (44px targets, 6px of padding, a hairline): the menu button, the wordmark, Search, Import and Export are all on screen. Nothing of the page is covered but the bar\'s own {HEAD_H}px.' if not opened else
               f'Open, the same window: the full 224 nav slides over the page, above it in z-order, from the foot of the bar to the window\'s foot, with a scrim; the bar stays above both, so the menu button still closes it and Search, Import and Export still work; the page beneath has not moved ({scroll}px down, the same rows). A tap on the scrim, Escape, the menu button and choosing a place all close it.')
        body += (f'<div style="position:absolute;left:{x}px;top:{GAP}px;width:{W}px;"><div style="height:{CAP_H}px;"><p class="fp-title">{"Open" if opened else "Closed"} · {W} x {vh}</p><p class="fp-sub">{cap}</p></div>'
                 f'<div class="fp-win {vid}" style="width:{W}px;height:{vh}px;"><div style="width:{W}px;transform:translateY(-{scroll}px);">{html}</div>{flyout}{bar}</div></div>\n')
        x += W + GAP
    bw, bh = x, GAP + CAP_H + 8 + vh + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP, bw, bh, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP, snap=snap)
sticky_board('R35C_1366Sticky', '1366-sticky-nav', 'C · 1366 · the window 640px down a long page · the sticky header, the fly-out closed and open (replaces the pinned rail options of decision 27 and the pinned button)', 1366, 954, 640, 'olive1')
sticky_board('R35C_984Sticky', '984-sticky-nav', 'C · 984 · the window 2,800px down · the sticky header, the fly-out closed and open (replaces the pinned rail options of decision 27 and the pinned button)', 984, 768, 2800, 'olive1')
sticky_board('R35C_744Sticky', '744-sticky-nav', 'C · 744 · the window 1,400px down a long page · the sticky header, the fly-out closed and open (Rule A: the same bar and panel as 984 and up, no tab row)', 744, 1133, 1400, 'olive1')

# ---- 1590 and up: the rail is back, pinned under the sticky header (decision 27's pinned options revived) ----
def sticky_rail_board(key, snap, title, W, vh, scroll, state):
    vid = f'fp-stickyrail-{W}'
    css = resolve_media(TOK, W, True) + LABEL_CSS + final_css(W, vid)
    base = panel_html(state, W); nav = rail_nav(CAP[f'{state}_{W}'])
    html = unique_ids(base, vid); nav = unique_ids(nav, vid)
    hdr = re.search(r'<header class="shell__head">.*?</header>', html, flags=re.S).group(0)
    bar = hdr.replace('<header class="shell__head">', '<header class="shell__head" style="position:absolute;top:0;left:0;right:0;z-index:7">', 1)
    pinned = nav.replace('<nav class="shell__rail"', f'<nav class="shell__rail" style="position:absolute;left:0;top:{HEAD_H}px;bottom:0;width:224px;z-index:5;box-sizing:border-box;background:var(--app-background);"', 1)
    cap = (f'The window {scroll}px down a long page at {W}: the header has stayed at the top ({HEAD_H}px: the wordmark, Search, Import, Export; no menu button, because the rail is there), and the rail has stayed under it, all six places on screen, its top at y {HEAD_H}, as tall as the window less the bar ({vh - HEAD_H}px). '
           'In the app: the rail is sticky with top = the header\'s height and a height of the window less the header, scrolling itself if the window is shorter than its six places. Decision 27\'s pinned options, returned at 1590 and up.')
    body = (f'<div style="position:absolute;left:{GAP}px;top:{GAP}px;width:{W}px;"><div style="height:{CAP_H}px;"><p class="fp-title">Pinned rail · {W} x {vh}</p><p class="fp-sub">{cap}</p></div>'
            f'<div class="fp-win {vid}" style="width:{W}px;height:{vh}px;"><div style="width:{W}px;transform:translateY(-{scroll}px);">{html}</div>{pinned}{bar}</div></div>\n')
    bw, bh = GAP + W + GAP, GAP + CAP_H + 8 + vh + GAP
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP, bw, bh, main, css + '[hidden]{display:none !important}')
    ENTRIES[fn] = dict(w=bw, h=bh, page='page-13', title=title + STAMP, snap=snap)
sticky_rail_board('R35C_1600StickyRail', '1600-sticky-rail', 'C · 1600 · the window 640px down a long page · the rail pinned under the sticky header (decision 27 revived at 1590 and up)', 1600, 900, 640, 'olive1')
json.dump({'boards': ENTRIES}, open(OUT + '/final-canvas-entries.json', 'w'), indent=2)
print('ok final', {fn: (e['w'], e['h']) for fn, e in ENTRIES.items()})
