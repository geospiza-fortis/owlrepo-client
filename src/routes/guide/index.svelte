<script>
  import { onMount } from "svelte";
  // tabulator is a misnomer for a module name
  import { formatPrice } from "../../tabulator.js";
  import { groupBy, sortBy } from "lodash";
  import moment from "moment";

  let category_data;
  let price_data;

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_GREEN = "#a3c3b0";
  const BG_BLACK = "grey";

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
    // https://colorhunt.co/palette/219735
    // https://www.schemecolor.com/pastel-tropical.php
    // https://www.schemecolor.com/old-style-pastels.php
    return {
      10: `rgba(163, 195, 176, ${opacity})`,
      30: `rgba(234, 210, 184, ${opacity})`,
      60: `rgba(157, 151, 188, ${opacity})`,
      70: `rgba(222, 167, 161, ${opacity})`,
      etc: `rgba(174, 188, 110, ${opacity})`,
      mastery: `rgba(103, 154, 125, ${opacity})`
    }[percent];
  }

  onMount(async () => {
    // TODO: I wish I had some documentation on the schema of these...
    let index = await getData("/api/v1/query/search_item_index");
    let category = await getData("/api/v1/query/mllib_scrolls_category");

    console.log(category);
    // only keep scrolls that are categoriezed and exist in the database
    category_data = {};
    for (let i = 0; i < category.length; i++) {
      category_data[category[i].name] = category[i];
    }

    // also include some other things that are not necessarily scrolls
    let masterybooks = index.filter(row =>
      row.search_item.includes("Mastery Book")
    );
    for (let item of masterybooks) {
      category_data[item.search_item] = {
        percent: "mastery",
        category: item.search_item
          .split("]")[1]
          .trim()
          .toLowerCase(),
        // could be better...
        stat: item.search_item.includes("20") ? "20" : "30"
      };
    }

    category_data = {
      ...category_data,
      "Clean Slate Scroll 20%": {
        percent: "etc",
        category: "css",
        stat: "20%"
      },
      "Clean Slate Scroll 1%": {
        percent: "etc",
        category: "css",
        stat: "1%"
      },
      "Chaos Scroll 60%": {
        percent: "etc",
        category: "chaos scroll",
        stat: ""
      },
      "White Scroll": {
        percent: "etc",
        category: "white scroll",
        stat: ""
      },
      "Onyx Apple": {
        percent: "etc",
        category: "onyx apple",
        stat: ""
      },
      "Zombie's Lost Gold Tooth": {
        percent: "etc",
        category: "gold tooth",
        stat: ""
      },
      "Dragon Scale": {
        percent: "etc",
        category: "dragon scale",
        stat: ""
      },
      "Piece of Time": {
        percent: "etc",
        category: "piece of time",
        stat: ""
      }
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
          moment().diff(moment(item.search_item_timestamp), "days") || -1
      });
    }

    price_data = groupBy(price_data, v => v.percent);
  });
</script>

<style>
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
</style>

<h1>Scroll Guide</h1>

<p>
  Only scrolls worth more than 350k median. Prices more than 1 month old are
  greyed out.
</p>

<details>
  <summary>Click here for changelog</summary>
  <b>Update 2021-02-18</b>
  <ul>
    <li>added etc and mastery books</li>
    <li>list prices are now p50 instead of p25</li>
    <li>rows are clickable</li>
  </ul>
</details>
<br />

{#if price_data}
  <div class="container full-width guide">
    <div class="card-columns">
      {#each Object.keys(price_data).sort() as key}
        {#each chunkList(sortBy(
            price_data[key].filter(x => x.p50 > 350000 || x.percent == 'etc'),
            ['category', 'stat']
          ), 15) as chunk, i}
          <div
            class="card"
            style="background-color: {getBackgroundColor(key)};">
            <div class="card-header">
              {#if parseInt(key)}
                <h5>{key}% Scrolls</h5>
              {:else}
                <h5>{{ mastery: 'Mastery Book', etc: 'Et cetera' }[key]}</h5>
              {/if}
            </div>

            <div class="card-body">
              <table class="table table-sm table-striped table-hover">
                <tbody>
                  {#each chunk as row}
                    <tr
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Updated {row.search_item_timestamp.slice(0, 10)}"
                      on:click={() => {
                        window.location = `/items?keyword=${encodeURIComponent(row.search_item)}`;
                      }}>
                      <td>
                        {row.category
                          .replace('one-handed', '1h')
                          .replace('two-handed', '2h')}
                      </td>
                      <td>{row.stat}</td>
                      <td>
                        <span
                          style="background-color: {row.days_since_update > 7 * 4 ? BG_BLACK : 'none'}">
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
{/if}
