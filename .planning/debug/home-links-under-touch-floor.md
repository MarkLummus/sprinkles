---
status: diagnosed
trigger: "G-03.5-4b: does the link on the home screen on iPHone at 393 have height of 44px? Doesn't like so."
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
bug_class: Bohrbug (deterministic; the CSS never applies a floor to these links)
---

## Current Focus

hypothesis: CONFIRMED. The touch floor is an allowlist of control selectors (app.css:2312-2337) plus a per-class floor on .home__action (home.css:300). Home's recipe-name links are bare, classless, display:inline <a> elements that match neither. The only rules on them set color: inherit (home.css:138-140, 240-242). No board, plan or DESIGN.md sentence ever named a text link as a floor recipient.
test: done. Live DOM at 393 and 1366 coarse; in-page CSS injection of three candidate remedies.
expecting: n/a
next_action: return ROOT CAUSE FOUND to the orchestrator (find_root_cause_only; no app/ edit).

reasoning_checkpoint:
  hypothesis: "Home's recipe-name links render 28px (lead 33px) under a coarse pointer because no rule gives them the 44px floor. The app's coarse-pointer union lists button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle, .text-control and two checkbox labels, and no <a>. home.css gives min-height: var(--touch-min) only to .home__action. The name links are classless inline anchors whose height is just their line box (24px font, normal leading = 28px; 28px font = 33px)."
  confirming_evidence:
    - "Computed style at 393 coarse: every .home__name a and .home__lead-name a is display:inline with min-height:0px; 28px (one line), 57px (two lines of 28), lead 33px. .home__action is display:flex with min-height:44px, 44px tall."
    - "The served CSS (index-t2lBO6PC.css) holds exactly '.home__name a{color:inherit}' and '.home__lead-name a{color:inherit}' and a (pointer:coarse) union with no anchor selector."
    - "Injecting min-height:44px alone under (pointer:coarse) changes nothing (28 stays 28), because min-height does not apply to a non-replaced inline box. Injecting display:inline-flex plus min-height gives 44px. So the missing rule is the cause."
    - "Same readings at 1366 coarse (the iPad): 28px names, 33px lead. The defect is keyed on pointer, not width."
  falsification_test: "If any rule in app.css, home.css or shell.css already targeted these anchors with a height floor under a coarse pointer, the computed min-height would read 44px. It reads 0px."
  fix_rationale: "Diagnose only. The remedy is to give the two name-link sites a floor that actually takes effect on the box they render."
  blind_spots: "Measured in Chrome with mobile/touch emulation, not WebKit on the iPhone. Inline line-box height under 'normal' leading can differ by a pixel or two in WebKit, but no WebKit leading reaches 44px at a 24px font. The empty-shelf links (.home__empty-lead) were not measured because the seeded store is not empty; they are the same classless-inline pattern but sit inside a sentence."
  candidate_causes:
    - "code: the coarse-pointer floor is an allowlist of control classes with no <a>; home.css floors only .home__action"
    - "spec/design: board 171 (Phone390Tabs.dc.html:41) draws the row name as a bare inline <a> at 19px with no box; the lead name (line 25) is not drawn as a link at all; DESIGN.md:376 lists floor recipients without links; the 03.4-04 plan asked for the touch minimum on actions only"
    - "environment (ruled out): the served build matches source; the tab-row and More links meet the floor (55px / 48px) in the same run"
  and_gate: "Partly. The code omission alone produces the symptom. It went unnoticed because no drawing or rule ever named a text link as a floor recipient, so no plan asked for one and no test pins one."

## Symptoms

expected: On a coarse pointer at 393, every Home link meets the 44px touch floor.
actual: Recipe-name links in the Recipes list render 28px tall (Pineapple 109x28; two-line Olive Oil 216x57). The Pick up where you left off recipe link is 248x33. Action links (Next version, Adapt, Record a batch) are 44px.
errors: none (visual/size defect)
reproduction: UAT test 4. gsd-browser iPhone 15 emulation, 393, pointer:coarse, built app http://localhost:4173/
started: Discovered during 03.5 UAT (2026-09-30)

## Eliminated

