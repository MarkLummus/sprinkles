# Sid, 2026-11-23 (Mark's List bug-p11-pen-steps-no-reorder, answered "fix" the same day: a later version may change the order of its steps in the Next version pen; sketch 017).
# Two NEW boards on a new canvas page, "Phase 12 version pen: step order". DRAWN, NOT APPROVED. 1366 only (the pen is a desk job).
#   P12_PenStepOrder     the pen with steps that can be moved: the creation editor's Move buttons on a closed step's line; one press and two; a removed step among moved ones; an open
#                        step; the Ingredients table following the order.
#   P12_StepOrderShown   how a changed order reads against the parent, three ways for Mark to choose (A the words "was step 4" after the step, B the parent's number struck under
#                        the new one, C no mark), on Show changes of the saved version; and the same version read plain, with its table. The pen board is drawn with A.
# Every panel is the built app's own markup (p12pm-capture.mjs: WebKit, coarse, a scratch build of main at 65678e4f) under the app's own stylesheets, with only the Move buttons,
# the new order and the marks drawn over it. The recipe is Sid's "Coffee": Version 1 reads Steep, Strain, Rest, Sweeten, Churn; the pen moves Sweeten up twice and removes Rest.
# Purple tags are notes, not in the app.
#   SPRINKLES_STYLES=<the same build's src/styles> node p12pm-capture.mjs <dist> <commit> ; python3 p12pm.py measure <out> ; node p12pm-measure.mjs <out>/measure.html [chromium] [shots] ;
#   python3 p12pm.py <canvas.json read from the artifact root> <out>
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import p12g2 as G
import printstart
from p12g2 import P, cell, flow, esc, sheet, mark
CAP = json.load(open(HERE + '/p12pm-capture.json'))
G.M = json.load(open(HERE + '/p12pm-measure.json')) if os.path.exists(HERE + '/p12pm-measure.json') else {}

# ---- the example -------------------------------------------------------------------------------------------------------------------------------------------------------------------
PARENT = CAP['v1_stored']['keys']; assert PARENT == [1, 2, 4, 3, 5], PARENT      # Version 1's stored step keys, in the order it reads: a creation Move already saved them out of ascending order
NAME = dict(zip(PARENT, CAP['v1_stored']['leadIns'])); assert NAME == {1: 'Steep', 2: 'Strain', 4: 'Rest', 3: 'Sweeten', 5: 'Churn'}
PNUM = {k: i + 1 for i, k in enumerate(PARENT)}                                  # the number each step has on the parent
ONCE = [1, 2, 3, 4, 5]                                                           # Sweeten moved up once: Steep, Strain, Sweeten, Rest, Churn
TWICE = [1, 3, 2, 4, 5]                                                          # and again: Steep, Sweeten, Strain, Rest, Churn
REST = 4; SWEETEN = 3

# A adds no rule: its words take the removed label's own class (method-step__skipped-label). B's proposed rule, existing tokens only: method-step__n-from, the parent's number,
# struck, on its own line under the step's number (the Strike Rule's stroke, as method-step__n--struck and prose-struck-beneath use it); its words for a screen reader ride
# .visually-hidden, as built.
PM_CSS = """.method-step__n-from{display:block;text-decoration:line-through;text-decoration-thickness:var(--rule-strike)}
"""

LI = re.compile(r'<li id="method-step-(\d+)" class="method-step">.*?</li>', re.S)
def lis(method): return {int(m.group(1)): m.group(0) for m in LI.finditer(method)}
def frame(method): return method[:method.index('<li ')], method[method.rindex('</li>') + 5:]
SEP = '<span aria-hidden="true">·</span>'
def move_buttons(n, first, last):
    OFF = ' aria-disabled="true"'
    def b(words, off): return f'<button type="button" class="text-control{" mk-off" if off else ""}" aria-label="Step {n}, {words.lower()}"{OFF if off else ""} tabindex="0">{words}</button>'
    return SEP + b('Move up', first) + SEP + b('Move down', last)
def order_changed(order, removed):
    live = [k for k in order if k not in removed]; return live != [k for k in PARENT if k in live]
