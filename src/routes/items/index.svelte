<script>
  import Table from "../../components/Table.svelte";
  import PriceQuantityCharts from "../../components/PriceQuantityCharts.svelte";
  import { columns, transform } from "./columns.js";
  import { onMount } from "svelte";
  import { Stretch } from "svelte-loading-spinners";
  import { browser } from "$app/env";

  export let data;
  export let last_modified;

  onMount(async () => {
    last_modified;
    const fetchData = async (url) => {
      let resp = await fetch(url);
      last_modified = new Date(resp.headers.get("last-modified")).toISOString();
      return await resp.json();
    };
    data = transform(await fetchData("/api/v2/query/search_item_listing"));
  });

  let is_chartable = false;
  let search_item_name;

  let keyword;
  $: browser &&
    (keyword = new URLSearchParams(window.location.search).get("keyword"));

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
</script>

<svelte:head>
  <title>OwlRepo | Items</title>
</svelte:head>

<h1>Items</h1>

<Table {data} {options} />
{#if last_modified}
  <p style="text-align: right">
    <i>Last updated {last_modified}</i>
  </p>
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

{#if data && is_chartable}
  <PriceQuantityCharts {data} {search_item_name} />
{/if}
