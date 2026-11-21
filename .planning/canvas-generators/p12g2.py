# Sid, 2026-11-21 (Phase 12 Gate 2; ROADMAP "Design gate 2"; 12-CONTEXT.md D-06, D-08, D-09, D-11; PRODUCT.md "On the phone"; Mark's List rows todo-phone-hide-entry-points,
# bug-p11-pen-step-no-preview, todo-reorder-row-controls, todo-add-ingredient-per-row). APPROVED by Mark 2026-11-21 on Mark's List (look-p12-phone-entry-points, decide-p12-desk-page-words = A, look-p12-pen-preview-step,
# look-p12-row-controls-r3 with its four points confirmed; decide-p12-add-step-place = A earlier the same day); the boards' titles and headings say so.
#   P12G2_Band         A  the recipe page's head below 724: the three standings, a version that can be edited, an edit kept, a Next version draft kept; 393 and one at 723; as built beside
#   P12G2_Places       A  the Notebook at 393 without and with a kept draft, Home, More
#   P12G2_DeskPage     A  the one-line page a hidden job's address shows (New recipe, Edit), and three wordings
#   P12G2_PenPreview   B  Preview step on an open step in the version pen (Next version), 1366
#   P12G2_RowControls  C  the creation editor's row controls in their new order with Add ingredient on each row, the Tab order numbered, 1366; Add ingredient's two landings
#   P12G2_StepOrder    C  the two places for a step's Add step, as first drawn; DECIDED A by Mark 2026-11-21 (decide-p12-add-step-place = last-line); kept as the record of the choice
# REDRAWN 2026-11-21 (Mark, chat, the same day): P12G2_RowControls only. Two groups, kept together. The step group acts on the step itself, in this Tab order: lead-in, instruction,
# target, purpose, Change ingredients, aside, Preview step last. The list group acts on the step among the steps, on the step's last line: Add step, Move up, Move down, Remove.
# Cmd+Return in a step's field adds a step after it (Ctrl+Return too at the desk); Ctrl+Cmd+Up and Ctrl+Cmd+Down move it (Mark, later the same day); Remove has no key. One line of
# words under each region's heading names the keys. The ingredient row takes the same grouping: grams, Add to step
# (when in no step), then Add ingredient, Move up, Move down, Remove, with Cmd+Return in the grams field opening the picker. The redrawn board starts from p12g2c-capture.json;
# sets A and B and P12G2_StepOrder's panels still start from p12g2-capture.json and regenerate byte for byte.
# Every panel is the built app's own markup (p12g2-capture.mjs: WebKit, coarse, app/dist of 2026-11-16) under the app's own stylesheets resolved at 393, 723 and 1366 coarse (a canvas
# artboard gets no narrow viewport), with only the Gate 2 changes drawn over it:
#   A  below 724 the controls New recipe, Edit, Resume editing, Next version (band and Home row), Import and Export are LEFT OUT of the markup; Print sheet stays; a kept draft keeps its
#      Notebook row without Resume. Two things the roadmap does not name are drawn because the build needs them: a version with an edit kept shows one line under its identity (today the
#      band hides the record act while an edit is kept, so without a line the band would show Print sheet and no reason), and a kept Next version draft shows one line in the band
#      in place of the pen, because Next version has no address of its own for a one-line page to stand at.
#   B  the pen's open step gains the creation editor's own Preview step control and preview block (the .mk-preview the build draws while creating), under the step's fields.
#   C  D-08: add leads. A row reads Add ingredient · [Add to step] · Move up · Move down · Remove; a step's last line reads Add step · Move up · Move down · Remove. D-09: Add ingredient on a row.
# The numbered purple discs are notes (the Tab order), not in the app. The Tab order of the as-built panel is the one WebKit walked in the built app (p12g2-capture.json tabWalk); the
# drawn panel's is walked in WebKit on the board markup by p12g2-measure.mjs and must equal its numbers. The example words are Sid's.
#   node p12g2-capture.mjs ; python3 p12g2.py measure <out> ; node p12g2-measure.mjs <out>/measure.html [chromium] ; python3 p12g2.py <canvas.json read from the artifact root> <out>
import json, os, re, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, SHELLC, resolve_media, scope_css, unique_ids, APP_ROOT
import printstart
CAP = json.load(open(HERE + '/p12g2-capture.json'))
CAPC = json.load(open(HERE + '/p12g2c-capture.json'))      # the redraw's own capture (p12g2c-capture.mjs)
M = json.load(open(HERE + '/p12g2-measure.json')) if os.path.exists(HERE + '/p12g2-measure.json') else {}
HOMEC = open(os.path.join(APP_ROOT, 'home.css')).read() + '\n'
esc = lambda s: _html.escape(str(s), quote=True)

DESK = 'at the desk or on the iPad'                     # Mark's own words (PRODUCT.md "On the phone"); the wording is his to pick (decide-p12-desk-page-words)
WORDS = {'A': lambda job: f'Done {DESK}.', 'B': lambda job: f'{job} is done {DESK}.', 'C': lambda job: 'Needs a wider screen: the desk or the iPad.'}
JOBS = {'new': ('New recipe', 'New recipe'), 'edit': ('Edit', 'Editing')}      # the address's job: (page title, the job as the sentence's subject)
LINE_EDIT = f'Edit kept. Finish it {DESK}.'
LINE_DRAFT = f'Draft: Version 2 · less cream. Finish it {DESK}.'

# ---- shared ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
def clean(h): return printstart.drop_hidden(h)
def cut_sheet(h):
    """A recipe page's head only: everything after the band is left out of the markup (the Sheet and the log do not change)."""
    a = h.index('</header>', h.index('class="notebook-band"')) + len('</header>'); b = h.index('</main>')
    return h[:a] + '</div>' + h[b:]
def drop(h, pat, n=None):
    h2, k = re.subn(pat, '', h); assert k and (n is None or k == n), (pat, k); return h2
