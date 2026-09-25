---
schema_version: 1
open_count: 11
waived_count: 0
fixed_count: 0
total_count: 11
last_updated: 2026-09-25T12:45:51.264Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | quick | unrun-verify | app/src/styles/cross-cutting.test.js |  | Task 3 human measurement (44px targets, 6px gaps, compact 768px) recorded by executor; human confirmation deferred to end-of-phase UAT per human_verify_mode | open |  | 2026-09-13T01:41:36.084Z |  |
| 2 | quick-260917-odu | unrun-verify | app/src/ui/VersionRow.jsx |  | Orchestrator ran the 1024/393 browser check on a four-version, two-branch store: counts, markers, dead controls, root card and no-overflow all confirmed. What remains is Mark's own eye — whether the relocated Versions (n) control reads right on its own line below the dl, and whether Version/Versions on one screen reads as a set name rather than a stutter — plus a forced-colours and screen-reader pass | open |  | 2026-09-17T23:02:52.034Z |  |
| 3 | quick-260917-vev | unrun-verify | app/src/styles/app.css |  | Forced-colours pass on the history register verified structurally, not emulated: the (forced-colors: active) block at app.css:2625 names no register selector and no register rule sets forced-color-adjust: none, so every marker is a word and every rule a system-repainted border. Not confirmed live. Also unconfirmed by eye: whether the register reads as a chronology rather than a table, and a screen-reader pass over the two panels. | open |  | 2026-09-18T03:05:56.382Z |  |
| 4 | quick-260918-cdg | unrun-verify | app/src/styles/history.css |  | RTL browser measurement deferred to end-of-phase UAT: with dir=rtl at narrow width, confirm outcome/next-time/empty-state paragraphs indent from the right edge alone with a flush left edge, and confirm nothing moved at LTR (no paragraph gained a bottom margin) — none of the three style-contract suites has a layout engine | open |  | 2026-09-18T13:10:29.743Z |  |
| 5 | quick-260918-gha | unrun-verify | app/src/ui/RecipeList.jsx |  | Task 3's <human-check> (compare http://localhost:5173/ against route.sketch.html at desktop and at 393px/coarse pointer) not run — no browser-automation tool available to this executor; deferred to end-of-phase UAT with Mark. | open |  | 2026-09-18T16:15:37.298Z |  |
| 6 | 03.4 | deviation | .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-GAPS-CONFORMANCE.md |  | Four recorded board departures (12px tab label, rod/tally at phone width, absent page-preview glyph, no versions-count cell) open for Mark at UAT | open |  | 2026-09-22T03:11:36.417Z |  |
| 7 | 03.4 | deviation | app/src/styles/shell.css |  | Rail (.shell__rail) carries no padding and no border-right vs board 170's 8/20/32/30 padding and 1px divider - new conformance finding, 03.4-GAPS-CONFORMANCE.md row 3 | open |  | 2026-09-22T03:12:14.913Z |  |
| 8 | 03.4 | deviation | app/src/styles/shell.css |  | Rail's active-item (aria-current=page) has no border-radius pill or bold weight vs board 170's 8px radius/600 weight - new conformance finding, 03.4-GAPS-CONFORMANCE.md row 4 | open |  | 2026-09-22T03:12:14.985Z |  |
| 9 | 03.4 | deviation | app/src/ui/RecipeList.jsx |  | RowActions always renders both filled+secondary actions at every width; board 171's row shows only the filled action at 393px - new conformance finding, 03.4-GAPS-CONFORMANCE.md row 32 | open |  | 2026-09-22T03:12:15.056Z |  |
| 10 | 03.5 | unrun-verify | app/src/ui/RecipeHistory.jsx |  | Real-browser side-by-side check of the History rail against 1600-batch.html/1600-no-batch.html/1600-long-history.html/1600-pen.html — no browser-automation tool available inside this worktree; deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase | open |  | 2026-09-25T12:06:20.582Z |  |
| 11 | 03.5 | unrun-verify | .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-06-PLAN.md |  | Plan 03.5-06 verification bullet 2: the built app's olive oil Sheet at every state (reading/pen/record/show-changes) against the sketch boards, the pen's one-step-open/Cancel/Done behaviour, and the total's as-made hand values -- needs a real layout engine this worktree had no browser-automation tool for; deferred to end-of-phase UAT (workflow.human_verify_mode: end-of-phase). | open |  | 2026-09-25T12:45:51.264Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "quick",
    "file": "app/src/styles/cross-cutting.test.js",
    "line": null,
    "description": "Task 3 human measurement (44px targets, 6px gaps, compact 768px) recorded by executor; human confirmation deferred to end-of-phase UAT per human_verify_mode",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-13T01:41:36.084Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "unrun-verify",
    "phase": "quick-260917-odu",
    "file": "app/src/ui/VersionRow.jsx",
    "line": null,
    "description": "Orchestrator ran the 1024/393 browser check on a four-version, two-branch store: counts, markers, dead controls, root card and no-overflow all confirmed. What remains is Mark's own eye — whether the relocated Versions (n) control reads right on its own line below the dl, and whether Version/Versions on one screen reads as a set name rather than a stutter — plus a forced-colours and screen-reader pass",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-17T23:02:52.034Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "quick-260917-vev",
    "file": "app/src/styles/app.css",
    "line": null,
    "description": "Forced-colours pass on the history register verified structurally, not emulated: the (forced-colors: active) block at app.css:2625 names no register selector and no register rule sets forced-color-adjust: none, so every marker is a word and every rule a system-repainted border. Not confirmed live. Also unconfirmed by eye: whether the register reads as a chronology rather than a table, and a screen-reader pass over the two panels.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-18T03:05:56.382Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "quick-260918-cdg",
    "file": "app/src/styles/history.css",
    "line": null,
    "description": "RTL browser measurement deferred to end-of-phase UAT: with dir=rtl at narrow width, confirm outcome/next-time/empty-state paragraphs indent from the right edge alone with a flush left edge, and confirm nothing moved at LTR (no paragraph gained a bottom margin) — none of the three style-contract suites has a layout engine",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-18T13:10:29.743Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 5,
    "kind": "unrun-verify",
    "phase": "quick-260918-gha",
    "file": "app/src/ui/RecipeList.jsx",
    "line": null,
    "description": "Task 3's <human-check> (compare http://localhost:5173/ against route.sketch.html at desktop and at 393px/coarse pointer) not run — no browser-automation tool available to this executor; deferred to end-of-phase UAT with Mark.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-18T16:15:37.298Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "03.4",
    "file": ".planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-GAPS-CONFORMANCE.md",
    "line": null,
    "description": "Four recorded board departures (12px tab label, rod/tally at phone width, absent page-preview glyph, no versions-count cell) open for Mark at UAT",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-22T03:11:36.417Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 7,
    "kind": "deviation",
    "phase": "03.4",
    "file": "app/src/styles/shell.css",
    "line": null,
    "description": "Rail (.shell__rail) carries no padding and no border-right vs board 170's 8/20/32/30 padding and 1px divider - new conformance finding, 03.4-GAPS-CONFORMANCE.md row 3",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-22T03:12:14.913Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "03.4",
    "file": "app/src/styles/shell.css",
    "line": null,
    "description": "Rail's active-item (aria-current=page) has no border-radius pill or bold weight vs board 170's 8px radius/600 weight - new conformance finding, 03.4-GAPS-CONFORMANCE.md row 4",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-22T03:12:14.985Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 9,
    "kind": "deviation",
    "phase": "03.4",
    "file": "app/src/ui/RecipeList.jsx",
    "line": null,
    "description": "RowActions always renders both filled+secondary actions at every width; board 171's row shows only the filled action at 393px - new conformance finding, 03.4-GAPS-CONFORMANCE.md row 32",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-22T03:12:15.056Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 10,
    "kind": "unrun-verify",
    "phase": "03.5",
    "file": "app/src/ui/RecipeHistory.jsx",
    "line": null,
    "description": "Real-browser side-by-side check of the History rail against 1600-batch.html/1600-no-batch.html/1600-long-history.html/1600-pen.html — no browser-automation tool available inside this worktree; deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-25T12:06:20.582Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 11,
    "kind": "unrun-verify",
    "phase": "03.5",
    "file": ".planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-06-PLAN.md",
    "line": null,
    "description": "Plan 03.5-06 verification bullet 2: the built app's olive oil Sheet at every state (reading/pen/record/show-changes) against the sketch boards, the pen's one-step-open/Cancel/Done behaviour, and the total's as-made hand values -- needs a real layout engine this worktree had no browser-automation tool for; deferred to end-of-phase UAT (workflow.human_verify_mode: end-of-phase).",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-25T12:45:51.264Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
