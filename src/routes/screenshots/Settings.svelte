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
  });
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

<div>
  <input
    type="checkbox"
    id="trashOnProcessing"
    bind:checked={$trashOnProcessing}
  />
  <label for="trashOnProcessing">Trash on processing</label>
</div>
