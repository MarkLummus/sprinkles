# Phase 9: The library and the stored shapes, plus the two places - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-17
**Phase:** 9-The library and the stored shapes, plus the two places
**Areas discussed:** Core scales and problems as rows, How the Sheet code is made, Which library entries ship, Search / styles / machines

---

## Core scales and problems as rows

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, both are tables | Six scales and four problems are seeded rows; pen, reading and log read them | ✓ |
| Only the six declared-able scales | Core scales and problems stay in code | |
| No, only machines, styles and the library | Core constants stay | |

**User's choice:** Yes, both are tables.

| Option | Description | Selected |
|--------|-------------|----------|
| Loaded once at boot, passed in | Domain stays pure; edit shows after reload | ✓ |
| Each screen reads them when it opens | Every consumer async | |
| You decide | Planner chooses within purity rule | |

**User's choice:** Loaded once at boot, passed in.

## How the Sheet code is made

| Option | Description | Selected |
|--------|-------------|----------|
| Derived once from the version id | Same alphabet and grouping, checked for clashes, stored | ✓ |
| Random, then checked | Random 40-bit code, re-drawn on clash | |

**User's choice:** Derived once from the version id.

| Option | Description | Selected |
|--------|-------------|----------|
| The code each prints today | Seeded versions keep content-derived codes | ✓ |
| New codes from the new rule | Printed sheets stop matching | |

**User's choice:** The code each prints today.

| Option | Description | Selected |
|--------|-------------|----------|
| The stored code on each version | Search reads the field | ✓ |
| A separate code index | Extra store | |

**User's choice:** The stored code on each version.

## Which library entries ship

| Option | Description | Selected |
|--------|-------------|----------|
| All 103, merged with the 26 | App values win on same-ingredient clashes | ✓ |
| A reviewed subset | Mark marks which ship | |

**User's choice:** All 103, merged with the 26.

| Option | Description | Selected |
|--------|-------------|----------|
| The dataset's own ids, camelCased | Readable; clash test against the 26 | ✓ |
| Generated ids | Random | |

**User's choice:** The dataset's own ids, camelCased.

| Option | Description | Selected |
|--------|-------------|----------|
| Source text and a basis per figure | As the existing 26 | ✓ |
| One source line per entry only | Single string | |

**User's choice:** Source text and a basis per figure.

## Search, styles and machines

| Option | Description | Selected |
|--------|-------------|----------|
| As the board draws it | Contains, any case, exact category, A to Z | ✓ |
| The research's smarter search | Accent folding, all words, prefix rank | |

**User's choice:** As the board draws it.

| Option | Description | Selected |
|--------|-------------|----------|
| Plain ids on the style for now | No equipment-class or calibration-family tables | ✓ |
| Two more seed tables now | Bigger Phase 9 | |

**User's choice:** Plain ids on the style for now.

| Option | Description | Selected |
|--------|-------------|----------|
| A copy of the row's values | Version stores name, min and max fill | ✓ |
| A link to the machine row | Reads table live | |

**User's choice:** A copy of the row's values.

## Claude's Discretion

Table and store names, the catalog's shape, the converter's field mapping, the upgrade proof, the scale definition's field names.

## Deferred Ideas

Equipment-class and calibration-family tables; a smarter search; maker-added machines, styles, scales and problems.
