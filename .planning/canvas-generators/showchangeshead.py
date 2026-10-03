import sys; sys.argv=['x']
import json
import phonelog                      # runs the phone-logging boards first (idempotent): band pieces, shell_of, suffix_ids, PANELS style
from phonelog import *
from showchanges import BASE_CSS, RULE, phone_css, SHEET_HAND
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-02 (decision 30, addendum; Mark asked to see option 3 for the Show changes control).
# With Record a tasting filled, a version that has a parent needs ~354-357px for the band's three controls against a 353px row, so
# Show changes wraps under the filled action at 320 to 390. Option 3: the band keeps only the actions (filled action, Next version
# as a text control, the Go to batch row) and Show changes / Hide changes moves to the head of the ingredient table, right-aligned on
# the Ingredients heading row. Nothing else changes: the band, the Sheet, the folds, the rails, the decision 24 figures, as amended 2026-10-03 (the struck
# figure last, RULE), the 44px target on a coarse pointer (decision 23: the pointer alone).
#
# Every Ingredients region below is the built app's own markup (coconut-capture.json, Playwright WebKit, the preview build, 393 coarse):
# Coconut v2 (has a parent, a batch awaiting its tasting) with Show changes off and on, and Coconut v1 (no parent). The ONE edit to
# that markup is the heading row (HEAD below), which is the proposal. Coconut is used because it is the seeded version with a
# parent AND a batch awaiting tasting, the case that wraps. The band is the generator's own phone band (phonelog.band_phone) with
# the recipe name and version line set to Coconut's.
CAPC = json.load(open(HERE + '/coconut-capture.json'))

# The control is the Sheet's own text control (class text-control: sheet ink, underlined, --sheet-type-control; 17px tall on a fine
# pointer and 44px on a coarse one), the same control as the Show beside Balance and Watch for in the same Sheet, not the band's
# blue .notebook-link (App context). Right-aligned on the heading row, flush with the table's right edge (the % of batch column).
HEAD_CSS = '''
.ingredient-table-region__head{display:flex;align-items:center;justify-content:space-between;gap:var(--gap-s,12px);margin:0 0 var(--gap-xs)}
.ingredient-table-region__head .region-name{margin:0}
.ingredient-table-region__head .text-control{flex:none;font-weight:400}
'''
def with_head(ing, label):
    old = '<h2 class="region-name">Ingredients</h2>'
    assert ing.count(old) == 1
    new = (f'<div class="ingredient-table-region__head"><h2 class="region-name">Ingredients</h2>'
           f'<button type="button" class="text-control" tabindex="0">{label}</button></div>')
    return ing.replace(old, new, 1)

def coconut_band(state, parent):
    """phonelog.band_phone's narrow band for Coconut, with Show changes taken out of the action row (option 3)."""
    vb = version_block(draft=None)
    vline = 'Version 2 · v2' if parent else 'Version 1 · v1'
    assert 'Version 1 · 50 g oil · 800 g <span' in vb
    vb = vb.replace('Version 1 · 50 g oil · 800 g <span', vline + ' <span', 1)
    if not parent:
        vb = vb.replace(f'<span style="font-weight:400;color:{TEXT2};">· Latest</span>', '', 1)   # v1 is not the tip
    assert OLD_ACTIONS in vb
    primary = {'none': 'Record a batch', 'awaiting': 'Record a tasting'}.get(state, 'Record another')
    vb = vb.replace(OLD_ACTIONS, f'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">{filled(primary)}{textctl("Next version")}</div>', 1)
    ident = recipe_identity(False).replace(RECIPE_NAME, 'Coconut', 1)
    ident, n = re.subn(r'\n  <p style="margin:0;font-family[^>]*>' + re.escape(RECIPE_DESC) + '</p>', '', ident, count=1)
    assert n == 1
    top = f'<div style="display:flex;flex-direction:column;gap:20px;">{ident}{vb}{jump_row(STATUS[state])}</div>'
    if parent:
        versions = [('28 Dec', 'Version 1 · v1', 'churned', True, False), ('28 Dec', 'Version 2 · v2', 'churned date unknown · Latest', False, True)]
    else:
        versions = [('28 Dec', 'Version 1 · v1', 'churned', True, True), ('28 Dec', 'Version 2 · v2', 'churned date unknown · Latest', False, False)]
    return f'''<header style="display:flex;flex-direction:column;gap:20px;padding:16px 0 20px;border-bottom:1px solid {DIV};">
  {top}
  {history_upright(versions, '2 versions')}
</header>'''

def sheet_head(cap_, key, label):
    """The Sheet as the app prints it down to the end of the ingredient table: title, then Ingredients with its head row."""
    ing = cap_[key]['ing']
    if label: ing = with_head(ing, label)
    return f'<article class="recipe-page" style="box-sizing:border-box;">{cap_[key]["band"]}{ing}</article>'

