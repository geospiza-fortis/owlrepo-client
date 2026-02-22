import { test, expect } from "@playwright/test";

test.describe("Personal page", () => {
  test("renders heading and description", async ({ page }) => {
    await page.goto("/personal");
    await expect(page).toHaveTitle("OwlRepo | Personal");
    await expect(page.locator("h1")).toHaveText("Personal Statistics");
    await expect(page.getByText("personal history with OwlRepo")).toBeVisible();
  });

  test("shows upload history section", async ({ page }) => {
    await page.goto("/personal");
    await expect(page.getByText("Upload History")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("shows curation contributions section", async ({ page }) => {
    await page.goto("/personal");
    await expect(page.getByText("Curation contributions")).toBeVisible({
      timeout: 30_000,
    });
  });
});
