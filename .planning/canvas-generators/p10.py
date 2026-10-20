import json, re, os, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import resolve_media, scope_css, unique_ids
import printstart
import places as PL
import pod40
# Sid, 2026-10-17 (Phase 10 design gate; MAKE-04 to MAKE-09, MAKE-11, TASTE-01, TASTE-02; nothing approved yet): the creation editor's boards.
#   P10_Notebook       the Notebook's New recipe entry, its same-name warning and Resume                            (1366 and 393)
#   P10_Editor         the creation editor: name and its one description, Version name, Before you start, rows with the live Balance, remove a row
#   P10_Picker         the ingredient picker, "Not in the library yet" included
#   P10_Scales         authoring scales (each scale's kind) and problems
#   P10_Style          choosing a style, its balance bands filled in, edited or left blank; the four styles' approved bands
# 2026-10-18 (decide-p10-style-control, answer A): the style is chosen on a menu, the app's own select (D-17 chevron, the log's field chrome), not the four joined cells: one control
#   however many types there are, 44 px tall under the coarse pointer, the chosen type on it. The open list is drawn as a stand-in (.mk-list): the list itself is the browser's own.
#   The Machine group is not redrawn: the P10_Machine board was retired the same day (below), so the decision reaches the machine when it is drawn where batches are churned.
# 2026-10-18: the machine is out of the creation editor (Mark: the equipment matters when churning a batch, not when creating a recipe), so the P10_Machine board is retired; Process, Pasteurise and Hold are out too (decide-p9-pasteurise-fields, editor-only). The log column reads Style, Scales, Problems.
# 2026-10-18: boards P10_Editor and P10_Style are 1366 only (Mark does not create recipes on an iPhone); P10_Notebook, P10_Picker and P10_Scales keep their 393 panels, not redrawn.
# The editor is the recipe page's pen with no parent (Phase 8's split RecipePage, a `creating` mode with no baseline). Every panel is the built app's own shell and markup (p10-capture.json: WebKit, a scratch
# profile holding a stand-in recipe, 1366 and 393, both with a coarse pointer) with the app's own tokens.css, app.css, notebook.css and shell.css, their @media resolved at the panel's width and pointer.
# The Notebook panels reuse places.py's Phase 9 markup (the approved sketch 012 place). The new parts are the markup below and the rules in P10_CSS; every value in P10_CSS reads an existing token.
#   node p10-capture.mjs ; python3 p10.py measure <out dir> (writes <out dir>/measure.html) ; node p10-measure.mjs <out dir>/measure.html (writes p10-measure.json) ; python3 p10.py <canvas.json read from the artifact root> <out dir>
CAP = json.load(open(HERE + '/p10-capture.json'))
MEAS = json.load(open(HERE + '/p10-measure.json')) if os.path.exists(HERE + '/p10-measure.json') else {}
BOX = json.load(open(HERE + '/p10-boxes.json')) if os.path.exists(HERE + '/p10-boxes.json') else {}
esc = lambda s: _html.escape(str(s), quote=True)

