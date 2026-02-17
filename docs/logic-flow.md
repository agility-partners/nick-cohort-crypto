# CoinSight App Logic Flow

## Scope

This document describes the current runtime logic flow for the implemented home (`/`) and coin detail (`/crypto/[id]`) experiences.

## Initial Render Flow

1. Next.js boots the app and applies `app/layout.tsx`.
2. Global fonts and CSS are loaded.
3. `Home` component in `app/page.tsx` renders as a client component.
4. Initial sort state is created:
   - `sortKey = "marketCap"`
   - `sortDirection = "desc"`
5. `useMemo` computes `sorted` by invoking `sortCryptos(mockCryptos, sortKey, sortDirection)`.
6. UI renders:
   - header/title
   - `SortControls`
   - `Watchlist` with sorted crypto array

## Sorting Flow

## Trigger: sort key changed

1. User selects a different value in `SortControls` select.
2. `onSortKeyChange` callback is invoked with typed `SortKey`.
3. Parent state (`sortKey`) updates in `Home`.
4. Dependency change invalidates `useMemo`.
5. `sortCryptos` re-runs and produces new array ordering.
6. `Watchlist` and descendants re-render using updated list.

## Trigger: direction toggled

1. User clicks the direction button in `SortControls`.
2. Parent callback toggles state:
   - `asc -> desc`
   - `desc -> asc`
3. `useMemo` recomputes sorted array.
4. UI updates card order.

## Sorting Algorithm Behavior

`sortCryptos` behavior by key:

- `name`: lexical compare (`localeCompare`)
- `price`: numeric ascending compare
- `change24h`: numeric ascending compare
- `marketCap`: numeric ascending compare

Direction handling:

- base sort is ascending
- descending is implemented by reversing sorted output

## Render Flow: List to Card

1. `Watchlist` receives `cryptos`.
2. `Watchlist` forwards to `CryptoGrid`.
3. `CryptoGrid` branches:
   - if empty: render empty-state panel
   - else: map `cryptos` to `CryptoCard`
4. Each `CryptoCard` renders:
   - logo or fallback initials
   - name/symbol
   - `PriceDisplay` for numeric output

## Price and Change Formatting Flow

1. `PriceDisplay` receives `price`, optional `change`, and optional `size`.
2. Price is formatted through `Intl.NumberFormat("en-US", { currency: "USD" })`.
3. If `change` is present:
   - compute positive/negative classification
   - render directional marker and absolute percentage value
   - apply positive or negative style classes

## Image Fallback Flow

1. `CryptoCard` attempts remote image load through `next/image`.
2. If image fails, `onError` sets local `imgError = true`.
3. Component re-renders with symbol initials fallback avatar.

## Navigation Flow

1. Each card is wrapped in `next/link` to `/crypto/{id}`.
2. Clicking a card triggers client navigation intent.
3. Server route `app/crypto/[id]/page.tsx` receives the route parameter.
4. The route resolves data using `getCryptoById(id)`.
5. If no match is found, route-level `notFound()` renders `app/crypto/[id]/not-found.tsx`.
6. If a match is found, detail UI renders coin logo, symbol, price/change, market cap, and volume.

## Detail Route Render Flow (`/crypto/[id]`)

1. The page reads `params.id` from the dynamic route segment.
2. Static IDs are predeclared through `generateStaticParams()` from the mock dataset.
3. Route metadata is generated per coin through `generateMetadata()`.
4. Main detail page renders market metrics and links back to `/`.

## State Ownership Map

- `Home`: owns sort key and direction state
- `SortControls`: stateless UI emitter via callbacks
- `Watchlist`, `CryptoGrid`, `CryptoCard`, `PriceDisplay`: derived presentation from props
- `CryptoCard`: local UI state only for image fallback (`imgError`)

## Data Dependency Map

- Primary source: `mockCryptos` static array
- No fetch lifecycle, caching layer, or async boundary is currently involved

## Error Handling Behavior

- Image-level failure handling exists in `CryptoCard`
- No global error boundary or data-loading error path is required yet due to static local data

## Future Flow Extensions

To evolve this logic while preserving structure:

1. Replace static data import with repository/API fetch layer.
2. Add loading, empty, and failure states for networked data paths.
3. Persist user sorting preferences in URL params or storage.
4. Add historical pricing and chart data flow for detail pages.