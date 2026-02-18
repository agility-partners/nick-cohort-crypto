# Routing

Routing is handled by the Next.js App Router via files in `app/`. Route files stay thin and delegate UI/state to domain components.

---

## Route Map

| URL | Route file | Type | Rendered content |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Static route | Wraps and renders `HomeContent` in `<Suspense>` |
| `/crypto/[id]` | `app/crypto/[id]/page.tsx` | Dynamic segment | Resolves `id`, renders detail header + `ChartSection` |
| `/crypto/[id]` not found | `app/crypto/[id]/not-found.tsx` | Segment 404 UI | Shown when `notFound()` is triggered |

---

## Layout Hierarchy

1. `app/layout.tsx` is the global shell for every route.
2. It renders `ThemeProvider` → `Header` → `Navbar` → route `children`.
3. Shared navigation and theme behavior are therefore consistent across home and detail pages.

---

## Query-Param Routing on Home

Home sub-views are URL-driven through `?view=` (not separate route files):

- `/?view=all`
- `/?view=gainers`
- `/?view=losers`
- `/?view=volume`

`Navbar` links write these query params, and `HomeContent` reads them using `useSearchParams` to update default sorting and title.

### Navigation flow

1. `next/link` navigates to `/?view=<view>`.
2. URL change triggers `HomeContent` to re-read params.
3. `useEffect` resets sort state to the view's default.
4. Grid re-renders with new ordering.

---

## Dynamic Detail Route

1. `generateStaticParams()` returns every known coin id from `mockCryptos`.
2. Next.js pre-renders `/crypto/<id>` pages at build time for those ids.
3. On request, the page resolves `params.id` and looks up data with `getCryptoById(id)`.
4. Missing ids call `notFound()`, which renders the segment-level not-found UI.

---

## Hydration Safety

- `Suspense` wraps `useSearchParams` consumers to avoid hydration mismatches.
- `suppressHydrationWarning` is set on `<html>` for theme class changes.
- `ThemeToggle` defers render until mounted.
