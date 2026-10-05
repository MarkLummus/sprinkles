import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 54's second board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 54, Mark's answer: "they should look like Tiles from the Tab Bar, as in B, but I like the hairline to separate places and actions"): B's tiles and a hairline between the places and the actions, at 393 and 723.
# Redrawn 2026-10-05 for Mark's answer on decision 55 (Search sits with the actions, as in the header): the hairline's li goes before Search, so the list is Ingredients, Kitchen, the rule, then Search, Import, Export. Five tiles either way, so the panel keeps its height.
# Every window is the built app's own shell markup (moretiles-capture.json: WebKit, coarse; More tapped open; Olive Oil v1, and /ingredients so Ingredients is the current place) with the app's own stylesheets resolved at the window's width. The tab row and the panel are placed at
# the window's foot (a drawing has no viewport). The rules are the sections TILESRESET, TILESPHONE and HAIR of more-candidates.css, the ones the brief writes, and one element (an aria-hidden li holding the rail's hr.shell__divider) before Search's item. Focus is the app's own :focus rule put on
# by hand. Nothing here edits app/.
MC = json.load(open(HERE + '/moretiles-capture.json'))
MM = json.load(open(HERE + '/moretiles-board-measure.json')) if os.path.exists(HERE + '/moretiles-board-measure.json') else {}
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HT = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in MC.items()}
STAMP_T = " (decision 54's board, redrawn 2026-10-05 with Search below the hairline, Mark's answer on decision 55; awaiting Mark's look; nothing approved)"
LABH = 96; WH = 560
FOCUS_CSS = '.fp-ring{outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)}\n'
MCSS = open(HERE + '/more-candidates.css').read()
TILES = sec(MCSS, 'TILESRESET') + sec(MCSS, 'TILESPHONE') + sec(MCSS, 'HAIR')
def prep(html, W, vid, ring=None):
    html = with_menu(html, W); html = unique_ids(html, vid)
    m = re.search(r'<nav class="shell__tabs".*?</nav>', html, flags=re.S); nav = m.group(0); page = html.replace(nav, '', 1)
    if ring:
        pat = r'(<button type="button" class="shell__place"[^>]*)(>)((?:(?!</button>).)*?' + ring + r'</button>)'
        mm = re.search(pat, nav, flags=re.S); assert mm, ring
        nav = nav[:mm.start()] + mm.group(1).replace('class="shell__place"', 'class="shell__place fp-ring"') + mm.group(2) + mm.group(3) + nav[mm.end():]
    i = nav.index('<li><a tabindex="0" class="shell__place" href="/search"'); nav = nav[:i] + '<li class="shell__more-sep" aria-hidden="true"><hr class="shell__divider"></li>' + nav[i:]
    nav = nav.replace('<nav ', '<nav style="position:absolute;left:0;right:0;bottom:0;z-index:6" ', 1)
    return page, nav
def fact(vid):
    f = MM.get(vid)
    if not f: return ''
    ul = f['ul']; it = f['items']; h = f['hr']
    return (f"Panel {ul['w']:g} x {ul['h']:g}px. Tiles {it[0]['w']:g} x {it[0]['h']:g}. Rule {h['w']:g} x {h['h']:g}px, {f['aboveRule']:g}px under Kitchen and {f['belowRule']:g}px over Search.")
STATES = [('rest', 'notebook', None, 'Notebook page, More open'), ('cur', 'ingredients', None, 'On Ingredients: its place is the current one'), ('ring', 'notebook', 'Import', 'Import has focus (the 2px ring)')]
ROWS = [
 (393, '393 · iPhone', 'The tab row’s tiles, in a column: an icon over a 12px word, the 6px side padding so the current place’s surface has room around the word, and no border on Import and Export (Search is a link and has none to remove). A hairline across the panel, as wide as the tiles, between the places (Ingredients, Kitchen) and the actions (Search, Import, Export; Search sits with the actions, as in the header): the rail’s divider (1px, the divider colour), 6px above and 6px below.'),
 (723, '723 · the widest width that still has the tab row', 'The same rules and the same panel as at 393: it is 101.5px wide wherever the window is, at the right edge above the More tab, which is 144.6px wide here. At 724 the header’s Search, Import and Export and the fly-out replace this panel.'),
]
def board():
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n' + FOCUS_CSS]
    body = ''; y = GAP; bw = 0
    for W, rtitle, rdesc in ROWS:
        css_parts.append(resolve_media(TOK, W, True))
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:2200px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:1220px">{rdesc}</p></div>\n'
        y += 130; x = GAP
        for st, key, ring, cap in STATES:
            vid = f'fp-mt-{W}-{st}'
            css_parts.append(final_css(W, vid, extra=TILES, onehead=False))
            page, nav = prep(HT[f'{key}_{W}'], W, vid, ring)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{fact(vid)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{W}px;height:{WH}px;"><div style="width:{W}px;">{page}</div>{nav}</div></div>\n')
            x += W + GAP
        bw = max(bw, x); y += LABH + 8 + WH + GAP
    y = int(y + 0.999); bw = int(bw)
    title = 'C · More’s items at 393 and 723: the tab row’s tiles with a hairline between the places (Ingredients, Kitchen) and the actions (Search, Import, Export), at rest, on the current place and with focus'
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_MoreTiles', title + STAMP_T, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_T, snap='more-tiles-hairline')}
json.dump({'boards': board()}, open(OUT + '/moretiles-canvas-entries.json', 'w'), indent=2)
print('ok moretiles')
