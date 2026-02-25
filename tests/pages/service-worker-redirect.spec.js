import { test, expect } from "@playwright/test";

// Tests the full service worker caching flow with 302 redirects to GCS.
// Requires --disable-web-security to bypass CORS from localhost.
// Run with: npx playwright test --config playwright.sw-redirect.config.js
//
// Flow tested:
//   1. Browser fetches /api/v2/query/items
//   2. SvelteKit returns 302 redirect to storage.googleapis.com
//   3. Service worker intercepts, follows redirect, caches GCS response
//   4. Second navigation serves from SW cache

test.describe("Service worker 302 redirect caching", () => {
  test("loads data via SW-intercepted 302 redirects to GCS", async ({
    page,
  }) => {
    // First load — triggers SW registration
    await page.goto("/");

    // Wait for SW to activate and claim this page
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", resolve);
        });
      }
    });

    // Reload so SW intercepts the 302 → GCS requests
    await page.reload();

    // Guide cards load via /api/v2/query/ → 302 → GCS
    const cards = page.locator(".guide .card");
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Verify responses were cached by the SW
    const sessionCacheCount = await page.evaluate(async () => {
      const names = await caches.keys();
      const sessionCache = names.find((n) => n.startsWith("session"));
      if (!sessionCache) return 0;
      const cache = await caches.open(sessionCache);
      const keys = await cache.keys();
      return keys.length;
    });
    expect(sessionCacheCount).toBeGreaterThan(0);

    // Navigate away and back — should serve from cache
    await page.goto("/about");
    await expect(page.locator("h1")).toHaveText("About");
    await page.goto("/");
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });
});
