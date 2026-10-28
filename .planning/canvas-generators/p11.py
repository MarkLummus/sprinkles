import json, re, os, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import p10
from p10 import (esc, cap, shell_main, band_html, headnote_html, before_html, side_html, log_html, page_html, style_region, scales_region, problems_region,
                 scale_card, problem_row, BANDS, STYLE_TEMP, KINDS, SAMPLE_NOTES, SAMPLE_DESC, flow, board)
from cssscope import unique_ids
import places as PL
# Sid, 2026-10-21 (Phase 11 design gate; MAKE-07, MAKE-10, MAKE-12, STRUCT-01 to STRUCT-04; nothing approved yet): the steps, the structure controls, Save and the first version.
#   P11_Steps          the Instructions while creating: a step's lead-in, text, targets and the rows it uses, in what portions; the table regrouped under step heads (MAKE-07)
#   P11_Structure      Add, Remove, Move up and Move down for steps, and for rows within their step (STRUCT-01 to STRUCT-03; decisions 9 and 10)
#   P11_Save           Save in the ceremony, what refuses it, and where it lands: the new recipe's page as the seeded ones read (MAKE-10)
#   P11_FirstVersion   the saved first version's editable state until it has a batch or a child version (STRUCT-04; decision 12)
# 1366 only: Mark does not create recipes on an iPhone. Every panel is sketch 013's creation editor (p10.py: the built shell and Sheet of the 2026-10-17 capture, the app's own stylesheets
# resolved at 1366 with a coarse pointer) with the new parts added as markup and the rules in P11_CSS; every value in P11_CSS reads an existing token. The step grammar is the version
# pen's own open step (Method.jsx StepPenBody, sketch 011 decisions 2 and 5: .method-step__open-fields, the uses line, the checklist, add a purpose / add an aside) kept open, as the
# creation editor keeps every field open (sketch 013: Rename's form kept open, the notes as fields). The table's step heads, portion notes and "Unallocated" group are the build's own
# (IngredientTable.jsx groupPortionsByStep); the word over rows not yet in a step is Mark's (decide-p11-unplaced-rows-word; drawn "Not in a step yet").
# Sid, 2026-10-25 (Mark's answers on look-p11-save and look-p11-steps): P11_Save's after-Save panel draws 'Recipe saved.' as the built page notice, the ink card at the window's foot
# (app.css .page-status as built in 116d259c: decide-page-notice-shape BS fixed at the foot, decide-notice-card-palette ink; .impeccable/proposals/2026-10-23-page-notice-shape.md
# § Mark's check 2026-10-25, 2026-10-25-notice-copy.md), measured on the 4173 preview after Save batch (Olive Oil v1, WebKit and Chromium, 1366 × 1024 coarse: 135 × 50, centred,
# 20 above the foot, padding 12 / 20, 16 on 24, radius 10, --app-shadow-notice); decision 23's placement under the bar beside Import is superseded. And Add step sits on the
# Instructions heading's row (p10.head_row: the Sheet's fold head look), as Add note now sits on Before you start's (Mark: "on the row next to the heading, similar to how we place
# the hide/show link"); the app follows in Phase 11. P11_Structure and P11_FirstVersion regenerate with the row too but are not republished until Mark approves look-p11-steps-r2.
# Sid, 2026-10-25, later (Mark's answers on look-p11-steps-r2 and his two todos of 2026-10-25):
#   - Add ingredient sits on the Ingredients heading's row like Add step (approved todo): p10.ingredients_head on every editor table; the reading page after Save keeps the plain heading.
#   - The box around the open step (the version pen's .method-step__open-fields, a hairline outline the build drew toward sketch 011 decision 2's one pen-blue block for the step being
#     edited, there to mark the one open step among closed ones) has no job in the creation editor, where every step is open: P11_Steps draws the open step without it (decide-open-step-box,
#     drop recommended) and the first field's 6 px margin goes with it, so the number and the lead-in field share one top; P11_Structure, P11_FirstVersion and P11_Save keep the box until Mark answers.
#   - Add step on each step's own acts row as well, after Move down, adding a step right after that one (decide-add-step-per-step, A recommended; Mark: "as I am adding steps, I just
#     click Add step after finishing the current step"): drawn on P11_Steps only until Mark answers; the heading's Add step stays and appends at the end.
#   - Preview step (Mark's todo: "some of the actions may not be understandable without seeing the preview"): a control at the end of the targets line, after Add target, that shows
#     the step under its fields as the Sheet will print it (the reading step: number, bold lead-in, text, target chips, purpose) and reads Hide preview while open. Proposed, not approved.
# Sid, 2026-10-25, latest (Mark's answers on the three rows, sketch 013 decisions 32 to 34): the three proposals are decided, so every board draws them: no box and no first-field margin
#   (decision 32, drop; the version pen keeps its own box, app.css .method-step__open-fields, which is not in this decision), Add step on the heading's row AND on each step's row
#   (decision 33, Mark: "both: Add step on the heading's row (adds at the beginning) and on each step's row (adds right after that step)"; the heading's control adds at the beginning,
#   not at the end as proposed), Preview step after Add target, Hide preview while open (decision 34, approved as drawn). step_html's defaults are that state; PROPOSED is gone.
# Sid, 2026-10-26 (Mark: "redraw it now"): P11_Structure's "After remove on step 2" panel follows roadmap decision 24 (decide-p11-step-removal-split-portion, grams-fold-back, Mark 2026-10-25):
#   the removed step's 200 g of Whole milk fold back into the row's remaining line, so it reads 600 g, 58.0%, no portion line, and the Balance stands. The panel had been drawn on
#   2026-10-21 with the recommended split (400 g, "the Balance has moved") and never redrawn for the answer (sketch 014 README, "For the plan" 1). Only P11_Structure is republished.
# Sid, 2026-10-26, later (Mark's answer on decide-p11-place-unplaced-row: A, row-add-to-step): Add to step is decided, so every row under "Not in a step yet" ends its acts line with it
#   wherever a step exists (grouped() draws it by default: P11_Steps "A step just added", P11_Structure "After remove on step 2" and the fifth panel, which keeps the pressed state and is
#   no longer proposed). A placed row has no Add to step; with no step the table is flat (Phase 10's) and the word has nothing to offer. P11_Steps and P11_Structure are republished.
# Sid, 2026-10-26, later (Mark, in chat: the on-screen Sheet's Instructions steps take the printed method's treatment, sketch 010 D18, built in Phase 11 with its step work; sketch 014
#   decision 2): every reading step on these boards (the Preview step on P11_Steps pE1, the after-Save page on P11_Save vC1, P11_FirstVersion fA1 and fC1) draws its targets as the
#   tag row (caps label, bold underlined value, no box), its purpose as "why", an em dash and the sentence, and its aside as the callout behind the ink rule, all upright: the reading
#   classes keep their names (.method-step__targets, .target-chip, .method-step__purpose, .method-step__aside) and read print.css's .mp-* values through the same tokens (reading_body
#   below, the rules in P11_CSS). pE1's step 1 gains an aside on that panel only, so the preview shows all three. The open step's fields are unchanged. P11_Structure draws no reading
#   step: it regenerates with the rules in its CSS and nothing visible changes.
# Sid, 2026-10-26, latest (Mark's answer on decide-p11-row-order-across-steps, roadmap decision 9 redecided: each step orders its own rows, the reading table draws a step's rows in that
#   step's uses order, and a move within one step leaves the other step's order alone; then "redraw" on decide-p11-sketch-014-boards-vs-row-order): two panels disagreed with it.
#   P11_Steps pD1 ("A row in two steps") drew no Whole milk line under Step 2 although step 2's uses line named it last: the table now draws it as Step 2's last row, 200 g, with the
#   build's portion line "200 g of 600 g · 58.0% in all", from the same step spec as the method. P11_Structure qD1 ("After Move down on Whole milk") drew the table in the moved
#   order but step 1's uses line in the order from before the move: the uses line now reads the moved order (Skim milk powder, Whole milk, Sucrose); steps 2 and 3 are untouched.
#   Both panels are drawn from one spec per step, so the table and the uses line cannot part again. Only P11_Steps and P11_Structure are republished.
# Sid, 2026-10-27 (Mark's answers of 2026-10-27 and the Phase 11 audit, 11-UI-REVIEW.md "Board matters for Sid"): the build's settled decisions drawn back so the boards stay the authority.
#   - decide-p11-struck-target-size, value-size: in Show changes a changed target's struck old value takes the new value's size (14 px, weight 400, struck; the table's struck figure
#     already matches its live figure). Drawn on P11_FirstVersion's new panel fD1: Version 2 of Vanilla with Show changes pressed, step 1's target "temp" reading 80 °C struck then 85 °C.
#     The app follows with one /gsd-fast rule (.notebook .method-step__targets--tags .struck-value { font-size: var(--sheet-type-section) }).
#   - decide-p11-default-version-name-repeats, build-once: the identity prints the label once when it equals the ordinal's words, so "Version 1 · Latest" stands as drawn. No redraw.
#   - bug-p11-target-required-under-wrong-field, fix: a CSS fix in the build; no board draws the one-sided chip and none is added (the refused panel keeps the two Save fields).
#   - the audit's board matters: the target chip's remove after its value (D-22; target_chip); Resume editing in Edit's place on the version page and as the Notebook row's outline
#     control at 1366 (D-04, D-05; P11_FirstVersion fE1 and fF1); Print sheet after Edit on the saved page (D-05); a lone version's History as the one line "Only this version so far"
#     (03.5-18, RecipeHistory.jsx); the split line's "600.0 g" (formatPortionLine's one-decimal total); fC1's Go to batch status "Awaiting tasting" (STANDING_WORDS) under a churned batch.
# Sid, 2026-10-28 (bug-p11-link-case-mixed, Mark: "Fix it: Sid rules on one case, then the labels follow"): one case for every inline text control (.text-control), sentence case,
#   as the Sheet's other controls read (Add step, Move up, Print sheet, Cancel; the house rule: plain words, short sentence-case labels). The lower-case words these boards drew inside a
#   step and a row (remove, done, change the ingredients, add a purpose, add an aside) came from the version pen's own open step (sketch 011 decisions 2 and 5), where they read as
#   words of the uses sentence; beside the sentence-case controls the creation editor added, Mark read the mix as a defect. Drawn: Remove, Done, Change the ingredients, Add a purpose,
#   Add an aside, on every board that draws a step or a row (all four); the aria-labels are unchanged. The app follows by one /gsd-fast after look-p11-link-case (CreationSteps.jsx,
#   IngredientTable.jsx, Method.jsx, Authored.jsx, CreationSetup.jsx); sketch 013's boards redraw their remove the same day (p10.py).
#   python3 p11.py measure <out dir> ; node p11-measure.mjs <out dir>/measure.html ; python3 p11.py <canvas.json read from the artifact root> <out dir> [P11_Save,P11_Steps]
MEAS = json.load(open(HERE + '/p11-measure.json')) if os.path.exists(HERE + '/p11-measure.json') else {}
p10.MEAS = MEAS
BYS = json.load(open(HERE + '/bys-capture.json'))
EMPTY = json.load(open(HERE + '/empty-capture.json'))     # base2_1366: a saved version with no batch (Standard Base v2), the reading band, History and the Batch margin as built

