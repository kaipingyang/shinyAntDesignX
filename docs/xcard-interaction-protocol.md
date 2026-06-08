# xCard 交互协议

> 基于 Codex 审查建议（2026-06-06）与当前实现的协议规范。
> 本文档是 `srcjs/xCardDefaults.tsx` 头注释和 `CLAUDE.md` gotcha 条目的权威来源。

---

## 设计原则

### 1. dataModel 是用户输入的主事实来源

所有输入型组件的当前值优先写入 dataModel：

- mount 时将初始值写入 dataModel（`useEffect([], [])`）
- 用户交互时通过 `onDataChange(dataPath, value)` 更新
- 组件内部显示值通过 `useRef + forceUpdate` 保持 replay-safe

### 2. action 的主语义是"事件"，不是"表单值运输通道"

action 主要表达：发生了什么动作、哪个组件触发、需要哪些上下文路径引用。
不建议把 action 当成所有输入值的直接载体。

### 3. 动态值优先通过 `{ path }` 引用解析

若 action handler 需要当前输入值，推荐在 `action.event.context` 中传入路径引用：

```r
action = list(event = list(
  name = "booking:confirm",
  context = list(
    service_type = list(path = "/form/type")
  )
))
```

由上游 `resolveActionContextPathRefs` 在触发时解析真实值。

### 4. 组件特例必须极少且显式记录

若某组件确有必要直接把当前值塞进 action context，必须有明确业务理由、在协议文档中声明、不自动推广到其他组件。

---

## 组件分类

### Class A — Action-only（触发类组件）

**组件**：`Button`、`ModalButton`

**协议**：
- 调用 `onAction(name, {})`
- 不直接传 `action.event.context`（含原始 `{ path }` 对象，会覆盖框架已解析的值）
- 由 x-card 框架统一解析路径引用上下文

### Class B — DataModel-only（输入类组件）

**组件**：`Input`、`Textarea`、`InputNumber`、`Slider`、`CheckboxGroup`、`CheckBox`、`SwitchInput`、`Rate`、`DateTimeInput`、`ChoicePicker`、`RadioGroup`、`Segmented`、`Tabs`、`Select`（默认归入此类）

**协议**：
- 只调用 `onDataChange(dataPath, value)`
- 不主动把 value 塞进 action context
- 若 action 需要当前值，用 `context = list(path = "/some/path")` 由框架解析

### Class C — Hybrid（受控特例）

**当前唯一特例**：`Select`（当同时配置了 `action.event` 和 `dataPath` 时）

**协议**：
```ts
onDataChange(dataPath, v)
onAction(name, { ...context, value: v })
```

**为什么不能用 `{ path }` 引用替代直传（已验证，结论确定）**：

经 `examples/test_select_action_timing.R` 两轮实验 + `examples/test_selectize_timing.R` 五模式实验（2026-06-08）：

| 策略 | path_resolved | 是否可靠 |
|------|---------------|----------|
| data_only — `onAction(name, {})` | 解析到初始值（旧值） | ❌ |
| micro_delayed — `Promise.resolve()` 后 `onAction` | 仍是初始值（旧值） | ❌ |
| macro_delayed — `setTimeout(0)` 后 `onAction` | 仍是初始值（旧值） | ❌ |
| submit_action — 先 `onDataChange`，**独立按钮**再 `onAction({})` | 解析到正确的最新值 | ✓ |
| hybrid — `onAction(name, { value: v })` | 直传正确值 | ✓ |

**根因**：`onDataChange` 写入 dataModel 是**异步**的，在同一 JS 事件回调中（包括微任务 + macro task 延迟）触发的 `onAction` 仍读到上一次的值，`resolveActionContextPathRefs` 无法见到刚写的新值。

**submit_action 为何成功**：按钮点击是独立的 DOM 事件——发生在选择操作若干毫秒乃至若干秒后，此时 dataModel 已经在前一个事件循环轮次中稳定落盘，path 解析完全可靠。

**实际含义**：
- "选中即 action"（change event 直接触发 action）→ **必须 hybrid**，无论延迟多少
- "选中写 dataModel，独立按钮/提交触发 action"（submit_action 模式）→ **可以用纯 Class B + path refs**，不需要 hybrid
- `Select` 当前 hybrid 保留，因为业务场景是"选中即触发"
- 若未来有"选 + 确认提交"的 UX 需求，可以新增 Class B 的 Select 变体，不走 hybrid

**使用条件**（同时满足）：
1. 组件配置了 `action.event`
2. 业务要求 handler 同步拿到当前选中值
3. 不希望依赖 path ref 解析（因时序问题，path ref 解析不可靠）

**重要限制**：
- 这是 pragmatic exception，不是其他输入组件的模板
- **不应扩散到** `Tabs`、`Segmented`、`RadioGroup`、`ChoicePicker(single)` 等组件
- 新组件默认走 Class B
- 若未来上游修复 dataModel 同步更新时序，可重新验证是否能统一回 Class B

---

## Replay-safe 状态模式

### 背景

Card.tsx 在每次命令队列增长时重放所有历史 `updateComponents`，带原始 prop 值。受控组件（`value={prop}`）会被重置。

### 统一模式（所有 Class B/C 组件）

```ts
const valRef = React.useRef<T | undefined>(undefined);
const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

// 初始 prop 只读一次
if (valRef.current === undefined) valRef.current = prop ?? defaultValue;

// mount 时写初值回 dataModel
React.useEffect(() => {
  if (dataPath && onDataChange) onDataChange(dataPath, valRef.current);
}, []);

// 渲染从 ref 读，交互时更新 ref
<Component
  value={valRef.current}
  onChange={(v) => {
    valRef.current = v;
    forceUpdate();
    if (dataPath && onDataChange) onDataChange(dataPath, v);
  }}
/>
```

### 覆盖范围

已实现 replay-safe 的组件（`srcjs/xCardDefaults.tsx`）：
RadioGroup、Segmented、Select、ChoicePicker、CheckBox、SwitchInput、Rate、Tabs、DateTimeInput、Input、Textarea、InputNumber、Slider、CheckboxGroup

验证脚本：`examples/test_xcard_replay.R`

### 禁止事项

**不要对用户输入路径使用 `updateDataModel`**——`updateDataModel` 命令会在 replay 中重复生效，容易把用户当前值重置回初始值。输入值变化只走 `onDataChange`。

---

## Replay 回归测试规范

测试应同时满足：
1. 所有输入组件同时挂载（不是逐个替换）
2. 追加与输入路径无关的命令触发 replay
3. 观察用户修改值是否保留

`examples/test_xcard_replay.R` 实现了上述方案，重置时使用新 `surfaceId` 强制 React remount（`processedCommandsCount` 归零）。

---

## 决策摘要

| 规则 | 详情 |
|------|------|
| 默认 | 输入值 → dataModel；事件语义 → action；动态上下文 → `{ path }` 引用 |
| 当前特例 | `Select` 保留 hybrid 行为（选中即 action），明确标为例外 |
| 不推广 | `Select` 的 hybrid 模式不扩散到其他选择类组件 |
| submit_action 模式 | 若 UX 是"先选后提交"，可用纯 Class B + 独立 Button，path refs 可靠 |
| 长期目标 | 向上游 x-card 统一解析机制收敛，减少特例 |
