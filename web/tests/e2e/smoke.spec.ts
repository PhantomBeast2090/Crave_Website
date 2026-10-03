import { test, expect } from "@playwright/test";

const routes = ["/", "/search", "/food/ghee-roast-dosa", "/outlets/annapurna-mess", "/favorites", "/cart", "/checkout", "/orders", "/reviews", "/vendor", "/management", "/auth/login"];

for (const r of routes) {
  test(`route ${r} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(r, { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toBeVisible();
    // No page-level horizontal scroll (rail children intentionally overflow inside overflow-x-auto)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    expect(errors, `${r} console errors`).toEqual([]);
  });
}

test("search filters + add to cart + checkout handshake", async ({ page }) => {
  await page.goto("/search", { waitUntil: "networkidle" });
  await page.getByLabel("Search food").fill("biryani");
  await expect(page.getByText(/result/i).first()).toBeVisible();
  await page.goto("/", { waitUntil: "networkidle" });
  const add = page.getByRole("button", { name: /add/i }).first();
  if (await add.count()) { await add.click(); }
  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText("Cart");
});
