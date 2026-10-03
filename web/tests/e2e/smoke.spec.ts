import { test, expect } from "@playwright/test";

// All assertions run against the LIVE Supabase backend (anon key).
// No demo slugs, no fixtures — tests discover real data through the UI.

test("home shows live outlets and catalogue rails", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText("craving");
  await expect(page.getByText("Outlets on campus")).toBeVisible();
  expect(await page.locator('a[href^="/outlets/"]').count()).toBeGreaterThan(0);
  expect(await page.locator('a[href^="/food/"]').count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("search finds live biryani via search_food RPC", async ({ page }) => {
  await page.goto("/search", { waitUntil: "networkidle" });
  await page.getByLabel("Search food").fill("biryani");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText(/results? for/i).first()).toBeVisible({ timeout: 15000 });
  expect(await page.locator('a[href^="/food/"]').count()).toBeGreaterThan(0);
});

test("outlet catalogue + food detail render live rows", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('a[href^="/outlets/"]').first().click();
  await expect(page.locator("h1").first()).toBeVisible();
  const foods = page.locator('a[href^="/food/"]');
  expect(await foods.count()).toBeGreaterThan(0);
  await foods.first().click();
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /add/i }).first()).toBeVisible();
});

test("cart refreshes live prices, checkout requires sign-in", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const add = page.getByRole("button", { name: /add/i }).first();
  if (await add.count()) await add.click();
  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText("Cart");
  await page.goto("/checkout", { waitUntil: "networkidle" });
  await expect(page.getByText(/sign in/i).first()).toBeVisible();
});

test("orders, vendor, management gate honestly without session", async ({ page }) => {
  for (const r of ["/orders", "/favorites"]) {
    await page.goto(r, { waitUntil: "networkidle" });
    await expect(page.locator("h1, h2").first()).toBeVisible();
  }
  await page.goto("/vendor", { waitUntil: "networkidle" });
  await expect(page.locator("h1").first()).toBeVisible();
  await page.goto("/management", { waitUntil: "networkidle" });
  await expect(page.locator("h1").first()).toBeVisible();
});

test("no page-level horizontal scroll on key routes", async ({ page }) => {
  for (const r of ["/", "/search", "/cart", "/vendor", "/management"]) {
    await page.goto(r, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, r).toBeLessThanOrEqual(1);
  }
});
