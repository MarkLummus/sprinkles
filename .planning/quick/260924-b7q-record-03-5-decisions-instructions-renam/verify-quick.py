"""Checks for quick task 260924-b7q. Usage: python3 verify-quick.py app|docs|handoff

Each check lists text that must be gone (the old label where it names the region), text that
must be there (the new label and the dated decisions), and guards that must survive untouched
(identifiers, evidence, generic uses of the word). Exit 0 = pass, 1 = fail.
"""
import json, os, re, subprocess, sys

# The tree being checked is the one the command runs in (a worktree or the main tree), not the script's own.
ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip()
fails = []

def read(rel):
    return open(os.path.join(ROOT, rel), encoding='utf-8').read()

def absent(rel, *phrases):
    text = read(rel)
    for p in phrases:
        if p in text:
            fails.append(f'{rel}: still contains {p!r}')

def present(rel, *phrases):
    text = read(rel)
    for p in phrases:
        if p not in text:
            fails.append(f'{rel}: missing {p!r}')

def app():
    hits = subprocess.run(['grep', '-rnE', 'aria-label="Method"|>Method<|Method</h2>', 'app/src'],
                          cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if hits:
        fails.append('app/src still shows the old label:\n' + hits)
    present('app/src/ui/Method.jsx', '<h2 className="region-name">Instructions</h2>', 'export function Method(')
    present('app/src/ui/RecipePage.jsx', '<section className="method-region" aria-label="Instructions">',
            "import { Method } from './Method.jsx';", 'version.method')
    present('app/src/ui/Method.test.jsx', "'Instructions</h2>'")
    present('app/src/ui/RecipePage.test.jsx', 'aria-label="Instructions"')

def docs():
    absent('DESIGN.md', 'ingredients, Method, and Notes', 'grams and Method changes', 'Method lead-ins',
           'Ingredients, Method, Balance', '### Method step', 'heads the method at')
    present('DESIGN.md', 'ingredients, Instructions, and Notes', 'grams and Instructions changes',
            'Lead-ins in the Instructions', 'Ingredients, Instructions, Balance', '### Instructions step',
            'heads the Instructions at', 'method prose')
    absent('.impeccable/design.json', '"name": "Method step"', 'ingredients, Method, and Notes')
    present('.impeccable/design.json', '"name": "Instructions step"', 'ingredients, Instructions, and Notes',
            'ds-method-step')
    try:
        json.loads(read('.impeccable/design.json'))
    except ValueError as e:
        fails.append(f'.impeccable/design.json no longer parses: {e}')
    absent('.impeccable/surfaces/route-recipe.md', 'by portion, Method, Notes', 'its Method changes')
    present('.impeccable/surfaces/route-recipe.md', 'by portion, Instructions, Notes', 'its Instructions changes',
            '**Instructions** (Mark, 2026-09-24)', '**Carried forward notes are dropped** (Mark, 2026-09-24)',
            'carriedForward', '03.5 discussion', 'Formulation note. Method. Margin.')
    absent('.impeccable/surfaces/route-recipe-version.md', 'grams and Method changes')
    present('.impeccable/surfaces/route-recipe-version.md', 'grams and Instructions changes',
            'Carried forward notes are dropped', 'Before you start notes', '2026-09-24')
    absent('.impeccable/surfaces/route-recipe-batch.md', 'its Method changes', 'new Method steps')
    present('.impeccable/surfaces/route-recipe-batch.md', 'its Instructions changes', '**Instructions** (Mark, 2026-09-24)',
            'Method pages: step 1 struck through')
    absent('.impeccable/surfaces/route.md', 'grams and Method changes')
    present('.impeccable/surfaces/route.md', 'grams and Instructions changes')
    absent('.impeccable/surfaces/route-print-recipe-sheet.md', '**Method page.**', 'heads the method and', "the method page's")
    present('.impeccable/surfaces/route-print-recipe-sheet.md', '**Instructions page.**', 'heads the Instructions and',
            "the Instructions page's", '2026-09-24')
    absent('product-requirements/05-domain-and-language.md', '| Method; what you did |', 'Ingredients, Method, Notes',
           'Carried forward, Uses')
    present('product-requirements/05-domain-and-language.md', '| Instructions; what you did |',
            '| Method | Instructions |', 'Carried forward is retired', 'Ingredients, Notes, Before you start, Uses.')
    ref = '.claude/skills/sketch-findings-sprinkles/references/'
    absent(ref + 'page-shell-front-matter.md', 'head of the Method**', '- Method: `ol`',
           'carried-forward Notes sit under Balance')
    present(ref + 'page-shell-front-matter.md', 'head of the Instructions**', '- Instructions: `ol`', '2026-09-24')
    present(ref + 'cross-cutting-type-spacing-feedback.md', '## Verification Method')
    changed = subprocess.run(['git', 'status', '--porcelain'], cwd=ROOT, capture_output=True, text=True).stdout
    for prefix in ('.impeccable/critique/', '.impeccable/audit/', '.planning/phases/', '.planning/sketches/',
                   '.claude/skills/sketch-findings-sprinkles/sources/'):
        if prefix in changed:
            fails.append('historical record touched: ' + prefix)

def handoff():
    todo_old = '.planning/todos/pending/2026-09-24-decide-whether-the-batch-and-tasting-log-is-entered-on-the-phone.md'
    todo_new = '.planning/todos/pending/2026-09-24-write-a-product-brief-for-phone-based-jobs.md'
    present(todo_old, 'Deferred', 'phone-based jobs', '2026-09-24-write-a-product-brief-for-phone-based-jobs.md')
    absent(todo_old, 'Details, Balance, notes, Tasting')
    if not os.path.exists(os.path.join(ROOT, todo_new)):
        fails.append('missing ' + todo_new)
    else:
        text = read(todo_new)
        if not re.match(r'---\ncreated: \d{4}-\d\d-\d\dT[\d:.]+Z\ntitle: Write a product brief for phone-based jobs\narea: \w+\nseverity: \w+\nfiles:\n', text):
            fails.append(todo_new + ': frontmatter does not follow the todo format')
        present(todo_new, '2026-09-24-decide-whether-the-batch-and-tasting-log-is-entered-on-the-phone.md', '## Problem', '## Solution')
    cont = read('.planning/.continue-here.md')
    blockers = cont[cont.index('<blockers>'):cont.index('</blockers>')]
    for p in ('rename label', 'fold remembers', 'yield', 'Done/Cancel', 'Method.jsx', 'version.method', 'carried-forward notes'):
        if p not in blockers:
            fails.append(f'.continue-here.md blockers: missing {p!r}')
    for p in ('phone logging', 'Carried forward notes (', 'Instructions" rename reaching'):
        if p in blockers:
            fails.append(f'.continue-here.md blockers: still open {p!r}')
    decisions = cont[cont.index('<decisions_made>'):cont.index('</decisions_made>')]
    for p in ('Carried forward notes dropped', 'Phone logging deferred', 'Method renamed Instructions'):
        if p not in decisions:
            fails.append(f'.continue-here.md decisions: missing {p!r}')
    try:
        h = json.loads(read('.planning/HANDOFF.json'))
    except ValueError as e:
        fails.append(f'HANDOFF.json no longer parses: {e}')
        return
    action = ' '.join(a['action'] for a in h['human_actions_pending'])
    for p in ('rename label', 'fold memory', 'yield', 'Done/Cancel', 'Method.jsx', 'version.method'):
        if p not in action:
            fails.append(f'HANDOFF.json human_actions_pending: missing {p!r}')
    for p in ('phone logging', 'Carried forward notes,', 'Instructions rename reaching'):
        if p in action:
            fails.append(f'HANDOFF.json human_actions_pending: still open {p!r}')
    ds = ' | '.join(d['decision'] for d in h['decisions'])
    for p in ('Carried forward notes dropped', 'Phone logging deferred', 'Method renamed Instructions'):
        if p not in ds:
            fails.append(f'HANDOFF.json decisions: missing {p!r}')
    folds = [d['decision'] for d in h['decisions'] if d['decision'].startswith('Folds closed by default')]
    if not folds or 'Carried forward' in folds[0]:
        fails.append('HANDOFF.json decisions: the folds entry still names Carried forward')
    gen = read('.planning/canvas-generators/gen.py')
    if 'details, Balance, notes and Tasting folded' in gen:
        fails.append('gen.py: rung titles still fold notes')

{'app': app, 'docs': docs, 'handoff': handoff}[sys.argv[1]]()
if fails:
    print('FAIL', *fails, sep='\n  ')
    sys.exit(1)
print('OK', sys.argv[1])
