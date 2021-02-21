<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  import Navbar from "../components/Navbar.svelte";

  // bunch of css import for various modules
  import "./_assets/darkly.bootstrap.css";

  export let segment;

  // pageview for analytics
  $: process.client &&
    $page &&
    gtag("config", "UA-172155429-1", {
      page_path: $page.path
    });
</script>

<style>
  /* 
    https://jrl.ninja/etc/1/ 
    https://jgthms.com/web-design-in-4-minutes/#centering
  */
  main {
    margin-top: 1rem;
    margin: 0 auto;
    max-width: 900px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  @media (max-width: 900px) {
    main {
      padding: 0 0.5rem;
    }
  }
  /* from https://bootswatch.com/cyborg/ */
  :global(a) {
    color: #2a9fd6;
    text-decoration: none;
    background-color: transparent;
  }

  :global(a:hover) {
    color: #1d7097;
    text-decoration: underline;
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
