---
created: 2026-09-27T11:55:25.183Z
title: Batch head controls on iPhone, and when the Batches control shows
area: ui
severity: minor
files:
  - app/src/ui/BatchRow.jsx:567-616
  - app/src/styles/notebook.css
---

## Problem

Mark, 2026-09-27, iPhone layout:
- In the Batch section, Correct and Record another sit right-aligned on the line, but "Batches (1)" does not.
- The Batches control shows even when a version has 0 or 1 batches, where it offers nothing to choose.

## Solution

- Measure the head line at 393 and 723 against 393-batch.html and 723-batch.html, then align it.
- Hide the Batches control when the version has 0 or 1 batches.
- **Open question for Mark:** should choosing a batch be a batches timeline like the versions History, or a drop-down selector? Draw both on the canvas before building either.
