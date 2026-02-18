# Roadmap

## Known Gaps

- No API or data-service abstraction layer
- No test harness
- Sort/view state not persisted across sessions (theme is persisted by `next-themes` via localStorage)
- Chart time-range and type selections reset on navigation

---

## Evolution Path

1. Introduce a data gateway with static and API adapters
2. Add test coverage for sorting, view logic, and rendering
3. Add runtime data refresh (polling, revalidation, or streaming)
4. Replace mock price series with real historical data
5. Persist view/sort preferences in URL params or local storage
