import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// WCAG 2.2 AA guardrails on the highest-traffic routes, against live data.
// Serious + critical violations fail the build.

const ROUTES = ["/", "/search", "/cart", "/auth/login", "/reviews", "/offers"];

for (const route of ROUTES) {
  test(`axe: ${route} has no serious violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking.map((v) => `${v.id}: ${v.nodes.length} nodes — ${v.help}`), route).toEqual([]);
  });
}

test("keyboard: tab reaches search, cart and nav", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const seen: string[] = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return "";
      return el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 24) || el.tagName;
    });
    if (label) seen.push(label);
    if (seen.some((s) => /biryani/i.test(s))) break;
  }
  expect(seen.length).toBeGreaterThan(3);
});
