<script>
  import { onMount } from "svelte";
  // tabulator is a misnomer for a module name
  import { formatPrice } from "../../tabulator.js";
  import { sortBy, groupBy } from "lodash";
  import localforage from "localforage";
  import {
    CATEGORIES,
    chunkList,
    getBackgroundColor,
    transform,
  } from "./index.js";
  import { Tooltip } from "sveltestrap/src";
  import { Stretch } from "svelte-loading-spinners/src";
  import SearchBox from "./SearchBox.svelte";

  export let price_data = [];
  let filtered_price_data = [];

  let threshold;

  $: threshold && localforage.setItem("guide-threshold", threshold);
  $: user_filtered_price_data = price_data.filter(
    (x) => x.p50 > threshold || ["etc", "ores"].includes(x.percent)
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
    // TODO: I wish I had some documentation on the schema of these...
  });
</script>

<svelte:head>
  <title>OwORepo | Guide</title>
</svelte:head>

<h1>Scwoww Guide</h1>

<div class="container">
  <div class="row">
    <div class="col">
      <p>
        Onwy scwowws wowth mowe than {formatPrice(threshold)} mesos median. Pwices
        mowe than 1 month owd awe gweyed out. See the <a href="/">home page</a> fow
        aww items in the wepositowy.
      </p>
    </div>
    <div class="col">
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
        {#each chunkList(sortBy(grouped_price_data[key]), 15) as chunk, i}
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
                    <Tooltip placement="top" target={`row${key}-${i}-${j}`}
                      ><div>
                        Updated {row.days_since_update} days ago ({row.search_item_timestamp.slice(
                          0,
                          10
                        )})
                      </div>
                    </Tooltip>
                    <tr
                      id={`row${key}-${i}-${j}`}
                      on:click={() => {
                        window.location = `/items?keyword=${encodeURIComponent(
                          row.search_item
                        )}`;
                      }}
                    >
                      <td>
                        {row.category
                          .replace("one-handed", "1h")
                          .replace("two-handed", "2h")}
                      </td>
                      <td>{row.stat}</td>
                      <td>
                        <span
                          style="background-color: {row.days_since_update >
                          7 * 4
                            ? 'grey'
                            : 'transparent'}"
                        >
                          {formatPrice(row.p50)}
                        </span>
                      </td>
                    </tr>
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
    padding: 0 2em;
  }

  @media (max-width: 900px) {
    .guide {
      padding: 0 0.5rem;
    }
  }

  .guide,
  td {
    color: #000;
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
