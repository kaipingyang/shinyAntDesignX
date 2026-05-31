# xCard AI 集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 R server 在 AI 流式响应过程中通过 `ctrl$send_card_command()` 实时推送 xCard A2UI v0.9 命令，支持 inline（嵌入气泡）和 panel（右侧独立区域）两种布局模式。

**Architecture:**
- bridge.ts 新增 `:card-command` 消息类型，JS 端按 surfaceId 维护 commandQueue Map
- AntDesignX.tsx 用 `XCard.Box` 包裹整个聊天区，inline 模式在 Bubble.List contentRender 里渲染 `XCard.Card`，panel 模式右侧独立 flex 列
- R/server.R 的 `antDesignXServer` 返回值加 `send_card_command(command, thread_id)`，消息带 threadId 隔离
- ShinyMessage 新增 `cardSurfaceIds` 字段追踪当前消息关联的 card

**Tech Stack:** TypeScript + React + @ant-design/x-card + R/Shiny htmlwidgets

---

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `srcjs/bridge.ts` | 修改 | 新增 `:card-command` handler + `sendCardCommand` 方法 |
| `srcjs/ShinyBridgeChatProvider.ts` | 修改 | `ShinyMessage` 加 `cardSurfaceIds?: string[]` |
| `srcjs/ShinyBridgeRequest.ts` | 修改 | `ShinyChunk` 加 `card-command` 类型 |
| `srcjs/AntDesignX.tsx` | 修改 | XCard.Box 包裹、inline/panel 布局、commandQueue state |
| `srcjs/types.ts` | 修改 | `WidgetConfig` 加 `xcard_mode?: "inline" | "panel"` 和 `xcard_panel_width?: number` |
| `R/server.R` | 修改 | `antDesignXServer` 返回值加 `send_card_command()` |
| `R/xCard.R` | 修改 | 文档更新，说明 AI 集成用法 |
| `examples/07_xcard_ai.R` | 新建 | 完整演示：AI 流式输出同时推 xCard commands |

---

## Task 1: bridge.ts — 新增 card-command 消息通道

**Files:**
- Modify: `srcjs/bridge.ts`

### 1.1 扩展 ShinyBridge 接口

- [ ] 读 `srcjs/bridge.ts`（已在上下文）确认当前接口

- [ ] 在 `ShinyBridge` interface 新增方法签名：

```typescript
// 在 ShinyBridge interface 的 sendFeedback 之后添加
sendCardCommand: (command: Record<string, unknown>, threadId: string) => void;
onCardCommand: (handler: (data: { command: Record<string, unknown>; threadId: string }) => void) => void;
```

- [ ] 在 `createShinyBridge` 函数体内注册 handler（在 `onLoadThread` 注册之后）：

```typescript
let cardCommandHandler: ((data: { command: Record<string, unknown>; threadId: string }) => void) | null = null;

Shiny.addCustomMessageHandler(`${inputId}:card-command`, (data) => {
  const d = data as { command: Record<string, unknown>; threadId: string };
  cardCommandHandler?.(d);
});
```

- [ ] 在 return 对象里添加实现：

```typescript
sendCardCommand(command, threadId) {
  Shiny.setInputValue(
    `${inputId}_card_command`,
    { command, threadId, ts: Date.now() },
    { priority: "event" }
  );
},

onCardCommand(handler) {
  cardCommandHandler = handler;
},
```

---

## Task 2: types.ts — WidgetConfig 加 xcard 配置

**Files:**
- Modify: `srcjs/types.ts`

- [ ] 在 `WidgetConfig` interface 末尾添加：

```typescript
xcard_mode?: "inline" | "panel";    // default: "inline"
xcard_panel_width?: number;          // panel 模式宽度 px，default: 360
```

---

## Task 3: ShinyBridgeChatProvider.ts — ShinyMessage 追踪 cardSurfaceIds

