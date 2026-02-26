<script>
  import Plot from "./Plot.svelte";

  export let data = [];
  export let search_item_name;
  export let layout = {};

  let chartMode = "band";

  function filterItems(data, search_item) {
    return data.filter(
      (item) => item.search_item === search_item && item.percent_complete > 0.6
    );
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

  $: transformFn =
    chartMode === "band"
      ? (d) => transformBand(d, search_item_name)
      : (d) => transformLine(d, search_item_name);

  $: price_layout = {
    title: `${search_item_name} over time`,
    legend: { orientation: "h" },
    yaxis: {
      title: "price",
    },
    yaxis2: {
      title: "count",
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
      t: 100,
    },
  };
</script>

<div class="btn-group btn-group-sm mb-2">
  <button
    class="btn"
    class:btn-primary={chartMode === "band"}
    class:btn-outline-primary={chartMode !== "band"}
    on:click={() => (chartMode = "band")}
  >
    Band
  </button>
  <button
    class="btn"
    class:btn-primary={chartMode === "line"}
    class:btn-outline-primary={chartMode !== "line"}
    on:click={() => (chartMode = "line")}
  >
    Line
  </button>
</div>

<Plot
  {data}
  transform={transformFn}
  layout={{
    ...price_layout,
    ...layout,
  }}
/>
