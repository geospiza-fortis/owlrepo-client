<script>
  import { open } from "@tauri-apps/api/dialog";
  import { screenshotPath, batchPath } from "./store.js";

  async function askPath(store, defaultPath) {
    let path = await open({
      directory: true,
      defaultPath: defaultPath,
    });
    if (!path) {
      return;
    }
    store.set(path);
  }
</script>

<h2>Settings</h2>

<div>
  <button
    id="screenshotPath"
    on:click={() => askPath(screenshotPath, $screenshotPath)}
    >Screenshot Directory</button
  >
  <label for="screenshotPath">{$screenshotPath}</label>
</div>

<div>
  <button id="batchPath" on:click={() => askPath(batchPath, $batchPath)}
    >Batch Directory</button
  >
  <label for="batchPath">{$batchPath}</label>
</div>
