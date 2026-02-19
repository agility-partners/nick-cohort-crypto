# CoinSight Overview

CoinSight is a client-driven crypto dashboard built on **Next.js 16 App Router** with **React 19**. All data comes from a static in-repo mock module — there is no backend, API route, or persistence layer. This keeps the runtime deterministic while the UI is developed.

---

## Tech Stack

| Package                       | Purpose              |
| ----------------------------- | -------------------- |
| `next` 16.1.6                 | Framework & routing  |
| `react` / `react-dom` 19.2.3 | UI library           |
| `next-themes` ^0.4            | Dark/light mode      |
| `tailwindcss` v4              | Utility CSS          |
| `prettier` 3.8.1              | Code formatting      |
| `eslint` 9 + config-next      | Linting              |

No external charting, state management, or data-fetching libraries are used.

---

## Related Docs

| Doc | What it covers |
| --- | -------------- |
| [folder-structure.md](folder-structure.md) | Project layout and naming conventions |
| [routing.md](routing.md) | Route map, layout hierarchy, query params, static generation |
| [component-hierarchy.md](component-hierarchy.md) | Render trees for shell, home, and detail pages |
| [state-management.md](state-management.md) | State ownership, sort/view lifecycle |
| [chart-system.md](chart-system.md) | Chart architecture, data generation, SVG layers, interactions |
| [theming.md](theming.md) | Theme toggle flow, CSS custom properties, hydration safety |
| [playwright-testing.md](playwright-testing.md) | E2E setup, commands, suite coverage, logging, and debugging workflow |
| [data-model.md](data-model.md) | Mock data structure, types, image fallback |
| [decisions.md](decisions.md) | Key architectural decisions |
| [roadmap.md](roadmap.md) | Known gaps and evolution path |