**Files:**
- Modify: `srcjs/ShinyBridgeChatProvider.ts`
- Modify: `srcjs/ShinyBridgeRequest.ts`

### 3.1 扩展 ShinyChunk 类型

- [ ] 在 `ShinyBridgeRequest.ts` 的 `ShinyChunk` union type 新增：

```typescript
| { type: "card-command"; command: Record<string, unknown> }
```

### 3.2 扩展 ShinyMessage

- [ ] 在 `ShinyBridgeChatProvider.ts` 的 `ShinyMessage` interface 末尾添加：

```typescript
cardSurfaceIds?: string[];   // surfaceIds of XCards embedded in this message (inline mode)
```

### 3.3 transformMessage 处理 card-command

- [ ] 在 `transformMessage` 的 switch 里，`case "tool-result":` 之前添加：

```typescript
case "card-command": {
  // Extract surfaceId from createSurface commands to track which cards belong to this message
  const cmd = chunk.command;
  if ("createSurface" in cmd) {
    const surfaceId = (cmd as any).createSurface?.surfaceId as string | undefined;
    if (surfaceId) {
      const existing = base.cardSurfaceIds ?? [];
      if (!existing.includes(surfaceId)) {
        return { ...base, cardSurfaceIds: [...existing, surfaceId] };
      }
    }
  }
  return base;
}
```

### 3.4 ShinyBridgeRequest.run() 路由 card-command

- [ ] 在 `ShinyBridgeRequest.ts` 的 `run()` 方法里，`onToolResult` 回调之后添加：

```typescript
// card-command is routed via onCardCommand on the bridge (side-channel, like toolResultHook)
// ShinyBridgeRequest doesn't call onUpdate for card-command directly;
// AntDesignX.tsx listens via bridge.onCardCommand() and manages commandQueues itself.
// However we DO call onUpdate with {type:"card-command"} so transformMessage can track surfaceIds.
```

然后在 `run()` 方法里注册 bridge.onCardCommand 的监听，通过 `cardCommandHook` 侧信道（和 toolResultHook 同样模式）：

- [ ] 在 `ShinyBridgeRequest` 类里加字段：

```typescript
cardCommandHook: ((command: Record<string, unknown>) => void) | null = null;
```

- [ ] 在 `run()` 的 `bridge.setRunCallbacks({...})` 里补充（在 `onError` 后 `}` 之前）：

```typescript
// card-command is NOT part of RunCallbacks (it's not per-run, it's per-surface)
// It's handled via AntDesignX useEffect with bridge.onCardCommand()
```

**注意**：card-command 不属于 RunCallbacks（不随 run 开始/结束），而是一个持久 bridge 事件。AntDesignX.tsx 在挂载时注册一次 `bridge.onCardCommand`，全生命周期有效。

但 transformMessage 需要感知 card-command 以追踪 cardSurfaceIds。因此还需要：

- [ ] 在 `run()` 里的 `bridge.setRunCallbacks` 闭包内，收到 bridge `:card-command`（通过 `bridge.onCardCommand` 全局 handler）时同时调用 `onUpdate`：

实现方案：在 `ShinyBridgeRequest` 挂载时（constructor 或独立 `attachBridge` 方法）注册全局 cardCommand 监听：

```typescript
// 在 constructor 里，bridge 建好后：
this.bridge = createShinyBridge(inputId);
this.bridge.onCardCommand(({ command, threadId }) => {
  // fire onUpdate with card-command chunk so transformMessage can track surfaceIds
  // only fire for the current active run's threadId
  if (this._currentThreadId && threadId === this._currentThreadId) {
    this.options.callbacks?.onUpdate?.(
      { type: "card-command", command },
      new Headers()
    );
  }
  // also fire the hook so AntDesignX can update commandQueues
  this.cardCommandHook?.(command);
});
```

---

## Task 4: AntDesignX.tsx — xCard state + 布局

**Files:**
- Modify: `srcjs/AntDesignX.tsx`

