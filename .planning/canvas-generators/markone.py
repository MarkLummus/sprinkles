import json, re, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, resolve_media, scope_css, unique_ids
import printstart
# Sid, 2026-10-06 (Phase 4; Mark's request of the same day): the old Batch log's two "mark one" fields, At draw and From freezer, drawn into the record pen (and its reading) in App context.
#   python3 markone.py <out dir>      writes <out>/MarkOnePenStates, MarkOnePenWhole and MarkOneReading .dc.html (the boards) and <out>/markone-probe.html (every panel at its natural size, for markone-measure.mjs)
# Every panel is the built app's own log markup (markone-capture.json: WebKit coarse, the dist of 2026-10-06, Olive Oil v1) with the app's own stylesheets resolved at the window (1366 for the 350 column,
# 393 for the phone) and ONE drawn layer on top (DRAWN, below): the group, its three states and the hint. Nothing here edits app/. The markup the layer adds is this file's MO_* functions.
# What is drawn (Mark, 2026-10-06; the old form's own words, sentence case; redrawn 2026-10-07 to D6b, rows decide-see-below-where-dropped and decide-older-batch-marks-reading: See below is dropped from the app;
# redrawn again 2026-10-07 for row draw-pen-hide-group-fields-when-absent, Mark's note on look-pen-reading-without-see-below: a tapped pick hides the group's fields too;
# redrawn a third time 2026-10-07 for D9, row draw-pen-notes-stay-visible: only the group's evaluation fields hide with a pick, the free-text notes stay;
# redrawn a fourth time 2026-10-07 for D10, row draw-pen-control-stays: a mark in the group no longer takes the field away, it turns the two options off;
# redrawn a sixth time 2026-10-07 for D11b, row draw-pen-next-time-above-control (Mark's answer to look-pen-notes-melt-above-marks): Next time (the recipe's own, D5) sits above the From freezer field too, after Melt style,
#   so the field is the last thing in the tasting section and a pick hides everything below it: the scales and Any problems?; the save buttons (Cancel, Save batch) follow the field.
#   Next time's underline is then the rule above the field (the field draws no hairline of its own, as under the tasting note); the blank pen is 45 px shorter.
# redrawn 2026-10-07 for D13, row draw-pen-remove-double-rule-at-draw (Mark: "I don't like the double rule - remove it."): Ingredient notes' underline and At draw's hairline sat 25 px apart; At draw now draws no hairline of its own
#   (the note's underline is the rule above it, as above From freezer): any field label (.batch-margin__field) directly above a group drops the group's rule, margin and padding.
# the READING redrawn 2026-10-07 for D12, row draw-reading-follows-pen-order (Mark's note on look-pen-notes-melt-above-marks: "leave the print as-is. Reading should follow the pen's order"): the reading's order is the pen's:
#   draw side, the churn figures, At the machine and Ingredient notes, then the At draw word (or Exit consistency and Airiness); tasting side, Tempering and Tasting temperature, the tasting note, Melt test and Melt style,
#   Next time (moved from after the Tasting fold to inside it, before the From freezer word), then the From freezer word (or the scales and Any problems?). The print is not changed.
# the READING redrawn again 2026-10-07 for D14, row draw-reading-next-time-outside-fold (Mark: "next time in the reading: I don't think that it should hide with Tasting"): Next time goes back OUTSIDE the Tasting fold,
#   after it, always visible, where the app puts it; it follows the From freezer word (or the scales and Any problems?), the one place the reading departs from the pen's order. Checked: no other placement is both
#   visible with the fold closed and before the From freezer word, because that word sits inside the fold; the only spot outside the fold before it is above the Tasting head, past Tempering, the tasting note and the melt fields.
# redrawn a fifth time 2026-10-07 for D11, row draw-pen-notes-above-marks (and Mark's addition the same day): At the machine and Ingredient notes sit ABOVE the At draw field, Melt test and Melt style above the From freezer field,
#   so the fields a pick hides run to the end of their section (the Tasting head follows At draw; Next time, the recipe's own, follows From freezer) and no straggler is left below them):
#   - D10 (Mark): the field STAYS in the pen once a mark is entered. With a mark in the group the two options cannot read Nothing to note or Not evaluated beside entered marks, so both go OFF: a dashed border
#     (DESIGN.md "Disabled"), secondary text, neither on, not tappable, not focusable; and DESIGN.md's rule that a disabled control states its reason is met by one hint sentence, "Clear marks below to choose.",
#     set in the head's right-hand slot, the slot Clear uses for a tapped pick (the two are never on screen together: Clear needs a pick, the hint needs a mark, and a pick hides the marks). The head already reserves
#     that slot's height, so the hint adds no height: marking the first scale moves nothing. Clearing the last mark turns the options back on, blank (a pick can only be tapped while the group holds no mark, so none was lost).
#     A written note is outside the groups (D9), so it still changes nothing: the options stay on beside a note.
#   - At draw heads the draw group (Exit consistency, Airiness); From freezer heads the tasting group (the scales, Any problems?). The notes are OUT of the groups (D9): At the machine and Ingredient notes follow the draw group;
#     How did it turn out? (the tasting note, the one free-text batch note under From freezer) precedes From freezer's field, which now sits between it and the scales. The note's own underline is the rule above the field,
#     so From freezer draws no hairline of its own (two rules 33 px apart stuttered); At draw keeps its hairline under the churn figures. Each field is one joined group of TWO
#     options, Nothing to note | Not evaluated, in the pen's own segmented control, under a hairline and a name in the group-cue face (decision 40: 14px, 600, sentence case). No hint sentence.
#   - (D6b to D9, superseded by D10 above: the field used to go while the group held a mark.)
#   - Clear (the pen's own text control) shows only for a tapped pick.
#   - A tapped pick (Nothing to note or Not evaluated) also takes the GROUP'S EVALUATION FIELDS off the page, as the reading does: At draw hides Exit consistency and Airiness; From freezer hides the scales and Any problems?.
#     The field stays: hairline, name, Clear, the two options with the pick on. At the machine, Ingredient notes and How did it turn out? stay on the page, written or blank. A group holds no mark when a pick is tapped
#     (the pick is only offered while it is blank), so no entry is hidden.
#     Changing one's mind: Clear returns the group's fields, blank, and the field blank; the other option moves the pick and the fields stay away; tapping the picked option again does nothing (a radio, as built).
#     Nothing above the field moves in either direction, so the tapped control stays under the finger; what moves is the content below the group (the "taste" and "draw" delta in markone-measure.mjs).
#   - The reading: a group with marks shows its own fields alone, as the app renders them, with no cell for the field. A group with a pick shows one full-width cell with the one word (Nothing to note or Not evaluated):
#     At draw after the churn figures (its Exit consistency and Airiness are not on the page), From freezer after the tasting note (its scale rows and problems are not on the page). The notes stay where the app puts them.
CAP = json.load(open(HERE + '/markone-capture.json'))
# D17 (Mark, 2026-10-07, row draw-remove-draw-temp-rename-logs): 'Time to draw temp.' is dropped from the drawing. The capture is the built app's own markup, which still has the field (its removal from the app is a build decision,
# decide-cleanup-phase-before-print), so the field's pen label and its reading cell (with its plan line) are cut out of every captured panel here, and nothing else is touched.
_PEN_TEMP = re.compile(r'<label class="field-row__label"><span class="pen-caption">Time to draw temp\.</span>.*?</label>', re.S)
_READ_TEMP = re.compile(r'<div class="batch-row__cell"><span class="batch-row__cell-label">Time to draw temp\.</span>.*?</div>', re.S)
def _drop_temp(h):
    h2 = _READ_TEMP.sub('', _PEN_TEMP.sub('', h)); assert 'Time to draw' not in h2.replace('aria-label="Time to draw temp., minutes"', ''), 'a Time to draw temp. is left'; return h2
