import sys
sys.argv = ['x']
from final import *   # runs gen.py and final.py first (their boards land in OUT as before); this file adds decision 57's board
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
# Sid, 2026-10-05 (decision 57): where the sentence goes when a save is blocked on an ingredient line. Mark, on his List (blocked-row-sentence-not-shown): "have Sid draw where the sentence goes". Every panel is the built
# app's own shell markup (blocked-capture.json: WebKit, coarse pointer, Olive Oil v1; real clicks and fills on a COPY of app/dist served on a throwaway port) with the app's own stylesheets resolved at the width. The a_*
# panels are the build untouched. The o_* panels are the same page after the browser's edit of the clone (blocked-capture.mjs says what the edit is: the sentence laid where the option puts it, in the face the build
# already uses for the version line's sentence). Nothing here is a build and nothing here edits app/. The captions' numbers come from blocked-capture.json's facts.
PC = json.load(open(HERE + '/blocked-capture.json'))
BRAND = '<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>'
HTML = {k: drop_hidden(v['html']).replace(BRAND, '<p class="shell__brand">Sprinkles</p>', 1) for k, v in PC.items()}
FACT = {k: v['facts'] for k, v in PC.items()}
STAMP_A = " (decision 57, options for Mark; drawn 2026-10-05, awaiting Mark's look; nothing approved)"
def n(x): return ('%.1f' % x).rstrip('0').rstrip('.')
def crop_table(f):
    t, h, l = f['table'], f['head'], f['lastRow']
    return (t['x'] - 12, t['w'] + 24, h['y'] - 3, l['y'] + l['h'] - h['y'] + 4)
def crop_form(f):
    r = f['form']; return (max(0, r['x'] - 12), r['w'] + 24, r['y'] - 12, r['h'] + 24)
PANELS = []
def panel(pid, W, state, kind, cap, fl):
    f = FACT['%s_%d' % (state, W)]; x0, ww, y0, hh = (crop_table(f) if kind == 'table' else crop_form(f))
    PANELS.append(dict(pid=pid, W=W, html=HTML['%s_%d' % (state, W)], cap=cap, fl=fl, crop=(x0, ww, y0, hh), state=state, kind=kind)); return PANELS[-1]
ROWH = 112
def board(key, snap, title, rows):
    css_parts = [LABEL_CSS + '.fp-lab{font-family:var(--face-grotesk);color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}\n.fp-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary);margin-top:4px}\n']
    seen = set(); body = ''; y = GAP; bw = 0
    for rtitle, rdesc, labh, panels in rows:
        body += f'<div style="position:absolute;left:{GAP}px;top:{y}px;width:4400px;"><p class="fp-title">{rtitle}</p><p class="fp-sub" style="max-width:3000px">{rdesc}</p></div>\n'
        y += ROWH; x = GAP; rowh = 0; cells = []
        for p in panels:
            vid = 'fp-' + p['pid'].replace('_', '-'); W = p['W']
            if W not in seen: css_parts.append(resolve_media(TOK, W, True)); seen.add(W)
            css_parts.append(final_css(W, vid, extra='', onehead=False))
            try: html = with_menu(p['html'], W)
            except AssertionError: html = p['html']
            html = unique_ids(html, vid)
            x0, ww, y0, hh = p['crop']
            cells.append((vid, W, html, x0, y0, ww, hh, p['cap'], p['fl'])); rowh = max(rowh, hh)
        for vid, W, html, x0, y0, ww, hh, cap, fl in cells:
            body += (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{ww}px;"><div class="fp-labbox" style="height:{labh}px;"><p class="fp-lab">{cap}<small>{fl}</small></p></div>'
                     f'<div class="fp-win {vid}" data-pid="{vid}" style="width:{ww}px;height:{hh}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div></div>\n')
            x += ww + GAP
        bw = max(bw, x); y += labh + 8 + rowh + GAP
    y = int(y + 0.999); bw = int(bw)
    main = f'<div style="position:relative;width:{bw}px;height:{y}px;background:#ffffff;">{body}</div>'
    fn = write_board(key, title + STAMP_A, bw, y, main, ''.join(css_parts) + '[hidden]{display:none !important}')
    ENTRIES_A[fn] = dict(w=bw, h=y, page='page-13', title=title + STAMP_A, snap=snap)
