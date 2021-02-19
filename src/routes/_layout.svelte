<script>
  import Navbar from "../components/Navbar.svelte";
  // bunch of css import for various modules
  import "tabulator-tables/dist/css/tabulator.min.css";
  import "bootstrap/dist/css/bootstrap.min.css";
  export let segment;
</script>

<style>
  /* 
    https://jrl.ninja/etc/1/ 
    https://jgthms.com/web-design-in-4-minutes/#centering
  */
  main {
    color: #333;
    margin: 0 auto;
    max-width: 900px;
    /* padding: 0 2rem; */
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  @media (max-width: 900px) {
    main {
      padding: 0 0.5rem;
    }
  }

  /* https://stackoverflow.com/a/43117538*/
  :global(.full-width) {
    position: absolute;
    left: 0;
    right: 0;
  }

  .footer {
    margin: 0 auto;
    padding-bottom: 2rem;
  }
</style>

<Navbar {segment} />
<main>
  <slot />
</main>

<div class="footer" />
