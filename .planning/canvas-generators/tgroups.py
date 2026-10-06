import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 58's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-06: redrawn with Mark's note on look-tasting-groups-names-board (Any problems? takes Next time's face; the axes and the failures each split into Every recipe / This recipe only, as the pen's do).
# Sid, 2026-10-05 (decision 58): the reading state's tasting groups under the record pen's three names. Mark, on his List (draw-tasting-group-names): "They should all be 'Every recipe / This recipe only / Any problems?'".
# Every panel is the built app's own shell markup (tgroups-capture.json: WebKit, coarse pointer, Olive Oil v1; real clicks and fills on a COPY of app/dist served on a throwaway port) with the app's own stylesheets
# resolved at the width. The panels marked built are the build untouched. The others are the same page after the browser's edit of the live DOM (tgroups-capture.mjs says what each edit is: the groups renamed and
# regrouped as the option draws them, the face and spacing the build already has). Nothing here is a build and nothing here edits app/.
PC = json.load(open(HERE + '/tgroups-capture.json'))
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HTML = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in PC.items()}
FACT = {k: v['facts'] for k, v in PC.items()}
STAMP_A = " (decision 58, redrawn 2026-10-06 with Mark's note; options for Mark, awaiting his look; nothing approved)"
def n(x): return ('%.1f' % x).rstrip('0').rstrip('.')
def F(W, s, o): return FACT['%s_%s_%d' % (s, o, W)]
def crop_read(f):
    s, c = f['section'], f['conclusion']; bottom = max(s['y'] + s['h'], (c['y'] + c['h']) if c else 0)
    return (s['x'] - 12, s['w'] + 24, s['y'] - 3, bottom - s['y'] + 6)
def crop_pen(f):
    c, m, g = f['cue'], f['melt'], f['grid']; return (g['x'] - 12, g['w'] + 24, c['y'] - 12, m['y'] + m['h'] - c['y'] + 24)
PANELS = []
def panel(pid, W, s, o, kind, cap, fl):
    f = F(W, s, o); x0, ww, y0, hh = (crop_read(f) if kind == 'read' else crop_pen(f))
    PANELS.append(dict(pid=pid, W=W, html=HTML['%s_%s_%d' % (s, o, W)], cap=cap, fl=fl, crop=(x0, ww, y0, hh))); return PANELS[-1]
