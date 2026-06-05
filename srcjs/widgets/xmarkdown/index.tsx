import React, { useMemo, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { XMarkdown } from "@ant-design/x-markdown";
import type { StreamingOption, ComponentProps } from "@ant-design/x-markdown";
import "@ant-design/x-markdown/themes/light.css";
import { ConfigProvider, theme as antdTheme, Typography, Button, Space, message } from "antd";
import type { CSSProperties } from "react";

// @ts-ignore
declare const HTMLWidgets: any;

// ── Preset component implementations ────────────────────────────────────────

const PresetCodeBlock: React.FC<ComponentProps> = ({ children, lang }) => {
  const [copied, setCopied] = React.useState(false);
  const code = typeof children === "string" ? children : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      message.error("复制失败");
    });
  }, [code]);

  return (
    <div style={{
      position: "relative",
      background: "#f6f8fa",
      borderRadius: 6,
      border: "1px solid #e8eaed",
      marginBottom: 12,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 12px",
        background: "#eef0f3",
        borderBottom: "1px solid #e8eaed",
        minHeight: 32,
      }}>
        <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
          {lang || ""}
        </span>
        <Button
          size="small"
          type="text"
          onClick={handleCopy}
          style={{ fontSize: 11, color: "#6b7280", height: 22, padding: "0 6px" }}
        >
          {copied ? "✓ 已复制" : "复制"}
        </Button>
      </div>
      <pre style={{ margin: 0, padding: "12px 16px", overflow: "auto", fontSize: 13, lineHeight: 1.6 }}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

const PresetInlineCode: React.FC<ComponentProps> = ({ children }) => (
  <Typography.Text code style={{ fontSize: "0.9em" }}>{children}</Typography.Text>
);

const PresetExternalLink: React.FC<ComponentProps & { href?: string; target?: string }> = ({
  children, href, target, ...rest
}) => (
  <Typography.Link
    href={href}
    target={target ?? "_blank"}
    rel="noopener noreferrer"
    {...(rest as any)}
  >
    {children}
    {(!target || target === "_blank") && (
      <span style={{ fontSize: "0.75em", marginLeft: 2, opacity: 0.6 }}>↗</span>
    )}
  </Typography.Link>
);

// Registry: preset name → { tag, component }
const PRESET_REGISTRY: Record<string, { tag: string; component: React.ComponentType<any> }> = {
  CodeBlock:    { tag: "code",  component: PresetCodeBlock },
  InlineCode:   { tag: "code",  component: PresetInlineCode },
  ExternalLink: { tag: "a",     component: PresetExternalLink },
};

/**
 * streaming: boolean (legacy shorthand) OR StreamingOption object.
 * When boolean true → { hasNextChunk: true, enableAnimation: true }.
 *
 * components: Record<tagName, presetName> — e.g. { code: "CodeBlock", a: "ExternalLink" }
 * Preset names: "CodeBlock", "InlineCode", "ExternalLink"
 */
interface XMarkdownWidgetProps {
  content?: string;
  streaming?: boolean | StreamingOption;
  openLinksInNewTab?: boolean;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  paragraphTag?: string;
  dompurifyConfig?: Record<string, any>;
  protectCustomTagNewlines?: boolean;
  escapeRawHtml?: boolean;
  debug?: boolean;
  /** Map of HTML tag name → preset component name, e.g. { code: "CodeBlock" } */
  components?: Record<string, string>;
}

function resolveStreaming(streaming: boolean | StreamingOption | undefined): StreamingOption | undefined {
  if (!streaming) return undefined;
  if (streaming === true) return { hasNextChunk: true, enableAnimation: true };
  return streaming as StreamingOption;
}

function resolveComponents(
  components?: Record<string, string>
): Record<string, React.ComponentType<any>> | undefined {
  if (!components || Object.keys(components).length === 0) return undefined;
  const resolved: Record<string, React.ComponentType<any>> = {};
  for (const [tag, presetName] of Object.entries(components)) {
    const entry = PRESET_REGISTRY[presetName];
    if (entry) {
      resolved[tag] = entry.component;
    }
  }
  return Object.keys(resolved).length > 0 ? resolved : undefined;
}

function XMarkdownWidget({
  content = "",
  streaming,
  openLinksInNewTab = false,
  className,
  rootClassName,
  style,
  paragraphTag,
  dompurifyConfig,
  protectCustomTagNewlines,
  escapeRawHtml,
  debug,
  components,
}: XMarkdownWidgetProps) {
  const resolvedComponents = useMemo(() => resolveComponents(components), [components]);
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <XMarkdown
        content={content}
        streaming={resolveStreaming(streaming)}
        openLinksInNewTab={openLinksInNewTab}
        className={className}
        rootClassName={rootClassName}
        style={style}
        paragraphTag={paragraphTag as any}
        dompurifyConfig={dompurifyConfig as any}
        protectCustomTagNewlines={protectCustomTagNewlines}
        escapeRawHtml={escapeRawHtml}
        debug={debug}
        components={resolvedComponents}
      />
    </ConfigProvider>
  );
}


HTMLWidgets.widget({
  name: "xmarkdown",
  type: "output",
  factory(el: HTMLElement, _width: number, _height: number) {
    let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
    return {
      renderValue(x: XMarkdownWidgetProps) {
        if (!root) root = ReactDOM.createRoot(el);
        root.render(<XMarkdownWidget {...x} />);
      },
      resize() {},
    };
  },
});
