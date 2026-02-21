import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

const config = {
  extensions: [".svelte", ".svx"],

  kit: {
    adapter: adapter(),
  },

  preprocess: [vitePreprocess(), mdsvex()],
};

export default config;
