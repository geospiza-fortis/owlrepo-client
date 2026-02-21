<script lang="ts">
  export let header = "";
  export let body = "";
  export let onClick = () => {};

  let open = false;
  const toggle = () => (open = !open);
</script>

<button class="btn btn-warning" on:click={toggle}>{header}</button>

{#if open}
  <div class="modal d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{header}</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={toggle}></button>
        </div>
        <div class="modal-body">
          <p>{body}</p>
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-primary"
            on:click={() => {
              toggle();
              onClick();
            }}>Yes</button
          >
          <button class="btn btn-secondary" on:click={toggle}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show"></div>
{/if}