BTN = lambda words, cls='[^"]*': r'<button type="button" class="%s" tabindex="0">%s</button>' % (cls, words)
def band(h, line=None):
    """The band below 724 as drawn: no Next version, no Edit, no Resume editing."""
    a = h.index('<div class="notebook-version__acts">'); b = h.index('</div>', a); acts = h[a:b]
    acts = re.sub(BTN('(?:Next version|Edit|Resume editing)'), '', acts); assert 'Print sheet' in acts
    h = h[:a] + acts + h[b:]
    if line:
        i = h.index('</h2>', h.index('class="notebook-version__identity')) + 5; h = h[:i] + f'<p class="notebook-version__draft">{esc(line)}</p>' + h[i:]
    return h
def notebook(h):
    h = re.sub(r'<button type="button" class="notebook-action" tabindex="0">New recipe</button>', '', h); assert '>New recipe<' not in h
    h = re.sub(r'<span class="nb__draft-act">.*?</span>', '', h); assert '>Resume<' not in h
    return h
def home(h):
    h, k = re.subn(r'<span class="home__actions"><a class="home__action"[^>]*>Next version</a><a class="home__action home__action--secondary"[^>]*>Adapt</a></span>', '', h); assert k
    assert '>Next version<' not in h; return h
def more(h):
    h, k = re.subn(r'<li><button type="button" class="shell__place" tabindex="0"><svg.*?</svg>(?:Import|Export)</button></li>', '', h, flags=re.S); assert k == 2, k; return h
def desk_page(job, cand):
    """The one-line page: the built placeholder place's own markup (h1.place__title, p.place__note) inside the Notebook's shell."""
    h = CAP['notebook_393']['html']; a = h.index('<div class="list-page place nb">'); b = h.index('</main>')
    return h[:a] + f'<div class="list-page place"><h1 class="place__title">{esc(JOBS[job][0])}</h1><p class="place__note">{esc(WORDS[cand](JOBS[job][1]))}</p></div>' + h[b:]

SEP_I = '<span aria-hidden="true"> · </span>'; SEP_S = '<span aria-hidden="true">·</span>'
def buttons(seg): return {re.search(r'data-act="([^"]*)"', b).group(1): b for b in re.findall(r'<button\b[^>]*>[^<]*</button>', seg)}
def rows(h):
    """D-08, D-09 on an ingredient row: Add ingredient · [Add to step] · Move up · Move down · Remove."""
    def one(m):
        bs = buttons(m.group(1)); name = re.search(r'aria-label="remove ([^"]*)"', bs['remove']).group(1)
        bs['add-ingredient'] = f'<button type="button" class="text-control" data-act="add-ingredient" aria-label="Add ingredient after {name}" tabindex="0">Add ingredient</button>'
        return '<span class="mk-row-acts">' + SEP_I.join(bs[k] for k in ('add-ingredient', 'add-to-step', 'move-up', 'move-down', 'remove') if k in bs) + '</span>'
    h, k = re.subn(r'<span class="mk-row-acts">(.*?)</span></td>', lambda m: one(m) + '</td>', h); assert k; return h
def steps(h, place='A'):
    """D-08 on a step: its last line reads Add step · Move up · Move down · Remove (A); B moves that line up to stand right under the step's two fields."""
    def one(m):
        bs = buttons(m.group(1)); return '<p class="method-step__acts">' + SEP_S.join(bs[k] for k in ('add-after', 'move-up', 'move-down', 'remove')) + '</p>'
    h, k = re.subn(r'<p class="method-step__acts">(.*?)</p>', one, h); assert k
    if place == 'B':
        h, k2 = re.subn(r'(<p class="method-step__targets">.*?)(<p class="method-step__acts">.*?</p>)', r'\2\1', h); assert k2 == k
    return h
# How the maker learns the three keys: one line of plain words under each region's heading, once, in the uses line's own small grotesk (proposed class mk-keys, existing tokens only).
# Not beside each step's controls: three shortcuts on every step's last line would add weight to every step, and on an ingredient row in no step they do not fit the line (measured).
KEYS_STEP = 'In a step: Cmd+Return adds a step after it. Ctrl+Cmd+Up or Down moves it.'
KEYS_ROW = 'In a row\'s grams: Cmd+Return adds an ingredient after it. Ctrl+Cmd+Up or Down moves it.'
MOVE = 'Ctrl+Cmd+Down'
def keys_line(h, words):
    i = h.index('</div>', h.index('class="mk-head-row"')) + 6 if 'class="mk-head-row"' in h else h.index('</h2>') + 5      # the heading row; with the picker open the build draws the heading alone
    return h[:i] + f'<p class="mk-keys">{esc(words)}</p>' + h[i:]
KEYS = 'Cmd+Return'                                    # how the maker learns the shortcut: plain words beside the control, in the line's own small type
def rows2(h):
    """The redraw on an ingredient row: the row's own controls first (grams, Add to step when it is in no step), then the list group: Add ingredient, Move up, Move down, Remove."""
    def one(m):
        bs = buttons(m.group(1)); name = re.search(r'aria-label="remove ([^"]*)"', bs['remove']).group(1)
        bs['add-ingredient'] = f'<button type="button" class="text-control" data-act="add-ingredient" aria-label="Add ingredient after {name}" aria-keyshortcuts="Meta+Enter Control+Enter" tabindex="0">Add ingredient</button>'
        for k, key in (('move-up', 'ArrowUp'), ('move-down', 'ArrowDown')): bs[k] = bs[k].replace(' tabindex', f' aria-keyshortcuts="Control+Meta+{key}" tabindex')
        return '<span class="mk-row-acts">' + SEP_I.join(bs[k] for k in ('add-to-step', 'add-ingredient', 'move-up', 'move-down', 'remove') if k in bs) + '</span>'
    h, k = re.subn(r'<span class="mk-row-acts">(.*?)</span></td>', lambda m: one(m) + '</td>', h); assert k; return keys_line(h, KEYS_ROW)
