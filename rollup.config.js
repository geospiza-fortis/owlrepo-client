import svelte from "rollup-plugin-svelte";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-css-only";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import globals from "rollup-plugin-node-globals";
import inject from "@rollup/plugin-inject";
import { mdsvex } from "mdsvex";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
      extensions: [".svelte", ".svx"],
      preprocess: mdsvex(),
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),
    // https://github.com/rollup/rollup/issues/487
    // deal with the environment
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development"
      ),
    }),
    // fix missing moment import inside of tabulator
    inject({
      moment: "moment",
      url: "url",
    }),
    json(),
    nodeResolve({
      browser: true,
      dedupe: ["svelte"],
      preferBuiltins: false,
    }),
    commonjs({
      requireReturnsDefault: true,
    }),
    globals(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}
