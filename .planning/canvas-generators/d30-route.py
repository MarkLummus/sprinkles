import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-18 (README D30): P4_PrintRoute1280 shows the Sheet's page 1 as a picture (phase4screens-pages.json, sheet1). The Sweetness rule on that page now runs 0 to 40, so the picture is swapped for the one
# phase4screens-pages.mjs made from the new SheetPrintPage1; the other four pictures are byte for byte the same. P4_PrintRoute393 (a 393 board, not redrawn) keeps the old picture as an uploaded asset.
#   python3 d30-route.py <old pictures json> <served P4_PrintRoute1280.dc.html> <out dir>
old = json.load(open(sys.argv[1]))['sheet1']; new = json.load(open(HERE + '/phase4screens-pages.json'))['sheet1']
s = open(sys.argv[2]).read(); n = s.count(old); assert n == 1, n
os.makedirs(sys.argv[3] + '/project', exist_ok=True); open(sys.argv[3] + '/project/P4_PrintRoute1280.dc.html', 'w').write(s.replace(old, new)); print('swapped', n)
