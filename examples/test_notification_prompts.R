library(shiny)
library(bslib)
devtools::load_all(here::here())

ui <- page_fillable(
  padding = 16,
  h2("Notification + Prompts (icon/disabled) 测试"),

  card(
    card_header("Prompts — 带 icon 和 disabled"),
    antDesignXPromptsOutput("prompts1", height = "auto"),
    hr(),
    h5("点击结果："),
    verbatimTextOutput("prompts_val")
  ),

  card(
    card_header("Notification — XNotification (tag 去重 + 秒单位)"),
    p("duration=3 表示 3 秒（不是 3 毫秒）。同 tag 重复点击会被去重。"),
    div(
      actionButton("fire_a", "通知 A (tag=alpha, 3s)", class = "btn-primary"),
      actionButton("fire_a2", "再次通知 A (同 tag，应被去重)", class = "btn-warning"),
      actionButton("fire_b", "通知 B (tag=beta, 持久)", class = "btn-success")
    ),
    antDesignXNotificationOutput("notif1"),
    hr(),
    h5("通知点击结果："),
    verbatimTextOutput("notif_val")
  )
)

server <- function(input, output, session) {

  output$prompts1 <- renderAntDesignXPrompts({
    list(
      inputId = "prompts1",
      title   = "试试这些图标",
      items = list(
        list(key = "idea",   label = "灵感",   description = "bulb 图标",    icon = "bulb"),
        list(key = "hot",    label = "热门",   description = "fire 图标",    icon = "fire"),
        list(key = "launch", label = "发射",   description = "rocket 图标",  icon = "rocket"),
        list(key = "fav",    label = "收藏",   description = "star 图标",    icon = "star"),
        list(key = "off",    label = "禁用项", description = "disabled=TRUE", icon = "heart", disabled = TRUE)
      )
    )
  })

  output$prompts_val <- renderPrint({
    req(input$prompts1)
    input$prompts1
  })

  notif <- reactiveVal(NULL)

  observeEvent(input$fire_a, {
    notif(list(title = "通知 A", body = "tag=alpha, 3 秒后关闭", tag = "alpha",
               duration = 3, requestPermission = TRUE, inputId = "notif1"))
  })
  observeEvent(input$fire_a2, {
    notif(list(title = "通知 A 重复", body = "同 tag=alpha，应被去重不显示", tag = "alpha",
               duration = 3, requestPermission = TRUE, inputId = "notif1"))
  })
  observeEvent(input$fire_b, {
    notif(list(title = "通知 B", body = "tag=beta, requireInteraction 持久", tag = "beta",
               requireInteraction = TRUE, requestPermission = TRUE, inputId = "notif1"))
  })

  output$notif1 <- renderAntDesignXNotification({
    req(notif())
    notif()
  })
  # Hidden output (height=0) is suspended by default — must disable so repeat fires work
  outputOptions(output, "notif1", suspendWhenHidden = FALSE)

  output$notif_val <- renderPrint({
    req(input$notif1)
    input$notif1
  })
}

shinyApp(ui, server)
