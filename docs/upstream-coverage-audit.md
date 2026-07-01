# shinyAntDesignX vs @ant-design/x 功能覆盖审计

> 审计日期：2026-06-23
> 更新：2026-07-01 — 补齐 antd 页内通知（message / notify）
> 结论：当前是**功能可用子集**，非 100% 全量复刻。

## 更新记录

**2026-07-01** — 新增 antd 底座库的页内通知能力（原审计只覆盖 @ant-design/x，未含 antd 页内 message/notification）：
- `message` widget → antd `message`（顶部单行 toast，hook 模式）
- `notify` widget → antd `notification`（角落卡片，hook 模式）
- 修复 3 个真 bug：Notification duration 单位（改用 XNotification）、Prompts icon 丢失、SwitchInput/Rate 边界值
- 三层通知区分：`notification`(OS级/X) / `message`(页内/antd) / `notify`(页内卡片/antd)


## 总览

| 维度 | 状态 |
|------|------|
| 组件 widget 数 | 18/19（缺 x-provider） |
| Prop 覆盖率 | 多数组件 30-60% functional props |
| Package | x-markdown ✓ / x-card ✓ / x-skill（无需） / **x-provider ✗** |

## 最大结构性缺口

### 1. 无 x-provider（全局主题/i18n/暗色）— 最严重
每个 widget 各自硬编码 `<ConfigProvider theme={{ algorithm: defaultAlgorithm }}>`，全包级别：
- 无暗色模式
- 无国际化（locale）
- 无 RTL
- 无全局 token 覆盖

### 2. 受控状态对 Shiny 不可见
`expanded`/`onExpand`/选择模型系统性缺失：ThoughtChain、Think、Sources、Folder。R 能渲染，拿不到展开/选中事件。

### 3. 嵌套数据被拍平
- Actions 丢 `subItems`（无子菜单）
- Suggestion 丢 `children`（无级联）
- Folder 丢 `fileContentService`（无懒加载）

## 逐组件覆盖率

### 核心 chat 组件

| 组件 | 覆盖 | 缺失 functional props |
|------|------|----------------------|
| Bubble | 5/20 | typing、variant、shape、editable、streaming、footer、header、extra、loadingRender、divider role、自定义 role、autoScroll(写死) |
| Sender | 5/15 | defaultValue、disabled、readOnly、autoSize、slotConfig、skill、header、footer、prefix、suffix、onPaste、onKeyDown |
| Conversations | 5/8 | per-item icon/disabled、divider item、menu（重命名/删除）、groupable 对象形式 |
| Prompts | 4/6 | children（子提示）、per-item disabled、**icon（声明但 map 时丢弃 = bug）** |
| Welcome | 3/5 | icon、extra |

### 展示/工具组件

| 组件 | 覆盖 | 缺失 functional props |
|------|------|----------------------|
| ThoughtChain | 2/5 | defaultExpandedKeys、expandedKeys、onExpand、item footer；content 强制 `<pre>` 包裹 |
| Think | 4/8 | icon、expanded、onExpand、blink（写死=loading） |
| Actions | 2/6 | dropdownProps、fadeIn、fadeInLeft、onClick；item: subItems、triggerSubMenuAction、actionRender；emoji 图标非真图标 |
| Attachments | 5/8 | disabled、getDropContainer、items（预置列表）、beforeUpload、onRemove |
| FileCard | 7/14 | description、mask、imageProps、spinProps、videoProps、audioProps；icon 自动派生不可设 |
| Folder | 3/18 | selectable、selectedFile、onSelectedFileChange、expandedPaths、onExpandedPathsChange、fileContentService、previewRender、onFolderClick 等 |
| Sources | 5/10 | expandIconPosition、popoverOverlayWidth、activeKey、expanded、onExpand、item icon |
| Suggestion | 3/6 | open、onOpenChange、items-as-function；item icon/extra/children |
| Notification | 7/10 | onClose、onShow、onError；**duration 单位 bug**、**绕过 XNotification** |

### Package 级

| Package | 覆盖 | 缺失 |
|---------|------|------|
| x-markdown | streaming 全、components(preset名)、多数 config | config(MarkedExtension)、真自定义组件、dark.css、plugins(Latex) |
| x-card / A2UI | 4 命令全、dataPath/{path}、actions、context | 远程 URL catalog 加载、v0.8 格式；33 组件均手写 |
| x-provider | **无** | XProvider 整体（主题/locale/RTL/token） |
| x-skill | 无（正确省略） | CLI 工具，非运行时组件 |
| code-highlighter | lang、code、header toggle | 自定义 prismConfig 替代（IIFE 限制），主题写死 |
| mermaid | diagram、zoom/download/copy | theme/config passthrough |

## 必须修的真 bug（与覆盖率无关）

1. **Notification duration 单位错** — 上游秒（`duration*1000`），widget 当毫秒。同名参数语义相反。
2. **Notification 绕过 XNotification** — 用原生 `new Notification()`，丢 tag 去重。
3. **Prompts icon 静默丢失** — TS interface 声明，`items.map()` 重建时未转发。

## 严重程度排名（缺口最大→最小）

1. **Folder**（3/18）— 几乎没包装
2. **Actions**（2/6）— 无子菜单、emoji 图标
3. **Bubble**（5/20）— 无 typing/variant per-item、role 写死
4. **Notification** — 功能单位 bug + 错误底层 API
5. **Suggestion / Sources / ThoughtChain / Think** — 缺受控状态 + 回调
6. **FileCard / Attachments** — 最接近完整，缺媒体 props 和 disabled/items

## 可接受的省略

- styling props（className/styles/prefixCls）全组件统一不暴露 — 合理一致
- x-skill — CLI 工具，不属于 htmlwidgets 范畴
