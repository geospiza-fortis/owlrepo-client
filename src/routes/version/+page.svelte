<script>
  import Table from "../../components/Table.svelte";
  import { browser } from "$app/environment";
  let status_data = null;
  $: browser &&
    fetch("/api/v2/status")
      .then((resp) => resp.json())
      .then((data) => {
        status_data = Object.entries(data).map(([key, value]) => {
          return {
            key: key,
            value: value,
          };
        });
      });
</script>

<h1>Version</h1>

{#if status_data}
  <Table
    data={status_data}
    options={{ autoColumns: true, layout: "fitData" }}
  />
{/if}
