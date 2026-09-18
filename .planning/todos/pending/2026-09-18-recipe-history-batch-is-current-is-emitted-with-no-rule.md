---
created: 2026-09-18T12:14:08.000Z
title: The nested batch in view carries a class no stylesheet answers
area: ui
severity: minor
files:
  - app/src/ui/RecipeHistory.jsx
  - app/src/styles/app.css
---

## Problem

`RecipeHistory.jsx` still marks the batch in view with a state class:

```jsx
<li className={isInView ? 'recipe-history__batch is-current' : 'recipe-history__batch'}>
```

The rule that answered it — `.recipe-history__batch.is-current { font-weight: 700 }` — was removed in
the typography pass (`dc097cf`), because the weight bled into the batch's authored outcome and
"Next time", which are prose and must not be re-weighted by a state.

Removing the weight was right. Removing the treatment entirely was not the same decision, and the
class was left behind. `grep is-current app/src/styles/app.css` now answers
`.history-register__item.is-current` and `.recipe-history__version.is-current`, but nothing for the
batch.

The version node next to it kept a treatment through exactly this problem — the outline is scoped to
`.recipe-history__version-sheet`, so it never reaches the nested branches:

```css
.recipe-history__version.is-current > .recipe-history__version-sheet {
  outline: var(--rule-graduation) solid var(--ink);
  outline-offset: var(--focus-outline-offset);
}
```

The same scoping is available to the batch — `.recipe-history__batch-head` holds the date and the
state, and no authored prose.

## Why it matters

Two entries in one outline now mark "in view" two different ways: the version by an outline plus the
word, the batch by the word alone. The words do carry the state, so nothing is unreadable or
inaccessible — this is a consistency defect, not a correctness one.

The dead class is the more mechanical half. A class emitted with nothing behind it invites the next
reader to assume a rule exists somewhere, and the previous round of this same review already caught
the mirror image of it on the version node.

## Possible resolution, not decided

Either scope the version's own treatment onto `.recipe-history__batch-head` so both entries mark the
state the same way, or drop `is-current` from the batch `<li>` and let the marker words stand alone.

Which one depends on how the two registers should relate — see
[the standalone Batches register's own in-view cue](2026-09-18-the-standalone-batches-register-has-no-in-view-cue.md),
which lost its emphasis in the same pass. The three are one design question: how does a record say
"you are looking at me" in each place it can be listed? Mark's call.
