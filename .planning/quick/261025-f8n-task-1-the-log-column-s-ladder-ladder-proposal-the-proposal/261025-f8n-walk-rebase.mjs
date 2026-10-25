// Quick 261025-f8n: update the strict walk baseline where a tag swap or a case flip lands.
//
// 10-walk.mjs hashes .notebook innerText (snapshot.textHash). innerText applies text-transform and counts two line
// breaks for a <p> where an <h3>/<h4> gives one, so a cue that becomes a heading, or a label whose case flips, changes
// that hash and nothing else the walk records. This script writes exactly those leaves into the baseline and refuses
// everything else, so the baseline can never be edited to hide a regression.
//
//   node 261025-f8n-walk-rebase.mjs <baseline.json> <after.json>
//
// Reusable by items 261025-f8o and 261025-f8p: the same two arguments, the same refusals.
//
// It refuses (exit 1, nothing written, each offending leaf printed in 10-walk.mjs's DIFF form) when the file-level keys
// differ, when a scenario or a step is added, removed or repeated, or when any differing leaf is other than
// snapshot.textHash. Otherwise it replaces those textHash values in the baseline, writes the file with
// JSON.stringify(data, null, 2) plus a newline (10-walk.mjs's own format, so the git diff is the textHash lines alone),
// prints "UPDATED <scenario> / <step>" per leaf and ends "<n> textHash leaves updated".
import { readFile, writeFile } from 'node:fs/promises';

const [baselinePath, afterPath] = process.argv.slice(2);
if (!baselinePath || !afterPath) {
  console.log('usage: node 261025-f8n-walk-rebase.mjs <baseline.json> <after.json>');
  process.exit(1);
}
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const after = JSON.parse(await readFile(afterPath, 'utf8'));

const show = (value) => (value === undefined ? 'absent' : JSON.stringify(value));
const refusals = [];
const refuse = (scenario, step, where, before, now) =>
  refusals.push(`DIFF ${scenario} / ${step} / ${where}: before=${show(before)} after=${show(now)}`);

// The same leaf walk as 10-walk.mjs's diffLeaves.
function diffLeaves(before, now, where, out) {
  const bothObjects = before && now && typeof before === 'object' && typeof now === 'object';
  if (bothObjects && Array.isArray(before) === Array.isArray(now)) {
    const keys = Array.isArray(before)
      ? Array.from({ length: Math.max(before.length, now.length) }, (_, i) => i)
      : [...new Set([...Object.keys(before), ...Object.keys(now)])];
    for (const key of keys) {
      const next = Array.isArray(before) ? `${where}[${key}]` : where === '' ? key : `${where}.${key}`;
      diffLeaves(before[key], now[key], next, out);
    }
    return;
  }
  if (JSON.stringify(before) !== JSON.stringify(now)) out.push([where, before, now]);
}

for (const key of ['walk', 'engine', 'width']) {
  if (baseline[key] !== after[key]) refuse('(file)', key, key, baseline[key], after[key]);
}

const repeats = (file, side) => {
  const seen = new Set();
  for (const scenario of file.scenarios) {
    if (seen.has(scenario.name)) refuse(scenario.name, '(duplicate)', `${side}: scenario ${scenario.name}`, undefined, undefined);
    seen.add(scenario.name);
    const steps = new Set();
    for (const step of scenario.steps) {
      if (steps.has(step.step)) refuse(scenario.name, '(duplicate)', `${side}: step ${step.step}`, undefined, undefined);
      steps.add(step.step);
    }
  }
};
repeats(baseline, 'baseline');
repeats(after, 'after');

const updates = [];
const names = [...new Set([...baseline.scenarios.map((s) => s.name), ...after.scenarios.map((s) => s.name)])];
for (const name of names) {
  const left = baseline.scenarios.find((s) => s.name === name);
  const right = after.scenarios.find((s) => s.name === name);
  if (!left || !right) {
    refuse(name, '(scenario)', '', left, right);
    continue;
  }
  const labels = [...new Set([...left.steps.map((s) => s.step), ...right.steps.map((s) => s.step)])];
  for (const label of labels) {
    const before = left.steps.find((s) => s.step === label);
    const now = right.steps.find((s) => s.step === label);
    if (!before || !now) {
      refuse(name, label, '', before, now);
      continue;
    }
    const found = [];
    diffLeaves(before, now, '', found);
    for (const [where, was, is] of found) {
      if (where === 'snapshot.textHash') updates.push({ name, label, step: before, is });
      else refuse(name, label, where, was, is);
    }
  }
}

if (refusals.length > 0) {
  for (const line of refusals) console.log(line);
  console.log(`REFUSED: ${refusals.length} leaf(s) other than snapshot.textHash differ or a scenario/step was added, removed or repeated; nothing written`);
  process.exit(1);
}

for (const { name, label, step, is } of updates) {
  step.snapshot.textHash = is;
  console.log(`UPDATED ${name} / ${label}`);
}
await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
console.log(`${updates.length} textHash leaves updated`);
