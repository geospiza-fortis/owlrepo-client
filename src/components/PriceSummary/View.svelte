<script>
  import Table from "../Table.svelte";
  import SearchBox from "../SearchBox.svelte";
  import { Stretch } from "svelte-loading-spinners/src";
  import Settings from "./Settings.svelte";
  import Plot from "./Plot.svelte";

  import { columns } from "./columns.js";

  let table;

  export let itemData;
  export let last_modified;

  let settings = {};
  const initialSort = [{ column: "search_item_timestamp", dir: "desc" }];

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
    initialSort: initialSort,
    dataLoading: (_) =>
      debounce(() => {
        selectedRow = null;
      }),
    rowClick: (_, row) => (selectedRow = row),
    columns: columns,
    rowFormatter: (row) => {
      // http://tabulator.info/docs/4.0/format
      // https://www.colorhexa.com/ffc6ae
      let element = row.getElement();
      let datum = row.getData();

      // hard-coded based on the position we specify
      let dateElement = element.children[1];
      // 6 weeks is really old
      if (datum.days_since_update > 7 * 6) {
        dateElement.style.backgroundColor = BG_RED;
        dateElement.style.color = "#333";
        // 2 weeks is kind of old
      } else if (datum.days_since_update > 7 * 2) {
        dateElement.style.backgroundColor = BG_YELLOW;
        dateElement.style.color = "#333";
      }
    },
  };
</script>

<Plot {table} row={selectedRow} />

{#if !itemData}
  <div style=" text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{:else}
  <Settings bind:settings />
  <span style="float:right">
    older than [
    <span style="padding:0 3px; color: #333; background: {BG_YELLOW}">
      2 weeks
    </span>
    |
    <span style="padding:0 3px; color: #333; background: {BG_RED}">
      6 weeks
    </span>
    ]
  </span>
  <SearchBox {itemData} {table} keys={["search_item"]} {initialSort} />
{/if}

<Table bind:table data={itemData} {options} />

<p style="text-align: right">
  <i>Last updated {last_modified}</i>
  <br />
</p>
