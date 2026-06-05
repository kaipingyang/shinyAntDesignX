import React, { useState, useRef, useEffect, useMemo } from "react";
import { ThoughtChain, Think } from "@ant-design/x";
import { XMarkdown } from "@ant-design/x-markdown";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  StopOutlined,
  SearchOutlined,
  DatabaseOutlined,
  CodeOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  CodeSandboxOutlined,
  ExperimentOutlined,
  ToolOutlined,
  BulbOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { ToolCallState } from "../types";
import type { ShinyMessage } from "../ShinyBridgeChatProvider";

// ── Icon mapping ──────────────────────────────────────────────────────────────
const TOOL_ICONS: Record<string, React.ReactNode> = {
  "search":   <SearchOutlined />,
  "database": <DatabaseOutlined />,
  "code":     <CodeOutlined />,
  "globe":    <GlobalOutlined />,
  "zap":      <ThunderboltOutlined />,
  "terminal": <CodeSandboxOutlined />,
  "flask":    <ExperimentOutlined />,
  "wrench":   <ToolOutlined />,
  "bulb":     <BulbOutlined />,
  "shield":   <SafetyOutlined />,
};

// ── Tool result renderers ─────────────────────────────────────────────────────
function TableResult({ data }: { data: unknown }) {
  let rows: Record<string, unknown>[];
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    if (!Array.isArray(parsed) || parsed.length === 0 || typeof parsed[0] !== "object")
      throw new Error("not a table");
    rows = parsed as Record<string, unknown>[];
  } catch {
    return <pre style={{ margin: 0, fontSize: "12px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{String(data)}</pre>;
  }
  const columns = Object.keys(rows[0]);
  return (
    <div style={{ overflowX: "auto", maxHeight: "240px", overflowY: "auto", borderRadius: "4px", border: "1px solid #e5e7eb" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ border: "1px solid #e5e7eb", padding: "4px 8px", background: "#f9fafb", fontWeight: 600, textAlign: "left", position: "sticky", top: 0, whiteSpace: "nowrap" }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "white" : "#f9fafb" }}>
              {columns.map((col) => (
                <td key={col} style={{ border: "1px solid #e5e7eb", padding: "4px 8px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(row[col] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToolResultContent({ tc }: { tc: ToolCallState }) {
  const ann = tc.annotations ?? {};
  const resultType = (ann.resultType as string | undefined) ?? "auto";
  const result = tc.result;
  const display = typeof result === "string" ? result : JSON.stringify(result, null, 2);
  if (tc.isError) {
    return <pre style={{ margin: 0, fontSize: "12px", color: "#991b1b", background: "rgba(220,38,38,0.06)", padding: "6px 8px", borderRadius: "4px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{display}</pre>;
  }
  switch (resultType) {
    case "table":    return <TableResult data={result} />;
    case "markdown": return <div style={{ fontSize: "13px", lineHeight: 1.6 }}>{display}</div>;
    case "image":    return <img src={display} alt="result" style={{ maxWidth: "100%", borderRadius: "4px" }} />;
    case "html":     return <div style={{ fontSize: "13px" }} dangerouslySetInnerHTML={{ __html: display }} />;
    case "file": {
      const filename = (ann.resultFilename as string | undefined) ?? "download";
      return <a href={display} download={filename} style={{ fontSize: "12px", color: "#1677ff" }}>⬇ {filename}</a>;
    }
    default:
      return <pre style={{ margin: 0, fontSize: "12px", background: "rgba(0,0,0,0.04)", padding: "6px 8px", borderRadius: "4px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{display}</pre>;
  }
}

// ── ThoughtChain builder ──────────────────────────────────────────────────────
function buildThoughtChainItems(
  toolCalls: ToolCallState[],
  onApprove: (id: string, approved: boolean) => void,
) {
  return toolCalls.map((tc) => {
    const ann = tc.annotations ?? {};
    const title = (ann.title as string | undefined) ?? tc.toolName;
    const iconName = ann.icon as string | undefined;
    const requiresApproval = ann.requiresApproval === true;
    const awaiting = tc.status === "loading" && requiresApproval;
    const icon = awaiting ? <SafetyOutlined style={{ color: "#d97706" }} />
      : tc.status === "loading" ? <LoadingOutlined style={{ color: "#9ca3af" }} />
      : tc.status === "success" ? <CheckCircleOutlined style={{ color: "#16a34a" }} />
      : tc.status === "error"   ? <CloseCircleOutlined style={{ color: "#dc2626" }} />
      : <StopOutlined style={{ color: "#6b7280" }} />;
    const footer = awaiting ? (
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button onClick={() => onApprove(tc.toolCallId, true)} style={{ padding: "4px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "#16a34a", color: "#fff" }}>Approve</button>
        <button onClick={() => onApprove(tc.toolCallId, false)} style={{ padding: "4px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "#6b7280", color: "#fff" }}>Deny</button>
      </div>
    ) : undefined;
    const argsDisplay = typeof tc.argsText === "string" ? tc.argsText : JSON.stringify(tc.args, null, 2);
    const content = (
      <div>
        <div style={{ color: "#9ca3af", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Arguments</div>
        <pre style={{ margin: 0, padding: "6px 8px", borderRadius: "4px", background: "rgba(0,0,0,0.04)", fontSize: "12px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{argsDisplay}</pre>
        {tc.result !== undefined && (
          <>
            <div style={{ color: "#9ca3af", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "10px", marginBottom: "4px" }}>Result</div>
            <ToolResultContent tc={tc} />
          </>
        )}
      </div>
    );
    return {
      key: tc.toolCallId,
      title,
      icon: iconName && TOOL_ICONS[iconName] ? React.cloneElement(TOOL_ICONS[iconName] as React.ReactElement) : icon,
      status: tc.status,
      collapsible: true,
      blink: tc.status === "loading",
      content,
      footer,
    };
  });
}

// ── AssistantContent ──────────────────────────────────────────────────────────
export function AssistantContent({
  msg,
  isStreaming,
  onApprove,
}: {
  msg: ShinyMessage;
  isStreaming: boolean;
  onApprove: (id: string, approved: boolean) => void;
}) {
  const thoughtItems = useMemo(
    () => buildThoughtChainItems(msg.toolCalls, onApprove),
    [msg.toolCalls, onApprove]
  );

  // XMarkdown requires an explicit {hasNextChunk: false} frame to flush
  // incomplete syntax placeholders when streaming ends.
  const prevStreamingRef = useRef(isStreaming);
  const [justFinished, setJustFinished] = useState(false);
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      setJustFinished(true);
      const t = setTimeout(() => setJustFinished(false), 0);
      return () => clearTimeout(t);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const streamingProp = isStreaming
    ? { hasNextChunk: true as const, enableAnimation: true, tail: msg.toolCalls.every(tc => tc.status !== "loading") }
    : justFinished
    ? { hasNextChunk: false as const }
    : undefined;

  return (
    <div>
      {msg.reasoningContent && (
        <Think loading={isStreaming} blink={isStreaming} defaultExpanded={false} style={{ marginBottom: 8 }}>
          {msg.reasoningContent}
        </Think>
      )}
      {msg.toolCalls.length > 0 && (
        <ThoughtChain items={thoughtItems} style={{ marginBottom: msg.textContent ? 12 : 0 }} />
      )}
      {msg.textContent && (
        <XMarkdown content={msg.textContent} streaming={streamingProp} />
      )}
      {isStreaming && !msg.textContent && msg.toolCalls.length === 0 && !msg.reasoningContent && (
        <span style={{ color: "#9ca3af", fontSize: "13px" }}>Thinking…</span>
      )}
    </div>
  );
}
