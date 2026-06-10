# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

**CRITICAL: 所有回复必须使用中文（简体）。代码、命令、文件路径保持英文。禁止韩语。**

## CRITICAL: 参考文档强制规则

**任何开发、修改、调试工作前，必须先查阅对应上游文档和 skill。未做调查直接改代码导致的 bug 视为流程违规。**

### 文档位置

| 主题 | 上游源码文档 | 项目 Skill |
|------|------------|-----------|
| XCard / A2UI v0.9 | `ant-design-x-src/packages/x/docs/x-card/` | `.claude/skills/x-card/` |
| XMarkdown | `ant-design-x-src/packages/x/docs/x-markdown/` | `.claude/skills/x-markdown/` |
| x-sdk (useXChat/Provider) | `ant-design-x-src/packages/x/docs/x-sdk/` | `.claude/skills/use-x-chat/`, `.claude/skills/x-chat-provider/` |
| XRequest | `ant-design-x-src/packages/x/docs/x-sdk/x-request*` | `.claude/skills/x-request/` |
| 组件 (Bubble/Sender/等) | `ant-design-x-src/packages/x/docs/` | `.claude/skills/x-components/` |
| 官方 demo | `ant-design-x-src/packages/x/docs/*/demo/` | — |

### 强制查阅规则（适用于所有任务，不限于 xCard）

任何任务开始前：

1. **确定涉及哪些组件/模块** → 找到对应上游文档路径
2. **读官方 demo 确认正确使用模式** — 官方 demo 是权威，不是猜测
3. **调用对应 skill** — skill 包含已提炼的最佳实践
4. **调试行为异常前** → 先读源码 (`ant-design-x-src/`) 确认预期行为，再改代码

