import { test, expect } from "@playwright/test";

test.describe("meta tags", () => {
  test("item detail page has OG and Twitter tags", async ({ page }) => {
    await page.goto("/items");
    const firstLink = page.locator("table tbody tr a").first();
    await firstLink.waitFor({ timeout: 30_000 });
    const href = await firstLink.getAttribute("href");
    await page.goto(href);

    // Core meta tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Price history for .+ on MapleLegends/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https:\/\/owlrepo\.com\/items\//,
    );

    // Open Graph tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /^OwlRepo \|/,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", /Price history for/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /favicon\.png$/,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      /^https:\/\/owlrepo\.com\/items\//,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(
      page.locator('meta[property="og:site_name"]'),
    ).toHaveAttribute("content", "OwlRepo");

    // Twitter Card tags
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary",
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      /^OwlRepo \|/,
    );
    await expect(
      page.locator('meta[name="twitter:description"]'),
    ).toHaveAttribute("content", /Price history for/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      /favicon\.png$/,
    );
  });

  test("no duplicate title or description tags", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("title").count()).toBe(1);
    expect(await page.locator('meta[name="description"]').count()).toBe(1);
  });

  test("items page canonical strips query params", async ({ page }) => {
    await page.goto("/items?q=scroll&page=2");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://owlrepo.com/items",
    );
  });

  test("private page has noindex and no OG tags", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(0);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(0);
  });

  test("all private pages have noindex", async ({ page }) => {
    for (const path of ["/personal", "/sign"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex",
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(0);
    }
  });

  test("error page has noindex", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(0);
  });

  test("home page has description and OG tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Browse Owl of Minerva/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "OwlRepo | MapleLegends Price Guide",
    );
  });

  test("about page has description and OG tags", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle("OwlRepo | About");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Learn about OwlRepo/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "OwlRepo | About",
    );
  });
});

test.describe("robots.txt", () => {
  test("returns valid robots directives", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Disallow: /upload");
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Sitemap: https://owlrepo.com/sitemap.xml");
  });
});

test.describe("sitemap.xml", () => {
  test("returns valid XML with correct content type", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/xml");

    const xml = await res.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
  });

  test("includes static routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    const xml = await res.text();
    for (const path of [
      "/",
      "/summary",
      "/items",
      "/charts",
      "/recommendation",
      "/about",
    ]) {
      expect(xml).toContain(`<loc>https://owlrepo.com${path}</loc>`);
    }
  });

  test("includes dynamic item URLs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    const xml = await res.text();
    // Should have item entries from the metadata endpoint
    expect(xml).toContain("https://owlrepo.com/items/");
    // Count <url> entries: 6 static + many items
    const urlCount = (xml.match(/<url>/g) || []).length;
    expect(urlCount).toBeGreaterThan(6);
  });

  test("item URLs have lastmod dates", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    const xml = await res.text();
    // At least some items should have lastmod
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });
});