def numbered(li, key, new, show, changed):
    """One live step: its margin number, the names of its controls, and the mark of a changed order (A, B or C)."""
    cur = re.search(r'<span class="method-step__n" aria-hidden="true">(\d+)</span>', li); assert cur, key
    li = li.replace(f'aria-label="Step {cur.group(1)}, ', f'aria-label="Step {new}, ')
    old = PNUM[key]; marked = changed and old != new
    n = str(new) + (f'<span class="method-step__n-from">{old}</span>' if marked and show == 'B' else '')
    li = li.replace(cur.group(0), f'<span class="method-step__n" aria-hidden="true">{n}</span>')
    if marked and show in ('A', 'B'):
        words = f'<span class="visually-hidden"> was step {old}</span>' if show == 'B' else f'<span class="method-step__skipped-label"> was step {old}</span>'
        if '<p class="method-step__lead">' in li: i = li.index('</p>', li.index('<p class="method-step__lead">'))      # a read step: after its words, where "removed" stands
        else: i = li.index('</div>', li.index('<div class="method-step__open-fields">'))                              # an open step: under its two fields, inside the outline, where "removed" stands
        li = li[:i] + words + li[i:]
    return li
def pen(order, removed=(), open_=None, show='A', flags=()):
    """The pen's Instructions in a new order. A closed live step's line reads Edit this step · Move up · Move down · Remove; a removed step is the built one (no number, Edit this
    step · Restore); an open step is the built one (Cancel, Done)."""
    src, rem, opn = lis(CAP['pen']['method']), lis(CAP['pen_removed']['method']), lis(CAP['pen_open']['method'])
    live = [k for k in order if k not in removed]; num = {k: i + 1 for i, k in enumerate(live)}; changed = order_changed(order, removed); out = []
    for k in order:
        if k in removed: assert k == REST; out.append(rem[k]); continue
        if k == open_: assert k == SWEETEN; out.append(numbered(opn[k], k, num[k], show, changed)); continue
        li = numbered(src[k], k, num[k], show, changed)
        edit = re.search(r'<button type="button" class="text-control" aria-label="Step %d, edit this step" tabindex="0">Edit this step</button>' % num[k], li); assert edit, k
        out.append(li[:edit.end()] + move_buttons(num[k], k == live[0], k == live[-1]) + li[edit.end():])
    a, b = frame(CAP['pen']['method']); m = a + ''.join(out) + b
    for label, words in flags: m = mark(m, label, words)
    return m
def read(key, order, show):
    """The saved version's Instructions (reading, or Show changes) in a new order; a removed step keeps the built markup (its parent number struck, the word removed)."""
    src = lis(CAP[key]['method']); order = [k for k in order if k in src]; removed = [k for k in order if 'method-step__n--struck' in src[k]]
    live = [k for k in order if k not in removed]; num = {k: i + 1 for i, k in enumerate(live)}; changed = order_changed(order, removed)
    a, b = frame(CAP[key]['method']); return a + ''.join(src[k] if k in removed else numbered(src[k], k, num[k], show, changed) for k in order) + b
def table(key, frm, to):
    ing = CAP[key]['ing']; old = f'Step {frm}<span class="ingredient-table__step-head-lead">Sweeten'; assert ing.count(old) == 1; return ing.replace(old, f'Step {to}<span class="ingredient-table__step-head-lead">Sweeten')
def creation(steps=2):
    m = CAP['ed_moved']['method']; ends = [x.end() for x in re.finditer(r'</div></li>', m)]; assert len(ends) == 5; return m[:ends[steps - 1]] + '</ol></section>'
S = lambda *regions: sheet(*regions, page='notebook', tabs=True)

