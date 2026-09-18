// home.css's own token-discipline contract (The Sprinkles Jar, route.md,
// 260918-gha). binder.test.js and cross-cutting.test.js read app.css,
// history.css and tokens.css as TEXT — they never read home.css, which
// is what lets home.css carry a radius, a fill and a transition (route.md
// § 1: the no-motion/no-shadow/no-radius binder does not cross the paper
// frame) — and it is also why this file has to exist, or the token
// discipline goes unenforced on the new stylesheet.
//
// Same no-layout-engine caveat as binder.test.js and cross-cutting.test.js:
// this suite runs under Vitest's default `node` environment and reads the
// source AS TEXT. It cannot prove a pixel rendered; that stays a real-
// browser human check.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import { readAllRules } from './css-source.js';

const STYLES_DIR = path.dirname(fileURLToPath(import.meta.url));
const HOME_CSS_PATH = path.join(STYLES_DIR, 'home.css');
const MAIN_JSX_PATH = path.join(STYLES_DIR, '..', 'main.jsx');

const homeCssSource = readFileSync(HOME_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');

// readAllRules runs assertNoAtRules for us: a non-media at-rule, or an
// at-rule nested inside the one top-level @media block, throws here at
// import time rather than being silently mis-parsed.
const rules = readAllRules(homeCssSource);

describe('home.css — no visual literal, every value a var() read (GUARD-05)', () => {
  test('no declaration contains a hex colour', () => {
    expect(homeCssSource).not.toMatch(/:[^;{}]*#[0-9a-fA-F]{3,8}/);
  });

  test('no declaration contains a bare px value', () => {
    for (const rule of rules) {
      expect(rule.declarations).not.toMatch(/:\s*-?\d+(?:\.\d+)?px/);
    }
  });

  test('every rule is scoped under the .home root class', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      // body:has(.home) is the one documented exception (fix round 1):
      // it has to key off .home from the body element itself to reach
      // the route-level ground all the way to the viewport edge, which
      // no selector rooted AT .home can do. Every other rule is scoped
      // exactly as before.
      expect(
        rule.selector.startsWith('.home') || rule.selector === 'body:has(.home)',
        `expected "${rule.selector}" to be scoped under .home`,
      ).toBe(true);
    }
  });

  test('the only @media condition in home.css is the named touch step-down (css-source.js parses one level of nesting)', () => {
    const mediaConditions = new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media));
    expect([...mediaConditions]).toEqual(['(max-width: 759.98px)']);
  });

  test('the route-level ground reaches the whole viewport (fix round 1: no cream frame around a white card)', () => {
    const bodyRule = rules.find((rule) => rule.selector === 'body:has(.home)');
    expect(bodyRule, 'expected a body:has(.home) rule declaring the route-level ground').toBeTruthy();
    expect(bodyRule.declarations).toMatch(/background:\s*var\(--home-ground\)/);
  });

  test('OWN-WORLD is one grotesk (route.md § 3): the title and the recipe name read --face-grotesk, never --face-text', () => {
    const titleRule = rules.find((rule) => rule.selector === '.home__title');
    const nameRule = rules.find((rule) => rule.selector === '.home__name');
    expect(titleRule, 'expected a .home__title rule').toBeTruthy();
    expect(nameRule, 'expected a .home__name rule').toBeTruthy();
    expect(titleRule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
    expect(nameRule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
  });

  test('the text face survives on exactly one rule — the batch\'s own words in pen blue (route.md § 1: the record keeps its voice)', () => {
    const textFaceRules = rules.filter((rule) => /font-family:\s*var\(--face-text\)/.test(rule.declarations));
    expect(textFaceRules.map((rule) => rule.selector)).toEqual(['.home__words']);
  });
});

describe('home.css is wired in (main.jsx, 260917-h83 precedent)', () => {
  test('main.jsx imports home.css after app.css, the position history.css already established', () => {
    const appCssIndex = mainJsxSource.indexOf('./styles/app.css');
    const homeCssIndex = mainJsxSource.indexOf('./styles/home.css');
    expect(appCssIndex).toBeGreaterThan(-1);
    expect(homeCssIndex).toBeGreaterThan(-1);
    expect(appCssIndex).toBeLessThan(homeCssIndex);
  });
});
