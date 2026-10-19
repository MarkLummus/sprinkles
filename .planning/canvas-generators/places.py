import json, re, os, sys, html as _html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from cssscope import TOK, APPC, NBC, SHELLC, resolve_media, scope_css, unique_ids
import printstart
# Sid, 2026-10-17 (Phase 9 design gate; PLACE-01, PLACE-02; nothing approved yet): the two place boards, the Notebook place (the recipes) and the Ingredients place (the library, read-only).
# Sid, 2026-10-19 (Mark's answers of 2026-10-19 on the built place): P9_Ingredients redrawn. (1) decide-p9-393-source-own-line = redraw: below 760 the source sits on its own line under the basis;
#   (2) decide-p9-lactose-line-non-dairy = any-milk-solids: the lactose line shows for any entry holding milk solids (new crop: Milk Chocolate, flavor, 16% milk solids, from the seed dataset the store merges under the 26);
#   (3) decide-p9-facts-line-shape = value-first: "Density 0.994 g/ml · Ultra-pasteurised · Granulated, loose · Hydrates at 82 °C", no labels, the hydration temperature as the stored number.
#   The build (shell.css) now carries the 2026-10-17 rules under `.place`; the redraw rules below use the same selectors so they win as the later declaration, and are what the quick task changes in shell.css.
#   Notebook place    P9_Notebook          several recipes (the seeded store's eight), one recipe, none; 1366 and 393
#   Ingredients place P9_Ingredients       the 26 entries, one entry open (figures, basis, source), search and category, no match; 1366 and 393
#                     P9_IngredientsMany   the same list at the size of the reviewed dataset (103 names, a stand-in for a few hundred), 1366 and 393
#                     P9_CategoryOptions   the category filter as a select (drawn on the two boards above) or as chips, for Mark's choice
# Every panel is the built app's own shell (places-capture.json: WebKit, the dist of 2026-10-17, 1366 and 393, both with a coarse pointer, the Notebook or Ingredients place current, main emptied to @@MAIN@@) with the app's own tokens.css, app.css,
# notebook.css and shell.css, their @media resolved at the panel's width and pointer, each panel's rules scoped to the panel (a canvas artboard does not get a viewport of its own width). The new parts are the markup below and the rules in NEW_CSS;
# every value in NEW_CSS reads an existing token. Recipes, versions, batches and their order are the seeded store's (the capture's data and Home's own order); the library entries are app/src/data/library.js as stored (places-data.json).
#   node places-capture.mjs ; node places-data.mjs ; python3 places.py <canvas.json read from the artifact root> <out dir> ; node places-measure.mjs <out dir>/project  (writes places-measure.json; run places.py again)
CAP = json.load(open(HERE + '/places-capture.json')); DATA = json.load(open(HERE + '/places-data.json'))
MEAS = json.load(open(HERE + '/places-measure.json')) if os.path.exists(HERE + '/places-measure.json') else {}
esc = lambda s: _html.escape(str(s), quote=True)

FIX = '.shell{min-height:0;position:relative}.shell__tabs{position:absolute !important;inset-inline:0;inset-block-end:0}.shell__main{min-width:0}\n'
LABEL = '''.p4-lab{font-family:-apple-system,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;color:var(--app-text);font-size:15px;line-height:21px;font-weight:600;margin:0}
.p4-lab small{display:block;font-weight:400;font-size:13px;line-height:18px;color:var(--app-text-secondary)}
.p4-win{box-sizing:border-box;position:relative;background:var(--app-background);outline:1px solid var(--app-divider);overflow:hidden}
'''

