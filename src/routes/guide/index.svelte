<script>
  import { onMount } from "svelte";
  import { formatPrice } from "../../utils.js";
  import { sortBy, groupBy } from "lodash";
  import localforage from "localforage";
  import {
    CATEGORIES,
    chunkList,
    getBackgroundColor,
    transform,
  } from "./index.js";
  import { Stretch } from "svelte-loading-spinners/src";
  import SearchBox from "./SearchBox.svelte";
  import CardRow from "./CardRow.svelte";

  const metric_choices = ["p25", "p50", "p75", "mean"];
  const metric_names = {
    p25: "25th percentile",
    p50: "median",
    p75: "75th percentile",
    mean: "mean",
  };

  export let price_data = [];
  let filtered_price_data = [];

  let threshold;
  let metric;

  $: threshold && localforage.setItem("guide-threshold", threshold);
  $: metric && localforage.setItem("guide-metric", metric);
  $: user_filtered_price_data = price_data.filter(
    (x) => x[metric] > threshold || ["etc", "ores"].includes(x.percent)
  );
  $: grouped_price_data = groupBy(filtered_price_data, (v) => v.percent);
  $: valid_categories = CATEGORIES.filter((key) => key in grouped_price_data);

  onMount(async () => {
    const fetchData = async (url) => {
      let resp = await fetch(url);
      return await resp.json();
    };
    const [category, index] = await Promise.all([
      fetchData("/api/v2/query/mllib_scrolls_category"),
      fetchData("/api/v2/query/search_item_index"),
    ]);
    price_data = transform(index, category);
  });

  onMount(async () => {
    threshold = (await localforage.getItem("guide-threshold")) || 350000;
    metric = (await localforage.getItem("guide-metric")) || "p50";
    // TODO: I wish I had some documentation on the schema of these...
  });
</script>

<svelte:head>
  <title>OwlRepo | Guide</title>
</svelte:head>

<h1>Scroll Guide</h1>

<div class="container">
  <div class="row">
    <div class="col">
      <p>
        Only scrolls worth more than {formatPrice(threshold)} mesos ({metric_names[
          metric
        ]}). Prices more than 1 month old are greyed out. See the
        <a href="/">home page</a> for all items in the repository.
      </p>
    </div>
    <div class="col">
      <div>
        <label>
          <input
            type="range"
            min="0"
            max="1000000"
            step="50000"
            bind:value={threshold}
          />
          filtering prices less than {formatPrice(threshold)}
        </label>
      </div>
      {#if metric}
        <div>
          <label>
            <select bind:value={metric}>
              {#each metric_choices as choice}
                <option value={choice}>{metric_names[choice]}</option>
              {/each}
            </select>
            price summary
          </label>
        </div>
      {/if}
      {#if price_data}
        <div>
          <SearchBox
            data={user_filtered_price_data}
            bind:result={filtered_price_data}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<details>
  <summary>Click here for changelog</summary>
  <b>Update 2021-03-04</b>
  <ul>
    <li>add ores as a separate section</li>
    <li>add more items to etc</li>
    <li>add search box</li>
  </ul>
  <b>Update 2021-03-02</b>
  <ul>
    <li>add configurable minimum price threshold</li>
    <li>
      update color scheme to <a
        href="https://www.schemecolor.com/pastel-calm.php">pastel calm</a
      >
    </li>
    <li>added a few ores and heartstoppers to etc</li>
    <li>finally fixed the popover</li>
  </ul>

  <b>Update 2021-03-01</b>
  <ul>
    <li>bug fixed with 100% being mixed in with 10% scrolls</li>
  </ul>

  <b>Update 2021-02-18</b>
  <ul>
    <li>added etc and mastery books</li>
    <li>list prices are now p50 instead of p25</li>
    <li>rows are clickable</li>
  </ul>
</details>
<br />

{#if grouped_price_data}
  <div class="guide-container">
    <div class="card-columns guide">
      {#each valid_categories as key}
        {#each chunkList(sortBy(grouped_price_data[key], [
            "category",
          ]), 15) as chunk, i}
          <div
            class="card"
            style="background-color: {getBackgroundColor(key)};"
          >
            <div
              class="card-header"
              style="background-color: {getBackgroundColor(key)};"
            >
              {#if parseInt(key)}
                <h5>{key}% Scrolls</h5>
              {:else}
                <h5>
                  {{
                    mastery: "Mastery Book",
                    etc: "Et cetera",
                    ores: "Ores",
                  }[key]}
                </h5>
              {/if}
            </div>

            <div class="card-body">
              <table
                class="table table-sm table-hover"
                style="background-color: {getBackgroundColor(key)};"
              >
                <tbody>
                  {#each chunk as row, j}
                    <CardRow {row} {metric} id={`row${key}-${i}-${j}`} />
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/each}
      {/each}
    </div>
  </div>
{:else}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

<style>
  /* https://stackoverflow.com/a/24895631 */
  .guide-container {
    width: 100vw;
    position: relative;
    left: calc(-50vw + 50%);
  }

  .guide {
    color: #000;
    padding: 0 2em;
  }

  @media (max-width: 900px) {
    .guide {
      padding: 0 0.5rem;
    }
  }

  /* https://stackoverflow.com/a/43117538 */

  @media (min-width: 550px) {
    .card-columns {
      column-count: 2;
    }
  }

  @media (min-width: 768px) {
    .card-columns {
      column-count: 2;
    }
  }

  @media (min-width: 992px) {
    .card-columns {
      column-count: 3;
    }
  }

  @media (min-width: 1200px) {
    .card-columns {
      column-count: 4;
    }
  }
  @media (min-width: 1600px) {
    .card-columns {
      column-count: 5;
    }
  }
</style>
