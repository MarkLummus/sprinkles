# Sid, 2026-10-06: Mark's edits to the captured print starting point (the Sheet as the build renders it, printstart-capture.json). Each is a delta on the capture, so the gap between what the
# app prints today and what the canvas draws stays readable. These are Mark's design changes for Phase 4 to build, not as built.
#   E1 (Mark, 2026-10-06; revised the same day): the As made entry field is the FIRST column of the printed Ingredients table. A blank ruled cell per line, one per portion line
#      (brief § 3: a split row prints one line per portion, each with its own as-made blank), empty, under the header "As made". The capture's order was Grams | Ingredient | % of batch,
#      with no As made column (no batch). The Total row keeps its plan grams; its As made cell is left empty (Mark named one field per portion line, not one for the Total).
#      Revised: the tick box is RETIRED by Mark ("the As made line and the tick box duplicate each other"). That supersedes the brief's mise-en-place tick box (§ 3 item 1 and § 6);
#      the brief is to be revised through Impeccable, not here.
#   E6 (Mark, 2026-10-06): the plan amount sits between the As made line and the name: As made | Grams | Ingredient. The header stays as built: "Ingredient" over the grams and the name
#      (colspan 2, the build's own head), "As made" over the new column. Every printed figure keeps its unit (the build's "120 g").
#   E7 (Mark, 2026-10-06: more emphasis on the step separators; Sid's pick of one treatment): a heavier rule above each step group, the step head's top border at --rule-tick (2.5px, ink).
#      As built the step head has no top rule of its own (the row above's 1px hairline) and a --rule-baseline bottom; its type, size and spacing are unchanged.
#   E2 (Mark): no "% of batch" on paper: the header cell and every row's share cell are dropped (the Total row's share cell was empty in the capture).
#   E3 (Mark): no Watch for on paper (the capture's .margin-region).
#   E4 (Mark): PrintStartingPoint has no Balance either (the brief's § 4 anti-goal); the alternate board PrintStartingPointBalanceCol2 keeps Balance, in a second column beside the
#      Ingredients table, without its Hide control (paper has no controls). That board departs from § 4 for Mark to decide.
#   E5 (Mark, 2026-10-06, "black-only"; brief § 3 and § 4: no colour anywhere on the sheet): the section headings print in ink. As built they print bookcloth green (#33513b), the one colour
#      measured on the printed Sheet; Chrome and WebKit print text colour, so this is a change Phase 4 builds. (The page itself is white as built: browsers drop the Sheet's ground.)
#   E8 (Mark, 2026-10-06: "either lighten the lines between ingredients or drop the line"; dropped, Sarge's call for black-only paper): no rule between ingredient rows. As built every cell
#      carries a --rule-baseline bottom rule; here the portion lines' cells carry none, so the step-group rule (E7) carries the grouping alone. Kept: the As made writing line in each row,
#      the header row's rule, the step head's own rules (E7's above, the built one beneath), and the Total's top rule.
# Mark chose the Balance alternative (PrintStartingPointBalanceCol2) on 2026-10-06; PrintStartingPoint is kept, not chosen. Balance in column 2 overrides the brief's § 4 anti-goal
# ("no Balance ... from column two"); with the tick box's retirement (E1) that brief change goes to Impeccable, not here.
import re

def _drop_element(html, start_pat):
    """Remove the element whose opening tag matches start_pat, with its balanced content."""
    m = re.search(start_pat, html)
    if not m: raise AssertionError('not found: ' + start_pat)
    tag = re.match(r'<(\w+)', m.group(0)).group(1); i = m.start(); depth = 0
    for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', html[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: return html[:i] + html[i + t.end():]
    raise AssertionError('unbalanced: ' + start_pat)

ASMADE = '<td class="ps-col-asmade"><span class="ps-asmade"></span></td>'

def table_edits(sheet):
    """E1, E2 and E6 on the captured table."""
    head_old = '<thead><tr><th scope="col" class="ingredient-table__col-name" colspan="2">Ingredient</th><th scope="col" class="ingredient-table__col-numeric">% of batch</th></tr></thead>'
    assert head_old in sheet
    sheet = sheet.replace(head_old, '<thead><tr><th scope="col" class="ps-col-asmade">As made</th>'
                                    '<th scope="col" class="ingredient-table__col-name" colspan="2">Ingredient</th></tr></thead>')
    def row(m):
        tds = re.findall(r'<td[^>]*>.*?</td>', m.group(2), re.S)
        assert len(tds) == 3, m.group(0)[:200]
        grams, name, share = tds
        grams = grams.replace('class="ingredient-table__col-grams"', 'class="ingredient-table__col-grams ps-col-grams"')
        first = '<td class="ps-col-asmade"></td>' if m.group(3) == 'tfoot' else ASMADE
        return m.group(1) + first + grams + name + '</tr>'
    sheet, n = re.subn(r'(<tr aria-label="[^"]*">)(.*?)</tr>(?=(?:<tr|</tbody>|</(tfoot)>))', row, sheet, flags=re.S)
    assert n == 15, n   # 14 portion lines and the Total
    return sheet

def drop_watch_for(sheet): return _drop_element(sheet, r'<div class="margin-region">')                    # E3
def drop_balance(sheet): return _drop_element(sheet, r'<div class="side-region">')                         # E4, PrintStartingPoint
def balance_without_control(sheet):                                                                         # E4, the alternate: the heading is plain words, no Hide
    old = re.search(r'<h2 class="region-name"><button type="button" class="fold-row"[^>]*aria-label="Balance, Hide"[^>]*>.*?</button></h2>', sheet, re.S).group(0)
    return sheet.replace(old, '<h2 class="region-name">Balance</h2>')

CSS = '''
.recipe-page .region-name{color:var(--sheet-ink)}
.ingredient-table .ps-col-asmade{width:84px;padding-right:var(--gap-s);text-align:left}
.ingredient-table .ps-col-grams{text-align:right;white-space:nowrap}
.ps-asmade{display:block;width:72px;height:24px;border-bottom:var(--rule-ink-field) solid var(--sheet-ink)}
.ingredient-table__step-head td{border-top:var(--rule-tick) solid var(--sheet-ink)}
.ingredient-table tbody tr:not(.ingredient-table__step-head) td{border-bottom:0}
'''
# the alternate: two columns at 816, Ingredients in column 1 and Balance in column 2 (the Instructions and everything else full width, as the one-column print has them)
CSS_COL2 = '''
.recipe-page{grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);grid-template-areas:'band band' 'before before' 'ingredients side' 'method method' 'foot foot'}
'''

def main_board(sheet): return drop_balance(drop_watch_for(table_edits(sheet)))
def col2_board(sheet): return balance_without_control(drop_watch_for(table_edits(sheet)))
