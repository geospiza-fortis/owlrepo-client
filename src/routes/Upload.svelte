<script>
  import Uploader from "../components/Uploader.svelte";
  import IndexView from "../components/IndexView.svelte";
  import CollapseInfo from "../components/CollapseInfo.svelte";
  import TopUploaders from "../components/TopUploaders.svelte";
  import ActivityHeatmap from "../components/ActivityHeatmap.svelte";
  import PublicKey from "../docs/PublicKey.svelte";
  import UploadInstructions from "../docs/UploadInstructions.svx";
</script>

<h1>Upload Owls</h1>

<Uploader />

<CollapseInfo
  component={UploadInstructions}
  componentId="uploadInstructions"
  text="How do I upload?" />

<h2>Top Uploaders</h2>

<p>These are the top uploaders for the past week.</p>

<CollapseInfo
  component={PublicKey}
  componentId="publicKey"
  text="What is a thumbprint?" />

<TopUploaders />

<h2>Recent Uploads</h2>
<p>
  This shows all recent uploads to the site. Click
  <a href="/personal">here to see your personal upload history.</a>
</p>

<IndexView limit={8} />

{#await fetch('/api/v1/query/heatmap').then(resp => resp.json()) then data}
  <ActivityHeatmap {data} max_range={14} />
{/await}
