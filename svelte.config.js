import node from "@sveltejs/adapter-node";
import nodePolyfills from "rollup-plugin-polyfill-node";
import replace from "@rollup/plugin-replace";
import { mdsvex } from "mdsvex";
import dotenv from "dotenv";
import child_process from "child_process";
import inject from "@rollup/plugin-inject";

// import pkg from "./package.json";

dotenv.config();

let replaceVersion = () =>
  replace({
    __VERSION__: process.env.npm_package_version,
    __GIT_COMMIT__: child_process
      .execSync("git rev-parse HEAD")
      .toString()
      .trim()
      .slice(0, 8),
    preventAssignment: true,
  });

const config = {
  // options passed to svelte.compile (https://svelte.dev/docs#svelte_compile)
  compilerOptions: null,

  // an array of file extensions that should be treated as Svelte components
  extensions: [".svelte", ".svx"],

  kit: {
    adapter: node(),
    amp: false,
    appDir: "_app",
    files: {
      assets: "static",
      hooks: "src/hooks",
      lib: "src/lib",
      routes: "src/routes",
      serviceWorker: "src/service-worker",
      template: "src/app.html",
    },
    floc: false,
    hydrate: true,
    paths: {
      assets: "",
      base: "",
    },
    prerender: {
      crawl: true,
      enabled: true,
      entries: ["*"],
    },
    router: true,
    ssr: true,
    vite: () => ({
      plugins: [
        replaceVersion(),
        // fix missing moment import inside of tabulator
        inject({
          exclude: "**/*.css",
          moment: "moment",
          url: "url",
        }),
        nodePolyfills(),
      ],
    }),
  },

  // options passed to svelte.preprocess (https://svelte.dev/docs#svelte_preprocess)
  preprocess: [mdsvex()],
};

export default config;
