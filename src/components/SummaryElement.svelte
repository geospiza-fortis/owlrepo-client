<script>
  import { onMount } from "svelte";
  import Tabulator from "tabulator-tables";
  import { dropOutliers } from "../stats.js";
  import * as ss from "simple-statistics";

  export let key;
  export let data;
  export let cutoff = 3;

  function formatId(key) {
    return btoa(key).replaceAll("=", "");
  }

  function generateSummary(prices) {
    let summary = [
      { key: "count", value: prices.length },
      { key: "min", value: ss.min(prices) },
      { key: "p25", value: ss.quantile(prices, 0.25) },
      { key: "p50", value: ss.quantile(prices, 0.5) },
      { key: "p75", value: ss.quantile(prices, 0.75) },
      { key: "max", value: ss.max(prices) },
      { key: "mean", value: ss.mean(prices) },
      { key: "stddev", value: ss.standardDeviation(prices) }
    ];
    return summary;
  }

  onMount(() => {
    let prices = data.map(row => row.price);
    let cleanPrices = dropOutliers(prices, cutoff);

    let summary = generateSummary(prices);
    let cleanSummary = generateSummary(cleanPrices);

    let result = [];
    for (let i = 0; i < summary.length; i++) {
      result.push({
        key: summary[i].key,
        raw: summary[i].value,
        clean: cleanSummary[i].value
      });
    }

    let table = new Tabulator(`#summary_${formatId(key)}`, {
      data: result,
      columns: [
        { title: "Key", field: "key" },
        {
          title: "Raw",
          field: "raw",
          formatter: "money",
          formatterParams: { precision: 0 },
          align: "right"
        },
        {
          title: "Clean",
          field: "clean",
          formatter: "money",
          formatterParams: { precision: 0 },
          align: "right"
        }
      ],
      layout: "fitDataFill"
    });
    Plotly.newPlot(
      `boxplot_${formatId(key)}`,
      [
        {
          y: cleanPrices,
          type: "box",
          name: "prices"
        }
      ],
      { title: "Price Box Plot" },
      { responsive: true }
    );
  });
</script>

<h3>{key}</h3>
<div class="row">
  <div class="col-sm-7">
    <p>Screenshots were taken around {data[0].timestamp}.</p>
    <p>
      There are
      <b>{data[0].results}</b>
      search results with {data.length} results ({((data.length / data[0].results) * 100).toFixed(1)}%)
      captured.
    </p>
    <div id={`summary_${formatId(key)}`} />
  </div>
  <div class="col-sm-5">
    <div id={`boxplot_${formatId(key)}`} />
  </div>
</div>
