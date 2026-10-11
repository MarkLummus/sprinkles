// Pure. No framework, no DOM, no store import, no import at all. Lays the
// Sheet's formula part (the band, Before you start, the Ingredients table in
// column 1 and Balance in column 2) onto the fixed letter page by measurement
// (Phase 4, plan 04-07; D-06a, D-06b; sketch 010 D29, E4; sketch 011 decision
// 45 brief items 4 and 5). The printer never splits a table or a grid, because
// every page is its own box and this module decides what stands in it.
//
// The caller measures each block once, in CSS px, at the content box's width,
// and passes the heights in `measure`; `box.height` is the content box's
// height (900 in WebKit's print, 960 elsewhere). Everything is a sum of those
// heights, so the same inputs always give the same pages.
//
// measure = {
//   band, before (0 when the version has no notes), gap (between the band, Before
//   you start and the row),
//   ingredientsHeading (the heading and its margin: the table's top under the region's),
//   header (the header row), total (the Total row),
//   groups: [{ head (the step head row, 0 when none is drawn), rows: [heights] }],
//   balanceHeading (the heading and its margin: the first gauge's top under the region's),
//   gauges: [heights], gaugeGap, basis (the basis note), basisGap (its margin above),
//   instructionsHeading (the heading and its margin: the first step's top under the region's),
//   steps: [heights], stepGap (between two steps),
//   footGap (the closing foot's margin above), foot (its height),
// }
// The Instructions and the closing foot (plan 04-08) are optional: a measure
// without `steps` and `foot` lays the formula part alone.
//
// Each returned page plan is
//   { band, before,
//     table: null | { heading, header: true, slices: [{ group, from, to, head }], total },
//     balance: null | { heading, gauges: [indexes], basis },
//     instructions: null | { heading, steps: [indexes] },
//     foot,
//     bottom }
// where `bottom` is the height the page's content reaches (the foot's when the
// page holds it, else the Instructions' or the row's foot), so a later block
// can follow it.

// Every drawn break leaves this much of the content box unused: a block whose
// foot lands on the box's last pixel is one rounding away from the next page.
export const PAGE_GUARD_PX = 8;

// D-06b, sketch 010 D29: where the Instructions begin. Under the page row's
// tail, on the page where the row ends, when the row runs past the formula
// page (the table broke, or Balance continues beside its tail); on a page of
// their own when both columns end on the formula page (method-page-1.html).
// The one place the rule for "the table fits but Balance continues" lives
// (04-08 Task 2 decides it; either answer changes this function alone).
function instructionsFollowRow(pages) {
  return pages.length > 1;
}

function sum(list, from = 0) {
  let total = 0;
  for (let i = from; i < list.length; i += 1) total += list[i];
  return total;
}

