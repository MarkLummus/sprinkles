// The four seed tables' rows gathered in one place: the seed as the app will read
// it after load, for the seed batches and for tests (LIB-09). Seed data: only
// store/seed.js and other data modules import this at run time.
import { CORE_SCALE_ROWS } from './core-scales.js';
import { CORE_PROBLEM_ROWS } from './core-problems.js';
import { MACHINE_ROWS } from './machines.js';
import { STYLE_ROWS } from './styles.js';

export const SEED_CATALOG = {
  scales: CORE_SCALE_ROWS,
  problems: CORE_PROBLEM_ROWS,
  machines: MACHINE_ROWS,
  styles: STYLE_ROWS,
};
