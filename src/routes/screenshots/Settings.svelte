<script>
  import { open } from "@tauri-apps/api/dialog";
  import { screenshotPath, batchPath, trashOnProcessing } from "./store.js";
  import localforage from "localforage";
  import { onMount } from "svelte";

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

  onMount(async () => {
    let val = await localforage.getItem("screenshots:trashOnProcessing");
    $trashOnProcessing = val == null ? true : val;
    trashOnProcessing.subscribe(async (value) => {
      await localforage.setItem("screenshots:trashOnProcessing", value);
    });

    $screenshotPath =
      (await localforage.getItem("screenshots:screenshotPath")) ||
      $screenshotPath;
    screenshotPath.subscribe(async (value) => {
      await localforage.setItem("screenshots:screenshotPath", value);
    });

    $batchPath =
      (await localforage.getItem("screenshots:batchPath")) || $batchPath;
    batchPath.subscribe(async (value) => {
      await localforage.setItem("screenshots:batchPath", value);
    });
  });
</script>

<h2>Settings</h2>

<div>
  <button
    id="screenshotPath"
    class="btn btn-primary"
    on:click={() => askPath(screenshotPath, $screenshotPath)}
    >Screenshot Directory</button
  >
  <label for="screenshotPath">{$screenshotPath}</label>
</div>

<div>
  <button
    class="btn btn-primary"
    id="batchPath"
    on:click={() => askPath(batchPath, $batchPath)}>Batch Directory</button
  >
  <label for="batchPath">{$batchPath}</label>
</div>

<div>
  <input
    type="checkbox"
    id="trashOnProcessing"
    bind:checked={$trashOnProcessing}
  />
  <label for="trashOnProcessing"
    >Move processed screenshots to the recycling bin</label
  >
</div>
