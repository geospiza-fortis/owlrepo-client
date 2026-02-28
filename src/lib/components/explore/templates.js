export const templates = [
  {
    name: "Current Scroll Prices",
    sql: `-- Current Scroll Prices
-- Latest prices for all scrolls
SELECT search_item, mean,
  p50 AS median, search_results,
  search_item_timestamp
FROM items
WHERE search_item LIKE '%Scroll%'
ORDER BY search_item_timestamp DESC
LIMIT 50`,
    chart: { type: "bar", x: "search_item", y: "mean", color: null },
  },
  {
    name: "INT Overall 60% Price History",
    sql: `-- INT Overall 60% Price History
-- All uploaded observations over time
-- listing = per-upload rows
-- items = latest snapshot only
SELECT mean, search_results,
  search_item_timestamp
FROM listing
WHERE search_item
  = 'Scroll for Overall Armor for INT 60%'
ORDER BY search_item_timestamp DESC`,
    chart: {
      type: "scatter",
      x: "search_item_timestamp",
      y: "mean",
      color: null,
    },
  },
  {
    name: "Volatile Items (High Price Spread)",
    sql: `-- Volatile Items (High Price Spread)
-- Widest gap between min and max price
-- High spread = price uncertainty
SELECT search_item, mean,
  p0 AS min_price,
  p100 AS max_price,
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
    sql: `-- Most Frequent Uploaders
-- Rank by total uploads per thumbprint
-- (thumbprint = public key hash)
SELECT client_thumbprint,
  COUNT(*) AS uploads,
  MIN(search_item_timestamp)
    AS first_upload,
  MAX(search_item_timestamp)
    AS last_upload
FROM listing
WHERE client_thumbprint IS NOT NULL
GROUP BY client_thumbprint
ORDER BY uploads DESC
LIMIT 25`,
    chart: { type: "bar", x: "client_thumbprint", y: "uploads", color: null },
  },
  {
    name: "Uploads Over Time",
    sql: `-- Uploads Over Time
-- Monthly upload volume and coverage
-- ::TIMESTAMP cast needed (stored as
-- VARCHAR), ::VARCHAR for Plotly dates
SELECT DATE_TRUNC('month',
  search_item_timestamp::TIMESTAMP
)::VARCHAR AS month,
  COUNT(*) AS uploads,
  COUNT(DISTINCT search_item)
    AS unique_items
FROM listing
WHERE search_item_timestamp IS NOT NULL
GROUP BY month
ORDER BY month`,
    chart: { type: "line", x: "month", y: "uploads", color: null },
  },
  {
    name: "Price vs Volume (CTE)",
    sql: `-- Price vs Volume (CTE)
-- Price vs search result count
-- CTE filters to items with >= 5 results
WITH recent AS (
  SELECT search_item, mean,
    search_results
  FROM items
  WHERE mean IS NOT NULL
    AND search_results >= 5
)
SELECT search_item, mean,
  search_results
FROM recent
ORDER BY search_results DESC
LIMIT 25`,
    chart: { type: "scatter", x: "search_results", y: "mean", color: null },
  },
  {
    name: "Latest Upload per Item (Window)",
    sql: `-- Latest Upload per Item (Window)
-- Most recent upload per item via
-- ROW_NUMBER window function
SELECT search_item, mean,
  search_item_timestamp,
  client_thumbprint
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY search_item
      ORDER BY
        search_item_timestamp DESC
    ) AS rn
  FROM listing
  WHERE mean IS NOT NULL
)
WHERE rn = 1
ORDER BY search_item_timestamp DESC
LIMIT 25`,
    chart: {
      type: "scatter",
      x: "search_item_timestamp",
      y: "mean",
      color: null,
    },
  },
  {
    name: "INT Overall 60% ECDF Mixture (Whisker)",
    sql: `-- INT Overall 60% ECDF Mixture
-- Mixture ECDF -> whisker by quarter
--
-- Each upload has a five-number summary.
-- We interpolate a piecewise-linear CDF,
-- weight-average by search_results, then
-- invert to get mixture percentiles.

-- 1: Qualifying uploads
WITH uploads AS (
  SELECT
    search_item_timestamp::TIMESTAMP
      AS ts,
    DATE_TRUNC('quarter',
      search_item_timestamp::TIMESTAMP
    ) AS quarter,
    search_results AS n,
    p0::DOUBLE AS p0,
    p25::DOUBLE AS p25,
    p50::DOUBLE AS p50,
    p75::DOUBLE AS p75,
    p100::DOUBLE AS p100
  FROM listing
  WHERE search_item
    = 'Scroll for Overall Armor for INT 60%'
    AND percent_complete >= 0.6
    AND search_results >= 1
),
-- 2: Shared price grid over full range
price_range AS (
  SELECT MIN(p0) AS lo,
    MAX(p100) AS hi
  FROM uploads
),
grid AS (
  SELECT lo + (hi - lo) * i / 200.0 AS x
  FROM price_range,
    generate_series(0, 200) AS t(i)
),
-- 3: Piecewise-linear CDF per upload
-- Interpolate between 5 quantile knots:
-- F(p0)=0, F(p25)=.25, F(p50)=.50,
-- F(p75)=.75, F(p100)=1.0
cdf_eval AS (
  SELECT u.quarter, u.n, g.x,
    CASE
      WHEN g.x <= u.p0 THEN 0.0
      WHEN g.x <= u.p25 THEN
        0.25 * (g.x - u.p0)
        / NULLIF(u.p25 - u.p0, 0)
      WHEN g.x <= u.p50 THEN
        0.25 + 0.25 * (g.x - u.p25)
        / NULLIF(u.p50 - u.p25, 0)
      WHEN g.x <= u.p75 THEN
        0.50 + 0.25 * (g.x - u.p50)
        / NULLIF(u.p75 - u.p50, 0)
      WHEN g.x <= u.p100 THEN
        0.75 + 0.25 * (g.x - u.p75)
        / NULLIF(u.p100 - u.p75, 0)
      ELSE 1.0
    END AS cdf_val
  FROM uploads u CROSS JOIN grid g
),
-- 4: Weight-average CDFs per quarter
mixture AS (
  SELECT quarter, x,
    SUM(cdf_val * n) / SUM(n)
      AS mix_cdf
  FROM cdf_eval
  GROUP BY quarter, x
),
-- 5: Invert mixture CDF for percentiles
inverted AS (
  SELECT quarter,
    MIN(CASE WHEN mix_cdf >= 0.00
      THEN x END) AS lowerfence,
    MIN(CASE WHEN mix_cdf >= 0.25
      THEN x END) AS q1,
    MIN(CASE WHEN mix_cdf >= 0.50
      THEN x END) AS median,
    MIN(CASE WHEN mix_cdf >= 0.75
      THEN x END) AS q3,
    MAX(CASE WHEN mix_cdf <= 1.00
      THEN x END) AS upperfence
  FROM mixture
  GROUP BY quarter
)
SELECT quarter::VARCHAR AS quarter,
  ROUND(lowerfence) AS lowerfence,
  ROUND(q1) AS q1,
  ROUND(median) AS median,
  ROUND(q3) AS q3,
  ROUND(upperfence) AS upperfence
FROM inverted
ORDER BY quarter`,
    chart: {
      type: "whisker",
      x: "quarter",
      y: "median",
      lowerfence: "lowerfence",
      q1: "q1",
      median: "median",
      q3: "q3",
      upperfence: "upperfence",
      color: null,
    },
  },
];
