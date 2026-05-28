# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
| 1 | `shinyXMarkdown`, `shinyCodeHighlighter`, `shinyMermaid`, `shinyThoughtChain` | Pure display — R passes data, JS renders, no state |
| 2 | `shinySender` (planned) | Self-contained interactive, emits to `input$` |
| 3 | `antDesignXOutput` | Full AI chat: bridge.ts + state.ts + streaming + tool calls |

Each widget has:
- `srcjs/widgets/<name>/index.tsx` — React component + HTMLWidgets registration
- `R/<name>.R` — `shiny<Name>Output()` + `renderShiny<Name>()`
- `inst/htmlwidgets/<name>.yaml` — dependency declaration
- `inst/www/<name>.js` — compiled IIFE output

## Tier 3 chat widget internals

`srcjs/bridge.ts` — **do not modify**. Handles all Shiny ↔ React messaging: `chunk / done / error / thinking / tool-call / tool-result / sessions / load-thread / clear`.

`srcjs/state.ts` — `useShinyState()` hook. Manages threads, messages, streaming state, localStorage persistence, and server mode (sessions from R).

`srcjs/AntDesignX.tsx` — root component. Composes `Conversations + Bubble.List + Sender + ThoughtChain + Dropdown` (slash commands).

R server: `antDesignXServer(id, handler, ...)` — handler receives `on_chunk / on_done / on_error / on_tool_call / on_tool_result / on_thinking / is_cancelled / wait_for_approval / register_cancel`.

## Known gotchas

- antd v6 IIFE build requires `define: { "process.env.NODE_ENV": JSON.stringify("production") }` — omit it → `process is not defined`
- `Bubble.List` prop is `role` not `roles`
- `typing` prop must include `effect` field: `{ effect: "typing", step: 2 }`
- `avatar` prop takes antd `<Avatar>` component, not `{ icon, children }` plain object
- XMarkdown `config` prop must be referentially stable (use `useMemo`)
- Vite IIFE format doesn't support multiple entries in one config — each widget built separately via `WIDGET_ENTRY` env var

## Reference docs

- `.claude/docs/02-component-api-reference.md` — full Ant Design X component API
- `.claude/docs/03-shiny-widget-design-report.md` — architecture decision record
- `ant-design-x-src/packages/x/components/` — upstream TypeScript source (not in git)