def page(state, parent, key, label):
    return (f'<div style="display:flex;flex-direction:column;gap:24px;padding-bottom:40px;"><div style="padding:0 20px;">{coconut_band(state, parent)}</div>'
            f'{sheet_head(CAPC["coc2" if parent else "coc1"], key, label)}</div>')

PANELS3 = [  # state, parent, capture key, control label, heading, sub
  ('awaiting', True, 'plain', 'Show changes', 'Changes hidden · Show changes at the table\'s head',
   'Coconut v2, a batch awaiting tasting. The band keeps Record a tasting, Next version and Go to batch; Show changes sits on the Ingredients row, right-aligned.'),
  ('awaiting', True, 'show', 'Hide changes', 'Changes shown · Hide changes, the struck figure under the new (redrawn 2026-10-03, awaiting Mark\'s look)',
   'The same page after Show changes: the control reads Hide changes and the table draws decision 24 as amended 2026-10-03 (plan amount, As made, then the struck figure). The band is unchanged.'),
  ('tasted', False, 'plain', None, 'First version · no parent, no control',
   'Coconut v1 has no parent: the Ingredients row is the heading alone, as today, and the band is the approved one.'),
]

# caption block height per width, so the three pages start on one line (heading up to two lines, note up to four)
CH = {393: 130, 723: 96}

def head_board(width, key, title, extra_css, heights):
    gap = 40
    panels = ''
    for i, (state, parent, ck, label, head, sub) in enumerate(PANELS3):
        vid = f'q{i}'
        shell = shell_of(phone_folds(page(state, parent, ck, label), open_=False), title, width, extra_css)
        shell = suffix_ids(shell, vid)
        x = gap + i * (width + gap)
        panels += (f'<div style="position:absolute;left:{x}px;top:{gap}px;width:{width}px;">'
                   f'<div style="height:{CH[width]}px;"><p style="{CAPTION}">{head}</p><p style="{SUBCAP}">{sub}</p></div>'
                   f'<div style="margin-top:10px;width:{width}px;outline:1px solid {DIV};background:#ffffff;transform:translateZ(0);">{shell}</div></div>\n')
    bw = gap + len(PANELS3) * (width + gap)
    bh = gap + CH[width] + 10 + heights[width] + gap
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#f3f4f2;">{panels}</div>'
    html = board(title, bw, bh, '', 'notebook', extra_css + '[hidden]{display:none !important}')
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + key + '.dc.html', 'w').write(html)
    return bw, bh

# panel page heights, measured on the first render of each width (the tallest panel, the shown state)
H3 = {393: 1500, 723: 1440}
T393H = 'C · 393 · option 3 for Show changes: the control at the head of the ingredient table, right-aligned; the band keeps the actions (drawn 2026-10-02, not approved)'
T723H = 'C · 723 · option 3 for Show changes: the control at the head of the ingredient table (drawn 2026-10-02, not approved)'
css393 = FORCED + PHONE_TABLE + BASE_CSS + RULE + HEAD_CSS
css723 = SHELL_TABS + ONE_COL + AFTER_TOUCH + PHONE_TABLE + BASE_CSS + RULE + HEAD_CSS
hw393, hh393 = head_board(393, 'R35C_393ShowChangesHead', T393H, css393, H3)
hw723, hh723 = head_board(723, 'R35C_723ShowChangesHead', T723H, css723, H3)

Y3 = 47400 + 4400
ENTRIES = {
  'R35C_393ShowChangesHead.dc.html': dict(x=0, y=Y3, w=hw393, h=hh393, page='page-13', title=T393H),
  'R35C_723ShowChangesHead.dc.html': dict(x=hw393 + 160, y=Y3, w=hw723, h=hh723, page='page-13', title=T723H),
}
NOTES = {
  'r35-scheadnote-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': Y3 - 240, 'maxW': hw393 + 160 + hw723, 'text': 'Show changes at the head of the ingredient table, option 3 (Mark asked to see it 2026-10-02; drawn, not approved)'},
  'r35-scheadnote-note': {'fill': 'gray', 'page': 'page-13', 'x': hw393 + 160 + hw723 + 80, 'y': Y3, 'w': 400, 'text': 'Option 3: the band keeps only the actions (Record a tasting filled, Next version a text control, Go to batch), so it no longer wraps at 320 to 390; Show changes / Hide changes moves onto the Ingredients heading row, right-aligned, in the Sheet\'s own text control. Each board shows the changes hidden, the changes shown (decision 24 as amended 2026-10-03, the struck figure under the new; the Changes shown panel redrawn, awaiting Mark\'s look) and a first version, which has no control and keeps its heading as is. Every table is the built app\'s own markup (Coconut v2 and v1). The control still switches the whole version\'s changes, including the Instructions and Balance further down the page, not only the table.'},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/showchangeshead-canvas-entries.json', 'w'), indent=2)
print('ok head', hw393, hh393, hw723, hh723)
