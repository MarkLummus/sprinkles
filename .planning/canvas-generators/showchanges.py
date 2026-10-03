import sys; sys.argv=['x']
from gen import *
import json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-02: "Show changes" on the ingredient table at phone widths (below 724, the list form) had no board.
# The row grid is 64px | name | share, and the struck old amount plus the new one side by side is 83 to 104px wide,
# so the amount spills into the name (measured in WebKit, 393 and every width 320 to 723: 13 of 13 rows on Mexican
# Chocolate v4, the Total row on Mocha v3). Every row below is the app's own markup, captured from the built app with
# Show changes on (showchanges-capture.json: Mexican Chocolate v4 against v3, Mocha v3, Strawberry v2.1).
CAP = json.load(open(HERE + '/showchanges-capture.json'))

# ---- the rule ----
# Decisions 24 and 25 (2026-10-02) stood the struck old figure ABOVE the current one (STACK_* below, kept for the options sheet's history).
# Mark chose D3 on 2026-10-03 ("D3 is my favorite. iPhone follows the design too. Plan / as made / struck. I want keep things static
# when Show changes toggles"), so the boards below draw the phone's cell as plan amount, As made, then the struck figure: ingredient-options.css
# section P3, the same file the 1366 and 1024 boards and the measurement scripts read.
SHEET_HAND = ".sheet-hand{font-family:var(--face-hand);font-size:var(--size-hand-min);line-height:1;color:var(--sheet-pen-blue)}"
BASE_CSS = ":root{--sheet-flag-gap:8px}\n.ingredient-table__flag{margin-left:var(--sheet-flag-gap)}\n" + SHEET_HAND + "\n.ingredient-table__plan-grams{white-space:nowrap}\n"
STACK_AMOUNT = ".ingredient-table__plan-grams>.struck-value{display:block;margin-right:0}\n"
STACK_SHARE = ".ingredient-table td.ingredient-table__col-numeric>.struck-value{display:block;margin-right:0}\n"
_OPT = open(HERE + '/ingredient-options.css').read()
RULE = re.search(r'/\* === P3 ===[^*]*\*/([\s\S]*?)(?=/\* === |$)', _OPT).group(1)
# The canvas's stylesheet asset predates the app's `.ingredient-table__plan-grams .ink-field` width, so a pen row drew its field at
# the 64px track instead of the 52px 1600-pen.html draws (inline width:52px there); the pen boards carry that width themselves.
# The same asset also lacks the flag chip's `vertical-align:middle`, which moves a wrapped name's line box by 1.5px in the pen.
PEN_FIELD = ".ingredient-table__plan-grams .ink-field{width:52px;flex:none}\n.ingredient-table__flag{vertical-align:middle}\n"
PEN_RULE = RULE + PEN_FIELD   # the pen's struck parent is a direct child of the amount cell; P3 puts it on the third line, under the field
# The remove and restore links in the name cell (Sid, 2026-10-02, Mark: "the remove link doesn't have enough white space to separate
# it from either ingredient name or estimated tag"). The app prints the link straight after the name or the estimated tag, so they
# touch (0px on every width 320 to 723, WebKit and Chrome, decision 26). 1600-pen.html draws a word space and
# margin-left:10px: 14px from the last ink to the link. A margin would also indent a link that wraps onto its own line, so the gap is
# a word space with extra word-spacing in its own span: it collapses at the start of a line, and a wrapped link stays flush under the
# name. The app's fix is the same span before RemoveRowControl's button and the token --sheet-remove-gap (10px).
REMOVE_GAP = ":root{--sheet-remove-gap:10px}\n.ingredient-table__remove-gap{word-spacing:var(--sheet-remove-gap)}\n"
def with_remove_gap(html):
    return re.sub(r'(<button type="button" class="text-control" tabindex="0">(?:remove|restore)</button>)', r'<span class="ingredient-table__remove-gap"> </span>\1', html)

CHIP = '<span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span>'
def tr(label, amount, name, share, asmade=None, hand_total=False):
    """One row in the app's own markup. amount/share are already cell HTML."""
    am = ''
    if asmade is not None:
        am = '<td class="ingredient-table__col-numeric">' + (f'<span class="sheet-hand">{asmade}</span>' if asmade else '') + '</td>'
    return (f'<tr aria-label="{label}"><td class="ingredient-table__col-grams">{amount}</td><td class="ingredient-table__col-name">{name}</td>'
            f'{am}<td class="ingredient-table__col-numeric">{share}</td></tr>')
