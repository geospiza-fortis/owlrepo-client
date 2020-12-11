<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";

  onMount(async () => {
    let resp = await fetch("/api/v1/query/top_uploaders");
    let data = await resp.json();
    let table = new Tabulator("#top_uploaders", {
      data: data,
      layout: "fitColumns",
      columns: [
        { title: "Uploader Thumbprint", field: "client_thumbprint" },
        { title: "Uploads (last 7 days)", field: "n" }
      ]
    });
  });
</script>

<div id="top_uploaders" />