### 4.1 导入 XCard

- [ ] 在 import 区域添加：

```typescript
import XCard from "@ant-design/x-card";
import type { XAgentCommand_v0_9 } from "@ant-design/x-card";
```

### 4.2 cardCommandQueues state

- [ ] 在 `useXChat` 之后、`setMessagesRef` 之前添加：

```typescript
// surfaceId → accumulated command queue (append-only, Box processes new entries via processedCommandsCount)
const [cardCommandQueues, setCardCommandQueues] = useState<Map<string, XAgentCommand_v0_9[]>>(
  () => new Map()
);
const cardCommandQueuesRef = useRef(cardCommandQueues);
cardCommandQueuesRef.current = cardCommandQueues;
```

### 4.3 bridge.onCardCommand 监听

- [ ] 在 `useEffect([], [])` 的 `bridge.sendReady()` 之前添加：

```typescript
bridge.onCardCommand(({ command, threadId }: { command: Record<string, unknown>; threadId: string }) => {
  // append command to the relevant surfaceId's queue
  setCardCommandQueues((prev) => {
    const next = new Map(prev);
    // find surfaceId: createSurface gives it explicitly; others we broadcast to all known surfaces
    let surfaceId: string | null = null;
    if ("createSurface" in command) {
      surfaceId = (command as any).createSurface?.surfaceId ?? null;
    } else if ("updateComponents" in command) {
      surfaceId = (command as any).updateComponents?.surfaceId ?? null;
    } else if ("updateDataModel" in command) {
      surfaceId = (command as any).updateDataModel?.surfaceId ?? null;
    } else if ("deleteSurface" in command) {
      surfaceId = (command as any).deleteSurface?.surfaceId ?? null;
    }
    if (!surfaceId) return prev;
    const existing = next.get(surfaceId) ?? [];
    next.set(surfaceId, [...existing, command as XAgentCommand_v0_9]);
    return next;
  });
});
```

### 4.4 allCommands（合并所有 queue 供 XCard.Box）

- [ ] 在 `bubbleItems` useMemo 之前添加：

```typescript
// Flatten all surface queues into one array for XCard.Box
// Box uses processedCommandsCount to handle new entries efficiently
const allCardCommands = useMemo(() => {
  const result: XAgentCommand_v0_9[] = [];
  cardCommandQueues.forEach((cmds) => result.push(...cmds));
  return result;
}, [cardCommandQueues]);

const xcardMode = config.xcard_mode ?? "inline";
const xcardPanelWidth = config.xcard_panel_width ?? 360;

// Collect all active surfaceIds from messages (inline mode)
const activeSurfaceIds = useMemo(() => {
  const ids = new Set<string>();
  messages.forEach(({ message }) => {
    message.cardSurfaceIds?.forEach((id) => ids.add(id));
  });
  return ids;
}, [messages]);
```

### 4.5 bubbleItems — inline 模式插入 XCard.Card

- [ ] 在 bubbleItems 的 assistant 分支里，`AssistantContent` 之后（`footer` 之前）加 cards：

```typescript
// inline mode: render XCard.Card for each surfaceId in this message
const inlineCards = (xcardMode === "inline" && message.cardSurfaceIds?.length)
  ? message.cardSurfaceIds.map((surfaceId) => (
      <XCard.Card key={surfaceId} id={surfaceId} />
    ))
  : null;

return {
  key: id,
  role: "assistant",
  content: (
    <div>
      <AssistantContent msg={message} isStreaming={isStreaming} onApprove={sendToolApproval} />
      {inlineCards}
    </div>
  ),
  // ... typing, loading, footer 保持不变
};
```

### 4.6 布局：XCard.Box 包裹 + panel 区域

- [ ] 把当前 `return` 里的根 `<ConfigProvider>` 改造：

**inline 模式**（默认）：`XCard.Box` 包住整个聊天 div：

