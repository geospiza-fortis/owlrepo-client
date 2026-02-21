import { test, expect } from "@playwright/test";

test.describe("Items page", () => {
  test("renders heading", async ({ page }) => {
    await page.goto("/items");
    await expect(page).toHaveTitle("OwlRepo | Items");
    await expect(page.locator("h1")).toHaveText("Items");
  });

  test("renders 20 tabulator rows (one page)", async ({ page }) => {
    await page.goto("/items");
    const rows = page.locator(".tabulator-row");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBe(20);
  });

  test("shows last updated text", async ({ page }) => {
    await page.goto("/items");
    await expect(page.getByText(/last (updated|modified)/i)).toBeVisible({
      timeout: 30_000,
    });
  });
});
