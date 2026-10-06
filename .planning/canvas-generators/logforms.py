# Sid, 2026-10-06 (Phase 4, D-07a; Mark via Sarge, 2026-10-06): the blank batch log, two letter pages printed front and back, drawn for the "Print formats" page.
# Which field sits on which side, the side names and the geometry are the print brief's (.impeccable/surfaces/route-print-recipe-sheet.md § 3 item 3 and § 6):
#   a blank line is a hairline baseline only; a mark-one row is the option words, each after its own tick box; a blank scale is five unfilled stops with the anchors in italic beneath;
#   every page carries a foot: recipe · version line · short code · page n of m.
# Field names, units, option words, axis names, anchors, group captions and the defects are the built record pens' own (app/src/domain/battery.js, axes.js; BatchRow.jsx's captions, read from the
# live pens in WebKit on the dist of 2026-10-06; 03.3.1-06-SUMMARY.md's field list for Phase 4). Where the built pen and the brief differ, the built version is drawn:
#   - side 2 carries "Tasted" (the tasting's date): the built tasting pen has it, the brief's side 2 does not list it;
#   - "Airiness (estimated)", the built caption, not the brief's "Airiness";
#   - the axes stand under "Every recipe" and "This recipe only" (both), and the defects under "Any problems?" with "select all that apply" and the same two group captions, as the built pen draws them;
#   - each stop carries its number 1 to 5 above the box (the built stop shows its number), and the anchors are the built three: low, "right", high, under stops 1, 3 and 5.
# Order within a side follows the brief's list (§ 3 item 3); the built tasting pen orders them Tasted, Tempering, Tasting temperature, How did it turn out?, axes, Any problems?, Melt test, Melt style, Next time.
# Numeric fields are ruled fields carrying their units (brief § 3 item 3), not boxes. Black only. Placeholders in the foot: the short code and the page count, which Phase 4 derives (brief § 7: not invented here).
# Declared axes and the declared flaw are Olive Oil v1's own (Body, Oil; Bitter). Nothing here edits app/.
from cssscope import TOK, APPC, resolve_media

AXES_CORE = [('Hardness', 'soft', 'hard'), ('Scoopability', 'crumbly', 'gummy'), ('Smoothness', 'grainy', 'smooth'), ('Sweetness', 'less', 'more')]
AXES_DECLARED = [('Body', 'thin', 'heavy'), ('Oil', 'faint', 'strong')]
DEFECTS = ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']
DECLARED_FLAW = 'Bitter'
EXIT = ['Smooth ribbon', 'Wet, soupy', 'Chunky, separated']
AIR = ['Low, dense', 'Medium, standard', 'High, airy']
MELT = ['Watery, weeping', 'Creamy puddle', 'Stable foam']
FOOT = 'Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · [short code] · Page {n} of [m]'

CSS = '''
.lf{width:816px;height:1056px;box-sizing:border-box;padding:48px 56px 40px;display:flex;flex-direction:column;background:#ffffff;color:var(--sheet-ink);font-family:var(--face-grotesk)}
.lf *{color:var(--sheet-ink)}
.lf .region-name{font-size:var(--sheet-type-section);margin:0 0 var(--gap-m)}
.lf-sec{margin:0 0 var(--gap-m)}
.lf-row{display:flex;gap:var(--gap-l);flex-wrap:wrap}
.lf-field .pen-caption{margin:0 0 var(--gap-xs)}
.lf-rule{display:flex;align-items:flex-end;gap:var(--gap-field-unit)}
.lf-base{display:block;height:32px;border-bottom:var(--rule-ink-field) solid var(--sheet-ink)}
.lf-base--date{width:var(--sheet-field-w-date)}
.lf-base--figure{width:96px}
.lf-unit{font-size:var(--sheet-type-control);line-height:1;padding-bottom:2px}
.lf-mark{display:flex;gap:var(--gap-m);flex-wrap:wrap;font-size:var(--sheet-type-control);line-height:var(--sheet-leading-control)}
.lf-opt{display:inline-flex;align-items:center;gap:var(--gap-xs)}
.lf-box{display:inline-block;width:14px;height:14px;border:var(--rule-ink-field) solid var(--sheet-ink);box-sizing:border-box}
.lf-lines{display:flex;flex-direction:column}
.lf-line{height:32px;border-bottom:var(--rule-ink-field) solid var(--sheet-ink)}
.lf-axes{display:grid;grid-template-columns:1fr 1fr 1fr;column-gap:var(--gap-l);row-gap:var(--gap-m)}
.lf-cue{grid-column:span 2}
.lf-cue--declared{grid-column:3;grid-row:1}
.lf-axis .axis-mark__name{display:block;margin:0 0 var(--gap-xs)}
.lf-stops{display:grid;grid-template-columns:repeat(5,var(--sheet-stop-w));justify-items:center;row-gap:var(--gap-hair)}
.lf-num{font-size:var(--sheet-size-mark-stop);line-height:1}
.lf-stop{width:22px;height:22px;border:var(--rule-ink-field) solid var(--sheet-ink);box-sizing:border-box}
.lf-anchor{font-family:var(--face-text);font-style:italic;font-size:var(--sheet-type-control);line-height:1.2;white-space:nowrap}
.lf-defects{display:grid;grid-template-columns:1fr 1fr 1fr;column-gap:var(--gap-l)}
.lf-defects>:first-child{grid-column:span 2}
.lf-defects .lf-mark{flex-direction:column;gap:var(--gap-xs)}
.lf-foot{margin-top:auto;padding-top:var(--gap-xs);border-top:var(--rule-ink-field) solid var(--sheet-ink);font-size:var(--sheet-size-small-print);letter-spacing:0.02em}
'''

