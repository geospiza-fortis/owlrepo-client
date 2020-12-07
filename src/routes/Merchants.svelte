<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import TabulatorSearchBox from "../components/TabulatorSearchBox.svelte";

  let summaryTable;
  let initialSort = [{ column: "num_listed", dir: "desc" }];
  let data;
  let summaryData;

  let merchantTable;
  let merchantId;

  onMount(async () => {
    let resp = await fetch("/api/v1/query/sellers");
    data = await resp.json();
    summaryData = data.map(x => ({
      id: x.id,
      num_listed: x.items.length
    }));

    summaryTable = new Tabulator("#summaryTable", {
      data: summaryData,
      layout: "fitColumns",
      pagination: "local",
      paginationSize: 5,
      rowClick: (e, row) => {
        merchantId = row.getData().id;
        updateMerchantTable(merchantId);
      },
      initialSort: initialSort,
      columns: [
        {
          title: "Merchant Name",
          field: "id"
        },
        {
          title: "# Listed Items",
          field: "num_listed"
        }
      ]
    });
  });

  function updateMerchantTable(merchantId) {
    if (merchantTable) {
      merchantTable.destroy();
    }
    let merchantData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === merchantId) {
        merchantData = data[i].items;
      }
    }
    merchantTable = new Tabulator("#merchantTable", {
      data: merchantData,
      layout: "fitColumns",
      pagination: "local",
      paginationSize: 10,
      initialSort: [{ column: "timestamp", dir: "desc" }],
      autoColumns: true
    });
  }
</script>

<h1>Merchants</h1>

<p>
  This lists all merchants across owl searches. Click on a row to list more
  details.
</p>

{#if data}
  <TabulatorSearchBox
    itemData={summaryData}
    table={summaryTable}
    keys={['id']}
    {initialSort} />
{/if}
<div id="summaryTable" />
<br />

{#if merchantId}
  <h2>Results for {merchantId}</h2>
{/if}
<div id="merchantTable" />
