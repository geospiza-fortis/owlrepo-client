<script>
  import { open } from "@tauri-apps/api/dialog";
  import { invoke } from "@tauri-apps/api/tauri";
  import moment from "moment";
  import { updateScreenshots, getScreenshots } from "./storage.js";

  let screenshotPath = "C://MapleLegendsHD/Screenshots";
  let screenshots = [];
  let isProcessing = true;

  // min date is 2016-04-01
  $: minDate = moment().subtract(54, "week").toISOString(true);
  // sets screenshots
  $: screenshotPath && parseScreenshots(screenshotPath, minDate);
  $: owlScreenshots = screenshots.filter((s) => s.mse < 100);
  $: imageUri = showImage(owlScreenshots[0]);

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

  async function askPath() {
    let path = await open({
      directory: true,
      defaultPath: screenshotPath,
    });
    if (!path) {
      return;
    }
    screenshotPath = path;
  }

  async function showImage(screenshot) {
    imageUri = await invoke("get_screenshot_uri", { screenshot: screenshot });
  }
</script>

<div>
  <button on:click={askPath}>choose a directory</button>
  <p>Current directory: {screenshotPath}</p>
</div>

<h2>owl listing</h2>
{#if isProcessing}
  <p>Processing images...</p>
{/if}

<p>{owlScreenshots.length}/{screenshots.length} owl screenshots found</p>

<div class="container">
  <div class="row">
    <div class="col">
      {#if owlScreenshots}
        <ul>
          {#each owlScreenshots as path}
            <li on:click={() => showImage(path)}>
              <a href={""}>{path.datetime}</a>
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
