# Sid, 2026-10-06 (Phase 4, D-07a; Mark via Sarge, 2026-10-06): the blank batch log, two letter pages printed front and back, drawn for the "Print formats" page.
# Which field sits on which side, the side names and the geometry are the print brief's (.impeccable/surfaces/route-print-recipe-sheet.md § 3 item 3 and § 6):
#   a blank line is a hairline baseline only; a mark-one row is the option words, each after its own tick box; a blank scale is five unfilled stops with the anchors in italic beneath;
#   every page carries a foot: recipe · version line · short code · page n of m.
# Field names, units, option words, axis names, anchors, group captions and the defects are the built record pens' own (app/src/domain/battery.js, axes.js; BatchRow.jsx's captions, read from the
# live pens in WebKit on the dist of 2026-10-06; 03.3.1-06-SUMMARY.md's field list for Phase 4). Where the built pen and the brief differ, the built version is drawn:
#   - side 2 carries "Tasted" (the tasting's date): the built tasting pen has it, the brief's side 2 does not list it;
#   - the axes stand under "Every recipe" and "This recipe only" (both), and the defects under "Any problems?" with "select all that apply" and the same two group captions, as the built pen draws them;
#   - each stop carries its number 1 to 5 above the box (the built stop shows its number), and the anchors are the built three: low, "right", high, under stops 1, 3 and 5.
# Order within a side follows the brief's list (§ 3 item 3); the built tasting pen orders them Tasted, Tempering, Tasting temperature, How did it turn out?, axes, Any problems?, Melt test, Melt style, Next time.
# Numeric fields are ruled fields carrying their units (brief § 3 item 3), not boxes. Black only. Placeholders in the foot: the short code and the page count, which Phase 4 derives (brief § 7: not invented here).
# Declared axes and the declared flaw are Olive Oil v1's own (Body, Oil; Bitter). Nothing here edits app/.
# Decided by Mark, 2026-10-06 (answers to the open log-page questions; they amend brief § 3 item 3, which goes to Impeccable with the other brief changes, not edited here):
#   D1 numeric fields stay ruled lines carrying their units (not boxes).
#   D2 both pages carry a date: page 1 Churn date, page 2 Tasted (brief side 2 gains the date).
#   D3 the printed Airiness caption drops "(estimated)": "Airiness" (the pen keeps its own caption).
#   D4 the defects keep the built caption, "Any problems?" with "select all that apply" (checked in Chrome's PDF and WebKit's print).
#   D5 Next time is about the recipe, not the batch or the tasting, and may sit on either page: it moves to page 1, where there was room, under its own heading in the side-title face,
#      set apart from the batch fields. Line counts (LINES below) are what the pages hold at the same type, measured by printstart-measure.mjs.
#   D6 (Mark, 2026-10-06, after the pages were approved): the original forms' mark-one fields come back as group heads. "At draw" heads the draw group on page 1 (Exit consistency, Airiness, At the machine);
#      "From freezer" heads the tasting group on page 2 (the scales, Any problems?, How did it turn out?). Each is three boxes, "Nothing to note", "Not evaluated", "See below", with "mark one" at the right
#      of the head, as the old Batch log printed them (old-sprinkles BatchLog.jsx; Mark's photo of page 5/6). The head is a rule, the group name in the group-head face (14px, 600, sentence case: the
#      face the app's group cues already read in, decision 40), and the three boxes. Ingredient notes and Next time (page 1) and the measured fields and Melt style (page 2) stay outside the groups.
#      To fit, the writing lines drop: LINES below says how many each page holds now (measured by markone-measure.mjs).
#   D8 (Mark, 2026-10-07, answer to decide-print-log-page-fit-safari; row draw-log-pages-vertical-space; drawn, NOT yet approved): the pages are redrawn to fit Safari's print layout, 675 x 900 px at 0.5 in margins
#      (WebKit prints 1 CSS px as 0.8 pt), with no scale, the D7 in-flow foot inside each page ("side n of 2", the Sheet code). The page is drawn at letter, 816 x 1056, with 0.5 in (48 px) margins, so the content box is
#      720 x 960 (Chrome); the layout is built to need no more than 900 px at 675 px wide. Savings, all of one kind (a line that carried one thing now carries two): (1) the date is a box in the upper right corner of the
#      page, on the title's line (Churn date, Tasted), so the date rows go; (2) a mark-one row is one line, the caption in a fixed column with its options beside it (Exit consistency, Airiness, Melt style);
#      (3) the group head is one line: the group name, the three boxes, "mark one" at the right; (4) "Any problems?" carries "select all that apply" on its own line, and the defects are two rows
#      (Every recipe, This recipe only), each a caption beside its options, not a column of four; (5) the margins go from 48/56/40 to 48 all round, which is the real print margin. Nothing else is cut: every field,
#      label, unit, option, anchor and the three boxes of D6 stay. LINES says how many writing lines each page then holds (measured: logfit.py and logfit-measure.mjs).
#   D8 follow-on (Mark, 2026-10-07, his note on look-log-pages-vertical-space: the date box was treated as a row, so everything under it started below the whole box and left a band of white; row draw-log-pages-date-box-flow):
#      the box FLOATS to the upper right and takes no row of its own. The title and the first fields sit beside it (page 1: Time to draw temp., Out of machine, Churn duration; page 2: Tempering, Tasting temperature,
#      Melt test), and what follows starts under them at full width. One consequence on page 2: Melt test's unit, "g lost at 20 min", sits UNDER its line (lf-field--under), because the three fields with their units at the
#      right do not fit beside the box at Safari's 675 (they would run 25 px under it, 57 px past the 32 px gap); with the unit under, the row ends 73 px short of the box. Measured: logfit-measure.mjs (clear = the gap between the box and what sits beside it).
#   D16 (Mark, 2026-10-07, row draw-hole-punch-left-margin; drawn, NOT yet approved): Mark hole-punches his printouts, so the left margin clears a standard 3-hole punch: 0.75 in (72 px) at the left, 0.5 in (48 px) at the other three edges.
#      Standard punch: holes about 9/32 in (0.28 in) across, centred 0.5 in from the edge, 4.25 in apart (his photo: about 0.29 in across, 4.25 in apart); the hole's inner edge is at 0.64 in, so the ink starts 0.11 in (10 px) clear of it.
#      Content box 696 x 960 in Chrome; in Safari (1 CSS px prints as 0.8 pt) 652 x 900. Measured by logfit-measure.mjs (four cases: this margin, and the same margin at both sides, for Mark's duplex question).
#   D17 (Mark, 2026-10-07, row draw-remove-draw-temp-rename-logs; drawn, NOT yet approved): 'Time to draw temp.' is dropped (it came from an instruction for immersion heaters in small jars), so page 1's figure row beside the date box
#      holds two fields, Out of machine and Churn duration; the side titles are renamed: 'At the machine' becomes 'Batch log' and 'When you taste it' becomes 'Tasting log'. The pen's own note, 'At the machine', is a separate field
#      (BatchRow.jsx), not renamed here; it is Mark's question (row decide-pen-at-the-machine-note), so page 1's writing field keeps the caption 'At the machine'. The field's removal from the app is a build decision (decide-cleanup-phase-before-print).
#   D19 (Mark, 2026-10-07, row draw-combined-notes-group-separation, from his photo of the earlier Batch log concept; drawn, NOT yet approved): (1) the notes of a page are ONE ruled section: a heading (Notes), the note types as cues at its right
#      (At the machine · Ingredient notes · Next time on page 1; How did it turn out? on page 2), a heavy rule, then the ruled lines (14 on page 1, which had 5, 5 and 4; 4 on page 2, which had 7); (2) At draw and From freezer are separated by job as in the
#      concept: the name in small caps with MARK ONE at the right, a heavy rule (--rule-tick) under it, the three boxes on their own line, then each row on its own hairline (Exit consistency, Airiness; one row per scale: name, low word, 1, five boxes,
#      5, high word, "right" under the third), 32 px of space above each group.
#   D21 (2026-10-07): the page title is 32px / 700 sentence case (was 14px / 600 uppercase); each scale is ONE 1.5px rule with five ticks that stand on it (end ticks 16px, the three between 8px), the rule from tick 1 to tick 5; page 2 holds 5 lines (6 need 900.2 px of Safari's 900); the boxes variant (TastingLogFormRule) is gone. At the machine is no longer inside At draw on paper (it already was not in the pen: D9, D11). The pen and the reading are not redrawn (Mark's row decide-pen-reading-follow-combined-notes).
#   D24 (2026-10-07, Mark's answer on decide-page-2-lines-after-cues): page 2 holds 5 writing lines (D23's 4 plus one); nothing else changes.
#   D23 (2026-10-07, Mark's answers on the rhythm review): page 1 stays at 14 lines; page 2 holds 4 (decide-rhythm-page-2-lines); the printed Tasting marks no longer carry the cues Every recipe and This recipe only (Mark: "that's more of a design-time consideration"):
#      the six scales are one list (Hardness, Scoopability, Smoothness, Sweetness, Body, Oil) and the five problems are one row under the cue Any problems? with 'select all that apply' (kept). The pen is not changed.
#   D25 (2026-10-07, Mark's note on look-phase-4-screens-final; row draw-recipe-declared-notation; declared.py draws the boards): the pages are parameterised by recipe. side1/side2 take the foot and, for page 2, the recipe's declared scales (declaredAxes) and declared problem (declaredFlaw);
#      the defaults are Olive Oil v1's own, so the approved boards come out byte for byte as before. `guide=True` adds the design-time notation (core / declared bars in a gutter OUTSIDE the page, classes and data attributes only, no change to the layout): it is for
#      the guide boards (declared.py) and never for BatchLogForm, TastingLogForm or the snapshot.
#   D26 (2026-10-07, Mark's answer on decide-declared-slots-complete: "anticipate 2 of each"; row draw-declared-two-slots-each; drawn, NOT yet approved): a recipe declares up to two scales and up to two problems, each 0, 1 or 2. side2's `axes_declared`
#      takes 0 to 2 scale rows and `flaw` takes None, one word or a list of up to two; the page itself is unchanged (the six scales and the problems row are lists that grow), so the defaults still draw the approved boards byte for byte.
from cssscope import TOK, APPC, resolve_media

