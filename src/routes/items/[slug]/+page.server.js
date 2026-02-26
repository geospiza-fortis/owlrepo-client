import { error } from "@sveltejs/kit";
import { toSlug } from "$lib/slug.js";

let cache = null;
let cacheExpires = null;

async function fetchListings(fetch) {
  const stale =
    !cacheExpires || new Date(cacheExpires).getTime() < Date.now();

  if (cache && !stale) {
    return cache;
  }

  const resp = await fetch("/api/v2/query/search_item_listing");
  if (!resp.ok) {
    return [];
  }

  const data = await resp.json();
  cacheExpires = resp.headers.get("expires");
  cache = data;

  return data;
}

export async function load({ params, fetch }) {
  const { slug } = params;
  const listings = await fetchListings(fetch);

  const filtered = listings
    .filter((row) => toSlug(row.search_item) === slug)
    .sort(
      (a, b) =>
        new Date(b.search_item_timestamp) - new Date(a.search_item_timestamp),
    );

  if (filtered.length === 0) {
    error(404, `No item found for "${slug}"`);
  }

  return {
    slug,
    searchItemName: filtered[0].search_item,
    listings: filtered,
  };
}
