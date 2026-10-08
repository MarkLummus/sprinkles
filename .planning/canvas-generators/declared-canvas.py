# Sid, 2026-10-07 (rows draw-recipe-declared-notation, draw-declared-two-slots-each; README D25, D26): prepares the canvas files for the page "Recipe-declared items": the five notation boards and two notes, from a canvas.json read from the artifact root just before publishing.
#   python3 declared-canvas.py <canvas.json as read from the root> <out dir>      writes <out>/project/{DeclaredLogPages,DeclaredLogPagesNone,DeclaredLogPagesTwo,DeclaredPage2Variants,DeclaredPenReading}.dc.html and <out>/project/canvas.json
# Nothing else on the canvas is touched: the index keeps every other board, note and page as read. BatchLogForm and TastingLogForm are not rewritten (the snapshot of sketch 010 takes them as served).
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import declared
src, out = sys.argv[1], sys.argv[2]
c = json.load(open(src)); B = c['boards']; N = c['notes']
sizes = declared.build(out)
PG = 'page-18'
if not any(p['id'] == PG for p in c['pages']):
    i = [p['id'] for p in c['pages']].index('page-17'); c['pages'].insert(i + 1, {'id': PG, 'name': 'Recipe-declared items'})
y = 0; W = 0
for key, (w, h, title) in sizes.items():
    fn = key + '.dc.html'; B[fn] = {**dict(x=0, y=y), **B.get(fn, {}), 'w': w, 'h': h, 'page': PG, 'title': title, 'y': y, 'x': 0}
    if fn not in c['order']: c['order'].append(fn)
    y += h + 120; W = max(W, w)
T = json.load(open(HERE + '/declared-notes.json'))
N['declared-title'] = dict(N.get('declared-title', {}), x=0, y=-300, text='Core and declared items: which belong to every recipe and which come from the recipe', kind='title1', maxW=W, page=PG)
N['declared-note'] = dict({**dict(x=W + 80, y=0), **N.get('declared-note', {})}, fill='gray', page=PG, w=520, maxH=2400, text=T['note'])
json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
print('written', sorted(os.listdir(out + '/project')), {k: v[:2] for k, v in sizes.items()})
