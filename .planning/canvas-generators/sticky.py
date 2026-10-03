import sys; sys.argv=['x']
import gen
from gen import *
# Sid, 2026-10-02 (todo 2026-09-27-sticky-side-nav; Mark, 2026-09-27: "make the side-nav sticky so that when shown, the nav
# options don't scroll off the screen"). Every other board draws a whole page at its full height, where nothing scrolls, so the
# state to draw is a viewport part-way down a long page: the board is the viewport (1366 x 768, 984 x 768), the page is shifted
# up inside it by SCROLLED px, and the rail's options hold at the viewport's top while the Sheet and the log carry on beside them.
#
# The rule is the app's own proposal, drawn as real CSS so the board is the authority (a position:sticky element inside an
# overflow:hidden root pins to that root's top, so the shift below reads as a scroll). The rail keeps its full-page height, so its
# right hairline still runs the whole page; only a wrapper inside it (`shell__rail-inner`, one new element in Shell.jsx) is sticky.
# `top` is the rail's own top padding (--gap-xs), so a pinned nav sits 6px under the viewport's top, as it sits 6px under the head
# at the top of the page. Measured in the built app with the wrapper and the rule injected, WebKit and Chrome, 984, 1366 and 1920
# wide, scrolled to 1500 and to the end of the page: the options stay at 6 to 296, the rail stays 224 wide, the log keeps its x and
# width, the page has no horizontal scroll.
STICKY = '.shell__rail-inner{position:sticky;top:var(--gap-xs)}\n'
WRAPPED_RAIL = re.sub(r'(<nav class="shell__rail"[^>]*>)(.*)(</nav>)', r'\1<div class="shell__rail-inner">\2</div>\3', gen.RAIL, count=1, flags=re.S)
assert WRAPPED_RAIL != gen.RAIL
gen.RAIL = WRAPPED_RAIL      # board() reads the module's RAIL

VIEW_H = 768
def sticky_board(fn, title, w, scrolled, extra):
    main = phone_folds(layout_c('batch') if w >= 1366 else layout_c_rung(w), open_=w >= 1366)
    css = extra + '[hidden]{display:none !important}\n' + STICKY + f'.shell{{margin-top:-{scrolled}px}}\n'
    open(OUT + '/' + fn, 'w').write(board(title, w, VIEW_H, main, 'notebook', css))

SCROLLED_1366 = 640
SCROLLED_984 = 2800
sticky_board('R35C_1366Sticky.dc.html', 'C · 1366 · scrolled 640px · the side nav\'s options stay on screen, the log beside the Sheet', 1366, SCROLLED_1366, '')
sticky_board('R35C_984Sticky.dc.html', 'C · 984 · scrolled 2,800px · the side nav\'s options stay on screen, the log below the Sheet', 984, SCROLLED_984, TWO_COL)

ENTRIES = {
  'R35C_1366Sticky.dc.html': dict(x=0, y=37300, w=1366, h=VIEW_H, page='page-13', title='C · 1366 · scrolled 640px · the side nav\'s options stay on screen, the log beside the Sheet'),
  'R35C_984Sticky.dc.html': dict(x=1446, y=37300, w=984, h=VIEW_H, page='page-13', title='C · 984 · scrolled 2,800px · the side nav\'s options stay on screen, the log below the Sheet'),
}
NOTES = {
  'r35-sticky-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': 37060, 'maxW': 3000, 'text': 'The side nav stays on screen while the page scrolls (Mark, 2026-09-27; drawn 2026-10-02, awaiting Mark\'s look)'},
  'r35-sticky-note': {'fill': 'gray', 'page': 'page-13', 'x': 2510, 'y': 37300, 'w': 400, 'text': 'Where the side nav shows (984 and up), its options hold at the top of the window while the page scrolls under them. Each board is the window, part-way down a long recipe page: the head has scrolled away, the Sheet carries on, and the nav sits 6px under the window\'s top. The nav\'s hairline still runs the page\'s whole height, because the rail keeps its full height and only the options inside it are pinned. Nothing else moves: the nav stays 224 wide, the Sheet and the log keep their places, the page does not scroll sideways. Measured in the built app with the rule added, in WebKit and Chrome at 984, 1366 and 1920 wide, at the top, 1,500px down and at the end of the page. Not measured: the iPad itself.'},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/sticky-canvas-entries.json', 'w'), indent=2)
print('ok')
