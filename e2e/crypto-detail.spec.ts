import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("Crypto detail page", () => {
  registerE2ELogging("Crypto detail page");

  test("opens a crypto detail page and interacts with chart controls", async ({ page }) => {
    await test.step("Open home and navigate to Bitcoin detail page", async () => {
      await page.goto("/");
      await page.getByRole("link", { name: /View details for Bitcoin/i }).click();
      await expect(page).toHaveURL(/\/crypto\/bitcoin$/);
    });

    await test.step("Verify detail header and chart are visible", async () => {
      await expect(page.getByRole("heading", { level: 1, name: "Bitcoin" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Price Chart" })).toBeVisible();
      await expect(page.getByRole("img", { name: "BTC price chart" })).toBeVisible();
    });

    await test.step("Change chart range and chart type", async () => {
      await page.getByRole("button", { name: "1D", exact: true }).click();
      await expect(page.getByText("Mock 1 day trend · BTC/USD", { exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Candle", exact: true }).click();
      await expect(page.getByRole("button", { name: "Line", exact: true })).toBeVisible();
    });

    await test.step("Return to home route", async () => {
      await page.getByRole("link", { name: "← Back to watchlist" }).click();
      await expect(page).toHaveURL("/");
    });
  });

  test("shows not found page for unknown coin id", async ({ page }) => {
    await test.step("Navigate to an unknown coin route", async () => {
      await page.goto("/crypto/not-a-real-coin");
    });

    await test.step("Verify unknown coin fallback UI", async () => {
      await expect(page.getByRole("heading", { level: 1, name: "Crypto Not Found" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Return to watchlist" })).toBeVisible();
    });
  });
});
