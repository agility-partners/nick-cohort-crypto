# Routing

Routing is handled by the Next.js App Router via files in `app/`. Route files stay thin and delegate UI/state to domain components. The frontend communicates with the .NET API through a rewrite proxy configured in `next.config.ts`.

---

## Route Map

| URL | Route file | Type | Rendered content |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Static route | Wraps and renders `HomeContent` in `<Suspense>` |
| `/watchlist/add` | `app/watchlist/add/page.tsx` | Static route | Renders add-to-watchlist form content |
| `/watchlist/add` loading | `app/watchlist/add/loading.tsx` | Route loading boundary | Skeleton UI while add page is resolving |
| `/watchlist/add` error | `app/watchlist/add/error.tsx` | Route error boundary | Recovery UI with retry/back actions |
| `/crypto/[id]` | `app/crypto/[id]/page.tsx` | Dynamic segment (`force-dynamic`) | Fetches coin from API, renders detail header + `ChartSection` |
| `/crypto/[id]` not found | `app/crypto/[id]/not-found.tsx` | Segment 404 UI | Shown when `notFound()` is triggered |

---

## Layout Hierarchy

1. `app/layout.tsx` is the global shell for every route.
2. It renders `ThemeProvider` → `Header` → `Navbar` → route `children`.
3. Shared navigation and theme behavior are therefore consistent across home and detail pages.

---

## API Proxy Rewrite

`next.config.ts` includes a rewrite rule that proxies API requests from the browser:

```
/backend-api/:path*  →  ${NEXT_PUBLIC_API_URL}/:path*
```

This means browser-side fetch calls go to `/backend-api/api/coins` (same origin), and Next.js rewrites them to `http://localhost:5000/api/coins` (or `http://api:5000` in Docker). This avoids CORS issues for client-side requests.

Server-side rendering requests (from Next.js Node.js process) call the API URL directly since they are not subject to browser CORS restrictions.

The `crypto-api.ts` client detects the environment (`typeof window`) and uses the appropriate base URL:

- Browser: `/backend-api`
- Server: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`)

---

## Query-Param Routing on Home

Home sub-views are URL-driven through `?view=` (not separate route files):

- `/?view=watchlist` (only displayed as a tab when populated)
- `/?view=all`
- `/?view=compare`

`Navbar` links write these query params, and `HomeContent` reads them using `useSearchParams` to resolve title, visibility, and ordering.

### Navigation flow

1. `next/link` navigates to `/?view=<view>`.
2. URL change triggers `HomeContent` to re-read params.
3. Home resolves an allowed default (`watchlist` when populated, otherwise `all`).
4. Grid re-renders with updated ordering.

---

## Dynamic Detail Route

1. `app/crypto/[id]/page.tsx` exports `const dynamic = "force-dynamic"` — pages are rendered on each request, not statically generated.
2. On request, the page calls `fetchCoinById(id)` from `crypto-api.ts`, which fetches from the .NET API.
3. Missing IDs return `null` from the API (404), and the page calls `notFound()` to render the segment-level not-found UI.

This replaced the previous `generateStaticParams()` approach, which pre-rendered pages from mock data at build time. With the API backend, pages are rendered dynamically to reflect current API state.

---

## Hydration Safety

- `Suspense` wraps `useSearchParams` consumers to avoid hydration mismatches.
- `suppressHydrationWarning` is set on `<html>` for theme class changes.
- `ThemeToggle` uses `useSyncExternalStore` for client detection without setState-in-effect.
