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
    return h.replace('</div>\n  </div>\n</div>', f'</div>\n    <div aria-hidden="true" style="position:absolute;top:0;left:0;bottom:0;width:96px;background:linear-gradient(to left, rgba(255,255,255,0), #ffffff);pointer-events:none;"></div>\n  </div>\n</div>')
v7 = version_block().replace('Version 1 · 50 g oil · 800 g', 'Version 7 · oil cold-emulsified').replace('1 Jul 2026', '1 Sep 2026')
# a later version has a parent, so it carries the app's From version row (Mark, 2026-09-27)
v7 = v7.replace(f'<dt style="color:{TEXT2};">Why</dt>', f'<dt style="color:{TEXT2};">From version</dt><dd style="margin:0;"><a href="#" style="color:{BLUE_T};text-underline-offset:3px;">Version 6 · cream at 36%</a></dd>\n      <dt style="color:{TEXT2};">Why</dt>', 1)
one_line = f'<div style="display:flex;flex-direction:column;gap:10px;">{cap("History")}<p style="margin:0;font-family:{GROT};font-size:14px;color:{TEXT2};">Only this version so far</p></div>'
W = 1078
vers = ''.join([
  panel('1 version · today', 'The rail draws with its one node. The hint reads "1 version · oldest left, latest right".', band(history_rail(V1, '1 version · oldest left, latest right')), W),
  panel('1 version · option A: no History yet', 'History appears once a second version is saved. Until then, the band is the recipe and the version.', band(''), W),
  panel('1 version · option B: History as one line', 'The section stays in place, so the band keeps its shape, with one plain line instead of a rail.', band(one_line), W),
  panel('Many versions · today (8)', 'The rail opens at the version in view, older versions behind a fade on the left, and scrolls.', band(rail_end(V8, '8 versions · oldest left, latest right · opens at the version in view'), v7), W),
])
dc('R35C_CountVersions.dc.html', 'Counts · versions: 1 vs many (options, not decided)', 1174, 1740, page(vers, gap=48, direction='column'))

# ---------- batches: 0 and 1 ----------
L = 350
b1 = batch_log('batch', column=True)
b1_no_ctl = b1.replace(textctl('Batches (1)'), '', 1)
b0 = batch_log('none', column=True)
ba = ''.join([
  panel('0 batches · today', 'Not yet churned: the log offers Record a batch and Print sheet.', b0, L),
  panel('1 batch · today', 'The head reads Batches (1), which opens a list of one: the batch already in view.', b1, L),
  panel('1 batch · option: no Batches control', 'Batches (n) appears from a second batch. Correct and Record another stay.', b1_no_ctl, L),
])
dc('R35C_CountBatches01.dc.html', 'Counts · batches: 0 and 1 (options, not decided)', 1274, 900, page(ba))

# ---------- batches: many ----------
B = [('16 Aug 2026', 'Tasted 17 Aug 2026 · out of machine −6 °C', True), ('9 Aug 2026', 'Not yet tasted · out of machine −5 °C', False), ('2 Aug 2026', 'Tasted date unknown · out of machine −6 °C', False)]
def head(left, right):
    return f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;">{left}<div style="display:flex;align-items:baseline;gap:18px;">{right}</div></div>'
date = lambda d: f'<span style="font-family:{GROT};font-size:15px;color:{TEXT};font-variant-numeric:tabular-nums;">churned {d}</span>'
bm = batch_log('batch', column=True).replace('churned 2 Aug 2026', 'churned 16 Aug 2026', 1).replace('Recorded 4 Aug 2026', 'Recorded 17 Aug 2026', 1)
old_head = re.search(r'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;">.*?</div>\s*</div>', bm, flags=re.S).group(0)
# A: today's register
reg_items = ''.join(f'''<li style="padding:10px 0;border-top:1px solid {DIV};display:flex;flex-direction:column;gap:2px;">
  <span style="font-family:{GROT};font-size:14px;{'font-weight:700;color:'+TEXT if cur else 'color:'+BLUE_T+';text-decoration:underline;text-underline-offset:3px'};">Batch · {d}{' <span style="font-weight:400;color:'+TEXT2+';">· In view · Latest</span>' if cur else ''}</span>
  <span style="font-family:{GROT};font-size:12px;color:{TEXT2};">{m}</span></li>''' for d, m, cur in B)
reg = f'<div style="display:flex;flex-direction:column;gap:6px;">{cap("Batches of this version")}<ol style="margin:0;padding:0;list-style:none;">{reg_items}</ol></div>'
optA = bm.replace(old_head, head(f'<div style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}{date("16 Aug 2026")}</div>', textctl('Hide batches (3)') + textctl('Correct') + textctl('Record another')) + reg, 1)
# B: a batch timeline, like History
def bnode(d, cur):
    ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if cur else ''
    lbl = f'<span style="font-family:{GROT};font-size:13px;font-weight:{700 if cur else 400};color:{TEXT if cur else BLUE_T};{"" if cur else "text-decoration:underline;text-underline-offset:3px;"}">{d.rsplit(" ",1)[0]}</span>'
    return f'<a href="#" style="flex:0 0 92px;display:flex;flex-direction:column;gap:6px;text-decoration:none;"><span style="display:flex;align-items:center;height:12px;"><span aria-hidden="true" style="width:12px;height:12px;border-radius:6px;background:{NOTEBOOK};{ring}"></span></span>{lbl}</a>'
tl = f'''<div style="display:flex;flex-direction:column;gap:8px;"><div style="display:flex;justify-content:space-between;align-items:baseline;">{cap("Batches")}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">3 · oldest left</span></div>
  <div style="position:relative;"><div style="position:absolute;left:0;right:0;top:6px;height:1px;background:{DIV};"></div>
  <div style="position:relative;display:flex;gap:12px;padding:0 6px;">{''.join(bnode(d, cur) for d, m, cur in reversed(B))}</div></div></div>'''
optB = bm.replace(old_head, head(f'<div style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}{date("16 Aug 2026")}</div>', textctl('Correct') + textctl('Record another')) + tl, 1)
# C: a drop-down in place of the date
sel = f'''<label style="display:flex;align-items:baseline;gap:14px;">{cap("Batch")}<select aria-label="Batch in view" style="font-family:{GROT};font-size:15px;color:{TEXT};padding:6px 28px 6px 10px;border:1px solid {DIV};border-radius:8px;background:{APP_BG};">{''.join(f'<option{" selected" if cur else ""}>churned {d}</option>' for d, m, cur in B)}</select></label>'''
optC = bm.replace(old_head, head(sel, textctl('Correct') + textctl('Record another')), 1)
bmany = ''.join([
  panel('3 batches · A: today, a list', 'Batches (3) opens the list of this version’s batches under the head, each with its tasting and machine reading. Drawn open.', optA, L),
  panel('3 batches · B: a batch timeline', 'Like History: one node per batch, oldest left, the one in view ringed. It scrolls past about three.', optB, L),
  panel('3 batches · C: a drop-down', 'The churn date becomes the chooser. Compact, and it grows with no room cost, but it hides the others until opened.', optC, L),
])
dc('R35C_CountBatchesMany.dc.html', 'Counts · batches: many, three ways to choose (options, not decided)', 1274, 1120, page(bmany))
print('ok')
