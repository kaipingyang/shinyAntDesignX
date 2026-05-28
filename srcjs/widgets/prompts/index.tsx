import React from "react";
import ReactDOM from "react-dom/client";
import { Prompts } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface PromptItem {
  key: string;
  label: string;
  description?: string;
  icon?: string;
}

interface PromptsWidgetProps {
  inputId: string;
  items: PromptItem[];
  title?: string;
  vertical?: boolean;
  wrap?: boolean;
}

function PromptsWidget({ inputId, items, title, vertical = false, wrap = true }: PromptsWidgetProps) {
  const promptItems = items.map((item) => ({
    key: item.key,
    label: item.label,
    description: item.description,
  }));

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Prompts
        title={title}
        items={promptItems}
        vertical={vertical}
        wrap={wrap}
        onItemClick={(info) => {
          Shiny.setInputValue(inputId, { key: info.data.key, label: info.data.label, ts: Date.now() }, { priority: "event" });
        }}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "prompts",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: PromptsWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<PromptsWidget {...x} />);
      },
      resize() {},
    };
  },
});
