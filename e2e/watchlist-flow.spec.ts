import { expect, test } from "@playwright/test";
import { registerE2ELogging } from "./utils/test-logging";

test.describe("Watchlist add flow", () => {
  registerE2ELogging("Watchlist add flow");

  test("adds selected coins and persists on reload", async ({ page }) => {
    let firstSelectedName = "";
    let secondSelectedName = "";

    await test.step("Open add-to-watchlist page and verify submit is disabled", async () => {
      await page.goto("/watchlist/add");

      const submitButton = page.getByRole("button", { name: "Add selected" });
      await expect(submitButton).toBeDisabled();
    });

    await test.step("Select first two available coins and verify selection state", async () => {
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      const secondCheckbox = page.locator('input[type="checkbox"]').nth(1);

      const firstCheckboxId = await firstCheckbox.getAttribute("id");
      const secondCheckboxId = await secondCheckbox.getAttribute("id");

      if (!firstCheckboxId || !secondCheckboxId) {
        throw new Error("Expected two selectable watchlist checkbox options.");
      }

      firstSelectedName = await page
        .locator(`label[for="${firstCheckboxId}"] p`)
        .first()
        .innerText();
      secondSelectedName = await page
        .locator(`label[for="${secondCheckboxId}"] p`)
        .first()
        .innerText();

      await firstCheckbox.check();
      await secondCheckbox.check();

      await expect(page.getByText("2 selected", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Add selected" })).toBeEnabled();
    });

    await test.step("Submit selections and verify watchlist view contains selected coins", async () => {
      await page.getByRole("button", { name: "Add selected" }).click();

      await expect(page).toHaveURL(/\/?view=watchlist$/);
      await expect(page.getByRole("heading", { level: 2, name: "Watchlist" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Watchlist", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: firstSelectedName })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: secondSelectedName })).toBeVisible();
    });

    await test.step("Reload and verify watchlist persistence", async () => {
      await page.reload();
      await expect(page.getByRole("heading", { level: 2, name: "Watchlist" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: firstSelectedName })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: secondSelectedName })).toBeVisible();
    });
  });
});
