<script context="module">
  import moment from "moment";
  import { sortBy } from "lodash";

  const p25_thresh = 350000;
  const search_thresh = 8;

  function sortData(data) {
    // Sort and concat the two fields. Somewhat of an inefficient solution.
    let a = data.filter(
      (obj) => obj.search_results > search_thresh && obj.p25 > p25_thresh
    );
    let b = data.filter((obj) => !a.includes(obj));
    return sortBy(a, [(obj) => -obj.p25]).concat(
      sortBy(b, [(obj) => -obj.search_results])
    );
  }

  export async function preload() {
    let last_modified;
    const getData = async (route) => {
      let resp = await this.fetch(route);
      let data = await resp.json();
      // NOTE: stateful, will globally set whatever was called last
      last_modified = new Date(resp.headers.get("last-modified")).toISOString();
      return sortData(
        data.map((obj) => ({
          ...obj,
          days_since_update:
            moment().diff(moment(obj.search_item_timestamp), "days") || -1,
        }))
      );
    };
    let predData = await getData("/api/v2/query/scrolls_predict");

    // convert front page data for this page
    let data = (await getData("/api/v2/query/search_item_index")).map(
      (obj) => ({
        ...obj,
        name: obj.search_item,
      })
    );

    return { data, predData, last_modified };
  }
</script>

<script>
  import Table from "../../components/Table.svelte";

  export let data;
  export let predData;
  export let last_modified;

  const core_scrolls = [
    "Dark scroll for Claw for ATT 30%",
    "Scroll for Gloves for ATT 60%",
    "Scroll for Overall Armor for DEX 60%",
    "Dark Scroll for Pet Equip. for HP 30%",
    "Scroll for Helmet for DEX 60%",
    "Scroll for Overall Armor for INT 60%",
  ];
  let core_scroll_update = 4;
  // this one is weird since we have some conditional text based on this

  // NOTE: I'm not sure if the names in scrolls_predict will line up exactly
  // with the names in the search item index, but we can be sure etc will
  // be fine
  $: scroll_names = predData.map((obj) => obj.name);
  $: coreData = data.filter((obj) => core_scrolls.includes(obj.name));
  $: staleData = data.filter((obj) => scroll_names.includes(obj.name));
  $: etcData = data.filter((obj) => !scroll_names.includes(obj.name));

  let coreOptions = createOptions([
    { field: "search_item_timestamp", type: "!=", value: null },
    { field: "days_since_update", type: ">=", value: core_scroll_update },
  ]);
  let staleOptions = createOptions([
    { field: "search_item_timestamp", type: "!=", value: null },
    { field: "days_since_update", type: ">", value: 28 },
  ]);

  let etcOptions = staleOptions;

  function createOptions(initialFilter) {
    return {
      initialFilter: initialFilter,
      layout: "fitDataFill",
      columns: [
        {
          title: "Search Item",
          field: "name",
        },
        {
          title: "Days since update",
          field: "days_since_update",
        },
        { title: "Results", field: "search_results" },
        {
          title: "p25",
          field: "p25",
          formatter: "money",
          formatterParams: { precision: 0 },
          align: "right",
        },
      ],
      pagination: "local",
      paginationSize: 8,
    };
  }

  let unseenOptions = {
    initialFilter: [{ field: "search_item_timestamp", type: "=", value: null }],
    layout: "fitDataFill",
    columns: [
      {
        title: "Search Item",
        field: "name",
      },
      { title: "Predicted Results", field: "search_results_pred" },
      {
        title: "Predicted p25",
        field: "p25_pred",
        formatter: "money",
        formatterParams: { precision: 0 },
        align: "right",
      },
    ],
    pagination: "local",
    paginationSize: 8,
  };
</script>

<svelte:head>
  <title>OwlRepo | Recommendation</title>
</svelte:head>

<h1>Recommendations</h1>

<p>
  Want to know what to upload? Use these ranked tables to determine what's
  valuable.
</p>

<p>
  Items with greater than {search_thresh} search results and valued more than {p25_thresh}
  mesos are sorted by value. All other items are sorted by the number of results.
</p>

<p>
  <i>Last updated {last_modified}.</i>
</p>

<h2>Core Scrolls</h2>
<p>
  These scrolls are strong indicators of the market. They should be measured
  every ~{core_scroll_update} days.
</p>
{#if !coreData}
  <ul>
    {#each core_scrolls as scroll}
      <li>{scroll}</li>
    {/each}
  </ul>
  <p>Core scrolls are up to date.</p>
{:else}
  <Table data={coreData} options={coreOptions} />
{/if}

<h2>Stale Scrolls</h2>
<Table data={staleData} options={staleOptions} />

<h2>Weapons, Mastery Books, Etc.</h2>
<Table data={etcData} options={etcOptions} />

<h2>Unseen Scrolls</h2>

<Table data={predData} options={unseenOptions} />
