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
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import p12g2 as G
import printstart
from p12g2 import P, cell, flow, esc, cut_sheet, band, sheet, mark
CAP = json.load(open(HERE + '/p12r2-capture.json'))
G.M = json.load(open(HERE + '/p12r2-measure.json')) if os.path.exists(HERE + '/p12r2-measure.json') else {}
G.SIZES[393] = 852

# ---- words -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
# The closing words say where the job is finished. Built: "at the desk or on the iPad" (Mark, decide-p12-desk-page-words, A, 2026-11-21). It is shown in every window under 724,
# a narrow iPad window included, so the iPad is told to use the iPad. Three candidates; A is drawn on every panel that is not a candidate panel.
CLOSE = {'A': 'at the desk or on the iPad, in a wide window', 'B': 'in a wider window', 'C': 'at the desk, or on the iPad full screen'}
BUILT = 'at the desk or on the iPad'
PICK = 'A'
done = lambda c: f'Done {c}.'                                         # the page with nothing kept: the title names the job (New recipe, Edit)
edit_kept = lambda c: f'Edit kept. Finish it {c}.'                   # the head's own sentence (VersionRow.jsx EDIT_KEPT_LINE), on the Edit page when an edit is kept
draft_line = lambda name, c: f'Draft: {name}. Finish it {c}.'        # the head's own sentence for a Next version draft; on the New recipe page the name is the draft recipe's
WHERE = {'step': 'After Heavy cream, 36% fat · in step 1', 'unplaced': 'After Fine sea salt · not in a step yet', 'heading': 'At the end · not in a step yet'}

# ---- 1. Home with a held draft ------------------------------------------------------------------------------------------------------------------------------------------------------
HOME = CAP['home_draft_393']['html']
HEAD_LINE = re.search(r'<p class="notebook-version__draft">([^<]*)</p>', CAP['recipe_draft_awaiting_393']['html']).group(1)      # the version page's own built sentence, whole
DRAFT_NAME = re.match(r'Draft: (.*)\. Finish it ', HEAD_LINE).group(1)
HELD = [re.search(r'href="([^"]*)"[^>]*>Go to draft', HOME).group(1), CAP['routes']['none']]      # the two versions that hold a kept draft in the capture
def home_held(h, close=BUILT):
    """Home below 724 with a draft kept: the lead's line is the version page's sentence, plain; an action whose version holds the kept draft is not in the markup."""
    h, k = re.subn(r'<p class="home__lead-draft">.*?</p>', f'<p class="home__lead-draft">{esc(draft_line(DRAFT_NAME, close))}</p>', h); assert k == 1
    a = h.index('<section class="home__lead">'); b = h.index('</section>', a); lead = h[a:b]
    for v in HELD: lead = re.sub(r'<a class="home__action" tabindex="0" href="%s(?:/batch/[^"]*)?"[^>]*>Record (?:batch|tasting)</a>' % re.escape(v), '', lead)
    assert 'Record' not in lead and 'Keep developing' in lead; h = h[:a] + lead + h[b:]
    def row(m):
        return '' if any(re.search(r'<a class="home__action" tabindex="0" href="%s(?:/batch/[^"]*)?"' % re.escape(v), m.group(0)) for v in HELD) else m.group(0)
    h2, k = re.subn(r'<span class="home__actions">.*?</span>', row, h); assert h2.count('home__actions') == h.count('home__actions') - 2; assert '>Go to draft<' not in h2
    return h2
