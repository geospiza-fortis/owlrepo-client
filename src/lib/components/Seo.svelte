<script>
  import { page } from "$app/stores";

  /**
   * @typedef {Object} Props
   * @property {any} title
   * @property {any} description
   * @property {string} [ogImage]
   * @property {string} [ogType]
   * @property {any} [canonicalPath]
   * @property {boolean} [noindex]
   * @property {boolean} [includeOg]
   */

  /** @type {Props} */
  let {
    title,
    description,
    ogImage = "/favicon.png",
    ogType = "website",
    canonicalPath = undefined,
    noindex = false,
    includeOg = true,
  } = $props();

  const BASE_URL = "https://owlrepo.com";

  let canonical = $derived(`${BASE_URL}${canonicalPath ?? $page.url.pathname}`);
  let ogImageUrl = $derived(
    ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`,
  );
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