# ---------------------------------------------------------------------------------------------------------------------------------
# The new rules. Plain CSS with top-level @media only (resolved per panel). Every colour, size, spacing and rule weight is a token.
# Cuts: 1100 and 760, Home's own two (DESIGN.md "The Sheet page and Home"); the figures table reads as a list below 760 as the ingredient table does below 724 (decision 15).
NEW_CSS = '''
/* Notebook place (PLACE-02): the title, the count, one row per recipe. A row: rail, name (the link), description, counts in words. No action on a row, no lead block. */
.nb__count{margin:0 0 var(--gap-m);font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text-secondary);font-variant-numeric:tabular-nums}
.nb__list{list-style:none;margin:0;padding:0}
.nb__row{display:grid;grid-template-columns:auto minmax(0,1fr) var(--app-col-tally);grid-template-areas:'rail name meta' 'rail desc desc';column-gap:var(--gap-m);padding:var(--gap-m) 0;border-top:var(--app-rule-row) solid var(--app-divider)}
.nb__rail{grid-area:rail;align-self:stretch;width:var(--app-size-rail-w);min-height:var(--app-size-rail-h);border-radius:var(--app-radius-rail);background:var(--app-notebook)}
.nb__name{grid-area:name;margin:0;font-family:var(--face-grotesk);font-size:var(--app-size-recipe-name);font-weight:700;letter-spacing:var(--app-tracking-name);overflow-wrap:anywhere}
.nb__name a{color:inherit;border-radius:var(--app-radius-control)}
.nb__desc{grid-area:desc;margin:var(--gap-xs) 0 0;max-width:var(--measure-prose);font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);line-height:var(--app-notebook-desc-leading);color:var(--app-text-secondary);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.nb__meta{grid-area:meta;align-self:center;margin:0;display:flex;flex-direction:column;gap:var(--gap-hair);font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text-secondary);font-variant-numeric:tabular-nums}
.nb__dot{display:none}
@media (max-width:759.98px){
.nb__row{grid-template-columns:auto minmax(0,1fr);grid-template-areas:'rail name' 'rail desc' 'rail meta'}
.nb__meta{flex-direction:row;flex-wrap:wrap;column-gap:var(--gap-xs);margin-top:var(--gap-xs)}
.nb__dot{display:inline}
}

/* Ingredients place (PLACE-01): title, the two filters, the count line, one row per library entry; an open entry shows its figures with basis and source. Read-only: no control on the page writes anything. */
.ing__filters{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--gap-s);margin:var(--gap-m) 0 0}
.ing__field{flex:1 1 var(--measure-prose);min-width:0;max-width:var(--measure-prose)}
.ing__field--category{flex:0 0 auto;max-width:none}
.ing__filters select.ink-field{background-color:var(--app-background);background-image:linear-gradient(45deg,transparent 50%,var(--app-text) 50%),linear-gradient(135deg,var(--app-text) 50%,transparent 50%);background-position:calc(100% - var(--sheet-inset-select-chevron-x)) calc(50% - var(--sheet-inset-select-chevron-y)),calc(100% - var(--sheet-inset-select-chevron-x) + var(--sheet-size-select-chevron)) calc(50% - var(--sheet-inset-select-chevron-y));background-size:var(--sheet-size-select-chevron) var(--sheet-size-select-chevron),var(--sheet-size-select-chevron) var(--sheet-size-select-chevron);background-repeat:no-repeat;padding-right:var(--gap-select-chevron-room);min-width:var(--app-col-standing)}
.ing__status{display:flex;align-items:center;justify-content:space-between;column-gap:var(--gap-m);margin:var(--gap-m) 0 var(--gap-s)}
.ing__count{margin:0;font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text-secondary);font-variant-numeric:tabular-nums}
.ing__clear{border-radius:var(--app-radius-control)}
.ing__list{list-style:none;margin:0;padding:0}
.ing__row{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:var(--gap-m);padding:var(--gap-xs) 0;border-top:var(--app-rule-row) solid var(--app-divider)}
.ing__rail{grid-row:1 / span 2;align-self:stretch;width:var(--app-size-rail-w);min-height:var(--touch-min);margin:var(--gap-xs) 0;border-radius:var(--app-radius-rail);background:var(--app-ingredients)}
.ing__head{grid-column:2;display:grid;grid-template-columns:minmax(0,1fr) var(--app-col-standing) minmax(0,1fr) auto;column-gap:var(--gap-m);align-items:center;width:100%;min-height:var(--touch-min);box-sizing:border-box;margin:0;padding:var(--gap-xs) 0;border:none;border-radius:var(--app-radius-control);background:none;color:var(--app-text);font-family:var(--face-grotesk);text-align:left;cursor:pointer}
.ing__head:hover{border:none;padding:var(--gap-xs) 0}
.ing__name{font-size:var(--app-notebook-identity-size);font-weight:700;letter-spacing:var(--app-tracking-name);overflow-wrap:anywhere}
.ing__meta{display:contents;font-size:var(--app-size-meta);color:var(--app-text-secondary)}
.ing__cat,.ing__sum{font-size:var(--app-size-meta);font-weight:400;color:var(--app-text-secondary);font-variant-numeric:tabular-nums}
.ing__control{font-size:var(--app-size-meta);font-weight:400;color:var(--app-text);text-decoration:underline;text-decoration-thickness:var(--rule-ink-field);text-underline-offset:var(--offset-link-underline)}
.ing__detail{grid-column:2;padding:var(--gap-xs) 0 var(--gap-s)}
.ing__figures{width:100%;max-width:calc(var(--measure-prose) + var(--app-col-tally));border-collapse:collapse;font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);font-variant-numeric:tabular-nums}
.ing__figures th,.ing__figures td{padding:var(--gap-xs) var(--gap-m) var(--gap-xs) 0;border-top:var(--app-rule-row) solid var(--app-divider);text-align:left;vertical-align:baseline;font-weight:400}
.ing__figures thead th{border-top:none;padding-top:0;font-size:var(--app-size-label);font-weight:600;letter-spacing:var(--app-tracking-label);text-transform:uppercase;color:var(--app-text-secondary)}
.ing__figures tbody th{font-weight:600;white-space:nowrap}
.ing__figures .ing__amount{text-align:right;white-space:nowrap}
.ing__figures .ing__unsaid{color:var(--app-text-secondary)}
.ing__facts,.ing__helper{margin:var(--gap-s) 0 0;max-width:var(--measure-prose);font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text-secondary)}
.ing__note-cap{margin:var(--gap-m) 0 var(--gap-xs)}
.ing__note{margin:0;max-width:var(--measure-prose);font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);line-height:var(--app-notebook-desc-leading);color:var(--app-text)}
.ing__none{margin:var(--gap-m) 0 0;max-width:var(--measure-prose);font-family:var(--face-grotesk);font-size:var(--app-notebook-size-body);line-height:var(--app-notebook-desc-leading);color:var(--app-text)}
@media (max-width:1099.98px){
.ing__head{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:'cat cat' 'name control' 'sum sum';row-gap:var(--gap-hair)}
.ing__cat{grid-area:cat;font-size:var(--app-size-label);font-weight:500;letter-spacing:var(--app-tracking-label);text-transform:uppercase}
.ing__name{grid-area:name}
.ing__sum{grid-area:sum}
.ing__control{grid-area:control}
}
@media (max-width:759.98px){
.ing__field{flex:1 1 100%;max-width:none}
.ing__field--category{flex:1 1 100%}
.ing__figures thead{display:none}
.ing__figures,.ing__figures tbody{display:block;width:100%}
.ing__figures tr{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:'fig amt' 'basis src';column-gap:var(--gap-m);padding:var(--gap-xs) 0;border-top:var(--app-rule-row) solid var(--app-divider)}
.ing__figures th,.ing__figures td{display:block;padding:0;border-top:none}
.ing__figures tbody th{grid-area:fig}
.ing__figures .ing__amount{grid-area:amt}
.ing__figures .ing__basis{grid-area:basis;color:var(--app-text-secondary);font-size:var(--app-size-meta)}
.ing__figures .ing__source{grid-area:src;color:var(--app-text-secondary);font-size:var(--app-size-meta);text-align:right}
/* REDRAW 2026-10-19 (decide-p9-393-source-own-line): the source on its own line under the basis, left-aligned, so a long source never runs into the basis word. Same selectors as the build's shell.css rules, so these win as the later declaration. */
.place .ing__figures tr{grid-template-areas:'fig amt' 'basis basis' 'src src'}
.place .ing__figures .ing__source{text-align:left}
}
/* Category as chips (option B on the category board only): one radio per category, a chip each, wrapping. Picked = the subtle surface, ink edge, weight 600 (the nav's own pick, no colour). */
.ing__field--chips{flex:1 1 100%;max-width:none}
.ing__chips legend{padding:0;margin-bottom:var(--gap-xs)}
.ing__chips{display:flex;flex-wrap:wrap;gap:var(--gap-xs);margin:0;padding:0;border:none}
.ing__chip{display:inline-flex;align-items:center;min-height:var(--touch-min);box-sizing:border-box;padding:0 var(--gap-s);border:var(--app-rule-row) solid var(--app-divider);border-radius:var(--app-radius-control);background:var(--app-background);font-family:var(--face-grotesk);font-size:var(--app-size-meta);color:var(--app-text);cursor:pointer}
.ing__chip input{position:absolute;opacity:0;width:var(--app-size-visually-hidden);height:var(--app-size-visually-hidden)}
.ing__chip--picked{background:var(--app-surface-subtle);border-color:var(--app-text);font-weight:600}
'''
COARSE_CSS = '''
/* NEW at a coarse pointer: the touch floor, as Home's own name links meet it (home.css, pointer: coarse) */
.nb__name a{display:inline-flex;align-items:center;min-height:var(--touch-min)}
.ing__clear{min-height:var(--touch-min)}
.ing__status{min-height:var(--touch-min)}
'''