def steps2(h, preview=None):
    """The redraw on a step. Step group, in Tab order: lead-in, instruction, target (its chips, Add target), purpose (its field, or Add purpose beside Add target), the uses line with
    Change ingredients, aside (its field, or Add aside), Preview step last. Then the list group on the last line: Add step (with the shortcut's words), Move up, Move down, Remove.
    What moves against the build: Add purpose leaves the uses line for the target line; the aside's field moves below the uses line; Add aside and Preview step make the step group's
    last line (Preview step leaves the target line); pressed, the preview block stands under that line."""
    def one(m):
        li = m.group(0); n = re.search(r'<span class="method-step__n" aria-hidden="true">(\d+)</span>', li).group(1); B = lambda label: re.search(r'<button\b[^>]*aria-label="Step %s, %s"[^>]*>[^<]*</button>' % (n, label), li)
        F = lambda label: re.search(r'<label class="method-step__field"><textarea[^>]*aria-label="Step %s, %s">[^<]*</textarea></label>' % (n, label), li)
        pv, ap, aa, pf, af = B('(?:Preview step|Hide preview)'), B('add purpose'), B('add aside'), F('purpose'), F('aside'); assert pv
        tg = re.search(r'<p class="method-step__targets">(.*?)</p>', li).group(1).replace(pv.group(0), ''); us = re.search(r'<p class="method-step__uses-line">(.*?)</p>', li).group(1)
        for b in (ap, aa):
            if b: us = us.replace(SEP_S + b.group(0), '')
        bs = buttons(re.search(r'<p class="method-step__acts">(.*?)</p>', li).group(1)); bs['add-after'] = bs['add-after'].replace(' tabindex', ' aria-keyshortcuts="Meta+Enter Control+Enter" tabindex')
        for k, key in (('move-up', 'ArrowUp'), ('move-down', 'ArrowDown')): bs[k] = bs[k].replace(' tabindex', f' aria-keyshortcuts="Control+Meta+{key}" tabindex')
        pvb = pv.group(0); block = ''
        if preview == n: pvb = pvb.replace('Preview step', 'Hide preview'); block = preview_block()
        head = li[:li.index('<p class="method-step__targets">')]; head = head.replace(pf.group(0), '') if pf else head; head = head.replace(af.group(0), '') if af else head
        fs = re.search(r'<fieldset class="method-step__uses".*?</fieldset>', li, re.S)
        return (head + f'<p class="method-step__targets">{tg}{ap.group(0) if ap else ""}</p>' + (pf.group(0) if pf else '') + f'<p class="method-step__uses-line">{us}</p>' + (fs.group(0) if fs else '') + (af.group(0) if af else '')
                + f'<p class="method-step__targets">{aa.group(0) if aa else ""}{pvb}</p>' + block + '<p class="method-step__acts">' + SEP_S.join(bs[k] for k in ('add-after', 'move-up', 'move-down', 'remove')) + '</p></div></li>')
    h, k = re.subn(r'<li class="method-step mk-step" data-step="(\d+)">.*?</div></li>', one, h, flags=re.S); assert k; return keys_line(h, KEYS_STEP)
def preview_block():
    pv = CAP['ed_preview']['method']; a = pv.index('<div class="mk-preview"'); d = 0
    for m in re.finditer(r'<div\b|</div>', pv[a:]):
        d += -1 if m.group(0) == '</div>' else 1
        if d == 0: return pv[a:a + m.end()]
def mark(h, label, words):
    """A purple note beside one control (where focus lands, what was pressed): a note, not in the app."""
    a = h.index(f'aria-label="{label}"'); i = h.rindex('<', 0, a); tag = f'<i class="dl-flag" aria-hidden="true">{esc(words)}</i>'
    return h[:i] + tag + h[i:] if h[i:i + 9] == '<textarea' else h[:h.index('>', a) + 1] + tag + h[h.index('>', a) + 1:]
def number(h, start=1):
    """The Tab order as numbered notes: every control in markup order (the build gives each tabindex 0, and a greyed Move button is still a stop)."""
    n = [start - 1]
    def one(m):
        n[0] += 1; disc = f'<i class="dl-tab" aria-hidden="true">{n[0]}</i>'
        if 'target-chip__value-field' in m.group(0): disc = disc.replace('class="dl-tab"', 'class="dl-tab dl-tab--mid"')
        return m.group(0) + disc if m.group(1) == 'button' else disc + m.group(0)
    return re.sub(r'<(button|textarea)\b[^>]*>', one, h), n[0]
def labels(h): return [re.search(r'aria-label="([^"]*)"', t[1]).group(1) if 'aria-label=' in t[1] else re.sub(r'<[^>]*>', '', t[2]) for t in re.findall(r'<(button|textarea)\b([^>]*)>([^<]*)', h)]
def pen_preview(h, showing):
    """B: Preview step on the pen's open step, on the line the creation editor gives it; pressed, it reads Hide preview above the creation editor's own preview block."""
    pv = CAP['ed_preview']['method']; a = pv.index('<div class="mk-preview"'); d = 0
    for m in re.finditer(r'<div\b|</div>', pv[a:]):
        d += -1 if m.group(0) == '</div>' else 1
        if d == 0: block = pv[a:a + m.end()]; break
    word = 'Hide preview' if showing else 'Preview step'
    line = f'<p class="method-step__targets"><button type="button" class="text-control" aria-label="Step 1, {word}" tabindex="0">{word}</button></p>' + (block if showing else '')
    key = '</div><div><p class="method-step__uses-line">'; assert h.count(key) == 1; return h.replace(key, '</div>' + line + '<div><p class="method-step__uses-line">')

