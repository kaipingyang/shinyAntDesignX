import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { Mermaid } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;

interface MermaidWidgetProps {
  diagram: string;
  enableZoom?: boolean;
  enableDownload?: boolean;
  enableCopy?: boolean;
}

function MermaidWidget({ diagram, enableZoom = true, enableDownload = true, enableCopy = true }: MermaidWidgetProps) {
  const actions = useMemo(() => ({ enableZoom, enableDownload, enableCopy }), [enableZoom, enableDownload, enableCopy]);
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Mermaid actions={actions}>{diagram}</Mermaid>
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "mermaid",
  type: "output",
  factory(el: HTMLElement, _width: number, _height: number) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: MermaidWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<MermaidWidget {...x} />);
      },
      resize() {},
    };
  },
});
