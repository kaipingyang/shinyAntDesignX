import ReactDOM from "react-dom/client";
import { ConfigProvider, notification, theme as antdTheme } from "antd";
import React, { useEffect } from "react";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

// antd in-page Notification — corner card with title + description.
// Uses the hook API (notification.useNotification) not static notification.open()
// so the card respects ConfigProvider theme/locale.
type NotifyType = "success" | "error" | "info" | "warning";
type Placement = "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight";

interface NotifyWidgetProps {
  inputId?: string;
  type?: NotifyType;
  message: string;              // card title
  description?: string;
  placement?: Placement;        // default topRight
  duration?: number;            // seconds; 0 = never auto-close
  key?: string;                 // stable key → update-in-place / target for close
  ts?: number;                  // bump to re-fire same payload
}

function NotifyWidget({ inputId, type = "info", message: title, description, placement = "topRight", duration = 4.5, key, ts }: NotifyWidgetProps) {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (!title) return;
    api.open({
      type,
      message: title,
      description,
      placement,
      duration,
      ...(key ? { key } : {}),
      onClick: () => {
        if (inputId) {
          Shiny.setInputValue(inputId, { action: "click", key: key ?? title, ts: Date.now() }, { priority: "event" });
        }
      },
      onClose: () => {
        if (inputId) {
          Shiny.setInputValue(inputId, { action: "close", key: key ?? title, ts: Date.now() }, { priority: "event" });
        }
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, title, description, placement, duration, key, ts]);

  return contextHolder;
}

HTMLWidgets.widget({
  name: "notify",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: NotifyWidgetProps) {
        if (!root) {
          el.style.display = "none";
          root = ReactDOM.createRoot(el);
        }
        root.render(
          <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
            <NotifyWidget {...x} />
          </ConfigProvider>
        );
      },
      resize() {},
    };
  },
});
