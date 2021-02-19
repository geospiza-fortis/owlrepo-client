<script>
  import Navbar from "../components/Navbar.svelte";
  // bunch of css import for various modules
  import "tabulator-tables/dist/css/tabulator.min.css";
  //   import "bootstrap";
  import "bootstrap/dist/css/bootstrap.min.css";
</script>

<Navbar />
<main>
  <slot />
</main>

<div class="footer" />
