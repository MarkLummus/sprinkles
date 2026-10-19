// Sid, 2026-10-17 (Phase 9 design gate; PLACE-01): the library's real entries and the reviewed dataset's names, as JSON for places.py.
//   node places-data.mjs   -> places-data.json
//     library   the 26 entries of app/src/data/library.js, every field as stored, in the store's own order
//     dataset   the 103 entries of ~/Downloads/sprinkles-ingredient-seed-db.json reduced to the fields a list row and an entry's figures read (name, category, fat, msnf, sugar, pac, pod): a stand-in for "a few hundred", not the Phase 9 library
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { library } = await import(pathToFileURL(path.join(HERE, '../../app/src/data/library.js')).href);
// Sid, 2026-10-19: the reviewed dataset's entries as the store seeds them under the 26 (commit 7dde55d3), for the open-entry boards that need one (Milk Chocolate: not dairy, 16% milk solids)
const { librarySeedDb } = await import(pathToFileURL(path.join(HERE, '../../app/src/data/library-seed-db.js')).href);
const ds = JSON.parse(await readFile(path.join(os.homedir(), 'Downloads/sprinkles-ingredient-seed-db.json'), 'utf8'));
const out = {
  library: Object.entries(library).map(([key, e]) => ({ key, ...e })),
  seedDb: Object.entries(librarySeedDb).map(([key, e]) => ({ key, ...e })),
  dataset: ds.ingredients.map((x) => ({ id: x.id, name: x.name, category: x.category, fat: x.fat_pct, msnf: x.msnf_pct, sugar: x.sugars_pct, pac: x.pac, pod: x.pod })),
};
await writeFile(path.join(HERE, 'places-data.json'), JSON.stringify(out));
console.log(out.library.length, out.dataset.length);
