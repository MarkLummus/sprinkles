# Sid, 2026-10-08 (Mark's List row draw-clear-stale-approval-titles; Bishop's audit of sketch 010, low): Mark approved the whole of sketch 010 (D1 to D29), but the boards still said "awaiting Mark" or
# "nothing approved", and page 2's title cited D24 (the README and CONTRACT fold the 5 lines into D23; the punch check is D20). This file is the one list of the wording that changed. It touches the <title> of 20 boards,
# those boards' titles in canvas.json, and nine canvas notes, and nothing else in any board.
#   python3 approved-wording.py <dir holding project/canvas.json and project/<Board>.dc.html as read from the artifact root> <out dir>
#   writes <out>/project/canvas.json (titles and notes patched, every other key as read) and <out>/project/<Board>.dc.html for the boards whose <title> changed.
# The same wording is in the generators that make these boards (printstart.py, sheetpages.py, markone.py, declared.py, phase4screens.py, p4print-canvas.py, p4print-notes.json, declared-notes.json), so a regeneration keeps it.
# This script patches the boards as served rather than regenerating them because BatchLogForm and the P4_ boards have drifted from their generators since they were published (a CSS comment and an unused rule; one margin rule),
# and the canvas wins over the generators (snapshot010.py takes the boards as served). Every old string must occur exactly once, or the script stops.
import json, os, re, sys

SUF = {  # board -> (old ending of the <title>, new ending)
    'BatchLogForm': ('; awaiting Mark)', '; approved)'),
    'PrintStartingPointBalanceCol2': ('; awaiting Mark)', '; approved)'),
    'SheetPrintPage1': ('; awaiting Mark)', '; approved)'),
    'SheetPrintPage2': ('; awaiting Mark)', '; approved)'),
    'SheetPrintPage3': ('; awaiting Mark)', '; approved)'),
    'MarkOnePenStates': ('; awaiting Mark)', '; approved)'),
    'MarkOnePenWhole': ('; awaiting Mark)', '; approved)'),
    'MarkOneReading': ('; awaiting Mark)', '; approved)'),
    'DeclaredLogPages': ('; awaiting Mark)', '; approved)'),
    'DeclaredLogPagesNone': ('; awaiting Mark)', '; approved)'),
    'DeclaredLogPagesTwo': ('; awaiting Mark)', '; approved)'),
    'DeclaredPage2Variants': ('; awaiting Mark)', '; approved)'),
    'DeclaredPenReading': ('; awaiting Mark)', '; approved)'),
    'P4_PrintRoute1280': (", awaiting Mark's look; nothing approved)", '; approved)'),
    'P4_PrintRoute393': (", awaiting Mark's look; nothing approved)", '; approved)'),
    'P4_Home': (", awaiting Mark's look; nothing approved)", '; approved)'),
    'P4_DraftKept': (", awaiting Mark's look; nothing approved)", '; approved)'),
    'P4_DraftKeptWords': (", awaiting Mark's look; nothing approved)", '; approved)'),
}
WHOLE = {  # board -> (old title, new title): the two that change more than the ending
    'TastingLogForm': ('Page 2 · back: Tasting log (D24: 5 lines; D23: no Every recipe / This recipe only; D22, D21, D20, D19; awaiting Mark)',
                       'Page 2 · back: Tasting log (D23: 5 lines, no Every recipe / This recipe only; D22, D21, D20, D19; approved)'),
    'HolePunchCheck': ('Punch check · the log sheet with the holes drawn on, front and back (D20, awaiting Mark)',
                       'Punch check · the log sheet with the holes drawn on, front and back (D20; guide, not a target)'),
}
NOTES = {  # canvas note id -> [(old, new)]
    'declared-note': [('(row draw-declared-two-slots-each); nothing here is approved.', '(row draw-declared-two-slots-each); approved by Mark 2026-10-08 (D25, D26).')],
    'holecheck-note': [('Punch check, drawn from the same two log pages (D24).', 'Punch check, a guide and not a target, drawn from the same two log pages (D20).')],
    'logpages-note': [('Page 1 is unchanged. Nothing approved.', 'Page 1 is unchanged. Approved by Mark 2026-10-08 (D23).')],
    'markone-note': [('Redrawn 2026-10-07 for D17; nothing approved.', 'Redrawn 2026-10-07 for D17; approved by Mark 2026-10-08.')],
    'method-note': [('Redrawn 2026-10-07 for your answers (D20); nothing approved.', 'Redrawn 2026-10-07 for your answers (D20); approved by Mark 2026-10-08 (D18, D20, D22).')],
    'p4-draft-note': [('nothing approved (D-15).', 'approved by Mark 2026-10-08 (D-15).')],
    'p4-home-note': [('version 4); nothing approved. Two new parts.', 'version 4); approved by Mark 2026-10-08. Two new parts.')],
    'p4-route-note': [('for your look; nothing approved (D-04,', 'for your look; approved by Mark 2026-10-08 (D-04,')],
    'sheetpages-note': [
        ('Drawn 2026-10-08 for your look ("draw the real break"); nothing approved.', 'Drawn 2026-10-08 for your look ("draw the real break"); approved by Mark 2026-10-08 (D29).'),
        ("Not decided by D-06a: Balance is taller than the page too (830 px from the Ingredients heading), so it breaks between gauges, with no heading again. It is a decide row on Mark's List.",
         'Not covered by D-06a, decided by Mark (decide-balance-break, 2026-10-08): Balance is taller than the page too (830 px from the Ingredients heading), so it breaks between gauges, with no heading again.'),
    ],
}

def new_title(key, old):
    if key in WHOLE:
        assert old == WHOLE[key][0], (key, old); return WHOLE[key][1]
    a, b = SUF[key]
    assert old.endswith(a) and old.count(a) == 1, (key, old); return old[:-len(a)] + b

def patch_note(key, text):
    for a, b in NOTES[key]:
        assert text.count(a) == 1, (key, a[:50], text.count(a))
        text = text.replace(a, b)
    return text

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out + '/project', exist_ok=True)
    c = json.load(open(src + '/project/canvas.json'))
    changed = []
    for key in list(SUF) + list(WHOLE):
        fn = f'/project/{key}.dc.html'
        s = open(src + fn).read()
        m = re.search(r'<title>(.*?)</title>', s)
        old = m.group(1); new = new_title(key, old)
        assert s.count('<title>' + old + '</title>') == 1
        open(out + fn, 'w').write(s.replace('<title>' + old + '</title>', '<title>' + new + '</title>', 1))
        c['boards'][key + '.dc.html']['title'] = new[:120]   # the canvas cuts titles at 120 characters
        changed.append(key)
    for key in NOTES:
        c['notes'][key]['text'] = patch_note(key, c['notes'][key]['text'])
    open(out + '/project/canvas.json', 'w').write(json.dumps(c, indent=2, ensure_ascii=False) + '\n')   # the format the canvas serves
    print(len(changed), 'boards', changed, len(NOTES), 'notes')
