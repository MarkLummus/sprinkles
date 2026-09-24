import json, re, os, datetime

SP = '/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/10a9aeeb-4724-4ff9-9b65-ce90fed7d98b/scratchpad'
SRC = SP + '/artifact-files/8c08ac14-3ead-48f4-861a-5016f88c8338/project'
OUT = SP + '/canvas/project'
os.makedirs(OUT, exist_ok=True)

asbuilt = open(SRC + '/AsBuiltRecipePage.dc.html').read()
def seg(s, a, b):
    i = s.find(a); j = s.find(b, i); return s[i:j]
SHELL_HEAD = seg(asbuilt, '<header class="shell__head">', '<div class="shell__body">')
RAIL = seg(asbuilt, '<nav class="shell__rail"', '<main class="shell__main">')
RAIL = RAIL.replace('class="shell__place shell__place--notebook" href="/notebook"', 'class="shell__place shell__place--notebook" aria-current="page" href="/notebook"')
SHEET = seg(asbuilt, '<section class="ingredient-table-region"', '</article>').replace('<h2 class="region-name">Method</h2>', '<h2 class="region-name">Instructions</h2>')
TABS = seg(asbuilt, '<nav class="shell__tabs"', '</nav>') + '</nav>'.replace('<h2 class="region-name">Method</h2>', '<h2 class="region-name">Instructions</h2>')
# Carried forward notes dropped (Mark, 2026-09-24): the block leaves every board; Before you start keeps the inherited marker
SHEET = re.sub(r'<div class="authored"><p class="authored__legend"><span>Carried forward</span><span>authored</span></p><ul class="authored__notes">.*?</ul></div>', '', SHEET, count=1, flags=re.S)
STYLESHEET = '/_blob/e7df2000f61674b89baca5fccf5c19f8'

# ---- tokens (Sprinkles Design System, tokens.json) ----
INK = '#141414'; GROUND = '#f7f7f4'; PEN = '#1f3d7a'; CLOTH = '#33513b'
APP_BG = '#ffffff'; SUBTLE = '#f3f4f2'; TEXT = '#141414'; TEXT2 = '#595959'; DIV = '#d6dad7'
NOTEBOOK = '#fd5b57'; NOTEBOOK_T = '#ee0803'; BLUE_T = '#1576de'; RB = '#f18a36'; RB_T = '#bc5b0d'
GROT = "-apple-system,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif"
SERIF = "Georgia,'Iowan Old Style','Times New Roman',serif"
HAND = "'Caveat',Georgia,serif"

HAND_AM = "font-family:'Caveat',Georgia,serif;font-size:20px;line-height:1;color:" + PEN + ";"

def sheet_for(state):
    """Style 6: Grams and Ingredient merged (figure in a right-aligned slot, an 18px gap, the name);
    As made in its own column, in the hand, present only with a batch in view."""
    s = SHEET
    batch = state != 'none'
    # head
    head_batch = '<th scope="col" class="ingredient-table__col-name">Ingredient</th><th scope="col" class="ingredient-table__col-numeric">As made</th><th scope="col" class="ingredient-table__col-numeric">% of batch</th>'
    head_none = '<th scope="col" class="ingredient-table__col-name">Ingredient</th><th scope="col" class="ingredient-table__col-numeric">% of batch</th>'
    s = re.sub(r'<thead>.*?</thead>', '<thead><tr>' + (head_batch if batch else head_none) + '</tr></thead>', s, flags=re.S)
    def fix_row(m):
        row = m.group(0)
        tds = re.findall(r'<td[^>]*>.*?</td>', row, flags=re.S)
        if len(tds) != 5:
            return row
        name_inner = re.sub(r'^<td[^>]*>|</td>$', '', tds[0])
        grams = re.sub(r'^<td[^>]*>|</td>$', '', tds[1])
        am = re.sub(r'^<td[^>]*>|</td>$', '', tds[2])
        am_val = re.sub(r'<[^>]+>', '', am)
        pct, src = tds[3], tds[4]
        name_inner = name_inner.replace('<span class="ingredient-table__portion-note">', '<span class="ingredient-table__portion-note" style="padding-left:82px;">')
        src_val = re.sub(r'<[^>]+>', '', src).strip()
        tag = f' <span class="target-chip" style="margin-left:8px;vertical-align:middle;"><span class="target-chip__value">{src_val}</span></span>' if src_val else ''
        if '<span class="ingredient-table__portion-note"' in name_inner:
            name_inner = name_inner.replace('<span class="ingredient-table__portion-note"', tag + '<span class="ingredient-table__portion-note"', 1)
        else:
            name_inner = name_inner + tag
        merged = f'<td class="ingredient-table__col-name"><span style="display:inline-block;min-width:64px;text-align:right;margin-right:18px;">{grams}</span>{name_inner}</td>'
        am_td = f'<td class="ingredient-table__col-numeric"><span style="{HAND_AM}">{am_val}</span></td>' if am_val else '<td class="ingredient-table__col-numeric"></td>'
        open_tag = re.match(r'<tr[^>]*>', row).group(0)
        return open_tag + merged + (am_td if batch else '') + pct + '</tr>'
    s = re.sub(r'<tr aria-label=.*?</tr>', fix_row, s, flags=re.S)
    s = s.replace('colspan="5"', 'colspan="3"' if batch else 'colspan="2"')
    if not batch:
        s = re.sub(r', as made [\d.]+ g(rams)?', '', s)
        s = s.replace('<span class="method-step__prose--struck">', '<span>')
        s = s.replace('<span class="method-step__skipped-label"> Skipped</span>', '')
        s = re.sub(r'<p class="method-step__changed ink-text">.*?</p>', '', s, flags=re.S)
    else:
        # the batch's Method changes, in the hand too
        s = s.replace('<p class="method-step__changed ink-text">', f'<p class="method-step__changed" style="{HAND_AM}margin:4px 0 0;">')
    return s

