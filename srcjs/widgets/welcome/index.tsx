import React from "react";
import ReactDOM from "react-dom/client";
import { Welcome } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;

interface WelcomeWidgetProps {
  title?: string;
  description?: string;
  variant?: "filled" | "borderless";
}

function WelcomeWidget({ title = "AI Assistant", description = "How can I help you today?", variant = "filled" }: WelcomeWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Welcome title={title} description={description} variant={variant} />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "welcome",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: WelcomeWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<WelcomeWidget {...x} />);
      },
      resize() {},
    };
  },
});
