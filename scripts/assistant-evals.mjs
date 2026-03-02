import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const FIXTURE_PATH = path.join(REPO_ROOT, "domains/assistant/mock/assistant-evals.json");

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";
const CHAT_PATH = "/api/chat";
const EVAL_MODE_HEADER = "x-assistant-eval-mode";
const EVAL_SCENARIO_HEADER = "x-assistant-eval-scenario";
const EVAL_MODE_JSON = "json";

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function fail(message) {
  console.log(`[FAIL] ${message}`);
}

function normalizeBaseUrl(input) {
  const trimmed = (input ?? "").trim();
  if (!trimmed) {
    return DEFAULT_BASE_URL;
  }

  return trimmed.replace(/\/$/, "");
}

function toLower(value) {
  return value.toLocaleLowerCase();
}

function includesCaseInsensitive(text, token) {
  return toLower(text).includes(toLower(token));
}

function hasSourceFreshnessLine(text) {
  return /Source:\s*.+\nAs of:\s*.+/i.test(text);
}

function validateToolCalls(trace, minToolCalls) {
  const errors = [];

  for (const [toolName, minimum] of Object.entries(minToolCalls)) {
    const actual = Number(trace.toolCallCounts?.[toolName] ?? 0);
    if (actual < minimum) {
      errors.push(`expected ${toolName} >= ${minimum}, got ${actual}`);
    }
  }

  return errors;
}

function validateContent(text, expected) {
  const errors = [];

  if (expected.requiresSourceFreshnessLine && !hasSourceFreshnessLine(text)) {
    errors.push("missing Source/As of freshness line");
  }

  if (expected.mustContainAll) {
    for (const token of expected.mustContainAll) {
      if (!includesCaseInsensitive(text, token)) {
        errors.push(`missing required text: \"${token}\"`);
      }
    }
  }

  if (expected.mustContainAny && expected.mustContainAny.length > 0) {
    const hasAny = expected.mustContainAny.some((token) => includesCaseInsensitive(text, token));
    if (!hasAny) {
      errors.push(`missing one of required alternatives: ${expected.mustContainAny.join(" | ")}`);
    }
  }

  if (expected.mustNotContain) {
    for (const token of expected.mustNotContain) {
      if (includesCaseInsensitive(text, token)) {
        errors.push(`contains forbidden text: \"${token}\"`);
      }
    }
  }

  return errors;
}

async function callAssistantEval(chatUrl, evalCase) {
  const url = new URL(chatUrl);
  url.searchParams.set("evalMode", EVAL_MODE_JSON);
  url.searchParams.set("evalScenario", evalCase.scenario);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [EVAL_MODE_HEADER]: EVAL_MODE_JSON,
      [EVAL_SCENARIO_HEADER]: evalCase.scenario,
    },
    body: JSON.stringify({
      messages: [
        {
          id: `eval-${evalCase.id}`,
          role: "user",
          parts: [{ type: "text", text: evalCase.prompt }],
        },
      ],
      ...(evalCase.context ? { context: evalCase.context } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} from /api/chat. Body: ${body}`);
  }

  const payload = await response.json();
  if (!payload || typeof payload.text !== "string" || typeof payload.trace !== "object") {
    throw new Error("Unexpected eval response payload shape.");
  }

  return payload;
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.ASSISTANT_EVAL_BASE_URL);
  const chatUrl = `${baseUrl}${CHAT_PATH}`;

  console.log("\n=== CoinSight Assistant Golden Evals ===");
  console.log(`Chat endpoint: ${chatUrl}`);
  console.log("Eval mode: deterministic trace + content checks\n");

  const rawFixtures = await fs.readFile(FIXTURE_PATH, "utf8");
  const evalCases = JSON.parse(rawFixtures);

  if (!Array.isArray(evalCases) || evalCases.length < 10) {
    throw new Error("assistant-evals.json must contain at least 10 eval cases.");
  }

  let passed = 0;
  let failed = 0;

  for (const evalCase of evalCases) {
    const caseErrors = [];

    try {
      const payload = await callAssistantEval(chatUrl, evalCase);
      const text = payload.text;
      const trace = payload.trace;

      caseErrors.push(...validateToolCalls(trace, evalCase.expected.minToolCalls));
      caseErrors.push(...validateContent(text, evalCase.expected));

      if (trace.fallbackReason !== evalCase.expected.expectedFallbackReason) {
        caseErrors.push(
          `fallback reason mismatch: expected ${evalCase.expected.expectedFallbackReason}, got ${trace.fallbackReason}`,
        );
      }

      if (Boolean(trace.refusedForAdvice) !== Boolean(evalCase.expected.expectRefusal)) {
        caseErrors.push(
          `refusal mismatch: expected ${evalCase.expected.expectRefusal}, got ${trace.refusedForAdvice}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown eval error";
      caseErrors.push(message);
    }

    if (caseErrors.length === 0) {
      passed += 1;
      pass(evalCase.id);
    } else {
      failed += 1;
      fail(`${evalCase.id} -> ${caseErrors.join("; ")}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Total: ${evalCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown failure";
  console.error(`\n❌ Assistant eval runner failed: ${message}`);
  process.exit(1);
});
