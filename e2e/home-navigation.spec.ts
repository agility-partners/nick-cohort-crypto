import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("Home navigation", () => {
  registerE2ELogging("Home navigation");

  test("switches between market views and updates URL/title", async ({ page }) => {
    await test.step("Open home page and verify default market state", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 2, name: "Market Cap" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toHaveCount(0);
    });

    await test.step("Navigate to Top Gainers and verify URL + heading", async () => {
      await page.getByRole("link", { name: "Top Gainers", exact: true }).click();
      await expect(page).toHaveURL(/\/?view=gainers$/);
      await expect(page.getByRole("heading", { level: 2, name: "Top Gainers" })).toBeVisible();
    });

    await test.step("Navigate to Highest Volume and verify URL + heading", async () => {
      await page.getByRole("link", { name: "Highest Volume", exact: true }).click();
      await expect(page).toHaveURL(/\/?view=volume$/);
      await expect(page.getByRole("heading", { level: 2, name: "Highest Volume" })).toBeVisible();
    });
  });

  test("toggles market sort order label", async ({ page }) => {
    await test.step("Open home page and verify default sort label", async () => {
      await page.goto("/");

      const sortButton = page.getByRole("button", { name: "High to low" });
      await expect(sortButton).toBeVisible();
    });

    await test.step("Toggle sort and verify label changes", async () => {
      await page.getByRole("button", { name: "High to low" }).click();
      await expect(page.getByRole("button", { name: "Low to high" })).toBeVisible();
    });
  });
});
