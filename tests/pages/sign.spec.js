import { test, expect } from "@playwright/test";

test.describe("Sign and Verify page", () => {
  test("renders heading and sections", async ({ page }) => {
    await page.goto("/sign");
    await expect(page).toHaveTitle("OwlRepo | Sign and Verify");
    await expect(page.locator("h1")).toHaveText("Sign and Verify");
    await expect(page.getByText("Sign messages using your private key")).toBeVisible();
    await expect(page.getByText("Verify and display the contents")).toBeVisible();
  });

  test("sign form structure exists", async ({ page }) => {
    await page.goto("/sign");
    const messageInput = page.locator("#message").first();
    await expect(messageInput).toBeVisible();
  });

  test("can sign a message", async ({ page }) => {
    await page.goto("/sign");
    const messageInput = page.locator("#message").first();
    await messageInput.fill("test message for signing");
    await messageInput.press("Enter");
    // Wait for the signed output to appear
    const signedOutput = page.locator("#signed-message");
    await expect(signedOutput).toBeVisible({ timeout: 15_000 });
    const signedText = await signedOutput.inputValue();
    expect(signedText.length).toBeGreaterThan(0);
  });
});
