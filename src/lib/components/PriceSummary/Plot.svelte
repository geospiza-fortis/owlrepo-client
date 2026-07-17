<script>
  import { run } from "svelte/legacy";

  import Plot from "../Plot.svelte";

  /**
   * @typedef {Object} Props
   * @property {any} [table]
   * @property {any} [row]
   */

  /** @type {Props} */
  let { table = null, row = null } = $props();

  let layout = $state();

  function transformPlot(data) {
    if (!data) {
      return [];
    }
    let r = data;
    return [
      {
        type: "box",
        name: r.search_item,
        q1: [r.p25.toPrecision(2)],
        median: [r.p50.toPrecision(2)],
        q3: [r.p75.toPrecision(2)],
        lowerfence: [r.p0.toPrecision(2)],
        upperfence: [r.p100.toPrecision(2)],
        mean: [r.mean.toPrecision(2)],
        sd: [r.std.toPrecision(2)],
        orientation: "h",
      },
    ];
  }

  // we also keep some analytics in this function, since clicking on a row
  // after searching indicates that the search needs to be reweighted. This
  // is something that can be done with some real world usage.
  function trackEvent(table, row) {
    // https://developers.google.com/analytics/devguides/collection/gtagjs/custom-dims-mets
    // https://support.google.com/analytics/thread/41497070?hl=en
    let first = table.getRows("active")[0].getData();
    gtag("config", "UA-172155429-1", {
      custom_map: {
        dimension1: "list_head",
        dimension2: "list_position",
      },
    });
    let event_data = {
      event_category: "engagement",
      event_label: row.getData().search_item,
      list_head: first.search_item,
      list_position: row.getPosition(true),
    };
    if (event_data.list_position == 0) {
      // ignore data at the head of the list
      return;
    }
    gtag("event", "boxplot_click", event_data);
  }
  run(() => {
    row &&
      (layout = {
        title: { text: row.getData().search_item },
        height: 150,
        margin: {
          l: 0,
          r: 0,
          b: 25,
          t: 40,
        },
      });
  });
  run(() => {
    table && row && trackEvent(table, row);
  });
  let data = $derived(row ? row.getData() : null);
</script>

<Plot {data} transform={transformPlot} {layout} />
