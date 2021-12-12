const BUCKET = process.env.PROJECT_ID;

export async function get({ params }) {
  const { task_id, prefix } = params;
  return {
    headers: {
      Location: `https://storage.googleapis.com/${BUCKET}/v1/uploads/${task_id}/${prefix}`,
    },
    status: 302,
  };
}
