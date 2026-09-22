---
status: diagnosed
trigger: "pass on iPhone. fail on iPad - the page load time is measured in seconds"
created: 2026-09-22T00:00:00Z
updated: 2026-09-22T00:00:00Z
goal: find_root_cause_only
symptoms_prefilled: true
gap_id: G-03.4-1
---

## Current Focus

bug_class: Bohrbug — deterministic, reproducible on every cold load. Not a Heisenbug: the payload is fixed and measurable, and no timing non-determinism was reported.

hypothesis: CONFIRMED (two contributing causes, AND-gate fired). The seconds are the Vite **dev server's** cold-load cost — 64 requests / 6.22 MiB uncompressed, 68% of it inline base64 sourcemaps — multiplied by an app shell that paints *nothing at all* until the whole graph has resolved. Width is not a factor; the iPhone/iPad split is device-level.

test: complete — see Evidence
expecting: n/a
next_action: none — diagnose-only mode; report handed back to caller

reasoning_checkpoint:
  hypothesis: "Perceived load time = full unbundled dev-server module graph (64 requests, 6.22 MiB, uncompressed, 68% inline sourcemaps) AND an all-or-nothing first paint gated behind a top-level await on IndexedDB. Viewport width contributes nothing."
  confirming_evidence:
    - "Measured: the LAN endpoint http://192.168.1.133:5173/ is served by `vite --host 0.0.0.0` (PID 7283); no vite preview or static server is running"
    - "Measured: 64 requests / 6,521,803 bytes crawling the graph from /src/main.jsx"
    - "Measured: production build is 3 files, 468 KB raw / 134 KB gzipped — ~48x smaller over the wire"
    - "Measured: no Content-Encoding on any dev response despite Accept-Encoding: gzip, deflate, br"
    - "Measured: 68.1% of sampled dev bytes are inline base64 sourcemaps (3,776,932 of 5,546,655)"
    - "Read: index.html has no <link rel=stylesheet> and an empty #root; all six CSS files are JS-injected from main.jsx"
    - "Read: main.jsx:13-18 is a top-level `await seedIfEmpty(repository)` before createRoot; RecipeList then returns null until two more IDB reads resolve"
    - "Measured: zero width-dependent JS on the Home route; zero gradients/filters/shadows in all six stylesheets"
  falsification_test: "Serve the production build to the iPad (`vite build` + `vite preview --host`) and find the load still takes seconds. That would refute both causes. Equally: find a >=1366px-only synchronous code path costing seconds."
  fix_rationale: "N/A — diagnose-only mode. No fix applied, nothing committed."
  blind_spots: "No device-side measurement was possible. Cannot separate iPad link throughput from iPad CPU, and cannot confirm whether Mark's iPad loads were cold, warm, or cache-bypassed (the 14 prebundled deps carry Cache-Control: immutable, so a warm load should be far cheaper than a cold one). Whether iOS Safari actually disk-caches the 2.8 MB single resource is unverified."
  candidate_causes:
    - "environment: dev-server transport — unbundled ESM graph, no compression, inline base64 sourcemaps (6.22 MiB vs 134 KB gzipped in production)"
    - "code: no progressive paint — no stylesheet link in index.html, JS-injected CSS, top-level await on IndexedDB before createRoot, and a null-returning Home route"
    - "environment: iPad CPU / wifi throughput vs the iPhone — this is what turns a shared cost into a pass/fail split"
    - "config: two Vite dev servers running ~15 h on port 5173 from the same app/ dir, sharing one node_modules/.vite/deps cache (stale ?v= measured to return 504 -> client full reload)"
  and_gate: "yes. The 6.22 MiB transport alone would be survivable if a styled shell painted early. The all-or-nothing paint alone would be survivable on a 134 KB production bundle. Seconds of *blank white page* requires both, and a slower device to push it past Mark's threshold."

## Symptoms

expected: Page load well under a second on a local network (iPad, Safari/WebKit, 1366px-class width, coarse pointer)
actual: "pass on iPhone. fail on iPad - the page load time is measured in seconds"
errors: none reported
reproduction: Test 1 in .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-UAT.md — load the app on the iPad over the LAN. iPhone at 393px loads acceptably.
started: Discovered during 03.4 UAT on 2026-09-22

## Eliminated

- hypothesis: "A >=1366px / (pointer: coarse) code path does extra work that the 393px path skips"
  evidence: "Shell.jsx renders the brand row, sprinkles, tools row, rail and tab row unconditionally at every width — CSS alone decides what is visible. RecipeList / HomeBody / HomeLead / RowActions contain no width branch. The only matchMedia in the whole app is BatchRow.jsx:117-121 on (max-width: 759.98px), and BatchRow is not on the Home route. The served JS is byte-identical at both widths."
  timestamp: 2026-09-22

