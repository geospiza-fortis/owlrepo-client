import node from "@sveltejs/adapter-node";
import replace from "@rollup/plugin-replace";
import { mdsvex } from "mdsvex";
import dotenv from "dotenv";
import child_process from "child_process";
import inject from "@rollup/plugin-inject";
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";
import fs from "fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("package.json", import.meta.url), "utf8")
);

dotenv.config();

let replaceVersion = () =>
  replace({
    __VERSION__: process.env.npm_package_version,
    __GIT_COMMIT__: child_process
      .execSync("git rev-parse HEAD")
      .toString()
      .trim()
      .slice(0, 8),
    __BUILD_TIME__: new Date().toISOString(),
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
      mode: process.env.MODE || "development",
      ssr: {
        noExternal:
          process.env.NODE_ENV == "development"
            ? []
            : Object.keys(pkg.dependencies || {}),
      },
      plugins: [
        replaceVersion(),
        // fix missing moment import inside of tabulator
        inject({
          exclude: "**/*.css",
          moment: "moment",
          url: "url",
        }),
        optimizeLodashImports(),
      ],
    }),
  },

  // options passed to svelte.preprocess (https://svelte.dev/docs#svelte_preprocess)
  preprocess: [mdsvex()],
};

export default config;
