import json, re, os, sys, html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, resolve_media
import printstart
# Sid, 2026-10-07 (row draw-method-print-treatment, README D18): the printed method, drawn with Mark's treatment from the photo of his AS WRITTEN concept sheet (/Users/mark/.claude/uploads/.../83dd85fc-image.jpg).
#   python3 method.py <out dir>      writes <out>/MethodPrintAsBuilt, MethodPrintPage1 and MethodPrintPage2 .dc.html (the boards) and <out>/method-probe.html (the steps at the print widths, for method-measure.mjs)
# Words: only the built page's. The steps are read from method-capture.json (node method-capture.mjs: the Sheet as the dist of 2026-10-06 renders it, Olive Oil v1, no batch): the lead (bold lead-in, then the instruction), the typed targets
# (label and value), Purpose and Aside, none rewritten. Mark's own additions are typography and one word: "why", the label of Purpose (his photo: "WHY — ..."); the em dash after it is his. Everything else is the built page's text.
# What the build draws today (method-capture.json facts, WebKit at 1280): the step number in a left column (the system grotesk, 20 px, regular); the lead in Georgia 16 px with a bold lead-in; the typed targets as 12 px boxed chips (label and
# value, 1 px border); Purpose and Aside the same: Georgia 13 px italic, 6 px under the line before, no label and no rule, so they cannot be told apart but by what they say. 3 of the 10 steps carry a Purpose, 5 an Aside, and every step its typed targets (16 chips in all).
# What Mark's photo asks (read from the image): (1) the step number stands in the left margin, outside the text column; (2) the bold lead-in sentence, then the instruction; (3) the tag fields in a row: a small-caps label, then the value in bold
# and underlined (TEMP room, HOLD 2 min, BLEND 60 s, PER JAR 379 g, COME-UP 10 to 12 min); (4) Purpose as a line that starts WHY in small caps, an em dash, then the sentence; (5) Aside as a callout: a thick rule at the left, the text indented.
# Drawn here: black only, 12 px smallest, the page margin of D20 (0.75 in at the left and the right, 0.5 in above and below: content 672 x 960 in Chrome, 630 x 900 in Safari; D16 had 0.5 in at the right), one step never split across a page (D-06a), the faces and sizes the build already uses where the
# photo does not say otherwise (Georgia for the prose, the grotesk for labels, numbers and values; the heading is the build's own "Instructions", in ink). The step number stands at the left edge of the content box, not outside it: outside it is the
# punch's zone (the hole's inner edge is 0.64 in from the paper's edge; the content starts at 0.75 in), so "the left margin" is the number's own column, 32 px wide, and the text starts 0.33 in further in (his sheet: numbers 0.06 in past the hole, text 0.5 in past it).
# Not drawn: the foot (D7 puts one in flow at the end of the Sheet, as on the Sheet boards), the struck and recorded states (a version with a batch), the formula page the method follows (D-06b: the Instructions open their own page when the table fits; when it breaks they follow its tail, in the same whole steps).
CAPM = json.load(open(HERE + '/method-capture.json'))
MEASURE = json.load(open(HERE + '/method-measure.json')) if os.path.exists(HERE + '/method-measure.json') else {}

def parse_steps():
    a = CAPM['article']; steps = []
    for li in re.findall(r'<li id="method-step-\d+" class="method-step">.*?</li>', a, re.S):
        n = re.search(r'class="method-step__n"[^>]*>(\d+)<', li).group(1)
        lead = re.search(r'<p class="method-step__lead"><span>(.*?)</span></p>', li, re.S).group(1)
        tags = re.findall(r'<span class="target-chip__label">(.*?)</span><span class="target-chip__value">(.*?)</span>', li)
        why = re.search(r'<p class="method-step__purpose">(.*?)</p>', li, re.S); aside = re.search(r'<p class="method-step__aside">(.*?)</p>', li, re.S)
        assert '<b>' in lead and 'method-step__prose--struck' not in li
        steps.append(dict(n=n, lead=lead, tags=tags, why=why.group(1) if why else None, aside=aside.group(1) if aside else None))
    assert len(steps) == 10 and sum(len(s['tags']) for s in steps) == 16 and sum(1 for s in steps if s['why']) == 3 and sum(1 for s in steps if s['aside']) == 5
    return steps