- hypothesis: "Wide-viewport rasterisation cost — paper ruling lines, gradients, shadows or filters painting over a 1366px canvas at 2x DPR"
  evidence: "grep across all six stylesheets: 0 occurrences of repeating-linear-gradient, 0 of backdrop-filter or filter:, 0 of box-shadow. Breakpoints are only 1099.98px / 759.98px / 600px / (min-width: 760px) and (pointer: coarse) / forced-colors / print, and each carries plain declarations."
  timestamp: 2026-09-22

- hypothesis: "Font loading blocks first paint — Caveat fetched from a font CDN"
  evidence: "fonts.css declares one @font-face pointing at /fonts/caveat-regular.woff2, vendored in app/public/fonts (48,836 bytes) and served from the app's own origin, with font-display: swap. No network font reference exists in the tree."
  timestamp: 2026-09-22

- hypothesis: "IndexedDB seeding is expensive"
  evidence: "seed.js writes exactly one version and one batch, and only when repository.listVersions() returns empty. The *open* is on the critical path (see root cause) but the seed writes are trivial and happen once."
  timestamp: 2026-09-22

- hypothesis: "Images or other heavy static assets"
  evidence: "app/public contains only caveat-regular.woff2 (48,836 B) and OFL.txt (4,385 B). No images anywhere. All navigation icons are inline SVG in Shell.jsx."
  timestamp: 2026-09-22

## Evidence

- timestamp: 2026-09-22
  checked: .planning/debug/knowledge-base.md
  found: does not exist — no prior resolved-session patterns to match
  implication: no known-pattern shortcut; investigated from first principles

- timestamp: 2026-09-22
  checked: what is actually listening on port 5173, and what the LAN address serves
  found: two node processes, both `app/node_modules/.bin/vite`, both up ~15 h — PID 5343 bound to [::1]:5173 (loopback only) and PID 7283 started with `--host 0.0.0.0` bound to *:5173 (IPv4 wildcard). `curl http://192.168.1.133:5173/` returns 200 with the dev index.html. `ps` shows no `vite preview`, http-server, serve, caddy or nginx.
  implication: the iPad is served the **Vite dev server**, never a production build. Every measurement below is taken against the same listener the device reaches.

- timestamp: 2026-09-22
  checked: cold-load module graph crawled from /src/main.jsx on 127.0.0.1:5173
  found: 64 module requests, 6,521,803 bytes (6.22 MiB) total; waterfall depth 6 serial round trips. Breakdown — prebundled deps 14 req / 4.79 MiB, app src JS 42 req / 1.24 MiB, CSS-as-JS 6 req / 149 KB, vite client 2 req / 309 KB. Largest single responses: /node_modules/.vite/deps/react-dom_client.js 2,819,683 B; development-BRh0VnWl.js 1,581,370 B; /@vite/client 204,386 B; /src/ui/RecipePage.jsx 247,111 B; /src/styles/app.css 94,735 B.
  implication: the device downloads 6.22 MiB before it can show anything. Depth 6 is shallow enough that latency is not the driver — raw bytes are.

