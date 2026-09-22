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
const RECIPE_LIST_JSX_PATH = path.join(STYLES_DIR, '..', 'ui', 'RecipeList.jsx');

const homeCssSource = readFileSync(HOME_CSS_PATH, 'utf8');
const mainJsxSource = readFileSync(MAIN_JSX_PATH, 'utf8');
const recipeListJsxSource = readFileSync(RECIPE_LIST_JSX_PATH, 'utf8');

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

  test('every rule is scoped under the .home root class, with no exception (gap 3: the shell paints the App ground for every route now, not just this one)', () => {
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.selector.startsWith('.home'), `expected "${rule.selector}" to be scoped under .home`).toBe(true);
    }
  });

  test('the only @media condition in home.css is the named touch step-down (css-source.js parses one level of nesting)', () => {
    const mediaConditions = new Set(rules.filter((rule) => rule.media !== undefined).map((rule) => rule.media));
    expect([...mediaConditions]).toEqual(['(max-width: 759.98px)']);
  });

  test('OWN-WORLD is one grotesk (route.md § 3): the title and the recipe name read --face-grotesk, never --face-text', () => {
    const titleRule = rules.find((rule) => rule.selector === '.home__title');
    const nameRule = rules.find((rule) => rule.selector === '.home__name');
    const leadNameRule = rules.find((rule) => rule.selector === '.home__lead-name');
    expect(titleRule, 'expected a .home__title rule').toBeTruthy();
    expect(nameRule, 'expected a .home__name rule').toBeTruthy();
    expect(leadNameRule, 'expected a .home__lead-name rule').toBeTruthy();
    expect(titleRule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
    expect(nameRule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
    expect(leadNameRule.declarations).toMatch(/font-family:\s*var\(--face-grotesk\)/);
  });

  test('no rule in home.css declares the text face or the hand face — the hand is a role class in app.css, plan 02 (D-18)', () => {
    const textOrHandFaceRules = rules.filter((rule) => /font-family:\s*var\(--face-(text|hand)\)/.test(rule.declarations));
    expect(textOrHandFaceRules).toEqual([]);
  });

  test("RecipeList.jsx's source carries the hand role class exactly once, so plan 02's rule has exactly one renderer (D-18, D-20)", () => {
    const matches = recipeListJsxSource.match(/\bapp-hand\b/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  test('the filled and secondary actions each carry a single-class selector that can outrank the rewritten visited rule (gap 4)', () => {
    const actionRule = rules.find((rule) => rule.selector === '.home__action');
    const secondaryRule = rules.find((rule) => rule.selector === '.home__action--secondary');
    expect(actionRule, 'expected a .home__action rule').toBeTruthy();
    expect(secondaryRule, 'expected a .home__action--secondary rule').toBeTruthy();
    expect(actionRule.declarations).toMatch(/background:\s*var\(--app-blue-text\)/);
    expect(actionRule.declarations).toMatch(/color:\s*var\(--app-background\)/);
    expect(secondaryRule.declarations).toMatch(/color:\s*var\(--app-blue-text\)/);
    expect(actionRule.declarations).toMatch(/box-sizing:\s*border-box/);
  });

  test('the row\'s rail and tally read a destination accent token, never a per-recipe custom property (D-11, 03.4-04 Task 2)', () => {
    const railRule = rules.find((rule) => rule.selector === '.home__rail');
    const tallyMarkRule = rules.find((rule) => rule.selector === '.home__tally-mark');
    expect(railRule, 'expected a .home__rail rule').toBeTruthy();
    expect(tallyMarkRule, 'expected a .home__tally-mark rule').toBeTruthy();
    expect(railRule.declarations).toMatch(/var\(--app-notebook\)/);
    expect(tallyMarkRule.declarations).toMatch(/var\(--app-notebook\)/);
    expect(railRule.declarations).not.toMatch(/var\(--c\)/);
    expect(tallyMarkRule.declarations).not.toMatch(/var\(--c\)/);
  });

  test("the row's desktop template reads the board's standing and tally columns (gap 6)", () => {
    const rowRule = rules.find((rule) => rule.selector === '.home__row' && rule.media === undefined);
    expect(rowRule, 'expected a top-level .home__row rule').toBeTruthy();
    expect(rowRule.declarations).toMatch(/grid-template-columns:[^;]*var\(--app-col-standing\)/);
    expect(rowRule.declarations).toMatch(/grid-template-columns:[^;]*var\(--app-col-tally\)/);
  });

  test('a .home__standing rule exists and reads the App meta size (gap 6)', () => {
    const standingRule = rules.find((rule) => rule.selector === '.home__standing');
    expect(standingRule, 'expected a .home__standing rule').toBeTruthy();
    expect(standingRule.declarations).toMatch(/font-size:\s*var\(--app-size-meta\)/);
  });

  test("the media-scoped .home__row rule's areas name the standing area, so the phone form cannot silently lose it (gap 6)", () => {
    const mediaRowRule = rules.find(
      (rule) => rule.selector === '.home__row' && rule.media === '(max-width: 759.98px)',
    );
    expect(mediaRowRule, 'expected a media-scoped .home__row rule').toBeTruthy();
    expect(mediaRowRule.declarations).toMatch(/grid-template-areas:[^;]*standing/);
  });

  test('.home__lead is a bordered, radiused block (gap 5)', () => {
    const leadRule = rules.find((rule) => rule.selector === '.home__lead' && rule.media === undefined);
    expect(leadRule, 'expected a top-level .home__lead rule').toBeTruthy();
    expect(leadRule.declarations).toMatch(/border:\s*var\(--app-rule-row\)\s*solid\s*var\(--app-text\)/);
    expect(leadRule.declarations).toMatch(/border-radius:\s*var\(--app-radius-lead\)/);
  });

  test('a .home__lead-caption rule declares the App label role in the secondary text colour, and .home__lead-next-time declares no font-family (gap 5)', () => {
    const captionRule = rules.find((rule) => rule.selector === '.home__lead-caption');
    const nextTimeRule = rules.find((rule) => rule.selector === '.home__lead-next-time');
    expect(captionRule, 'expected a .home__lead-caption rule').toBeTruthy();
    expect(nextTimeRule, 'expected a .home__lead-next-time rule').toBeTruthy();
    expect(captionRule.declarations).toMatch(/font-size:\s*var\(--app-size-label\)/);
    expect(captionRule.declarations).toMatch(/color:\s*var\(--app-text-secondary\)/);
    expect(nextTimeRule.declarations).not.toMatch(/font-family/);
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
