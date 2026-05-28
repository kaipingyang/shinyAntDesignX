import React from "react";
import ReactDOM from "react-dom/client";
import { Sources } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface SourceItem {
  key?: string;
  title: string;
  url?: string;
  description?: string;
}

interface SourcesWidgetProps {
  inputId?: string;
  items: SourceItem[];
  title?: string;
  defaultExpanded?: boolean;
  inline?: boolean;
}

function SourcesWidget({ inputId, items, title, defaultExpanded = true, inline = false }: SourcesWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Sources
        title={title}
        items={items}
        defaultExpanded={defaultExpanded}
        inline={inline}
        onClick={(item) => {
          if (inputId) {
            Shiny.setInputValue(inputId, { key: item.key, title: item.title, url: item.url, ts: Date.now() }, { priority: "event" });
          } else if (item.url) {
            window.open(item.url, "_blank");
          }
        }}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "sources",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: SourcesWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<SourcesWidget {...x} />);
      },
      resize() {},
    };
  },
});
