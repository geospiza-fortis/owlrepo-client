<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import TabulatorSearchBox from "../components/TabulatorSearchBox.svelte";
  import PriceQuantityCharts from "../components/PriceQuantityCharts.svelte";

  let search_item_name = "Scroll for Gloves for ATT 60%";
  let initialSort = [{ column: "num_owls", dir: "desc" }];
  let listingData = [];
  let tableElement;
  $: itemData = transform(listingData);
  $: table = tableElement ? createTable(tableElement, itemData) : null;

  async function fetchData() {
    let resp = await fetch("/api/v1/query/search_item_listing");
    return await resp.json();
  }

  // Get a count of how many time each item appears in the listing so we can
  // show a small table for sorting the charts.
  function transform(data) {
    let counter = {};
    for (let item of data) {
      counter[item.search_item] = (counter[item.search_item] || 0) + 1;
    }
    let itemData = [];
    for (let key in counter) {
      itemData.push({
        search_item: key,
        num_owls: counter[key]
      });
    }
    return itemData;
  }

  function createTable(element, itemData) {
    return new Tabulator(element, {
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
  }

  onMount(async () => {
    listingData = await fetchData();
  });
</script>

<h1>Charts</h1>

<TabulatorSearchBox {itemData} {table} keys={['search_item']} {initialSort} />
<div bind:this={tableElement} />

<PriceQuantityCharts data={listingData} {search_item_name} />
