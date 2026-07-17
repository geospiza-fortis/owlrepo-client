<script>
  import { run } from "svelte/legacy";

  import Fuse from "fuse.js";

  let { data = {}, result = $bindable() } = $props();

  let value = $state("");

  let transformed = $derived(
    data.map((row) => ({
      search_key: `${row.category} ${row.stat}`,
      ...row,
    })),
  );

  let fuse = $derived(
    new Fuse(transformed, {
      includeScore: true,
      keys: ["search_key"],
      threshold: 0.4,
    }),
  );
  run(() => {
    result = value ? fuse.search(value).map((row) => row.item) : data;
  });
</script>

<input
  type="text"
  placeholder="Search..."
  id="search-box"
  oninput={(e) => (value = e.target.value)}
/>
{result.length} results
