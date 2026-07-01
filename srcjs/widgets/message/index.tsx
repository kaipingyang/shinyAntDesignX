import ReactDOM from "react-dom/client";
import { ConfigProvider, message, theme as antdTheme } from "antd";
import React, { useEffect } from "react";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

// antd in-page Message — top-center single-line toast.
// Uses the hook API (message.useMessage) not static message.success() so the
// toast respects ConfigProvider theme/locale (static methods use a detached React root).
type MessageType = "success" | "error" | "info" | "warning" | "loading";

interface MessageWidgetProps {
  inputId?: string;
  type?: MessageType;
  content: string;
  duration?: number;     // seconds; 0 = never auto-close
  key?: string;          // stable key → update-in-place instead of stacking
  ts?: number;           // bump to re-fire same payload
}

function MessageWidget({ type = "info", content, duration = 3, key, ts }: MessageWidgetProps) {
  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!content) return;
    api.open({ type, content, duration, ...(key ? { key } : {}) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, content, duration, key, ts]);

  return contextHolder;
}

HTMLWidgets.widget({
  name: "message",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: MessageWidgetProps) {
        if (!root) {
          el.style.display = "none";
          root = ReactDOM.createRoot(el);
        }
        root.render(
          <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
            <MessageWidget {...x} />
          </ConfigProvider>
        );
      },
      resize() {},
    };
  },
});
