<script>
  import PriceQuantityCharts from "$lib/components/PriceQuantityCharts.svelte";
  import { formatPrice } from "$lib/utils.js";
  import Seo from "$lib/components/Seo.svelte";

  export let data;

  function formatDate(ts) {
    return ts ? ts.slice(0, 10) : "";
  }
</script>

<Seo
  title="OwlRepo | {data.searchItemName}"
  description="Price history for {data.searchItemName} on MapleLegends. {data.listings.length} recorded owl searches."
/>

<nav aria-label="breadcrumb" class="mt-3">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="/items">Items</a></li>
    <li class="breadcrumb-item active" aria-current="page">{data.searchItemName}</li>
  </ol>
</nav>

<h1>{data.searchItemName}</h1>

<PriceQuantityCharts data={data.listings} search_item_name={data.searchItemName} showTitle={false} />

<div class="table-responsive mt-3">
  <table class="table table-dark table-striped table-hover">
    <thead>
      <tr>
        <th>Date</th>
        <th>Listed</th>
        <th>Bundle</th>
        <th>Outliers</th>
        <th>Valid%</th>
        <th class="text-end">avg</th>
        <th class="text-end">std</th>
        <th class="text-end">min</th>
        <th class="text-end">p25</th>
        <th class="text-end">p50</th>
        <th class="text-end">p75</th>
        <th class="text-end">max</th>
        <th>Listing</th>
      </tr>
    </thead>
    <tbody>
      {#each data.listings as row}
        <tr>
          <td>{formatDate(row.search_item_timestamp)}</td>
          <td>{row.search_results}</td>
          <td>{row.sum_bundle}</td>
          <td>{row.num_outlier}</td>
          <td>{row.percent_complete}</td>
          <td class="text-end">{formatPrice(row.mean)}</td>
          <td class="text-end">{formatPrice(row.std)}</td>
          <td class="text-end">{formatPrice(row.p0)}</td>
          <td class="text-end">{formatPrice(row.p25)}</td>
          <td class="text-end">{formatPrice(row.p50)}</td>
          <td class="text-end">{formatPrice(row.p75)}</td>
          <td class="text-end">{formatPrice(row.p100)}</td>
          <td><a href="/listing/{row.task_id}">view</a></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
