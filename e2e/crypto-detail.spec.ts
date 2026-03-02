import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";
import { WatchlistPage } from "./pages/WatchlistPage";
import { CoinDetailPage } from "./pages/CoinDetailPage";

test.describe("Crypto detail page", () => {
  registerE2ELogging("Crypto detail page");

  test("opens a crypto detail page and interacts with chart controls", async ({ page }) => {
    const watchlistPage = new WatchlistPage(page);
    const detailPage = new CoinDetailPage(page);
    let selectedCoinName = "";

    await test.step("Open home and navigate to first coin detail page", async () => {
      await watchlistPage.goto();
      selectedCoinName = await watchlistPage.clickFirstCoin();
      await detailPage.expectOnDetailRoute();
    });

    await test.step("Verify detail header and chart are visible", async () => {
      await detailPage.expectCoinName(selectedCoinName);
      await detailPage.expectChartVisible();
    });

    await test.step("Verify all-time chart subtitle and toggle chart type", async () => {
      const symbol = await detailPage.getChartSymbol();
      await detailPage.expectChartSubtitle(new RegExp(`All time trend · ${symbol}/USD`));

      await detailPage.selectCandleChart();
      await detailPage.expectLineButtonVisible();

      await detailPage.selectLineChart();
      await detailPage.expectCandleButtonVisible();
    });

    await test.step("Return to home route", async () => {
      await detailPage.goBack();
      await expect(page).toHaveURL("/");
    });
  });

  test("shows not found page for unknown coin id", async ({ page }) => {
    const detailPage = new CoinDetailPage(page);

    await test.step("Navigate to an unknown coin route", async () => {
      await detailPage.goto("not-a-real-coin");
    });

    await test.step("Verify unknown coin fallback UI", async () => {
      await detailPage.expectNotFound();
    });
  });
});