# ---------------------------------------------------------------------------------------------------------------------------------
P10_CSS = '''
/* ---- shared: the add controls, the quiet note line, a region of the creation editor ---- */
.mk-add-row{margin:var(--gap-xs) 0 0}
.mk-add{display:inline-flex;align-items:center}
.mk-focus{outline:var(--focus-outline-width) solid var(--sheet-ink);outline-offset:var(--focus-outline-offset)}
.mk-region{padding:var(--gap-m) 0;border-top:var(--app-rule-row) solid var(--app-divider)}
.mk-region .batch-row__head{min-height:var(--sheet-text-control-min);align-items:center}
.mk-region:first-child{border-top:none;padding-top:0}
.mk-body{display:flex;flex-direction:column;gap:var(--gap-s)}
.mk-cue{margin:0}
.mk-core{margin:0;font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);line-height:var(--app-notebook-desc-leading);color:var(--app-text)}
.mk-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:var(--gap-s)}
.mk-field-row{display:flex;align-items:center;column-gap:var(--gap-field-unit)}
.mk-field-row .ink-field{width:var(--sheet-field-w-figure);flex:none}
.mk-field-row .ink-field[type=number]{width:calc(var(--sheet-field-w-figure) * 1.5)}   /* the signed one-decimal field: -12.5 does not fit 56 px (WebKit: 63 px of text in 54) */
.mk-unit{font-family:var(--face-grotesk);font-size:var(--sheet-type-control);color:var(--app-text)}
.mk-card{display:flex;flex-direction:column;gap:var(--gap-s);padding:var(--gap-s) 0;border-top:var(--app-rule-row) solid var(--app-divider)}
.mk-cue + .mk-card{border-top:none;padding-top:0}
.mk-card__head{display:flex;align-items:center;justify-content:space-between;column-gap:var(--gap-m)}
.mk-stops{margin:0;font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text-secondary)}
/* ---- the menu: the app's select (app.css: appearance none, the D-17 chevron) in the log's field chrome (notebook.css .notebook-field .ink-field), the chosen type on it ---- */
.mk-menu-wrap{position:relative}
.notebook-log .mk-menu{display:block;width:100%;padding:var(--app-notebook-gap-tight) var(--gap-select-chevron-room) var(--app-notebook-gap-tight) var(--app-notebook-field-pad-x);border:var(--app-rule-row) solid var(--app-divider);border-radius:var(--app-radius-control);font-size:var(--app-notebook-size-body);line-height:var(--sheet-leading-field);color:var(--app-text)}
/* the open list, drawn: the browser's own list on the device; one row per type, the chosen one filled as every on state in the log is (notebook.css) */
.mk-list{position:absolute;left:0;right:0;top:calc(100% + var(--gap-xs));z-index:3;list-style:none;margin:0;padding:var(--gap-xs) 0;border:var(--app-rule-row) solid var(--app-divider);border-radius:var(--app-radius-control);background:var(--app-background);box-shadow:0 var(--gap-xs) var(--gap-m) var(--app-divider)}
.mk-list li{display:flex;align-items:center;min-height:var(--touch-min);padding:0 var(--app-notebook-field-pad-x);font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);color:var(--app-text)}
.mk-list li[aria-selected=true]{background:var(--app-blue-text);color:var(--app-background)}
/* ---- targets: one row per figure, its label and the two ends of its band ---- */
.mk-band{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:var(--gap-s);min-height:var(--touch-min);border-top:var(--app-rule-row) solid var(--app-divider)}
.mk-band__label{font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);color:var(--app-text)}
.mk-band__label small{font-size:var(--app-size-label);color:var(--app-text-secondary)}
.mk-band__ends{display:flex;align-items:center;column-gap:var(--gap-field-unit)}
.mk-band__ends .ink-field{width:var(--sheet-field-w-figure)}
.mk-band__unit{min-width:var(--gap-m);font-family:var(--face-grotesk);font-size:var(--sheet-type-control);color:var(--app-text)}
/* ---- the picker, open under the Ingredients table on the Sheet ---- */
.pick{margin:var(--gap-s) 0 0;padding:var(--gap-s);border:var(--rule-ink-field) solid var(--sheet-ink)}
.pick__head{display:flex;align-items:center;justify-content:space-between;column-gap:var(--gap-m);min-height:var(--touch-min)}
.pick .ing__filters{margin:0}
.pick .ing__status{margin:var(--gap-s) 0 var(--gap-xs);min-height:0}
.pick__list{list-style:none;margin:0;padding:0;max-height:calc(var(--touch-min) * 6);overflow-y:auto;border-top:var(--app-rule-row) solid var(--app-divider)}
.pick__row{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:'name act' 'sum sum';column-gap:var(--gap-m);align-items:center;width:100%;box-sizing:border-box;min-height:var(--touch-min);margin:0;padding:var(--gap-xs) 0;border:none;border-bottom:var(--app-rule-row) solid var(--app-divider);border-radius:0;background:none;color:var(--app-text);font-family:var(--face-grotesk);text-align:left;cursor:pointer}
.pick__row:hover{border:none;border-bottom:var(--app-rule-row) solid var(--app-divider);padding:var(--gap-xs) 0}
.pick__name{grid-area:name;font-size:var(--app-notebook-size-body);font-weight:700;overflow-wrap:anywhere}
.pick__sum{grid-area:sum;font-size:var(--app-size-meta);font-weight:400;color:var(--app-text-secondary);font-variant-numeric:tabular-nums}
.pick__act{grid-area:act;font-size:var(--app-size-meta);font-weight:400;color:var(--app-text);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--offset-link-underline)}
.pick__row--added{cursor:default}
.pick__row--added .pick__name,.pick__row--added .pick__sum,.pick__row--added .pick__act{color:var(--app-text-secondary);text-decoration:none}
.pick__none{margin:var(--gap-s) 0 0;font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);line-height:var(--app-notebook-desc-leading);color:var(--app-text)}
/* ---- the Notebook's New recipe entry and the kept draft ---- */
.nb__head{display:flex;align-items:center;justify-content:space-between;column-gap:var(--gap-m);flex-wrap:wrap;row-gap:var(--gap-s)}
.nb__head .place__title{margin:0}
.nb__new{display:flex;flex-direction:column;gap:var(--gap-s);max-width:var(--measure-prose);margin:var(--gap-m) 0}
.nb__new .notebook-field{display:flex;flex-direction:column;gap:var(--gap-xs)}
.nb__new-actions{display:flex;gap:var(--gap-s);flex-wrap:wrap}
.nb__draft{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:'rail name act' 'rail meta act';column-gap:var(--gap-m);align-items:center;padding:var(--gap-m) 0;border-top:var(--app-rule-row) solid var(--app-divider)}
.nb__draft .nb__rail{grid-area:rail}
.nb__draft .nb__name{grid-area:name}
.nb__draft .nb__meta{grid-area:meta;flex-direction:row}
.nb__draft-act{grid-area:act}
.nb__drafts{margin:var(--gap-m) 0 0;border-bottom:var(--app-rule-row) solid var(--app-divider)}
.nb__drafts .nb__draft:first-child{border-top:var(--app-rule-row) solid var(--app-divider)}
@media (max-width:759.98px){
.nb__draft{grid-template-columns:auto minmax(0,1fr);grid-template-areas:'rail name' 'rail meta' 'rail act'}
.nb__draft-act{justify-self:start;margin-top:var(--gap-xs)}
}
/* ---- the creation page: the band's recipe fields, the one column the log's place holds ---- */
@media (max-width:759.98px){
.mk-page .notebook-recipe,.mk-page .notebook-ceremony{align-self:stretch}
}
.mk-page .notebook-recipe__form{max-width:var(--measure-prose)}
.mk-page .notebook-log{padding-top:0}
'''
COARSE_P10 = '''
.mk-add{min-height:var(--touch-min)}
.pick__head .text-control{min-height:var(--touch-min)}
.mk-band .ink-field{min-height:var(--touch-min)}
'''

LABH = 78; GAP = 80
CSS_BY_CLS = {}
def css_for(W):
    cls = 'pc%d' % W
    if cls not in CSS_BY_CLS:
        extra = resolve_media(P10_CSS, W, True) + COARSE_P10
        CSS_BY_CLS[cls] = PL.css_for(W, True, cls, extra=extra)
    return CSS_BY_CLS[cls]

def mhei(pid, default=600): return int(MEAS.get(pid, default))

# ---------------------------------------------------------------------------------------------------------------------------------
# the app's own markup, taken from the capture
def cap(state, W, key): return CAP['%s_%d' % (state, W)][key]
def shell_main(W, main, vid): return unique_ids(PL.clean(CAP['chrome_%d' % W]).replace('@@MAIN@@', main), vid)

def textarea(label, text, rows=2): return f'<textarea class="prose-field" rows="{rows}" aria-label="{esc(label)}">{esc(text)}</textarea>'

