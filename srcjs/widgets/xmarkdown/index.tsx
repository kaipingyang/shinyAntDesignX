import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { XMarkdown } from "@ant-design/x-markdown";
import type { StreamingOption, ComponentProps } from "@ant-design/x-markdown";
import "@ant-design/x-markdown/themes/light.css";
import { ConfigProvider, theme as antdTheme, Typography } from "antd";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rLang from "refractor/r";
import pythonLang from "refractor/python";
import javascriptLang from "refractor/javascript";
import typescriptLang from "refractor/typescript";
import bashLang from "refractor/bash";
import sqlLang from "refractor/sql";
import jsonLang from "refractor/json";
import markupLang from "refractor/markup";
import cssLang from "refractor/css";
import type { CSSProperties } from "react";

// Register all languages into our own PrismLight instance
SyntaxHighlighter.registerLanguage("r", rLang);
SyntaxHighlighter.registerLanguage("R", rLang);
SyntaxHighlighter.registerLanguage("python", pythonLang);
SyntaxHighlighter.registerLanguage("javascript", javascriptLang);
SyntaxHighlighter.registerLanguage("typescript", typescriptLang);
SyntaxHighlighter.registerLanguage("bash", bashLang);
SyntaxHighlighter.registerLanguage("shell", bashLang);
SyntaxHighlighter.registerLanguage("sql", sqlLang);
SyntaxHighlighter.registerLanguage("json", jsonLang);
SyntaxHighlighter.registerLanguage("html", markupLang);
SyntaxHighlighter.registerLanguage("xml", markupLang);
SyntaxHighlighter.registerLanguage("css", cssLang);

// @ts-ignore
declare const HTMLWidgets: any;

// Extract plain text from React children (SyntaxHighlighter requires string)
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

const customOneDark = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...(oneDark as any)['pre[class*="language-"]'],
    margin: 0,
    borderRadius: 0,
    fontSize: 13,
    lineHeight: 1.6,
  },
};

const PresetCodeBlock: React.FC<ComponentProps> = ({ children, lang, block }) => {
  if (!block) return <code>{children}</code>;

  const code = extractText(children).replace(/\n$/, "");
  const normalizedLang = lang?.toLowerCase();
  const supportedLangs = ["r", "python", "javascript", "typescript", "bash", "shell", "sql", "json", "html", "xml", "css"];
  const useLang = normalizedLang && supportedLangs.includes(normalizedLang) ? normalizedLang : undefined;

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
      {useLang ? (
        <SyntaxHighlighter
          language={useLang}
          style={customOneDark}
          wrapLines={true}
          codeTagProps={{ style: { background: "transparent" } }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <pre style={{ margin: 0, padding: "12px 16px", background: "#282c34", overflow: "auto", lineHeight: 1.6 }}>
          <code style={{ color: "#abb2bf" }}>{code}</code>
        </pre>
      )}
    </div>
  );
};

const PresetInlineCode: React.FC<ComponentProps> = ({ children }) => (
  <Typography.Text code style={{ fontSize: "0.9em" }}>{children}</Typography.Text>
);

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
