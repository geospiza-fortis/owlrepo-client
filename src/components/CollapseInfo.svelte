<script>
  export let component;
  export let params;
  export let text;
  import { Collapse } from "sveltestrap";

  let open = false;
</script>

<div>
  <button class="btn btn-info" type="button" on:click={() => (open = !open)}>
    {text}
  </button>
</div>
<div>
  <Collapse isOpen={open}>
    <svelte:component this={component} bind:params />
  </Collapse>
</div>

<style>
  div {
    padding-bottom: 1em;
  }
</style>
