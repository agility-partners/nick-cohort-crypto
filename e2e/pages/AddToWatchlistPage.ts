import { expect, type Locator, type Page } from "@playwright/test";

export class AddToWatchlistPage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly checkboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole("button", { name: "Add selected" });
    this.checkboxes = page.locator('input[type="checkbox"]');
  }

  async goto() {
    await this.page.goto("/watchlist/add");
  }

  async isLoaded() {
    await expect(this.submitButton).toBeVisible();
  }

  async checkCoin(index: number) {
    await this.checkboxes.nth(index).check();
  }

  async getCoinName(index: number): Promise<string> {
    const checkbox = this.checkboxes.nth(index);
    const checkboxId = await checkbox.getAttribute("id");

    if (!checkboxId) {
      throw new Error(`Expected checkbox at index ${index} to have an id.`);
    }

    return this.page.locator(`label[for="${checkboxId}"] p`).first().innerText();
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled();
  }

  async expectSelectedCount(count: number) {
    await expect(this.page.getByText(`${count} selected`, { exact: true })).toBeVisible();
  }

  async getValidationError(): Promise<string | null> {
    const error = this.page.locator('[role="alert"]');
    if ((await error.count()) === 0) return null;
    return error.innerText();
  }
}
