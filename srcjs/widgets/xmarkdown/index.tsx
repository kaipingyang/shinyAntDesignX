import React from "react";
import ReactDOM from "react-dom/client";
import { XMarkdown } from "@ant-design/x-markdown";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;

interface XMarkdownWidgetProps {
  content: string;
  streaming?: boolean;
  openLinksInNewTab?: boolean;
}

function XMarkdownWidget({ content, streaming = false, openLinksInNewTab = false }: XMarkdownWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <XMarkdown
        content={content}
        streaming={streaming ? { hasNextChunk: true, enableAnimation: true } : undefined}
        openLinksInNewTab={openLinksInNewTab}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "xmarkdown",
  type: "output",
  factory(el: HTMLElement, _width: number, _height: number) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: XMarkdownWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<XMarkdownWidget {...x} />);
      },
      resize() {},
    };
  },
});