AXES_CORE = [('Hardness', 'soft', 'hard'), ('Scoopability', 'crumbly', 'gummy'), ('Smoothness', 'grainy', 'smooth'), ('Sweetness', 'less', 'more')]
AXES_DECLARED = [('Body', 'thin', 'heavy'), ('Oil', 'faint', 'strong')]
DEFECTS = ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']
DECLARED_FLAW = 'Bitter'
EXIT = ['Smooth ribbon', 'Wet, soupy', 'Chunky, separated']
AIR = ['Low, dense', 'Medium, standard', 'High, airy']
MELT = ['Watery, weeping', 'Creamy puddle', 'Stable foam']
FOOT = 'Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · [short code] · Side {n} of 2'   # D7: the Sheet code and side n of 2; the short code is Phase 4's, a placeholder here

CSS = '''
.lf{width:816px;height:1056px;box-sizing:border-box;padding:48px 74px 48px 72px;display:flex;flex-direction:column;background:#ffffff;color:var(--sheet-ink);font-family:var(--face-grotesk)}
.lf *{color:var(--sheet-ink)}
.lf-body{flex:none;margin-bottom:16px}   /* D22: at least 16 px between the last line and the foot rule (was 20) */
.lf .region-name{font-size:var(--sheet-type-section);margin:0}
.lf-datebox{float:right;box-sizing:border-box;width:168px;height:52px;margin:0 0 0 var(--gap-l);border:var(--rule-ink-field) solid var(--sheet-ink);padding:var(--gap-xs) var(--gap-s)}
.lf .lf-title{margin:0 0 var(--gap-s);font-size:var(--sheet-size-recipe-name);font-weight:700;line-height:1.1;letter-spacing:-0.01em;text-transform:none}   /* D21: the page title at the Sheet title's own size (2rem, 32px), weight 700, sentence case; it was 14px 600 uppercase, 2 px over the group names */
.lf-datebox .pen-caption{margin:0}
.lf-sec{margin:0 0 var(--gap-m)}
.lf-row{display:flex;column-gap:var(--gap-m);row-gap:var(--gap-l);flex-wrap:wrap;align-items:flex-start}
.lf-field .pen-caption{margin:0 0 var(--gap-xs)}
.lf-rule{display:flex;align-items:flex-end;gap:var(--gap-field-unit)}
.lf-base{display:block;height:32px;border-bottom:var(--rule-ink-field) solid var(--sheet-ink)}
.lf-base--figure{width:96px}
.lf-unit{font-size:var(--sheet-type-control);line-height:1;padding-bottom:2px}
.lf-field--under .lf-rule{flex-direction:column;align-items:flex-start;gap:var(--gap-xs)}
.lf-field--under .lf-unit{padding-bottom:0}
.lf-mark{display:flex;gap:var(--gap-m);flex-wrap:wrap;font-size:var(--sheet-type-control);line-height:var(--sheet-leading-control)}
.lf-opt{display:inline-flex;align-items:center;gap:var(--gap-xs)}
.lf-box{display:inline-block;width:14px;height:14px;border:var(--rule-ink-field) solid var(--sheet-ink);box-sizing:border-box}
.lf-mrow{display:grid;grid-template-columns:150px 1fr;column-gap:var(--gap-s);align-items:baseline;margin:0 0 var(--gap-s)}
.lf-mrow .pen-caption,.lf-mrow p{margin:0}
.lf-mrow--plain{display:block}   /* D23: a row with no caption column */
.lf-mrow + .lf-sec{margin-top:var(--gap-m)}
.lf-lines{display:flex;flex-direction:column}
.lf-line{height:32px;border-bottom:var(--rule-ink-field) solid var(--sheet-ink)}
.lf-axes{display:grid;grid-template-columns:1fr 1fr 1fr;column-gap:var(--gap-l);row-gap:var(--gap-m)}
.lf-cue{grid-column:span 2}
.lf-cue--declared{grid-column:3;grid-row:1}
.lf-axis .axis-mark__name{display:block;margin:0 0 var(--gap-xs)}
.lf-stops{display:grid;grid-template-columns:repeat(5,var(--sheet-stop-w));justify-items:center;row-gap:var(--gap-hair)}
.lf-num{font-size:var(--sheet-size-mark-stop);line-height:1}
.lf-anchor{font-family:var(--face-text);font-style:italic;font-size:var(--sheet-type-control);line-height:1.2;white-space:nowrap}
.lf-dhead .pen-helper{margin:0}
.lf-dhead.lf-sub{display:flex;align-items:baseline;gap:var(--gap-s)}
.lf-group{margin:var(--gap-l) 0 0}
.lf-group--last{margin-bottom:0}
.lf-ghead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:var(--rule-tick) solid var(--sheet-ink);padding:0 0 var(--gap-xs);margin:0 0 var(--gap-s)}
.lf-gname,.lf-gcue{font-family:var(--face-grotesk);font-weight:600;text-transform:uppercase;line-height:var(--sheet-leading-section)}
.lf-gname{font-size:var(--sheet-type-section);letter-spacing:0.04em}   /* D22: the section head is the Sheet's own (14px, 600, caps, 0.04em); D19 had 12px at 0.06em */
.lf-gcue{font-size:var(--sheet-type-label);font-weight:500;letter-spacing:0.04em}   /* D22: the cue at the right is the caption face (12px, 500, 0.04em) */
.lf-sub{display:block;margin:var(--gap-s) 0 0;font-family:var(--face-grotesk);font-size:var(--sheet-type-section);font-weight:600;line-height:var(--sheet-leading-section);text-transform:none;letter-spacing:0}   /* D22: a sub-group cue takes the app's group-cue face (D23: only Any problems? is left; Every recipe and This recipe only are not printed) (sketch 011 decision 40: sentence case, 600), not the item caption's */
.lf-verdict{display:flex;gap:var(--gap-l);font-size:var(--sheet-type-control);line-height:var(--sheet-leading-control);margin:0 0 var(--gap-xs)}
.lf-group .lf-mrow{border-bottom:var(--rule-ink-field) solid var(--sheet-ink);padding:var(--gap-xs) 0 var(--gap-hair);margin:0}
.lf-srow{display:grid;grid-template-columns:150px 1fr;column-gap:var(--gap-s);align-items:start;border-bottom:var(--rule-ink-field) solid var(--sheet-ink);padding:var(--gap-hair) 0 var(--gap-field-unit)}   /* D22: 4 px under 'right' (was 6), to pay for the cues' own space */
.lf-srow .axis-mark__name{padding-top:3px}
.lf-sc{display:grid;grid-template-columns:76px 14px repeat(5,var(--sheet-stop-w)) 14px 76px;justify-items:center;align-items:end}
.lf-sc .lf-anchor{padding:0}
.lf-sc .lf-num{font-size:var(--sheet-size-mark-stop);line-height:1}
.lf-sc .lf-lo{grid-column:1;grid-row:1;justify-self:end}
.lf-sc .lf-n1{grid-column:2;grid-row:1;justify-self:end}
.lf-sc .lf-n5{grid-column:8;grid-row:1;justify-self:start}
.lf-sc .lf-hi{grid-column:9;grid-row:1;justify-self:start}
.lf-sc .lf-mid{grid-column:5;grid-row:2;justify-self:center;margin-top:0;font-size:var(--sheet-size-small-print);line-height:1}
.lf-track{grid-column:3 / 8;grid-row:1;justify-self:stretch;align-self:end;box-sizing:content-box;margin:0 calc(var(--sheet-stop-w) / 2);height:16px;border-bottom:var(--rule-ink-field) solid var(--sheet-ink);position:relative}   /* D21: ONE rule from tick 1 to tick 5 (the margin is half a stop, so the rule starts and ends at the end ticks' centres) and the five ticks stand on it */
.lf-tick{position:absolute;bottom:0;width:0;height:8px;border-left:var(--rule-ink-field) solid var(--sheet-ink)}
.lf-tick--end{height:16px}
.lf-tick--1{left:0}
.lf-tick--2{left:25%}
.lf-tick--3{left:50%}
.lf-tick--4{left:75%}
.lf-tick--5{right:0}
.lf-notes{margin:var(--gap-l) 0 0}   /* D22: the same 32 px above Notes as above every group (was 20) */
.lf-notes .lf-lines{margin-top:var(--gap-xs)}
.lf-foot{margin-top:auto;padding-top:var(--gap-xs);border-top:var(--rule-ink-field) solid var(--sheet-ink);font-size:var(--sheet-size-small-print);letter-spacing:0.02em}
'''

