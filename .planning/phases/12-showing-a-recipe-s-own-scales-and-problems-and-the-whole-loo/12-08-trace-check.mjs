// Plan 12-08: does every difference between the committed Phase 11 walk baseline and the walk
// recorded at e37db11a (the commit before Phase 12) have a named cause?
//
//   node 12-08-trace-check.mjs [--selftest] <drift-plain.txt> <attribution.tsv> <12-08-walk-trace.md>
//
// Inputs
//   drift-plain.txt   the output of `11-walk.mjs compare <baseline> <e37db11a recording, text keys
//                     stripped>`: its lines starting "DIFF " are the differences, N of them.
//   attribution.tsv   one line per DIFF line: a group id, a tab, the DIFF line exactly as compare
//                     printed it.
//   12-08-walk-trace.md  holds one line per group, exactly
//                     `group G<n> commit <hash> class <A|B> intended <yes|no> evidence <fragment>`
//                     (the fragment is the rest of the line), and the derived coverage line.
//
// The check refuses (prints "FAIL trace <what>: <values>", exits 1) when
//   - the attribution holds a line count other than N, or its DIFF lines are not drift-plain.txt's,
//     each once;
//   - a line carries the id `-` or an empty id;
//   - an id used in the attribution has no group line, a group line's id is used by no attribution
//     line, or two group lines share an id;
//   - a group's hash is not a commit listed by `git log cf64aa70..e37db11a -- app/`;
//   - the commit's subject has the form of a Phase 11 plan commit (a lowercase type, then (11) or
//     (11-NN), then a colon);
//   - class A is written for a commit whose subject names neither bug-ipad-tab-lost-from-single-line-fields
//     nor bug-p11-ipad-hardware-tab-skips-fields, or class B for one whose subject names either;
//   - the evidence fragment is in no added line of `git show --format= <hash> -- app/src`.
// Its last line is derived from the files, never read from them:
//   DIFF lines: N; attributed: M; unattributed: U
// and it fails unless M equals N, U is 0 and the trace file holds that same line exactly.
//
// With --selftest it first runs the real check (which must pass), then six doctored copies held in
// memory, each of which must be refused. Read-only: it runs git and prints; it writes no file.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const RANGE = 'cf64aa70..e37db11a';
const CLASS_A_BUGS = ['bug-ipad-tab-lost-from-single-line-fields', 'bug-p11-ipad-hardware-tab-skips-fields'];
const PHASE_11_PLAN_COMMIT = /^[a-z]+\(11(-\d+)?\):/;
const GROUP_LINE = /^group (G\d+) commit ([0-9a-f]{7,40}) class (A|B) intended (yes|no) evidence (.+)$/;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28 });

// One git read per commit, kept for the run.
const rangeHashes = git('log', '--format=%H', RANGE, '--', 'app/').split('\n').filter(Boolean);
const subjectCache = new Map();
const addedCache = new Map();
const subjectOf = (hash) => {
  if (!subjectCache.has(hash)) subjectCache.set(hash, git('log', '-1', '--format=%s', hash).trim());
  return subjectCache.get(hash);
};
const addedLinesOf = (hash) => {
  if (!addedCache.has(hash)) {
    const lines = git('show', '--format=', hash, '--', 'app/src')
      .split('\n')
      .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
      .map((line) => line.slice(1));
    addedCache.set(hash, lines);
  }
  return addedCache.get(hash);
};
const resolveInRange = (short) => {
  const hits = rangeHashes.filter((full) => full.startsWith(short));
  return hits.length === 1 ? hits[0] : null;
};

function parseGroups(traceText) {
  const groups = [];
  for (const line of traceText.split('\n')) {
    const match = GROUP_LINE.exec(line.trimEnd());
    if (match) groups.push({ id: match[1], commit: match[2], klass: match[3], intended: match[4], evidence: match[5].trim() });
  }
  return groups;
}

function parseAttribution(tsvText) {
  return tsvText
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => {
      const at = line.indexOf('\t');
      return at < 0 ? { id: '', diff: line } : { id: line.slice(0, at), diff: line.slice(at + 1) };
    });
}

