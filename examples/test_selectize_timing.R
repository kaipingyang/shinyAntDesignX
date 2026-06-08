library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── SelectizeProbe 五模式时序实验 ─────────────────────────────────────────────
#
# 目的：回答一个核心问题——
#   "选择型组件能不能在不走 hybrid 的前提下，真正统一到 dataModel？"
#
# 五种模式：
#   data_only            — 同步 onDataChange + onAction({})
#   hybrid               — onDataChange + onAction({ value, direct_value })（当前方案）
#   micro_delayed_action — onDataChange + Promise.resolve() → onAction
#   macro_delayed_action — onDataChange + setTimeout(0) → onAction   ← 重点
#   submit_action        — onDataChange on select; 独立按钮触发 onAction ← 另一重点
#
# 判定规则（三值）：
#   path_resolved == selected_value → ✓ path 最新（可去掉 hybrid）
#   path_resolved != selected_value → ✗ 滞后（需保留 hybrid）
#   path_resolved 未解析/null       → ✗ 未解析
#
# 结论导向：
#   A. macro_delayed_action 成功 → dataModel 路线可行，只是时序问题
#   B. submit_action 成功，macro 失败 → 需分离"选中"与"动作"
#   C. 两者都失败 → Select 类组件只能 hybrid

surface_id <- "selectize_probe"

ui <- page_fillable(
  padding = 16,
  layout_columns(
    col_widths = c(4, 8),
    card(
      height = "95vh",
      card_header("测试结果"),
      card_body(
        overflow_y = "auto",
        p("改变任意 SelectizeProbe 选项后（submit_action 需点「提交」按鈕）观察结果。",
          style = "font-size:12px;color:#6b7280;"),
        tags$ul(style = "font-size:11px;color:#374151;",
          tags$li(tags$b("selected"), "：刚选的值（direct_value 或 submit 时 current）"),
          tags$li(tags$b("path_resolved"), "：框架 { path } 解析结果"),
          tags$li(tags$b("✓ path 最新"), "→ 此模式可去 hybrid；",
                  tags$b("✗ 滞后/未解析"), "→ 不行")
        ),
        hr(),
        actionButton("btn_reset", "重置", style = "width:100%;background:#f3f4f6;margin-bottom:8px;"),
        tableOutput("log_table")
      )
    ),
    card(
      height = "95vh",
      card_header("SelectizeProbe — 五种模式"),
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
    selected      = character(),
    path_resolved = character(),
    verdict       = character(),
    stringsAsFactors = FALSE
  ))

  make_probe <- function(id_suffix, mode_name, title_text, path_name) {
    list(
      div  = list(id = paste0("div_", id_suffix), component = "Divider", text = title_text),
      probe = list(id = paste0("probe_", id_suffix),
           component = "SelectizeProbe",
           label = "选择地区",
           options = list("华东", "华南", "华北", "全国"),
           value = "华东",
           dataPath = path_name,
           mode = mode_name,
           action = list(event = list(
             name = paste0("region:", mode_name),
             context = list(region_path = list(path = paste0("/", path_name))))))
    )
  }

  init_cmds <- function(new_sid) {
    pa <- make_probe("a", "data_only",            "① data_only — 同步 onAction({})",          "region_a")
    pb <- make_probe("b", "hybrid",               "② hybrid — onAction({ value })",             "region_b")
    pc <- make_probe("c", "micro_delayed_action", "③ micro_delayed — Promise.resolve()",        "region_c")
    pd <- make_probe("d", "macro_delayed_action", "④ macro_delayed — setTimeout(0)  ← 重点",   "region_d")
    pe <- make_probe("e", "submit_action",        "⑤ submit_action — 分离选择与提交  ← 重点",  "region_e")

    children_ids <- list(
      "div_a", "probe_a", "div_b", "probe_b", "div_c", "probe_c",
      "div_d", "probe_d", "div_e", "probe_e"
    )
    root <- list(id = "root", component = "Container", gap = 4L, children = children_ids)

    all_components <- list(
      pa$div, pa$probe, pb$div, pb$probe, pc$div, pc$probe,
      pd$div, pd$probe, pe$div, pe$probe, root
    )

    list(
      xcard_create_surface(new_sid, send_data_model = TRUE),
      xcard_update_components(new_sid, all_components)
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
      seq = integer(), mode = character(), selected = character(),
      path_resolved = character(), verdict = character(),
      stringsAsFactors = FALSE
    ))
  })

  observeEvent(input$card_action, {
    act <- input$card_action
    if (is.null(act$name)) return()

    ctx <- act$context %||% list()
    mode_label <- sub("region:", "", act$name)

    # direct_value — all modes pass this (see SelectizeProbe handleChange/handleSubmit)
    selected <- as.character(ctx$direct_value %||% ctx$value %||% "(not passed)")

    # path ref resolution result
    path_val <- ctx$region_path
    path_resolved <- if (is.list(path_val) && !is.null(path_val$value)) {
      as.character(path_val$value)
    } else if (is.list(path_val) && !is.null(path_val$path)) {
      paste0("(unresolved: ", path_val$path, ")")
    } else if (is.character(path_val)) {
      paste0("(raw: ", path_val, ")")
    } else {
      "(null)"
    }

    # verdict: compare path_resolved to what was actually selected
    verdict <- if (startsWith(path_resolved, "(")) {
      if (grepl("^\\(unresolved", path_resolved)) "✗ 未解析" else "✗ 未解析/null"
    } else if (path_resolved == selected) {
      "✓ path 最新"
    } else {
      paste0("✗ 滞后 (path=", path_resolved, ")")
    }

    new_row <- data.frame(
      seq           = nrow(log()) + 1L,
      mode          = mode_label,
      selected      = selected,
      path_resolved = path_resolved,
      verdict       = verdict,
      stringsAsFactors = FALSE
    )
    log(rbind(new_row, log()))
  })

  output$log_table <- renderTable({
    df <- log()
    if (nrow(df) == 0) {
      data.frame(提示 = "改变任意 SelectizeProbe 选项后观察", stringsAsFactors = FALSE)
    } else {
      df
    }
  }, striped = TRUE, hover = TRUE)
}

`%||%` <- function(a, b) if (!is.null(a)) a else b

shinyApp(ui, server)
