import { chromium } from "@playwright/test";

const API_BASE_URL = "http://localhost:5000";
const FRONTEND_BASE_URL = "http://127.0.0.1:3000";
const EXPECTED_COIN_COUNT = 23;

function logStep(message) {
  console.log(`\n[STEP] ${message}`);
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function fail(message) {
  throw new Error(`[FAIL] ${message}`);
}

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function assertStatus(response, expectedStatus, context) {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    fail(`${context} expected HTTP ${expectedStatus}, got ${response.status}. Body: ${body}`);
  }
}

async function apiFetch(path, init) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function clearWatchlistState() {
  const watchlistResponse = await apiFetch("/api/watchlist");
  await assertStatus(watchlistResponse, 200, "Clear watchlist pre-check");

  const watchlist = (await readJson(watchlistResponse)) ?? [];
  if (!Array.isArray(watchlist)) {
    fail("Watchlist pre-check response is not an array.");
  }

  for (const coin of watchlist) {
    if (!coin?.id || typeof coin.id !== "string") {
      continue;
    }

    const deleteResponse = await apiFetch(`/api/watchlist/${encodeURIComponent(coin.id)}`, {
      method: "DELETE",
    });

    if (deleteResponse.status !== 204 && deleteResponse.status !== 404) {
      const body = await deleteResponse.text();
      fail(`Unable to clear watchlist coin ${coin.id}. Status ${deleteResponse.status}. Body: ${body}`);
    }
  }
}

async function runApiTests() {
  logStep("Running API tests against http://localhost:5000 (Swagger-backed endpoints)");

  await clearWatchlistState();

  {
    const response = await apiFetch("/api/coins");
    await assertStatus(response, 200, "GET /api/coins");
    const coins = await readJson(response);

    if (!Array.isArray(coins)) {
      fail("GET /api/coins did not return an array.");
    }

    if (coins.length !== EXPECTED_COIN_COUNT) {
      fail(`GET /api/coins expected ${EXPECTED_COIN_COUNT} coins, got ${coins.length}.`);
    }

    pass("1) GET /api/coins returns 23 coins");
  }

  {
    const response = await apiFetch("/api/coins/bitcoin");
    await assertStatus(response, 200, "GET /api/coins/bitcoin");
    const coin = await readJson(response);

    if (!coin || coin.id !== "bitcoin" || coin.name !== "Bitcoin") {
      fail("GET /api/coins/bitcoin did not return Bitcoin payload.");
    }

    pass("2) GET /api/coins/bitcoin returns Bitcoin");
  }

  {
    const response = await apiFetch("/api/coins/fakecoin");
    await assertStatus(response, 404, "GET /api/coins/fakecoin");
    pass("3) GET /api/coins/fakecoin returns 404");
  }

  {
    const response = await apiFetch("/api/watchlist");
    await assertStatus(response, 200, "GET /api/watchlist (empty)");
    const watchlist = await readJson(response);

    if (!Array.isArray(watchlist) || watchlist.length !== 0) {
      fail(`GET /api/watchlist expected empty array, got ${JSON.stringify(watchlist)}.`);
    }

    pass("4) GET /api/watchlist is empty");
  }

  {
    const response = await apiFetch("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ coinId: "bitcoin" }),
    });
    await assertStatus(response, 201, "POST /api/watchlist bitcoin");

    const payload = await readJson(response);
    if (!payload || payload.id !== "bitcoin") {
      fail("POST /api/watchlist with bitcoin did not return added CoinDto.");
    }

    pass("5) POST /api/watchlist bitcoin returns 201");
  }

  {
    const response = await apiFetch("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ coinId: "bitcoin" }),
    });
    await assertStatus(response, 409, "POST /api/watchlist duplicate bitcoin");
    pass("6) POST same coin returns 409");
  }

  {
    const response = await apiFetch("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ coinId: "fakecoin" }),
    });
    await assertStatus(response, 404, "POST /api/watchlist fakecoin");
    pass("7) POST fake coin returns 404");
  }

  {
    const response = await apiFetch("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await assertStatus(response, 400, "POST /api/watchlist {} invalid body");
    pass("8) POST empty payload returns 400");
  }

  {
    const response = await apiFetch("/api/watchlist/bitcoin", {
      method: "DELETE",
    });
    await assertStatus(response, 204, "DELETE /api/watchlist/bitcoin");
    pass("9) DELETE /api/watchlist/bitcoin returns 204");
  }

  {
    const response = await apiFetch("/api/watchlist/bitcoin", {
      method: "DELETE",
    });
    await assertStatus(response, 404, "DELETE /api/watchlist/bitcoin again");
    pass("10) DELETE same coin again returns 404");
  }
}

