import { shortFormatter } from "../../utils.js";
import { pickBy } from "lodash-es";

const columns = [
  {
    title: "Date",
    field: "search_item_timestamp",
    formatter: "datetime",
    formatterParams: {
      outputFormat: "YYYY-MM-DD",
    },
  },
  {
    title: "Search Item",
    field: "search_item",
    formatter: "link",
    headerFilter: true,
    formatterParams: {
      urlField: "task_id",
      urlPrefix: "/listing/",
    },
  },
  { title: "Listed", field: "search_results", headerVertical: true },
  { title: "Bundle", field: "sum_bundle", headerVertical: true },
  {
    title: "Outliers",
    field: "num_outlier",
    headerVertical: true,
  },
  { title: "Valid (%)", field: "percent_complete", headerVertical: true },
  {
    title: "avg",
    field: "mean",
    formatter: shortFormatter,
    align: "right",
  },
  {
    title: "std",
    field: "std",
    formatter: shortFormatter,
    align: "right",
  },
  {
    title: "min",
    field: "p0",
    formatter: shortFormatter,
    align: "right",
  },
  {
    title: "p25",
    field: "p25",
    formatter: shortFormatter,
    align: "right",
  },
  {
    title: "p50",
    field: "p50",
    formatter: shortFormatter,
    align: "right",
  },
  {
    title: "p75",
    field: "p75",
    formatter: shortFormatter,
    align: "right",
  },
  {
    title: "max",
    field: "p100",
    formatter: shortFormatter,
    align: "right",
  },
];

function transform(data) {
  // make sure to include fields used by dependencies
  const fields = ["task_id", ...columns.map((row) => row.field)];
  return data.map((obj) => ({
    ...pickBy(obj, (_, key) => fields.includes(key)),
  }));
}

export { columns, transform };
