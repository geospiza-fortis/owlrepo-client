<script>
  export let columns = null;
  export let rows = null;
  export let error = null;

  const MAX_DISPLAY_ROWS = 500;

  $: displayRows = rows && rows.length > MAX_DISPLAY_ROWS ? rows.slice(0, MAX_DISPLAY_ROWS) : rows;
  $: truncated = rows && rows.length > MAX_DISPLAY_ROWS;
</script>

{#if error}
  <div class="alert alert-danger mt-2">
    <strong>Error:</strong> {error}
  </div>
{:else if columns && rows}
  <div class="results-info text-muted mb-1">
    {rows.length} row{rows.length !== 1 ? "s" : ""}
    {#if truncated}
      (showing first {MAX_DISPLAY_ROWS})
    {/if}
  </div>
  <div class="table-wrapper">
    <table class="table table-dark table-striped table-hover table-sm mb-0">
      <thead>
        <tr>
          {#each columns as col}
            <th>{col}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each displayRows as row}
          <tr>
            {#each row as cell}
              <td>{cell === null || cell === undefined ? "NULL" : cell}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .table-wrapper {
    max-height: 400px;
    overflow: auto;
    border: 1px solid #444;
    border-radius: 4px;
  }
  thead {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  thead th {
    background: #2b2b2b;
    border-bottom: 2px solid #555;
  }
  .results-info {
    font-size: 0.85em;
  }
  td {
    white-space: nowrap;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
