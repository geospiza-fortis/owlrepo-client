<script>
  import { onMount } from "svelte";
  import Table from "./Table.svelte";
  import localforage from "localforage";

  // from the guide colors
  const BG_GREEN = "#a3c3b0";

  let element;
  export let data;

  let contributor_id;

  $: options = {
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 5,
    columns: [
      { title: "Rank", field: "rank", width: 75 },
      {
        title: "Contributor ID",
        field: "contributor_id",
        formatter: (cell, formatterParams, onRendered) => {
          let value = cell.getValue();
          if (value == contributor_id) {
            let el = cell.getElement();
            el.style.backgroundColor = BG_GREEN;
            el.style.color = "#333";
          }
          return value;
        },
        widthGrow: 3
      },
      { title: "Contributions (all time)", field: "n" }
    ]
  };

  onMount(async () => {
    contributor_id = await localforage.getItem("contributor-id");
    let resp = await fetch("/api/v1/query/curation_top_contributors");
    data = await resp.json();
    // add rank to the data
    for (let i = 0; i < data.length; i++) {
      data[i].rank = i + 1;
    }
  });
</script>

<Table {data} {options} />
