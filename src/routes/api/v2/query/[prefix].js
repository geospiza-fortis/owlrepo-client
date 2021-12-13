const BUCKET = import.meta.env.VITE_PROJECT_ID;

export async function get({ params }) {
  const { prefix } = params;
  return {
    headers: {
      Location: `https://storage.googleapis.com/${BUCKET}/v1/queries/${prefix}.json`,
    },
    status: 302,
  };
}
