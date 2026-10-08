# Sid, 2026-10-07 (row draw-declared-two-slots-each; README D26): the fit of page 2 for every recipe that declares 0, 1 or 2 scales and 0, 1 or 2 problems, at Safari's 630 x 900 and Chrome's 672 x 960 (the symmetric 0.75 in case, as the
# earlier fit rows used), in WebKit (coarse pointer) and Chromium, with 5 writing lines. Also page 2 with seven boxes in the problems row (two declared problems and one more word), a test of the headroom and never drawn.
#   python3 declared-fit.py <scratch dir>      writes declared-fit.json (read by declared.py for the captions) and prints a table
import json, os, subprocess, sys, re
HERE = os.path.dirname(os.path.abspath(__file__)); scratch = sys.argv[1]
def run(spec, name, *extra):
    d = os.path.join(scratch, name); subprocess.run(['python3', HERE + '/declared-logfit.py', d, spec, *extra], check=True, capture_output=True)
    res = {}
    for l in subprocess.run(['node', HERE + '/logfit-measure.mjs', d], check=True, capture_output=True, text=True).stdout.splitlines():
        eng, f, j = l.split(' ', 2); res[eng + ':' + f[:2]] = json.loads(j)
    return res
out = {}
for r in range(3):
    for c in range(3):
        m = run('%d,%d' % (r, c), 'fit-%d-%d' % (r, c))
        w, ch = m['webkit:p2'], m['chromium:p2']
        out['%d,%d' % (r, c)] = dict(safari_h=w['safari']['h'], safari_spare=w['safari']['spare'], chrome_spare=w['chrome']['spare'], chromium_safari_spare=ch['safari']['spare'], chromium_chrome_spare=ch['chrome']['spare'],
                                     wrapped=w['safari']['wrapped'], overflow=w['safari']['ox'], min_font=w['board']['minFont'], colours=len(w['board']['colours']), p1_safari_spare=m['webkit:p1']['safari']['spare'], p1_chrome_spare=m['webkit:p1']['chrome']['spare'],
                                     p1_chromium_safari_spare=m['chromium:p1']['safari']['spare'], boxes=4 + c)
m = run('2,2', 'fit-seven', '5', 'Metallic'); w, ch = m['webkit:p2'], m['chromium:p2']
out['seven'] = dict(safari_h=w['safari']['h'], safari_spare=w['safari']['spare'], chrome_spare=w['chrome']['spare'], chromium_safari_spare=ch['safari']['spare'], chromium_chrome_spare=ch['chrome']['spare'], wrapped_webkit_safari=w['safari']['wrapped'], wrapped_webkit_chrome=w['chrome']['wrapped'], wrapped_chromium_safari=ch['safari']['wrapped'], wrapped_chromium_chrome=ch['chrome']['wrapped'], boxes=7)
json.dump(out, open(HERE + '/declared-fit.json', 'w'), indent=1)
for k, v in out.items(): print(k, v)
