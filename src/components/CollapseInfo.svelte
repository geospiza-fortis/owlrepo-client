<script>
  export let component;
  export let params;
  export let componentId;
  export let text;
  import { onMount } from "svelte";

  onMount(async () => {
    await import("bootstrap");
  });
</script>

{#if component}
  <p>
    <button
      class="btn btn-info"
      type="button"
      data-toggle="collapse"
      data-target="#{componentId}"
      aria-expanded="false"
      aria-controls="searchItemCollapse">
      {text}
    </button>
  </p>

  <div class="collapse" id={componentId}>
    <svelte:component this={component} bind:params />
  </div>
{/if}
