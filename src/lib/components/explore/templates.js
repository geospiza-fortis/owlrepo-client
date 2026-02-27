export const templates = [
  {
    name: "Current Prices",
    sql: `SELECT search_item, mean, p50 AS median, search_results, search_item_timestamp
FROM items
ORDER BY search_item_timestamp DESC
LIMIT 50`,
    chart: { type: "bar", x: "search_item", y: "mean", color: null },
  },
  {
    name: "Price History",
    sql: `SELECT search_item, mean, search_results, search_item_timestamp
FROM listing
ORDER BY search_item_timestamp DESC
LIMIT 200`,
    chart: {
      type: "scatter",
      x: "search_item_timestamp",
      y: "mean",
      color: "search_item",
    },
  },
  {
    name: "Most Expensive Items",
    sql: `SELECT search_item, mean, p50 AS median, search_results
FROM items
WHERE mean IS NOT NULL
ORDER BY mean DESC
LIMIT 25`,
    chart: { type: "bar", x: "search_item", y: "mean", color: null },
  },
  {
    name: "Volatile Items (High Price Spread)",
    sql: `SELECT search_item, mean, p0 AS min_price, p100 AS max_price,
  (p100 - p0) AS spread
FROM items
WHERE mean IS NOT NULL
  AND p0 IS NOT NULL
  AND p100 IS NOT NULL
ORDER BY spread DESC
LIMIT 25`,
    chart: { type: "bar", x: "search_item", y: "spread", color: null },
  },
  {
    name: "Most Frequent Uploaders",
    sql: `SELECT client_thumbprint, COUNT(*) AS uploads,
  MIN(search_item_timestamp) AS first_upload,
  MAX(search_item_timestamp) AS last_upload
FROM listing
WHERE client_thumbprint IS NOT NULL
GROUP BY client_thumbprint
ORDER BY uploads DESC
LIMIT 25`,
    chart: { type: "bar", x: "client_thumbprint", y: "uploads", color: null },
  },
  {
    name: "Uploads Over Time",
    sql: `SELECT DATE_TRUNC('month', search_item_timestamp::TIMESTAMP) AS month,
  COUNT(*) AS uploads,
  COUNT(DISTINCT search_item) AS unique_items
FROM listing
WHERE search_item_timestamp IS NOT NULL
GROUP BY month
ORDER BY month`,
    chart: { type: "line", x: "month", y: "uploads", color: null },
  },
  {
    name: "Price Distribution (IQR)",
    sql: `SELECT search_item,
  p0 AS lowerfence, p25 AS q1, p50 AS median, p75 AS q3, p100 AS upperfence
FROM items
WHERE p0 IS NOT NULL
ORDER BY p50 DESC
LIMIT 25`,
    chart: {
      type: "whisker",
      x: "search_item",
      y: "median",
      lowerfence: "lowerfence",
      q1: "q1",
      median: "median",
      q3: "q3",
      upperfence: "upperfence",
      color: null,
    },
  },
  {
    name: "Stale Items (Oldest Updates)",
    sql: `SELECT search_item, search_item_timestamp, mean, search_results
FROM items
WHERE search_item_timestamp IS NOT NULL
ORDER BY search_item_timestamp ASC
LIMIT 25`,
    chart: {
      type: "scatter",
      x: "search_item_timestamp",
      y: "mean",
      color: null,
    },
  },
];
