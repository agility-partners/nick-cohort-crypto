import type { APIRequestContext } from "@playwright/test";

export async function clearWatchlist(request: APIRequestContext): Promise<void> {
  const response = await request.get("/backend-api/api/watchlist");
  const coins = (await response.json()) as Array<{ id: string }>;

  for (const coin of coins) {
    await request.delete(`/backend-api/api/watchlist/${coin.id}`);
  }
}
