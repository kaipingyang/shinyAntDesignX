// Shared default XCard catalog schema + component implementations
// Used by both the standalone xCard widget and the antDesignX chat widget.
//
// ── Component interaction protocol ──────────────────────────────────────────
// Full spec: docs/xcard-interaction-protocol.md
//
// Class A — action-only (Button, ModalButton)
//   onAction(name, {}) — never pass raw action.event.context
//
// Class B — dataModel-only (Input, Textarea, Slider, RadioGroup, etc.)
//   onDataChange(dataPath, value) only; action handlers read via path refs
//
// Class C — hybrid, pragmatic exception (Select only)
//   onDataChange(dataPath, v) + onAction(name, {...context, value: v})
//   Do NOT extend this pattern to other selection components.
//
// All Class B/C components use useRef + forceUpdate (replay-safe).
// Do NOT use updateDataModel for user-input paths — it replays and resets.
//
import React from "react";
import dayjs from "dayjs";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Collapse,
  DatePicker,
  Descriptions,
  Divider,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Rate,
  Segmented,
  Select,
  Slider,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
} from "antd";
import type { Catalog } from "@ant-design/x-card";

export const SHINY_DEFAULT_CATALOG: Catalog = {
  catalogId: "shiny-default",
  components: {
    // ── 基础 ──────────────────────────────────────────────────────────────────
    Text: {
      props: {
        text:    { type: "string" },
        variant: { type: "string", enum: ["h1", "h2", "h3", "body", "success", "warning", "danger", "secondary"] },
        status:  { type: "string", enum: ["success", "warning", "danger", "secondary"] },
      },
    },
    Button: {
      props: {
        label:    { type: "string" },
        variant:  { type: "string", enum: ["primary", "default", "dashed", "text", "link"] },
        disabled: { type: "boolean" },
        action:   { type: "object" },
      },
    },
    Input: {
      props: {
        label:        { type: "string" },
        placeholder:  { type: "string" },
        defaultValue: { type: "string" },
        value:        { type: "string" },
        dataPath:     { type: "string" },
      },
    },
    Select: {
      props: {
        label:        { type: "string" },
        options:      { type: "array" },
        defaultValue: { type: "string" },
        value:        { type: "string" },
        dataPath:     { type: "string" },
        action:       { type: "object" },
      },
    },
    Tag: {
      props: {
        text:  { type: "string" },
        color: { type: "string" },
      },
    },
    Container: {
      props: {
        gap:     { type: "number" },
        padding: { type: "string" },
      },
    },

    // ── 数据展示类 ────────────────────────────────────────────────────────────
    Statistic: {
      props: {
        title:     { type: "string" },
        value:     { type: "number" },
        prefix:    { type: "string" },
        suffix:    { type: "string" },
        precision: { type: "number" },
      },
    },
    Progress: {
      props: {
        percent:     { type: "number" },
        type:        { type: "string", enum: ["line", "circle", "dashboard"] },
        status:      { type: "string", enum: ["success", "exception", "normal", "active"] },
        strokeColor: { type: "string" },
      },
    },
    Alert: {
      props: {
        message:     { type: "string" },
        description: { type: "string" },
        type:        { type: "string", enum: ["success", "info", "warning", "error"] },
        showIcon:    { type: "boolean" },
        closable:    { type: "boolean" },
      },
    },
    Badge: {
      props: {
        count:  { type: "number" },
        text:   { type: "string" },
        status: { type: "string", enum: ["success", "processing", "default", "error", "warning"] },
        color:  { type: "string" },
      },
    },
    Descriptions: {
      props: {
        title:    { type: "string" },
        items:    { type: "array" },
        column:   { type: "number" },
        bordered: { type: "boolean" },
      },
    },
    Table: {
      props: {
        dataSource: { type: "array" },
        columns:    { type: "array" },
        size:       { type: "string", enum: ["small", "middle", "large"] },
        pagination: { type: "boolean" },
      },
    },
    Timeline: {
      props: {
        items: { type: "array" },
        mode:  { type: "string", enum: ["left", "alternate", "right"] },
      },
    },
    Divider: {
      props: {
        text:        { type: "string" },
        orientation: { type: "string", enum: ["left", "center", "right"] },
        dashed:      { type: "boolean" },
      },
    },

    // ── 输入类（双向绑定：dataPath + onDataChange）────────────────────────────
    Textarea: {
      props: {
        label:       { type: "string" },
        placeholder: { type: "string" },
        value:       { type: "string" },
        dataPath:    { type: "string" },
        rows:        { type: "number" },
      },
    },
    InputNumber: {
      props: {
        label:      { type: "string" },
        value:      { type: "number" },
        dataPath:   { type: "string" },
        min:        { type: "number" },
        max:        { type: "number" },
        step:       { type: "number" },
        addonAfter: { type: "string" },
      },
    },
    Slider: {
      props: {
        value:    { type: "number" },
        dataPath: { type: "string" },
        min:      { type: "number" },
        max:      { type: "number" },
        step:     { type: "number" },
        marks:    { type: "object" },
      },
    },
    CheckboxGroup: {
      props: {
        label:    { type: "string" },
        options:  { type: "array" },
        value:    { type: "array" },
        dataPath: { type: "string" },
      },
    },
    RadioGroup: {
      props: {
        label:    { type: "string" },
        options:  { type: "array" },
        value:    { type: "string" },
        dataPath: { type: "string" },
      },
    },
    SwitchInput: {
      props: {
        label:         { type: "string" },
        checked:       { type: "boolean" },
        dataPath:      { type: "string" },
        checkedText:   { type: "string" },
        uncheckedText: { type: "string" },
      },
    },
    Rate: {
      props: {
        value:     { type: "number" },
        dataPath:  { type: "string" },
        count:     { type: "number" },
        allowHalf: { type: "boolean" },
      },
    },

    // ── 布局/导航类 ───────────────────────────────────────────────────────────
    Steps: {
      props: {
        current:   { type: "number" },
        items:     { type: "array" },
        size:      { type: "string", enum: ["default", "small"] },
        status:    { type: "string", enum: ["wait", "process", "finish", "error"] },
        direction: { type: "string", enum: ["horizontal", "vertical"] },
      },
    },
    Tabs: {
      props: {
        activeKey: { type: "string" },
        items:     { type: "array" },
        dataPath:  { type: "string" },
        type:      { type: "string", enum: ["line", "card", "editable-card"] },
      },
    },
    Collapse: {
      props: {
        items:            { type: "array" },
        defaultActiveKey: { type: "array" },
        accordion:        { type: "boolean" },
      },
    },
    Segmented: {
      props: {
        options:  { type: "array" },
        value:    { type: "string" },
        dataPath: { type: "string" },
        block:    { type: "boolean" },
      },
    },

    // ── 媒体 ─────────────────────────────────────────────────────────────────
    Image: {
      props: {
        src:        { type: "string" },
        alt:        { type: "string" },
        width:      { type: "string" },
        height:     { type: "string" },
        objectFit:  { type: "string", enum: ["contain", "cover", "fill", "none", "scale-down"] },
        preview:    { type: "boolean" },
      },
    },

    // ── 布局补充 ──────────────────────────────────────────────────────────────
    Row: {
      props: {
        gap:     { type: "number" },
        padding: { type: "string" },
        wrap:    { type: "boolean" },
        align:   { type: "string", enum: ["flex-start", "center", "flex-end", "stretch"] },
        justify: { type: "string", enum: ["flex-start", "center", "flex-end", "space-between", "space-around"] },
      },
    },
    List: {
      props: {
        items:     { type: "array" },
        size:      { type: "string", enum: ["small", "default", "large"] },
        bordered:  { type: "boolean" },
        renderKey: { type: "string" },
      },
    },

    // ── 表单补充 ──────────────────────────────────────────────────────────────
    DateTimeInput: {
      props: {
        label:    { type: "string" },
        value:    { type: "string" },
        dataPath: { type: "string" },
        format:   { type: "string" },
        showTime: { type: "boolean" },
        placeholder: { type: "string" },
      },
    },
    ChoicePicker: {
      props: {
        label:    { type: "string" },
        options:  { type: "array" },
        value:    {},
        dataPath: { type: "string" },
        variant:  { type: "string", enum: ["single", "multiple"] },
      },
    },
    CheckBox: {
      props: {
        label:    { type: "string" },
        checked:  { type: "boolean" },
        dataPath: { type: "string" },
      },
    },

    // ── 弹窗 ─────────────────────────────────────────────────────────────────
    ModalButton: {
      props: {
        label:       { type: "string" },
        title:       { type: "string" },
        content:     { type: "string" },
        okText:      { type: "string" },
        cancelText:  { type: "string" },
        variant:     { type: "string", enum: ["primary", "default", "dashed", "text", "link"] },
      },
    },
  },
};