def pair(a, b):
    return f'<span class="ingredient-table__plan-grams"><span class="struck-value">{a}</span>{b}</span>'
def plain(a):
    return f'<span class="ingredient-table__plan-grams">{a}</span>'
def spair(a, b):
    return f'<span class="struck-value">{a}</span>{b}'
def step_head(n, lead):
    return f'<tr class="ingredient-table__step-head"><td colspan="3">Step {n}<span class="ingredient-table__step-head-lead">{lead}</span></td></tr>'
def table(body, foot, asmade=False):
    th = '<th scope="col" class="ingredient-table__col-name" colspan="2">Ingredient</th>' + ('<th scope="col" class="ingredient-table__col-numeric">As made</th>' if asmade else '') + '<th scope="col" class="ingredient-table__col-numeric">% of batch</th>'
    return f'<table class="ingredient-table"><thead><tr>{th}</tr></thead><tbody>{body}</tbody><tfoot>{foot}</tfoot></table>'
def section(tbl):
    return f'<section class="ingredient-table-region" aria-label="Ingredients"><h2 class="region-name">Ingredients</h2>{tbl}</section>'
def sheet_article(title, sec):
    return f'<article class="recipe-page" style="box-sizing:border-box;"><div class="recipe-band"><header class="headnote"><h1>{title}</h1></header></div>{sec}</article>'
def controls(on=True):
    return f'<div style="display:flex;align-items:center;gap:20px;padding:16px 20px;">{filled("Next version")}{textctl("Hide changes" if on else "Show changes")}</div>'

def rows_of(html):
    return re.findall(r'<tr aria-label=.*?</tr>', html, flags=re.S)
def foot_of(html):
    return re.search(r'<tfoot>(.*?)</tfoot>', html, flags=re.S).group(1)
def body_of(html):
    return re.search(r'<tbody>(.*?)</tbody>', html, flags=re.S).group(1)

# ---- the boards ----
T_SC393 = 'C · 393 · Show changes on · Mexican Chocolate v4 against v3, plan / As made / struck (redrawn 2026-10-03 after Mark chose D3, awaiting Mark\'s look)'
T_SC723 = 'C · 723 · Show changes on · Mexican Chocolate v4 against v3, plan / As made / struck (redrawn 2026-10-03 after Mark chose D3, awaiting Mark\'s look)'
T_PEN393 = 'C · 393 · the pen open from Next version · Mexican Chocolate v4 · changed amounts, the struck figure under the field (redrawn 2026-10-03 after Mark chose D3, awaiting Mark\'s look)'
T_PEN723 = 'C · 723 · the pen open from Next version · Mexican Chocolate v4 · changed amounts, the struck figure under the field (redrawn 2026-10-03 after Mark chose D3, awaiting Mark\'s look)'
T_CASES = 'C · 393 · Show changes on · the cases beside the main board, plan / As made / struck (constructed rows are named; redrawn 2026-10-03 after Mark chose D3, awaiting Mark\'s look)'
def phone_css(w):
    if w == 393: return FORCED + PHONE_TABLE
    return SHELL_TABS + ONE_COL + AFTER_TOUCH + PHONE_TABLE
def dc(fn, title, w, h, main, css):
    html = board(title, w, h, '', extra_css=css + '[hidden]{display:none !important}')
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)

def caption(t, sub='', mh=0):
    s = f'<p style="margin:0;font-family:{GROT};font-size:15px;font-weight:700;color:{TEXT};">{t}</p>'
    if sub: s += f'<p style="margin:4px 0 0;font-family:{GROT};font-size:13px;line-height:1.4;color:{TEXT2};">{sub}</p>'
    return f'<div style="box-sizing:border-box;min-height:{mh}px;padding-bottom:12px;border-bottom:1px dashed {DIV};">{s}</div>'
def panel(t, sub, body, w, mh=0):
    return f'<div style="flex:none;width:{w}px;display:flex;flex-direction:column;gap:20px;min-width:0;">{caption(t, sub, mh)}{body}</div>'

# 1 and 2: the recommended state, Mexican Chocolate v4 against v3, at 393 and 723
def main_board(w):
    sec = CAP['mex4']['show']
    return f'<div style="width:{w}px;background:{APP_BG};padding-bottom:40px;">{controls()}{sheet_article("Mexican Chocolate", sec)}</div>'
