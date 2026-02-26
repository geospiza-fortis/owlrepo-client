/**
 * Convert a search_item string to a URL-safe snake_case slug.
 * @param {string} searchItem
 * @returns {string}
 */
export function toSlug(searchItem) {
  return searchItem
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}