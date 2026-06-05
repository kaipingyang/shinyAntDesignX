import React, { useMemo, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { XMarkdown } from "@ant-design/x-markdown";
import type { StreamingOption, ComponentProps } from "@ant-design/x-markdown";
import "@ant-design/x-markdown/themes/light.css";
import { ConfigProvider, theme as antdTheme, Typography } from "antd";
import hljs from "highlight.js/lib/core";
import r from "highlight.js/lib/languages/r";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";   // covers html
import css from "highlight.js/lib/languages/css";
import "highlight.js/styles/atom-one-dark.css";
import type { CSSProperties } from "react";

hljs.registerLanguage("r", r);
hljs.registerLanguage("R", r);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("json", json);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);

// @ts-ignore
declare const HTMLWidgets: any;

// Extract plain text from React children (hljs requires string)
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement(children)) {
    return extractText((children.props as any).children);
  }
  return "";
}

// ── Preset component implementations ────────────────────────────────────────

const PresetCodeBlock: React.FC<ComponentProps> = ({ children, lang, block }) => {
  const codeRef = useRef<HTMLElement>(null);
  const code = extractText(children);

  useEffect(() => {
    if (codeRef.current) {
      // Reset to allow re-highlight on content change
      codeRef.current.removeAttribute("data-highlighted");
      if (lang && hljs.getLanguage(lang)) {
        const result = hljs.highlight(code, { language: lang });
        codeRef.current.innerHTML = result.value;
      } else {
        // Auto-detect or plain text
        const result = hljs.highlightAuto(code);
        codeRef.current.innerHTML = result.value;
      }
    }
  }, [code, lang]);

  if (!block) return <code>{children}</code>;

  return (
    <div style={{
      borderRadius: 6,
      border: "1px solid #373b41",
      marginBottom: 12,
      overflow: "hidden",
      fontSize: 13,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 12px",
        background: "#21252b",
        borderBottom: "1px solid #373b41",
        minHeight: 32,
      }}>
        <span style={{ fontSize: 11, color: "#abb2bf", fontFamily: "monospace" }}>
          {lang ?? ""}
        </span>
      </div>
      <pre style={{ margin: 0, padding: "12px 16px", background: "#282c34", overflow: "auto", lineHeight: 1.6 }}>
        <code ref={codeRef} className={lang ? `language-${lang}` : undefined} />
      </pre>
    </div>
  );
};

const PresetInlineCode: React.FC<ComponentProps> = ({ children }) => (
  <Typography.Text code style={{ fontSize: "0.9em" }}>{children}</Typography.Text>
);

// ExternalLink: use native <a> — Typography.Link swallows href in some antd versions
const PresetExternalLink: React.FC<ComponentProps & { href?: string; target?: string }> = ({
  children, href, target, domNode: _domNode, streamStatus: _ss, lang: _lang, block: _block, ...rest
}) => (
  <a
    href={href}
    target={target ?? "_blank"}
    rel="noopener noreferrer"
    style={{ color: "#1677ff", textDecoration: "underline" }}
    {...rest}
  >
    {children}
    {(!target || target === "_blank") && (
      <span style={{ fontSize: "0.75em", marginLeft: 2, opacity: 0.6 }}>↗</span>
    )}
  </a>
);

// Registry: preset name → component
const PRESET_REGISTRY: Record<string, React.ComponentType<any>> = {
  CodeBlock:    PresetCodeBlock,
  InlineCode:   PresetInlineCode,
  ExternalLink: PresetExternalLink,
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
    const comp = PRESET_REGISTRY[presetName];
    if (comp) resolved[tag] = comp;
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
