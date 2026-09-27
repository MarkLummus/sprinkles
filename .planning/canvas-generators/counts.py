import sys; sys.argv=['x']
from gen import *
# Mark, 2026-09-27: "how should we handle 1 version vs. many version? same for 0 batches, 1 batch, many batches?
# I think a few artboards would help decide it." Options side by side; nothing here is decided.
def caption(t, sub=''):
    s = f'<p style="margin:0;font-family:{GROT};font-size:15px;font-weight:700;color:{TEXT};">{t}</p>'
    if sub: s += f'<p style="margin:4px 0 0;font-family:{GROT};font-size:13px;line-height:1.4;color:{TEXT2};">{sub}</p>'
    return f'<div style="padding-bottom:12px;border-bottom:1px dashed {DIV};">{s}</div>'
def panel(t, sub, body, w):
    return f'<div style="flex:none;width:{w}px;display:flex;flex-direction:column;gap:20px;min-width:0;">{caption(t, sub)}{body}</div>'
def page(inner, gap=64, direction='row'):
    return f'<div style="padding:48px;display:flex;flex-direction:{direction};gap:{gap}px;align-items:flex-start;background:{APP_BG};">{inner}</div>'
def dc(fn, title, w, h, main):
    html = board(title, w, h, '', extra_css='[hidden]{display:none !important}')
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)

# ---------- versions ----------
V1 = [('1 Jul', 'Version 1 · 50 g oil · 800 g', 'churned 2 Aug · Latest', True, True)]
V8 = [('1 Jul','Version 1 · 50 g oil · 800 g','churned 2 Aug',True,False),('20 Jul','Version 2 · less oil','churned 24 Jul',True,False),
      ('4 Aug','Version 3 · more salt','churned 6 Aug',True,False),('11 Aug','Version 4 · allulose out','',False,False),
      ('18 Aug','Version 5 · gum blend up','churned 20 Aug',True,False),('25 Aug','Version 6 · cream at 36%','churned 27 Aug',True,False),
      ('1 Sep','Version 7 · oil cold-emulsified','churned 3 Sep · Latest',True,True),('20 Sep','Version 8 · 40 g oil','draft',False,False)]
def band(history_html, vb=None):
    return f'''<header style="display:flex;flex-direction:column;gap:24px;padding:20px 0 24px;border-bottom:1px solid {DIV};">
  <div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:start;"><div>{recipe_identity(False)}</div><div>{vb or version_block()}</div></div>
  {history_html}</header>'''
def rail_end(versions, hint):
    h = history_rail(versions, hint)
    # at rest the rail opens scrolled to the version in view: the latest end, older versions behind a fade
    h = h.replace('<div style="position:relative;overflow:hidden;">', '<div style="position:relative;overflow:hidden;display:flex;justify-content:flex-end;">')
    return h.replace('</div>\n  </div></div>\n</div>', f'</div>\n    <div aria-hidden="true" style="position:absolute;top:0;left:0;bottom:0;width:96px;background:linear-gradient(to left, rgba(255,255,255,0), #ffffff);pointer-events:none;"></div>\n  </div></div>\n</div>')
v7 = version_block().replace('Version 1 · 50 g oil · 800 g', 'Version 7 · oil cold-emulsified').replace('1 Jul 2026', '1 Sep 2026')
# a later version has a parent, so it carries the app's From version row (Mark, 2026-09-27)
v7 = v7.replace(f'<dt style="color:{TEXT2};">Why</dt>', f'<dt style="color:{TEXT2};">From version</dt><dd style="margin:0;"><a href="#" style="color:{BLUE_T};text-underline-offset:3px;">Version 6 · cream at 36%</a></dd>\n      <dt style="color:{TEXT2};">Why</dt>', 1)
one_line = f'<div style="display:flex;flex-direction:column;gap:10px;">{cap("History")}<p style="margin:0;font-family:{GROT};font-size:14px;color:{TEXT2};">Only this version so far</p></div>'
W = 1078
vers = ''.join([
  panel('1 version · today', 'The rail draws with its one node. The hint reads "1 version · oldest left, latest right".', band(history_rail(V1, '1 version · oldest left, latest right')), W),
  panel('1 version · option A: no History yet', 'History appears once a second version is saved. Until then, the band is the recipe and the version.', band(''), W),
  panel('1 version · option B: History as one line · picked (Mark, 2026-09-27)', 'The section stays in place, so the band keeps its shape, with one plain line instead of a rail.', band(one_line), W),
  panel('Many versions · today (8)', 'The rail opens at the version in view, older versions behind a fade on the left, and scrolls.', band(rail_end(V8, '8 versions · oldest left, latest right · opens at the version in view'), v7), W),
])
dc('R35C_CountVersions.dc.html', 'Counts · versions: 1 vs many (options, not decided)', 1174, 1740, page(vers, gap=48, direction='column'))

