<script>
  import { merge } from "lodash-es";
  export let data;
  export let transform = (res) => res;
  export let layout = {};
  let plotElement;

  let darkStyle = {
    font: {
      color: "#fff",
    },
    paper_bgcolor: "#222222",
    plot_bgcolor: "#222222",
    xaxis: {
      gridcolor: "#333",
    },
    yaxis: {
      gridcolor: "#333",
    },
    yaxis2: {
      gridcolor: "#333",
    },
  };

  $: plotElement &&
    data &&
    layout &&
    Plotly.newPlot(
      plotElement,
      transform(data),
      merge(
        {
          margin: {
            l: 50,
            r: 0,
            b: 50,
          },
        },
        darkStyle,
        layout
      ),
      { responsive: true }
    );
</script>

<div bind:this={plotElement} />
