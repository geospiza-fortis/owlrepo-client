import { test, expect } from "@playwright/test";

test.describe("Item detail page", () => {
  test("renders known item with heading and table", async ({ page }) => {
    // First get a valid slug from the browse page
    await page.goto("/items");
    const firstLink = page.locator("table tbody tr a").first();
    await expect(firstLink).toBeVisible({ timeout: 30_000 });
    const href = await firstLink.getAttribute("href");
    const itemName = await firstLink.textContent();

    await page.goto(href);
    await expect(page.locator("h1")).toHaveText(itemName);
    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("has back link to /items", async ({ page }) => {
    await page.goto("/items");
    const firstLink = page.locator("table tbody tr a").first();
    await expect(firstLink).toBeVisible({ timeout: 30_000 });
    const href = await firstLink.getAttribute("href");

    await page.goto(href);
    const backLink = page.getByRole("link", { name: "Back to Items" });
    await expect(backLink).toBeVisible();
  });

  test("unknown slug returns 404", async ({ page }) => {
    const resp = await page.goto("/items/zzz_nonexistent_item_12345");
    expect(resp.status()).toBe(404);
  });

  test("has chart container", async ({ page }) => {
    await page.goto("/items");
    const firstLink = page.locator("table tbody tr a").first();
    await expect(firstLink).toBeVisible({ timeout: 30_000 });
    const href = await firstLink.getAttribute("href");

    await page.goto(href);
    // PriceQuantityCharts renders a plotly chart
    await expect(page.locator(".js-plotly-plot")).toBeVisible({
      timeout: 30_000,
    });
  });
});
