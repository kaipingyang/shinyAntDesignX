library(shiny)
library(bslib)
devtools::load_all(here::here())

# antd 页内通知演示：message（顶部单行）+ notify（角落卡片）
# 对比：现有 notification widget 是 OS 系统级（需权限），这两个是页内浮层（无需权限）

ui <- page_fillable(
  padding = 16,
  h2("antd 页内通知 — message + notify"),
  p("message：顶部居中单行提示。notify：角落卡片，带标题+描述。均无需浏览器权限。",
    style = "color:#6b7280;"),

  layout_columns(
    col_widths = c(6, 6),

    card(
      card_header("Message — 顶部单行"),
      div(style = "display:flex;flex-wrap:wrap;gap:8px;",
        actionButton("m_success", "success", class = "btn-success"),
        actionButton("m_error",   "error",   class = "btn-danger"),
        actionButton("m_info",    "info",    class = "btn-info"),
        actionButton("m_warning", "warning", class = "btn-warning"),
        actionButton("m_loading", "loading", class = "btn-secondary"),
        actionButton("m_update",  "key 更新（loading→success）", class = "btn-primary")
      ),
      antDesignMessageOutput("msg")
    ),

    card(
      card_header("Notify — 角落卡片"),
      div(style = "display:flex;flex-wrap:wrap;gap:8px;",
        actionButton("n_tr", "topRight",    class = "btn-primary"),
        actionButton("n_bl", "bottomLeft",  class = "btn-primary"),
        actionButton("n_err", "error 卡片", class = "btn-danger"),
        actionButton("n_persist", "持久(duration=0)", class = "btn-warning")
      ),
      antDesignNotifyOutput("ntf"),
      hr(),
      h6("notify 点击/关闭事件："),
      verbatimTextOutput("ntf_evt")
    )
  )
)

server <- function(input, output, session) {

  msg <- reactiveVal(NULL)
  ntf <- reactiveVal(NULL)

  # ── message 触发 ──
  observeEvent(input$m_success, msg(list(type = "success", content = "操作成功！", ts = Sys.time())))
  observeEvent(input$m_error,   msg(list(type = "error",   content = "出错了", ts = Sys.time())))
  observeEvent(input$m_info,    msg(list(type = "info",    content = "一条提示信息", ts = Sys.time())))
  observeEvent(input$m_warning, msg(list(type = "warning", content = "注意警告", ts = Sys.time())))
  observeEvent(input$m_loading, msg(list(type = "loading", content = "加载中...", duration = 0, ts = Sys.time())))

  # key 更新：先 loading，2 秒后同 key 变 success（原地替换，不堆叠）
  observeEvent(input$m_update, {
    msg(list(type = "loading", content = "处理中...", duration = 0, key = "task1", ts = Sys.time()))
    later::later(function() {
      msg(list(type = "success", content = "处理完成！", duration = 2, key = "task1", ts = Sys.time()))
    }, delay = 2)
  })

  output$msg <- renderAntDesignMessage({ req(msg()); msg() })
  outputOptions(output, "msg", suspendWhenHidden = FALSE)

  # ── notify 触发 ──
  observeEvent(input$n_tr, ntf(list(
    type = "info", message = "右上角通知", description = "placement = topRight，4.5 秒后自动关闭。",
    placement = "topRight", inputId = "ntf", ts = Sys.time())))
  observeEvent(input$n_bl, ntf(list(
    type = "success", message = "左下角通知", description = "placement = bottomLeft。",
    placement = "bottomLeft", inputId = "ntf", ts = Sys.time())))
  observeEvent(input$n_err, ntf(list(
    type = "error", message = "错误卡片", description = "type = error，红色图标。",
    placement = "topRight", inputId = "ntf", ts = Sys.time())))
  observeEvent(input$n_persist, ntf(list(
    type = "warning", message = "持久通知", description = "duration = 0，不自动关闭，需手动 X。",
    placement = "topRight", duration = 0, inputId = "ntf", ts = Sys.time())))

  output$ntf <- renderAntDesignNotify({ req(ntf()); ntf() })
  outputOptions(output, "ntf", suspendWhenHidden = FALSE)

  output$ntf_evt <- renderPrint({ req(input$ntf); input$ntf })
}

shinyApp(ui, server)