export const SHINY_DEFAULT_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // ── 基础 ────────────────────────────────────────────────────────────────────
  Text: ({ text, variant, status, children }: { text?: string; variant?: string; status?: string; children?: React.ReactNode }) => {
    const content = text ?? children;
    const effectiveStatus = status ?? variant;
    const styleMap: Record<string, React.CSSProperties> = {
      h1:        { fontSize: 20, fontWeight: 700, margin: "0 0 12px" },
      h2:        { fontSize: 17, fontWeight: 600, margin: "0 0 8px" },
      h3:        { fontSize: 15, fontWeight: 600, margin: "0 0 6px" },
      body:      { fontSize: 14, margin: 0 },
      success:   { fontSize: 14, margin: 0, color: "#52c41a" },
      warning:   { fontSize: 14, margin: 0, color: "#faad14" },
      danger:    { fontSize: 14, margin: 0, color: "#ff4d4f" },
      secondary: { fontSize: 14, margin: 0, color: "#8c8c8c" },
    };
    return <p style={styleMap[effectiveStatus ?? "body"] ?? styleMap.body}>{content}</p>;
  },

  Button: ({ label, variant = "default", disabled, action, onAction }: any) => (
    <Button
      type={variant === "primary" ? "primary" : variant as any}
      disabled={disabled}
      onClick={() => {
        // Pass empty context — let Card.resolveActionContextPathRefs read paths
        // from dataModel via actionConfig. Passing action.event.context directly
        // would override the resolved values with raw {path} objects.
        if (action?.event && onAction) onAction(action.event.name, {});
      }}
      style={{ margin: "4px 2px" }}
    >
      {label}
    </Button>
  ),

  // Input now supports dataPath + two-way binding via onDataChange
  // Uses useRef to prevent xCard command replay from resetting user input.
  Input: ({ label, placeholder, defaultValue, value, dataPath, onDataChange }: any) => {
    const valRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (valRef.current === undefined) valRef.current = value ?? defaultValue ?? "";
    React.useEffect(() => {
      if (dataPath && onDataChange && valRef.current !== undefined) onDataChange(dataPath, valRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Input
          placeholder={placeholder}
          value={valRef.current}
          onChange={(e) => {
            valRef.current = e.target.value;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, e.target.value);
          }}
        />
      </div>
    );
  },

  // Select supports both action mode (fires onAction) and dataPath mode (two-way binding).
  // Uses useRef + forceUpdate pattern (same as RadioGroup) to prevent commandQueue
  // replay from resetting the selection after user interaction.
  Select: ({ label, options = [], defaultValue, value, dataPath, action, onAction, onDataChange }: any) => {
    const selectedRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    if (selectedRef.current === undefined) {
      selectedRef.current = value ?? defaultValue;
    }

    React.useEffect(() => {
      if (dataPath && onDataChange && selectedRef.current !== undefined) {
        onDataChange(dataPath, selectedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Select
          value={selectedRef.current}
          options={(options as string[]).map((o) => ({ value: o, label: o }))}
          style={{ width: "100%" }}
          onChange={(v) => {
            selectedRef.current = v;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, v);
            if (action?.event && onAction) onAction(action.event.name, { ...action.event.context, value: v });
          }}
        />
      </div>
    );
  },

  Tag: ({ text, color }: any) => <Tag color={color}>{text}</Tag>,

  // ── SelectActionProbe ────────────────────────────────────────────────────────
  // Experimental component for verifying action/dataModel timing strategies.
  // NOT a production component — used to answer whether path refs can replace
  // direct value injection in Select hybrid mode.
  //
  // mode = "data_only"     → onDataChange only; action fires onAction(name, {})
  // mode = "hybrid"        → onDataChange + onAction(name, { value }) (current Select)
  // mode = "delayed_action"→ onDataChange first, then onAction in next microtask
  //
  // See examples/test_select_action_timing.R for results.
  SelectActionProbe: ({
    label, options = [], value, dataPath, action, onAction, onDataChange,
    mode = "hybrid",
  }: any) => {
    const selectedRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    if (selectedRef.current === undefined) selectedRef.current = value;

    React.useEffect(() => {
      if (dataPath && onDataChange && selectedRef.current !== undefined) {
        onDataChange(dataPath, selectedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (v: string) => {
      selectedRef.current = v;
      forceUpdate();
      if (dataPath && onDataChange) onDataChange(dataPath, v);

      if (action?.event && onAction) {
        // All modes pass direct_value so R can compare path_resolved == direct_value.
        // The mode distinction is in HOW path refs are resolved, not whether value is available.
        if (mode === "data_only") {
          onAction(action.event.name, { direct_value: v });
        } else if (mode === "hybrid") {
          onAction(action.event.name, { ...action.event.context, value: v, direct_value: v });
        } else if (mode === "delayed_action") {
          // Fire action in next microtask — gives dataModel time to update
          Promise.resolve().then(() => onAction(action.event.name, { direct_value: v }));
        }
      }
    };

    return (
      <div style={{ marginBottom: 8 }}>
        {label && (
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            {label}
            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>[mode: {mode}]</span>
          </div>
        )}
        <Select
          value={selectedRef.current}
          options={(options as string[]).map((o: string) => ({ value: o, label: o }))}
          style={{ width: "100%" }}
          onChange={handleChange}
        />
      </div>
    );
  },

  // ── SelectizeProbe ───────────────────────────────────────────────────────────
  // Experimental probe for 5-mode timing study. NOT production. See:
  //   examples/test_selectize_timing.R
  //
  // mode = "data_only"          → onDataChange; onAction({}) synchronously
  // mode = "hybrid"             → onDataChange; onAction({ value, direct_value })
  // mode = "micro_delayed_action" → onDataChange; Promise.resolve() → onAction({ direct_value })
  // mode = "macro_delayed_action" → onDataChange; setTimeout(0) → onAction({ direct_value })
  // mode = "submit_action"      → onDataChange on select; onAction({}) only on button click
  SelectizeProbe: ({
    label, options = [], value, dataPath, action, onAction, onDataChange,
    mode = "data_only",
  }: any) => {
    const selectedRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    if (selectedRef.current === undefined) selectedRef.current = value;

    React.useEffect(() => {
      if (dataPath && onDataChange && selectedRef.current !== undefined) {
        onDataChange(dataPath, selectedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (v: string) => {
      selectedRef.current = v;
      forceUpdate();
      if (dataPath && onDataChange) onDataChange(dataPath, v);
      if (!action?.event || !onAction) return;

      if (mode === "data_only") {
        onAction(action.event.name, { direct_value: v });
      } else if (mode === "hybrid") {
        onAction(action.event.name, { ...action.event.context, value: v, direct_value: v });
      } else if (mode === "micro_delayed_action") {
        Promise.resolve().then(() => onAction(action.event.name, { direct_value: v }));
      } else if (mode === "macro_delayed_action") {
        setTimeout(() => onAction(action.event.name, { direct_value: v }), 0);
      }
      // submit_action: no action here — only on button click
    };

    const handleSubmit = () => {
      if (!action?.event || !onAction) return;
      const v = selectedRef.current ?? value;
      onAction(action.event.name, { ...action.event.context, direct_value: v });
    };

    return (
      <div style={{ marginBottom: 8 }}>
        {label && (
          <div style={{ fontSize: 13, marginBottom: 4 }}>
            {label}
            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>[{mode}]</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <Select
            value={selectedRef.current}
            options={(options as string[]).map((o: string) => ({ value: o, label: o }))}
            style={{ flex: 1 }}
            onChange={handleChange}
          />
          {mode === "submit_action" && (
            <button
              style={{ fontSize: 12, padding: "2px 8px", cursor: "pointer" }}
              onClick={handleSubmit}
            >提交</button>
          )}
        </div>
      </div>
    );
  },

  Container: ({ children, gap = 8, padding = "0" }: { children?: React.ReactNode; gap?: number; padding?: string }) => (
    <div style={{ display: "flex", flexDirection: "column", gap, padding }}>{children}</div>
  ),

  // ── 数据展示类 ──────────────────────────────────────────────────────────────
  Statistic: ({ title, value, prefix, suffix, precision }: any) => (
    <Statistic title={title} value={value} prefix={prefix} suffix={suffix} precision={precision} />
  ),

  Progress: ({ percent = 0, type = "line", status, strokeColor }: any) => (
    <Progress percent={percent} type={type} status={status} strokeColor={strokeColor} />
  ),

  Alert: ({ message, description, type = "info", showIcon = true, closable = false }: any) => (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon={showIcon}
      closable={closable}
      style={{ marginBottom: 8 }}
    />
  ),

  Badge: ({ count, text, status, color, children }: any) => (
    <Badge count={count} text={text} status={status} color={color}>{children}</Badge>
  ),

  Descriptions: ({ title, items = [], column = 2, bordered = false }: any) => (
    <Descriptions
      title={title}
      column={column}
      bordered={bordered}
      items={(items as any[]).map((item: any) => ({
        key:      item.label ?? item.key,
        label:    item.label,
        children: item.value ?? item.children,
        span:     item.span,
      }))}
    />
  ),

  Table: ({ dataSource = [], columns = [], size = "small", pagination = false }: any) => {
    const antColumns = (columns as any[]).map((col: any) => ({
      title:     col.title ?? col.label,
      dataIndex: col.dataIndex ?? col.key,
      key:       col.key ?? col.dataIndex,
      width:     col.width,
    }));
    const antData = (dataSource as any[]).map((row: any, idx: number) => ({ ...row, key: row.key ?? idx }));
    return (
      <Table
        dataSource={antData}
        columns={antColumns}
        size={size}
        pagination={pagination ? undefined : false}
        style={{ marginBottom: 8 }}
      />
    );
  },

  Timeline: ({ items = [], mode = "left" }: any) => (
    <Timeline
      mode={mode}
      items={(items as any[]).map((item: any) => ({
        label:    item.label,
        children: item.content ?? item.children,
        color:    item.color,
        dot:      item.dot,
      }))}
    />
  ),

  Divider: ({ text, orientation = "center", dashed = false }: any) => (
    <Divider orientation={orientation} dashed={dashed}>{text}</Divider>
  ),

  // ── 输入类（双向绑定）──────────────────────────────────────────────────────
  Textarea: ({ label, placeholder, value, dataPath, rows = 4, onDataChange }: any) => {
    const valRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (valRef.current === undefined) valRef.current = value ?? "";
    React.useEffect(() => {
      if (dataPath && onDataChange && valRef.current !== undefined) onDataChange(dataPath, valRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Input.TextArea
          placeholder={placeholder}
          value={valRef.current}
          rows={rows}
          onChange={(e) => {
            valRef.current = e.target.value;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, e.target.value);
          }}
        />
      </div>
    );
  },

  InputNumber: ({ label, value, dataPath, min, max, step = 1, addonAfter, onDataChange }: any) => {
    const numRef = React.useRef<number | null | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (numRef.current === undefined) numRef.current = value != null ? Number(value) : null;
    React.useEffect(() => {
      if (dataPath && onDataChange && numRef.current != null) onDataChange(dataPath, numRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <InputNumber
          value={numRef.current}
          min={min}
          max={max}
          step={step}
          addonAfter={addonAfter}
          style={{ width: "100%" }}
          onChange={(v) => {
            numRef.current = v;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, v);
          }}
        />
      </div>
    );
  },

  Slider: ({ value, dataPath, min = 0, max = 100, step = 1, marks, onDataChange }: any) => {
    const numRef = React.useRef<number | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (numRef.current === undefined) numRef.current = value != null ? Number(value) : 0;
    React.useEffect(() => {
      if (dataPath && onDataChange) onDataChange(dataPath, numRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <Slider
        value={numRef.current}
        min={min}
        max={max}
        step={step}
        marks={marks}
        onChange={(v) => {
          numRef.current = v;
          forceUpdate();
          if (dataPath && onDataChange) onDataChange(dataPath, v);
        }}
        style={{ marginBottom: 8 }}
      />
    );
  },

  CheckboxGroup: ({ label, options = [], value = [], dataPath, onDataChange }: any) => {
    const valsRef = React.useRef<string[] | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (valsRef.current === undefined) valsRef.current = Array.isArray(value) ? value : [];
    React.useEffect(() => {
      if (dataPath && onDataChange) onDataChange(dataPath, valsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Checkbox.Group
          options={(options as string[]).map((o) => ({ label: o, value: o }))}
          value={valsRef.current}
          onChange={(vals) => {
            valsRef.current = vals as string[];
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, vals);
          }}
        />
      </div>
    );
  },

  // RadioGroup: uses a stable ref to store the selected value, completely
  // independent of the value prop after first render. This prevents Card's
  // commandQueue replay (which re-resolves value from dataModel) from
  // visually resetting the selection.
  // value prop: only used for initial display and written to dataModel on mount.
  RadioGroup: ({ label, options = [], value, dataPath, onDataChange }: any) => {
    const selectedRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const mountCountRef = React.useRef(0);

    mountCountRef.current += 1;
    if (selectedRef.current === undefined && value !== undefined) {
      selectedRef.current = value;
    }

    React.useEffect(() => {
      if (dataPath && onDataChange && selectedRef.current !== undefined) {
        onDataChange(dataPath, selectedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Radio.Group
          value={selectedRef.current}
          onChange={(e) => {
            selectedRef.current = e.target.value;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, e.target.value);
          }}
        >
          {(options as string[]).map((o) => <Radio key={o} value={o}>{o}</Radio>)}
        </Radio.Group>
      </div>
    );
  },

  SwitchInput: ({ label, checked, dataPath, checkedText = "开", uncheckedText = "关", onDataChange }: any) => {
    const checkedRef = React.useRef<boolean | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (checkedRef.current === undefined) checkedRef.current = !!checked;
    React.useEffect(() => {
      if (dataPath && onDataChange) onDataChange(dataPath, checkedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        {label && <span style={{ fontSize: 13 }}>{label}</span>}
        <Switch
          checked={checkedRef.current}
          checkedChildren={checkedText}
          unCheckedChildren={uncheckedText}
          onChange={(v) => {
            checkedRef.current = v;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, v);
          }}
        />
      </div>
    );
  },

  Rate: ({ value = 0, dataPath, count = 5, allowHalf = false, onDataChange }: any) => {
    const rateRef = React.useRef<number | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (rateRef.current === undefined) rateRef.current = Number(value) || 0;
    React.useEffect(() => {
      if (dataPath && onDataChange) onDataChange(dataPath, rateRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <Rate
        value={rateRef.current}
        count={count}
        allowHalf={allowHalf}
        onChange={(v) => {
          rateRef.current = v;
          forceUpdate();
          if (dataPath && onDataChange) onDataChange(dataPath, v);
        }}
        style={{ marginBottom: 8 }}
      />
    );
  },

  // ── 布局/导航类 ────────────────────────────────────────────────────────────
  Steps: ({ current = 0, items = [], size = "default", status = "process", direction = "horizontal" }: any) => (
    <Steps
      current={current}
      size={size}
      status={status}
      direction={direction}
      style={{ marginBottom: 12 }}
      items={(items as any[]).map((item: any) => ({
        title:       item.title,
        description: item.description,
        status:      item.status,
      }))}
    />
  ),

  Tabs: ({ activeKey, items = [], dataPath, onDataChange, type = "line" }: any) => {
    const keyRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (keyRef.current === undefined && activeKey !== undefined) keyRef.current = String(activeKey);
    if (keyRef.current === undefined && items.length > 0) keyRef.current = String(items[0].key ?? "");
    React.useEffect(() => {
      if (dataPath && onDataChange && keyRef.current !== undefined) onDataChange(dataPath, keyRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <Tabs
        activeKey={keyRef.current}
        type={type}
        style={{ marginBottom: 8 }}
        onChange={(key) => {
          keyRef.current = key;
          forceUpdate();
          if (dataPath && onDataChange) onDataChange(dataPath, key);
        }}
        items={(items as any[]).map((item: any) => ({
          key:      item.key,
          label:    item.label,
          children: item.content ?? item.children,
        }))}
      />
    );
  },

  Collapse: ({ items = [], defaultActiveKey = [], accordion = false }: any) => (
    <Collapse
      defaultActiveKey={defaultActiveKey}
      accordion={accordion}
      style={{ marginBottom: 8 }}
      items={(items as any[]).map((item: any) => ({
        key:      item.key,
        label:    item.label,
        children: item.content ?? item.children,
      }))}
    />
  ),

  // Segmented: same ref-based approach as RadioGroup.
  Segmented: ({ options = [], value, dataPath, block = false, onDataChange }: any) => {
    const selectedRef = React.useRef<string | undefined>(undefined);
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    if (selectedRef.current === undefined && value !== undefined) {
      selectedRef.current = String(value);
    }

    React.useEffect(() => {
      if (dataPath && onDataChange && selectedRef.current !== undefined) {
        onDataChange(dataPath, selectedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Segmented
        value={selectedRef.current}
        options={options as string[]}
        block={block}
        style={{ marginBottom: 8 }}
        onChange={(v) => {
          selectedRef.current = String(v);
          forceUpdate();
          if (dataPath && onDataChange) onDataChange(dataPath, String(v));
        }}
      />
    );
  },

  // ── 媒体 ───────────────────────────────────────────────────────────────────
  Image: ({ src, alt = "", width = "100%", height = "auto", objectFit = "contain", preview = true }: any) => (
    <div style={{ marginBottom: 8, width }}>
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height, objectFit, display: "block", borderRadius: 4 }}
        {...(preview ? { onClick: () => window.open(src, "_blank") } : {})}
      />
    </div>
  ),

  // ── 布局补充 ────────────────────────────────────────────────────────────────
  Row: ({ children, gap = 8, padding = "0", wrap = true, align = "flex-start", justify = "flex-start" }: any) => (
    <div style={{ display: "flex", flexDirection: "row", gap, padding, flexWrap: wrap ? "wrap" : "nowrap", alignItems: align, justifyContent: justify }}>
      {children}
    </div>
  ),

  List: ({ items = [], size = "default", bordered = false, renderKey = "label" }: any) => {
    const padding = size === "small" ? "4px 0" : size === "large" ? "12px 0" : "8px 0";
    return (
      <div style={{ border: bordered ? "1px solid #d9d9d9" : "none", borderRadius: bordered ? 6 : 0, marginBottom: 8 }}>
        {(items as any[]).map((item: any, idx: number) => (
          <div key={idx} style={{ padding, borderBottom: idx < items.length - 1 ? "1px solid #f0f0f0" : "none" }}>
            {typeof item === "string" ? item : (item[renderKey] ?? item.content ?? item.label ?? JSON.stringify(item))}
          </div>
        ))}
      </div>
    );
  },

  // ── 表单补充 ────────────────────────────────────────────────────────────────
  DateTimeInput: ({ label, value, dataPath, format = "YYYY-MM-DD", showTime = false, placeholder, onDataChange }: any) => {
    // Use ref to store current dayjs value — prevents xCard command replay from resetting selection.
    // value prop is a date string (e.g. "2026-01-15"); parsed once on first render.
    const dateRef = React.useRef<any>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
    if (dateRef.current === undefined) {
      dateRef.current = value ? (dayjs(value).isValid() ? dayjs(value) : null) : null;
    }
    React.useEffect(() => {
      const str = dateRef.current ? dateRef.current.format(format) : undefined;
      if (dataPath && onDataChange && str) onDataChange(dataPath, str);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <DatePicker
          value={dateRef.current}
          format={format}
          showTime={showTime}
          placeholder={placeholder}
          style={{ width: "100%" }}
          onChange={(date: any, dateStr: string | string[]) => {
            dateRef.current = date;
            forceUpdate();
            const str = Array.isArray(dateStr) ? dateStr[0] : dateStr;
            if (dataPath && onDataChange) onDataChange(dataPath, str);
          }}
        />
      </div>
    );
  },

  ChoicePicker: ({ label, options = [], value, dataPath, variant = "single", onDataChange }: any) => {
    const selectedRef = React.useRef<string | string[] | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    // Init from props only once
    if (selectedRef.current === undefined && value !== undefined) {
      selectedRef.current = value;
    }
    if (selectedRef.current === undefined) {
      selectedRef.current = variant === "multiple" ? [] : undefined;
    }

    React.useEffect(() => {
      if (dataPath && onDataChange && selectedRef.current !== undefined) {
        onDataChange(dataPath, selectedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (variant === "multiple") {
      return (
        <div style={{ marginBottom: 8 }}>
          {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
          <Checkbox.Group
            options={(options as string[]).map((o) => ({ label: o, value: o }))}
            value={Array.isArray(selectedRef.current) ? selectedRef.current : []}
            onChange={(vals) => {
              selectedRef.current = vals as string[];
              forceUpdate();
              if (dataPath && onDataChange) onDataChange(dataPath, vals);
            }}
          />
        </div>
      );
    }
    // single — use Radio.Group
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Radio.Group
          value={selectedRef.current}
          onChange={(e) => {
            selectedRef.current = e.target.value;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, e.target.value);
          }}
        >
          {(options as string[]).map((o) => <Radio key={o} value={o}>{o}</Radio>)}
        </Radio.Group>
      </div>
    );
  },

  CheckBox: ({ label, checked, dataPath, onDataChange }: any) => {
    const checkedRef = React.useRef<boolean | undefined>(undefined);
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    if (checkedRef.current === undefined) {
      checkedRef.current = !!checked;
    }

    React.useEffect(() => {
      if (dataPath && onDataChange) {
        onDataChange(dataPath, checkedRef.current);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div style={{ marginBottom: 8 }}>
        <Checkbox
          checked={checkedRef.current}
          onChange={(e) => {
            checkedRef.current = e.target.checked;
            forceUpdate();
            if (dataPath && onDataChange) onDataChange(dataPath, e.target.checked);
          }}
        >
          {label}
        </Checkbox>
      </div>
    );
  },

  // ── 弹窗 ──────────────────────────────────────────────────────────────────
  ModalButton: ({ label, title, content, okText = "确定", cancelText = "取消", variant = "default", action, onAction }: any) => {
    const [open, setOpen] = React.useState(false);
    const handleOk = () => {
      setOpen(false);
      // Fire action on confirm — same protocol as Button: onAction(name, context)
      if (action?.event && onAction) {
        onAction(action.event.name, {});
      }
    };
    return (
      <>
        <Button
          type={variant === "primary" ? "primary" : variant as any}
          onClick={() => setOpen(true)}
          style={{ margin: "4px 2px" }}
        >
          {label}
        </Button>
        <Modal
          open={open}
          title={title}
          okText={okText}
          cancelText={cancelText}
          onOk={handleOk}
          onCancel={() => setOpen(false)}
        >
          <p>{content}</p>
        </Modal>
      </>
    );
  },
};
