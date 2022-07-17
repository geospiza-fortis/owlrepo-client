<script>
  import { onMount } from "svelte";
  import LastUpload, { refreshLastUpload } from "./LastUpload.svelte";
  import {
    cropImage,
    dataURItoBlob,
    readDataAsync,
    readImageAsync,
  } from "../../image.js";
  import moment from "moment";
  import { requestUploadToken } from "../../token.js";
  import { parseFile, updatePersonalUploads } from "./uploader.js";

  export let files = [];

  let progress = 0;
  let total = 0;
  let error = 0;

  async function appendToFiles(filelist) {
    error = 0;
    total = filelist.length;
    for (let i = 0; i < filelist.length; i++) {
      progress = i;
      try {
        let file = filelist[i];
        let dataUrl = await readDataAsync(file);
        files.push(await parseFile(file.name, dataUrl));
      } catch (e) {
        console.log(e);
        error++;
      }
    }
    files = [...files];
    progress = total;
  }

  onMount(async () => {
    // https://stackoverflow.com/a/38968948
    // https://stackoverflow.com/a/6756680
    window.ondragover = window.ondragenter = (ev) => {
      ev.preventDefault();
    };

    window.ondrop = async (ev) => {
      ev.preventDefault();
      await appendToFiles(ev.dataTransfer.files);
    };

    window.onkeydown = (ev) => {
      //   console.log(ev.key);
      if (ev.key === "Delete") {
        // get the index of files that are selected
        files = files.filter((file) => !file.selected);
        console.log(files.map((e) => e.name));
        files = files;
      }
    };

    let fileInput = document.getElementById("fileInput");
    fileInput.onchange = async (ev) => {
      await appendToFiles(fileInput.files);
    };
  });

  async function handleSubmit(event) {
    event.preventDefault();
    let button = document.getElementById("upload-button");
    // TODO: disable more file uploads
    button.disabled = true;
    // ignore everything in the current form
    let formData = new FormData();
    // also include some other metadata
    formData.append(
      "metadata",
      JSON.stringify({
        // current timestamp in local timezone
        timestamp: moment().format(),
      })
    );
    let images = document.getElementById("screenshots").children;
    for (let i = 0; i < images.length; i++) {
      formData.append("file[]", dataURItoBlob(images[i].src), images[i].alt);
    }

    try {
      let token = await requestUploadToken();
      if (!token) {
        throw "got undefined upload token";
      }
      console.log(`Got access token ${token.access_token}`);
      let resp = await fetch(
        `${import.meta.env.VITE_OWLREPO_URL}/api/v1/upload`,
        {
          method: "post",
          headers: new Headers({
            Authorization: `Bearer ${token.access_token}`,
          }),
          body: formData,
        }
      );
      let data = await resp.json();

      let preview = files[0];
      files = [];
      progress = 0;
      error = 0;
      total = 0;
      // save a preview to local storage
      let cropped = await cropImage(preview.img, 35, 35 + 50, 10, 10 + 413);
      refreshLastUpload(cropped, data.task_id);
      await updatePersonalUploads(data.task_id);
    } catch (err) {
      console.log(err);
      // TODO: show an error at the top of the page
      button.disabled = false;
    }
  }
</script>

<form on:submit={handleSubmit}>
  <!-- Nice way to hide the text: https://stackoverflow.com/a/14806776 -->
  <input
    style="display: none;"
    type="file"
    accept="image/png"
    name="file[]"
    id="fileInput"
    multiple
  />
  <input style="display: none;" id="fileSubmit" type="submit" value="Upload" />
</form>

{#if total > 0}
  {#if progress < total}
    Processing {progress}/{total}
    {#if error}with {error} errors{/if}
    ...
  {:else}Processed {progress}/{total} with {error} errors.{/if}
{/if}

<div id="container">
  <div id="wrapper">
    <div id="filenames">
      <div id="filelist">
        {#each files as file, i}
          {#if file.selected}
            <mark>{file.name}</mark>
          {:else}{file.name}{/if}
          <br />
        {/each}
      </div>
      <div id="upload-button-container" class="container">
        <div class="row">
          <div class="col">
            <button
              class="btn btn-primary"
              onclick="document.getElementById('fileInput').click();"
            >
              Browse...
            </button>
          </div>
          {#if files.length > 0}
            <div class="col">
              <button
                id="upload-button"
                class="btn btn-primary"
                onclick="document.getElementById('fileSubmit').click();"
              >
                Upload
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div id="screenshots">
      {#each files as file, i}
        <img
          src={file.img}
          alt={file.name}
          class={file.selected ? "selected" : ""}
          on:click={() => (files[i].selected = !files[i].selected)}
        />
      {/each}
      {#if files.length == 0}
        <LastUpload />
      {/if}
    </div>
  </div>
</div>

<style>
  /* selected: https://stackoverflow.com/a/24693278 */
  img {
    /* border: solid 100px red; */
    margin: 5px;
  }
  .selected {
    box-shadow: 0px 12px 22px 1px #0066cc;
  }

  /* larger than main: https://stackoverflow.com/a/24895631 */
  #container {
    width: 800px;
    position: relative;
    left: calc(-400px + 50%);
  }

  #wrapper {
    display: flex;
  }

  /* sticky: https://stackoverflow.com/a/53832799
    parent of the filelist and upload-button
  */
  #filenames {
    position: -webkit-sticky;
    position: sticky;
    top: 10vh;
    max-height: 80vh;
    /* background-color: green; */
    flex: 1;
    margin: 0 auto;
    overflow-y: auto;
    text-align: center;
  }

  /* footer sticky: https://stackoverflow.com/a/50844284 */
  #upload-button-container {
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
    height: 60px;
    padding-top: 20px;
  }

  #screenshots {
    /* background-color: yellow; */
    text-align: center;
    flex: 1;
  }

  @media (max-width: 800px) {
    #container {
      width: 100%;
      left: 0;
    }
    #wrapper {
      flex-direction: column;
    }
    #filenames {
      width: 100%;
      top: 0;
      max-height: 40vh;
    }
    /* Otherwise the image will poke beyond the filename text. */
    #screenshots {
      overflow: hidden;
    }
  }
</style>
