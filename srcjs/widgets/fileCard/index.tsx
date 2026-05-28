import React from "react";
import ReactDOM from "react-dom/client";
import { FileCard } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface FileCardItem {
  name: string;
  byte?: number;
  type?: string;
  src?: string;
  loading?: boolean;
}

interface FileCardWidgetProps {
  inputId?: string;
  items: FileCardItem[];
  size?: "small" | "default";
}

function FileCardWidget({ inputId, items, size = "default" }: FileCardWidgetProps) {
  if (items.length === 1) {
    const item = items[0];
    return (
      <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
        <FileCard
          name={item.name}
          byte={item.byte}
          type={item.type as "file" | "image" | undefined}
          src={item.src}
          loading={item.loading}
          size={size}
          onClick={inputId ? (_, e) => {
            e.preventDefault();
            Shiny.setInputValue(inputId, { name: item.name, ts: Date.now() }, { priority: "event" });
          } : undefined}
        />
      </ConfigProvider>
    );
  }
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <FileCard.List
        items={items.map((item, i) => ({
          name: item.name,
          byte: item.byte,
          type: item.type as "file" | "image" | undefined,
          src: item.src,
          loading: item.loading,
          uid: String(i),
        }))}
        size={size}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "fileCard",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: FileCardWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<FileCardWidget {...x} />);
      },
      resize() {},
    };
  },
});
