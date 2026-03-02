# Assistant Golden Evals

CoinSight includes a lightweight golden eval runner for the assistant.

## What it validates

- Expected tool usage pattern per prompt (minimum tool call counts by tool name)
- Response grounding metadata for factual answers (`Source:` + `As of:`)
- Investment-advice refusal behavior
- Unknown-symbol graceful handling
- Stale/unavailable data fallback behavior

The runner uses deterministic eval metadata returned by `/api/chat` only when eval headers are present. Normal product UX/streaming behavior is unchanged.

## Golden cases

Fixtures live at:

- `domains/assistant/mock/assistant-evals.json`

The suite currently includes 11 prompts and covers:

- Top movers
- BTC vs ETH compare
- Selected list vs market
- Unknown symbol handling
- Simulated stale/unavailable data behavior

## Run locally

Prerequisites:

- Frontend app running on `http://127.0.0.1:3000` (or set a custom base URL)
- `OPENAI_API_KEY` configured for the app environment

Command:

```bash
npm run test:assistant-evals
```

Optional custom endpoint:

```bash
ASSISTANT_EVAL_BASE_URL=http://localhost:3000 npm run test:assistant-evals
```

## Output and exit code

The runner prints per-case `[PASS]` / `[FAIL]` lines and a final summary:

- `Total`
- `Passed`
- `Failed`

If any case fails, the process exits with status `1` (CI-friendly).
