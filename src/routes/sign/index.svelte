<script>
  import { signMessage } from "../../token.js";

  let message;
  $: signedMessage = message ? signMessage(message) : null;
</script>

<svelte:head>
  <title>OwlRepo | Sign</title>
</svelte:head>

<h1>Sign</h1>

<p>Use this page to sign messages in OwlRepo.</p>

<form>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea class="form-control" id="message" rows="3" bind:value={message} />
  </div>
  {#if message}
    {#await signedMessage then data}
      <div class="form-group">
        <label for="signed-message">Signed Message</label>
        <textarea
          class="form-control"
          id="signed-message"
          rows="3"
          value={JSON.stringify(data, 2)}
        />
      </div>
    {/await}
  {/if}
</form>
