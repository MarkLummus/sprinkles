import sys; sys.argv=['x']
import gen
from gen import *
# Sid, 2026-10-02 (todo 2026-09-24-decide-whether-the-batch-and-tasting-log-is-entered-on-the-phone; Mark chose option C on
# 2026-10-02: the phone transcribes any time, with the same pen as the desk). Below 724 the recipe band gains a "Go to batch" row
# that jumps to the batch log, and the filled action becomes Record a batch (no batch yet) or Record another (a batch exists),
# with Next version a text control. The Sheet, the folds, Show changes, the rails and the log are the approved boards' own markup
# (layout_c_rung's narrow branch, unchanged except for the two band edits and, in the awaiting-tasting panel, the log's own words);
# the pen is not drawn here, it is 393-pen-app.html (decision 29). Nothing live-at-the-machine, no timers, no photo, no new field,
# and the log stays below the Sheet.
#
# Panels, left to right: a tasted batch; a batch awaiting tasting; no batch yet; and the band alone for a version that has a parent
# (the commonest version: its Show changes control makes the action row wrap). The status words on the jump row are Home's own
# (Tasted, Awaiting tasting, Not yet churned). Each board's panels share one set of forced narrow rules, as the 393 and 723 boards do.

STATUS = {'tasted': 'Tasted', 'awaiting': 'Awaiting tasting', 'none': 'Not yet churned'}

def jump_row(status):
    """A link row in the History row's grammar: the control word, then the status at the row's end; the whole row is one 44px target."""
    ctl = ('<span style="font-family:var(--face-grotesk);font-size:var(--sheet-type-control);font-weight:400;letter-spacing:normal;'
           'text-transform:none;color:var(--sheet-ink);text-decoration:underline;text-underline-offset:3px;">Go to batch</span>')
    st = f'<span style="font-family:{GROT};font-size:12px;font-weight:400;color:{TEXT2};">{status}</span>'
    return (f'<a href="#batch" tabindex="0" style="display:flex;width:100%;min-height:44px;align-items:center;justify-content:space-between;'
            f'gap:14px;text-decoration:none;color:inherit;">{ctl}{st}</a>')

def actions(state, parent):
    primary = 'Record a batch' if state == 'none' else 'Record another'
    more = textctl('Next version') + (textctl('Show changes') if parent else '')
    return f'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">{filled(primary)}{more}</div>'

OLD_ACTIONS = f'''<div style="display:flex;gap:10px;flex-wrap:wrap;">{filled('Next version')}</div>'''

def log_for(state):
    if state == 'none':
        h = batch_log('none', column=True)
    else:
        h = batch_log('batch', column=True)
        if state == 'awaiting':
            # the built app's own words for a batch with no tasting (Coconut v2, measured): no Tasting head, one sentence
            h, n = re.subn(r'<section aria-label="Tasting".*?</section>\n  ', f'<p style="margin:0;font-family:{GROT};font-size:15px;color:{TEXT};">This batch has not been tasted yet.</p>\n  ', h, count=1, flags=re.S)
            assert n == 1
    h = h.replace('<section aria-label="Batch"', '<section id="batch" aria-label="Batch"', 1)
    return h

def band_phone(state, parent=False):
    """layout_c_rung's narrow band, with the two edits of option C."""
    vb = version_block(draft=None if parent else 'Version 2 · less oil')
    if parent:
        vb = vb.replace('Version 1 · 50 g oil · 800 g <span', 'Version 2 · less oil <span', 1)
    assert OLD_ACTIONS in vb
    vb = vb.replace(OLD_ACTIONS, actions(state, parent), 1)
    top = f'<div style="display:flex;flex-direction:column;gap:20px;">{recipe_identity(False)}{vb}{jump_row(STATUS[state])}</div>'
    versions = [('1 Jul', 'Version 1 · 50 g oil · 800 g', 'churned 2 Aug · Latest' if state != 'none' else 'not yet churned · Latest', state != 'none', True),
                ('20 Sep', 'Version 2 · less oil', 'draft', False, False)]
    return f'''<header style="display:flex;flex-direction:column;gap:20px;padding:16px 0 20px;border-bottom:1px solid {DIV};">
  {top}
  {history_upright(versions, '2 versions')}
</header>'''

def page_phone(state, parent=False):
    band = band_phone(state, parent)
    if parent:
        return f'<div style="padding:0 20px;">{band}</div>'
    sheet_state = 'none' if state == 'none' else 'batch'
    return (f'<div style="display:flex;flex-direction:column;gap:24px;padding-bottom:40px;"><div style="padding:0 20px;">{band}</div>'
            f'{sheet(sheet_state)}<div style="padding:0 20px;">{log_for(state)}</div></div>')

# Self-check: with the two band edits undone, the narrow page for the tasted state is the approved board's own markup.
def _baseline():
    return layout_c_rung(393)
_mine = page_phone('tasted')
_mine_undone = (_mine.replace(actions('tasted', False), OLD_ACTIONS, 1).replace(jump_row(STATUS['tasted']), '', 1)
                .replace('<section id="batch" aria-label="Batch"', '<section aria-label="Batch"', 1))