export function layPages(measure, box) {
  const usable = box.height - PAGE_GUARD_PX;
  const groups = measure.groups ?? [];
  const gauges = measure.gauges ?? [];
  const total = measure.total ?? 0;
  const gap = measure.gap ?? 0;
  const before = measure.before ?? 0;
  const hasBalance = gauges.length > 0;
  const basisNeeded = hasBalance && (measure.basis ?? 0) > 0;

  // Page 1 holds the band and, when there are notes, Before you start; the row
  // begins a gap under them.
  let top = measure.band;
  if (before > 0) top += gap + before;
  const rowTop = top + gap;

  // Where the table and Balance stand.
  let gi = 0; // next group
  let ri = 0; // next row within it
  let tableStarted = false;
  let totalPlaced = false;
  let ci = 0; // next gauge
  let balanceStarted = false;
  let basisPlaced = false;

  const tableDone = () => (groups.length === 0 ? totalPlaced : gi >= groups.length);
  const balanceDone = () => !hasBalance || (ci >= gauges.length && (!basisNeeded || basisPlaced));

  // Column 1 on one page. `room` is what the row may use, `force` says nothing
  // stands above the row, so the first line may not be refused (a page must
  // always take something, or no page would ever end). Returns null when the
  // table cannot begin or continue here: a heading and header never stand with
  // nothing under them.
  function placeTable(room, force) {
    const first = !tableStarted;
    let used = (first ? measure.ingredientsHeading : 0) + measure.header;
    const slices = [];
    let g = gi;
    let r = ri;
    let placedTotal = false;
    while (g < groups.length) {
      const group = groups[g];
      const last = g === groups.length - 1;
      const head = r === 0 ? group.head : 0;
      // The Total rides with the last group's last line: it never stands alone
      // under a repeated header.
      const tail = last ? total : 0;
      const whole = head + sum(group.rows, r) + tail;
      if (used + whole <= room) {
        slices.push({ group: g, from: r, to: group.rows.length, head: r === 0 });
        used += whole;
        placedTotal = last;
        g += 1;
        r = 0;
        continue;
      }
      // It does not fit whole. It moves whole to the next page, unless it is
      // the table's only group, or one already begun, or taller than a page:
      // then it splits between rows, the step head kept with its first row.
      const pageRoom = usable - measure.header - (first ? measure.ingredientsHeading : 0);
      const splittable = groups.length === 1 || r > 0 || whole > pageRoom;
      if (!splittable) break;
      let take = 0;
      let reach = used + head;
      for (let k = r; k < group.rows.length; k += 1) {
        const line = group.rows[k] + (last && k === group.rows.length - 1 ? total : 0);
        if (reach + line <= room || (take === 0 && slices.length === 0 && force)) {
          reach += line;
          take += 1;
        } else break;
      }
      if (take > 0) {
        slices.push({ group: g, from: r, to: r + take, head: r === 0 });
        used = reach;
        r += take;
        if (r >= group.rows.length) {
          placedTotal = last;
          g += 1;
          r = 0;
        }
      }
      break;
    }
    if (groups.length === 0 && (used + total <= room || force)) {
      used += total;
      placedTotal = true;
    }
    if (slices.length === 0 && !placedTotal) return null;
    gi = g;
    ri = r;
    tableStarted = true;
    if (placedTotal) totalPlaced = true;
    return { heading: first, header: true, slices, total: placedTotal, used };
  }

  // Column 2 on one page: the heading on the first page only, whole gauges while
  // they fit, the basis note last. The heading never stands without a gauge.
  function placeBalance(room, force) {
    const first = !balanceStarted;
    let used = first ? measure.balanceHeading : 0;
    const placed = [];
    while (ci < gauges.length) {
      const apart = placed.length > 0 ? measure.gaugeGap : 0;
      if (used + apart + gauges[ci] <= room || (force && placed.length === 0)) {
        used += apart + gauges[ci];
        placed.push(ci);
        ci += 1;
      } else break;
    }
    if (first && placed.length === 0) return null;
    let basis = false;
    if (ci >= gauges.length && basisNeeded && !basisPlaced) {
      const apart = placed.length > 0 ? measure.basisGap : 0;
      if (used + apart + measure.basis <= room || (force && placed.length === 0)) {
        used += apart + measure.basis;
        basis = true;
        basisPlaced = true;
      }
    }
    if (placed.length === 0 && !basis) return null;
    balanceStarted = true;
    return { heading: first, gauges: placed, basis, used };
  }

  const pages = [];
  // Each page after the first starts at the content box's top with the row, so
  // it always takes something and the loop ends; the bound is a backstop.
  for (let n = 0; n < 1000; n += 1) {
    const y = n === 0 ? rowTop : 0;
    const room = usable - y;
    const force = n > 0;
    const table = tableDone() ? null : placeTable(room, force);
    // Balance sits beside the table: it cannot begin before the row has.
    const balance = balanceDone() || !(tableStarted || balanceStarted) ? null : placeBalance(room, force);
    const rowUsed = Math.max(table ? table.used : 0, balance ? balance.used : 0);
    pages.push({
      band: n === 0,
      before: n === 0 && before > 0,
      table: table && { heading: table.heading, header: table.header, slices: table.slices, total: table.total },
      balance: balance && { heading: balance.heading, gauges: balance.gauges, basis: balance.basis },
      instructions: null,
      foot: false,
      bottom: table || balance ? y + rowUsed : n === 0 ? top : 0,
    });
    if (tableDone() && balanceDone()) break;
  }
  layInstructions(pages, measure, usable);
  return pages;
}

