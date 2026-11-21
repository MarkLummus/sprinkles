#!/usr/bin/env python3
# The active canvas laid out by proposed destination (Mark, look-canvas-inventory-r3, 2026-11-21:
# "physically separate the boards by final destination: keep, archive, concepts"; a page that leaves
# whole is renamed with its destination in parentheses). Index only: no board file is touched,
# no board changes page except MOVES, nothing is deleted.
#   python3 pagemoves.py <canvas.json read from the artifact root> <out>   -> <out>/project/canvas.json
# Destinations are read from CANVAS-INVENTORY.md beside this file (the Proposed home column; "unsure"
# in the Why column). Read the root right before publishing and publish the index alone; never force.
# A page that already carries its labels (note ids dest-<page>-N) is left as it is, so a second run adds nothing.
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
# board -> (page, x, y) and the notes that belong to it.
# Mark, canvas thread 85e5aa25, 2026-11-21: "move this to Recipe Book page"
MOVES = {'RecipeBookSheet.dc.html': dict(page='page-5', x=0, y=1400, notes={'recipebook-title': (0, 1100), 'recipebook-note': (896, 1400)})}
# the few plain words an unsure group's label carries
UNSURE = {
    'P4_DraftKept': 'the notice is now a card at the foot of the window; still needed?', 'P4_DraftKeptWords': 'the notice is now a card at the foot of the window; still needed?',
    'MarkOnePenStates': 'drawn before the new pen; still needed?', 'MarkOneReading': 'drawn before the new pen; still needed?',
    'MarkOnePenWhole': 'the whole pen is redrawn on the Log column rhythm page',
    'R35C_PenRange724': 'the 724 cut is built; still needed?', 'R35C_PenRange740': 'the 724 cut is built; still needed?', 'R35C_PenRange759': 'the 724 cut is built; still needed?',
    'R35_RecipeBookForm': 'goes with the Recipe book?', 'FirstArrival': 'the only drawing of Home with no recipes',
}
WORD = {'Active': 'Keep', 'Archive': 'To Archive', 'Concepts': 'To Concepts'}
COLOR = {'Active': 'green', 'Archive': 'gray', 'Concepts': 'purple'}
RANK = {'Active': 0, 'Archive': 1, 'Concepts': 2}
# labels over notes that are not boards (Mark's own images on Main, under his title "New Concepts")
EXTRA = {'page-1': [dict(x=60, y=8770, home='Concepts', text='To Concepts')]}
EXTRA_HOMES = {'page-1': ['Concepts']}
GAP, ROWGAP, WRAP, ASIDE, LABEL_UP = 160, 400, 9000, 1600, 900

def homes():
    out = {}
    for line in open(HERE + '/CANVAS-INVENTORY.md'):
        c = [x.strip() for x in line.split(' | ')]
        if len(c) >= 6 and c[4] in WORD: out[c[1]] = (c[4], 'unsure' in c[5])
    return out

def rect_gap(a, b):  # distance between two rects (x, y, w, h)
    dx = max(b[0] - (a[0] + a[2]), a[0] - (b[0] + b[2]), 0); dy = max(b[1] - (a[1] + a[3]), a[1] - (b[1] + b[3]), 0)
    return (dx * dx + dy * dy) ** .5

def note_rect(n):
    if n.get('kind') == 'title1': return (n['x'], n['y'], 240, 100)   # its words run on over its row; only its start is reserved
    w = n.get('w', 240); return (n['x'], n['y'], w, n.get('h', w))

