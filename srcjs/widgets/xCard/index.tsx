import React, { useState, useCallback, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { XCard, registerCatalog } from "@ant-design/x-card";
import type { XAgentCommand_v0_9, Catalog, ActionPayload } from "@ant-design/x-card";
import { ConfigProvider, theme as antdTheme } from "antd";
import { Button, Input, Select, Tag } from "antd";

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

// Built-in default catalog with basic components
const DEFAULT_CATALOG: Catalog = {
  catalogId: "shiny-default",
  components: {
    Text: {
      props: {
        text: { type: "string" },
        variant: { type: "string", enum: ["h1", "h2", "h3", "body"] },
      },
    },
    Button: {
      props: {
        label: { type: "string" },
        variant: { type: "string", enum: ["primary", "default", "dashed", "text", "link"] },
        disabled: { type: "boolean" },
        action: { type: "object" },
      },
    },
    Input: {
      props: {
        label: { type: "string" },
        placeholder: { type: "string" },
        defaultValue: { type: "string" },
      },
    },
    Select: {
      props: {
        label: { type: "string" },
        options: { type: "array" },
        defaultValue: { type: "string" },
        action: { type: "object" },
      },
    },
    Tag: {
      props: {
        text: { type: "string" },
        color: { type: "string" },
      },
    },
  },
};

// Default component implementations
const DefaultComponents: Record<string, React.ComponentType<any>> = {
  Text: ({ text, variant, children }: { text?: string; variant?: string; children?: React.ReactNode }) => {
    const content = text ?? children;
    const styleMap: Record<string, React.CSSProperties> = {
      h1: { fontSize: 20, fontWeight: 700, margin: "0 0 12px" },
      h2: { fontSize: 17, fontWeight: 600, margin: "0 0 8px" },
      h3: { fontSize: 15, fontWeight: 600, margin: "0 0 6px" },
      body: { fontSize: 14, margin: 0 },
    };
    return <p style={styleMap[variant ?? "body"] ?? styleMap.body}>{content}</p>;
  },
  Button: ({ label, variant = "default", disabled, action, onAction }: any) => (
    <Button
      type={variant === "primary" ? "primary" : variant as any}
      disabled={disabled}
      onClick={() => {
        if (action?.event && onAction) {
          onAction(action.event.name, action.event.context ?? {});
        }
      }}
      style={{ margin: "4px 2px" }}
    >
      {label}
    </Button>
  ),
  Input: ({ label, placeholder, defaultValue }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <Input placeholder={placeholder} defaultValue={defaultValue} />
    </div>
  ),
  Select: ({ label, options = [], defaultValue, action, onAction }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <Select
        defaultValue={defaultValue}
        options={(options as string[]).map((o) => ({ value: o, label: o }))}
        style={{ width: "100%" }}
        onChange={(v) => {
          if (action?.event && onAction) {
            onAction(action.event.name, { ...action.event.context, value: v });
          }
        }}
      />
    </div>
  ),
  Tag: ({ text, color }: any) => <Tag color={color}>{text}</Tag>,
};

// Register default catalog once
registerCatalog(DEFAULT_CATALOG);

interface XCardWidgetProps {
  inputId?: string;
  surfaceId: string;
  commands: XAgentCommand_v0_9[];
  catalog?: Catalog;
}

function XCardWidget({ inputId, surfaceId, commands, catalog }: XCardWidgetProps) {
  // Register custom catalog if provided
  useMemo(() => {
    if (catalog) registerCatalog(catalog);
  }, [catalog]);

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
          components={DefaultComponents}
        >
          <XCard.Card id={surfaceId} />
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
