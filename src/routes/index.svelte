<script>
  import IndexView from "../components/IndexView.svelte";
  import ActivityHeatmap from "../components/ActivityHeatmap.svelte";
  import PriceQuantityCharts from "../components/PriceQuantityCharts.svelte";
  import PriceSummary from "../components/PriceSummary/View.svelte";
  import FrontMatter from "../docs/FrontMatter.svx";
  import IndexDescription from "../docs/IndexDescription.svx";
  import References from "../docs/References.svx";
  import CollapseInfo from "../components/CollapseInfo.svelte";
  import { transform as transformPriceSummary } from "../components/PriceSummary/columns.js";
  import { Stretch } from "svelte-loading-spinners/src";
  import { onMount } from "svelte";

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_YELLOW = "#ffefae";

  export let random_listing;
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
  <title>OwlRepo | Home</title>
</svelte:head>

<FrontMatter />

<CollapseInfo component={IndexDescription} text="Tell me more!" />

<PriceSummary itemData={price_summary} {last_modified} />

<p>
  The repository history allows us to inspect the price and volume of items sold
  by merchants in the Free Market. Click on one of the items in the items table
  or visit the
  <a href="/charts">charting page</a>
  to see more plots this this.
</p>

{#if random_listing}
  <PriceQuantityCharts
    data={random_listing}
    search_item_name={random_listing[0].search_item}
  />
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

<h2>Contributions</h2>
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

<h3>Recent Uploads</h3>

<p>
  This table contains the most up-to-date information on recent uploads. Each
  upload may contain several distinct items, with a total number of pages. The
  name of the item with the most entries is shown.
</p>

<div>
  <IndexView limit={5} />
</div>

<References />
