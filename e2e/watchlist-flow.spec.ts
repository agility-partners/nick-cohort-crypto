import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";
import { clearWatchlist } from "./utils/api-helpers";
import { AddToWatchlistPage } from "./pages/AddToWatchlistPage";
import { WatchlistPage } from "./pages/WatchlistPage";
import { NavigationComponent } from "./pages/NavigationComponent";

test.describe("Watchlist add flow", () => {
  registerE2ELogging("Watchlist add flow");

  test.beforeEach(async ({ request }) => {
    await clearWatchlist(request);
  });

  test("adds a selected coin and persists on reload", async ({ page }) => {
    const addPage = new AddToWatchlistPage(page);
    const watchlistPage = new WatchlistPage(page);
    const nav = new NavigationComponent(page);
    let selectedName = "";

    await test.step("Open add-to-watchlist page and verify submit is disabled", async () => {
      await addPage.goto();
      await addPage.expectSubmitDisabled();
    });

    await test.step("Select first available coin and verify selection state", async () => {
      selectedName = await addPage.getCoinName(0);
      await addPage.checkCoin(0);

      await addPage.expectSelectedCount(1);
      await addPage.expectSubmitEnabled();
    });

    await test.step("Submit selection and verify watchlist view contains selected coin", async () => {
      await addPage.submit();

      await expect(page).toHaveURL(/\/?view=watchlist$/);
      await watchlistPage.expectWatchlistHeadingVisible();
      await nav.expectWatchlistTabVisible();
      await watchlistPage.expectCoinHeadingVisible(selectedName);
    });

    await test.step("Reload and verify watchlist persistence", async () => {
      await page.reload();
      await watchlistPage.expectWatchlistHeadingVisible();
      await watchlistPage.expectCoinHeadingVisible(selectedName);
    });
  });
});
