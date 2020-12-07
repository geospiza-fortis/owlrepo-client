<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import TabulatorSearchBox from "../components/TabulatorSearchBox.svelte";
  import PriceQuantityCharts from "../components/PriceQuantityCharts.svelte";

  let search_item_name = "Scroll for Gloves for ATT 60%";
  let table;
  let initialSort = [{ column: "num_owls", dir: "desc" }];
  let itemData;
  let listingData;

  onMount(async () => {
    let resp = await fetch("/api/v1/query/search_item_listing");
    let data = await resp.json();
    listingData = data;

    let counter = {};
    for (let item of data) {
      counter[item.search_item] = (counter[item.search_item] || 0) + 1;
    }
    itemData = [];
    for (let key in counter) {
      itemData.push({
        search_item: key,
        num_owls: counter[key]
      });
    }

    table = new Tabulator("#itemTable", {
      data: itemData,
      layout: "fitColumns",
      pagination: "local",
      paginationSize: 5,
      rowClick: (e, row) => {
        search_item_name = row.getData().search_item;
      },
      initialSort: initialSort,
      columns: [
        {
          title: "Search Item",
          field: "search_item"
        },
        {
          title: "# Owls",
          field: "num_owls"
        }
      ]
    });
  });
</script>

<h1>Charts</h1>

{#if itemData}
  <TabulatorSearchBox {itemData} {table} keys={['search_item']} {initialSort} />
{/if}
<div id="itemTable" />

{#if listingData}
  <PriceQuantityCharts data={listingData} {search_item_name} />
{/if}
