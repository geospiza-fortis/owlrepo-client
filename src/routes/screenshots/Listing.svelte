<script>
  import { open } from "@tauri-apps/api/dialog";
  import { invoke } from "@tauri-apps/api/tauri";

  let screenshotPath = "C://MapleLegendsHD/Screenshots";
  let screenshots = [];
  $: screenshotPath &&
    invoke("list_screenshots", { path: screenshotPath }).then((res) => {
      screenshots = res;
    });
  $: console.log(screenshotPath, screenshots);

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

<div>
  {#if screenshots}
    <ul>
      {#each screenshots as path}
        <li>{path}</li>
      {/each}
    </ul>
  {/if}
</div>
