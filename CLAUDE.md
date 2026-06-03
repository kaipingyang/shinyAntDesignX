# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**所有回复必须使用中文（简体）。** 代码、命令、文件路径、技术术语保持英文原样。

## CRITICAL: 参考文档强制规则

**在任何涉及 Ant Design X 组件的工作前，必须先查阅对应文档和 skill。违反此规则导致的 bug 视为未做调查。**

### 文档位置

| 主题 | 上游源码文档 | 项目 Skill |
|------|------------|-----------|
| XCard / A2UI v0.9 | `ant-design-x-src/packages/x/docs/x-card/` | `.claude/skills/x-card/` |
| XMarkdown | `ant-design-x-src/packages/x/docs/x-markdown/` | `.claude/skills/x-markdown/` |
| x-sdk (useXChat/Provider) | `ant-design-x-src/packages/x/docs/x-sdk/` | `.claude/skills/use-x-chat/`, `.claude/skills/x-chat-provider/` |
| XRequest | `ant-design-x-src/packages/x/docs/x-sdk/x-request*` | `.claude/skills/x-request/` |
| 组件 (Bubble/Sender/等) | `ant-design-x-src/packages/x/docs/` | `.claude/skills/x-components/` |
| 官方 demo | `ant-design-x-src/packages/x/docs/*/demo/` | — |

### 强制查阅时机

- **修改或新增 xCard 组件行为前** → 必读 `x-card/a2ui-v-0-9.zh-CN.md` + 对应 demo
- **设计 xCard 组件交互逻辑前** → 必读 `x-card/demo/A2UI_v0.9/` 下对应示例
- **使用 useXChat/Provider 前** → 必读 `x-sdk/` 文档 + `.claude/skills/use-x-chat/`
- **遇到组件行为异常** → 先读官方 demo 源码确认正确模式，再改代码

## What this is

R package (`shinyAntDesignX`) wrapping Ant Design X React components as Shiny htmlwidgets. Component-based architecture: multiple independent widgets, not one monolith.

## Build commands

**Must use absolute Node path — system node is v12, too old.**

```bash
# Build single widget
WIDGET_ENTRY=antDesignX      /home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node ./node_modules/.bin/vite build
WIDGET_ENTRY=xmarkdown       /home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node ./node_modules/.bin/vite build
WIDGET_ENTRY=codeHighlighter /home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node ./node_modules/.bin/vite build
WIDGET_ENTRY=mermaid         /home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node ./node_modules/.bin/vite build
WIDGET_ENTRY=thoughtChain    /home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node ./node_modules/.bin/vite build

# Build all widgets
/home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node build-all.js
```

**R development:**
```r
devtools::load_all("/usrfiles/shared-projects/users/kaiping_yang/shinyAntDesignX")
shiny::runApp("examples/tier1_demo.R", host = "0.0.0.0", port = 8080)
```

## Architecture

Three tiers:

| Tier | Widgets | Pattern |
|------|---------|---------|
| 1 | `antDesignXMarkdownOutput`, `antDesignXCodeHighlighterOutput`, `antDesignXMermaidOutput`, `antDesignXThoughtChainOutput` | Pure display — R passes data, JS renders, no state |
| 2 | `antDesignXSenderOutput` (planned) | Self-contained interactive, emits to `input$` |
| 3 | `antDesignXOutput` | Full AI chat: bridge.ts + x-sdk + streaming + tool calls |

Each widget has:
- `srcjs/widgets/<name>/index.tsx` — React component + HTMLWidgets registration
- `R/<name>.R` — `antDesignX<Name>Output()` + `renderAntDesignX<Name>()`
- `inst/htmlwidgets/<name>.yaml` — dependency declaration
- `inst/www/<name>.js` — compiled IIFE output

## Tier 3 chat widget internals

`srcjs/bridge.ts` — **do not modify**. Handles all Shiny ↔ React messaging: `chunk / done / error / thinking / tool-call / tool-result / sessions / load-thread / clear`.

`srcjs/ShinyBridgeRequest.ts` + `srcjs/ShinyBridgeChatProvider.ts` — x-sdk integration layer. `state.ts` is superseded (kept as reference).

`srcjs/AntDesignX.tsx` — root component. Uses `useXChat` + `useXConversations`, composes `Conversations + Bubble.List + Sender + ThoughtChain + Dropdown` (slash commands).

R server: `antDesignXServer(id, handler, ...)` — handler receives `on_chunk / on_done / on_error / on_tool_call / on_tool_result / on_thinking / is_cancelled / wait_for_approval / register_cancel`.

## Known gotchas

