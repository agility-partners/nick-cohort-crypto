# Theming

Dark/light mode is implemented via `next-themes` with class-based switching.

---

## How It Works

1. `ThemeProvider` (`shared/components/theme-provider.tsx`) wraps the app in `app/layout.tsx`.
2. `next-themes` manages a `class` attribute on `<html>` and persists the user's preference in localStorage.
3. CSS custom properties swap via the `.dark` selector in `globals.css`, updating all themed surfaces.

---

## Theme Toggle Flow

1. User clicks `ThemeToggle` → `setTheme()` from `next-themes` toggles between `"dark"` and `"light"`.
2. `next-themes` updates the `class` attribute on `<html>` and persists the choice in localStorage.
3. CSS custom properties swap via the `.dark` selector in `globals.css`.
4. `ThemeToggle` defers icon rendering until after mount to avoid hydration mismatch.

---

## CSS Custom Properties

Dual palettes are defined in `globals.css`:

- `:root` — light theme values
- `.dark` — dark theme overrides

Chart-specific properties:
- `--candle-up` — color for bullish candles
- `--candle-down` — color for bearish candles

---

## Hydration Safety

- `suppressHydrationWarning` is set on `<html>` to handle the class attribute change between server and client.
- `ThemeToggle` defers render until mounted so the icon matches the resolved theme.
- `Suspense` wraps `useSearchParams` consumers (not theme-specific, but part of the overall hydration strategy).
