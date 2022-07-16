import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "build/index.js",
  output: {
    dir: "test",
    format: "esm",
  },
  plugins: [
    nodeResolve({
      modulesOnly: true,
    }),
    commonjs(),
  ],
};
