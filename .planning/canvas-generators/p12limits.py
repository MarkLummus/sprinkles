# Hicks for Sid, 2026-11-16 (quick 261116-80u; Mark's word limits of 2026-11-16, 12-UI-REVIEW.md finding 2 option b: a scale's name up to 16 characters, each end word up to 12, a problem up to 40,
# counted on the trimmed text, refused at Save with "Use N characters or fewer." under the field): the board of the refused state, drawn from the build.
#   P12_WordLimits   the creation editor's Scales and Problems at 1366 after Save was pressed on a draft whose scale name, high end and problem are over their limits and whose low end is exactly at its limit
# The markup is the built Setup column (p12limits-capture.mjs: WebKit, coarse, a scratch build of this commit, OVERLONG_DRAFT from 12-cases.mjs laid in the context's own throwaway IndexedDB, Save pressed),
# under the app's own stylesheets resolved at 1366 coarse (a canvas artboard gets no narrow viewport), wrapped in the `.notebook.mk-page` the creation page's column rules are scoped under (p12.wrap does not give it).
# One panel in the document, so the build's ids and radio names stand as they are (12-board-limits.mjs compares aria-describedby). The scale is Right in the middle so 261116-80v (no numbers on a Low to high scale) leaves the panel alone. Nothing here is approved: Mark has not looked at it.
#   node p12limits-capture.mjs <scratch dist> ; python3 p12limits.py <out dir>
# writes <out>/project/P12_WordLimits.dc.html (the canvas board; publish it to page-26 after a root read) and .planning/sketches/015-own-scales-and-problems/word-limits.html (the snapshot, made to open on its own
# exactly as snapshot015.py does: the support.js line dropped and the font upload pointed at the app's own copy of Caveat). snapshot015.py, p12.py and p12's JSON are not run and not changed.
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from p12 import panel_css, esc, flow          # importing p12 only reads its JSON; its __main__ does not run
import printstart
CAP = json.load(open(HERE + '/p12limits-capture.json'))
KEY = 'P12_WordLimits'
TITLE = "Creation editor · a scale's and a problem's words over the limit, Save refused · 1366 (2026-11-16; drawn from the build for Mark's word limits)"
SKETCH = os.path.join(HERE, '..', 'sketches', '015-own-scales-and-problems', 'word-limits.html')
FONT_BLOB = '/_blob/37ac467ba5558024f5fb5a2e5c22a7bc'
FONT_LOCAL = '../../../app/public/fonts/caveat-regular.woff2'

def window():
    c = CAP['crop']; w, h = int(round(c['width'])), int(round(c['height']))
    html = printstart.drop_hidden(CAP['html'])
    # the creation page's column rules are scoped under .notebook.mk-page; .notebook-body is the flex row the Setup column sits in
    inner = f'<div class="notebook mk-page" style="padding:0;max-width:none;display:block"><div class="notebook-body">{html}</div></div>'
    return w, h, f'<div class="fp-win p12w-1366" style="width:{w}px;height:{h}px"><div style="width:{w}px;transform:translateY(-{c["top"]}px)">{inner}</div></div>'

def build():
    w, h, win = window()
    cap = 'Name, High end and Problem 1 are over'
    sub = 'Name has 21 characters, over its 16; High end 17, over its 12; Problem 1 51, over its 40. Low end is exactly 12, at its limit, and stays quiet. Each sentence stands under its own field where Required would, and the field is marked invalid. Limits: a scale name 16, an end word 12, a problem 40, counted on the trimmed text; a Kind has none.'
    rows = [('', '', [(w, h, win, cap, sub)])]
    body, bw, bh = flow("Creation editor · words over the limit", 'Quick 261116-80u. Built markup after Save was pressed; nothing is drawn over it. Not approved yet.', rows, capw=560)
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff">{body}</div>'
    return printstart.board(TITLE, main, bw, bh, panel_css() + '[hidden]{display:none !important}')

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out + '/project', exist_ok=True)
    s = build()
    open(f'{out}/project/{KEY}.dc.html', 'w').write(s)
    t = s.replace('<script src="./support.js"></script>\n', '', 1).replace('<script src="./support.js"></script>', '', 1).replace(FONT_BLOB, FONT_LOCAL)
    assert 'support.js' not in t and '/_blob/' not in t and 'src="data:' not in t
    open(SKETCH, 'w').write(t)
    print('ok', len(s))