def css_for(W, coarse, cls, extra=''):
    new = resolve_media(NEW_CSS, W, coarse)
    css = resolve_media(TOK, W, coarse) + resolve_media(APPC, W, coarse) + resolve_media(SHELLC, W, coarse) + resolve_media(NBC, W, coarse)
    css = re.sub(r'(^|\})(\s*):root\s*\{', r'\1\2body{', css)
    if coarse: new += COARSE_CSS
    return scope_css(css + FIX + new + extra, '.' + cls)

def clean(h): return printstart.drop_hidden(h).replace('<p class="shell__brand"><a tabindex="0" href="/" data-discover="true">Sprinkles</a></p>', '<p class="shell__brand">Sprinkles</p>', 1)

# ---------------------------------------------------------------------------------------------------------------------------------
# Notebook place
HOME = CAP['home_1366']
ORDER = [(m[0], m[1], m[2], _html.unescape(m[3])) for m in re.findall(r'<h2 class="home__name"><a[^>]*href="(/notebook/([^/"]+)/([^"]+))"[^>]*>(.*?)</a></h2>', HOME)]   # Home's own order: the build's activeWork()
RECIPES = {r['id']: r for r in CAP['data']['recipes']}
def counts(rid):
    vs = [v['id'] for v in CAP['data']['versions'] if v['recipeId'] == rid]
    return len(vs), sum(1 for b in CAP['data']['batches'] if b['versionId'] in vs)
def v_words(n): return '1 version' if n == 1 else '%d versions' % n
def b_words(n): return 'not yet made' if n == 0 else ('1 batch' if n == 1 else '%d batches' % n)      # Home's own words (RecipeList.jsx batchCountWords)
def nb_row(href, rid, name):
    nv, nb = counts(rid); d = RECIPES[rid]['description']
    desc = '<p class="nb__desc" data-m="desc">%s</p>' % esc(d) if d else ''
    return (f'<li class="nb__row" data-m="row"><span class="nb__rail" aria-hidden="true"></span><h2 class="nb__name"><a href="{href}" tabindex="0" data-m="link">{esc(name)}</a></h2>{desc}'
            f'<p class="nb__meta" data-m="meta"><span>{v_words(nv)}</span><span class="nb__dot" aria-hidden="true">·</span><span>{b_words(nb)}</span></p></li>')
def nb_main(rows):
    n = len(rows)
    if n == 0:
        return '<div class="list-page place nb" data-m="page"><h1 class="place__title">Notebook</h1><p class="place__note" data-m="empty">No recipes yet.</p></div>'
    count = '1 recipe' if n == 1 else '%d recipes' % n
    return (f'<div class="list-page place nb" data-m="page"><h1 class="place__title">Notebook</h1><p class="nb__count" data-m="count">{count}</p>'
            f'<ul class="nb__list" data-m="list">' + ''.join(nb_row(h, r, nm) for h, r, v, nm in rows) + '</ul></div>')
def nb_panel(W, rows): return unique_ids(clean(CAP['chrome_notebook_%d' % W]).replace('@@MAIN@@', nb_main(rows)), 'pn')
OLIVE = [r for r in ORDER if r[1] == 'olive-oil-ice-cream']

# ---------------------------------------------------------------------------------------------------------------------------------
# Ingredients place
CAT_WORD = {'dairy': 'Dairy', 'fat': 'Fat', 'sugar': 'Sugar', 'other': 'Other', 'emulsifier': 'Emulsifier', 'stabilizer': 'Stabilizer', 'fruit': 'Fruit',
            'egg': 'Egg', 'fiber': 'Fiber', 'flavor': 'Flavor', 'polyol': 'Polyol'}
FIG_ORDER = ['fat', 'msnf', 'sugar', 'other', 'emulsifier', 'stabilizer', 'pac', 'pod']
FIG_WORD = {'fat': 'Fat', 'msnf': 'Milk solids · MSNF', 'sugar': 'Sugar', 'other': 'Other solids', 'emulsifier': 'Emulsifier', 'stabilizer': 'Stabilizer', 'pac': 'Freezing · PAC', 'pod': 'Sweetness · POD'}
FIG_SHORT = dict(FIG_WORD, msnf='Milk solids', pac='Freezing', pod='Sweetness')
BASIS_WORD = {'stated': 'stated', 'derived': 'derived', 'estimated': 'estimated', 'inherited': 'unreviewed'}   # the app's own words (IngredientTable dataFlagFor: inherited reads unreviewed)
def trim(x, nd): s = ('%.*f' % (nd, x)).rstrip('0').rstrip('.'); return ('−' + s[1:]) if s.startswith('-') else s
def amount(k, v): return trim(v, 2) if k in ('pac', 'pod') else trim(v * 100, 2) + '%'
def summary(e): return ' · '.join('%s %s' % (FIG_SHORT[k], amount(k, e['composition'][k])) for k in FIG_ORDER if e['composition'].get(k))
def sorted_lib(): return sorted(DATA['library'], key=lambda e: e['name'].lower())

def row_closed(e, vid, summ=None, cat=None, open_=False, detail=''):
    cat = cat or CAT_WORD[e['category']]; summ = summ if summ is not None else summary(e); did = 'ing-d-' + re.sub(r'[^a-z0-9]+', '-', e['key' if 'key' in e else 'id'].lower())
    head = (f'<button type="button" class="ing__head" aria-expanded="{"true" if open_ else "false"}" aria-controls="{did}" tabindex="0" data-m="head"><span class="ing__name" data-m="name">{esc(e["name"])}</span>'
            f'<span class="ing__meta"><span class="ing__cat" data-m="cat">{esc(cat)}</span><span class="ing__sum" data-m="sum">{esc(summ)}</span></span>'
            f'<span class="ing__control" data-m="control">{"Hide" if open_ else "Show"}</span></button>')
    return f'<li class="ing__row" data-m="row"><span class="ing__rail" aria-hidden="true"></span>{head}{detail.replace("@@ID@@", did) if open_ else ""}</li>'

