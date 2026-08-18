# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

The repository is empty — `git init` has been run on `main` with no commits and no files yet.
Everything below is the agreed starting shape, not a description of existing code.
**Update this file as real structure lands; do not let it drift into describing things that don't exist.**

## What this is

A web app: a static `index.html` entry point, CSS, and JS organized into a directory
structure, with React used via JSX for some of the UI. Not every part needs to be React —
plain modules are fine where React buys nothing.

## Hard constraints

**Do not copy files, directory layouts, or conventions from `../icecream/`.** That project
is a separate codebase with its own history; this one starts clean. Referencing it for
domain understanding is fine only if explicitly asked.

**Do not use gstack in this project.** The `/qa`, `/ship`, `/review`, `/autoplan`,
`/context-save`, `/plan-*-review`, `/browse`, and other gstack skills may appear in the
available-skills list because they are installed globally. They are out of scope here —
do not invoke them, do not create `.planning/`, `.claude/hooks/` mirroring, STATE.md
briefing machinery, or any other gstack scaffolding. If a task seems to call for one,
do the work directly instead.

## Open decision: JSX toolchain

Unresolved, and it determines the build and run commands. Do not silently pick one —
raise it when the first `.jsx` file is about to be written.

- **Vite build step** — `npm run dev` / `npm run build`, real bundling and HMR. Costs the
  "open `index.html` and it runs" property.
- **No build** — React + `@babel/standalone` from CDN, JSX transformed in the browser.
  Any static file server works; slower first paint, not production-grade.

## Commands

None yet — there is no `package.json` and no scripts. Once `index.html` exists it can be
served by any static file server; the actual command depends on the toolchain decision above.
Record commands here as they become real.

## Working agreement

Build this incrementally, a bit at a time. Prefer small, reviewable steps over large
scaffolds generated up front. When a step would commit the project to a structural
direction (routing, state management, build tooling, testing framework), surface the
choice rather than assuming one.
