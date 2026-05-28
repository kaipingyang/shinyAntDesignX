import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const entry = process.env.WIDGET_ENTRY || "antDesignX";

const entryMap: Record<string, string> = {
  antDesignX:      "srcjs/index.tsx",
  xmarkdown:       "srcjs/widgets/xmarkdown/index.tsx",
  codeHighlighter: "srcjs/widgets/codeHighlighter/index.tsx",
  mermaid:         "srcjs/widgets/mermaid/index.tsx",
  thoughtChain:    "srcjs/widgets/thoughtChain/index.tsx",
  sender:          "srcjs/widgets/sender/index.tsx",
  think:           "srcjs/widgets/think/index.tsx",
  welcome:         "srcjs/widgets/welcome/index.tsx",
  prompts:         "srcjs/widgets/prompts/index.tsx",
  bubbleList:      "srcjs/widgets/bubbleList/index.tsx",
  actions:         "srcjs/widgets/actions/index.tsx",
  sources:         "srcjs/widgets/sources/index.tsx",
  fileCard:        "srcjs/widgets/fileCard/index.tsx",
  folder:          "srcjs/widgets/folder/index.tsx",
  conversations:   "srcjs/widgets/conversations/index.tsx",
};

const entryFile = entryMap[entry];
if (!entryFile) throw new Error(`Unknown WIDGET_ENTRY: ${entry}`);

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: resolve(__dirname, entryFile),
      name: `shinyAntDesignX_${entry}`,
      formats: ["iife"],
      fileName: () => `${entry}.js`,
    },
    outDir: "inst/www",
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: `${entry}.css`,
      },
    },
  },
});
