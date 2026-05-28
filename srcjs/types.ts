// Internal types for shinyAntDesignX state management

export type { AttachmentData, ToolCallPayload, SessionItem, RunCallbacks, ShinyBridge } from "./bridge";

// Tool call state within an assistant message
export interface ToolCallState {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  argsText: string;
  annotations?: Record<string, unknown>; // icon, title, requiresApproval, resultType, resultLang, resultFilename
  result?: unknown;
  isError?: boolean;
  status: "loading" | "success" | "error" | "abort";
}

// Internal thread message (converted to Bubble.List items for rendering)
export interface ThreadMessage {
  key: string;
  role: "user" | "assistant";
  textContent: string;
  reasoningContent?: string;
  toolCalls: ToolCallState[];
  isStreaming: boolean;
  isError?: boolean;
  // user messages only
  attachments?: import("./bridge").AttachmentData[];
}

// Thread metadata (maps to Conversations component's ConversationItemType)
export interface ThreadItem {
  key: string;
  label: string;
  status: "regular" | "archived";
}

// Config passed from R via x.config
export interface WidgetConfig {
  show_conversation_list?: boolean;
  suggestions?: Array<{ prompt: string; text?: string }>;
  commands?: Array<{ name: string; description: string; prompt: string; category?: string }>;
  tools?: Array<{ name: string; description: string }>;
  action_items?: Array<{ section: string; id: string; label: string; description?: string }>;
  strings?: Record<string, unknown>;
  assistant_avatar?: { fallback?: string; src?: string; alt?: string };
}
