library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── Demo：多 Surface + deleteSurface + validateComponent + clearCatalogCache ──
#
# 流程：
#   1. 用户发送"开始分析" → AI 同时创建两个 surface：
#      - "param-card"  ：参数选择（地区 + 时间段 + 提交按钮）
#      - "result-card" ：占位（等待参数提交）
#   2. 用户在 param-card 选参数后点提交 → AI 更新 result-card（Statistic + Progress + Timeline）
#   3. 用户发送"清除结果" → AI 删除 result-card（deleteSurface）
#   4. 每次发送命令前用 validateComponent 验证一个组件，结果显示在日志
#   5. 侧边"重置目录"按钮触发 clearCatalogCache，再重新注册默认目录

# ── 组件构建辅助 ──────────────────────────────────────────────────────────────

make_param_card <- function() {
  list(
    list(id = "region", component = "RadioGroup",
         label   = "分析地区",
         options = list("华东", "华南", "华北", "全国"),
         value   = list(path = "/region"),
         dataPath = "region"),
    list(id = "period", component = "Segmented",
         options  = list("本周", "本月", "本季度"),
         value    = list(path = "/period"),
         dataPath = "period"),
    list(id = "submit", component = "Button",
         label   = "提交分析",
         variant = "primary",
         action  = list(event = list(
           name    = "param:submit",
           context = list(
             region = list(path = "/region"),
             period = list(path = "/period")
           )
         ))),
    list(id = "root", component = "Container", gap = 12L,
         children = list("region", "period", "submit"))
  )
}

make_result_card_placeholder <- function() {
  list(
    list(id = "msg", component = "Alert",
         message = "请在左侧参数卡选择维度后提交",
         type    = "info", showIcon = TRUE),
    list(id = "root", component = "Container", gap = 8L,
         children = list("msg"))
  )
}

make_result_card_data <- function(region, period) {
  set.seed(nchar(region) + nchar(period))
  revenue   <- sample(100000:500000, 1)
  growth    <- round(runif(1, -5, 30), 1)
  list(
    list(id = "stat1", component = "Statistic",
         title = "总收入", value = revenue,
         prefix = "¥", precision = 0L),
    list(id = "stat2", component = "Statistic",
         title = "环比增长", value = growth,
         suffix = "%", precision = 1L),
    list(id = "progress", component = "Progress",
         percent = min(100L, as.integer(abs(growth) * 3)),
         status  = if (growth >= 0) "success" else "exception"),
    list(id = "timeline", component = "Timeline",
         items = list(
           list(content = paste0(region, " · ", period, " 分析完成"),
                color = "green"),
           list(content = paste0("收入 ¥", format(revenue, big.mark = ",")),
                color = "blue"),
           list(content = paste0("增长率 ", growth, "%"),
                color = if (growth >= 0) "green" else "red")
         )),
    list(id = "clear_btn", component = "Button",
         label  = "清除结果",
         variant = "default",
         action = list(event = list(name = "result:clear", context = list()))),
    list(id = "root", component = "Container", gap = 12L,
         children = list("stat1", "stat2", "progress", "timeline", "clear_btn"))
  )
}

