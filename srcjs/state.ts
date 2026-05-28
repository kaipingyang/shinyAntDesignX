// useShinyState — pure React state management for shinyAntDesignX
// Replaces @assistant-ui/react's ExternalStoreRuntime.
// Drives Ant Design X Bubble.List + Conversations directly.
import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import { createShinyBridge } from "./bridge";
import type { ShinyBridge, AttachmentData, SessionItem } from "./bridge";
import type { ThreadMessage, ThreadItem, ToolCallState, WidgetConfig } from "./types";

// ── localStorage helpers ─────────────────────────────────────────────────────

function storageKey(inputId: string, suffix: string) {
  return `shinyAntDesignX:${inputId}:${suffix}`;
}

function loadThreads(inputId: string): ThreadItem[] {
  try {
    const raw = localStorage.getItem(storageKey(inputId, "threads"));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveThreads(inputId: string, threads: ThreadItem[]) {
  try { localStorage.setItem(storageKey(inputId, "threads"), JSON.stringify(threads)); } catch {}
}

function loadMessages(inputId: string, threadId: string): ThreadMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(inputId, `msgs:${threadId}`));
    if (!raw) return [];
    const msgs = JSON.parse(raw) as ThreadMessage[];
    // Any loading tool call without result is stale — mark as abort
    return msgs.map((m): ThreadMessage => ({
      ...m,
      isStreaming: false,
      toolCalls: m.toolCalls.map((tc) =>
        tc.status === "loading" ? { ...tc, status: "abort" as const, result: "Session ended" } : tc
      ),
    }));
  } catch { return []; }
}

function saveMessages(inputId: string, threadId: string, msgs: ThreadMessage[]) {
  try { localStorage.setItem(storageKey(inputId, `msgs:${threadId}`), JSON.stringify(msgs)); } catch {}
}

function deleteMessages(inputId: string, threadId: string) {
  try { localStorage.removeItem(storageKey(inputId, `msgs:${threadId}`)); } catch {}
}

