import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 53's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 53): how the page notice and the open fly-out stack (Mark's decide row: "Sid draws how the notice stacks with the open fly-out"). Every window is the built app's own shell markup (notice-capture.json: WebKit,
# coarse; Olive Oil v1 just saved as a new version, which raises "Version saved."; the "long" notice is the app's own "Tasting removed. You can restore it." set on the same box) with the app's own stylesheets resolved at the width; the
# fly-out is the build's own nav element placed by hand (a drawing has no viewport), with the scrim, the menu button pressed and Home focused as the build does it. No transform wraps the page, so z-index decides the stack here as it does
# in the app. A is the build untouched; B and C change one rule or one state. The windows show the top 360px. Nothing here edits app/.
NC = json.load(open(HERE + '/notice-capture.json'))
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HT = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in NC.items()}
FACT = {k: v['facts'] for k, v in NC.items()}
STAMP_N = " (decision 53, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
LABH = 128; ROWH = 112; VH = 360
FOCUS = 'outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)'
def opened(html, W, vid, hide_notice=False):
    nav = rail_nav(html); nav = unique_ids(nav, vid)
    first = re.search(r'<a [^>]*class="shell__place shell__place--home"', nav); assert first
    nav = nav.replace(first.group(0), first.group(0).replace('class=', f'style="{FOCUS}" class=', 1), 1)
    nav = rail_style(nav, ' shell__rail--open', f'position:absolute;left:0;top:{HEAD_H}px;bottom:0;width:224px;flex:none')
    scrim = f'<div class="shell__scrim" aria-hidden="true" style="position:absolute;left:0;right:0;top:{HEAD_H}px;bottom:0"></div>'
    page = unique_ids(html, vid)
    page = page.replace('aria-expanded="false"', 'aria-expanded="true"', 1)
    if hide_notice: page = re.sub(r'(<p class="page-status"[^>]*>)[^<]*(</p>)', r'\1\2', page, count=1)
    return page, scrim + nav
def facts(st, W):
    f = FACT[f'{st}_{W}']; n = f['notice']; c = [q for q in f['places'] if q['covered']]
    return f"The notice is {n['w']:g} x {n['h']:g}px at {n['x']:g}, {n['y']:g}; the panel is 224 wide from {f['fly']['y']:g}."
CSS_B = '.page-status{z-index:3}'
ROWS = [
 ('A', 'A · as built: the notice (z 10) paints over the open fly-out (z 5) and over the scrim (z 4)', 'The brief of decision 33 set scrim < fly-out < notice < bar, and shell.test.js pins it. Measured: the notice’s box starts at x 48, 6px under the bar, inside the panel’s 224px, so it paints over the first place. Home’s 44px row runs 63 to 107: the notice covers 114 x 30px of it for "Version saved." and 155 x 30px for the longer one, hiding Home’s icon and word and the focus ring the build puts on Home as the panel opens. The page under the scrim is dimmed and the notice is not. The main is inert, so a tap on the covered Home still reaches Home. The notice lasts 5 seconds, and sits at the top of the page, so it overlaps only with the page at its top.', None),
 ('B', 'B · (recommended) the notice is part of the page: it goes under the scrim and under the fly-out (z 3: notice < scrim < fly-out < bar)', 'One value changes (the notice token, 10 to 3, still over the page’s own 1 and 2). The notice is dimmed with the page and hidden where the panel is: "Version saved." is wholly under the panel; the longer one shows its last 67px dimmed beside the panel. The bar stays over everything.', CSS_B),
 ('C', 'C · the notice goes when the menu opens: nothing to stack', 'Opening the fly-out clears the notice (its text is a live region, so it was announced when it came). Like B on the screen for the short notice; for the longer one nothing shows beside the panel.', None),
]
def board():
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rid, rtitle, rdesc, extra in ROWS:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:4400px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:3000px">{rdesc}</p></div>\n'
        y += 150; x = GAP
        for st, W, cap in (('short', 1366, '1366 · "Version saved."'), ('long', 1366, '1366 · "Tasting removed. You can restore it."'), ('long', 724, '724 · "Tasting removed. You can restore it."')):
            vid = f'fp-{rid}-{st}-{W}'
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra=(extra or ''), onehead=False))
            html = HT[f'{st}_{W}']
            try: html = with_menu(html, W)
            except AssertionError: pass
            page, fly = opened(html, W, vid, hide_notice=(rid == 'C'))
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;"><div style="height:{LABH}px;"><p class="fp-lab">{cap}<small>{facts(st, W)}</small></p></div>'
                     f'<div class="fp-win {vid}" style="width:{W}px;height:{VH}px;"><div style="width:{W}px;">{page}</div>{fly}</div></div>\n')
            x += W + GAP
        bw = max(bw, x); y += LABH + 8 + VH + GAP
    y = int(y + 0.999); bw = int(bw)
    title = 'C · how the page notice and the open fly-out stack: A (the notice over the panel, as built), B (under the scrim and the panel) and C (cleared when the menu opens), at 1366 and 724'
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board('R35C_NoticeFlyout', title + STAMP_N, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    return {fn: dict(w=bw, h=y, page='page-13', title=title + STAMP_N, snap='notice-over-flyout')}
json.dump({'boards': board()}, open(OUT + '/noticestack-canvas-entries.json', 'w'), indent=2)
print('ok noticestack')
