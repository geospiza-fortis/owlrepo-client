<script>
  import { templates } from "./templates.js";

  export let schema = {};
  export let sql = "";
  export let results = null;

  let promptTooltip = false;
  let resultsTooltip = false;
  let promptPreview = false;
  let resultsPreview = false;

  const MAX_RESULT_ROWS = 100;
  // Views that alias the underlying tables — only show these to avoid redundancy
  const VIEW_NAMES = new Set(["items", "listing"]);

  function buildSchemaMarkdown() {
    let out = "## Database Schema\n\n";
    for (const [table, columns] of Object.entries(schema)) {
      if (!VIEW_NAMES.has(table)) continue;
      out += `### Table: ${table}\n`;
      out += "| Column | Type |\n|--------|------|\n";
      for (const col of columns) {
        out += `| ${col.name} | ${col.type} |\n`;
      }
      out += "\n";
    }
    return out;
  }

  function buildTemplatesMarkdown() {
    let out = "## Example Queries\n\n";
    for (const t of templates) {
      out += `### ${t.name}\n\`\`\`sql\n${t.sql}\n\`\`\`\n\n`;
    }
    return out;
  }

  function buildPromptMarkdown() {
    let out = buildSchemaMarkdown();
    out += buildTemplatesMarkdown();

    out +=
      "## Instructions\n" +
      "Write a DuckDB SQL query for the database above. " +
      "Use the schema and example queries as reference for available tables and columns. " +
      "Return only the SQL query.\n";

    return out;
  }

  function buildResultsMarkdown() {
    if (!results) return "";
    const { columns, rows } = results;

    let out = "";
    if (sql.trim()) {
      out += `## Query\n\`\`\`sql\n${sql}\n\`\`\`\n\n## Results\n`;
    }

    const capped = rows.slice(0, MAX_RESULT_ROWS);
    out += `| ${columns.join(" | ")} |\n`;
    out += `|${columns.map(() => "---").join("|")}|\n`;
    for (const row of capped) {
      out += `| ${row.map((v) => (v == null ? "" : String(v))).join(" | ")} |\n`;
    }
    if (rows.length > MAX_RESULT_ROWS) {
      out += `\n(showing ${MAX_RESULT_ROWS} of ${rows.length} rows)\n`;
    }
    return out;
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(buildPromptMarkdown());
    promptTooltip = true;
    setTimeout(() => (promptTooltip = false), 2000);
  }

  async function copyResults() {
    await navigator.clipboard.writeText(buildResultsMarkdown());
    resultsTooltip = true;
    setTimeout(() => (resultsTooltip = false), 2000);
  }
</script>

<div class="d-flex gap-2">
  <div class="position-relative">
    <button
      class="btn btn-outline-secondary btn-sm"
      on:click={copyPrompt}
      title="Copy schema and templates as an LLM prompt"
    >
      Copy Prompt
    </button>
    {#if promptTooltip}
      <span
        class="position-absolute top-100 start-50 translate-middle-x badge bg-success mt-1"
      >
        Copied!
      </span>
    {/if}
  </div>

  <div class="position-relative">
    <button
      class="btn btn-outline-secondary btn-sm"
      on:click={copyResults}
      disabled={!results}
      title="Copy query results as a markdown table"
    >
      Copy Results
    </button>
    {#if resultsTooltip}
      <span
        class="position-absolute top-100 start-50 translate-middle-x badge bg-success mt-1"
      >
        Copied!
      </span>
    {/if}
  </div>

  <button
    class="btn btn-outline-secondary btn-sm"
    on:click={() => {
      promptPreview = !promptPreview;
      resultsPreview = false;
    }}
    title="Preview the LLM prompt"
  >
    {promptPreview ? "Hide" : "Preview"} Prompt
  </button>

  {#if results}
    <button
      class="btn btn-outline-secondary btn-sm"
      on:click={() => {
        resultsPreview = !resultsPreview;
        promptPreview = false;
      }}
      title="Preview the results markdown"
    >
      {resultsPreview ? "Hide" : "Preview"} Results
    </button>
  {/if}
</div>

{#if promptPreview}
  <pre class="preview-block mt-2">{buildPromptMarkdown()}</pre>
{/if}

{#if resultsPreview && results}
  <pre class="preview-block mt-2">{buildResultsMarkdown()}</pre>
{/if}

<style>
  .preview-block {
    font-size: 0.8em;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.75rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
