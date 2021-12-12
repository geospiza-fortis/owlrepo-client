<script>
  import ActivityHeatmap from "../components/ActivityHeatmap.svelte";
  import PriceSummary from "../components/PriceSummary/View.svelte";
  import { transform as transformPriceSummary } from "../components/PriceSummary/columns.js";
  import { Stretch } from "svelte-loading-spinners/src";
  import { onMount } from "svelte";

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_YELLOW = "#ffefae";

  export let heatmap;
  export let price_summary;
  export let last_modified;

  onMount(async () => {
    const fetchData = async (url) => {
      let resp = await fetch(url);
      last_modified = new Date(resp.headers.get("last-modified")).toISOString();
      return await resp.json();
    };

    price_summary = transformPriceSummary(
      await fetchData("/api/v2/query/search_item_index")
    );
    random_listing = await fetchData("/api/v2/query/random_listing");
    heatmap = await fetchData("/api/v2/query/heatmap");
  });
</script>

<svelte:head>
  <title>OwlRepo | Summary</title>
</svelte:head>

<h1>Summary</h1>

<p>
  The most recent <a href="/upload">upload</a> for each item is summarized here.
  Click on the item name to see its history and plots. Click on a row to update the
  box plot above the table.
</p>

<PriceSummary itemData={price_summary} {last_modified} />

<p>
  If you find this site useful, the best way to help is to
  <a href="/upload">upload owl searches.</a>
  Items marked in
  <span style="padding:0 3px; color: #333; background: {BG_YELLOW}">
    yellow
  </span>,
  <span style="padding:0 3px; color: #333; background: {BG_ORANGE}">
    orange
  </span>, or
  <span style="padding:0 3px; color: #333; background: {BG_RED}">red</span>
  are likely worth uploading. Look at the
  <a href="/recommendation">recommendations</a>
  for a list of outdated items ranked by value. Also help by correct errors in screenshots
  on the
  <a href="/curate">curation</a>
  page.
</p>

<h3>Upload Activity</h3>
{#if heatmap}
  <ActivityHeatmap data={heatmap} max_range={14} />
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}
<br />
