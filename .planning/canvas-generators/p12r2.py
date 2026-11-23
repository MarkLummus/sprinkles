# Sid, 2026-11-22 (Phase 12 round two; three redraws Mark decided on Mark's List after the round-two build; 12-UI-REVIEW.md round two, findings 1, 2 and 3). Three NEW boards on the
# Gate 2 page; the six approved boards of p12g2.py are not touched and still regenerate byte for byte.
#   P12R2_HomeDraft    decide-p12-phone-home-held-draft ("Home follows the same rule"): Home at 393 with a Next version draft kept. The lead reads the version page's own sentence in
#                      place of "Draft open on this version · Go to draft", and a record act whose version holds the kept draft is left out of the markup, lead and row.
#   P12R2_DeskLine     decide-p12-desk-line-words ("Sid proposes new words and draws two states"): the one-line page with nothing kept and with work kept, New recipe and Edit, at
#                      393 and at 723 (a narrow iPad window); Edit names its recipe as a link back to the version; the same closing words on the two recipe-head lines and on
#                      Home's lead; three candidates for the closing words, A drawn throughout.
#   P12R2_PickerWhere  decide-p12-picker-says-where ("Sid draws the picker heading naming the landing place"): the picker, in its built place, opened from a row in a step, from a
#                      row in no step and from the heading's Add ingredient; one line under its heading names where the pick lands. 1366 only.
# Every panel is the built app's own markup (p12r2-capture.mjs: WebKit, coarse, a build of commit b06add6f, the round-two build) under the app's own stylesheets, with only the redraw
# drawn over it. The head lines on P12R2_DeskLine start from p12g2-capture.json (Sid's Coffee recipe), as the approved head board does. Purple tags are notes, not in the app.
#   node p12r2-capture.mjs <dist> ; python3 p12r2.py measure <out> ; node p12r2-measure.mjs <out>/measure.html [chromium] [shots] ; python3 p12r2.py <canvas.json read from the artifact root> <out>
# ROUND THREE (Sid, 2026-11-23, after Mark's answers on Mark's List the same day; sketch 016 README "Round-three redraws"). Recaptured from a scratch build of main at 990076a0.
#   P12R2_DeskLine        REDRAWN: decide-p12-desk-line-closing-words = B. The closing words are "in a wider window" on every panel; the candidate row is gone. Approved by his answer.
#   P12R2_HomeDraft       REDRAWN: look-p12-home-held-draft, his note "I want the sentence on the row too": a row whose action is left out reads the lead's own sentence. A second
#                         drawn panel leaves Keep developing out of the lead below 724, for him to choose (his question 3: it opens the latest version's page and edits nothing).
#   P12R3_PickerAfterRow  NEW, replaces P12R2_PickerWhere (not approved; its board is retitled, its snapshot kept): look-p12-picker-says-where, his pushback "Why not insert the
#                         ingredient picker after the row": the picker opens inside the table, directly after the row that opened it; at the end for the heading's. 1366 only.
#   P12R3_PenTarget       NEW: decide-p12-pen-target-required-place = Sid draws. The version pen's refused target chip with Required under the blank side. 1366 only.
#   SPRINKLES_STYLES=<the same build's src/styles> node p12r2-capture.mjs <dist> ; python3 p12r2.py measure <out> ; node p12r2-measure.mjs <out>/measure.html [chromium] [shots] ; python3 p12r2.py <canvas.json> <out>
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import p12g2 as G
import printstart
from p12g2 import P, cell, flow, esc, cut_sheet, band, sheet, mark
CAP = json.load(open(HERE + '/p12r2-capture.json'))
G.M = json.load(open(HERE + '/p12r2-measure.json')) if os.path.exists(HERE + '/p12r2-measure.json') else {}
G.SIZES[393] = 852

