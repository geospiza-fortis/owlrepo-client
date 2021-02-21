import { shortFormatter } from "../../tabulator.js";

const columns = [
  {
    title: "Search Item",
    field: "search_item",
    formatter: "link",
    formatterParams: {
      url: (cell) => `/items?keyword=${encodeURIComponent(cell.getValue())}`,
    },
    headerTooltip:
      "The name of the item that was searched using the Owl of Minerva.",
  },
  {
    title: "Updated",
    field: "search_item_timestamp",
    formatter: "datetime",
    formatterParams: {
      outputFormat: "YYYY-MM-DD",
    },
    headerTooltip: "The date of the owl search upload (YYYY-MM-DD).",
  },
  {
    title: "Uploads",
    field: "n_owled",
    headerVertical: true,
    headerTooltip: "The number of distinct owl uploads.",
  },
  {
    title: "Listed",
    field: "search_results",
    headerVertical: true,
    headerTooltip:
      "The number of search results for the most recent owl search for this item.",
  },
  {
    title: "Bundle",
    field: "sum_bundle",
    headerVertical: true,
    headerTooltip:
      "The sum of all item bundles. This field may be unreliable due to overlapping text from the price.",
  },
  {
    title: "min",
    field: "p0",
    formatter: shortFormatter,
    align: "right",
    headerTooltip: "The minimum price in the cleaned search results.",
  },
  {
    title: "p25",
    field: "p25",
    formatter: shortFormatter,
    align: "right",
    headerTooltip:
      "The 25th percentile AKA the 1st quartile. This is the price that is greater than 25% of prices.",
  },
  {
    title: "p50",
    field: "p50",
    formatter: shortFormatter,
    align: "right",
    headerTooltip:
      "The 50th percentile AKA the median. This is the price that middle value if all prices are sorted.",
  },
  {
    title: "avg",
    field: "mean",
    formatter: shortFormatter,
    align: "right",
    headerTooltip: "The average price of the cleaned search results.",
  },
  {
    title: "std",
    field: "std",
    formatter: shortFormatter,
    align: "right",
    headerTooltip: "The standard deviation of the cleaned search results.",
  },
  {
    title: "Valid (%)",
    field: "percent_complete",
    headerVertical: true,
    headerTooltip:
      "The number of valid rows after cleaning the search results.",
  },
];

export { columns };
