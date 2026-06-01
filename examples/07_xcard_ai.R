library(shiny)
library(bslib)
devtools::load_all(here::here())

# ── UI ────────────────────────────────────────────────────────────────────────
# 左侧：Chat 侧边栏（固定 420px）
# 右侧：主面板（flex-fill，响应 card action）
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

    # 左侧：chat 侧边栏
    div(class = "chat-sidebar",
        antDesignXOutput("chat", height = "100vh")
    ),

    # 右侧：主面板
    div(class = "main-panel",
        h2("主面板", style = "margin-top: 0; color: #1f2937;"),
        p("通过左侧 AI 聊天交互，主面板将自动更新。", style = "color: #6b7280;"),
        hr(),

        # 方向 1：卡片提交 → 更新主面板
        h3("📊 表单数据"),
        uiOutput("form_result"),

        hr(),

        # 方向 2：触发新 AI 轮次（结果显示在左侧 chat）
        h3("🤖 AI 后续分析"),
        p("提交表单后，AI 将在左侧继续分析服务类型。", style = "color: #6b7280; font-size: 13px;"),

        hr(),

        # 方向 3：卡片 action 日志
        h3("🃏 Action 日志"),
        verbatimTextOutput("card_action_log")
    )
  )
)

# ── Server ─────────────────────────────────────────────────────────────────────
server <- function(input, output, session) {

  form_data  <- reactiveVal(NULL)
  action_log <- reactiveVal(character(0))

  ctrl <- antDesignXServer(
    "chat",
    xcard_mode       = "inline",
    assistant_avatar = list(fallback = "AI"),
    suggestions = list(
      list(prompt = "帮我创建一个预约表单", text = "创建预约表单"),
      list(prompt = "生成一个产品信息卡片",  text = "产品信息卡片")
    ),

    handler = function(message, thread_id, on_chunk, on_done, on_error, ...) {

      ctrl$send_card_command(
        xcard_create_surface("demo-card"),
        thread_id = thread_id
      )

      for (ch in strsplit(paste0("正在根据「", message, "」生成卡片...\n\n"), "")[[1]]) {
        on_chunk(ch)
        Sys.sleep(0.008)
      }

      ctrl$send_card_command(
        xcard_update_components("demo-card", list(
          list(id = "title",  component = "Text",
               text = paste0("📋 ", message), variant = "h2"),
          list(id = "desc",   component = "Text",
               text = "请填写信息后提交。", variant = "body"),
          list(id = "name",   component = "Input",
               label = "姓名", placeholder = "请输入姓名"),
          list(id = "type",   component = "Select",
               label = "服务类型",
               options = list("基础咨询", "深度分析", "定制开发"),
               defaultValue = "基础咨询",
               action = list(event = list(
                 name    = "type:change",
                 context = list(value = list(path = "/form/type"))
               ))),
          list(id = "submit", component = "Button",
               label = "确认提交", variant = "primary",
               action = list(event = list(
                 name    = "form:submit",
                 context = list(type = list(path = "/form/type"))
               ))),
          list(id = "status", component = "Text", text = "", variant = "body"),
          list(id = "root",   component = "Container", gap = 10L,
               children = list("title", "desc", "name", "type", "submit", "status"))
        )),
        thread_id = thread_id
      )

      ctrl$send_card_command(
        xcard_update_data("demo-card", "/form/type", "基础咨询"),
        thread_id = thread_id
      )

      on_chunk('卡片已生成，请填写并点击"确认提交"。')
      on_done()
    }
  )

  # ── 监听卡片 action ────────────────────────────────────────────────────────
  observeEvent(input$chat_card_action, {
    act <- input$chat_card_action
    if (is.null(act)) return()

    # 方向 3：记录 action 日志
    ts  <- format(Sys.time(), "%H:%M:%S")
    log <- action_log()
    action_log(c(log, sprintf("[%s] %s @ %s: %s",
                               ts, act$name, act$surfaceId,
                               jsonlite::toJSON(act$context, auto_unbox = TRUE))))

    if (act$name == "form:submit") {
      type_val <- act$context$type$value %||% act$context$type %||% "未知"

      # 方向 1：更新主面板
      form_data(list(
        type      = type_val,
        submitted = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
      ))

      # 方向 3：更新 xCard 为已提交状态（禁用按钮 + 显示确认文字）
      ctrl$send_card_command(
        xcard_update_components("demo-card", list(
          list(id = "title",  component = "Text",
               text = paste0("📋 ", act$surfaceId), variant = "h2"),
          list(id = "desc",   component = "Text",
               text = "请填写信息后提交。", variant = "body"),
          list(id = "name",   component = "Input",
               label = "姓名", placeholder = "请输入姓名"),
          list(id = "type",   component = "Select",
               label = "服务类型",
               options = list("基础咨询", "深度分析", "定制开发"),
               defaultValue = type_val,
               action = list(event = list(
                 name    = "type:change",
                 context = list(value = list(path = "/form/type"))
               ))),
          list(id = "submit", component = "Button",
               label = "已提交", variant = "default",
               disabled = TRUE,
               action = list(event = list(name = "noop", context = list()))),
          list(id = "status", component = "Text",
               text    = paste0("✅ 已提交：", type_val),
               variant = "body"),
          list(id = "root",   component = "Container", gap = 10L,
               children = list("title", "desc", "name", "type", "submit", "status"))
        )),
        thread_id = "default"
      )

      # 方向 2：触发新 AI 轮次分析
      Sys.sleep(0.3)
      ctrl$trigger_message(
        paste0("用户已提交表单，服务类型为「", type_val,
               "」。请简要介绍这个服务类型的特点和适用场景（2-3句）。"),
        thread_id = "default"
      )
    }
  })

  # ── 主面板渲染 ─────────────────────────────────────────────────────────────
  output$form_result <- renderUI({
    d <- form_data()
    if (is.null(d)) {
      return(p("暂无数据，请在左侧聊天中创建并提交表单。",
               style = "color: #9ca3af; font-style: italic;"))
    }
    div(
      style = paste0(
        "background: white; border: 1px solid #e5e7eb;",
        "border-radius: 8px; padding: 16px;"
      ),
      tags$table(
        style = "width: 100%; border-collapse: collapse;",
        tags$tr(
          tags$th(style = "text-align:left;padding:6px 12px;background:#f9fafb;width:120px;", "字段"),
          tags$th(style = "text-align:left;padding:6px 12px;background:#f9fafb;", "值")
        ),
        tags$tr(
          tags$td(style = "padding:6px 12px;border-top:1px solid #f0f0f0;", "服务类型"),
          tags$td(style = "padding:6px 12px;border-top:1px solid #f0f0f0;font-weight:600;", d$type)
        ),
        tags$tr(
          tags$td(style = "padding:6px 12px;border-top:1px solid #f0f0f0;", "提交时间"),
          tags$td(style = "padding:6px 12px;border-top:1px solid #f0f0f0;", d$submitted)
        )
      )
    )
  })

  output$card_action_log <- renderText({
    log <- action_log()
    if (length(log) == 0) "暂无 action 记录"
    else paste(rev(log), collapse = "\n")
  })
}

`%||%` <- function(x, y) if (is.null(x)) y else x

shinyApp(ui, server)
