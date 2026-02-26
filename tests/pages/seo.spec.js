import { test, expect } from "@playwright/test";

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
