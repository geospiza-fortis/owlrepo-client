<script>
  import { onMount } from "svelte";
  import { getOrCreateJWKRaw, getThumbprint } from "$lib/token.js";

  let client_thumbprint;
  let client_public_key;

  onMount(async () => {
    client_thumbprint = await getThumbprint();
    client_public_key = await getOrCreateJWKRaw("contributor-keys", true);
  });
</script>

{#if client_thumbprint && client_public_key}
  <p>
    Your public key thumbprint is
    <code>{client_thumbprint}</code>
    . Your full
    <a href="https://tools.ietf.org/html/rfc7517">JWK public key</a>
    is:
  </p>
  <pre><code>{JSON.stringify(client_public_key, null, 4)}</code></pre>
  <p>
    This is a cryptographic key that can be used to prove your identity. Feel free
    to share your public key as you see fit. For the technically savvy, do not share
    your private key (available in IndexedDB) with others.
  </p>
{/if}
