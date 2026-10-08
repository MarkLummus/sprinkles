// Sid, 2026-10-07: measures the three Phase 4 screens in the REAL build and on the boards, WebKit and Chromium, 1280 fine and 393 coarse.
//   node phase4screens-measure.mjs <dir with the generated boards>   -> phase4screens-measure.json (keys read by phase4screens.py: route1280.docH, route393.headH, home1280.docH)
// Live: the new markup and rules (phase4screens-snippets.json, written by phase4screens.py) are injected into the preview already on 127.0.0.1:4173 (the dist of 2026-10-06) in a real viewport, so the build's own CSS lays them out:
//   home    the draft line and the section row with the code link
//   route   the print route's furniture and the page pictures (an empty gif with the pictures' aspect ratio) in the Shell's main, on the Olive Oil v1 page
//   notice  the real .page-status on the Next version pen with each of three wordings: its box against the recipe name
// Boards: the generated board files opened in the same engines; the same data-m elements read inside each panel.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const DIR = path.resolve(process.argv[2] || '.');
const SN = JSON.parse(await readFile(path.join(HERE, 'phase4screens-snippets.json'), 'utf8'));
const BASE = 'http://127.0.0.1:4173', V1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const out = {};
const engines = [['webkit', () => webkit.launch()], ['chromium', () => chromium.launch({ executablePath: CHROME, headless: true })]];
for (const [name, launch] of engines) {
  const b = await launch();
  for (const [W, coarse] of [[1280, false], [393, true]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: 900 }, hasTouch: coarse, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); p.setDefaultTimeout(10000); const k = `${name}_${W}`; const o = out[k] = {};
    // ---- Home
    await p.goto(BASE + '/', { waitUntil: 'networkidle' }); await p.waitForSelector('.home__lead'); await p.waitForTimeout(300);
    o.pointerCoarse = await p.evaluate(() => matchMedia('(pointer: coarse)').matches);
    o.homeBefore = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, leadH: Math.round(document.querySelector('.home__lead').getBoundingClientRect().height * 10) / 10, sectionY: Math.round(document.querySelector('.home__section').getBoundingClientRect().top + scrollY) }));
    o.home = await p.evaluate(([sn, coarse]) => {
      const st = document.createElement('style'); st.textContent = sn.css + (coarse ? sn.coarse : ''); document.head.appendChild(st);
      document.querySelector('.home__lead-meta').insertAdjacentHTML('afterend', sn.draft);
      document.querySelector('h2.home__section').outerHTML = sn.section;
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round((r.y + scrollY) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
      const q = (s) => document.querySelector(s); const d = q('[data-m=draft]'); const lh = parseFloat(getComputedStyle(d).lineHeight) || 1.2 * parseFloat(getComputedStyle(d).fontSize);
      const lab = q('.home__section'), link = q('[data-m=codelink]');
      return { docH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth, lead: R(q('.home__lead')), draft: R(d), draftLines: Math.round(R(d).h / lh), draftlink: R(q('[data-m=draftlink]')), codelink: R(link), label: R(lab), row: R(q('[data-m=sectionrow]')),
        sameLine: Math.abs((R(link).y + R(link).h / 2) - (R(lab).y + R(lab).h / 2)) < 3, linkColor: getComputedStyle(link).color, draftFont: getComputedStyle(d).fontSize, actions: R(q('.home__lead .home__actions')) };
    }, [SN, coarse]);
    // ---- D20: Home with the recipe that holds the open draft leading (its lead section is the build's own, captured with that recipe first)
    o.homeLead = await p.evaluate(([sn, coarse, W]) => {
      document.querySelector('.home__lead').outerHTML = sn.leadOlive[W]; document.querySelector('.home__lead-meta').insertAdjacentHTML('afterend', sn.draftOlive);
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round((r.y + scrollY) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
      const q = (s) => document.querySelector(s); const d = q('[data-m=draft]'); const lh = parseFloat(getComputedStyle(d).lineHeight) || 1.2 * parseFloat(getComputedStyle(d).fontSize);
      return { docH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth, lead: R(q('.home__lead')), name: q('.home__lead-name').textContent, draft: R(d), draftLines: Math.round(R(d).h / lh), draftlink: R(q('[data-m=draftlink]')), actions: R(q('.home__lead .home__actions')) };
    }, [SN, coarse, W]);
    // ---- the print route
    await p.goto(BASE + V1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
    for (const [rk, html] of (W === 1280 ? [['route', SN.route1280]] : [['route', SN.route393]])) {
      o[rk] = await p.evaluate(([sn, html, coarse]) => {
        document.querySelectorAll('style[data-p4]').forEach((s) => s.remove());
        const st = document.createElement('style'); st.dataset.p4 = '1'; st.textContent = sn.css + (coarse ? sn.coarse : ''); document.head.appendChild(st);
        document.querySelector('.shell__main').innerHTML = html;
        const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round((r.y + scrollY) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
        const q = (s) => document.querySelector(s); const nm = R(q('[data-m=name]')), v = R(q('[data-m=version]')), sv = R(q('[data-m=saved]'));
        const hd = R(q('[data-m=head]'));
        return { docH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth, shellH: Math.round(q('.shell').getBoundingClientRect().height), head: hd, headH: Math.round(hd.y + hd.h),
          name: nm, version: v, saved: sv, code: R(q('[data-m=code]')), print: R(q('[data-m=print]')), caption: R(q('.print-route .notebook-caption')),
          oneLine: Math.abs(nm.y + nm.h / 2 - (v.y + v.h / 2)) < 6 && Math.abs(v.y + v.h / 2 - (sv.y + sv.h / 2)) < 6, lineH: R(q('.print-route__line')).h, pages: R(q('[data-m=pages]')), log1: R(q('[data-m=log1]')), log2: R(q('[data-m=log2]')), sheet1: R(q('[data-m=sheet1]')),
          pan: R(q('[data-m=pan]')), panScrollW: q('[data-m=pan]') ? q('[data-m=pan]').scrollWidth : null, pageScale: Math.round(R(q('[data-m=log1]')).w / 816 * 1000) / 1000, printBg: getComputedStyle(q('[data-m=print]')).backgroundColor };
      }, [SN, html, coarse]);
    }
    // ---- the notice on the Next version pen
    await p.goto(BASE + V1, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /next version/i }).first().click(); await p.waitForTimeout(500);
    await p.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
    o.notice = await p.evaluate(([words]) => {
      const n = document.querySelector('.page-status'); const t = document.querySelector('.notebook-recipe__name'); const rail = document.querySelector('.notebook-recipe__rail'); const res = {};
      const R = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; };
      const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      for (const [key, text] of Object.entries(words)) {
        n.textContent = text; const r = R(n), tr = R(t), rr = R(rail);
        res[key] = { text, box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }, title: { x: Math.round(tr.x), y: Math.round(tr.y), w: Math.round(tr.w), h: Math.round(tr.h) },
          coversTitlePx2: Math.round(inter(r, tr)), coversRailPx2: Math.round(inter(r, rr)), titleAreaShare: Math.round(inter(r, tr) / (tr.w * tr.h) * 100), headerBottom: Math.round(document.querySelector('.shell__head').getBoundingClientRect().bottom) };
      }
      n.textContent = ''; return res;
    }, [SN.words]);
    await ctx.close();
  }
  await b.close();
}
// ---- the boards
for (const [name, launch] of engines) {
  const b = await launch();
  for (const f of ['P4_PrintRoute1280', 'P4_PrintRoute393', 'P4_Home', 'P4_DraftKept', 'P4_DraftKeptWords']) {
    const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
    await p.goto('file://' + path.join(DIR, f + '.dc.html')); await p.waitForTimeout(1000); await p.evaluate(() => document.fonts.ready);
    out[`board_${name}_${f}`] = await p.evaluate(() => [...document.querySelectorAll('.p4-win')].map((w) => {
      const vid = [...w.classList].find((c) => /^p4[a-z0-9]+$/.test(c)); const wr = w.getBoundingClientRect(); const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x - wr.x), y: Math.round(r.y - wr.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const q = (s) => w.querySelector(s); const sh = q('.shell');
      return { vid, win: { w: Math.round(wr.width), h: Math.round(wr.height) }, shellH: sh ? Math.round(sh.getBoundingClientRect().height) : null, head: R(q('[data-m=head]')), name: R(q('[data-m=name]')), print: R(q('[data-m=print]')), log1: R(q('[data-m=log1]')), draft: R(q('[data-m=draft]')), codelink: R(q('[data-m=codelink]')), draftlink: R(q('[data-m=draftlink]')), notice: R(q('[data-m=notice]')), route: R(q('[data-m=route]')) };
    }));
    await ctx.close();
  }
  await b.close();
}
const wk = out.webkit_1280, w3 = out.webkit_393;
out.route1280 = { docH: Math.ceil(wk.route.shellH) }; out.route393 = { headH: Math.ceil(w3.route.headH) }; out.home1280 = { docH: Math.ceil(wk.home.docH) };
await writeFile(path.join(HERE, 'phase4screens-measure.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ route1280: out.route1280, route393: out.route393, home1280: out.home1280 }));
process.exit(0);
