library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── Select action/dataModel 时序策略对比测试 ──────────────────────────────────
#
# 目的：验证三种 action 策略下，path refs 能否解析到最新值。
#
# 三种策略：
#   data_only     — 只 onDataChange；action fires onAction(name, {})
#   hybrid        — onDataChange + onAction(name, { value })（当前 Select 做法）
#   delayed_action— onDataChange 先写；Promise.resolve() 后再 onAction(name, {})
#
# 每个策略各有一个 SelectActionProbe，action.event.context 里用 { path } 引用
# 对应的 dataPath，测量 path_resolved 是否等于刚选中的 direct_value。
#
# 判断标准：
#   path_resolved == direct_value → 框架在 action 触发时已读到最新 dataModel 值
#   path_resolved != direct_value → 时序滞后，需要继续保留 hybrid 直传

surface_id <- "select_timing_probe"

ui <- page_fillable(
  padding = 16,
  layout_columns(
    col_widths = c(4, 8),
    card(
      height = "95vh",
      card_header("测试结果"),
      card_body(
        overflow_y = "auto",
        p("各 SelectActionProbe 改变选项后，观察 path_resolved 是否等于 direct_value。",
          style = "font-size:12px;color:#6b7280;"),
        tags$ul(style = "font-size:11px;color:#374151;",
          tags$li(tags$b("path_resolved"), "：框架通过 { path } 解析的值"),
          tags$li(tags$b("direct_value"), "：action context 里直传的值（data_only 为空）"),
          tags$li(tags$b("✓ path 最新"), "→ 此策略可去掉 hybrid；", tags$b("✗ 滞后"), "→ 需保留 hybrid")
        ),
        hr(),
        actionButton("btn_reset", "重置", style = "width:100%;background:#f3f4f6;margin-bottom:8px;"),
        tableOutput("log_table")
      )
    ),
    card(
      height = "95vh",
      card_header("SelectActionProbe — 三种模式对比"),
      card_body(
        fillable = FALSE, overflow_y = "auto",
        antDesignXCardOutput("test_card", height = "auto")
      )
    )
  )
)

server <- function(input, output, session) {

  sid  <- reactiveVal(surface_id)
  cmds <- reactiveVal(list())
  log  <- reactiveVal(data.frame(
    seq           = integer(),
    mode          = character(),
    action_name   = character(),
    path_resolved = character(),
    direct_value  = character(),
    verdict       = character(),
    stringsAsFactors = FALSE
  ))

  init_cmds <- function(new_sid) {
    components <- list(
      # ── data_only ──────────────────────────────────────────────────────────
      list(id = "div_a",     component = "Divider",          text = "① data_only — action fires onAction(name, {})"),
      list(id = "probe_a",   component = "SelectActionProbe",
           label = "选择地区", options = list("华东", "华南", "华北", "全国"),
           value = "华东", dataPath = "region_a", mode = "data_only",
           action = list(event = list(name = "select:data_only",
             context = list(region_path = list(path = "/region_a"))))),
      # ── hybrid ─────────────────────────────────────────────────────────────
      list(id = "div_b",     component = "Divider",          text = "② hybrid — onDataChange + onAction(name, { value })"),
      list(id = "probe_b",   component = "SelectActionProbe",
           label = "选择地区", options = list("华东", "华南", "华北", "全国"),
           value = "华东", dataPath = "region_b", mode = "hybrid",
           action = list(event = list(name = "select:hybrid",
             context = list(region_path = list(path = "/region_b"))))),
      # ── delayed_action ─────────────────────────────────────────────────────
      list(id = "div_c",     component = "Divider",          text = "③ delayed_action — onDataChange first, action in next microtask"),
      list(id = "probe_c",   component = "SelectActionProbe",
           label = "选择地区", options = list("华东", "华南", "华北", "全国"),
           value = "华东", dataPath = "region_c", mode = "delayed_action",
           action = list(event = list(name = "select:delayed_action",
             context = list(region_path = list(path = "/region_c"))))),
      # ── root ───────────────────────────────────────────────────────────────
      list(id = "root", component = "Container", gap = 4L,
           children = list("div_a", "probe_a", "div_b", "probe_b", "div_c", "probe_c"))
    )
    list(
      xcard_create_surface(new_sid, send_data_model = TRUE),
      xcard_update_components(new_sid, components)
    )
  }

  observe({
    new_sid <- sid()
    cmds(init_cmds(new_sid))
  })

  output$test_card <- renderAntDesignXCard({
    list(inputId = "card_action", surfaceId = sid(), commands = cmds())
  })

  observeEvent(input$btn_reset, {
    new_sid <- paste0(surface_id, "_", as.integer(Sys.time()))
    sid(new_sid)
    log(data.frame(
      seq = integer(), mode = character(), action_name = character(),
      path_resolved = character(), direct_value = character(), verdict = character(),
      stringsAsFactors = FALSE
    ))
  })

  observeEvent(input$card_action, {
    act <- input$card_action
    if (is.null(act$name)) return()

    ctx <- act$context %||% list()

    # path ref 解析结果
    path_val <- ctx$region_path
    path_resolved <- if (is.list(path_val) && !is.null(path_val$value)) {
      as.character(path_val$value)
    } else if (is.character(path_val)) {
      path_val  # 未解析，返回了路径字符串本身
    } else {
      "(null)"
    }

    # hybrid 直传的 value（只有 hybrid 模式有）
    direct_value <- as.character(ctx$value %||% "(not passed)")

    # 判断：path 解析是否得到了真实值（非路径字符串）
    is_path_resolved <- !startsWith(path_resolved, "/") && path_resolved != "(null)"
    mode_label <- sub("select:", "", act$name)

    verdict <- if (is_path_resolved) {
      "✓ path 最新"
    } else {
      "✗ path 滞后"
    }

    new_row <- data.frame(
      seq           = nrow(log()) + 1L,
      mode          = mode_label,
      action_name   = act$name,
      path_resolved = path_resolved,
      direct_value  = direct_value,
      verdict       = verdict,
      stringsAsFactors = FALSE
    )
    log(rbind(new_row, log()))
  })

  output$log_table <- renderTable({
    df <- log()
    if (nrow(df) == 0) {
      data.frame(提示 = "改变任意 Select 选项触发 action", stringsAsFactors = FALSE)
    } else {
      df
    }
  }, striped = TRUE, hover = TRUE)
}

`%||%` <- function(a, b) if (!is.null(a)) a else b

shinyApp(ui, server)
