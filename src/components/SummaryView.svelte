<script>
  import { onMount } from "svelte";
  import groupBy from "lodash.groupby";
  import SummaryElement from "./SummaryElement.svelte";

  export let flattened;
  let grouped;
  let keys;

  onMount(() => {
    grouped = groupBy(flattened, "item");
    keys = Object.keys(grouped);
  });
</script>

<div id="summary" />
{#if grouped}
  {#each keys as key}
    <SummaryElement {key} data={grouped[key]} />
  {/each}
{/if}
