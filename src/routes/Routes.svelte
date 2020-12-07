<script>
  import page from "page";

  import Home from "./Home.svelte";
  import Upload from "./Upload.svelte";
  import Items from "./Items.svelte";
  import Listing from "./Listing.svelte";
  import Recommendation from "./Recommendation.svelte";
  import Personal from "./Personal.svelte";
  import Charts from "./Charts.svelte";
  import Curate from "./Curate.svelte";
  import Merchants from "./Merchants.svelte";
  import Guide from "./Guide.svelte";
  import { setNavbarIndex } from "../components/Navbar.svelte";

  let component;
  let params;

  function setComponent(c) {
    return function setComponentInner({
      canonicalPath: canonicalPath,
      pathname: pathname,
      params: p
    }) {
      component = c;
      params = p;
      setNavbarIndex(pathname);
      try {
        // pageview for analytics
        gtag("config", "UA-172155429-1", {
          page_path: canonicalPath
        });
      } catch {}
    };
  }

  page("/", setComponent(Home));
  page("/items", setComponent(Items));
  page("/upload", setComponent(Upload));
  page("/listing/:listing_id", setComponent(Listing));
  page("/recommendation", setComponent(Recommendation));
  page("/personal", setComponent(Personal));
  page("/charts", setComponent(Charts));
  page("/curate", setComponent(Curate));
  page("/merchants", setComponent(Merchants));
  page("/guide", setComponent(Guide));
  page({ hashbang: false });
</script>

<svelte:component this={component} bind:params />
