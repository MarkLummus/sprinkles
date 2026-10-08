# Sid, 2026-10-07 (row draw-log-pages-vertical-space): writes the two log pages as standalone files for logfit-measure.mjs and the print checks.
#   python3 logfit.py <out dir> [n_notes_p1 n_notes_p2]     writes <out>/p1.html and p2.html (the board's page, 816 x 1056, 0.5 in margins) and <out>/q1.html, q2.html (the print test page:
#   @page letter, margin 0.5 in with 0.75 in at the left (D16), the page 100% of the content box, the page break after) and <out>/index.html for the WebKit print harness.
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import logforms
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
n = [int(x) for x in sys.argv[2:4]] if len(sys.argv) >= 4 else None
l1 = (n[0],) if n else logforms.LINES['side1']; l2 = (n[1],) if n else logforms.LINES['side2']
css = logforms.css(); b1 = logforms.side1(*l1); b2 = logforms.side2(*l2)
def page(*bodies, extra=''):
    return '<!doctype html><html><head><meta charset="utf-8"><title>logfit</title><style>body{margin:0}%s%s</style></head><body><div class="ingredient-table" style="display:none"></div>%s</body></html>' % (css, extra, ''.join(bodies))
open(out + '/p1.html', 'w').write(page(b1)); open(out + '/p2.html', 'w').write(page(b2))
PRINT = '@page{size:letter;margin:.5in .75in}html,body{height:100%}.lf{width:auto;height:100%;padding:0 2px 0 0;break-after:page;page-break-after:always}.lf:last-child{break-after:auto;page-break-after:auto}'
open(out + '/index.html', 'w').write(page(b1, b2, extra=PRINT))
print('lines', l1, l2)
