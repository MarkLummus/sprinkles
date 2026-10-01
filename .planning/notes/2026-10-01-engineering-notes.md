---
date: "2026-10-01 11:15"
promoted: false
---

# Engineering notes

## Keyboard: every link, button, radio and checkbox is an explicit Tab stop

**Rule.** Each anchor, react-router `Link` and `NavLink`, `button`, and radio or checkbox `input` the app renders carries a literal `tabIndex={0}`. `app/src/ui/tabindex-scan.test.js` enforces it: it reads every non-test .jsx under `app/src` and names file, line and tag on a miss.

**Cause.** WebKit, which is every browser on the iPad, reaches a link only under its TabsToLinks preference. That preference is off on Apple platforms, has no iPadOS switch, and is untouched by Full Keyboard Access. With it off, WebKit Tabs only into text entry and into controls that carry an explicit tabindex. Chromium Tabs to every native control, so a Chromium pass proves nothing about the iPad. A radio group is one Tab stop in both engines and arrow keys move the selection; the explicit tabindex changes neither.

**Evidence.**
- Links: G-03.4-r3-3 (`.planning/debug/ipad-tab-never-enters-app.md`) and G-03.4-r4-1 (`.planning/debug/ipad-keyboard-locks-after-tab.md`). Untagged links were unreachable on the iPad.
- Buttons, radios and checkboxes: quick task 261001-doi. WebKit's Tab from the Churn duration field skipped both radio groups and Add tasting, Cancel and Save batch until all 39 sites were tagged. Mark confirmed on his iPad on 2026-10-01.

**Full Keyboard Access stays off on Mark's iPad.** With it on, the keyboard has locked until a power cycle. iPad keyboard UAT is tap, then Tab; Tab past the last link handing focus to Safari's chrome is expected.

**The one exemption.** `GraduatedRule`'s button reads `tabIndex ?? 0`. `FormulationNote` passes -1 while recording or developing, so the six figure rules stay off the Tab path there and remain clickable; they are Tab stops when reading. The scan allowlists that one tag with its reason, a stale entry fails the test, and `FormulationNote.test.jsx` pins both values on rendered markup.

**Other pins.** Each component's own test pins its exact tag count on rendered markup and stays. Two sites the node harness cannot render are pinned on source text: `Method.jsx`'s uses-list checkbox (`Method.test.jsx`) and `RecipePage.jsx`'s not-found link (`RecipePage.test.jsx`). `router.jsx` renders no link since the running head went in 03.5-02 Task 3, but the scan still reads it. `Shell.jsx`'s hidden file input carries tabIndex -1 on purpose and is not a scanned kind. The one `select` in `VersionRow.jsx` is neither scanned nor measured on WebKit, and an input with a computed type is not scanned.

## Device UAT is served from the build

Anything Mark opens on the iPad or iPhone over the LAN is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never from the dev server. The dev server ships the unbundled module graph, measured at 64 requests and 6.22 MiB against the build's 3 requests and about 134 KB gzipped, and no device measurement taken against it means anything. See `.planning/debug/ipad-page-load-seconds.md` and 03.4-13.

## One Vite process per workspace

Two servers started from the same `app/` directory share one optimised-deps cache, so either one re-optimising invalidates the other's hashes and a stale request returns 504, which makes the client reload the whole page. This is a measured amplifier, not a theory (`.planning/debug/ipad-page-load-seconds.md`): a wrong hash returned 504, the right hash or none returned 200. Kill the duplicate before measuring anything.