# ---- words -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
# The closing words say where the job is finished. Built: "at the desk or on the iPad" (Mark, decide-p12-desk-page-words, A, 2026-11-21). DECIDED by Mark 2026-11-23
# (decide-p12-desk-line-closing-words, B): "in a wider window", in every sentence that sends work to the desk.
CLOSING = 'in a wider window'
BUILT = 'at the desk or on the iPad'
done = lambda c=CLOSING: f'Done {c}.'                                         # the page with nothing kept: the title names the job (New recipe, Edit)
edit_kept = lambda c=CLOSING: f'Edit kept. Finish it {c}.'                   # the head's own sentence (VersionRow.jsx EDIT_KEPT_LINE), on the Edit page when an edit is kept
draft_line = lambda name, c=CLOSING: f'Draft: {name}. Finish it {c}.'        # the head's own sentence for a Next version draft; on the New recipe page the name is the draft recipe's

# ---- 1. Home with a held draft ------------------------------------------------------------------------------------------------------------------------------------------------------
HOME = CAP['home_draft_393']['html']
built_line = lambda key: re.search(r'<p class="notebook-version__draft">([^<]*)</p>', CAP[key]['html']).group(1)      # the version page's own built sentence, whole
draft_name = lambda key: re.match(r'Draft: (.*)\. Finish it ', built_line(key)).group(1)
DRAFTS = {CAP['routes']['awaiting']: draft_name('recipe_draft_awaiting_393'), CAP['routes']['none']: draft_name('recipe_draft_393')}      # the version that holds a kept draft -> the draft's name
LEAD_V = re.search(r'href="([^"]*)"[^>]*>Go to draft', HOME).group(1); assert LEAD_V in DRAFTS
ACT = r'<a class="home__action" tabindex="0" href="(%s)(?:/batch/[^"]*)?"[^>]*>Record (?:batch|tasting)</a>' % '|'.join(re.escape(v) for v in DRAFTS)
def home_held(h, keep=True):
    """Home below 724 with a draft kept. The lead's line is the version page's sentence, plain. An action whose version holds the kept draft is not in the markup; a row that
    loses its action reads the same sentence in the action's place (Mark, 2026-11-23: "I want the sentence on the row too"). keep=False also leaves Keep developing out of the lead."""
    h, k = re.subn(r'<p class="home__lead-draft">.*?</p>', f'<p class="home__lead-draft">{esc(draft_line(DRAFTS[LEAD_V]))}</p>', h); assert k == 1
    a = h.index('<section class="home__lead">'); b = h.index('</section>', a); lead = re.sub(ACT, '', h[a:b]); assert 'Record' not in lead and 'Keep developing' in lead
    if not keep: lead, k = re.subn(r'<span class="home__actions"><a class="home__action home__action--secondary"[^>]*>Keep developing</a></span>', '', lead); assert k == 1
    def row(m):
        v = re.search(ACT, m.group(0)); return f'<p class="home__row-draft">{esc(draft_line(DRAFTS[v.group(1)]))}</p>' if v else m.group(0)
    rest = h[b:]
    rest2 = re.sub(r'<span class="home__actions">.*?</span>', row, rest); assert rest2.count('home__row-draft') == 2 and '>Go to draft<' not in lead
    return h[:a] + lead + rest2
def build_home():
    L, U = draft_line(DRAFTS[LEAD_V]), draft_line(DRAFTS[CAP['routes']['none']])
    r = [cell(P('hd-built', 393, HOME, 'As built · Home with two drafts kept', 'A draft is kept on Mexican Chocolate, Version 3 (its batch awaits a tasting) and on Underbelly Light Base, Version 2 (not yet churned). The lead says "Draft open on this version · Go to draft" and offers Record tasting; the two rows offer Record tasting and Record batch. Each lands on a page that refuses it.', h=1180)),
         cell(P('hd-drawn', 393, home_held(HOME), 'Drawn · the sentence on the row too', f'The lead reads the version page\'s sentence, plain text, no link: "{L}" A row whose action is left out reads the same sentence in the action\'s place: Mexican Chocolate\'s row, and Underbelly\'s ("{U}"). Keep developing stays in the lead: it opens Version 4\'s page, at the right.', h=1180)),
         cell(P('hd-nokeep', 393, home_held(HOME, keep=False), 'Drawn · the other choice: no Keep developing below 724', 'The same Home with Keep developing left out of the lead too. The recipe\'s name already opens the same page, and nothing on that page develops the recipe at this width. For Mark to choose on Mark\'s List.', h=1180)),
         cell(P('hd-latest', 393, cut_sheet(CAP['recipe_latest_393']['html']), 'As built · where Keep developing goes', 'Mexican Chocolate, Version 4, the latest version. Keep developing is a plain link to this page; it opens no pen and edits nothing. Below 724 the page has no Next version: Record batch, Print sheet, and the Draft line naming the draft kept on Version 3.', h=1180)),
         cell(P('hd-page', 393, cut_sheet(CAP['recipe_draft_awaiting_393']['html']), 'As built · the version that holds the draft', 'Mexican Chocolate, Version 3: the Draft line and Print sheet, no record act (Mark, decide-p12-record-with-draft-held, B). Its closing words are the built ones here; they become "in a wider window" with the desk line build.', h=1180))]
    return flow('Home below 724 · a Next version draft kept · the sentence on the row too', 'Phase 12 round three, redrawn 2026-11-23 (look-p12-home-held-draft; Mark: "I want the sentence on the row too"). Built markup at 393 (a build of 990076a0); only the lead\'s line, the rows\' sentence and the left-out record acts are drawn. Closing words: "in a wider window" (Mark, decide-p12-desk-line-closing-words, B). From 724 up nothing changes.',
                [('', '', r)], LABH=150)

