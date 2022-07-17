<script>
  import { invoke } from "@tauri-apps/api/tauri";
  import moment from "moment";
  import { updateScreenshots, getScreenshots } from "./storage.js";
  import { screenshotPath, batchPath, isProcessingBatch } from "./store.js";

  let screenshots = [];
  let isProcessing = true;
  let imageUri;

  // min date is 2016-04-01
  $: minDate = moment().subtract(54, "week").toISOString(true);
  // sets screenshots
  $: isProcessing &&
    $screenshotPath &&
    parseScreenshots($screenshotPath, minDate);
  $: owlScreenshots = screenshots.filter((s) => s.mse < 100);
  $: owlScreenshots.length && (imageUri = showImage(owlScreenshots[0]));

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

  async function showImage(screenshot) {
    console.log(screenshot);
    imageUri = await invoke("get_screenshot_uri", { screenshot: screenshot });
  }

  async function processBatch(owlScreenshots) {
    isProcessingBatch.set(true);
    await invoke("create_cropped_batch", {
      screenshots: owlScreenshots,
      baseBatchPath: $batchPath,
    });
    isProcessingBatch.set(false);
  }
</script>

<h2>Unprocessed Owl Screenshots</h2>

{#if isProcessing || $isProcessingBatch}
  <p>Processing images...</p>
{:else}
  <button on:click={() => (isProcessing = true)}>Reprocess screenshots</button>
  <button on:click={() => processBatch(owlScreenshots)}>Process Batch</button>
{/if}

<p>{owlScreenshots.length}/{screenshots.length} owl screenshots found</p>

<div class="container">
  <div class="row">
    <div class="col">
      {#if owlScreenshots}
        <ul>
          {#each owlScreenshots as path}
            <li on:click={() => showImage(path)}>
              <a href={"javascript:void(0)"}>{path.datetime}</a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="col">
      {#if imageUri}
        <img src={imageUri} alt="owl screenshot" />
      {/if}
    </div>
  </div>
</div>
