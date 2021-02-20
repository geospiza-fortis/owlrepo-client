<script>
  export let component;
  export let params;
  export let text;

  let open = false;
  $: console.log(open);
</script>

<details bind:open>
  <summary>
    <button class="btn btn-info" type="button" on:click={() => (open = !open)}>
      {text}
    </button>
  </summary>
  <br />
  <svelte:component this={component} bind:params />
</details>
<br />
