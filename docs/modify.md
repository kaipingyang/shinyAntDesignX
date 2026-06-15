# 改动记录

## 2026-06-09 — xCard 边界值 hardening + 协议文档三分法 (`d4fb4dd`)

### 代码修改

| 组件 | 修改内容 |
|------|---------|
| `InputNumber` | 非法字符串（如 `"abc"`）`→ NaN → null`，不再泄脏值到 dataModel |
| `Slider` | 同上，但 null/无效值 `→ 0`（UI-driven 语义，无 unset 状态）|
| `Rate` | `null` = 未填写，`0` = 明确零分；非法值 `→ null`；显示层用 `?? 0` |
| `DateTimeInput` | 清空时写 `null`（之前写 `""`），与 mount 行为一致 |
| `SwitchInput` | `!!checked → checked === true \|\| checked === 1`（与 CheckBox 对齐）|
| `RadioGroup` | 删除死代码 `mountCountRef`；加注释说明 absent-path 语义 |
| `Segmented` | 加注释说明 absent-path 语义（与 RadioGroup 一致）|

### 文档修改

- `docs/xcard-interaction-protocol.md` — 新增"初始值语义分类"章节，三类：UI-driven / 显式空 / 缺席型
- `CLAUDE.md` — boundary value gotcha 从半截信息扩展到完整三分法
- `R/xCard.R` — `send_data_model` 参数加 timing caveat（payload 有值 ≠ path refs 一定是最新值）
- `srcjs/xCardDefaults.tsx` 头注释 — Class C 从 `{...context, value: v}` 改为准确描述 safeCtx 过滤逻辑

---

## 2026-06-10 — x-sdk 架构约束注释 + 死代码清理

### 背景

经 Codex 深审 x-sdk 桥接层，识别出两处架构风险和一处误导性死代码。**未改运行时行为**，仅补注释和删死代码。

### 修改

**`srcjs/ShinyBridgeRequest.ts` — `run()` 加架构约束注释**

- bridge 单槽位 callbacks 是中风险约束，非完全安全
- 正确性依赖 useXChat 排队保证单活；若 R 侧崩溃不回应，`_isRequesting` 锁死，需 `abort()` 恢复
- threadId 过滤是第二道防线，不是主锁

**`srcjs/AntDesignX.tsx` — `handleConversationChange` 加知识缺口注释**

- 切线程不 abort 当前流
- 丢弃的 chunk 不缓存，用户切回后该段增量永久缺失
- 资源层：设计选择；消息连续性层：已知产品缺口
- 注明：如需改行为，在此处加 `abort()`

**`srcjs/AntDesignX.tsx` — 删除死代码 `setCardCommandVersion((v) => v)`**

- `v => v` 返回相同值，React bail out，不触发重渲染
- 注释"Trigger the flush effect"是误导性错误
- flush 靠 `useEffect([messages])`，与此行无关
- 删除该行，注释改正

---

## 2026-06-08 — Select hybrid safeCtx 重构 + probe 安全标注 (`92f0197`, `f8ccd7a`)

- 生产 `Select` 从裸 spread `action.event.context` 改为过滤 `{ path }` refs 后合并
- `SelectizeProbe` probe hybrid 模式加"INTENTIONALLY unsafe — do not copy"警告
- `docs/xcard-interaction-protocol.md` 加精确结论 + 四条协议红线
- `CLAUDE.md` 同步 Class C protocol 描述

---

## 2026-06-06 ~ 2026-06-08 — xCard 交互协议研究线

详见 `docs/xcard-interaction-protocol.md` 完整记录，关键结论：

- `data_only` / `micro_delayed` / `macro_delayed` 均失败：change-event 内 path refs 读旧值
- `submit_action`（独立按钮点击）成功：dataModel 在前一事件循环已落盘
- `hybrid`（`onAction(name, { value: v })`）是唯一同时可靠的"选中即 action"方案
- 协议三类：Class A（Button）/ Class B（输入类）/ Class C（Select hybrid 特例）