**不允许**：跳过文档直接"看起来应该这样"地改代码。每一次这样做都导致了可避免的 bug（例：RadioGroup controlled/uncontrolled 模式错误、dataPath 路径前缀规则、Button onAction context 覆盖问题，全部可通过读 demo 提前发现）。

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
- XMarkdown widget `streaming` param accepts three forms: `FALSE` (no streaming), `TRUE` (shorthand: `hasNextChunk=TRUE, enableAnimation=TRUE`), or a named list with any subset of `hasNextChunk/enableAnimation/animationConfig/tail/incompleteMarkdownComponentMap`
- XMarkdown widget does NOT support `components` (custom React components) or `config` (MarkedExtension) from R — these require JS-side code; omit from R API
- XMarkdown widget `components` accepts preset names only: `"CodeBlock"` (block code + copy button), `"InlineCode"` (antd Typography.Text), `"ExternalLink"` (↗ icon + new tab). R usage: `list(code = "CodeBlock", a = "ExternalLink")`. Custom React components not supported via R.
- XMarkdown `paragraphTag` default is `"p"`; set to `"div"` when custom components contain block-level elements to avoid HTML validation errors
- Vite IIFE format doesn't support multiple entries in one config — each widget built separately via `WIDGET_ENTRY` env var
- **xCard `dataPath` must NOT start with `/`** — `resolveValueV09` treats any string starting with `/` as a dataModel path and resolves it before the component receives it, destroying the path string. Use flat keys: `dataPath = "region"` not `dataPath = "/region"`.
- **xCard `value = list(path = "...")` MUST start with `/`** — `isPathValue` only matches strings starting with `/`. Without leading `/`, the path string is returned as a literal and the component receives the path string itself instead of the dataModel value.
- Summary: `dataPath = "region"` (no `/`), `value = list(path = "/region")` (with `/`), `xcard_update_data("/region", val)` (either works).
- xCard `action.event.context` path bindings (`list(path = "/region")`) must also start with `/` — same rule as `value = list(path = ...)`.
- xCard Button: pass `{}` as context in `onAction(name, {})` — passing `action.event.context` directly overrides Card's resolved values with raw `{path}` objects (componentContext has higher priority in `resolveActionContextPathRefs`).
- **xCard component interaction protocol** — three classes: (A) action-only: `Button`/`ModalButton` call `onAction(name, {})`, never pass context directly; (B) dataModel-only: all form inputs (`Input`/`Slider`/`RadioGroup` etc.) call `onDataChange(path, value)` only, A-class actions read values via path refs; (C) hybrid: `Select` calls `onDataChange` then `onAction(name, { ...safeCtx, value: v })` where `safeCtx` is `action.event.context` with all `{ path }` refs filtered out — static literal fields kept, path objects removed to prevent them from blocking framework path resolution. Full protocol in `srcjs/xCardDefaults.tsx` header comments. **Timing study (examples/test_selectize_timing.R)**: "select-then-submit" pattern (Class B onDataChange on select + Class A onAction on button click) DOES work — path refs resolve correctly at button-click time when dataModel is already stable. Only "select-immediately-triggers-action" patterns (data_only, micro/macro delayed) fail. **Protocol red lines** (see `docs/xcard-interaction-protocol.md` for full spec): (1) never spread raw `action.event.context` in `onAction` — it blocks path resolution; (2) Select hybrid is not a template for other components; (3) new input components default to Class B; (4) any "select-immediately-triggers-action" request for Tabs/Segmented/RadioGroup/ChoicePicker requires a timing test first.
- **xCard boundary value handling** — input components fall into three semantic classes (full spec in `docs/xcard-interaction-protocol.md` "初始值语义分类"):
  - **UI-driven (always has a value)**: `Slider` (null/missing → 0, "never touched" ≡ "explicitly 0"), `Tabs` (no activeKey → first tab key). Both always write to dataModel on mount. Do NOT try to express "unset" via these components.
  - **Explicit-null (emptiness = null)**: `InputNumber`, `DateTimeInput`, `Rate` — write `null` to dataModel when no initial value or when cleared. R handler receives `NULL`. `Rate` displays `null` as 0 stars (UI fold), but model stays `null`. `CheckBox` and `SwitchInput` use strict boolean coercion: `checked === true || checked === 1` — strings `"true"`/`"1"` → `false` (intentional strictness).
  - **Absent-path (never selected = path missing)**: `RadioGroup`, `Segmented`, `ChoicePicker(single)` — if no initial value, mount does NOT write to dataModel; the path is simply absent. R handler: `NULL` from `ctx$path` means either "never selected" or "wrong path" — distinguish by always providing an initial value when "never selected" is not a valid business state. **Do NOT "standardize" these to write null** — that destroys the ability to detect the unselected state.
