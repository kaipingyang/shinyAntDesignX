import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { Folder } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface FolderNode {
  title: string;
  path: string;
  content?: string;
  children?: FolderNode[];
}

interface FolderWidgetProps {
  inputId?: string;
  treeData: FolderNode[];
  defaultExpandAll?: boolean;
}

function FolderWidget({ inputId, treeData, defaultExpandAll = true }: FolderWidgetProps) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Folder
        treeData={treeData}
        defaultExpandAll={defaultExpandAll}
        onFileClick={(filePath, content) => {
          if (inputId) {
            Shiny.setInputValue(inputId, { path: filePath, content: content ?? null, ts: Date.now() }, { priority: "event" });
          }
        }}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "folder",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: FolderWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<FolderWidget {...x} />);
      },
      resize() {},
    };
  },
});
