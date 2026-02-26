import { test, expect } from "@playwright/test";

// Helper: wait for DuckDB to finish loading
async function waitForReady(page) {
  await expect(page.getByRole("button", { name: /Run/ })).toBeVisible({
    timeout: 90_000,
  });
}

test.describe("Explore page", () => {
  test("renders heading and initializes DuckDB", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.locator("h1")).toHaveText("SQL Explorer");
    await waitForReady(page);
  });

  test("runs default query and shows results", async ({ page }) => {
    await page.goto("/explore");
    await waitForReady(page);
    await page.getByRole("button", { name: /Run/ }).click();
    await expect(page.locator("table.table tbody tr").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("shows error for invalid SQL", async ({ page }) => {
    await page.goto("/explore");
    await waitForReady(page);
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("SELECT * FROM nonexistent_table");
    await page.getByRole("button", { name: /Run/ }).click();
    await expect(page.locator(".alert-danger")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("schema panel toggles", async ({ page }) => {
    await page.goto("/explore");
    await waitForReady(page);
    await page.getByRole("button", { name: /Show Schema/ }).click();
    await expect(page.locator(".schema-panel")).toBeVisible();
    await page.getByRole("button", { name: /Hide Schema/ }).click();
    await expect(page.locator(".schema-panel")).not.toBeVisible();
  });

  const templateNames = [
    "Current Prices",
    "Price History",
    "Most Expensive Items",
    "Volatile Items (High Price Spread)",
    "Most Frequent Uploaders",
    "Uploads Over Time",
    "Price Distribution (IQR)",
    "Stale Items (Oldest Updates)",
  ];

  for (const name of templateNames) {
    test(`template: ${name}`, async ({ page }) => {
      await page.goto("/explore");
      await waitForReady(page);
      // Open templates dropdown and select
      await page.getByRole("button", { name: "Templates" }).click();
      await page.getByRole("button", { name }).click();
      // Run the query
      await page.getByRole("button", { name: /Run/ }).click();
      // Should show results table with rows
      await expect(page.locator("table.table tbody tr").first()).toBeVisible({
        timeout: 30_000,
      });
    });
  }
});