ENTRIES_A = {}
FITS = "it fits the row's own spare space"
def F(W, s): return FACT['%s_%d' % (s, W)]
def build_board():
    rows = []
    for W in (1366, 393):
        a, o, c = F(W, 'a_whole2'), F(W, 'o_row_whole2'), F(W, 'o_cer_whole2'); cr, ocr = F(W, 'a_cream'), F(W, 'o_row_cream'); v = F(W, 'a_ver')
        ctx = '1366 · iPad landscape, coarse pointer' if W == 1366 else '393 · phone, coarse pointer'
        what = 'Olive Oil v1, Next version, "v2" in Version name, Whole milk\'s Step 3 amount cleared, Save as a new version pressed'
        lab = 150 if W == 393 else 130
        rows.append((f'{ctx} · what the build does today', f'{what}. The page scrolls to the line, the cursor lands in its field, the line is bold and outlined. No sentence is printed anywhere.', lab, [
            panel(f'a-row-{W}', W, 'a_whole2', 'table', 'Built · the line after Save',
                  f'Field ringed {a["inputOutline"]}, line bold with a {a["rowOutline"].split()[0]} outline; the table prints no text. The page has scrolled {a["landed"]["scrollY"]}px, so the field is {n(a["landed"]["inp"])}px from the top of the view.'),
            panel(f'a-cer-{W}', W, 'a_whole2', 'form', 'Built · the ceremony at that moment',
                  f'Empty sentence slot, empty status line. Save is {n(-a["landed"]["save"])}px above the top of the view. The field has no aria-invalid and the page and form status are empty, so a screen reader hears nothing.'),
            panel(f'a-ver-{W}', W, 'a_ver', 'form', 'Built · Version name blank, for comparison',
                  f'The only blocked sentence the build prints: "{v["sentences"][0]}" beneath its field, and "{v["formStatusText"]}" above the buttons (the form status, spoken). The page does not scroll ({v["landed"]["scrollY"]}px).')]))
        rows.append((f'{ctx} · where the sentence could go', 'The wording stays as built (app/src/domain/lineage.js blockedSaveMessage). A prints it in the line, in the face of the version line\'s sentence. B prints it in the ceremony\'s status line, above the buttons.', lab, [
            panel(f'o-row-whole2-{W}', W, 'o_row_whole2', 'table', 'A · in the line (recommended)',
                  f'Under the line\'s own name, last in the cell, 12px, bold as the marked line is (the size and face of the version sentence). Row {n(a["row"]["h"])} to {n(o["row"]["h"])}px (+{n(o["row"]["h"] - a["row"]["h"])}); {"one line" if o["row"]["h"] - a["row"]["h"] < 20 else "two lines"} in a {n(o["nameCell"]["w"])}px name cell. The cursor is in this line, so the sentence is on screen with it. The field would name it (aria-describedby, aria-invalid), so a screen reader reads it as focus lands.'),
            panel(f'o-row-cream-{W}', W, 'o_row_cream', 'table', 'A · a line with no portion line',
                  f'Heavy cream, one line. Row {n(cr["row"]["h"])} to {n(ocr["row"]["h"])}px (+{n(ocr["row"]["h"] - cr["row"]["h"])}); {FITS if ocr["row"]["h"] - cr["row"]["h"] < 1 else "two lines in a " + n(ocr["nameCell"]["w"]) + "px name cell"}.'),
            panel(f'o-row-nan-{W}', W, 'o_row_nan', 'table', 'A · the other sentence: "4o" typed',
                  f'The not-a-number sentence, the same place. Row {n(a["row"]["h"])} to {n(F(W, "o_row_nan")["row"]["h"])}px.'),
            panel(f'o-cer-whole2-{W}', W, 'o_cer_whole2', 'form', 'B · at the ceremony',
                  f'The sentence in the status line above the buttons. Form {n(a["form"]["h"])} to {n(c["form"]["h"])}px (+{n(c["form"]["h"] - a["form"]["h"])}). With the cursor in the line, this is {n(-a["landed"]["save"])}px above the view: it is printed, and not seen.')]))
    board('R35C_BlockedRow', 'blocked-row-sentence', 'C · a blocked save on an ingredient line: where the sentence goes. As built (the line is outlined, no sentence), A (in the line, recommended) and B (at the ceremony) (Olive Oil v1; 1366 and 393)', rows)
build_board()
json.dump({'boards': ENTRIES_A}, open(OUT + '/blocked-canvas-entries.json', 'w'), indent=2)
print('ok blocked', {fn: (e['w'], e['h']) for fn, e in ENTRIES_A.items()})
