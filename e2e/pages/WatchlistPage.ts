import { expect, type Locator, type Page } from "@playwright/test";

export class WatchlistPage {
  readonly page: Page;
  readonly allCoinsHeading: Locator;
  readonly watchlistHeading: Locator;
  readonly coinDetailLinks: Locator;
  readonly sortDropdown: Locator;
  readonly sortDescButton: Locator;
  readonly sortAscButton: Locator;
  readonly runtimeError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.allCoinsHeading = page.getByRole("heading", { level: 2, name: "All Coins" });
    this.watchlistHeading = page.getByRole("heading", { level: 2, name: "Watchlist" });
    this.coinDetailLinks = page.getByRole("link", { name: /View details for/i });
    this.sortDropdown = page.locator("#all-coins-sort");
    this.sortDescButton = page.getByRole("button", { name: "Sort order descending" });
    this.sortAscButton = page.getByRole("button", { name: "Sort order ascending" });
    this.runtimeError = page.getByText("Runtime SyntaxError");
  }

  async goto() {
    await this.page.goto("/");
  }

  async gotoWithView(view: string) {
    await this.page.goto(`/?view=${view}`);
  }

  async isLoaded() {
    await expect(this.allCoinsHeading).toBeVisible();
  }

  async clickFirstCoin(): Promise<string> {
    const firstLink = this.coinDetailLinks.first();
    const ariaLabel = await firstLink.getAttribute("aria-label");

    if (!ariaLabel) {
      throw new Error("Expected first crypto card link to have an aria-label.");
    }

    const coinName = ariaLabel.replace(/^View details for\s+/, "");
    await firstLink.click();
    return coinName;
  }

  async clickCoinByName(name: string) {
    await this.page.getByRole("link", { name: `View details for ${name}` }).click();
  }

  async getCardCount(): Promise<number> {
    return this.coinDetailLinks.count();
  }

  async getSortMetricValue(): Promise<string> {
    return this.sortDropdown.inputValue();
  }

  async setSortMetric(value: string) {
    await this.sortDropdown.selectOption(value);
  }

  async toggleSortOrder() {
    const descVisible = await this.sortDescButton.isVisible();
    if (descVisible) {
      await this.sortDescButton.click();
    } else {
      await this.sortAscButton.click();
    }
  }

  coinHeading(name: string): Locator {
    return this.page.getByRole("heading", { level: 2, name });
  }

  async expectAllCoinsHeadingVisible() {
    await expect(this.allCoinsHeading).toBeVisible();
  }

  async expectWatchlistHeadingVisible() {
    await expect(this.watchlistHeading).toBeVisible();
  }

  async expectCoinHeadingVisible(name: string) {
    await expect(this.coinHeading(name)).toBeVisible();
  }

  async expectSortMetric(value: string) {
    await expect(this.sortDropdown).toHaveValue(value);
  }

  async expectSortDescVisible() {
    await expect(this.sortDescButton).toBeVisible();
  }

  async expectSortAscVisible() {
    await expect(this.sortAscButton).toBeVisible();
  }

  async expectNoRuntimeErrors() {
    await expect(this.runtimeError).toHaveCount(0);
  }

  async expectNoTabVisible(name: string) {
    await expect(this.page.getByRole("link", { name, exact: true })).toHaveCount(0);
  }
}