STEPS = parse_steps()

# the drawn layer. The page is the log pages' own: 816 x 1056, padding 48 48 48 72 (D16). Values read through the app's tokens where one exists.
CSS = '''
.mp{width:816px;height:1056px;box-sizing:border-box;padding:48px 72px 48px 72px;background:#ffffff;color:var(--sheet-ink);font-family:var(--face-text)}
.mp *{color:var(--sheet-ink)}
.mp .region-name{font-size:var(--sheet-type-section);margin:0 0 var(--gap-s)}
.mp-steps{list-style:none;margin:0;padding:0}
.mp-step{display:grid;grid-template-columns:32px 1fr;align-items:baseline;break-inside:avoid}
.mp-step + .mp-step{margin-top:var(--gap-m)}
.mp-n{font-family:var(--face-grotesk);font-size:var(--sheet-type-section);font-weight:600;font-variant-numeric:tabular-nums;line-height:var(--sheet-leading-control)}
.mp-lead{margin:0;font-size:var(--sheet-size-headnote-prose);line-height:var(--sheet-leading-control);max-width:var(--measure-prose)}
.mp-tags{display:flex;flex-wrap:wrap;column-gap:var(--gap-l);row-gap:var(--gap-xs);margin:var(--gap-xs) 0 0}
.mp-tag{display:inline-flex;align-items:baseline;gap:var(--gap-xs)}
.mp-tag__label{font-family:var(--face-grotesk);font-size:var(--sheet-type-label);font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
.mp-tag__value{font-family:var(--face-grotesk);font-size:var(--sheet-type-section);font-weight:700;text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:3px}
.mp-why,.mp-aside{margin:var(--gap-xs) 0 0;font-size:var(--sheet-size-deviation-words);line-height:var(--sheet-leading-helper);max-width:var(--measure-prose)}
.mp-why__label{font-family:var(--face-grotesk);font-size:var(--sheet-type-label);font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
.mp-aside{border-left:var(--rule-tick) solid var(--sheet-ink);padding-left:var(--gap-s);margin-top:var(--gap-s)}
'''
def tag_html(label, value): return f'<span class="mp-tag"><span class="mp-tag__label">{label}</span><span class="mp-tag__value">{value}</span></span>'
def step_html(s):
    b = f'<p class="mp-lead">{s["lead"]}</p>'
    if s['tags']: b += '<p class="mp-tags">' + ''.join(tag_html(l, v) for l, v in s['tags']) + '</p>'
    if s['why']: b += f'<p class="mp-why"><span class="mp-why__label">why</span> — {s["why"]}</p>'     # Mark's photo: WHY, an em dash, the sentence
    if s['aside']: b += f'<p class="mp-aside">{s["aside"]}</p>'
    return f'<li class="mp-step"><span class="mp-n">{s["n"]}</span><div class="mp-body">{b}</div></li>'
def page(idx, heading):
    h = '<h2 class="region-name">Instructions</h2>' if heading else ''
    return f'<div class="mp">{h}<ol class="mp-steps">' + ''.join(step_html(STEPS[i]) for i in idx) + '</ol></div>'
# Sid, 2026-10-08 (Mark's List row look-sketch-010-snapshot-contract: "not approved. this doesn't show the sheet with the purpose and aside formatting"): the Sheet board carries the same treatment in its own Instructions,
# so the Sheet shows Why, the aside callout and the tag row where the build's Instructions are, in the section the build gives them (`section.method-region`, keeping its aria-label and its h2 "Instructions" in ink).
# The steps are step_html's, unchanged, with the build's own id on each `li` (method-step-N). The page's fixed box (.mp: 816 x 1056, 48/72 padding) and its heading rule are for the method pages and stay out of the Sheet's CSS.
def sheet_steps():
    return '<ol class="mp-steps">' + ''.join(step_html(s).replace('<li class="mp-step">', '<li id="method-step-%s" class="mp-step">' % s['n'], 1) for s in STEPS) + '</ol>'