# ---------- batches: 0 and 1 ----------
L = 350
# the head as it was before the pick: Batches (1) beside Correct
b1 = batch_log('batch', column=True).replace(textctl('Correct'), textctl('Batches (1)') + textctl('Correct'), 1)
b1_no_ctl = b1.replace(textctl('Batches (1)'), '', 1)
b0 = batch_log('none', column=True)
ba = ''.join([
  panel('0 batches · today', 'Not yet churned: the log offers Record a batch and Print sheet.', b0, L),
  panel('1 batch · today', 'The head reads Batches (1), which opens a list of one: the batch already in view.', b1, L),
  panel('1 batch · option: no Batches control · picked (Mark, 2026-09-27)', 'Batches (n) appears from a second batch. Correct and Record another stay.', b1_no_ctl, L),
])
dc('R35C_CountBatches01.dc.html', 'Counts · batches: 0 and 1 (options, not decided)', 1274, 900, page(ba))

# ---------- batches: many ----------
B = [('16 Aug 2026', 'Tasted 17 Aug 2026 · out of machine −6 °C', True), ('9 Aug 2026', 'Not yet tasted · out of machine −5 °C', False), ('2 Aug 2026', 'Tasted date unknown · out of machine −6 °C', False)]
def head(left, right):
    return f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;">{left}<div style="display:flex;align-items:baseline;gap:18px;">{right}</div></div>'
date = lambda d: f'<span style="font-family:{GROT};font-size:15px;color:{TEXT};font-variant-numeric:tabular-nums;">churned {d}</span>'
bm = batch_log('batch', column=True).replace('churned 2 Aug 2026', 'churned 16 Aug 2026', 1).replace('Recorded 4 Aug 2026', 'Recorded 17 Aug 2026', 1).replace('tasted date unknown', 'tasted 17 Aug 2026', 1)
old_head = re.search(r'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;">.*?</div>\s*</div>', bm, flags=re.S).group(0)
# A: today's register
reg_items = ''.join(f'''<li style="padding:10px 0;border-top:1px solid {DIV};display:flex;flex-direction:column;gap:2px;">
  <span style="font-family:{GROT};font-size:14px;{'font-weight:700;color:'+TEXT if cur else 'color:'+BLUE_T+';text-decoration:underline;text-underline-offset:3px'};">Batch · {d}{' <span style="font-weight:400;color:'+TEXT2+';">· In view · Latest</span>' if cur else ''}</span>
  <span style="font-family:{GROT};font-size:12px;color:{TEXT2};">{m}</span></li>''' for d, m, cur in B)
reg = f'<div style="display:flex;flex-direction:column;gap:6px;">{cap("Batches of this version")}<ol style="margin:0;padding:0;list-style:none;">{reg_items}</ol></div>'
optA = bm.replace(old_head, head(f'<div style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}{date("16 Aug 2026")}</div>', textctl('Hide batches (3)') + textctl('Correct') + textctl('Record another')) + reg, 1)
# B: a batch timeline, like History
def bnode(d, cur, tasted):
    ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if cur else ''
    dot = f'background:{NOTEBOOK};' if tasted else f'background:{APP_BG};border:1.5px solid {NOTEBOOK};'
    lbl = f'<span style="font-family:{GROT};font-size:13px;font-weight:{700 if cur else 400};color:{TEXT if cur else BLUE_T};{"" if cur else "text-decoration:underline;text-underline-offset:3px;"}">{d.rsplit(" ",1)[0]}</span>'
    return f'<a href="#" style="flex:0 0 92px;display:flex;flex-direction:column;gap:6px;text-decoration:none;"><span style="display:flex;align-items:center;height:12px;"><span aria-hidden="true" style="box-sizing:border-box;width:12px;height:12px;border-radius:6px;{dot}{ring}"></span></span>{lbl}</a>'
