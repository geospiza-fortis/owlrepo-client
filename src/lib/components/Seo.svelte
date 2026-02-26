<script>
  import { page } from "$app/stores";

  export let title;
  export let description;
  export let ogImage = "/favicon.png";
  export let ogType = "website";
  export let canonicalPath = undefined;
  export let noindex = false;
  export let includeOg = true;

  const BASE_URL = "https://owlrepo.com";

  $: canonical = `${BASE_URL}${canonicalPath ?? $page.url.pathname}`;
  $: ogImageUrl = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {/if}
  {#if includeOg}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImageUrl} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content={ogType} />
    <meta property="og:site_name" content="OwlRepo" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageUrl} />
  {/if}
</svelte:head>
