import os
OUT='canvas/project'
STYLESHEET='/_blob/e7df2000f61674b89baca5fccf5c19f8'
INK='#141414'; GROUND='#f7f7f4'; PEN='#1f3d7a'
GROT="-apple-system,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif"
steps=[('Step 2','Gum slurry — the only high-heat step',[('Whole milk','120 g','120 g','15.0%','estimated','120 g of 370.4 g · 46.3% in all'),('Sucrose','12 g','','1.5%','','12 g of 76.0 g · 9.5% in all'),('Locust bean gum','1.04 g','','0.1%','',''),('Guar gum','0.48 g','','0.1%','',''),('Lambda carrageenan','0.16 g','','trace','','')]),
       ('Step 3','Build the base',[('Whole milk','250.4 g','263 g','31.3%','estimated','250.4 g of 370.4 g · 46.3% in all'),('Heavy cream','252.8 g','241 g','31.6%','estimated',''),('Skim milk powder','22.4 g','','2.8%','',''),('Sucrose','64 g','','8.0%','','64 g of 76.0 g · 9.5% in all'),('Dextrose','12 g','','1.5%','',''),('Fine sea salt','3.2 g','','0.4%','estimated','')])]
def name_cell(n,note):
    return f'<td class="ingredient-table__col-name">{n}' + (f'<span class="ingredient-table__portion-note">{note}</span>' if note else '') + '</td>'
def table(kind, hand=False):
    if kind=='inline':
        head='<th scope="col" class="ingredient-table__col-numeric">Grams</th><th scope="col" class="ingredient-table__col-numeric">As made</th><th scope="col" class="ingredient-table__col-name">Ingredient</th><th scope="col" class="ingredient-table__col-numeric">% of batch</th><th scope="col" class="ingredient-table__col-data">Source</th>'
        span=5
    elif kind=='merged':
        head='<th scope="col" class="ingredient-table__col-name">Ingredient</th><th scope="col" class="ingredient-table__col-numeric">As made</th><th scope="col" class="ingredient-table__col-numeric">% of batch</th><th scope="col" class="ingredient-table__col-data">Source</th>'
        span=4
    else:
        head='<th scope="col" class="ingredient-table__col-numeric">Grams</th><th scope="col" class="ingredient-table__col-name">Ingredient</th><th scope="col" class="ingredient-table__col-numeric">% of batch</th><th scope="col" class="ingredient-table__col-data">Source</th>'
        span=4
    body=''
    for sn,lead,rows in steps:
        body+=f'<tr class="ingredient-table__step-head"><td colspan="{span}">{sn}<span class="ingredient-table__step-head-lead">{lead}</span></td></tr>'
        for n,g,am,pct,src,note in rows:
            am_html=(f'<span style="font-family:\'Caveat\',Georgia,serif;font-size:20px;line-height:1;color:{PEN};">{am}</span>' if hand else f'<span class="ink-text">{am}</span>') if am else ''
            if kind=='merged':
                qty=f'<span style="display:inline-block;min-width:64px;text-align:right;margin-right:18px;">{g}</span>'
                body+=f'<tr><td class="ingredient-table__col-name">{qty}{n}' + (f'<span class="ingredient-table__portion-note" style="padding-left:82px;">{note}</span>' if note else '') + f'</td><td class="ingredient-table__col-numeric">{am_html}</td><td class="ingredient-table__col-numeric">{pct}</td><td class="ingredient-table__col-data">{src}</td></tr>'
            elif kind=='inline':
                body+=f'<tr><td class="ingredient-table__col-numeric">{g}</td><td class="ingredient-table__col-numeric">{am_html}</td>{name_cell(n,note)}<td class="ingredient-table__col-numeric">{pct}</td><td class="ingredient-table__col-data">{src}</td></tr>'
            else:
                stack=f'{g}' + (f'<span style="display:block;margin-top:2px;">{am_html}</span>' if am else '')
                body+=f'<tr><td class="ingredient-table__col-numeric" style="vertical-align:top;">{stack}</td>{name_cell(n,note)}<td class="ingredient-table__col-numeric">{pct}</td><td class="ingredient-table__col-data">{src}</td></tr>'
    return f'<table class="ingredient-table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>'
def block(title, sub, kind, hand=False):
    return f'''<section style="display:flex;flex-direction:column;gap:12px;">
<p style="margin:0;font-family:{GROT};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:{INK};">{title}</p>
<p style="margin:0;font-family:{GROT};font-size:13px;line-height:1.4;color:{INK};max-width:70ch;">{sub}</p>
<article class="recipe-page" style="display:block;padding:32px;">{table(kind, hand)}</article>
</section>'''
html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Ingredients: quantity first, with as-made</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="{STYLESHEET}">
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&amp;display=swap">
<style>
body{{margin:0;background:#ffffff}}
</style>
</helmet>
<div style="width: 1280px; height: 4600px; overflow: hidden; box-sizing: border-box; background: #ffffff; padding: 40px 48px; display: flex; flex-direction: column; gap: 40px;">
{block('1 · Two quantity columns, then the ingredient', 'Grams, then As made in pen blue, then the name. The two numbers read side by side; the As made column is present only when a batch is in view, as today.', 'inline')}
{block('2 · One quantity column, as-made stacked under the plan', 'Grams leads; when a batch is in view, its as-made sits under the plan in pen blue, same column. Rows without a value stay one line tall; the table keeps the Recipe Book column order without a batch.', 'stacked')}
{block('3 · As 1, with the as-made in the hand', 'The same two columns; the batch value is set in Caveat at the hand minimum size instead of the grotesk, to see the maker figures in the maker hand on the Sheet.', 'inline', hand=True)}
{block('4 · As 2, with the as-made in the hand', 'Stacked under the plan, in the hand.', 'stacked', hand=True)}
{block('5 · Grams and Ingredient merged: the quantity leads the name, then As made', 'One cell reads "370.4 g   Whole milk", the figure right-aligned in its own slot with an 18px gap before the name; the portion note indents to the name. As made keeps its own column, present only with a batch in view.', 'merged')}
{block('6 · As 5, with the as-made in the hand', 'The merged cell as in 5; the batch value in Caveat.', 'merged', hand=True)}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1280,"height":4600}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
open(OUT+'/R35_QtyFirst.dc.html','w').write(html)
print(len(html))