TASTED = lambda m: not m.startswith('Not yet tasted')
tl = f'''<div style="display:flex;flex-direction:column;gap:8px;"><div style="display:flex;justify-content:space-between;align-items:baseline;">{cap("Batches")}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">3 · oldest left · hollow: not yet tasted</span></div>
  <div style="position:relative;"><div style="position:absolute;left:0;right:0;top:6px;height:1px;background:{DIV};"></div>
  <div style="position:relative;display:flex;gap:12px;padding:0 6px;">{''.join(bnode(d, cur, TASTED(m)) for d, m, cur in reversed(B))}</div></div></div>'''
optB = bm.replace(old_head, head(f'<div style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}{date("16 Aug 2026")}</div>', textctl('Correct') + textctl('Record another')) + tl, 1)
# C: a drop-down in place of the date
sel = f'''<label style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}<select aria-label="Batch in view" style="font-family:{GROT};font-size:15px;color:{TEXT};padding:6px 28px 6px 10px;border:1px solid {DIV};border-radius:8px;background:{APP_BG};">{''.join(f'<option{" selected" if cur else ""}>churned {d}</option>' for d, m, cur in B)}</select></label>'''
optC = bm.replace(old_head, head(sel, textctl('Correct') + textctl('Record another')), 1)
def vnode(d, m, cur, last):
    ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if cur else ''
    dot = f'background:{NOTEBOOK};' if TASTED(m) else f'background:{APP_BG};border:1.5px solid {NOTEBOOK};'
    line = '' if last else f'<span aria-hidden="true" style="position:absolute;left:5.5px;top:18px;bottom:-12px;width:1px;background:{DIV};"></span>'
    title = f'<span style="font-family:{GROT};font-size:14px;font-weight:700;color:{TEXT};">churned {d}</span>' if cur else f'<span style="font-family:{GROT};font-size:14px;color:{BLUE_T};text-decoration:underline;text-underline-offset:3px;">churned {d}</span>'
    return f'''<li style="position:relative;"><a href="#" style="position:relative;display:grid;grid-template-columns:12px minmax(0,1fr);column-gap:14px;min-height:44px;text-decoration:none;">
  {line}<span style="display:flex;align-items:center;height:20px;"><span aria-hidden="true" style="box-sizing:border-box;width:12px;height:12px;border-radius:6px;{dot}{ring}"></span></span>
  <span style="display:flex;flex-direction:column;gap:2px;min-width:0;">{title}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">{m}</span></span></a></li>'''
vrail = f'''<div style="display:flex;flex-direction:column;gap:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;">{cap("Batches")}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">3 · latest first</span></div>
  <ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;">{''.join(vnode(d, m, cur, i == len(B) - 1) for i, (d, m, cur) in enumerate(B))}</ol></div>'''
optD = bm.replace(old_head, vrail + f'<div style="padding-top:14px;border-top:1px solid {DIV};">' + head(f'<div style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}{date("16 Aug 2026")}</div>', textctl('Correct') + textctl('Record another')) + '</div>', 1)
bmany = ''.join([
  panel('3 batches · A: today, a list', 'Batches (3) opens the list of this version’s batches under the head, each with its tasting and machine reading. Drawn open.', optA, L),
  panel('3 batches · B: a batch timeline', 'Like History: one node per batch, oldest left, the one in view ringed. It scrolls past about three.', optB, L),
  panel('3 batches · C: a drop-down', 'The churn date becomes the chooser. Compact, and it grows with no room cost, but it hides the others until opened.', optC, L),
  panel('3 batches · D: the rail upright in the side column', 'From 1366, where the log is a column, the batches stand as a vertical rail above the batch in view, latest first, each with its tasting and machine reading. Below 1366 it lies down as B.', optD, L),
])
dc('R35C_CountBatchesMany.dc.html', 'Counts · batches: many, four ways to choose (options, not decided)', 1688, 1120, page(bmany))

# ---------- batches: many, at 393 ----------
# the log sits under the Sheet on the phone, full width inside the 20px gutter (the ladder below 724); drawn so the choice is made on the phone too (critique 2026-09-27)
P = 393
def phone(t, sub, body):
    return panel(t, sub, f'<div style="box-sizing:border-box;width:{P}px;padding:20px;border:1px solid {DIV};border-radius:12px;background:{APP_BG};">{body}</div>', P)
