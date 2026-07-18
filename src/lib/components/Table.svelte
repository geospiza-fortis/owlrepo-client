<script>
  import { run } from "svelte/legacy";

  import Tabulator from "tabulator-tables";
  import "tabulator-tables/dist/css/tabulator_midnight.min.css";

  /**
   * @typedef {Object} Props
   * @property {any} [table]
   * @property {any} data
   * @property {any} [options]
   */

  /** @type {Props} */
  let { table = $bindable(null), data, options = {} } = $props();

  let element = $state();

  run(() => {
    element &&
      data &&
      options &&
      (table = new Tabulator(element, {
        data: data,
        layout: "fitDataFill",
        ...options,
      }));
  });
</script>

<div bind:this={element}></div>

<style>
  :global(.tabulator-row:nth-child(2n)) {
    background-color: #222;
  }
  :global(.tabulator-row-odd) {
    background-color: #333;
  }
</style>
