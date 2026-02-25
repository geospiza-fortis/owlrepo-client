<script>
  import Table from "$lib/components/Table.svelte";
  import PriceQuantityCharts from "$lib/components/PriceQuantityCharts.svelte";
  import { columns, transform } from "./columns.js";
  import { onMount } from "svelte";
  import { Stretch } from "svelte-loading-spinners";
  import { page } from "$app/stores";

  let listingData;
  let last_modified;

  onMount(async () => {
    const fetchData = async (url) => {
      let resp = await fetch(url);
      last_modified = new Date(resp.headers.get("last-modified")).toISOString();
      return await resp.json();
    };
    listingData = transform(await fetchData("/api/v2/query/search_item_listing"));
  });

  let is_chartable = false;
  let search_item_name;

  $: keyword = $page.url.searchParams.get("keyword");

  $: options = {
    data: listingData,
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

<Table data={listingData} {options} />
{#if last_modified}
  <p style="text-align: right">
    <i>Last updated {last_modified}</i>
  </p>
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

{#if listingData && is_chartable}
  <PriceQuantityCharts data={listingData} {search_item_name} />
{/if}
