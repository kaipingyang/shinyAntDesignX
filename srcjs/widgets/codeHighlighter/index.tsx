import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ConfigProvider, theme as antdTheme } from "antd";
import rLang from "refractor/r";
import pythonLang from "refractor/python";
import javascriptLang from "refractor/javascript";
import typescriptLang from "refractor/typescript";
import bashLang from "refractor/bash";
import sqlLang from "refractor/sql";
import jsonLang from "refractor/json";
import markupLang from "refractor/markup";
import cssLang from "refractor/css";
import jsxLang from "refractor/jsx";
import tsxLang from "refractor/tsx";
import yamlLang from "refractor/yaml";

// @ts-ignore
declare const HTMLWidgets: any;

SyntaxHighlighter.registerLanguage("r", rLang);
SyntaxHighlighter.registerLanguage("R", rLang);
SyntaxHighlighter.registerLanguage("python", pythonLang);
SyntaxHighlighter.registerLanguage("py", pythonLang);
SyntaxHighlighter.registerLanguage("javascript", javascriptLang);
SyntaxHighlighter.registerLanguage("js", javascriptLang);
SyntaxHighlighter.registerLanguage("typescript", typescriptLang);
SyntaxHighlighter.registerLanguage("ts", typescriptLang);
SyntaxHighlighter.registerLanguage("bash", bashLang);
SyntaxHighlighter.registerLanguage("shell", bashLang);
SyntaxHighlighter.registerLanguage("sh", bashLang);
SyntaxHighlighter.registerLanguage("sql", sqlLang);
SyntaxHighlighter.registerLanguage("json", jsonLang);
SyntaxHighlighter.registerLanguage("html", markupLang);
SyntaxHighlighter.registerLanguage("xml", markupLang);
SyntaxHighlighter.registerLanguage("css", cssLang);
SyntaxHighlighter.registerLanguage("jsx", jsxLang);
SyntaxHighlighter.registerLanguage("tsx", tsxLang);
SyntaxHighlighter.registerLanguage("yaml", yamlLang);
SyntaxHighlighter.registerLanguage("yml", yamlLang);

const SUPPORTED_LANGS = new Set([
  "r", "python", "py", "javascript", "js", "typescript", "ts",
  "bash", "shell", "sh", "sql", "json", "html", "xml", "css",
  "jsx", "tsx", "yaml", "yml",
]);

const customOneDark = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...(oneDark as any)['pre[class*="language-"]'],
    margin: 0,
    borderRadius: 0,
    fontSize: 13,
    lineHeight: 1.6,
  },
};

interface CodeHighlighterWidgetProps {
  code: string;
  lang?: string;
  showHeader?: boolean;
}

function CodeHighlighterWidget({ code, lang, showHeader = true }: CodeHighlighterWidgetProps) {
  const normalizedLang = lang?.toLowerCase();
  const useLang = normalizedLang && SUPPORTED_LANGS.has(normalizedLang) ? normalizedLang : undefined;
  const displayLang = lang ?? "";

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <div style={{ borderRadius: 6, border: "1px solid #373b41", overflow: "hidden", fontSize: 13 }}>
        {showHeader && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 12px",
            background: "#21252b",
            borderBottom: "1px solid #373b41",
            minHeight: 32,
          }}>
            <span style={{ fontSize: 11, color: "#abb2bf", fontFamily: "monospace" }}>
              {displayLang}
            </span>
          </div>
        )}
        {useLang ? (
          <SyntaxHighlighter
            language={useLang}
            style={customOneDark}
            wrapLines={true}
            codeTagProps={{ style: { background: "transparent" } }}
            PreTag="div"
          >
            {code.replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <pre style={{ margin: 0, padding: "12px 16px", background: "#282c34", overflow: "auto", lineHeight: 1.6 }}>
            <code style={{ color: "#abb2bf" }}>{code}</code>
          </pre>
        )}
      </div>
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "codeHighlighter",
  type: "output",
  factory(el: HTMLElement, _width: number, _height: number) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: CodeHighlighterWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<CodeHighlighterWidget {...x} />);
      },
      resize() {},
    };
  },
});