P11_CSS = '''
/* ---- the creation editor's steps: the pen's open step kept open; Required under an empty lead-in or instruction as under an empty scale field ---- */
.mk-step .method-step__field .field-requirement{margin-top:0}
.mk-step .prose-field--lead-in{font-weight:700}
.mk-step .method-step__targets{align-items:center}
.mk-step .method-step__targets .text-control{margin-left:var(--gap-xs)}
/* no box (decide-open-step-box, drop; decision 32): the lead-in is the body's first line, so it takes the number's top as the printed lead-in does (.method-step__lead has no margin) */
.mk-step .method-step__body > .method-step__field:first-child{margin-top:0}
/* Preview step (look-p11-preview-step approved; decision 34): the step as the Sheet prints it, under its fields, set off by the Sheet's hairline at the left; its cue in the checklist's legend face */
.mk-preview{margin:var(--gap-s) 0 0;padding:0 0 0 var(--gap-s);border-left:var(--rule-graduation) solid var(--sheet-ink)}
.mk-preview__cue{margin:0 0 var(--gap-xs);font-family:var(--face-grotesk);font-size:var(--sheet-type-label);font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
.mk-preview .method-step{gap:var(--gap-s)}
/* the Sheet's steps on screen in the printed method's treatment (Mark, 2026-10-26; sketch 010 D18, CONTRACT sections 5 and 6; decide-method-why-aside-italic: upright; sketch 014 decision 2):
   the tag row, the why line and the aside callout at the Sheet's screen sizes, print.css's .mp-* values on the reading classes through the same tokens. Scoped to a reading step
   (.method-step without .mk-step: the preview's and the reading page's) so the open step's chips of fields and the table's estimate flag (.target-chip.ingredient-table__flag) keep their box */
.method-step:not(.mk-step) .method-step__targets{column-gap:var(--gap-l);row-gap:var(--gap-xs);align-items:baseline}
.method-step:not(.mk-step) .target-chip{border:0;padding:0;align-items:baseline;gap:var(--gap-xs)}
.method-step:not(.mk-step) .target-chip__label{font-size:var(--sheet-type-label);font-weight:var(--sheet-print-weight-cue);text-transform:uppercase;letter-spacing:var(--sheet-print-tracking-caps)}
.method-step:not(.mk-step) .target-chip__value{font-size:var(--sheet-type-section);font-weight:var(--sheet-print-weight-title);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--sheet-print-tag-underline-offset)}
.method-step:not(.mk-step) .method-step__purpose,.method-step:not(.mk-step) .method-step__aside{font-style:normal;line-height:var(--sheet-leading-helper)}
.method-step__purpose-label{font-family:var(--face-grotesk);font-size:var(--sheet-type-label);font-weight:var(--sheet-print-weight-cue);text-transform:uppercase;letter-spacing:var(--sheet-print-tracking-caps)}
.method-step:not(.mk-step) .method-step__aside{border-left:var(--rule-tick) solid var(--sheet-ink);padding-left:var(--gap-s);margin-top:var(--gap-s)}
/* Show changes on a later version (decide-p11-struck-target-size, value-size, 2026-10-27): a changed target reads its label once, the old value struck at the new value's size, then the new
   value bold and underlined; the strike itself is app.css .struck-value (--rule-strike, --gap-strike) */
.method-step:not(.mk-step) .target-chip .struck-value{font-size:var(--sheet-type-section)}
/* a control that cannot act now (the first step's Move up, the last row's Move down): the picker's Added look, a word in secondary with no underline */
.mk-off{color:var(--app-text-secondary);text-decoration:none;cursor:default}
/* the table's row acts: remove, then the moves, on the name cell's own line */
.mk-row-acts{white-space:nowrap}
/* the after-Save page: the acts row gains Edit beside Next version (decide-p11-first-version-editor, A); nothing else is new */
/* the page notice's anchor at the window's foot: the app fixes it to the viewport (app.css .page-status-anchor); on a board the window is the panel, so the anchor is absolute in it (window_foot below) */
.page-status-anchor.mk-win-foot{position:absolute;inset-block:auto 0;inset-inline:0;z-index:var(--app-z-notice)}
'''
p10.P10_CSS = p10.P10_CSS + P11_CSS

