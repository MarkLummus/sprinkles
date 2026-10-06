// Sid, 2026-10-05 (decision 56): captures the built app's shell for the as-made-with-a-line-out boards. It serves app/dist itself on a throwaway 127.0.0.1 port (the 03.5 probe harness's startServers),
// so Mark's preview on :4173 is never touched and nothing is built.
//   node asmade-capture.mjs   -> asmade-capture.json  { "<state>_<W>": { html, facts } }   WebKit, coarse pointer, 1366 and 393; Olive Oil v1 (Whole milk and Sucrose are split across Step 2 and Step 3).
// States marked a_* are the build's own markup, untouched (real clicks and fills: Next version, remove the line, save as v2, Record a batch, type). States marked b_* are the same page after the browser's edit of the
// CLONE (never of the live page): option B's struck row is laid on the table (the build's removed look: struck name, struck amount, no share; the as-made field is the build's own field markup). Nothing here is a
// build; the one figure the app does not compute (the as-made total with a typed amount on the struck line) is the build's own rule applied by hand and is named as such in asmade.py's caption.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, openApp } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const grab = ({ overlay }) => {
  const live = document.querySelector('.shell'); const root = live.cloneNode(true);
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const tbody = root.querySelector('.ingredient-table tbody');
  const trs = () => [...tbody.querySelectorAll('tr')];
  const isHead = (t) => t.classList.contains('ingredient-table__step-head');
  // option B's struck row: the build's removed look (struck name, struck amount, no share) over the build's own as-made field
  const struckRow = ({ name, estimated, g, label, value }) => {
    const tr = document.createElement('tr'); tr.setAttribute('aria-label', name + ', ' + g + ' g' + (estimated ? ', estimated' : '') + ', removed');
    tr.innerHTML = '<td class="ingredient-table__col-grams"><span class="ingredient-table__plan-grams"><span class="struck-value">' + g + ' g</span></span></td>'
      + '<td class="ingredient-table__col-name"><span class="struck-value">' + name + '</span>' + (estimated ? '<span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span>' : '') + '</td>'
      + '<td class="ingredient-table__col-numeric"><input inputmode="decimal" class="ink-field ingredient-table__as-made-field" aria-label="' + label + '" type="text" value="' + (value || '') + '"></td>'
      + '<td class="ingredient-table__col-numeric"></td>';
    return tr;
  };
  const setFootTotal = (txt) => { const c = root.querySelector('tfoot .ingredient-table__live-total'); c.innerHTML = '<span class="sheet-hand">' + txt + '</span>'; root.querySelector('tfoot tr').setAttribute('aria-label', root.querySelector('tfoot tr').getAttribute('aria-label').replace(/, as made .*$/, '') + ', as made ' + txt.replace(' g', ' grams')); };
  const ov = {
    none() {},
    dropnotes() { // A recommended: every ingredient drawn on one line only reads like a one-line row (no portion line, no "portion N" in its field's name)
      const nameOf = (tr) => { const c = tr.querySelector('.ingredient-table__col-name'); return c ? c.firstChild.textContent.trim() : ''; };
      const lines = trs().filter((t) => !isHead(t) && t.querySelector('.ingredient-table__portion-note'));
      for (const tr of lines) if (lines.filter((t) => nameOf(t) === nameOf(tr)).length === 1) {
        tr.querySelector('.ingredient-table__portion-note').remove();
        const inp = tr.querySelector('input'); if (inp) inp.setAttribute('aria-label', inp.getAttribute('aria-label').replace(/, portion \d+$/, ''));
      }
    },
    wm2(typed) { // B: Whole milk's Step 2 line stays under Step 2, struck, with its own as-made field
      const first = trs().find((t) => !isHead(t));
      tbody.insertBefore(struckRow({ name: 'Whole milk', estimated: true, g: 120, label: 'Whole milk, as made, grams, portion 1', value: typed ? '120' : '' }), first);
      if (typed) setFootTotal('793.8 g');
    },
    step2() { // B: the removed step's five lines stay under a Removed head, struck, each with its own as-made field
      const first = trs()[0]; const head = document.createElement('tr'); head.className = 'ingredient-table__step-head';
      head.innerHTML = '<td colspan="4">Removed<span class="ingredient-table__step-head-lead">Gum slurry — the only high-heat step</span></td>';
      tbody.insertBefore(head, first);
      const rows = [['Whole milk', true, 120, 'Whole milk, as made, grams, portion 1'], ['Sucrose', false, 12, 'Sucrose, as made, grams, portion 1'], ['Locust bean gum', false, 1.04, 'Locust bean gum, as made, grams'], ['Guar gum', false, 0.48, 'Guar gum, as made, grams'], ['Lambda carrageenan', false, 0.16, 'Lambda carrageenan, as made, grams']];
      for (const [name, estimated, g, label] of rows) tbody.insertBefore(struckRow({ name, estimated, g, label }), first);
    },
  };
  ov[overlay.name](...(overlay.args || []));
  const rowsOf = trs();
  const facts = {
    total: T(root.querySelector('tfoot .ingredient-table__plan-grams')), footAria: root.querySelector('tfoot tr').getAttribute('aria-label'), footAsMade: T(root.querySelector('tfoot .ingredient-table__live-total')),
    heads: rowsOf.filter(isHead).map((t) => T(t)),
    n: rowsOf.filter((t) => !isHead(t)).length,
    fields: [...root.querySelectorAll('.ingredient-table input')].map((i) => ({ label: i.getAttribute('aria-label'), value: i.getAttribute('value') })),
  };
  return { html: root.outerHTML, facts };
};
const STATES = {
  a_read: { acts: [['remove', 'remove Whole milk, Step 2'], ['save']], ov: { name: 'none' } },
  a_rec: { acts: [['remove', 'remove Whole milk, Step 2'], ['save'], ['record']], ov: { name: 'none' } },
  a2_typed: { acts: [['remove', 'remove Whole milk, Step 2'], ['save'], ['record'], ['fill', 'Whole milk, as made, grams, portion 2', '245'], ['fill', 'Sucrose, as made, grams, portion 1', '12.5'], ['fill', 'Sucrose, as made, grams, portion 2', '63']], ov: { name: 'dropnotes' } },
  a_v1: { acts: [['record']], ov: { name: 'none' } },
  a_rec_step2: { acts: [['remove', 'Step 2, remove'], ['save'], ['record']], ov: { name: 'none' } },
  a2_rec_step2: { acts: [['remove', 'Step 2, remove'], ['save'], ['record']], ov: { name: 'dropnotes' } },
  b_rec: { acts: [['remove', 'remove Whole milk, Step 2'], ['save'], ['record']], ov: { name: 'wm2', args: [false] } },
  b_typed: { acts: [['remove', 'remove Whole milk, Step 2'], ['save'], ['record'], ['fill', 'Whole milk, as made, grams, portion 2', '245'], ['fill', 'Sucrose, as made, grams, portion 1', '12.5'], ['fill', 'Sucrose, as made, grams, portion 2', '63']], ov: { name: 'wm2', args: [true] } },
  b_rec_step2: { acts: [['remove', 'Step 2, remove'], ['save'], ['record']], ov: { name: 'step2' } },
};
const out = {};
const { appUrl, close } = await startServers();
const b = await webkit.launch();
try {
  for (const W of [1366, 393]) for (const [key, st] of Object.entries(STATES)) {
    const { context, page } = await openApp(b, appUrl, V1, { width: W, height: 1000, coarse: true });
    page.setDefaultTimeout(10000);
    await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300);
    const needsPen = st.acts.some((a) => a[0] === 'remove' || a[0] === 'save');
    if (needsPen) { await page.getByRole('button', { name: /next version/i }).first().click(); await page.waitForSelector('.ingredient-table.is-developing'); }
    for (const a of st.acts) {
      if (a[0] === 'remove') await page.getByRole('button', { name: a[1], exact: true }).click();
      else if (a[0] === 'fill') await page.getByLabel(a[1], { exact: true }).fill(a[2]);
      else if (a[0] === 'save') {
        const before = page.url();
        await page.getByLabel('Version name').fill('v2');
        await page.getByRole('button', { name: 'Save as a new version', exact: true }).click();
        await page.waitForFunction((p) => window.location.href !== p, before); await page.waitForSelector('h2.notebook-version__identity');
      } else if (a[0] === 'record') {
        await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await page.waitForSelector('.ingredient-table__as-made-field');
      }
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
    out[`${key}_${W}`] = await page.evaluate(grab, { overlay: st.ov });
    await context.close();
  }
} finally { await b.close(); await close(); }
await writeFile(path.join(HERE, 'asmade-capture.json'), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), v.html.length, 'total', v.facts.total, '| as made', v.facts.footAsMade, '| fields', v.facts.fields.length, '|', v.facts.heads.join(' / ').slice(0, 130));
process.exit(0);
