import React from "react";
import ReactDOM from "react-dom/client";
import AntDesignX from "./AntDesignX";
import type { WidgetConfig } from "./types";

// @ts-ignore — HTMLWidgets is loaded globally by Shiny
declare const HTMLWidgets: {
  widget: (def: {
    name: string;
    type: string;
    factory: (
      el: HTMLElement,
      width: number,
      height: number
    ) => {
      renderValue: (x: { inputId: string; config: WidgetConfig }) => void;
      resize: (width: number, height: number) => void;
    };
  }) => void;
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      return (
        <div style={{ padding: "1rem", color: "red", fontFamily: "monospace", fontSize: "12px", border: "1px solid red" }}>
          <strong>AntDesignX Error:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(e)}</pre>
          <pre style={{ whiteSpace: "pre-wrap" }}>{e?.stack ?? "(no stack)"}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

HTMLWidgets.widget({
  name: "antDesignX",
  type: "output",

  factory(el, _width, _height) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

    return {
      renderValue(x) {
        if (!root) {
          el.style.display = "flex";
          el.style.flexDirection = "column";
          el.style.overflow = "hidden";
          root = ReactDOM.createRoot(el);
        }
        root.render(
          <ErrorBoundary>
            <AntDesignX inputId={x.inputId} config={x.config ?? {}} />
          </ErrorBoundary>
        );
      },
      resize(_width, _height) {
        // Layout handled by CSS
      },
    };
  },
});
