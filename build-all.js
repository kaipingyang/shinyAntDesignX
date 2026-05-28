#!/usr/bin/env node
// Build all widgets sequentially
const { execSync } = require("child_process");

const NODE = "/home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node";
const VITE = "./node_modules/.bin/vite";
const widgets = ["antDesignX", "xmarkdown", "codeHighlighter", "mermaid", "thoughtChain"];

for (const widget of widgets) {
  console.log(`\n=== Building ${widget} ===`);
  execSync(`WIDGET_ENTRY=${widget} ${NODE} ${VITE} build`, {
    stdio: "inherit",
    env: { ...process.env, WIDGET_ENTRY: widget },
  });
}
console.log("\n✓ All widgets built.");
