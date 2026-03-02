import { expect, type Locator, type Page } from "@playwright/test";

export class CoinDetailPage {
  readonly page: Page;
  readonly priceChartHeading: Locator;
  readonly chartImage: Locator;
  readonly candleButton: Locator;
  readonly lineButton: Locator;
  readonly backLink: Locator;
  readonly notFoundHeading: Locator;
  readonly returnLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.priceChartHeading = page.getByRole("heading", { level: 2, name: "Price Chart" });
    this.chartImage = page.getByRole("img", { name: /price chart$/i });
    this.candleButton = page.getByRole("button", { name: "Candle", exact: true });
    this.lineButton = page.getByRole("button", { name: "Line", exact: true });
    this.backLink = page.getByRole("link", { name: "← Back to watchlist" });
    this.notFoundHeading = page.getByRole("heading", { level: 1, name: "Crypto Not Found" });
    this.returnLink = page.getByRole("link", { name: "Return to watchlist" });
  }

  async goto(coinId: string) {
    await this.page.goto(`/crypto/${coinId}`);
  }

  async isLoaded() {
    await expect(this.page.getByRole("heading", { level: 1 })).toBeVisible();
  }

  coinNameHeading(name: string): Locator {
    return this.page.getByRole("heading", { level: 1, name });
  }

  async expectCoinName(name: string) {
    await expect(this.coinNameHeading(name)).toBeVisible();
  }

  async expectChartVisible() {
    await expect(this.priceChartHeading).toBeVisible();
    await expect(this.chartImage).toBeVisible();
  }

  async getChartSymbol(): Promise<string> {
    const ariaLabel = await this.chartImage.getAttribute("aria-label");

    if (!ariaLabel) {
      throw new Error("Expected chart image to include an aria-label.");
    }

    return ariaLabel.replace(/\s+price chart$/i, "");
  }

  rangeButton(range: string): Locator {
    return this.page.getByRole("button", { name: range, exact: true });
  }

  async selectChartRange(range: string) {
    await this.rangeButton(range).click();
  }

  async selectCandleChart() {
    await this.candleButton.click();
  }

  async selectLineChart() {
    await this.lineButton.click();
  }

  async expectChartSubtitle(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectLineButtonVisible() {
    await expect(this.lineButton).toBeVisible();
  }

  async goBack() {
    await this.backLink.click();
  }

  async expectOnDetailRoute() {
    await expect(this.page).toHaveURL(/\/crypto\/[a-z0-9-]+$/);
  }

  async expectNotFound() {
    await expect(this.notFoundHeading).toBeVisible();
    await expect(this.returnLink).toBeVisible();
  }
}
