import React from "react";
import ReactDOM from "react-dom/client";
import { CodeHighlighter } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;

interface CodeHighlighterWidgetProps {
  code: string;
  lang?: string;
  showHeader?: boolean;
}

function CodeHighlighterWidget({ code, lang, showHeader = true }: CodeHighlighterWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <CodeHighlighter lang={lang} header={showHeader ? undefined : false}>
        {code}
      </CodeHighlighter>
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