# the band's gap row left an extra 20px flex gap only where the jump row stood; compare after removing that child
_mine_undone = _mine_undone.replace('</div></div>\n  <div style="display:flex;flex-direction:column;gap:10px;"><div style="display:flex;align-items:baseline', '</div></div>\n  <div style="display:flex;flex-direction:column;gap:10px;"><div style="display:flex;align-items:baseline')
BASE_OK = (re.sub(r'\s+', '', _mine_undone) == re.sub(r'\s+', '', _baseline()))
print('tasted panel equals the approved narrow page with the C edits undone:', BASE_OK)
assert BASE_OK

def shell_of(main_html, title, w, extra_css):
    html = board(title, w, 100, main_html, 'notebook', extra_css)
    m = re.search(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', html, flags=re.S)
    return m.group(0)[:-len('\n</div>\n</x-dc>')]

def suffix_ids(html, vid):
    html = re.sub(r' id="(fold-[a-z]+|batch)"', lambda m: f' id="{m.group(1)}-{vid}"', html)
    html = re.sub(r' aria-controls="(fold-[a-z]+)"', lambda m: f' aria-controls="{m.group(1)}-{vid}"', html)
    return html.replace('href="#batch"', f'href="#batch-{vid}"')

CAPTION = f'margin:0 0 10px;font-family:{GROT};font-size:16px;line-height:22px;font-weight:600;color:{TEXT};'
SUBCAP = f'margin:0;font-family:{GROT};font-size:14px;line-height:20px;font-weight:400;color:{TEXT2};'
PANELS = [('tasted', False, 'Tasted batch', 'Record another is filled; the log below holds the batch'),
          ('awaiting', False, 'Batch awaiting tasting', 'Record another is filled; the log says not tasted yet'),
          ('none', False, 'No batch yet', 'Record a batch is filled; the jump lands on the log'),
          ('none', True, 'Version with a parent', 'The band alone; Show changes sits beside Next version')]
# panel heights: the tallest page, measured on the first render of each width (see the report)
HEIGHTS = {393: 3965, 723: 3505}
CAP_H = 22 + 10 + 20 + 10

def phone_board(width, key, title, extra_css):
    gap = 40
    panels = ''
    for i, (state, parent, head, sub) in enumerate(PANELS):
        vid = f'p{i}'
        css = extra_css
        shell = shell_of(phone_folds(page_phone(state, parent), open_=False), title, width, css)  # decision 18: closed below 1366
        shell = suffix_ids(shell, vid)
        x = gap + i * (width + gap)
        panels += (f'<div style="position:absolute;left:{x}px;top:{gap}px;width:{width}px;">'
                   f'<p style="{CAPTION}">{head}</p><p style="{SUBCAP}">{sub}</p>'
                   f'<div style="margin-top:10px;width:{width}px;outline:1px solid {DIV};background:#ffffff;transform:translateZ(0);">{shell}</div></div>\n')
    bw = gap + len(PANELS) * (width + gap)
    bh = gap + CAP_H + HEIGHTS[width] + gap
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#f3f4f2;">{panels}</div>'
    html = board(title, bw, bh, '', 'notebook', extra_css + '[hidden]{display:none !important}')
    html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
    open(OUT + '/' + key + '.dc.html', 'w').write(html)
    return bw, bh

T393 = 'C · 393 · option C, the phone transcribes: Go to batch in the band, Record another or Record a batch filled, Next version a text control (drawn 2026-10-02, awaiting Mark\'s look)'
T723 = 'C · 723 · option C, the same states at the widest phone form (drawn 2026-10-02, awaiting Mark\'s look)'
bw393, bh393 = phone_board(393, 'R35C_393PhoneLog', T393, FORCED + PHONE_TABLE)
bw723, bh723 = phone_board(723, 'R35C_723PhoneLog', T723, SHELL_TABS + ONE_COL + AFTER_TOUCH + PHONE_TABLE)

Y = 47400
ENTRIES = {
  'R35C_393PhoneLog.dc.html': dict(x=0, y=Y, w=bw393, h=bh393, page='page-13', title=T393),
  'R35C_723PhoneLog.dc.html': dict(x=bw393 + 160, y=Y, w=bw723, h=bh723, page='page-13', title=T723),
}
NOTES = {
  'r35-phonelog-title': {'kind': 'title1', 'page': 'page-13', 'x': 0, 'y': Y - 240, 'maxW': bw393 + 160 + bw723, 'text': 'Logging on the phone, option C (Mark chose it 2026-10-02; drawn, awaiting Mark\'s look)'},
  'r35-phonelog-note': {'fill': 'gray', 'page': 'page-13', 'x': bw393 + 160 + bw723 + 80, 'y': Y, 'w': 400, 'text': 'Option C: the phone transcribes any time, with the same pen as the desk. Below 724 the band gains one row, Go to batch, which jumps to the batch log (it shows Home\'s own status words: Tasted, Awaiting tasting, Not yet churned). The filled action is Record another when a batch exists and Record a batch when none does, and Next version becomes a text control beside it. Each board has three whole pages (tasted, awaiting tasting, no batch) and a fourth panel for a version with a parent, where Show changes wraps under the filled action. Everything else is the approved 393 and 723 pages: the Sheet, the folds, the rails, the log, the pen (393-pen-app). Not drawn: live logging at the machine, timers, photo capture, new fields, the log above the Sheet.'},
}
json.dump({'boards': ENTRIES, 'notes': NOTES}, open(OUT + '/phonelog-canvas-entries.json', 'w'), indent=2)
print('ok', bw393, bh393, bw723, bh723)
