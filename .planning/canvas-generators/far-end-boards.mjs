// Sid, 2026-10-04 (decision 34): the same gaps measured on the boards (the authority), panel by panel. node far-end-boards.mjs -> far-end-boards.json
import { readFileSync } from 'node:fs'; import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(HERE + '/far-end-probe.mjs', 'utf8'); const a = src.indexOf('const collect = () => {'); const b = src.indexOf('};\nconst servers', a);
const body = src.slice(a + 'const collect = () => {'.length, b).replace(/document\.querySelector/g, 'ROOT.querySelector');
const FILES = (process.env.F || '393-batch,723-batch,744-batch,834-batch,983-batch,984-batch,1024-batch,1366-batch,1600-batch,1920-batch').split(',');
const br = await webkit.launch(); const res = [];
for (const f of FILES) {
  const ctx = await br.newContext({ viewport: { width: 4200, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
  await p.goto(`file://${HERE}/../sketches/011-recipe-route-c/${f}.html`); await p.waitForTimeout(400);
  const panels = await p.evaluate(`(() => { const out = []; const roots = [...document.querySelectorAll('.fp-win')]; const list = roots.length ? roots : [document.querySelector('.shell').parentElement]; for (const ROOT of list) { const t = (ROOT.closest('div[style*="position:absolute"]') || ROOT.parentElement).querySelector('.fp-title'); out.push({ title: t ? t.textContent : '', items: (() => {${body}})() }); } return out; })()`);
  for (const pn of panels) res.push({ file: f, title: pn.title, items: pn.items });
  await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, 'far-end-boards.json'), JSON.stringify(res, null, 1));
for (const r of res) for (const i of r.items) if (/History|Go to batch|Batch log head|Tasting|Balance \(|Fold row: Version/.test(i.kase)) console.log(r.file, '|', r.title.slice(0, 28), '|', i.kase, '|', i.rightText, '| gap', i.gap ?? (i.stacked ? 'stacked' : '-'), 'row', i.rowW);
process.exit(0);
