import { test } from "@playwright/test";

export function registerE2ELogging(scope: string) {
  test.beforeEach(async ({}, testInfo) => {
    console.log(`[E2E][START][${scope}] ${testInfo.title}`);
  });

  test.afterEach(async ({}, testInfo) => {
    console.log(`[E2E][END][${scope}] ${testInfo.title} -> ${testInfo.status}`);
  });
}
