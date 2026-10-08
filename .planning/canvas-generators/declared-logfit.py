# Sid, 2026-10-07 (rows draw-recipe-declared-notation, draw-declared-two-slots-each; README D25, D26): writes the two log pages of one recipe as standalone files for logfit-measure.mjs (the same measurement as logfit.py).
#   python3 declared-logfit.py <out dir> <scales>,<problems> [lines on page 2] [extra problem words]
#   <scales>,<problems> is how many declared scales (0 to 2: Body, Oil) and declared problems (0 to 2: Bitter, Waxy) the recipe declares: 0,0 is Mexican Chocolate v4; 2,1 is Olive Oil v1; 2,2 is the drawn two-of-each example.
#   extra problem words add more boxes to the problems row, to test headroom beyond the two (a test of the fit, never drawn on a board). Page 1 holds 14 lines, page 2 the given count (default 5).
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import logforms, declared_variants as V
out, spec = sys.argv[1], sys.argv[2]; n2 = int(sys.argv[3]) if len(sys.argv) > 3 else logforms.LINES['side2'][0]
extra = sys.argv[4].split(';') if len(sys.argv) > 4 and sys.argv[4] else []
ns, np_ = (int(x) for x in spec.split(','))
os.makedirs(out, exist_ok=True)
css = logforms.css()
def page(b): return '<!doctype html><html><head><meta charset="utf-8"><title>declared logfit</title><style>body{margin:0}%s</style></head><body><div class="ingredient-table" style="display:none"></div>%s</body></html>' % (css, b)
foot = V.foot(ns, np_)
open(out + '/p1.html', 'w').write(page(logforms.side1(*logforms.LINES['side1'], foot=foot)))
open(out + '/p2.html', 'w').write(page(logforms.side2(n2, axes_declared=V.scales(ns), flaw=V.problems(np_) + extra, foot=foot)))
print(spec, 'page 2 lines', n2, 'boxes in the problems row', 4 + np_ + len(extra))
