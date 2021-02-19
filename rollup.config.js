import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
// import inject from "@rollup/plugin-inject";
import { terser } from "rollup-plugin-terser";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";
import { mdsvex } from "mdsvex";
import dotenv from "dotenv";
dotenv.config();

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) =>
  (warning.code === "MISSING_EXPORT" && /'preload'/.test(warning.message)) ||
  (warning.code === "CIRCULAR_DEPENDENCY" &&
    /[/\\]@sapper[/\\]/.test(warning.message)) ||
  onwarn(warning);

export default {
  client: {
    input: config.client.input(),
    output: config.client.output(),
    plugins: [
      replace({
        values: {
          // "process.browser": true,
          "process.env.NODE_ENV": JSON.stringify(mode),
        },
      }),
      svelte({
        compilerOptions: {
          dev,
          hydratable: true,
        },
        extensions: [".svelte", ".svx"],
        preprocess: mdsvex(),
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
        preferBuiltins: false,
      }),
      // There are instances of double quotes and backticks, so there needs to be
      // a rule for each one.
      replace({
        "/api": !dev ? '"/api' : `"${process.env.OWLREPO_URL}/api`,
        delimiters: ['"', ""],
      }),
      replace({
        "/api": !dev ? "`/api" : `\`${process.env.OWLREPO_URL}/api`,
        delimiters: ["`", ""],
      }),
      // fix missing moment import inside of tabulator
      // inject({
      //   moment: "moment",
      //   url: "url",
      // }),
      commonjs({
        requireReturnsDefault: true,
      }),

      legacy &&
        babel({
          extensions: [".js", ".mjs", ".html", ".svelte"],
          babelHelpers: "runtime",
          exclude: ["node_modules/@babel/**"],
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
              },
            ],
          ],
          plugins: [
            "@babel/plugin-syntax-dynamic-import",
            [
              "@babel/plugin-transform-runtime",
              {
                useESModules: true,
              },
            ],
          ],
        }),

      !dev &&
        terser({
          module: true,
        }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: config.server.input(),
    output: config.server.output(),
    plugins: [
      replace({
        values: {
          // "process.browser": false,
          "process.env.NODE_ENV": JSON.stringify(mode),
        },
      }),
      svelte({
        compilerOptions: {
          dev,
          generate: "ssr",
          hydratable: true,
        },
        emitCss: false,
        extensions: [".svelte", ".svx"],
        preprocess: mdsvex(),
      }),

      resolve({
        dedupe: ["svelte"],
      }),
      commonjs(),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules
    ),

    preserveEntrySignatures: "strict",
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input(),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        values: {
          // "process.browser": true,
          "process.env.NODE_ENV": JSON.stringify(mode),
        },
      }),
      commonjs(),
      !dev && terser(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },
};
