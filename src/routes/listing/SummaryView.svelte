<script>
  import { onMount } from "svelte";
  import { groupBy } from "lodash-es";
  import SummaryElement from "./SummaryElement.svelte";

  let { flattened } = $props();
  let grouped = $state();
  let keys = $state();

  onMount(() => {
    grouped = groupBy(flattened, "item");
    keys = Object.keys(grouped);
  });
</script>

<div id="summary"></div>
{#if grouped}
  {#each keys as key}
    <SummaryElement {key} data={grouped[key]} />
  {/each}
{/if}
