import React from "react";
import ReactDOM from "react-dom/client";
import { Prompts } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";
import {
  BulbOutlined, FireOutlined, RocketOutlined, ReadOutlined, CommentOutlined,
  CheckCircleOutlined, InfoCircleOutlined, StarOutlined, ThunderboltOutlined,
  SmileOutlined, HeartOutlined, CoffeeOutlined, QuestionCircleOutlined,
} from "@ant-design/icons";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

const ICON_MAP: Record<string, React.ReactNode> = {
  bulb: <BulbOutlined />, fire: <FireOutlined />, rocket: <RocketOutlined />,
  read: <ReadOutlined />, comment: <CommentOutlined />, check: <CheckCircleOutlined />,
  info: <InfoCircleOutlined />, star: <StarOutlined />, thunder: <ThunderboltOutlined />,
  smile: <SmileOutlined />, heart: <HeartOutlined />, coffee: <CoffeeOutlined />,
  question: <QuestionCircleOutlined />,
};

interface PromptItem {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
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
    ...(item.icon && ICON_MAP[item.icon] ? { icon: ICON_MAP[item.icon] } : {}),
    ...(item.disabled ? { disabled: true } : {}),
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