optA_closed = bm.replace(old_head, head(f'<div style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}{date("16 Aug 2026")}</div>', textctl('Batches (3)') + textctl('Correct') + textctl('Record another')), 1)
ph = ''.join([
  phone('393 · A: a list, closed', 'Batches (3) sits in the head beside Correct and Record another; the list opens under the head as at 1366.', optA_closed),
  phone('393 · B (and D below 1366): a timeline', 'Three nodes fit across 353; a fourth scrolls, older ones behind a fade on the left.', optB),
  phone('393 · C: a drop-down', 'On the iPhone the native picker opens from the bottom of the screen.', optC),
])
dc('R35C_CountBatchesMany393.dc.html', 'Counts · batches: many, at 393 (options, not decided)', 1403, 960, page(ph))
print('ok')

# ---------- upright rails at 393 ----------
# Mark, 2026-09-27: "I want to see the versions and batches timeline in vertical form at 393 width"
def vver(date, title, meta, filled_, cur, last):
    ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if cur else ''
    dot = f'background:{NOTEBOOK};' if filled_ else f'background:{APP_BG};border:1.5px solid {NOTEBOOK};'
    line = '' if last else f'<span aria-hidden="true" style="position:absolute;left:5.5px;top:18px;bottom:-12px;width:1px;background:{DIV};"></span>'
    t = f'<span style="font-family:{GROT};font-size:14px;font-weight:700;color:{TEXT};">{title}</span>' if cur else f'<span style="font-family:{GROT};font-size:14px;color:{BLUE_T};text-decoration:underline;text-underline-offset:3px;">{title}</span>'
    m = ' · '.join(x for x in (date, meta) if x)
    return f'''<li style="position:relative;"><a href="#" style="position:relative;display:grid;grid-template-columns:12px minmax(0,1fr);column-gap:14px;min-height:44px;text-decoration:none;">
  {line}<span style="display:flex;align-items:center;height:20px;"><span aria-hidden="true" style="box-sizing:border-box;width:12px;height:12px;border-radius:6px;{dot}{ring}"></span></span>
  <span style="display:flex;flex-direction:column;gap:2px;min-width:0;">{t}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};font-variant-numeric:tabular-nums;">{m}</span></span></a></li>'''
V8_IN_VIEW = [(d, t, m, f, t.startswith('Version 7')) for d, t, m, f, c in V8]
# History folds like every other section, its Show/Hide beside the label (Mark, 2026-09-27: "we need the Show/Hide on History also");
# closed by default below 1366 (decision 18). The canvas ignores hidden, so the closed state leaves the rail out.
def hist_head(open_):
    ctl = textctl('Hide' if open_ else 'Show').replace('<button type="button"', f'<button type="button" aria-expanded="{"true" if open_ else "false"}" aria-controls="fold-history"', 1)
    return f'<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="display:flex;align-items:baseline;gap:14px;">{cap("History")}{ctl}</div><span style="font-family:{GROT};font-size:12px;color:{TEXT2};">8 versions{" · latest first" if open_ else ""}</span></div>'
vrail_v = f'''<ol id="fold-history" style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;">{''.join(vver(*v, i == len(V8_IN_VIEW) - 1) for i, v in enumerate(reversed(V8_IN_VIEW)))}</ol>'''
vhist = f'<div style="display:flex;flex-direction:column;gap:10px;">{hist_head(True)}{vrail_v}</div>'
vhist_closed = f'<div style="display:flex;flex-direction:column;gap:10px;">{hist_head(False)}</div>'
band393 = lambda h: f'''<header style="display:flex;flex-direction:column;gap:20px;padding:16px 0 20px;border-bottom:1px solid {DIV};">
  {recipe_identity(False)}{v7}{h}</header>'''
def phone_frame(body):
    return f'<div style="box-sizing:border-box;width:{P}px;padding:0 20px 20px;border:1px solid {DIV};border-radius:12px;background:{APP_BG};overflow:hidden;">{body}</div>'
up = ''.join([
  panel('393 · History upright, closed', 'Closed by default below 1366, like the other folds: the label, Show beside it, and the count.', phone_frame(band393(vhist_closed)), P),
  panel('393 · History upright, open', 'Hide beside the label; the rail stands latest first, each version one row. All eight show; nothing scrolls sideways.', phone_frame(band393(vhist)), P),
  panel('393 · Batches upright', 'The log under the Sheet: the batches of this version as a vertical rail above the batch in view, latest first, each with its tasting and machine reading.', phone_frame('<div style="padding-top:20px;">' + optD + '</div>'), P),
])
dc('R35C_CountUpright393.dc.html', 'Counts · versions and batches upright at 393 (options, not decided)', 1427, 1120, page(up))
