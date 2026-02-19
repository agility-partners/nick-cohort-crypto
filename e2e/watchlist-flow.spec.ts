import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("Watchlist add flow", () => {
  registerE2ELogging("Watchlist add flow");

  test("adds selected coins and persists on reload", async ({ page }) => {
    await test.step("Open add-to-watchlist page and verify submit is disabled", async () => {
      await page.goto("/watchlist/add");

      const submitButton = page.getByRole("button", { name: "Add selected" });
      await expect(submitButton).toBeDisabled();
    });

    await test.step("Select Bitcoin and Ethereum and verify selection state", async () => {
      await page.getByLabel(/Bitcoin/i).check();
      await page.getByLabel(/Ethereum/i).check();

      await expect(page.getByText("2 selected", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Add selected" })).toBeEnabled();
    });

    await test.step("Submit selections and verify watchlist view contains selected coins", async () => {
      await page.getByRole("button", { name: "Add selected" }).click();

      await expect(page).toHaveURL(/\/?view=watchlist$/);
      await expect(page.getByRole("heading", { level: 2, name: "Watchlist" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Bitcoin" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Ethereum" })).toBeVisible();
    });

    await test.step("Reload and verify watchlist persistence", async () => {
      await page.reload();
      await expect(page.getByRole("heading", { level: 2, name: "Watchlist" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Bitcoin" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Ethereum" })).toBeVisible();
    });
  });
});