// The whole check on in-memory inputs: { fails: [string], last: string }.
function check({ driftLines, attribution, groups, traceText }) {
  const fails = [];
  const fail = (what, values) => fails.push(`FAIL trace ${what}: ${values}`);
  const N = driftLines.length;

  if (attribution.length !== N) fail('attribution line count', `${attribution.length} lines for ${N} DIFF lines`);
  const count = (lines) => {
    const m = new Map();
    for (const line of lines) m.set(line, (m.get(line) ?? 0) + 1);
    return m;
  };
  const want = count(driftLines);
  const have = count(attribution.map((a) => a.diff));
  for (const [line, n] of have) {
    if (!want.has(line)) fail('attribution line is not a DIFF line', line.slice(0, 160));
    else if (n > 1) fail('DIFF line mapped twice', `${n}x ${line.slice(0, 160)}`);
  }
  for (const line of want.keys()) if (!have.has(line)) fail('DIFF line missing from the attribution', line.slice(0, 160));

  const unmapped = attribution.filter((a) => a.id === '' || a.id === '-');
  if (unmapped.length > 0) fail('DIFF line with no group id', `${unmapped.length}, first ${unmapped[0].diff.slice(0, 160)}`);

  const groupIds = new Map();
  for (const group of groups) groupIds.set(group.id, (groupIds.get(group.id) ?? 0) + 1);
  for (const [id, n] of groupIds) if (n > 1) fail('two group lines share an id', `${id} x${n}`);
  const used = new Set(attribution.map((a) => a.id).filter((id) => id !== '' && id !== '-'));
  for (const id of used) if (!groupIds.has(id)) fail('attribution id has no group line', id);
  for (const id of groupIds.keys()) if (!used.has(id)) fail('group line used by no attribution line', id);

  for (const group of groups) {
    const full = resolveInRange(group.commit);
    if (!full) {
      fail('commit not in `git log cf64aa70..e37db11a -- app/`', `${group.id} ${group.commit}`);
      continue;
    }
    const subject = subjectOf(full);
    if (PHASE_11_PLAN_COMMIT.test(subject)) fail('commit is a Phase 11 plan commit', `${group.id} ${group.commit} "${subject.slice(0, 90)}"`);
    const namesA = CLASS_A_BUGS.some((bug) => subject.includes(bug));
    if (group.klass === 'A' && !namesA) fail('class A for a subject that names neither one-row-textarea bug', `${group.id} ${group.commit} "${subject.slice(0, 90)}"`);
    if (group.klass === 'B' && namesA) fail('class B for a subject that names a one-row-textarea bug', `${group.id} ${group.commit} "${subject.slice(0, 90)}"`);
    if (!addedLinesOf(full).some((line) => line.includes(group.evidence))) {
      fail('evidence is in no added line of the commit', `${group.id} ${group.commit} "${group.evidence.slice(0, 90)}"`);
    }
  }

  const attributedIds = new Set([...groupIds.keys()].filter((id) => groupIds.get(id) === 1));
  const seen = new Set();
  let M = 0;
  for (const a of attribution) {
    if (!want.has(a.diff) || seen.has(a.diff)) continue;
    seen.add(a.diff);
    if (attributedIds.has(a.id)) M += 1;
  }
  const U = N - M;
  const last = `DIFF lines: ${N}; attributed: ${M}; unattributed: ${U}`;
  if (M !== N || U !== 0) fail('coverage', last);
  if (!traceText.split('\n').some((line) => line.trimEnd() === last)) fail('the trace file does not hold the derived line', last);
  return { fails, last };
}

function load(driftPath, attributionPath, tracePath) {
  const traceText = readFileSync(tracePath, 'utf8');
  return {
    driftLines: readFileSync(driftPath, 'utf8').split('\n').filter((line) => line.startsWith('DIFF ')),
    attribution: parseAttribution(readFileSync(attributionPath, 'utf8')),
    groups: parseGroups(traceText),
    traceText,
  };
}

const args = process.argv.slice(2);
const selftest = args[0] === '--selftest';
const [driftPath, attributionPath, tracePath] = selftest ? args.slice(1) : args;
if (!driftPath || !attributionPath || !tracePath) {
  console.error('Usage: node 12-08-trace-check.mjs [--selftest] <drift-plain.txt> <attribution.tsv> <12-08-walk-trace.md>');
  process.exit(1);
}

const input = load(driftPath, attributionPath, tracePath);
const real = check(input);
for (const line of real.fails) console.log(line);
let failed = real.fails.length > 0;

if (selftest) {
  if (failed) {
    console.log('FAIL selftest real: the real check does not pass, so no refusal can be shown');
  } else {
    const first = input.groups[0];
    const doctored = [
      ['unmapped-id', 'DIFF line with no group id', () => ({ ...input, attribution: input.attribution.map((a, i) => (i === 0 ? { ...a, id: '-' } : a)) })],
      ['dropped-line', 'DIFF line missing from the attribution', () => ({ ...input, attribution: input.attribution.slice(1) })],
      [
        'phase-11-commit',
        'commit is a Phase 11 plan commit',
        () => ({ ...input, groups: input.groups.map((g, i) => (i === 0 ? { ...g, commit: '4d3b44f7' } : g)) }),
      ],
      [
        'commit-after-e37db11a',
        'commit not in `git log cf64aa70..e37db11a -- app/`',
        () => ({ ...input, groups: input.groups.map((g, i) => (i === 0 ? { ...g, commit: '7caf6c11' } : g)) }),
      ],
      [
        'class-flipped',
        first.klass === 'A' ? 'class B for a subject' : 'class A for a subject',
        () => ({ ...input, groups: input.groups.map((g, i) => (i === 0 ? { ...g, klass: g.klass === 'A' ? 'B' : 'A' } : g)) }),
      ],
      [
        'evidence-not-added',
        'evidence is in no added line of the commit',
        () => ({ ...input, groups: input.groups.map((g, i) => (i === 0 ? { ...g, evidence: 'zzqx no commit ever added these words' } : g)) }),
      ],
    ];
    for (const [name, expected, make] of doctored) {
      const result = check(make());
      const hit = result.fails.find((line) => line.startsWith(`FAIL trace ${expected}`));
      if (hit) console.log(`PASS selftest ${name}: refused (${hit.slice('FAIL trace '.length, 'FAIL trace '.length + 80)})`);
      else {
        console.log(`FAIL selftest ${name}`);
        failed = true;
      }
    }
  }
}

console.log(real.last);
process.exit(failed ? 1 : 0);
