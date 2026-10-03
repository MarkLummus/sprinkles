import sys; sys.argv=['x']
from gen import *
import json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-02 (todo 2026-09-25-draw-the-record-pen-in-app-context; route-recipe-batch.md's 2026-09-23 amendment: the battery's
# visual treatment "moves to App context and is drawn on the 03.5 canvas, not invented by a builder"). No board drew the batch
# pen's recording state, so the app's battery still wears sketch 007/008's Sheet grammar (square ink boxes, a pen-blue picked fill)
# in the App's log column. Every board below is the built app's own markup, captured from the running app (pen-capture.json: Olive
# Oil v1, Record another, Add tasting, with values typed and stops, segments and two defects picked; the churn and tasted dates are
# set below), with ONE added stylesheet block, SKIN. The skin changes colour, corner radius and rule colour only: no width, height,
# gap or font size moves, so the pen's measured limits (decision 28: the stacked arrangement needs a 216px frame, the wide one 594)
# hold for the drawn pen exactly as for the built one. Every value is one the App already carries: the divider and neutral tokens, the
# 8px field radius and 10px action radius of 1600-pen.html, and the filled action's colour (app blue text companion, white label).
CAP = json.load(open(HERE + '/pen-capture.json'))

# Typed values the capture could not carry (a date input's value is a property, not an attribute)
def with_dates(html):
    html = html.replace('type="date" value=""', 'type="date" value="2026-08-02"', 1)
    html = html.replace('type="date" value=""', 'type="date" value="2026-08-04"', 1)
    return html

# The skin. Interactive boxes keep a boundary that reads at 3:1 (app-text-secondary, 7.0:1 on white); text fields and the page's
# own rules take the hairline divider, as 1600-pen.html draws the version pen's fields. The picked fill is the one open choice: the
# filled action's colour, since pen blue in the App is the maker's own words in the hand and the reading view already shows measured
# figures in ink.
SKIN = '''
/* App-context skin for the record pen: colour, radius and rule colour only; no size moves (decision 29) */
.notebook-log *{border-color:var(--app-divider)}
.notebook-log .pen-caption{color:var(--app-text-secondary)}
.notebook-log .ink-field{border-radius:var(--app-notebook-field-radius);color:var(--app-text)}
.notebook-log .axis-mark__stop,.notebook-log .segmented__option{border-color:var(--app-text-secondary)}
.notebook-log .axis-mark__stop:first-child,.notebook-log .segmented__option:first-child{border-top-left-radius:var(--app-notebook-field-radius);border-bottom-left-radius:var(--app-notebook-field-radius)}
.notebook-log .axis-mark__stop:last-child,.notebook-log .segmented__option:last-child{border-top-right-radius:var(--app-notebook-field-radius);border-bottom-right-radius:var(--app-notebook-field-radius)}
.notebook-log .axis-mark__stop:has(input[type='radio']:checked),.notebook-log .segmented__option:has(input[type='radio']:checked){background:var(--app-blue-text);border-color:var(--app-blue-text);color:var(--app-background)}
.notebook-log .chip-toggle::before{border-color:var(--app-text-secondary);border-radius:var(--app-radius-rail)}
.notebook-log .chip-toggle[aria-pressed='true']::before{background:var(--app-blue-text);border-color:var(--app-blue-text)}
.notebook-log .save-ceremony button{border-color:var(--app-blue-text);border-radius:var(--app-radius-action);color:var(--app-blue-text);background:none}
.notebook-log .save-ceremony button:last-of-type{background:var(--app-blue-text);color:var(--app-background)}
'''

# The canvas's stylesheet asset predates notebook.css and some tokens (53 of tokens.css's 182 custom properties are absent from it, and
# none of notebook.css's rules are in it), and the log is the App's own markup, so these boards carry the app's current tokens.css,
# app.css and notebook.css verbatim after it. Their media blocks answer the viewing window (the canvas gives an artboard no narrow
# viewport), so the 393 board adds FORCED, as every other 393 board does, and the 350 board reads as the 1366 rung.
APP_ROOT = os.path.join(HERE, '..', '..', 'app', 'src', 'styles')
APP_CSS = ''.join(open(os.path.join(APP_ROOT, f)).read() + '\n' for f in ('tokens.css', 'app.css', 'notebook.css'))

def dc(fn, title, w, h, main, css):
    html = board(title, w, h, '', extra_css=css + '[hidden]{display:none !important}')
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + fn, 'w').write(html)

