<script>
  import { slide } from "svelte/transition";
  let { component, params = $bindable(), text } = $props();

  let open = $state(false);
</script>

<div>
  <button class="btn btn-info" type="button" onclick={() => (open = !open)}>
    {text}
  </button>
</div>
<div>
  {#if open}
    {@const SvelteComponent = component}
    <div transition:slide>
      <SvelteComponent bind:params />
    </div>
  {/if}
</div>

<style>
  div {
    padding-bottom: 1em;
  }
</style>
