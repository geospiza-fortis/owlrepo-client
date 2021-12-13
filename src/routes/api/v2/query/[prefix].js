export async function get({ params }) {
  const { prefix } = params;
  return {
    headers: {
      Location: `https://storage.googleapis.com/__PROJECT_ID__/v1/queries/${prefix}.json`,
    },
    status: 302,
  };
}
