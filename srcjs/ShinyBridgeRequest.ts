// ShinyBridgeRequest — wraps Shiny WebSocket bridge as an x-sdk AbstractXRequestClass.
// XRequest normally fires HTTP fetch; we instead route through bridge.ts callbacks.
import { AbstractXRequestClass } from "@ant-design/x-sdk";
import type { XRequestOptions } from "@ant-design/x-sdk";
import { createShinyBridge } from "./bridge";
import type { ShinyBridge, AttachmentData } from "./bridge";

// ── payload types ─────────────────────────────────────────────────────────────

export interface ShinyInput {
  query: string;
  threadId: string;
  attachments?: AttachmentData[];
}

// Each SSE-like chunk coming back from R
export type ShinyChunk =
  | { type: "chunk";        text: string }
  | { type: "thinking";     text: string }
  | { type: "tool-call";    toolCallId: string; toolName: string; args: Record<string, unknown>; argsText: string; annotations?: Record<string, unknown> }
  | { type: "tool-result";  toolCallId: string; result: unknown; isError: boolean }
  | { type: "card-command"; command: Record<string, unknown> }
  | { type: "done" }
  | { type: "error";        message: string };

// ── ShinyBridgeRequest ────────────────────────────────────────────────────────

export class ShinyBridgeRequest extends AbstractXRequestClass<ShinyInput, ShinyChunk> {
  options: XRequestOptions<ShinyInput, ShinyChunk> = { manual: true };

  private bridge: ShinyBridge;
  private _isRequesting = false;
  private _currentThreadId = "";

  // Typed side-channel for tool-result updates — set by AntDesignX component
  toolResultHook: ((toolCallId: string, result: unknown, isError: boolean) => void) | null = null;

  // AbstractXRequestClass abstract getters
  get asyncHandler(): Promise<void> { return Promise.resolve(); }
  get isTimeout(): boolean { return false; }
  get isStreamTimeout(): boolean { return false; }
  get isRequesting(): boolean { return this._isRequesting; }
  get manual(): boolean { return true; }

  constructor(inputId: string) {
    super("shiny://bridge", { manual: true });
    this.bridge = createShinyBridge(inputId);
  }

  // Bridge accessor — AntDesignX.tsx needs it for sessions/load-thread/cancel
  getBridge(): ShinyBridge {
    return this.bridge;
  }

  run(params?: ShinyInput): void {
    this._isRequesting = true;
    const threadId = params?.threadId ?? "";
    this._currentThreadId = threadId;

    // ARCHITECTURAL CONSTRAINT: bridge per-threadId bucketed callbacks.
    // Concurrent requests to different threads are supported. useXChat's isRequesting
    // guard still prevents two concurrent requests on the SAME thread.
    // threadId filtering in each callback is now the primary routing mechanism.
    this.bridge.setRunCallbacks(threadId, {
      onChunk: (text, msgThreadId) => {
        if (msgThreadId && msgThreadId !== threadId) return;
        this.options.callbacks?.onUpdate?.(
          { type: "chunk", text },
          new Headers()
        );
      },
      onThinking: (text, msgThreadId) => {
        if (msgThreadId && msgThreadId !== threadId) return;
        this.options.callbacks?.onUpdate?.(
          { type: "thinking", text },
          new Headers()
        );
      },
      onToolCall: (tc, msgThreadId) => {
        if (msgThreadId && msgThreadId !== threadId) return;
        this.options.callbacks?.onUpdate?.(
          {
            type: "tool-call",
            toolCallId: tc.toolCallId,
            toolName:   tc.toolName,
            args:       tc.args,
            argsText:   tc.argsText,
            annotations: tc.annotations,
          },
          new Headers()
        );
      },
      onToolResult: (toolCallId, result, isError, msgThreadId) => {
        if (msgThreadId && msgThreadId !== threadId) return;
        // Side-channel: let AntDesignX apply setMessages for fine-grained update
        this.toolResultHook?.(toolCallId, result, isError);
      },
      onDone: (msgThreadId) => {
        if (msgThreadId && msgThreadId !== threadId) return;
        this._isRequesting = false;
        this.bridge.setRunCallbacks(threadId, null);
        // onSuccess signals useXChat that the stream completed
        this.options.callbacks?.onSuccess?.([], new Headers());
      },
      onError: (message, msgThreadId) => {
        if (msgThreadId && msgThreadId !== threadId) return;
        this._isRequesting = false;
        this.bridge.setRunCallbacks(threadId, null);
        this.options.callbacks?.onError?.(new Error(message));
      },
    });

    this.bridge.sendUserMessage(
      params?.query ?? "",
      threadId,
      params?.attachments
    );
  }

  abort(): void {
    this._isRequesting = false;
    this.bridge.setRunCallbacks(this._currentThreadId, null);
    this.bridge.sendCancel(this._currentThreadId);
  }
}
