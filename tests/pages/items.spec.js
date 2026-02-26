import { test, expect } from "@playwright/test";

test.describe("Items browse page", () => {
  test("renders heading and title", async ({ page }) => {
    await page.goto("/items");
    await expect(page).toHaveTitle("OwlRepo | Items");
    await expect(page.locator("h1")).toHaveText("Items");
  });

  test("renders 20 table rows (one page)", async ({ page }) => {
    await page.goto("/items");
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBe(20);
  });

  test("search filters results via ?q=", async ({ page }) => {
    await page.goto("/items?q=ilbi");
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(20);
  });

  test("?keyword= works as search alias", async ({ page }) => {
    await page.goto("/items?keyword=ilbi");
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("pagination works with ?page=2", async ({ page }) => {
    await page.goto("/items?page=2");
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBe(20);
    // page 2 should have active class on "2"
    await expect(page.locator(".pagination .active")).toContainText("2");
  });

  test("item links match /items/[slug] pattern", async ({ page }) => {
    await page.goto("/items");
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const firstLink = rows.first().locator("a").first();
    const href = await firstLink.getAttribute("href");
    expect(href).toMatch(/^\/items\/[a-z0-9_]+$/);
  });

  test("shows last modified text", async ({ page }) => {
    await page.goto("/items");
    await expect(page.getByText(/last modified/i)).toBeVisible({
      timeout: 30_000,
    });
  });
});