# ---- 2. The desk line ---------------------------------------------------------------------------------------------------------------------------------------------------------------
PLACE_CSS = """.place__for{margin:0;font-size:var(--app-size-meta)}
.place__for a{display:inline-flex;align-items:center;min-height:var(--touch-min);color:var(--app-blue-text);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--offset-link-underline);border-radius:var(--app-radius-control)}
.home__row-draft{grid-area:actions;margin:0;font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text)}
.fp-win .ingredient-table tr.ingredient-table__pick{display:block;padding:0 0 var(--gap-s)}
.fp-win .ingredient-table tr.ingredient-table__pick > td{display:block;padding:0;border:0}
.r3-chip .method-step__open-fields .target-chip{display:inline-grid;grid-auto-flow:column;justify-content:start;column-gap:var(--gap-hair)}
.r3-chip .method-step__open-fields .target-chip > *{grid-row:1}
.r3-chip .method-step__open-fields .target-chip > .struck-value{align-self:center}
.r3-chip .method-step__open-fields .target-chip > .field-error{grid-row:2}
.dl-flag.dl-flag--r{left:auto;right:0}
"""      # proposed classes and rules, existing tokens only. place__for: Home's own text link (home__code-link) on the place page. home__row-draft: the lead's draft line (home__lead-draft) in a row's
         # actions area. ingredient-table__pick: the table row that holds the picker, a block like the table's own body. The pen's refused target chip: the creation editor's own
         # two-row chip (notebook.css, "stands Required under the empty one"), with the columns flowing so the parent's struck value keeps its place before the label.
def desk(key, title, note, back=None):
    """The one-line page: the built page's own markup with its line reworded; Edit gains one line naming the recipe and version, a link back to the version's page."""
    h = CAP[key]['html']; a = h.index('<div class="list-page place">'); b = h.index('</main>')
    link = f'<p class="place__for"><a tabindex="0" href="#">{esc(back)}</a></p>' if back else ''
    return h[:a] + f'<div class="list-page place"><h1 class="place__title">{esc(title)}</h1>{link}<p class="place__note">{esc(note)}</p></div>' + h[b:]
