# One fill for every on state

An Impeccable fix description for `/gsd-quick`. Impeccable decided; GSD executes. Nothing under `app/` is edited outside a GSD command.

**Decided:** Mark, 2026-09-16 — pen blue fills every on state. The record-versus-view distinction is carried by the control's label and location, not by a second fill colour.

## Why

Sketch 008 (`.planning/sketches/008-control-sheet/index.html`) is the authority and already settled this on 2026-09-14.

- **Line 230, the rubric:** "**A square and a word** record an independent yes or no (a checkbox, a defect, Show changes): the small square fills pen blue."
- **Line 373, the rule and its history:** "Variant A filled the whole word pen blue (D-21 as written); B, the leading square, was chosen 2026-09-14 because a pressed A looked like a plain text control."
- **Line 109:** `input[type="checkbox"]:checked { background: var(--pen-blue); border-color: var(--pen-blue); }`
- **Line 277:** "Show changes 32px tall at desktop, 44px below 760px, as the checkbox and a defect."

Sketch 003 line 33 carries the `.text-toggle` CSS and line 480 the markup (`class="text-control text-toggle"`).

The app ships three different treatments for that one rule:

| Control | Sketch 008 | App today |
|---|---|---|
| Checkbox — uses checklist, "Step 3, skipped" | pen-blue square | **solid ink square** (`app.css:157`) |
| Defect — `.chip-toggle` | pen-blue square | pen-blue square ✓ |
| Show changes | pen-blue square + word | **bold + 1px outline** (`app.css:432`) |

The checkbox is the most unambiguously *recorded* of the three — "Step 3, skipped" goes into the batch record — and it is the one filling ink. So the current state is not a coherent "ink for settings" scheme; it is drift in two directions, and it makes ink mean "recorded" on one control and something else on another.

Show changes is also the last control anywhere in the app still wearing the bold-plus-outline pressed state that sketch 008 retired. The three remaining bold-plus-outline rules (`.version-strip__item.is-current`, `.batch-margin__list li.is-open`, `.ingredient-table tbody tr.is-marked`) are **content** states, are correct, and must not be touched.

## Scope

Two controls, one shared token pair, the tests that pin them, and the design record.

### 1. Tokens — `app/src/styles/tokens.css`

Add the shared control height, following sketch 008 line 55's own derivation so one value stays one value:

```css
--control-h: var(--stop-h); /* 32px: segment options, defects, the checkbox label and Show changes share the cell height (sketch 008 line 55) */
```

`--stop-h` keeps its name and stays the axis stop's own token; `--control-h` is the general name that three other controls read.

