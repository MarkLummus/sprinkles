# DESIGN.md — the hand: draft for review

Six edits. Each names the anchor text in the current DESIGN.md and the text to put in its place or after it. Direction is stated as approved; implementation is stated as pending, following the file's own distinction.

---

## 1. Typography › Scope paragraph

**Replace the sentence**

> No handwriting font is selected by this merge.

**with**

> One handwriting face is approved for the app context and reserved for the maker's own words; see the Hand role and the Hand Rule below. It is not a paper face: on a Recipe Sheet, in a batch record, and in print, the maker's words stay in the text face and pen blue.

---

## 2. Typography › Hierarchy — add after the **Note** entry

> - **Hand** (400, 1.375rem, leading 1.25, pen blue) — *approved, implementation pending*: the maker's own words in the app context — a tasting, a Next time, a version's Why, a batch's note, an idea in the log. Never below 1.25rem, because a script face loses its letterforms before a text face does. Never uppercase, never bold, never a label. Under `forced-colors: active` and in print the role falls back to the text face in italic, so the words survive where the face does not. Proposed face: Caveat (SIL Open Font License), shipped as a file in the repo and declared with one `@font-face`; no font is fetched from a network. Proposed tokens: `--face-hand`, `--size-hand`, `--leading-hand`, `--size-hand-min`. The entry moves out of *pending* when those tokens exist and the fallback is verified in both modes.

---

## 3. Typography › Named Rules — add after **The Placeholder Rule**

> **The Hand Rule.** In the app context, what the maker observed is written in the hand, in pen blue: a tasting, a Next time, a Why, a note on a batch, an idea. What the maker specified — ingredients, method, quantities, dates, names — is set in type, because a specification is not an observation. What the app writes is set in type, always, so the hand never speaks in the app's voice and a machine suggestion is never mistaken for the maker's judgement. A question the maker typed to an expert is set in type; it is the maker's, but it is not an observation. The hand is a face, not a colour rule: it is always pen blue, but pen blue is not always the hand.

---

## 4. Colors › Secondary › Pen Blue — add a sentence at the end of the bullet

> In the app context pen blue has one use only: the maker's own words, set in the hand. Recipe-level metadata, provenance, dates and standing are ink or mute in the app even when they describe a record.

---

## 5. Do's and Don'ts

**Add to Do:**

> - **Do** set the maker's observations in the hand and pen blue in the app context, at or above the hand's minimum size, with the text-face fallback in place for forced colours and print.

**Add to Don't:**

> - **Don't** put a specification, a label, a date, a heading, or anything the app wrote in the hand, and don't load the hand's file from a network.

---

## 6. Frontmatter › typography — add when the tokens are implemented, not before

```yaml
  hand:
    fontFamily: "'Caveat', Georgia, 'Iowan Old Style', 'Times New Roman', serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.25
    color: "{colors.pen-blue}"
```

The frontmatter is normative and records implemented values; this block is the target shape, held out of the file until `tokens.css` carries the tokens and the fallback has been seen in forced-colours mode and on paper.

---

## Open for you to decide

- **The face.** Caveat is the stand-in the boards use. It is legible, free to ship, and reads as a real hand rather than a script. If you have a face you prefer, the rule does not change.
- **The expert's question.** The draft sets it in type. If you would rather everything you typed be in the hand, strike the sentence in the Hand Rule and it becomes "what the maker wrote" rather than "what the maker observed".
- **Ideas.** The draft includes them in the hand. An idea is your words but not strictly an observation; it is the one item on the list that the rule's own wording does not quite cover.
