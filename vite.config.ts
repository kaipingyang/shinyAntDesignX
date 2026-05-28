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
