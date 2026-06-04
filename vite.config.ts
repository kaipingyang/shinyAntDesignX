import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const entry = process.env.WIDGET_ENTRY || "antDesignX";

const entryMap: Record<string, string> = {
  vendor:          "srcjs/vendor.ts",
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
  attachments:     "srcjs/widgets/attachments/index.tsx",
  suggestion:      "srcjs/widgets/suggestion/index.tsx",
  notification:    "srcjs/widgets/notification/index.tsx",
  xCard:           "srcjs/widgets/xCard/index.tsx",
};

const entryFile = entryMap[entry];
if (!entryFile) throw new Error(`Unknown WIDGET_ENTRY: ${entry}`);

// vendor bundle: include everything, no externals
const isVendor = entry === "vendor";

const externals = isVendor ? [] : [
  "react",
  "react-dom",
  "react-dom/client",
  "antd",
  "@ant-design/x",
  "@ant-design/x-markdown",
  "@ant-design/x-card",
  "@ant-design/x-sdk",
  "@ant-design/icons",
];

const globals: Record<string, string> = {
  "react":                  "window.React",
  "react-dom":              "window.ReactDOM",
  "react-dom/client":       "window.ReactDOM",
  "antd":                   "window.antd",
  "@ant-design/x":          "window.AntDesignX",
  "@ant-design/x-markdown": "window.AntDesignXMarkdown",
  "@ant-design/x-card":     "window.AntDesignXCard",
  "@ant-design/x-sdk":      "window.AntDesignXSdk",
  "@ant-design/icons":      "window.AntDesignIcons",
};

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
      external: externals,
      output: {
        assetFileNames: `${entry}.css`,
        globals,
      },
    },
  },
});