- **xCard ALL user-input components must use `useRef + forceUpdate`** — Card.tsx replays ALL historical `updateComponents` commands every time the queue grows, passing original prop values. Any controlled React component (`value={prop}`) will have its visible state reset to the initial prop on every replay. Solution: store value in `useRef` (immune to prop changes), render from ref, update ref + call `forceUpdate()` in onChange, write initial value to dataModel on mount via `useEffect([], [])`. Pattern: `if (ref.current === undefined) ref.current = prop`. Complete list of affected components (all implemented in `xCardDefaults.tsx`): RadioGroup, Segmented, Select, ChoicePicker, CheckBox, SwitchInput, Rate, Tabs, DateTimeInput, Input, Textarea, InputNumber, Slider, CheckboxGroup. Verified working via `examples/test_xcard_replay.R`. Do NOT use `xcard_update_data` for paths bound to user inputs — it will be replayed and reset values.
- **xCard `updateComponents` replay** — every time a new command is appended to the global queue, Card re-processes ALL prior commands for that surface. Design consequence: any `updateDataModel` for an input's path will reset that input to the original value on every subsequent `updateComponents`. Keep user-input paths out of `updateDataModel` and rely on `onDataChange` + `useRef` pattern instead.
- FileCard with `type="image"` but no `src` → broken antd Image; fix: pass `type="file"` + `icon="image"` (see `fileCard/index.tsx resolveType`)
- Actions `onClick` top-level fires only for dropdown submenus; use per-item `onItemClick` for regular buttons
- Conversations `activeKey` must be local React state (not directly bound to R) — R provides initial value only
- **`cardCommandQueueRef` is append-only — NEVER mutate, filter, or replace it.** XCard.Box uses `processedCommandsCount` ref to slice only new commands on each render. Any mutation (filter/splice/replace) corrupts the count and causes duplicate or skipped command processing. If deleteSurface + re-create is needed, keep all commands in the queue — Card.tsx internally resets `hasRenderedRef` on `deleteSurface` so the next `createSurface` starts fresh.
- **Standalone xCard "reset" requires a new surfaceId** — replacing `cmds` with a shorter list (e.g. `[createSurface]`) does NOT clear the card. `processedCommandsCount` is still at the old value; no new commands to process. Fix: generate a fresh `surfaceId` on reset so React unmounts the old `XCard.Card` (count = 0) and mounts a new one. Pattern: `new_sid <- paste0(base_id, "_", as.integer(Sys.time()))`. See `examples/test_xcard_replay.R`.
- **`deleteSurface` + same-session `createSurface` has a flush timing gap** — after `deleteSurface` removes the sid from `cardSurfaceIds`, the `<XCard.Card>` DOM node disappears. A subsequent `createSurface` pushes to `pendingSurfaceIdsRef` but the `[messages]` flush effect only fires when `messages` changes (i.e. a new `on_chunk`). If `createSurface` comes from an `observeEvent` with no accompanying message, the Card never re-appears. **Workaround**: avoid `deleteSurface` + re-create in `observeEvent`; instead use `updateComponents` with a placeholder to "clear" visually without removing the Card DOM node. Reserve `deleteSurface` for when the AI handler sends it alongside `on_chunk`.
- **Do NOT add `cardCommandVersion` to the `[messages]` useEffect deps** — Vite IIFE minification causes TDZ (`Cannot access 'X' before initialization`) if a `useEffect` declared before a `useState` references that state in its deps array. Always declare `useState` before any `useEffect` that references it.
- **UMD externals: use named imports, not default imports** — `import { XMarkdown } from "@ant-design/x-markdown"` resolves to `window.XMarkdown.XMarkdown` (component function). `import XMarkdown from "@ant-design/x-markdown"` resolves to `window.XMarkdown` (whole module object) → React error #130.
- **`antdx` `CodeHighlighter` unusable in IIFE widgets** — it uses `React.lazy()` + dynamic `import('react-syntax-highlighter/dist/esm/languages/prism/${lang}')` to load language packs. Dynamic ESM imports 404 at runtime in IIFE/UMD builds (no module system). Use `srcjs/prismConfig.ts` (PrismLight + static `refractor` imports) instead. Both `codeHighlighter` and `xmarkdown` widgets import from this shared config.
- **antd global CSS colors `<code>` red** — `antd` sets a red/pink color on `<code>` elements globally. PrismLight renders unclassified tokens (plain text, R function names etc.) as bare text nodes inside `<code>` with no wrapping `<span>`, so they inherit antd's color. Fix: pass `codeTagProps={{ style: { color: "inherit" } }}` to `SyntaxHighlighter`. See `srcjs/prismConfig.ts` `CODE_TAG_PROPS`.
- **`createSurface.theme.primaryColor` requires standalone xCard widget to read commands and pass `token.colorPrimary` to ConfigProvider** — the default `ConfigProvider` is static; it does not read theme from the command stream. In `srcjs/widgets/xCard/index.tsx`, scan `commands` array in reverse for the last `createSurface.theme.primaryColor` and pass `{ token: { colorPrimary } }` to `ConfigProvider`. antDesignX chat widget (AntDesignX.tsx) does not need this — it controls its own theme separately.

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
| XCard | `antDesignXCardOutput` | `renderAntDesignXCard` + `xcard_create_surface()` / `xcard_update_components()` / `xcard_update_data()` / `xcard_delete_surface()` |

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
