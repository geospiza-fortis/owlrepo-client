<script>
  import { onMount } from "svelte";
  import { Stretch } from "svelte-loading-spinners";
  import moment from "moment";

  export let data;
  export let max_range = 14;
  let cal;
  let heatmapReady = false;
  let resizeTimeout;

  // We implement a component that's something along these lines, where the width
  // changes on resize events. There's a few more tricks to make this a bit nicer
  // to use.
  // https://github.com/wa0x6e/cal-heatmap/issues/100#issue-38507180

  function transformData(data) {
    let res = {};
    for (let i = 0; i < data.length; i++) {
      res[data[i].ts] = data[i].value;
    }
    return res;
  }

  async function loadHeatmap(range) {
    // destroy any existing heatmap
    if (cal) {
      document.getElementById("cal-heatmap").innerHTML = "";
      cal.destroy();
    }
    cal = new CalHeatMap();
    cal.init({
      domain: "month",
      subdomain: "day",
      range: range,
      start: moment()
        .subtract(range - 1, "months")
        .toDate(),
      data: transformData(data),
      tooltip: true,
    });
  }

  function getWindowWidth() {
    // width data: https://stackoverflow.com/a/11744120
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    );
  }

  function getRange(max_range) {
    // We initialize using the fact that the default 12 months fits nicely into
    // 850px, taking into account the max width.
    return Math.min(Math.round(getWindowWidth() / (850 / 12)), max_range);
  }

  onMount(async () => {
    await loadHeatmap(getRange(max_range));
    heatmapReady = true;
  });

  async function resizeHeatmap() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(async () => {
      await loadHeatmap(getRange(max_range));
    }, 500);
  }
</script>

<svelte:window on:resize={resizeHeatmap} />

{#if !heatmapReady}
  <div style="text-align: center;">
    <Stretch size="60" color="#FF3E00" unit="px" />
  </div>
{/if}

<div id="cal-heatmap"></div>