```tsx
return (
  <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm }}>
    <XCard.Box commands={allCardCommands} onAction={handleCardAction}>
      <div style={{ display: "flex", height: "100%", fontFamily: "inherit", overflow: "hidden" }}>
        {/* 对话侧 sidebar + chat area — 完全不变 */}
        {showConversations && (...)}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* ... 完全不变 */}
        </div>
      </div>
    </XCard.Box>
  </ConfigProvider>
);
```

**panel 模式**：在根 flex 容器末尾加第三列：

```tsx
{xcardMode === "panel" && activeSurfaceIds.size > 0 && (
  <div style={{
    width: xcardPanelWidth,
    flexShrink: 0,
    borderLeft: "1px solid #f0f0f0",
    overflow: "auto",
    padding: "12px",
  }}>
    {[...activeSurfaceIds].map((surfaceId) => (
      <XCard.Card key={surfaceId} id={surfaceId} />
    ))}
  </div>
)}
```

### 4.7 handleCardAction

- [ ] 在 `handleConversationChange` 之前添加：

```typescript
const handleCardAction = useCallback((payload: import("@ant-design/x-card").ActionPayload) => {
  bridge.sendAction(`card:${payload.surfaceId}:${payload.name}`);
  // Also emit as dedicated input for R to observe
  (window as any).Shiny?.setInputValue(
    `${inputId}_card_action`,
    { name: payload.name, surfaceId: payload.surfaceId, context: payload.context, ts: Date.now() },
    { priority: "event" }
  );
}, [bridge, inputId]);
```

---

## Task 5: R/server.R — send_card_command

**Files:**
- Modify: `R/server.R`

### 5.1 antDesignXServer 返回值加 send_card_command

- [ ] 读 `R/server.R` 第 261-280 行（invisible list）

- [ ] 在 `send_sessions` 之后、列表末尾前添加：

```r
send_card_command = function(command, thread_id = "default") {
  session$sendCustomMessage(
    paste0(input_id, ":card-command"),
    list(command = command, threadId = thread_id)
  )
},
```

### 5.2 card_action input observer（可选，供 R observe 用）

- [ ] 更新文档注释，在 `@return` 里加 `send_card_command(command, thread_id)` 的说明：

```r
#' @return A list with `clear()`, `send_tool_call()`, `send_tool_result()`,
#'   `send_sessions()`, and `send_card_command(command, thread_id)` functions.
#'   `input$<id>_card_action` fires when user interacts with a card component
#'   (e.g. clicks a Button with an action), containing `name`, `surfaceId`, `context`.
```

---

## Task 6: R/server.R — WidgetConfig 传 xcard_mode

**Files:**
- Modify: `R/server.R`

- [ ] 在 `antDesignXServer` 参数列表加：

```r
antDesignXServer <- function(id, handler,
                             show_conversation_list = FALSE,
                             xcard_mode  = c("inline", "panel"),
                             xcard_panel_width = 360L,
                             # ... 其余参数不变
```

- [ ] 在 config list 构建里加：

```r
config <- list(
  show_conversation_list = show_conversation_list,
  xcard_mode             = match.arg(xcard_mode),
  xcard_panel_width      = xcard_panel_width,
  # ... 其余不变
)
```

---

## Task 7: 构建验证

**Files:**
- Run build only

- [ ] 构建：

```bash
WIDGET_ENTRY=antDesignX /home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node ./node_modules/.bin/vite build
```

期望：`✓ built in ...`，零 error

- [ ] 如有 TypeScript 类型错误，按错误信息修复后重建

---

## Task 8: examples/07_xcard_ai.R — 演示

**Files:**
- Create: `examples/07_xcard_ai.R`

- [ ] 写演示 app：

