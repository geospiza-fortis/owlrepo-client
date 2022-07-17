<script context="module">
  import { lastUpload } from "../../store.js";

  function refreshStorage(key, value = null) {
    if (value) {
      localStorage.setItem(key, value);
    }
    return localStorage.getItem(key);
  }

  export function refreshLastUpload(data_url = null, task_id = null) {
    lastUpload.set({
      img: refreshStorage("last-upload-data-url", data_url),
      task_id: refreshStorage("last-upload-task-id", task_id),
    });
  }
</script>

<script>
  import { onMount } from "svelte";

  onMount(() => {
    refreshLastUpload();
  });
</script>

<div id="last-upload">
  {#if $lastUpload.img && $lastUpload.task_id}
    <img src={$lastUpload.img} alt="first page of latest upload" />
    <a href={`/listing/${$lastUpload.task_id}`}>
      <i>Link to your most recent upload.</i>
    </a>
  {/if}
</div>
