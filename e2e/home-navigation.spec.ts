import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";
import { clearWatchlist } from "./utils/api-helpers";
import { WatchlistPage } from "./pages/WatchlistPage";
import { NavigationComponent } from "./pages/NavigationComponent";

test.describe("Home navigation", () => {
  registerE2ELogging("Home navigation");

  test.beforeEach(async ({ request }) => {
    await clearWatchlist(request);
  });

  test("shows all-coins tab with compare and no watchlist when empty", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);
    const nav = new NavigationComponent(page);

    await test.step("Open home page and verify default all-coins state", async () => {
      await watchlistPage.goto();
      await watchlistPage.expectAllCoinsHeadingVisible();
      await nav.expectWatchlistTabHidden();
      await nav.expectAllCoinsTabVisible();
      await nav.expectCompareTabVisible();
    });
  });

  test("updates sort metric from all coins controls", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);

    await test.step("Open home page and verify default sort metric", async () => {
      await watchlistPage.goto();
      await watchlistPage.expectSortMetric("market-cap");
    });

    await test.step("Switch to highest-volume sort and verify selected value", async () => {
      await watchlistPage.setSortMetric("highest-volume");
      await watchlistPage.expectSortMetric("highest-volume");
    });
  });

  test("toggles market sort order icon", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);

    await test.step("Open home page and verify default sort order", async () => {
      await watchlistPage.goto();
      await watchlistPage.expectSortDescVisible();
    });

    await test.step("Toggle sort and verify order changes", async () => {
      await watchlistPage.toggleSortOrder();
      await watchlistPage.expectSortAscVisible();
    });
  });

  test("falls back to All Coins when watchlist view is requested without saved watchlist", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);
    const nav = new NavigationComponent(page);

    await test.step("Open home with watchlist query and verify safe fallback", async () => {
      await watchlistPage.gotoWithView("watchlist");
      await watchlistPage.expectAllCoinsHeadingVisible();
      await nav.expectWatchlistTabHidden();
    });
  });

  test("falls back to All Coins when an invalid view query is provided", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);
    const nav = new NavigationComponent(page);

    await test.step("Open home with invalid query and verify default heading", async () => {
      await watchlistPage.gotoWithView("invalid-view");
      await watchlistPage.expectAllCoinsHeadingVisible();
      await nav.expectAllCoinsTabVisible();
      await watchlistPage.expectNoTabVisible("Top Gainers");
      await watchlistPage.expectNoTabVisible("Highest Volume");
    });
  });
});
