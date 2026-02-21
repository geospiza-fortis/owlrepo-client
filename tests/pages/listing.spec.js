import { test, expect } from "@playwright/test";

let taskId;

test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get("/api/v2/query/search_item_index");
    if (res.ok()) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        taskId = data[0].task_id;
      }
    }
  } catch {
    // will skip tests if no taskId
  }
});

test.describe("Listing page", () => {
  test("renders listing with valid task_id", async ({ page, request }) => {
    test.skip(!taskId, "No task_id available from staging API");

    // verify the data file actually exists before navigating
    const dataRes = await request.get(`/api/v2/data/${taskId}/slim.json`);
    test.skip(!dataRes.ok(), `slim.json not available for task_id ${taskId}`);

    await page.goto(`/listing/${taskId}`);
    await expect(page).toHaveTitle("OwlRepo | Listing");
    await expect(page.locator("h2").filter({ hasText: "Summary" })).toBeVisible({
      timeout: 30_000,
    });
    const rows = page.locator(".tabulator-row");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows fallback for invalid task_id", async ({ page }) => {
    await page.goto("/listing/invalid-task-id-12345");
    await expect(page).toHaveTitle("OwlRepo | Listing");
    // The Summary heading is always rendered regardless of data state
    await expect(page.locator("h2").filter({ hasText: "Summary" })).toBeVisible();
    // With an invalid task_id, no tabulator rows should appear
    const rows = page.locator(".tabulator-row");
    await expect(rows).toHaveCount(0, { timeout: 10_000 });
  });
});