def band_html(name, desc, vname='Version 1', vid='b', name_error=None):
    """The creation page's header: the recipe's own fields (Rename's form, always open, nothing to save separately) and the version's ceremony without Save."""
    err = f'<span id="{vid}-name-err" class="field-error">{esc(name_error)}</span>' if name_error else ''
    return ('<header class="notebook-band"><div class="notebook-band__grid">'
            '<section class="notebook-recipe" aria-label="Recipe"><div class="notebook-recipe__form">'
            f'<label class="notebook-field"><span class="notebook-caption">Recipe name</span><input type="text" class="ink-field" value="{esc(name)}" aria-label="Recipe name">{err}</label>'
            f'<label class="notebook-field"><span class="notebook-caption">Recipe description</span><textarea class="prose-field" rows="3" aria-label="Recipe description">{esc(desc)}</textarea></label>'
            '</div></section>'
            '<form class="notebook-ceremony" aria-label="New recipe"><span class="notebook-caption">New recipe · draft</span>'
            f'<label class="notebook-field"><span class="notebook-caption">Version name</span><input class="ink-field" required="" aria-label="Version name" type="text" value="{esc(vname)}"><span class="field-requirement" aria-hidden="true">Required</span></label>'
            '<div class="notebook-ceremony__actions"><button type="button" class="notebook-action--outline" tabindex="0">Cancel</button></div></form>'
            '</div></header>')

def headnote_html(title, desc):
    p = f'<p class="headnote__prose">{esc(desc)}</p>' if desc else ''
    return f'<div class="recipe-band"><header class="headnote"><h1>{esc(title)}</h1>{p}</header></div>'

def before_html(notes):
    items = ''.join(f'<li><span class="authored__note-field">{textarea("beforeYouStart note %d" % (i + 1), t)}<button type="button" class="text-control" tabindex="0">remove</button></span></li>' for i, t in enumerate(notes))
    lst = f'<ul class="authored__notes">{items}</ul>' if notes else ''
    return (f'<section class="before-region" aria-label="Before you start"><h2 class="region-name">Before you start</h2>{lst}'
            '<p class="mk-add-row"><button type="button" class="text-control mk-add" tabindex="0">Add note</button></p></section>')

def ingredients_html(state, W, picker='', focus_last=False, blank_last=False):
    h = cap(state, W, 'ingredients')
    if focus_last or blank_last:
        # the row just added: its grams field is empty and holds focus
        idx = h.rindex('<input inputmode="decimal" class="ink-field"')
        end = h.index('>', idx)
        tag = h[idx:end + 1]
        new = re.sub(r' value="[^"]*"', ' value=""', tag)
        if focus_last: new = new.replace('class="ink-field"', 'class="ink-field mk-focus"')
        h = h[:idx] + new + h[end + 1:]
    add = '' if picker else '<p class="mk-add-row"><button type="button" class="text-control mk-add" tabindex="0">Add ingredient</button></p>'
    return h.replace('</section>', add + picker + '</section>', 1) if h.rstrip().endswith('</section>') else h + add + picker

def side_html(state, W):
    s = cap(state, W, 'sheet'); i = s.index('<div class="side-region"'); return pod40.rescale(s[i:s.rindex('</article>')], 40)[0]   # 2026-10-18: the Sweetness rule runs 0 to 40 for every recipe (decide-p10-pod-rule-end, README D30)

def sheet_html(state, W, title, desc, notes, picker='', focus_last=False, blank_last=False, balance=True):
    side = side_html(state, W) if balance else ''
    return ('<article class="recipe-page recipe-page--no-method">' + headnote_html(title, desc) + before_html(notes)
            + ingredients_html(state, W, picker, focus_last, blank_last) + side + '</article>')

# ---- the log column: the authoring regions
def head(title, clear=False):
    cl = f'<div class="batch-row__head-acts"><button type="button" class="text-control" aria-label="Clear {esc(title)}" tabindex="0">Clear</button></div>' if clear else ''
    return f'<div class="batch-row__head"><div class="batch-row__head-lead"><h2 class="region-name">{esc(title)}</h2></div>{cl}</div>'
def region(title, body, clear=False): return f'<section class="batch-row mk-region" aria-label="{esc(title)}">{head(title, clear)}<div class="mk-body">{body}</div></section>'

def segmented(label, options, picked, caption=True, name=None):
    gn = name or 'segment-' + re.sub(r'[^a-z0-9]+', '-', label.lower())   # name: two groups with one label (the scale cards' Kind) must not share a radio group
    cl = ''
    opts = ''.join(f'<label class="segmented__option"><input type="radio" name="{gn}" value="{esc(o)}"{" checked" if o == picked else ""} tabindex="0"><span>{esc(o)}</span></label>' for o in options)
    hd = f'<div class="segmented-field__head"><span class="segmented-field__caption pen-caption">{esc(label)}</span>{cl}</div>' if caption else ''
    return (f'<div class="segmented-field">{hd}<div class="segmented" role="radiogroup" aria-label="{esc(label)}">{opts}</div></div>')

def field(label, value='', required=False, ph=''):
    ph_attr = f' placeholder="{esc(ph)}"' if ph else ''
    req = '<span class="field-requirement" aria-hidden="true">Required</span>' if required else ''
    return f'<label class="notebook-field"><span class="notebook-caption">{esc(label)}</span><input class="ink-field" type="text" value="{esc(value)}" aria-label="{esc(label)}"{ph_attr}>{req}</label>'

STYLES = ['Philadelphia', 'French', 'Gelato', 'Sorbet']
# the approved bands (decision 17; .planning/notes/2026-10-16-style-bands-draft.md): (low, high) or None for blank. Keys are the app's targets keys.
BANDS = {'Philadelphia': {'pod': (14, 18), 'fat': (10, 18), 'msnf': (8, 12), 'solids': (36, 42)},
         'French':       {'pod': (14, 18), 'fat': (10, 14), 'msnf': (8, 11), 'solids': (38, 42)},
         'Gelato':       {'pod': (16, 22), 'fat': (4, 9),   'msnf': (8, 12), 'solids': (32, 42)},
         'Sorbet':       {'pod': (24, 32), 'solids': (26, 36)}}
