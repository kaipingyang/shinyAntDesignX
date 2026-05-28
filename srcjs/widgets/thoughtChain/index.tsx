import React from "react";
import ReactDOM from "react-dom/client";
import { ThoughtChain } from "@ant-design/x";
import type { ThoughtChainItemType } from "@ant-design/x";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  StopOutlined,
  SearchOutlined,
  DatabaseOutlined,
  CodeOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  CodeSandboxOutlined,
  ExperimentOutlined,
  ToolOutlined,
  BulbOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;

const ICON_MAP: Record<string, React.ReactNode> = {
  search:   <SearchOutlined />,
  database: <DatabaseOutlined />,
  code:     <CodeOutlined />,
  globe:    <GlobalOutlined />,
  zap:      <ThunderboltOutlined />,
  terminal: <CodeSandboxOutlined />,
  flask:    <ExperimentOutlined />,
  wrench:   <ToolOutlined />,
  bulb:     <BulbOutlined />,
  shield:   <SafetyOutlined />,
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  loading: <LoadingOutlined style={{ color: "#9ca3af" }} />,
  success: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
  error:   <CloseCircleOutlined style={{ color: "#dc2626" }} />,
  abort:   <StopOutlined style={{ color: "#6b7280" }} />,
};

interface RawItem {
  key: string;
  title?: string;
  description?: string;
  content?: string;
  status?: "loading" | "success" | "error" | "abort";
  icon?: string;
  collapsible?: boolean;
  blink?: boolean;
}

interface ThoughtChainWidgetProps {
  items: RawItem[];
  line?: boolean | "solid" | "dashed" | "dotted";
}

function buildItems(raw: RawItem[]): ThoughtChainItemType[] {
  return raw.map((item) => ({
    key: item.key,
    title: item.title,
    description: item.description,
    content: item.content ? (
      <pre style={{ margin: 0, fontSize: "12px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        {item.content}
      </pre>
    ) : undefined,
    status: item.status,
    icon: item.icon
      ? (ICON_MAP[item.icon] ?? STATUS_ICON[item.status ?? "loading"])
      : STATUS_ICON[item.status ?? "loading"],
    collapsible: item.collapsible ?? true,
    blink: item.blink ?? item.status === "loading",
  }));
}

function ThoughtChainWidget({ items, line = "solid" }: ThoughtChainWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <ThoughtChain items={buildItems(items)} line={line as "solid"} />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "thoughtChain",
  type: "output",
  factory(el: HTMLElement, _width: number, _height: number) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: ThoughtChainWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<ThoughtChainWidget {...x} />);
      },
      resize() {},
    };
  },
});
