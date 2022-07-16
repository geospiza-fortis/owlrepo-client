<script>
  import moment from "moment";
  import { sortBy } from "lodash-es";
  import { onMount } from "svelte";
  import Recommendations from "./Rec.svelte";
  import { Stretch } from "svelte-loading-spinners";
  import localforage from "localforage";

  function sortData(data, threshold_search, threshold_price) {
    // Sort and concat the two fields. Somewhat of an inefficient solution.
    let a = data.filter(
      (obj) =>
        obj.search_results > threshold_search && obj.p25 > threshold_price
    );
    let b = data.filter((obj) => !a.includes(obj));
    return sortBy(a, [(obj) => -obj.p25]).concat(
      sortBy(b, [(obj) => -obj.search_results])
    );
  }

  let threshold_age;
  let threshold_price;
  let threshold_search;

  let last_modified;
  let scrolls_predict = [];
  let search_item_index = [];

  $: threshold_age && localforage.setItem("rec-age", threshold_age);
  $: threshold_price && localforage.setItem("rec-price", threshold_price);
  $: threshold_search && localforage.setItem("rec-search", threshold_search);

  $: predData = sortData(scrolls_predict, threshold_search, threshold_price);
  $: data = sortData(search_item_index, threshold_search, threshold_price);

  onMount(async () => {
    threshold_age = (await localforage.getItem("rec-age")) || 28;
    threshold_price = (await localforage.getItem("rec-price")) || 350000;
    threshold_search = (await localforage.getItem("rec-search")) || 8;

    last_modified;
    const getData = async (route) => {
      let resp = await fetch(route);
      let data = await resp.json();
      last_modified = new Date(resp.headers.get("last-modified")).toISOString();
      return data.map((obj) => ({
        ...obj,
        days_since_update:
          moment().diff(moment(obj.search_item_timestamp), "days") || -1,
      }));
    };
    scrolls_predict = await getData("/api/v2/query/scrolls_predict");

    // convert front page data for this page
    search_item_index = (await getData("/api/v2/query/search_item_index")).map(
      (obj) => ({
        ...obj,
        name: obj.search_item,
      })
    );
  });
</script>

<svelte:head>
  <title>OwlRepo | Recommendation</title>
</svelte:head>

<h1>Recommendations</h1>

<p>
  Want to know what to upload? Use these ranked tables to determine what's
  valuable.
</p>

<div>
  <label>
    <input type="number" min={0} max={28} bind:value={threshold_age} />
    <input type="range" min={0} max={28} bind:value={threshold_age} /> age threshold
  </label>
</div>
<div>
  <label>
    <input type="number" min={1} max={20} bind:value={threshold_search} />
    <input type="range" min={1} max={20} bind:value={threshold_search} /> search
    threshold
  </label>
</div>
<div>
  <label>
    <input
      type="number"
      min={10000}
      max={1000000}
      step={50000}
      bind:value={threshold_price}
    />
    <input
      type="range"
      min={10000}
      max={1000000}
      step={50000}
      bind:value={threshold_price}
    /> price threshold
  </label>
</div>

<p>
  Items with greater than {threshold_search} search results and valued more than
  {threshold_price}
  mesos are sorted by value. All other items are sorted by the number of results.
</p>

<p>
  <i>Last updated {last_modified}.</i>
</p>

{#if data && predData}
  <Recommendations {data} {predData} {threshold_age} />
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}
