import re, os, sys
# Sid, 2026-10-18 (Mark said yes, 2026-10-18: the Before you start note remove uses the same link look as the row remove; sketch 010 README D31).
# Today's note remove is a plain button (app/src/ui/Authored.jsx); the row remove is a Button with class text-control (IngredientTable.jsx). This gives the note's button that class and nothing else:
# still a real button, still tabindex 0; its height is the .text-control rule's own (24 px at a fine pointer, --touch-min at a coarse one).
#   apply(html) -> (html, n)     python3 noteremove.py <out dir> <board.dc.html> ...   (reads a served board, writes <out dir>/project/<name>; run before pod40.py or after, they touch different markup)
NOTE = re.compile(r'(<span class="authored__note-field"><textarea[^>]*>[^<]*</textarea><button type="button") (tabindex="0">remove</button>)')
def apply(html): return NOTE.subn(r'\1 class="text-control" \2', html)
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out + '/project', exist_ok=True)
    for f in sys.argv[2:]:
        s, n = apply(open(f).read()); print(os.path.basename(f), n); open(out + '/project/' + os.path.basename(f), 'w').write(s)