# ---------------------------------------------------------------------------------------------------------------------------------
# the sample recipe (sketch 013's "phil" state): five rows, their grams and shares as the build computed them
ROWS = [('milk', 'Whole milk, 3.5% fat', 600, 58.0), ('cream', 'Heavy cream, 36% fat', 250, 24.2), ('smp', 'Skim milk powder', 30, 2.9), ('suc', 'Sucrose', 150, 14.5), ('van', 'Vanilla extract', 5, 0.5)]
TOTAL = 1035.0
ROW_HTML = {}
def _rows_from_capture():
    h = cap('phil', 1366, 'ingredients')
    for key, name, g, sh in ROWS:
        m = re.search(r'<tr aria-label="%s, [^"]*">.*?</tr>' % re.escape(name), h, re.S); assert m, name
        ROW_HTML[key] = m.group(0)
    i = h.index('<tfoot>'); return h[:h.index('<tbody>')], h[i:]
TABLE_HEAD, TABLE_FOOT = _rows_from_capture()
TABLE_HEAD = TABLE_HEAD.replace('<table class="ingredient-table is-developing">', '<table class="ingredient-table is-developing">')

DIS = ' aria-disabled="true"'
def pct(g): return '%.1f%%' % (g / TOTAL * 100)
def row(key, grams=None, note=None, moves=None, focus=False, place=None):
    """One table row from the capture: its grams, a portion note, and the row acts (remove · Move up · Move down; moves=(up_on, down_on)).
    place (decide-p11-place-unplaced-row, A, 2026-10-26; only a row under "Not in a step yet"): 'closed' adds Add to step as the acts' last word; ('open', [(n, lead), ...]) draws the
    line as the chooser it becomes when pressed: Cancel first, then every step by number and lead-in (the number alone while a step has no lead-in yet); choosing one ticks the row in
    that step's uses and the row moves under its head as its last row."""
    h = ROW_HTML[key]; name = dict((k, n) for k, n, g, s in ROWS)[key]; full = dict((k, g) for k, n, g, s in ROWS)[key]
    g = full if grams is None else grams
    h = re.sub(r' value="[^"]*"', ' value="%s"' % ('' if g == '' else ('%g' % g)), h, 1)
    if focus: h = h.replace('class="ink-field"', 'class="ink-field mk-focus"', 1)
    h = re.sub(r'<td class="ingredient-table__col-numeric">[^<]*</td>', '<td class="ingredient-table__col-numeric">%s</td>' % (pct(0 if g == '' else g)), h, 1)
    acts = '<button type="button" class="text-control" tabindex="0" aria-label="remove %s">Remove</button>' % esc(name)      # sentence case since 2026-10-28 (bug-p11-link-case-mixed)
    if moves is not None:
        up, down = moves
        acts += ''.join(f'<span aria-hidden="true"> · </span><button type="button" class="text-control{"" if on else " mk-off"}" tabindex="0" aria-label="Move {esc(name)} {w}"{DIS if not on else ""}>Move {w}</button>' for w, on in (('up', up), ('down', down)))
        if place == 'closed':
            acts += f'<span aria-hidden="true"> · </span><button type="button" class="text-control" tabindex="0" aria-label="Add {esc(name)} to a step">Add to step</button>'
        elif place and place[0] == 'open':
            acts = f'<button type="button" class="text-control" tabindex="0" aria-label="{esc(name)}, cancel">Cancel</button>' + ''.join(f'<span aria-hidden="true"> · </span><button type="button" class="text-control" tabindex="0" aria-label="Add {esc(name)} to step {n}">Step {n}{", " + esc(lead) if lead else ""}</button>' for n, lead in place[1])
        acts = '<span class="mk-row-acts">' + acts + '</span>'
    h = re.sub(r'<button type="button" class="text-control" tabindex="0">remove</button>', acts, h, 1)
    if note: h = h.replace('</td><td class="ingredient-table__col-numeric">', f'<span class="ingredient-table__portion-note">{esc(note)}</span></td><td class="ingredient-table__col-numeric">', 1)
    return h
def step_head(n, lead): return f'<tr class="ingredient-table__step-head"><td colspan="3">Step {n}<span class="ingredient-table__step-head-lead">{esc(lead)}</span></td></tr>'
def group_head(word): return f'<tr class="ingredient-table__step-head"><td colspan="3">{esc(word)}</td></tr>'
UNPLACED = 'Not in a step yet'      # Mark's word: decide-p11-unplaced-rows-word
def table_html(groups):
    """groups: list of (head html or None, [row html...]). Add ingredient on the Ingredients heading's row (Mark, 2026-10-25); the reading page keeps the plain heading."""
    body = ''.join((hd or '') + ''.join(rs) for hd, rs in groups)
    return p10.ingredients_head(TABLE_HEAD) + '<tbody>' + body + '</tbody>' + TABLE_FOOT
def moves_for(i, n): return (i > 0, i < n - 1)
def flat_rows(keys, with_moves=True): return [row(k, moves=moves_for(i, len(keys)) if with_moves else None) for i, k in enumerate(keys)]

# ---- the steps: the pen's open step, kept open
def _req(): return '<span class="field-requirement" aria-hidden="true">Required</span>'
def target_chip(n, label, value, i=1):
    """A target's two fields and, after the value, its remove (D-22, 2026-10-27; the build's chip grid in notebook.css stands Required under the empty field)."""
    return (f'<span class="target-chip"><input type="text" class="ink-field target-chip__label-field" value="{esc(label)}" aria-label="Step {n}, target label">'
            f'<input type="text" class="ink-field target-chip__value-field" value="{esc(value)}" aria-label="Step {n}, target value">'
            f'<button type="button" class="text-control" tabindex="0" aria-label="Step {n}, remove target {i}">Remove</button></span>')
NAMES = dict((k, n) for k, n, g, s in ROWS)
def reading_body(n, lead, text, targets=(), purpose=None, aside=None):
    """A reading step's number and body as the Sheet shows it on screen since 2026-10-26 (sketch 014 decision 2): the printed method's grammar (PrintSheetPages.jsx .mp-tags, .mp-why,
    .mp-aside) on the reading classes: the tag row (label span, value span), the purpose as the caps word "why", an em dash and the sentence, the aside as the callout. One source for
    the Preview step and the reading page."""
    # a target given as (label, old, new) is a changed one under Show changes: the old value struck before the new (StepReading.jsx StepTargets; decide-p11-struck-target-size)
    struck = lambda t: ('<span class="struck-value">%s</span>' % esc(t[1])) if len(t) == 3 else ''
    tags = ''.join(f'<span class="target-chip"><span class="target-chip__label">{esc(t[0])}</span>{struck(t)}<span class="target-chip__value">{esc(t[-1])}</span></span>' for t in targets)
    t = f'<p class="method-step__targets">{tags}</p>' if tags else ''
    pu = f'<p class="method-step__purpose"><span class="method-step__purpose-label">why</span> — {esc(purpose)}</p>' if purpose else ''
    a = f'<p class="method-step__aside">{esc(aside)}</p>' if aside else ''
    return f'<span class="method-step__n" aria-hidden="true">{n}</span><div class="method-step__body"><p class="method-step__lead"><span><b>{esc(lead)}.</b> {esc(text)}</span></p>{t}{pu}{a}</div>'
def preview_html(n, lead, text, targets, purpose, aside):
    """The step as the Sheet shows it (reading_body), under the open step's fields."""
    return f'<div class="mk-preview" role="group" aria-label="Step {n}, preview"><p class="mk-preview__cue">Preview</p><ol class="method-steps"><li class="method-step">{reading_body(n, lead, text, targets, purpose, aside)}</li></ol></div>'
