library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── Demo：新增组件展示 ────────────────────────────────────────────────────────
#
# 涵盖 v0.2 新增：
#   - Image          图片展示
#   - Row            横向布局容器
#   - List           简单列表
#   - DateTimeInput  日期选择（dataPath 双向绑定）
#   - ChoicePicker   单/多选（variant = "single" / "multiple"）
#   - CheckBox       单个复选框
#   - ModalButton    触发弹窗的按钮
#   - xcard_create_surface() theme 参数（primaryColor）
#   - xcard_update_data()    删除语义（value 省略）
#
# 架构：standalone antDesignXCardOutput（不依赖 chat UI）
#       R 侧维护 reactiveVal(list()) 累积命令列表，每次操作追加后重新 render。

# ── 辅助 ──────────────────────────────────────────────────────────────────────

surface_id <- "demo"

make_section <- function(label_id, label_text, ...) {
  # Returns a divider label + component nodes
  list(
    list(id = label_id, component = "Divider", text = label_text)
  ) |> c(list(...))
}

ui <- page_fillable(
  padding = 16,
  layout_columns(
    col_widths = c(3, 9),
    # ── 左：按钮面板 ──
    card(
      height = "95vh",
      card_header("组件演示"),
      card_body(
        overflow_y = "auto",
        tags$style(HTML(".btn-demo { width: 100%; margin-bottom: 6px; }")),
        p("点击按钮将对应组件推入卡片。", style = "font-size:12px;color:#6b7280;"),
        hr(),
        actionButton("btn_image",      "Image 图片",                   class = "btn-demo"),
        actionButton("btn_list",       "List 列表",                    class = "btn-demo"),
        actionButton("btn_row",        "Row 横向布局",                  class = "btn-demo"),
        actionButton("btn_form",       "DateTimeInput + ChoicePicker", class = "btn-demo"),
        actionButton("btn_checkbox",   "CheckBox",                     class = "btn-demo"),
        actionButton("btn_modal",      "ModalButton",                  class = "btn-demo"),
        hr(),
        actionButton("btn_theme",      "theme（紫色主题）",              class = "btn-demo"),
        actionButton("btn_delete_key", "updateDataModel 删除 key",     class = "btn-demo"),
        hr(),
        actionButton("btn_reset",      "重置",                         class = "btn-demo",
                     style = "background:#f3f4f6;"),
        hr(),
        p("动作日志：", style = "font-size:12px;font-weight:600;"),
        uiOutput("log_ui")
      )
    ),
    # ── 右：卡片 ──
    card(
      height = "95vh",
      card_header("XCard"),
      card_body(
        fillable = FALSE, overflow_y = "auto",
        antDesignXCardOutput("demo_card", height = "auto")
      )
    )
  )
)

