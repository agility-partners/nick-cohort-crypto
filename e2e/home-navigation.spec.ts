import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("Home navigation", () => {
  registerE2ELogging("Home navigation");

  test("shows all-coins tab with compare and no watchlist when empty", async ({ page }) => {
    await test.step("Open home page and verify default all-coins state", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 2, name: "All Coins" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "All Coins", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Compare", exact: true })).toBeVisible();
    });
  });

  test("updates sort metric from all coins controls", async ({ page }) => {
    await test.step("Open home page and verify default sort metric", async () => {
      await page.goto("/");
      await expect(page.locator("#all-coins-sort")).toHaveValue("market-cap");
    });

    await test.step("Switch to highest-volume sort and verify selected value", async () => {
      await page.locator("#all-coins-sort").selectOption("highest-volume");
      await expect(page.locator("#all-coins-sort")).toHaveValue("highest-volume");
    });
  });

  test("toggles market sort order icon", async ({ page }) => {
    await test.step("Open home page and verify default sort order", async () => {
      await page.goto("/");

      const sortButton = page.getByRole("button", { name: "Sort order descending" });
      await expect(sortButton).toBeVisible();
    });

    await test.step("Toggle sort and verify order changes", async () => {
      await page.getByRole("button", { name: "Sort order descending" }).click();
      await expect(page.getByRole("button", { name: "Sort order ascending" })).toBeVisible();
    });
  });

  test("falls back to All Coins when watchlist view is requested without saved watchlist", async ({ page }) => {
    await test.step("Open home with watchlist query and verify safe fallback", async () => {
      await page.goto("/?view=watchlist");

      await expect(page.getByRole("heading", { level: 2, name: "All Coins" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toHaveCount(0);
    });
  });

  test("falls back to All Coins when an invalid view query is provided", async ({ page }) => {
    await test.step("Open home with invalid query and verify default heading", async () => {
      await page.goto("/?view=invalid-view");

      await expect(page.getByRole("heading", { level: 2, name: "All Coins" })).toBeVisible();
      await expect(page.getByRole("link", { name: "All Coins", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Top Gainers", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Highest Volume", exact: true })).toHaveCount(0);
    });
  });
});
