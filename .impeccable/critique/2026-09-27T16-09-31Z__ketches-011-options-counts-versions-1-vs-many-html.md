---
target: 011 count option boards
total_score: 25
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/011-options-counts/versions-1-vs-many.html"
target_fingerprint: "sha256:6ede4e469bc8c2ce4887bcaf357f800a817bcdc11ed0556e226a45234689307d"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/011-options-counts/versions-1-vs-many.html
timestamp: 2026-09-27T16-09-31Z
slug: ketches-011-options-counts-versions-1-vs-many-html
---
# Critique — 011 count option boards (versions 1 vs many; batches 0/1/many)
Method: dual-agent. Recommended set scored: versions B, no Batches control at 1, timeline B for many.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility | 3 | ring shows batch in view; tasted state lost on timeline |
| 2 | Real world | 3 | "3 · oldest left" hint cryptic |
| 3 | Control | 3 | any batch one tap away |
| 4 | Consistency | 2 | History kept at 1, Batches hidden at 1; Batch/Batches stacked; nodes filled regardless of tasted |
| 5 | Error prevention | 3 | Correct acts on the batch marked only by a small ring |
| 6 | Recognition | 3 | batches visible, their state isn't |
| 7 | Flexibility | 2 | no jump to latest; rail scrolls past ~3 |
| 8 | Minimal | 3 | one-line History borderline filler |
| 9 | Error recovery | n/a | no error states drawn |
| 10 | Help | 3 | 0-batch line teaches next step |
| Total | | 25/36 | Acceptable (69%) |

Recommendations: versions B; batches at 1 — no control; many — timeline B with hollow/filled tasted grammar (or list A closed by default).

Detector: 14 CLI / 9 overlay. Real: #1576de (tokens.css) on white / white on it = 4.49:1, fails AA by 0.01 (buttons + all blue links). False positives: Caveat (approved hand, DESIGN.md lag), 28/22px sizes, line-length on drawing notes.

Priority issues:
- [P1] No 393 board though the question came from the iPhone; timeline dates 92x34, From link 157x16. Fix: draw 393 of B and C. /impeccable adapt
- [P1] Timeline drops tasted state and out-of-machine; all nodes filled incl. "Not yet tasted" 9 Aug. Fix: hollow = not tasted; reading under in-view node. /impeccable clarify
- [P2] batches-many data contradicts: list "Tasted 17 Aug 2026" vs detail "tasted date unknown" + 2 Aug readings under 16 Aug. Fix counts.py.
- [P2] Asymmetric show rule (History at 1, Batches hidden at 1) unrecorded. /impeccable shape
- [P2] Brand blue 4.49:1 app-wide. /impeccable colorize or tokens rework

Personas: first-timer (no legend, stacked labels); a11y (no aria-current, no aria-expanded, A rows look like links but inert, tabIndex rule); phone (nothing at 393); Mark (compares batches of one version — the thing the timeline hides).

Minor: draft and unchurned version share hollow node; clipped rail links remain tabbable, no fade drawn; A/B at 1 version drop "churned 2 Aug".