def build_home():
    r = [cell(P('hd-built', 393, HOME, 'As built · Home with two drafts kept', 'A draft is kept on Mexican Chocolate, Version 3 (its batch awaits a tasting) and on Underbelly Light Base, Version 2 (not yet churned). The lead says "Draft open on this version · Go to draft" and offers Record tasting; Underbelly\'s row offers Record batch. Each lands on the page at the right, which refuses it.', h=1180)),
         cell(P('hd-drawn', 393, home_held(HOME), 'Drawn · the same Home', f'The lead reads the version page\'s own sentence, plain text, no link: "{HEAD_LINE}" Record tasting is left out of the lead and of Mexican Chocolate\'s row; Record batch is left out of Underbelly\'s row. Keep developing stays: it opens Version 4, which holds no draft. A row gives no reason; its page does.', h=1180)),
         cell(P('hd-page', 393, cut_sheet(CAP['recipe_draft_awaiting_393']['html']), 'As built · the page they lead to', 'Mexican Chocolate, Version 3, below 724 with its draft kept: the line and Print sheet, no record act (Mark, decide-p12-record-with-draft-held, B). Home now says the same thing in the same words.', h=1180)),
         cell(P('hd-page-none', 393, cut_sheet(CAP['recipe_draft_393']['html']), 'As built · Underbelly Light Base, Version 2', 'The page Underbelly\'s Record batch leads to today: the same line, Print sheet alone.', h=1180))]
    return flow('Home below 724 · a Next version draft kept · Home follows the version page', 'Phase 12 round two, redraw 1 (decide-p12-phone-home-held-draft: "Home follows the same rule as the version page"). Built markup at 393 (a build of b06add6f); only the lead\'s line and the left-out record acts are drawn. From 724 up nothing changes. The closing words are the built ones; the desk line board proposes new ones.',
                [('', '', r)], LABH=150)

# ---- 2. The desk line ---------------------------------------------------------------------------------------------------------------------------------------------------------------
PLACE_CSS = '''.place__for{margin:0;font-size:var(--app-size-meta)}
.place__for a{display:inline-flex;align-items:center;min-height:var(--touch-min);color:var(--app-blue-text);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--offset-link-underline);border-radius:var(--app-radius-control)}
.pick__where{font-family:var(--face-grotesk);font-size:var(--app-size-meta);margin:0 0 var(--gap-s)}
'''      # two proposed classes, existing tokens only: place__for is Home's own text link (home__code-link) on the place page; pick__where is the picker's own small type (its count line's size), in ink
def desk(key, title, note, back=None):
    """The one-line page: the built page's own markup with its line reworded; Edit gains one line naming the recipe and version, a link back to the version's page."""
    h = CAP[key]['html']; a = h.index('<div class="list-page place">'); b = h.index('</main>')
    link = f'<p class="place__for"><a tabindex="0" href="#">{esc(back)}</a></p>' if back else ''
    return h[:a] + f'<div class="list-page place"><h1 class="place__title">{esc(title)}</h1>{link}<p class="place__note">{esc(note)}</p></div>' + h[b:]
