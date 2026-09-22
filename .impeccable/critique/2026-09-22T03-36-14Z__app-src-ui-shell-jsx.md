---
target: "Phase 03.4 gap-closure surface — the App shell (bottom tab row, More panel, folded tools, App ground on every route), the placeholder pages, Home's lead block and rows, at http://localhost:5199/"
method: impeccable-audit
total_score: 17
max_score: 20
verdict: Good
p0_count: 0
p1_count: 0
p2_count: 3
p3_count: 3
detector_findings: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx"
target_fingerprint: "sha256:fdaa5a61d18a1729be039dfac11491a0dafc23a279970b915222ec9138dd3e3f"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx
related_paths:
  - /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.jsx
  - /Users/mark/Documents/projects/sprinkles/app/src/ui/Placeholder.jsx
  - /Users/mark/Documents/projects/sprinkles/app/src/styles/shell.css
  - /Users/mark/Documents/projects/sprinkles/app/src/styles/home.css
  - /Users/mark/Documents/projects/sprinkles/app/src/styles/app.css
timestamp: 2026-09-22T03-36-14Z
slug: app-src-ui-shell-jsx
supersedes: 2026-09-22T01-19-43Z__app-src-ui-shell-jsx.md
---

# Impeccable technical audit — Phase 03.4 after gap closure (plans 06-08)

Method: audit in the running app (Vite dev server on port 5199, main checkout at commit `d82cb22`), measured with the gsd-browser tools at 1920×1080 and under iPhone 15 emulation (393×852, coarse pointer), on `/` and `/notebook`. Every number below is a `getBoundingClientRect` / `getComputedStyle` / `Range` read, never CSS-source reasoning. The file-based detector is blind to JSX (null result, not a pass). Truth sources: DESIGN.md (App palette, App marks, the Hand Rule), `.impeccable/surfaces/route.md` § 1, `03.4-CONTEXT.md` D-01…D-20, boards 170/171 as saved under the phase's `boards/` folder, and `sketch-findings-sprinkles` (zero horizontal overflow at 393, 44px targets below 760).

The previous snapshot (12/20, one P0, two P1) is superseded: all three of its blocking findings are closed by measurement, not by reading the plans.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|------:|-------------|
| 1 | Accessibility | 3 | All five tabs on-screen and touchable at 393 (each 78.6px, x 0–393). More opens as a panel above the bar (bottom 797 = bar top). Deduction: each tab's hit box is 67px tall in a 56px bar, so 12px of every tab's tap area lies below the screen edge. |
| 2 | Performance | 4 | Unchanged: no motion, no shadows, one self-hosted woff2, no console errors, scrollWidth = viewport at both widths. |
| 3 | Responsive Design | 3 | No overflow at 393 (was 532px); bar pinned to 56px; header tools folded (display none ×3) while the shared file input stays. Deduction: the tab's icon-and-label group sits 16.5px below the bar's top and 3.5px above the screen edge — bottom-heavy, because the content box, not the border box, is 100% tall. |
| 4 | Theming | 4 | `.shell` paints the App white (255,255,255) on `/` and `/notebook`; the placeholder title/note now read the App type roles (34px/800 title, 14px secondary note); tokens only. `body` still paints the Sheet cream underneath — only visible in WebKit overscroll (REVIEW.md IN-03), left to the device pass. |
| 5 | Implementation Integrity | 3 | Lead block and rows match the board's structure (border 1px ink, radius 10px, 8px rod, five-column row grid `8px 1fr 120px 132px auto`, standing word 14px/600). Deductions: the 44px touch token is applied to content boxes twice (tabs 67px, actions 70px); the rail has no padding or right rule; the More panel is 85.6px wide with 5 items at 56px. |
| **Total** | | **17/20** | **Good — the six verification gaps are closed as measured; what remains is polish and Mark's rulings.** |

## Measured evidence

