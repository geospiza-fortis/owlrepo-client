<script>
  import { formatPrice } from "../../utils.js";
  import { Tooltip } from "sveltestrap";
  import Plot from "../../components/Plot.svelte";
  export let row;
  export let id;
  export let metric;
  export let age = 28;
</script>

<Tooltip placement="top" target={id}>
  <b>{row.search_item}</b>
  <Plot
    data={row}
    transform={(r) => {
      return [
        {
          type: "box",
          name: r.search_item,
          q1: [r.p25.toPrecision(2)],
          median: [r.p50.toPrecision(2)],
          q3: [r.p75.toPrecision(2)],
          lowerfence: [r.p0.toPrecision(2)],
          upperfence: [r.p100.toPrecision(2)],
          mean: [r.mean.toPrecision(2)],
          sd: [r.std.toPrecision(2)],
          orientation: "h",
        },
      ];
    }}
    layout={{
      height: 100,
      margin: {
        l: 0,
        r: 0,
        b: 25,
        t: 25,
      },
    }}
  />
  <!-- <div>{JSON.stringify(row)}</div> -->
  <div>
    Updated {row.days_since_update} days ago ({row.search_item_timestamp.slice(
      0,
      10
    )}) with {row.search_results} results and history of {row.n_owled} owls.
    <!-- {#if row.client_thumbprint}by {row.client_thumbprint}{/if} -->
  </div>
</Tooltip>
<tr
  {id}
  on:click={() => {
    window.location = `/items?keyword=${encodeURIComponent(row.search_item)}`;
  }}
>
  <td>
    {row.category.replace("one-handed", "1h").replace("two-handed", "2h")}
  </td>
  <td>{row.stat}</td>
  <td>
    <span
      style="background-color: {row.days_since_update > age
        ? 'grey'
        : 'transparent'}"
    >
      {formatPrice(row[metric])}
    </span>
  </td>
</tr>

<style>
  td {
    color: #000;
  }
  div :global(.tooltip-inner) {
    max-width: 350px;
  }
</style>
