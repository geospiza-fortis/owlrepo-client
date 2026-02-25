<script>
  import { invoke } from "@tauri-apps/api/tauri";
  import { batchPath, isProcessing, isProcessingBatch } from "./store.js";
  import Uploader from "$lib/components/uploader/Uploader.svelte";
  import { parseFile } from "$lib/components/uploader/uploader.js";
  import BatchView from ".//BatchView.svelte";
  import { extractName } from "./utils.js";
  import localforage from "localforage";
  import moment from "moment";

  let batches = [];
  let current_batch = null;

  let files = [];
  let batch_id = null;
  let uploadsWithBatch = {};

  $: !$isProcessingBatch && listBatches();

  async function listBatches() {
    batches = await invoke("list_batches", {
      baseBatchPath: $batchPath,
    });

    // also get the uploads
    let uploads = (await localforage.getItem("personal-uploads")) || [];
    uploadsWithBatch = Object.fromEntries(
      uploads.filter((u) => u.batch_id).map((u) => [u.batch_id, u])
    );
  }
  async function triggerUpload(batch) {
    let res = [];
    // perform getting uri's in batch since it's parallelized
    let dataUris = await invoke("get_screenshot_uri_batch", {
      screenshots: batch.items,
    });
    for (let [i, screenshot] of batch.items.entries()) {
      let item = await parseFile(extractName(screenshot), dataUris[i]);
      res.push(item);
      console.log(item);
    }
    files = [...res];
    batch_id = batch.datetime;
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
            // personally not a fan of this logic
            current_batch = current_batch == batch ? null : batch;
          }}>{batch.datetime} ({moment(batch.datetime).fromNow()})</a
        >
        {#if uploadsWithBatch[batch.datetime]}
          <a href={`/listing/${uploadsWithBatch[batch.datetime].task_id}`}
            ><span class="badge badge-success"
              >Uploaded: {uploadsWithBatch[batch.datetime].task_id}</span
            ></a
          >
          <button class="btn btn-warning" on:click={() => triggerUpload(batch)}
            >Reupload to OwlRepo</button
          >
        {:else}
          <button class="btn btn-primary" on:click={() => triggerUpload(batch)}
            >Upload to OwlRepo</button
          >
        {/if}
        {#if current_batch && current_batch.name == batch.name}
          <BatchView screenshots={batch.items} />
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<h2>Upload Screenshots</h2>
{#if uploadsWithBatch[batch_id]}
  <div class="alert alert-warning" role="alert">
    You have already uploaded this batch to <a
      href={`/listing/${uploadsWithBatch[batch_id].task_id}`}
    >
      {uploadsWithBatch[batch_id].task_id}</a
    >
  </div>
{/if}
<Uploader
  {files}
  {batch_id}
  disableExternalUpload={true}
  onUpload={async () => {
    $isProcessing = true;
    await listBatches();
    files = [];
    batch_id = null;
  }}
/>
