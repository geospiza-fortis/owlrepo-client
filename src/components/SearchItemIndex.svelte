<script context="module">
  export const columns = [
    {
      title: "Search Item",
      field: "search_item",
      formatter: "link",
      formatterParams: {
        url: cell => `/items?keyword=${encodeURIComponent(cell.getValue())}`
      },
      headerTooltip:
        "The name of the item that was searched using the Owl of Minerva."
    },
    {
      title: "Updated",
      field: "search_item_timestamp",
      formatter: "datetime",
      formatterParams: {
        outputFormat: "YYYY-MM-DD"
      },
      headerTooltip: "The date of the owl search upload (YYYY-MM-DD)."
    },
    {
      title: "Uploads",
      field: "n_owled",
      headerVertical: true,
      headerTooltip: "The number of distinct owl uploads."
    },
    {
      title: "Listed",
      field: "search_results",
      headerVertical: true,
      headerTooltip:
        "The number of search results for the most recent owl search for this item."
    },
    {
      title: "Bundle",
      field: "sum_bundle",
      headerVertical: true,
      headerTooltip:
        "The sum of all item bundles. This field may be unreliable due to overlapping text from the price."
    },
    {
      title: "min",
      field: "p0",
      formatter: shortFormatter,
      align: "right",
      headerTooltip: "The minimum price in the cleaned search results."
    },
    {
      title: "p25",
      field: "p25",
      formatter: shortFormatter,
      align: "right",
      headerTooltip:
        "The 25th percentile AKA the 1st quartile. This is the price that is greater than 25% of prices."
    },
    {
      title: "p50",
      field: "p50",
      formatter: shortFormatter,
      align: "right",
      headerTooltip:
        "The 50th percentile AKA the median. This is the price that middle value if all prices are sorted."
    },
    {
      title: "avg",
      field: "mean",
      formatter: shortFormatter,
      align: "right",
      headerTooltip: "The average price of the cleaned search results."
    },
    {
      title: "std",
      field: "std",
      formatter: shortFormatter,
      align: "right",
      headerTooltip: "The standard deviation of the cleaned search results."
    },
    {
      title: "Valid (%)",
      field: "percent_complete",
      headerVertical: true,
      headerTooltip:
        "The number of valid rows after cleaning the search results."
    }
  ];
</script>

