# Sid, 2026-10-07 (row draw-declared-two-slots-each; README D26): the recipes the Recipe-declared items page draws, by how many scales and problems each declares (0, 1 or 2 of each).
# Olive Oil v1 declares Body, Oil and Bitter (app/src/data/olive-oil.js: declaredAxes ['Body', 'Oil'], declaredFlaw 'Bitter'); every other seed declares none. The one-scale and two-problem recipes are DRAWN EXAMPLES, not seeds:
# the scale words are the two AXES rows a recipe may name today (Body, Oil), and the second problem word, 'Waxy', is an example word of Sid's, not Mark's and not in the data.
import logforms
SCALES = [logforms.AXES_DECLARED[0], logforms.AXES_DECLARED[1]]   # Body, Oil
PROBLEMS = ['Bitter', 'Waxy']
def scales(n): return SCALES[:n]
def problems(n): return PROBLEMS[:n]
def name(ns, np_):
    if (ns, np_) == (0, 0): return 'Mexican Chocolate'
    if (ns, np_) == (2, 1): return 'Olive Oil'
    return 'Example recipe'
def foot(ns, np_):
    if (ns, np_) == (2, 1): return logforms.FOOT
    if (ns, np_) == (0, 0): return 'Mexican Chocolate · Version 4 · v4 · [short code] · Side {n} of 2'   # the app's own version line for Mexican Chocolate v4 reads "Version 4 · v4"
    return 'Example recipe · Version 1 · [short code] · Side {n} of 2'
def declares(ns, np_):
    w = [a[0] for a in scales(ns)] + problems(np_)
    return ', '.join(w) if w else 'nothing'
