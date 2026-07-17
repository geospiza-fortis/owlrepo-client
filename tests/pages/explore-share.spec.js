import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  encode,
  decode,
  buildShareUrl,
} from "../../src/lib/components/explore/share.js";

// share.js is pure logic (btoa/atob, both Node globals), so these run
// directly in the test's Node context — no dev server or browser needed.

const schema = JSON.parse(
  readFileSync(resolve("src/lib/components/explore/share.schema.json"), "utf-8"),
);

test.describe("Explore share format", () => {
  test("v1 round-trip preserves sql and chart", () => {
    const state = {
      sql: "SELECT * FROM items",
      chart: { type: "bar", x: "search_item", y: "mean", color: null },
    };
    const encoded = encode(state);
    const decoded = decode(`#q=${encoded}`);

    expect(decoded.sql).toBe("SELECT * FROM items");
    expect(decoded.chart).toEqual({
      type: "bar",
      x: "search_item",
      y: "mean",
      color: null,
    });
    // Verify version field is in the payload
    const raw = JSON.parse(atob(encoded));
    expect(raw.v).toBe(1);
  });

  test("v1 encode without chart omits chart field", () => {
    const encoded = encode({ sql: "SELECT 1" });
    const decoded = decode(`#q=${encoded}`);

    expect(decoded.sql).toBe("SELECT 1");
    expect(decoded.chart).toBeNull();
    const raw = JSON.parse(atob(encoded));
    expect(raw.chart).toBeUndefined();
  });

  test("rejects payload with missing version", () => {
    const noVersion = btoa(
      JSON.stringify({
        sql: "SELECT * FROM listing LIMIT 5",
        chart: { type: "scatter", x: "mean", y: "p50", color: "search_item" },
      }),
    );
    expect(decode(`#q=${noVersion}`)).toBeNull();
  });

  test("decodes future version with best-effort", () => {
    // Simulate a v99 payload with extra fields
    const future = btoa(
      JSON.stringify({
        v: 99,
        sql: "SELECT 1",
        chart: { type: "line", x: "a", y: "b", color: null },
        newField: "unknown",
      }),
    );
    const result = decode(`#q=${future}`);

    expect(result.sql).toBe("SELECT 1");
    expect(result.chart.type).toBe("line");
  });

  test("rejects invalid payloads gracefully", () => {
    expect(decode("")).toBeNull();
    expect(decode("#notq=abc")).toBeNull();
    expect(decode("#q=!!!invalid!!!")).toBeNull();
    expect(decode(`#q=${btoa(JSON.stringify({ chart: {} }))}`)).toBeNull();
    expect(decode(`#q=${btoa(JSON.stringify({ sql: "  " }))}`)).toBeNull();
  });

  test("validates chart type enum", () => {
    const bad = btoa(
      JSON.stringify({
        v: 1,
        sql: "SELECT 1",
        chart: { type: "pie", x: "a", y: "b", color: null },
      }),
    );
    const result = decode(`#q=${bad}`);

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

  test("schema: chart type enum matches runtime", () => {
    // encode each type and see which ones produce a chart in the payload
    const types = ["scatter", "line", "bar", "box", "whisker", "pie", "histogram"];
    const runtimeTypes = {};
    for (const t of types) {
      const encoded = encode({
        sql: "SELECT 1",
        chart: { type: t, x: "a", y: "b", color: null },
      });
      const raw = JSON.parse(atob(encoded));
      runtimeTypes[t] = !!raw.chart;
    }

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

  test("encoded payload validates against schema structure", () => {
    const encoded = encode({
      sql: "SELECT * FROM items",
      chart: { type: "scatter", x: "a", y: "b", color: "c" },
    });
    const raw = JSON.parse(atob(encoded));

    // Validate against schema constraints manually
    expect(raw.v).toBe(schema.properties.v.const);
    expect(typeof raw.sql).toBe("string");
    expect(raw.sql.length).toBeGreaterThanOrEqual(1);
    expect(schema.$defs.ChartConfig.properties.type.enum).toContain(
      raw.chart.type,
    );
    expect(typeof raw.chart.x).toBe("string");
    expect(typeof raw.chart.y).toBe("string");
  });

  test("rejects chart with empty x or y", () => {
    const emptyX = btoa(
      JSON.stringify({
        v: 1,
        sql: "SELECT 1",
        chart: { type: "bar", x: "", y: "b", color: null },
      }),
    );
    const emptyY = btoa(
      JSON.stringify({
        v: 1,
        sql: "SELECT 1",
        chart: { type: "bar", x: "a", y: "", color: null },
      }),
    );
    // SQL decodes fine but chart is rejected
    expect(decode(`#q=${emptyX}`).sql).toBe("SELECT 1");
    expect(decode(`#q=${emptyX}`).chart).toBeNull();
    expect(decode(`#q=${emptyY}`).chart).toBeNull();
  });

  test("rejects chart with missing x or y", () => {
    const noY = btoa(
      JSON.stringify({ v: 1, sql: "SELECT 1", chart: { type: "bar", x: "a" } }),
    );
    const result = decode(`#q=${noY}`);
    expect(result.sql).toBe("SELECT 1");
    expect(result.chart).toBeNull();
  });

  test("preserves unknown chart properties for forward compat", () => {
    const state = {
      sql: "SELECT 1",
      chart: {
        type: "bar",
        x: "a",
        y: "b",
        color: null,
        aggregation: "sum",
        bins: 20,
      },
    };
    const decoded = decode(`#q=${encode(state)}`);
    expect(decoded.chart.type).toBe("bar");
    expect(decoded.chart.aggregation).toBe("sum");
    expect(decoded.chart.bins).toBe(20);
  });

  test("preserves unknown root properties for forward compat", () => {
    const future = btoa(
      JSON.stringify({ v: 2, sql: "SELECT 1", layout: { title: "My Chart" } }),
    );
    const result = decode(`#q=${future}`);
    expect(result.sql).toBe("SELECT 1");
    expect(result.layout).toEqual({ title: "My Chart" });
  });

  test("encode throws on missing or empty sql", () => {
    const errors = {};
    try {
      encode({});
    } catch (e) {
      errors.noSql = e.message;
    }
    try {
      encode({ sql: "" });
    } catch (e) {
      errors.empty = e.message;
    }
    try {
      encode({ sql: "  " });
    } catch (e) {
      errors.whitespace = e.message;
    }
    try {
      encode({ sql: 123 });
    } catch (e) {
      errors.number = e.message;
    }
    expect(errors.noSql).toContain("sql is required");
    expect(errors.empty).toContain("sql is required");
    expect(errors.whitespace).toContain("sql is required");
    expect(errors.number).toContain("sql is required");
  });

  test("buildShareUrl produces valid URL", () => {
    const url = buildShareUrl("https://owlrepo.com", "/explore", {
      sql: "SELECT 1",
      chart: { type: "bar", x: "a", y: "b", color: null },
    });
    expect(url).toMatch(/^https:\/\/owlrepo\.com\/explore#q=.+/);
  });
});