def step_html(n, lead='', text='', targets=(), uses=(), purpose=None, aside=None, uses_open=False, required=False, moves=(True, True), with_moves=True, box=False, add_after=True, preview='closed'):
    """The defaults are the decided state (sketch 013 decisions 32 to 34): no box (the version pen's hairline outline, decide-open-step-box, drop), Add step on the step's own acts row
    adding right after it (decide-add-step-per-step, both), and Preview step after Add target: 'closed' (the control) or 'open' (Hide preview, the printed step under the fields); None draws no control."""
    req = required and not lead
    fields = (f'<label class="method-step__field"><input type="text" class="prose-field prose-field--lead-in" value="{esc(lead)}" aria-label="Step {n}, lead-in">{_req() if req else ""}</label>'
              f'<label class="method-step__field"><textarea class="prose-field" rows="2" aria-label="Step {n}, instruction">{esc(text)}</textarea>{_req() if required and not text else ""}</label>')
    chips = ''.join(target_chip(n, l, v, i + 1) for i, (l, v) in enumerate(targets))
    pv = ''
    if preview: pv = f'<button type="button" class="text-control" tabindex="0" aria-label="Step {n}, {"hide the preview" if preview == "open" else "preview the step"}">{"Hide preview" if preview == "open" else "Preview step"}</button>'
    fields += f'<p class="method-step__targets">{chips}<button type="button" class="text-control" tabindex="0" aria-label="Step {n}, add a target">Add target</button>{pv}</p>'
    body = f'<div class="method-step__open-fields">{fields}</div>' if box else fields
    if purpose is not None: body += f'<label class="method-step__field"><textarea class="prose-field" rows="2" aria-label="Step {n}, purpose">{esc(purpose)}</textarea></label>'
    if aside is not None: body += f'<label class="method-step__field"><textarea class="prose-field" rows="2" aria-label="Step {n}, aside">{esc(aside)}</textarea></label>'
    if preview == 'open': body += preview_html(n, lead, text, targets, purpose, aside)      # under every content field, before the uses line
    names = [NAMES[k] for k in uses]
    line = ('uses ' + ', '.join(names)) if names else 'uses nothing yet'
    # the inline controls read sentence case since 2026-10-28 (bug-p11-link-case-mixed): Done, Change the ingredients, Add a purpose, Add an aside; the aria-labels are unchanged
    line += f' <button type="button" class="text-control" tabindex="0" aria-label="Step {n}, {"done" if uses_open else "change the ingredients"}">{"Done" if uses_open else "Change the ingredients"}</button>'
    if purpose is None: line += f'<span aria-hidden="true">·</span><button type="button" class="text-control" tabindex="0" aria-label="Step {n}, add a purpose">Add a purpose</button>'
    if aside is None: line += f'<span aria-hidden="true">·</span><button type="button" class="text-control" tabindex="0" aria-label="Step {n}, add an aside">Add an aside</button>'
    body += f'<p class="method-step__uses-line">{line}</p>'
    if uses_open:
        items = ''.join(f'<label class="method-step__uses-item"><input type="checkbox"{" checked" if k in uses else ""} tabindex="0"><span>{esc(NAMES[k])}</span></label>' for k, _, _, _ in ROWS)
        body += f'<fieldset class="method-step__uses" aria-label="Step {n}, uses"><legend>Uses</legend>{items}</fieldset>'
    acts = f'<button type="button" class="text-control" tabindex="0" aria-label="Step {n}, remove">Remove</button>'
    if with_moves:
        up, down = moves
        acts += ''.join(f'<span aria-hidden="true">·</span><button type="button" class="text-control{"" if on else " mk-off"}" tabindex="0" aria-label="Step {n}, move {w}"{DIS if not on else ""}>Move {w}</button>' for w, on in (('up', up), ('down', down)))
    if add_after: acts += f'<span aria-hidden="true">·</span><button type="button" class="text-control" tabindex="0" aria-label="Step {n}, add a step after it">Add step</button>'      # decision 33: adds right after this step
    body += f'<p class="method-step__acts">{acts}</p>'
    return f'<li class="method-step mk-step"><span class="method-step__n" aria-hidden="true">{n}</span><div class="method-step__body">{body}</div></li>'
def method_html(steps):
    lst = f'<ol class="method-steps">{"".join(steps)}</ol>' if steps else ''
    # Add step on the Instructions heading's row (Mark, 2026-10-25, look-p11-steps), as Add note on Before you start's: p10.head_row; it adds at the beginning of the list (decision 33)
    return f'<section class="method-region" aria-label="Instructions">{p10.head_row("Instructions", "Add step")}{lst}</section>'

S1 = dict(lead='Warm the milk', text='Whisk the milk powder and sugar into the milk. Heat, stirring, then take it off.', targets=(('temp', '85 °C'),), uses=('milk', 'smp', 'suc'), purpose='The powder dissolves without lumps when the milk is warm.')
S2 = dict(lead='Finish cold', text='Stir in the cream and vanilla. Chill overnight.', uses=('cream', 'van'))
PE1_ASIDE = 'Whisk the powder in slowly or it clumps.'      # step 1's aside on the Preview panel only, so the preview shows the callout
S3 = dict(lead='Churn', text='Churn, then harden in the freezer.', uses=())
# one spec per step feeds both the table and the uses line (decide-p11-row-order-across-steps, 2026-10-26: each step orders its own rows, the table in that step's uses order)
S2_MILK = dict(S2, uses=('cream', 'van', 'milk'))        # pD1: Whole milk ticked in step 2 as well, named last, so its second line is Step 2's last row
S1_MOVED = dict(S1, uses=('smp', 'milk', 'suc'))         # qD1: after Move down on Whole milk within step 1; the uses line reads the moved order
def steps_html(specs, with_moves=True, over=None, **common):
    n = len(specs); out = []; over = over or {}
    for i, s in enumerate(specs):
        kw = dict(common); kw.update(s); kw.update(over.get(i, {})); out.append(step_html(i + 1, moves=moves_for(i, n), with_moves=with_moves, **kw))
    return out

# the table as the steps allocate it
def grouped(steps_specs, extra_groups=(), split=None, with_moves=True, place=None):
    """Rows under their step heads (the build's groupPortionsByStep); rows no step uses under the unplaced head at the foot. split: {key: [(step_index, grams), ...]}.
    place: {key: 'open'} for a row under "Not in a step yet" drawn with its chooser pressed; every other unplaced row ends in Add to step once a step exists (decision 014 1)."""
    used = set(); groups = []
    for i, s in enumerate(steps_specs):
        keys = list(s['uses']); rs = []
        for j, k in enumerate(keys):
            used.add(k); mv = moves_for(j, len(keys)) if with_moves else None
            if split and k in split:
                g = dict(split[k]).get(i); full = dict((kk, gg) for kk, _, gg, _ in ROWS)[k]
                # one line per step; a split row with one line left reads like a one-line row, with no portion line (sketch 011 decision 56)
                note = f'{"%g" % g if g != "" else "0"} g of {full:.1f} g · {pct(full)} in all' if len(split[k]) > 1 else None      # the row's total through formatGrams, one decimal (2026-10-27)
                rs.append(row(k, grams=g, note=note, moves=mv, focus=(g == '')))
            else: rs.append(row(k, moves=mv))
        if rs: groups.append((step_head(i + 1, s['lead']), rs))      # the build prints no head for a step that uses nothing (groupPortionsByStep)
    rest = [k for k, _, _, _ in ROWS if k not in used]
    steps = [(i + 1, s['lead']) for i, s in enumerate(steps_specs)]
    pl = lambda k: (('open', steps) if (place or {}).get(k) == 'open' else ('closed' if steps else None))
    if rest: groups.append((group_head(UNPLACED), [row(k, moves=moves_for(j, len(rest)) if with_moves else None, place=pl(k)) for j, k in enumerate(rest)]))
    return groups

def sheet(table, method, notes=SAMPLE_NOTES, desc=SAMPLE_DESC, balance=True):
    side = side_html('phil', 1366) if balance else ''
    return '<article class="recipe-page">' + headnote_html('Vanilla', desc) + before_html(notes) + table + side + method + '</article>'
