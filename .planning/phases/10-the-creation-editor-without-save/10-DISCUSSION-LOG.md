# Phase 10: The creation editor, without Save - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-19
**Phase:** 10-The creation editor, without Save
**Areas discussed:** Creation route and reload, Rows without steps, Leaving mid-creation, Proof and device check

---

## Creation route and reload

| Option | Description | Selected |
|--------|-------------|----------|
| /notebook/new | One fixed route, one draft at a time; reload reads the kept draft | ✓ |
| /notebook/:recipeId/:versionId | The draft's minted ids in the URL through RecipePageForRoute | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect to the Notebook | Silent replace-redirect when no draft exists | ✓ |
| Open a blank editor | Start a new creation with an empty name | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| The Notebook | Cancel deletes the draft and lands where New recipe was pressed | ✓ |
| Home | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| At Start | Start mints the ids and keeps a name-only draft at once | ✓ |
| On the first further ink | Nothing kept until the maker types more | |
| You decide | | |

**User's choice:** All four recommended options.

---

## Rows without steps

| Option | Description | Selected |
|--------|-------------|----------|
| Flat table, step hidden | As the board draws it; the portion keeps step 1 unseen | ✓ |
| Flat table with a 'Step 1' head | Departs from the board; goes to Sid | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| No code until Save | The headnote shows the name alone; Phase 11 mints the code | ✓ |
| Show the code while creating | Derived from the draft's versionId, unchecked for clashes | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Library catalog, live | rowFromLibraryRecord from the boot catalog each change; figures copied at Save | ✓ |
| Copy figures into the draft | Changes CREATE_DRAFT_KEYS | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Pen rules carry forward | Same parsing and messages as the version pen's grams field | ✓ |
| Empty rows hidden from Balance | | |
| You decide | | |

**User's choice:** All four recommended options.

---

## Leaving mid-creation

| Option | Description | Selected |
|--------|-------------|----------|
| Leave freely, draft kept | Flush on unmount; the Notebook shows Resume; no warning, no dialog | ✓ |
| Block like a dirty pen | Rail links and openers disable until Cancel | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Only while a write is pending | Warn only in the debounce window, "the same rule the pens use" | ✓ |
| Never while creating | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Refuse with the existing notice | On any route while a create draft is kept | ✓ |
| Refuse only on the creation route | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| No dialog, carry forward | Cancel deletes at once; page-scoped announcement | ✓ |
| Undo in the action row | | |
| You decide | | |

**Notes:** The question's premise about the tab-close warning was wrong: the pens register no `beforeunload` handler (Phase 4 D-17, pinned by `RecipePage.drafts.test.jsx`). Since Mark chose "the same rule the pens use", CONTEXT D-09a records no handler; a warning would be a separate decision reversing D-17.

---

## Proof and device check

| Option | Description | Selected |
|--------|-------------|----------|
| Walk must MATCH | Re-record at the base commit; no allow-list | ✓ |
| Tests only | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| One iPad check at 1366 | One check row from the production build | ✓ |
| Defer to Phase 12 | | |
| You decide | | |

| Option | Description | Selected |
|--------|-------------|----------|
| WebKit emulation only | 393 measured in Playwright WebKit; no iPhone row | ✓ |
| iPhone check too | | |
| You decide | | |

**User's choice:** All three recommended options.

---

## Todos

| Option | Description | Selected |
|--------|-------------|----------|
| None | All three keyword matches only | ✓ |
| Mise en Place auto-generator | | |
| Recipe book print format | | |

## Claude's Discretion

Plan slicing within the research's order; module homes and names; `RecipeSheet` creating props; the import-refusal wording for a kept creation.

## Deferred Ideas

A `beforeunload` warning while a write is pending; a drawn "Step 1" head; custom styles and machines; batch equipment steering; the Mise en Place auto-generator.