function makeThreadId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeKey() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useShinyState(inputId: string, config: WidgetConfig) {
  // Lazy init bridge — avoid re-registering Shiny handlers on re-render
  const bridge = useRef<ShinyBridge>(null!);
  if (!bridge.current) bridge.current = createShinyBridge(inputId);

  const unloadedSessionIds = useRef(new Set<string>());
  const currentThreadIdRef = useRef<string>("");
  const thisSessionThreadIds = useRef(new Set<string>());
  const isServerMode = useRef(false);

  // ── threads (conversation list) ──────────────────────────────────────────
  const [threads, setThreads] = useState<ThreadItem[]>(() => loadThreads(inputId));

  const [currentThreadId, setCurrentThreadId] = useState<string>(() => {
    const saved = loadThreads(inputId);
    if (saved.length > 0) return saved[0].key;
    const id = makeThreadId();
    thisSessionThreadIds.current.add(id);
    return id;
  });
  currentThreadIdRef.current = currentThreadId;

  // Ensure initial thread exists in list
  useEffect(() => {
    setThreads((prev) => {
      if (prev.some((t) => t.key === currentThreadId)) return prev;
      const next: ThreadItem[] = [
        { key: currentThreadId, label: "New Chat", status: "regular" },
        ...prev,
      ];
      saveThreads(inputId, next);
      return next;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── messages map ─────────────────────────────────────────────────────────
  const [messagesMap, setMessagesMap] = useState<Record<string, ThreadMessage[]>>(() => {
    const saved = loadThreads(inputId);
    const map: Record<string, ThreadMessage[]> = {};
    const ids = saved.length > 0 ? saved.map((t) => t.key) : [currentThreadId];
    for (const id of ids) map[id] = loadMessages(inputId, id);
    return map;
  });

  const messages = useMemo(
    () => messagesMap[currentThreadId] ?? [],
    [messagesMap, currentThreadId]
  );

  const setCurrentMessages = useCallback(
    (updater: (prev: ThreadMessage[]) => ThreadMessage[]) => {
      setMessagesMap((prev) => {
        const updated = updater(prev[currentThreadId] ?? []);
        if (!isServerMode.current) saveMessages(inputId, currentThreadId, updated);
        return { ...prev, [currentThreadId]: updated };
      });
    },
    [inputId, currentThreadId]
  );

  // ── streaming state ──────────────────────────────────────────────────────
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingKeyRef = useRef<string | null>(null);

  // ── thread switching helpers ──────────────────────────────────────────────
  const switchAwayFrom = useCallback(
    (removedKey: string, currentThreads: ThreadItem[]) => {
      const remaining = currentThreads.filter((t) => t.key !== removedKey);
      if (remaining.length > 0) {
        setCurrentThreadId(remaining[0].key);
      } else {
        const newId = makeThreadId();
        thisSessionThreadIds.current.add(newId);
        setThreads((prev) => {
          const next: ThreadItem[] = [
            { key: newId, label: "New Chat", status: "regular" },
            ...prev.filter((t) => t.key !== removedKey),
          ];
          saveThreads(inputId, next);
          return next;
        });
        setCurrentThreadId(newId);
      }
      setIsStreaming(false);
      streamingKeyRef.current = null;
    },
    [inputId]
  );

  const switchToNewThread = useCallback(() => {
    const newId = makeThreadId();
    thisSessionThreadIds.current.add(newId);
    setThreads((prev) => {
      const next: ThreadItem[] = [{ key: newId, label: "New Chat", status: "regular" }, ...prev];
      saveThreads(inputId, next);
      return next;
    });
    setCurrentThreadId(newId);
    setIsStreaming(false);
    streamingKeyRef.current = null;
  }, [inputId]);

  // ── startRun: set up bridge callbacks for a streaming run ─────────────────
  const startRun = useCallback(
    (threadId: string, sendFn: () => void) => {
      setIsStreaming(true);
      streamingKeyRef.current = null;

      bridge.current.setRunCallbacks({
        onThinking: (thinkingText) => {
          if (!streamingKeyRef.current) streamingKeyRef.current = makeKey();
          const msgKey = streamingKeyRef.current;
          setMessagesMap((prev) => {
            const msgs = prev[threadId] ?? [];
            const existing = msgs.find((m) => m.key === msgKey);
            if (!existing) {
              return {
                ...prev,
                [threadId]: [...msgs, {
                  key: msgKey, role: "assistant", textContent: "",
                  reasoningContent: thinkingText, toolCalls: [], isStreaming: true,
                }],
              };
            }
            return {
              ...prev,
              [threadId]: msgs.map((m) =>
                m.key !== msgKey ? m : { ...m, reasoningContent: (m.reasoningContent ?? "") + thinkingText }
              ),
            };
          });
        },

        onChunk: (chunkText) => {
          if (!streamingKeyRef.current) streamingKeyRef.current = makeKey();
          const msgKey = streamingKeyRef.current;
          setMessagesMap((prev) => {
            const msgs = prev[threadId] ?? [];
            const existing = msgs.find((m) => m.key === msgKey);
            if (!existing) {
              return {
                ...prev,
                [threadId]: [...msgs, {
                  key: msgKey, role: "assistant", textContent: chunkText,
                  toolCalls: [], isStreaming: true,
                }],
              };
            }
            return {
              ...prev,
              [threadId]: msgs.map((m) =>
                m.key !== msgKey ? m : { ...m, textContent: m.textContent + chunkText }
              ),
            };
          });
        },

        onToolCall: (toolCall) => {
          // Each tool call is a new assistant message (to allow sequential display)
          streamingKeyRef.current = null;
          const msgKey = `tool-${toolCall.toolCallId}`;
          const tc: ToolCallState = {
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            args: toolCall.args,
            argsText: toolCall.argsText,
            annotations: toolCall.annotations,
            status: "loading",
          };
          setMessagesMap((prev) => {
            const msgs = prev[threadId] ?? [];
            // Check if we already have a streaming assistant message to attach to
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg?.role === "assistant" && lastMsg.isStreaming) {
              const updated = msgs.map((m) =>
                m.key === lastMsg.key
                  ? { ...m, toolCalls: [...m.toolCalls, tc] }
                  : m
              );
              if (!isServerMode.current) saveMessages(inputId, threadId, updated);
              return { ...prev, [threadId]: updated };
            }
            // Otherwise create new assistant message for this tool call
            const newMsg: ThreadMessage = {
              key: msgKey, role: "assistant", textContent: "",
              toolCalls: [tc], isStreaming: true,
            };
            const updated = [...msgs, newMsg];
            if (!isServerMode.current) saveMessages(inputId, threadId, updated);
            return { ...prev, [threadId]: updated };
          });
        },

        onToolResult: (toolCallId, result, isError) => {
          setMessagesMap((prev) => {
            const msgs = prev[threadId] ?? [];
            const updated = msgs.map((m) => {
              const tcIdx = m.toolCalls.findIndex((tc) => tc.toolCallId === toolCallId);
              if (tcIdx < 0) return m;
              const updatedTcs = m.toolCalls.map((tc, i) =>
                i !== tcIdx ? tc : {
                  ...tc,
                  result,
                  isError,
                  status: isError ? "error" as const : "success" as const,
                }
              );
              return { ...m, toolCalls: updatedTcs };
            });
            if (!isServerMode.current) saveMessages(inputId, threadId, updated);
            return { ...prev, [threadId]: updated };
          });
        },

        onDone: () => {
          streamingKeyRef.current = null;
          setIsStreaming(false);
          bridge.current.setRunCallbacks(null);
          setMessagesMap((prev) => {
            const msgs = (prev[threadId] ?? []).map((m) => ({ ...m, isStreaming: false }));
            if (!isServerMode.current) saveMessages(inputId, threadId, msgs);
            return { ...prev, [threadId]: msgs };
          });
        },

        onError: (errMsg) => {
          streamingKeyRef.current = null;
          setIsStreaming(false);
          bridge.current.setRunCallbacks(null);
          setMessagesMap((prev) => {
            const msgs = prev[threadId] ?? [];
            const updated: ThreadMessage[] = [
              ...msgs.map((m) => ({ ...m, isStreaming: false })),
              {
                key: makeKey(), role: "assistant", textContent: `⚠ Error: ${errMsg}`,
                toolCalls: [], isStreaming: false, isError: true,
              },
            ];
            if (!isServerMode.current) saveMessages(inputId, threadId, updated);
            return { ...prev, [threadId]: updated };
          });
        },
      });

      sendFn();
    },
    [inputId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── handleSubmit ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (text: string, attachments: AttachmentData[] = []) => {
      if (!text.trim()) return;
      const threadId = currentThreadId;

      // Auto-name thread on first message
      const isFirst = (messagesMap[threadId] ?? []).length === 0;
      if (isFirst) {
        const title = text.slice(0, 24) + (text.length > 24 ? "…" : "");
        setThreads((ts) => {
          const next = ts.map((t) => t.key === threadId ? { ...t, label: title } : t);
          saveThreads(inputId, next);
          return next;
        });
      }

      const userMsg: ThreadMessage = {
        key: makeKey(), role: "user",
        textContent: text, toolCalls: [], isStreaming: false,
        ...(attachments.length > 0 && { attachments }),
      };
      setCurrentMessages((prev) => [...prev, userMsg]);
      startRun(threadId, () => bridge.current.sendUserMessage(text, threadId, attachments));
    },
    [inputId, currentThreadId, messagesMap, setCurrentMessages, startRun]
  );

  // ── handleCancel ──────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    setIsStreaming(false);
    bridge.current.sendCancel(currentThreadIdRef.current);
  }, []);

  // ── sendToolApproval ──────────────────────────────────────────────────────
  const sendToolApproval = useCallback((toolCallId: string, approved: boolean) => {
    bridge.current.sendToolApproval(toolCallId, approved);
    // If denied, mark the tool call as abort
    if (!approved) {
      const threadId = currentThreadIdRef.current;
      setMessagesMap((prev) => {
        const msgs = prev[threadId] ?? [];
        const updated = msgs.map((m) => {
          const tcIdx = m.toolCalls.findIndex((tc) => tc.toolCallId === toolCallId);
          if (tcIdx < 0) return m;
          const updatedTcs = m.toolCalls.map((tc, i) =>
            i !== tcIdx ? tc : { ...tc, status: "abort" as const }
          );
          return { ...m, toolCalls: updatedTcs };
        });
        return { ...prev, [threadId]: updated };
      });
    }
  }, []);

  // ── thread management ────────────────────────────────────────────────────
  const switchToThread = useCallback((threadId: string) => {
    setCurrentThreadId(threadId);
    setIsStreaming(false);
    streamingKeyRef.current = null;
    if (unloadedSessionIds.current.has(threadId)) {
      bridge.current.sendLoadSession(threadId, threadId);
      unloadedSessionIds.current.delete(threadId);
    }
  }, []);

  const archiveThread = useCallback((threadKey: string) => {
    setThreads((prev) => {
      const next = prev.map((t) => t.key === threadKey ? { ...t, status: "archived" as const } : t);
      saveThreads(inputId, next);
      return next;
    });
    if (threadKey === currentThreadIdRef.current) {
      switchAwayFrom(threadKey, threads);
    }
  }, [inputId, threads, switchAwayFrom]);

  const deleteThread = useCallback((threadKey: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.key !== threadKey);
      saveThreads(inputId, next);
      deleteMessages(inputId, threadKey);
      return next;
    });
    if (threadKey === currentThreadIdRef.current) switchAwayFrom(threadKey, threads);
  }, [inputId, threads, switchAwayFrom]);

  // ── bridge event handlers (registered once on mount) ─────────────────────
  useEffect(() => {
    bridge.current.onClear(() => {
      switchToNewThread();
    });

    bridge.current.onSessions(({ sessions }: { sessions: SessionItem[] }) => {
      if (sessions.length === 0) return;
      isServerMode.current = true;
      const serverIds = new Set(sessions.map((s) => s.id));

      for (const s of sessions) {
        if (loadMessages(inputId, s.id).length === 0) {
          unloadedSessionIds.current.add(s.id);
        }
      }

      const serverThreads: ThreadItem[] = sessions.map((s) => ({
        key: s.id, label: s.title || s.id, status: "regular" as const,
      }));

      setThreads((prev) => {
        const localNew = prev.filter(
          (t) => !serverIds.has(t.key) && thisSessionThreadIds.current.has(t.key)
        );
        const merged = [...localNew, ...serverThreads];
        saveThreads(inputId, merged);
        return merged;
      });

      setMessagesMap((prev) => {
        const patch: Record<string, ThreadMessage[]> = {};
        for (const s of sessions) {
          patch[s.id] = prev[s.id] ?? loadMessages(inputId, s.id);
        }
        return { ...prev, ...patch };
      });

      const cur = currentThreadIdRef.current;
      if (!serverIds.has(cur) && !thisSessionThreadIds.current.has(cur)) {
        setCurrentThreadId(sessions[0].id);
      }

      const activeCur = serverIds.has(currentThreadIdRef.current)
        ? currentThreadIdRef.current
        : sessions[0].id;
      if (unloadedSessionIds.current.has(activeCur)) {
        bridge.current.sendLoadSession(activeCur, activeCur);
        unloadedSessionIds.current.delete(activeCur);
      }
    });

    bridge.current.onLoadThread(({ threadId, messages: rawMsgs }: { threadId: string; messages: unknown[] }) => {
      unloadedSessionIds.current.delete(threadId);
      // rawMsgs arrive in ThreadMessage format from R's send_thread()
      setMessagesMap((prev) => ({
        ...prev,
        [threadId]: rawMsgs as ThreadMessage[],
      }));
    });

    bridge.current.sendReady();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── commands (for / popover) ──────────────────────────────────────────────
  const commands = useMemo(
    () => (config.commands ?? []),
    [config.commands]
  );

  return {
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
  };
}
