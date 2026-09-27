import sys; sys.argv=['x']
from gen import *
# Mark, 2026-09-27: "another board of the 393 phone with all sections folded to see the page height".
# An exploration: every section on the page closed to its label and a Show control, not only decision 18's four folds.
def ctl(label='Show'):
    return f'<button type="button" class="text-control history-disclosure" aria-expanded="false">{label}</button>'
def head(inner):
    return f'<div style="display:flex;align-items:baseline;gap:14px;margin:0 0 var(--gap-xs);">{inner}{ctl()}</div>'
def drop_section_body(html, open_tag, h2):
    """Keep a Sheet section's h2 (with a Show control beside it) and drop the rest of the section."""
    i = html.index(open_tag); j = html.index('</section>', i)
    return html[:i] + open_tag + head(f'<h2 class="region-name" style="margin:0;">{h2}</h2>') + html[j:]
main = phone_folds(layout_c_rung(393), open_=False)
main = drop_section_body(main, '<section class="ingredient-table-region" aria-label="Ingredients">', 'Ingredients')
main = drop_section_body(main, '<section class="method-region" aria-label="Method">', 'Instructions')
# History: its label and a Show control; the rail goes
def balanced_end(html, i, tag='div'):
    depth = 0
    for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', html[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: return i + t.end()
hs = main.index(cap('History'))
hs = main.rindex('<div style="display:flex;flex-direction:column;gap:10px;">', 0, hs)
main = main[:hs] + head(cap('History')) + main[balanced_end(main, hs):]
# Batch: its label, a Show control, and the date; the cells, the notes, Tasting and the recorded line go
m = re.search(r'<section aria-label="Batch"[^>]*>.*?</section>', main, flags=re.S)
batch = f'<section aria-label="Batch" style="display:flex;flex-direction:column;gap:18px;"><div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;">{cap("Batch")}{ctl()}<span style="font-family:{GROT};font-size:15px;color:{TEXT};font-variant-numeric:tabular-nums;">churned 2 Aug 2026</span></div></section>'
main = main[:m.start()] + batch + main[m.end():]
extra = open(SP + '/phone-forced.css').read() + '[hidden]{display:none !important}'
open(OUT + '/R35C_393AllFolded.dc.html', 'w').write(board('C · 393 · exploration · every section folded, to see the page height', 393, 1300, main, extra_css=extra))
print('ok')