H393, H723 = 1080, 1080
dc('R35C_393ShowChanges.dc.html', T_SC393, 393, H393, main_board(393), phone_css(393) + BASE_CSS + RULE)
dc('R35C_723ShowChanges.dc.html', T_SC723, 723, H723, main_board(723), phone_css(723) + BASE_CSS + RULE)

# 1b and 2b: the pen's changed rows, Mexican Chocolate v4 opened from Next version (Mark, 2026-10-02: "include the pen").
# Captured from the built app (showchanges-capture.json key mex4pen): Whole Milk 563 to 600, Sucrose 33.4 to 36, Cocoa Powder
# 40.8 to 45, Cinnamon removed; every other amount untouched, so there are changed, share-only, unchanged and removed rows.
def pen_board(w):
    sec = with_remove_gap(CAP['mex4pen']['pen'])
    return f'<div style="width:{w}px;background:{APP_BG};padding:20px 0 40px;box-sizing:border-box;"><article class="recipe-page" style="box-sizing:border-box;">{sec}</article></div>'
HPEN = 1100
dc('R35C_393PenChanges.dc.html', T_PEN393, 393, HPEN, pen_board(393), phone_css(393) + BASE_CSS + PEN_RULE + REMOVE_GAP)
dc('R35C_723PenChanges.dc.html', T_PEN723, 723, HPEN, pen_board(723), phone_css(723) + BASE_CSS + PEN_RULE + REMOVE_GAP)

# 3: the cases the main board does not carry, at 393
mex = rows_of(CAP['mex4']['show'])
straw = rows_of(CAP['straw21']['show'])
mocha_foot = foot_of(CAP['mocha3']['show'])
def case_panel(t, sub, tbl, w=393):
    return panel(t, sub, f'<div style="width:{w}px;background:{GROUND};padding:0 20px 20px;box-sizing:border-box;"><article class="recipe-page" style="box-sizing:border-box;">{section(tbl)}</article></div>', w)
straw_head = re.search(r'<tr class="ingredient-table__step-head">.*?</tr>', CAP['straw21']['show']).group(0)
mocha = rows_of(CAP['mocha3']['show'])
mocha_head = re.search(r'<tr class="ingredient-table__step-head">.*?</tr>', CAP['mocha3']['show']).group(0)
c1 = case_panel('A batch is in view · plan / As made / struck', 'Strawberry v2.1: the cell reads plan amount, As made (the hand), then the struck old figure last (Mark, 2026-10-03: plan / as made / struck), so As made does not move when Show changes turns on; the share\'s struck figure stands on the same last line. The unchanged row (Lecithin) stays one line.',
    table(straw_head + straw[0] + straw[6], foot_of(CAP['straw21']['show']), asmade=True))
c2 = case_panel('The total, and a share-only change', 'Mocha v3. The struck total stands last in the Total cell, after As made, with no unit of its own, right-aligned at the number, not the unit. Whole Milk keeps its amount and only its share moves.',
    table(mocha_head + mocha[0] + mocha[2], mocha_foot, asmade=True))
removed = tr('Salt, was 1 g, now 1 g, removed', '<span class="ingredient-table__plan-grams"><span class="struck-value">1 g</span></span>', '<span class="struck-value">Salt</span>' + CHIP, '<span class="struck-value">0.1%</span>')
added = tr('Lecithin, 1.5 g', plain('1.5 g'), 'Lecithin', '0.2%')
split = (tr('Whole milk, 120 g', plain('120 g'), 'Whole milk<span class="ingredient-table__portion-note">120 g of 370.4 g · 46.3% in all</span>', '15.0%')
         + tr('Whole milk, 250.4 g', plain('250.4 g'), 'Whole milk<span class="ingredient-table__portion-note">250.4 g of 370.4 g · 46.3% in all</span>', '31.3%'))
longname = tr('Graza Drizzle extra virgin olive oil, was 40 g, now 48 g, estimated', pair('40 g', '48 g'), 'Graza Drizzle extra virgin olive oil' + CHIP, spair('5.0%', '5.9%'))
c3 = case_panel('A removed row', 'The whole row is struck and nothing replaces the amount, so the amount is one struck figure on the first line, where a plan amount stands, like its share. Today the app also prints the unchanged number after it.',
    table(step_head(2, 'Gum slurry') + removed + tr('Sucrose, was 45 g, now 33.4 g', pair('45 g', '33.4 g'), 'Sucrose', spair('5.8%', '3.7%')), foot_of(CAP['mex4']['show'])))
