library(shiny)
library(bslib)
library(DT)
devtools::load_all(here::here())

# 模拟数据集
make_sales_data <- function(region, period) {
  set.seed(42)
  products <- c("产品A", "产品B", "产品C", "产品D")
  data.frame(
    产品   = products,
    销量   = sample(100:500, 4),
    收入   = sample(10000:50000, 4),
    增长率 = paste0(round(runif(4, -10, 30), 1), "%"),
    stringsAsFactors = FALSE
  )
}

# ── UI ────────────────────────────────────────────────────────────────────────
ui <- page_fillable(
  padding = 0,
  tags$head(tags$style(HTML("
    html, body { height: 100%; margin: 0; overflow: hidden; }
    .chat-sidebar {
      width: 420px; min-width: 420px; max-width: 420px;
      height: 100vh; border-right: 1px solid #e5e7eb;
      flex-shrink: 0; overflow: hidden;
    }
    .main-panel {
      flex: 1; min-width: 0; height: 100vh;
      overflow-y: auto; padding: 24px;
      background: #fafafa;
    }
  "))),
  div(
    style = "display: flex; height: 100vh; overflow: hidden;",
    div(class = "chat-sidebar",
        antDesignXOutput("chat", height = "100vh")),
    div(class = "main-panel",
        h2("数据分析主面板", style = "margin-top:0;color:#1f2937;"),
        p("通过左侧 AI 聊天交互，主面板将实时更新分析结果。",
          style = "color:#6b7280;"),
        hr(),
        uiOutput("kpi_cards"),
        conditionalPanel("output.has_data",
          h3("📊 销售明细"),
          DTOutput("sales_table")
        ),
        hr(),
        h3("🃏 Action 日志"),
        verbatimTextOutput("action_log")
    )
  )
)

# ── 组件定义辅助（避免重复）──────────────────────────────────────────────────
# NOTE: dataPath must NOT start with "/" — resolveValueV09 treats any string
# starting with "/" as a dataModel path and resolves it to the stored value,
# destroying the path string before it reaches the component.
make_param_components <- function(current_step, submit_label, submit_disabled,
                                  status_msg, status_type, submit_action) {
  list(
    list(id = "steps", component = "Steps",
         current = current_step,
         items = list(
           list(title = "选择参数"),
           list(title = "分析中"),
           list(title = "完成")
         )),
    list(id = "region", component = "RadioGroup",
         label    = "分析地区",
         options  = list("华东", "华南", "华北", "全国"),
         value    = list(path = "region"),
         dataPath = "region"),
    list(id = "period", component = "Segmented",
         options  = list("本周", "本月", "本季度", "本年"),
         value    = list(path = "period"),
         dataPath = "period"),
    list(id = "submit", component = "Button",
         label    = submit_label,
         variant  = if (submit_disabled) "default" else "primary",
         disabled = submit_disabled,
         action   = submit_action),
    list(id = "status", component = "Alert",
         message  = status_msg,
         type     = status_type,
         showIcon = TRUE),
    list(id = "root", component = "Container", gap = 12L,
         children = list("steps", "region", "period", "submit", "status"))
  )
}

start_action <- list(event = list(
  name    = "analysis:start",
  context = list(
    region = list(path = "region"),
    period = list(path = "period")
  )
))

# ── Server ─────────────────────────────────────────────────────────────────────
server <- function(input, output, session) {

  analysis_data  <- reactiveVal(NULL)
  action_log_val <- reactiveVal(character(0))

  ctrl <- antDesignXServer(
    "chat",
    xcard_mode       = "inline",
    assistant_avatar = list(fallback = "AI"),
    suggestions = list(
      list(prompt = "帮我分析销售数据", text = "分析销售数据"),
      list(prompt = "展示产品对比",     text = "产品对比")
    ),

    handler = function(message, thread_id, on_chunk, on_done, on_error, ...) {

      ctrl$send_card_command(xcard_create_surface("analysis-card"), thread_id = thread_id)

      for (ch in strsplit(paste0("正在分析「", message, "」...\n\n"), "")[[1]]) {
        on_chunk(ch); Sys.sleep(0.008)
      }

      ctrl$send_card_command(
        xcard_update_components("analysis-card",
          make_param_components(
            current_step     = 0L,
            submit_label     = "开始分析",
            submit_disabled  = FALSE,
            status_msg       = "请选择分析维度后点击「开始分析」",
            status_type      = "info",
            submit_action    = start_action
          )),
        thread_id = thread_id
      )

      # flat keys — no leading slash so resolveValueV09 treats as literal
      ctrl$send_card_command(xcard_update_data("analysis-card", "region", "全国"), thread_id = thread_id)
      ctrl$send_card_command(xcard_update_data("analysis-card", "period", "本月"), thread_id = thread_id)

      on_chunk('参数卡片已生成，请选择分析维度后点击"开始分析"。')
      on_done()
    }
  )

  # ── 监听卡片 action ────────────────────────────────────────────────────────
  observeEvent(input$chat_card_action, {
    act <- input$chat_card_action
    if (is.null(act) || act$name != "analysis:start") return()

    region <- act$context$region$value %||% "全国"
    period <- act$context$period$value %||% "本月"
    ts     <- format(Sys.time(), "%H:%M:%S")

    action_log_val(c(action_log_val(),
      sprintf("[%s] %s | 地区:%s | 时段:%s", ts, act$name, region, period)))

    # 方向3：Steps → 分析中
    ctrl$send_card_command(
      xcard_update_components("analysis-card",
        make_param_components(
          current_step    = 1L,
          submit_label    = "分析中...",
          submit_disabled = TRUE,
          status_msg      = paste0("正在分析", region, "地区", period, "数据..."),
          status_type     = "info",
          submit_action   = list(event = list(name = "noop", context = list()))
        )),
      thread_id = "default"
    )

    # 方向1：更新主面板
    data <- make_sales_data(region, period)
    analysis_data(list(data = data, region = region, period = period))

    Sys.sleep(0.5)

    # 方向3：Steps → 完成
    ctrl$send_card_command(
      xcard_update_components("analysis-card",
        make_param_components(
          current_step    = 2L,
          submit_label    = "重新分析",
          submit_disabled = FALSE,
          status_msg      = paste0("✅ 分析完成：", region, " · ", period),
          status_type     = "success",
          submit_action   = start_action
        )),
      thread_id = "default"
    )

    # 方向2：触发 AI 二轮分析
    ctrl$trigger_message(
      paste0("请用3个要点分析", region, "地区", period,
             "的销售数据，每个要点一句话，用•列出。"),
      thread_id = "default"
    )
  })

  # ── 主面板渲染 ─────────────────────────────────────────────────────────────
  output$has_data <- reactive({ !is.null(analysis_data()) })
  outputOptions(output, "has_data", suspendWhenHidden = FALSE)

  output$kpi_cards <- renderUI({
    d <- analysis_data()
    if (is.null(d)) {
      return(p("暂无数据，请在左侧 AI 对话中发起分析。",
               style = "color:#9ca3af;font-style:italic;"))
    }
    total_sales   <- sum(d$data$销量)
    total_revenue <- sum(d$data$收入)
    div(
      h3(paste0("📍 ", d$region, " · ", d$period)),
      div(style = "display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;",
          div(style = "background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;flex:1;min-width:140px;",
              tags$p("总销量", style = "color:#6b7280;font-size:13px;margin:0 0 4px;"),
              tags$p(format(total_sales, big.mark = ","),
                     style = "font-size:24px;font-weight:700;color:#1677ff;margin:0;")),
          div(style = "background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;flex:1;min-width:140px;",
              tags$p("总收入", style = "color:#6b7280;font-size:13px;margin:0 0 4px;"),
              tags$p(paste0("¥", format(total_revenue, big.mark = ",")),
                     style = "font-size:24px;font-weight:700;color:#52c41a;margin:0;")),
          div(style = "background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;flex:1;min-width:140px;",
              tags$p("产品数", style = "color:#6b7280;font-size:13px;margin:0 0 4px;"),
              tags$p(nrow(d$data),
                     style = "font-size:24px;font-weight:700;color:#fa8c16;margin:0;"))
      )
    )
  })

  output$sales_table <- renderDT({
    d <- analysis_data()
    req(!is.null(d))
    datatable(d$data,
      options  = list(dom = "t", pageLength = 10),
      rownames = FALSE,
      class    = "compact stripe")
  })

  output$action_log <- renderText({
    log <- action_log_val()
    if (length(log) == 0) "暂无 action 记录"
    else paste(rev(log), collapse = "\n")
  })
}

`%||%` <- function(x, y) if (is.null(x)) y else x

shinyApp(ui, server)