<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import moment from "moment";
  import localforage from "localforage";
  import { Stretch } from "svelte-loading-spinners/src";
  import TabulatorSearchBox from "./TabulatorSearchBox.svelte";
  import { shortFormatter } from "../tabulator.js";
  import { Collapse } from "sveltestrap/src";

  let itemsReady = false;
  let itemsLastModified;

  let table;
  let itemData;
  let results;

  let settingsIsOpen = false;

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_YELLOW = "#ffefae";

  let tableSettings;
  $: settingsToggled = tableSettings ? tableSettings.toggle : true;

  async function getSettings() {
    let settings = JSON.parse(
      await localforage.getItem("search-item-index-settings")
    ) || {
      sortColumn: "search_item_timestamp",
      sortDir: "desc",
      paginationSize: 10,
      toggle: true
    };
    return settings;
  }

  // this is specific to this module
  // TODO: factor out into a component
  async function updateSettings() {
    let settings = {
      sortColumn: document.getElementById("sort-column").value,
      sortDir: document.getElementById("sort-dir").value,
      paginationSize: document.getElementById("pagination-size").value,
      toggle: settingsToggled
    };
    console.log(`updating search index settings ${JSON.stringify(settings)}`);
    tableSettings = { ...settings };
    await localforage.setItem(
      "search-item-index-settings",
      JSON.stringify(settings)
    );
  }

  async function updateBoxplot(row = null) {
    // use the current table instance
    let r = row ? row.getData() : table.getRows("active")[0].getData();
    let trace = [
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
        orientation: "h"
      }
    ];

    Plotly.newPlot(
      "boxplot",
      trace,
      {
        title: r.search_item,
        height: 150,
        margin: {
          l: 0,
          r: 0,
          b: 25,
          t: 25
        }
      },
      { responsive: true }
    );

    // we also keep some analytics in this function, since clicking on a row
    // after searching indicates that the search needs to be reweighted. This
    // is something that can be done with some real world usage.
    if (row && document.getElementById("search-box").value.length > 0) {
      // https://developers.google.com/analytics/devguides/collection/gtagjs/custom-dims-mets
      // https://support.google.com/analytics/thread/41497070?hl=en
      let first = table.getRows("active")[0].getData();
      gtag("config", "UA-172155429-1", {
        custom_map: {
          dimension1: "list_head",
          dimension2: "list_position"
        }
      });
      let event_data = {
        event_category: "engagement",
        event_label: r.search_item,
        list_head: first.search_item,
        list_position: row.getPosition(true)
      };
      gtag("event", "boxplot_click", event_data);
    }
  }

  // TODO: refactor as a utility, or get a library to do this
  let timeout;
  function debounce(func) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func();
    }, 500);
  }

  function initTable() {
    let table = new Tabulator("#search_item_index", {
      data: itemData,
      layout: "fitDataFill",
      responsiveLayout: "collapse",
      clipboard: "copy",
      clipboardCopyStyled: false,
      tooltipsHeader: true,
      pagination: "local",
      paginationSize: tableSettings.paginationSize,
      initialSort: [
        { column: tableSettings.sortColumn, dir: tableSettings.sortDir }
      ],
      dataLoading: () => {
        if (itemsReady) {
          debounce(updateBoxplot);
        }
      },
      rowClick: (_, row) => {
        if (itemsReady) {
          updateBoxplot(row);
        }
      },
      columns: columns,
      rowFormatter: function(row) {
        // http://tabulator.info/docs/4.0/format
        // https://www.colorhexa.com/ffc6ae
        let element = row.getElement();
        let datum = row.getData();

        // hard-coded based on the position we specify
        let dateElement = element.children[1];
        // 6 weeks is really old
        if (datum.days_since_update > 7 * 6) {
          dateElement.style.backgroundColor = BG_RED;
          // 2 weeks is kind of old
        } else if (datum.days_since_update > 7 * 2) {
          dateElement.style.backgroundColor = BG_YELLOW;
        }
      }
    });
    table.clearSort();
    return table;
  }

  async function updateSettingsAndTable() {
    await updateSettings();
    table.destroy();
    table = initTable();
    // TODO: reset component
    document.getElementById("search-box").value = "";
    results = itemData.length;
  }

  onMount(async () => {
    async function loadSearchItems() {
      let resp = await fetch("/api/v1/query/search_item_index");
      let data = await resp.json();
      itemsLastModified = new Date(
        resp.headers.get("last-modified")
      ).toISOString();
      itemData = data.map(obj => ({
        ...obj,
        days_since_update:
          moment().diff(moment(obj.search_item_timestamp), "days") || -1
      }));

      table = initTable();
      results = data.length;
      itemsReady = true;
      updateBoxplot();
    }

    tableSettings = { ...(await getSettings()) };
    await loadSearchItems();
  });
</script>

<div id="boxplot" />

{#if !itemsReady}
  <div style=" text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{:else}
  {#if settingsToggled}
    <button
      class="btn btn-primary"
      type="button"
      on:click={() => (settingsIsOpen = !settingsIsOpen)}>
      Settings
    </button>
  {/if}

  <span style="float:right">
    older than [
    <span style="background: {BG_YELLOW}">2 weeks</span>
    |
    <span style="background: {BG_RED}">6 weeks</span>
    ]
  </span>
  <TabulatorSearchBox
    {itemData}
    {table}
    keys={['search_item']}
    initialSort={[{ column: tableSettings.sortColumn, dir: tableSettings.sortDir }]} />
  <Collapse isOpen={settingsIsOpen} style="text-align: right">
    Default Sort:
    <select
      name="sort-column"
      id="sort-column"
      on:blur={updateSettingsAndTable}
      value={tableSettings.sortColumn}>
      {#each columns as column}
        <option value={column.field}>{column.title}</option>
      {/each}
    </select>
    <select
      name="sort-dir"
      id="sort-dir"
      on:blur={updateSettingsAndTable}
      value={tableSettings.sortDir}>
      {#each [{ value: 'desc', title: 'descending' }, { value: 'asc', title: 'ascending' }] as item}
        <option value={item.value}>{item.title}</option>
      {/each}
    </select>
    <br />
    Items per page:
    <select
      name="pagination-size"
      id="pagination-size"
      on:blur={updateSettingsAndTable}
      value={parseInt(tableSettings.paginationSize)}>
      {#each [5, 10, 20, 50, 100] as size}
        <option value={size}>{size}</option>
      {/each}
    </select>
  </Collapse>
{/if}

<div id="search_item_index" />
{#if itemsLastModified}
  <p style="text-align: right">
    <i>Last updated {itemsLastModified}</i>
    <br />
    <a
      href={'#'}
      on:click={async () => {
        settingsToggled = !settingsToggled;
        await updateSettings();
      }}>
      {settingsToggled ? 'hide settings' : 'show settings'}
    </a>
  </p>
{/if}
