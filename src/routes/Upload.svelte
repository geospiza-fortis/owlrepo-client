<script>
  import Uploader from "../components/Uploader.svelte";
  import IndexView from "../components/IndexView.svelte";
  import UploadInstructions from "../docs/UploadInstructions.svx";
</script>

<h1>Upload Owls</h1>

<Uploader />

<p style="justify-content: center">
  <button
    class="btn btn-info"
    type="button"
    data-toggle="collapse"
    data-target="#uploadInstructions"
    aria-expanded="false"
    aria-controls="uploadInstructions">
    How do I upload?
  </button>
</p>

<div class="collapse" id="uploadInstructions">
  <UploadInstructions />
</div>

<h2>Recent Uploads</h2>
<p>
  This shows all recent uploads to the site. Click
  <a href="/personal">here to see your personal upload history.</a>
</p>

<IndexView limit={8} />