def cap(t, color=TEXT2):
    return f'<span style="display:block;font-family:{GROT};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:{color};">{t}</span>'

def hand(t, size=22):
    return f'<span style="font-family:{HAND};font-size:{size}px;line-height:1.25;color:{PEN};">{t}</span>'

def filled(label):
    return f'<button type="button" style="appearance:none;border:none;border-radius:10px;padding:12px 20px;background:{BLUE_T};color:#ffffff;font-family:{GROT};font-size:14px;font-weight:700;cursor:pointer;">{label}</button>'

def quiet(label):
    return f'<button type="button" style="appearance:none;border:1px solid {BLUE_T};border-radius:10px;padding:11px 19px;background:none;color:{BLUE_T};font-family:{GROT};font-size:14px;font-weight:600;cursor:pointer;">{label}</button>'

def textctl(label):
    return f'<button type="button" style="appearance:none;border:none;padding:0;background:none;color:{BLUE_T};font-family:{GROT};font-size:14px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px;">{label}</button>'

RECIPE_NAME = 'Olive Oil Ice Cream, circulator'
RECIPE_DESC = 'Scaled 0.8× from the 1 kg formula. All ratios unchanged — PAC, POD, fat, MSNF and total solids are identical to the full batch. Sized to two 16 oz Ball jars in a circulator bath.'
SHEET_TITLE = 'Olive Oil Ice Cream'
SHEET_DESC = 'Silky and quietly savoury. Fresh olive oil adds a gentle fruitiness without overwhelming the cream, and a little more salt than you would think carries it. Serve it soft, with flaky salt.'

# ---- recipe context pieces (App context) ----
def recipe_identity(pen=False, stacked=True, rail=None):
    rail = rail or NOTEBOOK
    if pen:
        return f'''
<form style="display:flex;flex-direction:column;gap:14px;">
  <label style="display:flex;flex-direction:column;gap:6px;">{cap('Recipe name')}<input type="text" value="{RECIPE_NAME}" style="box-sizing:border-box;width:100%;padding:10px 12px;border:1px solid {DIV};border-radius:8px;font-family:{GROT};font-size:16px;color:{TEXT};background:{APP_BG};"></label>
  <label style="display:flex;flex-direction:column;gap:6px;">{cap('Description')}<textarea rows="4" style="box-sizing:border-box;width:100%;padding:10px 12px;border:1px solid {DIV};border-radius:8px;font-family:{GROT};font-size:15px;line-height:1.45;color:{TEXT};background:{APP_BG};resize:vertical;">{RECIPE_DESC}</textarea></label>
  <p style="margin:0;font-family:{GROT};font-size:13px;line-height:1.45;color:{TEXT2};">Renaming changes the Notebook's name for this recipe only. The Sheet title, what prints, is edited on the Sheet.</p>
  <div style="display:flex;gap:10px;">{quiet('Cancel')}{filled('Save')}</div>
</form>'''
    return f'''
<div style="display:flex;flex-direction:column;gap:8px;">
  <div style="display:flex;align-items:stretch;gap:14px;">
    <span aria-hidden="true" style="flex:0 0 8px;width:8px;align-self:stretch;min-height:32px;border-radius:4px;background:{rail};"></span>
    <div style="min-width:0;display:flex;align-items:center;">
      <h1 style="margin:0;font-family:{GROT};font-size:28px;line-height:1.15;font-weight:700;color:{TEXT};">{RECIPE_NAME}</h1>
    </div>
  </div>
  <p style="margin:0;font-family:{GROT};font-size:15px;line-height:1.5;color:{TEXT2};">{RECIPE_DESC}</p>
  <p style="margin:0;">{textctl('Rename')}</p>
</div>'''

def version_block(compact=False):
    return f'''
<div style="display:flex;flex-direction:column;gap:12px;">
  {cap('Version')}
  <div style="display:flex;flex-direction:column;gap:4px;">
    <p style="margin:0;font-family:{GROT};font-size:18px;font-weight:600;color:{TEXT};">Version 1 · 50 g oil · 800 g <span style="font-weight:400;color:{TEXT2};">· Latest</span></p>
    <dl style="margin:0;display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:14px;row-gap:4px;font-family:{GROT};font-size:14px;color:{TEXT};">
      <dt style="color:{TEXT2};">Written</dt><dd style="margin:0;font-variant-numeric:tabular-nums;">1 Jul 2026</dd>
      <dt style="color:{TEXT2};">From</dt><dd style="margin:0;">the 1 kg formula, off the app</dd>
      <dt style="color:{TEXT2};">Why</dt><dd style="margin:0;color:{TEXT2};">no reason recorded</dd>
    </dl>
  </div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;">{filled('Next version')}</div>
</div>'''

def history_block(horizontal=False):
    row = 'display:flex;gap:28px;' if horizontal else 'display:flex;flex-direction:column;gap:0;'
    def node(dot, title, meta, why, current):
        weight = 700 if current else 400
        ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if current else ''
        why_html = f'<span style="display:block;margin-top:2px;">{hand(why, 20)}</span>' if why else ''
        pad = 'padding:8px 0;' if not horizontal else 'padding:0;'
        border = f'border-bottom:1px solid {DIV};' if not horizontal else ''
        return f'''<a href="#" style="{pad}{border}display:grid;grid-template-columns:14px minmax(0,1fr);column-gap:12px;text-decoration:none;color:{TEXT};min-width:0;">
      <span aria-hidden="true" style="width:10px;height:10px;border-radius:5px;margin-top:5px;background:{dot};{ring}"></span>
      <span style="min-width:0;"><span style="display:block;font-family:{GROT};font-size:14px;font-weight:{weight};">{title}</span><span style="display:block;font-family:{GROT};font-size:12px;color:{TEXT2};font-variant-numeric:tabular-nums;">{meta}</span>{why_html}</span>
    </a>'''
    return f'''
<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;">{cap('History')}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">2 versions · 1 batch</span></div>
  <div style="{row}">
    {node(NOTEBOOK, 'Version 1 · 50 g oil · 800 g', 'written 1 Jul 2026 · churned 2 Aug · Latest', '', True)}
    {node(APP_BG + ';border:1.5px solid ' + NOTEBOOK, 'Version 2 · less oil', 'draft · written 20 Sep 2026 · from version 1, batch of 2 Aug', 'to stop the oil shouting', False)}
  </div>
</div>'''

