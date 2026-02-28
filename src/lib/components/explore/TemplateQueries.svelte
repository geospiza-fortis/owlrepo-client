<script>
  import { createEventDispatcher } from "svelte";
  import { templates } from "./templates.js";

  const dispatch = createEventDispatcher();
  let open = false;

  function select(template) {
    dispatch("select", { sql: template.sql, chart: template.chart });
    open = false;
  }

  function handleWindowClick() {
    if (open) open = false;
  }
</script>

<svelte:window on:click={handleWindowClick} />

<div class="dropdown">
  <button
    class="btn btn-outline-secondary btn-sm dropdown-toggle"
    type="button"
    on:click|stopPropagation={() => (open = !open)}
  >
    Templates
  </button>
  <ul class="dropdown-menu" class:show={open}>
    {#each templates as template}
      <li>
        <button
          class="dropdown-item"
          on:click|stopPropagation={() => select(template)}
        >
          {template.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
