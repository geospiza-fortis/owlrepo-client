import node from "@sveltejs/adapter-node";
import adapterStatic from "@sveltejs/adapter-static";
import { mdsvex } from "mdsvex";

const config = {
  // options passed to svelte.compile (https://svelte.dev/docs#svelte_compile)
  compilerOptions: {},

  // an array of file extensions that should be treated as Svelte components
  extensions: [".svelte", ".svx"],

  kit: {
    adapter:
      process.env.VITE_TAURI == "true"
        ? adapterStatic({
            fallback: "index.html",
          })
        : node(),
  },

  // options passed to svelte.preprocess (https://svelte.dev/docs#svelte_preprocess)
  preprocess: [mdsvex()],
};

export default config;
