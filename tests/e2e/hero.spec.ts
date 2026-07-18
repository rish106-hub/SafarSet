import { expect, test, type Page } from "@playwright/test";

async function resetBrowserState(page: Page) {
  await page.addInitScript(() => window.localStorage.clear());
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function openWorkspaceView(page: Page, name: string) {
  const direct = page.getByRole("button", { name, exact: true });
  if (await direct.isVisible()) {
    await direct.click();
    return;
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name, exact: true }).click();
}

async function runHeroFlow(page: Page) {
  await resetBrowserState(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Review protected trip" }).click();
  await expect(page.getByRole("heading", { name: "Recovery policy" })).toBeVisible();
  await page.getByLabel("Minimum connection").fill("105");
  await page.getByRole("button", { name: "Save and view active trip" }).click();
  await page.getByRole("button", { name: "Inject disruption" }).click();
  await page.getByRole("button", { name: "Run safe recovery" }).click();
  await expect(page.getByText("RECOVERY COMPLETE")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("SIMULATED_REISSUE", { exact: true })).toBeVisible();
  await expect(page.getByText("SIMULATED_HOTEL_CHANGE", { exact: true })).toBeVisible();
  await expect(page.getByText("SIMULATED_TRANSFER_CHANGE", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Open audit trail" }).click();
  await expect(page.getByRole("heading", { name: "What happened" })).toBeVisible();
  await expect(page.getByText("Recovery decision recorded")).toBeVisible();
  await openWorkspaceView(page, "API truth");
  await expect(page.getByTestId("truth-table").getByText("SIMULATED", { exact: true }).first()).toBeVisible();
  await openWorkspaceView(page, "Evaluation");
  await page.getByRole("button", { name: "Run 40 scenarios" }).click();
  await expect(page.getByTestId("evaluation-report")).toContainText("All safety gates passed");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("heading", { name: /Your family trip breaks/ })).toBeVisible();
}

test.describe.configure({ mode: "serial" });

for (let run = 1; run <= 5; run += 1) {
  test(`hero recovery completes without external services, run ${run}`, async ({ page }) => {
    await runHeroFlow(page);
  });
}

test("truth and controls remain usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetBrowserState(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Review protected trip" }).click();
  await openWorkspaceView(page, "API truth");
  await expect(page.getByRole("heading", { name: "What is real here" })).toBeVisible();
  await expect(
    page.getByTestId("truth-table").getByText("OPTIONAL_LIVE", { exact: true }).first(),
  ).toBeVisible();
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.inner);
});

test("PWA manifest, worker, and offline shell are available", async ({ page, request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(2);

  const offlineResponse = await request.get("/offline.html");
  expect(offlineResponse.ok()).toBe(true);
  await expect(offlineResponse.text()).resolves.toContain("Network unavailable");

  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await navigator.serviceWorker.getRegistrations()).length,
      ),
    )
    .toBeGreaterThan(0);
});
