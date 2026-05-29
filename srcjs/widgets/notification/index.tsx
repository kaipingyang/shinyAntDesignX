import ReactDOM from "react-dom/client";
import { ConfigProvider, theme as antdTheme } from "antd";
import React, { useEffect } from "react";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

// XNotification uses browser Notification API directly — no React component needed
interface NotificationWidgetProps {
  inputId?: string;
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  duration?: number;
  requireInteraction?: boolean;
  requestPermission?: boolean;
}

function NotificationWidget({ inputId, title, body, icon, tag, duration = 4000, requireInteraction = false, requestPermission = false }: NotificationWidgetProps) {
  useEffect(() => {
    const fire = () => {
      const n = new Notification(title, { body, icon, tag, requireInteraction });
      if (duration && !requireInteraction) {
        setTimeout(() => n.close(), duration);
      }
      if (inputId) {
        n.onclick = () => {
          Shiny.setInputValue(inputId, { action: "click", tag: tag ?? title, ts: Date.now() }, { priority: "event" });
          n.close();
        };
      }
    };

    if (Notification.permission === "granted") {
      fire();
    } else if (Notification.permission !== "denied" && requestPermission) {
      Notification.requestPermission().then((perm) => {
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
