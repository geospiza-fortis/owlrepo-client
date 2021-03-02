<script>
  import { onMount } from "svelte";
  import Table from "./Table.svelte";
  import { getThumbprint } from "../token.js";

  // from the guide colors
  const BG_GREEN = "#a3c3b0";

  let data;
  let client_thumbprint;

  $: options = {
    layout: "fitColumns",
    columns: [
      { title: "Rank", field: "rank", width: 75 },
      {
        title: "Uploader Thumbprint",
        field: "client_thumbprint",
        formatter: (cell, formatterParams, onRendered) => {
          let value = cell.getValue();
          if (value == client_thumbprint) {
            let el = cell.getElement();
            el.style.backgroundColor = BG_GREEN;
            el.style.color = "#333";
            // bold looks a bit weird
            // el.style.fontWeight = "bold";
          }
          return value;
        },
        widthGrow: 3,
      },
      { title: "Uploads (last 7 days)", field: "n" },
    ],
  };

  onMount(async () => {
    client_thumbprint = await getThumbprint();

    let resp = await fetch("/api/v1/query/top_uploaders");
    data = await resp.json();
    // add rank to the data
    for (let i = 0; i < data.length; i++) {
      data[i].rank = i + 1;
    }
  });
</script>

<Table {data} {options} />
