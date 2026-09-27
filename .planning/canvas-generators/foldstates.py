import sys; sys.argv=['x']
from gen import *
# Mark, 2026-09-27: "we need to show both fold states for version details in the canvas to be clear when planning"
def col(label, open_):
    body = phone_folds(f'<div>{version_block()}</div>', open_=open_)
    return f'<div style="flex:0 0 400px;display:flex;flex-direction:column;gap:16px;"><p style="margin:0;font-family:{GROT};font-size:13px;color:{TEXT2};">{label}</p>{body}</div>'
main = f'''<div style="padding:40px 48px;display:flex;gap:80px;align-items:flex-start;">
  {col('Closed · the default below 1366', False)}
  {col('Open · the default from 1366', True)}
</div>'''
html = board('C · version details, both fold states', 1040, 320, '', extra_css='[hidden]{display:none !important}')
# no shell: the two states alone
html = re.sub(r'<div class="shell">.*?</div>\n</div>\n</x-dc>', lambda m: main + '\n</div>\n</x-dc>', html, count=1, flags=re.S)
open(OUT + '/R35C_DetailsFold.dc.html', 'w').write(html)
print('ok')