BACK = 'Coffee · Version 1'
R = lambda k: cut_sheet(G.CAP[k]['html'])
def build_desk():
    r0 = [cell(P('dl-built-new', 393, CAP['new_393']['html'], 'As built · New recipe', f'"{done(BUILT)}" The same page with a draft kept and with none.', h=340)),
          cell(P('dl-built-edit', 393, CAP['edit_393']['html'], 'As built · Edit', 'Names no recipe and has no way back to the version, whose page works at this width.', h=340)),
          cell(P('dl-built-edit-723', 723, CAP['edit_723']['html'], 'As built · Edit at 723, a narrow iPad window', 'An iPad in Split View is told to use the iPad.', h=340))]
    r1 = [cell(P('dl-new', 393, desk('new_393', 'New recipe', done()), 'New recipe · nothing kept', f'"{done()}" The title names the job.', h=340)),
          cell(P('dl-edit', 393, desk('edit_393', 'Edit', done(), BACK), 'Edit · nothing kept', 'One line under the title names the recipe and version; it is a link back to that version\'s page (44 high). Then the same line as New recipe.', h=340)),
          cell(P('dl-edit-723', 723, desk('edit_723', 'Edit', done(), BACK), 'Edit at 723, a narrow iPad window · nothing kept', 'The sentence says what to do on the iPad itself: give the app a wider window.', h=340))]
    r2 = [cell(P('dl-new-kept', 393, desk('new_393', 'New recipe', draft_line('Coffee')), 'New recipe · a draft kept', f'"{draft_line("Coffee")}" The head\'s Draft sentence with the draft recipe\'s name, plain text. Its row is in the Notebook, one tab away.', h=340)),
          cell(P('dl-edit-kept', 393, desk('edit_393', 'Edit', edit_kept(), BACK), 'Edit · an edit kept', f'"{edit_kept()}" The head\'s own sentence, so the page and the head say the same thing.', h=340)),
          cell(P('dl-edit-kept-723', 723, desk('edit_723', 'Edit', edit_kept(), BACK), 'Edit at 723 · an edit kept', 'The same two lines.', h=340))]
    r3 = [cell(P('dl-head-edit', 393, band(R('recipe_editing_393'), edit_kept()), 'Recipe head · an edit kept', f'"{edit_kept()}" The approved head (sketch 016, set A) with the decided closing words. Nothing else changes.', h=420)),
          cell(P('dl-head-draft', 393, band(R('recipe_editable_393'), draft_line('Version 2 · less cream'), record=False), 'Recipe head · a Next version draft kept', f'"{draft_line("Version 2 · less cream")}"', h=420)),
          cell(P('dl-home', 393, home_held(HOME), 'Home\'s lead and rows · a draft kept', f'"{draft_line(DRAFTS[LEAD_V])}" in the lead, and on a row whose action is left out (the Home board).', h=600))]
    return flow('The desk line · "in a wider window" · nothing kept and work kept', 'Phase 12 round three, redrawn 2026-11-23. DECIDED by Mark (decide-p12-desk-line-closing-words, B): the closing words are "in a wider window" in every sentence that sends work to the desk. Built markup at 393 and 723 (a build of 990076a0). Edit names its recipe as a link back; he raised nothing against it.',
                [('As built today', '"Done at the desk or on the iPad." in every window under 724.', r0), ('Decided · nothing kept', 'The title names the job. Edit also names what it would edit, as a link back.', r1),
                 ('Decided · work kept', 'The page reads the kept draft and says it is kept, in the head\'s own sentences. It never writes the draft.', r2),
                 ('The same closing words elsewhere', 'One phrase ends the two recipe-head lines and Home\'s sentence, lead and row.', r3)], LABH=136)

# ---- 3. The picker stands after its row --------------------------------------------------------------------------------------------------------------------------------------------
HEAD_NONE = '<tr class="ingredient-table__step-head"><td colspan="3">Not in a step yet</td></tr>'      # the table's own group heading, as built
def picker(key='pk_step', after=None, where=None, marks=(), built=False, tail=None):
    """The Ingredients region with the picker. built: under the table's Total, as captured. Else the picker is one row of the table body, directly after the row named `after`;
    with no `after`, at the end of the last group; tail='new group' gives it a group of its own under the table's "Not in a step yet" heading (the heading's Add ingredient when every
    row is in a step). The list is cut short; the visible picker is the built one, word for word. `where` goes to the group's accessible name only."""
    ing = CAP[key]['ing']; a = ing.index('<ul class="pick__list">'); ing = ing[:ing.index('</li>', a + 2600) + 5] + '</ul></div></section>'      # the first rows of the built list; the rest is left out
    if not built:
        a = ing.index('<div class="pick"'); pick = ing[a:-len('</section>')]; ing = ing[:a] + '</section>'
        assert pick.count('aria-label="Add ingredient"') == 1; pick = pick.replace('aria-label="Add ingredient"', f'aria-label="Add ingredient {esc(where)}"')
        tr = f'<tr class="ingredient-table__pick"><td colspan="3">{pick}</td></tr>'
        if after: i = ing.index('</tr>', ing.index(f'<tr data-line="', ing.index(f'aria-label="{after}, ') - 80)) + 5
        else: i = ing.index('</tbody><tfoot')
        if tail == 'new group': i = ing.index('<tfoot'); tr = f'<tbody>{HEAD_NONE}{tr}</tbody>'
        ing = ing[:i] + tr + ing[i:]
    for label, words in marks: ing = mark(ing, label, words)
    return sheet(ing, tabs=True)
