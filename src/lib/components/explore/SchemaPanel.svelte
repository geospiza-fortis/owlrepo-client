<script>
  export let schema = {};

  let expanded = false;
  let expandedTables = {};

  // Only show the convenience views, not the underlying tables they alias
  const VIEW_NAMES = new Set(["items", "listing"]);
  $: filteredSchema = Object.entries(schema).filter(([name]) =>
    VIEW_NAMES.has(name),
  );

  function toggleTable(name) {
    expandedTables[name] = !expandedTables[name];
  }
</script>

<div class="mb-3">
  <button
    class="btn btn-sm btn-outline-secondary"
    on:click={() => (expanded = !expanded)}
  >
    {expanded ? "Hide" : "Show"} Schema
    <span class="ms-1">{expanded ? "\u25B2" : "\u25BC"}</span>
  </button>

  {#if expanded}
    <div class="schema-panel mt-2">
      {#each filteredSchema as [table, columns]}
        <div class="schema-table">
          <button
            class="btn btn-sm btn-link text-light text-decoration-none p-0"
            on:click={() => toggleTable(table)}
          >
            <span class="me-1">{expandedTables[table] ? "\u25BC" : "\u25B6"}</span>
            <strong>{table}</strong>
            <span class="text-muted ms-1">({columns.length} cols)</span>
          </button>
          {#if expandedTables[table]}
            <ul class="list-unstyled ms-3 mb-0">
              {#each columns as col}
                <li class="schema-col">
                  <code class="text-info">{col.name}</code>
                  <span class="text-muted ms-1">{col.type}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .schema-panel {
    font-size: 0.85em;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.5rem;
    max-height: 250px;
    overflow-y: auto;
  }
  .schema-table {
    margin-bottom: 0.25rem;
  }
  .schema-col {
    font-size: 0.9em;
    padding: 1px 0;
  }
</style>
