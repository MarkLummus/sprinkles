// Sid, 2026-10-05 (decision 51): captures the built app's shell for the shared-ingredient (per step) boards, from the preview already on 127.0.0.1:4173 (no server is started, nothing is built).
//   node perstep-capture.mjs   -> perstep-capture.json  { "<state>_<W>": { html, facts } }   WebKit, coarse pointer, 1366 and 393; Olive Oil v1 (Whole milk and Sucrose are split across Step 2 and Step 3).
// States marked b_* and rest are the build's own markup, untouched. States marked z_*, c_* and p_* are the build's markup after the browser's own edit of the clone (never of the live page): a per-step line
// removal is drawn by setting that line's grams to 0 in the real app (the app computes the totals and shares that a removed line gives) and then laying the removed look on that one line (the struck name,
// the struck amount, the word restore, only the struck share), exactly what the build draws on a removed row. The notes ("120 g of 370.4 g . 46.3% in all") are re-derived from the lines still in (the build's pen
// reads the opening total there; finding in decision 51). Every overlay is in the `ov` function below.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URLV1 = 'http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const grab = ({ overlay }) => {
  const live = document.querySelector('.shell'); const root = live.cloneNode(true);
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const pct = (g, m) => { const s = (100 * g) / m; return s < 0.05 ? 'trace' : s.toFixed(1) + '%'; };
  const BASE = { 'Whole milk': [120, 250.4], Sucrose: [12, 64] }; const PM = 799.7; const NAMES = ['Whole milk', 'Sucrose'];
  const tbody = root.querySelector('.ingredient-table tbody'); const trs = () => [...tbody.querySelectorAll('tr')];
  const groups = () => { const gs = []; for (const tr of trs()) { if (tr.classList.contains('ingredient-table__step-head')) gs.push({ head: tr, label: T(tr), lines: [] }); else gs[gs.length - 1].lines.push(tr); } return gs; };
  const nameOf = (tr) => { const c = tr.querySelector('.ingredient-table__col-name'); return c ? [...c.childNodes].filter((n) => n.nodeType === 3 || (n.nodeType === 1 && n.classList.contains('struck-value'))).map((n) => n.textContent).join('').trim() : ''; };
  const line = (name, n) => { const g = groups().find((x) => x.label.startsWith(n === 0 ? 'Unallocated' : 'Step ' + n) || (n === 0 && x.label.startsWith('Removed'))); return g.lines.find((t) => nameOf(t) === name); };
  const lineByIdx = (name, k) => trs().filter((t) => !t.classList.contains('ingredient-table__step-head') && nameOf(t) === name)[k];
  const massNow = () => { const sp = root.querySelector('tfoot .ingredient-table__plan-grams'); const last = [...sp.childNodes].filter((n) => n.nodeType === 3).pop(); return parseFloat(last.textContent); };
  const fieldOf = (tr) => { const i = tr.querySelector('input'); return i ? parseFloat(i.getAttribute('value')) : NaN; };
  const shareTd = (tr) => [...tr.querySelectorAll('.ingredient-table__col-numeric')].pop();
  const setShare = (tr, struck, cur) => { const td = shareTd(tr); td.innerHTML = (struck ? '<span class="struck-value">' + struck + '</span>' : '') + (cur || ''); };
  const strikeName = (tr) => { const c = tr.querySelector('.ingredient-table__col-name'); const tn = [...c.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (tn) { const s = document.createElement('span'); s.className = 'struck-value'; s.textContent = tn.textContent; c.replaceChild(s, tn); } };
  const setNote = (tr, txt) => { const n = tr.querySelector('.ingredient-table__portion-note'); if (n) n.textContent = txt; };
  const dropLink = (tr) => { const c = tr.querySelector('.ingredient-table__col-name'); c.querySelectorAll('.ingredient-table__remove-gap, button').forEach((e) => e.remove()); };
  // the removed look on one line: the struck name, the amount struck above the (restored) field, the word restore (or no control, when the line goes with its step), only the struck share
  const removedLook = (tr, g, shareStruck, { link = true, name, stepN } = {}) => {
    strikeName(tr); const inp = tr.querySelector('input'); inp.setAttribute('value', String(g));
    const gc = tr.querySelector('.ingredient-table__col-grams'); if (!gc.querySelector('.struck-value')) gc.insertAdjacentHTML('afterbegin', '<span class="struck-value">' + g + ' g</span>'); else gc.querySelector('.struck-value').textContent = g + ' g';
    if (link) { const b = tr.querySelector('.ingredient-table__col-name button'); if (b) { b.textContent = 'restore'; b.setAttribute('aria-label', 'restore ' + name + ', Step ' + stepN); } } else dropLink(tr);
    setShare(tr, shareStruck, ''); tr.setAttribute('aria-label', (tr.getAttribute('aria-label') || '') + ', removed');
  };
  // every split ingredient's notes from its lines still in: "<line> g of <lines still in> . <share of the batch> in all"; a removed line reads the batch the pen opened on
  const renote = (removedIdx = {}) => {
    const m = massNow();
    for (const nm of NAMES) { const ls = trs().filter((t) => !t.classList.contains('ingredient-table__step-head') && nameOf(t) === nm); if (ls.length < 2) continue;
      const act = ls.map((t, k) => ({ t, k, g: fieldOf(t), out: !!t.querySelector('.ingredient-table__col-name .struck-value') || !!removedIdx[nm + k] }));
      const sum = act.filter((a) => !a.out).reduce((s, a) => s + a.g, 0);
      for (const a of act) { if (a.out) setNote(a.t, BASE[nm][a.k] + ' g of ' + (BASE[nm][0] + BASE[nm][1]).toFixed(1) + ' g · ' + pct(BASE[nm][0] + BASE[nm][1], PM) + ' in all'); else setNote(a.t, a.g + ' g of ' + sum.toFixed(1) + ' g · ' + pct(sum, m) + ' in all'); } }
  };
  const ov = {
    none() {},
    line(k) { const nm = 'Whole milk'; const tr = lineByIdx(nm, k); removedLook(tr, BASE[nm][k], pct(BASE[nm][k], PM), { name: nm, stepN: k === 0 ? 2 : 3 }); renote(); },
    edit() { renote(); },
    regroup(strike) {
      const gs = groups(); const un = gs.find((g) => g.label.startsWith('Unallocated')); const firstNumbered = gs[0];
      un.head.querySelector('td').innerHTML = 'Removed<span class="ingredient-table__step-head-lead">Gum slurry — the only high-heat step</span>';
      const frag = [un.head, ...un.lines]; for (const e of frag) tbody.insertBefore(e, firstNumbered.head);
      if (strike) { const orig = { 'Whole milk': 120, Sucrose: 12, 'Locust bean gum': 1.04, 'Guar gum': 0.48, 'Lambda carrageenan': 0.16 };
        for (const tr of un.lines) { const nm = nameOf(tr); removedLook(tr, orig[nm], pct(orig[nm], PM), { link: false }); tr.querySelectorAll('p.ingredient-table__flag').forEach((e) => e.remove()); }
        renote({ 'Whole milk0': true, Sucrose0: true }); }
    },
    showEdit() { // per step Show changes after Whole milk Step 2 120 -> 100: the changed line carries its struck amount and struck share, as a one-line row does
      const m = massNow(); const nm = 'Whole milk'; const l2 = lineByIdx(nm, 0), l3 = lineByIdx(nm, 1);
      l2.querySelector('.ingredient-table__col-grams').innerHTML = '<span class="ingredient-table__plan-grams"><span class="struck-value">120 g</span>100 g</span>';
      for (const [t, g0, g1] of [[l2, 120, 100], [l3, 250.4, 250.4]]) { const a = pct(g0, PM), b = pct(g1, m); setShare(t, a !== b ? a : '', b); }
      for (const [t, g0] of [[lineByIdx('Sucrose', 0), 12], [lineByIdx('Sucrose', 1), 64]]) { const g1 = g0; const a = pct(g0, PM), b = pct(g1, m); setShare(t, a !== b ? a : '', b); }
    },
    showRm() { // per step Show changes after Whole milk's Step 2 line is removed
      const m = massNow(); const nm = 'Whole milk'; const l2 = lineByIdx(nm, 0), l3 = lineByIdx(nm, 1);
      strikeName(l2); l2.querySelector('.ingredient-table__col-grams').innerHTML = '<span class="ingredient-table__plan-grams"><span class="struck-value">120 g</span></span>'; setShare(l2, pct(120, PM), '');
      { const a = pct(250.4, PM), b = pct(250.4, m); setShare(l3, a !== b ? a : '', b); }
      for (const [t, g0] of [[lineByIdx('Sucrose', 0), 12], [lineByIdx('Sucrose', 1), 64]]) { const a = pct(g0, PM), b = pct(g0, m); setShare(t, a !== b ? a : '', b); }
      setNote(l2, '120 g of 370.4 g · ' + pct(370.4, PM) + ' in all'); setNote(l3, '250.4 g of 250.4 g · ' + pct(250.4, m) + ' in all');
    },
  };
  ov[overlay.name](...(overlay.args || []));
  const facts = { total: T(root.querySelector('tfoot .ingredient-table__plan-grams')), lines: trs().filter((t) => !t.classList.contains('ingredient-table__step-head') && t.querySelector('.ingredient-table__portion-note')).map((t) => ({ name: nameOf(t), struck: !!t.querySelector('.ingredient-table__col-name .struck-value'), grams: t.querySelector('input') ? t.querySelector('input').getAttribute('value') : T(t.querySelector('.ingredient-table__col-grams')), gramsStruck: T(t.querySelector('.ingredient-table__col-grams .struck-value')), note: T(t.querySelector('.ingredient-table__portion-note')), share: T(shareTd(t)), link: T(t.querySelector('.ingredient-table__col-name button')) })),
    heads: groups().map((g) => g.label), n: trs().filter((t) => !t.classList.contains('ingredient-table__step-head')).length };
  return { html: root.outerHTML, facts };
};
const STEP2 = ['Whole milk, grams, portion 1', 'Sucrose, grams, portion 1', 'Locust bean gum, grams', 'Guar gum, grams', 'Lambda carrageenan, grams'];
const STATES = {
  rest: { ov: { name: 'none' } },
  b_wm2: { acts: [['click', 'remove Whole milk, Step 2']], ov: { name: 'none' } },
  z_wm2: { acts: [['fill', 'Whole milk, grams, portion 1', '0']], ov: { name: 'line', args: [0] } },
  z_wm3: { acts: [['fill', 'Whole milk, grams, portion 2', '0']], ov: { name: 'line', args: [1] } },
  b_step2: { acts: [['click', 'Step 2, remove']], ov: { name: 'none' } },
  c_step2: { acts: [['click', 'Step 2, remove']], ov: { name: 'regroup', args: [false] } },
  z_step2: { acts: [...STEP2.map((l) => ['fill', l, '0']), ['click', 'Step 2, remove']], ov: { name: 'regroup', args: [true] } },
  b_edit: { acts: [['fill', 'Whole milk, grams, portion 1', '100']], ov: { name: 'none' } },
  p_edit: { acts: [['fill', 'Whole milk, grams, portion 1', '100']], ov: { name: 'edit' } },
  b_show_edit: { acts: [['fill', 'Whole milk, grams, portion 1', '100'], ['save']], ov: { name: 'none' } },
  p_show_edit: { acts: [['fill', 'Whole milk, grams, portion 1', '100'], ['save']], ov: { name: 'showEdit' } },
  b_show_rm: { acts: [['click', 'remove Whole milk, Step 2'], ['save']], ov: { name: 'none' } },
  p_show_rm: { acts: [['fill', 'Whole milk, grams, portion 1', '0'], ['save']], ov: { name: 'showRm' } },
};
const out = {}; const b = await webkit.launch();
for (const W of [1366, 393]) for (const [key, st] of Object.entries(STATES)) {
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(URLV1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /next version/i }).first().click(); await p.waitForTimeout(500);
  for (const a of st.acts || []) {
    if (a[0] === 'click') await p.getByRole('button', { name: a[1], exact: true }).click();
    else if (a[0] === 'fill') await p.getByLabel(a[1], { exact: true }).fill(a[2]);
    else if (a[0] === 'save') {
      await p.getByLabel('Why').fill('test'); await p.getByLabel('Version name').fill('v2'); await p.getByRole('button', { name: 'Save as a new version', exact: true }).click(); await p.waitForTimeout(900);
      await p.getByRole('button', { name: /^Show changes$/ }).first().click();
    }
    await p.waitForTimeout(250);
  }
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
  out[`${key}_${W}`] = await p.evaluate(grab, { overlay: st.ov });
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'perstep-capture.json'), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), v.html.length, 'total', v.facts.total, '|', v.facts.heads.join(' / ').slice(0, 120));
process.exit(0);
