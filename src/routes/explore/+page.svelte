<svelte:head>
  <title>OwlRepo | SQL Explorer</title>
</svelte:head>

<script>
  import { onMount } from "svelte";
  import { getDB, loadData, getSchema, executeQuery } from "$lib/duckdb.js";
  import { encode, decode, buildShareUrl } from "$lib/components/explore/share.js";
  import Plot from "$lib/components/Plot.svelte";
  import SqlEditor from "$lib/components/explore/SqlEditor.svelte";
  import ResultsTable from "$lib/components/explore/ResultsTable.svelte";
  import ChartConfigurator from "$lib/components/explore/ChartConfigurator.svelte";
  import TemplateQueries from "$lib/components/explore/TemplateQueries.svelte";
  import SchemaPanel from "$lib/components/explore/SchemaPanel.svelte";
  import PromptBuilder from "$lib/components/explore/PromptBuilder.svelte";

  let sql = `SELECT search_item, mean, p50, search_results
FROM items
WHERE mean IS NOT NULL
ORDER BY mean DESC
LIMIT 25`;
  let results = null; // {columns, rows}
  let error = null;
  let isRunning = false;
  let isLoading = true;
  let loadError = null;
  let schema = {};
  let conn = null;
  let chartVisible = true;
  let chartConfig = { type: "bar", x: "search_item", y: "mean", color: null };
  let editor;

  // Chart data derived from results + config
  $: plotData = chartVisible && results ? buildPlotData(results, chartConfig) : null;
  $: plotLayout = chartVisible ? buildPlotLayout(chartConfig) : {};

  function colVals(results, colName) {
    const i = results.columns.indexOf(colName);
    return i === -1 ? null : results.rows.map((r) => r[i]);
  }

  function buildPlotData(results, config) {
    if (!results || !config.x) return null;

    // Whisker plot: pre-computed quartiles from named columns
    if (config.type === "whisker") {
      const x = colVals(results, config.x);
      const lowerfence = colVals(results, config.lowerfence || "lowerfence");
      const q1 = colVals(results, config.q1 || "q1");
      const median = colVals(results, config.median || "median");
      const q3 = colVals(results, config.q3 || "q3");
      const upperfence = colVals(results, config.upperfence || "upperfence");
      if (!x || !lowerfence || !q1 || !median || !q3 || !upperfence) return null;
      return [{ type: "box", x, lowerfence, q1, median, q3, upperfence }];
    }

    if (!config.y) return null;
    const xi = results.columns.indexOf(config.x);
    const yi = results.columns.indexOf(config.y);
    if (xi === -1 || yi === -1) return null;

    const xVals = results.rows.map((r) => r[xi]);
    const yVals = results.rows.map((r) => r[yi]);

    if (config.color) {
      const ci = results.columns.indexOf(config.color);
      if (ci !== -1) {
        const groups = {};
        results.rows.forEach((r) => {
          const key = String(r[ci]);
          if (!groups[key]) groups[key] = { x: [], y: [] };
          groups[key].x.push(r[xi]);
          groups[key].y.push(r[yi]);
        });
        return Object.entries(groups).map(([name, vals]) => ({
          x: vals.x,
          y: vals.y,
          name,
          type: config.type === "line" ? "scatter" : config.type,
          mode: config.type === "line" ? "lines" : config.type === "scatter" ? "markers" : undefined,
        }));
      }
    }

    return [
      {
        x: xVals,
        y: yVals,
        type: config.type === "line" ? "scatter" : config.type,
        mode: config.type === "line" ? "lines" : config.type === "scatter" ? "markers" : undefined,
      },
    ];
  }

  function buildPlotLayout(config) {
    return {
      xaxis: { title: { text: config.x || "" } },
      yaxis: { title: { text: config.y || "" } },
    };
  }

  onMount(async () => {
    try {
      const db = await getDB();
      conn = await db.connect();
      await loadData(conn);
      schema = await getSchema(conn);
      isLoading = false;

      // Check URL fragment for shared query
      const shared = decode(window.location.hash);
      if (shared) {
        sql = shared.sql;
        if (editor) editor.setValue(shared.sql);
        if (shared.chart) {
          chartConfig = shared.chart;
          chartVisible = true;
        }
        await runQuery();
      }
    } catch (e) {
      isLoading = false;
      loadError = e.message || "Failed to initialize DuckDB";
    }
  });

  async function runQuery() {
    if (!conn || !sql.trim()) return;
    isRunning = true;
    error = null;
    results = null;

    try {
      results = await executeQuery(conn, sql);

      // Update URL fragment
      const state = { sql };
      if (chartVisible) state.chart = chartConfig;
      history.replaceState(null, "", `#q=${encode(state)}`);
    } catch (e) {
      error = e.message || "Query failed";
    } finally {
      isRunning = false;
    }
  }

  function handleShare() {
    const state = { sql };
    if (chartVisible) state.chart = chartConfig;
    const url = buildShareUrl(window.location.origin, window.location.pathname, state);
    navigator.clipboard.writeText(url);
    shareTooltip = true;
    setTimeout(() => (shareTooltip = false), 2000);
  }

  let shareTooltip = false;

  async function handleTemplateSelect(e) {
    const { sql: templateSql, chart } = e.detail;
    sql = templateSql;
    if (editor) editor.setValue(templateSql);
    if (chart) {
      chartConfig = chart;
      chartVisible = true;
    }
    await runQuery();
  }
</script>

<div class="container-fluid mt-3">
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h1 class="mb-0">SQL Explorer</h1>
    <div class="d-flex gap-2">
      <TemplateQueries on:select={handleTemplateSelect} />
      <div class="position-relative">
        <button class="btn btn-outline-secondary btn-sm" on:click={handleShare}>
          Share
        </button>
        {#if shareTooltip}
          <span class="position-absolute top-100 start-50 translate-middle-x badge bg-success mt-1">
            Copied!
          </span>
        {/if}
      </div>
    </div>
  </div>
  <div class="mb-3">
    <PromptBuilder {schema} {sql} {results} />
  </div>

  {#if isLoading}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Initializing DuckDB...</p>
    </div>
  {:else if loadError}
    <div class="alert alert-danger">{loadError}</div>
  {:else}
    <div class="row">
      <!-- Left column: schema, editor, controls, results table -->
      <div class="col-lg-6 mb-3">
        <SchemaPanel {schema} />

        <SqlEditor bind:value={sql} {schema} on:run={runQuery} bind:this={editor} />

        <div class="d-flex gap-2 mt-2 mb-3">
          <button
            class="btn btn-primary btn-sm"
            on:click={runQuery}
            disabled={isRunning}
          >
            {#if isRunning}
              <span class="spinner-border spinner-border-sm me-1" role="status"></span>
              Running...
            {:else}
              &#9654; Run (Ctrl+Enter)
            {/if}
          </button>
          <button
            class="btn btn-outline-secondary btn-sm"
            on:click={() => (chartVisible = !chartVisible)}
          >
            {chartVisible ? "Hide Chart" : "Show Chart"}
          </button>
        </div>

        <ResultsTable
          columns={results?.columns}
          rows={results?.rows}
          {error}
        />
      </div>

      <!-- Right column: chart config + plot -->
      <div class="col-lg-6">
        {#if chartVisible}
          <ChartConfigurator
            columns={results?.columns || []}
            bind:chartConfig
            bind:visible={chartVisible}
          />
          {#if plotData}
            <Plot data={plotData} layout={plotLayout} />
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>
