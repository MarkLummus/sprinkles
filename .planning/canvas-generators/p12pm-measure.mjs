// Sid, 2026-11-23 (sketch 017, the version pen's step order): measures p12pm.py's panels in WebKit with a coarse pointer (or Chrome) and writes p12pm-measure.json
// (p12pm-measure-chromium.json); prints each panel's facts.
//   node p12pm-measure.mjs <out>/measure.html [chromium] [shots dir]
// Per panel: its natural height, sideways overflow, and per step its margin number (words, box), the struck parent number under it, where the body starts, the acts line
// (each control's words, box, whether it is grey, and whether the line holds one row), and any words added after the step. Then a real Tab walk through the panel's controls,
// compared with their markup order.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const FILE = path.resolve(process.argv[2]); const useChromium = process.argv[3] === 'chromium'; const SHOTS = process.argv[4];
const br = useChromium ? await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) : await webkit.launch();
const ctx = await br.newContext({ viewport: { width: 1400, height: 1300 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const out = {}; const rows = [];
for (const pid of await page.$$eval('[data-pid]', (els) => els.map((e) => e.getAttribute('data-pid')))) {
  const m = await page.evaluate((pid) => {
    document.querySelectorAll('[data-pid]').forEach((e) => { e.style.display = e.getAttribute('data-pid') === pid ? 'block' : 'none'; });
    const root = document.querySelector('[data-pid="' + pid + '"]'); const R = root.getBoundingClientRect(); const r1 = (n) => Math.round(n * 10) / 10;
    const box = (e) => { const b = e.getBoundingClientRect(); return [r1(b.left - R.left), r1(b.top - R.top), r1(b.width), r1(b.height)]; };
    const own = (e) => [...e.childNodes].filter((n) => !(n.classList && (n.classList.contains('dl-tab') || n.classList.contains('dl-flag') || n.classList.contains('method-step__n-from')))).map((n) => n.textContent).join('').trim();
    const steps = [...root.querySelectorAll('ol.method-steps > li')].map((li) => { const was = [...li.querySelectorAll('.method-step__skipped-label, .visually-hidden')].map((e) => [e.className, e.textContent.trim(), ...box(e), getComputedStyle(e).fontSize]); const n = li.querySelector(':scope > .method-step__n'); const from = n && n.querySelector('.method-step__n-from'); const body = li.children[1]; const acts = li.querySelector('.method-step__acts'); const lead = li.querySelector('.method-step__lead');
      const kids = acts ? [...acts.querySelectorAll('button')] : []; const tops = new Set(kids.map((k) => Math.round(k.getBoundingClientRect().top)));
      return { was, h: r1(li.getBoundingClientRect().height), n: n ? own(n) : null, nBox: n ? box(n) : null, struck: n ? getComputedStyle(n).textDecorationLine : null, from: from ? { words: from.textContent, box: box(from), deco: getComputedStyle(from).textDecorationLine, font: getComputedStyle(from).fontSize } : null, bodyX: body ? box(body)[0] : null,
        lead: lead ? { words: lead.textContent, lines: Math.round(lead.getBoundingClientRect().height / parseFloat(getComputedStyle(lead).lineHeight) * 10) / 10, h: r1(lead.getBoundingClientRect().height) } : null,
        acts: acts ? { box: box(acts), rows: tops.size, right: r1(Math.max(...kids.map((k) => k.getBoundingClientRect().right)) - R.left), kids: kids.map((k) => [own(k), k.getAttribute('aria-label'), k.classList.contains('mk-off') ? 'off' : 'on', k.getAttribute('aria-disabled'), ...box(k)]) } : null }; });
    const heads = [...root.querySelectorAll('.ingredient-table__step-head td')].map((t) => t.textContent);
    return { w: Math.round(R.width), h: Math.ceil(root.firstElementChild.getBoundingClientRect().height), overflowX: Math.max(0, Math.round(root.scrollWidth - R.width)), steps, heads,
      stops: [...root.querySelectorAll('button, textarea')].map((e) => e.getAttribute('aria-label') || own(e)) };
  }, pid);
  // a real Tab walk: focus the panel's first control, then Tab through the rest
  const walk = await page.evaluate(() => { const first = [...document.querySelectorAll('[data-pid]')].find((e) => e.style.display === 'block').querySelector('button, textarea'); if (first) first.focus(); return !!first; });
  const name = () => page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; return e.getAttribute('aria-label') || [...e.childNodes].filter((n) => !(n.classList && (n.classList.contains('dl-tab') || n.classList.contains('dl-flag')))).map((n) => n.textContent).join('').trim(); });
  const walked = []; if (walk) { walked.push(await name()); for (let i = 1; i < m.stops.length; i++) { await page.keyboard.press(useChromium ? 'Tab' : 'Alt+Tab'); walked.push(await name()); } }
  m.tabWalkEqualsMarkup = JSON.stringify(walked) === JSON.stringify(m.stops); m.walked = walked.length;
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  if (SHOTS) await page.locator(`[data-pid="${pid}"]`).screenshot({ path: path.join(SHOTS, pid + (useChromium ? '-chromium' : '') + '.png') });
  out[pid] = m;
  rows.push(`${pid}: ${m.w} x ${m.h}; ovx ${m.overflowX}; stops ${m.stops.length}, walk equals markup ${m.tabWalkEqualsMarkup}; heads ${JSON.stringify(m.heads)}`);
  for (const s of m.steps) rows.push(`   ${s.n === '' ? '(none)' : s.n}${s.struck === 'line-through' ? ' struck' : ''}${s.from ? ` from ${s.from.words} ${JSON.stringify(s.from.box)} ${s.from.deco} ${s.from.font}` : ''} nBox ${JSON.stringify(s.nBox)} bodyX ${s.bodyX} h ${s.h}${s.lead ? ` | "${s.lead.words}" ${s.lead.h}` : ''}${s.was.length ? ` | was ${JSON.stringify(s.was)}` : ''}${s.acts ? ` | acts rows ${s.acts.rows} right ${s.acts.right}: ${s.acts.kids.map((k) => `${k[0]}(${k[2]} ${k[6]}x${k[7]})`).join(' ')}` : ''}`);
}
await br.close();
await writeFile(path.join(HERE, useChromium ? 'p12pm-measure-chromium.json' : 'p12pm-measure.json'), JSON.stringify(out, null, 1));
console.log(rows.join('\n')); process.exit(0);
