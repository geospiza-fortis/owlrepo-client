<script>
  import Plot from "./Plot.svelte";
  import { calculateModifiedZScore } from "../../routes/listing/stats.js";

  /**
   * @typedef {Object} Props
   * @property {any} [data]
   * @property {any} search_item_name
   * @property {any} [layout]
   * @property {boolean} [showTitle]
   */

  /** @type {Props} */
  let { data = [], search_item_name, layout = {}, showTitle = true } = $props();

  let chartMode = $state("band");
  let outlierCutoff = $state(3);
  let showTooltip = $state(false);
  let totalCount = $state(0);
  let filteredCount = $state(0);

  const outlierOptions = [
    { value: 0, label: "Off" },
    { value: 2, label: "2 (strict)" },
    { value: 3, label: "3 (default)" },
    { value: 5, label: "5 (loose)" },
  ];

  function filterItems(data, search_item) {
    let items = data.filter(
      (item) => item.search_item === search_item && item.percent_complete > 0.6,
    );
    totalCount = items.length;
    filteredCount = 0;
    if (outlierCutoff > 0 && items.length >= 2) {
      let p50Values = items.map((item) => item.p50);
      let scores = calculateModifiedZScore(p50Values);
      let filtered = items.filter((_, index) => scores[index] < outlierCutoff);
      if (filtered.length > 0) {
        filteredCount = items.length - filtered.length;
        items = filtered;
      }
    }
    return items;
  }

  function secondaryTraces(items) {
    return [
      {
        x: items.map((item) => new Date(item.search_item_timestamp)),
        y: items.map((item) => item.search_results),
        name: "search_results",
        mode: "lines+markers",
        xaxis: "x",
        yaxis: "y2",
      },
      {
        x: items.map((item) => new Date(item.search_item_timestamp)),
        y: items.map((item) => item.sum_bundle),
        name: "sum_bundle",
        mode: "lines+markers",
        xaxis: "x",
        yaxis: "y2",
        visible: "legendonly",
      },
    ];
  }

  function transformLine(data, search_item) {
    let items = filterItems(data, search_item);
    let x = items.map((item) => new Date(item.search_item_timestamp));
    return ["p0", "p25", "p50", "p75", "p100"]
      .map((label) => {
        return {
          x: x,
          y: items.map((item) => item[label]),
          name: label === "p0" ? "min" : label === "p100" ? "max" : label,
          mode: "lines+markers",
          visible: label == "p50" ? true : "legendonly",
        };
      })
      .concat(secondaryTraces(items));
  }

  function transformBand(data, search_item) {
    let items = filterItems(data, search_item);
    let x = items.map((item) => new Date(item.search_item_timestamp));
    let xRev = [...x].reverse();
    let bandColor = "rgba(99, 110, 250, {a})";
    return [
      // outer band: p0 lower edge, p100 upper edge filled back
      {
        x: x.concat(xRev),
        y: items
          .map((item) => item.p0)
          .concat([...items].reverse().map((item) => item.p100)),
        fill: "toself",
        fillcolor: bandColor.replace("{a}", "0.15"),
        line: { color: "transparent" },
        name: "min–max",
        showlegend: true,
        hoverinfo: "skip",
      },
      // inner band: p25 lower edge, p75 upper edge filled back
      {
        x: x.concat(xRev),
        y: items
          .map((item) => item.p25)
          .concat([...items].reverse().map((item) => item.p75)),
        fill: "toself",
        fillcolor: bandColor.replace("{a}", "0.35"),
        line: { color: "transparent" },
        name: "p25–p75",
        showlegend: true,
        hoverinfo: "skip",
      },
      // median line
      {
        x: x,
        y: items.map((item) => item.p50),
        mode: "lines+markers",
        line: { color: bandColor.replace("{a}", "1"), width: 2 },
        name: "median",
      },
      ...secondaryTraces(items),
    ];
  }

  let transformFn = $derived(
    chartMode === "band"
      ? (d) => transformBand(d, search_item_name, outlierCutoff)
      : (d) => transformLine(d, search_item_name, outlierCutoff),
  );

  let price_layout = $derived({
    ...(showTitle ? { title: { text: `${search_item_name} over time` } } : {}),
    legend: { orientation: "h" },
    yaxis: {
      title: { text: "price" },
    },
    yaxis2: {
      title: { text: "count" },
    },
    grid: {
      rows: 2,
      columns: 1,
      subplots: ["xy", "xy2"],
      roworder: "top to bottom",
    },
    margin: {
      l: 50,
      r: 0,
      b: 0,
      t: showTitle ? 100 : 20,
    },
  });
</script>

<div class="d-flex align-items-center mb-2">
  <div class="btn-group btn-group-sm">
    <button
      class="btn"
      class:btn-primary={chartMode === "band"}
      class:btn-outline-primary={chartMode !== "band"}
      onclick={() => (chartMode = "band")}
    >
      Band
    </button>
    <button
      class="btn"
      class:btn-primary={chartMode === "line"}
      class:btn-outline-primary={chartMode !== "line"}
      onclick={() => (chartMode = "line")}
    >
      Line
    </button>
  </div>
  <div class="d-flex align-items-center ms-3" style="position: relative;">
    <label class="me-2 mb-0 small" for="outlier-filter">Filter outliers</label>
    <select
      class="form-select form-select-sm"
      style="width: auto;"
      bind:value={outlierCutoff}
      id="outlier-filter"
    >
      {#each outlierOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
    <span
      class="ms-2 text-muted"
      style="cursor: help;"
      onmouseenter={() => (showTooltip = true)}
      onmouseleave={() => (showTooltip = false)}>&#9432;</span
    >
    {#if showTooltip}
      <div class="tooltip-overlay">
        <div class="tooltip-content">
          Removes timestamps with anomalous median prices using
          <a
            href="https://eurekastatistics.com/using-the-median-absolute-deviation-to-find-outliers/"
            target="_blank"
            rel="noopener"
          >
            Median Absolute Deviation (MAD)</a
          >. Lower values filter more aggressively.
        </div>
      </div>
    {/if}
  </div>
  {#if filteredCount > 0}
    <span class="ms-3 small text-muted mb-0"
      >{filteredCount} of {totalCount} points filtered</span
    >
  {/if}
</div>

<Plot
  {data}
  transform={transformFn}
  layout={{
    ...price_layout,
    ...layout,
  }}
/>

<style>
  .tooltip-overlay {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.9);
    border-radius: 4px;
    width: 300px;
  }
  .tooltip-content {
    color: #fff;
    padding: 0.5em;
    font-size: 0.85rem;
  }
  .tooltip-content a {
    color: #8ab4f8;
  }
</style>
