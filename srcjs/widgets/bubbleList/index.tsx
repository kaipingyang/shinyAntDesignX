import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { Bubble } from "@ant-design/x";
import { Avatar, ConfigProvider, theme as antdTheme } from "antd";
import XMarkdown from "@ant-design/x-markdown";
import "@ant-design/x-markdown/themes/light.css";

// @ts-ignore
declare const HTMLWidgets: any;

interface BubbleItem {
  key: string;
  role: "user" | "assistant" | "system";
  content: string;
  loading?: boolean;
}

interface BubbleListWidgetProps {
  items: BubbleItem[];
  assistantAvatar?: { fallback?: string; src?: string };
  userPlacement?: "start" | "end";
}

function BubbleListWidget({ items, assistantAvatar = { fallback: "AI" }, userPlacement = "end" }: BubbleListWidgetProps) {
  const roles = useMemo(() => ({
    user: { placement: userPlacement },
    assistant: {
      placement: "start" as const,
      avatar: assistantAvatar.src
        ? <Avatar src={assistantAvatar.src} />
        : <Avatar>{assistantAvatar.fallback ?? "AI"}</Avatar>,
      contentRender: (content: string) => <XMarkdown content={content} />,
    },
    system: {
      variant: "borderless" as const,
    },
  }), [assistantAvatar, userPlacement]);

  const bubbleItems = useMemo(() =>
    items.map((item) => ({
      key: item.key,
      role: item.role,
      content: item.content,
      loading: item.loading,
    })),
  [items]);

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Bubble.List items={bubbleItems} role={roles} autoScroll />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "bubbleList",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: BubbleListWidgetProps) {
        if (!root) {
          el.style.overflow = "hidden";
          root = ReactDOM.createRoot(el);
        }
        root.render(<BubbleListWidget {...x} />);
      },
      resize() {},
    };
  },
});
