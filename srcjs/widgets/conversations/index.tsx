import React from "react";
import ReactDOM from "react-dom/client";
import { Conversations } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface ConversationItem {
  key: string;
  label: string;
  group?: string;
}

interface ConversationsWidgetProps {
  inputId: string;
  items: ConversationItem[];
  activeKey?: string;
  groupable?: boolean;
  showCreation?: boolean;
}

function ConversationsWidget({ inputId, items, activeKey, groupable = false, showCreation = false }: ConversationsWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Conversations
        items={items}
        activeKey={activeKey}
        groupable={groupable}
        creation={showCreation ? {
          onClick: () => Shiny.setInputValue(`${inputId}_new`, { ts: Date.now() }, { priority: "event" })
        } : undefined}
        onActiveChange={(key) => {
          Shiny.setInputValue(inputId, { key, ts: Date.now() }, { priority: "event" });
        }}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "conversations",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: ConversationsWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<ConversationsWidget {...x} />);
      },
      resize() {},
    };
  },
});