# ── UI ────────────────────────────────────────────────────────────────────────
ui <- page_fillable(
  padding = 0,
  tags$head(tags$style(HTML("
    html, body { height: 100%; margin: 0; overflow: hidden; }
    .chat-col {
      width: 560px; min-width: 560px; max-width: 560px;
      height: 100vh; border-right: 1px solid #e5e7eb; flex-shrink: 0;
    }
    .log-col {
      width: 280px; min-width: 280px; max-width: 280px;
      height: 100vh; border-left: 1px solid #e5e7eb; flex-shrink: 0;
      overflow-y: auto; padding: 16px; background: #f9fafb;
    }
    .log-entry { font-size: 12px; font-family: monospace; margin-bottom: 6px;
                 padding: 4px 8px; background: white; border-radius: 4px;
                 border-left: 3px solid #d1d5db; }
    .log-ok  { border-left-color: #52c41a; }
    .log-err { border-left-color: #ff4d4f; }
  "))),
  div(
    style = "display: flex; height: 100vh; overflow: hidden;",
    # 左：AI chat（内嵌双卡片）
    div(class = "chat-col",
        antDesignXOutput("chat", height = "100vh")),
    # 右：验证日志 + 工具按钮
    div(class = "log-col",
        h3("工具日志", style = "margin-top:0;font-size:14px;color:#374151;"),
        actionButton("btn_validate", "验证 Button 组件",
                     style = "width:100%;margin-bottom:8px;"),
        actionButton("btn_reset_catalog", "重置 Catalog 缓存",
                     style = "width:100%;margin-bottom:16px;"),
        uiOutput("log_entries")
    )
  )
)

# ── Server ────────────────────────────────────────────────────────────────────
server <- function(input, output, session) {

  log_entries <- reactiveVal(list())

  add_log <- function(msg, type = "ok") {
    entry <- list(msg = msg, type = type, ts = format(Sys.time(), "%H:%M:%S"))
    log_entries(c(list(entry), log_entries()))
  }

  ctrl <- antDesignXServer(
    "chat",
    xcard_mode       = "inline",
    assistant_avatar = list(fallback = "AI"),
    suggestions = list(
      list(prompt = "开始分析", text = "开始分析"),
      list(prompt = "清除结果", text = "清除结果")
    ),

    handler = function(message, thread_id, on_chunk, on_done, on_error, ...) {

      if (grepl("清除|删除|reset|clear", message, ignore.case = TRUE)) {
        # 删除结果 surface
        ctrl$send_card_command(xcard_delete_surface("result-card"),
                               thread_id = thread_id)
        for (ch in strsplit("结果卡片已清除。", "")[[1]]) {
          on_chunk(ch); Sys.sleep(0.01)
        }
        on_done()
        return()
      }

      # 其他消息：创建双 surface
      ctrl$send_card_command(xcard_create_surface("param-card"),  thread_id = thread_id)
      ctrl$send_card_command(xcard_create_surface("result-card"), thread_id = thread_id)

      for (ch in strsplit("已为您创建参数卡和结果卡，请在参数卡选择维度后点击「提交分析」。\n\n", "")[[1]]) {
        on_chunk(ch); Sys.sleep(0.008)
      }

      ctrl$send_card_command(
        xcard_update_components("param-card", make_param_card()),
        thread_id = thread_id
      )
      ctrl$send_card_command(
        xcard_update_components("result-card", make_result_card_placeholder()),
        thread_id = thread_id
      )

      on_done()
    }
  )

  # ── 监听卡片 action ────────────────────────────────────────────────────────
  observeEvent(input$chat_card_action, {
    act <- input$chat_card_action
    if (is.null(act)) return()

    if (act$name == "param:submit") {
      region <- act$context$region$value %||% "全国"
      period <- act$context$period$value %||% "本月"

      # Re-send createSurface in case result-card was previously deleted.
      # XCard.Card uses createSurface to reset its internal state before
      # processing updateComponents. Without this, a deleted surface stays
      # absent from the message DOM and receives no rendering.
      ctrl$send_card_command(xcard_create_surface("result-card"), thread_id = "default")
      ctrl$send_card_command(
        xcard_update_components("result-card",
          make_result_card_data(region, period)),
        thread_id = "default"
      )
      add_log(paste0("分析完成：", region, " · ", period))
    }

    if (act$name == "result:clear") {
      ctrl$send_card_command(xcard_delete_surface("result-card"),
                             thread_id = "default")
      add_log("result-card 已删除（deleteSurface）")
    }
  })

  # ── validateComponent 按钮 ─────────────────────────────────────────────────
  observeEvent(input$btn_validate, {
    xcard_validate_component(
      input_id  = "validate_result",
      component = "Button",
      props     = list(label = "测试", variant = "primary"),
      session   = session
    )
  })

  observeEvent(input$validate_result, {
    res <- input$validate_result
    if (isTRUE(res$valid)) {
      add_log("validateComponent(Button): valid = TRUE", "ok")
    } else {
      add_log(paste0("validateComponent(Button): INVALID — ",
                     paste(res$errors, collapse = "; ")), "err")
    }
  })

  # ── clearCatalogCache 按钮 ─────────────────────────────────────────────────
  observeEvent(input$btn_reset_catalog, {
    xcard_clear_catalog_cache(session)
    add_log("clearCatalogCache() 已调用", "ok")
  })

  # ── 日志渲染 ──────────────────────────────────────────────────────────────
  output$log_entries <- renderUI({
    entries <- log_entries()
    if (length(entries) == 0) {
      return(p("暂无日志", style = "color:#9ca3af;font-size:12px;"))
    }
    lapply(entries, function(e) {
      cls <- paste("log-entry", if (e$type == "err") "log-err" else "log-ok")
      div(class = cls, paste0("[", e$ts, "] ", e$msg))
    })
  })
}

`%||%` <- function(x, y) if (is.null(x)) y else x

shinyApp(ui, server)
