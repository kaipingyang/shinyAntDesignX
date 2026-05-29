import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Suggestion } from "@ant-design/x";
import type { SuggestionItem } from "@ant-design/x";
import { ConfigProvider, Input, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface SuggestionWidgetProps {
  inputId: string;
  items: Array<{ value: string; label: string; description?: string; icon?: string }>;
  placeholder?: string;
  block?: boolean;
}

function SuggestionWidget({ inputId, items, placeholder = "Type / for suggestions", block = true }: SuggestionWidgetProps) {
  const [value, setValue] = useState("");

  const suggestionItems: SuggestionItem[] = items.map((item) => ({
    value: item.value,
    label: (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontWeight: 500 }}>{item.label}</span>
        {item.description && <span style={{ color: "#6b7280", fontSize: "12px" }}>{item.description}</span>}
      </div>
    ),
  }));

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Suggestion
        items={suggestionItems}
        block={block}
        styles={{ content: { display: "block" } }}
        onSelect={(val) => {
          setValue(val);
          Shiny.setInputValue(inputId, { value: val, ts: Date.now() }, { priority: "event" });
        }}
      >
        {({ onTrigger, onKeyDown }) => (
          <Input
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const v = e.target.value;
              setValue(v);
              if (v === "/") onTrigger();
              else if (!v.startsWith("/")) onTrigger(false);
            }}
            onKeyDown={onKeyDown}
            style={{ width: "100%" }}
          />
        )}
      </Suggestion>
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "suggestion",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: SuggestionWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<SuggestionWidget {...x} />);
      },
      resize() {},
    };
  },
});
