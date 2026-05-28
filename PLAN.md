# shinyAntDesignX — 实现计划（组件化架构）

## 战略决定（2026-05-28）

**转向组件化**。原单体 widget 架构（一个 `antDesignXOutput` 包含全部功能）改为多个独立 widget，与 Ant Design X 的原子组件设计理念一致。

背景文档：`.claude/docs/03-shiny-widget-design-report.md`

---

## 架构总览

```
shinyAntDesignX 包
├── Tier 1 — 纯展示 widget（无状态，R传数据→JS渲染）
│   ├── shinyXMarkdown        流式 Markdown 渲染
│   ├── shinyCodeHighlighter  代码语法高亮
│   ├── shinyMermaid          Mermaid 图表
│   └── shinyThoughtChain     工具调用链可视化
│
├── Tier 2 — 交互 widget（自包含状态）
│   ├── shinySender           输入框，emit 到 Shiny input
│   └── shinyFileCard         文件卡片列表
│
└── Tier 3 — 完整 chat widget（复用 Tier 1/2）
    └── antDesignXOutput      完整 AI 聊天界面（当前已有）
```

---

## 构建环境

- Node：`/home/kaiping.yang/.nvm/versions/node/v24.15.0/bin/node`
- Vite 6（IIFE bundle 模式，每个 widget 独立 entry）
- antd v6 + @ant-design/x + @ant-design/x-markdown

---

## npm 依赖

```json
{
  "dependencies": {
    "@ant-design/x": "latest",
    "@ant-design/x-markdown": "latest",
    "antd": "^6",
    "@ant-design/icons": "^5",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

---

## 目标项目结构

```
R/
  antDesignX.R          # 现有 chat widget
  server.R              # 现有 chat server
  xmarkdown.R           # shinyXMarkdownOutput() + renderShinyXMarkdown()
  codeHighlighter.R     # shinyCodeHighlighterOutput() + renderShinyCodeHighlighter()
  mermaid.R             # shinyMermaidOutput() + renderShinyMermaid()
  thoughtChain.R        # shinyThoughtChainOutput() + renderShinyThoughtChain()
  sender.R              # shinySenderOutput() + shinySenderServer()

srcjs/
  # 现有（Tier 3）
  index.tsx             # antDesignX widget 注册
  AntDesignX.tsx        # 完整 chat 主组件
  state.ts              # useShinyState hook
  bridge.ts             # Shiny ↔ React 通信
  types.ts              # 内部类型

  # 新增（Tier 1/2）
  widgets/
    xmarkdown/
      index.tsx         # HTMLWidgets 注册
      XMarkdown.tsx     # XMarkdown 包装组件
    codeHighlighter/
      index.tsx
      CodeHighlighter.tsx
    mermaid/
      index.tsx
      MermaidWidget.tsx
    thoughtChain/
      index.tsx
      ThoughtChainWidget.tsx
    sender/
      index.tsx
      SenderWidget.tsx

inst/
  www/
    antDesignX.js       # 现有 chat bundle
    xmarkdown.js        # 新 Tier 1 bundles
    codeHighlighter.js
    mermaid.js
    thoughtChain.js
    sender.js
  htmlwidgets/
    antDesignX.yaml
    xmarkdown.yaml
    codeHighlighter.yaml
    mermaid.yaml
    thoughtChain.yaml
    sender.yaml