def sheet_only(vid, sh):
    return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet">{sh}</div><aside class="notebook-log"></aside></div></div>', vid)
def log_regions(): return log_html(style_region('Philadelphia', BANDS['Philadelphia'], STYLE_TEMP['Philadelphia']), scales_region([scale_card(1, 'Creaminess', 'thin', 'rich', KINDS[0])]), problems_region([problem_row(1, 'Bitter')]))

# ---- the band with Save (MAKE-10)
def band_save(name='Vanilla', desc=SAMPLE_DESC, vname='Version 1', vid='b', name_error=None, caption='New recipe · draft', form_label='New recipe', version_required=True):
    h = band_html(name, desc, vname=vname, vid=vid, name_error=name_error)
    h = h.replace('<button type="button" class="notebook-action--outline" tabindex="0">Cancel</button></div>',
                  '<button type="button" class="notebook-action--outline" tabindex="0">Cancel</button><button type="button" class="notebook-action" tabindex="0">Save</button></div>', 1)
    h = h.replace('<span class="notebook-caption">New recipe · draft</span>', f'<span class="notebook-caption">{esc(caption)}</span>', 1).replace('aria-label="New recipe"', f'aria-label="{esc(form_label)}"', 1)
    if not version_required: h = h.replace('<span class="field-requirement" aria-hidden="true">Required</span>', '', 1)
    return h

def balanced(h, i):
    """The element starting at h[i] with its matching close tag (divs only)."""
    depth = 0
    for m in re.finditer(r'<div\b|</div>', h[i:]):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0: return h[i:i + m.end()]
    raise ValueError('unbalanced')
# ---- the page after Save: the built reading page of a version with no batch (bys-capture base2_1366), re-worded for the new recipe
PRINT_LINK = '<a class="notebook-link" href="/notebook/vanilla/vanilla-v1/print" tabindex="0">Print sheet</a>'      # D-05: the underlined text control that ends the acts row (VersionRow.jsx)
def after_save_page(edit_act=True, with_batch=False, notice=None, editing=False, later=None):
    """The saved page. editing: an edit draft is kept, so Edit's place reads Resume editing and Next version is gone (D-04). later: a changed target (label, old, new) draws the page as
    Version 2 of Vanilla, from Version 1, with Show changes pressed (Hide changes in the acts row): the one panel that shows a struck target value in the tag row."""
    h = BYS['base2_1366']['html'] if isinstance(BYS['base2_1366'], dict) else BYS['base2_1366']
    h = PL.clean(h)
    nb = balanced(h, h.index('<div class="notebook">'))[:-len('</div>')]      # the page root; the shell around it is p10's chrome_1366
    # the recipe column
    nb = re.sub(r'<h1 class="notebook-recipe__name">[^<]*</h1>', '<h1 class="notebook-recipe__name">Vanilla</h1>', nb, 1)
    nb = nb.replace('</div><button type="button" class="notebook-link" tabindex="0">Rename</button>', f'</div><p class="notebook-recipe__description">{esc(SAMPLE_DESC)}</p><button type="button" class="notebook-link" tabindex="0">Rename</button>', 1)
    # the version column: a root version has no From version; Why reads as built when none is recorded. The label "Version 1" equals the ordinal's words, so the identity prints it
    # once (decide-p11-default-version-name-repeats, build-once, 2026-10-27)
    vn = 'Version 2' if later else 'Version 1'
    nb = re.sub(r'<h2 class="notebook-version__identity">.*?</h2>', f'<h2 class="notebook-version__identity">{vn}<span class="notebook-version__latest"> · Latest</span></h2>', nb, 1, flags=re.S)
    nb = re.sub(r'<dd class="versions__lineage version-row__written">[^<]*</dd>', '<dd class="versions__lineage version-row__written">%s</dd>' % ('23 Oct 2026' if later else '21 Oct 2026'), nb, 1)
    if later:
        nb = re.sub(r'<dt class="versions__lineage-label">From version</dt><dd class="versions__lineage">.*?</dd>',
                    '<dt class="versions__lineage-label">From version</dt><dd class="versions__lineage"><span class="version-row__parent-name"><a tabindex="0" href="/notebook/vanilla/vanilla-v1">Version 1</a></span></dd>', nb, 1, flags=re.S)
    else:
        nb = re.sub(r'<dt class="versions__lineage-label">From version</dt><dd class="versions__lineage">.*?</dd>', '', nb, 1, flags=re.S)
    if editing: acts = '<button type="button" class="notebook-link" tabindex="0">Resume editing</button>'
    elif later: acts = '<button type="button" class="notebook-action" tabindex="0">Next version</button><button type="button" class="notebook-link" tabindex="0">Hide changes</button>'
    else: acts = '<button type="button" class="notebook-action" tabindex="0">Next version</button>' + ('<button type="button" class="notebook-link" tabindex="0">Edit</button>' if edit_act else '')
    nb = re.sub(r'<div class="notebook-version__acts">.*?</div>', '<div class="notebook-version__acts">' + acts + PRINT_LINK + '</div>', nb, 1, flags=re.S)
    if later:
        # History: two versions, Version 2 in view
        nb = re.sub(r'<ol class="notebook-history__nodes">.*?</ol>',
                    '<ol class="notebook-history__nodes"><li class="notebook-history__node"><a class="notebook-history__node-inner" href="/notebook/vanilla/vanilla-v1" tabindex="0"><span class="notebook-history__date">21 Oct</span><span aria-hidden="true" class="notebook-history__mark"></span><span class="notebook-history__name">Version 1</span><span class="notebook-history__state">not churned</span></a></li>'
                    '<li class="notebook-history__node" data-in-view="true"><span class="notebook-history__node-inner" aria-current="page"><span class="notebook-history__date">23 Oct</span><span aria-hidden="true" class="notebook-history__mark notebook-history__mark--in-view"></span><span class="notebook-history__name notebook-history__name--in-view">Version 2</span><span class="notebook-history__state">not yet churned · Latest</span></span></li></ol>', nb, 1, flags=re.S)
    else:
        # History: a lone version is the one line "Only this version so far", no fold, no rail (RecipeHistory.jsx, 03.5-18; drawn 2026-10-27)
        nb, k = re.subn(r'<section class="notebook-history".*?</section>', '<section class="notebook-history" aria-label="History"><span class="notebook-caption">History</span><p class="notebook-history__only">Only this version so far</p></section>', nb, 1, flags=re.S)
        assert k == 1
    # the Sheet: the new recipe read as the seeded ones read
    i = nb.index('<article'); j = nb.index('</article>') + len('</article>')
    nb = nb[:i] + reading_sheet(later) + nb[j:]
    if with_batch:
        # the Batch margin of a version with one untasted batch, as built (empty-capture.json closed_1366, Mexican Chocolate v3), in place of the no-batch margin
        other = EMPTY['closed_1366']['html'] if isinstance(EMPTY['closed_1366'], dict) else EMPTY['closed_1366']
        aside = re.search(r'<aside class="notebook-log".*?</aside>', other, re.S).group(0).replace('churned date unknown', 'churned 22 Oct 2026').replace('<dd>13 Jan 2026</dd>', '<dd>22 Oct 2026</dd>')
        nb = re.sub(r'<aside class="notebook-log".*?</aside>', lambda m: aside, nb, 1, flags=re.S)
        # the Go to batch row (hidden from 1366 up by notebook.css) reads the batch's standing, STANDING_WORDS: a churned, untasted batch is "Awaiting tasting" (the fC1 slip, 2026-10-27)
        nb, k = re.subn(r'Go to batch, Not yet churned"(.*?)<span class="notebook-jump__status">Not yet churned</span>', r'Go to batch, Awaiting tasting"\1<span class="notebook-jump__status">Awaiting tasting</span>', nb, 1, flags=re.S)
        assert k == 1
    assert notice is None      # 2026-10-25: the notice is the built card at the window's foot, drawn by window_foot, not in the page
    return nb + '</div>'