GUIDE_CSS = '''
.lf .gd{position:relative}
.lf .gd::before{content:'';position:absolute;top:2px;bottom:2px;left:752px;width:4px;background:var(--gc)}
.lf .gd::after{content:attr(data-gd);position:absolute;left:764px;top:50%;transform:translateY(-50%);white-space:nowrap;font-family:var(--face-grotesk);font-size:12px;font-weight:600;line-height:1.2;color:var(--gc)}
.lf .gd-core{--gc:#595959}
.lf .gd-decl{--gc:#7a2e8e}
.lf .gd-cont::after{content:none}
.lf .gd-opt{outline:1.5px dashed #7a2e8e;outline-offset:3px}
.lf .gd-gap{position:relative;height:0;margin:0;padding:0}
.lf .gd-gap::before{content:'';position:absolute;top:0;left:752px;width:4px;height:0;border-top:2px dashed #7a2e8e;width:12px}
.lf .gd-gap::after{content:attr(data-gd);position:absolute;left:770px;top:0;transform:translateY(-50%);white-space:nowrap;font-family:var(--face-grotesk);font-size:12px;font-weight:600;line-height:1.2;color:#7a2e8e}
'''

def lines(n): return '<div class="lf-lines">' + '<div class="lf-line"></div>' * n + '</div>'
def opts(words): return ''.join(f'<span class="lf-opt"><span class="lf-box"></span>{w}</span>' for w in words)
def datebox(label): return f'<div class="lf-datebox"><span class="pen-caption">{label}</span></div>'
def top(title, date_label): return f'{datebox(date_label)}<h2 class="region-name lf-title">{title}</h2>'   # the box floats to the upper right; the title, the figure row and anything that fits flow beside it, the rest under it
def ruled(label, unit=None, under=False):
    u = f'<span class="lf-unit">{unit}</span>' if unit else ''
    return f'<div class="lf-field{" lf-field--under" if under else ""}"><span class="pen-caption">{label}</span><div class="lf-rule"><span class="lf-base lf-base--figure"></span>{u}</div></div>'
