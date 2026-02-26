<script>
  import { goto } from "$app/navigation";
  import { formatPrice } from "$lib/utils.js";
  import Seo from "$lib/components/Seo.svelte";

  export let data;

  let searchInput = data.q;
  let debounceTimer;

  const columns = [
    { label: "Updated", field: "search_item_timestamp" },
    { label: "Item", field: "search_item" },
    { label: "Owled", field: "n_owled" },
    { label: "Listed", field: "search_results" },
    { label: "min", field: "p0", align: "text-end" },
    { label: "p25", field: "p25", align: "text-end" },
    { label: "p50", field: "p50", align: "text-end" },
    { label: "avg", field: "mean", align: "text-end" },
    { label: "max", field: "p100", align: "text-end" },
  ];

  function buildHref({ q, page, sort, dir } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", page);
    if (sort) params.set("sort", sort);
    if (dir) params.set("dir", dir);
    const qs = params.toString();
    return `/items${qs ? "?" + qs : ""}`;
  }

  function handleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      goto(buildHref({ q: searchInput }), { keepFocus: true });
    }, 300);
  }

  $: sortHrefs = Object.fromEntries(
    columns.map((col) => {
      const newDir =
        data.sort === col.field && data.dir === "desc" ? "asc" : "desc";
      return [col.field, buildHref({ q: data.q, sort: col.field, dir: newDir })];
    }),
  );

  function formatDate(ts) {
    return ts ? ts.slice(0, 10) : "";
  }

  function pageNumbers(current, total) {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push("...");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }

  function pageHref(p) {
    return buildHref({ q: data.q, page: p, sort: data.sort, dir: data.dir });
  }
</script>

<Seo
  title="OwlRepo | Items"
  description="Browse tracked item prices on OwlRepo. {data.totalItems} items with current market data."
  canonicalPath="/items"
/>

<h1>Items</h1>

<div class="mb-3">
  <input
    type="search"
    class="form-control"
    placeholder="Search items..."
    bind:value={searchInput}
    on:input={handleSearch}
  />
</div>

<p class="text-muted">
  {data.totalItems} items
  {#if data.q}&mdash; filtered by "{data.q}"{/if}
</p>

<div class="table-responsive">
  <table class="table table-dark table-striped table-hover">
    <thead>
      <tr>
        {#each columns as col}
          <th class="{col.align || ''} sortable" class:active-sort={data.sort === col.field}>
            <a href={sortHrefs[col.field]}>
              {col.label}
              {#if data.sort === col.field}
                <span class="sort-arrow">{data.dir === "asc" ? "▲" : "▼"}</span>
              {/if}
            </a>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data.items as item}
        <tr>
          <td>{formatDate(item.search_item_timestamp)}</td>
          <td><a href="/items/{item.slug}">{item.search_item}</a></td>
          <td>{item.n_owled}</td>
          <td>{item.search_results}</td>
          <td class="text-end">{formatPrice(item.p0)}</td>
          <td class="text-end">{formatPrice(item.p25)}</td>
          <td class="text-end">{formatPrice(item.p50)}</td>
          <td class="text-end">{formatPrice(item.mean)}</td>
          <td class="text-end">{formatPrice(item.p100)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if data.totalPages > 1}
  <nav aria-label="Items pagination">
    <ul class="pagination justify-content-center">
      <li class="page-item" class:disabled={data.page === 1}>
        <a class="page-link" href={pageHref(data.page - 1)}>Previous</a>
      </li>
      {#each pageNumbers(data.page, data.totalPages) as p}
        {#if p === "..."}
          <li class="page-item disabled">
            <span class="page-link">&hellip;</span>
          </li>
        {:else}
          <li class="page-item" class:active={p === data.page}>
            <a class="page-link" href={pageHref(p)}>{p}</a>
          </li>
        {/if}
      {/each}
      <li class="page-item" class:disabled={data.page === data.totalPages}>
        <a class="page-link" href={pageHref(data.page + 1)}>Next</a>
      </li>
    </ul>
  </nav>
{/if}

{#if data.lastModified}
  <p style="text-align: right">
    <i>Last modified {formatDate(data.lastModified)}</i>
  </p>
{/if}

<style>
  th.sortable a {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
  }
  th.sortable a:hover {
    text-decoration: underline;
  }
  th.active-sort {
    border-bottom: 2px solid #0d6efd;
  }
  .sort-arrow {
    font-size: 0.75em;
    margin-left: 0.25em;
  }
</style>
