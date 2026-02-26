<script>
  import Table from "$lib/components/Table.svelte";

  export let predData;
  export let data;
  export let threshold_age = 28;

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

  $: coreOptions = createOptions([
    { field: "search_item_timestamp", type: "!=", value: null },
    { field: "days_since_update", type: ">=", value: core_scroll_update },
  ]);
  $: staleOptions = createOptions([
    { field: "search_item_timestamp", type: "!=", value: null },
    { field: "days_since_update", type: ">", value: threshold_age },
  ]);
  $: etcOptions = staleOptions;

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

<h2>Core Scrolls</h2>
<p>
  These scrolls are indicators of the common items sold on the market. They
  should be measured every ~{core_scroll_update} days.
</p>

<Table data={coreData} options={coreOptions} />

<h2>Stale Scrolls</h2>
<Table data={staleData} options={staleOptions} />

<h2>Weapons, Mastery Books, Etc.</h2>
<Table data={etcData} options={etcOptions} />

<h2>Unseen Scrolls</h2>

<Table data={predData} options={unseenOptions} />
