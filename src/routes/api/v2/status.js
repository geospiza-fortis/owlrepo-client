export async function get({ params }) {
  const { prefix } = params;
  return {
    body: {
      status: "ok",
      mode: import.meta.env.MODE,
      project_id: import.meta.env.VITE_PROJECT_ID,
      version: "__VERSION__",
      git_sha: "__GIT_COMMIT__",
      build_time: "__BUILD_TIME__",
      tauri: import.meta.env.VITE_TAURI == "true",
    },
    status: 200,
  };
}
