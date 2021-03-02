<script>
  import Tabulator from "tabulator-tables";
  import "tabulator-tables/dist/css/tabulator_midnight.min.css";

  export let table = null;
  export let data;
  export let options = {};

  let element;

  $: element &&
    data &&
    options &&
    (table = new Tabulator(element, {
      data: data,
      layout: "fitDataFill",
      ...options,
    }));
</script>

<div bind:this={element} />

<style>
  :global(.tabulator-row:nth-child(2n)) {
    background-color: #222;
  }
  :global(.tabulator-row-odd) {
    background-color: #333;
  }
</style>
