library(shiny)
library(bslib)
devtools::load_all(here::here())

# xCard AI 集成演示
# 展示两种模式：
#   xcard_mode = "inline"  — xCard 嵌在助手气泡里（默认）
#   xcard_mode = "panel"   — xCard 在对话框右侧独立面板

ui <- tagList(
  tags$head(tags$style(HTML("html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }"))),
  antDesignXOutput("chat", height = "100vh")
)

server <- function(input, output, session) {

  ctrl <- antDesignXServer(
    "chat",
    xcard_mode        = "inline",   # 改为 "panel" 可切换到右侧面板模式
    xcard_panel_width = 380L,
    assistant_avatar  = list(fallback = "AI"),
    suggestions = list(
      list(prompt = "帮我创建一个预约表单", text = "创建预约表单"),
      list(prompt = "生成一个产品信息卡片",  text = "产品信息卡片")
    ),

    handler = function(message, thread_id, on_chunk, on_done, on_error, ...) {

      # ── 1. 创建 surface ──────────────────────────────────────────────────
      ctrl$send_card_command(
        xcard_create_surface("demo-card"),
        thread_id = thread_id
      )

      # ── 2. 先流式输出文字 ────────────────────────────────────────────────
      for (ch in strsplit(paste0("正在根据您的请求「", message, "」生成结构化卡片...\n\n"), "")[[1]]) {
        on_chunk(ch)
        Sys.sleep(0.01)
      }

      # ── 3. 推送组件定义 ──────────────────────────────────────────────────
      ctrl$send_card_command(
        xcard_update_components("demo-card", list(
          list(id = "title",
               component = "Text",
               text      = paste0("📋 ", message),
               variant   = "h2"),
          list(id = "desc",
               component = "Text",
               text      = "请填写以下信息，点击确认按钮提交。",
               variant   = "body"),
          list(id = "name",
               component = "Input",
               label     = "姓名",
               placeholder = "请输入姓名"),
          list(id = "type",
               component    = "Select",
               label        = "类型",
               options      = list("选项A", "选项B", "选项C"),
               defaultValue = "选项A",
               action       = list(event = list(
                 name    = "type:change",
                 context = list(value = list(path = "/form/type"))
               ))),
          list(id = "submit",
               component = "Button",
               label     = "确认提交",
               variant   = "primary",
               action    = list(event = list(
                 name    = "form:submit",
                 context = list(type = list(path = "/form/type"))
               ))),
          # root node required — transform() returns null without it
          # Container renders children in a flex column
          list(id = "root",
               component = "Container",
               gap       = 8L,
               children  = list("title", "desc", "name", "type", "submit"))
        )),
        thread_id = thread_id
      )

      # ── 4. 初始化数据模型 ─────────────────────────────────────────────────
      ctrl$send_card_command(
        xcard_update_data("demo-card", "/form/type", "选项A"),
        thread_id = thread_id
      )

      on_chunk('卡片已生成，请填写并点击"确认提交"。')
      on_done()
    }
  )

  # ── 监听卡片 action 事件 ────────────────────────────────────────────────────
  observeEvent(input$chat_card_action, {
    act <- input$chat_card_action
    if (is.null(act)) return()

    if (act$name == "form:submit") {
      showNotification(
        paste0("提交成功！类型：", act$context$type$value %||% act$context$type),
        type = "message", duration = 3
      )
    } else {
      message("[CARD ACTION] name=", act$name, " surfaceId=", act$surfaceId)
    }
  })
}

`%||%` <- function(x, y) if (is.null(x)) y else x

shinyApp(ui, server)
