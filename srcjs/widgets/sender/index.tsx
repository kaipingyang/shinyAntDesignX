import React, { useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Sender } from "@ant-design/x";
import { ConfigProvider, theme as antdTheme } from "antd";

// @ts-ignore
declare const HTMLWidgets: any;
declare const Shiny: any;

interface SenderWidgetProps {
  inputId: string;
  placeholder?: string;
  loading?: boolean;
  allowSpeech?: boolean;
  submitType?: "enter" | "shiftEnter";
}

function SenderWidget({ inputId, placeholder = "Send a message…", loading = false, allowSpeech = false, submitType }: SenderWidgetProps) {
  const [value, setValueState] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(loading);

  // Allow R to push loading state via custom message
  React.useEffect(() => {
    Shiny.addCustomMessageHandler(`${inputId}:loading`, (data: { loading: boolean }) => {
      setIsLoading(data.loading);
    });
  }, [inputId]);

  const handleSubmit = useCallback((text: string) => {
    if (!text.trim()) return;
    Shiny.setInputValue(inputId, { text, ts: Date.now() }, { priority: "event" });
    setValueState("");
  }, [inputId]);

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <Sender
        value={value}
        onChange={setValueState}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        loading={isLoading}
        onCancel={() => setIsLoading(false)}
        allowSpeech={allowSpeech}
        submitType={submitType}
      />
    </ConfigProvider>
  );
}

HTMLWidgets.widget({
  name: "sender",
  type: "output",
  factory(el: HTMLElement) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    let props: SenderWidgetProps | null = null;
    return {
      renderValue(x: SenderWidgetProps) {
        props = x;
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<SenderWidget {...x} />);
      },
      resize() {},
    };
  },
});
