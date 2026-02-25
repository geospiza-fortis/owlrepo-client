<script>
  import { slide } from "svelte/transition";
  export let component;
  export let params;
  export let text;

  let open = false;
</script>

<div>
  <button class="btn btn-info" type="button" on:click={() => (open = !open)}>
    {text}
  </button>
</div>
<div>
  {#if open}
    <div transition:slide>
      <svelte:component this={component} bind:params />
    </div>
  {/if}
</div>

<style>
  div {
    padding-bottom: 1em;
  }
</style>
