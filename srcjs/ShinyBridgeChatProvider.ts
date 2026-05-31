// ShinyBridgeChatProvider — AbstractChatProvider that drives ShinyBridgeRequest.
// transformMessage accumulates chunks into a ShinyMessage:
//   - "chunk"       → append to textContent
//   - "thinking"    → append to reasoningContent
//   - "tool-call"   → push new ToolCallState (status: loading)
//   - "tool-result" → ShinyBridgeRequest fires toolResultHook instead of onUpdate;
//                     this case is unreachable but kept for switch exhaustiveness
//   - "done"/"error"→ onSuccess/onError fired by ShinyBridgeRequest, not via chunk
import { AbstractChatProvider } from "@ant-design/x-sdk";
import type { TransformMessage, XRequestOptions } from "@ant-design/x-sdk";
import type { ShinyBridgeRequest, ShinyInput, ShinyChunk } from "./ShinyBridgeRequest";
import type { ToolCallState } from "./types";

// ── ShinyMessage: what a single assistant Bubble carries ─────────────────────

export interface ShinyMessage {
  role: "user" | "assistant";
  textContent: string;
  reasoningContent?: string;
  toolCalls: ToolCallState[];
  attachments?: import("./bridge").AttachmentData[];
  cardSurfaceIds?: string[];  // XCard surfaces embedded in this message (inline mode)
}

// ── provider ──────────────────────────────────────────────────────────────────

export class ShinyBridgeChatProvider extends AbstractChatProvider<
  ShinyMessage,
  ShinyInput,
  ShinyChunk
> {
  transformParams(
    requestParams: Partial<ShinyInput>,
    _options: XRequestOptions<ShinyInput, ShinyChunk, ShinyMessage>
  ): ShinyInput {
    return {
      query:       requestParams.query ?? "",
      threadId:    requestParams.threadId ?? "",
      attachments: requestParams.attachments,
    };
  }

  transformLocalMessage(requestParams: Partial<ShinyInput>): ShinyMessage {
    return {
      role:         "user",
      textContent:  requestParams.query ?? "",
      toolCalls:    [],
      attachments:  requestParams.attachments,
    };
  }

  transformMessage(
    info: TransformMessage<ShinyMessage, ShinyChunk>
  ): ShinyMessage {
    const { originMessage, chunk } = info;
    const base: ShinyMessage = originMessage ?? {
      role:        "assistant",
      textContent: "",
      toolCalls:   [],
    };

    if (!chunk) return base;

    switch (chunk.type) {
      case "chunk":
        return { ...base, textContent: base.textContent + chunk.text };

      case "thinking":
        return {
          ...base,
          reasoningContent: (base.reasoningContent ?? "") + chunk.text,
        };

      case "tool-call": {
        const newTc: ToolCallState = {
          toolCallId:  chunk.toolCallId,
          toolName:    chunk.toolName,
          args:        chunk.args,
          argsText:    chunk.argsText,
          annotations: chunk.annotations,
          status:      "loading",
        };
        return { ...base, toolCalls: [...base.toolCalls, newTc] };
      }

      case "card-command": {
        // Track surfaceId when a createSurface command arrives so inline rendering knows
        // which XCard.Card to embed in this message bubble
        const cmd = chunk.command;
        if ("createSurface" in cmd) {
          const surfaceId = (cmd as { createSurface: { surfaceId?: string } }).createSurface?.surfaceId;
          if (surfaceId) {
            const existing = base.cardSurfaceIds ?? [];
            if (!existing.includes(surfaceId)) {
              return { ...base, cardSurfaceIds: [...existing, surfaceId] };
            }
          }
        }
        return base;
      }

      // tool-result is applied via setMessages() scan in AntDesignX.tsx;
      // ShinyBridgeRequest fires toolResultHook directly, not onUpdate.
      case "tool-result":
        return base;

      default:
        return base;
    }
  }
}

// ── factory helper ─────────────────────────────────────────────────────────────

export function createShinyProvider(
  request: ShinyBridgeRequest
): ShinyBridgeChatProvider {
  return new ShinyBridgeChatProvider({ request });
}
