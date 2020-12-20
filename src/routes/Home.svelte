<script>
  import IndexView from "../components/IndexView.svelte";
  import ActivityHeatmap from "../components/ActivityHeatmap.svelte";
  import PriceQuantityCharts from "../components/PriceQuantityCharts.svelte";
  import SearchItemIndex from "../components/SearchItemIndex.svelte";
  import TopUploaders from "../components/TopUploaders.svelte";
  import FrontMatter from "../docs/FrontMatter.svx";
  import IndexDescription from "../docs/IndexDescription.svx";
  import References from "../docs/References.svx";
  import CollapseInfo from "../components/CollapseInfo.svelte";
  import { Stretch } from "svelte-loading-spinners";

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_YELLOW = "#ffefae";
</script>

<FrontMatter />

<CollapseInfo
  component={IndexDescription}
  componentId="searchItemCollapse"
  text="Tell me more!" />
<br />

<SearchItemIndex />

<p>
  The repository history allows us to inspect the price and volume of items sold
  by merchants in the Free Market. Click on one of the items in the items table
  or visit the
  <a href="/charts">charting page</a>
  to see more plots this this.
</p>

{#await fetch('/api/v1/query/random_listing').then(resp =>
  resp.json()
) then data}
  <PriceQuantityCharts {data} search_item_name={data[0].search_item} />
{/await}

<h2>Contributions</h2>
<p>
  If you find this site useful, the best way to help is to
  <a href="/upload">upload owl searches.</a>
  Items marked in
  <span style="background: {BG_YELLOW}">yellow</span>
  or
  <span style="background: {BG_RED}">red</span>
  are likely worth uploading. Look at the
  <a href="/recommendation">recommendations</a>
  for a list of outdated items ranked by value. Also help by correct errors in
  screenshots on the
  <a href="/curate">curation</a>
  page.
</p>

<h3>Upload Activity</h3>
{#await fetch('/api/v1/query/heatmap').then(resp => resp.json()) then data}
  <ActivityHeatmap {data} max_range={14} />
{/await}

<br />

<h3>Top Uploaders</h3>

<TopUploaders />
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
