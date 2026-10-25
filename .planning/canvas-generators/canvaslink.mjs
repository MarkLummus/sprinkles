// Address ids as the Design editor mints them (bl() in artifact-type/app.js): #page-<bl(pageId)>, #artboard-<bl(file)>
function bl(e){let t=-559038737,n=1103547991;for(let o=0;o<e.length;o++){let i=e.charCodeAt(o);t=Math.imul(t^i,2654435761),n=Math.imul(n^i,1597334677)}return t=Math.imul(t^t>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),n=Math.imul(n^n>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),(4294967296*(2097151&n)+(t>>>0)).toString(16).padStart(14,"0").slice(-12)}
const U='https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq';
for (const a of process.argv.slice(2)) console.log(a, a.startsWith('page-') ? `${U}#page-${bl(a)}` : `${U}#artboard-${bl(a)}`);
