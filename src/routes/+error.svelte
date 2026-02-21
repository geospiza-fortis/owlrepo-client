<script>
  import { page } from "$app/stores";
  const dev = import.meta.env.DEV;
</script>

<svelte:head>
  <title>{$page.status}</title>
</svelte:head>

<h1>{$page.status}</h1>

<p>{$page.error.message}</p>

{#if dev && $page.error.stack}
  <pre>{$page.error.stack}</pre>
{/if}

<style>
  h1,
  p {
    margin: 0 auto;
  }
  h1 {
    font-size: 2.8em;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }
  p {
    margin: 1em auto;
  }
  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>
