import ReactDOM from "react-dom/client";
import { ConfigProvider, theme as antdTheme } from "antd";
import { notification as xNotification } from "@ant-design/x";
import React, { useEffect } from "react";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

// Uses upstream XNotification (tag-based dedup via permissionMap).
// NOTE: duration is in SECONDS (matches upstream — internally multiplied by 1000).
interface NotificationWidgetProps {
  inputId?: string;
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  duration?: number;            // seconds (upstream semantics)
  requireInteraction?: boolean;
  requestPermission?: boolean;
}

function NotificationWidget({ inputId, title, body, icon, tag, duration = 4, requireInteraction = false, requestPermission = false }: NotificationWidgetProps) {
  useEffect(() => {
    const fire = () => {
      xNotification.open({
        title,
        body,
        icon,
        tag,
        requireInteraction,
        // duration omitted when requireInteraction so the notification stays open
        ...(requireInteraction ? {} : { duration }),
        onClick: (_event: Event, close: () => void) => {
          if (inputId) {
            Shiny.setInputValue(inputId, { action: "click", tag: tag ?? title, ts: Date.now() }, { priority: "event" });
          }
          close();
        },
      } as any);
    };

    if (xNotification.permission === "granted") {
      fire();
    } else if (xNotification.permission !== "denied" && requestPermission) {
      xNotification.requestPermission().then((perm: NotificationPermission) => {
        if (perm === "granted") fire();
      });
    }
  }, [title, body, icon, tag, duration, requireInteraction]);

  // No visible UI — this widget fires a browser notification and renders nothing
  return null;
}

HTMLWidgets.widget({
  name: "notification",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: NotificationWidgetProps) {
        if (!root) {
          el.style.display = "none";
          root = ReactDOM.createRoot(el);
        }
        root.render(
          <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
            <NotificationWidget {...x} />
          </ConfigProvider>
        );
      },
      resize() {},
    };
  },
});
