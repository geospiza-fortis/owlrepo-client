<script lang="ts">
  interface Props {
    header?: string;
    body?: string;
    onClick?: any;
  }

  let { header = "", body = "", onClick = () => {} }: Props = $props();

  let open = $state(false);
  const toggle = () => {
    open = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
</script>

<button class="btn btn-warning" onclick={toggle}>{header}</button>

{#if open}
  <div class="modal d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{header}</h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            onclick={toggle}
          ></button>
        </div>
        <div class="modal-body">
          <p>{body}</p>
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-primary"
            onclick={() => {
              toggle();
              onClick();
            }}>Yes</button
          >
          <button class="btn btn-secondary" onclick={toggle}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop show"></div>
{/if}
