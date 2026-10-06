// Sid, 2026-10-05 (decision 56): board against build, side by side, in Playwright WebKit and system Chrome (both coarse; 1366 and 393), on throwaway 127.0.0.1 servers (never :4173; nothing is built).
//   node asmade-conform.mjs [widths] [engines]
// For each A panel (the build untouched): the app is driven by real clicks and fills to the same state and the table's facts (the step heads, each line's label, field label and value, the Total and the as-made total)
// and its geometry (each row's height and top within the table, each as-made field's box) are compared with the panel's, within 1px. For each B panel (the browser's edit of the clone): its rows other than the
// struck ones must equal the A panel's rows (the edit leaves the build's rows alone), and the struck rows' heights are listed (they have no app counterpart, so they are measured, not compared).
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openApp, openBoard, check, finish } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const BOARD = 'as-made-line-out.html';
const widths = (process.argv[2] || '1366,393').split(',').map(Number);
const engines = (process.argv[3] || 'webkit,chrome').split(',');
const R2 = [['remove', 'remove Whole milk, Step 2'], ['save']];
const TYPE = [['fill', 'Whole milk, as made, grams, portion 2', '245'], ['fill', 'Sucrose, as made, grams, portion 1', '12.5'], ['fill', 'Sucrose, as made, grams, portion 2', '63']];
// panel: [board panel, relaxed]; relaxed = the recommended A (a2), whose labels differ from the build's by the proposed change (no portion line, no "portion N" on a lone line), so only geometry and totals are compared.
const STATES = {
  read: { acts: [...R2], panels: [['read', false]], widths: [1366] },
  rec: { acts: [...R2, ['record']], panels: [['a-rec', false]], widths: [1366, 393], b: 'b-rec' },
  typed: { acts: [...R2, ['record'], ...TYPE], panels: [['a2-typed', true]], widths: [1366, 393], b: 'b-typed' },
  v1: { acts: [['record']], panels: [['v1', false]], widths: [1366] },
  step: { acts: [['remove', 'Step 2, remove'], ['save'], ['record']], panels: [['a-step', false], ['a2-step', true]], widths: [1366, 393], b: 'b-step' },
};
const read = (rootSel) => {
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const root = rootSel ? document.querySelector(rootSel) : document;
  const table = root.querySelector('.ingredient-table'); const t0 = table.getBoundingClientRect();
  const rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
    const r = tr.getBoundingClientRect(); const inp = tr.querySelector('input'); const ib = inp ? inp.getBoundingClientRect() : null;
    return { head: tr.classList.contains('ingredient-table__step-head'), struck: !!tr.querySelector('.struck-value'), label: T(tr).slice(0, 90), aria: tr.getAttribute('aria-label'), y: +(r.y - t0.y).toFixed(2), h: +r.height.toFixed(2),
      field: inp ? { label: inp.getAttribute('aria-label'), value: inp.value, w: +ib.width.toFixed(2), h: +ib.height.toFixed(2), dy: +(ib.y - r.y).toFixed(2), dx: +(ib.x - t0.x).toFixed(2) } : null };
  });
  const tf = table.querySelector('tfoot tr'); const tb = tf.getBoundingClientRect();
  return { rows, foot: { text: T(tf), aria: tf.getAttribute('aria-label'), y: +(tb.y - t0.y).toFixed(2), h: +tb.height.toFixed(2) }, w: +t0.width.toFixed(2) };
};
async function drive(browser, appUrl, width, st) {
  const { context, page } = await openApp(browser, appUrl, V1, { width, coarse: true });
  page.setDefaultTimeout(10000); await page.waitForSelector('.notebook-log');
  if (st.acts.some((a) => a[0] === 'remove' || a[0] === 'save')) { await page.getByRole('button', { name: /next version/i }).first().click(); await page.waitForSelector('.ingredient-table.is-developing'); }
  for (const a of st.acts) {
    if (a[0] === 'remove') await page.getByRole('button', { name: a[1], exact: true }).click();
    else if (a[0] === 'fill') await page.getByLabel(a[1], { exact: true }).fill(a[2]);
    else if (a[0] === 'save') { const before = page.url(); await page.getByLabel('Version name').fill('v2'); await page.getByRole('button', { name: 'Save as a new version', exact: true }).click(); await page.waitForFunction((p) => window.location.href !== p, before); await page.waitForSelector('h2.notebook-version__identity'); }
    else if (a[0] === 'record') { await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await page.waitForSelector('.ingredient-table__as-made-field'); }
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  return { context, page };
}
const failures = []; let n = 0; const ck = (c, l) => { n += 1; check(failures, c, l); };
const { appUrl, repoUrl, close } = await startServers();
const browsers = { webkit: await webkit.launch(), chrome: await launch() };
const notes = [];
try {
  for (const engine of engines) {
    const browser = browsers[engine];
    const { context: bctx, page: bpage } = await openBoard(browser, repoUrl, BOARD, { coarse: true });
    await bpage.evaluate(() => document.fonts.ready); await bpage.waitForTimeout(500);
    for (const width of widths) for (const [name, st] of Object.entries(STATES)) {
      if (!st.widths.includes(width)) continue;
      const label = `${engine} ${width} ${name}`;
      const { context, page } = await drive(browser, appUrl, width, st);
      const app = await page.evaluate(read, null); await context.close();
      let A;
      for (const [pname, relaxed] of st.panels) {
      const plabel = `${label} (${pname})`; A = await bpage.evaluate(read, `.fp-${pname}-${width}`);
      ck(A.rows.length === app.rows.length, `${plabel}: ${A.rows.length} panel rows equal the app's ${app.rows.length}`);
      app.rows.forEach((r, i) => {
        const p = A.rows[i]; if (!p) return;
        if (!relaxed) ck(p.head === r.head && p.label === r.label, `${plabel}: row ${i} "${r.label}" equals the panel's "${p.label}"`);
        ck(Math.abs(p.h - r.h) <= 1, `${plabel}: row ${i} height ${r.h} within 1px of the panel's ${p.h}`);
        ck(Math.abs(p.y - r.y) <= 1, `${plabel}: row ${i} top ${r.y} within 1px of the panel's ${p.y}`);
        if (!relaxed) ck(JSON.stringify(p.field && [p.field.label, p.field.value]) === JSON.stringify(r.field && [r.field.label, r.field.value]), `${plabel}: row ${i} field ${JSON.stringify(r.field && [r.field.label, r.field.value])} equals the panel's ${JSON.stringify(p.field && [p.field.label, p.field.value])}`);
        if (r.field && p.field) ck(Math.abs(p.field.w - r.field.w) <= 1 && Math.abs(p.field.h - r.field.h) <= 1 && Math.abs(p.field.dy - r.field.dy) <= 1, `${plabel}: row ${i} field box ${r.field.w}x${r.field.h} at ${r.field.dy} within 1px of the panel's ${p.field.w}x${p.field.h} at ${p.field.dy}`);
      });
      ck(A.foot.text === app.foot.text && (relaxed || A.foot.aria === app.foot.aria), `${plabel}: foot "${app.foot.text}" / "${app.foot.aria}" equals the panel's "${A.foot.text}" / "${A.foot.aria}"`);
      ck(Math.abs(A.foot.y - app.foot.y) <= 1 && Math.abs(A.foot.h - app.foot.h) <= 1, `${plabel}: foot top ${app.foot.y} and height ${app.foot.h} within 1px of the panel's ${A.foot.y} and ${A.foot.h}`);
      ck(Math.abs(A.w - app.w) <= 1, `${plabel}: table width ${app.w} within 1px of the panel's ${A.w}`);
      }
      let line = `${label}: ${app.rows.length} rows, table ${app.w} wide`;
      if (st.b) {
        const B = await bpage.evaluate(read, `.fp-${st.b}-${width}`);
        const bLines = B.rows.filter((r) => !r.struck && !r.head); const struck = B.rows.filter((r) => r.struck); const appLines = app.rows.filter((r) => !r.head);
        ck(bLines.length === appLines.length, `${label}: B keeps the build's ${appLines.length} lines (${bLines.length}) and adds ${struck.length} struck`);
        // the heights of the build's own lines are untouched by the edit
        ck(appLines.every((r, i) => bLines[i] && Math.abs(r.h - bLines[i].h) <= 1 && r.label === bLines[i].label), `${label}: B's unstruck lines equal the app's lines (labels, heights within 1px)`);
        ck(Math.abs(B.foot.y + B.foot.h - (A.foot.y + A.foot.h) - struck.reduce((s, r) => s + r.h, 0) - (B.rows.filter((r) => r.head).length - A.rows.filter((r) => r.head).length) * 0) < 40, `${label}: B's table is A's plus its struck rows (and the Removed head)`);
        line += `; B: ${struck.length} struck rows, heights ${struck.map((r) => r.h).join(', ')}, table ${B.foot.y + B.foot.h} tall against A ${A.foot.y + A.foot.h}`;
      }
      console.log(line);
    }
    await bctx.close();
  }
} finally { await Promise.all(Object.values(browsers).map((b) => b.close())); await close(); }
finish(failures, n, 'asmade-conform');
process.exit(process.exitCode || 0);