- timestamp: 2026-09-22
  checked: whether the dev server compresses (`curl -H 'Accept-Encoding: gzip, deflate, br'`)
  found: no Content-Encoding header on /, /src/main.jsx, /src/styles/app.css or the deps; full Content-Length returned (e.g. 2819683 for react-dom_client.js). Deps carry `Cache-Control: max-age=31536000,immutable`; /src/* and CSS carry `Cache-Control: no-cache` with weak ETags.
  implication: all 6.22 MiB crosses the wire uncompressed on a cold load. On a warm load the 4.79 MiB of deps should come from cache and /src/* should revalidate to 304 — so the seconds point at cold (or cache-bypassed) loads.

- timestamp: 2026-09-22
  checked: how much of the dev payload is sourcemap rather than code
  found: 68.1% of sampled bytes are inline base64 sourcemaps — 3,776,932 of 5,546,655 across 11 representative responses. Per-file: react-dom_client.js 71% map, development-*.js 68%, /@vite/client 81%, RecipePage.jsx 64%. react-dom_client.js is 820,838 B on disk but 2,819,683 B on the wire; the extra ~2.0 MB is the base64 inlining of the 1,498,985 B .map file.
  implication: roughly 4.2 of the 6.22 MiB is debug metadata the iPad has to receive and the JS parser has to scan past. Only ~2 MiB is executable code.

- timestamp: 2026-09-22
  checked: production build for comparison (`npm run build`)
  found: 126 modules transformed in 83 ms -> dist/index.html 0.39 kB, dist/assets/index-*.css 47.96 kB (8.22 kB gzip), dist/assets/index-*.js 420.12 kB (126.08 kB gzip). Three requests, ~134 kB gzipped total.
  implication: dev delivery is ~48x larger over the wire than production and costs 64 requests instead of 3. Whatever the iPad's link and CPU are, they are being asked to do ~48x the necessary work.

- timestamp: 2026-09-22
  checked: what the browser can paint before the module graph resolves (index.html, served main.jsx, RecipeList)
  found: index.html contains only `<div id="root"></div>` and `<script type="module" src="/src/main.jsx">` — no `<link rel="stylesheet">`, no inline critical CSS, no shell markup. All six stylesheets are imported from main.jsx and therefore arrive as JS modules that inject `<style>` tags. The served main.jsx keeps the source's top-level `await seedIfEmpty(repository)` (main.jsx:13-18) *before* `createRoot(...).render(...)`. RecipeList then does `if (versions === null) return null;` while two IndexedDB reads are in flight.
  implication: the visible sequence is blank unstyled white page -> (entire 6.22 MiB graph downloads and parses) -> (IndexedDB opens, listVersions resolves) -> React renders -> six style tags inject -> (two more IDB reads) -> content. There is no skeleton, no styled shell and no loading state at any point, so 100% of the load cost is experienced as a blank page. This is the amplifier that turns a slow load into "measured in seconds".

- timestamp: 2026-09-22
  checked: Shell.jsx and the Home route for width-conditional work
  found: Shell renders shell__brand, five shell__sprinkle spans, the Search/Import/Export tools row with a hidden file input, the rail and the tab row unconditionally. No matchMedia, ResizeObserver, getBoundingClientRect, offsetWidth or rAF anywhere on the Home path. The single matchMedia in the app is BatchRow.jsx:117-121 on (max-width: 759.98px), off this route. BatchRow.jsx:104 reads scrollHeight (textarea autosize), also off this route.
  implication: the bytes and the JS work are identical at 393px and at 1366px. The width framing in UAT Test 1 is a red herring for the load-time complaint.

- timestamp: 2026-09-22
  checked: secondary hazard — two dev servers sharing one optimized-deps cache
  found: both servers run from /Users/mark/Documents/projects/sprinkles/app and share app/node_modules/.vite/deps (_metadata.json written Sep 21 23:33, i.e. *after* both servers started; browserHash cbb03057, while served URLs carry assorted ?v= values 6817393f / 10d4a55c / 8d270f64 / 30ad7663 / b0032465 / 58788aa9). Requesting a dep with a wrong hash returns 504 (measured: ?v=deadbeef -> 504, ?v=10d4a55c -> 200, no ?v= -> 200).
  implication: 504 is Vite's "outdated optimize dep" signal, which makes the client do a full page reload. Either instance re-optimising invalidates the other's hashes, so a load can become two loads. Not the primary cause (every dep currently resolves 200) but a real amplifier while two servers coexist on the same directory.

- timestamp: 2026-09-22
  checked: whether UAT Test 1's stated truth was actually exercised
  found: G-03.4-1's truth has two clauses — prompt load *and* no tab-row overflow. The reported result speaks only to load time.
  implication: the tab-row overflow clause of G-03.4-1 is untested on the iPad, not failed. It needs re-running once the load issue is out of the way.

## Resolution

root_cause: >
  Two contributing causes, both required (AND-gate fired).
  (1) ENVIRONMENT — the iPad is served the Vite **dev** server over the LAN
  (`vite --host 0.0.0.0` on 192.168.1.133:5173; no production build is served anywhere),
  so a cold load transfers 64 unbundled ES modules totalling 6,521,803 bytes with no
  compression, of which 68.1% is inline base64 sourcemap. The same app built for
  production is 3 requests and ~134 KB gzipped — roughly 48x less over the wire.
  (2) CODE — nothing paints until that entire graph has resolved: index.html carries no
  stylesheet link and an empty #root, all six stylesheets are JS-injected via main.jsx
  imports, and main.jsx:13-18 gates createRoot behind a top-level
  `await seedIfEmpty(repository)` (an IndexedDB open); RecipeList then returns null
  through two further IDB reads. So the whole cost is spent on a blank white page with
  no shell, skeleton or loading state.
  Viewport width contributes nothing — the served bytes and the JS work are identical at
  393px and 1366px. The iPhone-passes/iPad-fails split is therefore device-level
  (iPad link throughput and/or CPU parsing ~2 MiB of unminified React dev code under
  StrictMode double-render), not a >=1366px or (pointer: coarse) code path. That last
  step is inferred, not measured: no device-side measurement was possible.

fix: not applied — diagnose-only mode
verification: not applicable — diagnose-only mode
files_changed: []
