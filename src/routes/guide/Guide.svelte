<script>
  import { onMount } from "svelte";
  import { formatPrice } from "../../utils.js";
  import { sortBy, groupBy, random } from "lodash-es";
  import localforage from "localforage";
  import {
    CATEGORIES,
    chunkList,
    getBackgroundColor,
    transform,
  } from "./index.js";
  import { Stretch } from "svelte-loading-spinners";
  import SearchBox from "./SearchBox.svelte";
  import CardRow from "./CardRow.svelte";
  import Changelog from "./Changelog.svelte";
  import moment from "moment";
  import FrontMatter from "../../docs/FrontMatter.svx";

  const metric_choices = ["p25", "p50", "p75", "mean"];
  const metric_names = {
    p25: "25th percentile",
    p50: "median",
    p75: "75th percentile",
    mean: "mean",
  };

  export let home = false;

  export let price_data = [];
  let filtered_price_data = [];
  let uploads = [];

  let age;
  let threshold;
  let metric;

  $: age && localforage.setItem("guide-age", age);
  $: threshold && localforage.setItem("guide-threshold", threshold);
  $: metric && localforage.setItem("guide-metric", metric);
  $: user_filtered_price_data = price_data.filter(
    (x) => x[metric] > threshold || ["etc", "ores"].includes(x.percent)
  );
  $: grouped_price_data = groupBy(filtered_price_data, (v) => v.percent);
  $: valid_categories = CATEGORIES.filter((key) => key in grouped_price_data);

  // data for the alert
  $: week_old = price_data.filter((x) => x.days_since_update > 7);
  $: random_item = week_old[random(0, week_old.length)];

  $: prompt_upload =
    uploads.length == 0 ||
    moment().diff(moment(uploads[uploads.length - 1].timestamp), "hours") >= 16;

  onMount(async () => {
    uploads = (await localforage.getItem("personal-uploads")) || [];
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
    age = (await localforage.getItem("guide-age")) || 28;
    threshold = (await localforage.getItem("guide-threshold")) || 350000;
    metric = (await localforage.getItem("guide-metric")) || "p50";
    // TODO: I wish I had some documentation on the schema of these...
  });
</script>

{#if random_item && prompt_upload}
  <div class="alert alert-info alert-dismissible" role="alert">
    {#if uploads.length == 0}
      Want to help out?
    {:else}
      Thank you for the {uploads.length} owl contribution{#if uploads.length > 1}s{/if}.
    {/if}
    Search for <i>{random_item.search_item}</i>
    ({random_item.days_since_update} days old) and
    <a href="/upload">make an upload</a> today!
    <button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="alert"></button>
  </div>
{/if}

<div class="container">
  <div class="row">
    <div class="col">
      {#if home}
        <FrontMatter />
      {/if}
      <p>
        Only scrolls worth more than {formatPrice(threshold)} mesos ({metric_names[
          metric
        ]}). Prices more than {age} days old are greyed out. See the
        <a href="/summary">summary page</a> for all items in the repository.
      </p>
    </div>
    <div class="col">
      <div>
        <label>
          <input type="range" min={3} max={28} bind:value={age} />
          grey out prices greater than {age} days
        </label>
      </div>
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

<Changelog />

{#if grouped_price_data}
  <div class="guide-container">
    <div class="card-columns guide">
      {#each valid_categories as key}
        {#each chunkList(sortBy(grouped_price_data[key], [
            "category",
            "stat",
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
                    coins: "Prestigious Coin",
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
                    <CardRow {row} {metric} {age} id={`row${key}-${i}-${j}`} />
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

  /* Override BS5.3 dark theme variables so inline pastel backgrounds show through */
  .guide :global(.card) {
    --bs-card-bg: transparent;
    --bs-card-cap-bg: transparent;
    display: inline-block;
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .guide :global(.table) {
    --bs-table-bg: transparent;
  }

  .guide :global(.table > :not(caption) > * > *) {
    box-shadow: none;
  }

  @media (max-width: 900px) {
    .guide {
      padding: 0 0.5rem;
    }
  }

  /* https://stackoverflow.com/a/43117538 */

  .card-columns {
    column-gap: 1.25rem;
  }

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
