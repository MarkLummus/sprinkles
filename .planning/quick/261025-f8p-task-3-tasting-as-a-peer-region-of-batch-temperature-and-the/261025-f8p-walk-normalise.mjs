// Quick 261025-f8p: rewrite the strict walk baseline's three old label prefixes so the walk's own compare can
// prove that only snapshot.textHash leaves differ after the labels change (decide-p10-churn-trio; "Temperature",
// "Duration", "Churned").
//
//   node 261025-f8p-walk-normalise.mjs <baseline.json> <out.json>
//
// In every step's snapshot it rewrites a leading old word, case-sensitive and at the start of the string only, in
// fields[i][0] (a field's name: its aria-label, else its wrapping label's words), invalid[i], focus.ariaLabel and
// focus.text, by the three pairs below, writes <out.json> in 10-walk.mjs's own format and prints how many leaves it
// rewrote per step. It reads nothing but those four leaf kinds; the output is a comparison copy, never the baseline.
import { readFile, writeFile } from 'node:fs/promises';

const [inPath, outPath] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.log('usage: node 261025-f8p-walk-normalise.mjs <baseline.json> <out.json>');
  process.exit(1);
}
const PAIRS = [
  ['Churn date', 'Churned'],
  ['Churn duration', 'Duration'],
  ['Tasting temperature', 'Temperature'],
];
const data = JSON.parse(await readFile(inPath, 'utf8'));

const rewrite = (text) => {
  if (typeof text !== 'string') return text;
  for (const [was, now] of PAIRS) if (text.startsWith(was)) return now + text.slice(was.length);
  return text;
};

let total = 0;
for (const scenario of data.scenarios) {
  for (const step of scenario.steps) {
    const snap = step.snapshot;
    let count = 0;
    const touch = (before, after) => {
      if (before !== after) count += 1;
      return after;
    };
    snap.fields = snap.fields.map((field) => [touch(field[0], rewrite(field[0])), ...field.slice(1)]);
    snap.invalid = snap.invalid.map((label) => touch(label, rewrite(label)));
    if (snap.focus) {
      snap.focus.ariaLabel = touch(snap.focus.ariaLabel, rewrite(snap.focus.ariaLabel));
      snap.focus.text = touch(snap.focus.text, rewrite(snap.focus.text));
    }
    if (count > 0) console.log(`REWROTE ${count} ${scenario.name} / ${step.step}`);
    total += count;
  }
}
await writeFile(outPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`${total} leaves rewritten`);
