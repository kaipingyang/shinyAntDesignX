import { useRef, useCallback, useEffect } from "react";
import type { MessageInfo } from "@ant-design/x-sdk";
import type { ShinyBridge } from "../bridge";
import type { ShinyMessage } from "../ShinyBridgeChatProvider";
import type { ShinyBridgeRequest } from "../ShinyBridgeRequest";

type SetMessages = (updater: MessageInfo<ShinyMessage>[] | ((prev: MessageInfo<ShinyMessage>[]) => MessageInfo<ShinyMessage>[])) => boolean | void;

/** Wires up tool-result side-channel (toolResultHook) and tool approval UI. */
export function useToolSideChannel(
  request: ShinyBridgeRequest,
  bridge: ShinyBridge,
  setMessagesRef: React.MutableRefObject<SetMessages>,
) {
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

  const sendToolApproval = useCallback((toolCallId: string, approved: boolean) => {
    bridge.sendToolApproval(toolCallId, approved);
    // bridge is from useState — stable reference, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return { sendToolApproval };
}
