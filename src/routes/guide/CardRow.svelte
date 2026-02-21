<script>
  import { formatPrice } from "../../utils.js";
  import Plot from "../../components/Plot.svelte";
  export let row;
  export let id;
  export let metric;
  export let age = 28;

  let showTooltip = false;
</script>

<tr
  {id}
  on:mouseenter={() => (showTooltip = true)}
  on:mouseleave={() => (showTooltip = false)}
  on:click={() => {
    window.location = `/items?keyword=${encodeURIComponent(row.search_item)}`;
  }}
>
  <td class="category-cell">
    {row.category.replace("one-handed", "1h").replace("two-handed", "2h")}
    {#if showTooltip}
      <div class="tooltip-overlay">
        <div class="tooltip-content">
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
          <div>
            Updated {row.days_since_update} days ago ({row.search_item_timestamp.slice(
              0,
              10
            )}) with {row.search_results} results and history of {row.n_owled} owls.
          </div>
        </div>
      </div>
    {/if}
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
  .category-cell {
    position: relative;
  }
  .tooltip-overlay {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.9);
    border-radius: 4px;
    width: 350px;
  }
  .tooltip-content {
    color: #fff;
    padding: 0.5em;
  }
</style>
