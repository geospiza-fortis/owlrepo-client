<script>
  import Uploader from "../components/Uploader.svelte";
  import IndexView from "../components/IndexView.svelte";
  import CollapseInfo from "../components/CollapseInfo.svelte";
  import UploadInstructions from "../docs/UploadInstructions.svx";
</script>

<h1>Upload Owls</h1>

<Uploader />

<CollapseInfo
  component={UploadInstructions}
  componentId="uploadInstructions"
  text="How do I upload?" />

<h2>Recent Uploads</h2>
<p>
  This shows all recent uploads to the site. Click
  <a href="/personal">here to see your personal upload history.</a>
</p>

<IndexView limit={8} />