c4 = case_panel('An added row, a split ingredient', 'An added row has no parent amount to strike, so it reads plain on one line. A split ingredient reads plain too, one row per step with its portion note; the app compares whole rows only.',
    table(step_head(2, 'Gum slurry') + added + split, foot_of(CAP['mex4']['show'])))
c5 = case_panel('A long name with the estimated flag', 'Graza Drizzle extra virgin olive oil is the longest name in the library. The name track is the same width as in the reading view, so the name and its flag wrap exactly as they do there.',
    table(step_head(3, 'Build the base') + longname, foot_of(CAP['mex4']['show'])))
cases = ''.join([c1, c2, c3, c4, c5])
cases_main = f'<div style="padding:48px;display:flex;gap:48px;align-items:flex-start;background:{APP_BG};">{cases}</div>'
dc('R35C_393ShowChangesCases.dc.html', T_CASES, 393 * 5 + 48 * 4 + 96, 640, cases_main, phone_css(393) + BASE_CSS + RULE)

# 4: the options, same rows, at 393
def opt_table(css_wrap, tbl):
    return f'<div class="{css_wrap}" style="width:393px;background:{GROUND};padding:0 20px 20px;box-sizing:border-box;"><article class="recipe-page" style="box-sizing:border-box;">{section(tbl)}</article></div>'
def move_struck_under_name(html):
    def fix(m):
        r = m.group(0)
        s = re.search(r'<span class="ingredient-table__plan-grams">(<span class="struck-value">[^<]*</span>)', r)
        if not s: return r
        struck = s.group(1)
        r = r.replace(struck, '', 1)
        # append to the name cell
        return re.sub(r'(<td class="ingredient-table__col-name">.*?)(</td>)', lambda n: n.group(1) + struck.replace('class="struck-value"', 'class="struck-value struck-under"') + n.group(2), r, count=1, flags=re.S)
    return re.sub(r'<tr aria-label=.*?</tr>', fix, html, flags=re.S)
five = ''.join(mex[:4])
sample_body = step_head(1, 'Cayenne and sous vide') + five
sample_foot = foot_of(CAP['mex4']['show'])
reading_body = step_head(1, 'Cayenne and sous vide') + ''.join(rows_of(CAP['mex4']['plain'])[:4])
reading_foot = foot_of(CAP['mex4']['plain'])
# the stack rules, scoped to their own panel
OPT_CSS = (f'''
.o-1 .ingredient-table__plan-grams>.struck-value,.o-1b .ingredient-table__plan-grams>.struck-value{{display:block;margin-right:0}}
.o-1b .ingredient-table td.ingredient-table__col-numeric>.struck-value{{display:block;margin-right:0}}
.o-2 .ingredient-table tr{{grid-template-columns:max-content minmax(0,1fr) max-content !important}}
.o-3 .struck-under{{display:block;margin:0}}
''')
sub_rows = 'Four rows of Mexican Chocolate v4 against v3 and its Total.'
oc = ''.join([
  panel('Reading view · for width', 'Show changes off. The name track here is 223px at 393; this is the width the names have today and the one to keep.',
        opt_table('o-read', table(reading_body, reading_foot)), 393, 175),
  panel('Today · the amount spills into the name', 'Struck and current side by side in the 64px track: 83 to 104px wide. All 13 rows of the full table overlap the name, by up to 30px.',
        opt_table('o-today', table(sample_body, sample_foot)), 393, 175),
  panel('1 · amount stacked, share beside · not chosen', 'Amount fixed. The share pair is still side by side and 96px wide, so names stay 47px narrower than in the reading view (176px against 223px) and wrap sooner.',
        opt_table('o-1', table(sample_body, sample_foot)), 393, 175),
  panel('1b · amount and share both stacked · recommended', 'The old figure above the new one, in both columns, right-aligned in the same tracks. The share track shrinks to one figure, so the name track is 223px, the reading view\'s width: nothing in the name column moves when Show changes turns on. Each changed row grows one line, 38px to 56px; this table grows from 516px to 750px.',
        opt_table('o-1b', table(sample_body, sample_foot)), 393, 175),
  panel('2 · widen the amount track · not chosen', 'Each row sizes its own track, so the names start at different places down the list. Names are 157px wide at the narrowest, 66px less than in the reading view. A fixed 108px track instead leaves 132px, 91px less.',
        opt_table('o-2', table(sample_body, sample_foot)), 393, 175),
  panel('3 · struck figure under the name · not chosen', 'Old amount under the name, current amount in the track. The reading order changes (the old figure now sits where the name wraps), the share pair stays beside so names are 176px wide at the narrowest, and rows run 53 to 73px.',
        opt_table('o-3', table(move_struck_under_name(sample_body), move_struck_under_name(sample_foot))), 393, 175),
])
opt_main = f'<div style="padding:48px;display:flex;gap:40px;align-items:flex-start;background:{APP_BG};">{oc}</div>'
dc('R35C_ShowChangesOptions.dc.html', 'Show changes at 393 · options for the list form (recommended: 1b)', 393 * 6 + 40 * 5 + 96, 840, opt_main, phone_css(393) + BASE_CSS + OPT_CSS)

