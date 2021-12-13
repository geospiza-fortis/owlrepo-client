export async function get({ params }) {
  const { task_id, prefix } = params;
  return {
    headers: {
      Location: `https://storage.googleapis.com/__PROJECT_ID__/v1/uploads/${task_id}/${prefix}`,
    },
    status: 302,
  };
}