def sheet(*regions, tabs=False, page='notebook mk-page'):
    """The creation editor's (or the pen's) Sheet column, 528 wide as built, holding the given regions."""
    return (f'<div class="{page}{" g2-tabs" if tabs else ""}" style="padding:0;max-width:none;display:block;min-height:0"><div class="notebook-body" style="display:block;margin:0;padding:0"><div class="notebook-body__sheet" style="margin:0;padding:24px;width:576px;box-sizing:border-box">'
            f'<article class="recipe-page" style="display:block;margin:0;padding:0;width:528px;max-width:none">{"".join(regions)}</article></div></div></div>')

NOTE_CSS = '''
.dl-wrap{font-family:var(--face-grotesk);color:#141414}
.dl-title{font-size:20px;line-height:26px;font-weight:600;margin:0}
.dl-sub{font-size:15px;line-height:21px;color:#595959;margin:4px 0 0}
.dl-cap{font-family:var(--face-grotesk);font-size:15px;line-height:21px;font-weight:600;margin:0;color:#141414}
.dl-cap small{display:block;font-weight:400;font-size:13px;line-height:18px;color:#595959}
.fp-win{box-sizing:border-box;position:relative;outline:1px solid #c9c9c4;overflow:hidden;transform:translateZ(0)}
.g2-tabs button,.g2-tabs .ingredient-table__plan-grams,.g2-tabs .method-step__field{position:relative}
.dl-tab{position:absolute;left:-7px;top:-7px;z-index:3;box-sizing:border-box;min-width:16px;height:16px;padding:0 3px;border-radius:8px;background:#7a2e8e;color:#ffffff;font:600 10px/16px var(--face-grotesk);font-style:normal;text-align:center;letter-spacing:0;text-transform:none;pointer-events:none}
.g2-tabs button > .dl-tab{top:2px}
'''
FLAG_CSS = '''.mk-keys{font-family:var(--face-grotesk);font-size:var(--sheet-size-cross-flag);margin:var(--gap-xs) 0 var(--gap-xs)}
.g2-tabs .target-chip{position:relative}
.dl-tab.dl-tab--mid{left:calc(50% - 30px)}
.dl-flag{position:absolute;left:0;top:-15px;z-index:4;white-space:nowrap;padding:0 6px;border-radius:3px;background:#7a2e8e;color:#ffffff;font:600 11px/16px var(--face-grotesk);font-style:normal;letter-spacing:0;text-transform:none;pointer-events:none}
.g2-tabs button > .dl-flag{top:auto;bottom:-14px}
'''
SIZES = {393: 852, 723: 620, 1366: 1024}
def panel_css():
    css = [printstart.FONT, resolve_media(TOK, 1366, True), NOTE_CSS]
    for W, H in SIZES.items():
        pc = ''.join(resolve_media(c, W, True) for c in (TOK, APPC, NBC, SHELLC, HOMEC)); pc = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', pc)
        css.append(scope_css(pc, f'.g2w-{W}').replace('100vh', f'{H}px'))      # a panel is its own window: the window's height stands in for the viewport's
    return ''.join(css)

PANELS = []
def P(pid, W, html, cap, sub, h=None, w=None, natural=False, tabs=0):
    """A panel: a phone window (393 x 852, or shorter) holding a whole page, or a desk panel at its natural height (measured)."""
    PANELS.append(dict(pid=pid, W=W, html=unique_ids(clean(html), pid), cap=cap, sub=sub, h=h or SIZES[W], w=w or W, natural=natural, tabs=tabs)); return PANELS[-1]
def win(p):
    hh = M.get(p['pid'], {}).get('h', 600) if p['natural'] else p['h']
    return p['w'], hh, f'<div class="fp-win g2w-{p["W"]}" data-pid="{p["pid"]}" style="width:{p["w"]}px;height:{hh}px">{p["html"]}</div>'
def cell(p): return (*win(p), p['cap'], p['sub'])

def flow(head, sub, rows_, gap=64, PAD=48, LABH=124):
    y = 48; body = f'<div class="dl-wrap" style="position:absolute;left:{PAD}px;top:{y}px;width:1500px"><p class="dl-title">{esc(head)}</p><p class="dl-sub">{sub}</p></div>'; y += 120; bw = 1600
    for title, desc, cells in rows_:
        if title:
            body += f'<div class="dl-wrap" style="position:absolute;left:{PAD}px;top:{y}px;width:1500px"><p class="dl-cap" style="font-size:17px;line-height:23px">{esc(title)}<small style="font-size:14px;line-height:20px">{desc}</small></p></div>'; y += 84
        x = PAD; rowh = max(c[1] for c in cells)
        for w, h, html, cap, s in cells:
            cw = max(w, 393)
            body += f'<div style="position:absolute;left:{x}px;top:{y}px;width:{cw}px"><div style="height:{LABH}px"><p class="dl-cap">{esc(cap)}<small>{s}</small></p></div>{html}</div>\n'
            x += cw + gap
        bw = max(bw, x - gap + PAD); y += LABH + rowh + 72
    return body, int(bw), int(y)

