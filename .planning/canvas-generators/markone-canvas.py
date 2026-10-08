# Sid, 2026-10-06, revised 2026-10-07 (log pages: the date box flows; D11b: Next time above the From freezer field; D11: the notes above At draw, the melt fields above From freezer; D6, D6a, D6b, D9 and D10, At draw and From freezer; a pick hides the group's evaluation fields, the notes stay, a mark turns the field's options off and the field stays): prepares the canvas files for the revised log pages and the three pen boards, from a canvas.json read from the artifact root just before publishing.
#   python3 markone-canvas.py <canvas.json as read from the root> <out dir>      writes <out>/project/{BatchLogForm,TastingLogForm,MarkOnePenStates,MarkOnePenWhole,MarkOneReading}.dc.html and <out>/project/canvas.json
# The log pages come from logforms.py (its D6 section), the pen boards from markone.py (markone-capture.mjs, then markone-measure.mjs on its probe, then markone.py again). Nothing else on the canvas is touched:
# the index keeps every other board, note and key as read; the two log boards keep their frames; the three pen boards sit on Print formats after the recipe page as built.
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import printstart, logforms, markone
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out + '/project', exist_ok=True)
c = json.load(open(src)); B = c['boards']; N = c['notes']
fcss = logforms.css()
open(out + '/project/BatchLogForm.dc.html', 'w').write(printstart.board(printstart.T_F1, logforms.side1(*logforms.LINES['side1']), 816, 1056, fcss, paper=True))
open(out + '/project/TastingLogForm.dc.html', 'w').write(printstart.board(printstart.T_F2, logforms.side2(*logforms.LINES['side2']), 816, 1056, fcss, paper=True))
B['BatchLogForm.dc.html']['title'] = printstart.T_F1
B['TastingLogForm.dc.html']['title'] = printstart.T_F2
sizes = markone.build(out + '/project')
x = 5440
for key, (w, h, title) in sizes.items():
    fn = key + '.dc.html'
    B[fn] = dict(x=x, y=0, w=w, h=h, page='page-11', title=title)
    if fn not in c['order']: c['order'].append(fn)
    x += w + 80
N.setdefault('markone-title', {}).update(dict(x=5440, y=-300, text='Mark one fields in the app: At draw and From freezer', kind='title1', maxW=sizes['MarkOnePenStates'][0] + 80 + sizes['MarkOnePenWhole'][0], page='page-11'))
N.setdefault('markone-note', {}).update(dict(x=5440, y=sizes['MarkOnePenStates'][1] + 80, w=420, fill='gray', page='page-11', text=(
    "Redrawn 2026-10-07 for your note on the double rule above At draw; nothing approved. The reading was redrawn again for your answer on Next time: it does not hide with Tasting, so it is back outside the Tasting fold, after it, always visible, and it follows the From freezer word (or the scales and Any problems?). Everything else in the reading keeps the pen's order; the print is unchanged. Checked: the only spot that is both visible with the fold closed and before the From freezer word is above the Tasting head, past Tempering, the tasting note and the melt fields, so it stays after the fold. Measured in WebKit (coarse pointer; Chromium 10 px taller): 667, 667, 788, 1028 and 709 px at 350 (were 683, 683, 804, 1028, 709), 8 px less at 393; no overflow; the order and the visibility with the fold closed checked in all ten panels in both engines.\n\n"
    "What moved in the pen: At draw no longer draws a hairline of its own. Ingredient notes' underline is the one rule above it, as the tasting note's underline and Next time's already are above From freezer. Before, the two rules sat 25 px apart. The field's name now sits 12 px under that rule; the 32 px gap, the rule and the 12 px padding that were above it are gone, 45 px in all.\n\n"
    "Unchanged: the order, a pick hides the group's evaluation fields and shows Clear, a mark keeps the field and turns its options off with the reason beside the name, a written note changes nothing. The tapped control still does not move when a pick hides the fields or Clear returns them.\n\n"
    "Measured, WebKit coarse (Chromium within 8 px): the blank pen is 2663 px at 350 and 2798 at 393 (was 2708 and 2843); with both groups picked, 1338 and 1376 (was 1383 and 1421). A pick in At draw still pulls up 158 px at 350 and 188 at 393, and a pick in From freezer 1167 and 1234. The 6 px overflow at 350 in the picked and marked states is the same as before. How the app stores the value is for planning.")))
N['logpages-note'] = dict(x=0, y=1056 + 80, w=640, maxH=620, fill='gray', page='page-11', text=(
    "Redrawn 2026-10-07 for your note on the date box (it was treated as a row, so everything under it started below the whole box and left a band of white); nothing approved. The box is no longer a row: it sits in the upper right corner and the title and the first fields sit beside it, and what follows starts under them at full width.\n\n"
    "Page 1: Time to draw temp., Out of machine and Churn duration sit beside the box. Page 2: Tempering, Tasting temperature and Melt test sit beside it, and Melt test's unit, g lost at 20 min, now sits under its line: with the unit at the right the three fields run 25 px under the box at Safari's width. That is the one field that changed shape.\n\n"
    "Kept: every field, label, unit, option and anchor, the three boxes of both groups, the scales, the writing lines (5, 5 and 4 on page 1, 7 on page 2), the foot inside each page, the 0.5 in margins, the box's size (168 x 52).\n\n"
    "Measured in WebKit (coarse pointer; Chromium within 2 px), natural height with the foot, against Safari's 900 px: page 1 828 px (was 869: 41 saved, 72 spare) and page 2 830 px (was 852: 22 saved, 70 spare). Against Chrome's 960 px, 132 and 130 px stay empty above the foot. The box clears what sits beside it by 70 px or more at 675 and 115 px or more at 720. A real WebKit print and Chrome's PDF both give two pages with the foot on each. Not checked on the iPad."))
json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
print({k: v[:2] for k, v in sizes.items()})