def lines(n): return '<div class="lf-lines">' + '<div class="lf-line"></div>' * n + '</div>'
def ruled(label, unit=None, kind='figure'):
    u = f'<span class="lf-unit">{unit}</span>' if unit else ''
    return f'<div class="lf-field"><span class="pen-caption">{label}</span><div class="lf-rule"><span class="lf-base lf-base--{kind}"></span>{u}</div></div>'
def mark_one(label, opts):
    o = ''.join(f'<span class="lf-opt"><span class="lf-box"></span>{w}</span>' for w in opts)
    return f'<div class="lf-sec"><span class="pen-caption">{label}</span><div class="lf-mark">{o}</div></div>'
def prose(label, n): return f'<div class="lf-sec"><span class="pen-caption">{label}</span>{lines(n)}</div>'
def scale(name, low, high):
    nums = ''.join(f'<span class="lf-num">{i}</span>' for i in range(1, 6)); boxes = '<span class="lf-stop"></span>' * 5
    anchors = f'<span class="lf-anchor">{low}</span><span></span><span class="lf-anchor">right</span><span></span><span class="lf-anchor">{high}</span>'
    return f'<div class="lf-axis"><span class="axis-mark__name">{name}</span><div class="lf-stops">{nums}{boxes}{anchors}</div></div>'

def side1(n_machine, n_notes):
    body = ('<h2 class="region-name">At the machine</h2>'
            f'<div class="lf-sec">{ruled("Churn date", kind="date")}</div>'
            '<div class="lf-sec lf-row">' + ruled('Time to draw temp.', 'min') + ruled('Out of machine', '°C') + ruled('Churn duration', 'min') + '</div>'
            + mark_one('Exit consistency', EXIT) + mark_one('Airiness (estimated)', AIR)
            + prose('At the machine', n_machine) + prose('Ingredient notes', n_notes))
    return f'<div class="lf">{body}<div class="lf-foot">{FOOT.format(n=1)}</div></div>'

def side2(n_how, n_next):
    axes = ('<div class="lf-sec lf-axes"><p class="pen-caption lf-cue">Every recipe</p><p class="pen-caption lf-cue lf-cue--declared">This recipe only</p>'
            + scale(*AXES_CORE[0]) + scale(*AXES_CORE[1]) + scale(*AXES_DECLARED[0]) + scale(*AXES_CORE[2]) + scale(*AXES_CORE[3]) + scale(*AXES_DECLARED[1]) + '</div>')
    dfx = ''.join(f'<span class="lf-opt"><span class="lf-box"></span>{w}</span>' for w in DEFECTS)
    defects = ('<div class="lf-sec"><p class="pen-caption">Any problems?</p><p class="pen-helper" style="margin:0 0 var(--gap-s)">select all that apply</p><div class="lf-defects">'
               f'<div><p class="pen-caption">Every recipe</p><div class="lf-mark">{dfx}</div></div>'
               f'<div><p class="pen-caption">This recipe only</p><div class="lf-mark"><span class="lf-opt"><span class="lf-box"></span>{DECLARED_FLAW}</span></div></div></div></div>')
    body = ('<h2 class="region-name">When you taste it</h2>'
            f'<div class="lf-sec">{ruled("Tasted", kind="date")}</div>'
            '<div class="lf-sec lf-row">' + ruled('Tempering', 'min') + ruled('Tasting temperature', '°C') + ruled('Melt test', 'g lost at 20 min') + '</div>'
            + mark_one('Melt style', MELT) + axes + defects + prose('How did it turn out?', n_how) + prose('Next time', n_next))
    return f'<div class="lf">{body}<div class="lf-foot">{FOOT.format(n=2)}</div></div>'

def css():
    return resolve_media(TOK, 816, False, screen=False) + resolve_media(APPC, 816, False, screen=False) + CSS

# line counts: as many writing lines as the page holds above the foot (measured, printstart-measure.mjs forms), split as the brief lists the prose fields
LINES = {'side1': (8, 8), 'side2': (3, 3)}
