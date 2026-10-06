// Sid, 2026-10-05 (decision 58): the page-side helpers and the recording flow the tasting-groups capture and conformance scripts share.
// the page-side helpers, installed once per page
export const install = () => {
  const CORE = ['Hardness', 'Scoopability', 'Smoothness', 'Sweetness'];
  const DECL_DEF = ['Bitter'];   // the pen's This recipe only chips for Olive Oil v1
  const CUE = 'font-size:var(--app-size-meta);font-weight:600;text-transform:none;letter-spacing:0;line-height:var(--app-notebook-pen-cue-line-h);color:var(--app-text)';   // decision 40 C's cue face, the build's own tokens
  window.__orig = null;
  window.__restore = () => { const s = document.querySelector('.tasting-reading'); if (window.__orig === null) window.__orig = s.outerHTML; else { const t = document.createElement('div'); t.innerHTML = window.__orig; s.replaceWith(t.firstElementChild); } };
  window.__ov = (name) => {
    const sec = document.querySelector('.tasting-reading'); if (name === 'none') return;
    const groups = [...sec.querySelectorAll('.tasting-reading__group')]; const byHead = (t) => groups.find((g) => g.querySelector('.batch-row__group-label')?.textContent === t);
    const obs = byHead('Observations'), prob = byHead('Problems'), melt = byHead('Melt');
    const mk = (title, cells) => { const g = document.createElement('div'); g.className = 'tasting-reading__group'; const h = document.createElement('h4'); h.className = 'batch-row__group-label'; h.textContent = title; const c = document.createElement('div'); c.className = 'batch-row__cells tasting-reading__axes'; cells.forEach((x) => c.appendChild(x)); g.append(h, c); return g; };
    if (obs) {
      const cells = [...obs.querySelectorAll('.batch-row__cell')]; const core = cells.filter((c) => CORE.includes(c.querySelector('.batch-row__cell-label').textContent)); const decl = cells.filter((c) => !core.includes(c));
      const frag = []; if (core.length) frag.push(mk('Every recipe', core)); if (decl.length) frag.push(mk('This recipe only', decl));
      obs.replaceWith(...frag);
    }
    if (prob) {   // 2026-10-06 (Mark's note): Any problems? keeps the built Problems face (the face Next time has) and the failures split into Every recipe / This recipe only, as the pen's problems do
      prob.querySelector('.batch-row__group-label').textContent = 'Any problems?';
      const span = prob.querySelector('.tasting-reading__problems'); const words = span.textContent.split(' · ');
      const sub = (title, ws) => { const d = document.createElement('div'); d.className = 'tasting-reading__subgroup'; const h = document.createElement('h5'); h.className = 'batch-row__group-label'; h.textContent = title; const w = span.cloneNode(false); w.textContent = ws.join(' · '); w.style.marginTop = '0'; d.append(h, w); return d; };   // the words sit under their name as cells sit under theirs (the label's own margin), and a second block stands a group gap (--gap-l) below the first, as the marks' groups do
      const decl = words.filter((w) => DECL_DEF.includes(w)), core = words.filter((w) => !DECL_DEF.includes(w)); span.remove();
      if (core.length) prob.appendChild(sub('Every recipe', core)); if (decl.length) { const d2 = sub('This recipe only', decl); if (core.length) d2.style.marginTop = 'var(--gap-l)'; prob.appendChild(d2); }
    }
    if (melt && name === 'A') melt.querySelector('.batch-row__group-label').remove();
    if (melt && (name === 'B' || name === 'B2')) { const top = sec.querySelector('.tasting-reading__conditions'); [...melt.querySelectorAll('.batch-row__cell')].forEach((c) => top.appendChild(c)); melt.remove(); }
    if (name === 'B2') sec.querySelectorAll('.tasting-reading__group > .batch-row__group-label:not(:only-child), .tasting-reading__subgroup > .batch-row__group-label').forEach((h) => { if (h.textContent !== 'Any problems?') h.setAttribute('style', CUE); });
  };
};
export const grab = () => {
  const live = document.querySelector('.shell'); const root = live.cloneNode(true);
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  return root.outerHTML;
};
export const rects = (kind) => {
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const f = { scrollY: Math.round(scrollY) };
  if (kind === 'read') {
    const sec = document.querySelector('.tasting-reading'); const concl = sec.parentElement.querySelector('.batch-row__conclusion') || [...document.querySelectorAll('.batch-row__conclusion')].pop();
    f.section = R(sec); f.conclusion = R(concl);
    f.groups = [...sec.querySelectorAll('.tasting-reading__group')].map((g) => ({ head: T(g.querySelector('.batch-row__group-label')), cells: [...g.querySelectorAll('.batch-row__cell-label')].map(T), ...R(g) }));
    f.conditions = [...sec.querySelectorAll('.tasting-reading__conditions .batch-row__cell-label')].map(T);
    const h = sec.querySelector('.batch-row__group-label'); if (h) { const cs = getComputedStyle(h); f.headFace = `${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.textTransform} ${cs.color}`; const cl = sec.querySelector('.batch-row__cell-label'); const c2 = getComputedStyle(cl); f.cellLabelFace = `${c2.fontSize}/${c2.lineHeight} ${c2.fontWeight} ${c2.textTransform} ${c2.color}`; }
    f.problems = T(sec.querySelector('.tasting-reading__problems')); f.text = T(sec);
  } else {
    const cue = document.querySelector('.notebook-log .axes-cue'); const melt = document.querySelector('.notebook-log .melt-block');
    f.cue = R(cue); f.melt = R(melt); f.grid = R(document.querySelector('.notebook-log .axes-grid'));
    f.cues = [...document.querySelectorAll('.notebook-log .axes-cue, #defects-caption')].map(T);
    const cs = getComputedStyle(cue); f.cueFace = `${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.textTransform} ${cs.color}`; f.captions = [...document.querySelectorAll('.notebook-log .melt-block .pen-caption')].map(T);
  }
  return f;
};
export const FULL = { tasted: '2026-10-02', tempering: '5', temp: '-12', note: 'Soft with a little ice at the edges.', marks: [['hardness', 4], ['scoopability', 3], ['smoothness', 2], ['sweetness', 4], ['body', 4], ['oil', 5]], defects: ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film', 'Bitter'], melt: '3', style: 'Creamy puddle' };
export const SPARSE = { tasted: '2026-10-02', tempering: null, temp: null, note: 'Fine.', marks: [['hardness', 3], ['smoothness', 4]], defects: [], melt: null, style: null };
export async function record(page, S, save) {
  await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await page.waitForSelector('.notebook-log input[type=date]');
  await page.locator('.notebook-log input[type=date]').first().fill('2026-10-01');
  await page.getByRole('button', { name: /add tasting/i }).first().click(); await page.waitForTimeout(300);
  await page.locator('.notebook-log input[type=date]').nth(1).fill(S.tasted);
  if (S.tempering) await page.getByLabel('Tempering, minutes', { exact: true }).fill(S.tempering);
  if (S.temp) await page.getByLabel('Tasting temperature, degrees Celsius', { exact: true }).fill(S.temp);
  await page.getByLabel('How did it turn out?', { exact: true }).fill(S.note);
  for (const [axis, v] of S.marks) await page.locator(`input[name="axis-${axis}"][value="${v}"]`).check({ force: true });
  for (const d of S.defects) await page.getByRole('button', { name: d, exact: true }).click();
  if (S.melt) await page.getByLabel('Melt test, g lost at 20 min', { exact: true }).fill(S.melt);
  if (S.style) await page.getByLabel(S.style, { exact: true }).check({ force: true });
  await page.waitForTimeout(300);
  if (save) { const before = page.url(); await page.getByRole('button', { name: 'Save batch', exact: true }).first().click(); await page.waitForFunction((p) => location.href !== p, before); await page.waitForSelector('.tasting-reading'); await page.waitForTimeout(400); }
}