def sheet_css():
    keep = [l for l in CSS.strip().split('\n') if not l.startswith('.mp{') and not l.startswith('.mp *') and not l.startswith('.mp .region-name')]
    return '\n' + '\n'.join(keep) + '\n.method-region .mp-steps *{color:var(--sheet-ink)}\n.method-region .mp-steps{font-family:var(--face-text)}\n'
def css(): return printstart.FONT + resolve_media(TOK, 816, False, screen=False) + resolve_media(APPC, 816, False, screen=False) + CSS

# pages: the steps laid by measurement, whole (D-06a). Heights are what method-measure.mjs read from the probe (the taller of WebKit and Chromium at the Chrome width, 672: D20's 0.75 in at both sides), against the page's 960 px.
def paginate(heights, limit, head, gap=20):
    pages = [[]]; used = head
    for i, h in enumerate(heights):
        add = h + (gap if pages[-1] else 0)
        if used + add > limit and pages[-1]: pages.append([]); used = 0; add = h
        pages[-1].append(i); used += add
    return pages, used

def board_as_built():
    a = CAPM['article']; tag = re.match(r'<article[^>]*>', a).group(0); reg = re.search(r'<section class="method-region".*?</section>', a, re.S).group(0)
    return '<div class="notebook"><div class="notebook-body"><div class="notebook-body__sheet">' + tag + reg + '</article></div></div></div>'
def css_as_built():
    return (printstart.FONT + resolve_media(TOK, 816, False, screen=False) + resolve_media(APPC, 816, False, screen=False) + resolve_media(NBC, 816, False, screen=False) + printstart.print_block()
            + '\n.notebook{padding:0;max-width:none;margin:0}\n.recipe-page{display:block;background:#ffffff;padding-left:72px;padding-right:72px}\n.recipe-page .region-name{color:var(--sheet-ink)}')

T_AB = 'As built · the Instructions as the app prints them, at the 0.75 in side margins (reference, not a target)'
T_P1 = 'Variant · the table fits: the Instructions open their own page, steps 1 to 7 (D-06b; not Olive Oil v1)'   # retitled 2026-10-08 (README D29)
T_P2 = 'Variant · the table fits: the Instructions, steps 8 to 10 (D-06b; not Olive Oil v1)'

def build(out):
    os.makedirs(out, exist_ok=True)
    hs = MEASURE.get('chrome_heights'); head = MEASURE.get('head', 25)
    if hs: pages, used = paginate(hs, 960, head)
    else: pages, used = [list(range(10))], 0
    sizes = {}
    ab_h = MEASURE.get('asbuilt_h', 1200)
    open(out + '/MethodPrintAsBuilt.dc.html', 'w').write(printstart.board(T_AB, board_as_built(), 816, ab_h, css_as_built(), flow=True, paper=True)); sizes['MethodPrintAsBuilt'] = (816, ab_h, T_AB)
    for k, (idx, t) in enumerate(zip(pages, (T_P1, T_P2, 'Page 3'))):
        fn = 'MethodPrintPage%d' % (k + 1)
        open(out + '/' + fn + '.dc.html', 'w').write(printstart.board(t, page(idx, k == 0), 816, 1056, css(), paper=True)); sizes[fn] = (816, 1056, t)
    # the probe: every step alone in a content-width column, and the whole list, for method-measure.mjs
    body = '<div class="mp" id="all" style="height:auto;width:672px;padding:0"><h2 class="region-name" id="head">Instructions</h2><ol class="mp-steps">' + ''.join(step_html(s) for s in STEPS) + '</ol></div>'
    open(out + '/method-probe.html', 'w').write('<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s</style></head><body>%s</body></html>' % (css(), body))
    ab = '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s</style></head><body><div style="width:816px">%s</div></body></html>' % (css_as_built(), board_as_built())
    open(out + '/method-asbuilt-probe.html', 'w').write(ab.replace('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', 'file://' + HERE + '/../../app/public/fonts/caveat-regular.woff2'))
    return sizes, pages, used

if __name__ == '__main__':
    s, p, u = build(sys.argv[1]); print({k: v[:2] for k, v in s.items()}, 'pages', p, 'last page used', u, 'measured' if MEASURE else 'not measured yet')