def mark_one(label, words):
    return f'<div class="lf-mrow"><span class="pen-caption">{label}</span><div class="lf-mark">{opts(words)}</div></div>'
VERDICT = ['Nothing to note', 'Not evaluated', 'See below']
def group_head(name):
    return f'<div class="lf-ghead"><span class="lf-gname">{name}</span><span class="lf-gcue">mark one</span></div><div class="lf-verdict">{opts(VERDICT)}</div>'   # D19: the name and MARK ONE on one line, a heavy rule, then the three boxes on their own line
def notes_section(cues, n, guide=False):
    g = ' gd gd-core" data-gd="core' if guide else ''
    return f'<div class="lf-notes{g}"><div class="lf-ghead"><span class="lf-gname">Notes</span><span class="lf-gcue">{cues}</span></div>{lines(n)}</div>'   # D19: one ruled section, the note types as cues at the right of the heading
def prose(label, n): return f'<div class="lf-sec"><span class="pen-caption">{label}</span>{lines(n)}</div>'
def scale(name, low, high):
    # D21: one rule with five ticks that rise above it only; the rule runs from tick 1 to tick 5 and no further; the end ticks are 16 px, the three between 8 px (Mark's photo of the earlier Batch log)
    boxes = '<span class="lf-track">' + ''.join(f'<span class="lf-tick lf-tick--{i}{" lf-tick--end" if i in (1, 5) else ""}"></span>' for i in range(1, 6)) + '</span>'
    anchors = (f'<span class="lf-anchor lf-lo">{low}</span><span class="lf-num lf-n1">1</span><span class="lf-num lf-n5">5</span><span class="lf-anchor lf-hi">{high}</span><span class="lf-anchor lf-mid">right</span>')
    return f'<div class="lf-srow"><span class="axis-mark__name">{name}</span><div class="lf-sc">{boxes}{anchors}</div></div>'   # D19: one row per scale on a hairline: the name, the low word, 1, the rule with its five ticks, 5, the high word; "right" under the third tick

