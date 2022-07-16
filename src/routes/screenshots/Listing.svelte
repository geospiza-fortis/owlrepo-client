<script>
  import { readDir } from "@tauri-apps/api/fs";
  import { open } from "@tauri-apps/api/dialog";
  import { resolve, homeDir } from "@tauri-apps/api/path";
  import { onMount } from "svelte";

  let screenshotPath = null;

  onMount(async () => {
    let entries = await readDir("screenshots", "C://MapleLegendsHD");
    console.log(entries);
  });

  async function askPath() {
    let path = await open({
      directory: true,
      defaultPath: await resolve(
        await homeDir(),
        "..",
        "..",
        "MapleLegendsHD",
        "screenshots"
      ),
    });
    screenshotPath = path;
  }
</script>

<button on:click={askPath}>choose a directory</button>
