<script>
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
    <svelte:component this={component} bind:params />
  {/if}
</div>

<style>
  div {
    padding-bottom: 1em;
  }
</style>
