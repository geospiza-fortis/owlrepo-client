import { test, expect } from "@playwright/test";

test.describe("Upload page", () => {
  test("renders heading", async ({ page }) => {
    await page.goto("/upload");
    await expect(page).toHaveTitle("OwlRepo | Upload");
    await expect(page.locator("h1")).toHaveText("Upload Owls");
  });

  test("shows top uploaders section", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: "Top Uploaders" })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("shows recent uploads section", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("heading", { name: "Recent Uploads" })).toBeVisible({
      timeout: 30_000,
    });
  });
});