def column(w, pad):
    return f'<div style="width:{w}px;box-sizing:border-box;background:{APP_BG};padding:24px {pad}px 40px;">{with_dates(CAP["pen350"])}</div>'

# 350: the log column beside the Sheet from 1366 (decision 16); 393: the phone's full-width log with the 20px margin
H350, H393 = 2280, 2720
NO_PAD = '.notebook-log{padding:8px 0 0}\n'
dc('R35C_PenApp350.dc.html', 'C · 350 · the record pen in the log column · App context (drawn 2026-10-02, awaiting Mark\'s look)', 350, H350, column(350, 0), APP_CSS + NO_PAD + SKIN)
dc('R35C_PenApp393.dc.html', 'C · 393 · the record pen at the phone · App context (drawn 2026-10-02, awaiting Mark\'s look)', 393, H393, column(393, 20), APP_CSS + FORCED + NO_PAD + SKIN)
dc('R35C_PenAsBuilt350.dc.html', 'C · 350 · the record pen as built · Sheet grammar in the log column (reference)', 350, H350, column(350, 0), APP_CSS + NO_PAD)

Y = 40300
ENTRIES = {
  'R35C_PenAsBuilt350.dc.html': dict(x=0, y=Y, w=350, h=H350, page='page-13', title='C · 350 · the record pen as built · Sheet grammar in the log column (reference)'),
  'R35C_PenApp350.dc.html': dict(x=430, y=Y, w=350, h=H350, page='page-13', title='C · 350 · the record pen in the log column · App context (drawn 2026-10-02, awaiting Mark\'s look)'),
  'R35C_PenApp393.dc.html': dict(x=860, y=Y, w=393, h=H393, page='page-13', title='C · 393 · the record pen at the phone · App context (drawn 2026-10-02, awaiting Mark\'s look)'),
}
NOTES = {
  'r35-penapp-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': Y - 240, 'maxW': 1253, 'text': 'The record pen in App context (drawn 2026-10-02, awaiting Mark\'s look)'},
  'r35-penapp-note': {'fill': 'gray', 'page': 'page-13', 'x': 1333, 'y': Y, 'w': 400, 'text': 'Nothing drew the batch pen\'s recording state, so the app wears the Sheet\'s square ink boxes and pen-blue fill in the App\'s log column. Left: as built. Middle and right: the same markup, captured from the running app (Olive Oil v1, Record another, Add tasting, with values typed and some stops, segments and defects picked), with one skin on top. The skin changes colour, corner radius and rule colour only; no width, height, gap or font size moves, so the measured limits hold (the stacked arrangement needs a 216px frame, the wide one 594; the 350 column has 134 to spare).\n\nFields keep the App\'s hairline and 8px radius (as 1600-pen.html draws them) and their typed numbers read in ink; the maker\'s notes keep pen blue. Joined stops and segments take an 8px outer radius and a 7:1 boundary; the picked one fills in the filled action\'s blue with a white label. Defect squares round to 4px and fill the same way. Cancel is the outline action, Save batch the filled one. The one open choice is the picked fill: app blue, since pen blue in the App is the maker\'s words in the hand. The hairline on text fields is 1.4:1 on white, as on the version pen; WCAG 1.4.11 asks 3:1 of a control\'s boundary.'},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/pen-canvas-entries.json', 'w'), indent=2)
print('ok')
