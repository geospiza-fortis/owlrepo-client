<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import PriceQuantityCharts from "../components/PriceQuantityCharts.svelte";
  import { shortFormatter } from "../tabulator.js";

  let lastModified;

  let data;
  let is_chartable = false;
  let search_item_name;

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword");

    let resp = await fetch("/api/v1/query/search_item_listing");
    data = await resp.json();

    lastModified = new Date(resp.headers.get("last-modified")).toISOString();
    let table = new Tabulator("#search_item_listing", {
      data: data,
      layout: "fitDataFill",
      pagination: "local",
      paginationSize: 20,
      dataFiltered: (filters, rows) => {
        let data = rows.map(x => x.getData());
        let set = new Set(data.map(x => x.search_item));
        is_chartable = set.size == 1;
        search_item_name = set.values().next().value;
      },
      initialHeaderFilter: keyword
        ? [
            {
              field: "search_item",
              value: keyword
            }
          ]
        : undefined,
      initialSort: [{ column: "search_item_timestamp", dir: "desc" }],
      columns: [
        {
          title: "Date",
          field: "search_item_timestamp",
          formatter: "datetime",
          formatterParams: {
            outputFormat: "YYYY-MM-DD"
          }
        },
        {
          title: "Search Item",
          field: "search_item",
          formatter: "link",
          headerFilter: true,
          formatterParams: {
            urlField: "task_id",
            urlPrefix: "/listing/"
          }
        },
        { title: "Listed", field: "search_results", headerVertical: true },
        { title: "Bundle", field: "sum_bundle", headerVertical: true },
        {
          title: "Outliers",
          field: "num_outlier",
          headerVertical: true
        },
        { title: "Valid (%)", field: "percent_complete", headerVertical: true },
        {
          title: "avg",
          field: "mean",
          formatter: shortFormatter,
          align: "right"
        },
        {
          title: "std",
          field: "std",
          formatter: shortFormatter,
          align: "right"
        },
        {
          title: "min",
          field: "p0",
          formatter: shortFormatter,
          align: "right"
        },
        {
          title: "p25",
          field: "p25",
          formatter: shortFormatter,
          align: "right"
        },
        {
          title: "p50",
          field: "p50",
          formatter: shortFormatter,
          align: "right"
        },
        {
          title: "p75",
          field: "p75",
          formatter: shortFormatter,
          align: "right"
        },
        {
          title: "max",
          field: "p100",
          formatter: shortFormatter,
          align: "right"
        }
      ]
    });
  });
</script>

<h1>Items</h1>

<div id="search_item_listing" />
{#if lastModified}
  <p style="text-align: right">
    <i>Last updated {lastModified}</i>
  </p>
{/if}
{#if data && is_chartable}
  <PriceQuantityCharts {data} {search_item_name} />
{/if}
