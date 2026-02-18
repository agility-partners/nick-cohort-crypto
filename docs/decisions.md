# Architectural Decisions

Key decisions made in CoinSight and the reasoning behind them.

---

| Decision | Detail |
| --- | --- |
| **Folder structure** | Domain-based: `domains/<feature>/`, `shared/`, `app/` (routing only). No flat `src/` dump. |
| **Data source** | Static `mockCryptos` array in `domains/crypto/mock/cryptos.mock.ts` with `Crypto` interface and `getCryptoById()` helper. |
| **Type system** | All domain types in `domains/crypto/types/crypto.types.ts`. `interface` for shapes/props, `type` for unions/aliases. No `any`. |
| **Theming** | `next-themes` with class-based switching; dual CSS custom-property palettes in `globals.css` (`:root` light, `.dark` dark); includes `--candle-up` / `--candle-down` for chart colors. |
| **View modes** | URL-driven via `?view=` param — `all`, `gainers`, `losers`, `volume`. Constants defined in `domains/crypto/constants.ts`. |
| **Sorting** | Pure `sortCryptos()` in `home-content.tsx`, memoized with `useMemo`. Keys: `name`, `price`, `change24h`, `marketCap`, `volume24h`. |
| **Charts** | `ChartSection` manages state; `generate-mock-chart-data.ts` produces deterministic data via seeded PRNG; `chart-helpers.ts` handles geometry; `PriceChart` orchestrates SVG rendering via `ChartGrid`, `LineChartLayer`, and `CandlestickLayer`. No charting library. |
| **Static generation** | Detail pages use `generateStaticParams()` to pre-render all coin routes at build time. |
| **Image handling** | `CryptoLogo` wraps `next/image` with fallback initials on error; remote hosts allowlisted in `next.config.ts`. |
| **Hydration safety** | `Suspense` around `useSearchParams` consumers; `suppressHydrationWarning` on `<html>`; `ThemeToggle` defers render until mounted. |
| **Code quality** | Prettier (semi, double quotes, 2-space indent, 100 print width) + ESLint with `eslint-config-next` and `eslint-config-prettier`. |
