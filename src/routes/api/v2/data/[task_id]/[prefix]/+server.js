import { json, redirect } from "@sveltejs/kit";

const BUCKET = import.meta.env.VITE_PROJECT_ID;

export async function GET({ params, fetch }) {
  const { task_id, prefix } = params;
  const location = `https://storage.googleapis.com/${BUCKET}/v1/uploads/${task_id}/${prefix}`;

  if (import.meta.env.VITE_TAURI == "true") {
    let resp = await fetch(location);
    return json(await resp.json(), { status: resp.status });
  }

  redirect(302, location);
}
