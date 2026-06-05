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

// vendor (x-sdk only): x-sdk has no UMD build, must be bundled
const isVendor = entry === "vendor";

const externals = isVendor ? [
  // x-sdk vendor only needs react as external (react is loaded separately)
  "react",
  "react-dom",
  "react-dom/client",
] : [
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

// globals match actual window variable names from each UMD file:
// react → window.React, react-dom → window.ReactDOM
// react-dom/client is a subpath of react-dom — no separate UMD, maps to same ReactDOM global
// antd → window.antd, @ant-design/x → window.antdx
// @ant-design/icons → window.icons, @ant-design/x-markdown → window.XMarkdown
// @ant-design/x-card → window.XCard, @ant-design/x-sdk → window.AntDesignXSdk
const globals: Record<string, string> = {
  "react":                  "React",
  "react-dom":              "ReactDOM",
  "react-dom/client":       "ReactDOM",
  "antd":                   "antd",
  "@ant-design/x":          "antdx",
  "@ant-design/x-markdown": "XMarkdown",
  "@ant-design/x-card":     "XCard",
  "@ant-design/x-sdk":      "AntDesignXSdk",
  "@ant-design/icons":      "icons",
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
