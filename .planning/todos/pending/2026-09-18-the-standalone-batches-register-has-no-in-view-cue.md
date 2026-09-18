---
created: 2026-09-18T12:14:30.000Z
title: The standalone Batches register marks the batch in view with words alone
area: design
severity: minor
files:
  - app/src/ui/BatchRow.jsx
  - app/src/styles/app.css
---

## Problem

`BatchHistoryPanel` used to wrap the open batch's date in `<strong>`:

```jsx
{isOpenBatch ? (
  <><strong>{dateWords}</strong> <span className="history-register__marker">· In view</span></>
) : ...}
```

The typography pass (`dc097cf`) removed the `<strong>`, leaving:

```jsx
{isOpenBatch ? (
  <>{dateWords} <span className="history-register__marker">· In view</span></>
) : ...}
```

There is a stylesheet rule that would carry the state — `.history-register__item.is-current`
(`app.css:805`) — but no component applies `is-current` to a `history-register__item`. `BatchRow.jsx`
renders every entry as a plain `history-register__item`. So the rule is unreached and the entry in
view is now distinguished by the words "· In view" and nothing else.

## Why it matters

The words are the part that matters: form carries state, and a marker existing only as a style is
invisible to a screen reader and under forced colours. That principle is why the marker words exist
and it is not at risk here.

What changed is that a sighted maker scanning the register has no anchor. Every row reads identically
until the words are read one by one. The register's whole job is to let someone find where they are
in a list of near-identical dates.

`.history-register__item.is-current` sitting in the stylesheet with no caller is also dead CSS — it
was already recorded as a possible orphan during the 260918-a5l clean-up and left in place then,
because `BatchRow` might still have been intended to use it.

## Possible resolution, not decided

Three options, and they are not equivalent:

1. Apply `is-current` in `BatchHistoryPanel` and let the existing `app.css:805` rule do its job — the
   cheapest, if that rule's treatment is still wanted.
2. Give the entry the scoped outline the History outline's version node uses, so the two registers
   agree.
3. Decide the words are sufficient here and delete `.history-register__item.is-current` as dead.

This is the same question as
[the nested batch's dead state class](2026-09-18-recipe-history-batch-is-current-is-emitted-with-no-rule.md)
and should be answered once, for both. Mark's call — it is a design decision, not a defect with one
right answer.
