import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test("authenticated customer can save policy and a real-form trip", async ({ page }) => {
  test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD for the authenticated beta flow.");
  await page.goto("/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/settings");
  await page.getByText("Advanced route limits").click();
  await page.getByLabel("Suggest without asking, up to").fill("25000");
  await page.getByLabel("Always ask above").fill("100000");
  await page.getByLabel("Approved connection airport codes").fill("DOH, DXB, SIN");
  await page.getByRole("button", { name: "Save travel rules" }).click();
  await expect(page.getByText("Recovery rules saved.")).toBeVisible();

  await page.goto("/trips/new?method=manual");
  await page.getByLabel("Flight number").fill("AI202");
  await page.getByLabel("Flying from").fill("Delhi");
  await page.getByRole("option", { name: /Delhi.*DEL/ }).click();
  await page.getByLabel("Flying to").fill("Singapore");
  await page.getByRole("option", { name: /Singapore.*SIN/ }).click();
  await page.getByLabel("Departs").fill("2026-10-10T10:00");
  await page.getByLabel("Arrives").fill("2026-10-10T16:00");
  await page.getByRole("button", { name: "Start monitoring" }).click();
  await expect(page.getByRole("heading", { name: "Singapore trip" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
  await page.getByRole("link", { name: "Edit trip" }).click();
  await expect(page.getByRole("heading", { name: "Edit Singapore trip" })).toBeVisible();
  await page.getByLabel("Flight number").fill("AI203");
  await page.getByRole("button", { name: "Save trip changes" }).click();
  await expect(page.getByText("AI203")).toBeVisible();
  await page.getByRole("link", { name: "Activity" }).click();
  await expect(page.getByText("Trip itinerary updated by customer.")).toBeVisible();
});

test("admin credentials redirect to the hidden role-protected portal", async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for the admin flow.");
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: "Beta overview" })).toBeVisible();
  await expect(page.getByText("Passwords and provider tokens are never displayed.")).toBeVisible();
});
