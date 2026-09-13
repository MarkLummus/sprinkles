---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-09-13T01:41:36.084Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | quick | unrun-verify | app/src/styles/cross-cutting.test.js |  | Task 3 human measurement (44px targets, 6px gaps, compact 768px) recorded by executor; human confirmation deferred to end-of-phase UAT per human_verify_mode | open |  | 2026-09-13T01:41:36.084Z |  |

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
  }
]
````
