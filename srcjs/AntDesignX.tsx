import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { theme as antdTheme, Avatar, ConfigProvider, Dropdown } from "antd";
import { Bubble, Conversations, Sender, Welcome, Prompts } from "@ant-design/x";
import type { BubbleProps, ConversationsProps } from "@ant-design/x";
import "@ant-design/x-markdown/themes/light.css";
import { useXChat, useXConversations } from "@ant-design/x-sdk";
import type { MessageInfo } from "@ant-design/x-sdk";
import { XCard, registerCatalog } from "@ant-design/x-card";
import type { XAgentCommand_v0_9, ActionPayload } from "@ant-design/x-card";
import { SHINY_DEFAULT_CATALOG, SHINY_DEFAULT_COMPONENTS } from "./xCardDefaults";
import { ShinyBridgeRequest } from "./ShinyBridgeRequest";
import { createShinyProvider } from "./ShinyBridgeChatProvider";
import type { ShinyMessage } from "./ShinyBridgeChatProvider";
import type { ShinyInput } from "./ShinyBridgeRequest";
import type { WidgetConfig } from "./types";
import type { SessionItem, AttachmentData } from "./bridge";
import { useToolSideChannel } from "./hooks/useToolSideChannel";
import { AssistantContent } from "./components/AssistantContent";

// Register default catalog once at module load
registerCatalog(SHINY_DEFAULT_CATALOG);

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
  const { messages, onRequest, isRequesting, abort, setMessages, onReload, queueRequest } = useXChat<
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

  const onRequestRef = useRef(onRequest);
  onRequestRef.current = onRequest;

  // ── xCard config ──────────────────────────────────────────────────────────
  const xcardMode = config.xcard_mode ?? "inline";
  const xcardPanelWidth = config.xcard_panel_width ?? 360;

  // ── xCard command queue (single append-only array for XCard.Box) ──────────
  // XCard.Box tracks processedCommandsCount — the array must be append-only and
  // never reordered or rebuilt from a per-surface Map, which would corrupt the
  // count and cause duplicate / skipped command processing.
  const cardCommandQueueRef = useRef<XAgentCommand_v0_9[]>([]);
  const [cardCommandVersion, setCardCommandVersion] = useState(0);

  // surfaceIds still active (not yet deleted) — drives inline + panel rendering
  const activeSurfaceIdsRef = useRef<Set<string>>(new Set());

  // ── tool result + approval (extracted to hook) ───────────────────────────
  const { sendToolApproval } = useToolSideChannel(request, bridge, setMessagesRef);

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

    // card-command: append to single global queue (never reorder/rebuild)
    // and fire onUpdate so transformMessage tracks cardSurfaceIds per message.
    bridge.onCardCommand(({ command, threadId }: { command: Record<string, unknown>; threadId: string }) => {
      // Append to global queue — XCard.Box slices from processedCommandsCount
      cardCommandQueueRef.current = [...cardCommandQueueRef.current, command as XAgentCommand_v0_9];
      setCardCommandVersion((v) => v + 1);   // trigger re-render with new array ref

      // Track active surfaceIds (for inline/panel rendering)
      if ("createSurface" in command) {
        const sid = (command as any).createSurface?.surfaceId;
        if (sid) activeSurfaceIdsRef.current.add(sid);
      } else if ("deleteSurface" in command) {
        const sid = (command as any).deleteSurface?.surfaceId;
        if (sid) {
          activeSurfaceIdsRef.current.delete(sid);
          // Remove surfaceId from all messages so inline/panel stops rendering it
          setMessagesRef.current((all) =>
            all.map((mi) => {
              if (!mi.message.cardSurfaceIds?.includes(sid)) return mi;
              return {
                ...mi,
                message: {
                  ...mi.message,
                  cardSurfaceIds: mi.message.cardSurfaceIds.filter((id) => id !== sid),
                },
              };
            })
          );
        }
      }

      // Fire onUpdate only while a request is in-flight so transformMessage
      // can track cardSurfaceIds. Skip after stream ends to avoid stale callback.
      if (request.isRequesting) {
        request.options.callbacks?.onUpdate?.(
          { type: "card-command", command },
          new Headers()
        );
      }
    });

    // trigger-message: R can programmatically inject a new user message.
    // threadId="default" is the R fallback sentinel — always resolve to active key.
    bridge.onTriggerMessage(({ text, threadId }: { text: string; threadId: string }) => {
      const target = (threadId && threadId !== "default") ? threadId : activeKeyRef.current;
      if (target !== activeKeyRef.current) {
        setActiveConversationKey(target);
      }
      // Use queueRequest so the message lands in the correct conversationKey store
      // even if setActiveConversationKey hasn't re-rendered yet
      queueRequest(target, { query: text, threadId: target });
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
  // Use the ref array directly — cardCommandVersion triggers re-render when it changes
  const allCardCommands = cardCommandQueueRef.current;

  // activeSurfaceIds from ref (updated synchronously in onCardCommand)
  const activeSurfaceIds = useMemo(
    () => [...activeSurfaceIdsRef.current],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardCommandVersion]
  );

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
      <XCard.Box commands={allCardCommands} onAction={handleCardAction} components={SHINY_DEFAULT_COMPONENTS}>
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