**Rename `--size-defect-mark` to `--size-lead-mark`** (sketch 008 line 59's name), keeping `var(--size-mark-stop)` as its value. It is the 13px leading square shared by the defect and Show changes; a third alias for the same 13px is one too many. Update its one consumer, `.chip-toggle::before`, and the assertion at `binder.test.js:334`. *This rename is the one optional item in this brief — cut it and have `.text-toggle::before` read `--size-defect-mark`, at the cost of a token named for one control sizing two.*

### 2. Show changes — `app/src/ui/VersionRow.jsx`, `app/src/styles/app.css`

`VersionRow.jsx:223` — add `text-toggle` to the className:

```jsx
className="headnote__show-changes text-control text-toggle"
```

`app.css:428-436` — keep `.headnote__show-changes { margin-left: var(--gap-xs); }` and **delete** the `[aria-pressed='true']` bold-plus-outline rule entirely.

Add the `.text-toggle` block **immediately after `.text-control`'s own rules (currently ending line 96)**, transcribing sketch 008 lines 91-95. Source order matters: `.text-control` and `.text-toggle` are both `(0,1,0)`, both land on this element, and `.text-toggle` must win the `min-height`.

```css
.text-toggle {
  min-height: var(--control-h);
}

.text-toggle::before {
  content: '';
  display: inline-block;
  width: var(--size-lead-mark);
  height: var(--size-lead-mark);
  box-sizing: border-box;
  border: var(--rule-graduation) solid var(--ink);
  margin-right: var(--gap-xs);
  vertical-align: baseline;
}

.text-toggle[aria-pressed='true']::before {
  background: var(--pen-blue);
  border-color: var(--pen-blue);
}

/* the square carries the state; the underline stays hairline on a pressed
   toggle (sketch 008 line 94) */
.text-toggle[aria-pressed='true'],
.text-toggle[aria-pressed='true']:hover {
  text-decoration-thickness: var(--rule-ink-field);
}

.text-toggle:hover::before {
  border-width: var(--rule-hover);
}
```

The app carries state on the `aria-pressed` attribute, not the sketch's `.on` class — match `.chip-toggle`'s existing pattern, as written above.

No touch rule is needed: the touch union's `.text-control { min-height: var(--touch-min) }` already reaches this element at a coarse pointer, and wins by source order, giving the 44px sketch 008 line 277 asks for. Confirm this rather than assuming it.

### 3. Checkbox — `app/src/styles/app.css:146-158`

Bring the bare element rule up to sketch 008 lines 107-109:

```css
input[type='checkbox'] {
  appearance: none;
  width: var(--size-mark-stop);
  height: var(--size-mark-stop);
  margin: 0;
  border: var(--rule-graduation) solid var(--ink);
  border-radius: 0;
  background: none;
  box-sizing: border-box;
  cursor: pointer;
  flex: 0 0 auto;
}

input[type='checkbox']:hover {
  border-width: var(--rule-hover);
}

input[type='checkbox']:checked {
  background: var(--pen-blue);
  border-color: var(--pen-blue);
}
```

`box-sizing: border-box` matters for the same reason it did on `.axis-mark__stop`: without it the border adds onto the declared 13px. `flex: 0 0 auto` is the shrink guard for the two flex labels that hold these.

**Touch target.** Sketch 008 line 260 grows "the checkbox label", not the square. Add the two label wrappers to the touch union block (`@media (max-width: 759.98px), (pointer: coarse)`, currently line 2241):

```css
.method-step__uses-item,
.method-step__strike-control {
  min-height: var(--touch-min);
}
```

**Forced colours.** `input[type='checkbox']:checked` is currently absent from the `forced-colors: active` block (line 2414), so a checked box loses its fill with nothing standing in — while the other three picked controls are covered. Add both new fills to that block's first selector list:

```css
  input[type='checkbox']:checked,
  .text-toggle[aria-pressed='true']::before,
```

## Tests

- `app/src/styles/binder.test.js:70-74` — **replace**, don't amend. The rule it asserts ceases to exist. The replacement should assert the opposite: that no `.headnote__show-changes[aria-pressed='true']` rule exists, and that `.text-toggle[aria-pressed='true']::before` fills `--pen-blue` — mirroring the shape of the existing defect test at line 331, including its `expect(ruleFor(...)).toBeUndefined()` guard so the button itself never fills.
- `app/src/styles/binder.test.js:334` — follow the `--size-lead-mark` rename if it is taken.
- Add a checkbox test beside the defect one: `input[type='checkbox']:checked` fills `--pen-blue` with a matching border, and the checked box appears in the forced-colors block.
- `app/src/ui/VersionRow.test.jsx:414` asserts the `headnote__show-changes` class is present; extend it to assert `text-toggle` too.
- Leave the three content-state tests (`is-current`, `is-marked`, and the batch-list `is-open`) exactly as they are. They are not part of this change.

## Design record

Once the code lands, update both Impeccable artifacts — `DESIGN.md` records shipped code, so it is wrong the moment this ships:

- `DESIGN.md`, Components → The binder → Checkbox: "a 13px ink square, **filled solid ink when checked**" becomes filled pen blue, like every other on state.
- `DESIGN.md`, Components → The binder → Box or word: add the square-and-word third case, naming Show changes.
- `DESIGN.md`, Elevation & Depth: the 1px outline list currently includes "a pressed Show changes" — remove it; the list is content states only.
- `.impeccable/design.json`: `extensions.state.picked` already states the rule correctly and needs no change; add a `Text toggle` component entry beside `Defect toggle`, and correct the `Binder button` entry's checkbox description if it names ink.

## Verification

1. `npm --prefix app test` green.
2. In the running app at desktop width: open a version with a parent, press **Show changes** — a 13px square before the word fills pen blue, the word does not bold, no outline appears, the underline stays hairline, and nothing on the line moves. Hover thickens the square only. Tab to it — one 2px ink ring around square and word together.
3. Open a batch pen and check **Skipped** on a step — the square fills pen blue, not ink. Same for a row in the **Uses** checklist.
4. Emulate a coarse pointer: Show changes and both checkbox labels reach 44px.
5. Emulate `forced-colors: active`: all three fills repaint in the system `Highlight` and none of them vanishes.

## Out of scope

- The three content states carrying bold plus a 1px outline. They are correct.
- Any other control's fill, size or hover.
- The print sheet.
