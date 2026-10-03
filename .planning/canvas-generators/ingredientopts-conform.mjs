// Sid, 2026-10-03: board against app for the ingredient-options boards (decision 31). The Mexican Chocolate v3 panels of 1366-ingredient-options.html and
// 1024-ingredient-options.html against the built app with the same form injected, per laid-out cell (0.5px; display:none cells skipped), WebKit and Chrome.
import { readFile, writeFile } from 'node:fs/promises';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '/Users/mark/Documents/projects/sprinkles/.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const G='/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/';
const opt = await readFile(G+'ingredient-options.css','utf8');
const appcss = await readFile('/Users/mark/Documents/projects/sprinkles/app/src/styles/app.css','utf8');
const A = opt.split('/* === A === */')[1].split('/* === C === */')[0], C = opt.split('/* === C === */')[1];
const i=appcss.indexOf('.ingredient-table thead {'), j=appcss.indexOf('\n}\n', appcss.indexOf('.ingredient-table td.ingredient-table__col-grams > .struck-value'));
const FORMS={today:'',A,B:appcss.slice(i,j),C};
const AS={ 'Whole Milk 3.3%':503,'Cocoa Powder':16.4,'Sucrose':46,'Dextrose':45,'Fructose':4.5,'Dried Skimmed Milk Powder':34.8,'Salt':null,'Cream, heavy':77,'Vanilla Extract':null,'Stabilizer Mix 4421':2,'Cinnamon':2.3,'Allulose':37};
const s = await startServers();
const rd = () => { const t=document.querySelector('.ingredient-table'); const o=t.getBoundingClientRect();
  return [...t.querySelectorAll('tr')].map(tr=>({t:tr.textContent.replace(/\s+/g,' ').trim().slice(0,30), cells:[...tr.children].map(c=>{const b=c.getBoundingClientRect(); return [b.left-o.left,b.top-o.top,b.width,b.height].map(x=>Math.round(x*10)/10)})})); };
let bad=0,total=0;
for (const [en,mk] of [['webkit',()=>webkit.launch()],['chrome',()=>launch()]]) {
  const b = await mk();
  for (const W of [1366,1024]) {
    // app
    const app={};
    for (const form of Object.keys(FORMS)) {
      const ctx=await b.newContext({viewport:{width:W,height:1100},hasTouch:true});
      await ctx.route('**/*', r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
      const p=await ctx.newPage();
      await p.goto(s.appUrl+'/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01',{waitUntil:'networkidle'});
      await p.getByRole('button',{name:'Show changes'}).first().click(); await p.getByRole('button',{name:'Hide changes'}).first().waitFor();
      await p.evaluate((m)=>{let sum=0,any=false; for(const tr of document.querySelectorAll('.ingredient-table tbody > tr')){const nc=tr.querySelector('.ingredient-table__col-name'); const num=tr.querySelectorAll('.ingredient-table__col-numeric'); if(!nc||num.length<2) continue; const name=[...nc.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim(); const v=m[name]; if(v===null) continue; num[0].innerHTML=`<span class="sheet-hand">${v} g</span>`; sum+=v; any=true;} document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0].innerHTML=`<span class="sheet-hand">${Math.round(sum*10)/10} g</span>`;},AS);
      if (FORMS[form]) await p.addStyleTag({content:FORMS[form]});
      await p.waitForTimeout(80);
      app[form]=await p.evaluate(rd); await ctx.close();
    }
    // board
    const ctx=await b.newContext({viewport:{width:1366,height:1000},hasTouch:true});
    await ctx.route('**/*', async r=>{const u=new URL(r.request().url()); if(u.hostname==='127.0.0.1') return r.continue(); if(u.hostname==='fonts.googleapis.com') return r.fulfill({contentType:'text/css',body:`@font-face{font-family:Caveat;src:url(${s.repoUrl}/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}`}); return r.abort();});
    const p=await ctx.newPage();
    await p.goto(`${s.repoUrl}/.planning/sketches/011-recipe-route-c/${W}-ingredient-options.html`,{waitUntil:'networkidle'}); await p.evaluate(()=>document.fonts.ready);
    for (const form of Object.keys(FORMS)) {
      const bd=await p.evaluate((cls)=>{const w=document.querySelector('.'+cls); const t=w.querySelector('.ingredient-table'); const o=t.getBoundingClientRect(); return [...t.querySelectorAll('tr')].map(tr=>({t:tr.textContent.replace(/\s+/g,' ').trim().slice(0,30), cells:[...tr.children].map(c=>{const b=c.getBoundingClientRect(); return [b.left-o.left,b.top-o.top,b.width,b.height].map(x=>Math.round(x*10)/10)})}));}, `io-mex-${form}`);
      const ap=app[form]; let mism=0;
      if (ap.length!==bd.length) mism+=1000;
      ap.forEach((r,k)=>{ const q=bd[k]; if(!q) return; if(r.cells.length!==q.cells.length) {mism++;return;} r.cells.forEach((c,m)=>{ if(c[2]===0&&c[3]===0&&q.cells[m][2]===0&&q.cells[m][3]===0) return; total++; if(c.some((v,z)=>Math.abs(v-q.cells[m][z])>0.5)) {mism++; if(mism<4) console.log('  diff',en,W,form,r.t,m,c,q.cells[m]);} }); });
      console.log(en,W,form,'rows',ap.length,'mismatches',mism); bad+=mism;
    }
    await ctx.close();
  }
  await b.close();
}
console.log('total cells',total,'mismatches',bad);
await s.close();