# ---- A ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
R = lambda k: cut_sheet(CAP[k]['html'])
def build_band():
    r0 = [cell(P('band-built-tasted', 393, R('recipe_tasted_393'), 'As built · Olive Oil, tasted', 'Record another, Next version, Print sheet.')),
          cell(P('band-built-editable', 393, R('recipe_editable_393'), 'As built · Coffee, Version 1, not yet churned', 'A first version with no batch can be edited: Record batch, Next version, Edit, Print sheet.')),
          cell(P('band-built-editing', 393, R('recipe_editing_393'), 'As built · Coffee, an edit kept', 'Resume editing, Print sheet. The build already leaves Record batch and Next version out while an edit is kept.'))]
    r1 = [cell(P('band-tasted', 393, band(R('recipe_tasted_393')), 'Tasted', 'Record another, Print sheet.')),
          cell(P('band-awaiting', 393, band(R('recipe_awaiting_393')), 'Awaiting tasting', 'Record tasting, Print sheet. The phone\'s one named job leads.')),
          cell(P('band-none', 393, band(R('recipe_none_393')), 'Not yet churned', 'Record batch, Print sheet.')),
          cell(P('band-tasted-723', 723, band(R('recipe_tasted_723')), 'Tasted, at 723', 'The widest window that still counts as phone width: the same two controls.'))]
    r2 = [cell(P('band-editable', 393, band(R('recipe_editable_393')), 'A version that can be edited', 'No Edit: the band reads as any not yet churned version does.')),
          cell(P('band-editing', 393, band(R('recipe_editing_393'), LINE_EDIT), 'An edit kept', f'No Resume editing. Drawn in addition to the roadmap: one line under the version, "{LINE_EDIT}", so the missing Record batch has a reason. Print sheet stays.')),
          cell(P('band-draft', 393, band(R('recipe_editable_393'), LINE_DRAFT), 'A Next version draft kept', f'Today the pen reopens here. Drawn: the pen stays shut and one line stands in its place, "{LINE_DRAFT}" Next version has no address of its own, so this line is its one-line page.'))]
    return flow('Recipe page head below 724 · no Next version, Edit or Resume editing', 'Phase 12 Gate 2, set A. Built markup at 393 (one at 723); the three controls are left out, Print sheet stays. Rename, Go to batch, the folds and the log do not change. Approved by Mark 2026-11-21 (look-p12-phone-entry-points).',
                [('As built today, for comparison', 'The production build of 2026-11-16 at 393.', r0), ('Drawn · the three standings', 'One filled control, the record act the version waits on, then Print sheet.', r1),
                 ('Drawn · kept work', 'What a version shows when an edit or a Next version draft was kept at the desk.', r2)])

def build_places():
    r = [cell(P('nb', 393, notebook(CAP['notebook_393']['html']), 'Notebook', 'No New recipe beside the title. The list is unchanged.')),
         cell(P('nb-draft', 393, notebook(CAP['notebook_draft_393']['html']), 'Notebook, a new recipe draft kept', 'The draft keeps its row, above the count, without Resume. Its name is not a link, as built.')),
         cell(P('home', 393, home(CAP['home_393']['html']), 'Home', 'A tasted recipe\'s row (Olive Oil, Pineapple) has no Next version: name, standing, nothing else. Record tasting and Record batch rows are unchanged. The lead block loses Next version the same way; Keep developing and Adapt only open the recipe, so they stay.')),
         cell(P('more', 393, more(notebook(CAP['more_393']['html'])), 'More, open', 'Ingredients, Kitchen, then Search under the hairline. No Import, no Export.'))]
    return flow('Notebook, Home and More at 393 · entry points left out', 'Phase 12 Gate 2, set A. Built markup at 393; the left-out controls are not in the markup. Home\'s own layout cut is 760, but the controls go at 724 like everywhere else. Approved by Mark 2026-11-21 (look-p12-phone-entry-points).', [('', '', r)])

def build_deskpage():
    r1 = [cell(P('desk-new', 393, desk_page('new', 'A'), 'New recipe · its address at phone width', 'What /notebook/new shows below 724, a kept draft included (the draft is not touched). The built placeholder place: a title and one line. The tabs are the way out.')),
          cell(P('desk-edit', 393, desk_page('edit', 'A'), 'Edit · its address at phone width', 'What a version\'s /edit address shows below 724, with or without a kept edit.'))]
    r2 = [cell(P(f'desk-{c}', 393, desk_page('new', c), cap, sub, h=300)) for c, cap, sub in (
          ('A', 'Chosen · A · "Done at the desk or on the iPad." (drawn above)', 'The title names the job, so the line does not repeat it. Shortest. For Edit: the same line.'),
          ('B', 'Not chosen · B · "New recipe is done at the desk or on the iPad."', 'A whole sentence, as the placeholder places read today ("Recipe book is not built yet."). For Edit: "Editing is done at the desk or on the iPad."'),
          ('C', 'Not chosen · C · "Needs a wider screen: the desk or the iPad."', 'Stays true in a narrow iPad split view, where A and B tell a maker on the iPad to go to the iPad.'))]
    return flow('The one-line page a hidden job\'s address shows', 'Phase 12 Gate 2, set A. Reached by a saved link or a kept draft below 724. Approved by Mark 2026-11-21 (look-p12-phone-entry-points). The wording is A (decide-p12-desk-page-words); B and C were not chosen. The same words end the two band lines on the head board.',
                [('The page', '', r1), ('Three wordings · the record of the choice', 'Mark chose A. Each window is cut short; the page is the one above.', r2)])

# ---- B ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
def build_pen():
    pen = CAP['pen_open']['method']
    r = [cell(P('pv-editor', 1366, sheet(CAP['ed_preview']['method']), 'As built · creating a recipe, Preview step pressed', 'What Phase 11 drew and built: Preview step beside Add target; pressed, it reads Hide preview and the step shows as it will read.', natural=True, w=576)),
         cell(P('pv-pen-built', 1366, sheet(pen, page='notebook'), 'As built · Next version, step 1 open', 'No Preview step (the bug). The pen\'s open step has no Add target either; that is not in scope and does not change.', natural=True, w=576)),
         cell(P('pv-pen', 1366, sheet(pen_preview(pen, False), page='notebook'), 'Drawn · Next version, step 1 open', 'Preview step on its own line under the two fields, where the creation editor has it. Tab reaches it after the instruction and before Change ingredients.', natural=True, w=576)),
         cell(P('pv-pen-on', 1366, sheet(pen_preview(pen, True), page='notebook'), 'Drawn · Preview step pressed', 'The control reads Hide preview; the creation editor\'s own preview block shows the step as it will read, from what is typed. Cancel and Done are unchanged, and Done or Cancel closes the preview with the step.', natural=True, w=576))]
    return flow('Version pen (Next version) · Preview step on an open step', 'Phase 12 Gate 2, set B (bug-p11-pen-step-no-preview). 1366 only. Built markup; only the Preview step line and its preview block are drawn in. Reordering steps in the pen is not drawn (deferred). Approved by Mark 2026-11-21 (look-p12-pen-preview-step).', [('', '', r)])

