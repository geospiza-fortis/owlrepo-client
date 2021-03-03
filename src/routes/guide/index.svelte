<script>
  import { onMount } from "svelte";
  // tabulator is a misnomer for a module name
  import { formatPrice } from "../../tabulator.js";
  import { groupBy, sortBy } from "lodash";
  import moment from "moment";
  import localforage from "localforage";

  let category_data;
  let price_data;

  let threshold;
  $: threshold && localforage.setItem("guide-threshold", threshold);

  const CATEGORIES = ["10", "30", "60", "70", "100", "etc", "mastery"];

  async function getData(route) {
    let resp = await fetch(route);
    let data = await resp.json();
    return data;
  }

  function chunkList(list, size) {
    // split it in half
    if (list.length > size) {
      let mid = Math.floor(list.length / 2);
      return [list.slice(0, mid), list.slice(mid, list.length)];
    } else {
      return [list];
    }
  }

  function getBackgroundColor(percent, opacity = 1.0) {
    // https://www.schemecolor.com/pastel-calm.php
    const colors = [
      `rgba(165, 200, 228, ${opacity})`,
      `rgba(192, 236, 204, ${opacity})`,
      `rgba(242, 221, 192, ${opacity})`,
      `rgba(249, 240, 193, ${opacity})`,
      `rgba(244, 205, 166, ${opacity})`,
      `rgba(246, 168, 166, ${opacity})`,
    ];
    return colors[CATEGORIES.indexOf(percent) % colors.length];
  }

  onMount(async () => {
    threshold = (await localforage.getItem("guide-threshold")) || 350000;
    // TODO: I wish I had some documentation on the schema of these...
    let index = await getData("/api/v1/query/search_item_index");
    let category = await getData("/api/v1/query/mllib_scrolls_category");

    // only keep scrolls that are categoriezed and exist in the database
    category_data = {};
    for (let i = 0; i < category.length; i++) {
      category_data[category[i].name] = category[i];
    }

    // also include some other things that are not necessarily scrolls
    let masterybooks = index.filter((row) =>
      row.search_item.includes("Mastery Book")
    );
    for (let item of masterybooks) {
      category_data[item.search_item] = {
        percent: "mastery",
        category: item.search_item.split("]")[1].trim().toLowerCase(),
        // could be better...
        stat: item.search_item.includes("20") ? "20" : "30",
      };
    }

    category_data = {
      ...category_data,
      "Clean Slate Scroll 20%": {
        percent: "etc",
        category: "clean slate",
        stat: "20%",
      },
      "Clean Slate Scroll 1%": {
        percent: "etc",
        category: "clean slate",
        stat: "1%",
      },
      "Chaos Scroll 60%": {
        percent: "etc",
        category: "chaos scroll",
        stat: "",
      },
      "White Scroll": {
        percent: "etc",
        category: "white scroll",
        stat: "",
      },
      "Onyx Apple": {
        percent: "etc",
        category: "onyx apple",
        stat: "",
      },
      "Zombie's Lost Gold Tooth": {
        percent: "etc",
        category: "gold tooth",
        stat: "",
      },
      "Dragon Scale": {
        percent: "etc",
        category: "dragon scale",
        stat: "",
      },
      "Piece of Time": {
        percent: "etc",
        category: "piece of time",
        stat: "",
      },
    };

    price_data = [];
    // we need a method of matching items
    for (let i = 0; i < index.length; i++) {
      let item = index[i];
      if (!(item.search_item in category_data)) {
        continue;
      }
      price_data.push({
        ...category_data[item.search_item],
        ...item,
        days_since_update:
          moment().diff(moment(item.search_item_timestamp), "days") || -1,
      });
    }

    price_data = groupBy(price_data, (v) => v.percent);
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
        Only scrolls worth more than {formatPrice(threshold)} median. Prices more
        than 1 month old are greyed out.
      </p>
    </div>
    <div class="col">
      <label
        >Minimum price
        <input type="number" bind:value={threshold} />
      </label>
      <input
        type="range"
        min="0"
        max="1000000"
        step="50000"
        bind:value={threshold}
      />
    </div>
  </div>
</div>

<details>
  <summary>Click here for changelog</summary>
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

<div class="guide-container">
  <div class="card-columns guide">
    {#if price_data}
      {#each CATEGORIES as key}
        {#each chunkList(sortBy( price_data[key].filter((x) => x.p50 > threshold || x.percent == "etc"), ["category", "stat"] ), 15) as chunk, i}
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
                <h5>{{ mastery: "Mastery Book", etc: "Et cetera" }[key]}</h5>
              {/if}
            </div>

            <div class="card-body">
              <table
                class="table table-sm table-hover"
                style="background-color: {getBackgroundColor(key)};"
              >
                <tbody>
                  {#each chunk as row}
                    <tr
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Updated {row.search_item_timestamp.slice(0, 10)}"
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
                            : 'none'}"
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
    {/if}
  </div>
</div>

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