**393 (iPhone 15), `/`.** `.shell__tabs`: fixed, y 796, h 56, box-sizing border-box, overflow visible. Items: Home 0–78.6, Notebook 78.6–157.2, Recipe book 157.2–235.8, Idea log 235.8–314.4, More 314.4–393; each `flex-direction: column`, font 12px, colours 21/118/222 · 238/8/3 · 188/91/13 · 151/111/1 · 20/20/20. Link box y 797–864 (h 67): icon 812.5–832.5, label text 834.5–848.5 (viewport 852). `.shell__main` padding-bottom 56px. `.shell__tools > .shell__place` display none ×3; `input[type=file]` present. More open: `ul` position absolute, x 307.4–393, y 503–797, bg white, 1px top rule; items 56/56/56/50/50px. Lead: x 20 w 353, border 1px solid 20/20/20, radius 10px, rod hidden at this width (plan 07's recorded decision), actions 70px. Row: grid `8px 260.9px 44.1px`, rod block, standing "Tasted", actions 70px. `/notebook`: `.place` present, title 34px/800 ink, note 14px 89/89/89; same five tab spans; scrollWidth 393.

**1920, `/`.** Lead x 272 w 1600 h 112, flex, border 1px solid ink, radius 10px, padding 20px; children rod (8×56, bg 253/91/87) · identity · actions (219×70). No Next time column: the seed batch has no note, so the captioned column is unexercised (UAT item 2). Row: grid `8px 1040.8px 120px 132px 219.2px`; rod · place · name · standing "Tasted" (14px/600 ink) · meta "1 batch" · actions. Actions: filled 21/118/222 with white label, secondary white with blue label and border, radius 10px, 14px/600, both 70px tall (computed `height` 44px + padding 24 + border 2). `/notebook`: `.shell` white; rail 224 wide, padding 0, border-right none; places 224×44, active on 243/244/242; tools row visible.

## Findings (most severe first)

### P2-1 — The tab's hit box is 67px tall in a 56px bar
Violates: D-16 (a bar of `--app-size-tab-h`), sketch-findings 44px targets. `.shell__tabs .shell__place` sets `height: 100%` and `padding: var(--gap-xs) 0` on a content box, so each link is 55 + 12 = 67px, its bottom 12px below the screen edge, and its content sits 16.5px from the bar top but 3.5px from the bottom. Fix (`/gsd-quick`): add `box-sizing: border-box` to that rule (or drop `height: 100%` and let `min-height: var(--touch-min)` do the work); pin in shell.test.js.

### P2-2 — The filled and secondary actions are 70px tall against the board's ~41px
Carried from the previous snapshot ("a 70px quiet control"), now measured at every width. `.home__action` applies `min-height: var(--touch-min)` to a content box, so 44 + 24 padding + 2 border = 70. Board 170 lines 71-74 draw 12px/16px padding and a 14px label. Fix (`/gsd-quick`, same batch as P2-1): `box-sizing: border-box` on `.home__action`; the natural height then lands at 44px.

### P2-3 — The rail has no inner padding and no right rule
Carried from 03.4-GAPS-CONFORMANCE.md's new findings; measured padding 0/0, border-right none at 1920. Board 170 draws the rail with a hairline right edge. Open for Mark (UAT item 7) — if kept, a one-rule `/gsd-quick`.

### P3-1 — More's panel is narrow (85.6px) with five 56px items
Sized to its content beside the trailing edge; the labels are short so nothing clips, but Import/Export inside it are 50px, not 56. Board 171 never draws the open panel (plan 06's decision 5). Cosmetic; Mark's call.

### P3-2 — `body` still paints the Sheet cream under the App white
Only reachable through WebKit's overscroll bounce (REVIEW.md IN-03). Device pass (UAT item 9).

### P3-3 — Safari's native disclosure marker on the More summary
Chromium reports `list-style-type: disclosure-closed` on a `display: flex` summary, which suppresses the marker here; `::-webkit-details-marker` is not addressed for WebKit (REVIEW.md WR-01). Device pass (UAT item 8).

## Positive findings
- Zero horizontal overflow at 393 on both routes; five equal tabs; More above the bar; tools folded with the file input kept.
- App ground on every route the shell wraps; the Sheet frames keep their own paint.
- Placeholder pages read the App type roles instead of UA defaults.
- Lead block and rows carry the board's structure; standing word rendered from the domain's own constants.
- Token discipline intact: every measured value resolves to a declared token.
