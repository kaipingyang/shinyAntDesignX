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
// Filter { path } refs from context before injecting — they resolve to stale/unresolved
// values in immediate-action timing. Static literal fields are kept.
const rawCtx = action.event.context ?? {};
const safeCtx = Object.fromEntries(
  Object.entries(rawCtx).filter(([, val]) =>
    !(val && typeof val === "object" && "path" in val)
  )
);
onAction(name, { ...safeCtx, value: v })
```

**精确结论（最终措辞）**：

> 对选择型组件而言，dataModel + path refs 在独立提交事件中是可靠的；但在 change 事件内即时触发 action 时，当前上游实现的 dataModel 更新时序不保证最新值可见，因此 Select 必须保留 hybrid 方案。另需避免将原始 `action.event.context` 直接 spread 到组件级 context，否则可能破坏 path 解析。

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

**保留意见（维护时须知）**：

1. **submit_action 成功的前提是双重的**：不只是"独立 button click"，还必须在 `handleSubmit` 里不 spread 原始 `action.event.context`。如果有人抄 submit_action 模式却把 context spread 回去，`{ path }` 对象进入 componentContext，优先级高于框架解析，path 依然会 unresolved。正确实现：`onAction(name, { direct_value: v })` — 让框架从配置好的 `action.event.context` 中自行解析 path refs。

2. **实验结论适用范围仅限已测组件**：当前 timing 实验只对 Select / SelectizeProbe 做了系统验证。`Tabs`、`Segmented`、`RadioGroup`、`ChoicePicker(single)` 尚未做同规格 timing + submit-action 测试。在未经测试前，不能自动推出它们的 change-event 行为与 Select 完全相同，更不能在它们上套用 hybrid 或 submit_action 方案而不验证。

---

## 初始值语义分类

输入组件按"未设置初始值时写入 dataModel 的内容"分三类。差异是**有意设计**，不是遗漏——不要"统一化"。

### 类型 1 — UI 驱动型（总有值，null 不存在）

UI 本身没有"空"状态，所以 model 也不需要空语义。

| 组件 | 无初值时的默认值 | 写入 dataModel |
|------|----------------|----------------|
| `Slider` | `0` | 始终写，含默认 0 |
| `Tabs` | 第一个 tab 的 key | 始终写，含自动选中的 key |

**原因**：Slider 轨道必须停在某点；Tabs 必须显示一个活动面板。"未触碰 Slider" 和 "Slider 值为 0" 在 model 里不可区分——这是有意的设计折中。需要区分空值时，用 `InputNumber` 代替 `Slider`。

### 类型 2 — 显式空型（空值用 null 表达）

组件支持"清空"操作，清空后 model 写 `null`，而非省略路径。

| 组件 | 无初值时 | 清空时 | 写入 dataModel |
|------|---------|--------|----------------|
| `InputNumber` | `null` | `null` | 始终写，含 null |
| `DateTimeInput` | `null` | `null` | 始终写，含 null |
| `Rate` | `null` | — | 始终写，含 null；UI 渲染用 `?? 0`（显示层折中，model 保持 null） |

**注意**：`Rate` 的 `null` 在 UI 上显示为 0 星（antd 无"未评分"外观），但 R handler 收到的是 `NULL`，不是 `0`——这是显示层和模型层的有意分离。

### 类型 3 — 缺席型（未选中 = 路径不存在）

组件有合法的"从未选择"状态。若无初值，mount 不写 dataModel，该路径在 dataModel 中缺席。

| 组件 | 无初值时 | mount 写入 |
|------|---------|-----------|
| `RadioGroup` | — | 不写 |
| `Segmented` | — | 不写 |
| `ChoicePicker(single)` | — | 不写 |

**R handler 含义**：`ctx$some_path` 为 `NULL` 可能是"用户未选"，也可能是"组件有初值但 R 取错路径"——R 侧应区分这两种情况。若业务不允许"未选"状态，应在 R 中配置初始值，让 mount 写入该值。

**不要"统一化"**：这三类组件语义不同，不要为了代码对称性把类型 3 改成写 `null`——那会破坏 R handler 对"未选"状态的判断能力。

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

## 协议红线（维护守则）

以下规则永久有效，任何新组件或 PR 都不得违反：

### 红线 1：不 spread 原始 action.event.context

```ts
// 错误 — 把 { path } 对象塞回 componentContext，高优先级覆盖框架解析
onAction(name, { ...action.event.context, value: v });

// 正确 — Class A 传 {}，让框架解析配置好的 context
onAction(name, {});

// 正确 — Class C hybrid 直传 value，不 spread context
onAction(name, { value: v });
```

### 红线 2：Select hybrid 不当模板

`Select` 的 `onAction(name, { value: v })` 是时序逼出来的例外，不是模式。其他组件需要 action 时，默认走 Class B（dataModel only）+ 独立 Button。

### 红线 3：所有用户输入组件默认 Class B

新组件默认：
- 只 `onDataChange(dataPath, value)`
- 不主动传 action context value
- 依赖 path refs 解析当前值

### 红线 4：给输入组件加 action 前必须做 timing test

如果有人想让以下组件在选中时立即触发 action，必须先跑 timing test（参考 `examples/test_selectize_timing.R`），确认 path refs 能否可靠读到最新值，再设计协议：

**高危组件**（选中语义强，未来若要支持"选中即 action"最容易被仿照 `Select`）：
- `Tabs`
- `Segmented`
- `RadioGroup`
- `ChoicePicker` (single)

**当前判断**：这些组件**很可能**面临与 `Select` 同类的 change-event 时序风险，但**尚未做同规格 timing + submit-action 实验**。因此，在未经验证前，**不得**默认套用 `Select` 的 hybrid 或 `submit_action` 方案。

**要求**：若未来要让上述组件支持"选中即 action"，必须先按 `examples/test_selectize_timing.R` 的方法做专门验证，至少覆盖：
1. `data_only`
2. `micro_delayed_action`
3. `macro_delayed_action`
4. `submit_action`

只有在实验结果明确后，才能决定该组件应：
- 保持纯 Class B（`dataModel-only`）
- 升级为 hybrid
- 或采用"选中 + 独立提交"的 `submit_action` UX

---

## 决策摘要

| 规则 | 详情 |
|------|------|
| 默认 | 输入值 → dataModel；事件语义 → action；动态上下文 → `{ path }` 引用 |
| 当前特例 | `Select` 保留 hybrid 行为（选中即 action），明确标为例外 |
| 不推广 | `Select` 的 hybrid 模式不扩散到其他选择类组件 |
| submit_action 模式 | 若 UX 是"先选后提交"，可用纯 Class B + 独立 Button，path refs 可靠 |
| timing test 门槛 | 任何"选中即 action"新需求，必须先过 timing test，再谈协议 |
| 长期目标 | 向上游 x-card 统一解析机制收敛，减少特例 |