// The Instructions and the closing foot, laid after the page row (plan 04-08;
// D-06a, D-06b, D7, D28; sketch 010 D29). Steps stand whole, a step gap apart,
// the heading once with the first step; a step that does not fit opens the
// next page with no heading. The foot follows the last step in flow and keeps
// with it: when it does not fit, the last step moves with it. Adds
// `instructions`, `foot` and `bottom` to the pages that hold them, and appends
// the pages that hold nothing else.
function layInstructions(pages, measure, usable) {
  const steps = measure.steps ?? [];
  const footHeight = measure.foot ?? 0;
  if (steps.length === 0 && footHeight === 0) return;
  const headingHeight = measure.instructionsHeading ?? 0;
  const stepGap = measure.stepGap ?? 0;
  const footGap = measure.footGap ?? 0;
  const gap = measure.gap ?? 0;
  const lastPage = pages.length - 1;

  // A chunk is what one page holds of this part. `existing` is the formula
  // page it shares with the row (null for a page of its own); `top` is where it
  // begins on that page.
  const chunks = [];
  const open = (existing, top) => {
    const chunk = { existing, top, heading: false, steps: [], foot: false };
    chunks.push(chunk);
    return chunk;
  };
  const reach = (chunk) => {
    let y = chunk.top + (chunk.heading ? headingHeight : 0);
    chunk.steps.forEach((index, k) => {
      y += (k > 0 ? stepGap : 0) + steps[index];
    });
    return chunk.foot ? y + footGap + footHeight : y;
  };

  // A version with no steps still closes with its foot, under the row.
  const follow = steps.length === 0 || instructionsFollowRow(pages);
  let chunk = follow ? open(lastPage, pages[lastPage].bottom + gap) : open(null, 0);

  let next = 0;
  let headingPending = steps.length > 0;
  while (next < steps.length) {
    const apart = chunk.steps.length > 0 ? stepGap : 0;
    const base = reach(chunk) + (headingPending ? headingHeight : 0);
    const fresh = chunk.existing === null;
    if (base + apart + steps[next] <= usable || (fresh && chunk.steps.length === 0)) {
      if (headingPending) {
        chunk.heading = true;
        headingPending = false;
      }
      chunk.steps.push(next);
      next += 1;
    } else {
      // Nothing placed under the row: the Instructions open the next page, the
      // heading with their first step.
      if (chunk.steps.length === 0) chunks.pop();
      chunk = open(null, 0);
    }
  }

  const placeFoot = () => {
    if (reach(chunk) + footGap + footHeight <= usable) {
      chunk.foot = true;
      return;
    }
    const alone = chunk.existing === null;
    if (chunk.steps.length === 0 || (chunk.steps.length === 1 && alone)) {
      // Nothing to move with it: the foot takes a page of its own rather than lose ink.
      if (chunk.steps.length === 0) chunks.pop();
      chunk = open(null, 0);
      chunk.foot = true;
      return;
    }
    // The foot keeps with the last step: the step goes to the next page with it,
    // and the heading with it when it was the only step under the row.
    const moved = chunk.steps.pop();
    let heading = false;
    if (chunk.steps.length === 0) {
      heading = chunk.heading;
      chunks.pop();
    }
    chunk = open(null, 0);
    chunk.heading = heading;
    chunk.steps.push(moved);
    placeFoot();
  };
  if (footHeight > 0) placeFoot();

  for (const done of chunks) {
    const plan = {
      instructions: done.steps.length > 0 ? { heading: done.heading, steps: done.steps } : null,
      foot: done.foot,
      bottom: reach(done),
    };
    if (done.existing !== null) Object.assign(pages[done.existing], plan);
    else pages.push({ band: false, before: false, table: null, balance: null, ...plan });
  }
}
