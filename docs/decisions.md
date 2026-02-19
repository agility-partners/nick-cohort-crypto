# Architectural Decisions

Key decisions made in CoinSight and the reasoning behind them.

---

| Decision | Detail |
| --- | --- |
| **Folder structure** | Domain-based: `domains/<feature>/`, `shared/`, `app/` (routing only). No flat `src/` dump. |
| **Data source** | Static `mockCryptos` array in `domains/crypto/mock/cryptos.mock.ts` with `Crypto` interface and `getCryptoById()` helper. |
| **Type system** | Domain model types are centralized in `domains/crypto/types/`. `interface` is used for props/object shapes, `type` for unions/aliases. No `any`. |
| **Theming** | `next-themes` with class-based switching; dual CSS custom-property palettes in `globals.css` (`:root` light, `.dark` dark); includes `--candle-up` / `--candle-down` for chart colors. |
| **View modes** | URL-driven via `?view=` param. Top tabs expose `watchlist` (only when populated), `all`, `gainers`, and `volume`. |
| **Watchlist state** | Watchlist IDs are managed in a domain-level provider (`use-watchlist`) and persisted to localStorage for cross-route continuity. |
| **Sorting** | Home uses a simple high↔low order toggle for market views; watchlist is always alphabetical by coin name. |
| **Form UX states** | Add-to-watchlist form includes validation, submit pending feedback, and inline error messaging. |
| **Route states** | `app/watchlist/add` includes route-level `loading.tsx` and `error.tsx` boundaries for resilient UX. |
| **Charts** | `ChartSection` manages state; `generate-mock-chart-data.ts` produces deterministic data via seeded PRNG; `chart-helpers.ts` handles geometry; `PriceChart` orchestrates SVG rendering via `ChartGrid`, `LineChartLayer`, and `CandlestickLayer`. No charting library. |
| **Static generation** | Detail pages use `generateStaticParams()` to pre-render all coin routes at build time. |
| **Image handling** | `CryptoLogo` wraps `next/image` with fallback initials on error; remote hosts allowlisted in `next.config.ts`. |
| **Hydration safety** | `Suspense` wraps `useSearchParams` consumers; `suppressHydrationWarning` is set on `<html>`; `ThemeToggle` uses `useSyncExternalStore` client detection to avoid hydration mismatch. |
| **Code quality** | Prettier (semi, double quotes, 2-space indent, 100 print width) + ESLint with `eslint-config-next` and `eslint-config-prettier`. |
