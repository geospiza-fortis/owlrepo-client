import { json } from "@sveltejs/kit";
import { PROJECT_ID } from "$env/static/private";

export async function GET({ params, fetch }) {
  const { prefix } = params;
  const url = `https://storage.googleapis.com/${PROJECT_ID}/v1/queries/${prefix}.json`;
  const resp = await fetch(url);
  if (!resp.ok) {
    return json({ error: `GCS returned ${resp.status}` }, { status: resp.status });
  }
  return json(await resp.json(), {
    status: resp.status,
    headers: { expires: resp.headers.get("expires") || "" },
  });
}
