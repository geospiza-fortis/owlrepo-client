import Fuse from "fuse.js";
import { toSlug } from "$lib/slug.js";

const PAGE_SIZE = 20;

let cache = null;
let cacheExpires = null;

async function fetchIndex(fetch) {
  const stale =
    !cacheExpires || new Date(cacheExpires).getTime() < Date.now();

  if (cache && !stale) {
    return cache;
  }

  const resp = await fetch("/api/v2/query/search_item_index");
  if (!resp.ok) {
    return [];
  }

  const items = await resp.json();
  const augmented = items
    .map((item) => ({
      ...item,
      slug: toSlug(item.search_item),
    }))
    .sort(
      (a, b) =>
        new Date(b.search_item_timestamp) - new Date(a.search_item_timestamp),
    );

  cacheExpires = resp.headers.get("expires");
  cache = augmented;

  return augmented;
}

const SORTABLE_FIELDS = new Set([
  "search_item_timestamp",
  "search_item",
  "n_owled",
  "search_results",
  "p0",
  "p25",
  "p50",
  "mean",
  "p100",
]);

const DEFAULT_SORT = "n_owled";
const DEFAULT_DIR = "desc";

export async function load({ fetch, url }) {
  const items = await fetchIndex(fetch);

  const q = url.searchParams.get("q") || url.searchParams.get("keyword") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const sort = SORTABLE_FIELDS.has(url.searchParams.get("sort"))
    ? url.searchParams.get("sort")
    : DEFAULT_SORT;
  const dir = url.searchParams.get("dir") === "asc" ? "asc" : DEFAULT_DIR;

  let filtered = items;

  if (q) {
    const fuse = new Fuse(items, {
      keys: ["search_item"],
      threshold: 0.3,
    });
    filtered = fuse.search(q).map((result) => result.item);
  }

  // Apply sort (override Fuse relevance order when explicit sort requested)
  const hasExplicitSort = url.searchParams.has("sort");
  if (!q || hasExplicitSort) {
    filtered = [...filtered].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      let cmp;
      if (sort === "search_item_timestamp") {
        cmp = new Date(av || 0) - new Date(bv || 0);
      } else if (typeof av === "string") {
        cmp = av.localeCompare(bv);
      } else {
        cmp = (av ?? 0) - (bv ?? 0);
      }
      return dir === "asc" ? cmp : -cmp;
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const lastModified = items.length > 0 ? items[0].search_item_timestamp : null;

  return {
    items: paged,
    q,
    page: safePage,
    totalPages,
    totalItems,
    lastModified,
    sort,
    dir,
  };
}