ROWH = 112
def board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, labh, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:4400px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:3000px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra='', onehead=False))
            try: html = with_menu(p['html'], W)
            except AssertionError: html = p['html']
            html = unique_ids(html, vid)
            x0, ww, y0, hh = p['crop']
            cells.append((vid, W, html, x0, y0, ww, hh, p['cap'], p['fl'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap, fl in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div class="fp-labbox" style="height:{labh}px;"><p class="fp-lab">{cap}<small>{fl}</small></p></div>'
                     f'<div class="fp-win {vid}" data-pid="{vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += labh + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_A, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_A[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_A, snap=snap)
ENTRIES_A = {}
def build_board():
    rows = []
    for W in (1366, 393):
        ctx = '1366 · iPad landscape, coarse pointer, the 350px log column' if W == 1366 else '393 · phone, coarse pointer'
        lab = 150 if W == 393 else 140
        sn, fu, pe = F(W, 'seed', 'none'), F(W, 'full', 'none'), F(W, 'pen', 'none')
        fa, fb, fc, fb2 = F(W, 'full', 'A'), F(W, 'full', 'B'), F(W, 'full', 'C'), F(W, 'full', 'B2')
        sa, sp, spa = F(W, 'seed', 'B2'), F(W, 'sparse', 'none'), F(W, 'sparse', 'B2')
        d = lambda a, b: ('+' if a['section']['h'] - b['section']['h'] >= 0 else '-') + n(abs(a['section']['h'] - b['section']['h']))
        rows.append((f'{ctx} · what the build does today', 'Olive Oil v1. The reading state names its tasting groups Observations, Problems and Melt. The record pen names the same fields Every recipe and This recipe only, twice: over the marks and, under the caption Any problems? (the caption face Next time has), over the problem chips. It has no name for the melt fields.', lab, [
            panel(f'seed-built-{W}', W, 'seed', 'none', 'read', 'Built · reading, the seeded batch',
                  f'Observations (Sweetness, Oil), Problems (Bitter), Melt (Melt test, Melt style). The group names are 12px 600 caps in grey, the same face as the cell labels under them: the names do not stand out from the items.'),
            panel(f'full-built-{W}', W, 'full', 'none', 'read', 'Built · reading, all six axes and five problems',
                  f'A batch recorded with every field. Observations hold all six marks in one group, so the core and declared marks read as one list. Section {n(fu["section"]["h"])}px.'),
            panel(f'pen-built-{W}', W, 'pen', 'none', 'pen', 'Built · the record pen, the same fields typed',
                  f'Every recipe and This recipe only over the marks (14px/20px 600, sentence case, ink); Any problems? as a caption (12px 600 caps grey, the face of Next time); then Every recipe and This recipe only again over the chips. The melt fields have no name; each carries its own label ({", ".join(pe["captions"])}).')]))
        rows.append((f'{ctx} · the reading state in the pen\'s names', 'Every option follows Mark\'s note: Every recipe and This recipe only split the marks and, under Any problems?, the problems; Any problems? keeps the face the built Problems group and Next time share. A, B and C differ in where the melt fields go; in those three the two names stay in the reading\'s own face. B2 is B with the two names in the pen\'s cue face. Spacing is as built in all four.', lab, [
            panel(f'a-{W}', W, 'full', 'A', 'read', 'A · the melt fields stay at the foot, with no name',
                  f'The marks in Every recipe ({", ".join(c for g in fa["groups"] if g["head"] == "Every recipe" for c in g["cells"])}) and This recipe only (Body, Oil); Any problems? over the words, split the same two ways (the Every recipe four, then Bitter); the Melt name goes and the two melt cells keep their own labels, as in the pen, after the problems. The two names are in the reading\'s own face, caps grey, so they look like the labels beside them. Section {n(fa["section"]["h"])}px ({d(fa, fu)}).'),
            panel(f'b-{W}', W, 'full', 'B', 'read', 'B · the melt fields join the measured values at the top',
                  f'Melt test and Melt style stand with Tempering and Tasting temperature (two rows of two), as the printed sheet lists them. Every recipe and This recipe only are then the only group names besides Any problems?; they stay in the reading\'s own face, caps grey. Section {n(fb["section"]["h"])}px ({d(fb, fu)}).'),
            panel(f'c-{W}', W, 'full', 'C', 'read', 'C · Melt stays as a fourth name',
                  f'The same split, and Melt kept as a group of its own, the one name the pen does not have, between Any problems? and Next time. Section {n(fc["section"]["h"])}px ({d(fc, fu)}).'),
            panel(f'b2-{W}', W, 'full', 'B2', 'read', 'B2 · B, Every recipe and This recipe only in the pen\'s cue face (recommended)',
                  f'B, and the two names at 14px/20px 600 sentence case in ink (decision 40\'s cue face, as the pen has them, over the marks and over the problems) instead of 12px 600 grey caps. Any problems? and Next time keep the caps grey face they share in the build and the pen; the two names then read as groups of what stands under them, and the other two as headings, as in the pen. A second block under Any problems? stands one group gap (32px) below the first; each name sits its label margin above its words. Section {n(fb2["section"]["h"])}px ({d(fb2, fu)}).')]))
        rows.append((f'{ctx} · B2 on the other two tastings', 'A group with nothing marked is left out, as the build leaves out Problems today and as the printed sheet leaves out This recipe only for a recipe that declares none.', lab, [
            panel(f'seed-b2-{W}', W, 'seed', 'B2', 'read', 'B2 · the seeded batch',
                  f'One mark in each group: Every recipe (Sweetness) and This recipe only (Oil), two rows where the build has one; the melt cells move up beside Tempering and Tasting temperature; Bitter reads under Any problems? and This recipe only, three names over one word. Section {n(sn["section"]["h"])} to {n(sa["section"]["h"])}px ({d(sa, sn)}).'),
            panel(f'sparse-built-{W}', W, 'sparse', 'none', 'read', 'Built · a batch with Hardness and Smoothness only',
                  f'No declared mark, no problem, no melt value. Section {n(sp["section"]["h"])}px. Observations, Melt; no Problems group.'),
            panel(f'sparse-b2-{W}', W, 'sparse', 'B2', 'read', 'B2 · the same batch',
                  f'Every recipe (Hardness, Smoothness); This recipe only and Any problems? are not drawn; the melt cells read "not measured" at the top. Section {n(spa["section"]["h"])}px ({d(spa, sp)}).')]))
    board('R35C_TastingGroups', 'tasting-group-names', 'C · the reading state\'s tasting groups as the pen has them (Mark\'s note, 2026-10-06): Every recipe and This recipe only over the marks and over the problems, Any problems? in the face Next time has. As built, then A (melt at the foot, unnamed), B (melt with the measured values), C (Melt kept) and B2 (B with the two names in the pen\'s cue face, recommended) (Olive Oil v1; 1366 and 393)', rows)
build_board()
json.dump({'boards': ENTRIES_A}, open(OUT + '/tgroups-canvas-entries.json', 'w'), indent=2)
print('ok tgroups', {fn: (e['w'], e['h']) for fn, e in ENTRIES_A.items()})