FIGS = [('pac', 'Freezing', 'PAC', ''), ('pod', 'Sweetness', 'POD', ''), ('fat', 'Fat', None, '%'), ('msnf', 'Milk solids', 'MSNF', '%'), ('sugar', 'Sugar', None, '%'), ('solids', 'Solids', None, '%')]
def num(x): return ('%g' % x)
def band_rows(bands):
    out = ''
    for k, word, term, unit in FIGS:
        lo, hi = bands.get(k, (None, None)) if bands.get(k) else (None, None)
        lab = word + (f' <small>· {term}</small>' if term else '')
        nm = word + (f' · {term}' if term else '')
        out += (f'<div class="mk-band"><span class="mk-band__label">{lab}</span><span class="mk-band__ends">'
                f'<input class="ink-field" inputmode="decimal" type="text" value="{num(lo) if lo is not None else ""}" aria-label="{esc(nm)}, target low">'
                f'<span class="mk-band__unit" aria-hidden="true">–</span>'
                f'<input class="ink-field" inputmode="decimal" type="text" value="{num(hi) if hi is not None else ""}" aria-label="{esc(nm)}, target high">'
                f'<span class="mk-band__unit">{unit}</span></span></div>')
    return out

# 2026-10-18 (decide-p9-serve-temp-field, store-on-version; Phase 9 D-19): each version stores a target serving temperature, a nullable number in degrees C, filled from the chosen style's default and editable.
# Drawn at 1366 only. temp: None = not drawn (the 393 panels are not redrawn); '' = empty; else the text in the field. It is the signed number field the Tasting temperature already is (type number, step any, so the minus sign is on the iPad's keyboard),
# in the arrangement the Process fields had (caption over field and unit; Process itself is out of the editor since 2026-10-18). Nothing here computes or shows a PAC target.
STYLE_TEMP = {'Philadelphia': '-14', 'French': '-14', 'Gelato': '-12.5', 'Sorbet': '-14'}
TEMP_LABEL = 'Serving temperature'      # new wording: on Mark's List (decide-p10-serve-temp-label)
def temp_field(v):
    return (f'<label class="notebook-field"><span class="notebook-caption">{TEMP_LABEL}</span><span class="mk-field-row">'
            f'<input class="ink-field" type="number" step="any" value="{v}" aria-label="{TEMP_LABEL}, degrees Celsius"><span class="mk-unit">°C</span></span></label>')
NO_STYLE = 'No style'     # the menu's first entry, the way the pen's cite menu reads "no batch cited"
def menu(label, options, picked, none_word, open_list=False):
    opts = f'<option value=""{"" if picked else " selected"}>{esc(none_word)}</option>' + ''.join(f'<option value="{esc(o)}"{" selected" if o == picked else ""}>{esc(o)}</option>' for o in options)
    lst = ''
    if open_list:
        lst = '<ul class="mk-list" role="listbox" aria-label="' + esc(label) + '">' + ''.join(f'<li role="option" aria-selected="{"true" if o == picked else "false"}">{esc(o)}</li>' for o in [none_word] + options) + '</ul>'
    return f'<div class="mk-menu-wrap"><select class="ink-field mk-menu" aria-label="{esc(label)}" tabindex="0">{opts}</select>{lst}</div>'
def style_region(picked, bands, temp=None, open_list=False):
    t = temp_field(temp) if temp is not None else ''
    return region('Style', menu('Style', STYLES, picked, NO_STYLE, open_list) + t + '<span class="notebook-caption">Targets</span><div>' + band_rows(bands) + '</div>', clear=picked is not None)

KINDS = ['Right in the middle', 'Low to high']
def stops(lo, hi, kind):
    if not lo or not hi: return ''
    if kind == KINDS[0]: return f'<p class="mk-stops">{esc(lo)} · leaning {esc(lo)} · right · leaning {esc(hi)} · {esc(hi)}</p>'
    return f'<p class="mk-stops">{esc(lo)} to {esc(hi)}</p>'
def scale_card(n, name, lo, hi, kind, required_hints=False):
    nm = field('Name', name, required=required_hints and not name)
    ends = '<div class="mk-pair">' + field('Low end', lo, required=required_hints and not lo) + field('High end', hi, required=required_hints and not hi) + '</div>'
    return (f'<div class="mk-card"><div class="mk-card__head"><span class="notebook-caption">Scale {n}</span><button type="button" class="text-control" tabindex="0">remove</button></div>'
            + nm + ends + segmented('Kind', KINDS, kind, name='segment-kind-%d' % n) + stops(lo, hi, kind) + '</div>')
def scales_region(cards, add=True):
    core = '<p class="pen-caption mk-cue">Every recipe</p><p class="mk-core">Hardness, Scoopability, Smoothness, Sweetness</p>'
    mine = ('<p class="pen-caption mk-cue">This recipe only</p>' + ''.join(cards)) if cards else ''
    a = '<p class="mk-add-row"><button type="button" class="text-control mk-add" tabindex="0">Add scale</button></p>' if add else ''
    return region('Scales', core + mine + a)
CORE_PROBLEMS = 'Coarse, icy · Sandy, gritty · Gummy, elastic · Greasy film'
def problem_row(n, name, hint=False):
    return (f'<div class="mk-card"><div class="mk-card__head"><span class="notebook-caption">Problem {n}</span><button type="button" class="text-control" tabindex="0">remove</button></div>'
            + field('Name', name, required=hint and not name) + '</div>')
def problems_region(rows, add=True):
    core = f'<p class="pen-caption mk-cue">Every recipe</p><p class="mk-core">{CORE_PROBLEMS}</p>'
    mine = ('<p class="pen-caption mk-cue">This recipe only</p>' + ''.join(rows)) if rows else ''
    a = '<p class="mk-add-row"><button type="button" class="text-control mk-add" tabindex="0">Add problem</button></p>' if add else ''
    return region('Problems', core + mine + a)

