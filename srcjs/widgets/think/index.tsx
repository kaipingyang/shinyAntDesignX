import React from "react";
import ReactDOM from "react-dom/client";
import { Think } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;

interface ThinkWidgetProps {
  content: string;
  title?: string;
  loading?: boolean;
  defaultExpanded?: boolean;
}

function ThinkWidget({ content, title, loading = false, defaultExpanded = false }: ThinkWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Think
        title={title}
        loading={loading}
        blink={loading}
        defaultExpanded={defaultExpanded}
      >
        {content}
      </Think>
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "think",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: ThinkWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<ThinkWidget {...x} />);
      },
      resize() {},
    };
  },
});
