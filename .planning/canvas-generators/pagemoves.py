#!/usr/bin/env python3
# Page moves and page flags Mark asked for on the canvas. Index only: no board file is touched.
#   python3 pagemoves.py <canvas.json read from the artifact root> <out>   -> <out>/project/canvas.json
# Read the root right before publishing and publish the index alone; never force.
import json, os, sys

# board -> (page, x, y), with the notes that belong to it (README: notes travel with their boards)
MOVES = {
    # Mark, canvas thread 85e5aa25, 2026-11-21: "move this to Recipe Book page; flag that page as moving to Concepts"
    'RecipeBookSheet.dc.html': dict(page='page-5', x=0, y=1400,
                                    notes={'recipebook-title': (0, 1100), 'recipebook-note': (896, 1400)}),
}
# page id -> flag put before the page's name, once
FLAGS = {'page-5': 'Moving to Concepts 2026-11-21 · '}

def main(src, out):
    c = json.load(open(src)); B, N = c['boards'], c.get('notes', {})
    for fn, m in MOVES.items():
        B[fn].update(page=m['page'], x=m['x'], y=m['y'])
        for nid, (x, y) in m['notes'].items():
            if nid in N: N[nid].update(page=m['page'], x=x, y=y)
    for p in c['pages']:
        pre = FLAGS.get(p['id'])
        if pre and not p['name'].startswith(pre): p['name'] = pre + p['name']
    os.makedirs(out + '/project', exist_ok=True)
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)

if __name__ == '__main__': main(*sys.argv[1:3])
