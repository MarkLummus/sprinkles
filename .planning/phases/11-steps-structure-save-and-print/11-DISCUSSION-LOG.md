# Phase 11: Steps, structure, save and print - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-26
**Phase:** 11-steps-structure-save-and-print
**Areas discussed:** Edit on a saved first version, What Save refuses, Unplaced rows and empty sections after Save, Focus, keyboard and struck values, Proof and device check, Notebook row and Save-over notice, Chooser keys, Stale edit

---

## Todos matched to the phase

| Option | Description | Selected |
|--------|-------------|----------|
| Preview step link (already in sketch 014) | Fold as a decision the plans cite (013 decision 34) | ✓ |
| Add ingredient on heading row (already in 014) | Fold as a decision the plans cite (013 decision 31) | ✓ |
| Recipe book print format | A second print format; not MAKE-12's bench sheet | |
| Mise en place auto-generator | New capability | |

**User's choice:** fold the two drawn todos; leave the other two deferred.

---

## Edit on a saved first version

| Option | Description | Selected |
|--------|-------------|----------|
| /notebook/:recipeId/:versionId/edit | Its own route; Cancel and Save land on the page | ✓ |
| Reuse /notebook/new | One editor route; conflicts with "the one kept creation" | |
| In place on the recipe page | Mode switch on the same URL | |

| Option | Description | Selected |
|--------|-------------|----------|
| Kept create-shaped draft | Keyed by the version id, marked as an edit; survives a closed tab | ✓ |
| No kept draft | In memory only | |
| Reuse the version pen's draft kind | Collides with a Next version pen | |

| Option | Description | Selected |
|--------|-------------|----------|
| Replace content, keep identity | Same id, Sheet code, createdAt; no History node | ✓ |
| Replace content and stamp an edited date | New field on the version | |
| Save as a new version | Contradicts decision 12 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Import refused; Next version and batch recording hidden | Edit reads Resume editing until Save or Cancel | ✓ |
| Import refused only | Pens stay available | |
| Nothing held off | Resolve at Save | |

**User's choice:** the recommended option each time.

---

## What Save refuses

| Question | Options | Selected |
|----------|---------|----------|
| Blank or unreadable grams | Refuse, message under the row / Allow as 0 g / Drop the row silently | Refuse, message under the row |
| Rows no step uses | Allow / Refuse once any step exists / Always refuse until placed | Allow |
| Empty step fields or half targets | Refuse with Required / Refuse empty fields, drop half targets / Allow, trimming empties | Refuse with Required |
| No ingredient rows | Refuse "Add at least one ingredient." / Allow a rows-less recipe | Refuse |

---

## Unplaced rows and empty sections after Save

| Question | Options | Selected |
|----------|---------|----------|
| The head word once saved | "Not in a step yet" everywhere / "Not in a step" once saved / Keep "Unallocated" | "Not in a step yet" everywhere |
| Empty Targets, Equipment, Process on print | Omit the section and its heading / Print the heading with a dash | Omit |

---

## Focus, keyboard and struck values

| Question | Options | Selected |
|----------|---------|----------|
| Focus after remove on a step | Next step's lead-in, else previous, else Add step / The Instructions heading / The previous step's Add step | Next, else previous, else Add step |
| Focus after Move up or Move down | Same button of the moved item / The moved item's first field | Same button |
| Focus after remove on a row | Next row's remove, else previous, else Add ingredient / The Ingredients heading / Keep Phase 10's behaviour | Next, else previous, else Add ingredient |
| Struck target values in the tag row | Old value struck before the new, inside the tag / Whole tag struck, new tag beside / Keep the chip for struck tags | Old struck before the new, inside the tag |

---

## Proof and device check

| Option | Description | Selected |
|--------|-------------|----------|
| Walk with an allow-list for the new routes, one iPad check | Export-first row before that build; Move focus probed on the iPad | ✓ |
| Walk only, device check later | WebKit in Playwright stands in | |
| Two iPad checks | Steps and structure first, then Save and print | |

---

## Second round

| Question | Options | Selected |
|----------|---------|----------|
| The Notebook while an edit is kept | The recipe's row gains Resume editing / A draft row at the top / Nothing | The recipe's row gains Resume editing |
| Notice after Save-over | "Changes saved." / "Recipe saved." both times / No notice | "Changes saved." |
| Add to step chooser keys | Escape cancels, focus on Cancel on open / Only the drawn controls | Escape cancels, focus on Cancel |
| Save-over on a version that gained a batch or child | Refuse, keep the draft, say why / Save anyway / Discard silently | Refuse, keep the draft, say why |

**Notes:** Mark chose "Explore more gray areas" once, then "I'm ready for context".

## Claude's Discretion

Module homes and names for the step and structure ops and the edit route; the exact refusal and announcement sentences; how the print omits empty sections and places the "Not in a step yet" head; the walk's allow-list shape.

## Deferred Ideas

The Recipe book print format; an edited-date on a saved first version; the mise en place auto-generator; the phone-jobs brief (parked on Mark's List).
