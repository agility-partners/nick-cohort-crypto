import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";
import { clearWatchlist } from "./utils/api-helpers";
import { WatchlistPage } from "./pages/WatchlistPage";
import { AddToWatchlistPage } from "./pages/AddToWatchlistPage";
import { NavigationComponent } from "./pages/NavigationComponent";

test.describe("State resilience", () => {
  registerE2ELogging("State resilience");

  test("shows watchlist tab only after coins are added and keeps it after reload", async ({ page, request }) => {
    const watchlistPage = new WatchlistPage(page);
    const addPage = new AddToWatchlistPage(page);
    const nav = new NavigationComponent(page);

    await test.step("Clear watchlist and verify nav is hidden when empty", async () => {
      await clearWatchlist(request);
      await watchlistPage.goto();
      await nav.expectWatchlistTabHidden();
    });

    await test.step("Add first available coin to watchlist", async () => {
      await addPage.goto();
      await addPage.checkCoin(0);
      await addPage.submit();
    });

    await test.step("Verify watchlist tab appears and persists after reload", async () => {
      await expect(page).toHaveURL(/\/?view=watchlist$/);
      await nav.expectWatchlistTabVisible();

      await page.reload();
      await nav.expectWatchlistTabVisible();
    });
  });

  test("recovers gracefully from corrupt compare localStorage JSON", async ({ context, page }) => {
    const watchlistPage = new WatchlistPage(page);

    await test.step("Inject invalid compare localStorage value before app scripts run", async () => {
      await context.addInitScript(() => {
        window.localStorage.setItem("coinsight.compare", "{");
      });
    });

    await test.step("Open home and verify app renders without runtime errors", async () => {
      await watchlistPage.goto();
      await watchlistPage.expectAllCoinsHeadingVisible();
      await watchlistPage.expectNoRuntimeErrors();
    });
  });

  test("persists theme selection across page reload", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);
    const nav = new NavigationComponent(page);

    await test.step("Open home and switch to light theme", async () => {
      await watchlistPage.goto();
      await nav.expectLightModeButtonVisible();
      await nav.switchToLightMode();
      await nav.expectDarkModeButtonVisible();
    });

    await test.step("Reload and verify selected theme remains", async () => {
      await page.reload();
      await nav.expectDarkModeButtonVisible();
    });
  });
});
