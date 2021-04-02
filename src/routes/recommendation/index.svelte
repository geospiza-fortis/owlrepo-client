<script>
  import moment from "moment";
  import { sortBy } from "lodash";
  import { onMount } from "svelte";
  import Recommendations from "./Rec.svelte";
  import { Stretch } from "svelte-loading-spinners/src";

  const p25_thresh = 350000;
  const search_thresh = 8;

  export let data;
  export let predData;
  export let last_modified;

  function sortData(data) {
    // Sort and concat the two fields. Somewhat of an inefficient solution.
    let a = data.filter(
      (obj) => obj.search_results > search_thresh && obj.p25 > p25_thresh
    );
    let b = data.filter((obj) => !a.includes(obj));
    return sortBy(a, [(obj) => -obj.p25]).concat(
      sortBy(b, [(obj) => -obj.search_results])
    );
  }

  onMount(async () => {
    last_modified;
    const getData = async (route) => {
      let resp = await fetch(route);
      let data = await resp.json();
      last_modified = new Date(resp.headers.get("last-modified")).toISOString();
      return sortData(
        data.map((obj) => ({
          ...obj,
          days_since_update:
            moment().diff(moment(obj.search_item_timestamp), "days") || -1,
        }))
      );
    };
    predData = await getData("/api/v2/query/scrolls_predict");

    // convert front page data for this page
    data = (await getData("/api/v2/query/search_item_index")).map((obj) => ({
      ...obj,
      name: obj.search_item,
    }));
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

<p>
  Items with greater than {search_thresh} search results and valued more than {p25_thresh}
  mesos are sorted by value. All other items are sorted by the number of results.
</p>

<p>
  <i>Last updated {last_modified}.</i>
</p>

{#if data && predData}
  <Recommendations {data} {predData} />
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}
