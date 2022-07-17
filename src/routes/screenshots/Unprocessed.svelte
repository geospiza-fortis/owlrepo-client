<script>
  import { invoke } from "@tauri-apps/api/tauri";
  import moment from "moment";
  import {
    updateScreenshots,
    getScreenshots,
    deleteScreenshots,
  } from "./storage.js";
  import {
    screenshotPath,
    batchPath,
    isProcessingBatch,
    trashOnProcessing,
    shouldPruneProcessed,
  } from "./store.js";
  import BatchView from "./BatchView.svelte";
  import { extractName } from "./utils.js";
  import PruneProcessed from "./PruneProcessed.svelte";

  let screenshots = [];
  let batchedScreenshots = [];
  let isProcessing = true;
  $: $isProcessingBatch = false;
  $: $shouldPruneProcessed = false;

  // min date is 2016-04-01
  $: minDate = moment().subtract(52, "week").toISOString(true);
  // sets screenshots
  $: isProcessing && listBatchScreenshots($batchPath);
  $: isProcessing && parseScreenshots($screenshotPath, minDate);
  $: batchedScreenshotNames = batchedScreenshots.map((s) => extractName(s));
  $: unprocessedScreenshots = screenshots.filter(
    (s) => s.mse < 100 && !batchedScreenshotNames.includes(extractName(s))
  );
  $: processedScreenshots = screenshots.filter(
    (s) => s.mse < 100 && batchedScreenshotNames.includes(extractName(s))
  );
  $: $shouldPruneProcessed && pruneProcessed(processedScreenshots);

  /// parse the screenshots in a large loop, to provide incremental progress and
  /// to avoid extra computation
  async function parseScreenshots(screenshotPath, minDate) {
    screenshots = await getScreenshots();
    let res = [];
    do {
      res = await invoke("list_screenshots", {
        path: screenshotPath,
        limit: 8,
        minDate: minDate,
        excludeNames: screenshots.map((s) => s.name),
      });
      await updateScreenshots(res);
      screenshots = [...(await getScreenshots())];
    } while (res.length > 0);

    isProcessing = false;
  }

  async function listBatchScreenshots(batchPath) {
    let batches = await invoke("list_batches", {
      baseBatchPath: batchPath,
    });
    batchedScreenshots = batches.flatMap((b) => b.items);
    console.log(batchedScreenshots);
  }

  async function pruneProcessed(processedScreenshots) {
    if (!$shouldPruneProcessed) {
      console.log("skipping prune");
      return;
    }
    await invoke("trash_screenshots", {
      screenshots: processedScreenshots,
    });
    await deleteScreenshots(processedScreenshots);
    $shouldPruneProcessed = false;
    isProcessing = true;
  }

  async function processBatch(unprocessedScreenshots) {
    $isProcessingBatch = true;
    await invoke("create_cropped_batch", {
      screenshots: unprocessedScreenshots,
      baseBatchPath: $batchPath,
      shouldDelete: $trashOnProcessing,
    });
    $isProcessingBatch = false;
    isProcessing = true;
  }
</script>

<h2>Unprocessed Owl Screenshots</h2>

{#if isProcessing || $isProcessingBatch || $shouldPruneProcessed}
  <p>Processing images...</p>
{:else}
  <button class="btn btn-primary" on:click={() => (isProcessing = true)}
    >Reprocess screenshots</button
  >
  {#if unprocessedScreenshots.length > 0}
    <button
      class="btn btn-primary"
      on:click={() => processBatch(unprocessedScreenshots)}
      >Process Batch</button
    >
  {/if}
  {#if processedScreenshots.length > 0}
    <PruneProcessed />
  {/if}
{/if}

<p>
  {unprocessedScreenshots.length}/{screenshots.length} unprocessed owl(s),
  {processedScreenshots.length}/{screenshots.length} processed owl(s),
  {screenshots.length -
    unprocessedScreenshots.length -
    processedScreenshots.length}/{screenshots.length} other screenshots
</p>

<BatchView screenshots={unprocessedScreenshots} />