def notice_html(text): return f'<div class="page-status-anchor mk-win-foot"><p class="page-status" role="status" aria-live="polite">{esc(text)}</p></div>'
def window_foot(parts, pid, extra):
    """Puts extra (the notice's anchor) directly in the panel's window, beside the page, so its absolute box is the window's: the card stands 20 above the window's foot as the app's does above the viewport's."""
    for i, (h, c) in enumerate(parts):
        if f' {pid}" style=' in h:
            assert h.endswith('</div></div>'); parts[i] = (h[:-len('</div>')] + extra + '</div>', c); return
    raise KeyError(pid)
def reading_row(key):
    h = ROW_HTML[key]
    h = re.sub(r'<input inputmode="decimal" class="ink-field" aria-label="[^"]*" type="text" value="([^"]*)">', r'\1', h, 1)
    h = re.sub(r'<span class="ingredient-table__remove-gap"> </span><button[^>]*>remove</button>', '', h, 1)
    return h
def reading_step(n, s):
    return f'<li id="method-step-{n}" class="method-step">{reading_body(n, s["lead"], s["text"], s.get("targets", ()), s.get("purpose"), s.get("aside"))}</li>'
def reading_sheet(later=None):
    notes = '<ul class="authored__notes">' + ''.join(f'<li>{esc(t)}</li>' for t in SAMPLE_NOTES) + '</ul>'
    groups = ''
    for i, s in enumerate((S1, S2, S3)):
        groups += step_head(i + 1, s['lead']) + ''.join(reading_row(k) for k in s['uses'])
    table = TABLE_HEAD.replace(' is-developing', '') + '<tbody>' + groups + '</tbody>' + TABLE_FOOT
    steps = (dict(S1, targets=(later,)), S2, S3) if later else (S1, S2, S3)      # later: step 1's target as changed (label, old, new) under Show changes
    method = '<section class="method-region" aria-label="Instructions"><h2 class="region-name">Instructions</h2><ol class="method-steps">' + ''.join(reading_step(i + 1, s) for i, s in enumerate(steps)) + '</ol></section>'
    return ('<article class="recipe-page">' + headnote_html('Vanilla', SAMPLE_DESC) + f'<section class="before-region" aria-label="Before you start"><h2 class="region-name">Before you start</h2>{notes}</section>'
            + table + side_html('phil', 1366) + method + '</article>')

STAMP = ' (drawn 2026-10-21; for approval)'
STAMP2 = ' (drawn 2026-10-21; redrawn 2026-10-25; for approval)'
STAMP3 = ' (drawn 2026-10-21; redrawn 2026-10-25: Add ingredient on the Ingredients heading\'s row; proposed: the open step without the version pen\'s box, Add step on each step\'s row, Preview step; look-p11-steps-r3)'
STAMP4 = ' (drawn 2026-10-21; redrawn 2026-10-25: Add step and Add ingredient on their heading\'s row; look-p11-steps-r3)'
STAMP5 = ' (drawn 2026-10-21; redrawn 2026-10-25: Add step and Add ingredient on their heading\'s row, then the open step without the pen\'s box, Add step on each step\'s row, Preview step; decisions 32 to 34)'
STAMP6 = STAMP5[:-1] + '; redrawn 2026-10-26: after remove on step 2 the grams fold back, roadmap decision 24)'
STAMP7 = STAMP6[:-1] + '; a fifth panel 2026-10-26, proposed: Add to step on a row under "Not in a step yet"; decide-p11-place-unplaced-row)'
STAMP8 = STAMP6[:-1] + '; Add to step on every row under "Not in a step yet" 2026-10-26, a fifth panel with it pressed; decide-p11-place-unplaced-row, A)'
STAMP9 = STAMP5[:-1] + '; redrawn 2026-10-26: Add to step on every row under "Not in a step yet"; decide-p11-place-unplaced-row, A)'
STAMP10 = STAMP9[:-1] + '; the preview in the printed method treatment 2026-10-26: tag row, why line, aside callout, upright; sketch 010 D18, sketch 014 decision 2)'
STAMP11 = STAMP5[:-1] + '; the reading page\'s steps in the printed method treatment 2026-10-26: tag row, why line, upright; sketch 010 D18, sketch 014 decision 2)'
STAMP12 = STAMP10[:-1] + '; redrawn 2026-10-26: Whole milk\'s second line under Step 2 where its uses line names it; decide-p11-row-order-across-steps)'
STAMP13 = STAMP8[:-1] + '; redrawn 2026-10-26: after Move down on Whole milk the uses line reads the moved order; decide-p11-row-order-across-steps)'
R27 = '; redrawn 2026-10-27 for the build\'s settled decisions and the Phase 11 audit: '
STAMP14 = STAMP12[:-1] + R27 + 'the target chip\'s remove, "600.0 g" on the split lines)'
STAMP15 = STAMP13[:-1] + R27 + 'the target chip\'s remove)'
STAMP16 = STAMP11[:-1] + R27 + 'the target chip\'s remove, Print sheet after Edit, History as "Only this version so far")'
STAMP17 = STAMP11[:-1] + R27 + 'Print sheet after Edit, History as one line, the target chip\'s remove, "Awaiting tasting" once a batch exists, three panels added: Show changes with a struck target at the value\'s size (decide-p11-struck-target-size), Resume editing on the page and on the Notebook row)'
R28 = '; redrawn 2026-10-28: every inline control in sentence case, Remove, Done, Change the ingredients, Add a purpose, Add an aside (bug-p11-link-case-mixed))'
STAMP18, STAMP19, STAMP20, STAMP21 = (s[:-1] + R28 for s in (STAMP14, STAMP15, STAMP16, STAMP17))
STAMPS = {'P11_Steps': STAMP18, 'P11_Structure': STAMP19, 'P11_Save': STAMP20, 'P11_FirstVersion': STAMP21}
TITLES = {'P11_Steps': 'Instructions while creating · a step, its targets, the rows it uses and in what portions, at 1366',
          'P11_Structure': 'Add, remove and move · steps, and rows within their step, at 1366',
          'P11_Save': 'Save · what refuses it and where it lands, at 1366',
          'P11_FirstVersion': 'The first version after Save · editable until it has a batch or a child version, at 1366'}

