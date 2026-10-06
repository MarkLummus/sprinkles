// Sid, 2026-10-05 (decision 57): captures the built app's blocked save on a split and a single ingredient line for the blocked-row-sentence boards. It serves a COPY of app/dist (argv[2]; the quick that
// is editing IngredientTable.jsx may rebuild app/dist under a measurement) on a throwaway 127.0.0.1 port, so Mark's preview on :4173 is never touched and nothing is built.
//   node blocked-capture.mjs <dist copy>  -> blocked-capture.json  { "<state>_<W>": { html, facts } }   WebKit, coarse pointer, 1366 and 393; Olive Oil v1, Next version, "v2" typed in Version name.
// States a_* are the build's own markup after real clicks and fills (a focused field's own computed outline is inlined, since a clone cannot hold focus). States o_* are the same page after the browser's edit of the
// CLONE (never of the live page): the proposed sentence laid where the option puts it. Nothing here is a build.
import { writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(process.argv[2]);
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const CT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); let f = path.join(DIST, decodeURIComponent(u.pathname)); const ok = (p) => existsSync(p) && statSync(p).isFile();
  if (!path.extname(u.pathname) && !ok(f)) f = path.join(DIST, 'index.html');
  if (!ok(f) || !f.startsWith(DIST)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': CT[path.extname(f)] ?? 'application/octet-stream' }); res.end(await readFile(f));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const URL0 = `http://127.0.0.1:${srv.address().port}`;
const install = () => {
  window.__ov = (root, { overlay, label }) => {
    const inp = label ? root.querySelector(`input[aria-label="${label}"]`) : null; const tr = inp ? inp.closest('tr') : null;
    const ov = {
      none() {},
      row(text) { // the sentence in the blocked line's own name cell, last in the cell (after the portion line), in the face of the version line's sentence
        const nc = tr.querySelector('.ingredient-table__col-name'); const s = document.createElement('span'); s.className = 'field-error'; s.id = 'line-error'; s.textContent = text; nc.appendChild(s);
        inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', 'line-error');
      },
      ceremony(text) { root.querySelector('.notebook-ceremony .form-status').textContent = text; },
    };
    ov[overlay.name](...(overlay.args || []));
  };
};
const grab = ({ overlay, label }) => {
  const live = document.querySelector('.shell'); const root = live.cloneNode(true);
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  const act = document.activeElement;
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value);
    if (e === act) { const cs = getComputedStyle(e); c.setAttribute('style', `outline:${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor};outline-offset:${cs.outlineOffset}`); c.setAttribute('data-focus', ''); } });
  window.__ov(root, { overlay, label });
  return { html: root.outerHTML };
};
const rects = ({ label }) => {
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const table = document.querySelector('.ingredient-table'); const trs = [...table.querySelectorAll('tbody tr')];
  const inp = label ? document.querySelector(`input[aria-label="${label}"]`) : null; const tr = inp ? inp.closest('tr') : null;
  const i = tr ? trs.indexOf(tr) : -1;
  let head = null; for (let k = i; k >= 0; k--) if (trs[k].classList.contains('ingredient-table__step-head')) { head = trs[k]; break; }
  const lastRow = i >= 0 ? trs[Math.min(trs.length - 1, i + 2)] : null;
  const form = document.querySelector('.notebook-ceremony'); const fs = form.querySelector('.form-status');
  const cs = tr ? getComputedStyle(tr) : null; const nc = tr ? tr.querySelector('.ingredient-table__col-name') : null;
  return {
    table: R(table), head: R(head), row: R(tr), lastRow: R(lastRow), nameCell: R(nc), input: R(inp), form: R(form), formStatus: R(fs), formStatusText: T(fs),
    save: R([...document.querySelectorAll('.notebook-ceremony__actions button')].find((b) => /Save as a new version/.test(b.textContent))),
    scrollY: Math.round(scrollY), vh: innerHeight, docH: document.documentElement.scrollHeight,
    rowClass: tr ? tr.className : null, rowWeight: cs ? cs.fontWeight : null, rowOutline: cs ? cs.outlineWidth + ' ' + cs.outlineStyle : null, inputOutline: inp ? getComputedStyle(inp).outlineWidth : null,
    activeLabel: document.activeElement.getAttribute('aria-label'), active: !!(inp && document.activeElement === inp),
    sentences: [...document.querySelectorAll('.field-error')].map(T), pageStatus: T(document.querySelector('.page-status')), formStatusAll: T(fs), ariaInvalid: inp ? inp.getAttribute('aria-invalid') : null,
    rowsText: trs.slice(Math.max(0, i - 1), i + 3).map((t) => T(t).slice(0, 80)),
  };
};
const MSG = { whole2: 'Whole milk needs an amount, or remove it', cream: 'Heavy cream needs an amount, or remove it', nan: "Whole milk's amount is not a number" };
const FIELD = { whole2: 'Whole milk, grams, portion 2', cream: 'Heavy cream, grams', nan: 'Whole milk, grams, portion 2' };
const VAL = { whole2: '', cream: '', nan: '4o' };
const STATES = {};
for (const c of ['whole2', 'cream', 'nan']) { STATES[`a_${c}`] = { c, ov: { name: 'none' } }; STATES[`o_row_${c}`] = { c, ov: { name: 'row', args: [MSG[c]] } }; STATES[`o_cer_${c}`] = { c, ov: { name: 'ceremony', args: [MSG[c]] } }; }
STATES.a_ver = { c: null, ov: { name: 'none' } };
const out = {};
const b = await webkit.launch();
try {
  for (const W of [1366, 393]) for (const [key, st] of Object.entries(STATES)) {
    const H = W === 1366 ? 1024 : 800;
    const context = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
    await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await context.newPage(); page.setDefaultTimeout(10000);
    await page.goto(URL0 + V1, { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(300);
    await page.getByRole('button', { name: /next version/i }).first().click(); await page.waitForSelector('.ingredient-table.is-developing');
    const label = st.c ? FIELD[st.c] : null;
    if (st.c) { await page.getByLabel('Version name').fill('v2'); await page.getByLabel(label, { exact: true }).fill(VAL[st.c]); }
    await page.getByRole('button', { name: 'Save as a new version', exact: true }).click(); await page.waitForTimeout(500);
    await page.evaluate(() => document.fonts.ready); await page.evaluate(install);
    const landed = await page.evaluate(({ label }) => { const inp = label ? document.querySelector(`input[aria-label="${label}"]`) : null; return { scrollY: Math.round(scrollY), inp: inp ? +inp.getBoundingClientRect().y.toFixed(1) : null, save: +[...document.querySelectorAll('.notebook-ceremony__actions button')].find((x) => /Save as a new version/.test(x.textContent)).getBoundingClientRect().y.toFixed(1) }; }, { label });
    const g = await page.evaluate(grab, { overlay: st.ov, label });
    await page.evaluate(({ overlay, label }) => window.__ov(document, { overlay, label }), { overlay: st.ov, label }); // the same edit on the live page, so the crops see the grown row
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
    const facts = await page.evaluate(rects, { label }); facts.landed = landed;
    out[`${key}_${W}`] = { html: g.html, facts };
    await context.close();
  }
} finally { await b.close(); srv.close(); }
await writeFile(path.join(HERE, 'blocked-capture.json'), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), v.html.length, 'landed', JSON.stringify(v.facts.landed), 'row', v.facts.row && v.facts.row.h, 'form', v.facts.form.h, 'status', JSON.stringify(v.facts.formStatusText), 'sent', JSON.stringify(v.facts.sentences));
process.exit(0);
