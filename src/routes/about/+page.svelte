<script>
  import FrontMatter from "$lib/docs/FrontMatter.svx";
  import PriceQuantityCharts from "$lib/components/PriceQuantityCharts.svelte";
  import IndexDescription from "$lib/docs/IndexDescription.svx";
  import References from "$lib/docs/References.svx";
  import { Stretch } from "svelte-loading-spinners";
  import { onMount } from "svelte";

  export let random_listing;

  onMount(async () => {
    const fetchData = async (url) => {
      let resp = await fetch(url);
      return await resp.json();
    };

    random_listing = await fetchData("/api/v2/query/random_listing");
  });
</script>

<h1>About</h1>

<FrontMatter />

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

<IndexDescription />

<References />