```

---

## Vite 多 entry 配置

```typescript
// vite.config.ts
build: {
  lib: {
    entry: {
      antDesignX:       "srcjs/index.tsx",
      xmarkdown:        "srcjs/widgets/xmarkdown/index.tsx",
      codeHighlighter:  "srcjs/widgets/codeHighlighter/index.tsx",
      mermaid:          "srcjs/widgets/mermaid/index.tsx",
      thoughtChain:     "srcjs/widgets/thoughtChain/index.tsx",
      sender:           "srcjs/widgets/sender/index.tsx",
    },
    formats: ["iife"],
    name: "shinyAntDesignX",
    fileName: (_, entryName) => `${entryName}.js`,
  },
  outDir: "inst/www",
}
```

---

## Tier 1 widget 规范

### shinyXMarkdown

**R API**：
```r
shinyXMarkdownOutput("id", width = "100%", height = "auto")
renderShinyXMarkdown({ list(content = "# Hello\n\n**world**", streaming = FALSE) })
```

**JS 接收**：`{ content: string, streaming: boolean }`

**核心实现**：
```tsx
import { XMarkdown } from "@ant-design/x-markdown";
<XMarkdown content={x.content} streaming={{ hasNextChunk: x.streaming }} />
```

---

### shinyCodeHighlighter

**R API**：
```r
shinyCodeHighlighterOutput("id")
renderShinyCodeHighlighter({ list(code = "x <- 1 + 1", lang = "r") })
```

**JS 接收**：`{ code: string, lang: string, showHeader: boolean }`

---

### shinyMermaid

**R API**：
```r
shinyMermaidOutput("id")
renderShinyMermaid({ list(diagram = "graph TD\nA-->B") })
```

**JS 接收**：`{ diagram: string, enableZoom: boolean, enableDownload: boolean }`

---

### shinyThoughtChain

**R API**：
```r
shinyThoughtChainOutput("id")
renderShinyThoughtChain({
  list(items = list(
    list(key = "1", title = "Search", status = "success",
         content = "Found 5 results", icon = "search")
  ))
})
```

**JS 接收**：`{ items: ThoughtChainItemType[], line: string }`

---

## Tier 3（现有 chat widget）升级

现有 `antDesignX` widget 保留，但内部升级：
1. 文本渲染从 `whiteSpace: pre-wrap` 改用 `XMarkdown`
2. 代码块自动用 `CodeHighlighter` 渲染（通过 XMarkdown components 映射）
3. Mermaid 块自动渲染

---

## 实施路线图

### Phase 1（当前优先）— Tier 1 纯展示 widget
- [ ] 安装 `@ant-design/x-markdown` 依赖
- [ ] 配置 Vite 多 entry
- [ ] 实现 `shinyXMarkdown`
- [ ] 实现 `shinyCodeHighlighter`
- [ ] 实现 `shinyMermaid`
- [ ] 实现 `shinyThoughtChain`（独立版）
- [ ] 更新 NAMESPACE + DESCRIPTION
- [ ] 创建 examples/tier1_demo.R 验证

### Phase 2 — Tier 3 升级
- [ ] 替换 chat widget 内的文本渲染为 XMarkdown
- [ ] 测试流式 Markdown 效果

### Phase 3 — Tier 2 交互 widget
- [ ] 实现 `shinySender`

---

## 关键技术注意事项

1. **XMarkdown streaming**：流式时传 `streaming={{ hasNextChunk: true }}`，完成后传 `false` 触发最终渲染
2. **Mermaid config 引用稳定**：`config` prop 必须用 `useMemo`，否则反复初始化
3. **Vite IIFE 多 entry**：每个 entry 独立包含 React（IIFE 模式不共享），bundle 较大但隔离可靠
4. **process.env.NODE_ENV**：IIFE 构建必须在 vite.config.ts 中 `define: { "process.env.NODE_ENV": JSON.stringify("production") }`
5. **antd v6 CSS-in-JS**：无需 style.css，yaml 只声明 script

---

## 现有可用代码（勿重写）

| 文件 | 状态 | 说明 |
|------|------|------|
| `srcjs/bridge.ts` | ✅ 完整 | Shiny ↔ React 通信协议 |
| `srcjs/state.ts` | ✅ 完整 | chat 状态管理 hook |
| `srcjs/AntDesignX.tsx` | ✅ 工作中 | 完整 chat UI |
| `srcjs/index.tsx` | ✅ 完整 | HTMLWidgets 注册 |
| `R/server.R` | ✅ 完整 | antDesignXServer() |
| `R/antDesignX.R` | ✅ 完整 | output + render 函数 |
