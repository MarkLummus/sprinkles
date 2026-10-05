import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 54's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 54): what More's items look like on the iPhone (Mark's radius check: "Import and Export look like very small buttons with each having a dark rounded rectangle border"). Every window is the built app's own shell
# markup at 393 (more-capture.json: WebKit, coarse; More tapped open; Olive Oil v1, and /ingredients so Ingredients is the current place) with the app's own stylesheets resolved at 393. The tab row and the panel are placed at the window's foot (a drawing has no viewport).
# A is the build untouched. B, C and D change More's own rules (and, in D, one element), in the app's tokens only: no new value. Focus is the app's own :focus rule put on the element by hand (a drawing cannot focus). Nothing here edits app/.
MC = json.load(open(HERE + '/more-capture.json'))
MM = json.load(open(HERE + '/more-board-measure.json')) if os.path.exists(HERE + '/more-board-measure.json') else {}
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HT = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in MC.items()}
STAMP_M = " (decision 54, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
LABH = 96; WH = 560; W = 393
FOCUS_CSS = '.fp-ring{outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)}\n'
MCSS = open(HERE + '/more-candidates.css').read()
RESET = sec(MCSS, 'RESET'); CSS_B = RESET + sec(MCSS, 'B'); CSS_C = RESET + sec(MCSS, 'ROWS'); CSS_D = CSS_C + sec(MCSS, 'SEP')
def prep(html, vid, ring=None, sep=False):
    html = with_menu(html, W); html = unique_ids(html, vid)
    m = re.search(r'<nav class="shell__tabs".*?</nav>', html, flags=re.S); nav = m.group(0); page = html.replace(nav, '', 1)
    if ring:
        pat = r'(<button type="button" class="shell__place"[^>]*)(>)((?:(?!</button>).)*?' + ring + r'</button>)'
        mm = re.search(pat, nav, flags=re.S); assert mm, ring
        nav = nav[:mm.start()] + mm.group(1).replace('class="shell__place"', 'class="shell__place fp-ring"') + mm.group(2) + mm.group(3) + nav[mm.end():]
    if sep:
        i = nav.index('<li><button'); nav = nav[:i] + '<li class="shell__more-sep" aria-hidden="true"><hr class="shell__divider"></li>' + nav[i:]
    nav = nav.replace('<nav ', '<nav style="position:absolute;left:0;right:0;bottom:0;z-index:6" ', 1)
    return page, nav
def fact(vid):
    f = MM.get(vid)
    if not f: return ''
    ul = f['ul']; it = f['items']
    return f"Panel {ul['w']:g} x {ul['h']:g}px. " + ' · '.join(f"{i['text']} {i['w']:g} x {i['h']:g}" for i in it) + '.'
STATES = [('rest', 'notebook_393', None, 'Notebook page, More open'), ('cur', 'ingredients_393', None, 'On Ingredients: its place is the current one'), ('ring', 'notebook_393', 'Import', 'Import has focus (the 2px ring)')]
ROWS = [
 ('A', 'A · as built: Import and Export are buttons the Sheet’s button rule still reaches', 'Measured in the build (WebKit and Chrome, 393). All five items are the tab row’s mini tiles (icon over a 12px word, no side padding) because the tab row’s rule reaches the list. The three links are 63.5px wide and 49 high with no border. The two buttons keep the Sheet’s button border (1px solid ink, drawn on the 10px radius) and are as wide as their word (39px), so they read as small boxed buttons, and 39px is under the 44px touch minimum. Under the pointer the border goes to 2px and the box grows 2px each way.', '', False),
 ('B', 'B · tiles, with the button border gone and the buttons as wide as the links', 'The smallest change: the tools row’s own button reset (no border, no fill, the text colour) also applies to More’s buttons, and a button is as wide as its list item. Every item is a 75.5px tile, 49 high, no border. The 6px side padding is new: the current place’s surface now has room around the word (as built, Ingredients in weight 600 fills its surface edge to edge, 0px each side).', CSS_B, False),
 ('C', 'C · rows: the places and actions as the rail and the tools row draw them', 'The same reset, and the panel’s items take the rail place’s own values (icon beside the 14px word, 12px and 20px padding) instead of the tab row’s: at 724 and up these three controls (Search, Import, Export) already read this way in the header’s tools. The panel is wider and each item a full-width 44px row.', CSS_C, False),
 ('D', 'D · rows, with the rail’s hairline between the places and the actions', 'C with the rail’s own divider between Search and Import (Ingredients, Kitchen and Search go somewhere; Import and Export do something). One more element in the list, aria-hidden.', CSS_D, True),
]
def board():
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n' + FOCUS_CSS, resolve_media(TOK, W, True)]
    body = ''; y = GAP; bw = 0
    for rid, rtitle, rdesc, extra, sep in ROWS:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:1500px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:1220px">{rdesc}</p></div>\n'
        y += 150; x = GAP
        for st, key, ring, cap in STATES:
            vid = f'fp-more-{rid}-{st}'
            css_parts.append(final_css(W, vid, extra=extra, onehead=False))
            page, nav = prep(HT[key], vid, ring, sep)
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{fact(vid)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{W}px;height:{WH}px;"><div style="width:{W}px;">{page}</div>{nav}</div></div>\n')
            x += W + GAP
        bw = max(bw, x); y += LABH + 8 + WH + GAP
    y = int(y + 0.999); bw = int(bw)
    title = 'C · More’s items on the iPhone (393): A as built, B tiles without the button border, C rows like the rail, D rows with a hairline between places and actions, at rest, on the current place and with focus'
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_MoreItems', title + STAMP_M, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_M, snap='more-items-iphone')}
json.dump({'boards': board()}, open(OUT + '/more-canvas-entries.json', 'w'), indent=2)
print('ok more')