def build_boards(out):
    sizes = {}
    W = 1000
    SC = lambda pid, sh, **kw: dict(dict(pid=pid, W=1366, html=sheet_only(pid, sh), w=W), **kw)
    # ======== P11_Steps
    r1 = [dict(SC('pA1', sheet(table_html([(None, flat_rows(['milk', 'cream', 'smp', 'suc', 'van'])) ]), method_html([]))), cap='No step yet · 1366', sub='the Instructions heading stands under the table with Add step on its row, as Before you start stands with Add note on its and, since Mark\'s todo of 2026-10-25, Ingredients with Add ingredient on its; the rows have no step head yet (Phase 10\'s flat table), only their own moves. The three controls in the Show/Hide control\'s look (Mark, 2026-10-25; the app follows in Phase 11: CreationPage.jsx\'s beforeFoot and notebook.css .mk-add-row move onto the heading\'s row)'),
          dict(SC('pB1', sheet(table_html(grouped([dict(lead='', uses=())])), method_html(steps_html([dict(lead='', text='', uses=())], over={0: dict(required=True)})))),
               cap='A step just added · 1366', sub='the pen\'s open step, kept open as every creation field is: lead-in, text, Add target · Preview step, "uses nothing yet · Change the ingredients · Add a purpose · Add an aside", then Remove · Move up · Move down · Add step (every inline control in sentence case since 2026-10-28, bug-p11-link-case-mixed); Required under the two empty fields; the table now heads its rows "Not in a step yet", each ending its acts line with Add to step (decide-p11-place-unplaced-row, A, 2026-10-26: the line offers the steps when pressed, this one reading "Step 1" alone until the lead-in is typed). Decided 2026-10-25: no box around the fields, since every step is open here and the version pen\'s box only marked the one open step among closed ones (decide-open-step-box, drop), so the number and the lead-in share one top; Add step on the step\'s own row adds the next step right after it and the heading\'s Add step adds at the beginning of the list (decide-add-step-per-step, both), focus in the new step\'s lead-in either way; Preview step shows the step as the Sheet prints it (look-p11-preview-step, approved)')]
    r2 = [dict(SC('pC1', sheet(table_html(grouped([S1, S2])), method_html(steps_html([S1, S2], over={1: dict(uses_open=True)})))), cap='Two steps worked on · 1366', sub='step 1 has a target and a purpose, the target\'s remove after its value field inside the chip (D-22, drawn 2026-10-27); step 2\'s checklist is open (the build\'s Uses fieldset); the table reads in step order under step heads, every row in one step, so no "Not in a step yet" head; Add ingredient and Add step on their heading\'s row (Mark, 2026-10-25); each step\'s row ends in Add step, which adds a step right after it; the heading\'s adds at the beginning (decision 33)'),
          dict(SC('pD1', sheet(table_html(grouped([S1, S2_MILK], split={'milk': [(0, 400), (1, 200)]})), method_html(steps_html([S1, S2_MILK])))),
               cap='A row in two steps · 1366', sub='Whole milk ticked in step 2 as well: the row splits into one line per step, each with its own grams field, the note "400 g of 600.0 g · 58.0% in all" under each (the build\'s portion line, the row\'s total at the Sheet\'s one decimal; drawn 2026-10-27); the grams are typed in the table, not on the step (decide-p11-portion-grams-place, A); Add step on the heading\'s row (adds at the beginning) and on each step\'s row (adds right after it) (decision 33). Redrawn 2026-10-26 (decide-p11-row-order-across-steps: each step orders its own rows, the table draws a step\'s rows in its uses order): Whole milk\'s second line stands under Step 2 as its last row, where step 2\'s uses line names it, with its own grams field, 200 g, and the portion line "200 g of 600 g · 58.0% in all"')]
    r3 = [dict(SC('pE1', sheet(table_html(grouped([S1, S2])), method_html(steps_html([S1, S2], over={0: dict(preview='open', aside=PE1_ASIDE)})))), cap='Preview step on step 1 · 1366',
               sub='Preview step (Mark\'s todo of 2026-10-25: "some of the actions may not be understandable without seeing the preview", his example a target): the control sits at the end of the targets line, after Add target, where the fields end; pressed, it reads Hide preview and the step appears under its fields as the Sheet shows it, set off by the Sheet\'s hairline at the left under a Preview cue in the checklist\'s legend face; the uses line and the step\'s row stay where they are. Approved as drawn (look-p11-preview-step; decision 34). Redrawn 2026-10-26 (Mark: the Sheet\'s steps take the printed method\'s treatment, sketch 010 D18; sketch 014 decision 2): the preview reads as the print does, the target as a caps label and a bold underlined value with no box, the purpose as "why", an em dash and the sentence, the aside as a callout behind the ink rule, all upright; step 1 has an aside on this panel so the preview shows all three')]
    parts, bw, bh = flow([r1, r2, r3]); sizes['P11_Steps'] = (bw, bh)
    board('P11_Steps', TITLES['P11_Steps'] + STAMPS['P11_Steps'], bw, bh, parts, out)

    # ======== P11_Structure
    three = [S1, S2, S3]
    r1 = [dict(SC('qA1', sheet(table_html(grouped(three)), method_html(steps_html(three)))), cap='Three steps · Remove, Move up, Move down · 1366', sub='under every step: Remove · Move up · Move down (STRUCT-02\'s words, in sentence case since 2026-10-28: bug-p11-link-case-mixed); the first step\'s Move up and the last\'s Move down cannot act and read as the picker\'s Added does; the same three under every row, moving within its step; Add ingredient and Add step on their heading\'s row (Mark, 2026-10-25), and Add step as the fourth word of every step\'s row, adding right after that step, while the heading\'s adds at the beginning (decision 33); the open step has no box and its lead-in takes the number\'s top (decision 32); Preview step after Add target (decision 34)'),
          dict(SC('qB1', sheet(table_html(grouped([S2, S1, S3])), method_html(steps_html([S2, S1, S3])))), cap='After Move down on step 1 · 1366', sub='the step is second now and reads 2; the numbers follow the order (STRUCT-03: the stored number never changes); the table\'s step groups follow the method')]
    r2 = [dict(SC('qC1', sheet(table_html(grouped([S1, S3])), method_html(steps_html([S1, S3])))),
               cap='After Remove on step 2 (Finish cold) · 1366', sub='deleted outright, no strike and no restore (decision 10): Heavy cream and Vanilla extract keep their grams and go back under "Not in a step yet", each with Add to step at the end of its acts line (decide-p11-place-unplaced-row, A); Whole milk\'s 200 g line in that step folds back into its line in step 1, so the row reads 600 g, 58.0%, with no portion line, and the Balance stands (decide-p11-step-removal-split-portion, grams-fold-back; roadmap decision 24)'),
          dict(SC('qD1', sheet(table_html(grouped([S1_MOVED, S2, S3])), method_html(steps_html([S1_MOVED, S2, S3])))), cap='After Move down on Whole milk · 1366', sub='a row moves within its step only (decision 9): Skim milk powder now leads step 1\'s rows; nothing else moved. Redrawn 2026-10-26 (decide-p11-row-order-across-steps: each step orders its own rows, a move within one step leaves the other steps\' order alone): step 1\'s uses line reads the moved order, "uses Skim milk powder, Whole milk, Sucrose", as its rows stand; steps 2 and 3, their rows and their uses lines are as before')]
    # decided 2026-10-26 (decide-p11-place-unplaced-row, A, row-add-to-step; Mark's note on look-p11-structure-r2: the unplaced rows "can't be easily added to a step"): the same state
    # as "After remove on step 2", Heavy cream's Add to step pressed. The one panel that shows the pressed state.
    r3 = [dict(SC('qE1', sheet(table_html(grouped([S1, S3], place={'cream': 'open', 'van': 'closed'})), method_html(steps_html([S1, S3])))),
               cap='Placing a row from "Not in a step yet" · Add to step pressed · 1366', sub='Mark on look-p11-structure-r2: these rows "can\'t be easily added to a step"; the step\'s own "change the ingredients" checklist was a screen away. Decided (decide-p11-place-unplaced-row, A, 2026-10-26): a row under "Not in a step yet" ends its acts line with Add to step (Vanilla extract); pressed, the line becomes the chooser, Cancel first, then each step by number and lead-in (Heavy cream); choosing one ticks the row in that step\'s uses, moves it under that step\'s head as its last row with its grams, the step\'s uses line names it, and focus follows the row to its remove. A placed row has no Add to step; the checklist stays for a row in two steps or a move between steps')]
    parts, bw, bh = flow([r1, r2, r3]); sizes['P11_Structure'] = (bw, bh)
    board('P11_Structure', TITLES['P11_Structure'] + STAMPS['P11_Structure'], bw, bh, parts, out)

    # ======== P11_Save
    def editor_page(vid, band, sh): return shell_main(1366, page_html(band, sh, log_regions()), vid)
    worked = sheet(table_html(grouped([S1, S2])), method_html(steps_html([S1, S2])))
    r1 = [dict(pid='vA1', W=1366, html=editor_page('vA1', band_save(vid='vA1'), worked), max=900, cap='Ready to save · 1366', sub='the ceremony reads New recipe · draft, Version name, then Cancel and Save (the filled action); the page under it is the editor as worked on'),
          dict(pid='vB1', W=1366, html=editor_page('vB1', band_save(name='', vname='', vid='vB1', name_error='Enter a recipe name.'), worked), max=900, cap='Save refused · 1366', sub='the two fields Save needs: "Enter a recipe name." under the empty name (the Notebook\'s own sentence) and Required under the empty version name; nothing is saved and the page stays; a step with Required standing refuses the same way')]
    r2 = [dict(pid='vC1', W=1366, html=shell_main(1366, after_save_page(), 'vC1'), h_fixed=1024, cap='After Save · the new recipe\'s page in a 1366 × 1024 window · 1366', sub='the recipe and its first version in one step (MAKE-10): the band reads Vanilla and its description with Rename; Version 1 · Latest (the label printed once when it equals the ordinal\'s words: decide-p11-default-version-name-repeats, build-once), Written today, no From version, "no reason recorded"; Next version, Edit and Print sheet (D-05); History as the one line "Only this version so far" (03.5-18; drawn 2026-10-27); the Sheet as the seeded ones read, its steps numbered and the table under step heads; the Batch margin not yet churned; "Recipe saved." as the built page notice: the ink card at the window\'s foot, centred, 20 above the foot, the shape of "Batch saved." (decide-page-notice-shape and decide-notice-card-palette, Mark 2026-10-24/25; decision 23\'s place under the bar beside Import is superseded); it clears after 5 s as the others do')]
    parts, bw, bh = flow([r1, r2]); sizes['P11_Save'] = (bw, bh)
    window_foot(parts, 'vC1', notice_html('Recipe saved.'))
    board('P11_Save', TITLES['P11_Save'] + STAMPS['P11_Save'], bw, bh, parts, out)

    # ======== P11_FirstVersion
    r1 = [dict(pid='fA1', W=1366, html=shell_main(1366, after_save_page(), 'fA1'), max=620, cap='A first version with no batch and no child · Edit · 1366', sub='Edit stands beside Next version as an underlined word (the acts row\'s own link look) only while the version has no batch and no child (STRUCT-04); Show changes needs a parent, so it is absent on a root; Print sheet, the same underlined word, ends the row (D-05). History is the one line "Only this version so far" while the recipe has one version (03.5-18), drawn 2026-10-27'),
          dict(pid='fB1', W=1366, html=editor_page('fB1', band_save(vid='fB1', caption='Version 1 · editing', form_label='Edit version'), worked), max=900, cap='Editing the first version · 1366', sub='Edit reopens the creation editor on the saved version, its steps, rows, style, scales and problems as saved (decide-p11-first-version-editor, A): the same Add, Remove and Move controls as while creating; the ceremony reads Version 1 · editing, Cancel and Save; Save writes over the version, Cancel keeps it as it was; each target\'s remove stands after its value field (D-22)'),
          dict(pid='fC1', W=1366, html=shell_main(1366, after_save_page(edit_act=False, with_batch=True), 'fC1'), max=620, cap='Once a batch exists · 1366', sub='Edit is gone: the acts row reads Next version, then Print sheet; the Batch margin holds the batch as built (one untasted batch; the Go to batch row, hidden at 1366, reads "Awaiting tasting"); from here the version pen\'s own remove and restore apply to its children, as before (STRUCT-04)')]
    # 2026-10-27: the build's settled states drawn back (11-UI-REVIEW.md, Board matters for Sid)
    def nb_resume_row():
        return ('<li class="nb__row nb__row--resume"><span class="nb__rail" aria-hidden="true"></span><h2 class="nb__name"><a href="/notebook/vanilla/vanilla-v1" tabindex="0">Vanilla</a></h2>'
                f'<p class="nb__desc">{esc(SAMPLE_DESC)}</p><p class="nb__meta"><span>1 version</span><span class="nb__dot" aria-hidden="true">·</span><span>not yet made</span></p>'
                '<span class="nb__row-act"><button type="button" class="notebook-action--outline" tabindex="0">Resume editing</button></span></li>')
    def nb_with_resume(vid):
        n = len(PL.ORDER) + 1
        main = ('<div class="list-page place nb">' + p10.nb_head(True) + f'<p class="nb__count">{n} recipes</p><ul class="nb__list">' + nb_resume_row()
                + ''.join(PL.nb_row(h, r, nm) for h, r, v, nm in PL.ORDER) + '</ul></div>')
        return unique_ids(PL.clean(PL.CAP['chrome_notebook_1366']).replace('@@MAIN@@', main), vid)
    r2 = [dict(pid='fD1', W=1366, html=shell_main(1366, after_save_page(later=('temp', '80 °C', '85 °C')), 'fD1'), max=1400, cap='A later version · Show changes pressed · a changed target · 1366',
               sub='Version 2 of Vanilla, from Version 1, with Show changes pressed (Hide changes in the acts row; no Edit, since only the first version is editable). In the tag row a changed target reads its label once, the old value struck, then the new value bold and underlined (D-18): the struck value takes the new value\'s size, 14 px at weight 400 with the app\'s one strike, as the table\'s struck figure matches its live figure (decide-p11-struck-target-size, value-size, Mark 2026-10-27); it had read at the label\'s 12 px. The app follows with one rule'),
          dict(pid='fE1', W=1366, html=shell_main(1366, after_save_page(editing=True), 'fE1'), max=620, cap='An edit kept · the version page · 1366', sub='while an edit of the first version is kept (a draft since the first change on the edit route), Edit\'s place reads Resume editing, the same underlined word, and Next version and Record a batch are gone until the edit is saved or cancelled (D-04); Print sheet stays'),
          dict(pid='fF1', W=1366, html=nb_with_resume('fF1'), max=620, cap='An edit kept · the Notebook row · 1366', sub='the recipe\'s row gains Resume editing as the outline control at the row\'s right, in the New recipe row\'s own look; no second draft row (D-05); below 760 it stands under the counts (not drawn: 1366 only)')]
    parts, bw, bh = flow([r1, r2]); sizes['P11_FirstVersion'] = (bw, bh)
    board('P11_FirstVersion', TITLES['P11_FirstVersion'] + STAMPS['P11_FirstVersion'], bw, bh, parts, out)
    return sizes