def cell(label, value, unit='', plan=''):
    v = f'<span style="font-family:{GROT};font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;color:{TEXT};">{value}<span style="font-size:14px;font-weight:400;color:{TEXT2};"> {unit}</span></span>' if value else f'<span style="font-family:{GROT};font-size:14px;color:{TEXT2};">not measured</span>'
    p = f'<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">{plan}</span>' if plan else ''
    return f'<div style="display:flex;flex-direction:column;gap:2px;min-width:0;">{cap(label)}{v}{p}</div>'

def batch_log(state, column=False):
    if state == 'none':
        return f'''
<section aria-label="Batch" style="display:flex;flex-direction:column;gap:12px;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;">{cap('Batch')}</div>
  <p style="margin:0;font-family:{GROT};font-size:15px;color:{TEXT2};">Not yet churned. Print the sheet, make it, then record what happened.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;">{filled('Record a batch')}{quiet('Print sheet')}</div>
</section>'''
    cols = 'grid-template-columns:repeat(2,minmax(0,1fr));' if column else 'grid-template-columns:repeat(5,minmax(0,1fr));'
    cols3 = 'grid-template-columns:repeat(2,minmax(0,1fr));' if column else 'grid-template-columns:repeat(4,minmax(0,1fr));'
    return f'''
<section aria-label="Batch" style="display:flex;flex-direction:column;gap:18px;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap;">
    <div style="display:flex;align-items:baseline;gap:14px;">{cap('Batch')}<span style="font-family:{GROT};font-size:15px;color:{TEXT};font-variant-numeric:tabular-nums;">churned 2 Aug 2026</span></div>
    <div style="display:flex;align-items:baseline;gap:18px;">{textctl('Batches (1)')}{textctl('Correct')}{textctl('Record another')}</div>
  </div>
  <div style="display:grid;{cols}gap:16px 20px;">
    {cell('Time to draw temp.', '20', 'min', 'plan 10–12 min')}
    {cell('Out of machine', '−6', '°C')}
    {cell('Churn duration', '30', 'min')}
    {cell('Exit consistency', '')}
    {cell('Airiness', '')}
  </div>
  <div style="display:flex;flex-direction:column;gap:4px;">{hand('Soft, not greasy')}{hand('oil bottle opened 24 Jul')}</div>
  <div style="display:flex;flex-direction:column;gap:12px;padding-top:14px;border-top:1px solid {DIV};">
    <div style="display:flex;align-items:baseline;gap:14px;">{cap('Tasting')}<span style="font-family:{GROT};font-size:13px;color:{TEXT2};">tasted date unknown</span></div>
    <div style="display:grid;{cols3}gap:16px 20px;">
      {cell('Tempering', '')}
      {cell('Tasting temperature', '−12', '°C')}
      {cell('Sweetness', 'more', '(4)')}
      {cell('Oil', 'strong', '(4)')}
    </div>
    <div>{cap('Problems')}<span style="display:block;margin-top:4px;">{hand('Bitter')}</span></div>
    <div style="display:grid;{cols3}gap:16px 20px;">
      {cell('Melt test', '3', 'g lost at 20 min')}
      {cell('Melt style', '')}
    </div>
    <div>{cap('Next time')}<span style="display:block;margin-top:4px;font-family:{GROT};font-size:14px;color:{TEXT2};">nothing written yet</span></div>
  </div>
  <p style="margin:0;font-family:{GROT};font-size:12px;color:{TEXT2};">Recorded 4 Aug 2026 against Version 1 · 50 g oil · 800 g</p>
</section>'''

# ---- the Sheet (paper) ----
def sheet_front(pen=False):
    if pen:
        return f'''<div class="recipe-band"><header class="headnote" style="display:flex;flex-direction:column;gap:12px;">
  <label style="display:flex;flex-direction:column;gap:6px;"><span style="font-family:{GROT};font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:{INK};">Sheet title</span><input type="text" value="{SHEET_TITLE}" style="box-sizing:border-box;width:100%;padding:8px 10px;border:1px solid {INK};background:{GROUND};font-family:{SERIF};font-size:32px;font-weight:700;color:{PEN};"></label>
  <label style="display:flex;flex-direction:column;gap:6px;"><span style="font-family:{GROT};font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:{INK};">Sheet description</span><textarea rows="3" style="box-sizing:border-box;width:100%;max-width:65ch;padding:8px 10px;border:1px solid {INK};background:{GROUND};font-family:{SERIF};font-size:16px;line-height:1.5;color:{PEN};resize:vertical;">{SHEET_DESC}</textarea></label>
  <p style="margin:0;font-family:{GROT};font-size:13px;line-height:1.4;color:{INK};">What the sheet is served under. Prints as the title. Copies into the next version.</p>
</header></div>'''
    return f'''<div class="recipe-band"><header class="headnote"><h1>{SHEET_TITLE}</h1><p class="headnote__prose">{SHEET_DESC}</p></header></div>'''

def sheet(state, pen=False):
    body = sheet_pen(sheet_for(state)) if pen else sheet_for(state)
    return f'<article class="recipe-page" style="box-sizing:border-box;">{sheet_front(pen)}{body}</article>'

def recipe_book_sheet():
    rb = open(SRC + '/RecipeBookSheet.dc.html').read()
    return None