# ---- C ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
def editor(key, drawn=True, place='A', tabs=True, part=('ing', 'method')):      # as first drawn: P12G2_StepOrder's panels only
    ing, meth = CAP[key]['ing'], CAP[key]['method']
    if drawn: ing, meth = rows(ing), steps(meth, place)
    n = 0
    if tabs:
        if 'ing' in part: ing, n = number(ing)
        if 'method' in part: meth, n = number(meth, n + 1)
    return sheet(*([ing] if 'ing' in part else []), *([meth] if 'method' in part else []), tabs=tabs), n
def tabs_to(h, frm, to):
    ls = labels(h); return ls.index(to) - ls.index(frm)
def editor2(key, drawn=True, tabs=True, part=('ing', 'method'), marks=(), preview=None, cut_pick=False):
    """A panel of the redraw, from the redraw's own capture."""
    ing, meth = CAPC[key]['ing'], CAPC[key]['method']
    if cut_pick:      # the first rows of the built picker's list; the rest is left out of the markup
        a = ing.index('<ul class="pick__list">'); ing = ing[:ing.index('</li>', a + 2600) + 5] + '</ul></div></section>'
    if drawn: ing, meth = rows2(ing), steps2(meth, preview)
    n = 0
    if tabs:
        if 'ing' in part: ing, n = number(ing)
        if 'method' in part: meth, n = number(meth, n + 1)
    for label, words in marks: ing, meth = (mark(ing, label, words), meth) if f'aria-label="{label}"' in ing else (ing, mark(meth, label, words))
    return sheet(*([ing] if 'ing' in part else []), *([meth] if 'method' in part else []), tabs=True), n
