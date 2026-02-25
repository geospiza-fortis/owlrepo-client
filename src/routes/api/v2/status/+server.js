import { json } from "@sveltejs/kit";
import { PROJECT_ID, TAURI_MODE } from "$env/static/private";
import { PUBLIC_OWLREPO_URL } from "$env/static/public";

export async function GET() {
  return json({
    status: "ok",
    mode: import.meta.env.MODE,
    project_id: PROJECT_ID,
    version: "__VERSION__",
    git_sha: "__GIT_COMMIT__",
    build_time: "__BUILD_TIME__",
    tauri_version: "__TAURI_VERSION__",
    ...(import.meta.env.MODE == "development"
      ? {
          tauri: TAURI_MODE == "true",
          owlrepo_api_url: PUBLIC_OWLREPO_URL,
        }
      : {}),
  });
}
