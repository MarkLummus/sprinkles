#!/usr/bin/env python3
# The move pass of 2026-11-22: nine pages of the active canvas processed as their labels and names read
# (Mark, look-canvas-inventory-r4: "Process these pages as indicated: Kitchen, idea log, recipe book,
# alternates, recipe history, recipe route 03.5 concepts, recipe route 03.5, print formats, print method").
# Index work only; the board files themselves are copied by hand with the Artifact tool, copy before delete
# (README, "Moving a board to another canvas").
#   python3 movepass.py plan   <active canvas.json>                       -> what leaves, as JSON on stdout
#   python3 movepass.py dest   <active canvas.json> <Archive|Concepts> <destination canvas.json or -> <out>
#   python3 movepass.py active <active canvas.json> <out>                 -> the active index without what left
# Homes are the labels as they read on the canvas when the pass ran, Mark's own edits to them included:
# on Print formats "Keep · still needed? Yes" over the Mark one states and reading, and "To Archive" over the
# whole-pen board; on Recipe route 03.5 concepts "To Concepts: move to the Recipe book" over the on-screen
# Recipe book form; Recipe History renamed "(Archive)" with its Concepts label removed.
import json, sys, time
import pagemoves as pm

A, C = 'Archive', 'Concepts'
WHOLE = {'page-8': C, 'page-6': C, 'page-5': C, 'page-3': A, 'page-25': A, 'page-14': A}    # the page's own destination
BOARD = {   # a board that goes another way than its page, and the leaving boards of the pages that stay
    'AltAskAnExpert': C, 'R35_RecipeBookForm': C,
    'R35C_393AllFolded': A, 'R35C_PenApp350': A, 'R35C_PenApp393': A, 'R35C_BysBreak': A,          # Recipe route 03.5
    'AsBuiltRecipePage': A, 'HolePunchCheck': A, 'MarkOnePenWhole': A,                                # Print formats
    'MethodPrintAsBuilt': A,                                                                          # Print method
}
NOTE = {'r35-rb-title': C, 'r35-rb-note': C}   # notes that go with a board against their page
# where a board lands when it joins another page on its destination: board -> (page, x, y, {note: (x, y)})
LAND = {'R35_RecipeBookForm': ('page-5', 0, 3200, {'r35-rb-title': (0, 2900), 'r35-rb-note': (1680, 3200)})}
STAYS_LABELLED = {'page-13'}   # Recipe route 03.5: the pen between 724 and 759 is still unsure, so Keep and that label stay
NAMES = {'page-8': 'Kitchen', 'page-6': 'Idea log', 'page-5': 'Recipe book', 'page-3': 'Recipe History', 'page-25': 'Alternates',
         'page-14': 'Recipe route 03.5 concepts', 'page-13': 'Recipe route 03.5', 'page-11': 'Print formats', 'page-17': 'Print method'}
GONE_LABELS = {'page-13': ['dest-page-13-1'], 'page-11': ['dest-page-11-0', 'dest-page-11-1', 'dest-page-11-2', 'dest-page-11-3'], 'page-17': ['dest-page-17-0', 'dest-page-17-1']}

def plan(c):
    B, N = c['boards'], c['notes']; first = c['pages'][0]['id']; page = lambda o: o.get('page', first)
    out = {A: {'boards': [], 'notes': []}, C: {'boards': [], 'notes': []}}
    home = {}
    for k, b in B.items():
        h = BOARD.get(k[:-8]) or WHOLE.get(page(b))
        if h: home[k] = h; out[h]['boards'].append(k)
    for i, n in N.items():
        if i.startswith('dest-'): continue
        pid = page(n)
        if i in NOTE: out[NOTE[i]]['notes'].append(i)
        elif pid in WHOLE: out[WHOLE[pid]]['notes'].append(i)
        elif pid in GONE_LABELS:      # a page that stays: a sticky goes with the leaving board nearest it, a title with a row that leaves whole
            bs = [k for k in B if page(B[k]) == pid]
            if n.get('kind') == 'title1':
                row = [k for k in bs if n['y'] <= B[k]['y'] <= n['y'] + 700 and B[k]['x'] >= n['x'] - 100]
                if row and all(k in home for k in row) and len({home[k] for k in row}) == 1: out[home[row[0]]]['notes'].append(i)
            elif 'kind' not in n:
                head = (n['x'], n['y'], n.get('w', 240), 200); r = lambda k: (B[k]['x'], B[k]['y'], B[k]['w'], B[k]['h'])
                k = min(bs, key=lambda k: pm.rect_gap(head, r(k)))
                if k in home and pm.rect_gap(head, r(k)) <= 700: out[home[k]]['notes'].append(i)
    return out

def dest(c, which, d, out):
    p = plan(c)[which]; B, N = c['boards'], c['notes']; first = c['pages'][0]['id']
    if d is None: d = {'v': 3, 'createdOnFiles': {'v': 1, 'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}, 'title': 'Sprinkles ' + which,
                       'launch': {'view': 'canvas'}, 'pages': [], 'boards': {}, 'order': [], 'notes': {}, 'noteOrder': [], 'designSystems': []}
    d.setdefault('noteOrder', [])
    for k in [k for k in c['order'] if k in p['boards']]:
        b = dict(B[k]); b['page'] = b.get('page', first)
        if k[:-8] in LAND: b['page'], b['x'], b['y'] = LAND[k[:-8]][:3]
        d['boards'][k] = b
        if k not in d['order']: d['order'].append(k)
    lands = {i: (pg, xy) for pg, _, _, ns in LAND.values() for i, xy in ns.items()}
    for i in [i for i in c['noteOrder'] if i in p['notes']]:
        n = dict(N[i]); n['page'] = n.get('page', first)
        if i in lands: n['page'], (n['x'], n['y']) = lands[i]
        d['notes'][i] = n
        if i not in d['noteOrder']: d['noteOrder'].append(i)
    used = {b['page'] for b in d['boards'].values()}; have = {x['id'] for x in d['pages']}
    for pg in c['pages']:
        if pg['id'] in used and pg['id'] not in have: d['pages'].append({'id': pg['id'], 'name': NAMES[pg['id']]})
    json.dump(d, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)

def active(c, out):
    p = plan(c); gone_b = set(p[A]['boards']) | set(p[C]['boards']); gone_n = set(p[A]['notes']) | set(p[C]['notes'])
    first = c['pages'][0]['id']
    for pid, ids in GONE_LABELS.items(): gone_n |= set(ids)
    gone_n |= {i for i, n in c['notes'].items() if i.startswith('dest-') and n.get('page', first) in WHOLE}
    for k in gone_b: del c['boards'][k]
    c['order'] = [k for k in c['order'] if k not in gone_b]
    for i in gone_n: c['notes'].pop(i, None)
    c['noteOrder'] = [i for i in c['noteOrder'] if i not in gone_n]
    left = {b.get('page', first) for b in c['boards'].values()}
    assert not (left & set(WHOLE)), 'a page that leaves whole still holds a board'
    c['pages'] = [pg for pg in c['pages'] if pg['id'] not in WHOLE]
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)

if __name__ == '__main__':
    import os
    cmd, src = sys.argv[1], sys.argv[2]; c = json.load(open(src))
    if cmd == 'plan': json.dump(plan(c), sys.stdout, indent=1)
    else:
        out = sys.argv[-1]; os.makedirs(out + '/project', exist_ok=True)
        if cmd == 'dest': dest(c, sys.argv[3], None if sys.argv[4] == '-' else json.load(open(sys.argv[4])), out)
        else: active(c, out)
