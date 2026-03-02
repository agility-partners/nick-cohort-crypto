import { expect, type Locator, type Page } from "@playwright/test";

export class NavigationComponent {
  readonly page: Page;
  readonly watchlistTab: Locator;
  readonly allCoinsTab: Locator;
  readonly compareTab: Locator;
  readonly lightModeButton: Locator;
  readonly darkModeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.watchlistTab = page.getByRole("link", { name: "Watchlist", exact: true });
    this.allCoinsTab = page.getByRole("link", { name: "All Coins", exact: true });
    this.compareTab = page.getByRole("link", { name: "Compare", exact: true });
    this.lightModeButton = page.getByRole("button", { name: "Switch to light mode" });
    this.darkModeButton = page.getByRole("button", { name: "Switch to dark mode" });
  }

  async goToWatchlist() {
    await this.watchlistTab.click();
  }

  async goToAllCoins() {
    await this.allCoinsTab.click();
  }

  async goToCompare() {
    await this.compareTab.click();
  }

  async switchToLightMode() {
    await this.lightModeButton.click();
  }

  async switchToDarkMode() {
    await this.darkModeButton.click();
  }

  async expectWatchlistTabVisible() {
    await expect(this.watchlistTab).toBeVisible();
  }

  async expectWatchlistTabHidden() {
    await expect(this.watchlistTab).toHaveCount(0);
  }

  async expectAllCoinsTabVisible() {
    await expect(this.allCoinsTab).toBeVisible();
  }

  async expectCompareTabVisible() {
    await expect(this.compareTab).toBeVisible();
  }

  async expectLightModeButtonVisible() {
    await expect(this.lightModeButton).toBeVisible();
  }

  async expectDarkModeButtonVisible() {
    await expect(this.darkModeButton).toBeVisible();
  }
}