BACK = 'Coffee · Version 1'
R = lambda k: cut_sheet(G.CAP[k]['html'])
def build_desk():
    c = CLOSE[PICK]
    r0 = [cell(P('dl-built-new', 393, CAP['new_393']['html'], 'As built · New recipe', 'The same page with a draft kept and with none.', h=340)),
          cell(P('dl-built-edit', 393, CAP['edit_393']['html'], 'As built · Edit', 'Names no recipe and has no way back to the version, whose page works at this width.', h=340)),
          cell(P('dl-built-edit-723', 723, CAP['edit_723']['html'], 'As built · Edit at 723, a narrow iPad window', 'An iPad in Split View is told to use the iPad.', h=340))]
    r1 = [cell(P('dl-new', 393, desk('new_393', 'New recipe', done(c)), 'New recipe · nothing kept', f'"{done(c)}" True on the phone, in a narrow iPad window and in a narrow desk window.', h=340)),
          cell(P('dl-edit', 393, desk('edit_393', 'Edit', done(c), BACK), 'Edit · nothing kept', f'One line under the title names the recipe and version; it is a link back to that version\'s page (44 high). Then the same line as New recipe.', h=340)),
          cell(P('dl-edit-723', 723, desk('edit_723', 'Edit', done(c), BACK), 'Edit at 723, a narrow iPad window · nothing kept', 'The sentence now says what to do on the iPad itself: give the app a wide window.', h=340))]
    r2 = [cell(P('dl-new-kept', 393, desk('new_393', 'New recipe', draft_line('Coffee', c)), 'New recipe · a draft kept', f'"{draft_line("Coffee", c)}" The head\'s Draft sentence with the draft recipe\'s name, plain text. Its row is in the Notebook, one tab away.', h=340)),
          cell(P('dl-edit-kept', 393, desk('edit_393', 'Edit', edit_kept(c), BACK), 'Edit · an edit kept', f'"{edit_kept(c)}" The head\'s own sentence, so the page and the head say the same thing.', h=340)),
          cell(P('dl-edit-kept-723', 723, desk('edit_723', 'Edit', edit_kept(c), BACK), 'Edit at 723 · an edit kept', 'One line at this width.', h=340))]
    r3 = [cell(P('dl-head-edit', 393, band(R('recipe_editing_393'), edit_kept(c)), 'Recipe head · an edit kept', 'The approved head (sketch 016, set A) with the new closing words. Nothing else changes.', h=420)),
          cell(P('dl-head-draft', 393, band(R('recipe_editable_393'), draft_line('Version 2 · less cream', c), record=False), 'Recipe head · a Next version draft kept', 'The same head line with the new closing words.', h=420)),
          cell(P('dl-home', 393, home_held(HOME, c), 'Home\'s lead · a draft kept', 'The Home board\'s lead (redraw 1) with the new closing words: one phrase, used in every one of these sentences.', h=600))]
    for k in ('B', 'C'):      # measured, not placed: the longest sentence in each other candidate
        P(f'dl-head-draft-{k}', 393, band(R('recipe_editable_393'), draft_line('Version 2 · less cream', CLOSE[k]), record=False), '', '', h=420); P(f'dl-new-{k}', 393, desk('new_393', 'New recipe', done(CLOSE[k])), '', '', h=340)
    why = {'A': 'Recommended. Keeps the words Mark chose and adds the one condition they missed. True on the phone (go to the desk or the iPad), in a narrow iPad window and in a narrow desk window (make it wide).',
           'B': 'Shortest, and true everywhere, but it names no device: on the phone there is no wider window to make.',
           'C': 'Names the iPad\'s own fix. Says more than is needed (a two-thirds Split View window is wide enough) and tells a narrow desk window to go to the desk.'}
    r4 = [cell(P(f'dl-cand-{k}', 393, desk('edit_393', 'Edit', edit_kept(CLOSE[k]), BACK), f'{k} · "{CLOSE[k]}"', f'{why[k]} Nothing kept: "{done(CLOSE[k])}"', h=340)) for k in ('A', 'B', 'C')]
    return flow('The desk line · new closing words, and two states', 'Phase 12 round two, redraw 2 (decide-p12-desk-line-words: "Sid proposes new words and draws two states"). Built markup at 393 and 723 (a build of b06add6f). Drawn in candidate A; Mark picks the closing words on Mark\'s List.',
                [('As built today', '"Done at the desk or on the iPad." in every window under 724.', r0), ('Drawn · nothing kept', 'The title names the job. Edit also names what it would edit, as a link back.', r1),
                 ('Drawn · work kept', 'The page reads the kept draft and says it is kept, in the head\'s own sentences. It never writes the draft.', r2),
                 ('The same closing words elsewhere', 'One phrase ends the two recipe-head lines and Home\'s lead line. Whatever Mark picks goes to all of them.', r3),
                 ('Three candidates for the closing words', 'Each on the Edit page with an edit kept.', r4)], LABH=136)

# ---- 3. The picker says where -------------------------------------------------------------------------------------------------------------------------------------------------------
def picker(key, where=None, marks=()):
    ing = CAP[key]['ing']; a = ing.index('<ul class="pick__list">'); ing = ing[:ing.index('</li>', a + 2600) + 5] + '</ul></div></section>'      # the first rows of the built list; the rest is left out
    if where:
        full = 'Add ingredient ' + where[0].lower() + where[1:].replace(' · ', ', ')
        ing = ing.replace('<div class="pick" role="group" aria-label="Add ingredient">', f'<div class="pick" role="group" aria-label="{esc(full)}">'); i = ing.index('</div>', ing.index('<div class="pick__head">')) + 6
        ing = ing[:i] + f'<p class="pick__where">{esc(where)}</p>' + ing[i:]
    for label, words in marks: ing = mark(ing, label, words)
    return sheet(ing, tabs=True)
