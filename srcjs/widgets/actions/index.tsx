import React from "react";
import ReactDOM from "react-dom/client";
import { Actions } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface ActionItem {
  key: string;
  label?: string;
  icon?: string;
  danger?: boolean;
}

interface ActionsWidgetProps {
  inputId: string;
  items: ActionItem[];
  variant?: "borderless" | "filled" | "outlined";
}

// Simple icon resolution from string name
function getIcon(name?: string): React.ReactNode {
  if (!name) return undefined;
  // Return emoji-based fallback for common actions — avoids importing all icons
  const map: Record<string, string> = {
    copy: "📋", like: "👍", dislike: "👎", refresh: "🔄", share: "🔗",
    delete: "🗑️", edit: "✏️", download: "⬇️", audio: "🔊",
  };
  return map[name] ? <span>{map[name]}</span> : undefined;
}

function ActionsWidget({ inputId, items, variant = "borderless" }: ActionsWidgetProps) {
  const actionItems = items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: getIcon(item.icon),
    danger: item.danger,
    onItemClick: () => {
      Shiny.setInputValue(inputId, { key: item.key, ts: Date.now() }, { priority: "event" });
    },
  }));

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Actions
        items={actionItems}
        variant={variant}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "actions",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: ActionsWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<ActionsWidget {...x} />);
      },
      resize() {},
    };
  },
});
