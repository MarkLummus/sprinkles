---
quick_id: 260916-0d4
slug: sr-6-the-date-input-takes-the-author-box
status: complete
date: 2026-09-16
files_modified:
  - app/src/styles/app.css
  - app/src/styles/binder.test.js
---

# SR-6 — the churn date takes the author box model on WebKit

The last device-bound gap from phase 03.3.1.1, closed with a cause established
on the device rather than inferred from a probe.

## What was actually wrong

While a date input keeps `appearance: auto`, WebKit renders it as a native
control and **ignores the author box model outright** — not one property of it.
Measured on Mark's iPad (iPadOS 18.7, WebKit 605.1.15, 1366 coarse, DPR 2):

| field | height | min-height | box-sizing | width |
|---|---|---|---|---|
| Churn date | **35** | **29px** | **content-box** | **142** |
| the three text fields | 44 | 44px | border-box | 56 |

All four carry `.ink-field`, which declares `min-height`, `border-box` and
`width: 100%`. The date input took none of them.

Chromium reports 44/44/border-box for all four with or without the fix, so it
could never see this. **That is why the earlier attempt was called done off a
standalone probe page while the real app still had the defect.**

## How it was established

A same-origin proxy in front of the vite dev server let a diagnostic page
iframe the **real app** and apply candidate fixes to its **real DOM** on the
device, posting measurements back. No replica, so no replica fidelity to get
wrong. Five candidates, run twice on the iPad:

| candidate | result |
|---|---|
| baseline | fail, −9 |
| **A: `appearance: none`** | **PASS, 0** |
| B: A + box-sizing | pass (superset of A) |
| C: box-sizing alone | **fail, −9** |
| D: B + explicit height | pass (superset) |
| E: D + min-width 0 | pass (superset) |

C failing is the informative one: forcing `box-sizing` changes nothing while
the native control is in charge.

## The fix

```css
input[type='date'].ink-field {
  -webkit-appearance: none;
  appearance: none;
}
```

Not a patch on height, width or box-sizing. It is what makes the existing
`.ink-field` rule apply at all — border-box, the `--touch-min` floor and
`width: 100%` all land the moment the native control stops overriding them.
The minimum change that solves the problem, which is why A shipped and not B–E.

The tapped date picker is unaffected: `appearance` governs the rendered box,
not the control's behaviour. **Worth confirming on the device**, since that is
the one claim here not yet measured.

## Test

`binder.test.js` pins the rule, with a comment saying plainly that the test
engine cannot reproduce what the test guards — deleting the rule will not fail
anything visible locally, it will silently restore a device-only defect.

941/941 tests, build clean.
