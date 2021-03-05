<script>
  import Fuse from "fuse.js";

  export let data = {};
  export let result;

  let value = "";

  $: transformed = data.map((row) => ({
    search_key: `${row.category} ${row.stat}`,
    ...row,
  }));

  $: fuse = new Fuse(transformed, {
    includeScore: true,
    keys: ["search_key"],
    threshold: 0.4,
  });
  $: result = value ? fuse.search(value).map((row) => row.item) : data;
</script>

<input
  type="text"
  placeholder="Search..."
  id="search-box"
  on:input={(e) => (value = e.target.value)}
/>
{result.length} results
