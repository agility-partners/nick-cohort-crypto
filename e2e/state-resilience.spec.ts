import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("State resilience", () => {
  registerE2ELogging("State resilience");

  test("shows watchlist tab only after coins are added and keeps it after reload", async ({ page }) => {
    await test.step("Verify watchlist nav is hidden when empty", async () => {
      await page.goto("/");
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toHaveCount(0);
    });

    await test.step("Add first available coin to watchlist", async () => {
      await page.goto("/watchlist/add");
      await page.locator('input[type="checkbox"]').first().check();
      await page.getByRole("button", { name: "Add selected" }).click();
    });

    await test.step("Verify watchlist tab appears and persists after reload", async () => {
      await expect(page).toHaveURL(/\/?view=watchlist$/);
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toBeVisible();

      await page.reload();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toBeVisible();
    });
  });

  test("recovers gracefully from corrupt watchlist localStorage JSON", async ({ context, page }) => {
    await test.step("Inject invalid localStorage value before app scripts run", async () => {
      await context.addInitScript(() => {
        window.localStorage.setItem("coinsight.watchlist", "{");
      });
    });

    await test.step("Open home and verify app renders fallback safely", async () => {
      await page.goto("/");

      await expect(page.getByRole("heading", { level: 2, name: "Market Cap" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toHaveCount(0);
      await expect(page.getByText("Runtime SyntaxError")).toHaveCount(0);
    });
  });

  test("persists theme selection across page reload", async ({ page }) => {
    await test.step("Open home and switch to light theme", async () => {
      await page.goto("/");

      await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
      await page.getByRole("button", { name: "Switch to light mode" }).click();
      await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
    });

    await test.step("Reload and verify selected theme remains", async () => {
      await page.reload();
      await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
    });
  });
});
