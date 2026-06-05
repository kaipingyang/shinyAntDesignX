import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme as antdTheme } from "antd";
import { SyntaxHighlighter, SUPPORTED_LANGS, codeTheme, CODE_TAG_PROPS } from "../../prismConfig";

// @ts-ignore
declare const HTMLWidgets: any;

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
            style={codeTheme}
            wrapLines={true}
            codeTagProps={CODE_TAG_PROPS}
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
