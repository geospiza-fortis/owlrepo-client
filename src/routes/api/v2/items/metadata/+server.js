import { json } from "@sveltejs/kit";
import { toSlug } from "$lib/slug.js";

let cache = null;
let cacheExpires = null;

export async function GET({ fetch }) {
  const stale =
    !cacheExpires || new Date(cacheExpires).getTime() < Date.now();

  if (cache && !stale) {
    return json(cache);
  }

  const resp = await fetch("/api/v2/query/search_item_index");
  if (!resp.ok) {
    return json(
      { error: `GCS returned ${resp.status}` },
      { status: resp.status },
    );
  }

  const items = await resp.json();

  const metadata = items.map((item) => ({
    slug: toSlug(item.search_item),
    search_item: item.search_item,
  }));

  cacheExpires = resp.headers.get("expires");
  cache = metadata;

  return json(metadata);
}
