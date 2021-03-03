<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  import Navbar from "../components/Navbar.svelte";

  // bunch of css import for various modules
  import "./_assets/darkly.bootstrap.css";

  export let segment;

  // pageview for analytics
  $: process.browser && $page && gtag("config", "G-NBGZYVSFSH");
</script>

<Navbar {segment} />
<main>
  <slot />
</main>

<hr />
<footer>
  OwlRepo __VERSION__ (
  <a
    href="https://github.com/geospiza-fortis/owlrepo-client/commit/__GIT_COMMIT__"
  >
    __GIT_COMMIT__
  </a>
  )
</footer>

<style>
  /* 
    https://jrl.ninja/etc/1/ 
    https://jgthms.com/web-design-in-4-minutes/#centering
  */
  main {
    margin-top: 1rem;
    margin: 0 auto;
    max-width: 992px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  @media (max-width: 992px) {
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

  hr {
    max-width: 30em;
    border-top: 1px solid lightgray;
  }

  footer {
    text-align: center;
    margin-bottom: 2rem;
  }
</style>
