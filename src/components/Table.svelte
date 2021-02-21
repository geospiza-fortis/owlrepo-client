<script>
  import Tabulator from "tabulator-tables";
  import "tabulator-tables/dist/css/tabulator.min.css";

  export let table = null;
  export let data;
  export let options = {};

  let element;

  $: data &&
    options &&
    (table = new Tabulator(element, {
      data: data,
      layout: "fitDataFill",
      ...options
    }));
</script>

<div bind:this={element} />
