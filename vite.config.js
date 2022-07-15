import { sveltekit } from "@sveltejs/kit/vite";
import dotenv from "dotenv";
import child_process from "child_process";
import inject from "@rollup/plugin-inject";
import fs from "fs";
import replace from "@rollup/plugin-replace";

const pkg = JSON.parse(
  fs.readFileSync(new URL("package.json", import.meta.url), "utf8")
);

const tauri_conf = JSON.parse(
  fs.readFileSync(new URL("src-tauri/tauri.conf.json", import.meta.url), "utf8")
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
    __TAURI_VERSION__: tauri_conf.package.version,
    preventAssignment: true,
  });

const config = {
  mode: process.env.MODE || "development",
  ssr: {
    noExternal:
      process.env.NODE_ENV == "development"
        ? ["@popperjs/core"]
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
    sveltekit(),
  ],
};

export default config;
