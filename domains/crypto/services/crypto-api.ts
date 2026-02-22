import type { Crypto } from "@/domains/crypto/types/crypto.types";

const BROWSER_API_BASE_URL = "/backend-api";
const SERVER_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function getApiBaseUrl(): string {
  return typeof window === "undefined" ? SERVER_API_BASE_URL : BROWSER_API_BASE_URL;
}

interface AddToWatchlistResult {
  isConflict: boolean;
  coin: Crypto | null;
}

async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    if (response.status === 204) {
      return null;
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    console.error("API request failed", error);
    return null;
  }
}

export async function fetchAllCoins(): Promise<Crypto[]> {
  const data = await safeFetch<Crypto[]>(`${getApiBaseUrl()}/api/coins`);
  return data ?? [];
}

export async function fetchCoinById(id: string): Promise<Crypto | null> {
  if (!id) {
    return null;
  }

  return safeFetch<Crypto>(`${getApiBaseUrl()}/api/coins/${encodeURIComponent(id)}`);
}

export async function fetchWatchlist(): Promise<Crypto[]> {
  const data = await safeFetch<Crypto[]>(`${getApiBaseUrl()}/api/watchlist`);
  return data ?? [];
}

export async function addToWatchlist(
  coinId: string,
): Promise<AddToWatchlistResult | "not-found" | null> {
  if (!coinId) {
    return null;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coinId }),
      cache: "no-store",
    });

    if (response.status === 404) {
      return "not-found";
    }

    if (response.status === 409 || response.status === 201) {
      const data = (await response.json()) as Crypto;
      return {
        isConflict: response.status === 409,
        coin: data,
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to add to watchlist", error);
    return null;
  }
}

export async function removeFromWatchlist(coinId: string): Promise<boolean> {
  if (!coinId) {
    return false;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/watchlist/${encodeURIComponent(coinId)}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (response.status === 204) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to remove from watchlist", error);
    return false;
  }
}