def log_html(*regions): return '<aside class="notebook-log" aria-label="Setup">' + ''.join(regions) + '</aside>'

def page_html(band, sheet, log):
    return f'<div class="notebook mk-page">{band}<div class="notebook-body"><div class="notebook-body__sheet">{sheet}</div>{log}</div></div>'

# ---- the picker
PICK_COLS = ['key', 'name', 'category', 'composition']
def lib_sorted(): return PL.sorted_lib()
def pick_rows(name='', cat='All', added=()):
    out = []
    for e in lib_sorted():
        if name and name.lower() not in e['name'].lower(): continue
        if cat != 'All' and PL.CAT_WORD[e['category']] != cat: continue
        done = e['key'] in added
        sm = PL.summary(e)
        dis = ' aria-disabled="true"' if done else ''
        out.append(f'<li><button type="button" class="pick__row{" pick__row--added" if done else ""}" tabindex="0"{dis}>'
                   f'<span class="pick__name">{esc(e["name"])}</span><span class="pick__sum">{esc(PL.CAT_WORD[e["category"]])} · {esc(sm)}</span><span class="pick__act">{"Added" if done else "Add"}</span></button></li>')
    return out
def picker_html(name='', cat='All', added=(), none=False):
    rows = [] if none else pick_rows(name, cat, added)
    total = len(lib_sorted()); active = bool(name) or cat != 'All'
    count = f'{len(rows)} of {total} ingredients' if active else f'{total} ingredients'
    clear = '<button type="button" class="notebook-link ing__clear" tabindex="0">Clear filters</button>' if active else ''
    body = ('<p class="pick__none" role="status">Not in the library yet</p>' if none else f'<ul class="pick__list">{"".join(rows)}</ul>')
    if none: count = f'0 of {total} ingredients'
    status = f'<div class="ing__status"><p class="ing__count" role="status" aria-live="polite">{count}</p>{clear}</div>'
    return (f'<div class="pick" role="group" aria-label="Add ingredient"><div class="pick__head"><span class="pen-caption">Add ingredient</span><button type="button" class="text-control" tabindex="0">Cancel</button></div>'
            + PL.filters(name, cat, PL.CATS26) + status + body + '</div>')

# ---------------------------------------------------------------------------------------------------------------------------------
# the Notebook: the approved place (places.py) with New recipe, its entry, the warning and Resume
def new_btn(): return '<button type="button" class="notebook-action" tabindex="0">New recipe</button>'
def nb_head(btn=True): return '<div class="nb__head"><h1 class="place__title">Notebook</h1>' + (new_btn() if btn else '') + '</div>'
def nb_new_form(value='', warn=None, err=None, vid='n'):
    fb = ''
    if err: fb = f'<span id="{vid}-fb" class="field-error">{esc(err)}</span>'
    elif warn: fb = f'<span id="{vid}-fb" class="field-error">{esc(warn)}</span>'
    desc_by = f' aria-describedby="{vid}-fb"' if fb else ''
    return ('<form class="nb__new" aria-label="New recipe">'
            f'<label class="notebook-field"><span class="notebook-caption">Name</span><input class="ink-field" type="text" value="{esc(value)}" autocomplete="off" aria-label="Name"{desc_by}>{fb}</label>'
            '<div class="nb__new-actions"><button type="button" class="notebook-action--outline" tabindex="0">Cancel</button><button type="button" class="notebook-action" tabindex="0">Start</button></div></form>')
def draft_row(name='Vanilla'):
    return ('<li class="nb__draft"><span class="nb__rail" aria-hidden="true"></span>'
            f'<h2 class="nb__name">{esc(name)}</h2><p class="nb__meta"><span>draft</span></p>'
            '<span class="nb__draft-act"><button type="button" class="notebook-action--outline" tabindex="0">Resume</button></span></li>')
def nb_main(rows, btn=True, form='', drafts=()):
    n = len(rows); count = '1 recipe' if n == 1 else '%d recipes' % n
    dr = '<ul class="nb__drafts" style="list-style:none;padding:0">' + ''.join(draft_row(d) for d in drafts) + '</ul>' if drafts else ''
    return ('<div class="list-page place nb" data-m="page">' + nb_head(btn) + form + dr + f'<p class="nb__count" data-m="count">{count}</p><ul class="nb__list" data-m="list">'
            + ''.join(PL.nb_row(h, r, nm) for h, r, v, nm in rows) + '</ul></div>')
def nb_panel(W, vid, **kw): return unique_ids(PL.clean(PL.CAP['chrome_notebook_%d' % W]).replace('@@MAIN@@', nb_main(PL.ORDER, **kw)), vid)

# ---------------------------------------------------------------------------------------------------------------------------------
# boards
def panel(pid, W, html, x, y, h, cap_text, sub='', shellh=None, y0=0, w=None, x0=0):
    cls = 'pc%d' % W; css_for(W); w = w or W
    ex = '.shell{height:%dpx;overflow:hidden}\n' % shellh if shellh else ''
    css = scope_css(ex, '.' + pid) if ex else ''
    lab = f'<div style="position:absolute;left:{x}px;top:{y}px;width:{max(w, 360)}px;"><p class="p4-lab">{cap_text}<small>{sub}</small></p></div>'
    win = f'<div class="p4-win {cls} {pid}" style="position:absolute;left:{x}px;top:{y + LABH}px;width:{w}px;height:{h}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div>'
    return lab + win, css

PANELS = {}      # pid -> (W, html); filled by the board builders, read by measure
def reg(pid, W, html): PANELS[pid] = (W, html); return pid