def side1(n_notes, foot=FOOT, guide=False):
    title = top('Batch log', 'Churn date')
    if guide: title = title.replace('<h2 class="region-name lf-title">', '<h2 class="region-name lf-title gd gd-core" data-gd="core">')
    body = (title
            + '<div class="lf-sec lf-row' + ('' if not guide else ' gd gd-core" data-gd="core') + '">' + ruled('Out of machine', '°C') + ruled('Churn duration', 'min') + '</div>'
            + '<div class="lf-group' + ('' if not guide else ' gd gd-core" data-gd="core') + '">' + group_head('At draw') + mark_one('Exit consistency', EXIT) + mark_one('Airiness', AIR) + '</div>'
            + notes_section('At the machine · Ingredient notes · Next time', n_notes, guide))   # D19: the three notes are one section; Next time (the recipe's own, D5) is a cue in it
    return f'<div class="lf"><div class="lf-body">{body}</div><div class="lf-foot">{foot.format(n=1)}</div></div>'

def side2(n_how, axes_declared=AXES_DECLARED, flaw=DECLARED_FLAW, foot=FOOT, guide=False, gap_notes=None):
    # D25: the recipe's own declared scales and declared problem come in as arguments (version.declaredAxes, version.declaredFlaw); none declared means none drawn
    def sc(a, kind, label):
        r = scale(*a)
        return r.replace('<div class="lf-srow">', '<div class="lf-srow gd gd-%s" data-gd="%s">' % (kind, label), 1) if guide else r
    axes = ''.join(sc(a, 'core', 'core') for a in AXES_CORE)
    if guide and gap_notes and not axes_declared: axes += '<div class="gd-gap" data-gd="%s"></div>' % gap_notes['axes']
    axes += ''.join(sc(a, 'decl', 'declared') for a in axes_declared)   # D23: the six scales are one list; the cues Every recipe and This recipe only are not printed (Mark: "more of a design-time consideration")
    flaws = [flaw] if isinstance(flaw, str) else list(flaw or [])   # D26: a recipe declares up to two problems; `flaw` is one word (as before), None, or a list of up to two
    words = DEFECTS + flaws
    o = opts(words)
    for f in flaws:
        if guide: o = o.replace(f'<span class="lf-opt"><span class="lf-box"></span>{f}</span>', f'<span class="lf-opt gd-opt"><span class="lf-box"></span>{f}</span>', 1); assert 'gd-opt' in o
    if not guide: row_attr = ''
    elif flaws: row_attr = ' gd gd-decl" data-gd="core ×4 · declared: %s' % ', '.join(flaws)
    else: row_attr = ' gd gd-core" data-gd="%s' % ((gap_notes or {}).get('flaw', 'core ×4'))
    defects = ('<p class="lf-dhead lf-sub' + ('' if not guide else ' gd gd-core" data-gd="core') + '"><span class="lf-subname">Any problems?</span><span class="pen-helper">select all that apply</span></p>'
               f'<div class="lf-mrow lf-mrow--plain{row_attr}"><div class="lf-mark">{o}</div></div>')   # D23: the five problems are one row under the cue, no group captions
    title = top('Tasting log', 'Tasted')
    if guide: title = title.replace('<h2 class="region-name lf-title">', '<h2 class="region-name lf-title gd gd-core" data-gd="core">')
    ghead = group_head('From freezer')
    if guide: ghead = ghead.replace('<div class="lf-ghead">', '<div class="lf-ghead gd gd-core" data-gd="core">', 1).replace('<div class="lf-verdict">', '<div class="lf-verdict gd gd-core" data-gd="core">', 1)
    body = (title
            + '<div class="lf-sec lf-row' + ('' if not guide else ' gd gd-core" data-gd="core') + '">' + ruled('Tempering', 'min') + ruled('Tasting temperature', '°C') + ruled('Melt test', 'g lost at 20 min', under=True) + '</div>'
            + (mark_one('Melt style', MELT).replace('<div class="lf-mrow">', '<div class="lf-mrow gd gd-core" data-gd="core">', 1) if guide else mark_one('Melt style', MELT))
            + '<div class="lf-group">' + ghead + axes + defects + '</div>'
            + notes_section('How did it turn out?', n_how, guide))
    return f'<div class="lf"><div class="lf-body">{body}</div><div class="lf-foot">{foot.format(n=2)}</div></div>'

def css():
    return resolve_media(TOK, 816, False, screen=False) + resolve_media(APPC, 816, False, screen=False) + CSS

# line counts: as many writing lines as the page holds in Safari's 675 x 900 box with the foot (measured, logfit-measure.mjs), split as the brief lists the prose fields
LINES = {'side1': (14,), 'side2': (5,)}   # D24: page 2 at 5 (Mark, decide-page-2-lines-after-cues); D23 had 4, D20 to D22 had 5   # D1 to D5's counts again: D8's savings (about 180 px a page) hold them inside Safari's 900 px with 40 px or more to spare (logfit-measure.mjs); D6 had (4, 3, 4) and (5,)
