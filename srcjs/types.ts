// Internal types for shinyAntDesignX

export type { AttachmentData, ToolCallPayload, SessionItem, RunCallbacks, ShinyBridge } from "./bridge";

// Tool call state within an assistant message — shared by ShinyMessage and rendering
export interface ToolCallState {
  toolCallId:   string;
  toolName:     string;
  args:         Record<string, unknown>;
  argsText:     string;
  annotations?: Record<string, unknown>; // icon, title, requiresApproval, resultType, resultLang, resultFilename
  result?:      unknown;
  isError?:     boolean;
  status:       "loading" | "success" | "error" | "abort";
}

// Config passed from R via x.config
export interface WidgetConfig {
  show_conversation_list?: boolean;
  suggestions?:   Array<{ prompt: string; text?: string }>;
  commands?:      Array<{ name: string; description: string; prompt: string; category?: string }>;
  tools?:         Array<{ name: string; description: string }>;
  action_items?:  Array<{ section: string; id: string; label: string; description?: string }>;
  strings?:       Record<string, unknown>;
  assistant_avatar?: { fallback?: string; src?: string; alt?: string };
  xcard_mode?:    "inline" | "panel";  // default: "inline"
  xcard_panel_width?: number;           // panel mode width px, default: 360
}
