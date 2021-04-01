<script>
  import Table from "../../components/Table.svelte";
  import SearchBox from "../../components/SearchBox.svelte";
  import PriceQuantityCharts from "../../components/PriceQuantityCharts.svelte";
  import { onMount } from "svelte";
  import { chunk } from "lodash";
  import moment from "moment";

  export let listingData = [];

  onMount(async () => {
    const fetchData = async (url) => {
      let resp = await fetch(url);
      return await resp.json();
    };
    listingData = await fetchData("/api/v2/query/search_item_listing");
  });

  const core_scrolls = [
    "Dark scroll for Claw for ATT 30%",
    "Scroll for Gloves for ATT 60%",
    "Scroll for Overall Armor for DEX 60%",
    "Dark Scroll for Pet Equip. for HP 30%",
    "Scroll for Helmet for DEX 60%",
    "Scroll for Overall Armor for INT 60%",
  ];
  $: chunked_scrolls = chunk(core_scrolls, 3);

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

  let max_months = moment().diff(moment("2020-04-01"), "months");
  let months = 6;
  $: range = 28 * months;
  $: core_layout = {
    xaxis: {
      range: [
        moment().utc().subtract(range, "days").format(),
        moment().utc().format(),
      ],
      type: "date",
    },
  };
</script>

<svelte:head>
  <title>OwORepo | Charts</title>
</svelte:head>

<h1>Charts</h1>

<h2>Core scrolls</h2>

<p>
  Plots of scrolls that are indicative of the market. Observations are generally
  collected weekly.
</p>

<label>
  <input type="range" min="1" max={max_months} step="1" bind:value={months} />
  Showing {months}
  months of history
</label>

<div class="chart-container">
  {#each chunked_scrolls as row}
    <div class="row">
      {#each row as col}
        <div class="col-md">
          <PriceQuantityCharts
            data={listingData}
            search_item_name={col}
            layout={core_layout}
          />
        </div>
      {/each}
    </div>
  {/each}
</div>

<h2>Search against all scrolls</h2>

<SearchBox {itemData} {table} keys={["search_item"]} {initialSort} />
<Table bind:table data={itemData} {options} />

<PriceQuantityCharts data={listingData} {search_item_name} />

<style>
  /* https://stackoverflow.com/a/24895631 */
  .chart-container {
    width: 100vw;
    position: relative;
    left: calc(-50vw + 50%);
    padding: 0 2rem;
  }
</style>
