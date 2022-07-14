const BUCKET = import.meta.env.VITE_PROJECT_ID;

export async function get({ params }) {
  const { prefix } = params;
  const location = `https://storage.googleapis.com/${BUCKET}/v1/queries/${prefix}.json`;

  if (import.meta.env.VITE_TAURI == "true") {
    let resp = await fetch(location);
    return {
      status: resp.status,
      body: await resp.json(),
    };
  }

  return {
    headers: {
      Location: location,
    },
    status: 302,
  };
}
