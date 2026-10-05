# Sid, 2026-10-04 (decision 45): the print break checked in a real print. Writes the test pages (the same markup as the board, a tbody per step group, the rules the brief names), prints each to PDF with the installed Chrome
# (headless, --print-to-pdf, letter, margins 48 / 56 / 40) and reads the text of every page with PDFKit (pdf-pages.swift). Nothing is started but those two commands; app/ is not touched.
#   GEN_SP=<scratchpad> python3 breaks-pdf-check.py <work dir>
import sys, os, subprocess
sys.argv_saved = sys.argv; WORK = sys.argv[1]; sys.argv = ['x']
from breaks import *
os.makedirs(WORK, exist_ok=True)
def tbody_per_unit(ingr):
    thead, units, tfoot = table_units(ingr); cols = Mp('olive-full')['cols']
    body = ''.join('<tbody>' + ''.join(u['rows']) + '</tbody>' for u in units)
    return ('<section class="ingredient-table-region"><h2 class="region-name">Ingredients</h2><table class="ingredient-table" style="table-layout:fixed;width:%spx"><colgroup>%s</colgroup>%s%s%s</table></section>'
            % (sum(cols), ''.join('<col style="width:%spx">' % c for c in cols), thead, body, tfoot))
def doc(blocks, rules):
    css = resolve_media(TOK, 816, False) + resolve_media(APPC, 816, False, screen=False) + resolve_media(NBC, 816, False, screen=False) + PRINT_APP
    return ('<!doctype html><meta charset=utf-8><style>@page{size:816px 1056px;margin:48px 56px 40px}html,body{margin:0;background:#fff}body{--sheet-bookcloth:var(--sheet-ink)}' + css +
            '.before-region{max-width:var(--measure-prose)}article.recipe-page{display:flex;flex-direction:column;gap:var(--gap-l);padding:0;background:transparent;margin:0}.text-control,button,.table-small-print,.method-step__acts,.history-disclosure{display:none}' + rules + '</style><article class="recipe-page">' + ''.join(blocks) + '</article>')
RULES = {'on': 'thead{display:table-header-group}tbody{break-inside:avoid}tfoot{break-inside:avoid}', 'on-tfoot-fixed': 'thead{display:table-header-group}tbody{break-inside:avoid}tfoot{display:table-row-group}', 'default': 'thead{display:table-header-group}', 'on-keep': 'thead{display:table-header-group}tbody{break-inside:avoid}tfoot{display:table-row-group}.region-name{break-after:avoid}'}
t = tbody_per_unit(OL['ingr']); mt = tbody_per_unit(MX['ingr'])
CASES = {'olive-on': ([OL['head'], OL['before'], t], 'on'), 'olive-on-tfoot-fixed': ([OL['head'], OL['before'], t], 'on-tfoot-fixed'), 'olive-single-default': ([OL['head'], OL['before'], OL['ingr']], 'default'),
         'olive-on-instructions': ([OL['head'], OL['before'], t, OL['meth']], 'on'), 'mex3x-on': ([MX['head'], more_notes(NOTES, 3), mt], 'on'), 'mex3x-on-keep-heading': ([MX['head'], more_notes(NOTES, 3), mt], 'on-keep'), 'mex3x-default': ([MX['head'], more_notes(NOTES, 3), MX['ingr']], 'default')}
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
subprocess.run(['swiftc', '-O', os.path.join(HERE, 'pdf-pages.swift'), '-o', os.path.join(WORK, 'pdf-pages')], check=True)
for name, (blocks, rule) in CASES.items():
    h = os.path.join(WORK, name + '.html'); p = os.path.join(WORK, name + '.pdf'); open(h, 'w').write(doc(blocks, RULES[rule]))
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + p, 'file://' + h], check=True, capture_output=True)
    out = subprocess.run([os.path.join(WORK, 'pdf-pages'), p, 'x'], capture_output=True, text=True).stdout
    print('==', name, '(rules: %s)' % rule)
    for pg in out.split('--- page')[1:]: print('  page', pg[:3].strip(), '| starts:', pg[pg.index(':') + 2:][:110].replace('\n', ' '), '| ends:', pg.strip()[-120:].replace('\n', ' '))
