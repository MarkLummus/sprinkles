import sys, os, re
SP = sys.argv[1]; DEST = sys.argv[2]
ONLY = sys.argv[3:]   # optional board keys: snapshot only these (the other generators need not have run)
S = '.planning/sketches/011-recipe-route-c'
ref = open(S + '/details-fold.html').read()   # any gen.py board: it carries the canvas stylesheet inline (1600-batch.html became a final-design board, and 393-batch.html a phone.py capture of the build since 2026-10-04: neither does). Only the boards that still link the canvas stylesheet use STYLE.
i = ref.index('<style>'); j = ref.index('</style>', i) + len('</style>')
STYLE = ref[i:j]
# G-03.5-R2-3 (Mark, UAT 2026-09-30, option 2): the canvas's stylesheet asset still carries the app's old touch floor under
# `(width<=759.98px),(pointer:coarse)`; the app's own floor reads the pointer alone, so narrow it in the copy every snapshot inlines.
# Idempotent: the committed 1600-batch.html already carries the narrowed text on the second run.
OLD_TOUCH = '@media (width<=759.98px),(pointer:coarse){'
NEW_TOUCH = '@media (pointer:coarse){'
STYLE = STYLE.replace(OLD_TOUCH, NEW_TOUCH)
assert STYLE.count(NEW_TOUCH + 'button,select') == 1 and OLD_TOUCH not in STYLE, 'touch floor condition not narrowed exactly once'
MAP = {'R35C_Batch': '1600-batch', 'R35C_NoBatch': '1600-no-batch', 'R35C_Pen': '1600-pen', 'R35C_LongHistory': '1600-long-history',
       'R35C_1920': '1920-batch', 'R35C_1366': '1366-batch', 'R35C_1024': '1024-batch', 'R35C_984': '984-batch',
       'R35C_983': '983-batch', 'R35C_723': '723-batch', 'R35C_393': '393-batch', 'R35C_DetailsFold': 'details-fold', 'R35C_393AllFolded': '393-all-folded',
       'R35C_393ShowChanges': '393-show-changes', 'R35C_723ShowChanges': '723-show-changes', 'R35C_393ShowChangesCases': '393-show-changes-cases',
       'R35C_393PenChanges': '393-pen-changes', 'R35C_723PenChanges': '723-pen-changes',
       'R35C_1366Sticky': '1366-sticky-nav', 'R35C_984Sticky': '984-sticky-nav', 'R35C_744Sticky': '744-sticky-nav', 'R35C_RemoveLink': '1600-remove-link', 'R35C_SheetTitle': 'sheet-title-pen', 'R35C_InfoBands': 'info-labels-bands', 'R35C_InfoLog': 'info-labels-log', 'R35C_1600StickyRail': '1600-sticky-rail',
       'R35C_WhyRow': 'why-row', 'R35C_AppRadius': 'app-radius', 'R35C_Rhythm': 'version-details-rhythm', 'R35C_RecordPenApp': 'record-pen-app', 'R35C_InfoPhone': 'info-labels-phone', 'R35C_SplitRemove': 'split-remove-link', 'R35C_InfoHead': 'info-labels-batch-head', 'R35C_OneHead': 'table-head-one-line', 'R35C_EmptySpace': 'empty-space-under-table', 'R35C_BatchHead': 'batch-head-show-hide', 'R35C_RecordPenCues': 'record-pen-cues',
       'R35C_BysPosition': 'before-you-start-position', 'R35C_BysStates': 'before-you-start-states', 'R35C_BysHeading': 'before-you-start-heading', 'R35C_BysPen': 'before-you-start-pen', 'R35C_BysPrint': 'before-you-start-print', 'R35C_BysBreak': 'before-you-start-print-break',
       'R35C_PenApp350': '350-pen-app', 'R35C_PenApp393': '393-pen-app', 'R35C_PenAsBuilt350': '350-pen-as-built',
       'R35C_PenRange724': '724-pen-range', 'R35C_PenRange740': '740-pen-range', 'R35C_PenRange759': '759-pen-range',
       'R35C_393PhoneLog': '393-phone-log', 'R35C_723PhoneLog': '723-phone-log',
       'R35C_393ShowChangesHead': '393-show-changes-head', 'R35C_723ShowChangesHead': '723-show-changes-head',
       'R35C_1366IngredientOptions': '1366-ingredient-options', 'R35C_1024IngredientOptions': '1024-ingredient-options',
       'R35C_1366Ladder': '1366-ladder', 'R35C_1194Ladder': '1194-ladder',
       'R35C_1366Nav': '1366-nav', 'R35C_1194Nav': '1194-nav',
       'R35C_744': '744-batch', 'R35C_834': '834-batch', 'R35C_GoToBatchWide': '724-1365-go-to-batch'}
# The count boards (Mark, 2026-09-27) live in the sibling 011-options-counts folder of DEST, with the same two replacements.
COUNTS = {'R35C_CountVersions': 'versions-1-vs-many', 'R35C_CountBatches01': 'batches-0-and-1', 'R35C_CountBatchesMany': 'batches-many',
          'R35C_CountBatchesMany393': 'batches-many-393', 'R35C_CountUpright393': 'upright-393'}
COUNTS_DEST = os.path.join(os.path.dirname(os.path.abspath(DEST)), '011-options-counts')
# The Show changes list-form options (Sid, 2026-10-02) live in the sibling 011-options-show-changes folder, with the same two replacements.
SC_OPTIONS = {'R35C_ShowChangesOptions': 'list-form-options'}
SC_DEST = os.path.join(os.path.dirname(os.path.abspath(DEST)), '011-options-show-changes')
def snap(k, dest, out):
    s = open(f'{SP}/canvas/project/{k}.dc.html').read()
    s = s.replace('<script src="./support.js"></script>\n', '', 1)
    s = s.replace('<link rel="stylesheet" href="/_blob/8adf6a1ce6e9505b8dc487280a2ce3d7">', '\n' + STYLE, 1)
    open(f'{dest}/{out}.html', 'w').write(s)
os.makedirs(DEST, exist_ok=True)
os.makedirs(COUNTS_DEST, exist_ok=True)
os.makedirs(SC_DEST, exist_ok=True)
for k, out in MAP.items():
    if not ONLY or k in ONLY: snap(k, DEST, out)
for k, out in COUNTS.items():
    if not ONLY or k in ONLY: snap(k, COUNTS_DEST, out)
for k, out in SC_OPTIONS.items():
    if not ONLY or k in ONLY: snap(k, SC_DEST, out)
print('ok')
