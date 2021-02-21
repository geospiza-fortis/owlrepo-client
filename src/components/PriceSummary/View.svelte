<script>
  import { onMount } from "svelte";
  import moment from "moment";
  import Table from "../Table.svelte";
  import { Stretch } from "svelte-loading-spinners/src";
  import TabulatorSearchBox from "../TabulatorSearchBox.svelte";
  import { columns } from "./columns.js";
  import Settings from "./Settings.svelte";
  import Plot from "./Plot.svelte";

  let itemsReady = false;
  let itemsLastModified;

  let table;
  let itemData;

  let settings = {};

  let selectedRow;
  $: table && !selectedRow && (selectedRow = table.getRows("active")[0]);

  const BG_RED = "#ffaebf";
  const BG_ORANGE = "#ffc6ae";
  const BG_YELLOW = "#ffefae";

  let timeout;
  function debounce(func) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(), 500);
  }

  $: options = {
    responsiveLayout: "collapse",
    clipboard: "copy",
    clipboardCopyStyled: false,
    tooltipsHeader: true,
    pagination: "local",
    paginationSize: settings.paginationSize,
    initialSort: [{ column: settings.sortColumn, dir: settings.sortDir }],
    dataLoading: _ =>
      debounce(() => {
        selectedRow = null;
      }),
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
      itemsReady = true;
    }

    await loadSearchItems();
  });
</script>

<Plot {table} row={selectedRow} />

{#if !itemsReady}
  <div style=" text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{:else}
  <Settings bind:settings />
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
    initialSort={[{ column: settings.sortColumn, dir: settings.sortDir }]} />
{/if}

<Table bind:table data={itemData} {options} />

{#if itemsLastModified}
  <p style="text-align: right">
    <i>Last updated {itemsLastModified}</i>
    <br />
  </p>
{/if}
