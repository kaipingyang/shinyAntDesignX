import React, { useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { XCard, registerCatalog } from "@ant-design/x-card";
import type { XAgentCommand_v0_9, Catalog, ActionPayload } from "@ant-design/x-card";
import { ConfigProvider, theme as antdTheme } from "antd";
import { SHINY_DEFAULT_CATALOG, SHINY_DEFAULT_COMPONENTS } from "../../xCardDefaults";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return <div style={{ color: "red", padding: 8, fontSize: 12, fontFamily: "monospace" }}>
        <strong>XCard Error:</strong> {String(this.state.error)}
      </div>;
    }
    return this.props.children;
  }
}

// Register default catalog once
registerCatalog(SHINY_DEFAULT_CATALOG);

interface XCardWidgetProps {
  inputId?: string;
  surfaceId: string | string[];
  commands: XAgentCommand_v0_9[];
  catalog?: Catalog;
}

function XCardWidget({ inputId, surfaceId, commands, catalog }: XCardWidgetProps) {
  // Register custom catalog if provided
  useMemo(() => {
    if (catalog) registerCatalog(catalog);
  }, [catalog]);

  const surfaceIds = Array.isArray(surfaceId) ? surfaceId : [surfaceId];

  const handleAction = useCallback((payload: ActionPayload) => {
    if (inputId) {
      Shiny.setInputValue(inputId, {
        name: payload.name,
        surfaceId: payload.surfaceId,
        context: payload.context,
        ts: Date.now(),
      }, { priority: "event" });
    }
  }, [inputId]);

  return (
    <ErrorBoundary>
      <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
        <XCard.Box
          commands={commands}
          onAction={handleAction}
          components={SHINY_DEFAULT_COMPONENTS}
        >
          {surfaceIds.map((id) => <XCard.Card key={id} id={id} />)}
        </XCard.Box>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

HTMLWidgets.widget({
  name: "xCard",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: XCardWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<XCardWidget {...x} />);
      },
      resize() {},
    };
  },
});
