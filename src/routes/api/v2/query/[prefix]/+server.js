import { json, redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { PROJECT_ID, TAURI_MODE } from "$env/static/private";

export async function GET({ params, fetch }) {
  const { prefix } = params;
  const location = `https://storage.googleapis.com/${PROJECT_ID}/v1/queries/${prefix}.json`;

  if (TAURI_MODE == "true" || dev) {
    let resp = await fetch(location);
    if (!resp.ok) {
      return json({ error: `GCS returned ${resp.status}` }, { status: resp.status });
    }
    return json(await resp.json(), { status: resp.status });
  }

  redirect(302, location);
}
