<script>
  import { invoke } from "@tauri-apps/api/tauri";
  import { batchPath, isProcessingBatch } from "./store.js";
  import Uploader from "../../components/uploader/Uploader.svelte";
  import { parseFile } from "../../components/uploader/uploader.js";
  import BatchView from ".//BatchView.svelte";

  let batches = [];
  let current_batch = null;
  let files = [];

  $: !$isProcessingBatch && listBatches();

  async function listBatches() {
    batches = await invoke("list_batches", {
      baseBatchPath: $batchPath,
    });
  }
  async function triggerUpload(batch) {
    let res = [];
    for (let screenshot of batch.items) {
      let dataUri = await invoke("get_screenshot_uri", {
        screenshot: screenshot,
      });
      let name = /MapleLegends[_ ](.*).png/.exec(screenshot.name)[0];
      let item = await parseFile(name, dataUri);
      res.push(item);
      console.log(item);
    }
    files = [...res];
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
            current_batch = current_batch == batch ? null : batch;
          }}>{batch.datetime}</a
        >
        <button on:click={() => triggerUpload(batch)}>Upload to OwlRepo</button>
        {#if current_batch && current_batch.name == batch.name}
          <BatchView screenshots={batch.items} />
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<h2>Upload Screenshots</h2>
<Uploader {files} />
