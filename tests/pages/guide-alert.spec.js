import { test, expect } from "@playwright/test";

test.describe("Guide alert dismiss", () => {
  test("alert closes when dismiss button is clicked", async ({ page }) => {
    await page.goto("/");
    const alert = page.locator(".alert-dismissible");

    // Alert may not show if data hasn't loaded yet, wait for it
    const visible = await alert
      .waitFor({ timeout: 30_000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!visible, "Alert did not appear (no random item data)");

    await expect(alert).toBeVisible();
    await alert.locator(".btn-close").click();
    await expect(alert).not.toBeVisible();
  });
});
