const resultColumns = [
  {
    title: "Search Item",
    field: "item",
    headerFilter: "select",
    headerFilterParams: {
      values: true,
      elementAttributes: {
        style:
          "padding: 4px; width: 100%; box-sizing: border-box; cursor: pointer;",
      },
    },
  },
  {
    title: "Results",
    field: "results",
  },
  {
    title: "Seller",
    field: "id",
  },
  {
    title: "Store Name",
    field: "store_name",
  },
  {
    title: "Bundle",
    field: "bundle",
  },
  {
    title: "Price",
    field: "price",
    formatter: "money",
    formatterParams: { precision: 0 },
    align: "right",
  },
  {
    title: "Quantity",
    field: "quantity",
  },
];

const summaryColumns = [
  { title: "Key", field: "key" },
  {
    title: "Raw",
    field: "raw",
    formatter: "money",
    formatterParams: { precision: 0 },
    align: "right",
  },
  {
    title: "Clean",
    field: "clean",
    formatter: "money",
    formatterParams: { precision: 0 },
    align: "right",
  },
];

export { resultColumns, summaryColumns };