COUNTS = {}
def build_rows():
    b0 = CAPC['ed_base']['ing'] + CAPC['ed_base']['method']; d0 = rows2(CAPC['ed_base']['ing']) + steps2(CAPC['ed_base']['method']); f0 = CAPC['ed_full']['method']; g0 = steps2(f0)
    assert labels(b0) == [w['t'] for w in CAPC['tabWalk'][:-1]], 'the built markup order is not the Tab order WebKit walked'
    wf = [w['t'] for w in CAPC['tabWalkFull'][:-1]]; assert labels(CAPC['ed_full']['ing'] + f0) == wf, 'the built markup order (full step) is not the Tab order WebKit walked'
    I = 'Step 1, instruction'; T = lambda h, to: tabs_to(h, I, to)
    C = COUNTS; C['built'] = {k: T(b0, v) for k, v in (('target', 'Step 1, Add target'), ('aside', 'Step 1, add aside'), ('preview', 'Step 1, Preview step'), ('add', 'Step 1, Add step after it'), ('remove', 'Step 1, remove'))}
    C['drawn'] = {k: T(d0, v) for k, v in (('target', 'Step 1, Add target'), ('aside', 'Step 1, add aside'), ('preview', 'Step 1, Preview step'), ('add', 'Step 1, Add step after it'), ('remove', 'Step 1, remove'))}
    C['built_full'] = {k: T(f0, v) for k, v in (('target', 'Step 1, target label'), ('aside', 'Step 1, aside'), ('preview', 'Step 1, Preview step'), ('add', 'Step 1, Add step after it'), ('remove', 'Step 1, remove'))}
    C['drawn_full'] = {k: T(g0, v) for k, v in (('target', 'Step 1, target label'), ('aside', 'Step 1, aside'), ('preview', 'Step 1, Preview step'), ('add', 'Step 1, Add step after it'), ('remove', 'Step 1, remove'))}
    C['grams'] = dict(placed=tabs_to(d0, 'Heavy cream, 36% fat, grams', 'Add ingredient after Heavy cream, 36% fat'), unplaced=tabs_to(d0, 'Fine sea salt, grams', 'Add ingredient after Fine sea salt'))
    built, nb = editor2('ed_base', drawn=False); drawn, nd = editor2('ed_base'); full, nf = editor2('ed_full', part=('method',)); bfull, nbf = editor2('ed_full', drawn=False, part=('method',))
    D, DF = C['drawn'], C['drawn_full']
    r1 = [cell(P('rc-built', 1366, built, f'As built today · {nb} stops', f'A step: target, Preview step, Change ingredients, purpose, aside, then Remove, Move up, Move down, Add step. Add step is {C["built"]["add"]} Tabs after the instruction. A row: grams, Remove, Move up, Move down, Add to step. The order is the one WebKit walked in the built app.', natural=True, w=576, tabs=nb)),
          cell(P('rc-drawn', 1366, drawn, f'Drawn · {nd} stops', f'Two groups. The step itself: lead-in, instruction, Add target ({D["target"]}), Add purpose, Change ingredients, Add aside ({D["aside"]}), Preview step ({D["preview"]}) closing the group. The step among the steps, on the last line: Add step ({D["add"]} Tabs after the instruction), Move up, Move down, Remove ({D["remove"]}, the last stop). Three keys work from either field and skip the Tabs: {KEYS} adds a step, Ctrl+Cmd+Up and Ctrl+Cmd+Down move it; one line under each heading says so. Remove has no key. A row the same way: grams, Add to step when it is in no step, then Add ingredient, Move up, Move down, Remove, with the same three keys from its grams.', natural=True, w=576, tabs=nd)),
          cell(P('rc-full-built', 1366, bfull, f'As built · step 1 with a target, a purpose and an aside', f'Preview step stands before the purpose and the aside: from the aside it is {tabs_to(f0, "Step 1, Preview step", "Step 1, aside")} Shift+Tabs back. Add step is {C["built_full"]["add"]} Tabs after the instruction.', natural=True, w=576, tabs=nbf)),
          cell(P('rc-full', 1366, full, f'Drawn · the same step', f'The order holds when the parts are written: target ({DF["target"]}), purpose, Change ingredients, aside ({DF["aside"]}), then Preview step ({DF["preview"]}), 1 Tab after the aside. Add step is {DF["add"]} Tabs after the instruction, Remove {DF["remove"]}; the keys skip them all.', natural=True, w=576, tabs=nf))]
    s1, _ = editor2('ed_full', tabs=False, part=('method',), marks=[('Step 1, instruction', f'{KEYS} pressed here')])
    s2, _ = editor2('ed_added', tabs=False, part=('method',), marks=[('Step 2, lead-in', 'focus lands here')])
    s4, _ = editor2('ed_full', tabs=False, part=('method',), marks=[('Step 1, instruction', f'{MOVE} pressed here')])
    s5, _ = editor2('ed_moved', tabs=False, part=('method',), marks=[('Step 2, instruction', 'the caret stays here')])
    s3, _ = editor2('ed_full', tabs=False, part=('method',), preview='1')
    SM, RM = CAPC['stepMove'], CAPC['rowMove']; assert CAPC['stepMoveOff']['heard'] == SM['heard'] and CAPC['stepMoveOff']['order'] == ['Churn', 'Steep'] and CAPC['rowMoveOff']['heard'] == RM['heard']      # a greyed Move says and does nothing in the build
    r2 = [cell(P('kr-press', 1366, s1, f'1 · {KEYS} in a step\'s lead-in or instruction', f'One line under the heading names the three keys; that is how the maker learns them, once, with no words added to each step. Nothing is typed into the field. At the desk Ctrl+Return does the same.', natural=True, w=576)),
          cell(P('kr-added', 1366, s2, '2 · A new step after it, focus in its lead-in', 'The same thing Add step does today (built markup of that state): the new step 2 stands after step 1 and focus is in its lead-in, ready to type.', natural=True, w=576)),
          cell(P('kr-move', 1366, s4, f'1 · {MOVE} in a step\'s lead-in or instruction', 'Ctrl+Cmd+Up moves the step up, Ctrl+Cmd+Down moves it down. Cmd, Option and Shift+Cmd with an arrow keep their own work in the text (caret and selection).', natural=True, w=576)),
          cell(P('kr-moved', 1366, s5, '2 · The step moves; the caret stays where it was in it', f'Built markup of the state after Move down. Steep is step 2 and the caret is still in its instruction, at the same place. Heard: "{SM["heard"][-1]}", what the Move button says today. At the ends (up on the first step, down on the last) the key does nothing and says nothing, as a greyed Move does today.', natural=True, w=576)),
          cell(P('kr-preview', 1366, s3, 'Preview step pressed', 'It reads Hide preview, and the preview block stands under it, at the end of the step\'s own group and above the list line. (The block is the build\'s, from the two-field step; it shows the target and aside as the Sheet does.)', natural=True, w=576))]
    a1, _ = editor2('ed_base', tabs=False, part=('ing',), marks=[('Heavy cream, 36% fat, grams', f'{KEYS} here, or its Add ingredient')])
    a2, _ = editor2('ed_picker', tabs=False, part=('ing',), cut_pick=True); a3, _ = editor2('ed_after_step', tabs=False, marks=[('Egg yolk (fresh), grams', 'focus lands here')]); a4, _ = editor2('ed_after_unplaced', tabs=False, part=('ing',), marks=[('Cinnamon, grams', 'focus lands here')])
    r3 = [cell(P('ai-press', 1366, a1, '1 · Add ingredient on Heavy cream, in Step 1', f'Every row has it, after the row\'s own controls. {KEYS} in a row\'s grams does the same; Ctrl+Cmd+Up and Down move the row within its own step group, as its Move buttons do (heard today: "{RM["heard"][-1]}"). The heading\'s Add ingredient stays.', natural=True, w=576)),
          cell(P('ai-pick', 1366, a2, '2 · The picker opens, in its built place', 'Under the table\'s Total, where the heading\'s Add ingredient opens it today (built markup of the region, the list cut short here). The heading\'s Add ingredient is away while it is open, as built. Cancel first.', natural=True, w=576)),
          cell(P('ai-step', 1366, a3, '3 · Egg yolk picked: it lands right after Heavy cream', 'In the same step group, and ticked in that step\'s Uses: step 1 now reads "uses Heavy cream, Egg yolk, Coffee beans". Focus goes to the new row\'s grams, as the build does after any pick.', natural=True, w=576)),
          cell(P('ai-unplaced', 1366, a4, 'On a row under "Not in a step yet"', 'Add ingredient on Fine sea salt, Cinnamon picked: it lands right after Fine sea salt, in no step. On such a row Add to step comes first, then Add ingredient.', natural=True, w=576))]
    return flow('Creation editor · row controls in two groups, with keys to add and move', 'Phase 12 Gate 2, set C, redrawn 2026-11-21 for Mark\'s decision (Add step stays on the last line; the step\'s own controls and the list\'s controls are two groups; Cmd+Return adds, Ctrl+Cmd+Up and Down move). 1366 only. Built markup with the order, the new control and the shortcut\'s words drawn over it. Purple numbers and tags are notes. Approved by Mark 2026-11-21 (look-p12-row-controls-r3; its four points confirmed).',
                [('The Tab order', 'The iPad Tab walk (D-11) runs once on the drawn order. Uses are shut; open, a step\'s ticks follow Change ingredients as today. The number in brackets is Tabs from the instruction.', r1),
                 ('Keys in a step · add', 'Mark tested the keys on the iPad with the Magic Keyboard on a probe page (the keydown reaches the page and the text is left alone); they also pass in Playwright WebKit. Purple tags are notes.', r2[:2]),
                 ('Keys in a step · move, and Preview step', 'Remove has no key: it is rare and cannot be undone.', r2[2:]),
                 ('Add ingredient on a row', 'The two "after" panels are the built app\'s own markup for that state, with the drawn controls.', r3)], LABH=176)