server <- function(input, output, session) {

  # 累积命令列表：每次操作追加命令后重新 render
  cmds <- reactiveVal(list(xcard_create_surface(surface_id)))
  log_msgs <- reactiveVal(character(0))

  push_cmds <- function(new_cmds) {
    cmds(c(cmds(), new_cmds))
  }

  add_log <- function(msg) {
    log_msgs(c(paste0("[", format(Sys.time(), "%H:%M:%S"), "] ", msg), log_msgs()))
  }

  output$demo_card <- renderAntDesignXCard({
    list(
      inputId   = "card_action",
      surfaceId = surface_id,
      commands  = cmds()
    )
  })

  # ── Image ──────────────────────────────────────────────────────────────────
  observeEvent(input$btn_image, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_img",  component = "Divider", text = "Image 组件"),
        list(id = "img1",     component = "Image",
             src       = "https://picsum.photos/seed/shinyantx/560/160",
             alt       = "示例图片", width = "100%", height = "160px",
             objectFit = "cover", preview = TRUE),
        list(id = "img_desc", component = "Text",
             text    = "objectFit=cover, preview=TRUE（点击原图）",
             variant = "secondary"),
        list(id = "root",     component = "Container", gap = 8L,
             children = list("div_img", "img1", "img_desc"))
      ))
    ))
    add_log("推送 Image")
  })

  # ── List ───────────────────────────────────────────────────────────────────
  observeEvent(input$btn_list, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_list", component = "Divider", text = "List 组件"),
        list(id = "lst1",     component = "List",
             bordered = TRUE, size = "small",
             items    = list("React 18", "Shiny 1.8", "Ant Design X", "htmlwidgets")),
        list(id = "root",     component = "Container", gap = 8L,
             children = list("div_list", "lst1"))
      ))
    ))
    add_log("推送 List")
  })

  # ── Row ────────────────────────────────────────────────────────────────────
  observeEvent(input$btn_row, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_row", component = "Divider", text = "Row 横向布局"),
        list(id = "t1",      component = "Tag", text = "React",     color = "blue"),
        list(id = "t2",      component = "Tag", text = "Shiny",     color = "green"),
        list(id = "t3",      component = "Tag", text = "Ant Design",color = "orange"),
        list(id = "s1",      component = "Statistic", title = "收入",  value = 12345L, prefix = "¥"),
        list(id = "s2",      component = "Statistic", title = "用户数", value = 888L),
        list(id = "row_tags",  component = "Row", gap = 8L,  children = list("t1", "t2", "t3")),
        list(id = "row_stats", component = "Row", gap = 24L, children = list("s1", "s2")),
        list(id = "root",      component = "Container", gap = 12L,
             children = list("div_row", "row_tags", "row_stats"))
      ))
    ))
    add_log("推送 Row 横向布局")
  })

  # ── Form 组件 ───────────────────────────────────────────────────────────────
  observeEvent(input$btn_form, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_form",   component = "Divider", text = "DateTimeInput / ChoicePicker"),
        list(id = "dt",         component = "DateTimeInput",
             label = "选择日期", format = "YYYY-MM-DD", dataPath = "selectedDate"),
        list(id = "cp_single",  component = "ChoicePicker",
             label   = "偏好语言（单选）",
             options = list("R", "Python", "Julia", "Rust"),
             variant = "single", dataPath = "lang"),
        list(id = "cp_multi",   component = "ChoicePicker",
             label   = "感兴趣领域（多选）",
             options = list("数据分析", "机器学习", "可视化", "NLP"),
             variant = "multiple", dataPath = "interests"),
        list(id = "root",       component = "Container", gap = 12L,
             children = list("div_form", "dt", "cp_single", "cp_multi"))
      ))
    ))
    add_log("推送 DateTimeInput + ChoicePicker")
  })

  # ── CheckBox ────────────────────────────────────────────────────────────────
  observeEvent(input$btn_checkbox, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_cb", component = "Divider", text = "CheckBox"),
        list(id = "cb1",    component = "CheckBox",
             label    = "接受服务条款",
             checked  = FALSE, dataPath = "agreed"),
        list(id = "cb2",    component = "CheckBox",
             label    = "订阅邮件通知",
             checked  = TRUE,  dataPath = "subscribe"),
        list(id = "root",   component = "Container", gap = 8L,
             children = list("div_cb", "cb1", "cb2"))
      ))
    ))
    add_log("推送 CheckBox")
  })

  # ── ModalButton ─────────────────────────────────────────────────────────────
  observeEvent(input$btn_modal, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_modal", component = "Divider", text = "ModalButton"),
        list(id = "mb1",       component = "ModalButton",
             label   = "默认弹窗", title = "提示",
             content = "这是 ModalButton default 样式，适合普通信息展示。",
             okText  = "OK", cancelText = "取消"),
        list(id = "mb2",       component = "ModalButton",
             label   = "主色弹窗", variant = "primary",
             title   = "确认操作",
             content = "这是 ModalButton primary 样式，适合需要用户确认的场景。",
             okText  = "确认", cancelText = "取消"),
        list(id = "row_mb",    component = "Row", gap = 8L,
             children = list("mb1", "mb2")),
        list(id = "root",      component = "Container", gap = 8L,
             children = list("div_modal", "row_mb"))
      ))
    ))
    add_log("推送 ModalButton")
  })

  # ── createSurface theme ─────────────────────────────────────────────────────
  observeEvent(input$btn_theme, {
    # 重建 surface，附带 theme 参数
    cmds(list(
      xcard_create_surface(surface_id,
        theme = list(primaryColor = "#722ed1", agentDisplayName = "紫色主题 Agent")
      ),
      xcard_update_components(surface_id, list(
        list(id = "div_t",   component = "Divider", text = "createSurface theme"),
        list(id = "lbl",     component = "Text",
             text    = "primaryColor=#722ed1，agentDisplayName 已设置。Button primary 色应变为紫色（主题色由 xCard 内部 ConfigProvider 应用）。",
             variant = "body"),
        list(id = "btn_pri", component = "Button",
             label   = "Primary 按钮（紫）", variant = "primary",
             action  = list(event = list(name = "theme_click", context = list()))),
        list(id = "root",    component = "Container", gap = 12L,
             children = list("div_t", "lbl", "btn_pri"))
      ))
    ))
    add_log("推送 createSurface theme（primaryColor=#722ed1）")
  })

  # ── updateDataModel 删除语义 ────────────────────────────────────────────────
  observeEvent(input$btn_delete_key, {
    push_cmds(list(
      xcard_update_components(surface_id, list(
        list(id = "div_del", component = "Divider", text = "updateDataModel 删除语义"),
        list(id = "lbl_del", component = "Text",
             text    = "先写入 /tempKey = 'hello'，然后调用 xcard_update_data() 省略 value → 删除该 key。数据模型变化见 JS console。",
             variant = "body"),
        list(id = "root",    component = "Container", gap = 8L,
             children = list("div_del", "lbl_del"))
      )),
      # 写入
      xcard_update_data(surface_id, "/tempKey", "hello"),
      # 删除：value 省略
      xcard_update_data(surface_id, "/tempKey")
    ))
    add_log("写入 /tempKey='hello' 然后删除（value 省略）")
  })

  # ── 重置 ────────────────────────────────────────────────────────────────────
  observeEvent(input$btn_reset, {
    cmds(list(xcard_create_surface(surface_id)))
    log_msgs(character(0))
    add_log("重置")
  })

  # ── card action 回调 ────────────────────────────────────────────────────────
  observeEvent(input$card_action, {
    act <- input$card_action
    if (!is.null(act$name)) add_log(paste0("Action: ", act$name))
  })

  # ── 日志 ─────────────────────────────────────────────────────────────────────
  output$log_ui <- renderUI({
    msgs <- log_msgs()
    if (length(msgs) == 0) return(p("暂无日志", style = "color:#9ca3af;font-size:11px;"))
    tagList(lapply(msgs, function(m) {
      div(m, style = "font-size:11px;font-family:monospace;padding:2px 0;
                      border-bottom:1px solid #f3f4f6;color:#374151;")
    }))
  })
}

shinyApp(ui, server)
