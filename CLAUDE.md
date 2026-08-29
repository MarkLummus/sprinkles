# CLAUDE.md

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Status

The web app has not been started — no `index.html`, no CSS, no JS, no `package.json` at the root.
That part of this file is still the agreed starting shape, not a description of existing code.

**Remove the Status section from this file as real structure lands; do not let it drift into describing things that don't exist.**

## What this is

A web app with React used via JSX for some of the UI. Not every part needs to be React —
plain modules are fine where React buys nothing.

## JSX toolchain: Vite

React with JSX, bundled by Vite — `npm run dev` / `npm run build`.
The alternative (React + `@babel/standalone` from CDN, no build) was considered and rejected;
the project accepts losing the "open `index.html` and it runs" property in exchange for real
bundling and HMR.

## Working agreement

Build this incrementally, a bit at a time. Prefer small, reviewable steps over large
scaffolds generated up front. When a step would commit the project to a structural
direction (routing, state management, build tooling, testing framework), surface the
choice rather than assuming one.