def plain(key, marks=()):
    ing = CAP[key]['ing']
    for label, words in marks: ing = mark(ing, label, words)
    return sheet(ing, tabs=True)
def build_picker():
    g = CAP['pk_step']['geo']; row = next(r for r in g['rows'] if r['label'].startswith('Heavy cream')); gap = g['pick']['top'] - row['bottom']; under = g['pick']['bottom'] - g['innerH']
    HC, DX = 'Heavy cream, 36% fat', 'Dextrose'
    r1 = [cell(P('pa-built', 1366, picker(built=True, marks=[(f'Add ingredient after {HC}', 'pressed here')]), 'As built · Add ingredient pressed on Heavy cream', f'The picker opens under the table\'s Total, {gap} px below the row on this four-row table (532 on a seven-row one). In a window 1024 high its list starts {g["list"]["top"] - g["innerH"]} px below the bottom edge: to reach the list the page is scrolled and the row leaves the top.', natural=True, w=576)),
          cell(P('pa-step', 1366, picker(after=HC, where=f'after {HC}, in step 1', marks=[(f'Add ingredient after {HC}', 'pressed here')]), 'Drawn · the picker opens after the row', 'The picker is the next row of the table, inside step 1\'s group, right under Heavy cream. Coffee beans and the rows after it move down. Focus goes to Name, as built. The picker is the built one, word for word: its place says where the pick lands, so no line is added.', natural=True, w=576)),
          cell(P('pa-other', 1366, picker(after=DX, where=f'after {DX}, in step 2', marks=[(f'Add ingredient after {DX}', 'pressed here, with the picker open')]), 'Drawn · another row\'s Add ingredient pressed while it is open', 'The picker moves to stand after that row (Dextrose, in step 2); Coffee beans goes back up. One picker at a time. What was typed in Name and the Category stay; focus goes to Name, as built.', natural=True, w=576)),
          cell(P('pa-cancel', 1366, plain('ing_base', marks=[(f'Add ingredient after {HC}', 'focus returns here')]), 'Drawn · Cancel', 'The picker\'s row leaves the table and the rows below move back up. The row that opened it has not moved. Focus returns to what opened the picker, as built (its Add ingredient, or its grams when Cmd+Return opened it).', natural=True, w=576))]
    r2 = [cell(P('pa-picked', 1366, plain('ing_picked', marks=[('Egg yolk (fresh), grams', 'focus lands here')]), 'As built · Egg yolk picked', 'Built markup of the state after a pick from Heavy cream\'s row. The new row stands exactly where the picker stood, and focus is in its grams. Nothing here changes.', natural=True, w=576)),
          cell(P('pa-heading', 1366, picker('pk_heading', where='at the end, not in a step yet'), 'Drawn · from the heading\'s Add ingredient', 'At the end of the table, above the Total, after the last row under "Not in a step yet": where the new row lands. (The heading\'s button is away while the picker is open, as built.)', natural=True, w=576)),
          cell(P('pa-allplaced', 1366, picker('pk_allplaced', where='at the end, not in a step yet', tail='new group'), 'Drawn · from the heading, every row in a step', 'The new row will start the "Not in a step yet" group, so the picker stands under that heading, which shows while the picker is open. Without it the picker would read as part of step 2.', natural=True, w=576))]
    return flow('Creation editor · the picker opens after the row that asked for it', 'Phase 12 round three, drawn 2026-11-23 for Mark\'s pushback on look-p12-picker-says-where ("Why not insert the ingredient picker after the row and shift the non-needed rows off screen?"). 1366 only. Built markup (a build of 990076a0), the list cut short; only the picker\'s place is drawn. Replaces P12R2_PickerWhere. Purple tags are notes. Not approved yet.',
                [('From a row', 'The table is a real table whose body rows are laid out one under another; a group heading is already one cell across the three columns, and the picker\'s row is the same kind of row.', r1),
                 ('The pick, and the heading\'s Add ingredient', '', r2)], LABH=176)

