/**
 * This script is used to rename the binary with the platform specific postfix.
 * When `tauri build` is ran, it looks for the binary name appended with the
 * platform specific postfix.
 *
 * https://github.com/tauri-apps/tauri/blob/dev/examples/sidecar/scripts/move-binary.js
 * https://github.com/leafac/caxa
 */

// The full command from the parent directory
// npx caxa --input . --exclude .svelte-kit --exclude src-tauri --output "owlrepo.exe" -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/scripts/index.js"

import { execa } from "execa";
import caxa from "caxa";

(async () => {
  const name = "owlrepo-localhost";
  const rustInfo = (await execa("rustc", ["-vV"])).stdout;
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
  if (!targetTriple) {
    console.error("Failed to determine platform target triple");
  }

  const bin_name = `src-tauri/target/${name}-${targetTriple}.exe`;
  await caxa.default({
    input: ".",
    exclude: [".svelte-kit", "src-tauri"],
    output: bin_name,
    // We are not actually able to run the binary via node build/ anymore...
    command: ["{{caxa}}/node_modules/.bin/node", "{{caxa}}/scripts/index.js"],
  });

  console.log(`Built ${bin_name}`);
})();