- hypothesis: The served build is stale or differs from source (environment).
  evidence: the preview on :4173 (pid 16425, cwd /Users/mark/Documents/projects/sprinkles/app) serves index-t2lBO6PC.css, whose .home__name a / .home__lead-name a / (pointer:coarse) rules match the bb8d8db source exactly.
  timestamp: 2026-09-29
- hypothesis: The shell's own links on Home are also under the floor.
  evidence: at 393 coarse the five tab-row links read 78.6x55 and the More items 78.6x48, all with min-height 44px (shell.css:346-349). Only the .home name links fall short.
  timestamp: 2026-09-29
- hypothesis: The defect is phone-width only.
  evidence: at 1366 coarse the name links read 28px and the lead 33px, the same as at 393. No width-keyed rule is involved.
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: .planning/debug/knowledge-base.md (Phase 0)
  found: no knowledge base file exists; MemPalace not queried (not available in this agent)
  implication: no known-pattern candidate
- timestamp: 2026-09-29
  checked: app/src/ui/RecipeList.jsx
  found: lead name link RecipeList.jsx:114-116 '<h2 className="home__lead-name"><Link to=... tabIndex={0}>{entry.name}</Link></h2>' and row name link RecipeList.jsx:233-235 '<h2 className="home__name"><Link ... tabIndex={0}>{entry.name}</Link></h2>'. Neither Link carries a className. The action links (RecipeList.jsx:175, 185, 188, 197, 200) carry className="home__action".
  implication: the name links can only be reached by descendant selectors on the h2.
- timestamp: 2026-09-29
  checked: app/src/styles/home.css
  found: '.home__lead-name a { color: inherit; }' (138-140) and '.home__name a { color: inherit; }' (240-242) are the only rules on the name anchors. '.home__action { ... display: inline-flex; ... min-height: var(--touch-min); ... }' (295-310) is the only touch floor in the file and applies at every pointer. The 759.98px block's comment (371-378) says "every action's own --touch-min floor already holds at every width", which covers actions only.
  implication: Home's floor was written per-class for the action pills; the name links were never given one.
- timestamp: 2026-09-29
  checked: app/src/styles/app.css:2312-2365, the (pointer: coarse) touch union
  found: the selector list is 'button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle' (2319-2326), '.text-control' (2328-2330) and '.method-step__uses-item, .method-step__strike-control' (2334-2337). There is no 'a' and no link class. The global 'a' rule (app.css:193-199) sets colour and underline only.
  implication: the app-wide floor is an allowlist of Sheet controls, and a link is never on it.
- timestamp: 2026-09-29
  checked: DESIGN.md:376 (responsive ladder, the pointer: coarse block)
  found: "Buttons, selects, ink fields, segmented options, defect toggles and text controls all take a 44px minimum height". Links are not named. DESIGN.md:415 and :507 ask only for "usable touch targets". DESIGN.md:372 says "Home keeps its own list-page cuts until it is measured the same way". DESIGN.md:499 still describes the retired list page ("plain links ... 12px between items").
  implication: the design record never extended the 44px floor to text links, and its Home description is stale.
- timestamp: 2026-09-29
  checked: .planning/phases/03.4-.../boards/project/Phone390Tabs.dc.html (board 171, "Home at 390 - bottom tab row")
  found: line 41 draws the row name as '<h3 style="...font-size: 19px..."><a href="#" style="text-decoration: none; color: inherit;">Olive Oil Ice Cream</a></h3>', a bare inline anchor with no height or padding. Line 25 draws the lead name as a plain h2 with no link at all. The action buttons (lines 32, 45) are 12px+12px padding pills.
  implication: the only board that draws Home at phone width draws an under-floor name link, and no lead-name link. 03.5-LADDER-CONFORMANCE.md "Open for Mark" item 1 confirms no sketch-011 board draws Home.
- timestamp: 2026-09-29
  checked: .planning/phases/03.4-.../03.4-04-PLAN.md:145 and :184; git log -S on home.css
  found: the plan says "Give both [actions] the App radius and the shared touch minimum" and "every action keeps the touch minimum". Nothing is said about the name link. Both '.home__name a' and the action's min-height landed in the same commit, 1c93199 (2026-09-21, feat(03.4-04)).
  implication: the omission dates from 03.4-04 and followed the plan's own scope.