async function runFrontendTests() {
  logStep("Running frontend browser tests against http://127.0.0.1:3000");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: FRONTEND_BASE_URL });
  const page = await context.newPage();

  try {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("heading", { level: 2, name: "All Coins" }).waitFor();
    const allCoinLinks = page.getByRole("link", { name: /View details for/i });
    const coinLinkCount = await allCoinLinks.count();

    if (coinLinkCount !== EXPECTED_COIN_COUNT) {
      fail(`11) Home expected ${EXPECTED_COIN_COUNT} coin cards, found ${coinLinkCount}.`);
    }
    pass("11) Home page loads with 23 coins from API");

    await page.getByRole("link", { name: "View details for Bitcoin" }).click();
    await page.waitForURL("**/crypto/bitcoin");
    await page.getByRole("heading", { level: 1, name: "Bitcoin" }).waitFor();
    pass("12) Clicking a coin loads detail page from API");

    await page.goto("/watchlist/add");
    await page.getByRole("heading", { level: 2, name: "Add to watchlist" }).waitFor();

    await page.locator("#watchlist-search").fill("bitcoin");
    const bitcoinOption = page.locator("label", { hasText: "Bitcoin" }).first();
    await bitcoinOption.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Add selected" }).click();

    await page.waitForURL("**/?view=watchlist");
    await page.getByRole("link", { name: "View details for Bitcoin" }).waitFor();
    await page.reload();
    await page.getByRole("link", { name: "View details for Bitcoin" }).waitFor();
    pass("13) Add to watchlist persists via API after refresh");

    await page.goto("/crypto/bitcoin");
    await page.getByRole("button", { name: "Remove coin from watchlist" }).click();

    await page.goto("/?view=watchlist");
    await page.waitForLoadState("networkidle");
    await page.reload();
    await page.waitForLoadState("networkidle");

    const bitcoinCountAfterRemove = await page
      .getByRole("link", { name: "View details for Bitcoin" })
      .count();

    if (bitcoinCountAfterRemove !== 0) {
      fail("14) Bitcoin still appears in watchlist after removal + refresh.");
    }
    pass("14) Remove from watchlist persists after refresh");

    await page.goto("/watchlist/add");
    await page.locator("#watchlist-search").fill("ethereum");
    const ethereumOption = page.locator("label", { hasText: "Ethereum" }).first();
    await ethereumOption.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Add selected" }).click();

    await page.waitForURL("**/?view=watchlist");
    await page.getByRole("link", { name: "Watchlist", exact: true }).waitFor();

    const ethereumInWatchlist = await page
      .getByRole("link", { name: "View details for Ethereum" })
      .count();

    if (ethereumInWatchlist === 0) {
      fail("15) Watchlist tab does not show expected watchlist coins.");
    }
    pass("15) Watchlist tab shows correct coins");
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  console.log("\n=== CoinSight Full-Stack Smoke Test ===");
  console.log("Prerequisites:");
  console.log("- API running on http://localhost:5000");
  console.log("- Frontend running on http://127.0.0.1:3000\n");

  await runApiTests();
  await runFrontendTests();

  console.log("\n✅ All full-stack smoke checks passed.");
}

main().catch((error) => {
  console.error(`\n❌ Full-stack smoke test failed: ${error.message}`);
  process.exit(1);
});
