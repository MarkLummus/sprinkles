import sys; sys.argv=['x']
from gen import *
# (date above, title, meta below, filled, current)
versions = [
 ('1 Jul','Version 1 · 50 g oil · 800 g','churned 2 Aug · Latest',True,True),
 ('20 Sep','Version 2 · less oil','draft',False,False),
 ('[date]','Version 3 · more salt','',False,False),
 ('[date]','Version 4 · allulose out','',False,False),
 ('[date]','Version 5 · gum blend up','',False,False),
 ('[date]','Version 6 · cream at 36%','',False,False),
 ('[date]','Version 7 · oil cold-emulsified','',False,False),
 ('[date]','Version 8 · 40 g oil','draft',False,False),
]
NW = 168; GAP = 24
def node(date, title, meta, filled, current):
    dot = f'background:{NOTEBOOK};' if filled else f'background:{APP_BG};border:1.5px solid {NOTEBOOK};'
    ring = f'box-shadow:0 0 0 2px {APP_BG},0 0 0 3.5px {NOTEBOOK};' if current else ''
    w = 700 if current else 400
    meta_html = meta if meta else '&nbsp;'
    return f'''<a href="#" style="flex:0 0 {NW}px;display:grid;grid-template-rows:16px 12px 40px 16px;row-gap:6px;text-decoration:none;color:{TEXT};min-width:0;">
  <span style="font-family:{GROT};font-size:12px;line-height:16px;color:{TEXT2};font-variant-numeric:tabular-nums;">{date}</span>
  <span style="display:flex;align-items:center;height:12px;"><span aria-hidden="true" style="box-sizing:border-box;width:12px;height:12px;border-radius:6px;{dot}{ring}"></span></span>
  <span style="font-family:{GROT};font-size:14px;font-weight:{w};line-height:20px;overflow:hidden;">{title}</span>
  <span style="font-family:{GROT};font-size:12px;line-height:16px;color:{TEXT2};">{meta_html}</span>
</a>'''
nodes = ''.join(node(*v) for v in versions)
# at rest: scrolled to the selected/latest end; older versions sit off the left edge behind a fade
strip = f'''<div style="display:flex;flex-direction:column;gap:10px;">
  <div style="display:flex;align-items:baseline;justify-content:space-between;">{cap('History')}<span style="font-family:{GROT};font-size:12px;color:{TEXT2};">8 versions · oldest left, latest right · opens at the version in view</span></div>
  <div style="position:relative;overflow:hidden;">
    <div style="position:absolute;left:0;right:0;top:27px;height:1px;background:{DIV};"></div>
    <div style="display:flex;justify-content:flex-end;gap:{GAP}px;min-width:max-content;padding:0 6px;">{nodes}</div>
    <div aria-hidden="true" style="position:absolute;top:0;left:0;bottom:0;width:96px;background:linear-gradient(to left, rgba(255,255,255,0), #ffffff);pointer-events:none;"></div>
  </div>
</div>'''
band = f'''<header style="display:flex;flex-direction:column;gap:24px;padding:20px 0 24px;border-bottom:1px solid {DIV};">
  <div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:start;">
    <div>{recipe_identity(False)}</div>
    <div>{version_block()}</div>
  </div>
  {strip}
</header>'''
main = f'''<div style="padding:0 48px 48px 40px;display:flex;flex-direction:column;gap:28px;">
  {band}
  <div style="display:flex;gap:40px;align-items:flex-start;"><div style="flex:1 1 0;min-width:0;">{sheet('batch')}</div><aside aria-label="Batch" style="flex:0 0 340px;min-width:0;padding-top:8px;">{batch_log('batch', column=True)}</aside></div>
</div>'''
open(OUT+'/R35C_LongHistory.dc.html','w').write(board('C · header band · History as a dated rail, eight versions, scrolling', 1600, 3500, main))
print('ok')
