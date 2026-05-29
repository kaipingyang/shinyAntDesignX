import React, { useState, useRef, useCallback, useMemo } from "react";
import { theme as antdTheme, Avatar, ConfigProvider, Dropdown } from "antd";
import { Bubble, Conversations, Sender, ThoughtChain, Think, Welcome, Prompts } from "@ant-design/x";
import type { BubbleProps } from "@ant-design/x";
import XMarkdown from "@ant-design/x-markdown";
import "@ant-design/x-markdown/themes/light.css";
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
import { useShinyState } from "./state";
import type { ThreadMessage, ToolCallState, WidgetConfig } from "./types";
import type { AttachmentData } from "./bridge";

// ── Icon mapping (annotations.icon → Ant Design Icon) ───────────────────────
const TOOL_ICONS: Record<string, React.ReactNode> = {
  "search":    <SearchOutlined />,
  "database":  <DatabaseOutlined />,
  "code":      <CodeOutlined />,
  "globe":     <GlobalOutlined />,
  "zap":       <ThunderboltOutlined />,
  "terminal":  <CodeSandboxOutlined />,
  "flask":     <ExperimentOutlined />,
  "wrench":    <ToolOutlined />,
  "bulb":      <BulbOutlined />,
  "shield":    <SafetyOutlined />,
};

// ── Tool result renderers ────────────────────────────────────────────────────

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
    case "table": return <TableResult data={result} />;
    case "markdown": return <div style={{ fontSize: "13px", lineHeight: 1.6 }}>{display}</div>;
    case "image": return <img src={display} alt="result" style={{ maxWidth: "100%", borderRadius: "4px" }} />;
    case "html": return <div style={{ fontSize: "13px" }} dangerouslySetInnerHTML={{ __html: display }} />;
    case "file": {
      const filename = (ann.resultFilename as string | undefined) ?? "download";
      return (
        <a href={display} download={filename} style={{ fontSize: "12px", color: "#1677ff" }}>
          ⬇ {filename}
        </a>
      );
    }
    default:
      return <pre style={{ margin: 0, fontSize: "12px", background: "rgba(0,0,0,0.04)", padding: "6px 8px", borderRadius: "4px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{display}</pre>;
  }
}

