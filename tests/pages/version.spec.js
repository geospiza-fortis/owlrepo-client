import { test, expect } from "@playwright/test";

test.describe("Version page", () => {
  test("renders heading and tabulator rows", async ({ page }) => {
    await page.goto("/version");
    await expect(page.locator("h1")).toHaveText("Version");
    const rows = page.locator(".tabulator-row");
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows staging mode info", async ({ page }) => {
    await page.goto("/version");
    await expect(page.getByText("staging")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("owlrepo-nonprod")).toBeVisible();
  });

  test("raw API returns expected fields", async ({ request }) => {
    const res = await request.get("/api/v2/status");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("mode", "staging");
    expect(data).toHaveProperty("project_id", "owlrepo-nonprod");
    expect(data).toHaveProperty("version");
    expect(data).toHaveProperty("git_sha");
  });
});