def detail(e):
    c = e['composition']; b = e.get('basis', {}); s = e.get('source', {}) or {}
    rows = ''
    for k in FIG_ORDER:
        if k not in c: continue
        src = s.get(k)
        rows += (f'<tr data-m="figrow"><th scope="row">{esc(FIG_WORD[k])}</th><td class="ing__amount">{amount(k, c[k])}</td><td class="ing__basis">{BASIS_WORD[b.get(k, "inherited")]}</td>'
                 + (f'<td class="ing__source">{esc(src)}</td>' if src else '<td class="ing__source ing__unsaid">not recorded</td>') + '</tr>')
    # value-first (decide-p9-facts-line-shape, 2026-10-19): no labels; each value sentence-cased; the hydration temperature is the stored number, never the source's prose
    cap = lambda t: t[:1].upper() + t[1:]
    facts = []
    if e.get('densityGPerMl'): facts.append('Density %s g/ml' % trim(e['densityGPerMl'], 3))
    if e.get('heatTreatment'): facts.append(cap(e['heatTreatment']))
    if e.get('packedState'): facts.append(cap(e['packedState']))
    if e.get('hydrationC'): facts.append('Hydrates at %s °C' % trim(e['hydrationC'], 2))
    out = ('<div class="ing__detail" id="@@ID@@" data-m="detail"><table class="ing__figures" data-m="figures"><thead><tr><th scope="col">Figure</th><th scope="col" class="ing__amount">Amount</th><th scope="col">Basis</th><th scope="col">Source</th></tr></thead>'
           f'<tbody>{rows}</tbody></table>')
    if facts: out += '<p class="ing__facts" data-m="facts">%s</p>' % esc(' · '.join(facts))
    if e.get('dairy') or c.get('msnf'): out += '<p class="ing__helper" data-m="helper">Lactose counts as 54.5% of milk solids in Freezing and Sweetness.</p>'
    if e.get('note'): out += '<p class="notebook-caption ing__note-cap">Note</p><p class="ing__note" data-m="note">%s</p>' % esc(e['note'])
    return out + '</div>'

def filters(name='', cat='All', cats=()):
    opts = ''.join('<option%s>%s</option>' % (' selected' if c == cat else '', esc(c)) for c in ['All'] + list(cats))
    return ('<form class="ing__filters" role="search" aria-label="Ingredients" data-m="filters">'
            f'<label class="notebook-field ing__field" data-m="namefield"><span class="notebook-caption">Name</span><input class="ink-field" type="text" value="{esc(name)}" autocomplete="off" spellcheck="false" enterkeyhint="search" data-m="name"></label>'
            f'<label class="notebook-field ing__field ing__field--category" data-m="catfield"><span class="notebook-caption">Category</span><select class="ink-field" data-m="category">{opts}</select></label></form>')
def status(shown, total, active):
    clear = '<button type="button" class="notebook-link ing__clear" tabindex="0" data-m="clear">Clear filters</button>' if active else ''
    return f'<div class="ing__status" data-m="status"><p class="ing__count" role="status" aria-live="polite" data-m="count">{shown} of {total} ingredients</p>{clear}</div>' if active else \
           f'<div class="ing__status" data-m="status"><p class="ing__count" role="status" aria-live="polite" data-m="count">{total} ingredients</p></div>'
def ing_main(items, total, name='', cat='All', cats=(), none=False):
    active = bool(name) or cat != 'All'
    lst = ('<p class="ing__none" data-m="none">No ingredient matches. Try another name or category.</p>' if none else '<ul class="ing__list" data-m="list">' + ''.join(items) + '</ul>')
    shown = 0 if none else len(items)
    return f'<div class="list-page place ing" data-m="page"><h1 class="place__title">Ingredients</h1>{filters(name, cat, cats)}{status(shown, total, active)}{lst}</div>'
def ing_panel(W, main, vid): return unique_ids(clean(CAP['chrome_ingredients_%d' % W]).replace('@@MAIN@@', main), vid)

LIB = sorted_lib(); CATS26 = sorted({CAT_WORD[e['category']] for e in LIB})
SEED = {e['key']: e for e in DATA.get('seedDb', [])}   # the reviewed dataset's entries the store merges under the 26 (seed.js); the open-entry crops may draw one
def entry(key): return next((e for e in LIB if e['key'] == key), None) or SEED[key]
def lib_rows(open_key=None, name='', cat='All', vid='x'):
    out = []
    for e in LIB:
        if name and name.lower() not in e['name'].lower(): continue
        if cat != 'All' and CAT_WORD[e['category']] != cat: continue
        o = e['key'] == open_key
        out.append(row_closed(e, vid, open_=o, detail=detail(e) if o else ''))
    return out
# the reviewed dataset as a stand-in for a few hundred: names, categories and the figures a row summarises, as the dataset states them (its fields mapped onto the entry's: fat_pct, msnf_pct, sugars_pct, pac, pod)
def ds_entry(x):
    fig = []
    if x['fat']: fig.append('Fat %s%%' % trim(x['fat'], 1))
    if x['msnf']: fig.append('Milk solids %s%%' % trim(x['msnf'], 1))
    if x['sugar']: fig.append('Sugar %s%%' % trim(x['sugar'], 1))
    if x['category'] != 'dairy':
        if x['pac']: fig.append('Freezing %s' % trim(x['pac'], 2))
        if x['pod']: fig.append('Sweetness %s' % trim(x['pod'], 2))
    return dict(id=x['id'], name=x['name'], category=x['category']), ' · '.join(fig)
DS = sorted((ds_entry(x) for x in DATA['dataset']), key=lambda p: p[0]['name'].lower())
CATSDS = sorted({CAT_WORD[p[0]['category']] for p in DS} | {'Fat'})
def ds_rows(n=None, cat='All'):
    rows = [row_closed(e, 'm', summ=s, cat=CAT_WORD[e['category']]) for e, s in DS if cat == 'All' or CAT_WORD[e['category']] == cat]
    return rows[:n] if n else rows

