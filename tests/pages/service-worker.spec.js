import { test, expect } from "@playwright/test";

// This test runs in the "service-worker" project (see playwright.config.js)
// with serviceWorkers: "allow" (vs "block" in the main chromium project).
// Verifies the SW registers, activates, and caches static assets under
// SvelteKit v2's build output.
//
// The full 302 → GCS → cache flow requires CORS from the production domain
// and is verified via staging deploy smoke test.

const isDevServer = !!process.env.PW_DEV;

test.describe("Service worker lifecycle", () => {
  test("registers, activates, and caches static assets", async ({ page }) => {
    await page.goto("/");

    const swInfo = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", resolve);
        });
      }

      const cacheNames = await caches.keys();
      const assetCache = cacheNames.find((name) => name.startsWith("cache"));
      let cachedUrls = [];
      if (assetCache) {
        const cache = await caches.open(assetCache);
        const keys = await cache.keys();
        cachedUrls = keys.map((r) => r.url);
      }

      return {
        active: !!reg.active,
        controller: !!navigator.serviceWorker.controller,
        scope: reg.scope,
        cacheNames,
        cachedAssetCount: cachedUrls.length,
        hasAppAssets: cachedUrls.some((u) => u.includes("/_app/")),
        hasStaticAssets: cachedUrls.some((u) => u.includes("/favicon.png")),
      };
    });

    expect(swInfo.active).toBe(true);
    expect(swInfo.controller).toBe(true);
    expect(swInfo.scope).toBe("http://localhost:3000/");
    expect(swInfo.cacheNames.length).toBeGreaterThan(0);
    expect(swInfo.cachedAssetCount).toBeGreaterThan(0);
    // In dev mode, $service-worker's build[] is empty so only static files
    // are cached — no /_app/ assets exist until a production build.
    if (!isDevServer) {
      expect(swInfo.hasAppAssets).toBe(true);
    }
    expect(swInfo.hasStaticAssets).toBe(true);
  });
});
