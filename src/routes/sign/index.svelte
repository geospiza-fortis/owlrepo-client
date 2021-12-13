<script>
  import { signMessage, verifyMessage } from "../../token.js";

  let plaintext;
  let ciphertext;
  let signedArea;

  $: signed = plaintext ? signMessage(plaintext) : null;
  $: verified = ciphertext ? verifyMessage(JSON.parse(ciphertext)) : null;

  function copySignedArea() {
    signedArea.select();
    document.execCommand("copy");
  }
</script>

<svelte:head>
  <title>OwlRepo | Sign and Verify</title>
</svelte:head>

<h1>Sign and Verify</h1>

<h2>Sign</h2>

<p>Sign messages using your private key.</p>

<form>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea
      class="form-control"
      id="message"
      rows="3"
      bind:value={plaintext}
    />
  </div>
  {#if signed}
    {#await signed then data}
      <div class="form-group">
        <label for="signed-message">Signed Message</label>
        <textarea
          class="form-control"
          id="signed-message"
          rows="3"
          bind:this={signedArea}
          value={JSON.stringify(data, 2)}
        />
      </div>
      <button
        type="button"
        class="btn btn-primary"
        on:click|preventDefault={copySignedArea}>Copy to Clipboard</button
      >
    {/await}
  {/if}
</form>

<h2>Verify</h2>

<p>Verify and display the contents of a message.</p>

<form>
  <div class="form-group">
    <label for="message">Signed Message</label>
    <textarea
      class="form-control"
      id="message"
      rows="3"
      bind:value={ciphertext}
    />
  </div>
  {#if verified}
    {#await verified then data}
      <div class="form-group">
        <input
          class="form-control"
          type="text"
          value={data.thumbprint}
          readonly
        />
      </div>
      <div class="form-group">
        <label for="verified-message">Verified Message</label>
        <textarea
          class="form-control"
          id="verified-message"
          rows="3"
          value={data.payload}
        />
      </div>
    {/await}
  {/if}
</form>
