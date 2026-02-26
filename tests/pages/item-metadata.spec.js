import { test, expect } from "@playwright/test";

test.describe("Item metadata endpoint", () => {
  test("returns 200 with JSON array", async ({ request }) => {
    const res = await request.get("/api/v2/items/metadata");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test("each entry has slug, search_item, and search_item_timestamp fields", async ({
    request,
  }) => {
    const res = await request.get("/api/v2/items/metadata");
    const body = await res.json();
    for (const entry of body) {
      expect(entry).toHaveProperty("slug");
      expect(entry).toHaveProperty("search_item");
      expect(entry).toHaveProperty("search_item_timestamp");
      expect(typeof entry.slug).toBe("string");
      expect(typeof entry.search_item).toBe("string");
      expect(typeof entry.search_item_timestamp).toBe("string");
    }
  });

  test("slugs are valid URL fragments", async ({ request }) => {
    const res = await request.get("/api/v2/items/metadata");
    const body = await res.json();
    for (const entry of body) {
      expect(entry.slug).toMatch(/^[a-z0-9_]+$/);
    }
  });

  test("slugs are unique", async ({ request }) => {
    const res = await request.get("/api/v2/items/metadata");
    const body = await res.json();
    const slugs = body.map((e) => e.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });
});