def flow(rows):
    """rows: list of rows; a row is a list of dicts(pid, W, html, cap, sub, h=None|int, shellh=None). Returns parts and the board's size."""
    parts = []; y = 0; bw = 0
    for row in rows:
        x = 0; rh = 0
        for p in row:
            W = p['W']; p['html'] = printstart.drop_hidden(p['html']); reg(p['pid'], W, p['html'])
            h = p.get('h') or mhei(p['pid'], 700)
            if p.get('max'): h = min(h, p['max'])
            if p.get('shellh'): h = p['shellh']
            if p.get('boxbal'): b = BOX.get(p['pid']) or {'balY': 0, 'balH': 400}; p['y0'] = b['balY'] - 8; h = b['balH'] + 40
            if p.get('h_fixed'): h = p['h_fixed']
            if p.get('trim'): h -= p['trim']
            pw = p.get('w') or W
            parts.append(panel(p['pid'], W, p['html'], x, y, h, p['cap'], p.get('sub', ''), shellh=p.get('shellh'), y0=p.get('y0', 0), w=pw, x0=p.get('x0', 0)))
            x += pw + GAP; rh = max(rh, h)
        bw = max(bw, x - GAP); y += rh + LABH + GAP
    return parts, bw, y - GAP

def board(key, title, bw, bh, parts, out):
    body = ''.join(p[0] for p in parts); css = PL.LABEL + ''.join(CSS_BY_CLS.values()) + ''.join(p[1] for p in parts)
    open(out + '/project/' + key + '.dc.html', 'w').write(printstart.board(title, f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>', bw, bh, css, paper=True))

STAMP = ' (drawn 2026-10-17; for approval)'
STAMP2 = ' (redrawn 2026-10-18; for approval)'
SAMPLE_NOTES = ['Chill the mix overnight before churning.', 'Keep the cream cold until it goes in.']
SAMPLE_DESC = 'Plain and cold.'

def build_boards(out):
    sizes = {}
    # ======== P10_Notebook
    P = lambda W, vid, **kw: nb_panel(W, vid, **kw)
    r1 = [dict(pid='nA1', W=1366, html=P(1366, 'nA1'), cap='Notebook at 1366 · New recipe', sub='the filled action sits at the end of the title row; the list is sketch 012\'s, unchanged', max=600),
          dict(pid='nA2', W=393, html=P(393, 'nA2'), cap='Notebook at 393 · New recipe', sub='the title and the action share one row', shellh=852)]
    r2 = [dict(pid='nB1', W=1366, html=P(1366, 'nB1', btn=False, form=nb_new_form(vid='nB1')), cap='New recipe open · 1366', sub='Name only; Cancel first, then Start; the action goes while the entry is open', max=640),
          dict(pid='nB2', W=393, html=P(393, 'nB2', btn=False, form=nb_new_form(vid='nB2')), cap='New recipe open · 393', sub='', shellh=852)]
    r3 = [dict(pid='nC1', W=1366, html=P(1366, 'nC1', btn=False, form=nb_new_form('Pineapple', warn='Another recipe already has this name. You can still use it.', vid='nC1')), cap='Same name · 1366', sub='a recipe named Pineapple is in the Notebook; the line warns and Start still works', max=640),
          dict(pid='nC2', W=393, html=P(393, 'nC2', btn=False, form=nb_new_form('Pineapple', warn='Another recipe already has this name. You can still use it.', vid='nC2')), cap='Same name · 393', sub='', shellh=852)]
    r4 = [dict(pid='nD1', W=1366, html=P(1366, 'nD1', btn=False, form=nb_new_form('', err='Enter a recipe name.', vid='nD1')), cap='Start pressed with no name · 1366', sub='the app\'s own sentence, as Rename says it', max=640),
          dict(pid='nD2', W=393, html=P(393, 'nD2', btn=False, drafts=['Vanilla']), cap='A kept draft · 393', sub='Resume replaces New recipe; the count above the list stays the recipes', shellh=852)]
    r5 = [dict(pid='nE1', W=1366, html=P(1366, 'nE1', btn=False, drafts=['Vanilla']), cap='A kept draft · 1366 · Resume', sub='one creation at a time: the draft row stands first, above the count; it is not counted as a recipe', max=640),
          dict(pid='nE2', W=1366, html=P(1366, 'nE2', btn=True, drafts=['Vanilla', 'Brown butter']), cap='Option B · 1366 · several drafts', sub='for decide-p10-one-draft only: a row per draft, New recipe stays', max=700)]
    parts, bw, bh = flow([r1, r2, r3, r4, r5]); sizes['P10_Notebook'] = (bw, bh)
    board('P10_Notebook', 'Notebook · New recipe, its same-name warning and Resume, at 1366 and 393' + STAMP, bw, bh, parts, out)

    # ======== P10_Editor
    def editor(W, vid, state, name, desc, notes, **kw):
        sh = sheet_html(state, W, name, desc, notes, balance=(state != 'empty'), **kw)
        return shell_main(W, page_html(band_html(name, desc, vid=vid), sh, log_html(style_region('Philadelphia', BANDS['Philadelphia'], STYLE_TEMP['Philadelphia'] if W == 1366 else None) if state != 'empty' else style_region(None, {}, '' if W == 1366 else None), scales_region([scale_card(1, 'Creaminess', 'thin', 'rich', KINDS[0])] if state != 'empty' else [], add=True), problems_region([problem_row(1, 'Bitter')] if state != 'empty' else []))), vid)
    r1 = [dict(pid='eA1', W=1366, html=editor(1366, 'eA1', 'empty', 'Vanilla', '', []), cap='The editor at 1366 · just arrived from New recipe (a name, nothing else)', sub='no Instructions section yet; no Balance until a row exists; every region of the log column is empty and reads as it is')]
    r2 = [dict(pid='eB1', W=1366, html=editor(1366, 'eB1', 'phil', 'Vanilla', SAMPLE_DESC, SAMPLE_NOTES), cap='The editor at 1366 · worked on', sub='description once, five rows with grams, the live Balance, a style, one scale, one problem')]

    # ---- helpers for the cropped boards
    def sheet_only(W, vid, state, name=None, desc=SAMPLE_DESC, notes=SAMPLE_NOTES, **kw):
        sh = sheet_html(state, W, 'Vanilla', desc, notes, **kw)
        asd = '<aside class="notebook-log"></aside>' if W >= 1366 else ''
        return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet">{sh}</div>{asd}</div></div>', vid)
    def log_only(W, vid, *regions):
        return unique_ids(f'<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet"></div>{log_html(*regions)}</div></div>', vid)
    LOGX, LOGW = 976, 366           # the log column at 1366: 350 wide at 984, a little air each side

    # ======== P10_Editor, third row: remove a row
    sc = lambda W, pid, state, **kw: dict(pid=pid, W=W, html=sheet_only(W, pid, state, **kw), w=1000 if W == 1366 else 393)
    r3 = [dict(sc(1366, 'eC1', 'phil'), cap='Remove · before · 1366', sub='five rows; the link beside Skim milk powder is "remove"'),
          dict(sc(1366, 'eC2', 'less'), cap='Remove · after · 1366', sub='the row is deleted outright; every figure follows, and the Balance says where Milk solids now stands against its band')]
    parts, bw, bh = flow([r1, r2, r3]); sizes['P10_Editor'] = (bw, bh)
    board('P10_Editor', 'Creation editor · the recipe page with no parent and no Save, at 1366' + STAMP2, bw, bh, parts, out)

    # ======== P10_Picker
    added2 = ('wholeMilk', 'heavyCream')
    r1 = [dict(sc(1366, 'kA1', 'two', picker=picker_html(added=added2)), h_fixed=1200, cap='Add ingredient · open · 1366', sub='opens under the table and pushes what follows; the same Name and Category fields as the Ingredients place, the list scrolls inside the box (six rows high); an ingredient already in the recipe reads Added'),
          dict(sc(1366, 'kA2', 'two', picker=picker_html(name='milk', added=added2)), h_fixed=1200, cap='Name typed: milk · 1366', sub='the same match as the place: the name contains the letters, any case; 5 of 26')]
    r2 = [dict(sc(1366, 'kB1', 'two', picker=picker_html(name='tonka', none=True)), h_fixed=1000, cap='Not in the library yet · 1366', sub='nothing is added and nothing can be typed in as a row; Clear filters is the way back'),
          dict(sc(1366, 'kB2', 'three', focus_last=True), h_fixed=900, cap='After choosing Sucrose · 1366', sub='the picker closes, the row lands last at 0 g with its grams field empty and focused, and the Balance has moved')]
    r3 = [dict(sc(393, 'kC1', 'two', picker=picker_html(added=added2)), cap='Open · 393', sub=''),
          dict(sc(393, 'kC2', 'two', picker=picker_html(name='milk', added=added2)), cap='Name typed: milk · 393', sub=''),
          dict(sc(393, 'kC3', 'two', picker=picker_html(name='tonka', none=True)), cap='Not in the library yet · 393', sub=''),
          dict(sc(393, 'kC4', 'three', focus_last=True), cap='After choosing · 393', sub='')]
    parts, bw, bh = flow([r1, r2, r3]); sizes['P10_Picker'] = (bw, bh)
    board('P10_Picker', 'Ingredient picker · open under the table, "Not in the library yet", and the row it adds, at 1366 and 393' + STAMP, bw, bh, parts, out)

    # ======== P10_Scales
    LG = lambda W, pid, *regs: dict(trim=40 if W == 1366 else 0, pid=pid, W=W, html=log_only(W, pid, *regs), w=366 if W == 1366 else 393, x0=LOGX if W == 1366 else 0)
    g1 = scale_card(1, 'Creaminess', 'thin', 'rich', KINDS[0]); p1 = scale_card(2, 'Cinnamon', 'faint', 'strong', KINDS[1])
    blank = scale_card(1, '', '', '', None, required_hints=True)
    r1 = [dict(LG(1366, 'sA1', scales_region([]), problems_region([])), cap='Nothing defined · 1366', sub='the four core scales and four core problems are named so the maker sees what every recipe already has; "This recipe only" shows only once something is added'),
          dict(LG(1366, 'sB1', scales_region([g1]), problems_region([problem_row(1, 'Bitter')])), cap='One scale, one problem · 1366', sub='kind: Right in the middle; the stops it will draw are written under it'),
          dict(LG(1366, 'sC1', scales_region([g1, p1], add=False), problems_region([problem_row(1, 'Bitter'), problem_row(2, 'Salty')], add=False)), cap='Two and two (the most) · 1366', sub='the add controls go at the limit; the second scale is Low to high'),
          dict(LG(1366, 'sD1', scales_region([blank]), problems_region([problem_row(1, '', hint=True)])), cap='Just added · 1366', sub='nothing is pre-picked, so Required stands under each empty field and Kind has no cell filled')]
    r2 = [dict(LG(393, 'sA2', scales_region([]), problems_region([])), cap='Nothing defined · 393', sub=''),
          dict(LG(393, 'sB2', scales_region([g1]), problems_region([problem_row(1, 'Bitter')])), cap='One scale, one problem · 393', sub=''),
          dict(LG(393, 'sC2', scales_region([g1, p1], add=False), problems_region([problem_row(1, 'Bitter'), problem_row(2, 'Salty')], add=False)), cap='Two and two · 393', sub=''),
          dict(LG(393, 'sD2', scales_region([blank]), problems_region([problem_row(1, '', hint=True)])), cap='Just added · 393', sub='')]
    parts, bw, bh = flow([r1, r2]); sizes['P10_Scales'] = (bw, bh)
    board('P10_Scales', 'Authoring scales and problems · each scale\'s kind, 0 to 2 of each, at 1366 and 393' + STAMP, bw, bh, parts, out)

    # ======== P10_Style
    ST = lambda W, pid, picked, bands, temp='default', open_list=False: dict(trim=40 if W == 1366 else 0, pid=pid, W=W, html=log_only(W, pid, style_region(picked, bands, (STYLE_TEMP.get(picked, '') if temp == 'default' else temp) if W == 1366 else None, open_list)), w=366 if W == 1366 else 393, x0=LOGX if W == 1366 else 0)
    BAL = lambda pid, state: dict(pid=pid, W=1366, html=sheet_only(1366, pid, state), w=345, x0=632, boxbal=True)
    edited = dict(BANDS['Philadelphia'], fat=(10, 16))
    r1 = [dict(ST(1366, 'tA1', None, {}), cap='No style · 1366', sub='how a new recipe starts: the menu reads No style, everything blank, the temperature empty'), dict(BAL('tA2', 'rows'), cap='Its Balance', sub='no target set on any figure'),
          dict(ST(1366, 'tO1', 'Philadelphia', BANDS['Philadelphia'], open_list=True), cap='The menu open · 1366', sub='one control however many types there are (decide-p10-style-control, A): a row per type, the chosen one filled, a type added later is one more row. On the device the list is the browser\'s own; this drawing stands in for it'),
          dict(ST(1366, 'tB1', 'Philadelphia', BANDS['Philadelphia']), cap='Philadelphia picked · 1366', sub='the chosen type reads on the menu; bands and temperature fill in; PAC and Sugar stay blank (decision 17)'), dict(BAL('tB2', 'phil'), cap='Its Balance', sub='four figures read against a band; PAC and Sugar say no target set'),
          dict(ST(1366, 'tC1', 'Philadelphia', edited), cap='Fat edited to 10 to 16 · 1366', sub='the style stays picked; the temperature is untouched'), dict(BAL('tC2', 'edit'), cap='Its Balance', sub='Fat reads against 10–16')]
    r2 = [dict(ST(1366, 'tD%d' % i, st, BANDS[st]), cap=f'{st} · 1366', sub='the approved bands and the style\'s own temperature') for i, st in enumerate(STYLES, 1)]
    r2b = [dict(BAL('tD5', 'sorb'), cap='Sorbet: Sweetness 24 to 32 on the 0 to 40 rule', sub='the rule runs 0 to 40 for every recipe, so both edges of the band show (decide-p10-pod-rule-end)'),
           dict(ST(1366, 'tF1', 'Philadelphia', BANDS['Philadelphia'], temp='-16'), cap='Serving temperature edited to -16 · 1366', sub='the style and the bands stay as they were'),
           dict(ST(1366, 'tF2', 'Philadelphia', BANDS['Philadelphia'], temp=''), cap='Serving temperature emptied · 1366', sub='the field may stand empty; the style and the bands stay'),
           dict(ST(1366, 'tF3', 'Gelato', BANDS['Gelato']), cap='Picking another style fills it again · Gelato -12.5', sub='picking a style replaces the temperature, as it replaces the bands'),
           dict(ST(1366, 'tG1', None, BANDS['Philadelphia'], temp=''), cap='After Clear on Philadelphia · 1366', sub='the menu reads No style again; the bands stay as they stand, and the serving temperature is emptied (decide-p10-style-change, decide-p10-serve-temp-clear)')]
    parts, bw, bh = flow([r1, r2, r2b]); sizes['P10_Style'] = (bw, bh)
    board('P10_Style', 'Choosing a style · on a menu, the four styles\' approved balance bands, edited or left blank, at 1366' + STAMP2, bw, bh, parts, out)
    return sizes

def measure_html():
    css = ''; body = ''
    for pid, (W, html) in PANELS.items():
        css_for(W)
        body += f'<div class="p4-win pc{W} {pid}" data-pid="{pid}" style="width:{W}px;position:relative;margin:0 0 40px 0"><div class="inner" style="width:{W}px">{html}</div></div>'
    return f'<!doctype html><meta charset="utf-8"><style>body{{margin:0}}{PL.LABEL}{"".join(CSS_BY_CLS.values())}</style>{body}'

if __name__ == '__main__':
    if sys.argv[1] == 'measure':
        os.makedirs(sys.argv[2], exist_ok=True); os.makedirs(sys.argv[2] + '/project', exist_ok=True); build_boards(sys.argv[2])
        open(sys.argv[2] + '/measure.html', 'w').write(measure_html()); print(len(PANELS), 'panels')
    else:
        # python3 p10.py <canvas.json read from the artifact root, right before publishing> <out dir>: writes the boards and the index with the Phase 10 page added (boards already there keep their frame)
        c = json.load(open(sys.argv[1])); os.makedirs(sys.argv[2] + '/project', exist_ok=True); sizes = build_boards(sys.argv[2])
        B = c['boards']; N = c['notes']; PAGE = ('page-20', 'Phase 10 creation editor')
        assert PAGE[0] not in [p['id'] for p in c['pages']] or any(k.startswith('P10_') for k in B), 'page id taken'
        if not any(p['id'] == PAGE[0] for p in c['pages']):
            i = [p['id'] for p in c['pages']].index('page-19'); c['pages'].insert(i + 1, {'id': PAGE[0], 'name': PAGE[1]})
        titles = {'P10_Notebook': 'Notebook · New recipe, its same-name warning and Resume, at 1366 and 393', 'P10_Editor': 'Creation editor · the recipe page with no parent and no Save, at 1366',
                  'P10_Picker': 'Ingredient picker · open under the table, "Not in the library yet", and the row it adds, at 1366 and 393', 'P10_Scales': "Authoring scales and problems · each scale's kind, 0 to 2 of each, at 1366 and 393",
                  'P10_Style': "Choosing a style · on a menu, the four styles' approved balance bands, edited or left blank, at 1366"}
        REDRAWN = ('P10_Editor', 'P10_Style'); x = 0
        for gone in ('P10_Machine.dc.html',):      # retired 2026-10-18: drop the board from a canvas.json that still has it
            B.pop(gone, None)
            if gone in c['order']: c['order'].remove(gone)
        for key in ['P10_Editor', 'P10_Notebook', 'P10_Picker', 'P10_Style', 'P10_Scales']:
            w, h = sizes[key]; fn = key + '.dc.html'
            B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h, 'title': titles[key] + (STAMP2 if key in REDRAWN else STAMP)}
            if fn not in c['order']: c['order'].append(fn)
            x = B[fn]['x'] + w + 240
        N['p10-title'] = dict(N.get('p10-title', {}), x=0, y=-300, text='Phase 10 creation editor: Notebook entry, editor, picker, style, scales and problems', kind='title1', maxW=x, page=PAGE[0])
        json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False); print(sizes)
