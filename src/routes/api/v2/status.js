export async function GET({ params }) {
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
      tauri_version: "__TAURI_VERSION__",
      ...(import.meta.env.MODE == "development"
        ? { owlrepo_api_url: import.meta.env.VITE_OWLREPO_URL }
        : {}),
    },
    status: 200,
  };
}
