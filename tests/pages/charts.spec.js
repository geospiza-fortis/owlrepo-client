import { test, expect } from "@playwright/test";

test.describe("Charts page", () => {
  test("renders heading and core scrolls section", async ({ page }) => {
    await page.goto("/charts");
    await expect(page).toHaveTitle("OwlRepo | Charts");
    await expect(page.locator("h1")).toHaveText("Charts");
    await expect(page.getByText("Core scrolls")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("renders tabulator rows in search section", async ({ page }) => {
    await page.goto("/charts");
    const rows = page.locator(".tabulator-row");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("has range slider for months", async ({ page }) => {
    await page.goto("/charts");
    const slider = page.locator("input[type='range']");
    await expect(slider.first()).toBeVisible({ timeout: 30_000 });
  });

  test("renders plotly line charts", async ({ page }) => {
    await page.goto("/charts");
    const plots = page.locator(".js-plotly-plot");
    await expect(plots.first()).toBeVisible({ timeout: 30_000 });
    const count = await plots.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
