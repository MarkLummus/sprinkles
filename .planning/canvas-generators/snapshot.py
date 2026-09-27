import sys, os, re
SP = sys.argv[1]; DEST = sys.argv[2]
S = '.planning/sketches/011-recipe-route-c'
ref = open(S + '/1600-batch.html').read()
i = ref.index('<style>'); j = ref.index('</style>', i) + len('</style>')
STYLE = ref[i:j]
MAP = {'R35C_Batch': '1600-batch', 'R35C_NoBatch': '1600-no-batch', 'R35C_Pen': '1600-pen', 'R35C_LongHistory': '1600-long-history',
       'R35C_1920': '1920-batch', 'R35C_1366': '1366-batch', 'R35C_1024': '1024-batch', 'R35C_984': '984-batch',
       'R35C_983': '983-batch', 'R35C_723': '723-batch', 'R35C_393': '393-batch', 'R35C_DetailsFold': 'details-fold', 'R35C_393AllFolded': '393-all-folded'}
os.makedirs(DEST, exist_ok=True)
for k, out in MAP.items():
    s = open(f'{SP}/canvas/project/{k}.dc.html').read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1)
    s = s.replace('<link rel="stylesheet" href="/_blob/e7df2000f61674b89baca5fccf5c19f8">', '\n' + STYLE, 1)
    open(f'{DEST}/{out}.html', 'w').write(s)
print('ok')
