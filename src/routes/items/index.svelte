<script>
  import { onMount } from "svelte";
  import Table from "../../components/Table.svelte";
  import PriceQuantityCharts from "../../components/PriceQuantityCharts.svelte";
  import { columns } from "./columns.js";

  let lastModified;

  let data;
  let is_chartable = false;
  let search_item_name;

  let keyword;

  $: options = {
    data: data,
    layout: "fitDataFill",
    pagination: "local",
    paginationSize: 20,
    dataFiltered: (filters, rows) => {
      let data = rows.map((x) => x.getData());
      let set = new Set(data.map((x) => x.search_item));
      is_chartable = set.size == 1;
      search_item_name = set.values().next().value;
    },
    initialHeaderFilter: keyword
      ? [
          {
            field: "search_item",
            value: keyword,
          },
        ]
      : undefined,
    initialSort: [{ column: "search_item_timestamp", dir: "desc" }],
    columns: columns,
  };

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    keyword = urlParams.get("keyword");

    let resp = await fetch("/api/v1/query/search_item_listing", {
      cache: "no-cache",
    });
    data = await resp.json();

    lastModified = new Date(resp.headers.get("last-modified")).toISOString();
  });
</script>

<h1>Items</h1>

<Table {data} {options} />
{#if lastModified}
  <p style="text-align: right">
    <i>Last updated {lastModified}</i>
  </p>
{/if}
{#if data && is_chartable}
  <PriceQuantityCharts {data} {search_item_name} />
{/if}
