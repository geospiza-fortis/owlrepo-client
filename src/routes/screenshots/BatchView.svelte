<script>
  import { invoke } from "@tauri-apps/api/tauri";
  import moment from "moment";

  export let screenshots = [];
  let imageUri;
  $: screenshots.length ? showImage(screenshots[0]) : (imageUri = null);

  async function showImage(screenshot) {
    let newUri = await invoke("get_screenshot_uri", { screenshot: screenshot });
    if (newUri == imageUri) {
      return;
    }
    imageUri = newUri;
  }
</script>

<div class="container">
  <div class="row">
    <div class="col">
      <ul>
        {#each screenshots as path}
          <li on:click={() => showImage(path)}>
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
