// Shared default XCard catalog schema + component implementations
// Used by both the standalone xCard widget and the antDesignX chat widget.
import React from "react";
import { Button, Input, Select, Tag } from "antd";
import type { Catalog } from "@ant-design/x-card";

export const SHINY_DEFAULT_CATALOG: Catalog = {
  catalogId: "shiny-default",
  components: {
    Text: {
      props: {
        text:    { type: "string" },
        variant: { type: "string", enum: ["h1", "h2", "h3", "body"] },
      },
    },
    Button: {
      props: {
        label:    { type: "string" },
        variant:  { type: "string", enum: ["primary", "default", "dashed", "text", "link"] },
        disabled: { type: "boolean" },
        action:   { type: "object" },
      },
    },
    Input: {
      props: {
        label:        { type: "string" },
        placeholder:  { type: "string" },
        defaultValue: { type: "string" },
      },
    },
    Select: {
      props: {
        label:        { type: "string" },
        options:      { type: "array" },
        defaultValue: { type: "string" },
        action:       { type: "object" },
      },
    },
    Tag: {
      props: {
        text:  { type: "string" },
        color: { type: "string" },
      },
    },
    Container: {
      props: {
        gap:     { type: "number" },
        padding: { type: "string" },
      },
    },
  },
};

export const SHINY_DEFAULT_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Text: ({ text, variant, children }: { text?: string; variant?: string; children?: React.ReactNode }) => {
    const content = text ?? children;
    const styleMap: Record<string, React.CSSProperties> = {
      h1:   { fontSize: 20, fontWeight: 700, margin: "0 0 12px" },
      h2:   { fontSize: 17, fontWeight: 600, margin: "0 0 8px" },
      h3:   { fontSize: 15, fontWeight: 600, margin: "0 0 6px" },
      body: { fontSize: 14, margin: 0 },
    };
    return <p style={styleMap[variant ?? "body"] ?? styleMap.body}>{content}</p>;
  },
  Button: ({ label, variant = "default", disabled, action, onAction }: any) => (
    <Button
      type={variant === "primary" ? "primary" : variant as any}
      disabled={disabled}
      onClick={() => {
        // Pass empty context — let Card.resolveActionContextPathRefs read paths
        // from dataModel via actionConfig. Passing action.event.context directly
        // would override the resolved values with raw {path} objects.
        if (action?.event && onAction) onAction(action.event.name, {});
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
        onChange={(v) => { if (action?.event && onAction) onAction(action.event.name, { ...action.event.context, value: v }); }}
      />
    </div>
  ),
  Tag: ({ text, color }: any) => <Tag color={color}>{text}</Tag>,
  // Container: generic flex column wrapper, used as root node to hold children
  Container: ({ children, gap = 8, padding = "0" }: { children?: React.ReactNode; gap?: number; padding?: string }) => (
    <div style={{ display: "flex", flexDirection: "column", gap, padding }}>{children}</div>
  ),
};
