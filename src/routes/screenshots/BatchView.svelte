<script>
  import { run } from "svelte/legacy";

  import { invoke } from "@tauri-apps/api/tauri";
  import moment from "moment";

  let { screenshots = [] } = $props();
  let imageUri = $state();

  async function showImage(screenshot) {
    let newUri = await invoke("get_screenshot_uri", { screenshot: screenshot });
    if (newUri == imageUri) {
      return;
    }
    imageUri = newUri;
  }
  run(() => {
    screenshots.length ? showImage(screenshots[0]) : (imageUri = null);
  });
</script>

<div class="container">
  <div class="row">
    <div class="col">
      <ul>
        {#each screenshots as path}
          <li onclick={() => showImage(path)}>
            <a href={"javascript:void(0)"}
              >{path.datetime} ({moment(path.datetime).fromNow()})</a
            >
          </li>
        {/each}
      </ul>
    </div>

    <div class="col">
      {#if imageUri}
        <img src={imageUri} alt="owl screenshot" />
      {/if}
    </div>
  </div>
</div>