def build_pen():
    assert CAP['ed_moved']['live'] == ['Step 3 of 5'] and CAP['ed_moved']['focus']['t'] == 'Step 3, move up'
    r0 = [cell(P('pm-create', 1366, sheet(creation(), tabs=True), 'As built · creating a recipe', 'The pattern. A step\'s last line reads Add step · Move up · Move down · Remove. The first step\'s Move up is grey: it stays a Tab stop and does nothing. After a press, focus stays on the same button and "Step 3 of 5" is announced (captured). Two of the five steps are shown.', natural=True, w=576)),
          cell(P('pm-built', 1366, S(CAP['pen']['method']), 'As built · Next version', 'Version 1 of Coffee: Steep, Strain, Rest, Sweeten, Churn. A closed step offers Edit this step · Remove. Nothing changes the order.', natural=True, w=576))]
    r1 = [cell(P('pm-moves', 1366, S(pen(PARENT)), 'Drawn · steps that can be moved', 'A closed step\'s line reads Edit this step · Move up · Move down · Remove: the step\'s own control first, then the three that act on it among the steps, Remove last. No Add step: the pen adds none. The first step\'s Move up and the last step\'s Move down are grey, as in the creation editor.', natural=True, w=576)),
          cell(P('pm-once', 1366, S(pen(ONCE, flags=[('Step 3, move up', 'pressed; focus stays here')])), 'Drawn · Move up pressed on Sweeten', 'Sweeten is step 3 now and Rest is step 4. Each says the number it has on Version 1: "was step 4", "was step 3", in the type of "removed". Focus stays on the button, so a second press moves it again; "Step 3 of 5" is announced.', natural=True, w=576)),
          cell(P('pm-twice', 1366, S(pen(TWICE, flags=[('Step 2, move up', 'pressed again')])), 'Drawn · pressed again', 'Steep, Sweeten, Strain, Rest, Churn. Three steps have a new number and say their old one. Moving Sweeten back down twice clears the words: the order is the parent\'s again and the pen holds no change.', natural=True, w=576))]
    r2 = [cell(P('pm-removed', 1366, S(pen(TWICE, removed=(REST,))), 'Drawn · a removed step among moved ones', 'Rest removed. It keeps its place, struck, with no number, and offers Edit this step · Restore, as built: no Move. A moved step passes over it in one press. Churn is step 4 now; once the order differs from the parent\'s, every step whose number changed says the old one.', natural=True, w=576)),
          cell(P('pm-open', 1366, S(pen(TWICE, open_=SWEETEN)), 'Drawn · a step open', 'Sweeten opened with Edit this step. "was step 4" stands under its two fields, where "removed" stands on a removed step. An open step ends with Cancel · Done, as built, and has no Move: Done first, then move. Cancel puts back the step\'s words; it does not put back its place.', natural=True, w=576)),
          cell(P('pm-table', 1366, S(table('pen', 4, 2)), 'Drawn · the Ingredients table follows', 'Sweeten\'s rows now read under "Step 2". Every number the app writes follows the order: the table\'s step heads, "still used by step 2", a target hint, a field\'s name. Words the maker typed ("the base from step 1") do not.', natural=True, w=576))]
    return flow('Version pen (Next version) · steps that can be moved', 'Drawn 2026-11-23 for bug-p11-pen-steps-no-reorder (Mark: fix). 1366 only. Built markup (a scratch build of main at 65678e4f); only the Move buttons, the new order and the "was step" words are drawn. Order only: no step is added and no ingredient changes step. Purple tags are notes. Not approved yet.',
                [('As built', 'The creation editor moves a step with two buttons on its last line. The version pen has none.', r0),
                 ('Drawn · the pen', 'The creation editor\'s buttons, words, grey ends, focus and announcement, on the closed step\'s line beside Remove.', r1),
                 ('Drawn · with a removed step, an open step, and the table', '', r2)], LABH=176)

