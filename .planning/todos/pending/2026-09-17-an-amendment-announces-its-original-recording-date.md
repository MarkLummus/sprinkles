---
created: 2026-09-17T16:40:00.000Z
title: An amendment announces the batch's original recording date, not the amendment
area: ui
severity: minor
files:
  - app/src/ui/RecipePage.jsx
---

## Problem

The batch save's page-scoped confirmation is built by one helper:

```js
export function batchSavedStatus(record) {
  return `recorded ${formatRecordDate(record.recordedAt)} against ${record.snapshot.versionLabel}`;
}
```

Both save paths call it — the new record, and the amendment. But `completeRecord` preserves
`recordedAt` and stamps `changed: now`, so amending an older batch announces the date it was
**originally recorded**, not the amendment that just happened.

Amending the 2 Aug batch today announces *"recorded 4 Aug 2026 against 50 g oil · 800 g"*. Nothing in
that sentence confirms the amendment saved. The maker pressed Save on a correction and was told about
an event from six weeks ago.

Not caught by the browser check at the time because the test batch had been recorded the same day, so
`recordedAt` and `changed` read identically.

## Why it matters

The confirmation exists because saving is the one act on this surface that cannot be re-made. An
amendment is a second irreversible write, and it currently gets a sentence about a different event.

The vocabulary already exists elsewhere: the batch row's read view prints RECORDED and CHANGED as
separate rows, and `route-recipe-batch.md` § 6 says "an amendment states its date the same way" —
naturally read as the amendment's own date.

## Possible resolution, not decided

Branch on `record.changed` inside `batchSavedStatus`, which is already the discriminator the read
view uses (`createBatch` writes `changed: null`; `completeRecord` stamps it). Something in the shape
of "changed 17 Sep 2026 against 50 g oil · 800 g" for the amend path, keeping "recorded …" for a
first save.

The exact wording is a copy decision and Mark's to make — it is one line of code once the sentence is
chosen.
