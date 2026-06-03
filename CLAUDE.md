# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**所有回复必须使用中文（简体）。** 代码、命令、文件路径、技术术语保持英文原样。

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
- **xCard `dataPath` must NOT start with `/`** — `resolveValueV09` treats any string starting with `/` as a dataModel path and resolves it before the component receives it, destroying the path string. Use flat keys: `dataPath = "region"` not `dataPath = "/params/region"`. The `xcard_update_data` path can still use `/region` or `region` — `getValueByPath` strips the leading `/` anyway.
- xCard `action.event.context` path bindings (`list(path = "region")`) ARE resolved correctly by Card's `resolveActionContextPathRefs`. This is different from `dataPath` — context path binding works because it goes through `{ path: "..." }` object not a bare string.
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