- timestamp: 2026-09-29
  checked: app/src/styles/home.test.js
  found: no test pins a touch floor or min-height on .home__name a / .home__lead-name a. The .home__name and .home__lead-name tests pin wrapping only (65-93).
  implication: no gate existed for this class.
- timestamp: 2026-09-29
  checked: live DOM, built app on :4173, Chrome (playwright-core) with isMobile + hasTouch, 393x852, deviceScaleFactor 3. matchMedia('(pointer: coarse)') is true and --touch-min is 44px. Probe: scratchpad/home-links-probe.mjs
  found: lead 'Mexican Chocolate' h2.home__lead-name a 247.61x33 inline minH 0 (font 28px). Rows: 'Mexican Chocolate' 212.23x28, 'Olive Oil Ice Cream, circulator' 216.08x57 (2 line boxes), 'Pineapple' 108.97x28, 'Underbelly Light Base' 179.84x57 (2 lines), 'Coconut' 94.45x28, 'Mocha' 75.83x28, 'Standard Base' 161.81x28, 'Strawberry' 121.45x28. All are display:inline, min-height 0px, font 24px, line-height normal. Every visible .home__action is 44px (flex, min-height 44px). Hidden row secondaries are 0x0 (display:none at 759.98).
  implication: this reproduces the orchestrator's measurement exactly. A two-line name reads 57px only because two 28px line boxes stack; each line is still 28px.
- timestamp: 2026-09-29
  checked: same probe at 1366x852 coarse (the iPad landscape case)
  found: identical, with names 28px and the lead 33px
  implication: the defect is keyed on pointer, not width, so it affects the iPad too, not only the iPhone.
- timestamp: 2026-09-29
  checked: in-page CSS injection, no app edit (scratchpad/home-links-experiment.mjs, -experiment2.mjs). Links were scrolled into view before hit-testing ±20px from each name's centre.
  found: (a) '@media (pointer:coarse){ .home__name a, .home__lead-name a { min-height: var(--touch-min) } }' made no change: 28 stays 28 and the ±20px hits miss. (b) Adding 'display: inline-flex; align-items: center' with the min-height gives 44px (lead 44), the ±20px hits land, and each row grows 117 -> 132px (lead block 272.5 -> 282.5). (c) An overflowing ::after hit area (the wide-touch Clear pattern, app.css:2584-2593) leaves the box at 28px and the rows unchanged, and the ±20px hits land.
  implication: simply adding the links to the union's min-height list would be a no-op, because the box must stop being inline. The two working remedies trade layout growth against hit-area overlap.
- timestamp: 2026-09-29
  checked: overlap of remedy (c) with the action below at 393 (scratchpad/overlap.mjs)
  found: the name's bottom sits 3px above the action's top (row-gap --gap-hair plus h2 1px). A 44px ::after on a 28px box extends 8px down, and elementFromPoint at the action's top+3px returns the NAME LINK for 'Mexican Chocolate' and 'Pineapple'. For the two-line 'Olive Oil' the point lands on the action, because the box is taller than 44.
  implication: remedy (c) as-is steals about 5px of the action's hit area at 393. It needs a clipped or asymmetric extent, or the row gap must grow.

## Resolution

root_cause: "Home's recipe-name links (the Recipes rows at RecipeList.jsx:233-235 and the Pick up lead at RecipeList.jsx:114-116) are classless, display:inline anchors styled only by '.home__name a { color: inherit }' (home.css:240-242) and '.home__lead-name a { color: inherit }' (home.css:138-140). The app's coarse-pointer touch floor is an allowlist of control selectors (app.css:2319-2337: button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle, .text-control, two checkbox labels) that holds no link, and home.css floors only .home__action (home.css:300). So under a coarse pointer the name links keep their bare line-box height: 28px at the 24px row name, 33px at the 28px lead name. Contributing: no design authority ever named a text link as a floor recipient. Board 171 (Phone390Tabs.dc.html:41) draws the row name as a bare inline anchor and draws the lead name as no link at all (line 25). DESIGN.md:376 lists the coarse floor's recipients without links. 03.4-04-PLAN.md:145/184 asked for the touch minimum on actions only (commit 1c93199)."
fix: ""
verification: ""
files_changed: []
oracle_type: specified (UAT truth: 44px floor under a coarse pointer, --touch-min)
