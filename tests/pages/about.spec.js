import { test, expect } from "@playwright/test";

test.describe("About page", () => {
  test("renders heading", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toHaveText("About");
  });

  test("renders plotly chart", async ({ page }) => {
    await page.goto("/about");
    const plot = page.locator(".js-plotly-plot");
    await expect(plot.first()).toBeVisible({ timeout: 30_000 });
  });
});