- antd v6 IIFE build requires `define: { "process.env.NODE_ENV": JSON.stringify("production") }` — omit → `process is not defined`
- `Bubble.List` prop is `role` not `roles`
- `typing` prop must include `effect` field: `{ effect: "typing", step: 2 }`
- `avatar` prop takes antd `<Avatar>` component, not `{ icon, children }` plain object
- XMarkdown `config` prop must be referentially stable (use `useMemo`)
- XMarkdown streaming: **must set `hasNextChunk: false` on final chunk** — leaving it `true` freezes incomplete syntax placeholders
- Vite IIFE format doesn't support multiple entries in one config — each widget built separately via `WIDGET_ENTRY` env var
- **xCard `dataPath` must NOT start with `/`** — `resolveValueV09` treats any string starting with `/` as a dataModel path and resolves it before the component receives it, destroying the path string. Use flat keys: `dataPath = "region"` not `dataPath = "/region"`.
- **xCard `value = list(path = "...")` MUST start with `/`** — `isPathValue` only matches strings starting with `/`. Without leading `/`, the path string is returned as a literal and the component receives the path string itself instead of the dataModel value.
- Summary: `dataPath = "region"` (no `/`), `value = list(path = "/region")` (with `/`), `xcard_update_data("/region", val)` (either works).
- xCard `action.event.context` path bindings (`list(path = "/region")`) must also start with `/` — same rule as `value = list(path = ...)`.
- xCard Button: pass `{}` as context in `onAction(name, {})` — passing `action.event.context` directly overrides Card's resolved values with raw `{path}` objects (componentContext has higher priority in `resolveActionContextPathRefs`).
- FileCard with `type="image"` but no `src` → broken antd Image; fix: pass `type="file"` + `icon="image"` (see `fileCard/index.tsx resolveType`)
- Actions `onClick` top-level fires only for dropdown submenus; use per-item `onItemClick` for regular buttons
- Conversations `activeKey` must be local React state (not directly bound to R) — R provides initial value only

## All R exports (v0.2.0)

| Widget | Output fn | Render fn |
|--------|-----------|-----------|
| Full chat | `antDesignXOutput` | `renderAntDesignX` / `antDesignXServer` |
| XMarkdown | `antDesignXMarkdownOutput` | `renderAntDesignXMarkdown` |
| CodeHighlighter | `antDesignXCodeHighlighterOutput` | `renderAntDesignXCodeHighlighter` |
| Mermaid | `antDesignXMermaidOutput` | `renderAntDesignXMermaid` |
| ThoughtChain | `antDesignXThoughtChainOutput` | `renderAntDesignXThoughtChain` |
| Think | `antDesignXThinkOutput` | `renderAntDesignXThink` |
| BubbleList | `antDesignXBubbleListOutput` | `renderAntDesignXBubbleList` |
| Sender | `antDesignXSenderOutput` | `renderAntDesignXSender` |
| Attachments | `antDesignXAttachmentsOutput` | `renderAntDesignXAttachments` |
| Suggestion | `antDesignXSuggestionOutput` | `renderAntDesignXSuggestion` |
| Actions | `antDesignXActionsOutput` | `renderAntDesignXActions` |
| Sources | `antDesignXSourcesOutput` | `renderAntDesignXSources` |
| FileCard | `antDesignXFileCardOutput` | `renderAntDesignXFileCard` |
| Folder | `antDesignXFolderOutput` | `renderAntDesignXFolder` |
| Conversations | `antDesignXConversationsOutput` | `renderAntDesignXConversations` |
| Welcome | `antDesignXWelcomeOutput` | `renderAntDesignXWelcome` |
| Prompts | `antDesignXPromptsOutput` | `renderAntDesignXPrompts` |
| Notification | `antDesignXNotificationOutput` | `renderAntDesignXNotification` |
| XCard | `antDesignXCardOutput` | `renderAntDesignXCard` + `xcard_create_surface()` / `xcard_update_components()` / `xcard_update_data()` |

## Reference docs

### Project docs (`.claude/docs/`)
- `01-ant-design-x-ecosystem.md` — ecosystem overview (5 packages, RICH paradigm)
- `02-component-api-reference.md` — full API for all 17 components + XMarkdown
- `03-shiny-widget-design-report.md` — architecture decision record
- `04-htmlwidgets-render-pattern.md` — correct R render function pattern (`shinyRenderWidget` + `bquote`)

### Upstream source reference (`ant-design-x-src/packages/x/`, not in git)
- `components/<name>/interface.ts` — TypeScript interfaces for each component
- `docs/x-markdown/streaming.zh-CN.md` — XMarkdown streaming API (`hasNextChunk`, `tail`, `enableAnimation`)
- `docs/x-markdown/chat-enhancement.zh-CN.md` — mapping Think/Sources into XMarkdown via `components` prop
- `docs/playground/ultramodern.tsx` — canonical full chat UI (uses `useXChat` + `useXConversations` from x-sdk)
- `docs/playground/copilot.tsx` — copilot sidebar layout reference
- `docs/x-sdk/use-x-chat.zh-CN.md` — `useXChat` hook API (upstream data layer, not currently used here)
- `docs/x-card/a2ui-v-0-9.zh-CN.md` — A2UI v0.9 protocol for dynamic AI-driven card UIs