# the category as chips (option B)
def chips(cats, picked='All'):
    items = ''.join(f'<label class="ing__chip{" ing__chip--picked" if c == picked else ""}"><input type="radio" name="cat" value="{esc(c)}"{" checked" if c == picked else ""} tabindex="0">{esc(c)}</label>' for c in ['All'] + list(cats))
    return f'<fieldset class="ing__chips" data-m="chips"><legend class="notebook-caption">Category</legend>{items}</fieldset>'
def filters_chips(cats):
    return ('<form class="ing__filters" role="search" aria-label="Ingredients" data-m="filters">'
            '<label class="notebook-field ing__field" data-m="namefield"><span class="notebook-caption">Name</span><input class="ink-field" type="text" value="" autocomplete="off" spellcheck="false" enterkeyhint="search" data-m="name"></label>'
            f'<div class="ing__field ing__field--chips">{chips(cats)}</div></form>')

# ---------------------------------------------------------------------------------------------------------------------------------
# boards
CSS_BY_CLS = {}
def panel(vid, W, coarse, html, x, y, w, h, cap, sub='', x0=0, y0=0, shellh=None, scroll=0):
    """A window w x h onto the shell at width W. shellh fixes the shell's own height (a phone screen: the tab row sits at its foot); scroll moves the page under the fixed tab row."""
    cls = 'pc%d' % W
    CSS_BY_CLS[cls] = css_for(W, coarse, cls)
    ex = ''
    if shellh: ex += '.shell{height:%dpx;overflow:hidden}\n' % shellh
    if scroll: ex += '.shell__head{margin-top:-%dpx}\n' % scroll
    css = scope_css(ex, '.' + vid) if ex else ''
    lab = f'<div style="position:absolute;left:{x}px;top:{y}px;width:{max(w, 360)}px;"><p class="p4-lab">{cap}<small>{sub}</small></p></div>'
    win = f'<div class="p4-win {cls} {vid}" style="position:absolute;left:{x}px;top:{y + 78}px;width:{w}px;height:{h}px;"><div style="width:{W}px;transform:translate(-{x0}px,-{y0}px);">{html}</div></div>'
    return lab + win, css

def board(key, title, bw, bh, parts, out):
    body = ''.join(p[0] for p in parts); css = LABEL + ''.join(CSS_BY_CLS.values()) + ''.join(p[1] for p in parts)
    CSS_BY_CLS.clear()
    main = f'<div style="position:relative;width:{bw}px;height:{bh}px;background:#ffffff;">{body}</div>'
    open(out + '/project/' + key + '.dc.html', 'w').write(printstart.board(title, main, bw, bh, css, paper=True))

def m(key, *path, default=None):
    v = MEAS.get(key)
    for p in path:
        if v is None: return default
        v = v.get(p) if isinstance(v, dict) else None
    return default if v is None else v