```r
library(shiny)
library(bslib)
devtools::load_all(here::here())

ui <- tagList(
  tags$head(tags$style(HTML("html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }"))),
  antDesignXOutput("chat", height = "100vh")
)

server <- function(input, output, session) {
  ctrl <- antDesignXServer(
    "chat",
    xcard_mode = "inline",   # 或 "panel"
    handler = function(message, thread_id, on_chunk, on_done, on_error, ...) {
      # 1. 先创建 surface
      ctrl$send_card_command(
        xcard_create_surface("result-card"),
        thread_id = thread_id
      )
      # 2. 流式文字
      on_chunk("正在分析您的请求，生成结果卡片...\n\n")
      Sys.sleep(0.5)
      # 3. 推送组件
      ctrl$send_card_command(
        xcard_update_components("result-card", list(
          list(id = "title",  component = "Text",   text = paste0("分析：", message), variant = "h2"),
          list(id = "body",   component = "Text",   text = "这是 AI 生成的结构化卡片", variant = "body"),
          list(id = "btn",    component = "Button", label = "确认",  variant = "primary",
               action = list(event = list(name = "confirm", context = list(query = message))))
        )),
        thread_id = thread_id
      )
      on_chunk("卡片已生成。点击上方"确认"按钮继续。")
      on_done()
    },
    assistant_avatar = list(fallback = "AI")
  )

  # 监听卡片按钮事件
  observeEvent(input$chat_card_action, {
    act <- input$chat_card_action
    message("[CARD ACTION] ", act$name, " surfaceId=", act$surfaceId)
  })
}

shinyApp(ui, server)
```

---

## Task 9: Commit

- [ ] 暂存并提交：

```bash
git add srcjs/bridge.ts srcjs/ShinyBridgeChatProvider.ts srcjs/ShinyBridgeRequest.ts \
        srcjs/AntDesignX.tsx srcjs/types.ts R/server.R R/xCard.R \
        inst/www/antDesignX.js examples/07_xcard_ai.R
git commit -m "feat: xCard AI integration — inline/panel mode via send_card_command()

antDesignXServer gains send_card_command(command, thread_id) for pushing A2UI v0.9
commands during AI streaming. Supports inline mode (XCard.Card embedded in assistant
bubbles) and panel mode (right-side panel). bridge.ts adds :card-command channel.
ShinyMessage tracks cardSurfaceIds for inline rendering.

Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>"
```

---

## 自检

**Spec 覆盖检查：**
- [x] R server 可推 xCard commands：Task 5 `send_card_command`
- [x] inline 模式：Task 4.5 bubbleItems 插 XCard.Card
- [x] panel 模式：Task 4.6 右侧 flex 列
- [x] xcard_mode 参数：Task 6
- [x] 卡片按钮 action 回流 R：Task 4.7 + Task 5
- [x] threadId 隔离：bridge `:card-command` 携带 threadId，AntDesignX 按 surfaceId append queue
- [x] 构建验证：Task 7
- [x] 完整演示：Task 8

**类型一致性：**
- `XAgentCommand_v0_9` 来自 `@ant-design/x-card`，在 Task 3 和 Task 4 都使用
- `ActionPayload` 来自 `@ant-design/x-card`，Task 4.7 使用
- `cardSurfaceIds?: string[]` 定义在 Task 3，Task 4.5 读取
- `cardCommandHook` 定义在 Task 3，Task 4 通过 bridge.onCardCommand 替代（注：经分析，bridge.onCardCommand 比 request.cardCommandHook 更合适，因为 card-command 是持久通道不绑定 run 生命周期）

**潜在 issue：**
- `ctrl` 在 handler 里使用（Task 8 演示）：`ctrl` 是 `antDesignXServer` 的返回值，handler 在 `ExtendedTask` 里运行，`ctrl` 在同一 server 函数 env 里，R 闭包可以访问。✅
- `bridge.onCardCommand` 在 `useEffect([])` 里注册，`setCardCommandQueues` 是 stale closure → 用 ref 解决：`setCardCommandQueues` 是 React state setter，本身稳定不需要 ref。✅