def main(src, out):
    c = json.load(open(src)); B, N, H = c['boards'], c['notes'], homes()
    before = {k: (v['x'], v['y'], v.get('page')) for k, v in B.items()}
    first = c['pages'][0]['id']; page = lambda o: o.get('page', first)
    assert {k[:-8] for k in B} == set(H), 'the inventory and the canvas name different boards'
    for fn, m in MOVES.items():
        if page(B[fn]) != m['page']:
            B[fn].update(page=m['page'], x=m['x'], y=m['y'])
            for nid, (x, y) in m['notes'].items(): N[nid].update(page=m['page'], x=x, y=y)
    for p in c['pages']:
        pid = p['id']; bs = sorted((k for k in B if page(B[k]) == pid), key=lambda k: (B[k]['y'], B[k]['x']))
        key = lambda k: (H[k[:-8]][0], UNSURE.get(k[:-8], '') if H[k[:-8]][1] else '', H[k[:-8]][1])
        groups = {}
        for k in bs: groups.setdefault(key(k), []).append(k)
        dests = sorted({g[0] for g in groups} | set(EXTRA_HOMES.get(pid, [])), key=RANK.get)
        if 'Active' not in dests and not re.search(r'\((Archive|Concepts)[^)]*\)$', p['name']):   # the page leaves whole
            uns = len(groups) == 1 and all(H[k[:-8]][1] for k in bs)
            p['name'] += ' (' + ', '.join(dests) + (', unsure' if uns else '') + ')'
        if len(groups) + len(EXTRA.get(pid, [])) < 2 or f'dest-{pid}-0' in N: continue
        notes = [i for i in N if page(N[i]) == pid]
        rects = [(B[k]['x'], B[k]['y'], B[k]['w'], B[k]['h']) for k in bs] + [note_rect(N[i]) for i in notes]
        left, top = min(B[k]['x'] for k in bs), min(r[1] for r in rects); right = max(r[0] + r[2] for r in rects)
        order = sorted(groups, key=lambda g: (RANK[g[0]], g[2], g[1]))
        stay = order[0] if order[0][0] == 'Active' else max(order, key=lambda g: len(groups[g]))
        # which notes travel: a sticky with the board nearest it, a title with the row under it when that whole row goes one way
        follow, block = {}, {k: k for k in bs}   # block: boards under one travelling title move together, as they stand
        for i in notes:
            n = N[i]
            if n.get('kind') == 'title1':
                row = [k for k in bs if n['y'] <= B[k]['y'] <= n['y'] + 700 and B[k]['x'] >= n['x'] - 100]
                if row and len({key(k) for k in row}) == 1:
                    lead = block[min(row, key=lambda k: B[k]['x'])]; follow[i] = lead
                    for k in row: block[k] = lead
            elif 'kind' not in n:
                head = (n['x'], n['y'], n.get('w', 240), 200)   # a sticky's height is not in the index; its top stands for it
                k = min(bs, key=lambda k: rect_gap(head, (B[k]['x'], B[k]['y'], B[k]['w'], B[k]['h'])))
                if rect_gap(head, (B[k]['x'], B[k]['y'], B[k]['w'], B[k]['h'])) <= 700: follow[i] = k
        def label(i, x, y, g):
            text = WORD[g[0]] + (' · unsure: ' + g[1] if g[2] else '')
            N[f'dest-{pid}-{i}'] = dict(kind='title1', text=text, x=x, y=y, maxW=6000, size='xxl', color=COLOR[g[0]], page=pid); c['noteOrder'].append(f'dest-{pid}-{i}')
        label(0, left, top - LABEL_UP, stay)
        x0, y, i = right + ASIDE, top, 1
        for g in order:
            if g == stay: continue
            label(i, x0, y - LABEL_UP, g); i += 1
            x, rowh = x0, 0
            for lead in dict.fromkeys(block[k] for k in groups[g]):
                ks = [k for k in groups[g] if block[k] == lead]; mine = [n for n, kk in follow.items() if kk in ks or kk == lead]   # boards and their notes move as one block
                rs = [(B[k]['x'], B[k]['y'], B[k]['w'], B[k]['h']) for k in ks] + [note_rect(N[n]) for n in mine]
                bx, by = min(r[0] for r in rs), min(r[1] for r in rs); bw, bh = max(r[0] + r[2] for r in rs) - bx, max(r[1] + r[3] for r in rs) - by
                if x > x0 and x + bw > x0 + WRAP: x, y, rowh = x0, y + rowh + ROWGAP, 0
                dx, dy = round(x - bx), round(y - by)
                for k in ks: B[k]['x'] += dx; B[k]['y'] += dy
                for n in mine: N[n]['x'] += dx; N[n]['y'] += dy
                x += bw + GAP; rowh = max(rowh, bh)
            y += rowh + ROWGAP + LABEL_UP
        for j, e in enumerate(EXTRA.get(pid, [])):
            N[f'dest-{pid}-x{j}'] = dict(kind='title1', text=e['text'], x=e['x'], y=e['y'], maxW=6000, size='xxl', color=COLOR[e['home']], page=pid); c['noteOrder'].append(f'dest-{pid}-x{j}')
    moved = [k for k, v in B.items() if (v['x'], v['y'], v.get('page')) != before[k]]   # no board this run moved may cover another on its page
    for k in moved:
        A = B[k]
        for j, O in B.items():
            if j != k and page(O) == page(A):
                assert A['x'] + A['w'] <= O['x'] or O['x'] + O['w'] <= A['x'] or A['y'] + A['h'] <= O['y'] or O['y'] + O['h'] <= A['y'], (k, j)
    os.makedirs(out + '/project', exist_ok=True)
    json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)

if __name__ == '__main__': main(*sys.argv[1:3])