# ---- 4. The pen's refused target ----------------------------------------------------------------------------------------------------------------------------------------------------
def refused(method, side):
    """The pen's open step with its target refused: Required after the blank side, inside the chip, wired as the pen's refused lead-in is (aria-invalid, aria-describedby step-field-error)."""
    f = re.search(r'<textarea rows="1" cols="20" class="ink-field target-chip__%s-field" aria-label="[^"]*"></textarea>' % side, method); assert f, side
    return method[:f.start()] + f.group(0).replace('></textarea>', ' aria-invalid="true" aria-describedby="step-field-error"></textarea>') + '<span id="step-field-error" class="field-error">Required</span>' + method[f.end():]
def build_target():
    def penp(key, side=None, marks=(), drawn=False):
        m = CAP[key]['method']
        if side: m = refused(m, side)
        for label, words in marks:
            m = mark(m, label, words)
            if label.endswith('value'): m = m.replace(f'<i class="dl-flag" aria-hidden="true">{esc(words)}</i>', f'<i class="dl-flag dl-flag--r" aria-hidden="true">{esc(words)}</i>')
        return sheet(m, page='notebook r3-chip' if drawn else 'notebook', tabs=True)
    ct = CAP['ct_refused']['method']
    r1 = [cell(P('pt-create', 1366, sheet(mark(ct, 'Step 1, target value', 'focus lands here'), tabs=True), 'As built · creating a recipe, Save refused', 'A target with a label and no value. The chip grows a second row and Required stands under the empty side, inside the chip. This is the pattern.', natural=True, w=576)),
          cell(P('pt-built-value', 1366, penp('pen_refused_value', marks=[('Step 1, target 1, value', 'focus lands here; no word')]), 'As built · Next version, Save as new version refused', 'The value was cleared. The step is open and focus is in the blank side. Nothing says why: no word, and nothing for a screen reader beyond the field\'s name.', natural=True, w=576)),
          cell(P('pt-built-changed', 1366, penp('pen_changed'), 'As built · the chip when a value changed, not refused', 'The parent\'s struck value first, then the two fields, on one line. The line has no room for all three, so the struck value is squeezed to 34 px and breaks into three lines.', natural=True, w=576))]
    r2 = [cell(P('pt-value', 1366, penp('pen_refused_value', 'value', [('Step 1, target 1, value', 'focus lands here')], drawn=True), 'Drawn · the value blank', 'A blank value differs from the parent\'s, so the struck value stands first, as built. Required stands under the blank value, inside the chip, as in the creation editor. The chip is the creation editor\'s two-row grid, so the struck value keeps one line.', natural=True, w=576)),
          cell(P('pt-label', 1366, penp('pen_refused_label', 'label', [('Step 1, target 1, label', 'focus lands here')], drawn=True), 'Drawn · the label blank, the value unchanged', 'No struck value: the pen pairs a target with its parent by label, so with the label blank none is drawn, whether or not the value changed. Required stands under the blank label. The two fields stand where they do today.', natural=True, w=576)),
          cell(P('pt-changed', 1366, penp('pen_changed', drawn=True), 'Drawn · a value changed, not refused', 'The same grid with no second row. One line, as built, but the struck value is no longer squeezed into three lines (as built it gets 34 px). For Mark to confirm with the board.', natural=True, w=576))]
    return flow('Version pen (Next version) · a refused target says Required', 'Phase 12 round three, drawn 2026-11-23 (decide-p12-pen-target-required-place: Sid draws). 1366 only. Built markup (a build of 990076a0, after cad72d3f); only the word and the chip\'s second row are drawn. A target with both sides blank is not refused and not drawn (it is dropped at Save: bug-pen-saves-step-backup-refuses). Purple tags are notes. Not approved yet.',
                [('As built', 'Save as new version is refused when a target has one side blank; the step opens and focus goes to the blank side.', r1), ('Drawn', 'One word, in the creation editor\'s place and style. The word goes at the next edit anywhere in the pen, as the pen\'s refused lead-in\'s does, and the chip is one row again.', r2)], LABH=150)

