<script>
  import { onMount } from "svelte";
  import LastUpload, { refreshLastUpload } from "./LastUpload.svelte";
  import {
    cropImage,
    resizeImage,
    readDataAsync,
    readImageAsync,
    dataURItoBlob,
    validateOwl
  } from "../image.js";
  import moment from "moment";
  import localforage from "localforage";
  import { requestUploadToken, getThumbprint } from "../token.js";

  let files = [];

  let progress = 0;
  let total = 0;
  let error = 0;

  function validateFilename(filename) {
    let re = /MapleLegends[_ ](.*).png/;
    let results = re.exec(filename);
    if (!results || results.length != 2) {
      // does not match
      return false;
    }
    let date = moment(results[1].replace(/_/g, " "), "DD-MM-YYYY hh-mm-ss");
    // we could just end it with date.isValid...
    // Start of MapleLegends was April 1, 2020
    return date.isBetween(moment("2015-04-01"), moment().add(1, "day"));
  }

  function validateFilenameMac(filename) {
    let re = /Screen[ _]Shot[_ ](.*).png/;
    let results = re.exec(filename);
    if (!results || results.length != 2) {
      return false;
    }
    let date = moment(
      results[1].replace(/_/g, " "),
      "YYYY-MM-DD at hh.mm.ss A"
    );
    return date.isBetween(moment("2015-04-01"), moment().add(1, "day"));
  }

  async function updatePersonalUploads(task_id) {
    // This key is used in multiple places
    let uploads = (await localforage.getItem("personal-uploads")) || [];
    uploads.push({ task_id: task_id, timestamp: moment().format() });
    await localforage.setItem("personal-uploads", uploads);
  }

  onMount(async () => {
    async function appendToFiles(filelist) {
      error = 0;
      total = filelist.length;
      for (let i = 0; i < filelist.length; i++) {
        progress = i;
        let file = filelist[i];
        if (!validateFilename(file.name) && !validateFilenameMac(file.name)) {
          console.error(`${file.name}: bad filename`);
          error += 1;
          continue;
        }

        let dataUrl = await readDataAsync(file);
        let uncropped = await readImageAsync(dataUrl);
        let cropDim;
        let getDim = (x, y) => {
          return [x, x + 380, y, y + 435];
        };
        if (uncropped.height == 600 && uncropped.width == 800) {
          cropDim = getDim(131, 182);
        } else if (uncropped.height == 768 && uncropped.width == 1024) {
          cropDim = getDim(215, 294);
        } else if (uncropped.height == 768 && uncropped.width == 1366) {
          cropDim = getDim(215, 465);
        } else if (uncropped.height == 380 && uncropped.width == 435) {
          cropDim = getDim(0, 0);
        } else if (uncropped.height % 734 == 0 && uncropped.width % 912 == 0) {
          if (uncropped.width != 912) {
            dataUrl = await resizeImage(dataUrl, 912, 734);
          }
          // if the resize is a no-op, then add a 6 pixel offset for whatever
          // reason. See the notebook for details on cropping.
          cropDim = getDim(185 + (uncropped.width == 912 ? 6 : 0), 238);
        } else {
          console.error(`${file.name}: bad dimensions for file`);
          error += 1;
          continue;
        }

        let img = await cropImage(dataUrl, ...cropDim);
        if (!(await validateOwl(img))) {
          console.log(img);
          console.error(`${file.name}: bad image`);
          error += 1;
          continue;
        }
        files.push({ img: img, name: file.name, selected: false });
      }
      files = files;
      progress = total;
    }

    // https://stackoverflow.com/a/38968948
    // https://stackoverflow.com/a/6756680
    window.ondragover = window.ondragenter = ev => {
      ev.preventDefault();
    };

    window.ondrop = async ev => {
      ev.preventDefault();
      await appendToFiles(ev.dataTransfer.files);
    };

    window.onkeydown = ev => {
      //   console.log(ev.key);
      if (ev.key === "Delete") {
        // get the index of files that are selected
        files = files.filter(file => !file.selected);
        console.log(files.map(e => e.name));
        files = files;
      }
    };

    let fileInput = document.getElementById("fileInput");
    fileInput.onchange = async ev => {
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
        timestamp: moment().format()
      })
    );
    let images = document.getElementById("screenshots").children;
    for (let i = 0; i < images.length; i++) {
      formData.append("file[]", dataURItoBlob(images[i].src), images[i].alt);
    }

    try {
      let token = await requestUploadToken();
      console.log(`Got access token ${token.access_token}`);
      let resp = await fetch("/api/v1/upload", {
        method: "post",
        headers: new Headers({
          Authorization: `Bearer ${token.access_token}`
        }),
        body: formData
      });
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
  }

  /* divider https://stackoverflow.com/a/5119860 */
  .divider {
    width: 120px;
    height: auto;
    display: inline-block;
  }

  #upload-button {
    margin-top: 15px;
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

<form on:submit={handleSubmit}>
  <!-- Nice way to hide the text: https://stackoverflow.com/a/14806776 -->
  <input
    style="display: none;"
    type="file"
    accept="image/png"
    name="file[]"
    id="fileInput"
    multiple />
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
      <div id="upload-button-container">
        <button onclick="document.getElementById('fileInput').click();">
          Browse...
        </button>
        {#if files.length > 0}
          <div class="divider" />
          <button
            id="upload-button"
            onclick="document.getElementById('fileSubmit').click();">
            Upload
          </button>
        {/if}

      </div>
    </div>

    <div id="screenshots">
      {#each files as file, i}
        <img
          src={file.img}
          alt={file.name}
          class={file.selected ? 'selected' : ''}
          on:click={() => (files[i].selected = !files[i].selected)} />
      {/each}
      {#if files.length == 0}
        <LastUpload />
      {/if}
    </div>
  </div>
</div>
