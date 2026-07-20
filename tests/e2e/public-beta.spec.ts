import { expect, test } from "@playwright/test";

test("production landing explains the real beta workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /When a family trip changes/ })).toBeVisible();
  await expect(page.getByText("You approve changes")).toBeVisible();
  await expect(page.getByRole("link", { name: /See a recovery example/ })).toHaveAttribute("href", "#recovery-example");
  await expect(page.getByText("Example only · no live inventory · no booking executed")).toBeVisible();
  await expect(page.getByText("Google Calendar read-only import is next.")).toHaveCount(0);
});

test("visitor receives value and customizes a policy before signup", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Family rules" }).click();
  await expect(page.getByRole("heading", { name: "Build your starter travel policy." })).toBeVisible();
  await page.getByRole("button", { name: /Avoid overnight waits/ }).click();
  await expect(page.getByText("Draft saved on this device.")).toBeVisible();
  await page.getByRole("link", { name: "Save this to SafarSet" }).click();
  await expect(page).toHaveURL(/\/signup\?from=starter/);
  await expect(page.getByText("Starter policy ready")).toBeVisible();
  await expect(page.getByText("1 OF 4")).toBeVisible();
});

test("account access is clear and respects environment configuration", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Access SafarSet" })).toBeVisible();
  const warning = page.getByText("Set the Supabase environment values before using accounts.");
  const submit = page.getByRole("button", { name: "Sign in", exact: true }).last();
  if (await warning.isVisible()) await expect(submit).toBeDisabled();
  else await expect(submit).toBeEnabled();
});

test("brand kit is available and uses the production mark", async ({ page }) => {
  await page.goto("/brand");
  await expect(page.getByRole("heading", { name: "Calm control when plans break." })).toBeVisible();
  const image = page.getByAltText(/SafarSet brand kit/);
  await expect(image).toBeVisible();
  await expect(image).toHaveJSProperty("complete", true);
});

test("public pages do not overflow at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/login", "/signup", "/brand", "/privacy", "/terms"]) {
    await page.goto(path);
    const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.inner);
  }
});

test("PWA shell is installable and does not claim offline customer data", async ({ page, request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.description).not.toContain("demo");

  const offlineResponse = await request.get("/offline.html");
  expect(offlineResponse.ok()).toBe(true);
  await expect(offlineResponse.text()).resolves.toContain("Customer data is not cached");

  await page.goto("/");
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBeGreaterThan(0);
});