def build_shown():
    r0 = [cell(P('so-built', 1366, S(CAP['v2_changes']['method']), 'As built · Show changes, a step removed', 'Today, with the order unchanged. The removed step is struck in its place with the number it had, and the word "removed". The steps after it take new numbers and carry no mark.', natural=True, w=576)),
          cell(P('so-a', 1366, S(read('v2_changes', TWICE, 'A')), 'A · the words "was step 4"', 'After the step, in the type of "removed". Says what it means, to the eye and to a screen reader alike, and adds no height. Recommended.', natural=True, w=576)),
          cell(P('so-b', 1366, S(read('v2_changes', TWICE, 'B')), 'B · the old number struck under the new one', 'The parent\'s number, struck, as a replaced value is. Quick to scan down the margin, but a step grows by a line (23 to 46 px), the pair "2 over 4" has to be learned, and in Safari\'s engine the stroke on a 4 falls on the digit\'s own bar. A screen reader hears "was step 4".', natural=True, w=576)),
          cell(P('so-c', 1366, S(read('v2_changes', TWICE, 'C')), 'C · no mark', 'The order is not shown as a change. Show changes marks the removed step only; a reader compares the two versions to see that Sweeten moved.', natural=True, w=576))]
    r1 = [cell(P('so-read', 1366, S(read('v2_reading', TWICE, 'C')), 'Drawn · the saved version, read plain', 'Show changes off. The steps in their new order, numbered 1 to 4. No mark and no removed step, as any version reads.', natural=True, w=576)),
          cell(P('so-table', 1366, S(table('v2_reading', 3, 2)), 'Drawn · its Ingredients', 'The step heads follow: Step 1 Steep, Step 2 Sweeten. No mark on a head in any state; the mark lives in Instructions.', natural=True, w=576))]
    return flow('A changed step order · how it reads against the parent', 'Drawn 2026-11-23 for bug-p11-pen-steps-no-reorder. 1366 only. Coffee, Version 2 "sweeten warm", saved from the pen on the other board: Sweeten moved up twice, Rest removed. Built markup of Show changes and of the reading page, reordered and marked. The pen shows the same mark as Show changes. For Mark to choose. Not approved yet.',
                [('Show changes on the saved version · three ways', 'The pen on the other board is drawn with A. Whichever is chosen: once the order of the kept steps differs from the parent\'s, every step whose number changed is marked; a removed step reads as built.', r0),
                 ('The same version elsewhere, whichever is chosen', 'On paper the sheet prints the version as it reads here: the new order, numbered 1 to 4. The printed sheet shows no changes today, and that stays.', r1)], LABH=150)

TITLES = {'P12_PenStepOrder': 'Version pen · steps that can be moved · 1366 (2026-11-23; drawn, for Mark to approve)',
          'P12_StepOrderShown': 'A changed step order · how it reads against the parent · three ways · 1366 (2026-11-23; drawn, for Mark to choose)'}
BUILD = (('P12_PenStepOrder', build_pen), ('P12_StepOrderShown', build_shown))
PAGE = ('page-28', 'Phase 12 version pen: step order')

def build_boards(out):
    sizes = {}; css = G.panel_css() + '[hidden]{display:none !important}' + PM_CSS + G.FLAG_CSS
    for key, fn in BUILD:
        body, w, h = fn()
        main = f'<div style="position:relative;width:{w}px;height:{h}px;background:#ffffff">{body}</div>'
        open(f'{out}/project/{key}.dc.html', 'w').write(printstart.board(TITLES[key], main, w, h, css)); sizes[key] = (w, h)
    return sizes
def measure_html():
    pb = ''.join(f'<div data-pid="{p["pid"]}" data-natural="{int(p["natural"])}" class="fp-win g2w-{p["W"]}" style="display:none;position:absolute;left:0;top:0;width:{p["w"]}px;{"" if p["natural"] else "height:%dpx" % p["h"]}">{p["html"]}</div>\n' for p in G.PANELS)
    return '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s[hidden]{display:none !important}</style></head><body>%s</body></html>' % ((G.panel_css() + PM_CSS + G.FLAG_CSS).replace("/_blob/37ac467ba5558024f5fb5a2e5c22a7bc", os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')), pb)

if __name__ == '__main__':
    out = sys.argv[2]; os.makedirs(out + '/project', exist_ok=True)
    if sys.argv[1] == 'measure':
        build_boards(out); open(out + '/measure.html', 'w').write(measure_html()); print(len(G.PANELS), 'panels')
    else:
        c = json.load(open(sys.argv[1])); sizes = build_boards(out); B = c['boards']; N = c['notes']
        if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(1 if c['pages'] and c['pages'][0]['id'] == 'page-home' else 0, {'id': PAGE[0], 'name': PAGE[1]})      # pages newest first, after Home
        x = 0
        for key, _ in BUILD:
            fn = key + '.dc.html'; w, h = sizes[key]; B[fn] = {**dict(page=PAGE[0], x=x, y=0), **B.get(fn, {}), 'w': w, 'h': h, 'title': TITLES[key]}
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + w + 240
        N['p12pm-title'] = {**dict(x=0, y=-300, maxW=6000), **N.get('p12pm-title', {}), **dict(text='Phase 12: changing the order of steps in the version pen (drawn 2026-11-23 for bug-p11-pen-steps-no-reorder; not approved)', kind='title1', page=PAGE[0])}
        if 'p12pm-title' not in c['noteOrder']: c['noteOrder'].append('p12pm-title')
        json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