if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        os.makedirs(sys.argv[2] + '/project', exist_ok=True); build_boards(sys.argv[2])
        open(sys.argv[2] + '/measure.html', 'w').write(p10.measure_html()); print(len(p10.PANELS), 'panels')
    else:
        c = json.load(open(sys.argv[1])); os.makedirs(sys.argv[2] + '/project', exist_ok=True); sizes = build_boards(sys.argv[2])
        B = c['boards']; N = c['notes']; PAGE = ('page-21', 'Phase 11 steps, structure and save')
        if not any(p['id'] == PAGE[0] for p in c['pages']):
            i = [p['id'] for p in c['pages']].index('page-20'); c['pages'].insert(i + 1, {'id': PAGE[0], 'name': PAGE[1]})
        x = 0; ONLY = sys.argv[3].split(',') if len(sys.argv) > 3 else None      # write only these boards' frames and titles (the others are not republished)
        for key in ['P11_Steps', 'P11_Structure', 'P11_Save', 'P11_FirstVersion']:
            w, h = sizes[key]; fn = key + '.dc.html'
            if ONLY and key not in ONLY and fn in B: x = B[fn]['x'] + B[fn]['w'] + 240; continue
            B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h, 'title': TITLES[key] + STAMPS[key]}
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + w + 240
        N['p11-title'] = dict(N.get('p11-title', {}), x=0, y=-300, text='Phase 11: the Instructions steps, add, remove and move, Save and the first version', kind='title1', maxW=x, page=PAGE[0])
        json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
