import { test, expect } from "@playwright/test";

test.describe("Summary page", () => {
  test("renders heading and intro text", async ({ page }) => {
    await page.goto("/summary");
    await expect(page).toHaveTitle("OwlRepo | Summary");
    await expect(page.locator("h1")).toHaveText("Summary");
    await expect(page.getByText("most recent upload")).toBeVisible();
  });

  test("renders tabulator rows with data", async ({ page }) => {
    await page.goto("/summary");
    const rows = page.locator(".tabulator-row");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows last updated text", async ({ page }) => {
    await page.goto("/summary");
    await expect(page.getByText(/last (updated|modified)/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("renders upload activity section with heatmap", async ({ page }) => {
    await page.goto("/summary");
    await expect(page.getByText("Upload Activity")).toBeVisible({
      timeout: 30_000,
    });
  });
});
