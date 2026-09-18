---
schema_version: 1
open_count: 4
waived_count: 0
fixed_count: 0
total_count: 4
last_updated: 2026-09-18T13:10:29.743Z
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
  }
]
````