# ---- canvas.json entries (merged into the live file at publish) ----
ENTRIES = {
  'R35C_393ShowChanges.dc.html': dict(x=0, y=32500, w=393, h=H393, page='page-13', title=T_SC393),
  'R35C_723ShowChanges.dc.html': dict(x=473, y=32500, w=723, h=H723, page='page-13', title=T_SC723),
  'R35C_393ShowChangesCases.dc.html': dict(x=1276, y=32500, w=393 * 5 + 48 * 4 + 96, h=640, page='page-13', title=T_CASES),
  'R35C_393PenChanges.dc.html': dict(x=0, y=35100, w=393, h=HPEN, page='page-13', title=T_PEN393),
  'R35C_723PenChanges.dc.html': dict(x=473, y=35100, w=723, h=HPEN, page='page-13', title=T_PEN723),
  'R35C_ShowChangesOptions.dc.html': dict(x=0, y=33900, w=393 * 6 + 40 * 5 + 96, h=840, page='page-13', title='Show changes at 393 · options for the list form (recommended: 1b)'),
}
NOTES = {
  'r35-showchanges-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': 32200, 'maxW': 5000, 'text': "Show changes at phone widths: the plan amount first, the struck old figure last (decision 24 as amended 2026-10-03; redrawn after Mark chose D3, awaiting Mark's look). The options sheet below is the 2026-10-02 history."},
  'r35-showchanges-note': {'fill': 'gray', 'page': 'page-13', 'x': 3609, 'y': 32500, 'w': 400, 'text': 'Show changes on, list form, below 724. Every row is the app\'s own markup, captured from the built app (Mexican Chocolate v4 against v3, Mocha v3, Strawberry v2.1). Mark chose D3 on 2026-10-03 ("D3 is my favorite. iPhone follows the design too. Plan / as made / struck. I want keep things static when Show changes toggles."): the cell reads plan amount, As made, then the struck old figure, in the amount, the share, the Total and the pen. Neither the plan amount nor As made moves when Show changes turns on; the share\'s struck figure stands on the same last line as the amount\'s. This replaces decision 24\'s option 1b (struck above, approved 2026-10-02); the removed row (one struck amount where a plan amount stands), the Total without a unit and the name track (223px at 393) are unchanged. Redrawn 2026-10-03, awaiting Mark\'s look.\n\nThe cases board covers a batch in view, the total, a share-only change, a removed row, an added row, a split ingredient and a long name with the estimated flag. The removed, added, split and long-name rows are constructed from seeded names; the seed has none of those in a Show changes comparison.'},
  'r35-pen-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': 34860, 'maxW': 5000, 'text': "The pen at phone widths: a changed amount draws the struck parent under the 52px grams field (decision 25 as amended 2026-10-03; redrawn after Mark chose D3, awaiting Mark's look)"},
  'r35-pen-note': {'fill': 'gray', 'page': 'page-13', 'x': 1276, 'y': 35100, 'w': 400, 'text': "The pen opened from Next version, list form, below 724. The rows are the built app's own markup: Whole Milk 563 to 600, Sucrose 33.4 to 36, Cocoa Powder 40.8 to 45, Cinnamon removed, every other amount as seeded. Decision 25 stood the struck parent above the field; Mark chose D3 on 2026-10-03, so it now stands under the field (plan amount first, the old figure last), and opening the pen moves nothing: the field stays on the plan amount's line. The field stays 52px wide (44px tall on a coarse pointer) and clear of the name. A row whose share only moved keeps the field's height. A row with no change stays one line. The Total puts its struck figure under the current one, no unit. Redrawn 2026-10-03, awaiting Mark's look."},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/showchanges-canvas-entries.json', 'w'), indent=2)
print('ok')