TITLES = {'P12R2_HomeDraft': 'Home below 724 · a Next version draft kept · the sentence on the row too · 393 (2026-11-23; round three, for Mark to answer)',
          'P12R2_DeskLine': 'The desk line · "in a wider window" (Mark picked B) · nothing kept and work kept · 393 and 723 (2026-11-23; decided)',
          'P12R3_PickerAfterRow': 'Creation editor · the picker opens after the row that asked for it · 1366 (2026-11-23; round three, for Mark to approve)',
          'P12R3_PenTarget': 'Version pen · a refused target says Required · 1366 (2026-11-23; round three, for Mark to approve)'}
RETIRED = {'P12R2_PickerWhere.dc.html': 'Replaced 2026-11-23 by P12R3_PickerAfterRow · not approved · '}
BUILD = (('P12R2_HomeDraft', build_home), ('P12R2_DeskLine', build_desk), ('P12R3_PickerAfterRow', build_picker), ('P12R3_PenTarget', build_target))

def build_boards(out):
    sizes = {}; css = G.panel_css() + '[hidden]{display:none !important}' + PLACE_CSS + G.FLAG_CSS
    for key, fn in BUILD:
        body, w, h = fn()
        main = f'<div style="position:relative;width:{w}px;height:{h}px;background:#ffffff">{body}</div>'
        open(f'{out}/project/{key}.dc.html', 'w').write(printstart.board(TITLES[key], main, w, h, css)); sizes[key] = (w, h)
    return sizes
def measure_html():
    pb = ''.join(f'<div data-pid="{p["pid"]}" data-natural="{int(p["natural"])}" class="fp-win g2w-{p["W"]}" style="display:none;position:absolute;left:0;top:0;width:{p["w"]}px;{"" if p["natural"] else "height:%dpx" % p["h"]}">{p["html"]}</div>\n' for p in G.PANELS)
    return '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s[hidden]{display:none !important}</style></head><body>%s</body></html>' % ((G.panel_css() + PLACE_CSS + G.FLAG_CSS).replace("/_blob/37ac467ba5558024f5fb5a2e5c22a7bc", os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')), pb)

if __name__ == '__main__':
    out = sys.argv[2]; os.makedirs(out + '/project', exist_ok=True)
    if sys.argv[1] == 'measure':
        build_boards(out); open(out + '/measure.html', 'w').write(measure_html()); print(len(G.PANELS), 'panels')
    else:
        c = json.load(open(sys.argv[1])); sizes = build_boards(out); B = c['boards']; N = c['notes']; PAGE = sys.argv[3] if len(sys.argv) > 3 else 'page-27'
        assert any(p['id'] == PAGE for p in c['pages']), 'the Gate 2 page is not on the canvas'
        others = [b for fn, b in B.items() if b.get('page') == PAGE and not fn.startswith('P12R')]
        row = ['P12R2_HomeDraft', 'P12R2_DeskLine', 'P12R2_PickerWhere', 'P12R3_PickerAfterRow', 'P12R3_PenTarget']      # one row under the approved boards; a redrawn board that grew shifts the ones after it along
        y0 = B.get('P12R2_HomeDraft.dc.html', {}).get('y', max(b['y'] + b['h'] for b in others) + 700); x = B.get('P12R2_HomeDraft.dc.html', {}).get('x', min(b['x'] for b in others))
        N['p12r2-title'] = {**dict(x=x, y=y0 - 300, maxW=6000), **N.get('p12r2-title', {}), **dict(text='Phase 12 rounds two and three: Home with a held draft, the desk line\'s words, the picker after its row, the pen\'s refused target (redraws after the build, 2026-11-22 and 2026-11-23)', kind='title1', page=PAGE)}
        for key in row:
            fn = key + '.dc.html'
            if key in sizes: w, h = sizes[key]; B[fn] = {**dict(page=PAGE), **B.get(fn, {}), 'x': x, 'y': y0, 'w': w, 'h': h, 'title': TITLES[key]}
            elif fn in B: B[fn] = {**B[fn], 'x': x, 'y': y0}
            else: continue
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + B[fn]['w'] + 240
        for fn, pre in RETIRED.items():
            if fn in B and not B[fn].get('title', '').startswith('Replaced'): B[fn]['title'] = pre + B[fn].get('title', fn)
        json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