STAMP = ' (drawn 2026-10-17; for approval)'
STAMP_REDRAW = ' (approved 2026-10-17; redrawn 2026-10-19 for the source line, the lactose line and the facts line; for approval)'
LABH = 78; GAP = 80; S = 852
def build(canvas_in, out):
    os.makedirs(out + '/project', exist_ok=True); c = json.load(open(canvas_in)); B = c['boards']; N = c['notes']; sizes = {}
    # ---- Notebook: row 1 several (1366 whole page | 393 first screen | 393 scrolled to the foot), row 2 one recipe, row 3 none
    h1 = int(m('nb', 'p1366', 'docH', default=1300)); h393 = int(m('nb', 'p393', 'docH', default=1500)); h1r = int(m('nb', 'one1366', 'docH', default=420)); h0 = int(m('nb', 'zero1366', 'docH', default=300))
    one = nb_panel(1366, OLIVE); zero = nb_panel(1366, [])
    parts = [panel('pn1', 1366, True, nb_panel(1366, ORDER), 0, 0, 1366, h1, 'Notebook at 1366 · coarse pointer · several recipes (the seeded store)', 'one row per recipe, in Home\'s order; the name is the link to the recipe\'s latest version; no action on a row'),
             panel('pn2', 393, True, nb_panel(393, ORDER), 1366 + GAP, 0, 393, S, 'Notebook at 393 · first screen', 'the rail stays on the row; the counts move under the description', shellh=S),
             panel('pn3', 393, True, nb_panel(393, ORDER), 1366 + 2 * GAP + 393, 0, 393, S, 'The same page, scrolled to its end', '393 · the tab row stays at the foot', shellh=S, scroll=max(h393 - S, 0))]
    y2 = max(h1, S) + LABH + GAP
    parts += [panel('pn4', 1366, True, one, 0, y2, 1366, h1r, 'One recipe', '1366 · the same row, a count of 1 recipe; the list is as short as it is'),
              panel('pn5', 393, True, nb_panel(393, OLIVE), 1366 + GAP, y2, 393, int(m('nb', 'one393', 'docH', default=520)), 'One recipe · 393', '', shellh=int(m('nb', 'one393', 'docH', default=520)))]
    y3 = y2 + max(h1r, int(m('nb', 'one393', 'docH', default=520))) + LABH + GAP
    parts += [panel('pn6', 1366, True, zero, 0, y3, 1366, h0, 'No recipes', '1366 · one line under the title; nothing else, so Phase 10 adds to the page and the page has no gap to fill'),
              panel('pn7', 393, True, nb_panel(393, []), 1366 + GAP, y3, 393, int(m('nb', 'zero393', 'docH', default=420)), 'No recipes · 393', '', shellh=int(m('nb', 'zero393', 'docH', default=420)))]
    bw = 1366 + 2 * GAP + 2 * 393 - 393 + 393; bh = y3 + max(h0, int(m('nb', 'zero393', 'docH', default=420))) + LABH; bw = 1366 + 2 * (GAP + 393)
    sizes['P9_Notebook'] = (bw, bh)
    board('P9_Notebook', 'Notebook place · the recipes, with several, one and none, at 1366 and 393' + STAMP, bw, bh, parts, out)

    # ---- Ingredients
    OPEN = 'heavyCream'
    # (1) the library, 26 entries: 1366 whole page with every row closed except Heavy cream; 393 first screen; 393 scrolled to the open entry
    hI = int(m('ing', 'p1366', 'docH', default=2600)); hI3 = int(m('ing', 'p393', 'docH', default=3600)); yOpen = int(m('ing', 'p393', 'openY', default=900))
    def lib(W, vid, **kw): return ing_panel(W, ing_main(lib_rows(OPEN, vid=vid, **kw), len(LIB), cats=CATS26, **{k: v for k, v in kw.items() if k in ('name', 'cat')}), vid)
    parts = [panel('pi1', 1366, True, lib(1366, 'pi1'), 0, 0, 1366, hI, 'Ingredients at 1366 · coarse pointer · the library, 26 entries, A to Z', 'one row per entry: name, category, the figures it holds, Show; Heavy cream is open'),
             panel('pi2', 393, True, lib(393, 'pi2'), 1366 + GAP, 0, 393, S, 'Ingredients at 393 · first screen', 'the Name and Category fields stack; a row is name and Show, then category and figures', shellh=S),
             panel('pi3', 393, True, lib(393, 'pi3'), 1366 + 2 * GAP + 393, 0, 393, S, 'The same page, scrolled to the open entry', '393 · the figures read as a list: figure and amount, then basis, then the source on its own line (redrawn 2026-10-19)', shellh=S, scroll=max(yOpen - 120, 0))]
    bw = 1366 + 2 * (GAP + 393); y1 = max(hI, S) + LABH + GAP
    # (2) two more open entries, cropped: one with five figures all estimated and a long source, one a stabilizer with no source
    def crop(key, W, vid):
        e = entry(key); rows = [row_closed(e, vid, open_=True, detail=detail(e))]
        return ing_panel(W, '<div class="list-page place ing"><ul class="ing__list" data-m="list">' + ''.join(rows) + '</ul></div>', vid)
    hc1 = int(m('ing', 'crop1366', 'h', default=520)); hc3 = int(m('ing', 'crop393', 'h', default=620))
    parts += [panel('pi4', 1366, True, crop('cocoaPowder', 1366, 'pi4'), 0, y1, 1366, hc1, 'An open entry with five figures, all estimated', '1366 · Cocoa powder: the source is an export file name, so it wraps in its column', x0=0, y0=int(m('ing', 'crop1366', 'y0', default=0))),
              panel('pi5', 393, True, crop('cocoaPowder', 393, 'pi5'), 1366 + GAP, y1, 393, hc3, 'The same entry · 393', '', x0=0, y0=int(m('ing', 'crop393', 'y0', default=0))),
              panel('pi6', 393, True, crop('locustBeanGum', 393, 'pi6'), 1366 + 2 * GAP + 393, y1, 393, int(m('ing', 'crop393b', 'h', default=330)), 'No source recorded · Locust bean gum', '393 · the figure has no source text, so it says so; the hydration temperature comes from the entry', x0=0, y0=int(m('ing', 'crop393b', 'y0', default=0)))]
    y1b = y1 + max(hc1, hc3, int(m('ing', 'crop393b', 'h', default=330))) + LABH + GAP
    # (2b) REDRAW 2026-10-19: an entry that is not dairy but holds milk solids (Milk Chocolate, flavor, 16%), so the lactose line shows; every basis unreviewed; its Freezing source is long
    hk1 = int(m('ing', 'cropmilk1366', 'h', default=520)); hk3 = int(m('ing', 'cropmilk393', 'h', default=700))
    parts += [panel('pi12', 1366, True, crop('milkChocolate', 1366, 'pi12'), 0, y1b, 1366, hk1, 'Not dairy, but milk solids: the lactose line shows', '1366 · Milk Chocolate (flavor, 16% milk solids, from the reviewed dataset): every basis unreviewed; no facts line, the entry has none of the four', x0=0, y0=int(m('ing', 'cropmilk1366', 'y0', default=0))),
              panel('pi13', 393, True, crop('milkChocolate', 393, 'pi13'), 1366 + GAP, y1b, 393, hk3, 'The same entry · 393', 'the source on its own line under the basis, so the long Freezing source never meets the basis word', x0=0, y0=int(m('ing', 'cropmilk393', 'y0', default=0)))]
    y2 = y1b + max(hk1, hk3) + LABH + GAP
    # (3) search and category: name typed, category chosen, both with no match
    hs = int(m('ing', 'f1366', 'h', default=700)); hs3 = int(m('ing', 'f393', 'h', default=700))
    def filt(W, vid, **kw): return ing_panel(W, ing_main(lib_rows(vid=vid, **kw), len(LIB), cats=CATS26, **kw), vid)
    def none(W, vid): return ing_panel(W, ing_main([], len(LIB), name='milk', cat='Sugar', cats=CATS26, none=True), vid)
    parts += [panel('pi7', 1366, True, filt(1366, 'pi7', name='milk'), 0, y2, 1366, hs, 'Name typed: milk · 1366', 'the count says 5 of 26; Clear filters appears; the list is the same rows', ),
              panel('pi8', 393, True, filt(393, 'pi8', name='milk'), 1366 + GAP, y2, 393, S, 'Name typed: milk · 393', '', shellh=S),
              panel('pi9', 393, True, filt(393, 'pi9', cat='Sugar'), 1366 + 2 * GAP + 393, y2, 393, S, 'Category chosen: Sugar · 393', '4 of 26', shellh=S)]
    y3 = y2 + max(hs, S) + LABH + GAP; hn = int(m('ing', 'none1366', 'h', default=360))
    parts += [panel('pi10', 1366, True, none(1366, 'pi10'), 0, y3, 1366, hn, 'No match · name milk in the category Sugar · 1366', 'one sentence where the rows were; Clear filters is the way back'),
              panel('pi11', 393, True, none(393, 'pi11'), 1366 + GAP, y3, 393, S, 'No match · 393', '', shellh=S)]
    bh = y3 + max(hn, S) + LABH; sizes['P9_Ingredients'] = (bw, bh)
    board('P9_Ingredients', 'Ingredients place · the library, read-only, with search by name and category, at 1366 and 393' + STAMP_REDRAW, bw, bh, parts, out)

    # ---- a few hundred: the reviewed dataset's 103 names as a stand-in
    hm = int(m('many', 'p1366', 'docH', default=2400)); hm3 = int(m('many', 'p393', 'docH', default=2400))
    def many(W, vid, cat='All'):
        rows = ds_rows(cat=cat); return ing_panel(W, ing_main(rows, len(DS), cat=cat, cats=CATSDS), vid)
    parts = [panel('pm1', 1366, True, many(1366, 'pm1'), 0, 0, 1366, int(m('many', 'win1366', 'h', default=1500)), 'The library at 103 entries · 1366', 'stand-in: the 103 names of the reviewed seed dataset, A to Z, the page cut at the first screens; the page is %d px tall' % hm),
             panel('pm2', 393, True, many(393, 'pm2'), 1366 + GAP, 0, 393, S, '103 entries · 393 · first screen', 'the page is %d px tall' % hm3, shellh=S),
             panel('pm3', 393, True, many(393, 'pm3', cat='Fruit'), 1366 + 2 * GAP + 393, 0, 393, S, 'Category chosen: Fruit · 393', '21 of 103; the other ten categories are in the one select', shellh=S)]
    bw = 1366 + 2 * (GAP + 393); bh = max(int(m('many', 'win1366', 'h', default=1500)), S) + LABH; sizes['P9_IngredientsMany'] = (bw, bh)
    board('P9_IngredientsMany', 'Ingredients place · the same list at the reviewed dataset\'s size (103 names, a stand-in for a few hundred)' + STAMP, bw, bh, parts, out)

    # ---- the category filter: select (the boards above) or chips
    def opt(W, vid, kind, cats):
        if kind == 'chips': main = f'<div class="list-page place ing"><h1 class="place__title">Ingredients</h1>{filters_chips(cats)}{status(len(DS), len(DS), False)}</div>'
        else: main = f'<div class="list-page place ing"><h1 class="place__title">Ingredients</h1>{filters(cats=cats)}{status(len(DS), len(DS), False)}</div>'
        return ing_panel(W, main, vid)
    ho = int(m('opt', 'h1366', 'h', default=330)); ho3 = int(m('opt', 'h393', 'h', default=520)); hc = int(m('opt', 'c1366', 'h', default=ho + 60)); hc3 = int(m('opt', 'c393', 'h', default=ho3 + 160))
    parts = [panel('po1', 1366, True, opt(1366, 'po1', 'select', CATSDS), 0, 0, 1366, ho, 'A · a select · 1366', 'one field the width of its longest word; 11 categories sit in the one list'),
             panel('po2', 1366, True, opt(1366, 'po2', 'chips', CATSDS), 0, ho + LABH + GAP, 1366, hc, 'B · chips · 1366', 'every category in view, one tap; wraps to a second line at 11'),
             panel('po3', 393, True, opt(393, 'po3', 'select', CATSDS), 1366 + GAP, 0, 393, ho3, 'A · a select · 393', 'two stacked fields, 11 categories behind one tap', shellh=ho3),
             panel('po4', 393, True, opt(393, 'po4', 'chips', CATSDS), 1366 + 2 * GAP + 393, 0, 393, hc3, 'B · chips · 393', 'the chips take %d px more height than the select, so the first rows start lower' % int(m('opt', 'chipsExtra', default=160)), shellh=hc3)]
    bw = 1366 + 2 * (GAP + 393); bh = max(ho + hc + LABH + GAP, hc3) + LABH; sizes['P9_CategoryOptions'] = (bw, bh)
    board('P9_CategoryOptions', 'Ingredients place · the category filter: a select (drawn on the boards) or chips, with 11 categories' + STAMP, bw, bh, parts, out)

    # ---- the canvas: a new page after Phase 4 screens; boards keep the x and y they have
    PAGE = ('page-19', 'Phase 9 places')
    if not any(p['id'] == PAGE[0] for p in c['pages']):
        i = [p['id'] for p in c['pages']].index('page-16'); c['pages'].insert(i + 1, {'id': PAGE[0], 'name': PAGE[1]})
    row = ['P9_Notebook', 'P9_Ingredients', 'P9_IngredientsMany', 'P9_CategoryOptions']; x = 0; pos = {}
    for key in row:
        w, h = sizes[key]; fn = key + '.dc.html'
        B[fn] = {**dict(x=x, y=0, page=PAGE[0]), **B.get(fn, {}), 'w': w, 'h': h}
        pos[key] = B[fn]['x']; x = B[fn]['x'] + w + 240
        if fn not in c['order']: c['order'].append(fn)
    titles = {k: re.search(r'<title>(.*?)</title>', open(out + '/project/' + k + '.dc.html').read(), re.S).group(1) for k in row}
    for k in row: B[k + '.dc.html']['title'] = titles[k][:120]

    # ---- the notes, with the measured numbers (places-measure.json: WebKit, coarse pointer, the live build with the markup and rules injected; the boards match it to the pixel)
    R = MEAS.get('raw', {})
    def r_(a, b, c, d=None):
        v = R.get(a, {}).get(b, {}).get(c)
        return v
    def note(key, fn, text, w=520):
        bx, by = B[fn + '.dc.html']['x'], B[fn + '.dc.html']['y']
        N[key] = {**dict(x=bx, y=by + sizes[fn][1] + 80), **N.get(key, {}), 'w': w, 'maxH': 1500, 'fill': 'gray', 'page': PAGE[0], 'text': text}
        N[key]['x'] = bx; N[key]['y'] = by + sizes[fn][1] + 80
    nb1, nb3 = R.get('nb', {}).get('p1366', {}), R.get('nb', {}).get('p393', {})
    note('p9-notebook-note', 'P9_Notebook', (
        "Drawn 2026-10-17 on the built shell for your look; nothing approved yet. PLACE-02. Rows are the seeded store's eight recipes in Home's own order; counts are Home's words (1 batch, 3 batches, not yet made) plus versions; the description shows only where the recipe has one (Olive Oil has the only one), cut at two lines. "
        "What differs from Home: no lead block, no standing word, no filled action on a row (a row only opens the recipe at its latest version), the description and the version count are added, and the title is Notebook. It starts nothing: no New recipe, no Resume, no same-name warning, and no gap held for them; the page is the title, the count and the list, so Phase 10 adds above or beside without moving a row. "
        "The rail stays on every row (DESIGN.md: the rail stays on every list), including at 393, where Home drops it by your ruling of 2026-09-22; here a row has no action button to crowd it. Tally sprinkles are not drawn: the counts are in words and the marks add noise to a list whose job is finding.\n\n"
        f"Measured in WebKit with a coarse pointer, on the build with this markup and these rules injected (Chromium not run): rows are {nb1.get('rowH', ['?', '?'])[0]} to {nb1.get('rowH', ['?', '?'])[1]} px at 1366 and {nb3.get('rowH', ['?', '?'])[0]} to {nb3.get('rowH', ['?', '?'])[1]} at 393; the name link is 44 px tall at both; no horizontal overflow at 393, 724, 834, 1024, 1100, 1366 or 1590. Not measured on the iPad or iPhone."))
    ig1, ig3 = R.get('ing', {}).get('p1366', {}), R.get('ing', {}).get('p393', {}); mn1, mn3 = R.get('many', {}).get('p1366', {}), R.get('many', {}).get('p393', {})
    note('p9-ingredients-note', 'P9_Ingredients', (
        "Approved 2026-10-17; redrawn 2026-10-19 after your three answers on the built place, for approval of the redraw only: below 760 the source sits on its own line under the basis (decide-p9-393-source-own-line, redraw), the lactose line shows for any entry with milk solids (decide-p9-lactose-line-non-dairy; the new Milk Chocolate crop), and the facts line is value-first with the hydration temperature as a number (decide-p9-facts-line-shape: Heavy cream reads Density 0.994 g/ml · Ultra-pasteurised; Locust bean gum reads Hydrates at 82 °C). PLACE-01. The 26 entries of app/src/data/library.js as stored, A to Z by name; the rail is the Ingredients green. A row: name, category, the figures the entry holds (only those it holds), and Show; the row is the fold, so it opens in place and the page has no new route. "
        "An open entry reads as a table: Figure, Amount, Basis (stated, derived, estimated, unreviewed: the app's own words), Source (the entry's own text for that figure, or not recorded), then density and heat treatment where the entry has them, one line on lactose for dairy, and the entry's note. Amounts are as stored: percent of the ingredient for fat, milk solids, sugar, other solids, emulsifier and stabilizer; PAC and POD as numbers on the sucrose = 100 basis. "
        "Read-only: nothing on the page adds, edits, duplicates or deletes. Search is the Name field (filtered as you type, no button); Category is a select with All first. The count line is a polite live region; Clear filters appears only while a filter is on. This list is the base Phase 10's picker reuses; the picker is not drawn.\n\n"
        f"Measured the same way: a closed row is {ig1.get('rowH', ['?'])[0]} px at 1366 and {ig3.get('rowH', ['?'])[0]} to 105 at 393; Heavy cream open is {ig1.get('li', {}).get('h')} px at 1366 and {ig3.get('li', {}).get('h')} at 393; the whole page of 26 is {ig1.get('docH')} px at 1366 and {ig3.get('docH')} at 393. Every row's head, both fields and Clear filters (78.6 x 44) meet the 44 px floor; nothing overflows sideways from 393 to 1590. "
        "New words for you to approve: Name, Category, All, Show, Hide, Basis, Source, not recorded, Other solids, Emulsifier, Stabilizer, Clear filters, and No ingredient matches. Try another name or category."))
    note('p9-many-note', 'P9_IngredientsMany', (
        "The same page with the reviewed seed dataset's 103 names as the stand-in for a larger library (the library Phase 9 builds is not decided; a few hundred is Mark's figure). Names, categories and the figures a row summarises are the dataset's own (fat, milk solids, sugars, PAC and POD, as it states them); a row with none of those shows no figures. "
        f"Measured: the page is {mn1.get('docH')} px tall at 1366 (69 px a row) and {mn3.get('docH')} at 393 (71 to 109 px a row). At 300 entries that is about 20,700 px at 1366 and about 26,000 at 393. The filters scroll away with the page, not sticky: at 393 they take 140 px of 852, and the Phase 10 picker has its own scroll area where its search stays put. "
        "The category select takes eleven categories in one list at no cost in height; chips would take 102 px more at 393 (the next board)."), w=560)
    note('p9-options-note', 'P9_CategoryOptions', (
        "For your choice: the category filter as a select (A, drawn on the two place boards) or as chips (B). Chips show every category and pick in one tap, but the line grows with the library (102 px more at 393, 77 more at 1366, with eleven) and the picker in Phase 10 has less room than this page. "
        "Chips use only existing tokens (the App radius, the divider edge, the subtle surface for the picked chip, weight 600); no new value either way. Recommended: A."), w=560)
    N['p9-title'] = dict(N.get('p9-title', {}), x=0, y=-300, text='Phase 9 places: the Notebook place and the Ingredients place', kind='title1', maxW=x, page=PAGE[0])
    return c, pos, sizes, N, PAGE

