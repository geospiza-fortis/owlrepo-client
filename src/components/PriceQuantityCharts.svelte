<script>
  export let data = [];
  export let search_item_name;

  let chartElement;
  $: chartElement &&
    data &&
    data.length &&
    Plotly.newPlot(
      chartElement,
      transform(data, search_item_name),
      {
        title: `${search_item_name} over time`,
        legend: { orientation: "h" },
        yaxis: {
          title: "price"
        },
        yaxis2: {
          title: "count"
        },
        grid: {
          rows: 2,
          columns: 1,
          subplots: ["xy", "xy2"],
          roworder: "top to bottom"
        },
        margin: {
          l: 50,
          r: 0,
          b: 0,
          t: 100
        }
      },
      { responsive: true }
    );

  function transform(data, search_item) {
    let items = data.filter(
      item => item.search_item === search_item && item.percent_complete > 0.6
    );
    let x = items.map(item => new Date(item.search_item_timestamp));
    return ["p0", "p25", "p50", "p75", "p100"]
      .map(label => {
        return {
          x: x,
          y: items.map(item => item[label]),
          name: label === "p0" ? "min" : label === "p100" ? "max" : label,
          mode: "lines+markers",
          visible: label == "p50" ? true : "legendonly"
        };
      })
      .concat([
        {
          x: items.map(item => new Date(item.search_item_timestamp)),
          y: items.map(item => item.search_results),
          name: "search_results",
          mode: "lines+markers",
          xaxis: "x",
          yaxis: "y2"
        },
        {
          x: items.map(item => new Date(item.search_item_timestamp)),
          y: items.map(item => item.sum_bundle),
          name: "sum_bundle",
          mode: "lines+markers",
          xaxis: "x",
          yaxis: "y2",
          visible: "legendonly"
        }
      ]);
  }
</script>

<div bind:this={chartElement} />