// ── ThoughtChain items builder ───────────────────────────────────────────────

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
        <button
          onClick={() => onApprove(tc.toolCallId, true)}
          style={{ padding: "4px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "#16a34a", color: "#fff" }}
        >
          Approve
        </button>
        <button
          onClick={() => onApprove(tc.toolCallId, false)}
          style={{ padding: "4px 14px", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "#6b7280", color: "#fff" }}
        >
          Deny
        </button>
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

// ── AssistantContent: ThoughtChain + reasoning + text ────────────────────────

function AssistantContent({
  msg,
  onApprove,
}: {
  msg: ThreadMessage;
  onApprove: (id: string, approved: boolean) => void;
}) {
  const thoughtItems = useMemo(
    () => buildThoughtChainItems(msg.toolCalls, onApprove),
    [msg.toolCalls, onApprove]
  );

  return (
    <div>
      {msg.reasoningContent && (
        <Think
          loading={msg.isStreaming}
          blink={msg.isStreaming}
          defaultExpanded={false}
          style={{ marginBottom: 8 }}
        >
          {msg.reasoningContent}
        </Think>
      )}
      {msg.toolCalls.length > 0 && (
        <ThoughtChain
          items={thoughtItems}
          style={{ marginBottom: msg.textContent ? 12 : 0 }}
        />
      )}
      {msg.textContent && (
        <XMarkdown
          content={msg.textContent}
          streaming={msg.isStreaming ? {
            hasNextChunk: true,
            enableAnimation: true,
            // Show tail cursor only when there are no pending tool calls
            tail: msg.toolCalls.every(tc => tc.status !== "loading"),
          } : undefined}
        />
      )}
      {msg.isStreaming && !msg.textContent && msg.toolCalls.length === 0 && !msg.reasoningContent && (
        <span style={{ color: "#9ca3af", fontSize: "13px" }}>Thinking…</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface AntDesignXProps {
  inputId: string;
  config: WidgetConfig;
}

export default function AntDesignX({ inputId, config }: AntDesignXProps) {
  const {
    threads,
    currentThreadId,
    messages,
    isStreaming,
    handleSubmit,
    handleCancel,
    sendToolApproval,
    switchToNewThread,
    switchToThread,
    archiveThread,
    deleteThread,
    commands,
  } = useShinyState(inputId, config);

  const showConversations = config.show_conversation_list === true;

  // ── sender state ─────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState("");
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSenderSubmit = useCallback((text: string) => {
    setInputValue("");
    handleSubmit(text);
  }, [handleSubmit]);

  // ── file attachment ───────────────────────────────────────────────────────
  const handlePasteFile = useCallback((files: FileList) => {
    // Read first file and submit as attachment with the current message
    // For simplicity, encode and submit immediately
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      const att: AttachmentData = {
        type: file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        data,
        contentType: file.type,
      };
      handleSubmit(inputValue || `[Attached: ${file.name}]`, [att]);
      setInputValue("");
    };
    if (file.type.startsWith("image/") || file.type.startsWith("text/")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
  }, [inputValue, handleSubmit]);

  // ── build Bubble.List items ───────────────────────────────────────────────
  const bubbleItems = useMemo((): (BubbleProps & { key: string; role: string })[] => {
    return messages.map((msg) => {
      if (msg.role === "user") {
        return {
          key: msg.key,
          role: "user",
          content: msg.textContent,
          typing: false,
        };
      }
      // assistant message
      return {
        key: msg.key,
        role: "assistant",
        content: (
          <AssistantContent
            msg={msg}
            onApprove={sendToolApproval}
          />
        ),
        typing: msg.isStreaming && msg.textContent.length > 0
          ? { effect: "typing" as const, step: 2, interval: 50 } : false,
        streaming: msg.isStreaming,
        loading: msg.isStreaming && msg.textContent === "" && msg.toolCalls.length === 0 && !msg.reasoningContent,
      };
    });
  }, [messages, sendToolApproval]);

  // ── avatar config ─────────────────────────────────────────────────────────
  const avatarConfig = config.assistant_avatar ?? { fallback: "AI" };

  const bubbleRoles = useMemo(() => ({
    user: {
      placement: "end" as const,
    },
    assistant: {
      placement: "start" as const,
      avatar: avatarConfig.src
        ? <Avatar src={avatarConfig.src} alt={avatarConfig.alt ?? "AI"} />
        : <Avatar>{avatarConfig.fallback ?? "AI"}</Avatar>,
    },
  }), [avatarConfig]);

  // ── suggestions (welcome screen) ─────────────────────────────────────────
  const suggestions = config.suggestions ?? [];
  const showWelcome = messages.length === 0 && !isStreaming;

  // ── conversations menu ────────────────────────────────────────────────────
  const conversationMenu = useCallback((item: { key: string; label: React.ReactNode }) => ({
    items: [
      { key: "archive", label: "Archive" },
      { key: "delete", label: <span style={{ color: "#ef4444" }}>Delete</span> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "archive") archiveThread(item.key);
      if (key === "delete") deleteThread(item.key);
    },
  }), [archiveThread, deleteThread]);

  // ── slash command dropdown items ─────────────────────────────────────────
  const dropdownItems = useMemo(() => {
    const q = slashQuery.toLowerCase();
    const filtered = commands.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
    return filtered.map((cmd) => ({
      key: cmd.name,
      label: (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 500 }}>/{cmd.name}</span>
          {cmd.description && <span style={{ color: "#6b7280", fontSize: "12px" }}>{cmd.description}</span>}
        </div>
      ),
    }));
  }, [commands, slashQuery]);

  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      <div style={{ display: "flex", height: "100%", fontFamily: "inherit", overflow: "hidden" }}>

        {/* Conversation sidebar */}
        {showConversations && (
          <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #f0f0f0", overflow: "auto" }}>
            <Conversations
              items={threads.map((t) => ({ key: t.key, label: t.label }))}
              activeKey={currentThreadId}
              onActiveChange={switchToThread}
              menu={conversationMenu as Parameters<typeof Conversations>[0]["menu"]}
              creation={{ onClick: switchToNewThread }}
            />
          </div>
        )}

        {/* Main chat area */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Welcome + suggestions when no messages */}
          {showWelcome && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px" }}>
              <Welcome
                title={typeof avatarConfig.fallback === "string" ? avatarConfig.fallback : "AI Assistant"}
                description="How can I help you today?"
                style={{ marginBottom: 24 }}
              />
              {suggestions.length > 0 && (
                <Prompts
                  items={suggestions.map((s, i) => ({
                    key: String(i),
                    description: s.text ?? s.prompt,
                  }))}
                  onItemClick={(info) => {
                    const s = suggestions[Number(info.data.key)];
                    if (s) handleSubmit(s.prompt);
                  }}
                />
              )}
            </div>
          )}

          {/* Message list */}
          {!showWelcome && (
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
              <Bubble.List
                items={bubbleItems}
                role={bubbleRoles}
                autoScroll
              />
            </div>
          )}

          {/* Input area */}
          <div style={{ padding: "8px 16px 16px", flexShrink: 0 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files) handlePasteFile(e.target.files);
                e.target.value = "";
              }}
            />
            <Dropdown
              open={slashOpen && dropdownItems.length > 0}
              menu={{
                items: dropdownItems,
                onClick: ({ key }) => {
                  const cmd = commands.find((c) => c.name === key);
                  setSlashOpen(false);
                  setInputValue(cmd ? `/${cmd.name} ` : "");
                },
              }}
              placement="topLeft"
              trigger={[]}
              getPopupContainer={() => document.body}
            >
              <div style={{ width: "100%" }}>
                <Sender
                  value={inputValue}
                  onChange={(value) => {
                    setInputValue(value);
                    if (value.startsWith("/")) {
                      setSlashQuery(value.slice(1));
                      setSlashOpen(true);
                    } else {
                      setSlashOpen(false);
                    }
                  }}
                  onSubmit={(text) => {
                    setSlashOpen(false);
                    const match = text.trim().match(/^\/(\S+)/);
                    if (match) {
                      const cmd = commands.find((c) => c.name === match[1]);
                      if (cmd) { setInputValue(""); handleSubmit(cmd.prompt); return; }
                    }
                    handleSenderSubmit(text);
                  }}
                  onCancel={handleCancel}
                  onPasteFile={handlePasteFile}
                  loading={isStreaming}
                  placeholder="Send a message… (/ for commands)"
                  allowSpeech
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
