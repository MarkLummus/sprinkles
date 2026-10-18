import re, os, sys
# Sid, 2026-10-18 (Mark's List row decide-p10-pod-rule-end, answered widen-to-40; sketch 010 README D30): the Sweetness · POD rule is drawn from 0 to 40 for every recipe (the PAC rule already is).
# The app's own RuleDrawing (app/src/ui/GraduatedRule.jsx) positions the band, the value tick and the hollow "was" tick by toX(v) = (clamp(v, lo, hi) - lo) / (hi - lo) * 320; the graduations, the baseline and the hatch stay put.
# This module redraws only that rule in markup that already carries it (a captured or served board), from the numbers it states: the target in the button's aria-label, the tick's own x for the value (the label rounds to one decimal).
#   rescale(html, 40)  -> (html, number of rules redrawn)      rescale(html, 30) puts a 0-40 rule back to 0-30 (the round trip is the self-test: python3 pod40.py selftest <file>)
#   python3 pod40.py <out dir> <board.dc.html> ...  rewrites each served board into <out dir>/project/ with every Sweetness · POD rule on 0 to 40; nothing else in the board changes.
W = 320
def fmt(x):
    x = float(x)
    return str(int(x)) if x == int(x) else repr(x)
def to_x(v, lo, hi): return (max(lo, min(hi, v)) - lo) / (hi - lo) * W
BTN = re.compile(r'(<button[^>]*aria-label="Sweetness · POD, (?P<label>[^"]*)"[^>]*>)(?P<body>.*?)(</button>)', re.S)

def _one(m, new_hi, old_hi):
    label, body = m.group('label'), m.group('body')
    tm = re.search(r'<line x1="([\d.]+)" y1="0" x2="\1" y2="22" stroke="var\(--sheet-ink\)" stroke-width="2.5"></line>', body)
    assert tm, 'no value tick in a Sweetness rule'
    # the value: the tick's own position (the label rounds to one decimal); at the clamped end (a value past the old scale) the label is all there is
    nm = re.search(r'now ([\d.]+)|^([\d.]+)', label); lab_v = float(nm.group(1) or nm.group(2))
    vx = float(tm.group(1)); v = vx * old_hi / W if vx < W - 1e-6 else lab_v
    fm = re.search(r'<rect x="([\d.]+)" y="0" width="2.5" height="22" fill="none"', body)
    frm = (float(fm.group(1)) + 1.25) * old_hi / W if fm else None
    band = re.search(r'target ([\d.]+)–([\d.]+)', label); lo_b, hi_b = (float(band.group(1)), float(band.group(2))) if band else (None, None)
    out = body
    if band:
        x0, x1 = to_x(lo_b, 0, new_hi), to_x(hi_b, 0, new_hi)
        out, n = re.subn(r'(<rect x=")[\d.]+(" y="4" width=")[\d.]+(" height="14" fill="url\(#hatch-[^)]*\)">)', lambda r: r.group(1) + fmt(x0) + r.group(2) + fmt(max(1, x1 - x0)) + r.group(3), out); assert n == 1, 'band rect'
        edges = list(re.finditer(r'<line x1="[\d.]+" y1="2" x2="[\d.]+" y2="20" stroke="var\(--sheet-ink\)" stroke-width="1"></line>', out)); assert len(edges) == 2, 'band edges'
        for e, x in zip(reversed(edges), (x1, x0)):
            out = out[:e.start()] + f'<line x1="{fmt(x)}" y1="2" x2="{fmt(x)}" y2="20" stroke="var(--sheet-ink)" stroke-width="1"></line>' + out[e.end():]
    if fm:
        out, n = re.subn(r'(<rect x=")[\d.]+(" y="0" width="2.5" height="22" fill="none")', lambda r: r.group(1) + fmt(to_x(frm, 0, new_hi) - 1.25) + r.group(2), out); assert n == 1
    tx = fmt(to_x(v, 0, new_hi))
    out, n = re.subn(r'<line x1="[\d.]+" y1="0" x2="[\d.]+" y2="22" stroke="var\(--sheet-ink\)" stroke-width="2.5"></line>', f'<line x1="{tx}" y1="0" x2="{tx}" y2="22" stroke="var(--sheet-ink)" stroke-width="2.5"></line>', out); assert n == 1
    out, n = re.subn(r'(<span>0</span><span class="graduated-rule__deviation">[^<]*</span><span>)%d(</span>)' % old_hi, lambda r: r.group(1) + str(new_hi) + r.group(2), out); assert n == 1, 'anchors'
    return m.group(1) + out + m.group(4)

def rescale(html, new_hi=40, old_hi=None):
    old_hi = old_hi or (30 if new_hi == 40 else 40)
    return BTN.subn(lambda m: _one(m, new_hi, old_hi), html)

if __name__ == '__main__':
    if sys.argv[1] == 'selftest':
        s = open(sys.argv[2]).read(); a, n = rescale(s, 40); b, m = rescale(a, 30)
        nums = lambda t: [round(float(x), 3) for x in re.findall(r'-?\d+\.?\d*', re.sub(r'id="[^"]*"', '', t))]
        # compare the numbers inside each Sweetness rule only (clamped band edges past 30 cannot come back, so the test files stay inside 30)
        pa = [x.group(0) for x in BTN.finditer(s)]; pb = [x.group(0) for x in BTN.finditer(b)]
        print(n, m, 'round trip equal' if [nums(x) for x in pa] == [nums(x) for x in pb] else 'ROUND TRIP DIFFERS')
    else:
        out = sys.argv[1]; os.makedirs(out + '/project', exist_ok=True)
        for f in sys.argv[2:]:
            s, n = rescale(open(f).read(), 40); assert n >= 1, f
            open(out + '/project/' + os.path.basename(f), 'w').write(s); print(os.path.basename(f), n, 'rule(s) redrawn')
