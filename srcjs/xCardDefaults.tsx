// Shared default XCard catalog schema + component implementations
// Used by both the standalone xCard widget and the antDesignX chat widget.
import React from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Collapse,
  Descriptions,
  Divider,
  Input,
  InputNumber,
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
        variant: { type: "string", enum: ["h1", "h2", "h3", "body"] },
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
  },
};

export const SHINY_DEFAULT_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // ── 基础 ────────────────────────────────────────────────────────────────────
  Text: ({ text, variant, children }: { text?: string; variant?: string; children?: React.ReactNode }) => {
    const content = text ?? children;
    const styleMap: Record<string, React.CSSProperties> = {
      h1:   { fontSize: 20, fontWeight: 700, margin: "0 0 12px" },
      h2:   { fontSize: 17, fontWeight: 600, margin: "0 0 8px" },
      h3:   { fontSize: 15, fontWeight: 600, margin: "0 0 6px" },
      body: { fontSize: 14, margin: 0 },
    };
    return <p style={styleMap[variant ?? "body"] ?? styleMap.body}>{content}</p>;
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
  Input: ({ label, placeholder, defaultValue, value, dataPath, onDataChange }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <Input
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => { if (dataPath && onDataChange) onDataChange(dataPath, e.target.value); }}
      />
    </div>
  ),

  Select: ({ label, options = [], defaultValue, action, onAction }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <Select
        defaultValue={defaultValue}
        options={(options as string[]).map((o) => ({ value: o, label: o }))}
        style={{ width: "100%" }}
        onChange={(v) => { if (action?.event && onAction) onAction(action.event.name, { ...action.event.context, value: v }); }}
      />
    </div>
  ),

  Tag: ({ text, color }: any) => <Tag color={color}>{text}</Tag>,

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
  Textarea: ({ label, placeholder, value, dataPath, rows = 4, onDataChange }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <Input.TextArea
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={(e) => { if (dataPath && onDataChange) onDataChange(dataPath, e.target.value); }}
      />
    </div>
  ),

  InputNumber: ({ label, value, dataPath, min, max, step = 1, addonAfter, onDataChange }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <InputNumber
        value={value}
        min={min}
        max={max}
        step={step}
        addonAfter={addonAfter}
        style={{ width: "100%" }}
        onChange={(v) => { if (dataPath && onDataChange) onDataChange(dataPath, v); }}
      />
    </div>
  ),

  Slider: ({ value, dataPath, min = 0, max = 100, step = 1, marks, onDataChange }: any) => (
    <Slider
      value={value}
      min={min}
      max={max}
      step={step}
      marks={marks}
      onChange={(v) => { if (dataPath && onDataChange) onDataChange(dataPath, v); }}
      style={{ marginBottom: 8 }}
    />
  ),

  CheckboxGroup: ({ label, options = [], value = [], dataPath, onDataChange }: any) => (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
      <Checkbox.Group
        options={(options as string[]).map((o) => ({ label: o, value: o }))}
        value={value}
        onChange={(vals) => { if (dataPath && onDataChange) onDataChange(dataPath, vals); }}
      />
    </div>
  ),

  // RadioGroup: controlled via Card's dataModel (two-way binding).
  // value prop is already resolved by resolvePropsV09 to actual dataModel value.
  // useEffect([]) initialises the dataModel key via onDataChange so action context
  // path bindings resolve correctly from the start.
  // Do NOT send xcard_update_data for these paths — updateDataModel commands are
  // replayed on every updateComponents, overwriting user selections.
  RadioGroup: ({ label, options = [], value, dataPath, onDataChange }: any) => {
    React.useEffect(() => {
      if (dataPath && onDataChange && value !== undefined) {
        onDataChange(dataPath, value);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <div style={{ marginBottom: 8 }}>
        {label && <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>}
        <Radio.Group
          value={value}
          onChange={(e) => { if (dataPath && onDataChange) onDataChange(dataPath, e.target.value); }}
        >
          {(options as string[]).map((o) => <Radio key={o} value={o}>{o}</Radio>)}
        </Radio.Group>
      </div>
    );
  },

  SwitchInput: ({ label, checked, dataPath, checkedText = "开", uncheckedText = "关", onDataChange }: any) => (
    <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
      {label && <span style={{ fontSize: 13 }}>{label}</span>}
      <Switch
        checked={checked}
        checkedChildren={checkedText}
        unCheckedChildren={uncheckedText}
        onChange={(v) => { if (dataPath && onDataChange) onDataChange(dataPath, v); }}
      />
    </div>
  ),

  Rate: ({ value = 0, dataPath, count = 5, allowHalf = false, onDataChange }: any) => (
    <Rate
      value={value}
      count={count}
      allowHalf={allowHalf}
      onChange={(v) => { if (dataPath && onDataChange) onDataChange(dataPath, v); }}
      style={{ marginBottom: 8 }}
    />
  ),

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

  Tabs: ({ activeKey, items = [], dataPath, onDataChange, type = "line" }: any) => (
    <Tabs
      activeKey={activeKey}
      type={type}
      style={{ marginBottom: 8 }}
      onChange={(key) => { if (dataPath && onDataChange) onDataChange(dataPath, key); }}
      items={(items as any[]).map((item: any) => ({
        key:      item.key,
        label:    item.label,
        children: item.content ?? item.children,
      }))}
    />
  ),

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

  // Segmented: same controlled two-way binding pattern as RadioGroup.
  Segmented: ({ options = [], value, dataPath, block = false, onDataChange }: any) => {
    React.useEffect(() => {
      if (dataPath && onDataChange && value !== undefined) {
        onDataChange(dataPath, String(value));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <Segmented
        value={value}
        options={options as string[]}
        block={block}
        style={{ marginBottom: 8 }}
        onChange={(v) => { if (dataPath && onDataChange) onDataChange(dataPath, String(v)); }}
      />
    );
  },
};
