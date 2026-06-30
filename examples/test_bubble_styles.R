library(shiny)
library(bslib)
devtools::load_all(here::here())

STYLES <- list(
  "现代（Claude.ai 同款）" = list(
    assistant = list(variant = "borderless"),
    user      = list(variant = "filled", shape = "round")
  ),
  "传统 IM" = list(
    assistant = list(variant = "filled", shape = "corner"),
    user      = list(variant = "filled", shape = "corner")
  ),
  "轻盈边框" = list(
    assistant = list(variant = "outlined"),
    user      = list(variant = "outlined", shape = "round")
  ),
  "卡片阴影" = list(
    assistant = list(variant = "shadow"),
    user      = list(variant = "shadow")
  ),
  "圆润 filled" = list(
    assistant = list(variant = "filled", shape = "round"),
    user      = list(variant = "filled", shape = "round")
  ),
  "完全透明" = list(
    assistant = list(variant = "borderless"),
    user      = list(variant = "borderless")
  )
)

make_mock_handler <- function() {
  replies <- c(
    "这是一条 **助手回复**，用于预览气泡风格。",
    "支持 `代码` 和列表：\n\n- 项目一\n- 项目二\n- 项目三",
    "也支持多段落。\n\n第二段文字在这里，看看间距和排版效果。",
    "短回复。"
  )
  function(message, thread_id, on_chunk, on_done, on_error, ...) {
    reply <- replies[[sample(length(replies), 1)]]
    for (ch in strsplit(reply, "")[[1]]) { on_chunk(ch); Sys.sleep(0.005) }
    on_done()
  }
}

ui <- page_fillable(
  padding = 0,
  tags$head(tags$style(HTML("html, body { height:100%; margin:0; overflow:hidden; }"))),
  layout_columns(
    col_widths = c(3, 9),
    card(
      height = "100vh",
      card_header("气泡风格预览"),
      card_body(
        gap = 12,
        selectInput("style_preset", "预设风格", choices = names(STYLES), width = "100%"),
        hr(),
        h6("assistant variant"),
        radioButtons("ass_variant", NULL,
                     choices = c("borderless","filled","outlined","shadow"),
                     selected = "borderless"),
        h6("assistant shape"),
        radioButtons("ass_shape", NULL,
                     choices = c("default","round","corner"),
                     selected = "default", inline = TRUE),
        hr(),
        h6("user variant"),
        radioButtons("usr_variant", NULL,
                     choices = c("filled","borderless","outlined","shadow"),
                     selected = "filled"),
        h6("user shape"),
        radioButtons("usr_shape", NULL,
                     choices = c("default","round","corner"),
                     selected = "round", inline = TRUE),
        hr(),
        actionButton("apply", "应用风格", class = "btn-primary w-100"),
        hr(),
        p("复制到你的 app：", style = "font-size:12px;color:#6b7280;"),
        verbatimTextOutput("current_config")
      )
    ),
    card(
      height = "100vh",
      card_body(padding = 0, uiOutput("chat_container"))
    )
  )
)

server <- function(input, output, session) {

  style_rv  <- reactiveVal(STYLES[[1]])
  widget_id <- reactiveVal("chat_v1")

  observeEvent(input$style_preset, {
    s <- STYLES[[input$style_preset]]
    updateRadioButtons(session, "ass_variant", selected = s$assistant$variant %||% "borderless")
    updateRadioButtons(session, "ass_shape",   selected = s$assistant$shape   %||% "default")
    updateRadioButtons(session, "usr_variant", selected = s$user$variant      %||% "filled")
    updateRadioButtons(session, "usr_shape",   selected = s$user$shape        %||% "default")
  })

  observeEvent(input$apply, {
    s <- list(
      assistant = list(variant = input$ass_variant, shape = input$ass_shape),
      user      = list(variant = input$usr_variant, shape = input$usr_shape)
    )
    style_rv(s)
    widget_id(paste0("chat_v", as.integer(Sys.time())))
  })

  output$current_config <- renderText({
    s <- style_rv()
    paste0(
      "bubble_style = list(\n",
      "  assistant = list(variant=\"", s$assistant$variant %||% "filled", "\",\n",
      "                   shape  =\"", s$assistant$shape   %||% "default", "\"),\n",
      "  user      = list(variant=\"", s$user$variant      %||% "filled", "\",\n",
      "                   shape  =\"", s$user$shape         %||% "default", "\")\n",
      ")"
    )
  })

  output$chat_container <- renderUI({
    antDesignXOutput(widget_id(), height = "100%")
  })

  observe({
    id <- widget_id()
    s  <- style_rv()
    antDesignXServer(
      id,
      handler      = make_mock_handler(),
      bubble_style = s,
      suggestions  = list(
        list(prompt = "你好，给我一段测试回复", text = "测试回复"),
        list(prompt = "给我一段带代码的回复",   text = "代码回复"),
        list(prompt = "给我一个列表",          text = "列表回复")
      )
    )
  })
}

`%||%` <- function(a, b) if (!is.null(a)) a else b

shinyApp(ui, server)