CAP = {k: _drop_temp(v) for k, v in CAP.items()}
MEAS = json.load(open(HERE + '/markone-measure.json')) if os.path.exists(HERE + '/markone-measure.json') else {}
OPTS = ['Nothing to note', 'Not evaluated']
MARKS = ('marked', 'both'); NOTES = ('noted', 'both', 'nothingnote', 'notnote'); PICKS = ('nothing', 'not', 'nothingnote', 'notnote')
NOTE_DRAW = 'Bowl frozen overnight. Mix looked a little thin.'
NOTE_TASTE = 'Soft, not greasy. The oil is strong.'
STAMP = ' (redrawn 2026-10-07, no Time to draw temp.; approved)'
STAMP_READ = ' (redrawn 2026-10-07, no Time to draw temp.; approved)'

DRAWN = '''
.notebook-log .mo-group{border-top:var(--rule-graduation) solid var(--app-divider);padding-top:var(--gap-s);margin-top:var(--gap-l)}
.notebook-log .mo-group .segmented-field__head{margin-bottom:var(--gap-xs)}
.notebook-log .mo-end{margin-top:var(--gap-l)}
.notebook-log .note-block + .mo-group,.notebook-log .batch-margin__field + .mo-group{margin-top:0;padding-top:0;border-top:0}
.notebook-log .mo-group + .axes-grid{margin-top:var(--gap-m)}
.notebook-log .batch-row__cells.mo-readgroup{margin-top:var(--app-notebook-log-cell-gap-row)}
.notebook-log .mo-readgroup .mo-lead{grid-column:1 / -1}
.notebook-log .batch-row__conclusion + .batch-row__cells.mo-readgroup{margin-top:var(--gap-l)}
.notebook-log .mo-group .segmented__option.is-off{border-style:dashed;color:var(--app-text-secondary);cursor:default}
.notebook-log .mo-group .segmented__option.is-off:hover{border-width:var(--rule-ink-field);padding:var(--sheet-seg-pad-y) var(--sheet-seg-pad-x)}
.notebook-log .mo-group .segmented__option.is-off input{cursor:default}
.notebook-log .mo-group .mo-hint{font-family:var(--face-grotesk);font-size:var(--sheet-size-mark-stop);line-height:var(--sheet-leading-control);color:var(--app-text-secondary);margin-left:auto;text-align:right}
'''
LABEL = '''
.fp-title{font-family:var(--face-grotesk);color:var(--app-text);font-size:20px;line-height:26px;font-weight:600;margin:0}
.fp-sub{font-family:var(--face-grotesk);color:var(--app-text-secondary);font-size:15px;line-height:21px;margin:4px 0 0}
.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}
.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}
.fp-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''

# ---- the drawn markup -------------------------------------------------------------------------------------------------------------------------------------------------------------
def mo_field(key, name, state):
    """state: 'blank' | 'nothing' | 'not' | 'nothingnote' | 'notnote' | 'marked' | 'noted' | 'both'. marked / both = something in the group is marked: the field is not on the page at all.
    noted = a note written, no mark: the field shows, blank (the note is outside the group). nothingnote / notnote = a pick with a note written."""
    off = state in MARKS
    picked = {'nothing': OPTS[0], 'not': OPTS[1], 'nothingnote': OPTS[0], 'notnote': OPTS[1]}.get(state)
    clear = '<button type="button" class="text-control segmented-field__clear" aria-label="Clear %s" tabindex="0">Clear</button>' % name if picked else ''
    opts = ''
    for o in OPTS:
        chk = ' checked=""' if o == picked else ''
        opts += '<label class="segmented__option%s"><input type="radio" name="mo-%s" value="%s"%s%s><span>%s</span></label>' % (' is-off' if off else '', key, o, '' if off else ' tabindex="0"', chk + (' disabled=""' if off else ''), o)
    hint = '<span class="mo-hint">Clear marks below to choose.</span>' if off else ''
    return ('<div class="segmented-field mo-group" data-mo="%s"><div class="segmented-field__head"><span class="segmented-field__caption pen-caption axes-cue" id="mo-%s-cap">%s</span>%s%s</div>'
            '<div class="segmented" role="radiogroup" aria-labelledby="mo-%s-cap">%s</div></div>'
            % (key, key, name, clear, hint, key, opts))

def set_note(html, label, text):
    """The pen's own textarea for `label` (its aria-label), with the written words, or blank."""
    pat = re.compile(r'(<textarea class=")[^"]*("[^>]*aria-label="%s"[^>]*>)[^<]*(</textarea>)' % re.escape(label))
    cls = 'prose-field' if text else 'prose-field prose-field--empty'
    assert pat.search(html), label
    return pat.sub(lambda m: m.group(1) + cls + m.group(2) + text + m.group(3), html, count=1)

def pen(W, draw, taste, base=None):
    """The pen with the tasting added: draw and taste are each 'blank' | 'nothing' | 'not' | 'nothingnote' | 'notnote' | 'marked' (a pick on a scale, a chip) | 'noted' (a note) | 'both'. The captured pen carries the marks."""
    src = 'pen' + ('both' if (draw in MARKS and taste in MARKS) else 'draw' if draw in MARKS else 'taste' if taste in MARKS else '')
    h = base if base is not None else CAP['%s_%d' % (src, W)]   # base: another recipe's captured pen in the blank state (declared.py), put through the same moves
    h = set_note(h, 'At the machine', NOTE_DRAW if draw in NOTES else '')
    h = set_note(h, 'How did it turn out?', NOTE_TASTE if taste in NOTES else '')
    a = '<div class="segmented-field">'
    assert h.count(a) == 4 or h.count(a) == 3, h.count(a)
    atm = '<label class="batch-margin__field"><span class="pen-caption">At the machine</span>'; assert h.count(atm) == 1
    th = '<div class="tasting-head">'; assert h.count(th) == 1
    k = h.index(atm); notes = h[k:h.index(th)]; h = h[:k] + h[h.index(th):]                                   # D11: At the machine and Ingredient notes leave their place before the tasting head ...
    i = h.index(a); h = h[:i] + notes + h[i:]                                                               # ... and sit above the At draw field, so what a pick hides runs to the section end
    f = mo_field('atdraw', 'At draw', draw); i = h.index(a)
    h = h[:i] + f + h[i:]                                                                                  # after the notes, before Exit consistency, the group's first item
    if draw in PICKS: j = i + len(f); h = h[:j] + h[h.index(th):]                                         # a pick: Exit consistency and Airiness are not on the page; the tasting head follows the field
    h = h.replace(th, th.replace('class="', 'class="mo-end '), 1)                                          # the draw group ends with Airiness; the tasting section starts after a gap
    nt = '<label class="batch-margin__field batch-margin__field--next-time">'; assert h.count(nt) == 1
    sc = '<div class="save-ceremony">'; assert h.count(sc) == 1
    m = h.index('<div class="melt-block">'); melt = h[m:h.index(sc)]; h = h[:m] + h[h.index(sc):]            # D11, D11b: Melt test, Melt style and Next time (the recipe's own, D5) leave their place after Any problems? ...
    assert melt.index(nt) > 0 and melt.endswith('</label>'), melt[-60:]
    ax = '<div class="axes-grid axes-grid--stacked">'; assert h.count(ax) == 1
    i = h.index(ax); h = h[:i] + melt + h[i:]                                                               # ... and sit above the From freezer field, after the tasting note, Next time last of them
    f = mo_field('fromfreezer', 'From freezer', taste); i = h.index(ax)
    h = h[:i] + f + h[i:]
    if taste in PICKS: j = i + len(f); h = h[:j] + h[h.index(sc):]                                        # a pick: the scales and Any problems? are not on the page; the save buttons (Cancel, Save batch) follow the field
    return h

def cell(label, value):
    return '<div class="batch-row__cell mo-lead"><span class="batch-row__cell-label">%s</span><span class="batch-row__cell-value">%s</span></div>' % (label, value)

def close_of(h, open_tag):
    """Index of the closing </div> of the div that starts with open_tag (matched by depth)."""
    a = h.index(open_tag); d = 0
    for m in re.finditer(r'<div\b|</div>', h[a:]):
        d += -1 if m.group(0) == '</div>' else 1
        if d == 0: return a + m.start()

def take_cell(h, lab):
    """The reading's own cell for `lab` taken out of h: (h without it, the cell's markup)."""
    m = re.search(r'<div class="batch-row__cell"><span class="batch-row__cell-label">%s</span>.*?</span></div>' % re.escape(lab), h); assert m, lab
    return h[:m.start()] + h[m.end():], m.group(0)

def reading(W, key, draw, taste, base=None):
    """The reading as the app rendered it (key: readblank | readnotes | readmarks | readscales), laid out in the PEN'S ORDER (D12, Mark 2026-10-07: the reading follows the pen's order, the print stays as it is).
    draw and taste: the one word of a group with a pick, or None for a group that holds marks.
    Draw side: the churn figures, At the machine and Ingredient notes (the hand notes), then the At draw word (a group with a pick: one full-width cell, Exit consistency and Airiness are not on the page) or
    Exit consistency and Airiness (a group with marks: its fields alone, a row of their own after the notes).
    Tasting side, inside the Tasting fold: Tempering and Tasting temperature, How did it turn out? (when written), Melt test and Melt style, then the From freezer word (a group with a pick: one full-width cell)
    or the scales and Any problems? (a group with marks: its fields alone). With no tasting note written the four conditions stay one row. Next time (the recipe's own, D5) sits OUTSIDE the fold, after it, where the app
    puts it (D14, Mark 2026-10-07: it does not hide with Tasting), so it follows the From freezer word: the one departure from the pen's order.
    The notes are never taken out (D9). A group with None is left as the app rendered it, only its place changes."""
    h = base if base is not None else CAP['%s_%d' % (key, W)]   # base: another batch's captured reading (declared.py), put through the same moves
    h, ex = take_cell(h, 'Exit consistency'); h, ai = take_cell(h, 'Airiness')
    j = close_of(h, '<div class="batch-row__cells">') + len('</div>')                                              # after the churn row (two figures: Out of machine and Churn duration)
    n = re.search(r'<div class="batch-row__notes">.*?</div>', h)
    if n: j = n.end()                                                                                            # after At the machine and Ingredient notes, which come first in the pen
    g = cell('At draw', draw) if draw else ex + ai
    h = h[:j] + '<div class="batch-row__cells mo-readgroup">' + g + '</div>' + h[j:]
    c0 = h.index('<div class="batch-row__cells tasting-reading__conditions">'); c1 = close_of(h, '<div class="batch-row__cells tasting-reading__conditions">') + len('</div>')
    cells = re.findall(r'<div class="batch-row__cell">.*?</span></div>', h[c0:c1], re.S); assert len(cells) == 4, len(cells)
    note = re.search(r'<p class="app-hand tasting-reading__note">[^<]*</p>', h)
    nt = re.search(r'<div class="batch-row__conclusion">.*?</div>', h, re.S); assert nt
    conc = nt.group(0); h = h.replace(conc, '', 1)
    if note: h = h.replace(note.group(0), '', 1)
    c0 = h.index('<div class="batch-row__cells tasting-reading__conditions">'); c1 = close_of(h, '<div class="batch-row__cells tasting-reading__conditions">') + len('</div>')
    cond = lambda cs: '<div class="batch-row__cells tasting-reading__conditions">' + ''.join(cs) + '</div>'
    new = (cond(cells[:2]) + note.group(0) + cond(cells[2:])) if note else cond(cells)
    if taste: new += '<div class="batch-row__cells mo-readgroup">' + cell('From freezer', taste) + '</div>'
    h = h[:c0] + new + h[c1:]
    k = h.index('<dl class="batch-row__provenance">')                                                              # the app's own spot: after the Tasting section, before Recorded
    assert h[:k].endswith('</div></section>'), 'Next time must follow the Tasting section'
    return h[:k] + conc + h[k:]

def wrap(html):
    return '<div class="notebook" style="padding:0;max-width:none;display:block">' + html + '</div>'

# ---- the panels -------------------------------------------------------------------------------------------------------------------------------------------------------------
PANELS = []
def panel(pid, W, html, cap, crop=None):
    p = dict(pid=pid, W=W, html=wrap(html), cap=cap, crop=crop); PANELS.append(p); return p

STATES = [('blank', 'Opens blank: the field shows, and every field of the group under it'), ('nothing', 'Nothing to note tapped: the evaluation fields are gone; the notes stay; Clear returns the fields'), ('notnote', 'Not evaluated tapped, a note written: the note stays beside the pick'), ('marked', 'A mark, no note: the field stays, both options off'), ('noted', 'A note, no mark: the note is outside the group, so the field stays, on and blank')]
def pen_row(W, which):
    out = []
    for st, cap in STATES:
        d, t = (st, 'blank') if which == 'draw' else ('blank', st)
        if st == 'nothing': cap = 'Nothing to note tapped: ' + ('Exit consistency and Airiness are gone; the notes above the field stay, and the Tasting head follows it' if which == 'draw' else 'the scales and Any problems? are gone; How did it turn out?, Melt test, Melt style and Next time stay above the field, and the save buttons follow it') + '. Clear returns the fields'
        if st == 'notnote': cap = 'Not evaluated tapped, ' + ('At the machine' if which == 'draw' else 'How did it turn out?') + ' written: the note stays beside the pick'
        if st == 'marked': cap = 'A mark, no note: ' + ('Exit consistency' if which == 'draw' else 'Hardness 4 and a problem') + ' marked. The field stays; both options are dashed with the reason beside the name. Clearing the last mark turns them back on, blank'
        out.append(panel('%s-%s-%d' % (which, st, W), W, pen(W, d, t), cap, which))
    return out
def full_row(W):
    return [panel('fullblank-%d' % W, W, pen(W, 'blank', 'blank'), 'Opens blank: both fields and every field of both groups', 'full'),
            panel('fullpick-%d' % W, W, pen(W, 'nothingnote', 'notnote'), 'Nothing to note in the draw group, Not evaluated in the tasting group, a note written in each: each group is its field alone, the notes stay', 'full'),
            panel('fullmix-%d' % W, W, pen(W, 'nothing', 'marked'), 'Nothing to note in the draw group (its fields gone); a mark in the tasting group: that field stays, its options off', 'full'),
            panel('full-%d' % W, W, pen(W, 'both', 'both'), 'Marked and written in both groups: both fields stay, both with their options off and the reason beside the name', 'full')]
READS = [('r1', 'Nothing to note in both groups, no notes written: the churn figures, then the At draw word; the conditions, then the From freezer word, then Next time outside the Tasting fold. No fields under either', 'readblank', 'Nothing to note', 'Nothing to note'),
         ('r2', 'Not evaluated in both groups, no notes written: the same order, the same one word each', 'readblank', 'Not evaluated', 'Not evaluated'),
         ('r3', 'A pick in each group, notes written: At the machine and Ingredient notes come before the At draw word; the tasting note, Melt test and Melt style come before the From freezer word, which stands last in the fold; Next time follows it, outside the fold', 'readnotes', 'Nothing to note', 'Not evaluated'),
         ('r4', 'Notes written, no pick, marks in the tasting: the notes, then Exit consistency and Airiness; the tasting note and the melt fields, then the scales and problems, then Next time outside the fold. No cell says the fields are present', 'readmarks', None, None),
         ('r5', 'Marks only, no note written: the fields alone, in the same order; Airiness, which nobody marked, still reads not measured', 'readscales', None, None)]
def read_row(W):
    return [panel('%s-%d' % (r, W), W, reading(W, k, d, t), cap, 'read') for r, cap, k, d, t in READS]

def crop_for(p):
    m = MEAS.get(p['pid'])
    if not m: return (0, 1800)
    if p['crop'] == 'draw': return (0, m['drawEnd'])
    if p['crop'] == 'taste': return (m['tasteTop'], m['tasteCrop'] - m['tasteTop'] + 16)
    return (0, m['h'] + 8)

ROWS = [('350 · At draw in the log column beside the Sheet', 'The pen from Record another, cropped through the Tasting head. At the machine and Ingredient notes come first, above the field; Ingredient notes\' underline is the one rule above At draw, which draws no hairline of its own. At draw heads Exit consistency and Airiness, the last two fields of the section. A pick hides the two fields and shows Clear; the notes stay above, and the Tasting head follows the field. A mark keeps the field and turns its options off, with the reason beside the name; a note changes nothing.', lambda: pen_row(1366, 'draw'), 350),
        ('350 · From freezer in the log column', 'Cropped from the Tasting head to the first two scales, or to the save buttons when the scales are gone. How did it turn out?, Melt test, Melt style and Next time (the recipe\'s own) come first, above the field; From freezer heads the scales and Any problems?, the last fields of the section, and the save buttons follow them. A tapped pick hides the scales and the problems, keeps the note and Next time, and leaves the field last in the section. A mark keeps the field and turns its options off; a note changes nothing.', lambda: pen_row(1366, 'taste'), 350),
        ('393 · At draw on the phone', 'The same states at the phone, coarse pointer.', lambda: pen_row(393, 'draw'), 393),
        ('393 · From freezer on the phone', 'The same states at the phone, coarse pointer.', lambda: pen_row(393, 'taste'), 393),
        ('350 · the whole pen, both groups from head to end', 'Four states: opens blank; a pick in each group with a note written in each; a pick in one and a mark in the other; marks and notes in both. In the last two a field with a mark in its group stays, with both options off. The notes sit above the At draw field with one rule between them (the note\'s underline), and the melt fields and Next time above the From freezer field; the draw group ends at the Tasting head, the tasting group at the save buttons.', lambda: full_row(1366), 0),
        ('393 · the whole pen on the phone, same four states', 'The same four states at the phone, coarse pointer.', lambda: full_row(393), 0),
        ('350 · the reading: the one word where a group holds a pick, the fields alone where it holds marks', 'The batch reading, the Tasting fold open, in the pen\'s order. Draw side: the churn figures, At the machine and Ingredient notes, then At draw (the word, or Exit consistency and Airiness). Tasting side, inside the fold: Tempering and Tasting temperature, the tasting note, Melt test and Melt style, then From freezer (the word, or the scales and Any problems?). Next time is outside the fold, after it, so it stays when Tasting is hidden; it follows From freezer, the one place the reading departs from the pen\'s order. A group with a pick shows one cell and no field under it; a group with marks shows its fields alone, with no cell saying they are present.', lambda: read_row(1366), 350),
        ('393 · the reading on the phone, same order', 'The same five readings at the phone: the same order, the same words.', lambda: read_row(393), 393)]
# the boards: key, title, the ROWS indexes each holds (a canvas board stays under 8000 tall)
BOARDS = [('MarkOnePenStates', 'Mark one · At draw and From freezer in the record pen: five states, 350 and 393', [0, 1, 2, 3]),
          ('MarkOnePenWhole', 'Mark one · the whole record pen with both groups, at 350 and 393', [4, 5]),
          ('MarkOneReading', 'Mark one · the reading with At draw and From freezer, at 350 and 393', [6, 7])]
GAP = 48; ROWH = 80; LABH = 100

def build(out):
    os.makedirs(out, exist_ok=True)
    rows = [(t, d, f(), w) for t, d, f, w in ROWS]
    sizes = {}
    for key, btitle, idx in BOARDS:
        css = [printstart.FONT, LABEL]; seen = set(); body = ''; y = GAP; bw = 0
        for ri in idx:
            rt, rd, panels, col = rows[ri]
            body += '<div style="position:absolute;left:%dpx;top:%dpx;width:1600px;"><p class="fp-title">%s</p><p class="fp-sub" style="max-width:1500px">%s</p></div>\n' % (GAP, y, rt, rd)
            y += ROWH; x = GAP; rowh = 0; cells = []
            for p in panels:
                vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
                if W not in seen: css.append(resolve_media(TOK, W, True)); seen.add(W)
                pc = resolve_media(APPC, W, True) + resolve_media(NBC, W, True); pc = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', pc)
                css.append(scope_css(pc + DRAWN, '.' + vid))
                y0, hh = crop_for(p); cells.append((vid, unique_ids(p['html'], vid), y0, hh, p)); rowh = max(rowh, hh)
            for vid, html, y0, hh, p in cells:
                ww = 350 if p['W'] == 1366 else 393
                body += ('<div style="position:absolute;left:%dpx;top:%dpx;width:%dpx;"><div style="height:%dpx;"><p class="fp-lab">%s</p></div>'
                         '<div class="fp-win %s" style="width:%dpx;height:%dpx;"><div style="width:%dpx;transform:translateY(-%dpx);">%s</div></div></div>\n' % (x, y, ww, LABH, p['cap'], vid, ww, hh, ww, y0, html))
                x += ww + GAP
            bw = max(bw, x); y += LABH + 8 + rowh + GAP
        bw = int(bw); y = int(y + 0.999); st = STAMP_READ if key == 'MarkOneReading' else STAMP
        main = '<div style="position:relative;width:%dpx;height:%dpx;background:#ffffff;">%s</div>' % (bw, y, body)
        open(out + '/' + key + '.dc.html', 'w').write(printstart.board(btitle + st, main, bw, y, ''.join(css) + '[hidden]{display:none !important}'))
        sizes[key] = (bw, y, btitle + st)
    # the probe: every panel at its natural size, one at a time (markone-measure.mjs shows each in turn)
    css = [printstart.FONT]; seen = set(); body = ''
    for p in PANELS:
        vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
        if W not in seen: css.append(resolve_media(TOK, W, True)); seen.add(W)
        pc = resolve_media(APPC, W, True) + resolve_media(NBC, W, True); pc = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', pc)
        css.append(scope_css(pc + DRAWN, '.' + vid))
        ww = 350 if W == 1366 else 393
        body += '<div data-pid="%s" class="fp-win %s" style="display:none;position:absolute;left:0;top:0;width:%dpx;"><div style="width:%dpx;">%s</div></div>\n' % (p['pid'], vid, ww, ww, unique_ids(p['html'], vid))
    open(out + '/markone-probe.html', 'w').write('<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s[hidden]{display:none !important}</style></head><body>%s</body></html>' % (''.join(css), body))
    return sizes

if __name__ == '__main__':
    print(build(sys.argv[1]), 'measured' if MEAS else 'not measured yet')
