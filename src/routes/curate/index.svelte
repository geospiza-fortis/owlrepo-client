<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import localforage from "localforage";
  import { v4 as uuid4 } from "uuid";
  import levenshtein from "fast-levenshtein";
  import stringify from "json-stable-stringify";
  import { diffWords } from "diff";
  import { validate } from "jsonschema";
  import TopContributors from "../../components/TopContributors.svelte";
  import { schema } from "./schema";

  let contributor_id;
  let show_candidates = false;
  let data;
  let top_contributors_data;

  $: total_contributions = top_contributors_data
    ? top_contributors_data.map(x => x.n).reduce((a, b) => a + b)
    : 0;

  let task_data;
  let task_old_entries;
  let task_start;
  let task_table;
  let is_missing_rows = false;

  let task_diff;
  let task_diff_table;
  let task_validator;

  onMount(async () => {
    let resp = await fetch("/api/v1/query/curation_candidate");
    data = await resp.json();

    contributor_id = await localforage.getItem("contributor-id");
    if (!contributor_id) {
      contributor_id = uuid4();
      console.log(`setting new contributor id: ${contributor_id}`);
      await localforage.setItem("contributor-id", contributor_id);
    }

    if (show_candidates) {
      candidate = new Tabulator("#candidate", {
        data: data,
        autoColumns: true
      });
    }
  });

  async function fetchTask(task_id, screenshot_sha1) {
    // NOTE: don't actually need the screenshot name
    let base = `/api/v1/data/${task_id}`;
    let resp = await fetch(`${base}/slim.json`);
    let slim = await resp.json();

    // this code is awful, imo
    let i = 0;
    for (; i < slim.payload.length; i++) {
      if (slim.payload[i].screenshot.sha1 === screenshot_sha1) {
        break;
      }
    }
    if (i == slim.payload.length) {
      console.log(`could not find ${screenshot_sha1} in ${task_id}`);
      return;
    }
    task_data = {
      task_id: task_id,
      screenshot_sha1: screenshot_sha1,
      entries: slim.payload[i].body.entries,
      screenshot_url: `${base}/raw/${slim.payload[i].screenshot.name}`
    };
    task_old_entries = JSON.parse(stringify(task_data.entries));
    task_table = new Tabulator("#transcribed", {
      data: task_data.entries,
      columns: [
        { title: "id", field: "id", editor: "input" },
        { title: "store_name", field: "store_name", editor: "input" },
        {
          title: "bundle",
          field: "bundle",
          editor: "number",
          editorParams: { min: 1, max: 200 }
        },
        {
          title: "price",
          field: "price",
          editor: "number",
          editorParams: { min: 1 }
        },
        {
          title: "quantity",
          field: "quantity",
          editor: "number",
          editorParams: { min: 1, max: 200 }
        }
      ]
    });
    task_start = new Date();
  }

  async function requestTask() {
    // task is picked randomly
    if (!data) {
      console.log("candidate data is not ready yet");
      return;
    }
    let task = data[Math.floor(Math.random() * data.length)];
    await fetchTask(task.task_id, task.screenshot_sha1);
  }

  async function updatePersonalCurations(task_id, screenshot_sha1) {
    // This key is used in multiple places
    let uploads = (await localforage.getItem("personal-curations")) || [];
    uploads.push({
      timestamp: new Date().toISOString(),
      task_id: task_id,
      screenshot_sha1: screenshot_sha1
    });
    await localforage.setItem("personal-curations", uploads);
  }

  async function diffTask() {
    let old = stringify(task_old_entries);
    let mod = stringify(task_table.getData());
    let distance = levenshtein.get(old, mod);
    let diff = diffWords(old, mod).map(entry => ({
      count: entry.count,
      type: entry.removed ? "removed" : entry.added ? "added" : "unchanged",
      value: entry.value
    }));
    task_diff = {
      characters: diff,
      distance: distance
    };
    console.log(task_diff);
    if (!distance) {
      if (task_diff_table) {
        task_diff_table.destroy();
      }
      return;
    }
    task_diff_table = new Tabulator("#task_diff", {
      data: diff,
      autoColumns: true
    });
  }

  async function submitTask() {
    let submission = {
      submission_timestamp: new Date().toISOString(),
      request_timestamp: task_start.toISOString(),
      contributor_id: contributor_id,
      task_id: task_data.task_id,
      screenshot_sha1: task_data.screenshot_sha1,
      payload: {
        entries: task_table.getData(),
        is_missing_rows: is_missing_rows
      },
      diff: task_diff
    };
    task_validator = validate(submission, schema);
    if (!task_validator.valid) {
      console.log(task_validator);
      return;
    }
    let resp = await fetch("/api/v1/submit_curate_task", {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submission),
      method: "post"
    });
    if (resp.status == 200) {
      await updatePersonalCurations(
        task_data.task_id,
        task_data.screenshot_sha1
      );
      task_data = null;
      task_start = null;
      task_diff = null;
      is_missing_rows = false;
      task_table.destroy();
      task_diff_table.destroy();
    } else {
      console.log(`unable to submit data: ${resp.statusText}`);
      console.log(submission);
    }
  }
</script>

<h1>Curation</h1>

<p>
  Transcribed owl screenshots often contain errors. Help build a clean dataset
  for fine-tuning the OCR model.
</p>

{#if data}
  <p>
    Your contributor id is
    <code>{contributor_id}</code>
    . There are currently {data.length} candidate tasks in the current batch,
    with {total_contributions} tasks completed so far.
  </p>
{/if}

<TopContributors bind:data={top_contributors_data} />

{#if show_candidates}
  <div id="candidate" />
{/if}

<br />

{#if data}
  {#if !task_start}
    <button on:click={requestTask}>Request Task</button>
  {/if}

  <div>
    {#if task_data}
      <h2>Task</h2>
      <p>Click anywhere in the table to edit.</p>
      <img
        id="screenshot"
        src={task_data.screenshot_url}
        alt="random screenshot" />
    {/if}
    <div id="transcribed" />
  </div>
  {#if task_start}
    <label>
      <input type="checkbox" bind:checked={is_missing_rows} />
      This table is missing row(s)
    </label>
    <br />
    <button on:click={diffTask}>Check Task</button>
  {/if}
  {#if task_diff && task_diff.distance == 0}
    <p>No changes detected!</p>
  {:else if task_diff}
    <h2>Changes detected</h2>
  {/if}
  <div id="task_diff" />
  {#if task_start && task_diff}
    {#if task_diff.distance > 0}
      <button on:click={submitTask}>Submit Task</button>
    {/if}
    {#if task_validator && !task_validator.valid}
      <p>Errors found. Fix them and try again.</p>
      {#each task_validator.errors as error}
        <li>
          <code>{error.property}</code>
          {error.message}
        </li>
      {/each}
    {/if}
  {/if}
{/if}
