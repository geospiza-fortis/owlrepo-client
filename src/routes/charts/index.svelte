<script>
  import Table from "../../components/Table.svelte";
  import SearchBox from "../../components/SearchBox.svelte";
  import PriceQuantityCharts from "../../components/PriceQuantityCharts.svelte";
  import { onMount } from "svelte";

  export let listingData = [];

  onMount(async () => {
    const fetchData = async (url) => {
      let resp = await fetch(url);
      return await resp.json();
    };
    listingData = await fetchData("/api/v2/query/search_item_listing");
  });

  let table;

  let search_item_name = "Scroll for Gloves for ATT 60%";
  let initialSort = [{ column: "num_owls", dir: "desc" }];
  $: itemData = transform(listingData);

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
        num_owls: counter[key],
      });
    }
    return itemData;
  }

  const options = {
    pagination: "local",
    paginationSize: 5,
    rowClick: (e, row) => {
      search_item_name = row.getData().search_item;
    },
    initialSort: initialSort,
    columns: [
      {
        title: "Search Item",
        field: "search_item",
      },
      {
        title: "# Owls",
        field: "num_owls",
      },
    ],
  };
</script>

<svelte:head>
  <title>OwlRepo | Charts</title>
</svelte:head>

<h1>Charts</h1>

<SearchBox {itemData} {table} keys={["search_item"]} {initialSort} />
<Table bind:table data={itemData} {options} />

<PriceQuantityCharts data={listingData} {search_item_name} />
