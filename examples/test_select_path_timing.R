library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── Select path-ref 时序验证 ──────────────────────────────────────────────────
#
# 验证问题：Select 触发 action 时，action.event.context 中的 { path } 引用
# 能否解析到刚刚由 onDataChange 写入的最新值？
#
# 如果能 → Select 可以统一回 Class B（只走 dataModel + path refs），删掉 hybrid
# 如果不能 → onDataChange 和 resolveActionContextPathRefs 之间存在时序问题，
#             Select 的 hybrid 特例有保留价值
#
# 测试设计：
#   - Select 绑定 dataPath = "region"
#   - action.event.context 里用 { path = "/region" } 引用同一个值
#   - 同时在 C 类 hybrid 模式里也直接传 value = v
#   - 比较两者是否一致，以及 path ref 是否总是最新值

surface_id <- "select_timing_test"

ui <- page_fillable(
  padding = 16,
  layout_columns(
    col_widths = c(4, 8),
    card(
      height = "95vh",
      card_header("测试日志"),
      card_body(
        overflow_y = "auto",
        p("操作：在右侧 Select 改选项，观察下方日志。",
          style = "font-size:12px;color:#6b7280;"),
        p("关键列：path_resolved vs direct_value 是否一致，且是否是最新选中值。",
          style = "font-size:12px;color:#6b7280;"),
        hr(),
        actionButton("btn_reset", "重置", style = "width:100%;background:#f3f4f6;"),
        hr(),
        tableOutput("log_table")
      )
    ),
    card(
      height = "95vh",
      card_header("XCard — Select 时序测试"),
      card_body(
        fillable = FALSE, overflow_y = "auto",
        antDesignXCardOutput("test_card", height = "auto")
      )
    )
  )
)

server <- function(input, output, session) {

  sid   <- reactiveVal(surface_id)
  cmds  <- reactiveVal(list(xcard_create_surface(surface_id, send_data_model = TRUE)))
  log   <- reactiveVal(data.frame(
    seq          = integer(),
    action_name  = character(),
    path_resolved = character(),   # value resolved via { path = "/region" }
    direct_value = character(),    # value passed directly in hybrid mode
    match        = character(),
    stringsAsFactors = FALSE
  ))

  output$test_card <- renderAntDesignXCard({
    list(inputId = "card_action", surfaceId = sid(), commands = cmds())
  })

  observeEvent(sid(), {
    new_sid <- sid()
    cmds(list(
      xcard_create_surface(new_sid, send_data_model = TRUE),
      xcard_update_components(new_sid, list(
        list(id = "lbl",  component = "Text",
             text = "改变 Select 的值，观察日志里 path_resolved 和 direct_value 是否一致。",
             variant = "secondary"),

        # ── 被测 Select ──────────────────────────────────────────────────────
        # dataPath 绑定 /region
        # action context 同时传：
        #   1. path ref: { path = "/region" } — 框架解析的值
        #   2. direct: 直接在 Select 的 hybrid 逻辑里传的 value
        list(id = "sel",  component = "Select",
             label   = "地区选择",
             options = list("华东", "华南", "华北", "全国"),
             value   = "华东",
             dataPath = "region",
             action  = list(event = list(
               name    = "region:change",
               context = list(
                 # path ref — 由框架在 resolveActionContextPathRefs 时解析
                 region_via_path = list(path = "/region")
               )
             ))),

        list(id = "root", component = "Container", gap = 12L,
             children = list("lbl", "sel"))
      ))
    ))
  })

  observeEvent(input$btn_reset, {
    new_sid <- paste0(surface_id, "_", as.integer(Sys.time()))
    sid(new_sid)
    log(data.frame(
      seq = integer(), action_name = character(),
      path_resolved = character(), direct_value = character(), match = character(),
      stringsAsFactors = FALSE
    ))
  })

  observeEvent(input$card_action, {
    act <- input$card_action
    if (is.null(act$name)) return()

    ctx <- act$context %||% list()

    # path ref 解析结果（由框架 resolveActionContextPathRefs 处理）
    path_resolved <- as.character(ctx$region_via_path$value %||% ctx$region_via_path %||% NA)

    # hybrid 直传的值（Select C 类行为里的 value）
    # 注意：上游 Select 实现里，direct value 也会出现在 context 里
    # 这里从 context 的其他字段或者从 dataModel 快照读
    direct_value <- as.character(ctx$value %||% NA)

    # 如果 direct_value 为 NA，尝试从 context 读（xCard 有时把 value 放顶层）
    if (is.na(direct_value)) {
      direct_value <- as.character(act$context$value %||% NA)
    }

    match_result <- if (!is.na(path_resolved) && !is.na(direct_value)) {
      if (path_resolved == direct_value) "✓ 一致" else "✗ 不一致"
    } else if (!is.na(path_resolved)) {
      "仅 path_resolved 有值"
    } else {
      "path_resolved 为空"
    }

    new_row <- data.frame(
      seq           = nrow(log()) + 1L,
      action_name   = act$name,
      path_resolved = path_resolved,
      direct_value  = direct_value,
      match         = match_result,
      stringsAsFactors = FALSE
    )
    log(rbind(new_row, log()))
  })

  output$log_table <- renderTable({
    df <- log()
    if (nrow(df) == 0) {
      data.frame(提示 = "暂无动作，改变 Select 值触发", stringsAsFactors = FALSE)
    } else {
      df
    }
  }, striped = TRUE, hover = TRUE)
}

`%||%` <- function(a, b) if (!is.null(a)) a else b

shinyApp(ui, server)