def build_steporder():
    a, na = editor('ed_base', part=('method',)); b, nb = editor('ed_base', place='B', part=('method',))
    A, B = steps(CAP['ed_base']['method']), steps(CAP['ed_base']['method'], 'B'); f, t = 'Step 1, instruction', 'Step 1, Add step after it'
    r = [cell(P('so-A', 1366, a, f'A · Add step leads the step\'s last line (drawn on the row controls board)', f'The step\'s own parts stay together: fields, target, ingredients, purpose, aside, then the line about the step as a row. Add step is {tabs_to(A, f, t)} Tabs after the instruction (9 today), and {tabs_to(A, "Step 1, change ingredients", t)} after Change ingredients.', natural=True, w=576, tabs=na)),
         cell(P('so-B', 1366, b, 'B · the row line moves up, right under the two fields', f'Add step is {tabs_to(B, f, t)} Tab after the instruction, the quickest there is. The cost: Move up, Move down and Remove stand between the instruction and its target and ingredients, and Add target is {tabs_to(B, f, "Step 1, Add target")} Tabs away instead of 1.', natural=True, w=576, tabs=nb))]
    return flow('A step\'s Add step · two places for it · decided: A', 'Phase 12 Gate 2, set C. DECIDED by Mark 2026-11-21 (decide-p12-add-step-place): A, the last line. Kept as the record of the choice, as first drawn; the step\'s own controls have since been regrouped on the row controls board, which is the one to build from.', [('', '', r)])

TITLES = {'P12G2_Band': 'Recipe page head below 724 · no Next version, Edit or Resume editing · 393 and 723 (2026-11-21; approved)',
          'P12G2_Places': 'Notebook with and without a kept draft, Home, More · 393 · entry points left out (2026-11-21; approved)',
          'P12G2_DeskPage': 'The one-line page a hidden job\'s address shows · wording A chosen, B and C not (2026-11-21; approved)',
          'P12G2_PenPreview': 'Version pen · Preview step on an open step · 1366 (2026-11-21; approved)',
          'P12G2_RowControls': 'Creation editor · row controls in two groups, keys to add and move, Tab order · 1366 (2026-11-21; redrawn twice the same day; approved)',
          'P12G2_StepOrder': 'A step\'s Add step · last line or under the fields · 1366 (2026-11-21; Mark picked A, the last line)'}
LEFTOVERS = {'R35C_393PhoneLog.dc.html': 'no Next version in the band below 724', 'R35C_723PhoneLog.dc.html': 'no Next version in the band below 724', 'P10_Notebook.dc.html': 'no New recipe and no Resume below 724',
             'P11_FirstVersion.dc.html': 'no Edit or Resume editing below 724', 'P11_Steps.dc.html': 'row controls regrouped, Add step first on the last line', 'P11_Structure.dc.html': 'row controls regrouped, Add ingredient on each row'}
BUILD = (('P12G2_Band', build_band), ('P12G2_Places', build_places), ('P12G2_DeskPage', build_deskpage), ('P12G2_PenPreview', build_pen), ('P12G2_RowControls', build_rows), ('P12G2_StepOrder', build_steporder))

def build_boards(out):
    sizes = {}; css = panel_css() + '[hidden]{display:none !important}'
    for key, fn in BUILD:
        body, w, h = fn()
        main = f'<div style="position:relative;width:{w}px;height:{h}px;background:#ffffff">{body}</div>'
        open(f'{out}/project/{key}.dc.html', 'w').write(printstart.board(TITLES[key], main, w, h, css + (FLAG_CSS if key == 'P12G2_RowControls' else ''))); sizes[key] = (w, h)      # the redraw's own note style rides its own board, so the other boards regenerate byte for byte
    return sizes

def measure_html():
    pb = ''.join(f'<div data-pid="{p["pid"]}" data-natural="{int(p["natural"])}" data-tabs="{p["tabs"]}" class="fp-win g2w-{p["W"]}" style="display:none;position:absolute;left:0;top:0;width:{p["w"]}px;{"" if p["natural"] else "height:%dpx" % p["h"]}">{p["html"]}</div>\n' for p in PANELS)
    return '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}%s[hidden]{display:none !important}</style></head><body>%s</body></html>' % ((panel_css() + FLAG_CSS).replace("/_blob/37ac467ba5558024f5fb5a2e5c22a7bc", os.path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2')), pb)

if __name__ == '__main__':
    out = sys.argv[2]; os.makedirs(out + '/project', exist_ok=True)
    if sys.argv[1] == 'measure':
        build_boards(out); open(out + '/measure.html', 'w').write(measure_html()); print(len(PANELS), 'panels')
    else:
        c = json.load(open(sys.argv[1])); sizes = build_boards(out); B = c['boards']; N = c['notes']; PAGE = (sys.argv[3] if len(sys.argv) > 3 else 'page-27', 'Phase 12 entry points, pen preview and row controls (Gate 2)')
        if not any(p['id'] == PAGE[0] for p in c['pages']): c['pages'].insert(0, {'id': PAGE[0], 'name': PAGE[1]})      # pages newest first
        x = 0
        for key, (w, h) in sizes.items():
            fn = key + '.dc.html'; B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h, 'title': TITLES[key]}      # a board Mark has moved keeps its place
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + w + 240
        for fn, what in LEFTOVERS.items():
            pre = f'Part leftover 2026-11-21 (sketch 016): {what} · '
            if fn in B and not B[fn].get('title', '').startswith('Part leftover'): B[fn]['title'] = pre + B[fn].get('title', fn)
        N['p12g2-title'] = {**dict(x=0, y=-300, maxW=x), **N.get('p12g2-title', {}), **dict(text='Phase 12 Gate 2: entry points left out below 724, Preview step in the version pen, and the creation editor\'s row controls', kind='title1', page=PAGE[0])}
        json.dump(c, open(out + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
