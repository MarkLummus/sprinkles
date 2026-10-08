# Sid, 2026-10-07 (D20): the real prints of the pages drawn for the 0.75 in side margins. Each test page is a board's markup with the page rule laid on (letter, 0.5 in above and below, 0.75 in at both sides, content width auto),
# printed by WebKit's own print (wkprint.swift: NSPrintInfo, margins 36, 36, 54, 54 pt) and by Chrome (headless --print-to-pdf), then read by PDFKit (pdf-extents.swift: pages, the text's distance from each edge, first and last line).
#   python3 printcheck.py <dir holding the boards written by p4print-canvas.py t5 (/project)> <work dir> <bin dir holding wkprint, pdf-extents>
import sys, os, re, subprocess, glob
HERE = os.path.dirname(os.path.abspath(__file__)); BOARDS, WORK, BIN = [os.path.abspath(a) for a in sys.argv[1:4]]
os.makedirs(WORK, exist_ok=True)
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
FONT = os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')
PAGE = '@page{size:letter;margin:.5in .75in}html,body{margin:0;background:#fff}'
def board_page(fn, extra):
    h = open(os.path.join(BOARDS, fn)).read().replace('<script src="./support.js"></script>', '').replace('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', 'file://' + FONT)
    return h.replace('</head>', '<style>' + PAGE + extra + '</style></head>') .replace('<body>', '<body><div class="ingredient-table" style="display:none"></div>', 1)
CASES = {}
# the two log pages, one sheet, each page the content box high with the foot at its bottom (as the Phase 4 build would lay it), with D22's 2 px guard at the right (WebKit's print clips the date box's right border without it)
lf = re.findall(r'<div class="lf">.*?</div></div>(?=\s*</div>\s*</x-dc>)', open(os.path.join(BOARDS, 'BatchLogForm.dc.html')).read(), re.S)
def log_doc(fns):
    bodies = []
    for fn in fns:
        h = open(os.path.join(BOARDS, fn)).read(); m = re.search(r'(<div class="lf">.*</div>)\s*</div>\s*</x-dc>', h, re.S); bodies.append(m.group(1))
    css = re.search(r'<style>(.*?)</style>', open(os.path.join(BOARDS, fns[0])).read(), re.S).group(1)
    return ('<!doctype html><html><head><meta charset="utf-8"><style>' + css + PAGE + 'html,body{height:100%}.lf{width:auto;height:100%;padding:0 2px 0 0;break-after:page;page-break-after:always}.lf:last-child{break-after:auto;page-break-after:auto}</style></head><body><div class="ingredient-table" style="display:none"></div>' + ''.join(bodies) + '</body></html>')
CASES['logs'] = log_doc(['BatchLogForm.dc.html', 'TastingLogForm.dc.html'])
ONLY = sys.argv[4:]   # optional: case names to run (the log pages alone need only BatchLogForm and TastingLogForm)
if 'sheet' not in ONLY and ONLY: CASES = {k: v for k, v in CASES.items() if k in ONLY}
else: CASES['sheet'] = board_page('PrintStartingPointBalanceCol2.dc.html', 'x-dc>div{width:auto !important;height:auto !important}.recipe-page{padding:0 !important;width:auto !important}.notebook,.notebook-body,.notebook-body__sheet{max-width:none}')
# the method: the ten steps, whole, on their own pages (the probe at the content width, the heading first)
if not ONLY: mp = open(os.path.join(BOARDS, 'method-probe.html')).read().replace('width:672px;padding:0', 'width:auto;padding:0')
if not ONLY: CASES['method'] = mp.replace('</head>', '<style>' + PAGE + '.mp-step{break-inside:avoid}</style></head>').replace('<body>', '<body><div class="ingredient-table" style="display:none"></div>', 1)
for name, html in CASES.items():
    f = os.path.join(WORK, name + '.html'); open(f, 'w').write(html)
    for eng in ('webkit', 'chrome'):
        pdf = os.path.join(WORK, name + '-' + eng + '.pdf')
        if os.path.exists(pdf): os.remove(pdf)
        if eng == 'webkit': subprocess.run([os.path.join(BIN, 'wkprint'), 'file://' + f, pdf], env=dict(os.environ, WKP_MARGINS='36,36,54,54'), capture_output=True, timeout=120)
        else: subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + pdf, 'file://' + f], capture_output=True, timeout=120)
        print('==', name, eng); print(subprocess.run([os.path.join(BIN, 'pdf-extents'), pdf], capture_output=True, text=True).stdout.rstrip())
