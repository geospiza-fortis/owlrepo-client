<script>
  import { formatPrice } from "../../utils.js";
  import { Tooltip } from "sveltestrap/src";
  export let row;
  export let id;
  export let metric;
  export let age = 28;
</script>

<Tooltip placement="top" target={id}
  ><div>
    Updated {row.days_since_update} days ago ({row.search_item_timestamp.slice(
      0,
      10
    )})
  </div>
</Tooltip>
<tr
  {id}
  on:click={() => {
    window.location = `/items?keyword=${encodeURIComponent(row.search_item)}`;
  }}
>
  <td>
    {row.category.replace("one-handed", "1h").replace("two-handed", "2h")}
  </td>
  <td>{row.stat}</td>
  <td>
    <span
      style="background-color: {row.days_since_update > age
        ? 'grey'
        : 'transparent'}"
    >
      {formatPrice(row[metric])}
    </span>
  </td>
</tr>

<style>
  td {
    color: #000;
  }
</style>
