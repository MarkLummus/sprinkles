"""Verify the Carried forward removal in .planning/canvas-generators/gen.py (quick task 260924-b7q).

Runs a copy of gen.py and longhist.py with OUT redirected to a temp directory, against the
canvas source copies the previous session left in its scratchpad (gen.py's SP constant), and
compares every board and canvas.json with the outputs that session published from the same
generator. Each new output must equal the old one with exactly two edits applied: the
Carried forward block (and its 'Show 3 notes' fold) removed, and the three rung titles
reading 'details, Balance and Tasting folded'. Nothing is published and nothing under the
old scratchpad is written.

Usage: python3 verify-gen.py [path/to/canvas-generators]
Exit 0 = pass, 1 = mismatch, 2 = the old scratchpad sources are gone (verify by review instead).
"""
import json, os, re, shutil, subprocess, sys, tempfile

# Default: the generator in the tree the command runs in (a worktree or the main tree).
GEN_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(subprocess.run(
    ['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True, check=True).stdout.strip(),
    '.planning', 'canvas-generators')
gen_src = open(os.path.join(GEN_DIR, 'gen.py')).read()
SP = re.search(r"^SP = '([^']+)'", gen_src, re.M).group(1)
SRC = re.search(r"^SRC = SP \+ '([^']+)'", gen_src, re.M).group(1)
OLD_OUT = SP + '/canvas/project'
needed = [SP + SRC + '/AsBuiltRecipePage.dc.html', SP + SRC + '/canvas.json', SP + '/phone-forced.css', OLD_OUT]
missing = [p for p in needed if not os.path.exists(p)]
if missing:
    print('SOURCES GONE:', *missing, sep='\n  ')
    sys.exit(2)

TITLE_OLD = 'details, Balance, notes and Tasting folded'
TITLE_NEW = 'details, Balance and Tasting folded'
BLOCK = re.compile(
    r'<div class="authored"><p class="authored__legend"><span>Carried forward</span><span>authored</span></p>'
    r'(<p style="margin:0 0 8px;"><button[^>]*fold-notes[^>]*>Show 3 notes</button></p>)?'
    r'<ul[^>]*class="authored__notes"[^>]*>.*?</ul></div>', re.S)

tmp = tempfile.mkdtemp(prefix='verify-gen-')
out = os.path.join(tmp, 'out')
os.makedirs(out)
open(os.path.join(tmp, 'gen.py'), 'w').write(
    re.sub(r"^OUT = .*$", "OUT = " + repr(out), gen_src, count=1, flags=re.M))
shutil.copy(os.path.join(GEN_DIR, 'longhist.py'), tmp)
for script in ('gen.py', 'longhist.py'):
    subprocess.run([sys.executable, script], cwd=tmp, check=True, stdout=subprocess.DEVNULL)

failures = []
boards = sorted(f for f in os.listdir(out) if f.endswith('.dc.html'))
for fn in boards:
    new = open(os.path.join(out, fn)).read()
    old = open(os.path.join(OLD_OUT, fn)).read()
    expected = BLOCK.sub('', old).replace(TITLE_OLD, TITLE_NEW)
    if 'Carried forward' in new:
        failures.append(fn + ': still draws Carried forward')
    if 'fold-notes' in new:
        failures.append(fn + ': still carries the notes fold')
    if new != expected:
        failures.append(fn + ': differs from the published board beyond the two expected edits')
for fn in ('R35C_1366.dc.html', 'R35C_1024.dc.html', 'R35C_393.dc.html'):
    new = open(os.path.join(out, fn)).read()
    if new.count('fold-balance') != 2:
        failures.append(fn + ': balance fold missing')

old_cj = json.loads(open(os.path.join(OLD_OUT, 'canvas.json')).read().replace(TITLE_OLD, TITLE_NEW))
new_cj = json.load(open(os.path.join(out, 'canvas.json')))
if old_cj != new_cj:
    failures.append('canvas.json: differs beyond the rung titles')

shutil.rmtree(tmp)
if failures:
    print('FAIL', *failures, sep='\n  ')
    sys.exit(1)
print('OK', len(boards), 'boards and canvas.json match the published outputs minus Carried forward')
