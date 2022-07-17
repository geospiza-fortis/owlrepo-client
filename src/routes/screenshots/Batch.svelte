<script>
  import { invoke } from "@tauri-apps/api/tauri";
  import { batchPath, isProcessingBatch } from "./store.js";

  let batches = [];
  let current_batch = null;

  $: !$isProcessingBatch && listBatches();

  async function listBatches() {
    batches = await invoke("list_batches", {
      baseBatchPath: $batchPath,
    });
  }
</script>

<h2>Processed Screenshot Batches</h2>
{#if batches}
  <ul>
    {#each batches as batch}
      <li>
        <a
          href={"javascript:void(0)"}
          on:click={() => {
            current_batch = current_batch == batch.name ? null : batch.name;
          }}>{batch.datetime}</a
        >
        {#if current_batch == batch.name}
          <ul>
            {#each batch.items as item}
              <li>{item.datetime}</li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
