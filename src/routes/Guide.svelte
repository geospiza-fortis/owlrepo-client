<script>
  import { onMount } from "svelte";
  // tabulator is a misnomer for a module name
  import { formatPrice } from "../tabulator.js";
  import sortBy from "lodash.sortby";
  import groupBy from "lodash.groupby";
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
      70: `rgba(222, 167, 161, ${opacity})`
    }[percent];
  }

  onMount(async () => {
    let index = await getData("/api/v1/query/search_item_index");
    let category = await getData("/api/v1/query/mllib_scrolls_category");

    // only keep scrolls that are categoriezed and exist in the database
    category_data = {};
    for (let i = 0; i < category.length; i++) {
      category_data[category[i].name] = category[i];
    }
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

<h1>Scroll Guide</h1>
<p>
  Only scrolls worth more than 350k median. Prices more than 1 month old are
  greyed out.
</p>
{#if price_data}
  <div class="container full-width guide">
    <div class="card-columns">
      {#each Object.keys(price_data).sort() as key}
        {#each chunkList(sortBy(price_data[key].filter(x => x.p25 > 350000), [
            'category',
            'stat'
          ]), 15) as chunk, i}
          <div
            class="card"
            style="background-color: {getBackgroundColor(key)};">
            <div class="card-header">
              <h5>{key}% Scrolls</h5>
            </div>

            <div class="card-body">
              <table class="table table-sm table-striped table-hover">
                <tbody>
                  {#each chunk as row}
                    <tr
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Updated {row.search_item_timestamp.slice(0, 10)}">
                      <td>
                        {row.category
                          .replace('one-handed', '1h')
                          .replace('two-handed', '2h')}
                      </td>
                      <td>{row.stat}</td>
                      <td>
                        <span
                          style="background-color: {row.days_since_update > 7 * 4 ? BG_BLACK : 'none'}">
                          {formatPrice(row.p25)}
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
