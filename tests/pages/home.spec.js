import { test, expect } from "@playwright/test";

test.describe("Home / Guide page", () => {
  test("renders page title and heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("OwlRepo | Guide");
    await expect(page.locator("h1")).toHaveText("OwlRepo");
  });

  test("renders card columns with price data", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator(".guide .card");
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("navbar contains expected links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    for (const text of ["Summary", "Items", "Upload", "Charts", "About"]) {
      await expect(nav.getByText(text, { exact: false })).toBeVisible();
    }
  });

  test("/guide redirects to /", async ({ page }) => {
    await page.goto("/guide");
    await expect(page).toHaveURL("/");
  });
});
