# Playwright Testing Guide

This document explains how CoinSight end-to-end tests are structured, what they validate, and how to run/debug them.

---

## Goals of the E2E Suite

The Playwright suite focuses on:

- Core user journeys (home, detail, watchlist add flow)
- URL-driven view behavior and fallback logic
- Persistence and resilience (localStorage + theme)
- Chart interaction coverage on detail pages
- Fast triage via step-level logs and Playwright artifacts

---

## Test Stack Configuration

Primary config lives in `playwright.config.ts`:

- `testDir: ./e2e`
- `baseURL: http://127.0.0.1:3000`
- Auto web server boot via `npm run dev -- --hostname 127.0.0.1 --port 3000`
- Reporter: HTML (`playwright-report`)
- Artifacts:
  - trace: on first retry
  - screenshot: only on failure
  - video: retained on failure
- Projects:
  - `chrome` (installed Google Chrome channel)

---

## Commands

From repo root:

- Run default suite (Chrome): `npm run test:e2e`
- Run headed mode (Chrome): `npm run test:e2e:headed`
- Interactive UI (Chrome): `npm run test:e2e:ui`
- Debug mode (Chrome): `npm run test:e2e:debug`
- Show last HTML report: `npx playwright show-report`

Useful focused run examples:

- `npm run test:e2e -- e2e/watchlist-flow.spec.ts`
- `npm run test:e2e -- -g "theme selection"`

---

## Current Spec Coverage

### 1) `e2e/home-navigation.spec.ts`

Validates home route and query-parameter view behavior:

- Default home state renders `Market Cap`
- Watchlist tab is hidden when no saved watchlist exists
- Top navigation routes update URL and heading (`gainers`, `volume`)
- Sort-order toggle text updates (`High to low` ↔ `Low to high`)
- Query fallback behavior:
  - `/?view=watchlist` with empty watchlist falls back to `Market Cap`
  - invalid `?view` falls back safely to default behavior

### 2) `e2e/watchlist-flow.spec.ts`

Validates add-to-watchlist user flow:

- Add page opens and submit is disabled initially
- Selecting coins updates selected count and enables submit
- Submit routes to watchlist view
- Selected coins render in watchlist
- Reload preserves watchlist (localStorage persistence behavior)

### 3) `e2e/crypto-detail.spec.ts`

Validates crypto detail route and chart interactions:

- Navigate from card to `/crypto/bitcoin`
- Detail header + chart render correctly
- Time range control updates chart subtitle
- Chart type toggles between line and candle
- Back navigation returns to home
- Unknown coin route shows segment-level not-found UI
- All time ranges are covered (`1D`, `7D`, `30D`, `90D`, `1Y`, `ALL`)

### 4) `e2e/state-resilience.spec.ts`

Validates stability in state edge cases:

- Watchlist tab lifecycle:
  - hidden when empty
  - visible after adding a coin
  - remains visible after reload
- Corrupt watchlist localStorage recovery:
  - injects invalid JSON
  - app still renders fallback state without runtime crash UI
- Theme persistence:
  - switch theme
  - reload
  - selected theme remains active

---

## Logging and Observability

Tests use two logging layers:

1. `test.step(...)` blocks inside each test
   - Each major test action has a descriptive step label
   - Step labels appear in Playwright UI and report

2. Suite-level lifecycle logs in `e2e/utils/test-logging.ts`
   - Emits `[E2E][START][Scope] Test Title`
   - Emits `[E2E][END][Scope] Test Title -> status`

This makes terminal output easier to follow during headed and CI runs.

---

## Selector Strategy (Best Practices Used)

The suite prefers resilient, user-facing selectors:

- `getByRole` with accessible names for links, buttons, and headings
- `getByLabel` for form controls
- Assertions against visible user text where appropriate

This keeps tests aligned with real UX and reduces brittleness compared with CSS selectors.

---

## Failure Triage Workflow

When a test fails:

1. Re-run focused test in headed mode
2. Inspect step where failure occurred
3. Open HTML report for trace/video/screenshot
4. If needed, run debug mode and step through interactions

Quick commands:

- `npm run test:e2e -- e2e/<spec>.spec.ts --headed`
- `npm run test:e2e:debug -- -g "<test name>"`
- `npx playwright show-report`

---

## What Is Not Covered Yet

Current suite is strong on core flows but does not yet include:

- Visual regression snapshots
- Keyboard-only accessibility journeys
- Multi-browser matrix beyond Chromium/Chrome in routine runs
- CI pipeline enforcement (recommended next)

---

## Recommended Next Additions

1. Add GitHub Actions workflow for lint + Playwright
2. Add accessibility-focused keyboard navigation tests
3. Add baseline visual snapshots for core pages
4. Add WebKit project for broader browser confidence
