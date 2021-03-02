<script>
  import { onMount } from "svelte";
  import { dropOutliers, generateSummary } from "./stats.js";
  import { summaryColumns } from "./columns.js";
  import Table from "../../components/Table.svelte";
  import Plot from "../../components/Plot.svelte";

  export let key;
  export let data;
  export let outlierCutoff = 3;

  function transformPlot(data) {
    return [
      {
        y: dropOutliers(
          data.map((row) => row.price),
          outlierCutoff
        ),
        type: "box",
        name: "prices",
      },
    ];
  }

  function transformTable(data) {
    let prices = data.map((row) => row.price);
    let cleanPrices = dropOutliers(prices, outlierCutoff);

    let summary = generateSummary(prices);
    let cleanSummary = generateSummary(cleanPrices);

    let result = [];
    for (let i = 0; i < summary.length; i++) {
      result.push({
        key: summary[i].key,
        raw: summary[i].value,
        clean: cleanSummary[i].value,
      });
    }
    return result;
  }
</script>

<h3>{key}</h3>
<div class="row">
  <div class="col-sm-7">
    <p>Screenshots were taken around {data[0].timestamp}.</p>
    <p>
      There are
      <b>{data[0].results}</b>
      search results with {data.length} results ({(
        (data.length / data[0].results) *
        100
      ).toFixed(1)}%) captured.
    </p>
    <Table data={transformTable(data)} options={{ columns: summaryColumns }} />
  </div>
  <div class="col-sm-5">
    <Plot
      {data}
      transform={transformPlot}
      layout={{ title: "Price Box Plot" }}
    />
  </div>
</div>
