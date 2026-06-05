import React from "react";
import ReactDOM from "react-dom/client";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
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

const customTheme = {
  ...nightOwl,
  'pre[class*="language-"]': {
    ...(nightOwl as any)['pre[class*="language-"]'],
    margin: 0,
    borderRadius: 0,
    fontSize: 13,
    lineHeight: 1.6,
  },
  // R: TRUE/FALSE/NA/NULL map to boolean token which is red in nightOwl — remap to orange
  'boolean': { color: 'rgb(247, 140, 108)' },
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
      <div style={{ borderRadius: 6, border: "1px solid #1d3b53", overflow: "hidden", fontSize: 13 }}>
        {showHeader && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 12px",
            background: "#012840",
            borderBottom: "1px solid #1d3b53",
            minHeight: 32,
          }}>
            <span style={{ fontSize: 11, color: "#637777", fontFamily: "monospace" }}>
              {displayLang}
            </span>
          </div>
        )}
        {useLang ? (
          <SyntaxHighlighter
            language={useLang}
            style={customTheme}
            wrapLines={true}
            codeTagProps={{ style: { background: "transparent", color: "inherit" } }}
            PreTag="div"
          >
            {code.replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <pre style={{ margin: 0, padding: "12px 16px", background: "#011627", overflow: "auto", lineHeight: 1.6 }}>
            <code style={{ color: "#637777" }}>{code}</code>
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
