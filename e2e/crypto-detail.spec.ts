import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("Crypto detail page", () => {
  registerE2ELogging("Crypto detail page");

  test("opens a crypto detail page and interacts with chart controls", async ({ page }) => {
    let selectedCoinName = "";

    await test.step("Open home and navigate to Bitcoin detail page", async () => {
      await page.goto("/");

      const firstDetailsLink = page.getByRole("link", { name: /View details for/i }).first();
      const firstAriaLabel = await firstDetailsLink.getAttribute("aria-label");

      if (!firstAriaLabel) {
        throw new Error("Expected first crypto card link to have an aria-label.");
      }

      selectedCoinName = firstAriaLabel.replace(/^View details for\s+/, "");

      await firstDetailsLink.click();
      await expect(page).toHaveURL(/\/crypto\/[a-z0-9-]+$/);
    });

    await test.step("Verify detail header and chart are visible", async () => {
      await expect(page.getByRole("heading", { level: 1, name: selectedCoinName })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Price Chart" })).toBeVisible();
      await expect(page.getByRole("img", { name: /price chart$/i })).toBeVisible();
    });

    await test.step("Change chart range and chart type", async () => {
      const chartAriaLabel = await page.getByRole("img", { name: /price chart$/i }).getAttribute("aria-label");

      if (!chartAriaLabel) {
        throw new Error("Expected chart image to include an aria-label.");
      }

      const symbol = chartAriaLabel.replace(/\s+price chart$/i, "");

      await page.getByRole("button", { name: "1D", exact: true }).click();
      await expect(page.getByText(new RegExp(`1 day trend · ${symbol}/USD`))).toBeVisible();

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

  test("updates chart subtitle for every supported range", async ({ page }) => {
    const ranges = [
      { button: "1D", label: "1 day" },
      { button: "7D", label: "7 day" },
      { button: "30D", label: "30 day" },
      { button: "90D", label: "90 day" },
      { button: "1Y", label: "1 year" },
      { button: "ALL", label: "All time" },
    ] as const;
    let symbol = "";

    await test.step("Open first available crypto detail page", async () => {
      await page.goto("/");
      await page.getByRole("link", { name: /View details for/i }).first().click();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const chartAriaLabel = await page.getByRole("img", { name: /price chart$/i }).getAttribute("aria-label");

      if (!chartAriaLabel) {
        throw new Error("Expected chart image to include an aria-label.");
      }

      symbol = chartAriaLabel.replace(/\s+price chart$/i, "");
    });

    await test.step("Cycle every range and verify subtitle text", async () => {
      for (const range of ranges) {
        await page.getByRole("button", { name: range.button, exact: true }).click();
        await expect(
          page.getByText(new RegExp(`${range.label} trend · ${symbol}/USD`)),
        ).toBeVisible();
      }
    });
  });
});
