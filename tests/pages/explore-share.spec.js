import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

const schema = JSON.parse(
  readFileSync(
    resolve("src/lib/components/explore/share.schema.json"),
    "utf-8",
  ),
);

test.describe("Explore share format", () => {
  // Run encode/decode in the browser since they use btoa/atob
  function evalInPage(page, fn) {
    return page.evaluate(fn);
  }

  test("v1 round-trip preserves sql and chart", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { encode, decode } = await import("/src/lib/components/explore/share.js");
      const state = {
        sql: "SELECT * FROM items",
        chart: { type: "bar", x: "search_item", y: "mean", color: null },
      };
      const encoded = encode(state);
      const decoded = decode(`#q=${encoded}`);
      return { encoded, decoded };
    });

    expect(result.decoded.sql).toBe("SELECT * FROM items");
    expect(result.decoded.chart).toEqual({
      type: "bar",
      x: "search_item",
      y: "mean",
      color: null,
    });
    // Verify version field is in the payload
    const raw = JSON.parse(atob(result.encoded));
    expect(raw.v).toBe(1);
  });

  test("v1 encode without chart omits chart field", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { encode, decode } = await import("/src/lib/components/explore/share.js");
      const state = { sql: "SELECT 1" };
      const encoded = encode(state);
      const decoded = decode(`#q=${encoded}`);
      return { encoded, decoded };
    });

    expect(result.decoded.sql).toBe("SELECT 1");
    expect(result.decoded.chart).toBeNull();
    const raw = JSON.parse(atob(result.encoded));
    expect(raw.chart).toBeUndefined();
  });

  test("rejects payload with missing version", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      const noVersion = btoa(
        JSON.stringify({
          sql: "SELECT * FROM listing LIMIT 5",
          chart: { type: "scatter", x: "mean", y: "p50", color: "search_item" },
        }),
      );
      return decode(`#q=${noVersion}`);
    });

    expect(result).toBeNull();
  });

  test("decodes future version with best-effort", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      // Simulate a v99 payload with extra fields
      const future = btoa(
        JSON.stringify({
          v: 99,
          sql: "SELECT 1",
          chart: { type: "line", x: "a", y: "b", color: null },
          newField: "unknown",
        }),
      );
      return decode(`#q=${future}`);
    });

    expect(result.sql).toBe("SELECT 1");
    expect(result.chart.type).toBe("line");
  });

  test("rejects invalid payloads gracefully", async ({ page }) => {
    await page.goto("/explore");
    const results = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      return {
        empty: decode(""),
        noPrefix: decode("#notq=abc"),
        badBase64: decode("#q=!!!invalid!!!"),
        noSql: decode(`#q=${btoa(JSON.stringify({ chart: {} }))}`),
        emptySql: decode(`#q=${btoa(JSON.stringify({ sql: "  " }))}`),
      };
    });

    expect(results.empty).toBeNull();
    expect(results.noPrefix).toBeNull();
    expect(results.badBase64).toBeNull();
    expect(results.noSql).toBeNull();
    expect(results.emptySql).toBeNull();
  });

  test("validates chart type enum", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      const bad = btoa(
        JSON.stringify({
          v: 1,
          sql: "SELECT 1",
          chart: { type: "pie", x: "a", y: "b", color: null },
        }),
      );
      return decode(`#q=${bad}`);
    });

    expect(result.sql).toBe("SELECT 1");
    expect(result.chart).toBeNull(); // pie is not a valid type
  });

  test("schema: has required root fields", () => {
    expect(schema.required).toContain("v");
    expect(schema.required).toContain("sql");
    expect(schema.properties.v).toBeDefined();
    expect(schema.properties.sql).toBeDefined();
    expect(schema.properties.chart).toBeDefined();
  });

  test("schema: chart type enum matches runtime", async ({ page }) => {
    await page.goto("/explore");
    const runtimeTypes = await evalInPage(page, async () => {
      // encode each type and see which ones produce a chart in the payload
      const { encode } = await import("/src/lib/components/explore/share.js");
      const types = ["scatter", "line", "bar", "box", "whisker", "pie", "histogram"];
      const results = {};
      for (const t of types) {
        const encoded = encode({
          sql: "SELECT 1",
          chart: { type: t, x: "a", y: "b", color: null },
        });
        const raw = JSON.parse(atob(encoded));
        results[t] = !!raw.chart;
      }
      return results;
    });

    const schemaEnum = schema.$defs.ChartConfig.properties.type.enum;

    // Every schema enum value must be accepted at runtime
    for (const t of schemaEnum) {
      expect(runtimeTypes[t]).toBe(true);
    }

    // Runtime must reject types not in the schema enum
    expect(runtimeTypes["pie"]).toBe(false);
    expect(runtimeTypes["histogram"]).toBe(false);
  });

  test("schema: allows additionalProperties for forward compat", () => {
    expect(schema.additionalProperties).toBe(true);
    expect(schema.$defs.ChartConfig.additionalProperties).toBe(true);
  });

  test("schema: version is pinned to current", () => {
    expect(schema.properties.v.const).toBe(1);
  });

  test("encoded payload validates against schema structure", async ({
    page,
  }) => {
    await page.goto("/explore");
    const raw = await evalInPage(page, async () => {
      const { encode } = await import("/src/lib/components/explore/share.js");
      const encoded = encode({
        sql: "SELECT * FROM items",
        chart: { type: "scatter", x: "a", y: "b", color: "c" },
      });
      return JSON.parse(atob(encoded));
    });

    // Validate against schema constraints manually
    expect(raw.v).toBe(schema.properties.v.const);
    expect(typeof raw.sql).toBe("string");
    expect(raw.sql.length).toBeGreaterThanOrEqual(1);
    expect(
      schema.$defs.ChartConfig.properties.type.enum,
    ).toContain(raw.chart.type);
    expect(typeof raw.chart.x).toBe("string");
    expect(typeof raw.chart.y).toBe("string");
  });

  test("rejects chart with empty x or y", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      const emptyX = btoa(
        JSON.stringify({ v: 1, sql: "SELECT 1", chart: { type: "bar", x: "", y: "b", color: null } }),
      );
      const emptyY = btoa(
        JSON.stringify({ v: 1, sql: "SELECT 1", chart: { type: "bar", x: "a", y: "", color: null } }),
      );
      return {
        emptyX: decode(`#q=${emptyX}`),
        emptyY: decode(`#q=${emptyY}`),
      };
    });
    // SQL decodes fine but chart is rejected
    expect(result.emptyX.sql).toBe("SELECT 1");
    expect(result.emptyX.chart).toBeNull();
    expect(result.emptyY.chart).toBeNull();
  });

  test("rejects chart with missing x or y", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      const noY = btoa(
        JSON.stringify({ v: 1, sql: "SELECT 1", chart: { type: "bar", x: "a" } }),
      );
      return decode(`#q=${noY}`);
    });
    expect(result.sql).toBe("SELECT 1");
    expect(result.chart).toBeNull();
  });

  test("preserves unknown chart properties for forward compat", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { encode, decode } = await import("/src/lib/components/explore/share.js");
      const state = {
        sql: "SELECT 1",
        chart: { type: "bar", x: "a", y: "b", color: null, aggregation: "sum", bins: 20 },
      };
      const encoded = encode(state);
      const decoded = decode(`#q=${encoded}`);
      return decoded;
    });
    expect(result.chart.type).toBe("bar");
    expect(result.chart.aggregation).toBe("sum");
    expect(result.chart.bins).toBe(20);
  });

  test("preserves unknown root properties for forward compat", async ({ page }) => {
    await page.goto("/explore");
    const result = await evalInPage(page, async () => {
      const { decode } = await import("/src/lib/components/explore/share.js");
      const future = btoa(
        JSON.stringify({ v: 2, sql: "SELECT 1", layout: { title: "My Chart" } }),
      );
      return decode(`#q=${future}`);
    });
    expect(result.sql).toBe("SELECT 1");
    expect(result.layout).toEqual({ title: "My Chart" });
  });

  test("encode throws on missing or empty sql", async ({ page }) => {
    await page.goto("/explore");
    const results = await evalInPage(page, async () => {
      const { encode } = await import("/src/lib/components/explore/share.js");
      const errors = {};
      try { encode({}); } catch (e) { errors.noSql = e.message; }
      try { encode({ sql: "" }); } catch (e) { errors.empty = e.message; }
      try { encode({ sql: "  " }); } catch (e) { errors.whitespace = e.message; }
      try { encode({ sql: 123 }); } catch (e) { errors.number = e.message; }
      return errors;
    });
    expect(results.noSql).toContain("sql is required");
    expect(results.empty).toContain("sql is required");
    expect(results.whitespace).toContain("sql is required");
    expect(results.number).toContain("sql is required");
  });

  test("buildShareUrl produces valid URL", async ({ page }) => {
    await page.goto("/explore");
    const url = await evalInPage(page, async () => {
      const { buildShareUrl } = await import("/src/lib/components/explore/share.js");
      return buildShareUrl("https://owlrepo.com", "/explore", {
        sql: "SELECT 1",
        chart: { type: "bar", x: "a", y: "b", color: null },
      });
    });
    expect(url).toMatch(/^https:\/\/owlrepo\.com\/explore#q=.+/);
  });
});
