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
</script>

<div>
  <p>Current directory: {screenshotPath}</p>
  <button on:click={askPath}>choose a directory</button>
</div>

<h2>listing</h2>
{#if isProcessing}
  <p>Processing images...</p>
{/if}
<div>
  {#if screenshots}
    <ul>
      {#each screenshots as path}
        <li>{path.datetime} - {path.mse}</li>
      {/each}
    </ul>
  {/if}
</div>
