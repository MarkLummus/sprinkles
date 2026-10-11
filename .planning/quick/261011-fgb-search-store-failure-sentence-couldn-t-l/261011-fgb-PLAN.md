---
phase: quick
plan: 261011-fgb
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/SheetCodeSearch.jsx
  - app/src/ui/SheetCodeSearch.test.jsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "When the saved versions cannot be read, the Search page says exactly: Couldn’t look up that code. Try again."
    - "No storage words appear in the message (Mark: decide-sheet-code-store-error-wording-2 = look-up)"
  artifacts:
    - path: app/src/ui/SheetCodeSearch.jsx
      provides: "SHEET_CODE_STORE_ERROR with the new sentence"
  key_links: []
---

<objective>
Replace the Search page's store-failure sentence. Mark disliked storage words in a user message and chose "Couldn’t look up that code. Try again."
</objective>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Change SHEET_CODE_STORE_ERROR and its pinning test</name>
  <files>app/src/ui/SheetCodeSearch.jsx, app/src/ui/SheetCodeSearch.test.jsx</files>
  <action>
    1. Tests first: in app/src/ui/SheetCodeSearch.test.jsx lines ~222-223, change both expected strings from 'Could not open the local store. Try reloading.' to 'Couldn’t look up that code. Try again.' (typographic apostrophe U+2019, as the app's other "Couldn’t" sentences). Run `npm --prefix app test -- src/ui/SheetCodeSearch.test.jsx` and see it fail.
    2. In app/src/ui/SheetCodeSearch.jsx line 14 change the constant to the same string. Run the file again and see it pass.
    3. Check `grep -rn "Could not open the local store" app/src` still matches only app/src/main.jsx (the boot line, which stays) and nothing in SheetCodeSearch files.
    4. Run the full suite once: `npm --prefix app test`.
    5. Commit the two files only, with explicit pathspecs (never git add -A; .planning/state.json and a 03.6 .gitkeep are unrelated and uncommitted).
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/SheetCodeSearch.test.jsx</automated>
  </verify>
  <done>The constant and test carry the new sentence; the full suite passes; one commit touches only the two files.</done>
</task>
</tasks>
