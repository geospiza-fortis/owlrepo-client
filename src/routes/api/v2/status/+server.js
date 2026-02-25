import { json } from "@sveltejs/kit";

export async function GET() {
  return json({
    status: "ok",
    mode: import.meta.env.MODE,
    project_id: import.meta.env.VITE_PROJECT_ID,
    version: "__VERSION__",
    git_sha: "__GIT_COMMIT__",
    build_time: "__BUILD_TIME__",
    tauri_version: "__TAURI_VERSION__",
    ...(import.meta.env.MODE == "development"
      ? {
          tauri: import.meta.env.VITE_TAURI == "true",
          owlrepo_api_url: import.meta.env.VITE_OWLREPO_URL,
        }
      : {}),
  });
}