def snippets():
    """What the measurement injects into the live build: the new rules and each variant's main markup."""
    crop = lambda key: '<div class="list-page place ing"><ul class="ing__list" data-m="list">' + row_closed(entry(key), 'x', open_=True, detail=detail(entry(key))) + '</ul></div>'
    ing = lambda name='', cat='All', none=False: ing_main(lib_rows('heavyCream', name=name, cat=cat), len(LIB), name=name, cat=cat, cats=CATS26, none=none)
    chipsmain = '<div class="list-page place ing"><h1 class="place__title">Ingredients</h1>%s%s</div>' % (filters_chips(CATSDS), status(len(DS), len(DS), False))
    selmain = '<div class="list-page place ing"><h1 class="place__title">Ingredients</h1>%s%s</div>' % (filters(cats=CATSDS), status(len(DS), len(DS), False))
    return dict(css=NEW_CSS, coarse=COARSE_CSS, nb_several=nb_main(ORDER), nb_one=nb_main(OLIVE), nb_zero=nb_main([]),
                ing_26=ing(), ing_milk=ing(name='milk'), ing_sugar=ing(cat='Sugar'), ing_none=ing_main([], len(LIB), name='milk', cat='Sugar', cats=CATS26, none=True),
                crop_cocoa=crop('cocoaPowder'), crop_lbg=crop('locustBeanGum'), crop_heavy=crop('heavyCream'), crop_milk=crop('milkChocolate'),
                many=ing_main(ds_rows(), len(DS), cats=CATSDS), many_fruit=ing_main(ds_rows(cat='Fruit'), len(DS), cat='Fruit', cats=CATSDS), opt_chips=chipsmain, opt_select=selmain)

if __name__ == '__main__':
    json.dump(snippets(), open(HERE + '/places-snippets.json', 'w'), indent=1, ensure_ascii=False)
    c, pos, sizes, N, PAGE = build(sys.argv[1], sys.argv[2])
    json.dump(c, open(sys.argv[2] + '/project/canvas.json', 'w'), indent=1, ensure_ascii=False)
    print(sizes)
