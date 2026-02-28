/**
 * Versioned share format for SQL Explorer URLs.
 *
 * Encoded as base64 JSON in the URL fragment: #q=<base64>
 * Schema: ./share.schema.json (JSON Schema 2020-12)
 *
 * Version history:
 *   v1 (2026-02-26) — Initial format
 *     { v: 1, sql: string, chart?: ChartConfig }
 *
 * Compatibility rules:
 *   - All payloads MUST include a version field `v`.
 *   - New versions MUST keep v, sql, and chart fields with the same semantics.
 *   - New fields use additionalProperties (both root and ChartConfig allow them).
 *   - Decoders preserve unknown fields from future versions for passthrough.
 *   - ChartConfig.type enum can only be extended, never reduced.
 */

const CURRENT_VERSION = 1;

const VALID_CHART_TYPES = ["scatter", "line", "bar", "box", "whisker"];

/**
 * Validate and normalize a chart config object.
 * Preserves unknown properties for forward compatibility with future versions.
 * Returns the config if valid, null otherwise.
 */
function validateChart(chart) {
  if (!chart || typeof chart !== "object") return null;
  if (!VALID_CHART_TYPES.includes(chart.type)) return null;
  if (typeof chart.x !== "string" || !chart.x) return null;
  if (typeof chart.y !== "string" || !chart.y) return null;
  // color is optional — string or null
  const color =
    chart.color != null && typeof chart.color === "string"
      ? chart.color
      : null;
  // Spread unknown properties through for forward compat
  return { ...chart, type: chart.type, x: chart.x, y: chart.y, color };
}

/**
 * Encode explorer state into a URL fragment value (without the #q= prefix).
 * Throws if sql is missing or empty.
 *
 * @param {object} state
 * @param {string} state.sql - The SQL query text (must be non-empty)
 * @param {object} [state.chart] - Chart configuration (omit if chart hidden)
 * @returns {string} base64-encoded payload
 */
export function encode(state) {
  if (!state || typeof state.sql !== "string" || !state.sql.trim()) {
    throw new Error("encode: sql is required and must be non-empty");
  }
  const payload = { v: CURRENT_VERSION, sql: state.sql };
  if (state.chart) {
    const validated = validateChart(state.chart);
    if (validated) payload.chart = validated;
  }
  return btoa(JSON.stringify(payload));
}

/**
 * Decode a URL fragment value into explorer state.
 * Requires a version field. Attempts best-effort on future versions.
 * Preserves unknown fields from future versions for passthrough.
 *
 * @param {string} fragment - The raw hash string (e.g. "#q=eyJ...")
 * @returns {{ v: number, sql: string, chart: object|null } | null} Decoded state, or null if invalid
 */
export function decode(fragment) {
  if (!fragment || !fragment.startsWith("#q=")) return null;

  try {
    const raw = JSON.parse(atob(fragment.slice(3)));
    if (!raw || typeof raw !== "object") return null;
    if (typeof raw.v !== "number") return null;

    if (raw.v > CURRENT_VERSION) {
      // Future version — still try best-effort on known fields
    }

    if (typeof raw.sql !== "string" || !raw.sql.trim()) return null;

    // Spread unknown root fields through for forward compat
    return {
      ...raw,
      sql: raw.sql,
      chart: validateChart(raw.chart),
    };
  } catch {
    return null;
  }
}

/**
 * Build a full shareable URL from explorer state.
 *
 * @param {string} origin - window.location.origin
 * @param {string} pathname - window.location.pathname
 * @param {object} state - { sql, chart? }
 * @returns {string} Full URL with fragment
 */
export function buildShareUrl(origin, pathname, state) {
  return `${origin}${pathname}#q=${encode(state)}`;
}