# ---- shell wrapper ----
def board(title, w, h, main_html, active='notebook', extra_css=''):
    rail = RAIL if active == 'notebook' else RAIL.replace(' aria-current="page" href="/notebook"', ' href="/notebook"').replace('class="shell__place shell__place--recipe-book" href="/recipe-book"', 'class="shell__place shell__place--recipe-book" aria-current="page" href="/recipe-book"')
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="{STYLESHEET}">
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&amp;display=swap">
<style>
body{{margin:0;background:#ffffff}}
.shell{{min-height:0}}
{extra_css}
</style>
</helmet>
<div style="width: {w}px; height: {h}px; overflow: hidden; box-sizing: border-box; background: #ffffff;">
<div class="shell">{SHELL_HEAD}<div class="shell__body">{rail}<main class="shell__main" style="display:flex;flex-direction:column;min-width:0;">{main_html}</main></div>{TABS}</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

W = 1600
boards = {}
RUNGS = {'R35C_1366': 1366, 'R35C_1024': 1024, 'R35C_393': 393}

# A — sidebar
def layout_a(state, pen=False):
    side = f'''<aside aria-label="Recipe" style="flex:0 0 340px;box-sizing:border-box;padding:20px 32px 48px 0;display:flex;flex-direction:column;gap:32px;border-right:1px solid {DIV};">
  {recipe_identity(pen)}{version_block()}{history_block()}
</aside>'''
    main = f'''<div style="display:flex;gap:40px;padding:0 48px 48px 40px;align-items:flex-start;">
  {side}
  <div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:32px;">
    {sheet(state, pen)}
    <div style="padding:0 8px;">{batch_log(state)}</div>
  </div>
</div>'''
    return main

# B — tabs
def layout_b(state, pen=False, tab='sheet'):
    def t(label, on, color=TEXT):
        b = f'border-bottom:3px solid {NOTEBOOK};font-weight:700;' if on else 'border-bottom:3px solid transparent;font-weight:400;'
        return f'<a href="#" style="display:inline-block;padding:10px 4px 12px;margin-right:28px;text-decoration:none;font-family:{GROT};font-size:15px;color:{color};{b}">{label}</a>'
    batches_label = 'Batch · 2 Aug' if state != 'none' else 'Batch · none yet'
    tabs = f'<nav aria-label="Recipe sections" style="display:flex;border-bottom:1px solid {DIV};margin-top:8px;">{t("Sheet", tab=="sheet")}{t(batches_label, tab=="batch")}{t("History", tab=="history")}</nav>'
    head = f'''<header style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:40px;align-items:start;padding:20px 0 20px;">
  <div>{recipe_identity(pen)}</div>
  <div>{version_block()}</div>
</header>'''
    if tab == 'sheet':
        body = sheet(state, pen)
    elif tab == 'batch':
        body = f'<div style="padding:28px 8px;max-width:960px;">{batch_log(state)}</div>'
    else:
        body = f'<div style="padding:28px 8px;max-width:720px;">{history_block()}</div>'
    return f'<div style="padding:0 48px 48px 40px;display:flex;flex-direction:column;gap:20px;">{head}{tabs}{body}</div>'

# C — header band
SMALL = f"font-family:{GROT};font-size:12px;letter-spacing:0.02em;color:{INK};"
PEN_CONTROLS = 'always'
def grams_field(value):
    return f'<span style="display:inline-block;min-width:64px;text-align:right;margin-right:18px;white-space:nowrap;"><input type="text" value="{value}" aria-label="grams" style="box-sizing:border-box;width:52px;padding:2px 4px;border:1px solid {INK};background:{GROUND};color:{PEN};font-family:{GROT};font-size:15px;font-variant-numeric:tabular-nums;text-align:right;"> g</span>'
def sheet_pen(s):
    """The pen open on the plan (route-recipe-version.md § 3): every grams a field in pen blue inside a hairline
    ink outline; a changed value shows the parent's struck in ink before it; each row and step gains 'remove'."""
    def fix_row(m):
        row = m.group(0)
        g = re.search(r'<span style="display:inline-block;min-width:64px;text-align:right;margin-right:18px;">([\d.]+) g</span>', row)
        if not g: return row
        val = g.group(1)
        if 'Graza Drizzle' in row:
            field = f'<s style="{SMALL}">{val} g</s> ' + grams_field('48')
            row = row.replace('<td class="ingredient-table__col-numeric">5.0%</td>', f'<td class="ingredient-table__col-numeric"><s>5.0%</s> 6.0%</td>')
        else:
            field = grams_field(val)
        row = row.replace(g.group(0), '', 1)
        row = row.replace('<td class="ingredient-table__col-name">', '<td class="ingredient-table__col-name">' + field, 1)
        row = row.replace('</td><td class="ingredient-table__col-numeric">', f' <button type="button" class="text-control" style="margin-left:10px;">remove</button></td><td class="ingredient-table__col-numeric">', 1)
        return row
    s = re.sub(r'<tr aria-label=(?!"Total).*?</tr>', fix_row, s, flags=re.S)
    s = s.replace('margin-right:18px;">799.7 g</span>Total', f'margin-right:18px;white-space:nowrap;"><s>799.7</s> 807.7 g</span>Total')
    # steps: remove per step, after the targets
    # prose edits in place: pen blue while the pen is open, the outline only on the focused paragraph
    s = s.replace('<p class="method-step__lead">', f'<p class="method-step__lead" style="color:{PEN};">')
    s = s.replace('<p class="method-step__purpose">', f'<p class="method-step__purpose" style="color:{PEN};">')
    s = s.replace('<p class="method-step__aside">', f'<p class="method-step__aside" style="color:{PEN};">')
    # step 3 has focus
    s = s.replace('<li id="method-step-3" class="method-step"><span class="method-step__n" aria-hidden="true">3</span><div class="method-step__body"><p class="method-step__lead" style="color:' + PEN + ';">',
                  '<li id="method-step-3" class="method-step"><span class="method-step__n" aria-hidden="true">3</span><div class="method-step__body"><p class="method-step__lead" style="color:' + PEN + ';outline:1px solid ' + INK + ';outline-offset:4px;">')
    # per step: one quiet line of controls in small print (uses · change · add a purpose · add an aside · remove)
    USES = {2: 'whole milk, sucrose, locust bean gum, guar gum, lambda carrageenan', 3: 'whole milk, heavy cream, skim milk powder, sucrose, dextrose, fine sea salt', 6: 'allulose', 8: 'Graza Drizzle, soy lecithin', 1: 'soy lecithin, Graza Drizzle'}
    tc = f'style="{SMALL}background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px;"'
    def step_controls(m):
        li = m.group(0)
        n = int(re.search(r'method-step-(\d+)', li).group(1))
        if PEN_CONTROLS == 'focused' and n != 3:
            return li
        if PEN_CONTROLS == 'step':
            if n != 3:
                # a closed step: its prose reads in ink, not as a field; two controls
                li = li.replace(f'style="color:{PEN};"', '')
                li = li.replace(f'style="color:{PEN};outline', 'style="outline')
                ctl = f'<p style="margin:6px 0 0;display:flex;gap:8px;align-items:baseline;"><button type="button" {tc}>edit this step</button><span aria-hidden="true" style="{SMALL}">·</span><button type="button" {tc}>remove</button></p>'
                return li.replace('</div></li>', ctl + '</div></li>')
            parts = []
            if n in USES:
                parts.append(f'<span style="{SMALL}">uses {USES[n]}</span><button type="button" {tc}>change</button>')
            if 'method-step__purpose' not in li: parts.append(f'<button type="button" {tc}>add a purpose</button>')
            if 'method-step__aside' not in li: parts.append(f'<button type="button" {tc}>add an aside</button>')
            sep = f'<span aria-hidden="true" style="{SMALL}">·</span>'
            ctl = (f'<p style="margin:6px 0 0;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;">{sep.join(parts)}</p>'
                   f'<p style="margin:10px 0 0;display:flex;gap:10px;">{quiet("Cancel")}{filled("Done")}</p>')
            return li.replace('</div></li>', ctl + '</div></li>')
        parts = []
        if n in USES:
            parts.append(f'<span style="{SMALL}">uses {USES[n]}</span><button type="button" {tc}>change</button>')
        if 'method-step__purpose' not in li: parts.append(f'<button type="button" {tc}>add a purpose</button>')
        if 'method-step__aside' not in li: parts.append(f'<button type="button" {tc}>add an aside</button>')
        parts.append(f'<button type="button" {tc}>remove</button>')
        sep = f'<span aria-hidden="true" style="{SMALL}">·</span>'
        ctl = f'<p style="margin:6px 0 0;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;">{sep.join(parts)}</p>'
        return li.replace('</div></li>', ctl + '</div></li>')
    s = re.sub(r'<li id="method-step-\d+".*?</li>', step_controls, s, flags=re.S)
    # authored notes (Before you start): editable, inherited marker, removable per note
    def note(m):
        return (f'<li style="color:{PEN};">' + m.group(1) +
                f' <span class="table-small-print" style="{SMALL}">from 50 g oil · 800 g</span>'
                f' <button type="button" class="text-control" style="margin-left:10px;">remove</button></li>')
    s = re.sub(r'<li>(.*?)</li>', note, s, flags=re.S)
    return s

def ceremony():
    """The save ceremony in the recipe context (route-recipe-version.md § 3, moved out of the Sheet by 03.5)."""
    field = f'box-sizing:border-box;width:100%;padding:8px 10px;border:1px solid {DIV};border-radius:8px;background:{APP_BG};font-family:{GROT};font-size:15px;color:{TEXT};'
    return f'''
<form style="display:flex;flex-direction:column;gap:12px;">
  {cap('Next version · draft from Version 1')}
  <label style="display:flex;flex-direction:column;gap:4px;">{cap('Version name')}<input type="text" value="" placeholder="e.g. less oil" style="{field}"><span style="font-family:{GROT};font-size:12px;color:{TEXT2};">was 50 g oil · 800 g</span></label>
  <label style="display:flex;flex-direction:column;gap:4px;">{cap('Why')}<textarea rows="2" placeholder="what this version is for, in your words" style="{field}font-family:'Caveat',Georgia,serif;font-size:22px;line-height:1.25;color:{PEN};resize:vertical;"></textarea></label>
  <fieldset style="margin:0;padding:0;border:0;display:flex;flex-direction:column;gap:4px;">{cap('From batch')}<label style="display:flex;align-items:center;gap:8px;font-family:{GROT};font-size:14px;color:{TEXT};"><input type="checkbox" style="margin:0;width:16px;height:16px;">2 Aug 2026 · soft, not greasy</label></fieldset>
  <div style="display:flex;gap:10px;flex-wrap:wrap;">{quiet('Cancel')}{filled('Save as a new version')}</div>
</form>'''

def history_rail(versions, count_text):
    """History as a dated rail: date above, node on the rail, title and one meta line below; versions only."""
    def node(date, title, meta, filled, current):
        dot = f'background:{NOTEBOOK};' if filled else f'background:{APP_BG};border:1.5px solid {NOTEBOOK};'
        ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if current else ''
        w = 700 if current else 400
        return f'''<a href="#" style="flex:0 0 168px;display:grid;grid-template-rows:16px 12px 40px 16px;row-gap:6px;text-decoration:none;color:{TEXT};min-width:0;">
  <span style="font-family:{GROT};font-size:12px;line-height:16px;color:{TEXT2};font-variant-numeric:tabular-nums;">{date}</span>
  <span style="display:flex;align-items:center;height:12px;"><span aria-hidden="true" style="box-sizing:border-box;width:12px;height:12px;border-radius:6px;{dot}{ring}"></span></span>
  <span style="font-family:{GROT};font-size:14px;font-weight:{w};line-height:20px;overflow:hidden;">{title}</span>
  <span style="font-family:{GROT};font-size:12px;line-height:16px;color:{TEXT2};">{meta or "&nbsp;"}</span>
</a>'''
    nodes = ''.join(node(*v) for v in versions)
    return f'''<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;">{cap('History')}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">{count_text}</span></div>
  <div style="position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;right:0;top:27px;height:1px;background:{DIV};"></div>
    <div style="display:flex;gap:24px;min-width:max-content;padding:0 6px;">{nodes}</div>
  </div>
</div>'''

def layout_c(state, pen=False, sheet_html=None, log=True, rail=None):
    v1meta = 'churned 2 Aug · Latest' if state != 'none' else 'not yet churned · Latest'
    versions = [('1 Jul', 'Version 1 · 50 g oil · 800 g', v1meta, state != 'none', True),
                ('20 Sep', 'Version 2 · less oil', 'draft', False, False)]
    band = f'''<header style="display:flex;flex-direction:column;gap:24px;padding:20px 0 24px;border-bottom:1px solid {DIV};">
  <div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:start;">
    <div>{recipe_identity(False, rail=rail)}</div>
    <div>{ceremony() if pen else version_block()}</div>
  </div>
  {history_rail(versions, '2 versions · oldest left, latest right')}
</header>'''
    body_sheet = sheet_html if sheet_html is not None else sheet(state, pen)
    col = f'<aside aria-label="Batch" style="flex:0 0 340px;min-width:0;padding-top:8px;">{batch_log(state, column=True)}</aside>' if log else ''
    return f'''<div style="padding:0 48px 48px 40px;display:flex;flex-direction:column;gap:28px;">
  {band}
  <div style="display:flex;gap:40px;align-items:flex-start;"><div style="flex:1 1 0;min-width:0;">{body_sheet}</div>{col}</div>
</div>'''

def layout_c_rung(width):
    """The chosen layout C at 1366 (two columns), 1024 and 393 (one column), batch in view, pen closed."""
    state = 'batch'
    versions = [('1 Jul', 'Version 1 · 50 g oil · 800 g', 'churned 2 Aug · Latest', True, True),
                ('20 Sep', 'Version 2 · less oil', 'draft', False, False)]
    gutter = '0 20px 40px 20px' if width == 393 else '0 32px 48px 32px'
    if width == 393:
        top = f'<div style="display:flex;flex-direction:column;gap:20px;">{recipe_identity(False)}{version_block()}</div>'
    else:
        top = f'''<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px;align-items:start;">
    <div>{recipe_identity(False)}</div>
    <div>{version_block()}</div>
  </div>'''
    band = f'''<header style="display:flex;flex-direction:column;gap:20px;padding:16px 0 20px;border-bottom:1px solid {DIV};">
  {top}
  {history_rail(versions, '2 versions')}
</header>'''
    if width == 1366:
        body = f'<div style="display:flex;gap:32px;align-items:flex-start;"><div style="flex:1 1 0;min-width:0;">{sheet(state)}</div><aside aria-label="Batch" style="flex:0 0 300px;min-width:0;padding-top:8px;">{batch_log(state, column=True)}</aside></div>'
    elif width == 393:
        # the paper runs edge to edge; its own 20px gutter is the only inset. App blocks keep the 20px page gutter.
        return f'<div style="display:flex;flex-direction:column;gap:24px;padding-bottom:40px;"><div style="padding:0 20px;">{band}</div>{sheet(state)}<div style="padding:0 20px;">{batch_log(state, column=True)}</div></div>'
    else:
        body = f'<div style="display:flex;flex-direction:column;gap:28px;">{sheet(state)}<div style="padding:0 8px;">{batch_log(state, column=False)}</div></div>'
    return f'<div style="padding:{gutter};display:flex;flex-direction:column;gap:24px;">{band}{body}</div>'

def phone_folds(html):
    """393 only: disclosures closed by default on version details, Balance (with Things to check),
    and the log's Tasting; Ingredients, Instructions, Before you start and the churn cells stay open."""
    disc = lambda label, target: f'<button type="button" class="text-control history-disclosure" aria-expanded="false" aria-controls="{target}">{label}</button>'
    # version details
    html = html.replace('<dl style="margin:0;display:grid;grid-template-columns:max-content minmax(0,1fr);',
                        '<p style="margin:0;">' + disc('Details', 'fold-version') + '</p><dl id="fold-version" hidden style="margin:0;display:grid;grid-template-columns:max-content minmax(0,1fr);', 1)
    # Balance: everything after its heading, plus Things to check, folds
    html = html.replace('<div class="formulation-note"><h2 class="region-name">Balance</h2>',
                        '<div class="formulation-note"><h2 class="region-name">Balance</h2><p style="margin:0 0 8px;">' + disc('Show balance and things to check', 'fold-balance') + '</p><div id="fold-balance" hidden>', 1)
    html = html.replace('<div class="margin-region"><div class="derived-advisories">', '<div class="margin-region"><div class="derived-advisories" style="display:contents;">', 1)
    # close the balance fold after Things to check, the margin's last block now that Carried forward is dropped
    html = html.replace('</div></article>', '</div></div></article>', 1)
    # the log's Tasting
    html = re.sub(r'(<div style="display:flex;align-items:baseline;gap:14px;">' + re.escape(cap('Tasting')) + r'<span[^>]*>tasted date unknown</span>)</div>',
                  r'\1 ' + disc('Show', 'fold-tasting') + '</div><div id="fold-tasting" hidden style="display:flex;flex-direction:column;gap:12px;">', html, count=1)
    html = html.replace('<div>' + cap('Next time'), '<div>' + cap('Next time'), 1)
    # close the tasting fold after Next time
    html = re.sub(r'(nothing written yet</span></div>)(\s*</div>)', r'\1</div>\2', html, count=1)
    return html

# Recipe Book form of the Sheet, on screen (reference; not built in 03.5)
def recipe_book_form():
    rows = [('370.4 g','whole milk'),('252.8 g','heavy cream'),('40 g','Graza Drizzle olive oil'),('22.4 g','skim milk powder'),('76 g','sucrose'),('20 g','allulose'),('12 g','dextrose'),('3.2 g','fine sea salt'),('1.2 g','soy lecithin'),('1.04 g','locust bean gum'),('0.48 g','guar gum'),('0.16 g','lambda carrageenan')]
    steps = [('Lecithin into the oil','Whisk 1.2 g soy lecithin into the 40 g of Drizzle. Cover, leave at room temperature.',''),('Gum slurry — the only high-heat step','Toss 1.68 g of the gum blend with the sucrose. Whisk into the milk in a small saucepan. Heat, whisking constantly, then pull off.','85 °C, hold 2 min'),('Build the base','Whisk the remaining sucrose, plus 22.4 g SMP, 12 g dextrose and 3.2 g salt, into the remaining milk and all 252.8 g of cream. Add the hot gum slurry. Immersion blend.','60 s'),('Divide','Tare, pour, check.','379 g per jar'),('Pasteurise in the circulator','Start the clock when the jar core reaches temperature.','69 °C, hold 40 min'),('Allulose in, then crash-cool','Combine both jars, stir in the 20 g allulose off the heat until dissolved, then straight into an ice bath.','below 5 °C'),('Age','Hold covered in the fridge.','4 °C, 12–24 h'),('Emulsify the oil, cold','Mix still at 4 °C. Pour the lecithin-oil blend in a thin stream under a running immersion blender.','45 s'),('Churn','Freeze immediately.',''),('Harden, and serve warm','Harden, then temper before serving.','−20 °C, 4+ h; serve at −11 to −12 °C')]
    facts = [('Makes','800 g'),('Age','12–24 h at 4 °C'),('Harden','4+ h at −20 °C'),('Serve','−11 to −12 °C')]
    lab = f"font-family:{GROT};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:{INK};"
    f = ''.join(f'<span style="display:flex;flex-direction:column;gap:2px;"><span style="{lab}font-weight:400;">{a}</span><span style="font-size:15px;">{b}</span></span>' for a,b in facts)
    ing = ''.join(f'<li style="display:grid;grid-template-columns:72px minmax(0,1fr);column-gap:12px;"><span style="text-align:right;font-family:{GROT};font-variant-numeric:tabular-nums;">{g}</span><span>{n}</span></li>' for g,n in rows)
    st = ''.join(f'<li style="display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:12px;font-size:16px;line-height:1.5;"><span style="font-family:{GROT};font-weight:700;text-align:right;">{i+1}</span><span><strong>{l}.</strong> {ins} <span style="font-family:{GROT};font-size:13px;">{tg}</span></span></li>' for i,(l,ins,tg) in enumerate(steps))
    return f'''<article aria-label="Recipe sheet" style="box-sizing:border-box;padding:48px;background:{GROUND};color:{INK};font-family:{SERIF};display:flex;flex-direction:column;gap:20px;">
  <header style="display:flex;flex-direction:column;gap:8px;"><h1 style="margin:0;font-size:36px;line-height:1.1;font-weight:400;">{SHEET_TITLE}</h1><p style="margin:0;font-size:16px;line-height:1.5;max-width:65ch;">{SHEET_DESC}</p></header>
  <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:16px;padding:12px 0;border-top:1px solid {INK};border-bottom:1px solid {INK};">{f}</div>
  <p style="margin:-8px 0 0;font-family:{GROT};font-size:12px;line-height:1.4;color:{INK};">Makes is the row total. Age, Harden and Serve are read from this version's step targets (steps 7 and 10); a version without those targets shows no such cell. Nothing here is typed separately.</p>
  <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);column-gap:48px;">
    <section style="display:flex;flex-direction:column;gap:8px;"><h2 style="margin:0;{lab}">Ingredients</h2><ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:16px;line-height:1.4;">{ing}</ul></section>
    <section style="display:flex;flex-direction:column;gap:8px;"><h2 style="margin:0;{lab}">Instructions</h2><ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;">{st}</ol></section>
  </div>
  <footer style="padding-top:10px;border-top:1px solid {INK};display:flex;justify-content:space-between;{lab}font-weight:400;letter-spacing:0.02em;text-transform:none;"><span>{RECIPE_NAME} · Version 1 · 50 g oil · 800 g</span><span>Sheet code 4F7Q-2MKD</span></footer>
</article>'''

specs = [
 ('R35A_NoBatch', 'A · sidebar · not yet churned', 3300, layout_a('none')),
 ('R35A_Batch', 'A · sidebar · the 2 Aug batch in view', 4000, layout_a('batch')),
 ('R35A_Pen', 'A · sidebar · pen open: rename beside the Sheet fields', 4100, layout_a('batch', pen=True)),
 ('R35B_NoBatch', 'B · tabs · not yet churned (Sheet tab)', 3300, layout_b('none')),
 ('R35B_Batch', 'B · tabs · the 2 Aug batch in view (Batch tab)', 1500, layout_b('batch', tab='batch')),
 ('R35B_Pen', 'B · tabs · pen open: rename beside the Sheet fields', 3500, layout_b('batch', pen=True)),
 ('R35C_NoBatch', 'C · header band · not yet churned', 3300, layout_c('none')),
 ('R35C_Batch', 'C · header band · the 2 Aug batch in view, log beside the Sheet', 3400, layout_c('batch')),
 ('R35C_Pen', 'C · the pen open from Next version · edit this step, one step open (chosen 2026-09-24)', 3700, layout_c('batch', pen=True)),
 ('R35C_PenFocus', 'Not chosen · the pen with controls on the focused step only', 3700, None),
 ('R35C_PenStep', 'Not chosen · the pen with step controls always shown', 3700, None),
 ('R35C_1366', 'C · 1366 · iPad landscape · the log beside the Sheet, details, Balance and Tasting folded', 3800, None),
 ('R35C_1024', 'C · 1024 · iPad portrait · one column, the log below the Sheet, details, Balance and Tasting folded', 4600, None),
 ('R35C_393', 'C · 393 · phone · one column, bottom tab row, details, Balance and Tasting folded', 5800, None),
 ('R35_RecipeBookForm', 'Reference · the Recipe Book form of the Sheet on screen (/recipe-book/:recipeId, not built in 03.5)', 2000, layout_c('none', sheet_html=recipe_book_form(), log=False, rail=RB)),
]
for key, title, h, main in specs:
    fn = key + '.dc.html'
    if key == 'R35C_PenFocus':
        PEN_CONTROLS = 'focused'; main = layout_c('batch', pen=True); PEN_CONTROLS = 'always'
    if key == 'R35C_PenStep':
        PEN_CONTROLS = 'always'; main = layout_c('batch', pen=True)
    if key == 'R35C_Pen':
        PEN_CONTROLS = 'step'; main = layout_c('batch', pen=True); PEN_CONTROLS = 'always'
    active = 'recipe-book' if key == 'R35_RecipeBookForm' else 'notebook'
    w = RUNGS.get(key, W)
    if key in RUNGS:
        main = layout_c_rung(w)
        if w in (393, 1024, 1366):
            main = phone_folds(main)
    PHONE_TABLE = '''
/* 393: the ingredient table reads as a list, two lines per row: quantity and name, then as made and share */
.ingredient-table thead{display:none}
.ingredient-table,.ingredient-table tbody,.ingredient-table tfoot,.ingredient-table tr{display:block;width:100%}
.ingredient-table tr{padding:8px 0;border-bottom:1px solid var(--sheet-ink)}
.ingredient-table tr.ingredient-table__step-head{border-bottom:0;padding:14px 0 4px}
.ingredient-table td{display:block;width:auto;padding:0;border:0}
.ingredient-table td.ingredient-table__col-name{width:100%}
.ingredient-table td.ingredient-table__col-name > span:first-child{min-width:0 !important;margin-right:10px !important}
.ingredient-table td.ingredient-table__col-numeric{display:inline-block;text-align:left;padding-right:14px;margin-top:4px}
.ingredient-table td.ingredient-table__col-numeric:empty{display:none}
.ingredient-table__portion-note{padding-left:0 !important}
[hidden]{display:none !important}
'''
    FORCED = open(SP + '/phone-forced.css').read()
    extra = (FORCED + PHONE_TABLE) if w == 393 else ('[hidden]{display:none !important}' if w in (1024, 1366) else '')
    open(OUT + '/' + fn, 'w').write(board(title, w, h, main, active, extra))
    boards[fn] = (title, h)

# ---- canvas.json ----
cj = json.load(open(SRC + '/canvas.json'))
PAGE = 'page-13'
if not any(p['id'] == PAGE for p in cj['pages']):
    cj['pages'].append({'id': PAGE, 'name': 'Recipe route 03.5'})
xs = [0, W + 80, 2 * (W + 80)]
rows = {'A': 0, 'B': 4500, 'C': 8600}
for key, title, h, _ in specs:
    fn = key + '.dc.html'
    if key == 'R35_RecipeBookForm':
        x, y = 0, 12800
    elif key in RUNGS:
        x, y = 0, 0
    elif key == 'R35C_PenFocus':
        x, y = 6720, 8600
    elif key == 'R35C_PenStep':
        x, y = 8400, 8600
    else:
        row = key[3]; col = ['NoBatch', 'Batch', 'Pen'].index(key.split('_')[1])
        x, y = xs[col], rows[row]
    if key in RUNGS:
        x = {'R35C_1366': 0, 'R35C_1024': 1446, 'R35C_393': 2550}[key]; y = 15400
    cj['boards'][fn] = {'x': x, 'y': y, 'w': RUNGS.get(key, W), 'h': h, 'page': PAGE, 'title': title}
    if fn not in cj['order']:
        cj['order'].append(fn)
notes = {
 'r35-a-title': {'kind': 'title1', 'page': PAGE, 'x': 0, 'y': -300, 'maxW': 5000, 'text': 'A · sidebar: recipe and version left; the Sheet and the log share the main space'},
 'r35-b-title': {'kind': 'title1', 'page': PAGE, 'x': 0, 'y': 4200, 'maxW': 5000, 'text': 'B · tabs: recipe and version in a header; Sheet, Batch and History beneath'},
 'r35-c-title': {'kind': 'title1', 'page': PAGE, 'x': 0, 'y': 8300, 'maxW': 5000, 'text': 'C · header band: recipe, version and History as App front matter; the log in a column beside the Sheet'},
 'r35-rb-title': {'kind': 'title1', 'page': PAGE, 'x': 0, 'y': 12500, 'maxW': 5000, 'text': 'Reference · the Recipe Book form on screen (drawn now, not built in 03.5)'},
 'r35-note': {'fill': 'gray', 'page': PAGE, 'x': 5100, 'y': 0, 'w': 400, 'text': 'Phase 03.5, desktop at 1600. Every column is one layout; every row is one state: not yet churned, the 2 Aug batch in view, the pen open.\n\nWhite is App context (Notebook red marks the place; the maker\'s own words in the hand). The paper is the Sheet, rendered with the app\'s real stylesheet and the as-built markup, so what you see on the paper is what ships today: as-made grams and the struck step in pen blue.\n\nOpen on this page: the desktop layout (A, B or C); where Batches (n) sits; the rename label. The Recipe name is shown with a qualifier ("circulator") the Sheet title does not carry, to show the two names apart.\n\nPick one; only that one is then drawn at 1366, 1024 and 393.'},
}
cj['notes'].update(notes)
json.dump(cj, open(OUT + '/canvas.json', 'w'), indent=2, ensure_ascii=False)
print('wrote', len(specs), 'boards')
for fn in boards: print(fn, os.path.getsize(OUT + '/' + fn))
