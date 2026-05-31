import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { theme as antdTheme, Avatar, ConfigProvider, Dropdown } from "antd";
import { Bubble, Conversations, Sender, ThoughtChain, Think, Welcome, Prompts } from "@ant-design/x";
import type { BubbleProps, ConversationsProps } from "@ant-design/x";
import XMarkdown from "@ant-design/x-markdown";
import "@ant-design/x-markdown/themes/light.css";
import { useXChat, useXConversations } from "@ant-design/x-sdk";
import type { MessageInfo } from "@ant-design/x-sdk";
import { XCard } from "@ant-design/x-card";
import type { XAgentCommand_v0_9, ActionPayload } from "@ant-design/x-card";
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
import { ShinyBridgeRequest } from "./ShinyBridgeRequest";
import { createShinyProvider } from "./ShinyBridgeChatProvider";
import type { ShinyMessage } from "./ShinyBridgeChatProvider";
import type { ShinyInput } from "./ShinyBridgeRequest";
import type { ToolCallState, WidgetConfig } from "./types";
import type { SessionItem, AttachmentData } from "./bridge";

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

// ── Tool result renderer ──────────────────────────────────────────────────────
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
function AssistantContent({
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
  // incomplete syntax placeholders. Track whether we just finished streaming.
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
        <XMarkdown
          content={msg.textContent}
          streaming={streamingProp}
        />
      )}
      {isStreaming && !msg.textContent && msg.toolCalls.length === 0 && !msg.reasoningContent && (
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

function makeThreadId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function AntDesignX({ inputId, config }: AntDesignXProps) {
  // ── x-sdk provider (one per widget, never recreated) ─────────────────────
  const [request] = useState(() => new ShinyBridgeRequest(inputId));
  const [provider] = useState(() => createShinyProvider(request));
  const bridge = request.getBridge();

  // ── conversations (thread list) ───────────────────────────────────────────
  const [initThreadId] = useState(makeThreadId);
  const {
    conversations,
    activeConversationKey,
    setActiveConversationKey,
    addConversation,
    removeConversation,
    setConversations,
    setConversation,
  } = useXConversations({
    defaultConversations: [{ key: initThreadId, label: "New Chat" }],
    defaultActiveConversationKey: initThreadId,
  });

  // ── useXChat ──────────────────────────────────────────────────────────────
  const { messages, onRequest, isRequesting, abort, setMessages, onReload } = useXChat<
    ShinyMessage,
    ShinyMessage,
    ShinyInput
  >({
    provider,
    conversationKey: activeConversationKey,
    requestPlaceholder: { role: "assistant", textContent: "", toolCalls: [] },
    requestFallback: (_, { error, messageInfo }) => {
      if (error.name === "AbortError") {
        const prev = (messageInfo as MessageInfo<ShinyMessage> | undefined)?.message;
        return { role: "assistant", textContent: prev?.textContent ?? "", toolCalls: prev?.toolCalls ?? [] };
      }
      return { role: "assistant", textContent: `⚠ Error: ${error.message}`, toolCalls: [] };
    },
  });

  // ── refs always current, safe inside stale closures ───────────────────────
  const setMessagesRef = useRef(setMessages);
  setMessagesRef.current = setMessages;

  // ── xCard config ──────────────────────────────────────────────────────────
  const xcardMode = config.xcard_mode ?? "inline";
  const xcardPanelWidth = config.xcard_panel_width ?? 360;

  // ── xCard command queues (surfaceId → accumulated commands) ───────────────
  // XCard.Box processes commands array with processedCommandsCount — append-only
  const [cardCommandQueues, setCardCommandQueues] = useState<Map<string, XAgentCommand_v0_9[]>>(
    () => new Map()
  );

  // ── tool-result side-channel ──────────────────────────────────────────────
  // transformMessage passes through "tool-result" chunks (returns base unchanged).
  // ShinyBridgeRequest calls __toolResultHook instead so we can scan all messages
  // synchronously — no async useEffect needed, no map/index required.
  const toolResultHandlerRef = useRef<((toolCallId: string, result: unknown, isError: boolean) => void) | null>(null);
  toolResultHandlerRef.current = (toolCallId, result, isError) => {
    setMessagesRef.current((all) =>
      all.map((mi) => {
        if (mi.message.role !== "assistant") return mi;
        if (!mi.message.toolCalls.some((tc) => tc.toolCallId === toolCallId)) return mi;
        return {
          ...mi,
          message: {
            ...mi.message,
            toolCalls: mi.message.toolCalls.map((tc) =>
              tc.toolCallId === toolCallId
                ? { ...tc, result, isError, status: isError ? "error" as const : "success" as const }
                : tc
            ),
          },
        };
      })
    );
  };

  useEffect(() => {
    request.toolResultHook = (toolCallId: string, result: unknown, isError: boolean) => {
      toolResultHandlerRef.current?.(toolCallId, result, isError);
    };
    return () => { request.toolResultHook = null; };
  }, [request]);

  // ── tool approval ─────────────────────────────────────────────────────────
  const sendToolApproval = useCallback((toolCallId: string, approved: boolean) => {
    bridge.sendToolApproval(toolCallId, approved);
    if (!approved) {
      setMessagesRef.current((all) =>
        all.map((mi) => {
          if (mi.message.role !== "assistant") return mi;
          if (!mi.message.toolCalls.some((tc) => tc.toolCallId === toolCallId)) return mi;
          return {
            ...mi,
            message: {
              ...mi.message,
              toolCalls: mi.message.toolCalls.map((tc) =>
                tc.toolCallId === toolCallId ? { ...tc, status: "abort" as const } : tc
              ),
            },
          };
        })
      );
    }
  }, [bridge]);

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback((text: string, attachments?: AttachmentData[]) => {
    if (!text.trim()) return;
    // Auto-name the conversation on its first message
    const isFirst = messages.length === 0;
    if (isFirst) {
      const label = text.slice(0, 24) + (text.length > 24 ? "…" : "");
      setConversation(activeConversationKey, { label });
    }
    onRequest({ query: text, threadId: activeConversationKey, attachments });
  }, [onRequest, activeConversationKey, messages.length, setConversation]);

  // ── server sessions ───────────────────────────────────────────────────────
  const unloadedSessionIds = useRef(new Set<string>());
  // Track locally-created thread IDs so onSessions can preserve them
  const localThreadIds = useRef(new Set<string>([initThreadId]));
  const activeKeyRef = useRef(activeConversationKey);
  activeKeyRef.current = activeConversationKey;
  // Keep conversations ref current so stale onSessions closure can read latest labels
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  useEffect(() => {
    bridge.onSessions(({ sessions }: { sessions: SessionItem[] }) => {
      if (sessions.length === 0) return;

      const serverIds = new Set(sessions.map((s) => s.id));
      const serverThreads = sessions.map((s) => ({ key: s.id, label: s.title || s.id }));

      // Preserve threads created in this session that aren't on the server yet,
      // keeping their current labels (may have been auto-named by handleSubmit)
      const currentLabelMap = new Map(conversationsRef.current.map((c) => [c.key, c.label]));
      const localNew = [...localThreadIds.current]
        .filter((k) => !serverIds.has(k))
        .map((k) => ({ key: k, label: currentLabelMap.get(k) ?? "New Chat" }));

      setConversations([...localNew, ...serverThreads]);
      for (const s of sessions) unloadedSessionIds.current.add(s.id);

      const cur = activeKeyRef.current;
      // Only redirect if current thread isn't a known server session or local thread
      if (!serverIds.has(cur) && !localThreadIds.current.has(cur)) {
        setActiveConversationKey(sessions[0].id);
      }

      const activateId = serverIds.has(cur) ? cur : sessions[0].id;
      if (unloadedSessionIds.current.has(activateId)) {
        bridge.sendLoadSession(activateId, activateId);
        unloadedSessionIds.current.delete(activateId);
      }
    });

    bridge.onLoadThread(({ threadId, messages: rawMsgs }: { threadId: string; messages: unknown[] }) => {
      unloadedSessionIds.current.delete(threadId);
      const converted = (rawMsgs as any[]).map((m: any) => {
        if (m.role === "user") {
          return {
            id:      m.key,
            message: { role: "user" as const, textContent: m.textContent ?? "", toolCalls: [], attachments: m.attachments },
            status:  "local" as const,
          };
        }
        const toolCalls: ToolCallState[] = (m.toolCalls ?? []).map((tc: any) => ({
          toolCallId:  tc.toolCallId,
          toolName:    tc.toolName,
          args:        tc.args ?? {},
          argsText:    tc.argsText ?? "{}",
          annotations: tc.annotations,
          result:      tc.result,
          isError:     tc.isError,
          status:      tc.status ?? "success",
        }));
        return {
          id:      m.key,
          message: { role: "assistant" as const, textContent: m.textContent ?? "", reasoningContent: m.reasoningContent, toolCalls },
          status:  "success" as const,
        };
      });
      // Use ref — closure captures stale setMessages without it
      setMessagesRef.current(converted);
    });

    bridge.onClear(() => {
      const newId = makeThreadId();
      localThreadIds.current.add(newId);
      addConversation({ key: newId, label: "New Chat" });
      setActiveConversationKey(newId);
    });

    // card-command: append to surfaceId queue AND fire onUpdate so transformMessage
    // can track cardSurfaceIds (for inline rendering)
    bridge.onCardCommand(({ command, threadId }: { command: Record<string, unknown>; threadId: string }) => {
      // update cardCommandQueues
      const surfaceId: string | null =
        "createSurface"   in command ? (command as any).createSurface?.surfaceId   ?? null :
        "updateComponents" in command ? (command as any).updateComponents?.surfaceId ?? null :
        "updateDataModel"  in command ? (command as any).updateDataModel?.surfaceId  ?? null :
        "deleteSurface"    in command ? (command as any).deleteSurface?.surfaceId    ?? null :
        null;

      if (surfaceId) {
        setCardCommandQueues((prev) => {
          const next = new Map(prev);
          if ("deleteSurface" in command) {
            next.delete(surfaceId);
          } else {
            next.set(surfaceId, [...(next.get(surfaceId) ?? []), command as XAgentCommand_v0_9]);
          }
          return next;
        });
      }

      // also fire onUpdate on the request so transformMessage tracks cardSurfaceIds
      // (only relevant during an active run for the current thread)
      request.options.callbacks?.onUpdate?.(
        { type: "card-command", command },
        new Headers()
      );
    });

    bridge.sendReady();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── conversation switch: lazy-load server sessions ────────────────────────
  const handleConversationChange = useCallback((key: string) => {
    setActiveConversationKey(key);
    if (unloadedSessionIds.current.has(key)) {
      bridge.sendLoadSession(key, key);
      unloadedSessionIds.current.delete(key);
    }
  }, [bridge, setActiveConversationKey]);

  // ── sender state ──────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState("");
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commands = config.commands ?? [];
  const suggestions = config.suggestions ?? [];
  const showConversations = config.show_conversation_list === true;
  const showWelcome = messages.length === 0 && !isRequesting;
  const avatarConfig = config.assistant_avatar ?? { fallback: "AI" };

  // ── xCard derived state ───────────────────────────────────────────────────
  // Flatten all surface queues into one array for XCard.Box
  const allCardCommands = useMemo(() => {
    const result: XAgentCommand_v0_9[] = [];
    cardCommandQueues.forEach((cmds) => result.push(...cmds));
    return result;
  }, [cardCommandQueues]);

  // Collect all active surfaceIds across all messages (for panel mode and XCard.Box awareness)
  const activeSurfaceIds = useMemo(() => {
    const ids: string[] = [];
    messages.forEach(({ message }) => {
      message.cardSurfaceIds?.forEach((id) => { if (!ids.includes(id)) ids.push(id); });
    });
    return ids;
  }, [messages]);

  const handleCardAction = useCallback((payload: ActionPayload) => {
    (window as any).Shiny?.setInputValue(
      `${inputId}_card_action`,
      { name: payload.name, surfaceId: payload.surfaceId, context: payload.context, ts: Date.now() },
      { priority: "event" }
    );
  }, [inputId]);

  // ── file attachment ───────────────────────────────────────────────────────
  const handlePasteFile = useCallback((files: FileList) => {
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
    reader.readAsDataURL(file);
  }, [inputValue, handleSubmit]);

  // ── Bubble.List items ─────────────────────────────────────────────────────
  const bubbleItems = useMemo((): (BubbleProps & { key: string | number; role: string })[] => {
    return messages.map(({ id, message, status }, idx) => {
      const isStreaming = status === "loading" || status === "updating";
      if (message.role === "user") {
        return { key: id, role: "user", content: message.textContent, typing: false };
      }
      // Find the preceding user message — walk backwards, no allocation
      let reloadQuery = "";
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].message.role === "user") { reloadQuery = messages[i].message.textContent; break; }
      }
      return {
        key: id,
        role: "assistant",
        content: (
          <div>
            <AssistantContent msg={message} isStreaming={isStreaming} onApprove={sendToolApproval} />
            {xcardMode === "inline" && message.cardSurfaceIds?.map((surfaceId) => (
              <XCard.Card key={surfaceId} id={surfaceId} />
            ))}
          </div>
        ),
        typing: isStreaming && message.textContent.length > 0
          ? { effect: "typing" as const, step: 2, interval: 50 } : false,
        loading: isStreaming && message.textContent === "" && message.toolCalls.length === 0 && !message.reasoningContent,
        // Regenerate button — disabled while any request is in flight
        footer: !isStreaming && status === "success" && reloadQuery ? (
          <button
            disabled={isRequesting}
            onClick={() => onReload(id, { query: reloadQuery, threadId: activeConversationKey })}
            style={{ marginTop: 4, padding: "2px 10px", fontSize: "11px", cursor: isRequesting ? "not-allowed" : "pointer", border: "1px solid #e5e7eb", borderRadius: "4px", background: "transparent", color: "#9ca3af" }}
          >
            ↺ Regenerate
          </button>
        ) : undefined,
      };
    });
  }, [messages, sendToolApproval, isRequesting, onReload, activeConversationKey]);

  // ── bubble role config ────────────────────────────────────────────────────
  const bubbleRoles = useMemo(() => ({
    user: { placement: "end" as const },
    assistant: {
      placement: "start" as const,
      avatar: avatarConfig.src
        ? <Avatar src={avatarConfig.src} alt={avatarConfig.alt ?? "AI"} />
        : <Avatar>{avatarConfig.fallback ?? "AI"}</Avatar>,
    },
  }), [avatarConfig]);

  // ── conversations menu (archive / delete) ─────────────────────────────────
  const conversationMenu: ConversationsProps["menu"] = useCallback(
    (item: { key: string }) => ({
      items: [
        { key: "delete", label: <span style={{ color: "#ef4444" }}>Delete</span> },
      ],
      onClick: ({ key }: { key: string }) => {
        if (key === "delete") {
          removeConversation(item.key);
          if (item.key === activeConversationKey && conversations.length > 1) {
            const next = conversations.find((c) => c.key !== item.key);
            if (next) setActiveConversationKey(next.key);
          }
        }
      },
    }),
    [removeConversation, conversations, activeConversationKey, setActiveConversationKey]
  );

  // ── slash dropdown ────────────────────────────────────────────────────────
  const dropdownItems = useMemo(() => {
    const q = slashQuery.toLowerCase();
    return commands
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .map((cmd) => ({
        key: cmd.name,
        label: (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 500 }}>/{cmd.name}</span>
            {cmd.description && <span style={{ color: "#6b7280", fontSize: "12px" }}>{cmd.description}</span>}
          </div>
        ),
      }));
  }, [commands, slashQuery]);

  // ── new conversation ──────────────────────────────────────────────────────
  const handleNewConversation = useCallback(() => {
    const newId = makeThreadId();
    localThreadIds.current.add(newId);
    addConversation({ key: newId, label: "New Chat" });
    setActiveConversationKey(newId);
  }, [addConversation, setActiveConversationKey]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
      {/* XCard.Box wraps the whole widget so XCard.Card instances inside bubbles can find their context */}
      <XCard.Box commands={allCardCommands} onAction={handleCardAction}>
        <div style={{ display: "flex", height: "100%", fontFamily: "inherit", overflow: "hidden" }}>

        {showConversations && (
          <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #f0f0f0", overflow: "auto" }}>
            <Conversations
              items={conversations}
              activeKey={activeConversationKey}
              onActiveChange={handleConversationChange}
              menu={conversationMenu}
              creation={{ onClick: handleNewConversation }}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {showWelcome && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px" }}>
              <Welcome
                title={typeof avatarConfig.fallback === "string" ? avatarConfig.fallback : "AI Assistant"}
                description="How can I help you today?"
                style={{ marginBottom: 24 }}
              />
              {suggestions.length > 0 && (
                <Prompts
                  items={suggestions.map((s, i) => ({ key: String(i), description: s.text ?? s.prompt }))}
                  onItemClick={(info) => {
                    const s = suggestions[Number(info.data.key)];
                    if (s) handleSubmit(s.prompt);
                  }}
                />
              )}
            </div>
          )}

          {!showWelcome && (
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
              <Bubble.List items={bubbleItems} role={bubbleRoles} autoScroll />
            </div>
          )}

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
                    if (value.startsWith("/")) { setSlashQuery(value.slice(1)); setSlashOpen(true); }
                    else setSlashOpen(false);
                  }}
                  onSubmit={(text) => {
                    setSlashOpen(false);
                    const match = text.trim().match(/^\/(\S+)/);
                    if (match) {
                      const cmd = commands.find((c) => c.name === match[1]);
                      if (cmd) { setInputValue(""); handleSubmit(cmd.prompt); return; }
                    }
                    setInputValue("");
                    handleSubmit(text);
                  }}
                  onCancel={abort}
                  onPasteFile={handlePasteFile}
                  loading={isRequesting}
                  placeholder="Send a message… (/ for commands)"
                  allowSpeech
                />
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Panel mode: right-side card area, shown when at least one surface exists */}
        {xcardMode === "panel" && activeSurfaceIds.length > 0 && (
          <div style={{
            width: xcardPanelWidth,
            flexShrink: 0,
            borderLeft: "1px solid #f0f0f0",
            overflowY: "auto",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            {activeSurfaceIds.map((surfaceId) => (
              <XCard.Card key={surfaceId} id={surfaceId} />
            ))}
          </div>
        )}
      </div>
      </XCard.Box>
    </ConfigProvider>
  );
}
