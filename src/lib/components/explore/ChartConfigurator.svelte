<script>
  export let columns = [];
  export let chartConfig = { type: "scatter", x: null, y: null, color: null };
  export let visible = true;

  const chartTypes = ["scatter", "line", "bar", "box", "whisker"];

  // Auto-select first two columns as x/y when columns change
  $: if (columns && columns.length >= 2) {
    if (!chartConfig.x || !columns.includes(chartConfig.x)) {
      chartConfig.x = columns[0];
    }
    if (!chartConfig.y || !columns.includes(chartConfig.y)) {
      chartConfig.y = columns[1];
    }
  }
</script>

<div class="d-flex flex-wrap gap-2 align-items-center mb-3">
  <div class="d-flex align-items-center gap-1">
    <label class="form-label mb-0 text-muted" for="chart-type">Type</label>
    <select id="chart-type" class="form-select form-select-sm bg-dark text-light" style="width: auto;" bind:value={chartConfig.type}>
      {#each chartTypes as t}
        <option value={t}>{t}</option>
      {/each}
    </select>
  </div>

  <div class="d-flex align-items-center gap-1">
    <label class="form-label mb-0 text-muted" for="chart-x">X</label>
    <select id="chart-x" class="form-select form-select-sm bg-dark text-light" style="width: auto;" bind:value={chartConfig.x}>
      {#each columns as col}
        <option value={col}>{col}</option>
      {/each}
    </select>
  </div>

  <div class="d-flex align-items-center gap-1">
    <label class="form-label mb-0 text-muted" for="chart-y">Y</label>
    <select id="chart-y" class="form-select form-select-sm bg-dark text-light" style="width: auto;" bind:value={chartConfig.y}>
      {#each columns as col}
        <option value={col}>{col}</option>
      {/each}
    </select>
  </div>

  <div class="d-flex align-items-center gap-1">
    <label class="form-label mb-0 text-muted" for="chart-color">Color</label>
    <select id="chart-color" class="form-select form-select-sm bg-dark text-light" style="width: auto;" bind:value={chartConfig.color}>
      <option value={null}>None</option>
      {#each columns as col}
        <option value={col}>{col}</option>
      {/each}
    </select>
  </div>
</div>