def build_picker():
    S = CAP['pk_step']; gap = round(S['pickTop'] - S['rowButtonTop'])
    r = [cell(P('pw-built', 1366, picker('pk_step', marks=[('Add ingredient after Heavy cream, 36% fat', 'pressed here')]), 'As built · Add ingredient pressed on Heavy cream', f'The picker opens under the table\'s Total, {gap} px below the button, and the page scrolls the row out of view. Its heading reads "Add ingredient" from every row and from the heading.', natural=True, w=576)),
         cell(P('pw-step', 1366, picker('pk_step', WHERE['step'], [('Add ingredient after Heavy cream, 36% fat', 'pressed here')]), 'Drawn · from a row in a step', f'One line under the picker\'s heading, in the picker\'s own small type: "{WHERE["step"]}". The step is named by its number, as the build already says it aloud ("row 2 of 2 in step 1").', natural=True, w=576)),
         cell(P('pw-unplaced', 1366, picker('pk_unplaced', WHERE['unplaced'], [('Add ingredient after Fine sea salt', 'pressed here')]), 'Drawn · from a row in no step', f'"{WHERE["unplaced"]}": the table\'s own words for that group. Pressing another row\'s Add ingredient while the picker is open changes this line.', natural=True, w=576)),
         cell(P('pw-heading', 1366, picker('pk_heading', WHERE['heading']), 'Drawn · from the heading\'s Add ingredient', f'"{WHERE["heading"]}": the heading\'s button adds the row last, in no step, as built. (The button is away while the picker is open, as built.)', natural=True, w=576))]
    return flow('Creation editor · the picker says where the pick lands', 'Phase 12 round two, redraw 3 (decide-p12-picker-says-where: "Sid draws the picker heading naming the landing place"). 1366 only. Built markup (a build of b06add6f), the list cut short; only the one line is drawn. The picker stays where it is built (look-p12-row-controls-r3, point 4). Purple tags are notes.',
                [('', '', r)], LABH=150)

TITLES = {'P12R2_HomeDraft': 'Home below 724 · a Next version draft kept · no refused record act, the version page\'s own sentence · 393 (2026-11-22; round two, for Mark to approve)',
          'P12R2_DeskLine': 'The desk line · new closing words (A, B, C) · nothing kept and work kept · 393 and 723 (2026-11-22; round two, for Mark to decide)',
          'P12R2_PickerWhere': 'Creation editor · the picker names where the pick lands · 1366 (2026-11-22; round two, for Mark to approve)'}
BUILD = (('P12R2_HomeDraft', build_home), ('P12R2_DeskLine', build_desk), ('P12R2_PickerWhere', build_picker))

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
        mine = [k + '.dc.html' for k in sizes]; others = [b for fn, b in B.items() if b.get('page') == PAGE and fn not in mine]
        y0 = max(b['y'] + b['h'] for b in others) + 700; x = min(b['x'] for b in others)      # a second row under the approved boards, wherever Mark has them
        N['p12r2-title'] = {**dict(x=x, y=y0 - 300, maxW=6000), **N.get('p12r2-title', {}), **dict(text='Phase 12 round two: Home with a held draft, the desk line\'s words, the picker says where (redraws after the build, 2026-11-22)', kind='title1', page=PAGE)}
        for key, (w, h) in sizes.items():
            fn = key + '.dc.html'; B[fn] = {**dict(x=x, y=y0, page=PAGE), **B.get(fn, {}), 'w': w, 'h': h, 'title': TITLES[key]}      # a board Mark has moved keeps its place
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + w + 240
        json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
