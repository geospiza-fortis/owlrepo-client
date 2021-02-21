<script>
  import { onMount } from "svelte";
  import moment from "moment";
  import Table from "../Table.svelte";
  import Plot from "../Plot.svelte";
  import { Stretch } from "svelte-loading-spinners/src";
  import TabulatorSearchBox from "../TabulatorSearchBox.svelte";
  import { columns } from "./columns.js";
  import Settings from "./Settings.svelte";

  let itemsReady = false;
  let itemsLastModified;

  let table;
  let itemData;
  let results;

  let tableSettings = {};
  let settingsToggled = false;

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_YELLOW = "#ffefae";

  // TODO: refactor
  let selectedRow;
  let layout;
  $: table && !selectedRow && (selectedRow = table.getRows("active")[0]);
  $: selectedRow &&
    (layout = {
      title: selectedRow.getData().search_item,
      height: 150,
      margin: {
        l: 0,
        r: 0,
        b: 25,
        t: 25
      }
    }) &&
    trackEvent(table, selectedRow);

  function transformPlot(data) {
    let r = data;
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
        orientation: "h"
      }
    ];
  }

  // we also keep some analytics in this function, since clicking on a row
  // after searching indicates that the search needs to be reweighted. This
  // is something that can be done with some real world usage.
  function trackEvent(table, row) {
    if (!document.getElementById("search-box").value.length) {
      // nothing to report...
      return;
    }

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
      event_label: row.search_item,
      list_head: first.search_item,
      list_position: row.getPosition(true)
    };
    gtag("event", "boxplot_click", event_data);
    if (process.env.NODE_ENV == "development") {
      console.log(event_data);
    }
  }

  $: options = {
    responsiveLayout: "collapse",
    clipboard: "copy",
    clipboardCopyStyled: false,
    tooltipsHeader: true,
    pagination: "local",
    paginationSize: tableSettings.paginationSize,
    initialSort: [
      { column: tableSettings.sortColumn, dir: tableSettings.sortDir }
    ],
    rowClick: (_, row) => (selectedRow = row),
    columns: columns,
    rowFormatter: row => {
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
  };

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

      results = data.length;
      itemsReady = true;
    }

    await loadSearchItems();
  });
</script>

{#if selectedRow}
  <Plot data={selectedRow.getData()} transform={transformPlot} {layout} />
{/if}

{#if !itemsReady}
  <div style=" text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{:else}
  <Settings bind:settings={tableSettings} bind:toggle={settingsToggled} />
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
{/if}

<Table bind:table data={itemData} {options} />

{#if itemsLastModified}
  <p style="text-align: right">
    <i>Last updated {itemsLastModified}</i>
    <br />
    <a href={'#'} on:click={() => (settingsToggled = !settingsToggled)}>
      {settingsToggled ? 'hide settings' : 'show settings'}
    </a>
  </p>
{/if}
